
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

import {
  syncBookingFromPandascrow,
  type PandascrowWebhookPayload,
} from "@/lib/pandascrow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TIMESTAMP_AGE_SECONDS = 300;

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      status: false,
      error: message,
    },
    { status }
  );
}

/**
 * Verify Pandascrow's HMAC-SHA256 signature against
 * the exact raw request body.
 */
function verifySignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(rawBody)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(expected, received)
  );
}

/**
 * Reject webhook deliveries outside the accepted
 * timestamp window.
 */
function verifyTimestamp(timestamp: string): boolean {
  if (!/^\d+$/.test(timestamp)) {
    return false;
  }

  const timestampSeconds = Number(timestamp);

  if (!Number.isSafeInteger(timestampSeconds)) {
    return false;
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  return (
    Math.abs(currentTimestamp - timestampSeconds) <=
    MAX_TIMESTAMP_AGE_SECONDS
  );
}

function getEscrowId(
  payload: PandascrowWebhookPayload
): string | null {
  const data = payload.data;

  const value =
    data?.escrow_id ??
    data?.escrow_data?.escrow_id ??
    data?.escrow_data?._id ??
    data?.escrow_data?.id;

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  return String(value).trim();
}

function getTransactionReference(
  payload: PandascrowWebhookPayload
): string | null {
  const value =
    payload.data?.transaction?.transaction_ref ??
    payload.data?.payment?.reference;

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  return value.trim();
}

export async function POST(request: Request) {
  try {
    const secret =
      process.env.PANDASCROW_SECRET_KEY?.trim();

    if (!secret) {
      console.error(
        "PANDASCROW_SECRET_KEY is not configured."
      );

      return errorResponse(
        "Webhook configuration error.",
        500
      );
    }

    /*
     * Read the body once, preserving its original bytes
     * for signature verification.
     */
    const rawBody = Buffer.from(
      await request.arrayBuffer()
    );

    const signature = request.headers.get(
      "x-pandascrow-signature"
    );

    const timestamp = request.headers.get(
      "x-pandascrow-timestamp"
    );

    const headerEvent = request.headers.get(
      "x-pandascrow-event"
    );

    if (!signature) {
      return errorResponse(
        "Missing Pandascrow webhook signature.",
        401
      );
    }

    if (!verifySignature(rawBody, signature, secret)) {
      return errorResponse(
        "Invalid Pandascrow webhook signature.",
        401
      );
    }

    if (
      !timestamp ||
      !verifyTimestamp(timestamp)
    ) {
      return errorResponse(
        "Invalid or expired Pandascrow webhook timestamp.",
        401
      );
    }

    let payload: PandascrowWebhookPayload;

    try {
      payload = JSON.parse(
        rawBody.toString("utf8")
      ) as PandascrowWebhookPayload;
    } catch {
      return errorResponse(
        "Invalid webhook JSON payload.",
        400
      );
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.event !== "string" ||
      payload.event.trim() === "" ||
      !payload.data ||
      typeof payload.data !== "object" ||
      Array.isArray(payload.data)
    ) {
      return errorResponse(
        "Missing or invalid webhook event data.",
        400
      );
    }

    /*
     * The authenticated event header must agree with
     * the event in the JSON body.
     */
    if (
      !headerEvent ||
      headerEvent !== payload.event
    ) {
      return errorResponse(
        "Pandascrow webhook event header mismatch.",
        400
      );
    }

    /*
     * Acknowledge authenticated non-escrow events
     * without modifying bookings.
     */
    if (!payload.event.startsWith("escrow.")) {
      return NextResponse.json({
        status: true,
        received: true,
        ignored: true,
      });
    }

    const escrowId = getEscrowId(payload);

    if (!escrowId) {
      return errorResponse(
        "Missing Pandascrow escrow identifier.",
        400
      );
    }

    const bookings = adminDb.collection("bookings");

    /*
     * First, find bookings using the stored escrow ID.
     */
    let bookingSnapshot = await bookings
      .where("pandascrowEscrowId", "==", escrowId)
      .limit(2)
      .get();

    /*
     * Support legacy records that stored numeric escrow IDs.
     */
    if (
      bookingSnapshot.empty &&
      /^\d+$/.test(escrowId)
    ) {
      const numericEscrowId = Number(escrowId);

      if (Number.isSafeInteger(numericEscrowId)) {
        bookingSnapshot = await bookings
          .where(
            "pandascrowEscrowId",
            "==",
            numericEscrowId
          )
          .limit(2)
          .get();
      }
    }

    /*
     * If necessary, try the transaction reference.
     */
    const transactionReference =
      getTransactionReference(payload);

    if (
      bookingSnapshot.empty &&
      transactionReference
    ) {
      bookingSnapshot = await bookings
        .where(
          "pandascrowTransactionReference",
          "==",
          transactionReference
        )
        .limit(2)
        .get();
    }

    if (bookingSnapshot.empty) {
      console.warn(
        "No booking matched the Pandascrow webhook.",
        {
          event: payload.event,
          escrowId,
        }
      );

      /*
       * Return a failure so the unmatched event can be
       * investigated and retried if appropriate.
       */
      return errorResponse(
        "No matching NSUK Nest booking was found.",
        500
      );
    }

    /*
     * Never update an arbitrary booking if the lookup
     * unexpectedly matches more than one document.
     */
    if (bookingSnapshot.size !== 1) {
      console.error(
        "Multiple bookings matched a Pandascrow webhook.",
        {
          event: payload.event,
          escrowId,
          matchCount: bookingSnapshot.size,
        }
      );

      return errorResponse(
        "Multiple bookings matched this escrow.",
        409
      );
    }

    const bookingDocument =
      bookingSnapshot.docs[0];

    const booking = bookingDocument.data();

    /*
     * If a transaction reference was used to locate the
     * booking, an existing escrow association must agree.
     *
     * If no escrow association exists, do not silently
     * attach an escrow through the webhook. Reconcile that
     * booking separately against the initialization result.
     */
    if (
      booking.pandascrowEscrowId === undefined ||
      booking.pandascrowEscrowId === null ||
      String(booking.pandascrowEscrowId) !== escrowId
    ) {
      console.error(
        "Pandascrow escrow association mismatch.",
        {
          event: payload.event,
          escrowId,
          bookingId: bookingDocument.id,
        }
      );

      return errorResponse(
        "Pandascrow escrow ID does not match the booking.",
        409
      );
    }

    /*
     * The synchronization helper performs atomic booking
     * updates and webhook-event deduplication.
     *
     * Contact access is governed by the verified funding
     * conditions implemented in lib/pandascrow.ts.
     */
    await syncBookingFromPandascrow(
      bookingDocument.ref,
      payload
    );

    return NextResponse.json({
      status: true,
      received: true,
      verified: true,
    });
  } catch (error: unknown) {
    console.error(
      "Pandascrow webhook processing failed:",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : "Unknown error"
    );

    return errorResponse(
      "Pandascrow webhook processing failed.",
      500
    );
  }
}


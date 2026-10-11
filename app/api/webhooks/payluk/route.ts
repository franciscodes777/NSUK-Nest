import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { paylukRequest, syncBookingFromEscrow } from "@/lib/payluk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaylukEscrow = {
  id?: string;
  amount?: number;
  paymentToken?: string;
  status?: string;
  state?: string;
  paidAt?: string | number | null;
  paymentDetails?: {
    status?: string;
    reference?: string;
  } | null;
};

type WebhookPayload = {
  event?: string;
  timestamp?: string;
  data?: PaylukEscrow;
};

function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha512", secret)
    .update(rawBody)
    .digest();

  if (!/^[a-f0-9]{128}$/i.test(signature)) {
    return false;
  }

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(expected, received)
  );
}

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYLUK_SECRET_KEY?.trim();

    if (!secret) {
      console.error("PAYLUK_SECRET_KEY is not configured.");

      return NextResponse.json(
        { error: "Webhook configuration error." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-payluk-signature");

    if (
      !signature ||
      !verifySignature(rawBody, signature, secret)
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    let payload: WebhookPayload;

    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    if (!payload.event || !payload.data) {
      return NextResponse.json(
        { error: "Missing webhook event data." },
        { status: 400 }
      );
    }

    // This endpoint handles escrow events only.
    // Other Payluk event types are acknowledged and ignored.
    if (!payload.event.startsWith("escrow.")) {
      return NextResponse.json({ received: true });
    }

    const escrowId = payload.data.id;
    const paymentToken = payload.data.paymentToken;

    if (!escrowId && !paymentToken) {
      return NextResponse.json(
        { error: "Missing escrow identifier." },
        { status: 400 }
      );
    }

    const bookings = adminDb.collection("bookings");
    let bookingSnapshot;

    if (paymentToken) {
      bookingSnapshot = await bookings
        .where("paylukPaymentToken", "==", paymentToken)
        .limit(1)
        .get();
    } else {
      bookingSnapshot = await bookings
        .where("paylukEscrowId", "==", escrowId)
        .limit(1)
        .get();
    }

    if (bookingSnapshot.empty) {
      console.warn(
        "No NSUK Nest booking matched the Payluk escrow webhook."
      );

      // The webhook may arrive before the booking has been linked.
      // Acknowledge it; the verification API can reconcile later.
      return NextResponse.json({ received: true });
    }

    const bookingDocument = bookingSnapshot.docs[0];
    const booking = bookingDocument.data();

    if (
      escrowId &&
      booking.paylukEscrowId &&
      booking.paylukEscrowId !== escrowId
    ) {
      return NextResponse.json(
        { error: "Escrow ID does not match the booking." },
        { status: 409 }
      );
    }

    const verificationToken =
      booking.paylukPaymentToken || paymentToken;

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Missing Payluk verification token." },
        { status: 409 }
      );
    }

    // Confirm the current escrow status directly with Payluk.
    const escrow = await paylukRequest<PaylukEscrow>(
      `/v1/escrow/verify/${encodeURIComponent(
        verificationToken
      )}`
    );

    // Update the booking only from Payluk's verified status.
    await syncBookingFromEscrow(
      bookingDocument.ref,
      escrow
    );

    return NextResponse.json({
      received: true,
      verified: true,
    });
  } catch (error: unknown) {
    console.error("Payluk webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
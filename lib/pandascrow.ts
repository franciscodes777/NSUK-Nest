import "server-only";

import { createHash } from "node:crypto";

import {
  FieldValue,
  type DocumentReference,
} from "firebase-admin/firestore";

export type PandascrowApiEnvelope<T> = {
  status?: boolean | number | string;
  success?: boolean;
  message?: string;
  data?: T;
  error?:
    | string
    | {
        message?: string;
        code?: string;
      };
  code?: string;
};

export type PandascrowEscrow = {
  _id?: string | number;
  id?: string | number;
  escrow_id?: string | number;
  escrow_type?: string;
  amount?: string | number;
  amount_pay?: string | number;
  amount_receive?: string | number;
  currency?: string;
  status?: string;
  initiator_role?: string;
  initiator_id?: string;
  receiver_id?: string | null;
  broker_id?: string | null;
  inspection_period?: string | number;
  created_at?: string;
  updated_at?: string;
  paid_at?: string | null;
  completed_at?: string | null;
};

export type PandascrowWebhookPayload = {
  event?: string;
  event_id?: string | number;
  timestamp?: number | string;

  data?: {
    event?: string;
    escrow_id?: string | number;
    escrow_type?: string;
    escrow_data?: PandascrowEscrow;

    transaction?: {
      _id?: string | number;
      escrow_id?: string | number;
      transaction_ref?: string;
      status?: string;
      type?: string;
      amount?: string | number;
      amount_pay?: string | number;
      currency?: string;
      provider?: string;
      updated_at?: string;
      completed_at?: string;
    };

    payment?: {
      method?: string;
      payment_url?: string;
      reference?: string;
      provider?: string;
      virtual_account?: unknown;
    };

    payout?: {
      reference?: string;
      amount?: string | number;
      currency?: string;
      payout_type?: string;
      status?: string;
      bank_attempted?: boolean;
      bank_succeeded?: boolean;
      wallet_used?: boolean;
      wallet_succeeded?: boolean;
      failure_reason?: string | null;
    };

    paid_at?: string;

    dispute?: {
      reason?: string;
      raised_at?: string;
    };

    timestamp?: string | number;

    [key: string]: unknown;
  };

  [key: string]: unknown;
};

export type PandascrowEnvironment = "test" | "live";

export class PandascrowApiError extends Error {
  statusCode: number;
  endpoint: string;
  method: string;
  apiStatus?: number;
  errorCode?: string;

  constructor(
    message: string,
    statusCode: number,
    endpoint = "",
    method = "GET",
    apiStatus?: number,
    errorCode?: string
  ) {
    super(message);

    this.name = "PandascrowApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;
    this.apiStatus = apiStatus;
    this.errorCode = errorCode;
  }
}

/**
 * Determine the Pandascrow environment from the server-side
 * secret key and prevent accidental test/live URL mismatches.
 */
export function getPandascrowConfig(): {
  secretKey: string;
  baseUrl: string;
  environment: PandascrowEnvironment;
} {
  const secretKey =
    process.env.PANDASCROW_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error(
      "PANDASCROW_SECRET_KEY is not configured on the server."
    );
  }

  const normalizedKey = secretKey.toLowerCase();

  const isTestKey =
    /^sk[-_]?test/.test(normalizedKey);

  const isLiveKey =
    /^sk[-_]?live/.test(normalizedKey);

  if (!isTestKey && !isLiveKey) {
    throw new Error(
      "Unable to determine the Pandascrow key environment. " +
        "Check the key prefix in the Pandascrow dashboard."
    );
  }

  const environment: PandascrowEnvironment =
    isTestKey ? "test" : "live";

  const defaultBaseUrl = isTestKey
    ? "https://sandbox.pandascrow.io"
    : "https://api.pandascrow.io";

  const baseUrl = (
    process.env.PANDASCROW_API_URL?.trim() ||
    defaultBaseUrl
  ).replace(/\/+$/, "");

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error(
      "PANDASCROW_API_URL must be a valid HTTPS URL."
    );
  }

  const expectedHost = isTestKey
    ? "sandbox.pandascrow.io"
    : "api.pandascrow.io";

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== expectedHost
  ) {
    throw new Error(
      `The Pandascrow ${environment} key must use ` +
        `https://${expectedHost}.`
    );
  }

  if (
    parsedUrl.port ||
    parsedUrl.username ||
    parsedUrl.password
  ) {
    throw new Error(
      "PANDASCROW_API_URL must not contain credentials or a custom port."
    );
  }

  if (
    parsedUrl.pathname !== "/" ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error(
      "PANDASCROW_API_URL must contain only the API base URL."
    );
  }

  return {
    secretKey,
    baseUrl,
    environment,
  };
}

/**
 * Extract safe diagnostic fields from an API response.
 *
 * Never log authentication headers, secret keys,
 * payment tokens, or complete payment responses.
 */
function getSafePandascrowErrorDetails(
  body: unknown
): {
  message?: string;
  code?: string;
  apiStatus?: number;
} {
  if (!body || typeof body !== "object") {
    return {};
  }

  const response =
    body as Record<string, unknown>;

  const nestedError =
    response.error &&
    typeof response.error === "object"
      ? (response.error as Record<string, unknown>)
      : null;

  const message =
    typeof response.message === "string"
      ? response.message
      : typeof response.error === "string"
        ? response.error
        : typeof nestedError?.message === "string"
          ? nestedError.message
          : undefined;

  const code =
    typeof response.code === "string"
      ? response.code
      : typeof nestedError?.code === "string"
        ? nestedError.code
        : undefined;

  const apiStatus =
    typeof response.status === "number"
      ? response.status
      : undefined;

  return {
    message,
    code,
    apiStatus,
  };
}

/**
 * Make an authenticated server-side request to Pandascrow.
 *
 * Pandascrow API authentication uses the Token header.
 * Responses are returned in their original JSON envelope.
 */
export async function pandascrowRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const {
    secretKey,
    baseUrl,
    environment,
  } = getPandascrowConfig();

  if (
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    throw new Error(
      "Pandascrow API paths must start with a single slash."
    );
  }

  const method =
    (init.method || "GET").toUpperCase();

  const endpoint = path.split("?")[0];

  const headers = new Headers(init.headers);

  headers.set("Token", secretKey);
  headers.set("Accept", "application/json");

  if (
    init.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}${path}`,
      {
        ...init,
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );
  } catch (error: unknown) {
    console.error(
      "[Pandascrow] Network request failed",
      {
        environment,
        method,
        endpoint,
        errorName:
          error instanceof Error
            ? error.name
            : "UnknownError",
      }
    );

    throw new Error(
      "Unable to connect to Pandascrow. Check the API URL and network connection."
    );
  }

  let body: unknown = null;

  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const safeDetails =
    getSafePandascrowErrorDetails(body);

  const responseObject =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;

  const reportedFailure =
    responseObject?.status === false ||
    responseObject?.success === false ||
    (
      typeof responseObject?.status === "number" &&
      responseObject.status >= 400
    );

  if (
    !response.ok ||
    body === null ||
    reportedFailure
  ) {
    const message =
      safeDetails.message ||
      `Pandascrow request failed with HTTP ${response.status}.`;

    console.error(
      "[Pandascrow] API request rejected",
      {
        environment,
        method,
        endpoint,
        httpStatus: response.status,
        apiStatus:
          safeDetails.apiStatus ?? null,
        errorCode:
          safeDetails.code ?? null,
      }
    );

    throw new PandascrowApiError(
      message,
      response.status,
      endpoint,
      method,
      safeDetails.apiStatus,
      safeDetails.code
    );
  }

  return body as T;
}

function normalizeStatus(
  value: unknown
): string {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function isNonEmptyString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isPaymentAlreadyVerified(
  booking: Record<string, unknown>
): boolean {
  const paymentStatus =
    normalizeStatus(booking.paymentStatus);

  return (
    paymentStatus === "paid" ||
    paymentStatus === "released"
  );
}

function isRefunded(
  booking: Record<string, unknown>
): boolean {
  return (
    normalizeStatus(booking.status) === "refunded" ||
    normalizeStatus(booking.paymentStatus) === "refunded"
  );
}

function isDisputed(
  booking: Record<string, unknown>
): boolean {
  return normalizeStatus(booking.status) === "disputed";
}

function isCompleted(
  booking: Record<string, unknown>
): boolean {
  return (
    normalizeStatus(booking.status) === "completed" ||
    normalizeStatus(booking.paymentStatus) === "released"
  );
}

/**
 * Create a deterministic webhook identifier.
 *
 * Pandascrow recommends using a transaction or payout
 * reference for idempotency. We also use an explicit
 * event ID when the payload provides one.
 *
 * If no stable identifier is available, this returns null.
 * Booking state transitions must remain safe in that case.
 */
function getWebhookIdempotencyKey(
  payload: PandascrowWebhookPayload,
  eventName: string,
  escrowId: string,
  transactionReference: string,
  payoutReference: string
): string | null {
  const explicitEventId =
    payload.event_id;

  const stableReference =
    isNonEmptyString(payoutReference)
      ? `payout:${payoutReference}`
      : isNonEmptyString(transactionReference)
        ? `transaction:${transactionReference}`
        : null;

  const payloadTimestamp =
    payload.timestamp ??
    payload.data?.timestamp;

  const timestamp =
    payloadTimestamp !== undefined &&
    payloadTimestamp !== null &&
    String(payloadTimestamp).trim() !== ""
      ? String(payloadTimestamp)
      : null;

  const identifier =
    explicitEventId !== undefined &&
    explicitEventId !== null &&
    String(explicitEventId).trim() !== ""
      ? `event:${String(explicitEventId)}`
      : stableReference
        ? stableReference
        : timestamp
          ? `timestamp:${timestamp}`
          : null;

  if (!identifier) {
    return null;
  }

  const rawKey =
    `${eventName}:${escrowId}:${identifier}`;

  return createHash("sha256")
    .update(rawKey)
    .digest("hex");
}

/**
 * Synchronize an existing NSUK Nest booking with a
 * Pandascrow webhook that has already passed signature
 * verification.
 *
 * Contact access is unlocked only when a signed
 * escrow.paid event confirms BOTH:
 *
 * 1. The escrow status is "funded".
 * 2. The funding transaction status is "success".
 *
 * This function must never be called with an unverified
 * webhook payload.
 */
export async function syncBookingFromPandascrow(
  bookingRef: DocumentReference,
  payload: PandascrowWebhookPayload
): Promise<{
  status: string;
  paymentStatus: string;
  contactUnlocked: boolean;
} | null> {
  const eventName =
    normalizeStatus(payload.event);

  const eventData =
    payload.data;

  if (!eventName || !eventData) {
    throw new Error(
      "Pandascrow webhook event data is missing."
    );
  }

  const escrow =
    eventData.escrow_data;

  const escrowIdValue =
    eventData.escrow_id ??
    escrow?.escrow_id ??
    escrow?._id ??
    escrow?.id;

  if (
    escrowIdValue === undefined ||
    escrowIdValue === null ||
    String(escrowIdValue).trim() === ""
  ) {
    throw new Error(
      "Pandascrow webhook is missing its escrow identifier."
    );
  }

  const escrowId =
    String(escrowIdValue);

  const escrowStatus =
    normalizeStatus(escrow?.status);

  const transactionStatus =
    normalizeStatus(eventData.transaction?.status);

  const transactionReference =
    eventData.transaction?.transaction_ref ||
    eventData.payment?.reference ||
    "";

  const payoutReference =
    eventData.payout?.reference || "";

  const payoutStatus =
    normalizeStatus(eventData.payout?.status);

  const commonUpdates = {
    pandascrowEscrowId: escrowId,
    pandascrowEvent: eventName,
    pandascrowStatus:
      escrowStatus || "unknown",

    ...(transactionReference
      ? {
          pandascrowTransactionReference:
            transactionReference,
        }
      : {}),

    pandascrowLastWebhookAt:
      FieldValue.serverTimestamp(),

    updatedAt:
      FieldValue.serverTimestamp(),
  };

  const idempotencyKey =
    getWebhookIdempotencyKey(
      payload,
      eventName,
      escrowId,
      transactionReference,
      payoutReference
    );

  const eventRef = idempotencyKey
    ? bookingRef.firestore
        .collection("pandascrowWebhookEvents")
        .doc(idempotencyKey)
    : null;

  let result: {
    status: string;
    paymentStatus: string;
    contactUnlocked: boolean;
  } | null = null;

  await bookingRef.firestore.runTransaction(
    async (transaction) => {
      /*
       * All transaction reads happen before any writes.
       */
      const bookingSnapshot =
        await transaction.get(bookingRef);

      const processedEventSnapshot =
        eventRef
          ? await transaction.get(eventRef)
          : null;

      if (!bookingSnapshot.exists) {
        throw new Error(
          "The NSUK Nest booking no longer exists."
        );
      }

      const booking =
        bookingSnapshot.data() as Record<string, unknown>;

      /*
       * Ensure this webhook cannot associate a different
       * escrow with an existing booking.
       */
      const existingEscrowId =
        booking.pandascrowEscrowId;

      if (
        existingEscrowId !== undefined &&
        existingEscrowId !== null &&
        String(existingEscrowId) !== escrowId
      ) {
        throw new Error(
          "Pandascrow escrow ID does not match the booking."
        );
      }

      const existingStatus =
        normalizeStatus(booking.status) ||
        "pending_payment";

      const existingPaymentStatus =
        normalizeStatus(booking.paymentStatus) ||
        "pending";

      const existingContactUnlocked =
        booking.contactUnlocked === true;

      /*
       * Duplicate delivery: do not apply the same
       * event transition again.
       */
      if (processedEventSnapshot?.exists) {
        result = {
          status: existingStatus,
          paymentStatus: existingPaymentStatus,
          contactUnlocked: existingContactUnlocked,
        };

        return;
      }

      /*
       * A refund is a financial state change that must
       * not be reversed by an older payment event.
       */
      const refundConfirmed =
        eventName === "escrow.refunded" ||
        eventName === "escrow.refund.completed" ||
        escrowStatus === "refunded";

      if (refundConfirmed) {
        transaction.update(bookingRef, {
          ...commonUpdates,
          status: "refunded",
          paymentStatus: "refunded",
          contactUnlocked: false,
          refundedAt:
            FieldValue.serverTimestamp(),
        });

        result = {
          status: "refunded",
          paymentStatus: "refunded",
          contactUnlocked: false,
        };
      } else if (isRefunded(booking)) {
        /*
         * Preserve an existing refund against delayed events.
         */
        transaction.update(
          bookingRef,
          commonUpdates
        );

        result = {
          status: "refunded",
          paymentStatus: "refunded",
          contactUnlocked: false,
        };
      } else if (
        eventName === "escrow.dispute.opened" ||
        escrowStatus === "disputed"
      ) {
        /*
         * A dispute does not prove that payment succeeded.
         *
         * Preserve the verified payment status. Keep contact
         * visible only if funding was already verified.
         */
        const paymentVerified =
          isPaymentAlreadyVerified(booking);

        const nextPaymentStatus =
          existingPaymentStatus;

        const nextContactUnlocked =
          paymentVerified || existingContactUnlocked;

        transaction.update(bookingRef, {
          ...commonUpdates,
          status: "disputed",
          paymentStatus: nextPaymentStatus,
          contactUnlocked: nextContactUnlocked,
          disputedAt:
            FieldValue.serverTimestamp(),
        });

        result = {
          status: "disputed",
          paymentStatus: nextPaymentStatus,
          contactUnlocked: nextContactUnlocked,
        };
      } else if (
        eventName === "escrow.completed" ||
        escrowStatus === "completed"
      ) {
        /*
         * An authenticated completed-escrow event is a
         * terminal escrow transition. A previously refunded
         * booking was handled above.
         */
        transaction.update(bookingRef, {
          ...commonUpdates,
          status: "completed",
          paymentStatus: "released",
          contactUnlocked: true,
          completedAt:
            FieldValue.serverTimestamp(),
        });

        result = {
          status: "completed",
          paymentStatus: "released",
          contactUnlocked: true,
        };
      } else if (
        eventName === "escrow.payout.completed"
      ) {
        /*
         * Record payout data separately from the initial
         * payment confirmation.
         *
         * A successful payout can be completed through a
         * bank or through the Pandascrow wallet.
         */
        const walletSucceeded =
          eventData.payout?.wallet_succeeded === true;

        const bankSucceeded =
          eventData.payout?.bank_succeeded === true;

        const payoutSucceeded =
          payoutStatus === "completed" ||
          payoutStatus === "success" ||
          payoutStatus === "succeeded" ||
          (
            payoutStatus === "completed_via_wallet" &&
            walletSucceeded
          ) ||
          walletSucceeded ||
          (
            bankSucceeded &&
            payoutStatus === "completed_via_bank"
          );

        const payoutUpdates = {
          ...commonUpdates,

          ...(payoutReference
            ? {
                pandascrowPayoutReference:
                  payoutReference,
              }
            : {}),

          pandascrowPayoutStatus:
            payoutStatus || "unknown",

          pandascrowPayoutBankSucceeded:
            bankSucceeded,

          pandascrowPayoutWalletSucceeded:
            walletSucceeded,

          pandascrowPayoutLastWebhookAt:
            FieldValue.serverTimestamp(),
        };

        if (payoutSucceeded) {
          transaction.update(bookingRef, {
            ...payoutUpdates,
            status: "completed",
            paymentStatus: "released",
            contactUnlocked: true,
            completedAt:
              FieldValue.serverTimestamp(),
          });

          result = {
            status: "completed",
            paymentStatus: "released",
            contactUnlocked: true,
          };
        } else {
          /*
           * A failed bank attempt may coexist with a
           * successful wallet payout. If neither succeeded,
           * preserve the existing booking lifecycle.
           */
          transaction.update(
            bookingRef,
            payoutUpdates
          );

          result = {
            status: existingStatus,
            paymentStatus: existingPaymentStatus,
            contactUnlocked:
              existingContactUnlocked,
          };
        }
      } else {
        /*
         * Verify escrow funding using the documented
         * event, escrow status, and transaction status.
         *
         * A signed event name by itself is insufficient
         * to unlock the agent's contact details.
         */
        const fundingVerified =
          eventName === "escrow.paid" &&
          escrowStatus === "funded" &&
          transactionStatus === "success";

        if (fundingVerified) {
          if (
            isCompleted(booking) ||
            isDisputed(booking)
          ) {
            /*
             * Do not downgrade an already completed or
             * disputed booking because of a delayed paid event.
             */
            transaction.update(
              bookingRef,
              commonUpdates
            );

            result = {
              status: existingStatus,
              paymentStatus: existingPaymentStatus,
              contactUnlocked:
                existingContactUnlocked ||
                isPaymentAlreadyVerified(booking),
            };
          } else {
            transaction.update(bookingRef, {
              ...commonUpdates,
              status: "inspection_pending",
              paymentStatus: "paid",
              contactUnlocked: true,
              paidAt:
                eventData.paid_at ||
                FieldValue.serverTimestamp(),
            });

            result = {
              status: "inspection_pending",
              paymentStatus: "paid",
              contactUnlocked: true,
            };
          }
        } else if (
          eventName === "escrow.created" ||
          escrowStatus === "pending"
        ) {
          /*
           * Never downgrade a booking that has already
           * reached a verified payment or later lifecycle state.
           */
          const alreadyAdvanced =
            isPaymentAlreadyVerified(booking) ||
            isCompleted(booking) ||
            isDisputed(booking) ||
            existingContactUnlocked;

          if (alreadyAdvanced) {
            transaction.update(
              bookingRef,
              commonUpdates
            );

            result = {
              status: existingStatus,
              paymentStatus: existingPaymentStatus,
              contactUnlocked:
                existingContactUnlocked,
            };
          } else {
            transaction.update(bookingRef, {
              ...commonUpdates,
              status: "pending_payment",
              paymentStatus: "pending",
              contactUnlocked: false,
            });

            result = {
              status: "pending_payment",
              paymentStatus: "pending",
              contactUnlocked: false,
            };
          }
        } else {
          /*
           * An unrelated event updates diagnostic metadata
           * without changing the booking's financial state.
           */
          transaction.update(
            bookingRef,
            commonUpdates
          );

          result = {
            status: existingStatus,
            paymentStatus: existingPaymentStatus,
            contactUnlocked:
              existingContactUnlocked,
          };
        }
      }

      /*
       * Save the deduplication record in the same Firestore
       * transaction as the booking update. If the transaction
       * fails, the event record is not committed separately.
       */
      if (eventRef) {
        transaction.set(eventRef, {
          event: eventName,
          escrowId,
          bookingId: bookingRef.id,
          ...(transactionReference
            ? { transactionReference }
            : {}),
          ...(payoutReference
            ? { payoutReference }
            : {}),
          processedAt:
            FieldValue.serverTimestamp(),
        });
      }
    }
  );

  return result;
}
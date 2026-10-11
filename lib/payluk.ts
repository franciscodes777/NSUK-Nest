import "server-only";

import { FieldValue, type DocumentReference } from "firebase-admin/firestore";

type PaylukEnvelope<T> = {
  status?: number;
  message?: string;
  data?: T;
};

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

export class PaylukApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "PaylukApiError";
    this.statusCode = statusCode;
  }
}

export function getPaylukConfig() {
  const secretKey = process.env.PAYLUK_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("PAYLUK_SECRET_KEY is not configured on the server.");
  }

  const isTestKey = secretKey.startsWith("sk_test_");
  const isLiveKey = secretKey.startsWith("sk_live_");

  if (!isTestKey && !isLiveKey) {
    throw new Error("PAYLUK_SECRET_KEY must start with sk_test_ or sk_live_.");
  }

  const defaultBaseUrl = isTestKey
    ? "https://staging.api.payluk.ng"
    : "https://api.payluk.ng";

  const baseUrl = (
    process.env.PAYLUK_API_BASE_URL?.trim() || defaultBaseUrl
  ).replace(/\/+$/, "");

  if (isTestKey && !baseUrl.includes("staging.api.payluk.ng")) {
    throw new Error("A Payluk test key must use https://staging.api.payluk.ng.");
  }

  if (isLiveKey && baseUrl.includes("staging.api.payluk.ng")) {
    throw new Error("A Payluk live key cannot use the staging API.");
  }

  return {
    secretKey,
    baseUrl,
    environment: isTestKey ? "test" : "live",
  };
}

export async function paylukRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { secretKey, baseUrl } = getPaylukConfig();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${secretKey}`);

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });

  const body = (await response.json().catch(() => null)) as
    | PaylukEnvelope<T>
    | null;

  if (!response.ok || !body) {
    const message =
      typeof body?.message === "string"
        ? body.message
        : `Payluk request failed with HTTP ${response.status}.`;

    throw new PaylukApiError(message, response.status);
  }

  return body.data as T;
}

/**
 * Synchronizes a booking with Payluk's server-side escrow status.
 * A browser checkout callback alone must never unlock agent contact.
 */
export async function syncBookingFromEscrow(
  bookingRef: DocumentReference,
  escrow: PaylukEscrow
) {
  const paylukStatus = (escrow.status || "").toUpperCase();
  const paylukState = (escrow.state || "").toUpperCase();

  const common = {
    paylukStatus: paylukStatus || "UNKNOWN",
    paylukState: paylukState || "UNKNOWN",
    paymentCheckedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (paylukStatus === "REFUNDED") {
    await bookingRef.update({
      ...common,
      status: "refunded",
      paymentStatus: "refunded",
      contactUnlocked: false,
      refundedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: "refunded",
      paymentStatus: "refunded",
      contactUnlocked: false,
    };
  }

  if (paylukStatus === "SPLIT") {
    await bookingRef.update({
      ...common,
      status: "resolved",
      paymentStatus: "partially_refunded",
      contactUnlocked: false,
      resolvedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: "resolved",
      paymentStatus: "partially_refunded",
      contactUnlocked: false,
    };
  }

  if (paylukStatus === "DISPUTED" || paylukStatus === "INVESTIGATING") {
    await bookingRef.update({
      ...common,
      status: "disputed",
      paymentStatus: "paid",
      contactUnlocked: true,
    });

    return {
      status: "disputed",
      paymentStatus: "paid",
      contactUnlocked: true,
    };
  }

  if (
    paylukStatus === "COMPLETED" ||
    paylukStatus === "CLAIMED" ||
    (paylukState === "CLOSED" && paylukStatus !== "REFUNDED")
  ) {
    await bookingRef.update({
      ...common,
      status: "completed",
      paymentStatus: "released",
      contactUnlocked: true,
      completedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: "completed",
      paymentStatus: "released",
      contactUnlocked: true,
    };
  }

  if (paylukState === "OPENED" || paylukStatus === "ONGOING") {
    await bookingRef.update({
      ...common,
      status: "inspection_pending",
      paymentStatus: "paid",
      contactUnlocked: true,
      paidAt: escrow.paidAt || FieldValue.serverTimestamp(),
    });

    return {
      status: "inspection_pending",
      paymentStatus: "paid",
      contactUnlocked: true,
    };
  }

  // Pending or unfunded escrows must not unlock agent contact.
  await bookingRef.update({
    ...common,
    status: "pending_payment",
    paymentStatus: "pending",
    contactUnlocked: false,
  });

  return {
    status: "pending_payment",
    paymentStatus: "pending",
    contactUnlocked: false,
  };
}
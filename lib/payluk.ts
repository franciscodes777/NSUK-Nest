
import "server-only";

import {
  FieldValue,
  Timestamp,
  type DocumentReference,
} from "firebase-admin/firestore";
import {
  getEscrowStatusFromPayluk,
  toDate,
} from "@/lib/escrowStatus";

type PaylukEnvelope<T> = {
  status?: number;
  message?: string;
  data?: T;
  error?: string | {
    message?: string;
    code?: string;
  };
  code?: string;
};

export type PaylukEscrow = {
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

export type PaylukCustomer = {
  customerId?: string;
  id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  status?: string;
  permissions?: {
    canWithdraw?: boolean;
    canBuy?: boolean;
    canSell?: boolean;
  };
};

type PaylukCustomerList = {
  pagination?: {
    count?: number;
    pages?: number;
    isLastPage?: boolean;
    nextPage?: number | null;
    previousPage?: number | null;
  };
  data?: PaylukCustomer[];
};

export type PaylukCustomerPermissions = {
  canBuy: boolean;
  canSell: boolean;
  canWithdraw?: boolean;
};

export type EnsurePaylukCustomerInput = {
  email: string;
  name: string;
  phone: string;
  countryId?: string;
  existingCustomerId?: string | null;
  permissions: PaylukCustomerPermissions;
};

export class PaylukApiError extends Error {
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

    this.name = "PaylukApiError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;
    this.apiStatus = apiStatus;
    this.errorCode = errorCode;
  }
}

export function getPaylukConfig() {
  const secretKey = process.env.PAYLUK_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error(
      "PAYLUK_SECRET_KEY is not configured on the server."
    );
  }

  const isTestKey = secretKey.startsWith("sk_test_");
  const isLiveKey = secretKey.startsWith("sk_live_");

  if (!isTestKey && !isLiveKey) {
    throw new Error(
      "PAYLUK_SECRET_KEY must start with sk_test_ or sk_live_."
    );
  }

  const defaultBaseUrl = isTestKey
    ? "https://staging.api.payluk.ng"
    : "https://api.payluk.ng";

  const baseUrl = (
    process.env.PAYLUK_API_BASE_URL?.trim() || defaultBaseUrl
  ).replace(/\/+$/, "");

  if (
    isTestKey &&
    !baseUrl.includes("staging.api.payluk.ng")
  ) {
    throw new Error(
      "A Payluk test key must use https://staging.api.payluk.ng."
    );
  }

  if (
    isLiveKey &&
    baseUrl.includes("staging.api.payluk.ng")
  ) {
    throw new Error(
      "A Payluk live key cannot use the staging API."
    );
  }

  return {
    secretKey,
    baseUrl,
    environment: isTestKey ? "test" : "live",
  };
}

/**
 * Extract safe diagnostic fields from a Payluk response.
 *
 * Never log request headers, authorization credentials,
 * customer details, payment tokens, or the complete response.
 */
function getSafeErrorDetails(body: unknown): {
  message?: string;
  code?: string;
  apiStatus?: number;
} {
  if (!body || typeof body !== "object") {
    return {};
  }

  const response = body as Record<string, unknown>;

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
 * Make an authenticated request to Payluk.
 *
 * Logs safe diagnostic details when Payluk rejects a request.
 */
export async function paylukRequest<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const { secretKey, baseUrl, environment } =
    getPaylukConfig();

  const method = (init.method || "GET").toUpperCase();

  // Only log the path, never the authorization headers or request body.
  const endpoint = path.split("?")[0];

  const headers = new Headers(init.headers);

  headers.set("Authorization", `Bearer ${secretKey}`);

  let response: Response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown network error";

    console.error("[Payluk] Network request failed", {
      environment,
      method,
      endpoint,
      errorName:
        error instanceof Error
          ? error.name
          : "UnknownError",
      message,
    });

    throw error;
  }

  let body: PaylukEnvelope<T> | null = null;

  try {
    body = (await response.json()) as PaylukEnvelope<T>;
  } catch {
    body = null;
  }

  const safeDetails = getSafeErrorDetails(body);

  if (!response.ok || !body) {
    const message =
      safeDetails.message ||
      `Payluk request failed with HTTP ${response.status}.`;

    console.error("[Payluk] HTTP request rejected", {
      environment,
      method,
      endpoint,
      httpStatus: response.status,
      httpStatusText: response.statusText,
      apiStatus: safeDetails.apiStatus ?? null,
      errorCode: safeDetails.code ?? null,
      message,
      responseWasValidJson: body !== null,
    });

    throw new PaylukApiError(
      message,
      response.status,
      endpoint,
      method,
      safeDetails.apiStatus,
      safeDetails.code
    );
  }

  if (
    typeof body.status === "number" &&
    body.status >= 400
  ) {
    const message =
      safeDetails.message ||
      "Payluk rejected the request.";

    console.error("[Payluk] API-level request rejected", {
      environment,
      method,
      endpoint,
      httpStatus: response.status,
      httpStatusText: response.statusText,
      apiStatus: body.status,
      errorCode: safeDetails.code ?? null,
      message,
    });

    throw new PaylukApiError(
      message,
      response.status,
      endpoint,
      method,
      body.status,
      safeDetails.code
    );
  }

  return body.data as T;
}

/**
 * Find a Payluk customer by email.
 */
export async function findPaylukCustomerByEmail(
  email: string
): Promise<PaylukCustomer | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "An email address is required to find a Payluk customer."
    );
  }

  const query = new URLSearchParams({
    email: normalizedEmail,
  });

  try {
    const result = await paylukRequest<
      PaylukCustomerList | PaylukCustomer[]
    >(`/v1/customers?${query.toString()}`);

    const customers = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
        ? result.data
        : [];

    return (
      customers.find(
        (customer) =>
          customer.email?.trim().toLowerCase() ===
          normalizedEmail
      ) || null
    );
  } catch (error) {
    if (
      error instanceof PaylukApiError &&
      error.statusCode === 400
    ) {
      return null;
    }

    throw error;
  }
}

/**
 * Create a Payluk customer.
 *
 * countryId is intentionally omitted because Payluk expects
 * its own country document ID, not an ISO code such as "NG".
 * The field is optional in the customer-creation documentation.
 */
export async function createPaylukCustomer(input: {
  email: string;
  name: string;
  phone: string;
  countryId?: string;
}): Promise<PaylukCustomer> {
  const email = input.email.trim().toLowerCase();

  const nameParts = input.name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstname = nameParts[0] || "";
  const lastname = nameParts.slice(1).join(" ") || firstname;

  const phone = input.phone.replace(/\D/g, "");

  if (!email) {
    throw new Error(
      "An email address is required to create a Payluk customer."
    );
  }

  if (!firstname) {
    throw new Error(
      "A name is required to create a Payluk customer."
    );
  }

  if (!phone) {
    throw new Error(
      "Add a valid phone number to your profile before continuing with Payluk."
    );
  }

  const payload = {
    firstname,
    lastname,
    email,
    phone,
  };

  const customer = await paylukRequest<PaylukCustomer>(
    "/v1/customer/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const customerId = customer?.customerId || customer?.id;

  if (!customerId) {
    throw new Error(
      "Payluk did not return a customer ID."
    );
  }

  return {
    ...customer,
    customerId,
  };
}

/**
 * Configure a customer's buying and selling permissions.
 */
export async function setPaylukCustomerPermissions(
  customerId: string,
  permissions: PaylukCustomerPermissions
): Promise<PaylukCustomer | null> {
  if (!customerId.trim()) {
    throw new Error(
      "A Payluk customer ID is required to update permissions."
    );
  }

  const result = await paylukRequest<PaylukCustomer>(
    `/v1/customer/permissions/${encodeURIComponent(customerId)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        canBuy: permissions.canBuy,
        canSell: permissions.canSell,
        ...(permissions.canWithdraw !== undefined
          ? { canWithdraw: permissions.canWithdraw }
          : {}),
      }),
    }
  );

  return result || null;
}

/**
 * Reuse an existing Payluk customer or create one.
 *
 * Existing customer IDs are also checked for the required permissions.
 */
export async function ensurePaylukCustomer(
  input: EnsurePaylukCustomerInput
): Promise<string> {
  let customer: PaylukCustomer | null = null;

  if (input.existingCustomerId?.trim()) {
    const customerId = input.existingCustomerId.trim();

    await setPaylukCustomerPermissions(
      customerId,
      input.permissions
    );

    return customerId;
  }

  const existing = await findPaylukCustomerByEmail(
    input.email
  );

  customer = existing;

  if (!customer) {
    customer = await createPaylukCustomer({
      email: input.email,
      name: input.name,
      phone: input.phone,
    });
  }

  const customerId = customer.customerId || customer.id;

  if (!customerId) {
    throw new Error(
      "Payluk did not return a customer ID."
    );
  }

  const currentPermissions = customer.permissions;

  const permissionsNeedUpdating =
    !currentPermissions ||
    currentPermissions.canBuy !== input.permissions.canBuy ||
    currentPermissions.canSell !== input.permissions.canSell ||
    (input.permissions.canWithdraw !== undefined &&
      currentPermissions.canWithdraw !==
        input.permissions.canWithdraw);

  if (permissionsNeedUpdating) {
    await setPaylukCustomerPermissions(
      customerId,
      input.permissions
    );
  }

  return customerId;
}

/**
 * Fetch the current escrow state directly from Payluk.
 */
export async function verifyPaylukEscrow(
  paymentToken: string
): Promise<PaylukEscrow> {
  return paylukRequest<PaylukEscrow>(
    `/v1/escrow/verify/${encodeURIComponent(paymentToken)}`
  );
}

/**
 * Buyer confirms they are satisfied. Payluk releases the held
 * funds to the seller and closes the escrow (status COMPLETED).
 *
 * Only allowed while the escrow is OPENED. Requires a merchant
 * super-admin secret key.
 */
export async function confirmPaylukEscrow(
  escrowId: string,
  buyerCustomerId: string
): Promise<PaylukEscrow> {
  return paylukRequest<PaylukEscrow>(
    `/v1/escrow/confirm-payment/${encodeURIComponent(escrowId)}`,
    {
      method: "POST",
      headers: {
        "customer-id": buyerCustomerId,
      },
    }
  );
}

/**
 * Buyer opens a dispute. Funds stay frozen until the merchant
 * (NSUK Nest admin) resolves it.
 */
export async function submitPaylukDispute(
  paymentToken: string,
  buyerCustomerId: string,
  message: string
): Promise<PaylukEscrow> {
  const form = new FormData();
  form.append("message", message);

  return paylukRequest<PaylukEscrow>(
    `/v1/escrow/submit-dispute/${encodeURIComponent(paymentToken)}`,
    {
      method: "POST",
      headers: {
        "customer-id": buyerCustomerId,
      },
      body: form,
    }
  );
}

/**
 * Merchant resolves a dispute.
 *
 * COMPLETED releases the funds to the seller.
 * REFUNDED returns the funds to the buyer.
 */
export async function resolvePaylukDispute(
  escrowId: string,
  outcome: "COMPLETED" | "REFUNDED",
  resolution: string
): Promise<PaylukEscrow> {
  const form = new FormData();
  form.append("status", outcome);
  form.append("resolution", resolution);

  return paylukRequest<PaylukEscrow>(
    `/v1/escrow/dispute/resolve/${encodeURIComponent(escrowId)}`,
    {
      method: "POST",
      body: form,
    }
  );
}

function getDefaultInspectionDays(): number {
  const days = Number(
    process.env.PAYLUK_INSPECTION_DAYS?.trim() || 7
  );

  return Number.isInteger(days) && days >= 1 && days <= 365
    ? days
    : 7;
}

/**
 * Synchronize a booking with Payluk's server-side escrow status.
 *
 * A browser checkout callback alone must never unlock agent contact.
 * Only a recognized funded escrow status unlocks contact.
 *
 * When the escrow is first seen as funded, the booking records
 * when the payment was received and when the held funds will be
 * released automatically if the student does not respond.
 * Those dates are only set once, so repeated syncs never extend
 * the hold.
 */
export async function syncBookingFromEscrow(
  bookingRef: DocumentReference,
  escrow: PaylukEscrow
) {
  const paylukStatus = (escrow.status || "").toUpperCase();
  const paylukState = (escrow.state || "").toUpperCase();
  const escrowStatus = getEscrowStatusFromPayluk(paylukStatus);

  const existingSnapshot = await bookingRef.get();
  const existing = existingSnapshot.data() || {};

  const common = {
    paylukStatus: paylukStatus || "UNKNOWN",
    paylukState: paylukState || "UNKNOWN",
    escrowStatus,
    paymentCheckedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  /*
   * Record the payment time and release deadline the first
   * time Payluk reports the escrow as funded.
   */
  const fundingFields: Record<string, unknown> = {};

  if (escrowStatus !== "awaiting_payment" && !existing.paidAt) {
    const paidAt = toDate(escrow.paidAt) || new Date();
    fundingFields.paidAt = Timestamp.fromDate(paidAt);
  }

  if (
    escrowStatus !== "awaiting_payment" &&
    !existing.releaseDueAt
  ) {
    const paidAt =
      toDate(existing.paidAt) ||
      toDate(escrow.paidAt) ||
      new Date();

    const days =
      Number(existing.inspectionPeriodDays) ||
      getDefaultInspectionDays();

    fundingFields.releaseDueAt = Timestamp.fromMillis(
      paidAt.getTime() + days * 24 * 60 * 60 * 1000
    );
  }

  let fields: Record<string, unknown>;

  switch (escrowStatus) {
    case "refunded":
      fields = {
        status: "refunded",
        paymentStatus: "refunded",
        contactUnlocked: false,
        ...(existing.refundedAt
          ? {}
          : { refundedAt: FieldValue.serverTimestamp() }),
      };
      break;

    case "split":
      fields = {
        status: "resolved",
        paymentStatus: "partially_refunded",
        contactUnlocked: false,
        ...(existing.resolvedAt
          ? {}
          : { resolvedAt: FieldValue.serverTimestamp() }),
      };
      break;

    case "disputed":
      fields = {
        status: "disputed",
        paymentStatus: "paid",
        inspectionStatus: "disputed",
        contactUnlocked: false,
      };
      break;

    case "released":
      fields = {
        status: "completed",
        paymentStatus: "released",
        contactUnlocked: true,
        ...(existing.releasedAt
          ? {}
          : { releasedAt: FieldValue.serverTimestamp() }),
        ...(existing.releasedBy
          ? {}
          : {
              releasedBy:
                paylukStatus === "CLAIMED"
                  ? "agent_claim"
                  : "payluk",
            }),
        ...(existing.completedAt
          ? {}
          : { completedAt: FieldValue.serverTimestamp() }),
      };
      break;

    case "held":
      fields = {
        status: "inspection_pending",
        paymentStatus: "paid",
        contactUnlocked: true,
      };
      break;

    default:
      fields = {
        status: "pending_payment",
        paymentStatus: "pending",
        contactUnlocked: false,
      };
  }

  await bookingRef.update({
    ...common,
    ...fundingFields,
    ...fields,
  });

  return {
    status: fields.status as string,
    paymentStatus: fields.paymentStatus as string,
    escrowStatus,
    contactUnlocked: fields.contactUnlocked as boolean,
  };
}

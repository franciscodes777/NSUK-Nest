import "server-only";

import {
  FieldValue,
  type DocumentReference,
} from "firebase-admin/firestore";

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

  /*
   * HTTP-level failure.
   * The HTTP status comes directly from the Response object.
   */
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

  /*
   * Some APIs return HTTP 200 but report a failure
   * in the response body's status field.
   */
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
 */
export async function ensurePaylukCustomer(
  input: EnsurePaylukCustomerInput
): Promise<string> {
  if (input.existingCustomerId?.trim()) {
    return input.existingCustomerId.trim();
  }

  const existing = await findPaylukCustomerByEmail(
    input.email
  );

  let customer = existing;

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
 * Synchronize a booking with Payluk's server-side escrow status.
 *
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

  if (
    paylukStatus === "DISPUTED" ||
    paylukStatus === "INVESTIGATING"
  ) {
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
    (paylukState === "CLOSED" &&
      paylukStatus !== "REFUNDED")
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

  if (
    paylukState === "OPENED" ||
    paylukStatus === "ONGOING"
  ) {
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
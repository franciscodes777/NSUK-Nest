"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { pandascrowRequest } from "@/lib/pandascrow";

type JsonRecord = Record<string, unknown>;

type PandascrowPartyDetails = {
  name: string;
  email: string;
  phone: string;
};

type PandascrowEscrowData = {
  _id?: string | number;
  id?: string | number;
  status?: string;
  escrow_type?: string;
};

type PandascrowTransactionData = {
  transaction_ref?: string;
  reference?: string;
  payment_url?: string;
};

type PandascrowPaymentData = {
  method?: string;
  payment_url?: string | null;
  reference?: string;
  provider?: string;
  virtual_account?: JsonRecord | null;
};

type PandascrowInitializationData = {
  escrow_id?: string | number;
  id?: string | number;
  escrow_data?: PandascrowEscrowData;
  transaction?: PandascrowTransactionData;
  payment?: PandascrowPaymentData;
  payment_url?: string | null;
  virtual_account?: JsonRecord | null;
  status?: boolean | number | string;
  message?: string;
};

type PandascrowInitializationResponse =
  PandascrowInitializationData & {
    data?: PandascrowInitializationData;
  };

type PaymentGateway = "payment_link" | "virtual_account";

function isRecord(value: unknown): value is JsonRecord {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

/**
 * Normalize Nigerian phone numbers while allowing
 * international numbers that are already in +country-code format.
 */
function normalizePhone(
  value: unknown,
  label: string
): string {
  const raw =
    typeof value === "string"
      ? value.trim()
      : typeof value === "number"
        ? String(value)
        : "";

  if (!raw) {
    throw new Error(
      `${label} phone number is required for the escrow transaction.`
    );
  }

  const digits = raw.replace(/\D/g, "");

  if (
    raw.startsWith("+") &&
    digits.length >= 8 &&
    digits.length <= 15
  ) {
    return `+${digits}`;
  }

  if (
    digits.startsWith("234") &&
    digits.length === 13
  ) {
    return `+${digits}`;
  }

  if (
    digits.startsWith("0") &&
    digits.length === 11
  ) {
    return `+234${digits.slice(1)}`;
  }

  if (digits.length === 10) {
    return `+234${digits}`;
  }

  throw new Error(
    `The ${label.toLowerCase()} phone number is invalid. Update the profile and try again.`
  );
}

function getPositiveInteger(
  envName: string,
  defaultValue: number,
  minimum: number,
  maximum: number
): number {
  const configuredValue = process.env[envName]?.trim();

  const value = configuredValue
    ? Number(configuredValue)
    : defaultValue;

  if (
    !Number.isInteger(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error(
      `${envName} must be a whole number between ${minimum} and ${maximum}.`
    );
  }

  return value;
}

function getPaymentGateway(): PaymentGateway {
  const configuredValue = (
    process.env.PANDASCROW_PAYMENT_GATEWAY?.trim() ||
    "virtual_account"
  ).toLowerCase();

  if (
    configuredValue !== "payment_link" &&
    configuredValue !== "virtual_account"
  ) {
    throw new Error(
      "PANDASCROW_PAYMENT_GATEWAY must be payment_link or virtual_account."
    );
  }

  return configuredValue;
}

function getWhoPaysFees(): "buyer" | "seller" | "both" {
  const configuredValue = (
    process.env.PANDASCROW_WHO_PAY_FEES?.trim() ||
    "both"
  ).toLowerCase();

  if (
    configuredValue !== "buyer" &&
    configuredValue !== "seller" &&
    configuredValue !== "both"
  ) {
    throw new Error(
      "PANDASCROW_WHO_PAY_FEES must be buyer, seller, or both."
    );
  }

  return configuredValue;
}

export async function createBooking(propertyId: string) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  if (session.user.role !== "student") {
    throw new Error(
      "Only students can create bookings."
    );
  }

  if (
    !propertyId ||
    typeof propertyId !== "string" ||
    !propertyId.trim()
  ) {
    throw new Error("A valid property is required.");
  }

  /*
   * Pandascrow account configuration.
   *
   * This UUID identifies the Pandascrow account operating
   * NSUK Nest's broker escrow transactions. It is not the
   * student's Firebase ID or an API secret.
   */
  const pandascrowAccountUuid =
    process.env.PANDASCROW_ACCOUNT_UUID?.trim();

  if (!pandascrowAccountUuid) {
    throw new Error(
      "PANDASCROW_ACCOUNT_UUID is not configured. Add your Pandascrow account UUID to the server environment."
    );
  }

  /*
   * Check the student account in Firestore.
   */
  const studentSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get();

  if (studentSnapshot.empty) {
    throw new Error("Student account not found.");
  }

  const student = studentSnapshot.docs[0];
  const studentData = student.data();

  /*
   * Find the selected property.
   */
  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId);

  const propertySnapshot = await propertyRef.get();

  if (!propertySnapshot.exists) {
    throw new Error("Property not found.");
  }

  const property = propertySnapshot.data();

  if (!property || property.status !== "approved") {
    throw new Error(
      "This property is not available."
    );
  }

  const rentAmount = Number(property.price);

  if (
    !Number.isFinite(rentAmount) ||
    rentAmount <= 0
  ) {
    throw new Error(
      "This property's rent amount is invalid."
    );
  }

  if (
    property.agentEmail &&
    String(property.agentEmail).trim().toLowerCase() ===
      session.user.email.trim().toLowerCase()
  ) {
    throw new Error(
      "You cannot book your own accommodation listing."
    );
  }

  /*
   * Read the escrow configuration.
   *
   * This remains a one-time escrow: one rent payment,
   * held subject to the agreed inspection and dispute terms.
   */
  const inspectionDays = getPositiveInteger(
    "PANDASCROW_INSPECTION_DAYS",
    7,
    1,
    90
  );

  const disputeWindowDays = getPositiveInteger(
    "PANDASCROW_DISPUTE_WINDOW_DAYS",
    7,
    1,
    90
  );

  const paymentGateway = getPaymentGateway();
  const whoPaysFees = getWhoPaysFees();

  const expiryHours =
    paymentGateway === "virtual_account"
      ? getPositiveInteger(
          "PANDASCROW_DVA_EXPIRY_HOURS",
          24,
          1,
          24
        )
      : undefined;

  /*
   * Look up the accommodation owner.
   *
   * Properties created through the agent dashboard store
   * agentId and agentEmail.
   */
  let agentSnapshot:
    | FirebaseFirestore.DocumentSnapshot
    | undefined;

  if (
    typeof property.agentId === "string" &&
    property.agentId.trim()
  ) {
    const possibleAgent = await adminDb
      .collection("users")
      .doc(property.agentId.trim())
      .get();

    if (possibleAgent.exists) {
      agentSnapshot = possibleAgent;
    }
  }

  if (
    !agentSnapshot &&
    typeof property.agentEmail === "string" &&
    property.agentEmail.trim()
  ) {
    const agentQuery = await adminDb
      .collection("users")
      .where(
        "email",
        "==",
        property.agentEmail.trim()
      )
      .limit(1)
      .get();

    if (!agentQuery.empty) {
      agentSnapshot = agentQuery.docs[0];
    }
  }

  if (!agentSnapshot?.exists) {
    throw new Error(
      "The property owner's account could not be found. Please contact support."
    );
  }

  const agent = agentSnapshot;
  const agentData = agent.data();

  if (!agentData) {
    throw new Error(
      "The property owner's profile could not be loaded."
    );
  }

  if (agentData.role !== "agent") {
    throw new Error(
      "The property owner does not have a valid agent account."
    );
  }

  /*
   * Normalize participant information.
   */
  const studentEmail = String(
    studentData.email || session.user.email
  )
    .trim()
    .toLowerCase();

  const agentEmail = String(
    agentData.email || property.agentEmail || ""
  )
    .trim()
    .toLowerCase();

  if (!studentEmail || !agentEmail) {
    throw new Error(
      "The student or property owner's email address is missing."
    );
  }

  const studentName = String(
    studentData.name ||
      session.user.name ||
      studentEmail
  ).trim();

  const agentName = String(
    agentData.name ||
      property.agentName ||
      "Accommodation Provider"
  ).trim();

  const studentPhone = normalizePhone(
    studentData.phone,
    "Student"
  );

  const agentPhone = normalizePhone(
    agentData.phone || property.agentPhone,
    "Property owner's"
  );

  const buyerDetails: PandascrowPartyDetails = {
    name: studentName,
    email: studentEmail,
    phone: studentPhone,
  };

  const sellerDetails: PandascrowPartyDetails = {
    name: agentName,
    email: agentEmail,
    phone: agentPhone,
  };

  /*
   * Reserve a Firestore booking ID before calling Pandascrow.
   */
  const bookingRef = adminDb
    .collection("bookings")
    .doc();

  /*
   * Pandascrow requires an expected delivery date.
   * Since this action does not receive a separate check-in
   * date, use the end of the configured inspection period.
   */
  const deliveryDate = new Date(
    Date.now() + inspectionDays * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10);

  const propertyName = String(
    property.name || "Student Accommodation"
  ).trim();

  const title =
    `NSUK Nest Rental: ${propertyName}`.slice(0, 120);

  const description =
    `Rental payment for ${propertyName}. ` +
    `NSUK Nest booking reference: ${bookingRef.id}. ` +
    `The transaction is subject to the agreed rental, ` +
    `inspection, acceptance, and dispute terms.`;

  const acceptanceCriteria =
    "The student must be able to inspect the booked " +
    "accommodation and verify that it corresponds to the " +
    "approved listing and agreed rental terms. Funds must " +
    "remain subject to the escrow provider's applicable " +
    "acceptance, release, refund, and dispute procedures.";

  /*
   * Build the one-time escrow request.
   *
   * NSUK Nest initiates the transaction in the broker role.
   * Buyer and seller details identify the student and agent.
   * receiver_id is null because this integration does not
   * currently store a Pandascrow user UUID for each agent.
   *
   * Do not add partner_id unless Pandascrow has assigned
   * an integration-partner UUID to your account.
   */
  const escrowRequest: JsonRecord = {
    uuid: pandascrowAccountUuid,

    escrow_type: "onetime",

    initiator_role: "broker",
    initiator_id: pandascrowAccountUuid,
    receiver_id: null,

    title,
    currency: "NGN",
    description,

    acceptance_criteria: acceptanceCriteria,

    inspection_period: String(inspectionDays),
    no_reviews: "1",
    delivery_date: deliveryDate,

    how_dispute_is_handled: "platform",
    who_pay_fees: whoPaysFees,

    amount: rentAmount,

    dispute_window: String(disputeWindowDays),
    prd_url: "",

    buyer_details: buyerDetails,
    seller_details: sellerDetails,

    payment_gateway: paymentGateway,

    ...(expiryHours !== undefined
      ? { expiry_hours: expiryHours }
      : {}),

    ...(process.env.PANDASCROW_CALLBACK_URL?.trim()
      ? {
          callback_url:
            process.env.PANDASCROW_CALLBACK_URL.trim(),
        }
      : {}),
  };

  /*
   * Create the one-time Pandascrow escrow.
   *
   * Do not update the booking to paid based on initialization.
   * It remains pending until a verified webhook confirms
   * that the escrow has been funded.
   */
  const apiResponse =
    await pandascrowRequest<PandascrowInitializationResponse>(
      "/escrow/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(escrowRequest),
      }
    );

  /*
   * Accommodate the documented response's data envelope
   * and nested escrow/payment response structures.
   */
  const responseRoot =
    apiResponse as unknown as JsonRecord;

  const firstLevel = isRecord(responseRoot.data)
    ? responseRoot.data
    : responseRoot;

  const responseData =
    isRecord(firstLevel.data)
      ? firstLevel.data as PandascrowInitializationData
      : firstLevel as PandascrowInitializationData;

  const escrowData = isRecord(responseData.escrow_data)
    ? responseData.escrow_data as PandascrowEscrowData
    : undefined;

  const transactionData = isRecord(
    responseData.transaction
  )
    ? responseData.transaction as PandascrowTransactionData
    : undefined;

  const paymentData = isRecord(responseData.payment)
    ? responseData.payment as PandascrowPaymentData
    : undefined;

  const rawEscrowId =
    responseData.escrow_id ??
    escrowData?._id ??
    escrowData?.id;

  if (
    rawEscrowId === undefined ||
    rawEscrowId === null ||
    String(rawEscrowId).trim() === ""
  ) {
    throw new Error(
      "Pandascrow did not return an escrow identifier. Check the API response before retrying to avoid creating duplicate transactions."
    );
  }

  const escrowId = String(rawEscrowId);

  const paymentUrl = String(
    paymentData?.payment_url ||
      responseData.payment_url ||
      transactionData?.payment_url ||
      ""
  ).trim() || null;

  const paymentReference = String(
    paymentData?.reference ||
      transactionData?.transaction_ref ||
      transactionData?.reference ||
      ""
  ).trim() || null;

  const virtualAccountCandidate =
    paymentData?.virtual_account ??
    responseData.virtual_account ??
    null;

  const virtualAccount = isRecord(
    virtualAccountCandidate
  )
    ? virtualAccountCandidate
    : null;

  /*
   * Verify that the response includes instructions the
   * student can actually use to complete the payment.
   */
  if (
    paymentGateway === "payment_link" &&
    !paymentUrl
  ) {
    throw new Error(
      "Pandascrow initialized the escrow but did not return a payment link. Check your Pandascrow dashboard before retrying."
    );
  }

  if (
    paymentGateway === "virtual_account" &&
    !virtualAccount
  ) {
    throw new Error(
      "Pandascrow initialized the escrow but did not return virtual-account details. Check your Pandascrow dashboard before retrying."
    );
  }

  const initialEscrowStatus = String(
    escrowData?.status || "pending"
  ).trim().toLowerCase();

  /*
   * Save the booking and its Pandascrow references.
   */
  await bookingRef.set({
    studentId: student.id,
    studentEmail,
    studentName,

    propertyId: propertySnapshot.id,
    propertyName,
    propertyLocation: property.location || "",
    propertyAddress: property.address || "",

    agentId: agent.id,
    agentName,
    agentEmail,

    rentAmount,

    paymentProvider: "pandascrow",

    pandascrowEscrowId: escrowId,
    pandascrowAccountUuid:
      pandascrowAccountUuid,

    pandascrowStatus: initialEscrowStatus,

    pandascrowTransactionReference:
      paymentReference,

    pandascrowPaymentGateway:
      paymentGateway,

    pandascrowPaymentUrl:
      paymentUrl,

    pandascrowPaymentDetails:
      virtualAccount,

    inspectionPeriodDays:
      inspectionDays,

    disputeWindowDays:
      disputeWindowDays,

    paymentStatus: "pending",
    status: "pending_payment",
    bookingStatus: "pending",
    inspectionStatus: "pending",
    contactUnlocked: false,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  /*
   * Return the payment instructions to the calling UI.
   *
   * paymentUrl is populated for payment_link.
   * paymentDetails contains the virtual-account details
   * when virtual_account is selected.
   */
  return {
    success: true,
    bookingId: bookingRef.id,

    paymentProvider: "pandascrow",
    paymentGateway,

    paymentUrl,
    paymentDetails: virtualAccount,

    transactionReference: paymentReference,
  };
}
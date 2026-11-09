"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import {
  ensurePaylukCustomer,
  paylukRequest,
} from "@/lib/payluk";

type PaylukEscrow = {
  id?: string;
  amount?: number;
  purpose?: string;
  paymentToken?: string;
  status?: string;
  state?: string;
  paidAt?: string | number | null;
  paymentDetails?: {
    status?: string;
    reference?: string;
  } | null;
};

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
      `${label} phone number is required for Payluk.`
    );
  }

  const digits = raw.replace(/\D/g, "");

  if (
    digits.length < 10 ||
    digits.length > 15
  ) {
    throw new Error(
      `The ${label.toLowerCase()} phone number is invalid. Update the profile and try again.`
    );
  }

  return digits;
}

function getInspectionDays(): number {
  const configuredValue =
    process.env.PAYLUK_INSPECTION_DAYS?.trim();

  const days = configuredValue
    ? Number(configuredValue)
    : 7;

  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 365
  ) {
    throw new Error(
      "PAYLUK_INSPECTION_DAYS must be a whole number between 1 and 365."
    );
  }

  return days;
}

function getWhoPaysFees(): "buyer" | "seller" | "both" {
  const value = (
    process.env.PAYLUK_WHO_PAYS_FEES?.trim() ||
    "both"
  ).toLowerCase();

  if (
    value !== "buyer" &&
    value !== "seller" &&
    value !== "both"
  ) {
    throw new Error(
      "PAYLUK_WHO_PAYS_FEES must be buyer, seller, or both."
    );
  }

  return value;
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
    typeof propertyId !== "string" ||
    !propertyId.trim()
  ) {
    throw new Error("A valid property is required.");
  }

  const normalizedStudentEmail =
    session.user.email.trim().toLowerCase();

  /*
   * Find the student's Firestore account.
   */
  const studentSnapshot = await adminDb
    .collection("users")
    .where("email", "==", normalizedStudentEmail)
    .limit(1)
    .get();

  if (studentSnapshot.empty) {
    throw new Error("Student account not found.");
  }

  const studentDocument = studentSnapshot.docs[0];
  const studentData = studentDocument.data();

  /*
   * Find the selected accommodation.
   */
  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId.trim());

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
    rentAmount < 1000
  ) {
    throw new Error(
      "The accommodation rent must be at least ₦1,000 to create a Payluk escrow."
    );
  }

  if (
    property.agentEmail &&
    String(property.agentEmail)
      .trim()
      .toLowerCase() === normalizedStudentEmail
  ) {
    throw new Error(
      "You cannot book your own accommodation listing."
    );
  }

  /*
   * Inspection and escrow configuration.
   */
  const inspectionDays = getInspectionDays();
  const whoPays = getWhoPaysFees();

  /*
   * Find the accommodation provider.
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
        property.agentEmail.trim().toLowerCase()
      )
      .limit(1)
      .get();

    if (!agentQuery.empty) {
      agentSnapshot = agentQuery.docs[0];
    }
  }

  if (!agentSnapshot?.exists) {
    throw new Error(
      "The accommodation provider's account could not be found. Please contact support."
    );
  }

  const agentData = agentSnapshot.data();

  if (!agentData) {
    throw new Error(
      "The accommodation provider's profile could not be loaded."
    );
  }

  if (agentData.role !== "agent") {
    throw new Error(
      "The property owner does not have a valid agent account."
    );
  }

  /*
   * Prepare buyer and seller information.
   */
  const studentEmail = String(
    studentData.email || normalizedStudentEmail
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
      "The student or accommodation provider's email address is missing."
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
    "Accommodation provider"
  );

  /*
   * Find or register the student as a Payluk buyer.
   *
   * Buyer permissions:
   * canBuy = true
   * canSell = false
   */
  const buyerCustomerId = await ensurePaylukCustomer({
    email: studentEmail,
    name: studentName,
    phone: studentPhone,
    existingCustomerId:
      typeof studentData.paylukCustomerId === "string"
        ? studentData.paylukCustomerId
        : null,
    permissions: {
      canBuy: true,
      canSell: false,
    },
  });

  /*
   * Find or register the accommodation provider as
   * a Payluk seller.
   *
   * Seller permissions:
   * canBuy = false
   * canSell = true
   */
  const sellerCustomerId = await ensurePaylukCustomer({
    email: agentEmail,
    name: agentName,
    phone: agentPhone,
    existingCustomerId:
      typeof agentData.paylukCustomerId === "string"
        ? agentData.paylukCustomerId
        : null,
    permissions: {
      canBuy: false,
      canSell: true,
    },
  });

  /*
   * Save Payluk customer IDs to Firestore.
   */
  await Promise.all([
    studentDocument.ref.update({
      paylukCustomerId: buyerCustomerId,
      updatedAt: FieldValue.serverTimestamp(),
    }),

    agentSnapshot.ref.update({
      paylukCustomerId: sellerCustomerId,
      updatedAt: FieldValue.serverTimestamp(),
    }),
  ]);

  /*
   * Reserve a booking reference before creating escrow.
   */
  const bookingRef = adminDb
    .collection("bookings")
    .doc();

  const propertyName = String(
    property.name || "Student Accommodation"
  ).trim();

  const propertyLocation = String(
    property.location || ""
  ).trim();

  const propertyAddress = String(
    property.address || ""
  ).trim();

  /*
   * Create Payluk escrow.
   *
   * Payluk requires multipart/form-data.
   * The seller is identified using customer-id.
   */
  const escrowForm = new FormData();

  escrowForm.append(
    "amount",
    rentAmount.toFixed(2)
  );

  escrowForm.append(
    "purpose",
    `NSUK Nest Rental: ${propertyName}`.slice(0, 120)
  );

  escrowForm.append(
    "description",
    [
      `Accommodation rental for ${propertyName}.`,
      `NSUK Nest booking reference: ${bookingRef.id}.`,
      `Location: ${propertyLocation}.`,
      `Inspection period: ${inspectionDays} days.`,
      "Subject to the agreed rental and escrow terms.",
    ].join(" ")
  );

  escrowForm.append("whoPays", whoPays);
  escrowForm.append(
    "maxDelivery",
    String(inspectionDays)
  );
  escrowForm.append("deliveryTimeline", "days");
  escrowForm.append("totalQuantity", "1");

  /*
   * Create the escrow on behalf of the seller.
   */
  const escrow = await paylukRequest<PaylukEscrow>(
    "/v1/escrow/create",
    {
      method: "POST",
      headers: {
        "customer-id": sellerCustomerId,
      },
      body: escrowForm,
    }
  );

  const escrowId = String(
    escrow?.id || ""
  ).trim();

  const paymentToken = String(
    escrow?.paymentToken || ""
  ).trim();

  if (!escrowId || !paymentToken) {
    throw new Error(
      "Payluk did not return the required escrow ID and payment token. Check your Payluk dashboard before attempting another booking."
    );
  }

  /*
   * Save the booking.
   *
   * Creating an escrow does not mean the student
   * has paid. The booking remains pending.
   */
  await bookingRef.set({
    studentId: studentDocument.id,
    studentEmail,
    studentName,

    propertyId: propertySnapshot.id,
    propertyName,
    propertyLocation,
    propertyAddress,

    agentId: agentSnapshot.id,
    agentName,
    agentEmail,

    rentAmount,

    paymentProvider: "payluk",

    paylukEscrowId: escrowId,
    paylukPaymentToken: paymentToken,

    paylukBuyerCustomerId: buyerCustomerId,
    paylukSellerCustomerId: sellerCustomerId,

    paylukStatus: String(
      escrow.status || "PENDING"
    ).toUpperCase(),

    paylukState: String(
      escrow.state || "AWAITING_PAYMENT"
    ).toUpperCase(),

    paylukTransactionReference:
      escrow.paymentDetails?.reference || null,

    inspectionPeriodDays: inspectionDays,
    disputeWindowDays: inspectionDays,

    paymentStatus: "pending",
    status: "pending_payment",
    bookingStatus: "pending",
    inspectionStatus: "pending",

    contactUnlocked: false,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  /*
   * Return the booking reference.
   *
   * The payment page will use the saved Payluk
   * payment token to launch the checkout SDK.
   */
  return {
    success: true,
    bookingId: bookingRef.id,
    paymentProvider: "payluk",
    paymentToken,
  };
}
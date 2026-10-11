
"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import {
  ensurePaylukCustomer,
  paylukRequest,
} from "@/lib/payluk";

type PaylukEscrowResponse = {
  id?: string;
  paymentToken?: string;
  amount?: number;
  fee?: number;
  status?: string;
  state?: string;
};

export async function createBooking(propertyId: string) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  if (session.user.role !== "student") {
    throw new Error("Only students can create bookings.");
  }

  if (!propertyId || typeof propertyId !== "string") {
    throw new Error("A valid property is required.");
  }

  // Find the student's Firestore account.
  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    throw new Error("Student account not found.");
  }

  const student = userSnapshot.docs[0];
  const studentData = student.data();

  // Find the selected property.
  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId);

  const propertySnapshot = await propertyRef.get();

  if (!propertySnapshot.exists) {
    throw new Error("Property not found.");
  }

  const property = propertySnapshot.data();

  if (!property || property.status !== "approved") {
    throw new Error("This property is not available.");
  }

  const rentAmount = Number(property.price);

  if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
    throw new Error("This property's rent amount is invalid.");
  }

  if (
    property.agentEmail &&
    String(property.agentEmail).toLowerCase() ===
      session.user.email.toLowerCase()
  ) {
    throw new Error(
      "You cannot book your own accommodation listing."
    );
  }

  const config = {
    whoPays: process.env.PAYLUK_WHO_PAYS?.trim() || "both",
    deliveryDays: Number(
      process.env.PAYLUK_DELIVERY_DAYS || "7"
    ),
  };

  if (
    !Number.isInteger(config.deliveryDays) ||
    config.deliveryDays < 1
  ) {
    throw new Error("The Payluk delivery timeline is invalid.");
  }

  /*
   * Find the property's owner in Firestore.
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
      .doc(property.agentId)
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
      .where("email", "==", property.agentEmail.trim())
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

  /*
   * Ensure the student exists as a Payluk buyer.
   * The student's profile phone number is required when
   * Payluk needs to create a new customer.
   */
  const studentPaylukCustomerId =
    await ensurePaylukCustomer({
      email: studentEmail,
      name: String(
        studentData.name || session.user.name || ""
      ),
      phone: String(studentData.phone || ""),
      existingCustomerId: studentData.paylukCustomerId || null,
      countryId: "NG",
      permissions: {
        canBuy: true,
        canSell: false,
      },
    });

  // Persist the student's Payluk customer ID.
  if (
    studentData.paylukCustomerId !==
    studentPaylukCustomerId
  ) {
    await student.ref.update({
      paylukCustomerId: studentPaylukCustomerId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /*
   * Ensure the property's agent exists as a Payluk seller.
   * This allows the escrow to be associated with the actual
   * accommodation provider instead of the merchant itself.
   */
  const agentPaylukCustomerId =
    await ensurePaylukCustomer({
      email: agentEmail,
      name: String(
        agentData.name || property.agentName || ""
      ),
      phone: String(agentData.phone || ""),
      existingCustomerId: agentData.paylukCustomerId || null,
      countryId: "NG",
      permissions: {
        canBuy: false,
        canSell: true,
      },
    });

  // Persist the agent's Payluk customer ID.
  if (
    agentData.paylukCustomerId !==
    agentPaylukCustomerId
  ) {
    await agent.ref.update({
      paylukCustomerId: agentPaylukCustomerId,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /*
   * Reserve a Firestore booking ID before creating the escrow.
   */
  const bookingRef = adminDb.collection("bookings").doc();

  /*
   * Payluk's documented escrow creation endpoint accepts form data.
   *
   * The student is the buyer initiating this accommodation
   * transaction, so the request uses the student's customer ID.
   */
  const formData = new FormData();

  formData.set("amount", String(rentAmount));
  formData.set(
    "purpose",
    `NSUK Nest accommodation: ${String(
      property.name || "Property"
    )}`
  );
  formData.set("whoPays", config.whoPays);
  formData.set("maxDelivery", String(config.deliveryDays));
  formData.set("deliveryTimeline", "days");

  const escrow = await paylukRequest<PaylukEscrowResponse>(
    "/v1/escrow/create",
    {
      method: "POST",
      headers: {
        "customer-id": studentPaylukCustomerId,
      },
      body: formData,
    }
  );

  if (!escrow?.paymentToken) {
    throw new Error(
      "Payluk did not return a payment token. Please try again."
    );
  }

  /*
   * Save the booking and payment references.
   * The booking remains pending until server-side payment
   * verification confirms the transaction.
   */
  await bookingRef.set({
    studentId: student.id,
    studentEmail,
    studentName:
      studentData.name ||
      session.user.name ||
      "",

    studentPaylukCustomerId,

    propertyId: propertySnapshot.id,
    propertyName: property.name || "",
    propertyLocation: property.location || "",
    propertyAddress: property.address || "",

    agentId: agent.id,
    agentName:
      agentData.name ||
      property.agentName ||
      "",
    agentEmail,
    agentPaylukCustomerId,

    rentAmount,

    paylukPaymentToken: escrow.paymentToken,
    paylukEscrowId: escrow.id || null,
    paylukStatus: escrow.status || "PENDING",
    paylukState: escrow.state || "AWAITING_PAYMENT",

    paymentStatus: "pending",
    bookingStatus: "pending",
    inspectionStatus: "pending",
    contactUnlocked: false,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    bookingId: bookingRef.id,
  };
}


"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { paylukRequest } from "@/lib/payluk";

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

  // Find the student account.
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

  // Find the property.
  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId);

  const propertySnapshot = await propertyRef.get();

  if (!propertySnapshot.exists) {
    throw new Error("Property not found.");
  }

  const property = propertySnapshot.data();

  if (property?.status !== "approved") {
    throw new Error("This property is not available.");
  }

  const rentAmount = Number(property.price);

  if (!Number.isFinite(rentAmount) || rentAmount <= 0) {
    throw new Error("This property's rent amount is invalid.");
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

  // Reserve a Firestore booking ID before creating the escrow.
  const bookingRef = adminDb.collection("bookings").doc();

  // Payluk's documented create endpoint accepts form data.
  const formData = new FormData();

  formData.set("amount", String(rentAmount));
  formData.set(
    "purpose",
    `NSUK Nest accommodation: ${String(property.name || "Property")}`
  );
  formData.set("whoPays", config.whoPays);
  formData.set("maxDelivery", String(config.deliveryDays));
  formData.set("deliveryTimeline", "days");

  // Create the escrow using the server-side Payluk secret key.
  const escrow = await paylukRequest<PaylukEscrowResponse>(
    "/v1/escrow/create",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!escrow?.paymentToken) {
    throw new Error(
      "Payluk did not return a payment token. Please try again."
    );
  }

  // Save the booking and Payluk references together.
  await bookingRef.set({
    studentId: student.id,
    studentEmail: session.user.email,

    studentName:
      studentData.name ||
      session.user.name ||
      "",

    propertyId: propertySnapshot.id,
    propertyName: property.name || "",
    propertyLocation: property.location || "",
    propertyAddress: property.address || "",

    agentId: property.agentId || "",
    agentName: property.agentName || "",
    agentEmail: property.agentEmail || "",

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
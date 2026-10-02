"use server"

import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function createBooking(propertyId: string) {
  const session = await auth()

  if (!session?.user?.email) {
    throw new Error("You must be logged in")
  }

  if (session.user.role !== "student") {
    throw new Error("Only students can create bookings")
  }

  // Get the student
  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get()

  if (userSnapshot.empty) {
    throw new Error("Student account not found")
  }

  const student = userSnapshot.docs[0]
  const studentData = student.data()

  // Get the property
  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId)

  const propertySnapshot = await propertyRef.get()

  if (!propertySnapshot.exists) {
    throw new Error("Property not found")
  }

  const property = propertySnapshot.data()

  if (property?.status !== "approved") {
    throw new Error("This property is not available")
  }

  // Create booking
  const bookingRef = await adminDb.collection("bookings").add({
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

    rentAmount: Number(property.price || 0),

    paymentStatus: "pending",
    bookingStatus: "pending",
    inspectionStatus: "pending",

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return {
    success: true,
    bookingId: bookingRef.id,
  }
}
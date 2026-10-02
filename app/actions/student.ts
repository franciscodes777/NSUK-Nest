"use server"

import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function toggleSavedProperty(propertyId: string) {
  const session = await auth()

  if (!session?.user?.email) {
    return {
      error: "You must be logged in.",
    }
  }

  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId)

  const propertySnapshot = await propertyRef.get()

  if (!propertySnapshot.exists) {
    return {
      error: "Property not found.",
    }
  }

  const property = propertySnapshot.data()

  if (property?.status !== "approved") {
    return {
      error: "This property is not available.",
    }
  }

  const usersSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get()

  if (usersSnapshot.empty) {
    return {
      error: "Student account not found.",
    }
  }

  const userRef = usersSnapshot.docs[0].ref
  const userData = usersSnapshot.docs[0].data()

  const savedProperties = Array.isArray(userData.savedProperties)
    ? userData.savedProperties
    : []

  const alreadySaved = savedProperties.includes(propertyId)

  if (alreadySaved) {
    await userRef.update({
      savedProperties: FieldValue.arrayRemove(propertyId),
    })

    return {
      saved: false,
    }
  }

  await userRef.update({
    savedProperties: FieldValue.arrayUnion(propertyId),
  })

  return {
    saved: true,
  }
}
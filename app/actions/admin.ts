"use server"

import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { revalidatePath } from "next/cache"

type PropertyStatus = "approved" | "rejected"

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus
) {
  const session = await auth()

  if (!session?.user?.email) {
    throw new Error("Unauthorized")
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Forbidden")
  }

  if (status !== "approved" && status !== "rejected") {
    throw new Error("Invalid status")
  }

  const propertyRef = adminDb
    .collection("properties")
    .doc(propertyId)

  const propertySnapshot = await propertyRef.get()

  if (!propertySnapshot.exists) {
    throw new Error("Property not found")
  }

  await propertyRef.update({
    status,
    updatedAt: new Date(),
  })

  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/admin/properties")
  revalidatePath("/accommodation")
}
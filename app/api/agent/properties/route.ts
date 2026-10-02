import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const snapshot = await adminDb
      .collection("properties")
      .where("agentEmail", "==", session.user.email)
      .get();

    const properties = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching agent properties:", error);

    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
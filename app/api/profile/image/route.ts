import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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

    const userSnapshot = await adminDb
      .collection("users")
      .where("email", "==", session.user.email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    const userData = userSnapshot.docs[0].data();

    return NextResponse.json({
      name:
        typeof userData.name === "string"
          ? userData.name
          : "",
      email:
        typeof userData.email === "string"
          ? userData.email
          : session.user.email,
      image:
        typeof userData.image === "string"
          ? userData.image
          : "",
    });
  } catch (error) {
    console.error("Profile API GET error:", error);

    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const userSnapshot = await adminDb
      .collection("users")
      .where("email", "==", session.user.email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    const userRef = userSnapshot.docs[0].ref;

    if (image) {
      await userRef.update({
        image,
        updatedAt: new Date(),
      });
    } else {
      await userRef.update({
        image: FieldValue.delete(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error("Profile API POST error:", error);

    return NextResponse.json(
      { error: "Failed to update profile photo." },
      { status: 500 }
    );
  }
}
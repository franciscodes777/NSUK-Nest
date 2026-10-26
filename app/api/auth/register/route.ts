
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "");

    if (!name || !email || !password || !role) {
      return NextResponse.redirect(
        new URL("/auth?error=missing-fields", request.url),
        303
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.redirect(
        new URL("/auth?error=invalid-email", request.url),
        303
      );
    }

    if (password.length < 8) {
      return NextResponse.redirect(
        new URL("/auth?error=weak-password", request.url),
        303
      );
    }

    if (password.length > 72) {
      return NextResponse.redirect(
        new URL("/auth?error=password-too-long", request.url),
        303
      );
    }

    if (role !== "student" && role !== "agent") {
      return NextResponse.redirect(
        new URL("/auth?error=invalid-role", request.url),
        303
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

    if (adminEmail && email === adminEmail) {
      return NextResponse.redirect(
        new URL("/auth?error=registration-unavailable", request.url),
        303
      );
    }

    const usersRef = adminDb.collection("users");

    const existingUser = await usersRef
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.redirect(
        new URL("/auth?error=email-exists", request.url),
        303
      );
    }

    const passwordHash = await hash(password, 12);

    const userRef = usersRef.doc();

    await userRef.create({
      name,
      email,
      image: "",
      role,
      passwordHash,
      authProvider: "credentials",
      createdAt: new Date(),
    });

    return NextResponse.redirect(
      new URL("/login?registered=1", request.url),
      303
    );
  } catch (error) {
    console.error("Email registration failed:", error);

    return NextResponse.redirect(
      new URL("/auth?error=registration-failed", request.url),
      303
    );
  }
}


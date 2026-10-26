
"use server";

import { cookies } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

async function saveSignupRole(role: FormDataEntryValue | null) {
  if (role !== "student" && role !== "agent") {
    throw new Error("Invalid role");
  }

  const cookieStore = await cookies();

  cookieStore.set("nsuk_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  cookieStore.set("nsuk_auth_action", "signup", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

async function saveLoginAction() {
  const cookieStore = await cookies();

  cookieStore.delete("nsuk_role");

  cookieStore.set("nsuk_auth_action", "login", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function signInWithGoogle(formData: FormData) {
  await saveSignupRole(formData.get("role"));

  await signIn("google", {
    redirectTo: "/dashboard",
  });
}

export async function signInWithGitHub(formData: FormData) {
  await saveSignupRole(formData.get("role"));

  await signIn("github", {
    redirectTo: "/dashboard",
  });
}

export async function loginWithGoogle() {
  await saveLoginAction();

  await signIn("google", {
    redirectTo: "/dashboard",
  });
}

export async function loginWithGitHub() {
  await saveLoginAction();

  await signIn("github", {
    redirectTo: "/dashboard",
  });
}

export async function loginWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  await saveLoginAction();

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=invalid-credentials");
    }

    // Next.js redirect() throws internally. Re-throw it so
    // a successful login can complete its redirect.
    throw error;
  }
}


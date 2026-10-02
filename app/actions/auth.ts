"use server"

import { cookies } from "next/headers"
import { signIn } from "@/auth"

async function saveSignupRole(role: FormDataEntryValue | null) {
  if (role !== "student" && role !== "agent") {
    throw new Error("Invalid role")
  }

  const cookieStore = await cookies()

  cookieStore.set("nsuk_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })

  cookieStore.set("nsuk_auth_action", "signup", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
}

async function saveLoginAction() {
  const cookieStore = await cookies()

  // A login should never use an old signup role.
  cookieStore.delete("nsuk_role")

  cookieStore.set("nsuk_auth_action", "login", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  })
}

export async function signInWithGoogle(formData: FormData) {
  await saveSignupRole(formData.get("role"))

  await signIn("google", {
    redirectTo: "/dashboard",
  })
}

export async function signInWithGitHub(formData: FormData) {
  await saveSignupRole(formData.get("role"))

  await signIn("github", {
    redirectTo: "/dashboard",
  })
}

export async function loginWithGoogle() {
  await saveLoginAction()

  await signIn("google", {
    redirectTo: "/dashboard",
  })
}

export async function loginWithGitHub() {
  await saveLoginAction()

  await signIn("github", {
    redirectTo: "/dashboard",
  })
}
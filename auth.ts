import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { cookies } from "next/headers"
import { adminDb } from "@/lib/firebaseAdmin"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,

      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false
      }

      const email = user.email.toLowerCase()
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()

      // ----------------------------------
      // PRIVATE ADMIN ACCOUNT
      // ----------------------------------
      if (adminEmail && email === adminEmail) {
        return true
      }

      if (!user.id) {
        return false
      }

      const usersRef = adminDb.collection("users")

      const userSnapshot = await usersRef
        .where("email", "==", user.email)
        .limit(1)
        .get()

      // ----------------------------------
      // EXISTING STUDENT / AGENT ACCOUNT
      // ----------------------------------
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data()

        if (
          userData.role !== "student" &&
          userData.role !== "agent"
        ) {
          return "/auth?error=account-incomplete"
        }

        return true
      }

      // ----------------------------------
      // NEW USER
      // ----------------------------------
      const cookieStore = await cookies()
      const action = cookieStore.get("nsuk_auth_action")?.value

      // New user trying to LOG IN without signing up.
      if (action !== "signup") {
        return "/auth?error=no-account"
      }

      // ----------------------------------
      // NEW SIGNUP
      // ----------------------------------
      const selectedRole = cookieStore.get("nsuk_role")?.value

      const role =
        selectedRole === "agent"
          ? "agent"
          : selectedRole === "student"
            ? "student"
            : null

      if (!role) {
        return "/auth?error=no-role"
      }

      await usersRef.doc(user.id).set({
        name: user.name || "",
        email: user.email,
        image: user.image || "",
        role,
        createdAt: new Date(),
      })

      return true
    },

    // ----------------------------------
    // JWT
    // ----------------------------------
    async jwt({ token }) {
      if (!token.email) {
        return token
      }

      const email = token.email.toLowerCase()
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()

      // ----------------------------------
      // PRIVATE ADMIN ACCOUNT
      // ----------------------------------
      if (adminEmail && email === adminEmail) {
        token.role = "admin"
        return token
      }

      // ----------------------------------
      // STUDENT / AGENT ACCOUNT
      // ----------------------------------
      const userSnapshot = await adminDb
        .collection("users")
        .where("email", "==", token.email)
        .limit(1)
        .get()

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data()

        // Keep the role synced from Firestore.
        if (
          userData.role === "agent" ||
          userData.role === "student"
        ) {
          token.role = userData.role
        }

        // Keep the account name synced from Firestore.
        if (typeof userData.name === "string") {
          token.name = userData.name
        }

        // Keep the profile image synced from Firestore.
        if (typeof userData.image === "string") {
          token.picture = userData.image
        }
      }

      return token
    },

    // ----------------------------------
    // SESSION
    // ----------------------------------
    async session({ session, token }) {
      return {
        ...session,

        user: {
          ...session.user,

          name:
            typeof token.name === "string"
              ? token.name
              : session.user.name,

          image:
            typeof token.picture === "string"
              ? token.picture
              : session.user.image,

          role:
            token.role === "admin" ||
            token.role === "agent" ||
            token.role === "student"
              ? token.role
              : undefined,
        },
      }
    },
  },
})
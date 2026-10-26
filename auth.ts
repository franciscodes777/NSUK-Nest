
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { adminDb } from "@/lib/firebaseAdmin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

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

    Credentials({
      id: "credentials",
      name: "Email and Password",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        try {
          const adminEmail =
            process.env.ADMIN_EMAIL?.trim().toLowerCase();

          // The private admin account continues to use its
          // existing Google/GitHub authentication.
          if (adminEmail && email === adminEmail) {
            return null;
          }

          const userSnapshot = await adminDb
            .collection("users")
            .where("email", "==", email)
            .limit(1)
            .get();

          if (userSnapshot.empty) {
            return null;
          }

          const userDoc = userSnapshot.docs[0];
          const userData = userDoc.data();

          if (
            userData.role !== "student" &&
            userData.role !== "agent"
          ) {
            return null;
          }

          if (
            typeof userData.passwordHash !== "string" ||
            !userData.passwordHash
          ) {
            return null;
          }

          const passwordMatches = await compare(
            password,
            userData.passwordHash
          );

          if (!passwordMatches) {
            return null;
          }

          return {
            id: userDoc.id,
            name:
              typeof userData.name === "string"
                ? userData.name
                : "",
            email,
            image:
              typeof userData.image === "string"
                ? userData.image
                : null,
          };
        } catch (error) {
          console.error("Email authentication failed:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      const email = user.email.trim().toLowerCase();
      const adminEmail =
        process.env.ADMIN_EMAIL?.trim().toLowerCase();

      // Private admin account.
      if (adminEmail && email === adminEmail) {
        return account?.provider !== "credentials";
      }

      // Email/password users have already been verified by
      // the Credentials provider.
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user.id) {
        return false;
      }

      const usersRef = adminDb.collection("users");

      const userSnapshot = await usersRef
        .where("email", "==", email)
        .limit(1)
        .get();

      // Existing student or agent account.
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        if (
          userData.role !== "student" &&
          userData.role !== "agent"
        ) {
          return "/auth?error=account-incomplete";
        }

        return true;
      }

      // A new social account must explicitly come from sign-up.
      const cookieStore = await cookies();
      const action = cookieStore.get("nsuk_auth_action")?.value;

      if (action !== "signup") {
        return "/auth?error=no-account";
      }

      const selectedRole = cookieStore.get("nsuk_role")?.value;

      const role =
        selectedRole === "agent"
          ? "agent"
          : selectedRole === "student"
            ? "student"
            : null;

      if (!role) {
        return "/auth?error=no-role";
      }

      // Use a new document only when no account exists for
      // this email address.
      await usersRef.doc(user.id).set(
        {
          name: user.name || "",
          email,
          image: user.image || "",
          role,
          createdAt: new Date(),
        },
        { merge: true }
      );

      return true;
    },

    async jwt({ token, user, account }) {
      if (user && account?.provider === "credentials") {
        token.sub = user.id;
      }

      if (!token.email) {
        return token;
      }

      const email = token.email.trim().toLowerCase();
      const adminEmail =
        process.env.ADMIN_EMAIL?.trim().toLowerCase();

      // Private admin account.
      if (adminEmail && email === adminEmail) {
        token.role = "admin";
        return token;
      }

      // Retrieve the current role and profile from Firestore.
      const userSnapshot = await adminDb
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();

        if (
          userData.role === "agent" ||
          userData.role === "student"
        ) {
          token.role = userData.role;
        }

        if (typeof userData.name === "string") {
          token.name = userData.name;
        }

        if (typeof userData.image === "string") {
          token.picture = userData.image;
        }
      }

      return token;
    },

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
      };
    },
  },
});


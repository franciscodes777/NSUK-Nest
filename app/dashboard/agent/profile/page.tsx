import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import {
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaHome,
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcryptjs";

async function updateAgentProfile(formData: FormData): Promise<void> {
  "use server";

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard");
  }

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const businessName = String(
    formData.get("businessName") || ""
  ).trim();
  const bio = String(formData.get("bio") || "").trim();

  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    throw new Error("User profile not found.");
  }

  await userSnapshot.docs[0].ref.update({
    name,
    phone,
    businessName,
    bio,
    updatedAt: new Date(),
  });

  revalidatePath("/dashboard/agent/profile");
  revalidatePath("/dashboard/agent");
}

async function setAgentPassword(formData: FormData): Promise<void> {
  "use server";

  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard");
  }

  const currentPassword = String(
    formData.get("currentPassword") || ""
  );

  const newPassword = String(
    formData.get("newPassword") || ""
  );

  const confirmPassword = String(
    formData.get("confirmPassword") || ""
  );

  const profilePath = "/dashboard/agent/profile";

  if (!newPassword || !confirmPassword) {
    redirect(`${profilePath}?password=missing-fields`);
  }

  if (newPassword.length < 8) {
    redirect(`${profilePath}?password=weak`);
  }

  if (newPassword.length > 72) {
    redirect(`${profilePath}?password=too-long`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`${profilePath}?password=mismatch`);
  }

  const email = session.user.email.trim().toLowerCase();

  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    redirect("/auth?error=account-incomplete");
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();

  if (userData.role !== "agent") {
    redirect("/dashboard");
  }

  const existingPasswordHash = userData.passwordHash;

  // Existing password holders must verify their current password.
  // Google-only accounts can create their first password directly.
  if (
    typeof existingPasswordHash === "string" &&
    existingPasswordHash.length > 0
  ) {
    if (!currentPassword) {
      redirect(`${profilePath}?password=current-required`);
    }

    const currentPasswordMatches = await compare(
      currentPassword,
      existingPasswordHash
    );

    if (!currentPasswordMatches) {
      redirect(`${profilePath}?password=current-incorrect`);
    }

    if (currentPassword === newPassword) {
      redirect(`${profilePath}?password=same-password`);
    }
  }

  const passwordHash = await hash(newPassword, 12);

  await userDoc.ref.update({
    passwordHash,
    authProvider: "credentials",
    passwordUpdatedAt: new Date(),
  });

  revalidatePath("/dashboard/agent/profile");
  revalidatePath("/dashboard/agent");

  redirect(`${profilePath}?password=updated`);
}

type AgentProfilePageProps = {
  searchParams: Promise<{
    password?: string;
  }>;
};

export default async function AgentProfilePage({
  searchParams,
}: AgentProfilePageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard");
  }

  const { password: passwordStatus } = await searchParams;

  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    redirect("/auth");
  }

  const userData = userSnapshot.docs[0].data();

  const profileName =
    typeof userData.name === "string"
      ? userData.name
      : session.user.name || "";

  const profileEmail =
    typeof userData.email === "string"
      ? userData.email
      : session.user.email;

  const profileImage =
    typeof userData.image === "string"
      ? userData.image
      : "";

  const phone =
    typeof userData.phone === "string"
      ? userData.phone
      : "";

  const businessName =
    typeof userData.businessName === "string"
      ? userData.businessName
      : "";

  const bio =
    typeof userData.bio === "string"
      ? userData.bio
      : "";

  const hasPassword =
    typeof userData.passwordHash === "string" &&
    userData.passwordHash.length > 0;

  let joinedDate = "";

  if (userData.createdAt) {
    const createdAt =
      typeof userData.createdAt.toDate === "function"
        ? userData.createdAt.toDate()
        : new Date(userData.createdAt);

    if (!Number.isNaN(createdAt.getTime())) {
      joinedDate = createdAt.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  const propertiesSnapshot = await adminDb
    .collection("properties")
    .where("agentEmail", "==", session.user.email)
    .get();

  const totalProperties = propertiesSnapshot.size;

  const approvedProperties = propertiesSnapshot.docs.filter(
    (doc) => doc.data().status === "approved"
  ).length;

  const pendingProperties = propertiesSnapshot.docs.filter(
    (doc) => doc.data().status === "pending"
  ).length;

  const passwordMessages: Record<
    string,
    { type: "success" | "error"; message: string }
  > = {
    updated: {
      type: "success",
      message:
        "Your password has been saved. You can now sign in using your email and password.",
    },
    "missing-fields": {
      type: "error",
      message: "Enter your new password and confirm it.",
    },
    weak: {
      type: "error",
      message: "Your password must contain at least 8 characters.",
    },
    "too-long": {
      type: "error",
      message:
        "Your password must not exceed 72 characters. Please choose a shorter password.",
    },
    mismatch: {
      type: "error",
      message: "Your new password and confirmation do not match.",
    },
    "current-required": {
      type: "error",
      message: "Enter your current password before changing it.",
    },
    "current-incorrect": {
      type: "error",
      message:
        "Your current password is incorrect. Your password has not been changed.",
    },
    "same-password": {
      type: "error",
      message:
        "Choose a new password different from your current password.",
    },
  };

  const passwordMessage = passwordStatus
    ? passwordMessages[passwordStatus]
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Agent Profile
            </h1>

            <p className="text-sm text-gray-500">
              Manage your account and profile information
            </p>
          </div>

          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
        <div className="mb-6">
          <a
            href="/dashboard/agent"
            className="flex items-center gap-2 text-sm font-semibold text-[#075e3b] hover:underline"
          >
            <FaArrowLeft />
            Back to Dashboard
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Photo
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your profile picture
                </p>
              </div>

              <ProfileImageUpload
                currentImage={profileImage}
                name={profileName}
              />
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Keep your account information up to date
                </p>
              </div>

              <form action={updateAgentProfile} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      defaultValue={profileName}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={profileEmail}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      defaultValue={phone}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="businessName"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Business / Agency Name
                    </label>

                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      defaultValue={businessName}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                      placeholder="Enter business or agency name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    About You
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows={5}
                    defaultValue={bio}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                    placeholder="Tell students a little about yourself or your agency..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-[#075e3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </section>

            <section
              id="password-security"
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-xl text-[#075e3b]">
                  <FaLock />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Password &amp; Security
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {hasPassword
                      ? "Change the password associated with your account."
                      : "Create a password so you can also sign in using your email address."}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                <FaShieldAlt className="mt-0.5 shrink-0 text-[#075e3b]" />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {hasPassword
                      ? "Password enabled"
                      : "Google account connected"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {hasPassword
                      ? "You can continue using Google or sign in with your email and password."
                      : "Creating a password will not disconnect Google or create another account."}
                  </p>
                </div>
              </div>

              {passwordMessage && (
                <div
                  role="status"
                  className={`mb-5 rounded-lg border p-4 text-sm ${
                    passwordMessage.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {passwordMessage.message}
                </div>
              )}

              <form action={setAgentPassword} className="space-y-5">
                {hasPassword && (
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>

                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                      placeholder="Enter your current password"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    {hasPassword ? "New Password" : "Create Password"}
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                    placeholder="At least 8 characters"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Use at least 8 characters and avoid reusing a password from another account.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                    placeholder="Enter the new password again"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-[#075e3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                  >
                    {hasPassword
                      ? "Update Password"
                      : "Create Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Account Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                    <FaBuilding />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Account Type
                    </p>

                    <p className="text-sm font-medium text-gray-900">
                      Agent / Owner
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                    <FaHome />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Total Properties
                    </p>

                    <p className="text-sm font-medium text-gray-900">
                      {totalProperties}
                    </p>
                  </div>
                </div>

                {joinedDate && (
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs text-gray-500">
                      Date Joined
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {joinedDate}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">
                Property Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                      <FaHome />
                    </div>

                    <span className="text-sm text-gray-600">
                      Total
                    </span>
                  </div>

                  <span className="font-semibold text-gray-900">
                    {totalProperties}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                      <FaCheckCircle />
                    </div>

                    <span className="text-sm text-gray-600">
                      Approved
                    </span>
                  </div>

                  <span className="font-semibold text-gray-900">
                    {approvedProperties}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                      <FaClock />
                    </div>

                    <span className="text-sm text-gray-600">
                      Pending
                    </span>
                  </div>

                  <span className="font-semibold text-gray-900">
                    {pendingProperties}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
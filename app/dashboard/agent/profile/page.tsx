import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { FaBuilding, FaCheckCircle, FaClock, FaHome } from "react-icons/fa";
import { revalidatePath } from "next/cache";

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

export default async function AgentProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard");
  }

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
            className="text-sm font-medium text-[#075e3b] hover:underline"
          >
            ← Back to Dashboard
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
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
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
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
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
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
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
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
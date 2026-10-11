import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import UserMenu from "@/components/UserMenu";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBuilding,
  FaCalendarAlt,
  FaUserShield,
  FaInfoCircle,
  FaIdBadge,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

type UserProfile = {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  phone?: string;
  school?: string;
  department?: string;
  level?: string;
  bio?: string;
  createdAt?: {
    toDate?: () => Date;
  } | string | Date;
};

function formatDate(value: UserProfile["createdAt"]) {
  if (!value) return "Not available";

  try {
    let date: Date;

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate();
    } else {
      date = new Date(value as string | Date);
    }

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Not available";
  }
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "student":
      return "Student";
    case "agent":
    case "agent-owner":
      return "Agent";
    case "admin":
      return "Administrator";
    default:
      return role || "Unassigned";
  }
}

function getRoleStyle(role?: string) {
  switch (role) {
    case "student":
      return "bg-blue-50 text-blue-700";
    case "agent":
    case "agent-owner":
      return "bg-purple-50 text-purple-700";
    case "admin":
      return "bg-green-50 text-green-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value?.trim() || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const userDoc = await adminDb.collection("users").doc(id).get();

  if (!userDoc.exists) {
    notFound();
  }

  const user = userDoc.data() as UserProfile;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin/users"
              aria-label="Back to users"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            >
              <FaArrowLeft />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#075e3b]">
                Administrator
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                User Profile
              </h1>
            </div>
          </div>

          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/admin/users"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#075e3b] transition hover:underline"
        >
          <FaArrowLeft className="text-xs" />
          Back to All Users
        </Link>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Green banner */}
          <div className="h-32 bg-gradient-to-r from-[#075e3b] to-emerald-700" />

          {/* Profile header: completely below the green banner */}
          <div className="px-6 pb-8 pt-6 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User profile"}
                    className="h-24 w-24 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-3xl font-bold text-[#075e3b] shadow-sm">
                    {(user.name || user.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
                    {user.name || "Unnamed User"}
                  </h2>

                  <p className="mt-2 break-all text-sm text-slate-500">
                    {user.email || "No email available"}
                  </p>

                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(user.role)}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal information */}
          <div className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FaUser className="text-[#075e3b]" />
              Personal Information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={FaUser}
                label="Full Name"
                value={user.name}
              />

              <DetailItem
                icon={FaEnvelope}
                label="Email Address"
                value={user.email}
              />

              <DetailItem
                icon={FaPhone}
                label="Phone Number"
                value={user.phone}
              />

              <DetailItem
                icon={FaIdBadge}
                label="Account Role"
                value={getRoleLabel(user.role)}
              />

              <DetailItem
                icon={FaCalendarAlt}
                label="Date Registered"
                value={formatDate(user.createdAt)}
              />
            </div>
          </div>

          {/* Academic information */}
          <div className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FaGraduationCap className="text-[#075e3b]" />
              Academic Information
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailItem
                icon={FaGraduationCap}
                label="School"
                value={user.school}
              />

              <DetailItem
                icon={FaBuilding}
                label="Department"
                value={user.department}
              />

              <DetailItem
                icon={FaGraduationCap}
                label="Academic Level"
                value={user.level}
              />
            </div>
          </div>

          {/* Profile description */}
          <div className="border-t border-slate-100 px-6 py-7 sm:px-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <FaInfoCircle className="text-[#075e3b]" />
              Profile Description
            </h3>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                {user.bio?.trim() ||
                  "This user has not added a profile description yet."}
              </p>
            </div>
          </div>
        </section>

        {/* Admin notice */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <FaUserShield className="mt-0.5 shrink-0 text-[#075e3b]" />

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Administrator View
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              This page displays information available in this user&apos;s
              Firestore document. Fields that have not been saved will appear
              as &quot;Not provided.&quot;
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
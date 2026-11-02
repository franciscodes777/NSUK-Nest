import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import {
  FaUsers,
  FaUserGraduate,
  FaBuilding,
  FaCheckCircle,
  FaUserShield,
  FaChartBar,
  FaArrowRight,
  FaClock,
} from "react-icons/fa"
import { MdFrontHand } from "react-icons/md"
import UserMenu from "@/components/UserMenu"

type AdminUser = {
  name?: string
  email?: string
  role?: string
  image?: string
  createdAt?: unknown
}

type AdminProperty = {
  id: string
  name?: string
  type?: string
  location?: string
  address?: string
  status?: string
  agentName?: string
  agentEmail?: string
  createdAt?: unknown
}

function formatDate(value: unknown) {
  if (!value) return "Date unavailable"

  try {
    let date: Date

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate()
    } else if (value instanceof Date) {
      date = value
    } else if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      date = new Date(value)
    } else {
      return "Date unavailable"
    }

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable"
    }

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "Date unavailable"
  }
}

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch users and properties from Firestore.
  const [usersSnapshot, propertiesSnapshot] = await Promise.all([
    adminDb.collection("users").get(),
    adminDb.collection("properties").get(),
  ])

  const users: AdminUser[] = usersSnapshot.docs.map((doc) => ({
    ...(doc.data() as AdminUser),
  }))

  const properties: AdminProperty[] = propertiesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AdminProperty, "id">),
  }))

  const students = users.filter(
    (user) => user.role === "student"
  )

  const agents = users.filter(
    (user) =>
      user.role === "agent" ||
      user.role === "agent-owner"
  )

  const pendingProperties = properties.filter(
    (property) =>
      property.status?.toLowerCase() === "pending"
  )

  const approvedProperties = properties.filter(
    (property) =>
      property.status?.toLowerCase() === "approved"
  )

  const recentUsers = [...users]
    .filter((user) => user.createdAt)
    .sort((a, b) => {
      const getTime = (value: unknown) => {
        if (
          typeof value === "object" &&
          value !== null &&
          "toDate" in value &&
          typeof value.toDate === "function"
        ) {
          return value.toDate().getTime()
        }

        if (
          typeof value === "string" ||
          typeof value === "number"
        ) {
          return new Date(value).getTime()
        }

        return 0
      }

      return getTime(b.createdAt) - getTime(a.createdAt)
    })
    .slice(0, 5)

  return (
    <main className="min-h-screen min-w-0 bg-slate-50">
      <section className="min-w-0 flex-1">

        {/* TOP BAR */}
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-10">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 sm:text-sm">
              Administrator
            </p>

            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
              Dashboard Overview
            </h1>
          </div>

          <div className="shrink-0">
            <UserMenu />
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-10">

          {/* WELCOME */}
          <div className="mb-7 sm:mb-8">
            <h2 className="flex flex-wrap items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
              Welcome, Admin
              <MdFrontHand className="rotate-[-35deg] text-lg text-[#075e3b]" />
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s what&apos;s happening across NSUK Nest.
            </p>
          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">

            {/* TOTAL USERS */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Total Users
                </p>

                <FaUsers className="shrink-0 text-[#075e3b]" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {users.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Registered accounts
              </p>
            </div>

            {/* STUDENTS */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Students
                </p>

                <FaUserGraduate className="shrink-0 text-[#075e3b]" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {students.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Registered students
              </p>
            </div>

            {/* AGENTS */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Agents / Owners
                </p>

                <FaUserShield className="shrink-0 text-[#075e3b]" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {agents.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Property providers
              </p>
            </div>

            {/* PROPERTIES */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Properties
                </p>

                <FaBuilding className="shrink-0 text-[#075e3b]" />
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                {properties.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Total listings
              </p>
            </div>
          </div>

          {/* PENDING APPROVALS SUMMARY */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-12 sm:w-12">
                <FaClock className="text-xl" />
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900">
                  Pending Property Approvals
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {pendingProperties.length}{" "}
                  {pendingProperties.length === 1
                    ? "property needs"
                    : "properties need"}{" "}
                  your review.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/admin/properties"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064d31] sm:w-auto"
            >
              Review Properties
              <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {/* PROPERTY APPROVALS */}
          <div className="mt-8 sm:mt-10">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Property Approvals
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Review accommodation listings submitted by agents.
                </p>
              </div>

              <Link
                href="/dashboard/admin/properties"
                className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#075e3b] sm:text-sm"
              >
                View all
                <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold text-slate-600 sm:px-6">
                        Property
                      </th>

                      <th className="px-5 py-4 text-left font-semibold text-slate-600 sm:px-6">
                        Agent / Owner
                      </th>

                      <th className="px-5 py-4 text-left font-semibold text-slate-600 sm:px-6">
                        Location
                      </th>

                      <th className="px-5 py-4 text-left font-semibold text-slate-600 sm:px-6">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right font-semibold text-slate-600 sm:px-6">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {pendingProperties.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <FaCheckCircle className="text-xl" />
                            </div>

                            <h3 className="mt-4 font-bold text-slate-800">
                              No pending approvals
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              New property submissions will appear here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pendingProperties.slice(0, 5).map((property) => (
                        <tr key={property.id}>
                          <td className="px-5 py-4 sm:px-6">
                            <p className="font-semibold text-slate-900">
                              {property.name || "Unnamed Property"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {property.type || "Accommodation"}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-slate-600 sm:px-6">
                            {property.agentName ||
                              property.agentEmail ||
                              "Agent details unavailable"}
                          </td>

                          <td className="px-5 py-4 text-slate-600 sm:px-6">
                            {property.location ||
                              property.address ||
                              "Not provided"}
                          </td>

                          <td className="px-5 py-4 sm:px-6">
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              Pending
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right sm:px-6">
                            <Link
                              href={`/dashboard/admin/properties/${property.id}`}
                              className="font-semibold text-[#075e3b] hover:underline"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SYSTEM SUMMARY */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:mt-10 lg:grid-cols-2 lg:gap-6">

            {/* RECENT USERS */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Recent Users
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Newly registered accounts.
                  </p>
                </div>

                <FaUsers className="shrink-0 text-[#075e3b]" />
              </div>

              {recentUsers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400">
                    No dated user registrations found.
                  </p>
                </div>
              ) : (
                <div className="mt-5 divide-y divide-slate-100">
                  {recentUsers.map((user, index) => (
                    <div
                      key={user.email || index}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {user.name || "Unnamed User"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {user.email || "No email provided"}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-xs capitalize text-slate-500">
                          {user.role || "User"}
                        </span>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Recent Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Current platform summary.
                  </p>
                </div>

                <FaChartBar className="shrink-0 text-[#075e3b]" />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    Approved properties
                  </span>

                  <span className="font-bold text-slate-900">
                    {approvedProperties.length}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    Pending properties
                  </span>

                  <span className="font-bold text-amber-600">
                    {pendingProperties.length}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    Registered students
                  </span>

                  <span className="font-bold text-slate-900">
                    {students.length}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    Registered agents
                  </span>

                  <span className="font-bold text-slate-900">
                    {agents.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
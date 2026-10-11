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

// Only administrators should access this page.
// Update the role value if your authentication system uses
// a different administrator role identifier.
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

const properties: AdminProperty[] = propertiesSnapshot.docs.map(
(doc) => ({
...(doc.data() as AdminProperty),
})
)

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

  return (
    getTime(b.createdAt) - getTime(a.createdAt)
  )
})
.slice(0, 5)


return ( <main className="min-h-screen bg-slate-50 flex"> <section className="flex-1 min-w-0">
{/* TOP BAR */} <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10"> <div> <p className="text-sm text-slate-500">
Administrator </p>


        <h1 className="text-xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
      </div>

      <UserMenu />
    </header>

    <div className="p-6 lg:p-10">
      {/* WELCOME */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          Welcome, Admin
          <MdFrontHand className="rotate-[-35deg] text-[#075e3b] text-lg" />
        </h2>

        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening across NSUK Nest.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* TOTAL USERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Users
            </p>

            <FaUsers className="text-[#075e3b]" />
          </div>

          <p className="text-3xl font-bold text-slate-900 mt-3">
            {users.length}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Registered accounts
          </p>
        </div>

        {/* STUDENTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Students
            </p>

            <FaUserGraduate className="text-[#075e3b]" />
          </div>

          <p className="text-3xl font-bold text-slate-900 mt-3">
            {students.length}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Registered students
          </p>
        </div>

        {/* AGENTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Agents / Owners
            </p>

            <FaUserShield className="text-[#075e3b]" />
          </div>

          <p className="text-3xl font-bold text-slate-900 mt-3">
            {agents.length}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Property providers
          </p>
        </div>

        {/* PROPERTIES */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Properties
            </p>

            <FaBuilding className="text-[#075e3b]" />
          </div>

          <p className="text-3xl font-bold text-slate-900 mt-3">
            {properties.length}
          </p>

          <p className="text-xs text-slate-400 mt-2">
            Total listings
          </p>
        </div>
      </div>

      {/* PENDING APPROVALS SUMMARY */}
      <div className="mt-6 bg-white border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FaClock className="text-xl" />
          </div>

          <div>
            <p className="font-bold text-slate-900">
              Pending Property Approvals
            </p>

            <p className="text-sm text-slate-500 mt-1">
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
          className="inline-flex items-center justify-center gap-2 bg-[#075e3b] text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-[#064d31] transition"
        >
          Review Properties
          <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {/* PROPERTY APPROVALS */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Property Approvals
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Review accommodation listings submitted by agents.
            </p>
          </div>

          <Link
            href="/dashboard/admin/properties"
            className="flex items-center gap-2 text-sm font-semibold text-[#075e3b] whitespace-nowrap"
          >
            View all
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Property
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Agent / Owner
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Location
                  </th>

                  <th className="text-left px-6 py-4 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 font-semibold text-slate-600">
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
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <FaCheckCircle className="text-xl" />
                        </div>

                        <h3 className="font-bold text-slate-800 mt-4">
                          No pending approvals
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          New property submissions will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pendingProperties.slice(0, 5).map(
                    (property, index) => {
                      const propertyId =
                        propertiesSnapshot.docs.filter(
                          (doc) =>
                            doc.data().status === "pending"
                        )[index]?.id

                      return (
                        <tr key={propertyId || index}>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">
                              {property.name ||
                                "Unnamed Property"}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {property.type ||
                                "Accommodation"}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {property.agentName ||
                              property.agentEmail ||
                              "Agent details unavailable"}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {property.location ||
                              property.address ||
                              "Not provided"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-semibold">
                              Pending
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href={
                                propertyId
                                  ? `/dashboard/admin/properties/${propertyId}`
                                  : "/dashboard/admin/properties"
                              }
                              className="font-semibold text-[#075e3b] hover:underline"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      )
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SYSTEM SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* RECENT USERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Users
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Newly registered accounts.
              </p>
            </div>

            <FaUsers className="text-[#075e3b]" />
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
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {user.name || "Unnamed User"}
                    </p>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      {user.email || "No email provided"}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-500 capitalize">
                      {user.role || "User"}
                    </span>

                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Recent Activity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current platform summary.
              </p>
            </div>

            <FaChartBar className="text-[#075e3b]" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-600">
                Approved properties
              </span>

              <span className="font-bold text-slate-900">
                {
                  properties.filter(
                    (property) =>
                      property.status?.toLowerCase() ===
                      "approved"
                  ).length
                }
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

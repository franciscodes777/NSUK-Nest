
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { PiHandWavingDuotone } from "react-icons/pi"
import {
  FaPlus,
  FaBuilding,
  FaEnvelope,
  FaUser,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa"
import UserMenu from "@/components/UserMenu"

type Property = {
  id: string
  name?: string
  location?: string
  price?: number | string
  status?: string
}

export default async function AgentDashboard() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard/student")
  }

  const propertySnapshot = await adminDb
    .collection("properties")
    .where("agentEmail", "==", session.user.email)
    .get()

  const properties: Property[] = propertySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Property, "id">),
  }))

  const totalProperties = properties.length

  const approvedProperties = properties.filter(
    (property) => property.status === "approved"
  ).length

  const pendingProperties = properties.filter(
    (property) => property.status === "pending"
  ).length

  const rejectedProperties = properties.filter(
    (property) => property.status === "rejected"
  ).length

  return (
    <main className="min-h-screen bg-slate-50 flex -mt-1.5">

      {/* MAIN CONTENT */}
      <section className="flex-1">

        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">

          <div>

            <p className="text-sm text-slate-500">
              Agent / Owner Dashboard
            </p>

            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Welcome back
              <PiHandWavingDuotone className="text-[#075e3b] text-lg" />
            </h1>

          </div>

          <UserMenu />

        </header>

        {/* BODY */}
        <div className="p-6 lg:p-10">

          {/* WELCOME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Manage your properties
              </h2>

              <p className="text-slate-500 mt-1">
                Add, manage and monitor your accommodation listings.
              </p>

            </div>

            <Link
              href="/dashboard/agent/properties/new"
              className="inline-flex items-center justify-center gap-2 bg-[#075e3b] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-[#064d31] transition"
            >
              <FaPlus />
              Add Property
            </Link>

          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

            {/* TOTAL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Total Properties
                </p>

                <FaBuilding className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                {totalProperties}
              </p>

            </div>

            {/* APPROVED */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Approved
                </p>

                <FaCheckCircle className="text-green-600" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                {approvedProperties}
              </p>

            </div>

            {/* PENDING */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <FaClock className="text-yellow-500" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                {pendingProperties}
              </p>

            </div>

            {/* ENQUIRIES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Enquiries
                </p>

                <FaEnvelope className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

            </div>

          </div>

          {/* PROPERTY MANAGEMENT */}
          <div className="mt-10">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  My Properties
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage your current accommodation listings.
                </p>

              </div>

              <Link
                href="/dashboard/agent/properties"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#075e3b] hover:text-[#064d31]"
              >
                View all
                <FaArrowRight className="text-xs" />
              </Link>

            </div>

            {/* PROPERTY TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Property
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Location
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Price
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 font-semibold text-slate-600">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {properties.length === 0 ? (

                      <tr>

                        <td
                          colSpan={5}
                          className="px-6 py-16 text-center"
                        >

                          <div className="flex flex-col items-center">

                            <div className="w-14 h-14 rounded-full bg-[#075e3b]/10 flex items-center justify-center text-[#075e3b]">
                              <FaBuilding className="text-xl" />
                            </div>

                            <h3 className="font-bold text-slate-800 mt-4">
                              No properties yet
                            </h3>

                            <p className="text-sm text-slate-500 mt-1 max-w-sm">
                              You haven't added any accommodation listings.
                              Add your first property to get started.
                            </p>

                            <Link
                              href="/dashboard/agent/properties/new"
                              className="mt-5 inline-flex items-center gap-2 bg-[#075e3b] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#064d31] transition"
                            >
                              <FaPlus />
                              Add Property
                            </Link>

                          </div>

                        </td>

                      </tr>

                    ) : (

                      properties.map((property) => (

                        <tr
                          key={property.id}
                          className="border-b border-slate-100 last:border-b-0"
                        >

                          <td className="px-6 py-4">

                            <div className="font-semibold text-slate-900">
                              {property.name || "Untitled Property"}
                            </div>

                          </td>

                          <td className="px-6 py-4 text-slate-500">
                            {property.location || "Not provided"}
                          </td>

                          <td className="px-6 py-4 font-semibold text-slate-900">
                            ₦{Number(property.price || 0).toLocaleString()}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                property.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : property.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {property.status || "pending"}
                            </span>

                          </td>

                          <td className="px-6 py-4 text-right">

                            <Link
                              href={`/dashboard/agent/properties/${property.id}`}
                              className="inline-flex items-center justify-center rounded-lg border border-green-600 px-4 py-2 font-medium text-green-600 transition hover:bg-green-50"
                            >
                              View
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

          {/* QUICK ACTIONS */}
          <div className="mt-10">

            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">

              <Link
                href="/dashboard/agent/properties/new"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#075e3b] transition"
              >

                <FaPlus className="text-[#075e3b] text-xl" />

                <h3 className="font-bold text-slate-900 mt-4">
                  Add Property
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Create a new accommodation listing.
                </p>

              </Link>

              <Link
                href="/dashboard/agent/properties"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#075e3b] transition"
              >

                <FaBuilding className="text-[#075e3b] text-xl" />

                <h3 className="font-bold text-slate-900 mt-4">
                  Manage Properties
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  View and manage all your property listings.
                </p>

              </Link>

              <Link
                href="/profile"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#075e3b] transition"
              >

                <FaUser className="text-[#075e3b] text-xl" />

                <h3 className="font-bold text-slate-900 mt-4">
                  Edit Profile
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Update your account information.
                </p>

              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}
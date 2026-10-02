import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  FaArrowLeft,
  FaBuilding,
  FaEye,
} from "react-icons/fa"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"

type Property = {
  id: string
  name?: string
  location?: string
  address?: string
  type?: string
  price?: number | string
  images?: string[]
  status?: string
  agentName?: string
  agentEmail?: string
}

export default async function AdminPropertiesPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth")
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard")
  }

  const snapshot = await adminDb
    .collection("properties")
    .get()

  const properties: Property[] = snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Property, "id">),
    }))
    .sort((a, b) => a.name?.localeCompare(b.name || "") || 0)

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">

      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075e3b] mb-4"
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          All Properties
        </h1>

        <p className="text-slate-500 mt-1">
          View and manage all accommodation listings on NSUK Nest.
        </p>
      </div>

      {/* EMPTY STATE */}
      {properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FaBuilding className="text-2xl" />
          </div>

          <h2 className="font-bold text-slate-800 mt-4">
            No properties yet
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Property listings submitted by agents will appear here.
          </p>
        </div>
      ) : (
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
                {properties.map((property) => {

                  const status = property.status || "pending"

                  return (
                    <tr
                      key={property.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition"
                    >

                      {/* PROPERTY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 min-w-[240px]">

                          <div className="relative w-16 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">

                            {property.images?.[0] ? (
                              <Image
                                src={property.images[0]}
                                alt={property.name || "Property"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <FaBuilding />
                              </div>
                            )}

                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {property.name || "Unnamed Property"}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {property.type || "Property"}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* AGENT */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">
                          {property.agentName || "Unknown"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {property.agentEmail || "No email"}
                        </p>
                      </td>

                      {/* LOCATION */}
                      <td className="px-6 py-4">
                        <p className="text-slate-700">
                          {property.location || "—"}
                        </p>
                      </td>

                      {/* PRICE */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          ₦{Number(property.price || 0).toLocaleString()}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            status === "approved"
                              ? "bg-green-100 text-green-700"
                              : status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() +
                            status.slice(1)}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/admin/properties/${property.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <FaEye />
                          View
                        </Link>
                      </td>

                    </tr>
                  )
                })}
              </tbody>

            </table>
          </div>

        </div>
      )}

    </main>
  )
}
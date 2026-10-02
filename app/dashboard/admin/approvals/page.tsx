import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  FaArrowLeft,
  FaBuilding,
  FaCheck,
  FaTimes,
} from "react-icons/fa"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { updatePropertyStatus } from "@/app/actions/admin"

type Property = {
  id: string
  name?: string
  location?: string
  address?: string
  type?: string
  price?: number | string
  description?: string
  images?: string[]
  status?: string
  agentName?: string
  agentEmail?: string
}

export default async function AdminApprovalsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth")
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard")
  }

  const snapshot = await adminDb
    .collection("properties")
    .where("status", "==", "pending")
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

        <h1 className="text-2xl font-bold text-slate-900">
          Pending Property Approvals
        </h1>

        <p className="text-slate-500 mt-1">
          Review accommodation listings submitted by agents and owners.
        </p>
      </div>

      {/* EMPTY STATE */}
      {properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <FaBuilding className="text-2xl" />
          </div>

          <h2 className="font-bold text-slate-800 mt-4">
            No pending approvals
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            New property submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {properties.map((property) => {
            const approveAction = updatePropertyStatus.bind(
              null,
              property.id,
              "approved"
            )

            const rejectAction = updatePropertyStatus.bind(
              null,
              property.id,
              "rejected"
            )

            return (
              <div
                key={property.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                <div className="p-5 lg:p-6 flex flex-col lg:flex-row gap-6">

                  {/* IMAGE */}
                  <div className="relative w-full lg:w-64 h-48 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {property.images?.[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.name || "Property"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FaBuilding className="text-3xl" />
                      </div>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1">

                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {property.name || "Unnamed Property"}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          {property.location || "Location not provided"}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Pending
                      </span>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

                      <div>
                        <p className="text-xs text-slate-400">
                          Property Type
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">
                          {property.type || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Price
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">
                          ₦{Number(property.price || 0).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Address
                        </p>
                        <p className="font-semibold text-slate-800 mt-1">
                          {property.address || "—"}
                        </p>
                      </div>

                    </div>

                    <div className="mt-5">
                      <p className="text-xs text-slate-400">
                        Submitted By
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {property.agentName || "Unknown Agent"}
                      </p>

                      <p className="text-sm text-slate-500">
                        {property.agentEmail || "No email"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">

                      <Link
                        href={`/dashboard/admin/properties/${property.id}`}
                        className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Review Property
                      </Link>

                      <form action={approveAction}>
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#075e3b] text-white text-sm font-semibold hover:bg-[#064d31] transition"
                        >
                          <FaCheck />
                          Approve
                        </button>
                      </form>

                      <form action={rejectAction}>
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </form>

                    </div>

                  </div>
                </div>
              </div>
            )
          })}

        </div>
      )}

    </main>
  )
}
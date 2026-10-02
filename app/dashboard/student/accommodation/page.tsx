import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"

type Property = {
  id: string
  name?: string
  type?: string
  location?: string
  price?: number | string
  images?: string[]
}

export default async function StudentAccommodation() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  const snapshot = await adminDb
    .collection("properties")
    .where("status", "==", "approved")
    .get()

  const accommodations: Property[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Property, "id">),
  }))

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Find Your Accommodation
          </h1>

          <p className="mt-2 text-gray-600">
            Discover accommodation options around NSUK.
          </p>
        </div>

        {/* No Properties */}
        {accommodations.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No accommodations available yet
            </h2>

            <p className="mt-2 text-gray-500">
              Approved accommodation listings will appear here.
            </p>
          </div>
        ) : (
          /* Accommodation Cards */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {accommodations.map((accommodation) => (
              <div
                key={accommodation.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >

                {/* Image */}
                <div className="h-56 overflow-hidden bg-gray-100">
                  {accommodation.images?.[0] ? (
                    <img
                      src={accommodation.images[0]}
                      alt={accommodation.name || "Accommodation"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">

                  <h2 className="text-xl font-semibold text-gray-900">
                    {accommodation.name || "Unnamed Property"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {accommodation.type || "Accommodation"}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    📍 {accommodation.location || "Location not provided"}
                  </p>

                  <div className="mt-5 flex items-center justify-between">

                    <div>
                      <p className="text-lg font-bold text-green-600">
                        ₦{Number(accommodation.price || 0).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-500">
                        per year
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/student/accommodation/${accommodation.id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                    >
                      View Details
                    </Link>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}
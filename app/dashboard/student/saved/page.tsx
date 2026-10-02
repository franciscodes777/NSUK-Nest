import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import RemoveSavedPropertyButton from "@/components/RemoveSavedPropertyBtn"

type Property = {
  id: string
  name?: string
  type?: string
  location?: string
  price?: number | string
  images?: string[]
}

export default async function SavedProperties() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  // Find the logged-in student's user document
  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get()

  const userData = userSnapshot.empty
    ? {}
    : userSnapshot.docs[0].data()

  const savedProperties = Array.isArray(userData.savedProperties)
    ? userData.savedProperties
    : []

  // No saved properties
  if (savedProperties.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900">
              Saved Properties
            </h1>

            <p className="mt-2 text-gray-600">
              Properties you have saved for later.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No saved properties yet
            </h2>

            <p className="mt-2 text-gray-500">
              Save properties you like and they will appear here.
            </p>

            <Link
              href="/dashboard/student/accommodation"
              className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Find Accommodation
            </Link>
          </div>

        </div>
      </main>
    )
  }

  // Fetch the saved property documents
  const propertySnapshots = await Promise.all(
    savedProperties.map((propertyId) =>
      adminDb
        .collection("properties")
        .doc(propertyId)
        .get()
    )
  )

  const accommodations: Property[] = propertySnapshots
    .filter((snapshot) => snapshot.exists)
    .map((snapshot) => ({
      id: snapshot.id,
      ...(snapshot.data() as Omit<Property, "id">),
    }))

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Saved Properties
          </h1>

          <p className="mt-2 text-gray-600">
            Properties you have saved for later.
          </p>
        </div>

        {/* Saved Properties */}
        {accommodations.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No saved properties available
            </h2>

            <p className="mt-2 text-gray-500">
              The properties you saved may no longer be available.
            </p>

            <Link
              href="/dashboard/student/accommodation"
              className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Find Accommodation
            </Link>
          </div>
        ) : (
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

                  <div className="mt-5 flex items-end justify-between gap-3">

                    <div>
                      <p className="text-lg font-bold text-green-600">
                        ₦{Number(accommodation.price || 0).toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-500">
                        per year
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">

                      <Link
                        href={`/dashboard/student/accommodation/${accommodation.id}`}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        View Details
                      </Link>

                      <RemoveSavedPropertyButton
                        propertyId={accommodation.id}
                      />

                    </div>

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
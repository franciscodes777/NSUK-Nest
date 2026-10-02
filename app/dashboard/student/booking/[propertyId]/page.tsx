import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import ContinueToPaymentButton from "@/components/ContinuePaymentButton"

type Props = {
  params: Promise<{
    propertyId: string
  }>
}

export default async function BookingPage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  const { propertyId } = await params

  const propertySnapshot = await adminDb
    .collection("properties")
    .doc(propertyId)
    .get()

  if (!propertySnapshot.exists) {
    notFound()
  }

  const property = propertySnapshot.data()

  if (property?.status !== "approved") {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/student/accommodation/${propertyId}`}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            ← Back to Property
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Confirm Your Booking
          </h1>

          <p className="mt-2 text-gray-600">
            Review the property details before continuing to payment.
          </p>
        </div>

        {/* Property Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          {/* Image */}
          <div className="h-64 bg-gray-100">
            {property.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.name || "Property"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6">

            <h2 className="text-2xl font-bold text-gray-900">
              {property.name || "Unnamed Property"}
            </h2>

            <p className="mt-2 text-gray-600">
              {property.type || "Accommodation"}
            </p>

            <p className="mt-2 text-gray-600">
              📍 {property.location || "Location not provided"}
            </p>

            <div className="mt-6 border-t pt-6">
              <p className="text-sm text-gray-500">
                Annual Rent
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600">
                ₦{Number(property.price || 0).toLocaleString()}
              </p>
            </div>

          </div>
        </div>

        {/* Escrow Explanation */}
        <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            How your payment works
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Your payment is made to NSUK Nest rather than directly to the
            agent or landlord. The payment will be held while you proceed
            with the property inspection.
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            After inspection, you can proceed with the rental or follow the
            applicable refund process if you decide not to accept the property.
          </p>

        </div>

        {/* Continue */}
        <div className="mt-6 flex justify-end">
{/* 
          <button
            type="button"
            className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
          >
            Continue to Payment
          </button> */}
            <ContinueToPaymentButton propertyId={propertyId} />
        </div>

      </div>
    </main>
  )
}
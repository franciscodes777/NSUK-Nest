import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"

type Props = {
  params: Promise<{
    bookingId: string
  }>
}

export default async function PaymentPage({ params }: Props) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  const { bookingId } = await params

  // Get the booking
  const bookingSnapshot = await adminDb
    .collection("bookings")
    .doc(bookingId)
    .get()

  if (!bookingSnapshot.exists) {
    notFound()
  }

  const booking = bookingSnapshot.data()

  // Make sure this booking belongs to the logged-in student
  if (booking?.studentEmail !== session.user.email) {
    redirect("/dashboard/student")
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/student/accommodation/${booking.propertyId}`}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            ← Back to Property
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Payment
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your payment through NSUK Nest.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold text-gray-900">
            Booking Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Property
              </span>

              <span className="font-medium text-gray-900">
                {booking.propertyName || "Property"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Location
              </span>

              <span className="font-medium text-gray-900">
                {booking.propertyLocation || "Not provided"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Booking ID
              </span>

              <span className="font-mono text-sm text-gray-900">
                {bookingId}
              </span>
            </div>

            <div className="border-t pt-5">

              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Amount
                </span>

                <span className="text-2xl font-bold text-green-600">
                  ₦{Number(booking.rentAmount || 0).toLocaleString()}
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Escrow Information */}
        <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Your payment is protected
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Your payment is made to NSUK Nest rather than directly to the
            agent or landlord. After your payment is verified, the booking
            will move to the next stage of the rental process.
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Your payment status will only change after the payment provider
            confirms the transaction.
          </p>

        </div>

        {/* Payment Status */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              Payment Status
            </span>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
              {booking.paymentStatus || "pending"}
            </span>
          </div>

        </div>

        {/* Pay Button */}
        <div className="mt-6 flex justify-end">

          <button
            type="button"
            disabled={booking.paymentStatus === "paid"}
            className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {booking.paymentStatus === "paid"
              ? "Payment Completed"
              : `Pay ₦${Number(
                  booking.rentAmount || 0
                ).toLocaleString()}`}
          </button>

        </div>

      </div>
    </main>
  )
}
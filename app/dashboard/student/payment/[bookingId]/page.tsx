import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import PaylukCheckoutButton from "@/components/PaylukcheckoutButton";

type Props = {
  params: Promise<{
    bookingId: string;
  }>;
};

type BookingData = {
  studentEmail?: string;
  propertyId?: string;
  propertyName?: string;
  propertyLocation?: string;
  rentAmount?: number;
  paymentStatus?: string;
  paylukPaymentToken?: string;
  bookingStatus?: string;
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({ params }: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent");
  }

  const { bookingId } = await params;

  // Retrieve the booking from Firestore.
  const bookingSnapshot = await adminDb
    .collection("bookings")
    .doc(bookingId)
    .get();

  if (!bookingSnapshot.exists) {
    notFound();
  }

  const booking = bookingSnapshot.data() as BookingData;

  // Ensure the booking belongs to the signed-in student.
  if (
    booking.studentEmail?.toLowerCase() !==
    session.user.email.toLowerCase()
  ) {
    redirect("/dashboard/student");
  }

  const paymentStatus = (
    booking.paymentStatus || "pending"
  ).toLowerCase();

  const isPaid = [
    "paid",
    "completed",
    "released",
  ].includes(paymentStatus);

  const amount = Number(booking.rentAmount || 0);

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
            Complete your payment securely through NSUK Nest.
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

              <span className="text-right font-medium text-gray-900">
                {booking.propertyName || "Property"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Location
              </span>

              <span className="text-right font-medium text-gray-900">
                {booking.propertyLocation || "Not provided"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Booking ID
              </span>

              <span className="break-all text-right font-mono text-sm text-gray-900">
                {bookingId}
              </span>
            </div>

            <div className="border-t pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold text-gray-900">
                  Amount
                </span>

                <span className="text-2xl font-bold text-green-600">
                  ₦{amount.toLocaleString("en-NG")}
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
            Your payment is processed through Payluk escrow.
            It is not released to the agent simply because you
            initiate checkout. The booking advances only when
            the payment provider confirms the escrow status.
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Once the escrow is confirmed as funded, your booking
            can proceed to the inspection stage. Payment
            verification is handled securely by our server.
          </p>
        </div>

        {/* Payment Status */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-600">
              Payment Status
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isPaid
                  ? "bg-green-100 text-green-700"
                  : paymentStatus === "refunded"
                    ? "bg-gray-100 text-gray-700"
                    : paymentStatus === "disputed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {paymentStatus.replace(/_/g, " ")}
            </span>
          </div>

          {isPaid && (
            <p className="mt-4 text-sm leading-6 text-green-700">
              Your payment has been confirmed. Check your booking
              details for the next steps.
            </p>
          )}
        </div>

        {/* Payluk Checkout */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Secure Checkout
          </h2>

          <p className="mt-2 mb-5 text-sm leading-6 text-gray-600">
            {isPaid
              ? "Your payment is already confirmed."
              : "Continue to Payluk's secure checkout to pay for your accommodation."}
          </p>

          {isPaid ? (
            <div className="rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
              Payment Completed
            </div>
          ) : booking.paylukPaymentToken ? (
            <PaylukCheckoutButton
              bookingId={bookingId}
              paymentToken={booking.paylukPaymentToken}
              paymentStatus={paymentStatus}
            />
          ) : (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm leading-6 text-yellow-800">
                A Payluk payment token has not been attached
                to this booking yet. Please return to the
                property page and start the booking process
                again. If the problem continues, contact support.
              </p>

              {booking.propertyId && (
                <Link
                  href={`/dashboard/student/accommodation/${booking.propertyId}`}
                  className="mt-4 inline-flex rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Return to Property
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <p className="mt-5 text-center text-xs leading-5 text-gray-500">
          Never share your payment details or authentication
          codes with an agent. NSUK Nest verifies payments
          directly with Payluk.
        </p>
      </div>
    </main>
  );
}
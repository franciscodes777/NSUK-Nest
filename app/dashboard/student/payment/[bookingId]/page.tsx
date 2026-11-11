import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import PaylukCheckoutButton from "@/components/PaylukCheckoutButton";
import StudentEscrowPanel from "@/components/StudentEscrowPanel";
import {
  ESCROW_BADGE_STYLES,
  ESCROW_LABELS,
  formatEscrowDate,
  getBookingEscrowStatus,
  toDate,
} from "@/lib/escrowStatus";

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
  rentAmount?: number | string;

  paymentStatus?: string;
  status?: string;
  bookingStatus?: string;

  paymentProvider?: string;

  paylukEscrowId?: string;
  paylukPaymentToken?: string;
  paylukBuyerCustomerId?: string;

  paylukStatus?: string;
  paylukState?: string;
  paylukTransactionReference?: string | null;

  agentName?: string;
  escrowStatus?: string;
  releaseDueAt?: unknown;
  releasedBy?: string;
  dispute?: { reason?: string } | null;
  resolution?: { note?: string } | null;
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
}: Props) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent");
  }

  const { bookingId } = await params;

  if (!bookingId?.trim()) {
    notFound();
  }

  const bookingSnapshot = await adminDb
    .collection("bookings")
    .doc(bookingId)
    .get();

  if (!bookingSnapshot.exists) {
    notFound();
  }

  const booking =
    bookingSnapshot.data() as BookingData;

  /*
   * Ensure the booking belongs to the signed-in student.
   */
  if (
    !booking.studentEmail ||
    booking.studentEmail.trim().toLowerCase() !==
      session.user.email.trim().toLowerCase()
  ) {
    redirect("/dashboard/student");
  }

  const paymentStatus = (
    booking.paymentStatus || "pending"
  ).toLowerCase();

  const bookingStatus = (
    booking.status ||
    booking.bookingStatus ||
    "pending_payment"
  ).toLowerCase();

  const escrowStatus = getBookingEscrowStatus(booking);
  const releaseDueAt = toDate(booking.releaseDueAt);

  const isPaid =
    escrowStatus === "held" || escrowStatus === "released";

  const isRefunded = escrowStatus === "refunded";

  const isDisputed = escrowStatus === "disputed";

  const isResolved =
    escrowStatus === "split" ||
    bookingStatus === "resolved" ||
    paymentStatus === "partially_refunded";

  const isPayluk =
    booking.paymentProvider?.toLowerCase() === "payluk" ||
    Boolean(booking.paylukEscrowId);

  const amount = Number(booking.rentAmount || 0);

  const paymentToken =
    typeof booking.paylukPaymentToken === "string"
      ? booking.paylukPaymentToken.trim()
      : "";

  const buyerCustomerId =
    typeof booking.paylukBuyerCustomerId === "string"
      ? booking.paylukBuyerCustomerId.trim()
      : "";

  const transactionReference =
    booking.paylukTransactionReference?.trim() || "";

  const publicKey =
    process.env.NEXT_PUBLIC_PAYLUK_PUBLIC_KEY?.trim() || "";

  const canPay =
    isPayluk &&
    !isPaid &&
    !isRefunded &&
    !isDisputed &&
    Boolean(paymentToken) &&
    Boolean(buyerCustomerId) &&
    Boolean(publicKey);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          {booking.propertyId && (
            <Link
              href={`/dashboard/student/accommodation/${encodeURIComponent(
                booking.propertyId
              )}`}
              className="text-sm font-medium text-[#075e3b] hover:text-[#064b30]"
            >
              ← Back to Property
            </Link>
          )}

          <h1 className="mt-5 text-3xl font-bold text-slate-900">
            Payment
          </h1>

          <p className="mt-2 text-slate-600">
            Complete your accommodation payment securely
            through NSUK Nest.
          </p>
        </div>

        {/* Booking Summary */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Booking Summary
          </h2>

          <div className="mt-6 space-y-5">

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Property
              </span>

              <span className="text-right font-medium text-slate-900">
                {booking.propertyName || "Property"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Location
              </span>

              <span className="text-right font-medium text-slate-900">
                {booking.propertyLocation || "Not provided"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Booking ID
              </span>

              <span className="break-all text-right font-mono text-sm text-slate-900">
                {bookingId}
              </span>
            </div>

            {transactionReference && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">
                  Payment Reference
                </span>

                <span className="break-all text-right font-mono text-sm text-slate-900">
                  {transactionReference}
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-semibold text-slate-900">
                  Amount
                </span>

                <span className="text-2xl font-bold text-[#075e3b]">
                  ₦{amount.toLocaleString("en-NG")}
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Escrow Protection */}
        <section className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your payment is protected
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            When you pay, NSUK Nest holds your money in
            Payluk escrow. The agent is only paid after you
            confirm the accommodation matches the listing, or
            automatically if you report no problem before the
            inspection period ends. If something is wrong,
            report it and an admin will review it before any
            money moves.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            Starting checkout does not mean your payment
            has been received. NSUK Nest only updates your
            booking after verifying the transaction with Payluk.
          </p>
        </section>

        {/* Payment Status */}
        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-600">
              Payment Status
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${ESCROW_BADGE_STYLES[escrowStatus]}`}
            >
              {ESCROW_LABELS[escrowStatus]}
            </span>
          </div>

          <StudentEscrowPanel
            bookingId={bookingId}
            escrowStatus={escrowStatus}
            releaseDueAt={
              releaseDueAt ? releaseDueAt.toISOString() : null
            }
            releaseDueLabel={formatEscrowDate(releaseDueAt)}
            agentName={booking.agentName}
            disputeReason={booking.dispute?.reason || null}
            resolutionNote={booking.resolution?.note || null}
            releasedBy={booking.releasedBy || null}
          />

          {!isPaid && !isRefunded && !isDisputed && !isResolved && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Your payment is awaiting confirmation.
              Complete checkout below and allow time for
              Payluk verification.
            </p>
          )}

        </section>

        {/* Payluk Checkout */}
        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-slate-900">
            Secure Checkout
          </h2>

          <p className="mb-5 mt-2 text-sm leading-6 text-slate-600">
            {isPaid
              ? "Your payment has been confirmed."
              : "Use the secure Payluk checkout to complete your accommodation payment."}
          </p>

          {!isPayluk ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm leading-6 text-yellow-800">
                This booking is not linked to a Payluk
                transaction. If it was created before the
                payment migration, contact support before
                making another payment.
              </p>
            </div>
          ) : isPaid ? (
            <div className="rounded-xl bg-green-50 p-5 text-center">
              <p className="font-semibold text-green-700">
                Payment Received
              </p>

              <p className="mt-2 text-sm text-green-700">
                {escrowStatus === "held"
                  ? "Payluk has received your payment and it is being held until you confirm."
                  : "This payment has been completed."}
              </p>
            </div>
          ) : isRefunded ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-700">
                This transaction has been refunded.
              </p>
            </div>
          ) : isDisputed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">
                This transaction is currently under dispute.
              </p>
            </div>
          ) : canPay ? (
            <PaylukCheckoutButton
              publicKey={publicKey}
              paymentToken={paymentToken}
              bookingId={bookingId}
              customerId={buyerCustomerId}
            />
          ) : (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-medium text-yellow-900">
                Checkout is unavailable
              </p>

              <p className="mt-2 text-sm leading-6 text-yellow-800">
                The Payluk payment information or checkout
                configuration is incomplete. Do not create
                another booking or make a manual payment.
                Please contact support.
              </p>
            </div>
          )}

        </section>

        {/* Security Notice */}
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Never share your authentication codes or banking
          credentials with an agent. Complete payments only
          through the verified Payluk checkout provided by
          NSUK Nest.
        </p>

      </div>
    </main>
  );
}
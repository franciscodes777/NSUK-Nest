import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import {
FaClipboardList,
FaMapMarkerAlt,
FaMoneyBillWave,
FaArrowRight,
FaHome,
FaClock,
FaCheckCircle,
FaTimesCircle,
FaCreditCard,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

type BookingDate =
| {
toDate: () => Date;
}
| Date
| string
| null;

type Booking = {
id: string;
propertyId?: string;
propertyName?: string;
propertyLocation?: string;
propertyAddress?: string;
rentAmount?: number;
paymentStatus?: string;
bookingStatus?: string;
inspectionStatus?: string;
createdAt?: BookingDate;
};

function getTimestamp(value?: BookingDate): number {
if (!value) return 0;

if (value instanceof Date) {
return value.getTime();
}

if (typeof value === "string") {
const timestamp = new Date(value).getTime();
return Number.isNaN(timestamp) ? 0 : timestamp;
}

if (typeof value.toDate === "function") {
return value.toDate().getTime();
}

return 0;
}

function formatStatus(status?: string) {
if (!status) return "Pending";

return status
.replace(/_/g, " ")
.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPaymentStyle(status?: string) {
const value = (status || "pending").toLowerCase();

if (["paid", "completed", "released"].includes(value)) {
return "bg-green-100 text-green-700";
}

if (["refunded", "partially_refunded"].includes(value)) {
return "bg-slate-100 text-slate-700";
}

if (value === "disputed") {
return "bg-red-100 text-red-700";
}

return "bg-yellow-100 text-yellow-700";
}

function getBookingStyle(status?: string) {
const value = (status || "pending").toLowerCase();

if (
["completed", "confirmed", "inspection_pending"].includes(value)
) {
return "bg-green-100 text-green-700";
}

if (["cancelled", "rejected"].includes(value)) {
return "bg-red-100 text-red-700";
}

return "bg-yellow-100 text-yellow-700";
}

function canContinuePayment(status?: string) {
const value = (status || "pending").toLowerCase();

return ![
"paid",
"completed",
"released",
"refunded",
"partially_refunded",
"disputed",
].includes(value);
}

export default async function StudentBookingsPage() {
const session = await auth();

if (!session?.user?.email) {
redirect("/login");
}

if (session.user.role !== "student") {
redirect("/dashboard/agent");
}

const snapshot = await adminDb
.collection("bookings")
.where("studentEmail", "==", session.user.email)
.get();

const bookings: Booking[] = snapshot.docs
.map((document) => {
const data = document.data();


  return {
    id: document.id,
    propertyId:
      typeof data.propertyId === "string"
        ? data.propertyId
        : undefined,
    propertyName:
      typeof data.propertyName === "string"
        ? data.propertyName
        : undefined,
    propertyLocation:
      typeof data.propertyLocation === "string"
        ? data.propertyLocation
        : undefined,
    propertyAddress:
      typeof data.propertyAddress === "string"
        ? data.propertyAddress
        : undefined,
    rentAmount: Number(data.rentAmount || 0),
    paymentStatus:
      typeof data.paymentStatus === "string"
        ? data.paymentStatus
        : "pending",
    bookingStatus:
      typeof data.bookingStatus === "string"
        ? data.bookingStatus
        : "pending",
    inspectionStatus:
      typeof data.inspectionStatus === "string"
        ? data.inspectionStatus
        : "pending",
    createdAt: data.createdAt as BookingDate | undefined,
  };
})
.sort(
  (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
);


return ( <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"> <div className="mx-auto max-w-6xl">
{/* Page Header */} <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#075e3b]/10 text-[#075e3b]"> <FaClipboardList size={22} /> </div>


        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          My Bookings
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Track your accommodation bookings and payment progress.
        </p>
      </div>

      <Link
        href="/dashboard/student/accommodation"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-5 py-3 font-semibold text-white transition hover:bg-[#064b30]"
      >
        <FaHome />
        Find Accommodation
      </Link>
    </div>

    {/* Booking Count */}
    <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#075e3b]/10 text-[#075e3b]">
          <FaClipboardList size={20} />
        </div>

        <div>
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold text-slate-900">
            {bookings.length}
          </p>
        </div>
      </div>
    </div>

    {/* Empty State */}
    {bookings.length === 0 ? (
      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FaClipboardList size={28} />
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900">
          No bookings yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          You haven&apos;t booked any accommodation yet. Browse available
          properties and find a place that feels like home.
        </p>

        <Link
          href="/dashboard/student/accommodation"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#075e3b] px-6 py-3 font-semibold text-white transition hover:bg-[#064b30]"
        >
          Browse Accommodation
          <FaArrowRight size={13} />
        </Link>
      </div>
    ) : (
      /* Booking Cards */
      <div className="space-y-5">
        {bookings.map((booking) => {
          const paymentStatus = (
            booking.paymentStatus || "pending"
          ).toLowerCase();

          const bookingStatus = (
            booking.bookingStatus || "pending"
          ).toLowerCase();

          const paid = [
            "paid",
            "completed",
            "released",
          ].includes(paymentStatus);

          const refunded = [
            "refunded",
            "partially_refunded",
          ].includes(paymentStatus);

          const disputed = paymentStatus === "disputed";

          const paymentCanContinue =
            canContinuePayment(paymentStatus) &&
            !["cancelled", "rejected"].includes(bookingStatus);

          const rentAmount = Number(booking.rentAmount || 0);
          const dateTimestamp = getTimestamp(booking.createdAt);

          const date = dateTimestamp
            ? new Date(dateTimestamp)
            : null;

          return (
            <article
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="p-5 sm:p-6">
                {/* Property and Status */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#075e3b]/10 text-[#075e3b]">
                      <FaHome size={23} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                        {booking.propertyName || "Accommodation"}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <FaMapMarkerAlt className="shrink-0 text-[#075e3b]" />
                        {booking.propertyLocation ||
                          "Location not provided"}
                      </p>

                      {date && (
                        <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <FaClock />
                          Booked on{" "}
                          {date.toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getBookingStyle(
                        booking.bookingStatus
                      )}`}
                    >
                      {formatStatus(booking.bookingStatus)}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPaymentStyle(
                        booking.paymentStatus
                      )}`}
                    >
                      {formatStatus(booking.paymentStatus)}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Rent Amount
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-xl font-bold text-[#075e3b]">
                      <FaMoneyBillWave size={17} />
                      ₦{rentAmount.toLocaleString("en-NG")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Booking Reference
                    </p>

                    <p className="mt-2 break-all font-mono text-sm text-slate-700">
                      {booking.id}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                {paid && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-green-600" />

                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Payment confirmed
                      </p>

                      <p className="mt-1 text-sm leading-5 text-green-700">
                        Your payment has been confirmed. Follow your
                        booking status for the next steps.
                      </p>
                    </div>
                  </div>
                )}

                {refunded && (
                  <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <FaTimesCircle className="mt-0.5 shrink-0 text-slate-500" />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {paymentStatus === "refunded"
                          ? "Payment refunded"
                          : "Partial refund"}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        Check your booking details or contact support if
                        you need clarification about this transaction.
                      </p>
                    </div>
                  </div>
                )}

                {disputed && (
                  <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                      Payment under dispute
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-700">
                      Your transaction is under review. Please do not
                      initiate another payment for this booking.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                  {booking.propertyId && (
                    <Link
                      href={`/dashboard/student/accommodation/${booking.propertyId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <FaHome />
                      View Property
                    </Link>
                  )}

                  {paymentCanContinue && (
                    <Link
                      href={`/dashboard/student/payment/${booking.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30]"
                    >
                      <FaCreditCard />
                      Continue Payment
                      <FaArrowRight size={12} />
                    </Link>
                  )}

                  {paid && (
                    <Link
                      href={`/dashboard/student/payment/${booking.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30]"
                    >
                      View Payment Details
                      <FaArrowRight size={12} />
                    </Link>
                  )}
                </div>

                {/* Contact Protection */}
                {!paid && (
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Agent contact details remain protected until Payluk
                    confirms your payment.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    )}
  </div>
</main>


);
}

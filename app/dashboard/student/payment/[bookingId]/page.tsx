import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";

type Props = {
  params: Promise<{
    bookingId: string;
  }>;
};

type PaymentDetails = Record<string, unknown>;

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
  pandascrowEscrowId?: string;
  pandascrowStatus?: string;
  pandascrowTransactionReference?: string | null;
  pandascrowPaymentGateway?: string;
  pandascrowPaymentUrl?: string | null;
  pandascrowPaymentDetails?: PaymentDetails | null;
};

export const dynamic = "force-dynamic";

function formatStatus(value: string): string {
  return value.replace(/_/g, " ");
}

function getAccountDetails(
  details: PaymentDetails | null | undefined
): Array<{ label: string; value: string }> {
  if (!details) {
    return [];
  }

  /*
   * Only display payment fields that are useful to the student.
   * This avoids accidentally rendering unrelated provider metadata.
   */
  const allowedFields: Record<string, string> = {
    bank_name: "Bank",
    bank: "Bank",
    bankName: "Bank",
    account_name: "Account Name",
    accountName: "Account Name",
    account_number: "Account Number",
    accountNumber: "Account Number",
    account_no: "Account Number",
    accountNo: "Account Number",
    account_reference: "Account Reference",
    accountReference: "Account Reference",
    reference: "Payment Reference",
    transaction_reference: "Transaction Reference",
    transactionReference: "Transaction Reference",
    amount: "Amount",
    expires_at: "Account Expiry",
    expiresAt: "Account Expiry",
    expiry: "Account Expiry",
    expiry_date: "Account Expiry",
    expiryDate: "Account Expiry",
  };

  const displayedFields: Array<{
    label: string;
    value: string;
  }> = [];

  const displayedLabels = new Set<string>();

  for (const [key, label] of Object.entries(allowedFields)) {
    const rawValue = details[key];

    if (
      rawValue === undefined ||
      rawValue === null ||
      typeof rawValue === "object"
    ) {
      continue;
    }

    const value = String(rawValue).trim();

    if (!value || displayedLabels.has(label)) {
      continue;
    }

    displayedFields.push({ label, value });
    displayedLabels.add(label);
  }

  return displayedFields;
}

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

  /*
   * Retrieve the booking from Firestore.
   */
  const bookingSnapshot = await adminDb
    .collection("bookings")
    .doc(bookingId)
    .get();

  if (!bookingSnapshot.exists) {
    notFound();
  }

  const booking = bookingSnapshot.data() as BookingData;

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

  const isPaid = [
    "paid",
    "completed",
    "released",
  ].includes(paymentStatus);

  const isRefunded =
    paymentStatus === "refunded" ||
    bookingStatus === "refunded";

  const isDisputed =
    paymentStatus === "disputed" ||
    bookingStatus === "disputed";

  const isResolved =
    bookingStatus === "resolved" ||
    paymentStatus === "partially_refunded";

  const amount = Number(booking.rentAmount || 0);

  const paymentGateway = (
    booking.pandascrowPaymentGateway || ""
  ).toLowerCase();

  const paymentUrl =
    typeof booking.pandascrowPaymentUrl === "string"
      ? booking.pandascrowPaymentUrl.trim()
      : "";

  const accountDetails = getAccountDetails(
    booking.pandascrowPaymentDetails
  );

  const transactionReference =
    booking.pandascrowTransactionReference?.trim() || "";

  const isPandascrow =
    booking.paymentProvider?.toLowerCase() ===
      "pandascrow" ||
    Boolean(booking.pandascrowEscrowId);

  /*
   * Do not render an arbitrary URL stored in Firestore.
   * Payment links must use HTTPS and the expected Pandascrow
   * payment domain. Adjust this allowlist if Pandascrow's
   * documented checkout links use another official domain.
   */
  let safePaymentUrl = "";

  if (paymentUrl) {
    try {
      const parsedUrl = new URL(paymentUrl);

      const allowedHosts = [
        "pandascrow.io",
        "www.pandascrow.io",
      ];

      const isAllowedHost = allowedHosts.some(
        (host) =>
          parsedUrl.hostname === host ||
          parsedUrl.hostname.endsWith(`.${host}`)
      );

      if (
        parsedUrl.protocol === "https:" &&
        isAllowedHost &&
        !parsedUrl.username &&
        !parsedUrl.password
      ) {
        safePaymentUrl = parsedUrl.toString();
      }
    } catch {
      safePaymentUrl = "";
    }
  }

  const hasVirtualAccountDetails =
    paymentGateway === "virtual_account" &&
    accountDetails.length > 0;

  const hasPaymentInstructions =
    Boolean(safePaymentUrl) ||
    hasVirtualAccountDetails;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          {booking.propertyId && (
            <Link
              href={`/dashboard/student/accommodation/${encodeURIComponent(
                booking.propertyId
              )}`}
              className="text-sm font-medium text-green-600 hover:text-green-700"
            >
              ← Back to Property
            </Link>
          )}

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Payment
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your accommodation payment securely
            through NSUK Nest.
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

            {transactionReference && (
              <div className="flex justify-between gap-4">
                <span className="text-gray-500">
                  Payment Reference
                </span>

                <span className="break-all text-right font-mono text-sm text-gray-900">
                  {transactionReference}
                </span>
              </div>
            )}

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
            Your booking payment is initiated through
            Pandascrow. The transaction follows the
            applicable escrow terms, including the agreed
            inspection, acceptance, refund, and dispute
            procedures.
          </p>

          <p className="mt-3 text-sm leading-6 text-gray-700">
            Starting a payment does not mean it has been
            received. NSUK Nest updates your booking after
            the payment provider's verified notification
            confirms the transaction status.
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
                  : isRefunded
                    ? "bg-gray-100 text-gray-700"
                    : isDisputed
                      ? "bg-red-100 text-red-700"
                      : isResolved
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {formatStatus(paymentStatus)}
            </span>
          </div>

          {isPaid && (
            <p className="mt-4 text-sm leading-6 text-green-700">
              Your payment has been confirmed. Check your
              booking details for the next steps.
            </p>
          )}

          {isRefunded && (
            <p className="mt-4 text-sm leading-6 text-gray-600">
              This payment has been marked as refunded.
              Check your transaction details or contact
              support if you need assistance.
            </p>
          )}

          {isDisputed && (
            <p className="mt-4 text-sm leading-6 text-red-700">
              This transaction is under dispute. Please
              follow the instructions provided by NSUK Nest
              support and the payment provider.
            </p>
          )}

          {!isPaid &&
            !isRefunded &&
            !isDisputed && (
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Your payment has not yet been confirmed.
                Complete the payment instructions below,
                then allow time for verification.
              </p>
            )}
        </div>

        {/* Pandascrow Payment */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Secure Checkout
          </h2>

          <p className="mb-5 mt-2 text-sm leading-6 text-gray-600">
            {isPaid
              ? "Your payment has been confirmed."
              : "Use the payment instructions below to complete your accommodation payment."}
          </p>

          {!isPandascrow ? (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm leading-6 text-yellow-800">
                This booking does not have a recognized
                Pandascrow transaction attached to it.
                If it was created before the payment
                provider migration, contact support for
                assistance. Do not create another booking
                until the existing transaction has been checked.
              </p>
            </div>
          ) : isPaid ? (
            <div className="rounded-xl bg-green-50 p-4 text-center">
              <p className="font-semibold text-green-700">
                Payment Confirmed
              </p>

              <p className="mt-1 text-sm text-green-700">
                Your booking will proceed according to the
                applicable inspection and rental process.
              </p>
            </div>
          ) : isRefunded ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-700">
                This transaction has been refunded.
                Contact support if you have questions about
                the refund.
              </p>
            </div>
          ) : isDisputed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-800">
                This transaction is currently under dispute.
                Please follow the instructions from support.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {safePaymentUrl && (
                <div>
                  <p className="mb-3 text-sm leading-6 text-gray-600">
                    Continue to Pandascrow's payment page
                    to complete your transaction.
                  </p>

                  <a
                    href={safePaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
                  >
                    Pay Now
                    <span className="ml-2" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </div>
              )}

              {hasVirtualAccountDetails && (
                <div className="rounded-xl border border-green-100 bg-green-50 p-5">
                  <h3 className="font-semibold text-gray-900">
                    Bank Transfer Instructions
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-700">
                    Transfer the required amount using the
                    account details below. Confirm the
                    amount and account information before
                    completing your transfer.
                  </p>

                  <div className="mt-4 space-y-3">
                    {accountDetails.map((detail) => (
                      <div
                        key={detail.label}
                        className="flex flex-col justify-between gap-1 border-b border-green-100 pb-3 sm:flex-row sm:gap-4"
                      >
                        <span className="text-sm text-gray-600">
                          {detail.label}
                        </span>

                        <span className="break-all text-sm font-semibold text-gray-900 sm:text-right">
                          {detail.label === "Amount" &&
                          !detail.value.includes("₦")
                            ? `₦${Number(
                                detail.value
                              ).toLocaleString("en-NG")}`
                            : detail.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    Your booking remains pending until
                    the payment provider confirms receipt
                    of your payment.
                  </p>
                </div>
              )}

              {!hasPaymentInstructions && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="font-medium text-yellow-900">
                    Payment instructions are unavailable
                  </p>

                  <p className="mt-2 text-sm leading-6 text-yellow-800">
                    Your booking exists, but the expected
                    payment instructions are not available
                    on this page. Do not create another
                    booking or make a manual transfer to
                    an agent. Please contact support to
                    verify the existing transaction.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Notice */}
        <p className="mt-5 text-center text-xs leading-5 text-gray-500">
          Never share your authentication codes or banking
          credentials with an agent. Complete payments only
          through the verified payment instructions provided
          for your NSUK Nest booking.
        </p>
      </div>
    </main>
  );
}
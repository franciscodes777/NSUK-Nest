import { redirect } from "next/navigation";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaMoneyBillWave,
} from "react-icons/fa";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  ESCROW_BADGE_STYLES,
  ESCROW_LABELS,
  formatEscrowDate,
  getBookingEscrowStatus,
  toDate,
  type EscrowStatus,
} from "@/lib/escrowStatus";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  propertyName: string;
  studentName: string;
  amount: number;
  escrowStatus: EscrowStatus;
  paidAt: Date | null;
  releaseDueAt: Date | null;
  settledAt: Date | null;
  disputeReason: string | null;
  resolutionNote: string | null;
  createdAt: Date | null;
};

function naira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default async function AgentPaymentsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard/student");
  }

  const snapshot = await adminDb
    .collection("bookings")
    .where("agentEmail", "==", session.user.email.trim().toLowerCase())
    .get();

  const rows: Row[] = snapshot.docs
    .map((document) => {
      const data = document.data();

      return {
        id: document.id,
        propertyName: String(data.propertyName || "Accommodation"),
        studentName: String(data.studentName || "Student"),
        amount: Number(data.rentAmount || 0),
        escrowStatus: getBookingEscrowStatus(data),
        paidAt: toDate(data.paidAt),
        releaseDueAt: toDate(data.releaseDueAt),
        settledAt:
          toDate(data.releasedAt) ||
          toDate(data.completedAt) ||
          toDate(data.refundedAt) ||
          toDate(data.resolvedAt),
        disputeReason:
          typeof data.dispute?.reason === "string" ? data.dispute.reason : null,
        resolutionNote:
          typeof data.resolution?.note === "string"
            ? data.resolution.note
            : null,
        createdAt: toDate(data.createdAt),
      };
    })
    // Unpaid checkouts are not relevant to the agent.
    .filter((row) => row.escrowStatus !== "awaiting_payment")
    .sort(
      (a, b) =>
        (b.paidAt?.getTime() || b.createdAt?.getTime() || 0) -
        (a.paidAt?.getTime() || a.createdAt?.getTime() || 0)
    );

  const total = (status: EscrowStatus) =>
    rows
      .filter((row) => row.escrowStatus === status)
      .reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Payments
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          When a student pays, NSUK Nest holds the money in escrow. It is
          released to you once the student confirms the accommodation matches
          your listing, or automatically when the inspection period ends with
          no problem reported. If a student reports a problem, an NSUK Nest
          admin reviews it before any money moves.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <FaHourglassHalf className="text-blue-600" /> Held
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {naira(total("held"))}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <FaExclamationTriangle className="text-red-600" /> Under dispute
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {naira(total("disputed"))}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <FaCheckCircle className="text-green-600" /> Paid to you
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {naira(total("released"))}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
              <FaMoneyBillWave className="mx-auto text-3xl text-slate-300" />
              <p className="mt-4 font-semibold text-slate-900">
                No payments yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Payments from students who book your listings will appear here.
              </p>
            </div>
          ) : (
            rows.map((row) => (
              <article
                key={row.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-bold text-slate-900">
                      {row.propertyName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.studentName} · Paid {formatEscrowDate(row.paidAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {naira(row.amount)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${ESCROW_BADGE_STYLES[row.escrowStatus]}`}
                    >
                      {ESCROW_LABELS[row.escrowStatus]}
                    </span>
                  </div>
                </div>

                {row.escrowStatus === "held" && (
                  <p className="mt-3 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                    Waiting for the student to confirm. If no problem is
                    reported, this is released to you on{" "}
                    <strong>{formatEscrowDate(row.releaseDueAt)}</strong>.
                  </p>
                )}

                {row.escrowStatus === "disputed" && (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                    <p className="font-semibold">
                      The student reported a problem. An admin is reviewing it.
                    </p>
                    {row.disputeReason && (
                      <p className="mt-1 whitespace-pre-wrap">
                        &ldquo;{row.disputeReason}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {row.escrowStatus === "released" && (
                  <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    Released to you on {formatEscrowDate(row.settledAt)}.
                    {row.resolutionNote && ` Admin note: ${row.resolutionNote}`}
                  </p>
                )}

                {(row.escrowStatus === "refunded" ||
                  row.escrowStatus === "split") && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    {row.escrowStatus === "refunded"
                      ? "Refunded to the student"
                      : "Partially refunded to the student"}{" "}
                    after admin review.
                    {row.resolutionNote && ` Admin note: ${row.resolutionNote}`}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

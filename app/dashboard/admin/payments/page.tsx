import { adminDb } from "@/lib/firebaseAdmin";
import {
  ESCROW_BADGE_STYLES,
  ESCROW_LABELS,
  formatEscrowDate,
  getBookingEscrowStatus,
  toDate,
  type EscrowStatus,
} from "@/lib/escrowStatus";
import {
  ReleaseNowButton,
  ResolveDisputeForm,
  RunAutoReleaseButton,
} from "@/components/AdminEscrowActions";

export const dynamic = "force-dynamic";

// Access is restricted to ADMIN_EMAIL by app/dashboard/admin/layout.tsx.

type Row = {
  id: string;
  propertyName: string;
  studentName: string;
  studentEmail: string;
  agentName: string;
  agentEmail: string;
  amount: number;
  escrowStatus: EscrowStatus;
  paidAt: Date | null;
  releaseDueAt: Date | null;
  releasedAt: Date | null;
  releasedBy: string | null;
  disputeReason: string | null;
  disputeOpenedAt: Date | null;
  resolutionNote: string | null;
  createdAt: Date | null;
};

function naira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

function releasedByLabel(value: string | null) {
  switch (value) {
    case "student":
      return "Student confirmed";
    case "auto":
      return "Auto-released";
    case "admin":
      return "Admin";
    case "agent_claim":
      return "Agent claimed on Payluk";
    default:
      return "Payluk";
  }
}

function Badge({ status }: { status: EscrowStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${ESCROW_BADGE_STYLES[status]}`}
    >
      {ESCROW_LABELS[status]}
    </span>
  );
}

function Parties({ row }: { row: Row }) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
      <p className="min-w-0 wrap-break-word">
        <span className="text-slate-400">Student:</span> {row.studentName}{" "}
        <span className="text-slate-400">({row.studentEmail})</span>
      </p>
      <p className="min-w-0 wrap-break-word">
        <span className="text-slate-400">Agent:</span> {row.agentName}{" "}
        <span className="text-slate-400">({row.agentEmail})</span>
      </p>
    </div>
  );
}

export default async function AdminPaymentsPage() {
  const snapshot = await adminDb
    .collection("bookings")
    .where("paymentProvider", "==", "payluk")
    .get();

  const rows: Row[] = snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      propertyName: String(data.propertyName || "Accommodation"),
      studentName: String(data.studentName || "Student"),
      studentEmail: String(data.studentEmail || ""),
      agentName: String(data.agentName || "Agent"),
      agentEmail: String(data.agentEmail || ""),
      amount: Number(data.rentAmount || 0),
      escrowStatus: getBookingEscrowStatus(data),
      paidAt: toDate(data.paidAt),
      releaseDueAt: toDate(data.releaseDueAt),
      releasedAt:
        toDate(data.releasedAt) ||
        toDate(data.completedAt) ||
        toDate(data.refundedAt) ||
        toDate(data.resolvedAt),
      releasedBy: typeof data.releasedBy === "string" ? data.releasedBy : null,
      disputeReason:
        typeof data.dispute?.reason === "string" ? data.dispute.reason : null,
      disputeOpenedAt: toDate(data.dispute?.openedAt),
      resolutionNote:
        typeof data.resolution?.note === "string" ? data.resolution.note : null,
      createdAt: toDate(data.createdAt),
    };
  });

  const now = Date.now();

  const disputed = rows
    .filter((row) => row.escrowStatus === "disputed")
    .sort(
      (a, b) =>
        (a.disputeOpenedAt?.getTime() || 0) -
        (b.disputeOpenedAt?.getTime() || 0)
    );

  const held = rows
    .filter((row) => row.escrowStatus === "held")
    .sort(
      (a, b) =>
        (a.releaseDueAt?.getTime() || Infinity) -
        (b.releaseDueAt?.getTime() || Infinity)
    );

  const settled = rows
    .filter((row) =>
      ["released", "refunded", "split"].includes(row.escrowStatus)
    )
    .sort(
      (a, b) =>
        (b.releasedAt?.getTime() || b.createdAt?.getTime() || 0) -
        (a.releasedAt?.getTime() || a.createdAt?.getTime() || 0)
    )
    .slice(0, 50);

  const sum = (list: Row[]) =>
    list.reduce((total, row) => total + row.amount, 0);

  const overdueCount = held.filter(
    (row) => row.releaseDueAt && row.releaseDueAt.getTime() <= now
  ).length;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Payments &amp; Escrow
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Student payments are held until the student confirms the
              accommodation, reports a problem, or the inspection period ends
              (then they are released to the agent automatically).
            </p>
          </div>
          <RunAutoReleaseButton />
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Disputes to resolve</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {disputed.length}
            </p>
            <p className="text-sm text-slate-500">{naira(sum(disputed))} frozen</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Payments held</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {held.length}
            </p>
            <p className="text-sm text-slate-500">
              {naira(sum(held))}
              {overdueCount > 0 && ` · ${overdueCount} overdue`}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Settled (latest 50)</p>
            <p className="mt-1 text-2xl font-bold text-[#075e3b]">
              {settled.length}
            </p>
            <p className="text-sm text-slate-500">{naira(sum(settled))}</p>
          </div>
        </div>

        {/* Disputes */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Disputes ({disputed.length})
          </h2>

          {disputed.length === 0 ? (
            <p className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No open disputes.
            </p>
          ) : (
            <div className="space-y-4">
              {disputed.map((row) => (
                <article
                  key={row.id}
                  className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900">
                        {row.propertyName}
                      </h3>
                      <p className="break-all font-mono text-xs text-slate-400">
                        {row.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        {naira(row.amount)}
                      </span>
                      <Badge status={row.escrowStatus} />
                    </div>
                  </div>

                  <Parties row={row} />

                  <div className="mt-4 rounded-xl bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                      Student&apos;s report
                      {row.disputeOpenedAt &&
                        ` · ${formatEscrowDate(row.disputeOpenedAt)}`}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-red-900">
                      {row.disputeReason ||
                        "Dispute opened directly on Payluk (no reason recorded in NSUK Nest)."}
                    </p>
                  </div>

                  <ResolveDisputeForm bookingId={row.id} />
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Held */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Held payments ({held.length})
          </h2>

          {held.length === 0 ? (
            <p className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No payments are being held right now.
            </p>
          ) : (
            <div className="space-y-3">
              {held.map((row) => {
                const overdue =
                  row.releaseDueAt !== null &&
                  row.releaseDueAt.getTime() <= now;

                return (
                  <article
                    key={row.id}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900">
                          {row.propertyName}{" "}
                          <span className="font-semibold text-slate-500">
                            · {naira(row.amount)}
                          </span>
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Paid {formatEscrowDate(row.paidAt)} · Auto-release{" "}
                          <span
                            className={
                              overdue ? "font-semibold text-red-600" : ""
                            }
                          >
                            {formatEscrowDate(row.releaseDueAt)}
                            {overdue && " (overdue)"}
                          </span>
                        </p>
                      </div>
                      <ReleaseNowButton bookingId={row.id} />
                    </div>
                    <Parties row={row} />
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Settled */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Recently settled
          </h2>

          {settled.length === 0 ? (
            <p className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Nothing settled yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full min-w-160 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Outcome</th>
                    <th className="px-4 py-3">By</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settled.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.propertyName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.agentName}
                      </td>
                      <td className="px-4 py-3 text-slate-900">
                        {naira(row.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={row.escrowStatus} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.escrowStatus === "released"
                          ? releasedByLabel(row.releasedBy)
                          : "Admin"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatEscrowDate(row.releasedAt || row.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

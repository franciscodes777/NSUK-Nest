"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaHourglassHalf,
  FaShieldAlt,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import {
  confirmBookingAndRelease,
  reportBookingProblem,
} from "@/app/actions/escrow";
import type { EscrowStatus } from "@/lib/escrowStatus";

type Props = {
  bookingId: string;
  escrowStatus: EscrowStatus;
  /** ISO string */
  releaseDueAt: string | null;
  releaseDueLabel: string;
  agentName?: string;
  disputeReason?: string | null;
  resolutionNote?: string | null;
  releasedBy?: string | null;
};

export default function StudentEscrowPanel({
  bookingId,
  escrowStatus,
  releaseDueAt,
  releaseDueLabel,
  agentName,
  disputeReason,
  resolutionNote,
  releasedBy,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<"idle" | "confirm" | "report">("idle");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const agent = agentName || "the agent";

  const run = (action: () => Promise<{ ok: boolean; message: string }>) => {
    setFeedback(null);

    startTransition(async () => {
      const result = await action();
      setFeedback(result);

      if (result.ok) {
        setMode("idle");
        setReason("");
        router.refresh();
      }
    });
  };

  if (escrowStatus === "awaiting_payment") {
    return null;
  }

  if (escrowStatus === "released") {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4">
        <FaCheckCircle className="mt-0.5 shrink-0 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            Payment released to {agent}
          </p>
          <p className="mt-1 text-sm leading-5 text-green-700">
            {releasedBy === "student"
              ? "You confirmed you were satisfied with this accommodation."
              : releasedBy === "auto"
                ? "The inspection period ended without a reported problem, so the payment was released automatically."
                : releasedBy === "admin"
                  ? "An NSUK Nest admin released the payment."
                  : "This escrow has been completed."}
          </p>
          {resolutionNote && (
            <p className="mt-2 text-sm text-green-700">
              Admin note: {resolutionNote}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (escrowStatus === "refunded" || escrowStatus === "split") {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
        <FaTimesCircle className="mt-0.5 shrink-0 text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {escrowStatus === "refunded"
              ? "Payment refunded to you"
              : "Payment partially refunded"}
          </p>
          {resolutionNote && (
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Admin note: {resolutionNote}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (escrowStatus === "disputed") {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
        <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-600" />
        <div>
          <p className="text-sm font-semibold text-red-800">
            Problem reported — payment on hold
          </p>
          <p className="mt-1 text-sm leading-5 text-red-700">
            Your money has not been paid to {agent}. An NSUK Nest admin is
            reviewing the issue and will either release the payment or refund
            you.
          </p>
          {disputeReason && (
            <p className="mt-2 text-sm italic text-red-700">
              &ldquo;{disputeReason}&rdquo;
            </p>
          )}
        </div>
      </div>
    );
  }

  // escrowStatus === "held"
  const overdue =
    releaseDueAt !== null && new Date(releaseDueAt).getTime() <= Date.now();

  return (
    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <FaShieldAlt className="mt-0.5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            NSUK Nest is holding your payment
          </p>
          <p className="mt-1 text-sm leading-5 text-blue-800">
            {agent} has not been paid yet. Inspect the accommodation. If it
            matches the listing, confirm below to release the payment. If
            something is wrong, report a problem and the money stays on hold
            while an admin reviews it.
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-900">
            <FaHourglassHalf className="shrink-0" />
            {overdue
              ? "The inspection period has ended. The payment will be released to the agent shortly unless you report a problem now."
              : `If you take no action, the payment is released automatically on ${releaseDueLabel}.`}
          </p>
        </div>
      </div>

      {mode === "idle" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setMode("confirm");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30]"
          >
            <FaCheckCircle />
            I&apos;m satisfied — release payment
          </button>

          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              setMode("report");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            <FaExclamationTriangle />
            Report a problem
          </button>
        </div>
      )}

      {mode === "confirm" && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">
            Release the payment to {agent}?
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Only confirm if you have inspected the accommodation and it
            matches the listing. Once released, the payment cannot be
            reversed through NSUK Nest.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => confirmBookingAndRelease(bookingId))}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30] disabled:opacity-60"
            >
              {pending && <FaSpinner className="animate-spin" />}
              Yes, release payment
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setMode("idle")}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === "report" && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <label
            htmlFor={`problem-${bookingId}`}
            className="text-sm font-semibold text-slate-900"
          >
            What is wrong with the accommodation?
          </label>
          <textarea
            id={`problem-${bookingId}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="e.g. The room is smaller than shown, there is no water supply, the agent is not responding…"
            className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-[#075e3b]"
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={pending || reason.trim().length < 10}
              onClick={() => run(() => reportBookingProblem(bookingId, reason))}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {pending && <FaSpinner className="animate-spin" />}
              Submit report and keep payment on hold
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setMode("idle")}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <p
          className={`mt-3 text-sm ${
            feedback.ok ? "text-green-700" : "text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import {
  adminReleaseNow,
  adminResolveDispute,
  adminRunAutoRelease,
} from "@/app/actions/escrow";

type Feedback = { ok: boolean; message: string } | null;

function FeedbackText({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;

  return (
    <p
      className={`mt-2 text-sm ${
        feedback.ok ? "text-green-700" : "text-red-700"
      }`}
    >
      {feedback.message}
    </p>
  );
}

/**
 * Release / refund controls for a disputed booking.
 */
export function ResolveDisputeForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);

  const decide = (outcome: "release" | "refund") => {
    const question =
      outcome === "release"
        ? "Release this payment to the agent? This cannot be undone."
        : "Refund this payment to the student? This cannot be undone.";

    if (!window.confirm(question)) return;

    setFeedback(null);

    startTransition(async () => {
      const result = await adminResolveDispute(bookingId, outcome, note);
      setFeedback(result);

      if (result.ok) {
        setNote("");
        router.refresh();
      }
    });
  };

  return (
    <div className="mt-4">
      <label
        htmlFor={`resolution-${bookingId}`}
        className="text-sm font-semibold text-slate-800"
      >
        Decision note (shown to the student)
      </label>
      <textarea
        id={`resolution-${bookingId}`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="e.g. Inspected with both parties; room matches listing."
        className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none focus:border-[#075e3b]"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={pending || note.trim().length < 5}
          onClick={() => decide("release")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#064b30] disabled:opacity-60"
        >
          {pending && <FaSpinner className="animate-spin" />}
          Release to agent
        </button>
        <button
          type="button"
          disabled={pending || note.trim().length < 5}
          onClick={() => decide("refund")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {pending && <FaSpinner className="animate-spin" />}
          Refund student
        </button>
      </div>
      <FeedbackText feedback={feedback} />
    </div>
  );
}

/**
 * Release a held (undisputed) payment immediately.
 */
export function ReleaseNowButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              "Release this held payment to the agent now? The student has not confirmed yet."
            )
          ) {
            return;
          }

          setFeedback(null);

          startTransition(async () => {
            const result = await adminReleaseNow(bookingId);
            setFeedback(result);
            if (result.ok) router.refresh();
          });
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {pending && <FaSpinner className="animate-spin" />}
        Release now
      </button>
      <FeedbackText feedback={feedback} />
    </div>
  );
}

/**
 * Run the overdue auto-release sweep on demand.
 */
export function RunAutoReleaseButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setFeedback(null);

          startTransition(async () => {
            const result = await adminRunAutoRelease();
            setFeedback(result);
            router.refresh();
          });
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30] disabled:opacity-60"
      >
        {pending && <FaSpinner className="animate-spin" />}
        Release overdue payments now
      </button>
      <FeedbackText feedback={feedback} />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  openBookingDispute,
  releaseBookingEscrow,
  releaseOverdueEscrows,
  resolveBookingDispute,
} from "@/lib/escrow";

export type EscrowActionResult = {
  ok: boolean;
  message: string;
};

function fail(error: unknown, fallback: string): EscrowActionResult {
  console.error("[Escrow action]", error);

  return {
    ok: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

function revalidateEscrowPages(bookingId?: string) {
  revalidatePath("/dashboard/student/booking");
  revalidatePath("/dashboard/agent/payments");
  revalidatePath("/dashboard/admin/payments");

  if (bookingId) {
    revalidatePath(`/dashboard/student/payment/${bookingId}`);
  }
}

async function getStudentBookingRef(bookingId: string) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Please sign in to continue.");
  }

  if (session.user.role !== "student") {
    throw new Error("Only the student who paid can do this.");
  }

  if (typeof bookingId !== "string" || !bookingId.trim()) {
    throw new Error("A booking is required.");
  }

  const bookingRef = adminDb.collection("bookings").doc(bookingId.trim());
  const snapshot = await bookingRef.get();

  if (!snapshot.exists) {
    throw new Error("Booking not found.");
  }

  const studentEmail = String(snapshot.data()?.studentEmail || "")
    .trim()
    .toLowerCase();

  const sessionEmail = session.user.email.trim().toLowerCase();

  if (!studentEmail || studentEmail !== sessionEmail) {
    throw new Error("You cannot manage this booking.");
  }

  return { bookingRef, email: sessionEmail };
}

async function requireAdmin() {
  const session = await auth();

  if (
    !session?.user?.email ||
    !process.env.ADMIN_EMAIL ||
    session.user.email !== process.env.ADMIN_EMAIL
  ) {
    throw new Error("Only administrators can do this.");
  }

  return session.user.email;
}

/**
 * Student: "I'm satisfied with the accommodation" — release
 * the held payment to the agent.
 */
export async function confirmBookingAndRelease(
  bookingId: string
): Promise<EscrowActionResult> {
  try {
    const { bookingRef, email } = await getStudentBookingRef(bookingId);

    const result = await releaseBookingEscrow(bookingRef, "student", email);

    revalidateEscrowPages(bookingRef.id);

    return {
      ok: true,
      message: result.alreadyReleased
        ? "This payment had already been released to the agent."
        : "Thanks for confirming. The payment has been released to the agent.",
    };
  } catch (error) {
    return fail(error, "We could not release this payment.");
  }
}

/**
 * Student: report a problem with the accommodation. Funds stay
 * held until an admin resolves the dispute.
 */
export async function reportBookingProblem(
  bookingId: string,
  reason: string
): Promise<EscrowActionResult> {
  try {
    const trimmedReason = typeof reason === "string" ? reason.trim() : "";

    if (trimmedReason.length < 10) {
      return {
        ok: false,
        message: "Please describe the problem in at least 10 characters.",
      };
    }

    if (trimmedReason.length > 2000) {
      return {
        ok: false,
        message: "Please keep the description under 2,000 characters.",
      };
    }

    const { bookingRef, email } = await getStudentBookingRef(bookingId);

    await openBookingDispute(bookingRef, trimmedReason, email);

    revalidateEscrowPages(bookingRef.id);

    return {
      ok: true,
      message:
        "Your report has been sent. The payment stays on hold until an NSUK Nest admin reviews it.",
    };
  } catch (error) {
    return fail(error, "We could not submit your report.");
  }
}

/**
 * Admin: decide a dispute.
 */
export async function adminResolveDispute(
  bookingId: string,
  outcome: "release" | "refund",
  note: string
): Promise<EscrowActionResult> {
  try {
    const adminEmail = await requireAdmin();

    if (outcome !== "release" && outcome !== "refund") {
      return { ok: false, message: "Choose release or refund." };
    }

    const trimmedNote = typeof note === "string" ? note.trim() : "";

    if (trimmedNote.length < 5) {
      return {
        ok: false,
        message: "Add a short note explaining the decision.",
      };
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingId);

    await resolveBookingDispute(bookingRef, outcome, trimmedNote, adminEmail);

    revalidateEscrowPages(bookingId);

    return {
      ok: true,
      message:
        outcome === "release"
          ? "Dispute closed. Payment released to the agent."
          : "Dispute closed. Payment refunded to the student.",
    };
  } catch (error) {
    return fail(error, "We could not resolve this dispute.");
  }
}

/**
 * Admin: release a held (undisputed) payment immediately.
 */
export async function adminReleaseNow(
  bookingId: string
): Promise<EscrowActionResult> {
  try {
    const adminEmail = await requireAdmin();

    const bookingRef = adminDb.collection("bookings").doc(bookingId);

    await releaseBookingEscrow(bookingRef, "admin", adminEmail);

    revalidateEscrowPages(bookingId);

    return { ok: true, message: "Payment released to the agent." };
  } catch (error) {
    return fail(error, "We could not release this payment.");
  }
}

/**
 * Admin: run the auto-release sweep now instead of waiting
 * for the scheduled job.
 */
export async function adminRunAutoRelease(): Promise<EscrowActionResult> {
  try {
    await requireAdmin();

    const result = await releaseOverdueEscrows();

    revalidateEscrowPages();

    return {
      ok: result.failed === 0,
      message: `Checked ${result.checked} held payment(s): ${result.released} released, ${result.skipped} not yet due, ${result.failed} failed.`,
    };
  } catch (error) {
    return fail(error, "Auto-release could not run.");
  }
}

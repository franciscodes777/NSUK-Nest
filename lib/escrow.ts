import "server-only";

import {
  FieldValue,
  Timestamp,
  type DocumentReference,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  confirmPaylukEscrow,
  resolvePaylukDispute,
  submitPaylukDispute,
  syncBookingFromEscrow,
  verifyPaylukEscrow,
} from "@/lib/payluk";
import { getEscrowStatusFromPayluk, toDate } from "@/lib/escrowStatus";

export type ReleaseSource = "student" | "auto" | "admin";

type BookingRecord = {
  paymentProvider?: string;
  paylukEscrowId?: string;
  paylukPaymentToken?: string;
  paylukBuyerCustomerId?: string;
  releaseDueAt?: unknown;
  paidAt?: unknown;
  inspectionPeriodDays?: number;
};

async function loadPaylukBooking(bookingRef: DocumentReference) {
  const snapshot = await bookingRef.get();

  if (!snapshot.exists) {
    throw new Error("Booking not found.");
  }

  const booking = snapshot.data() as BookingRecord;

  if (
    booking.paymentProvider !== "payluk" ||
    !booking.paylukEscrowId ||
    !booking.paylukPaymentToken ||
    !booking.paylukBuyerCustomerId
  ) {
    throw new Error(
      "This booking is not linked to a Payluk escrow."
    );
  }

  return {
    booking,
    escrowId: booking.paylukEscrowId,
    paymentToken: booking.paylukPaymentToken,
    buyerCustomerId: booking.paylukBuyerCustomerId,
  };
}

/**
 * Release held funds to the agent.
 *
 * Always re-checks the live escrow with Payluk first, so a
 * booking is never released twice and a disputed booking is
 * never released by this path.
 */
export async function releaseBookingEscrow(
  bookingRef: DocumentReference,
  source: ReleaseSource,
  actorEmail?: string
) {
  const { escrowId, paymentToken, buyerCustomerId } =
    await loadPaylukBooking(bookingRef);

  const current = await verifyPaylukEscrow(paymentToken);
  const currentStatus = getEscrowStatusFromPayluk(current.status);

  if (currentStatus !== "held") {
    await syncBookingFromEscrow(bookingRef, current);

    if (currentStatus === "released") {
      return { released: true, alreadyReleased: true };
    }

    throw new Error(
      currentStatus === "disputed"
        ? "This payment is under dispute. An admin will resolve it."
        : currentStatus === "awaiting_payment"
          ? "Payment for this booking has not been received yet."
          : "This payment can no longer be released."
    );
  }

  let result;

  try {
    result = await confirmPaylukEscrow(escrowId, buyerCustomerId);
  } catch (error) {
    // Another request may have released it at the same time.
    const after = await verifyPaylukEscrow(paymentToken);
    await syncBookingFromEscrow(bookingRef, after);

    if (getEscrowStatusFromPayluk(after.status) === "released") {
      return { released: true, alreadyReleased: true };
    }

    throw error;
  }

  // Record who released it before syncing so the sync keeps it.
  await bookingRef.update({
    releasedBy: source,
    releasedByEmail: actorEmail || null,
    releasedAt: FieldValue.serverTimestamp(),
    inspectionStatus:
      source === "student" ? "approved" : source === "auto" ? "expired" : "admin_released",
  });

  // confirm-payment returns the closed escrow; fall back to
  // verifying if the response was empty.
  const finalEscrow =
    result && result.status ? result : await verifyPaylukEscrow(paymentToken);

  await syncBookingFromEscrow(bookingRef, finalEscrow);

  return { released: true, alreadyReleased: false };
}

/**
 * Student reports a problem. Funds are frozen until an admin
 * resolves the dispute.
 */
export async function openBookingDispute(
  bookingRef: DocumentReference,
  reason: string,
  studentEmail: string
) {
  const { paymentToken, buyerCustomerId } =
    await loadPaylukBooking(bookingRef);

  const current = await verifyPaylukEscrow(paymentToken);
  const currentStatus = getEscrowStatusFromPayluk(current.status);

  if (currentStatus !== "held") {
    await syncBookingFromEscrow(bookingRef, current);

    throw new Error(
      currentStatus === "disputed"
        ? "A dispute is already open for this booking."
        : currentStatus === "released"
          ? "This payment has already been released to the agent."
          : "A problem can only be reported while the payment is held."
    );
  }

  await submitPaylukDispute(paymentToken, buyerCustomerId, reason);

  await bookingRef.update({
    dispute: {
      reason,
      openedBy: studentEmail,
      openedAt: FieldValue.serverTimestamp(),
    },
  });

  const after = await verifyPaylukEscrow(paymentToken);
  await syncBookingFromEscrow(bookingRef, after);
}

/**
 * Admin decides a dispute: release to the agent, or refund
 * the student.
 */
export async function resolveBookingDispute(
  bookingRef: DocumentReference,
  outcome: "release" | "refund",
  note: string,
  adminEmail: string
) {
  const { escrowId, paymentToken } = await loadPaylukBooking(bookingRef);

  const current = await verifyPaylukEscrow(paymentToken);
  const currentStatus = getEscrowStatusFromPayluk(current.status);

  if (currentStatus !== "disputed") {
    await syncBookingFromEscrow(bookingRef, current);

    throw new Error(
      "This booking does not have an open dispute on Payluk."
    );
  }

  await resolvePaylukDispute(
    escrowId,
    outcome === "release" ? "COMPLETED" : "REFUNDED",
    note
  );

  await bookingRef.update({
    resolution: {
      outcome,
      note,
      resolvedBy: adminEmail,
      resolvedAt: FieldValue.serverTimestamp(),
    },
    ...(outcome === "release"
      ? {
          releasedBy: "admin",
          releasedByEmail: adminEmail,
          releasedAt: FieldValue.serverTimestamp(),
          inspectionStatus: "admin_released",
        }
      : { inspectionStatus: "admin_refunded" }),
  });

  const after = await verifyPaylukEscrow(paymentToken);
  await syncBookingFromEscrow(bookingRef, after);
}

/**
 * Release every held payment whose inspection period has ended
 * without the student confirming or reporting a problem.
 *
 * Queries on a single field so no composite Firestore index is
 * needed. Older bookings without a releaseDueAt get one computed
 * from their payment date.
 */
export async function releaseOverdueEscrows(options?: {
  agentId?: string;
  studentEmail?: string;
}) {
  let query: FirebaseFirestore.Query = adminDb
    .collection("bookings")
    .where("paylukStatus", "==", "ONGOING");

  if (options?.agentId) {
    query = query.where("agentId", "==", options.agentId);
  }

  if (options?.studentEmail) {
    query = query.where("studentEmail", "==", options.studentEmail);
  }

  const snapshot = await query.get();
  const now = Date.now();

  const results = {
    checked: snapshot.size,
    released: 0,
    skipped: 0,
    failed: 0,
    errors: [] as { bookingId: string; message: string }[],
  };

  for (const document of snapshot.docs) {
    const booking = document.data() as BookingRecord;

    let dueAt = toDate(booking.releaseDueAt);

    if (!dueAt) {
      const paidAt = toDate(booking.paidAt);
      const days = Number(booking.inspectionPeriodDays) || 7;

      if (!paidAt) {
        results.skipped++;
        continue;
      }

      dueAt = new Date(paidAt.getTime() + days * 86_400_000);

      await document.ref.update({
        releaseDueAt: Timestamp.fromDate(dueAt),
      });
    }

    if (dueAt.getTime() > now) {
      results.skipped++;
      continue;
    }

    try {
      await releaseBookingEscrow(document.ref, "auto");
      results.released++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        bookingId: document.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      console.error("[Escrow] Auto-release failed", {
        bookingId: document.id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

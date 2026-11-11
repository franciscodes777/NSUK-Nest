/**
 * Shared escrow status helpers.
 *
 * Safe to import from server and client code (no secrets,
 * no Firebase Admin).
 *
 * Escrow flow on NSUK Nest:
 *
 *   awaiting_payment → held → released            (student confirms / auto-release)
 *                          ↘ disputed → released  (admin sides with agent)
 *                                     ↘ refunded  (admin sides with student)
 */

export type EscrowStatus =
  | "awaiting_payment"
  | "held"
  | "released"
  | "disputed"
  | "refunded"
  | "split";

export function getEscrowStatusFromPayluk(
  paylukStatus?: string | null
): EscrowStatus {
  switch ((paylukStatus || "").toUpperCase()) {
    case "ONGOING":
      return "held";
    case "COMPLETED":
    case "CLAIMED":
      return "released";
    case "DISPUTED":
    case "INVESTIGATING":
      return "disputed";
    case "REFUNDED":
      return "refunded";
    case "SPLIT":
      return "split";
    default:
      return "awaiting_payment";
  }
}

/**
 * Resolve the escrow status of a booking document, falling
 * back to the stored Payluk status for older bookings that
 * were created before escrowStatus existed.
 */
export function getBookingEscrowStatus(booking: {
  escrowStatus?: unknown;
  paylukStatus?: unknown;
}): EscrowStatus {
  if (typeof booking.paylukStatus === "string" && booking.paylukStatus) {
    return getEscrowStatusFromPayluk(booking.paylukStatus);
  }

  const known: EscrowStatus[] = [
    "awaiting_payment",
    "held",
    "released",
    "disputed",
    "refunded",
    "split",
  ];

  return known.includes(booking.escrowStatus as EscrowStatus)
    ? (booking.escrowStatus as EscrowStatus)
    : "awaiting_payment";
}

/**
 * Convert Firestore timestamps, dates, ISO strings and epoch
 * numbers into a Date.
 */
export function toDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (
    typeof value === "object" &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return null;
}

export const ESCROW_LABELS: Record<EscrowStatus, string> = {
  awaiting_payment: "Awaiting payment",
  held: "Payment held",
  released: "Paid to agent",
  disputed: "Under dispute",
  refunded: "Refunded",
  split: "Partially refunded",
};

export const ESCROW_BADGE_STYLES: Record<EscrowStatus, string> = {
  awaiting_payment: "bg-yellow-100 text-yellow-700",
  held: "bg-blue-100 text-blue-700",
  released: "bg-green-100 text-green-700",
  disputed: "bg-red-100 text-red-700",
  refunded: "bg-slate-100 text-slate-700",
  split: "bg-slate-100 text-slate-700",
};

export function formatEscrowDate(date: Date | null): string {
  if (!date) return "—";

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  });
}

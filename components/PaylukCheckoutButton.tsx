"use client";

import { useEffect, useState } from "react";
import {
  initEscrowCheckout,
  pay,
} from "payluk-escrow-inline-checkout";

type Props = {
  publicKey: string;
  paymentToken: string;
  bookingId: string;
  customerId: string;
};

export default function PaylukCheckoutButton({
  publicKey,
  paymentToken,
  bookingId,
  customerId,
}: Props) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!publicKey) {
      setError("Payluk checkout is not configured.");
      return;
    }

    try {
      initEscrowCheckout({ publicKey });
      setReady(true);
    } catch {
      setError("Unable to initialize Payluk checkout.");
    }
  }, [publicKey]);

  async function handlePayment() {
    if (!ready || loading) return;

    if (!paymentToken || !customerId) {
      setError(
        "The payment information is incomplete. Please contact support."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await pay({
        paymentToken,
        reference: bookingId,
        customerId,
        brand: "NSUK Nest",
        redirectUrl:
          `${window.location.origin}/dashboard/student/payment/${encodeURIComponent(bookingId)}?checkout=return`,
        callback: () => {
          // Checkout callback is not proof of successful payment.
          // The Payluk webhook and server verification confirm payment.
        },
        onClose: () => {
          setLoading(false);
        },
      });
    } catch (err: unknown) {
      console.error("Payluk checkout error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to open Payluk checkout. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={!ready || loading}
        className="flex w-full items-center justify-center rounded-xl bg-[#075e3b] px-6 py-4 font-semibold text-white transition hover:bg-[#064b30] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Opening secure checkout..."
          : ready
            ? "Pay Securely with Payluk"
            : "Loading Secure Checkout..."}
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm leading-6 text-red-700">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
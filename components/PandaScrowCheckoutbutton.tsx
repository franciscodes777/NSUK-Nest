
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaSpinner } from "react-icons/fa";

type PandascrowCheckoutButtonProps = {
  bookingId: string;
  paymentUrl?: string | null;
  paymentStatus: string;
};

export default function PandascrowCheckoutButton({
  bookingId,
  paymentUrl,
  paymentStatus,
}: PandascrowCheckoutButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isPaid = ["paid", "completed", "released"].includes(
    paymentStatus.toLowerCase()
  );

  async function handlePayment() {
    if (isLoading || isPaid) return;

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      if (!bookingId.trim()) {
        throw new Error(
          "The booking ID is missing. Please return to your booking."
        );
      }

      if (!paymentUrl?.trim()) {
        throw new Error(
          "The Pandascrow payment link is unavailable. Please refresh this page or contact support."
        );
      }

      const parsedUrl = new URL(paymentUrl);

      const allowedHosts = [
        "pandascrow.io",
        "www.pandascrow.io",
        "sandbox-checkout.bachs.io",
      ];

      const isAllowedHost = allowedHosts.some(
        (host) =>
          parsedUrl.hostname === host ||
          parsedUrl.hostname.endsWith(`.${host}`)
      );

      if (
        parsedUrl.protocol !== "https:" ||
        !isAllowedHost ||
        parsedUrl.username ||
        parsedUrl.password
      ) {
        throw new Error(
          "The payment link could not be verified. Please contact support."
        );
      }

      setMessage(
        "Redirecting you to Pandascrow's secure checkout..."
      );

      window.location.assign(parsedUrl.toString());
    } catch (paymentError: unknown) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to open Pandascrow checkout."
      );

      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading || isPaid}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-6 py-4 font-semibold text-white shadow-md transition hover:bg-[#064b30] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaLock />
        )}

        {isLoading
          ? "Opening Secure Checkout..."
          : isPaid
            ? "Payment Confirmed"
            : "Pay Securely with Pandascrow"}
      </button>

      {message && (
        <p
          role="status"
          className="mt-3 text-sm leading-6 text-slate-600"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm leading-6 text-red-600"
        >
          {error}
        </p>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        Your payment is processed through Pandascrow escrow.
        Your booking remains pending until payment is verified.
      </p>
    </div>
  );
}


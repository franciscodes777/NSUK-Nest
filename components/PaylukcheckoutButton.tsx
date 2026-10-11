"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initEscrowCheckout, pay } from "payluk-escrow-inline-checkout";
import { FaLock, FaSpinner } from "react-icons/fa";

type PaylukCheckoutButtonProps = {
  bookingId: string;
  paymentToken: string;
  paymentStatus: string;
};

type VerifyResponse = {
  status?: string;
  paymentStatus?: string;
  contactUnlocked?: boolean;
  error?: string;
};

let checkoutInitialized = false;

export default function PaylukCheckoutButton({
  bookingId,
  paymentToken,
  paymentStatus,
}: PaylukCheckoutButtonProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isPaid = ["paid", "completed", "released"].includes(
    paymentStatus.toLowerCase()
  );

  async function verifyPayment() {
    const response = await fetch("/api/student/bookings/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
      cache: "no-store",
    });

    const result = (await response.json()) as VerifyResponse;

    if (!response.ok) {
      throw new Error(
        result.error || "Unable to verify your payment with Payluk."
      );
    }

    if (result.contactUnlocked) {
      setMessage(
        "Payment confirmed! Your booking is now awaiting inspection."
      );
    } else {
      setMessage(
        "Your payment has not been confirmed yet. Your booking remains pending."
      );
    }

    router.refresh();

    return result;
  }

  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("paylukReturn") !== "1") {
      return;
    }

    url.searchParams.delete("paylukReturn");

    window.history.replaceState(
      window.history.state,
      "",
      url.toString()
    );

    setIsLoading(true);

    verifyPayment()
      .catch((verificationError: unknown) => {
        setError(
          verificationError instanceof Error
            ? verificationError.message
            : "Payment verification failed."
        );
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Verify once when the student returns from Payluk checkout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePayment() {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const publicKey =
        process.env.NEXT_PUBLIC_PAYLUK_PUBLISHABLE_KEY;

      if (!publicKey) {
        throw new Error(
          "Payluk is not configured. Check NEXT_PUBLIC_PAYLUK_PUBLISHABLE_KEY in your environment variables."
        );
      }

      if (!paymentToken) {
        throw new Error(
          "The Payluk payment token is missing. Please return to your booking and try again."
        );
      }

      if (!checkoutInitialized) {
        initEscrowCheckout({ publicKey });
        checkoutInitialized = true;
      }

      const redirectUrl = new URL(
        `/dashboard/student/payment/${encodeURIComponent(bookingId)}`,
        window.location.origin
      );

      redirectUrl.searchParams.set("paylukReturn", "1");

      await pay({
        paymentToken,
        reference: bookingId,
        redirectUrl: redirectUrl.toString(),
        brand: "NSUK Nest",
        logoUrl: `${window.location.origin}/nsuknestlogo.jpg`,

        callback: () => {
          setIsLoading(true);

          verifyPayment()
            .catch((verificationError: unknown) => {
              setError(
                verificationError instanceof Error
                  ? verificationError.message
                  : "Payment verification is still pending."
              );
            })
            .finally(() => {
              setIsLoading(false);
            });
        },

        onClose: () => {
          setIsLoading(false);
          setMessage(
            "Checkout closed. Your booking will remain pending until Payluk confirms payment."
          );
        },
      });

      setMessage(
        "Secure checkout opened. Complete your payment in the Payluk window."
      );
    } catch (paymentError: unknown) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start Payluk checkout."
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
          ? "Preparing Secure Checkout..."
          : isPaid
            ? "Payment Confirmed"
            : "Pay Securely with Payluk"}
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
        Your payment is processed through Payluk escrow. Your
        booking remains pending until payment is verified.
      </p>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions/booking";

type Props = {
  propertyId: string;
};

type BookingResult = {
  success: boolean;
  bookingId?: string;
};

export default function ContinueToPaymentButton({
  propertyId,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      if (!propertyId) {
        throw new Error("Property ID is missing. Please try again.");
      }

      const result = (await createBooking(propertyId)) as BookingResult;

      if (!result?.success || !result.bookingId) {
        throw new Error(
          "Your booking could not be created. Please try again."
        );
      }

      router.push(
        `/dashboard/student/payment/${encodeURIComponent(result.bookingId)}`
      );
    } catch (err: unknown) {
      console.error("Booking creation failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while creating your booking.";

      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating Booking..." : "Continue to Payment"}
      </button>

      {error && (
        <p role="alert" className="max-w-sm text-right text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
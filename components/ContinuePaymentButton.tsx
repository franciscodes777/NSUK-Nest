// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createBooking } from "@/app/actions/booking";

// type Props = {
//   propertyId: string;
// };

// type BookingResult = {
//   success: boolean;
//   bookingId?: string;
// };

// export default function ContinueToPaymentButton({
//   propertyId,
// }: Props) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleContinue = async () => {
//     if (loading) return;

//     try {
//       setLoading(true);
//       setError("");

//       if (!propertyId) {
//         throw new Error("Property ID is missing. Please try again.");
//       }

//       const result = (await createBooking(propertyId)) as BookingResult;

//       if (!result?.success || !result.bookingId) {
//         throw new Error(
//           "Your booking could not be created. Please try again."
//         );
//       }

//       router.push(
//         `/dashboard/student/payment/${encodeURIComponent(result.bookingId)}`
//       );
//     } catch (err: unknown) {
//       console.error("Booking creation failed:", err);

//       const message =
//         err instanceof Error
//           ? err.message
//           : "An unexpected error occurred while creating your booking.";

//       setError(message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-end gap-2">
//       <button
//         type="button"
//         onClick={handleContinue}
//         disabled={loading}
//         className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
//       >
//         {loading ? "Creating Booking..." : "Continue to Payment"}
//       </button>

//       {error && (
//         <p role="alert" className="max-w-sm text-right text-sm text-red-600">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions/booking";
import { FaLock, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { Theme } from "@/components/theme";

type Props = {
  propertyId: string;
};

type BookingResult = {
  success: boolean;
  bookingId?: string;
  error?: string;
};

export default function ContinueToPaymentButton({ propertyId }: Props) {
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

      // Safely invoke the Server Action
      const result = (await createBooking(propertyId)) as BookingResult;

      if (!result?.success || !result.bookingId) {
        throw new Error(
          result?.error || "Your booking could not be created. Please try again."
        );
      }

      // Smooth client router push to escrow payment page
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
    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{ backgroundColor: Theme.primaryColor }}
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin text-base" style={{ color: Theme.secondaryColor }} />
            <span>Creating Secure Booking...</span>
          </>
        ) : (
          <>
            <FaLock className="text-xs" style={{ color: Theme.secondaryColor }} />
            <span>Continue to Payment</span>
          </>
        )}
      </button>

      {error && (
        <div 
          role="alert" 
          className="flex items-center gap-2 p-3 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 max-w-md"
        >
          <FaExclamationCircle className="text-sm shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
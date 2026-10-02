"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBooking } from "@/app/actions/booking"

type Props = {
  propertyId: string
}

export default function ContinueToPaymentButton({
  propertyId,
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleContinue = async () => {
    try {
      setLoading(true)
      setError("")

      const result = await createBooking(propertyId)

      if (result.success) {
        router.push(
          `/dashboard/student/payment/${result.bookingId}`
        )
      }
    } catch (error) {
      console.error(error)
      setError("Unable to create your booking. Please try again.")
      setLoading(false)
    }
  }

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
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
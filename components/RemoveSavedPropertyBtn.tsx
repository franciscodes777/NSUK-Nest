"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { FaHeart } from "react-icons/fa6"
import { toggleSavedProperty } from "@/app/actions/student"

type Props = {
  propertyId: string
}

export default function RemoveSavedPropertyButton({ propertyId }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRemove = () => {
    startTransition(async () => {
      await toggleSavedProperty(propertyId)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      <FaHeart />

      {isPending ? "Removing..." : "Remove"}
    </button>
  )
}
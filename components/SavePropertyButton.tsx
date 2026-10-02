"use client"

import { useState, useTransition } from "react"
import { FaHeart } from "react-icons/fa"
import { toggleSavedProperty } from "@/app/actions/student"

type SavePropertyButtonProps = {
  propertyId: string
  initialSaved?: boolean
}

export default function SavePropertyButton({
  propertyId,
  initialSaved = false,
}: SavePropertyButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const result = await toggleSavedProperty(propertyId)

      if (result.error) {
        return
      }

      setSaved(result.saved ?? false)
    })
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isPending}
      className={`flex h-12 w-12 items-center justify-center rounded-xl border transition ${
        saved
          ? "border-red-200 text-red-500 bg-red-50"
          : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
      } ${
        isPending ? "opacity-60 cursor-not-allowed" : ""
      }`}
      title={saved ? "Remove from saved" : "Save property"}
      aria-label={saved ? "Remove from saved" : "Save property"}
    >
      <FaHeart />
    </button>
  )
}
"use client"

import { useRef, useState } from "react"
import {
FaUser,
FaCamera,
FaSpinner,
FaTrash,
} from "react-icons/fa"

type ProfileImageUploadProps = {
currentImage?: string
name?: string
}

export default function ProfileImageUpload({
currentImage = "",
name = "",
}: ProfileImageUploadProps) {
const fileInputRef = useRef<HTMLInputElement | null>(null)

const [preview, setPreview] = useState(currentImage)
const [uploading, setUploading] = useState(false)
const [removing, setRemoving] = useState(false)
const [status, setStatus] = useState("")

async function uploadToCloudinary(file: File) {
const signatureResponse = await fetch("/api/cloudinary/sign", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
type: "profile",
}),
})


if (!signatureResponse.ok) {
  const errorText = await signatureResponse.text()
  throw new Error(
    `Cloudinary signature failed: ${errorText || signatureResponse.status}`
  )
}

const signatureData = await signatureResponse.json()

const formData = new FormData()

formData.append("file", file)
formData.append("api_key", signatureData.apiKey)
formData.append(
  "timestamp",
  String(signatureData.timestamp)
)
formData.append(
  "signature",
  signatureData.signature
)
formData.append(
  "folder",
  signatureData.folder
)

const uploadResponse = await fetch(
  `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
  {
    method: "POST",
    body: formData,
  }
)

if (!uploadResponse.ok) {
  const errorText = await uploadResponse.text()

  throw new Error(
    `Cloudinary upload failed: ${
      errorText || uploadResponse.status
    }`
  )
}

const data = await uploadResponse.json()

if (!data.secure_url) {
  throw new Error(
    "Cloudinary uploaded the image but returned no image URL."
  )
}

return data.secure_url as string


}

async function saveImageToProfile(image: string) {
const response = await fetch("/api/profile/image", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
image,
}),
})


const responseText = await response.text()

let data: { error?: string } = {}

try {
  data = responseText
    ? JSON.parse(responseText)
    : {}
} catch {
  // Response was not JSON.
}

if (!response.ok) {
  throw new Error(
    data.error ||
      responseText ||
      `Profile save failed (${response.status})`
  )
}


}

async function handleImageChange(
event: React.ChangeEvent<HTMLInputElement>
) {
const file = event.target.files?.[0]


if (!file) return

if (!file.type.startsWith("image/")) {
  setStatus("Please select an image file.")
  return
}

if (file.size > 5 * 1024 * 1024) {
  setStatus("Image must be 5MB or smaller.")
  return
}

try {
  setUploading(true)
  setStatus("Uploading photo...")

  const url = await uploadToCloudinary(file)

  setStatus("Saving profile photo...")

  await saveImageToProfile(url)

  setPreview(url)
  setStatus("Profile photo updated successfully.")
} catch (error) {
  console.error("Profile photo error:", error)

  setStatus(
    error instanceof Error
      ? error.message
      : "Profile photo upload failed."
  )
} finally {
  setUploading(false)

  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
}


}

async function handleRemove() {
if (!preview || removing || uploading) return


const previousImage = preview

try {
  setRemoving(true)
  setStatus("Removing photo...")

  await saveImageToProfile("")

  setPreview("")
  setStatus("Profile photo removed")
} catch (error) {
  console.error("Profile photo removal error:", error)

  setPreview(previousImage)

  setStatus(
    error instanceof Error
      ? error.message
      : "Could not remove profile photo."
  )
} finally {
  setRemoving(false)
}


}

const initial = name
? name.charAt(0).toUpperCase()
: "U"

return ( <div className="flex flex-col items-center sm:flex-row sm:items-center gap-6"> <div className="relative"> <div className="h-24 w-24 rounded-full overflow-hidden bg-green-50 border border-gray-200 flex items-center justify-center">
{preview ? (
<img
src={preview}
alt={`${name || "User"} profile`}
className="h-full w-full object-cover"
/>
) : ( <div className="flex h-full w-full items-center justify-center text-[#075e3b]">
{name ? ( <span className="text-2xl font-semibold">
{initial} </span>
) : ( <FaUser className="text-3xl" />
)} </div>
)} </div>


    <button
      type="button"
      onClick={() =>
        fileInputRef.current?.click()
      }
      disabled={uploading || removing}
      className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-[#075e3b] text-white flex items-center justify-center hover:bg-green-700 transition disabled:opacity-60"
      aria-label="Change profile photo"
    >
      {uploading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <FaCamera />
      )}
    </button>
  </div>

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="hidden"
  />

  <div className="flex flex-col gap-3">
    <button
      type="button"
      onClick={() =>
        fileInputRef.current?.click()
      }
      disabled={uploading || removing}
      className="w-fit rounded-lg bg-[#075e3b] px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-60"
    >
      {uploading ? "Uploading..." : "Change Photo"}
    </button>

    {preview && (
      <button
        type="button"
        onClick={handleRemove}
        disabled={uploading || removing}
        className="flex w-fit items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
      >
        {removing ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaTrash />
        )}

        {removing ? "Removing..." : "Remove"}
      </button>
    )}

    {status && (
      <p
        className={`text-sm ${
          status.includes("successfully") ||
          status === "Profile photo removed"
            ? "text-green-600"
            : status.includes("failed") ||
                status.includes("Failed") ||
                status.includes("error") ||
                status.includes("Error")
              ? "text-red-600"
              : "text-gray-500"
        }`}
      >
        {status}
      </p>
    )}
  </div>
</div>


)
}

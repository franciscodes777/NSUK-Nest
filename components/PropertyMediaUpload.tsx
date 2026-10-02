"use client"

import { useEffect, useState } from "react"
import { FaImage, FaVideo, FaCloudUploadAlt } from "react-icons/fa"

export default function PropertyMediaUpload() {
  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ])

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ])

  const [imageUrls, setImageUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ])

  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState("")

  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")

  async function uploadToCloudinary(
    file: File,
    resourceType: "image" | "video"
  ) {
    const signatureResponse = await fetch("/api/cloudinary/sign", {
      method: "POST",
    })

    if (!signatureResponse.ok) {
      throw new Error("Could not create Cloudinary signature")
    }

    const signatureData = await signatureResponse.json()

    const formData = new FormData()

    formData.append("file", file)
    formData.append("api_key", signatureData.apiKey)
    formData.append("timestamp", String(signatureData.timestamp))
    formData.append("signature", signatureData.signature)
    formData.append("folder", signatureData.folder)

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    )

    if (!uploadResponse.ok) {
      throw new Error("Cloudinary upload failed")
    }

    const data = await uploadResponse.json()

    return data.secure_url as string
  }

  const handleImageChange = async (
    index: number,
    file: File | undefined
  ) => {
    if (!file) return

    try {
      setUploading(true)
      setUploadStatus(`Uploading ${index === 0 ? "main image" : `image ${index + 1}`}...`)

      const previewUrl = URL.createObjectURL(file)

      const updatedImages = [...images]
      updatedImages[index] = file
      setImages(updatedImages)

      const updatedPreviews = [...imagePreviews]

      if (updatedPreviews[index]) {
        URL.revokeObjectURL(updatedPreviews[index]!)
      }

      updatedPreviews[index] = previewUrl
      setImagePreviews(updatedPreviews)

      const url = await uploadToCloudinary(file, "image")

      const updatedUrls = [...imageUrls]
      updatedUrls[index] = url
      setImageUrls(updatedUrls)

      setUploadStatus("Upload complete")
    } catch (error) {
      console.error(error)
      setUploadStatus("Image upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleVideoChange = async (file: File | undefined) => {
    if (!file) return

    try {
      setUploading(true)
      setUploadStatus("Uploading video...")

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }

      setVideo(file)
      setVideoPreview(URL.createObjectURL(file))

      const url = await uploadToCloudinary(file, "video")

      setVideoUrl(url)
      setUploadStatus("Video upload complete")
    } catch (error) {
      console.error(error)
      setUploadStatus("Video upload failed")
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview)
        }
      })

      if (videoPreview) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [imagePreviews, videoPreview])

  const imageLabels = [
    "Main Image",
    "Image 2",
    "Image 3",
    "Image 4",
    "Image 5",
  ]

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">

      <div className="mb-6">
        <h3 className="font-bold text-slate-900">
          Photos & Video
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          Upload 5 clear photos and a video tour of the property.
        </p>
      </div>

      {/* Hidden values submitted with the main form */}
      {imageUrls.map((url, index) => (
        <input
          key={index}
          type="hidden"
          name={`image${index + 1}`}
          value={url || ""}
        />
      ))}

      <input
        type="hidden"
        name="video"
        value={videoUrl}
      />

      {/* IMAGES */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FaImage className="text-[#075e3b]" />

          <h4 className="font-semibold text-slate-800">
            Property Photos
          </h4>
        </div>

        <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">

          {/* MAIN IMAGE */}
          <label className="relative cursor-pointer md:col-span-2 md:row-span-2">
            <div className="h-72 overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-slate-300 md:h-[420px]">

              {imagePreviews[0] ? (
                <img
                  src={imagePreviews[0]}
                  alt="Main property preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <FaCloudUploadAlt className="text-4xl text-[#075e3b] mb-3" />

                  <p className="font-semibold text-slate-700">
                    Upload Main Image
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    This will be the primary property image
                  </p>
                </div>
              )}

            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) =>
                handleImageChange(0, e.target.files?.[0])
              }
            />

            <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              Main Image
            </span>
          </label>

          {/* OTHER 4 IMAGES */}
          {[1, 2, 3, 4].map((index) => (
            <label
              key={index}
              className="relative cursor-pointer"
            >
              <div className="h-40 overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-slate-300 md:h-auto">

                {imagePreviews[index] ? (
                  <img
                    src={imagePreviews[index]!}
                    alt={`${imageLabels[index]} preview`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-40 flex-col items-center justify-center text-center p-4">
                    <FaCloudUploadAlt className="text-2xl text-[#075e3b] mb-2" />

                    <p className="text-sm font-semibold text-slate-700">
                      {imageLabels[index]}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Click to upload
                    </p>
                  </div>
                )}

              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) =>
                  handleImageChange(index, e.target.files?.[0])
                }
              />

              <span className="absolute top-2 left-2 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {imageLabels[index]}
              </span>
            </label>
          ))}

        </div>
      </div>

      {/* VIDEO */}
      <div className="mt-8">

        <div className="flex items-center gap-2 mb-4">
          <FaVideo className="text-[#075e3b]" />

          <h4 className="font-semibold text-slate-800">
            Video Tour
          </h4>
        </div>

        <label className="block cursor-pointer">
          <div className="h-72 md:h-[400px] overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-slate-300">

            {videoPreview ? (
              <video
                controls
                src={videoPreview}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <FaVideo className="text-4xl text-[#075e3b] mb-3" />

                <p className="font-semibold text-slate-700">
                  Upload Video Tour
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Give students a closer look at the accommodation.
                </p>
              </div>
            )}

          </div>

          <input
            type="file"
            accept="video/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) =>
              handleVideoChange(e.target.files?.[0])
            }
          />
        </label>

        {video && (
          <p className="mt-2 text-xs text-slate-500">
            Selected: {video.name}
          </p>
        )}

      </div>

      {uploadStatus && (
        <p className="mt-4 text-sm text-slate-500">
          {uploadStatus}
        </p>
      )}

    </section>
  )
}
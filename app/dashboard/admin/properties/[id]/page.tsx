import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  FaArrowLeft,
  FaBed,
  FaBath,
  FaBolt,
  FaBuilding,
  FaCar,
  FaCheck,
  FaCouch,
  FaDoorOpen,
  FaHome,
  FaKey,
  FaShieldAlt,
  FaTint,
  FaUtensils,
  FaVideo,
  FaWater,
  FaWifi,
  FaTimes,
} from "react-icons/fa"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { updatePropertyStatus } from "@/app/actions/admin"

type Property = {
  id: string
  name?: string
  location?: string
  address?: string
  type?: string
  price?: number | string
  description?: string
  features?: string[] | Record<string, boolean> | string
  images?: string[]
  video?: string
  status?: string
  agentName?: string
  agentEmail?: string
  agentImage?: string
}

function formatFeatureName(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

function getPropertyFeatures(property: Property): string[] {
  const result: string[] = []

  if (Array.isArray(property.features)) {
    property.features.forEach((feature) => {
      if (feature && !result.includes(feature)) {
        result.push(feature)
      }
    })
  }

  if (
    typeof property.features === "string" &&
    property.features.trim()
  ) {
    property.features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean)
      .forEach((feature) => {
        if (!result.includes(feature)) {
          result.push(feature)
        }
      })
  }

  if (
    property.features &&
    typeof property.features === "object" &&
    !Array.isArray(property.features)
  ) {
    Object.entries(property.features).forEach(([key, value]) => {
      if (value === true) {
        const formatted = formatFeatureName(key)

        if (!result.includes(formatted)) {
          result.push(formatted)
        }
      }
    })
  }

  return result
}

function getFeatureIcon(feature: string) {
  const value = feature.toLowerCase()

  if (value.includes("bedroom")) return <FaBed />
  if (value.includes("bathroom")) return <FaBath />
  if (value.includes("electricity")) return <FaBolt />
  if (value.includes("water") && !value.includes("borehole")) {
    return <FaTint />
  }
  if (value.includes("security")) return <FaShieldAlt />
  if (value.includes("parking")) return <FaCar />
  if (value.includes("internet")) return <FaWifi />
  if (value.includes("borehole")) return <FaWater />
  if (value.includes("furnished")) return <FaCouch />
  if (value.includes("kitchen")) return <FaUtensils />
  if (value.includes("wardrobe")) return <FaDoorOpen />
  if (value.includes("balcony")) return <FaHome />

  return <FaCheck />
}

export default async function AdminPropertyReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth")
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard")
  }

  const { id } = await params

  const propertySnapshot = await adminDb
    .collection("properties")
    .doc(id)
    .get()

  if (!propertySnapshot.exists) {
    notFound()
  }

  const property: Property = {
    id: propertySnapshot.id,
    ...(propertySnapshot.data() as Omit<Property, "id">),
  }

  const propertyFeatures = getPropertyFeatures(property)

  const images = Array.isArray(property.images)
    ? property.images.filter(Boolean)
    : []

  const approveAction = updatePropertyStatus.bind(
    null,
    property.id,
    "approved"
  )

  const rejectAction = updatePropertyStatus.bind(
    null,
    property.id,
    "rejected"
  )

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-10">

      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/dashboard/admin/properties"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#075e3b] mb-4"
        >
          <FaArrowLeft />
          Back to Pending Approvals
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {property.name || "Property Review"}
            </h1>

            <p className="text-slate-500 mt-1">
              Review this listing before making it available to students.
            </p>
          </div>

          <span
            className={`w-fit px-4 py-2 rounded-full text-sm font-semibold ${
              property.status === "approved"
                ? "bg-green-100 text-green-700"
                : property.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {property.status
              ? property.status.charAt(0).toUpperCase() +
                property.status.slice(1)
              : "Pending"}
          </span>
        </div>
      </div>

      {/* IMAGE GALLERY */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 mb-6">

        <div className="flex items-center gap-2 mb-5">
          <FaBuilding className="text-[#075e3b]" />
          <h2 className="text-lg font-bold text-slate-900">
            Property Gallery
          </h2>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="relative md:col-span-2 md:row-span-2 h-80 md:h-full min-h-[320px] rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={images[0]}
                alt={property.name || "Property image"}
                fill
                className="object-cover"
              />
            </div>

            {images.slice(1, 5).map((image, index) => (
              <div
                key={index}
                className="relative h-40 rounded-xl overflow-hidden bg-slate-100"
              >
                <Image
                  src={image}
                  alt={`${property.name || "Property"} image ${
                    index + 2
                  }`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}

          </div>
        ) : (
          <div className="h-64 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            No images uploaded
          </div>
        )}

      </section>

      {/* PROPERTY OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-slate-900 mb-5">
            Property Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-xs text-slate-400">
                Property Type
              </p>
              <p className="font-semibold text-slate-800 mt-1">
                {property.type || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Price
              </p>
              <p className="font-semibold text-slate-800 mt-1">
                ₦{Number(property.price || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Location
              </p>
              <p className="font-semibold text-slate-800 mt-1">
                {property.location || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Address
              </p>
              <p className="font-semibold text-slate-800 mt-1">
                {property.address || "Not provided"}
              </p>
            </div>

          </div>

          <div className="mt-8">
            <h3 className="font-bold text-slate-900 mb-3">
              Description
            </h3>

            <p className="text-sm text-slate-600 leading-7">
              {property.description || "No description provided."}
            </p>
          </div>

        </section>

        {/* AGENT */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6">

          <h2 className="text-lg font-bold text-slate-900 mb-5">
            Agent / Owner
          </h2>

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-[#075e3b]/10 flex items-center justify-center overflow-hidden">

              {property.agentImage ? (
                <Image
                  src={property.agentImage}
                  alt={property.agentName || "Agent"}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaKey className="text-[#075e3b]" />
              )}

            </div>

            <div>
              <p className="font-bold text-slate-900">
                {property.agentName || "Unknown Agent"}
              </p>

              <p className="text-sm text-slate-500 break-all">
                {property.agentEmail || "No email"}
              </p>
            </div>

          </div>

        </section>

      </div>

      {/* FEATURES */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">

        <h2 className="text-lg font-bold text-slate-900 mb-5">
          Features & Amenities
        </h2>

        {propertyFeatures.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

            {propertyFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
              >
                <span className="text-[#075e3b]">
                  {getFeatureIcon(feature)}
                </span>

                <span className="text-sm font-semibold text-slate-700">
                  {feature}
                </span>
              </div>
            ))}

          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No features have been added.
          </p>
        )}

      </section>

      {/* VIDEO */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">

        <div className="flex items-center gap-2 mb-5">
          <FaVideo className="text-[#075e3b]" />

          <h2 className="text-lg font-bold text-slate-900">
            Property Video
          </h2>
        </div>

        {property.video ? (
          <video
            controls
            className="w-full max-h-[550px] rounded-xl bg-black"
          >
            <source src={property.video} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="h-64 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            No video uploaded
          </div>
        )}

      </section>

      {/* ACTIONS */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">

        <h2 className="text-lg font-bold text-slate-900">
          Review Decision
        </h2>

        <p className="text-sm text-slate-500 mt-1 mb-5">
          Approve this property to make it available to students, or reject
          it if it does not meet the platform requirements.
        </p>

        <div className="flex flex-wrap gap-3">

          <form action={approveAction}>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-[#075e3b] text-white font-semibold hover:bg-[#064d31] transition"
            >
              <FaCheck />
              Approve Property
            </button>
          </form>

          <form action={rejectAction}>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
            >
              <FaTimes />
              Reject Property
            </button>
          </form>

          <Link
            href="/dashboard/admin/properties"
            className="px-5 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </Link>

        </div>

      </section>

    </main>
  )
}
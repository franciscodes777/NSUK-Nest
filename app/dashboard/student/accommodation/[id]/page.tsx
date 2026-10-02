import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  FaMapMarkerAlt,FaBed,FaShower,FaTint,FaBolt,
  FaShieldAlt,FaCar,FaWifi,
  FaWater,FaCouch,FaUtensils,
  FaDoorOpen,FaHome,
} from "react-icons/fa"
import { Theme } from "@/components/theme"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import SavePropertyButton from "@/components/SavePropertyButton"

export const dynamic = "force-dynamic"

type Property = {
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
}

type PageProps = {
  params: Promise<{ id: string }>
}

function formatFeatureName(value: string): string {
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
  if (value.includes("bathroom")) return <FaShower />
  if (value.includes("electricity")) return <FaBolt />
  if (value.includes("water")) return <FaTint />
  if (value.includes("security")) return <FaShieldAlt />
  if (value.includes("parking")) return <FaCar />
  if (value.includes("internet")) return <FaWifi />
  if (value.includes("borehole")) return <FaWater />
  if (value.includes("furnished")) return <FaCouch />
  if (value.includes("kitchen")) return <FaUtensils />
  if (value.includes("wardrobe")) return <FaDoorOpen />
  if (value.includes("balcony")) return <FaHome />

  return <FaHome />
}

export default async function AccommodationDetails({
  params,
}: PageProps) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  const { id } = await params

  const propertySnapshot = await adminDb
    .collection("properties")
    .doc(id)
    .get()

  if (!propertySnapshot.exists) {
    notFound()
  }

  const property = propertySnapshot.data() as Property

  // Students can only view approved properties
  if (property.status !== "approved") {
    redirect("/dashboard/student/accommodation")
  }

  // Get the logged-in student's saved properties
  const userSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get()

  const userData = userSnapshot.empty
    ? {}
    : userSnapshot.docs[0].data()

  const savedProperties = Array.isArray(userData.savedProperties)
    ? userData.savedProperties
    : []

  const isSaved = savedProperties.includes(id)

  const images = Array.isArray(property.images)
    ? property.images.filter(
        (image): image is string =>
          typeof image === "string" && image.trim() !== ""
      )
    : []

  const features = getPropertyFeatures(property)

  const hasFeature = (name: string) => {
    return features.some(
      (feature) => feature.toLowerCase() === name.toLowerCase()
    )
  }

  const price = Number(property.price || 0)

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Back to accommodations */}
        <Link
          href="/dashboard/student/accommodation"
          className="mb-6 inline-block text-sm font-medium transition-colors"
          style={{ color: Theme.primaryColor }}
        >
          ← Back to Accommodations
        </Link>

        {/* Photo Gallery */}
        <section className="grid gap-3 md:grid-cols-4 md:grid-rows-2">

          {/* Main Image */}
          <div className="h-72 overflow-hidden rounded-2xl bg-gray-200 md:col-span-2 md:row-span-2 md:h-[500px]">
            {images[0] ? (
              <img
                src={images[0]}
                alt={property.name || "Main accommodation view"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Second Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            {images[1] ? (
              <img
                src={images[1]}
                alt="Accommodation exterior"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Third Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            {images[2] ? (
              <img
                src={images[2]}
                alt="Accommodation interior"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Fourth Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            {images[3] ? (
              <img
                src={images[3]}
                alt="Accommodation bedroom"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Fifth Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            {images[4] ? (
              <img
                src={images[4]}
                alt="Accommodation bathroom"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

        </section>

        {/* Property Information */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <span
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{
                  backgroundColor: `${Theme.primaryColor}15`,
                  color: Theme.primaryColor,
                }}
              >
                Available
              </span>

              <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                {property.name || "Unnamed Property"}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-gray-500">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs shadow-sm"
                  style={{
                    backgroundColor: Theme.primaryColor,
                    color: Theme.secondaryColor,
                  }}
                >
                  <FaMapMarkerAlt />
                </span>

                {property.location || "Location not provided"}
              </p>
            </div>

            <div className="flex items-center gap-5">

              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: Theme.primaryColor }}
                >
                  ₦{price.toLocaleString()}
                </p>

                <p className="text-sm text-gray-500">
                  per year
                </p>
              </div>

              {/* Save */}
              <SavePropertyButton
                propertyId={id}
                initialSaved={isSaved}
              />

            </div>

          </div>

          {/* Property Type */}
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Property Type
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {property.type || "Not provided"}
            </p>
          </div>

        </section>

        {/* Video Tour */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            Video Tour
          </h2>

          <p className="mt-2 text-gray-500">
            Take a closer look at the accommodation.
          </p>

          <div className="mt-5 flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">

            {property.video ? (
              <video
                controls
                className="h-full w-full object-cover"
                src={property.video}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-gray-400">
                No video uploaded.
              </p>
            )}

          </div>

        </section>

        {/* Property Features */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            Property Features
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaBed
                  className="text-xl"
                  style={{ color: Theme.primaryColor }}
                />
                Bedroom
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {hasFeature("Bedroom")
                  ? "Available"
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaShower
                  className="text-xl"
                  style={{ color: Theme.primaryColor }}
                />
                Bathroom
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {hasFeature("Bathroom")
                  ? "Available"
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaTint
                  className="text-xl"
                  style={{ color: Theme.primaryColor }}
                />
                Water
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {hasFeature("Water")
                  ? "Available"
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaBolt
                  className="text-xl"
                  style={{ color: Theme.primaryColor }}
                />
                Electricity
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {hasFeature("Electricity")
                  ? "Available"
                  : "Not specified"}
              </p>
            </div>

          </div>

          {/* Additional Features */}
          {features.some(
            (feature) =>
              !["bedroom", "bathroom", "water", "electricity"].includes(
                feature.toLowerCase()
              )
          ) && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Additional Features
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {features
                  .filter(
                    (feature) =>
                      ![
                        "bedroom",
                        "bathroom",
                        "water",
                        "electricity",
                      ].includes(feature.toLowerCase())
                  )
                  .map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 rounded-xl bg-gray-50 p-4 text-gray-700"
                    >
                      <span style={{ color: Theme.primaryColor }}>
                        {getFeatureIcon(feature)}
                      </span>

                      <span className="font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </section>

        {/* Description */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            About this accommodation
          </h2>

          <p className="mt-4 max-w-4xl whitespace-pre-line leading-7 text-gray-600">
            {property.description ||
              "No description has been added yet."}
          </p>

        </section>

        {/* Location */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            Location
          </h2>

          <div className="mt-5 flex h-64 flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-gray-100">

            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full shadow-md"
              style={{ backgroundColor: Theme.primaryColor }}
            >
              <FaMapMarkerAlt
                className="text-xl"
                style={{ color: Theme.secondaryColor }}
              />
            </div>

            <p className="font-medium text-gray-600">
              {property.location || "Location not provided"}
            </p>

            {property.address && (
              <p className="mt-1 text-sm text-gray-500">
                {property.address}
              </p>
            )}

          </div>

        </section>

        {/* Booking */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Annual rent
              </p>

              <p
                className="text-3xl font-bold"
                style={{ color: Theme.primaryColor }}
              >
                ₦{price.toLocaleString()}
              </p>
            </div>

            <button
              className="rounded-xl px-8 py-4 font-semibold text-white transition hover:opacity-95 shadow-md"
              style={{ backgroundColor: Theme.primaryColor }}
            >
              Book Accommodation
            </button>

          </div>

        </section>

        {/* Temporary ID */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Listing ID: {id}
        </p>

      </div>
    </main>
  )
}


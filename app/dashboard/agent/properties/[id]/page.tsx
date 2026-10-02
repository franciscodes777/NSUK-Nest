import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  FaBed,
  FaBath,
  FaTint,
  FaBolt,
  FaShieldAlt,
  FaCar,
  FaWifi,
  FaWater,
  FaCouch,
  FaUtensils,
  FaDoorOpen,
  FaHome,
} from "react-icons/fa";

type Property = {
  name?: string;
  location?: string;
  address?: string;
  type?: string;
  price?: number | string;
  description?: string;
  features?: string[] | Record<string, boolean> | string;
  images?: string[];
  video?: string;
  status?: string;
  agentId?: string;
  agentEmail?: string;
  agentName?: string;
  agentImage?: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatFeatureName(value: string): string {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function getPropertyFeatures(property: Property): string[] {
  const result: string[] = [];

  if (Array.isArray(property.features)) {
    property.features.forEach((feature) => {
      if (feature && !result.includes(feature)) {
        result.push(feature);
      }
    });
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
          result.push(feature);
        }
      });
  }

  if (
    property.features &&
    typeof property.features === "object" &&
    !Array.isArray(property.features)
  ) {
    Object.entries(property.features).forEach(([key, value]) => {
      if (value === true) {
        const formatted = formatFeatureName(key);

        if (!result.includes(formatted)) {
          result.push(formatted);
        }
      }
    });
  }

  return result;
}

function getFeatureIcon(feature: string) {
  const normalized = feature.toLowerCase();

  if (normalized.includes("bedroom")) {
    return <FaBed className="text-[#075e3b]" />;
  }

  if (normalized.includes("bathroom")) {
    return <FaBath className="text-[#075e3b]" />;
  }

  if (normalized === "water" || normalized.includes("water")) {
    return <FaTint className="text-[#075e3b]" />;
  }

  if (normalized.includes("electricity")) {
    return <FaBolt className="text-[#075e3b]" />;
  }

  if (normalized.includes("security")) {
    return <FaShieldAlt className="text-[#075e3b]" />;
  }

  if (normalized.includes("parking")) {
    return <FaCar className="text-[#075e3b]" />;
  }

  if (
    normalized.includes("internet") ||
    normalized.includes("wifi")
  ) {
    return <FaWifi className="text-[#075e3b]" />;
  }

  if (normalized.includes("borehole")) {
    return <FaWater className="text-[#075e3b]" />;
  }

  if (normalized.includes("furnished")) {
    return <FaCouch className="text-[#075e3b]" />;
  }

  if (normalized.includes("kitchen")) {
    return <FaUtensils className="text-[#075e3b]" />;
  }

  if (normalized.includes("wardrobe")) {
    return <FaDoorOpen className="text-[#075e3b]" />;
  }

  if (normalized.includes("balcony")) {
    return <FaHome className="text-[#075e3b]" />;
  }

  return <FaHome className="text-[#075e3b]" />;
}

function getStatusStyles(status?: string) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "pending":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default async function AgentPropertyDetailsPage({
  params,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard/student");
  }

  const { id } = await params;

  const propertyRef = adminDb.collection("properties").doc(id);
  const propertySnapshot = await propertyRef.get();

  if (!propertySnapshot.exists) {
    notFound();
  }

  const property = propertySnapshot.data() as Property;

  const isOwner =
    property.agentId === session.user.id ||
    property.agentEmail === session.user.email;

  if (!isOwner) {
    notFound();
  }

  const images = Array.isArray(property.images)
    ? property.images.filter(Boolean)
    : [];

  const propertyFeatures = getPropertyFeatures(property);
  const status = property.status || "pending";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/agent/properties"
            className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
          >
            ←
          </Link>

          <div>
            <p className="text-sm text-slate-500">
              Agent / Owner Dashboard
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Property Details
            </h1>
          </div>
        </div>
      </header>

      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">
                {property.name || "Untitled Property"}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyles(
                  status
                )}`}
              >
                {status}
              </span>
            </div>

            <p className="mt-2 text-slate-500">
              {property.location || "Location not provided"}
            </p>
          </div>

          <Link
            href={`/dashboard/agent/properties/${id}/edit`}
            className="rounded-lg bg-[#075e3b] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#064d31]"
          >
            Edit Property
          </Link>
        </div>

        <section className="mb-8">
          {images.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-80 overflow-hidden rounded-2xl bg-slate-200 md:h-[420px]">
                <img
                  src={images[0]}
                  alt={property.name || "Property image"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {images.slice(1, 5).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="h-38 overflow-hidden rounded-2xl bg-slate-200 md:h-[198px]"
                  >
                    <img
                      src={image}
                      alt={`${property.name || "Property"} ${
                        index + 2
                      }`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}

                {Array.from({
                  length: Math.max(
                    0,
                    4 - Math.min(Math.max(images.length - 1, 0), 4)
                  ),
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex h-38 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400 md:h-[198px]"
                  >
                    No image
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-200 text-slate-400 md:h-[420px]">
              No property images uploaded yet.
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900">
                Property Overview
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <div>
                  <p className="text-sm text-slate-500">
                    Property Type
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {property.type || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {property.location || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Full Address
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {property.address || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Annual Rent
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#075e3b]">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900">
                Description
              </h3>

              <p className="text-slate-600 mt-4 whitespace-pre-line leading-7">
                {property.description ||
                  "No description has been added yet."}
              </p>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900">
                Property Features
              </h3>

              <p className="text-sm text-slate-500 mt-1 mb-6">
                Facilities and features available in this property.
              </p>

              {propertyFeatures.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyFeatures.map((feature, index) => (
                    <div
                      key={`${feature}-${index}`}
                      className="flex items-center gap-3 border border-slate-200 rounded-xl p-4"
                    >
                      {getFeatureIcon(feature)}

                      <span className="text-sm font-medium text-slate-700">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">
                  No features have been added yet.
                </p>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900">
                Property Video
              </h3>

              {property.video ? (
                <video
                  src={property.video}
                  controls
                  className="w-full mt-4 rounded-xl bg-black"
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="flex h-64 mt-4 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  No property video uploaded yet.
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-sm text-slate-500">
                Rental Price
              </p>

              <p className="mt-2 text-3xl font-bold text-[#075e3b]">
                ₦{Number(property.price || 0).toLocaleString()}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                per year
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900">
                Listing Status
              </h3>

              <span
                className={`inline-block mt-3 rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyles(
                  status
                )}`}
              >
                {status}
              </span>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {status === "pending" &&
                  "This property is currently waiting for NSUK Nest admin approval."}

                {status === "approved" &&
                  "This property has been approved and is visible to students."}

                {status === "rejected" &&
                  "This property was rejected by NSUK Nest. Please review the listing and make the necessary changes."}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900">
                Listing Owner
              </h3>

              <p className="mt-3 font-semibold text-slate-900">
                {property.agentName ||
                  session.user.name ||
                  "Agent"}
              </p>

              <p className="mt-1 text-sm text-slate-500 break-words">
                {property.agentEmail ||
                  session.user.email}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
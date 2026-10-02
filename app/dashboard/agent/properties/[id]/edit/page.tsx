"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const featureOptions = [
  "Water",
  "Electricity",
  "Security",
  "Parking",
  "Internet",
  "Borehole",
  "Furnished",
  "Kitchen",
  "Wardrobe",
  "Balcony",
];

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/agent/properties/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load property");
        }

        const property = await response.json();

        setName(property.name || "");
        setLocation(property.location || "");
        setAddress(property.address || "");
        setType(property.type || "");
        setPrice(String(property.price ?? ""));
        setDescription(property.description || "");

        if (Array.isArray(property.features)) {
          setFeatures(property.features);
        } else if (
          property.features &&
          typeof property.features === "object"
        ) {
          const selectedFeatures = Object.entries(property.features)
            .filter(([, value]) => value === true)
            .map(([key]) =>
              key
                .replace(/([A-Z])/g, " $1")
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())
                .trim()
            );

          setFeatures(selectedFeatures);
        } else {
          const directFeatures = featureOptions.filter(
            (feature) =>
              property[
                feature.toLowerCase() as keyof typeof property
              ] === true
          );

          setFeatures(directFeatures);
        }
      } catch (error) {
        console.error("Error loading property:", error);
        setMessage("Failed to load property.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const toggleFeature = (feature: string) => {
    setFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature]
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`/api/agent/properties/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          address,
          type,
          price: Number(price),
          description,
          features,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update property");
      }

      setMessage("Property updated successfully.");

      setTimeout(() => {
        router.push(`/dashboard/agent/properties/${id}`);
        router.refresh();
      }, 700);
    } catch (error) {
      console.error("Error updating property:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update property."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Loading property...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <Link
          href={`/dashboard/agent/properties/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          ← Back to Property
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Property
            </h1>

            <p className="mt-2 text-gray-500">
              Update your property information below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Property Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Property Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                placeholder="e.g. Princess Sarah Lodge"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                placeholder="e.g. Keffi"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Address
              </label>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                placeholder="Enter full property address"
              />
            </div>

            {/* Property Type */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Property Type
              </label>

              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                placeholder="e.g. Self Contain"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Price
              </label>

              <div className="flex">
                <span className="flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-600">
                  ₦
                </span>

                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-r-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                  placeholder="300000"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600"
                placeholder="Describe the property..."
              />
            </div>

            {/* Features */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Property Features
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {featureOptions.map((feature) => (
                  <label
                    key={feature}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                      features.includes(feature)
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="h-4 w-4 accent-green-700"
                    />

                    <span className="font-medium text-gray-700">
                      {feature}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`rounded-lg p-4 text-sm ${
                  message.includes("successfully")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>

              <Link
                href={`/dashboard/agent/properties/${id}`}
                className="rounded-lg border border-gray-300 px-6 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Property = {
  id: string;
  name?: string;
  location?: string;
  type?: string;
  price?: number | string;
  images?: string[];
  status?: string;
};

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/agent/properties");

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();

        setProperties(data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Properties
            </h1>

            <p className="mt-1 text-gray-500">
              Manage the properties you have listed on NSUK Nest.
            </p>
          </div>

          <Link
            href="/dashboard/agent/properties/new"
            className="rounded-lg bg-green-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-green-600"
          >
            + Add Property
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">Loading properties...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && properties.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No properties yet
            </h2>

            <p className="mt-2 text-gray-500">
              Add your first property to start listing accommodations.
            </p>

            <Link
              href="/dashboard/agent/properties/new"
              className="mt-6 inline-block rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-600"
            >
              Add Your First Property
            </Link>
          </div>
        )}

        {/* Properties */}
        {!loading && properties.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div
                key={property.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm"
              >

                {/* Image */}
                <div className="h-52 bg-gray-200">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.name || "Property"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h2 className="text-lg font-bold text-gray-900">
                      {property.name || "Untitled Property"}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        property.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {property.status || "Pending"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    {property.location || "Location not provided"}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {property.type || "Property type not provided"}
                  </p>

                  <p className="mt-4 text-xl font-bold text-green-600">
                    ₦{Number(property.price || 0).toLocaleString()}
                  </p>

                  <Link
                  href={`/dashboard/agent/properties/${property.id}`}
                    className="mt-5 block rounded-lg border border-green-600 px-4 py-2 text-center font-medium text-green-600 transition hover:bg-green-50"
                  >
                    View Property
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}


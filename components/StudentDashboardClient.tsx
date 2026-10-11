"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  FaSearch,
  FaHeart,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHandPaper,
} from "react-icons/fa"
import UserMenu from "@/components/UserMenu"
import SavePropertyButton from "@/components/SavePropertyButton"

type Property = {
  id: string
  name?: string
  type?: string
  location?: string
  address?: string
  price?: number | string
  images?: string[]
}

type StudentDashboardClientProps = {
  properties: Property[]
  savedProperties: string[]
}

export default function StudentDashboardClient({
  properties,
  savedProperties,
}: StudentDashboardClientProps) {
  const [search, setSearch] = useState("")

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return properties
    }

    return properties.filter((property) => {
      const searchableText = [
        property.name,
        property.type,
        property.location,
        property.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return searchableText.includes(query)
    })
  }, [properties, search])

  const recommendedProperties = filteredProperties.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">
        <div>
          <p className="text-sm text-slate-500">
            Student Dashboard
          </p>

          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back
            <FaHandPaper className="text-[#075e3b] text-lg" />
          </h1>
        </div>

        <UserMenu />
      </header>

      <div className="p-6 lg:p-10">
        <div className="bg-[#075e3b] rounded-2xl p-6 lg:p-8 text-white">
          <h2 className="text-2xl font-bold">
            Find your next home
          </h2>

          <p className="text-white/75 mt-1">
            Search for verified accommodation around NSUK.
          </p>

          <div className="mt-6 bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <FaSearch className="text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by location or property name"
                className="w-full py-3 outline-none text-slate-700 text-sm"
              />
            </div>

            <button
              type="button"
              className="bg-[#075e3b] text-white px-6 py-3 rounded-lg font-semibold text-sm"
            >
              Search
            </button>
          </div>

          {search.trim() && (
            <p className="text-white/80 text-sm mt-3">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1
                ? "property"
                : "properties"}{" "}
              found
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
          <Link
            href="/dashboard/student/saved"
            className="bg-white border border-slate-200 rounded-2xl p-5 transition hover:shadow-md"
          >
            <p className="text-sm text-slate-500">
              Saved Properties
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {savedProperties.length}
            </p>
          </Link>

          <Link
            href="/dashboard/student/bookings"
            className="bg-white border border-slate-200 rounded-2xl p-5 transition hover:shadow-md"
          >
            <p className="text-sm text-slate-500">
              My Bookings
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              0
            </p>
          </Link>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm text-slate-500">
              Properties Viewed
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              0
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {search.trim()
                  ? "Search Results"
                  : "Recommended for you"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {search.trim()
                  ? "Properties matching your search."
                  : "Properties you might be interested in."}
              </p>
            </div>

            <Link
              href="/dashboard/student/accommodation"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#075e3b]"
            >
              View all
              <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {recommendedProperties.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <FaSearch className="mx-auto text-2xl text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No properties found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try searching for another location or property name.
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 text-sm font-semibold text-[#075e3b] hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendedProperties.map((property) => {
                const isSaved = savedProperties.includes(property.id)

                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="h-44 bg-slate-200 overflow-hidden">
                      {property.images?.[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.name || "Accommodation"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-sm text-slate-400">
                            Property Image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">
                            {property.name || "Unnamed Property"}
                          </h3>

                          <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                            <FaMapMarkerAlt className="text-[#075e3b] shrink-0" />

                            <span className="truncate">
                              {property.location ||
                                "Location not provided"}
                            </span>
                          </div>
                        </div>

                        <SavePropertyButton
                          propertyId={property.id}
                          initialSaved={isSaved}
                        />
                      </div>

                      <div className="mt-3">
                        <span className="text-xs text-slate-400">
                          {property.type || "Accommodation"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-5 gap-4">
                        <p className="font-bold text-[#075e3b]">
                          ₦
                          {Number(property.price || 0).toLocaleString()}
                          <span className="text-xs text-slate-400 font-normal">
                            /year
                          </span>
                        </p>

                        <Link
                          href={`/dashboard/student/accommodation/${property.id}`}
                          className="text-sm font-semibold text-slate-700 hover:text-[#075e3b]"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
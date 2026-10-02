import React from "react"
import Link from "next/link"
import {
  FaSearch,
  FaHeart,
  FaMapMarkerAlt,
  FaArrowRight,
  FaHandPaper,
} from "react-icons/fa"
import UserMenu from "@/components/UserMenu"

export default function StudentDashboard() {
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
                placeholder="Search by location or property name"
                className="w-full py-3 outline-none text-slate-700 text-sm"
              />
            </div>

            <button className="bg-[#075e3b] text-white px-6 py-3 rounded-lg font-semibold text-sm">
              Search
            </button>

          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm text-slate-500">
              Saved Properties
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              0
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-sm text-slate-500">
              My Bookings
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              0
            </p>
          </div>

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
                Recommended for you
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Properties you might be interested in.
              </p>
            </div>

            <Link
              href="/accommodation"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#075e3b]"
            >
              View all
              <FaArrowRight className="text-xs" />
            </Link>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {[1, 2, 3].map((property) => (

              <div
                key={property}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >

                <div className="h-44 bg-slate-200 flex items-center justify-center">
                  <span className="text-sm text-slate-400">
                    Property Image
                  </span>
                </div>

                <div className="p-5">

                  <div className="flex items-start justify-between">

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Student Apartment
                      </h3>

                      <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                        <FaMapMarkerAlt className="text-[#075e3b]" />
                        Keffi, Nasarawa
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-red-500">
                      <FaHeart />
                    </button>

                  </div>

                  <div className="flex items-center justify-between mt-5">

                    <p className="font-bold text-[#075e3b]">
                      ₦250,000
                      <span className="text-xs text-slate-400 font-normal">
                        /year
                      </span>
                    </p>

                    <Link
                      href="/accommodation"
                      className="text-sm font-semibold text-slate-700 hover:text-[#075e3b]"
                    >
                      View Details
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}


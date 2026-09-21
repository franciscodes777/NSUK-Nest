import React from "react"
import Link from "next/link"
import {
  FaHome,
  FaPlus,
  FaBuilding,
  FaClipboardList,
  FaEnvelope,
  FaUser,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaArrowRight,
} from "react-icons/fa"

export default function AgentDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">

        {/* LOGO */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link
            href="/"
            className="text-2xl font-bold text-[#075e3b]"
          >
            NSUK Nest
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2">

          <Link
            href="/dashboard/agent"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#075e3b]/10 text-[#075e3b] font-semibold"
          >
            <FaHome />
            Dashboard
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaBuilding />
            My Properties
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaPlus />
            Add Property
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaEnvelope />
            Enquiries
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaClipboardList />
            Payments
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaUser />
            Profile
          </Link>

        </nav>

        {/* HELP */}
        <div className="p-4 border-t border-slate-100">

          <div className="bg-[#075e3b]/5 rounded-xl p-4">

            <p className="text-sm font-semibold text-slate-800">
              Need help?
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Contact the NSUK Nest support team.
            </p>

            <Link
              href="/Contact"
              className="text-xs font-semibold text-[#075e3b] mt-3 inline-block"
            >
              Contact Support →
            </Link>

          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1">

        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">

          <div>

            <p className="text-sm text-slate-500">
              Agent / Owner Dashboard
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Welcome back 👋
            </h1>

          </div>

          <div className="flex items-center gap-5">

            <button className="relative text-slate-500 hover:text-[#075e3b]">
              <FaBell className="text-lg" />

              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#075e3b]/10 flex items-center justify-center text-[#075e3b] font-bold">
              A
            </div>

          </div>

        </header>

        {/* BODY */}
        <div className="p-6 lg:p-10">

          {/* WELCOME */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Manage your properties
              </h2>

              <p className="text-slate-500 mt-1">
                Add, manage and monitor your accommodation listings.
              </p>

            </div>

            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-[#075e3b] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:bg-[#064d31] transition"
            >
              <FaPlus />
              Add Property
            </Link>

          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Total Properties
                </p>

                <FaBuilding className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Approved
                </p>

                <FaCheckCircle className="text-green-600" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <FaClock className="text-yellow-500" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Enquiries
                </p>

                <FaEnvelope className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

            </div>

          </div>

          {/* PROPERTY MANAGEMENT */}
          <div className="mt-10">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  My Properties
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Manage your current accommodation listings.
                </p>

              </div>

              <Link
                href="#"
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#075e3b]"
              >
                View all
                <FaArrowRight className="text-xs" />
              </Link>

            </div>

            {/* PROPERTY TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Property
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Location
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Price
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 font-semibold text-slate-600">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {/* EMPTY STATE */}

                    <tr>

                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-14 h-14 rounded-full bg-[#075e3b]/10 flex items-center justify-center text-[#075e3b]">
                            <FaBuilding className="text-xl" />
                          </div>

                          <h3 className="font-bold text-slate-800 mt-4">
                            No properties yet
                          </h3>

                          <p className="text-sm text-slate-500 mt-1 max-w-sm">
                            You haven't added any accommodation listings.
                            Add your first property to get started.
                          </p>

                          <Link
                            href="#"
                            className="mt-5 inline-flex items-center gap-2 bg-[#075e3b] text-white px-5 py-2.5 rounded-lg font-semibold text-sm"
                          >
                            <FaPlus />
                            Add Property
                          </Link>

                        </div>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-10">

            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5">

              <Link
                href="#"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#075e3b] transition"
              >

                <FaPlus className="text-[#075e3b] text-xl" />

                <h3 className="font-bold text-slate-900 mt-4">
                  Add Property
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Create a new accommodation listing.
                </p>

              </Link>

              <Link
                href="#"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#075e3b] transition"
              >

                <FaEnvelope className="text-[#075e3b] text-xl" />

                <h3 className="font-bold text-slate-900 mt-4">
                  View Enquiries
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  See messages from interested students.
                </p>

              </Link>

              <Link
                href="#"
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#075e3b] transition"
              >

                <FaUser className="text-[#075e3b] text-xl" />

                <h3 className="font-bold text-slate-900 mt-4">
                  Edit Profile
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Update your account information.
                </p>

              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}
import React from "react"
import Link from "next/link"
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaMoneyBillWave,
  FaBell,
  FaUserShield,
  FaChartBar,
  FaCog,
  FaArrowRight,
} from "react-icons/fa"

export default function AdminDashboard() {
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

        {/* ADMIN LABEL */}
        <div className="px-5 pt-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <FaUserShield />
            Administrator
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 mt-2">

          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#075e3b]/10 text-[#075e3b] font-semibold"
          >
            <FaHome />
            Overview
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaUsers />
            Users
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaUserGraduate />
            Students
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaUserShield />
            Agents / Owners
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaBuilding />
            Properties
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaClock />
            Pending Approvals
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaMoneyBillWave />
            Payments
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaChartBar />
            Reports
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaCog />
            Settings
          </Link>

        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1">

        {/* TOP BAR */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">

          <div>
            <p className="text-sm text-slate-500">
              Administrator
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Dashboard Overview
            </h1>
          </div>

          <div className="flex items-center gap-5">

            <button className="relative text-slate-500 hover:text-[#075e3b]">
              <FaBell className="text-lg" />

              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#075e3b] flex items-center justify-center text-white font-bold">
              A
            </div>

          </div>

        </header>

        {/* BODY */}
        <div className="p-6 lg:p-10">

          {/* WELCOME */}
          <div className="mb-8">

            <h2 className="text-2xl font-bold text-slate-900">
              Welcome, Admin 👋
            </h2>

            <p className="text-slate-500 mt-1">
              Here's what's happening across NSUK Nest.
            </p>

          </div>

          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            {/* USERS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Total Users
                </p>

                <FaUsers className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Students + Agents
              </p>

            </div>

            {/* STUDENTS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Students
                </p>

                <FaUserGraduate className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Registered students
              </p>

            </div>

            {/* AGENTS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Agents / Owners
                </p>

                <FaUserShield className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Property providers
              </p>

            </div>

            {/* PROPERTIES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-500">
                  Properties
                </p>

                <FaBuilding className="text-[#075e3b]" />

              </div>

              <p className="text-3xl font-bold text-slate-900 mt-3">
                0
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Total listings
              </p>

            </div>

          </div>

          {/* APPROVALS */}
          <div className="mt-10">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Property Approvals
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Review accommodation listings submitted by agents.
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

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Property
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Agent / Owner
                      </th>

                      <th className="text-left px-6 py-4 font-semibold text-slate-600">
                        Location
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

                    <tr>

                      <td
                        colSpan={5}
                        className="px-6 py-16 text-center"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <FaCheckCircle className="text-xl" />
                          </div>

                          <h3 className="font-bold text-slate-800 mt-4">
                            No pending approvals
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            New property submissions will appear here.
                          </p>

                        </div>

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          {/* SYSTEM SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">

            {/* RECENT USERS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Recent Users
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Newly registered accounts.
                  </p>

                </div>

                <FaUsers className="text-[#075e3b]" />

              </div>

              <div className="py-12 text-center">

                <p className="text-sm text-slate-400">
                  No users yet.
                </p>

              </div>

            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Recent Activity
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Latest activity on the platform.
                  </p>

                </div>

                <FaChartBar className="text-[#075e3b]" />

              </div>

              <div className="py-12 text-center">

                <p className="text-sm text-slate-400">
                  No recent activity.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  )
}
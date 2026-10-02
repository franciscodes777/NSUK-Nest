import React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaUserShield,
  FaBuilding,
  FaCheckCircle,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
} from "react-icons/fa"
import { auth } from "@/auth"
import AdminNav from "@/components/AdminNav"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth")
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col">

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
        {/* <nav className="flex-1 p-4 space-y-2">

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
            href="/dashboard/admin/properties"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaBuilding />
            Properties
          </Link>

          <Link
            href="/dashboard/admin/properties"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaCheckCircle />
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

        </nav> */}
        <AdminNav />

        {/* ADMIN INFO */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-[#075e3b]/5 rounded-xl p-4">
            <p className="text-sm font-semibold text-slate-800">
              Administrator
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Manage NSUK Nest from here.
            </p>
          </div>
        </div>

      </aside>

      {/* PAGE CONTENT */}
      <section className="flex-1">
        {children}
      </section>

    </main>
  )
}
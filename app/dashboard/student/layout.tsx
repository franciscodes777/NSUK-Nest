import React from "react"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaClipboardList,
  FaUser,
} from "react-icons/fa"
import StudentNav from "@/components/StudentNav"

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  return (
    <main className="min-h-screen bg-slate-50 flex">

      {/* FIXED SIDEBAR */}
      <aside className="hidden lg:flex sticky left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col">

        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <Link
            href="/"
            className="text-2xl font-bold text-[#075e3b]"
          >
            NSUK Nest
          </Link>
        </div>


        <StudentNav/>

        {/* Bottom */}
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

      {/* PAGE CONTENT */}
      <section className="flex-1">
        {children}
      </section>

    </main>
  )
}
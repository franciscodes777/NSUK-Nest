import React from "react";
import Link from "next/link";
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import {
  FaHome,
  FaPlus,
  FaBuilding,
  FaClipboardList,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import AgentNav from "@/components/AgentNav";

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await auth()

if (!session?.user) {
  redirect("/login")
}

if (session.user.role !== "agent") {
  redirect("/dashboard/student")
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
            href="/dashboard/agent"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#075e3b]/10 text-[#075e3b] font-semibold"
          >
            <FaHome />
            Dashboard
          </Link>

          <Link
            href="/dashboard/agent/properties"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
          >
            <FaBuilding />
            My Properties
          </Link>

          <Link
            href="/dashboard/agent/properties/new"
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

        </nav> */}
        <AgentNav/>

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

      {/* PAGE CONTENT */}
      <section className="flex-1">
        {children}
      </section>

    </main>
  );
}
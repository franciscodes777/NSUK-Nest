"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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
import {
  GoSidebarCollapse,
  GoSidebarExpand,
} from "react-icons/go"
import { FiMenu, FiX } from "react-icons/fi"

export default function AdminNav() {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: FaHome,
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: FaUsers,
    },
    {
      label: "Students",
      href: "/dashboard/admin/students",
      icon: FaUserGraduate,
    },
    {
      label: "Agents / Owners",
      href: "/dashboard/admin/agents",
      icon: FaUserShield,
    },
    {
      label: "Properties",
      href: "/dashboard/admin/properties",
      icon: FaBuilding,
    },
    {
      label: "Pending Approvals",
      href: "/dashboard/admin/approvals",
      icon: FaCheckCircle,
    },
    {
      label: "Payments",
      href: "#",
      icon: FaMoneyBillWave,
    },
    {
      label: "Reports",
      href: "#",
      icon: FaChartBar,
    },
    {
      label: "Settings",
      href: "#",
      icon: FaCog,
    },
  ]

  const navigation = (
    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
      {items.map((item) => {
        const Icon = item.icon

        const active =
          item.href !== "#" &&
          (item.href === "/dashboard/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href))

        return (
          <Link
            key={item.label}
            href={item.href}
            title={collapsed ? item.label : undefined}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center ${
              collapsed ? "lg:justify-center lg:px-3" : "gap-3 px-4"
            } py-3 rounded-xl font-semibold transition ${
              active
                ? "bg-[#075e3b]/10 text-[#075e3b]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon className="shrink-0 text-lg" />

            <span className={collapsed ? "lg:hidden" : ""}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )

  const adminInfo = (
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
  )

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link
          href="/"
          className="text-xl font-bold text-[#075e3b]"
        >
          NSUK Nest
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
        >
          {mobileOpen ? (
            <FiX size={24} />
          ) : (
            <FiMenu size={24} />
          )}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="text-xl font-bold text-[#075e3b]"
          >
            NSUK Nest
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <FiX size={22} />
          </button>
        </div>

        {navigation}
        {adminInfo}
      </aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:flex ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {/* LOGO */}
        <div
          className={`flex h-20 items-center border-b border-slate-100 ${
            collapsed ? "justify-center px-2" : "px-6"
          }`}
        >
          <Link
            href="/"
            className="whitespace-nowrap text-xl font-bold text-[#075e3b]"
          >
            {collapsed ? "N" : "NSUK Nest"}
          </Link>
        </div>

        {/* COLLAPSE BUTTON */}
        <div
          className={`flex border-b border-slate-100 py-3 ${
            collapsed ? "justify-center px-2" : "justify-end px-4"
          }`}
        >
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#075e3b]"
          >
            {collapsed ? (
              <GoSidebarExpand size={20} />
            ) : (
              <GoSidebarCollapse size={20} />
            )}
          </button>
        </div>

        {navigation}

        {!collapsed && adminInfo}
      </aside>
    </>
  )
}
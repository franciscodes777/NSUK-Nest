"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconType } from "react-icons"
import { RiGraduationCapFill } from "react-icons/ri"
import {
  FaHome,
  FaPlus,
  FaBuilding,
  FaClipboardList,
  FaEnvelope,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa"
import {
  GoSidebarCollapse,
  GoSidebarExpand,
} from "react-icons/go"

export default function AgentNav() {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const items: {
    label: string
    href: string
    icon: IconType
  }[] = [
    {
      label: "Dashboard",
      href: "/dashboard/agent",
      icon: FaHome,
    },
    {
      label: "My Properties",
      href: "/dashboard/agent/properties",
      icon: FaBuilding,
    },
    {
      label: "Add Property",
      href: "/dashboard/agent/properties/new",
      icon: FaPlus,
    },
    {
      label: "Enquiries",
      href: "#",
      icon: FaEnvelope,
    },
    {
      label: "Payments",
      href: "#",
      icon: FaClipboardList,
    },
    {
      label: "Profile",
      href: "/dashboard/agent/profile",
      icon: FaUser,
    },
  ]

  useEffect(() => {
    setMounted(true)

    const mediaQuery = window.matchMedia("(max-width: 1023px)")

    const handleResize = () => {
      if (mediaQuery.matches) {
        setCollapsed(false)
      }
    }

    handleResize()
    mediaQuery.addEventListener("change", handleResize)

    return () => {
      mediaQuery.removeEventListener("change", handleResize)
    }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isCollapsed = mounted && collapsed

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="fixed left-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">
        <Link href="/dashboard/agent" className="flex items-center gap-2">
          <RiGraduationCapFill className="text-3xl text-[#075e3b]" />

          <span className="text-xl font-bold text-slate-900">
            NSUK <span className="text-[#075e3b]">Nest</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl text-slate-700 transition hover:bg-slate-100"
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:sticky lg:z-auto lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}`}
      >
        {/* LOGO */}
        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${
            isCollapsed
              ? "justify-center px-2"
              : "justify-between px-5"
          }`}
        >
          <Link
            href="/dashboard/agent"
            className="flex min-w-0 items-center gap-2"
          >
            <RiGraduationCapFill className="shrink-0 text-3xl text-[#075e3b]" />

            {!isCollapsed && (
              <span className="whitespace-nowrap text-xl font-bold text-slate-900">
                NSUK <span className="text-[#075e3b]">Nest</span>
              </span>
            )}
          </Link>

          {/* EXPANDED DESKTOP TOGGLE */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#075e3b] focus:outline-none focus:ring-2 focus:ring-[#075e3b]/30 lg:flex"
            >
              <GoSidebarCollapse className="text-xl" />
            </button>
          )}
        </div>

        {/* COLLAPSED DESKTOP TOGGLE */}
        {isCollapsed && (
          <div className="hidden h-14 shrink-0 items-center justify-center lg:flex">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#075e3b] focus:outline-none focus:ring-2 focus:ring-[#075e3b]/30"
            >
              <GoSidebarExpand className="text-xl" />
            </button>
          </div>
        )}

        {/* NAVIGATION */}
        <nav
          aria-label="Agent dashboard navigation"
          className={`flex-1 space-y-2 overflow-y-auto py-4 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          {items.map((item) => {
            const Icon = item.icon

            const active =
              item.href !== "#" &&
              (
                item.href === "/dashboard/agent"
                  ? pathname === item.href
                  : item.href === "/dashboard/agent/properties"
                    ? pathname === "/dashboard/agent/properties"
                    : pathname === item.href
              )

            return (
              <Link
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex h-12 items-center rounded-xl font-semibold transition ${
                  isCollapsed
                    ? "justify-center px-0"
                    : "gap-3 px-4"
                } ${
                  active
                    ? "bg-[#075e3b]/10 text-[#075e3b]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#075e3b]"
                }`}
              >
                <Icon className="shrink-0 text-lg" />

                {!isCollapsed && (
                  <span className="whitespace-nowrap text-sm">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* HELP / SUPPORT */}
        <div
          className={`shrink-0 border-t border-slate-100 ${
            isCollapsed ? "p-2" : "p-4"
          }`}
        >
          {isCollapsed ? (
            <Link
              href="/Contact"
              title="Contact Support"
              className="flex h-12 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#075e3b]"
            >
              <FaUser className="text-lg" />
            </Link>
          ) : (
            <div className="rounded-xl bg-[#075e3b]/5 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Need help?
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Contact the NSUK Nest support team.
              </p>

              <Link
                href="/Contact"
                className="mt-3 inline-block text-xs font-semibold text-[#075e3b] hover:underline"
              >
                Contact Support →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
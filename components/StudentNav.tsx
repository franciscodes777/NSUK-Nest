
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RiGraduationCapFill } from "react-icons/ri"
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaClipboardList,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa"
import {
  GoSidebarCollapse,
  GoSidebarExpand,
} from "react-icons/go"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard/student",
    icon: FaHome,
  },
  {
    label: "Find Accommodation",
    href: "/dashboard/student/accommodation",
    icon: FaSearch,
  },
  {
    label: "Saved",
    href: "/dashboard/student/saved",
    icon: FaHeart,
  },
  {
    label: "My Bookings",
    href: "/dashboard/student/booking",
    icon: FaClipboardList,
  },
  {
    label: "Profile",
    href: "/dashboard/student/profile",
    icon: FaUser,
  },
]

export default function StudentNav() {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

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
      {/* Mobile Header */}
      <header className="fixed left-0 top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-5 lg:hidden">
        <Link href="/dashboard/student" className="flex items-center gap-2">
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

      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300 lg:sticky lg:z-auto lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"} w-64`}
      >
        {/* Logo */}
        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${
            isCollapsed
              ? "justify-center px-2"
              : "justify-between px-5"
          }`}
        >
          <Link
            href="/dashboard/student"
            className="flex min-w-0 items-center gap-2"
          >
            <RiGraduationCapFill className="shrink-0 text-3xl text-[#075e3b]" />

            {!isCollapsed && (
              <span className="whitespace-nowrap text-xl font-bold text-slate-900">
                NSUK <span className="text-[#075e3b]">Nest</span>
              </span>
            )}
          </Link>

          {/* Expanded desktop toggle */}
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

        {/* Collapsed desktop toggle row */}
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

        {/* Navigation */}
        <nav
          aria-label="Student dashboard navigation"
          className={`flex-1 space-y-2 overflow-y-auto py-4 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/student" &&
                pathname.startsWith(`${item.href}/`))

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex h-12 items-center rounded-xl transition-colors ${
                  isCollapsed
                    ? "justify-center px-0"
                    : "gap-3 px-4"
                } ${
                  isActive
                    ? "bg-[#075e3b]/10 font-semibold text-[#075e3b]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#075e3b]"
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

        {/* Support Section */}
        <div
          className={`shrink-0 border-t border-slate-100 ${
            isCollapsed ? "p-2" : "p-4"
          }`}
        >
          {isCollapsed ? (
            <Link
              href="/Contact"
              title="Support"
              className="flex h-12 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-[#075e3b]"
            >
              <FaUser className="text-lg" />
            </Link>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">
                Need help?
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Contact our support team if you need assistance.
              </p>

              <Link
                href="/Contact"
                className="mt-3 inline-block text-sm font-semibold text-[#075e3b] hover:underline"
              >
                Contact Support
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}


// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import {
//   FaHome,
//   FaSearch,
//   FaHeart,
//   FaClipboardList,
//   FaUser,
// } from "react-icons/fa"

// export default function StudentNav() {
//   const pathname = usePathname()

//   const items = [
//     {
//       label: "Dashboard",
//       href: "/dashboard/student",
//       icon: FaHome,
//     },
//     {
//       label: "Find Accommodation",
//       href: "/dashboard/student/accommodation",
//       icon: FaSearch,
//     },
//     {
//       label: "Saved",
//       href: "/dashboard/student/saved",
//       icon: FaHeart,
//     },
//     {
//       label: "My Bookings",
//       href: "/dashboard/student/booking",
//       icon: FaClipboardList,
//     },
//     {
//       label: "Profile",
//       href: "/dashboard/student/profile",
//       icon: FaUser,
//     },
//   ]

//   return (
//     <nav className="flex-1 p-4 space-y-2">
//       {items.map((item) => {
//         const Icon = item.icon

//         const active =
//           item.href !== "#" &&
//           (
//             item.href === "/dashboard/student"
//               ? pathname === item.href
//               : pathname.startsWith(item.href)
//           )

//         return (
//           <Link
//             key={item.label}
//             href={item.href}
//             className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
//               active
//                 ? "bg-[#075e3b]/10 text-[#075e3b]"
//                 : "text-slate-600 hover:bg-slate-50"
//             }`}
//           >
//             <Icon />
//             {item.label}
//           </Link>
//         )
//       })}
//     </nav>
//   )
// }

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
  FaQuestionCircle,
} from "react-icons/fa"
import {
  GoSidebarCollapse,
  GoSidebarExpand,
} from "react-icons/go"

export default function StudentNav() {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)")

    setCollapsed(mediaQuery.matches)
    setMounted(true)

    const handleScreenChange = (event: MediaQueryListEvent) => {
      setCollapsed(event.matches)
    }

    mediaQuery.addEventListener("change", handleScreenChange)

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange)
    }
  }, [])

  const isCollapsed = mounted ? collapsed : false

  const items = [
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

  return (
    <aside
      className={`sticky top-0 left-0 flex h-screen shrink-0 flex-col overflow-x-hidden overflow-y-auto border-r border-slate-200 bg-white transition-[width] duration-300 ease-in-out ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* LOGO AND SIDEBAR TOGGLE */}
      <div
        className={`flex h-20 shrink-0 items-center border-b border-slate-100 ${
          isCollapsed
            ? "justify-center px-2"
            : "justify-between gap-2 px-5"
        }`}
      >
        <Link
          href="/"
          aria-label="NSUK Nest home"
          title={isCollapsed ? "NSUK Nest" : undefined}
          className={`flex min-w-0 items-center ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#075e3b]/10">
            <RiGraduationCapFill className="text-2xl text-[#075e3b]" />
          </span>

          {!isCollapsed && (
            <span className="whitespace-nowrap text-lg font-extrabold text-[#075e3b]">
              NSUK Nest
            </span>
          )}
        </Link>

        {/* PAYLUK-STYLE SIDEBAR TOGGLE */}
        <button
          type="button"
          onClick={() => setCollapsed((previous) => !previous)}
          aria-label={
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#075e3b] focus:outline-none focus:ring-2 focus:ring-[#075e3b]/30"
        >
          {isCollapsed ? (
            <GoSidebarExpand className="text-xl" />
          ) : (
            <GoSidebarCollapse className="text-xl" />
          )}
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <nav
        aria-label="Student dashboard navigation"
        className={`flex-1 space-y-2 py-4 ${
          isCollapsed ? "px-2" : "px-4"
        }`}
      >
        {items.map((item) => {
          const Icon = item.icon

          const active =
            item.href === "/dashboard/student"
              ? pathname === item.href
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              title={isCollapsed ? item.label : undefined}
              className={`flex min-h-11 items-center rounded-xl py-3 font-semibold transition-colors duration-200 ${
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

      {/* SUPPORT SECTION */}
      <div className="mt-auto shrink-0 border-t border-slate-100 p-3">
        {isCollapsed ? (
          <Link
            href="/Contact"
            aria-label="Contact NSUK Nest support"
            title="Contact Support"
            className="flex h-11 items-center justify-center rounded-xl text-[#075e3b] transition-colors hover:bg-[#075e3b]/10"
          >
            <FaQuestionCircle className="text-lg" />
          </Link>
        ) : (
          <div className="rounded-xl bg-[#075e3b]/5 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Need help?
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
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
  )
}
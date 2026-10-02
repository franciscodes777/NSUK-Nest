"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaClipboardList,
  FaUser,
} from "react-icons/fa"

export default function StudentNav() {
  const pathname = usePathname()

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
      href: "#",
      icon: FaClipboardList,
    },
    {
      label: "Profile",
      href: "#",
      icon: FaUser,
    },
  ]

  return (
    <nav className="flex-1 p-4 space-y-2">
      {items.map((item) => {
        const Icon = item.icon

        const active =
          item.href !== "#" &&
          (
            item.href === "/dashboard/student"
              ? pathname === item.href
              : pathname.startsWith(item.href)
          )

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
              active
                ? "bg-[#075e3b]/10 text-[#075e3b]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
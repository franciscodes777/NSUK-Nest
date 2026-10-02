"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

export default function AdminNav() {
  const pathname = usePathname()

  const items = [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: FaHome,
    },
    {
      label: "Users",
      href: "#",
      icon: FaUsers,
    },
    {
      label: "Students",
      href: "#",
      icon: FaUserGraduate,
    },
    {
      label: "Agents / Owners",
      href: "#",
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

  return (
    <nav className="flex-1 p-4 space-y-2">
      {items.map((item) => {
        const Icon = item.icon

        const active =
          item.href !== "#" &&
          (
            item.href === "/dashboard/admin"
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
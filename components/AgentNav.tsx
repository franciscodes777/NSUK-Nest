"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconType } from "react-icons"
import {
  FaHome,
  FaPlus,
  FaBuilding,
  FaClipboardList,
  FaEnvelope,
  FaUser,
} from "react-icons/fa"

export default function AgentNav() {
  const pathname = usePathname()

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
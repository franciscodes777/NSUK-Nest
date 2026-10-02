"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa"

export default function UserMenu() {
  const { data: session, update } = useSession()

  const sessionEmail = session?.user?.email || ""
  const sessionName = session?.user?.name || ""
  const role = session?.user?.role

  const [name, setName] = useState(sessionName)
  const [email, setEmail] = useState(sessionEmail)

  async function loadProfile() {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()

      const latestName =
        typeof data.name === "string"
          ? data.name
          : ""

      const latestEmail =
        typeof data.email === "string"
          ? data.email
          : sessionEmail

      setName(latestName)
      setEmail(latestEmail)

      // Keep the NextAuth session synchronized
      // with the Firestore profile.
      if (
        latestName &&
        latestName !== sessionName
      ) {
        await update({
          name: latestName,
        })
      }
    } catch (error) {
      console.error(
        "Failed to synchronize profile:",
        error
      )
    }
  }

  useEffect(() => {
    setName(sessionName)
    setEmail(sessionEmail)
  }, [sessionName, sessionEmail])

  useEffect(() => {
    loadProfile()

    const interval = setInterval(() => {
      loadProfile()
    }, 1500)

    return () => {
      clearInterval(interval)
    }
  }, [sessionEmail])

  const initial = name
    ? name.charAt(0).toUpperCase()
    : email
    ? email.charAt(0).toUpperCase()
    : "U"

  const profileUrl =
    role === "agent"
      ? "/dashboard/agent/profile"
      : "/dashboard/student/profile"

  return (
    <div className="flex items-center gap-4">

      <button
        type="button"
        className="text-slate-500 hover:text-[#075e3b] transition"
      >
        <FaBell />
      </button>

      <div className="relative">

        <details>

          <summary className="list-none cursor-pointer flex items-center gap-2">

            <div className="w-10 h-10 rounded-full bg-[#075e3b] text-white flex items-center justify-center font-semibold">
              {initial}
            </div>

            <FaChevronDown className="text-slate-400 text-xs" />

          </summary>

          <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">

            <div className="px-3 py-3 border-b border-slate-100">

              <p className="text-sm font-semibold text-slate-800">
                {name || "My Account"}
              </p>

              <p className="text-xs text-slate-500 mt-1 break-all">
                {email}
              </p>

            </div>

            <a
              href={profileUrl}
              className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <FaUser className="text-slate-400" />
              Profile
            </a>

            <button
              type="button"
              onClick={() =>
                signOut({
                  callbackUrl: "/",
                })
              }
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <FaSignOutAlt />
              Log out
            </button>

          </div>

        </details>

      </div>

    </div>
  )
}
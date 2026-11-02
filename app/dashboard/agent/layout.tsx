import React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AgentNav from "@/components/AgentNav"

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "agent") {
    redirect("/dashboard/student")
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      <AgentNav />

      {/* PAGE CONTENT */}
      <section className="min-w-0 flex-1 pt-16 lg:pt-0">
        {children}
      </section>
    </main>
  )
}
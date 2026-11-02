
import React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import StudentNav from "@/components/StudentNav"

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      {/* RESPONSIVE STUDENT SIDEBAR */}
      <StudentNav />

      {/* DASHBOARD PAGE CONTENT */}
      <section className="min-w-0 flex-1 pt-16 lg:pt-0">
        {children}
      </section>
    </main>
  )
}
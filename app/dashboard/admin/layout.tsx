import React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import AdminNav from "@/components/AdminNav"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth")
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen min-w-0 bg-slate-50">
      <AdminNav />

      <section className="min-w-0 flex-1 pt-16 lg:pt-0">
        {children}
      </section>
    </main>
  )
}
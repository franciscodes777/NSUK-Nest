import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth")
  }

const role = (session.user as { role?: "student" | "agent" | "admin" }).role

  if (role === "student") {
    redirect("/dashboard/student")
  }

  if (role === "agent") {
    redirect("/dashboard/agent")
  }

   if (role === "admin") {
    redirect("/dashboard/admin")
  }

  redirect("/auth")
}
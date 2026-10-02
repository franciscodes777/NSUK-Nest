import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function LoginRedirectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role === "agent") {
    redirect("/dashboard/agent")
  }

  redirect("/dashboard/student")
}
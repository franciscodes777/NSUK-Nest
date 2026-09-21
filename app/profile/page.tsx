import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth")
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

        <div className="flex flex-col items-center text-center">
          
          <div className="w-24 h-24 rounded-full bg-[#075e3b] text-white flex items-center justify-center text-4xl font-bold mb-5">
            {session.user.name?.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {session.user.name}
          </h1>

          <p className="text-slate-500 mt-1">
            {session.user.email}
          </p>

        </div>

      </div>
    </main>
  )
}
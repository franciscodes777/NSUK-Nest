import React from "react"
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa"
import { Theme } from "@/components/theme"
import Link from "next/link"
import AuthButtons from "@/components/AuthButtons"
export default function SignUpPage(): React.JSX.Element {
  return (
    <main className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-[#075e3b] text-white items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">
            Find your next home
          </h1>
          <p className="text-lg text-white/80">
            Discover verified off-campus accommodation around NSUK.
          </p>
        </div>
      </div>
      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Create an account
            </h2>
            <p className="text-slate-500 mt-2">
              Join NSUK Nest today.
            </p>
          </div>
          {/* ROLE SELECTION + GOOGLE + GITHUB */}
          <AuthButtons />
          {/* DIVIDER */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-sm text-slate-400">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>
          {/* EMAIL FORM */}
          <form
            action="/api/auth/register"
            method="POST"
            className="space-y-5"
          >
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-[#075e3b]"
                />
              </div>
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-[#075e3b]"
                />
              </div>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-[#075e3b]"
                />
              </div>
            </div>
            {/* Create Account */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#075e3b] text-white rounded-lg font-semibold hover:bg-[#064d31] transition-all"
            >
              Create Account
            </button>
          </form>
          {/* SIGN IN */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#075e3b] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
import Link from "next/link";
import {loginWithGoogle,loginWithGitHub,} from "@/app/actions/auth";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to continue to NSUK Nest
          </p>
        </div>


        {/* Google */}
        <form 
        action={loginWithGoogle}
          className="mb-3"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
        </form>


        {/* GitHub */}
        <form
         action={loginWithGitHub}
          className="mb-6"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 border border-slate-300 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FaGithub className="text-xl" />
            Continue with GitHub
          </button>
        </form>


        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-200"></div>

          <span className="text-sm text-slate-400">
            or continue with email
          </span>

          <div className="flex-1 h-px bg-slate-200"></div>
        </div>


        {/* Email */}
        <form className="space-y-4">

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="text-stone-400 w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-[#075e3b]"
            />
          </div>


          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              className="w-full text-stone-400 border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-[#075e3b]"
            />
          </div>


          {/* Login */}
          <button
            type="submit"
            className="w-full bg-[#075e3b] text-white rounded-lg py-3 font-semibold hover:bg-[#064d31] transition"
          >
            Login
          </button>

        </form>


        {/* Sign up */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            href="/auth"
            className="font-semibold text-[#075e3b] hover:underline"
          >
            Get Started
          </Link>
        </div>

      </div>

    </main>
  );
}
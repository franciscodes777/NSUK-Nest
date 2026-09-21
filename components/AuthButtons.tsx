 "use client";

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaUserGraduate, FaKey } from "react-icons/fa";

export default function AuthButtons() {
  const [role, setRole] = useState("student");

  return (
    <div className="space-y-6">
      
      {/* Account Type */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          I am a...
        </label>

        <div className="grid grid-cols-2 gap-4">

          {/* Student */}
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`p-3.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 text-center ${
              role === "student"
                ? "border-[#075e3b] bg-[#075e3b]/5"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FaUserGraduate
              className={`text-xl ${
                role === "student"
                  ? "text-[#075e3b]"
                  : "text-slate-400"
              }`}
            />

            <span
              className={`text-xs font-bold ${
                role === "student"
                  ? "text-[#075e3b]"
                  : "text-slate-600"
              }`}
            >
              Student
            </span>
          </button>

          {/* Agent / Owner */}
          <button
            type="button"
            onClick={() => setRole("agent")}
            className={`p-3.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 text-center ${
              role === "agent"
                ? "border-[#075e3b] bg-[#075e3b]/5"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FaKey
              className={`text-xl ${
                role === "agent"
                  ? "text-[#075e3b]"
                  : "text-slate-400"
              }`}
            />

            <span
              className={`text-xs font-bold ${
                role === "agent"
                  ? "text-[#075e3b]"
                  : "text-slate-600"
              }`}
            >
              Agent / Owner
            </span>
          </button>

        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all duration-200 shadow-sm"
      >
        <FcGoogle className="text-xl" />
        Sign up with Google
      </button>

      {/* GitHub */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all duration-200 shadow-sm"
      >
        <FaGithub className="text-xl" />
        Sign up with GitHub
      </button>

      {/* Temporary check */}
      <p className="text-center text-xs text-slate-400">
        Selected role: {role}
      </p>

    </div>
  );
}
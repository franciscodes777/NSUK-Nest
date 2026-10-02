// import React from "react"
// import { FaUser, FaEnvelope, FaLock } from "react-icons/fa"
// import { Theme } from "@/components/theme"
// import Link from "next/link"
// import AuthButtons from "@/components/AuthButtons"
// import { RiGraduationCapFill } from "react-icons/ri";

// export default function SignUpPage(): React.JSX.Element {
//   return (
//     <main className="min-h-screen flex">
//       {/* LEFT PANEL */}
// <div className="hidden lg:flex w-1/2 bg-[#075e3b] text-white items-center justify-center p-12 relative overflow-hidden">
//   {/* Background decoration */}
//   <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10" />
//   <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full border border-white/10" />
//   <div className="absolute top-1/3 right-10 w-3 h-3 rounded-full bg-white/20" />
//   <div className="absolute bottom-1/4 left-16 w-2 h-2 rounded-full bg-white/20" />
//   {/* Main content */}
//   <div className="relative z-10 w-full max-w-lg -translate-y-20">
//     {/* Brand */}
//     <div className="flex items-center gap-3 mb-16">
//       {/* NSUK Nest Logo */}
//   {/* NSUK Nest Logo */}
// <div className="relative w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
//   {/* Building */}
//   <div className="relative w-7 h-7 bg-white rounded-sm mt-2">
//     {/* Graduation cap — CSS only */}
//     <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-4">
//       {/* Mortarboard */}
//       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 bg-white rotate-45 rounded-[2px]" />
//       {/* Cap button */}
//       <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#075e3b] rounded-full z-10" />
//       {/* Tassel */}
//       <div className="absolute top-1 right-0.5 w-1 h-3 bg-white rounded-full rotate-[20deg]" />
//       <div className="absolute top-3 right-0 w-1.5 h-1.5 bg-white rounded-full" />
//     </div>
//     {/* 8 Windows */}
//     {/* Row 1 */}
//     <div className="absolute top-1 left-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     <div className="absolute top-1 right-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     {/* Row 2 */}
//     <div className="absolute top-3 left-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     <div className="absolute top-3 right-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     {/* Row 3 */}
//     <div className="absolute top-5 left-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     <div className="absolute top-5 right-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     {/* Row 4 */}
//     <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//     <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#075e3b] rounded-[1px]" />
//   </div>
// </div>
//       <div>
//         <h2 className="text-xl font-bold tracking-tight">
//           NSUK Nest
//         </h2>
//         <p className="text-xs text-white/60">
//           Your space. Your comfort. Your nest.
//         </p>
//       </div>
//     </div>
//     {/* Main message */}
//     <div className="mb-14">
//       <p className="text-sm font-medium text-white/60 uppercase tracking-[0.2em] mb-4">
//         Welcome to NSUK Nest
//       </p>
//       <h1 className="text-5xl font-bold leading-[1.1] tracking-tight mb-6">
//         Find your
//         <span className="block text-white/80">
//           place to belong.
//         </span>
//       </h1>
//       <p className="text-lg text-white/70 leading-relaxed max-w-md">
//         A simpler way for the NSUK community to connect with
//         comfortable spaces and trusted property providers.
//       </p>
//     </div>
//     {/* Brand statement */}
//     <div className="border-l-2 border-white/20 pl-5">
//       <p className="text-sm text-white/80 leading-relaxed">
//         Built to make finding a place around campus
//         simpler, clearer, and more convenient.
//       </p>
//     </div>
//     {/* Bottom decorative element */}
//     <div className="mt-16 flex items-center gap-3">
//       <div className="h-px w-12 bg-white/30" />
//       <span className="text-xs text-white/50 tracking-wider">
//         NSUK • KEFFI
//       </span>
//     </div>
//   </div>
// </div>
//       {/* RIGHT PANEL */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white">
//         <div className="w-full max-w-md">
//           <div className="mb-8">
//             <h2 className="text-3xl font-bold text-slate-900">
//               Create an account
//             </h2>
//             <p className="text-slate-500 mt-2">
//               Join NSUK Nest today.
//             </p>
//           </div>
//           {/* ROLE SELECTION + GOOGLE + GITHUB */}
//           <AuthButtons />
//           {/* DIVIDER */}
//           <div className="flex items-center my-6">
//             <div className="flex-1 h-px bg-slate-200"></div>
//             <span className="px-4 text-sm text-slate-400">
//               OR
//             </span>
//             <div className="flex-1 h-px bg-slate-200"></div>
//           </div>
//           {/* EMAIL FORM */}
//           <form
//             action="/api/auth/register"
//             method="POST"
//             className="space-y-5"
//           >
//             {/* Full Name */}
//             <div className="space-y-2">
//               <label
//                 htmlFor="name"
//                 className="block text-sm font-semibold text-slate-700"
//               >
//                 Full Name
//               </label>
//               <div className="relative">
//                 <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   id="name"
//                   name="name"
//                   type="text"
//                   required
//                   placeholder="Enter your full name"
//                   className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-[#075e3b]"
//                 />
//               </div>
//             </div>
//             {/* Email */}
//             <div className="space-y-2">
//               <label
//                 htmlFor="email"
//                 className="block text-sm font-semibold text-slate-700"
//               >
//                 Email
//               </label>
//               <div className="relative">
//                 <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   id="email"
//                   name="email"
//                   type="email"
//                   required
//                   placeholder="Enter your email"
//                   className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-[#075e3b]"
//                 />
//               </div>
//             </div>
//             {/* Password */}
//             <div className="space-y-2">
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-semibold text-slate-700"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   placeholder="Create a password"
//                   className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:border-[#075e3b]"
//                 />
//               </div>
//             </div>
//             {/* Create Account */}
//             <button
//               type="submit"
//               className="w-full py-3 px-4 bg-[#075e3b] text-white rounded-lg font-semibold hover:bg-[#064d31] transition-all"
//             >
//               Create Account
//             </button>
//           </form>
//           {/* SIGN IN */}
//           <div className="mt-6 text-center text-sm text-slate-500">
//             Already have an account?{" "}
//             <Link
//               href="/login"
//               className="font-semibold text-[#075e3b] hover:underline"
//             >
//               Sign in
//             </Link>
//           </div>
//         </div>
//       </div>
//     </main>
//   )
// }
// {/* NSUK Nest Logo Shape */}
import React from "react"
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa"
import { Theme } from "@/components/theme"
import Link from "next/link"
import AuthButtons from "@/components/AuthButtons"
import { RiGraduationCapFill } from "react-icons/ri"

export default function SignUpPage(): React.JSX.Element {
return ( <main className="min-h-screen flex">
{/* LEFT PANEL */} <div className="hidden lg:flex w-1/2 bg-[#075e3b] text-white items-center justify-center p-12 relative overflow-hidden">
{/* Background decoration */} <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10" /> <div className="absolute -bottom-40 -left-32 w-[28rem] h-[28rem] rounded-full border border-white/10" /> <div className="absolute top-1/3 right-10 w-3 h-3 rounded-full bg-white/20" /> <div className="absolute bottom-1/4 left-16 w-2 h-2 rounded-full bg-white/20" />


    {/* Main content */}
    <div className="relative z-10 w-full max-w-lg -translate-y-20">

      {/* Brand */}
      <div className="flex items-center gap-3 mb-16">

        {/* NSUK Nest Logo */}
        <div className="relative w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
          <RiGraduationCapFill className="text-white text-3xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">
            NSUK Nest
          </h2>

          <p className="text-xs text-white/60">
            Your space. Your comfort. Your nest.
          </p>
        </div>
      </div>

      {/* Main message */}
      <div className="mb-14">
        <p className="text-sm font-medium text-white/60 uppercase tracking-[0.2em] mb-4">
          Welcome to NSUK Nest
        </p>

        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight mb-6">
          Find your
          <span className="block text-white/80">
            place to belong.
          </span>
        </h1>

        <p className="text-lg text-white/70 leading-relaxed max-w-md">
          A simpler way for the NSUK community to connect with
          comfortable spaces and trusted property providers.
        </p>
      </div>

      {/* Brand statement */}
      <div className="border-l-2 border-white/20 pl-5">
        <p className="text-sm text-white/80 leading-relaxed">
          Built to make finding a place around campus
          simpler, clearer, and more convenient.
        </p>
      </div>

      {/* Bottom decorative element */}
      <div className="mt-16 flex items-center gap-3">
        <div className="h-px w-12 bg-white/30" />

        <span className="text-xs text-white/50 tracking-wider">
          NSUK • KEFFI
        </span>
      </div>
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

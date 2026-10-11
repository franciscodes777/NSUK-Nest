// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { auth } from "@/auth";
// import { adminDb } from "@/lib/firebaseAdmin";
// import UserMenu from "@/components/UserMenu";
// import {
//   FaArrowLeft,
//   FaUsers,
//   FaUserGraduate,
//   FaBuilding,
//   FaUserShield,
//   FaSearch,
//   FaEnvelope,
//   FaCalendarAlt,
//   FaArrowRight,
// } from "react-icons/fa";

// export const dynamic = "force-dynamic";

// type AdminUser = {
//   id: string;
//   name?: string;
//   email?: string;
//   image?: string;
//   role?: string;
//   phone?: string;
//   school?: string;
//   department?: string;
//   level?: string;
//   bio?: string;
//   createdAt?: {
//     toDate?: () => Date;
//   } | string | Date;
// };

// function formatDate(value: AdminUser["createdAt"]) {
//   if (!value) return "Unknown";

//   try {
//     let date: Date;

//     if (
//       typeof value === "object" &&
//       value !== null &&
//       "toDate" in value &&
//       typeof value.toDate === "function"
//     ) {
//       date = value.toDate();
//     } else {
//       date = new Date(value as string | Date);
//     }

//     if (Number.isNaN(date.getTime())) return "Unknown";

//     return date.toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   } catch {
//     return "Unknown";
//   }
// }

// function getRoleLabel(role?: string) {
//   switch (role) {
//     case "student":
//       return "Student";
//     case "agent":
//     case "agent-owner":
//       return "Agent";
//     case "admin":
//       return "Admin";
//     default:
//       return role || "Unassigned";
//   }
// }

// function getRoleStyle(role?: string) {
//   switch (role) {
//     case "student":
//       return "bg-blue-50 text-blue-700";
//     case "agent":
//     case "agent-owner":
//       return "bg-purple-50 text-purple-700";
//     case "admin":
//       return "bg-green-50 text-green-700";
//     default:
//       return "bg-slate-100 text-slate-600";
//   }
// }

// export default async function AdminUsersPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ search?: string; role?: string }>;
// }) {
//   const session = await auth();

//   if (!session?.user?.email) {
//     redirect("/login");
//   }

//   if (session.user.role !== "admin") {
//     redirect("/dashboard");
//   }

//   const params = await searchParams;
//   const searchTerm = (params.search || "").trim().toLowerCase();
//   const selectedRole = params.role || "all";

//   const usersSnapshot = await adminDb.collection("users").get();

//   const users: AdminUser[] = usersSnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...(doc.data() as Omit<AdminUser, "id">),
//   }));

//   const totalUsers = users.length;

//   const totalStudents = users.filter(
//     (user) => user.role === "student"
//   ).length;

//   const totalAgents = users.filter(
//     (user) =>
//       user.role === "agent" || user.role === "agent-owner"
//   ).length;

//   const totalAdmins = users.filter(
//     (user) => user.role === "admin"
//   ).length;

//   const filteredUsers = users
//     .filter((user) => {
//       const matchesSearch =
//         !searchTerm ||
//         (user.name || "").toLowerCase().includes(searchTerm) ||
//         (user.email || "").toLowerCase().includes(searchTerm);

//       const normalizedRole =
//         user.role === "agent-owner" ? "agent" : user.role;

//       const matchesRole =
//         selectedRole === "all" ||
//         normalizedRole === selectedRole;

//       return matchesSearch && matchesRole;
//     })
//     .sort((a, b) => {
//       function getTimestamp(value: AdminUser["createdAt"]) {
//         if (!value) return 0;

//         try {
//           if (
//             typeof value === "object" &&
//             value !== null &&
//             "toDate" in value &&
//             typeof value.toDate === "function"
//           ) {
//             return value.toDate().getTime();
//           }

//           const date = new Date(value as string | Date);

//           return Number.isNaN(date.getTime())
//             ? 0
//             : date.getTime();
//         } catch {
//           return 0;
//         }
//       }

//       return (
//         getTimestamp(b.createdAt) -
//         getTimestamp(a.createdAt)
//       );
//     });

//   const stats = [
//     {
//       label: "Total Users",
//       value: totalUsers,
//       icon: FaUsers,
//       color: "bg-green-50 text-[#075e3b]",
//     },
//     {
//       label: "Students",
//       value: totalStudents,
//       icon: FaUserGraduate,
//       color: "bg-blue-50 text-blue-600",
//     },
//     {
//       label: "Agents",
//       value: totalAgents,
//       icon: FaBuilding,
//       color: "bg-purple-50 text-purple-600",
//     },
//     {
//       label: "Administrators",
//       value: totalAdmins,
//       icon: FaUserShield,
//       color: "bg-amber-50 text-amber-600",
//     },
//   ];

//   function buildFilterUrl(role: string) {
//     const query = new URLSearchParams();

//     if (params.search) {
//       query.set("search", params.search);
//     }

//     if (role !== "all") {
//       query.set("role", role);
//     }

//     const queryString = query.toString();

//     return queryString
//       ? `/dashboard/admin/users?${queryString}`
//       : "/dashboard/admin/users";
//   }

//   const roleFilters = [
//     { label: "All Users", value: "all" },
//     { label: "Students", value: "student" },
//     { label: "Agents", value: "agent" },
//     { label: "Admins", value: "admin" },
//   ];

//   return (
//     <main className="min-h-screen bg-slate-50">
//       <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
//           <div className="flex items-center gap-3">
//             <Link
//               href="/dashboard/admin"
//               aria-label="Back to admin dashboard"
//               className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
//             >
//               <FaArrowLeft />
//             </Link>

//             <div>
//               <p className="text-xs font-semibold uppercase tracking-wider text-[#075e3b]">
//                 Administrator
//               </p>

//               <h1 className="text-xl font-bold text-slate-900">
//                 User Management
//               </h1>
//             </div>
//           </div>

//           <UserMenu />
//         </div>
//       </header>

//       <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//         <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-slate-900">
//               Manage Users
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               View and manage student, agent, and administrator accounts.
//             </p>
//           </div>

//           <Link
//             href="/dashboard/admin"
//             className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
//           >
//             Dashboard Overview
//             <FaArrowRight className="text-xs" />
//           </Link>
//         </div>

//         <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
//           {stats.map((stat) => {
//             const Icon = stat.icon;

//             return (
//               <div
//                 key={stat.label}
//                 className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-slate-500">
//                       {stat.label}
//                     </p>

//                     <p className="mt-2 text-3xl font-bold text-slate-900">
//                       {stat.value.toLocaleString()}
//                     </p>
//                   </div>

//                   <div
//                     className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
//                   >
//                     <Icon className="text-xl" />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </section>

//         <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 p-5 sm:p-6">
//             <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
//               <div>
//                 <h3 className="text-lg font-bold text-slate-900">
//                   Registered Users
//                 </h3>

//                 <p className="mt-1 text-sm text-slate-500">
//                   {filteredUsers.length}{" "}
//                   {filteredUsers.length === 1
//                     ? "account"
//                     : "accounts"}{" "}
//                   found
//                 </p>
//               </div>

//               <form
//                 action="/dashboard/admin/users"
//                 method="GET"
//                 className="flex w-full gap-2 sm:max-w-md"
//               >
//                 {selectedRole !== "all" && (
//                   <input
//                     type="hidden"
//                     name="role"
//                     value={selectedRole}
//                   />
//                 )}

//                 <div className="relative flex-1">
//                   <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

//                   <input
//                     type="search"
//                     name="search"
//                     defaultValue={params.search || ""}
//                     placeholder="Search name or email..."
//                     className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-[#075e3b] focus:ring-2 focus:ring-[#075e3b]/10"
//                   />
//                 </div>

//                 <button
//                   type="submit"
//                   className="rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30]"
//                 >
//                   Search
//                 </button>
//               </form>
//             </div>

//             <div className="mt-5 flex flex-wrap gap-2">
//               {roleFilters.map((filter) => {
//                 const isActive = selectedRole === filter.value;

//                 return (
//                   <Link
//                     key={filter.value}
//                     href={buildFilterUrl(filter.value)}
//                     className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
//                       isActive
//                         ? "bg-[#075e3b] text-white"
//                         : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                     }`}
//                   >
//                     {filter.label}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[850px] text-left">
//               <thead className="bg-slate-50">
//                 <tr className="border-b border-slate-200">
//                   <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                     User
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                     Role
//                   </th>

//                   <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                     Registration Date
//                   </th>

//                   <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {filteredUsers.map((user) => (
//                   <tr
//                     key={user.id}
//                     className="transition hover:bg-slate-50"
//                   >
//                     <td className="px-6 py-5">
//                       <div className="flex items-center gap-3">
//                         {user.image ? (
//                           // eslint-disable-next-line @next/next/no-img-element
//                           <img
//                             src={user.image}
//                             alt={user.name || "User"}
//                             className="h-11 w-11 rounded-full border border-slate-200 object-cover"
//                           />
//                         ) : (
//                           <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075e3b]/10 text-sm font-bold text-[#075e3b]">
//                             {(user.name || user.email || "U")
//                               .charAt(0)
//                               .toUpperCase()}
//                           </div>
//                         )}

//                         <div>
//                           <p className="font-semibold text-slate-900">
//                             {user.name || "Unnamed User"}
//                           </p>

//                           <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
//                             <FaEnvelope className="text-xs" />
//                             {user.email || "No email available"}
//                           </p>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-6 py-5">
//                       <span
//                         className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(user.role)}`}
//                       >
//                         {getRoleLabel(user.role)}
//                       </span>
//                     </td>

//                     <td className="px-6 py-5">
//                       <span className="flex items-center gap-2 text-sm text-slate-600">
//                         <FaCalendarAlt className="text-slate-400" />
//                         {formatDate(user.createdAt)}
//                       </span>
//                     </td>

//                     <td className="px-6 py-5 text-right">
//                       <Link
//                         href={`/dashboard/admin/users/${encodeURIComponent(user.id)}`}
//                         className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#075e3b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#064b30]"
//                       >
//                         View Profile
//                         <FaArrowRight />
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}

//                 {filteredUsers.length === 0 && (
//                   <tr>
//                     <td colSpan={4} className="px-6 py-16 text-center">
//                       <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
//                         <FaUsers className="text-xl" />
//                       </div>

//                       <h4 className="mt-4 font-semibold text-slate-900">
//                         No users found
//                       </h4>

//                       <p className="mt-1 text-sm text-slate-500">
//                         Try a different search term or role filter.
//                       </p>

//                       <Link
//                         href="/dashboard/admin/users"
//                         className="mt-4 inline-block text-sm font-semibold text-[#075e3b] hover:underline"
//                       >
//                         Clear filters
//                       </Link>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
//             <p className="text-xs text-slate-500">
//               Showing {filteredUsers.length} of {totalUsers} registered users
//             </p>

//             <p className="text-xs text-slate-400">
//               NSUK Nest Administration
//             </p>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }


import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import UserMenu from "@/components/UserMenu";
import {
  FaArrowLeft,
  FaUsers,
  FaUserGraduate,
  FaBuilding,
  FaUserShield,
  FaSearch,
  FaEnvelope,
  FaCalendarAlt,
  FaArrowRight,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

type AdminUser = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  phone?: string;
  school?: string;
  department?: string;
  level?: string;
  bio?: string;
  createdAt?: {
    toDate?: () => Date;
  } | string | Date;
  isEnvironmentAdmin?: boolean;
};

function formatDate(value: AdminUser["createdAt"]) {
  if (!value) return "Unknown";

  try {
    let date: Date;

    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = value.toDate();
    } else {
      date = new Date(value as string | Date);
    }

    if (Number.isNaN(date.getTime())) return "Unknown";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "student":
      return "Student";
    case "agent":
    case "agent-owner":
      return "Agent";
    case "admin":
      return "Admin";
    default:
      return role || "Unassigned";
  }
}

function getRoleStyle(role?: string) {
  switch (role) {
    case "student":
      return "bg-blue-50 text-blue-700";
    case "agent":
    case "agent-owner":
      return "bg-purple-50 text-purple-700";
    case "admin":
      return "bg-green-50 text-green-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getTimestamp(value: AdminUser["createdAt"]) {
  if (!value) return 0;

  try {
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      return value.toDate().getTime();
    }

    const date = new Date(value as string | Date);

    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  } catch {
    return 0;
  }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const searchTerm = (params.search || "").trim().toLowerCase();
  const selectedRole = params.role || "all";

  // Read the configured admin email on the server.
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  const signedInEmail = session.user.email.trim().toLowerCase();

  const usersSnapshot = await adminDb.collection("users").get();

  const users: AdminUser[] = usersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AdminUser, "id">),
  }));

  // If the configured admin already exists in Firestore, identify that
  // account as an admin without creating a duplicate.
  const configuredAdminInFirestore = users.find(
    (user) =>
      user.email?.trim().toLowerCase() === configuredAdminEmail &&
      configuredAdminEmail !== ""
  );

  if (configuredAdminEmail && configuredAdminInFirestore) {
    configuredAdminInFirestore.role = "admin";
    configuredAdminInFirestore.isEnvironmentAdmin = true;
  }

  // If the configured admin has no Firestore document, create a
  // display-only account for this page.
  if (configuredAdminEmail && !configuredAdminInFirestore) {
    users.push({
      id: `environment-admin-${configuredAdminEmail}`,
      name:
        signedInEmail === configuredAdminEmail
          ? session.user.name || "Administrator"
          : "Configured Administrator",
      email: configuredAdminEmail,
      image:
        signedInEmail === configuredAdminEmail
          ? session.user.image || undefined
          : undefined,
      role: "admin",
      isEnvironmentAdmin: true,
    });
  }

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === "student"
  ).length;

  const totalAgents = users.filter(
    (user) =>
      user.role === "agent" || user.role === "agent-owner"
  ).length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        !searchTerm ||
        (user.name || "").toLowerCase().includes(searchTerm) ||
        (user.email || "").toLowerCase().includes(searchTerm);

      const normalizedRole =
        user.role === "agent-owner" ? "agent" : user.role;

      const matchesRole =
        selectedRole === "all" ||
        normalizedRole === selectedRole;

      return matchesSearch && matchesRole;
    })
    .sort(
      (a, b) =>
        getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
    );

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: FaUsers,
      color: "bg-green-50 text-[#075e3b]",
    },
    {
      label: "Students",
      value: totalStudents,
      icon: FaUserGraduate,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Agents",
      value: totalAgents,
      icon: FaBuilding,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Administrators",
      value: totalAdmins,
      icon: FaUserShield,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  function buildFilterUrl(role: string) {
    const query = new URLSearchParams();

    if (params.search) {
      query.set("search", params.search);
    }

    if (role !== "all") {
      query.set("role", role);
    }

    const queryString = query.toString();

    return queryString
      ? `/dashboard/admin/users?${queryString}`
      : "/dashboard/admin/users";
  }

  const roleFilters = [
    { label: "All Users", value: "all" },
    { label: "Students", value: "student" },
    { label: "Agents", value: "agent" },
    { label: "Admins", value: "admin" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              aria-label="Back to admin dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            >
              <FaArrowLeft />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#075e3b]">
                Administrator
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                User Management
              </h1>
            </div>
          </div>

          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Manage Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage student, agent, and administrator accounts.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Dashboard Overview
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon className="text-xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Registered Users
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredUsers.length}{" "}
                  {filteredUsers.length === 1 ? "account" : "accounts"}{" "}
                  found
                </p>
              </div>

              <form
                action="/dashboard/admin/users"
                method="GET"
                className="flex w-full gap-2 sm:max-w-md"
              >
                {selectedRole !== "all" && (
                  <input
                    type="hidden"
                    name="role"
                    value={selectedRole}
                  />
                )}

                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                  <input
                    type="search"
                    name="search"
                    defaultValue={params.search || ""}
                    placeholder="Search name or email..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-[#075e3b] focus:ring-2 focus:ring-[#075e3b]/10"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#075e3b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30]"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {roleFilters.map((filter) => {
                const isActive = selectedRole === filter.value;

                return (
                  <Link
                    key={filter.value}
                    href={buildFilterUrl(filter.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-[#075e3b] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Registration Date
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="h-11 w-11 rounded-full border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#075e3b]/10 text-sm font-bold text-[#075e3b]">
                            {(user.name || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.name || "Unnamed User"}
                          </p>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <FaEnvelope className="text-xs" />
                            {user.email || "No email available"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(user.role)}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <FaCalendarAlt className="text-slate-400" />
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      {user.isEnvironmentAdmin && !configuredAdminInFirestore ? (
                        <span className="inline-flex whitespace-nowrap rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs font-semibold text-green-700">
                          Environment Admin
                        </span>
                      ) : (
                        <Link
                          href={`/dashboard/admin/users/${encodeURIComponent(user.id)}`}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#075e3b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#064b30]"
                        >
                          View Profile
                          <FaArrowRight />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <FaUsers className="text-xl" />
                      </div>

                      <h4 className="mt-4 font-semibold text-slate-900">
                        No users found
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        Try a different search term or role filter.
                      </p>

                      <Link
                        href="/dashboard/admin/users"
                        className="mt-4 inline-block text-sm font-semibold text-[#075e3b] hover:underline"
                      >
                        Clear filters
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredUsers.length} of {totalUsers} registered users
            </p>

            <p className="text-xs text-slate-400">
              NSUK Nest Administration
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}



import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import UserMenu from "@/components/UserMenu";
import {
  FaArrowLeft,
  FaArrowRight,
  FaUserGraduate,
  FaUsers,
  FaGraduationCap,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaSearch,
  FaUniversity,
} from "react-icons/fa";

export const dynamic = "force-dynamic";

type AdminStudent = {
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
  createdAt?: unknown;
};

function getDate(value: unknown): Date | null {
  if (!value) return null;

  try {
    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      date = (value.toDate as () => Date)();
    } else if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      date = new Date(value);
    } else {
      return null;
    }

    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatDate(value: unknown) {
  const date = getDate(value);

  if (!date) return "Not recorded";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const params = await searchParams;

  const searchTerm = (params.search || "")
    .trim()
    .toLowerCase();

  const usersSnapshot = await adminDb
    .collection("users")
    .get();

  const students: AdminStudent[] = usersSnapshot.docs
    .map((doc) => ({
      ...(doc.data() as Omit<AdminStudent, "id">),
      id: doc.id,
    }))
    .filter((user) => user.role === "student")
    .sort((a, b) => {
      const dateA = getDate(a.createdAt)?.getTime() || 0;
      const dateB = getDate(b.createdAt)?.getTime() || 0;

      return dateB - dateA;
    });

  const totalStudents = students.length;

  const studentsWithAcademicDetails = students.filter(
    (student) =>
      student.school ||
      student.department ||
      student.level
  ).length;

  const studentsWithPhone = students.filter(
    (student) => student.phone?.trim()
  ).length;

  const now = new Date();

  const newStudentsThisMonth = students.filter(
    (student) => {
      const date = getDate(student.createdAt);

      return (
        date !== null &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
  ).length;

  const filteredStudents = students.filter(
    (student) => {
      const searchableFields = [
        student.name,
        student.email,
        student.phone,
        student.school,
        student.department,
        student.level,
      ];

      return searchableFields.some((field) =>
        (field || "")
          .toLowerCase()
          .includes(searchTerm)
      );
    }
  );

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      description: "Registered student accounts",
      icon: FaUsers,
      iconStyle: "bg-green-50 text-[#075e3b]",
    },
    {
      label: "Academic Details",
      value: studentsWithAcademicDetails,
      description: "Students with academic information",
      icon: FaGraduationCap,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      label: "Contact Details",
      value: studentsWithPhone,
      description: "Students with phone numbers",
      icon: FaPhone,
      iconStyle: "bg-purple-50 text-purple-600",
    },
    {
      label: "New This Month",
      value: newStudentsThisMonth,
      description: "Students registered this month",
      icon: FaUserGraduate,
      iconStyle: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              aria-label="Back to admin dashboard"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            >
              <FaArrowLeft />
            </Link>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#075e3b]">
                Administrator
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Student Management
              </h1>
            </div>
          </div>

          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PAGE INTRODUCTION */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Manage Students
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              View registered students and their academic
              and contact information.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-[#075e3b]">
            <FaUserGraduate />

            <span>
              {totalStudents}{" "}
              {totalStudents === 1
                ? "Registered Student"
                : "Registered Students"}
            </span>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-green-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                  >
                    <Icon className="text-lg" />
                  </div>
                </div>

                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* STUDENT DIRECTORY */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* DIRECTORY HEADER */}
          <div className="flex flex-col gap-5 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Registered Students
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Search and review student accounts.
              </p>
            </div>

            {/* SEARCH */}
            <form
              action="/dashboard/admin/students"
              method="GET"
              className="flex w-full gap-2 lg:max-w-md"
            >
              <div className="relative min-w-0 flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                <input
                  type="search"
                  name="search"
                  defaultValue={params.search || ""}
                  placeholder="Search students..."
                  aria-label="Search students"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-[#075e3b] focus:ring-2 focus:ring-[#075e3b]/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#075e3b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30]"
              >
                Search
              </button>
            </form>
          </div>

          {/* RESULTS SUMMARY */}
          <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredStudents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalStudents}
              </span>{" "}
              students
            </p>

            {searchTerm && (
              <Link
                href="/dashboard/admin/students"
                className="text-sm font-semibold text-[#075e3b] hover:underline"
              >
                Clear search
              </Link>
            )}
          </div>

          {/* ALIGNED COLUMN HEADINGS — DESKTOP */}
          <div className="hidden border-b border-slate-200 bg-slate-50 px-6 py-4 xl:grid xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(110px,0.7fr)_120px] xl:items-center xl:gap-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Academic Information
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contact
            </p>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date Joined
            </p>

            <p className="text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Action
            </p>
          </div>

          {/* STUDENT LIST */}
          <div className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FaUsers className="text-xl" />
                </div>

                <h4 className="mt-4 font-semibold text-slate-900">
                  {searchTerm
                    ? "No students found"
                    : "No registered students yet"}
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  {searchTerm
                    ? "Try another name, email, phone number, or department."
                    : "Student accounts will appear here when they register."}
                </p>

                {searchTerm && (
                  <Link
                    href="/dashboard/admin/students"
                    className="mt-4 inline-block text-sm font-semibold text-[#075e3b] hover:underline"
                  >
                    Clear search
                  </Link>
                )}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-1 gap-5 p-5 transition hover:bg-slate-50/70 sm:grid-cols-2 sm:p-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(110px,0.7fr)_120px] xl:items-center xl:gap-5 xl:px-6"
                >
                  {/* STUDENT IDENTITY */}
                  <div className="min-w-0 sm:col-span-2 xl:col-span-1">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 xl:hidden">
                      Student
                    </p>

                    <div className="flex min-w-0 items-center gap-3">
                      {student.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.image}
                          alt={student.name || "Student"}
                          className="h-12 w-12 shrink-0 rounded-full border border-slate-200 bg-slate-50 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#075e3b]/10 text-base font-bold text-[#075e3b]">
                          {(student.name ||
                            student.email ||
                            "S")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold leading-5 text-slate-900">
                          {student.name || "Unnamed Student"}
                        </p>

                        <p className="mt-1 flex min-w-0 items-start gap-2 text-xs leading-5 text-slate-500">
                          <FaEnvelope className="mt-1 shrink-0 text-slate-400" />

                          <span className="break-all">
                            {student.email || "No email available"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ACADEMIC INFORMATION */}
                  <div className="min-w-0">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 xl:hidden">
                      Academic Information
                    </p>

                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                      <div className="flex items-start gap-2">
                        <FaGraduationCap className="mt-0.5 shrink-0 text-sm text-[#075e3b]" />

                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold leading-5 text-slate-800">
                            {student.department ||
                              "Department not added"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-start gap-2">
                        <FaUniversity className="mt-0.5 shrink-0 text-xs text-slate-400" />

                        <p className="break-words text-xs leading-5 text-slate-500">
                          {student.school || "School not added"}
                        </p>
                      </div>

                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                            student.level
                              ? "bg-green-50 text-[#075e3b]"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {student.level
                            ? `Level ${student.level}`
                            : "Level not added"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CONTACT INFORMATION */}
                  <div className="min-w-0">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 xl:hidden">
                      Contact
                    </p>

                    <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 xl:border-0 xl:p-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-sm text-[#075e3b]">
                        <FaPhone />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">
                          Phone number
                        </p>

                        <p className="mt-1 break-words text-sm font-medium leading-5 text-slate-700">
                          {student.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* REGISTRATION DATE */}
                  <div className="min-w-0">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 xl:hidden">
                      Date Joined
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FaCalendarAlt className="shrink-0 text-slate-400" />

                      <span className="leading-5">
                        {formatDate(student.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* PROFILE ACTION */}
                  <div className="flex items-center sm:col-span-2 xl:col-span-1 xl:justify-end">
                    <Link
                      href={`/dashboard/admin/users/${encodeURIComponent(student.id)}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#075e3b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#064b30] sm:w-auto xl:w-full xl:px-3 xl:py-2.5 xl:text-xs"
                    >
                      View Profile
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DIRECTORY FOOTER */}
          <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              Student information is retrieved from Firestore.
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
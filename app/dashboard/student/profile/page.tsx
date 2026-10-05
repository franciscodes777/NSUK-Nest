import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import {
FaGraduationCap,
FaHeart,
FaUserGraduate,
FaCalendarAlt,
FaArrowLeft,
} from "react-icons/fa";
import { revalidatePath } from "next/cache";

async function updateStudentProfile(formData: FormData): Promise<void> {
"use server";

const session = await auth();

if (!session?.user?.email) {
redirect("/login");
}

if (session.user.role !== "student") {
redirect("/dashboard");
}

const name = String(formData.get("name") || "").trim();
const phone = String(formData.get("phone") || "").trim();
const school = String(formData.get("school") || "").trim();
const department = String(formData.get("department") || "").trim();
const level = String(formData.get("level") || "").trim();
const bio = String(formData.get("bio") || "").trim();

const userSnapshot = await adminDb
.collection("users")
.where("email", "==", session.user.email)
.limit(1)
.get();

if (userSnapshot.empty) {
throw new Error("User profile not found.");
}

await userSnapshot.docs[0].ref.update({
name,
phone,
school,
department,
level,
bio,
updatedAt: new Date(),
});

revalidatePath("/dashboard/student/profile");
revalidatePath("/dashboard/student");
}

export default async function StudentProfilePage() {
const session = await auth();

if (!session?.user?.email) {
redirect("/login");
}

if (session.user.role !== "student") {
redirect("/dashboard");
}

const userSnapshot = await adminDb
.collection("users")
.where("email", "==", session.user.email)
.limit(1)
.get();

if (userSnapshot.empty) {
redirect("/auth");
}

const userData = userSnapshot.docs[0].data();

const profileName =
typeof userData.name === "string"
? userData.name
: session.user.name || "";

const profileEmail =
typeof userData.email === "string"
? userData.email
: session.user.email;

const profileImage =
typeof userData.image === "string"
? userData.image
: "";

const phone =
typeof userData.phone === "string"
? userData.phone
: "";

const school =
typeof userData.school === "string"
? userData.school
: "";

const department =
typeof userData.department === "string"
? userData.department
: "";

const level =
typeof userData.level === "string"
? userData.level
: "";

const bio =
typeof userData.bio === "string"
? userData.bio
: "";

const savedProperties = Array.isArray(userData.savedProperties)
? userData.savedProperties
: [];

const savedPropertiesCount = savedProperties.length;

let joinedDate = "";

if (userData.createdAt) {
const createdAt =
typeof userData.createdAt.toDate === "function"
? userData.createdAt.toDate()
: new Date(userData.createdAt);


if (!Number.isNaN(createdAt.getTime())) {
  joinedDate = createdAt.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


}

return ( <div className="min-h-screen bg-gray-50"> <header className="sticky top-0 z-40 border-b border-gray-200 bg-white"> <div className="flex h-20 items-center justify-between px-6 lg:px-10"> <div> <h1 className="text-xl font-bold text-gray-900">
Student Profile </h1>


        <p className="text-sm text-gray-500">
          Manage your account and profile information
        </p>
      </div>

      <UserMenu />
    </div>
  </header>

  <main className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
    <div className="mb-6">
      <a
        href="/dashboard/student"
        className="text-sm font-medium text-[#075e3b] hover:underline flex items-center gap-2 font-semibold"
      >
        <FaArrowLeft />
          Back to Dashboard
      </a>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Photo
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your profile picture
            </p>
          </div>

          <ProfileImageUpload
            currentImage={profileImage}
            name={profileName}
          />
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep your student information up to date
            </p>
          </div>

          <form action={updateStudentProfile} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={profileName}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={profileEmail}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-black"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={phone}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="school"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  School
                </label>

                <input
                  id="school"
                  name="school"
                  type="text"
                  defaultValue={school}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                  placeholder="e.g. Nasarawa State University"
                />
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Department
                </label>

                <input
                  id="department"
                  name="department"
                  type="text"
                  defaultValue={department}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Level
                </label>

                <input
                  id="level"
                  name="level"
                  type="text"
                  defaultValue={level}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                  placeholder="e.g. 300 Level"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                About You
              </label>

              <textarea
                id="bio"
                name="bio"
                rows={5}
                defaultValue={bio}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-black outline-none transition focus:border-[#075e3b] focus:ring-1 focus:ring-[#075e3b]"
                placeholder="Tell us a little about yourself..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-[#075e3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Account Information
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                <FaUserGraduate />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Account Type
                </p>

                <p className="text-sm font-medium text-gray-900">
                  Student
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                <FaHeart />
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Saved Properties
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {savedPropertiesCount}
                </p>
              </div>
            </div>

            {joinedDate && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500">
                  Date Joined
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {joinedDate}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">
            Student Summary
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                  <FaGraduationCap />
                </div>

                <span className="text-sm text-gray-600">
                  Level
                </span>
              </div>

              <span className="font-semibold text-gray-900">
                {level || "Not set"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                  <FaHeart />
                </div>

                <span className="text-sm text-gray-600">
                  Saved
                </span>
              </div>

              <span className="font-semibold text-gray-900">
                {savedPropertiesCount}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#075e3b]">
                  <FaCalendarAlt />
                </div>

                <span className="text-sm text-gray-600">
                  Profile
                </span>
              </div>

              <span className="font-semibold text-gray-900">
                Active
              </span>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </main>
</div>


);
}

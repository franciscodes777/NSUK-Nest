// import Link from "next/link"
// import { redirect } from "next/navigation"
// import { auth } from "@/auth"
// import { adminDb } from "@/lib/firebaseAdmin"
// import {
//   FaSearch,
//   FaMapMarkerAlt,
//   FaArrowRight,
// } from "react-icons/fa"
// import { MdFrontHand } from "react-icons/md"
// import UserMenu from "@/components/UserMenu"
// import SavePropertyButton from "@/components/SavePropertyButton"

// type Property = {
//   id: string
//   name?: string
//   type?: string
//   location?: string
//   address?: string
//   price?: number | string
//   images?: string[]
// }

// type StudentDashboardProps = {
//   searchParams: Promise<{
//     search?: string
//   }>
// }

// export default async function StudentDashboard({
//   searchParams,
// }: StudentDashboardProps) {
//   const session = await auth()

//   if (!session?.user?.email) {
//     redirect("/login")
//   }

//   if (session.user.role !== "student") {
//     redirect("/dashboard/agent")
//   }

//   const params = await searchParams
//   const search = params.search?.trim() || ""

//   // Get all approved properties
//   const propertySnapshot = await adminDb
//     .collection("properties")
//     .where("status", "==", "approved")
//     .get()

//   const allProperties: Property[] = propertySnapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...(doc.data() as Omit<Property, "id">),
//   }))

//   // Get the student's saved and viewed properties
//   let savedProperties: string[] = []
//   let viewedProperties: string[] = []

//   const usersSnapshot = await adminDb
//     .collection("users")
//     .where("email", "==", session.user.email)
//     .limit(1)
//     .get()

//   if (!usersSnapshot.empty) {
//     const userData = usersSnapshot.docs[0].data()

//     savedProperties = Array.isArray(userData.savedProperties)
//       ? userData.savedProperties
//       : []

//     viewedProperties = Array.isArray(userData.viewedProperties)
//       ? userData.viewedProperties
//       : []
//   }

//   // Filter properties when a search is submitted
//   const filteredProperties = search
//     ? allProperties.filter((property) => {
//         const searchableText = [
//           property.name,
//           property.type,
//           property.location,
//           property.address,
//         ]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase()

//         return searchableText.includes(search.toLowerCase())
//       })
//     : allProperties

//   // Dashboard only displays the first 3 recommendations
//   const recommendedProperties = filteredProperties.slice(0, 3)

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">
//         <div>
//           <p className="text-sm text-slate-500">
//             Student Dashboard
//           </p>

//           <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
//             Welcome back
//             <MdFrontHand className="rotate-[-25deg] text-[#075e3b] text-lg" />
//           </h1>
//         </div>

//         <UserMenu />
//       </header>

//       <div className="p-6 lg:p-10">
//         <div className="bg-[#075e3b] rounded-2xl p-6 lg:p-8 text-white">
//           <h2 className="text-2xl font-bold">
//             Find your next home
//           </h2>

//           <p className="text-white/75 mt-1">
//             Search for verified accommodation around NSUK.
//           </p>

//           <form
//             method="GET"
//             className="mt-6 bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2"
//           >
//             <div className="flex-1 flex items-center gap-3 px-4">
//               <FaSearch className="text-slate-400" />

//               <input
//                 type="text"
//                 name="search"
//                 defaultValue={search}
//                 placeholder="Search by location or property name"
//                 className="w-full py-3 outline-none text-slate-700 text-sm"
//               />
//             </div>

//             <button
//               type="submit"
//               className="bg-[#075e3b] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#064d31] transition"
//             >
//               Search
//             </button>
//           </form>

//           {search && (
//             <p className="text-sm text-white/75 mt-3">
//               {filteredProperties.length}{" "}
//               {filteredProperties.length === 1
//                 ? "property"
//                 : "properties"}{" "}
//               found for "{search}"
//             </p>
//           )}
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
//           <Link
//             href="/dashboard/student/saved"
//             className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-[#075e3b] transition"
//           >
//             <p className="text-sm text-slate-500">
//               Saved Properties
//             </p>

//             <p className="text-3xl font-bold text-slate-900 mt-2">
//               {savedProperties.length}
//             </p>
//           </Link>

//           <Link
//             href="/dashboard/student/bookings"
//             className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-[#075e3b] transition"
//           >
//             <p className="text-sm text-slate-500">
//               My Bookings
//             </p>

//             <p className="text-3xl font-bold text-slate-900 mt-2">
//               0
//             </p>
//           </Link>

//           <div className="bg-white border border-slate-200 hover:border-[#075e3b] rounded-2xl p-5">
//             <p className="text-sm text-slate-500">
//               Properties Viewed
//             </p>

//             <p className="text-3xl font-bold text-slate-900 mt-2">
//               {viewedProperties.length}
//             </p>
//           </div>
//         </div>

//         <div className="mt-10">
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <h2 className="text-xl font-bold text-slate-900">
//                 {search ? "Search Results" : "Recommended for you"}
//               </h2>

//               <p className="text-sm text-slate-500 mt-1">
//                 {search
//                   ? "Properties matching your search."
//                   : "Properties you might be interested in."}
//               </p>
//             </div>

//             <Link
//               href="/dashboard/student/accommodation"
//               className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#075e3b]"
//             >
//               View all
//               <FaArrowRight className="text-xs" />
//             </Link>
//           </div>

//           {recommendedProperties.length === 0 ? (
//             <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
//               <FaSearch className="mx-auto text-2xl text-slate-300" />

//               <h3 className="font-bold text-slate-900 mt-4">
//                 {search
//                   ? "No properties found"
//                   : "No properties available"}
//               </h3>

//               <p className="text-sm text-slate-500 mt-2">
//                 {search
//                   ? "Try searching for another location or property name."
//                   : "Approved accommodation listings will appear here."}
//               </p>

//               {search && (
//                 <Link
//                   href="/dashboard/student"
//                   className="inline-block mt-5 text-sm font-semibold text-[#075e3b] hover:underline"
//                 >
//                   Clear search
//                 </Link>
//               )}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//               {recommendedProperties.map((property) => (
//                 <div
//                   key={property.id}
//                   className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
//                 >
//                   <div className="h-44 bg-slate-200 overflow-hidden">
//                     {property.images?.[0] ? (
//                       <img
//                         src={property.images[0]}
//                         alt={property.name || "Accommodation"}
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <div className="h-full bg-slate-200 flex items-center justify-center">
//                         <span className="text-sm text-slate-400">
//                           Property Image
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   <div className="p-5">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="min-w-0">
//                         <h3 className="font-bold text-slate-900 truncate">
//                           {property.name || "Unnamed Property"}
//                         </h3>

//                         <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
//                           <FaMapMarkerAlt className="text-[#075e3b] shrink-0" />

//                           <span className="truncate">
//                             {property.location ||
//                               "Location not provided"}
//                           </span>
//                         </div>
//                       </div>

//                       <SavePropertyButton
//                         propertyId={property.id}
//                         initialSaved={savedProperties.includes(
//                           property.id
//                         )}
//                       />
//                     </div>

//                     <p className="text-xs text-slate-400 mt-3">
//                       {property.type || "Accommodation"}
//                     </p>

//                     <div className="flex items-center justify-between mt-5">
//                       <p className="font-bold text-[#075e3b]">
//                         ₦
//                         {Number(
//                           property.price || 0
//                         ).toLocaleString()}

//                         <span className="text-xs text-slate-400 font-normal">
//                           /year
//                         </span>
//                       </p>

//                       <Link
//                         href={`/dashboard/student/accommodation/${property.id}`}
//                         className="text-sm font-semibold text-slate-700 hover:text-[#075e3b]"
//                       >
//                         View Details
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import {
  FaSearch,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa"
import { MdFrontHand } from "react-icons/md"
import UserMenu from "@/components/UserMenu"
import SavePropertyButton from "@/components/SavePropertyButton"

type Property = {
  id: string
  name?: string
  type?: string
  location?: string
  address?: string
  price?: number | string
  images?: string[]
}

type StudentDashboardProps = {
  searchParams: Promise<{
    search?: string
  }>
}

export default async function StudentDashboard({
  searchParams,
}: StudentDashboardProps) {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  if (session.user.role !== "student") {
    redirect("/dashboard/agent")
  }

  const params = await searchParams
  const search = params.search?.trim() || ""

  // Get all approved properties
  const propertySnapshot = await adminDb
    .collection("properties")
    .where("status", "==", "approved")
    .get()

  const allProperties: Property[] = propertySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Property, "id">),
  }))

  // Get the student's saved and viewed properties
  let savedProperties: string[] = []
  let viewedProperties: string[] = []

  const usersSnapshot = await adminDb
    .collection("users")
    .where("email", "==", session.user.email)
    .limit(1)
    .get()

  if (!usersSnapshot.empty) {
    const userData = usersSnapshot.docs[0].data()

    savedProperties = Array.isArray(userData.savedProperties)
      ? userData.savedProperties
      : []

    viewedProperties = Array.isArray(userData.viewedProperties)
      ? userData.viewedProperties
      : []
  }

  // Filter properties when a search is submitted
  const filteredProperties = search
    ? allProperties.filter((property) => {
        const priceNumber = Number(property.price || 0)

        // Normal text search
        const searchableText = [
          property.name,
          property.type,
          property.location,
          property.address,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        // Create different searchable versions of the price
        const price = priceNumber.toString()
        const formattedPrice = priceNumber.toLocaleString()
        const priceWithNaira = `₦${formattedPrice}`
        const priceInThousands = `${Math.round(
          priceNumber / 1000
        )}k`

        const normalizedSearch = search
          .toLowerCase()
          .replace(/₦/g, "")
          .replace(/,/g, "")
          .replace(/\s+/g, "")
          .trim()

        const normalizedPrice = price
        const normalizedFormattedPrice = formattedPrice.replace(
          /,/g,
          ""
        )

        // Match normal text fields
        const textMatch = searchableText.includes(
          search.toLowerCase()
        )

        // Match price searches such as:
        // 300000
        // 300,000
        // ₦300,000
        const priceMatch =
          normalizedSearch === normalizedPrice ||
          normalizedSearch === normalizedFormattedPrice

        // Match shorthand searches such as:
        // 300k
        const thousandMatch =
          normalizedSearch === priceInThousands.toLowerCase()

        return textMatch || priceMatch || thousandMatch
      })
    : allProperties

  // Dashboard only displays the first 3 recommendations
  const recommendedProperties = filteredProperties.slice(0, 3)

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10">
        <div>
          <p className="text-sm text-slate-500">
            Student Dashboard
          </p>

          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Welcome back
            <MdFrontHand className="rotate-[-25deg] text-[#075e3b] text-lg" />
          </h1>
        </div>

        <UserMenu />
      </header>

      <div className="p-6 lg:p-10">
        <div className="bg-[#075e3b] rounded-2xl p-6 lg:p-8 text-white">
          <h2 className="text-2xl font-bold">
            Find your next home
          </h2>

          <p className="text-white/75 mt-1">
            Search for verified accommodation around NSUK.
          </p>

          <form
            method="GET"
            className="mt-6 bg-white rounded-xl p-2 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center gap-3 px-4">
              <FaSearch className="text-slate-400" />

              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by location or property name"
                className="w-full py-3 outline-none text-slate-700 text-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-[#075e3b] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#064d31] transition"
            >
              Search
            </button>
          </form>

          {search && (
            <p className="text-sm text-white/75 mt-3">
              {filteredProperties.length}{" "}
              {filteredProperties.length === 1
                ? "property"
                : "properties"}{" "}
              found for "{search}"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
          <Link
            href="/dashboard/student/saved"
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-[#075e3b] transition"
          >
            <p className="text-sm text-slate-500">
              Saved Properties
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {savedProperties.length}
            </p>
          </Link>

          <Link
            href="/dashboard/student/bookings"
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-[#075e3b] transition"
          >
            <p className="text-sm text-slate-500">
              My Bookings
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              0
            </p>
          </Link>

          <div className="bg-white border border-slate-200 hover:border-[#075e3b] rounded-2xl p-5">
            <p className="text-sm text-slate-500">
              Properties Viewed
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              {viewedProperties.length}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {search ? "Search Results" : "Recommended for you"}
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {search
                  ? "Properties matching your search."
                  : "Properties you might be interested in."}
              </p>
            </div>

            <Link
              href="/dashboard/student/accommodation"
              className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#075e3b]"
            >
              View all
              <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {recommendedProperties.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <FaSearch className="mx-auto text-2xl text-slate-300" />

              <h3 className="font-bold text-slate-900 mt-4">
                {search
                  ? "No properties found"
                  : "No properties available"}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                {search
                  ? "Try searching for another location, property name, type, or price."
                  : "Approved accommodation listings will appear here."}
              </p>

              {search && (
                <Link
                  href="/dashboard/student"
                  className="inline-block mt-5 text-sm font-semibold text-[#075e3b] hover:underline"
                >
                  Clear search
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendedProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  <div className="h-44 bg-slate-200 overflow-hidden">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name || "Accommodation"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full bg-slate-200 flex items-center justify-center">
                        <span className="text-sm text-slate-400">
                          Property Image
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">
                          {property.name || "Unnamed Property"}
                        </h3>

                        <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                          <FaMapMarkerAlt className="text-[#075e3b] shrink-0" />

                          <span className="truncate">
                            {property.location ||
                              "Location not provided"}
                          </span>
                        </div>
                      </div>

                      <SavePropertyButton
                        propertyId={property.id}
                        initialSaved={savedProperties.includes(
                          property.id
                        )}
                      />
                    </div>

                    <p className="text-xs text-slate-400 mt-3">
                      {property.type || "Accommodation"}
                    </p>

                    <div className="flex items-center justify-between mt-5">
                      <p className="font-bold text-[#075e3b]">
                        ₦
                        {Number(
                          property.price || 0
                        ).toLocaleString()}

                        <span className="text-xs text-slate-400 font-normal">
                          /year
                        </span>
                      </p>

                      <Link
                        href={`/dashboard/student/accommodation/${property.id}`}
                        className="text-sm font-semibold text-slate-700 hover:text-[#075e3b]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
// import Link from "next/link";
// import { FaMapMarkerAlt, FaBed, FaShower, FaTint, FaBolt } from "react-icons/fa";

// export default async function AccommodationDetails({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   return (
//     <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
//       <div className="mx-auto max-w-7xl">

//         {/* Back to accommodations */}
//         <Link
//           href="/accommodation"
//           className="mb-6 inline-block text-sm font-medium text-green-600 hover:text-green-700"
//         >
//           ← Back to Accommodations
//         </Link>

//         {/* Photo Gallery */}
//         <section className="grid gap-3 md:grid-cols-4 md:grid-rows-2">

//           {/* Main Image */}
//           <div className="h-72 overflow-hidden rounded-2xl bg-gray-200 md:col-span-2 md:row-span-2 md:h-[500px]">
//             <img
//               src="YOUR_MAIN_IMAGE_LINK_HERE"
//               alt="Main accommodation view"
//               className="h-full w-full object-cover"
//             />
//           </div>

//           {/* Second Image */}
//           <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
//             <img
//               src="YOUR_SECOND_IMAGE_LINK_HERE"
//               alt="Accommodation exterior"
//               className="h-full w-full object-cover"
//             />
//           </div>

//           {/* Third Image */}
//           <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
//             <img
//               src="YOUR_THIRD_IMAGE_LINK_HERE"
//               alt="Accommodation interior"
//               className="h-full w-full object-cover"
//             />
//           </div>

//           {/* Fourth Image */}
//           <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
//             <img
//               src="YOUR_FOURTH_IMAGE_LINK_HERE"
//               alt="Accommodation bedroom"
//               className="h-full w-full object-cover"
//             />
//           </div>

//           {/* Fifth Image */}
//           <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
//             <img
//               src="YOUR_FIFTH_IMAGE_LINK_HERE"
//               alt="Accommodation bathroom"
//               className="h-full w-full object-cover"
//             />
//           </div>

//         </section>

//         {/* Property Information */}
//         <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

//           <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

//             <div>
//               <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
//                 Available
//               </span>

//               <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
//                 Princess Sarah Lodge
//               </h1>

//               <p className="mt-2 flex items-center gap-2 text-gray-500">
//                 <FaMapMarkerAlt className="text-green-600" /> Keffi, Nasarawa State
//               </p>
//             </div>

//             <div>
//               <p className="text-2xl font-bold text-green-600">
//                 ₦300,000
//               </p>

//               <p className="text-sm text-gray-500">
//                 per year
//               </p>
//             </div>

//           </div>

//           {/* Property Type */}
//           <div className="mt-6">
//             <p className="text-sm text-gray-500">Property Type</p>

//             <p className="mt-1 font-medium text-gray-900">
//               Self Contain
//             </p>
//           </div>

//         </section>

//         {/* Video Tour */}
//         <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

//           <h2 className="text-2xl font-semibold text-gray-900">
//             Video Tour
//           </h2>

//           <p className="mt-2 text-gray-500">
//             Take a closer look at the accommodation.
//           </p>

//           <div className="mt-5 flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">
//             <video
//               controls
//               className="h-full w-full object-cover"
//               src="YOUR_VIDEO_LINK_HERE"
//             >
//               Your browser does not support the video tag.
//             </video>
//           </div>

//         </section>

//         {/* Property Features */}
//         <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

//           <h2 className="text-2xl font-semibold text-gray-900">
//             Property Features
//           </h2>

//           <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="flex items-center gap-2.5 font-medium text-gray-900">
//                 <FaBed className="text-xl text-green-600" /> Bedroom
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 1 Bedroom
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="flex items-center gap-2.5 font-medium text-gray-900">
//                 <FaShower className="text-xl text-green-600" /> Bathroom
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 1 Bathroom
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="flex items-center gap-2.5 font-medium text-gray-900">
//                 <FaTint className="text-xl text-green-600" /> Water
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 Available
//               </p>
//             </div>

//             <div className="rounded-xl bg-gray-50 p-4">
//               <p className="flex items-center gap-2.5 font-medium text-gray-900">
//                 <FaBolt className="text-xl text-green-600" /> Electricity
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 Prepaid Meter
//               </p>
//             </div>

//           </div>

//         </section>

//         {/* Description */}
//         <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

//           <h2 className="text-2xl font-semibold text-gray-900">
//             About this accommodation
//           </h2>

//           <p className="mt-4 max-w-4xl leading-7 text-gray-600">
//             This comfortable self-contained accommodation is located in
//             Keffi, Nasarawa State, and provides convenient access to
//             Nasarawa State University. It is suitable for students looking
//             for a comfortable and convenient place to stay during their
//             studies.
//           </p>

//         </section>

//         {/* Location */}
//         <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

//           <h2 className="text-2xl font-semibold text-gray-900">
//             Location
//           </h2>

//           <div className="mt-5 flex h-64 items-center justify-center rounded-2xl bg-gray-100">
//             <p className="flex items-center gap-2 text-gray-500">
//               <FaMapMarkerAlt className="text-xl text-green-600" /> Keffi, Nasarawa State
//             </p>
//           </div>

//         </section>

//         {/* Booking */}
//         <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

//           <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

//             <div>
//               <p className="text-sm text-gray-500">
//                 Annual rent
//               </p>

//               <p className="text-3xl font-bold text-green-600">
//                 ₦300,000
//               </p>
//             </div>

//             <button
//               className="rounded-xl bg-green-600 px-8 py-4 font-semibold text-white transition hover:bg-green-700"
//             >
//               Book Accommodation
//             </button>

//           </div>

//         </section>

//         {/* Temporary ID */}
//         <p className="mt-6 text-center text-xs text-gray-400">
//           Listing ID: {id}
//         </p>

//       </div>
//     </main>
//   );
// }
import Link from "next/link";
import { FaMapMarkerAlt, FaBed, FaShower, FaTint, FaBolt } from "react-icons/fa";
import { Theme } from "@/components/theme";

export default async function AccommodationDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Back to accommodations */}
        <Link
          href="/accommodation"
          className="mb-6 inline-block text-sm font-medium transition-colors"
          style={{ color: Theme.primaryColor }}
        >
          ← Back to Accommodations
        </Link>

        {/* Photo Gallery */}
        <section className="grid gap-3 md:grid-cols-4 md:grid-rows-2">

          {/* Main Image */}
          <div className="h-72 overflow-hidden rounded-2xl bg-gray-200 md:col-span-2 md:row-span-2 md:h-[500px]">
            <img
              src="YOUR_MAIN_IMAGE_LINK_HERE"
              alt="Main accommodation view"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Second Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            <img
              src="YOUR_SECOND_IMAGE_LINK_HERE"
              alt="Accommodation exterior"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Third Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            <img
              src="YOUR_THIRD_IMAGE_LINK_HERE"
              alt="Accommodation interior"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Fourth Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            <img
              src="YOUR_FOURTH_IMAGE_LINK_HERE"
              alt="Accommodation bedroom"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Fifth Image */}
          <div className="h-56 overflow-hidden rounded-2xl bg-gray-200 md:h-auto">
            <img
              src="YOUR_FIFTH_IMAGE_LINK_HERE"
              alt="Accommodation bathroom"
              className="h-full w-full object-cover"
            />
          </div>

        </section>

        {/* Property Information */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div>
              <span 
                className="rounded-full px-3 py-1 text-sm font-medium"
                style={{ backgroundColor: `${Theme.primaryColor}15`, color: Theme.primaryColor }}
              >
                Available
              </span>

              <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Princess Sarah Lodge
              </h1>

              <p className="mt-2 flex items-center gap-2 text-gray-500">
                <span 
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-xs shadow-sm"
                  style={{ backgroundColor: Theme.primaryColor, color: Theme.secondaryColor }}
                >
                  <FaMapMarkerAlt />
                </span>
                Keffi, Nasarawa State
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold" style={{ color: Theme.primaryColor }}>
                ₦300,000
              </p>

              <p className="text-sm text-gray-500">
                per year
              </p>
            </div>

          </div>

          {/* Property Type */}
          <div className="mt-6">
            <p className="text-sm text-gray-500">Property Type</p>

            <p className="mt-1 font-medium text-gray-900">
              Self Contain
            </p>
          </div>

        </section>

        {/* Video Tour */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            Video Tour
          </h2>

          <p className="mt-2 text-gray-500">
            Take a closer look at the accommodation.
          </p>

          <div className="mt-5 flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-gray-200 md:h-[450px]">
            <video
              controls
              className="h-full w-full object-cover"
              src="YOUR_VIDEO_LINK_HERE"
            >
              Your browser does not support the video tag.
            </video>
          </div>

        </section>

        {/* Property Features */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            Property Features
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaBed className="text-xl" style={{ color: Theme.primaryColor }} /> Bedroom
              </p>
              <p className="mt-1 text-sm text-gray-500">
                1 Bedroom
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaShower className="text-xl" style={{ color: Theme.primaryColor }} /> Bathroom
              </p>
              <p className="mt-1 text-sm text-gray-500">
                1 Bathroom
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaTint className="text-xl" style={{ color: Theme.primaryColor }} /> Water
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Available
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="flex items-center gap-2.5 font-medium text-gray-900">
                <FaBolt className="text-xl" style={{ color: Theme.primaryColor }} /> Electricity
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Prepaid Meter
              </p>
            </div>

          </div>

        </section>

        {/* Description */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            About this accommodation
          </h2>

          <p className="mt-4 max-w-4xl leading-7 text-gray-600">
            This comfortable self-contained accommodation is located in
            Keffi, Nasarawa State, and provides convenient access to
            Nasarawa State University. It is suitable for students looking
            for a comfortable and convenient place to stay during their
            studies.
          </p>

        </section>

        {/* Location */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-2xl font-semibold text-gray-900">
            Location
          </h2>

          <div className="mt-5 flex h-64 flex-col items-center justify-center rounded-2xl bg-gray-100 border border-gray-200/60">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md"
              style={{ backgroundColor: Theme.primaryColor }}
            >
              <FaMapMarkerAlt className="text-xl" style={{ color: Theme.secondaryColor }} />
            </div>
            <p className="text-gray-600 font-medium">
              Keffi, Nasarawa State
            </p>
          </div>

        </section>

        {/* Booking */}
        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Annual rent
              </p>

              <p className="text-3xl font-bold" style={{ color: Theme.primaryColor }}>
                ₦300,000
              </p>
            </div>

            <button
              className="rounded-xl px-8 py-4 font-semibold text-white transition hover:opacity-95 shadow-md"
              style={{ backgroundColor: Theme.primaryColor }}
            >
              Book Accommodation
            </button>

          </div>

        </section>

        {/* Temporary ID */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Listing ID: {id}
        </p>

      </div>
    </main>
  );
}
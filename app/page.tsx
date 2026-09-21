import Navbar from "@/components/Navbar"
import Browsebutton from "@/components/Browsebutton"
import { Theme } from "@/components/theme"
import { 
  FaMapMarkerAlt, 
  FaBolt, 
  FaLock, 
  FaWalking, 
  FaShower, 
  FaCar, 
  FaShieldAlt, 
  FaHome, 
  FaUserGraduate,
  FaClock,
  FaSearch,
  FaCalendarAlt,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaArrowRight
} from "react-icons/fa"
import { HiOutlineShieldCheck, HiOutlineMapPin, HiOutlineBanknotes } from "react-icons/hi2"


export default function Home() {

  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800">

      {/* HERO SECTION */}
      <section
        className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col justify-center"
        style={{ backgroundImage: "url('/Nsuknesthero1.jpg')" }}
      >
        <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-r  from-[#075e3b]/80 to-black/80 px-4 py-20 text-center">
          <h1
            className="text-4xl md:text-6xl font-extrabold max-w-4xl font-playfair leading-tight"
            style={{ color: "#ffffff" }}
          >
            Find a place you'll <span style={{ color: Theme.secondaryColor }}>love</span> to call home
          </h1>
          <p className="mt-4 mb-8 text-lg md:text-md text-gray-200 max-w-2xl font-light">
            Discover verified, safe, and affordable off-campus accommodation around Nasarawa State University, Keffi.
          </p>

          <Browsebutton />

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white">
            <div className="flex flex-col items-center">
              <FaHome className="text-xl mb-1" style={{ color: Theme.secondaryColor }} />
              <p className="text-2xl md:text-3xl font-bold" style={{ color: Theme.secondaryColor }}>500+</p>
              <p className="text-xs md:text-sm text-gray-300">Verified Lodges</p>
            </div>
            <div className="flex flex-col items-center">
              <FaUserGraduate className="text-xl mb-1" style={{ color: Theme.secondaryColor }} />
              <p className="text-2xl md:text-3xl font-bold" style={{ color: Theme.secondaryColor }}>2,000+</p>
              <p className="text-xs md:text-sm text-gray-300">Happy Students</p>
            </div>
            <div className="flex flex-col items-center">
              <FaShieldAlt className="text-xl mb-1" style={{ color: Theme.secondaryColor }} />
              <p className="text-2xl md:text-3xl font-bold" style={{ color: Theme.secondaryColor }}>100%</p>
              <p className="text-xs md:text-sm text-gray-300">Scam Protection</p>
            </div>
            <div className="flex flex-col items-center">
              <FaClock className="text-xl mb-1" style={{ color: Theme.secondaryColor }} />
              <p className="text-2xl md:text-3xl font-bold" style={{ color: Theme.secondaryColor }}>5 Mins</p>
              <p className="text-xs md:text-sm text-gray-300">Avg. Campus Distance</p>
            </div>
          </div>
        </main>
      </section>

      {/* QUICK SEARCH & FILTER BAR */}
      <section className="-mt-10 relative z-20 max-w-5xl mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Location around Keffi</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[#075e3b]">
              <option value="">All Locations</option>
              <option value="angwan-lambu">Angwan Lambu</option>
              <option value="highfields">Highfields</option>
              <option value="pyanku">Pyanku</option>
              <option value="campus-gate">Main Gate Area</option>
              <option value="keffi-town">Keffi Town</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Room Type</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#075e3b]">
              <option value="">All Types</option>
              <option value="self-contain">Self Contain</option>
              <option value="single-room">Single Room</option>
              <option value="2-bedroom">2 Bedroom Flat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Max Budget (Annual)</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#075e3b]">
              <option value="">Any Price</option>
              <option value="150000">Under ₦150,000</option>
              <option value="250000">₦150,000 - ₦250,000</option>
              <option value="350000">₦250,000 - ₦350,000</option>
              <option value="500000">₦350,000+</option>
            </select>
          </div>

          <button
            className="w-full p-3 font-semibold text-white rounded-lg transition duration-200 shadow-md hover:opacity-90 flex items-center justify-center gap-2"
            style={{ backgroundColor: Theme.primaryColor }}
          >
            <FaSearch className="text-sm" /> Search Lodges
          </button>
        </div>
      </section>

      {/* WHY CHOOSE NSUK NEST */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-3" style={{ color: Theme.primaryColor }}>
            Why Students Trust Nsuk Nest
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            We eliminate agents' exorbitant fees, scam listings, and stressful lodge searching in Keffi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${Theme.primaryColor}15` }}>
              <HiOutlineShieldCheck className="w-6 h-6" style={{ color: Theme.primaryColor }} />
            </div>
            <h3 className="text-xl font-bold mb-2">100% Verified Listings</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every lodge on Nsuk Nest is physically inspected by our team to protect you from fake caretakers and agents.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${Theme.primaryColor}15` }}>
              <HiOutlineMapPin className="w-6 h-6" style={{color: Theme.primaryColor}}/>
            </div>
            <h3 className="text-xl font-bold mb-2">Close to Main Campus</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Find accommodation within walking distance or short shuttle rides to NSUK lecture halls and faculties.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${Theme.primaryColor}15` }}>
              <HiOutlineBanknotes className="w-6 h-6" style={{ color: Theme.primaryColor }} />
            </div>
            <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              No hidden charges. Clear breakdown of annual rent, light bill, security fees, and caution fee before you pay.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED LODGES SECTION */}
      <section className="py-16 bg-[#d7a928]/10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold font-playfair" style={{ color: Theme.primaryColor }}>
                Featured Lodges & Apartments
              </h2>
              <p className="text-gray-600 mt-1">Hand-picked hot student accommodations available right now.</p>
            </div>
            <a href="/browse" className="mt-4 md:mt-0 font-semibold flex items-center gap-2 hover:underline" style={{ color: Theme.primaryColor }}>
              View All Listings <FaArrowRight className="text-xs" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Lodge Card 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group">
              <div className="relative h-48 bg-gray-200">
                <img src="/Nsuknesthero1.jpg" alt="Lodge" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FaShieldAlt className="text-[10px]" /> VERIFIED
                </span>
                <span className="absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: Theme.secondaryColor }}>
                  Self Contain
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">Green Villa Lodge</h3>
                  <p className="font-bold text-md" style={{ color: Theme.primaryColor }}>₦180,000<span className="text-xs font-normal text-gray-500">/yr</span></p>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-emerald-700 flex-shrink-0" /> Angwan Lambu, NSUK Main Campus
                </p>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FaBolt className="text-amber-500" /> 24/7 Power</span>
                  <span className="flex items-center gap-1"><FaLock className="text-gray-400" /> Gated</span>
                  <span className="flex items-center gap-1"><FaWalking className="text-gray-400" /> 5 mins walk</span>
                </div>
              </div>
            </div>

            {/* Lodge Card 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group">
              <div className="relative h-48 bg-gray-200">
                <img src="/Nsuknesthero1.jpg" alt="Lodge" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FaShieldAlt className="text-[10px]" /> VERIFIED
                </span>
                <span className="absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: Theme.secondaryColor }}>
                  Single Room
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">Highland Student Suites</h3>
                  <p className="font-bold text-md" style={{ color: Theme.primaryColor }}>₦120,000<span className="text-xs font-normal text-gray-500">/yr</span></p>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-emerald-700 flex-shrink-0" /> Highfields, Keffi
                </p>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FaShower className="text-blue-500" /> Ensuite</span>
                  <span className="flex items-center gap-1"><FaLock className="text-gray-400" /> Resident Security</span>
                </div>
              </div>
            </div>

            {/* Lodge Card 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition group">
              <div className="relative h-48 bg-gray-200">
                <img src="/Nsuknesthero1.jpg" alt="Lodge" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FaShieldAlt className="text-[10px]" /> VERIFIED
                </span>
                <span className="absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: Theme.secondaryColor }}>
                  2 Bedroom
                </span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">Pyanku Oasis Lodge</h3>
                  <p className="font-bold text-md" style={{ color: Theme.primaryColor }}>₦300,000<span className="text-xs font-normal text-gray-500">/yr</span></p>
                </div>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-emerald-700 flex-shrink-0" /> Pyanku Area, NSUK
                </p>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FaCar className="text-gray-500" /> Parking Space</span>
                  <span className="flex items-center gap-1"><FaBolt className="text-amber-500" /> Prepaid Meter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* POPULAR NEIGHBORHOODS (Fixed Number Visibility on Hover) */}
<section 
  className="py-24 px-4 relative overflow-hidden text-white"
  style={{ backgroundColor: Theme.primaryColor }}
>
  <div className="max-w-6xl mx-auto relative z-10">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-emerald-700/60 pb-8">
      <div>
        <span 
          className="text-xs font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-full mb-3 inline-block bg-black/20"
          style={{ color: Theme.secondaryColor }}
        >
          Keffi Neighborhood Guide
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold font-playfair tracking-tight mt-2 text-white">
          Find where your <span className="italic" style={{ color: Theme.secondaryColor }}>journey</span> leads.
        </h2>
      </div>
      <p className="text-emerald-100/80 max-w-md mt-4 md:mt-0 text-sm leading-relaxed">
        Explore NSUK’s most popular off-campus student hubs. Compare locations by distance to lecture halls, lodge availability, and vibe.
      </p>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        {
          id: "01",
          name: "Angwan Lambu",
          tagline: "Heart of Student Life & Main Gate Hub",
          distance: "2–5 mins to Main Gate",
          lodgeCount: "200+ Lodges",
          highlights: ["Self-contains & Single rooms", "24/7 commercial activity", "Shuttle access"],
        },
        {
          id: "02",
          name: "High Court Area",
          tagline: "Serene & Preferred for Focused Studying",
          distance: "7–10 mins to Campus",
          lodgeCount: "110+ Lodges",
          highlights: ["Quiet environment", "Modern flat apartments", "Gated compounds"],
        },
        {
          id: "03",
          name: "Family & Friends",
          tagline: "Lively Neighborhood with Great Food Spots",
          distance: "5–8 mins to Campus",
          lodgeCount: "140+ Lodges",
          highlights: ["Popular student eateries", "Affordable self-contains", "Active night security"],
        },
        {
          id: "04",
          name: "BCG",
          tagline: "Budget-Friendly & Rapidly Growing",
          distance: "8–12 mins to Campus",
          lodgeCount: "85+ Lodges",
          highlights: ["Lowest average rent", "Spacious room layouts", "Peaceful surroundings"],
        },
        {
          id: "05",
          name: "GRA",
          tagline: "Premium, Secure & Modern Apartments",
          distance: "10–15 mins to Campus",
          lodgeCount: "50+ Lodges",
          highlights: ["High-end finishing", "24/7 security posts", "Constant power grid"],
        },
        {
          id: "06",
          name: "Princess Sarah",
          tagline: "Strategic Location with Easy Transport Access",
          distance: "5–7 mins to Campus",
          lodgeCount: "95+ Lodges",
          highlights: ["Direct bike/shuttle routes", "Ensuite single rooms", "Close to supermarkets"],
        },
      ].map((area) => (
        <div
          key={area.id}
          style={{ "--card-bg": Theme.primaryColor } as React.CSSProperties}
          className="group relative border border-emerald-700/60 p-7 rounded-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer bg-[var(--card-bg)] hover:bg-[#d7a928] hover:border-[#d7a928] hover:shadow-2xl"
        >
          <div>
            {/* Number + Badge */}
            <div className="flex justify-between items-center mb-6">
              <span 
                className="text-3xl font-black font-playfair transition-colors duration-300 group-hover:!text-black"
                style={{ color: Theme.secondaryColor }}
              >
                {area.id}.
              </span>
              <span 
                className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors duration-300 bg-emerald-900/60 text-emerald-200 group-hover:bg-black/10 group-hover:text-black"
              >
                <FaHome className="text-[10px]" /> {area.lodgeCount}
              </span>
            </div>

            {/* Title & Tagline */}
            <h3 
              className="text-2xl font-bold transition-colors duration-300 mb-1.5 text-white group-hover:text-black"
            >
              {area.name}
            </h3>
            <p className="text-xs text-emerald-100/70 group-hover:text-black/80 font-medium mb-5 transition-colors duration-300">
              {area.tagline}
            </p>

            {/* Highlights */}
            <ul className="space-y-2 mb-6 text-xs text-emerald-100/90 group-hover:text-black font-medium transition-colors duration-300">
              {area.highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300 bg-[#d7a928] group-hover:bg-black" 
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-emerald-700/60 group-hover:border-black/20 flex items-center justify-between text-xs transition-colors duration-300">
            <span className="text-emerald-100/80 group-hover:text-black flex items-center gap-1.5 transition-colors duration-300 font-medium">
              <FaMapMarkerAlt className="text-amber-400 group-hover:text-black flex-shrink-0 transition-colors duration-300" />
              {area.distance}
            </span>
            <span 
              className="font-bold flex items-center gap-1.5 group-hover:translate-x-1.5 text-amber-300 group-hover:text-black transition-all duration-200"
            >
              View Lodges <FaArrowRight className="text-[10px]" />
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
    
  

      {/* HOW IT WORKS */}
      <section className="py-20 text-white px-4 bg-linear-to-r from-black to-green-800 min-h-screen">
        <div className="max-w-6xl mx-auto mt-10">
          <div className="text-center mb-16 ">
            <h2 className="text-3xl font-bold font-playfair mb-2" style={{ color: Theme.secondaryColor }}>
              How Nsuk Nest Works
            </h2>
            <p className="text-gray-400">Get your lodge in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 text-slate-900" style={{ backgroundColor: Theme.secondaryColor }}>
                <FaSearch className="text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-2">1. Search & Filter</h3>
              <p className="text-gray-200 text-sm">Browse verified lodges around NSUK by location, budget, and room amenities.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 text-slate-900" style={{ backgroundColor: Theme.secondaryColor }}>
                <FaCalendarAlt className="text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-2">2. Schedule Inspection</h3>
              <p className="text-gray-200 text-sm">Book a physical guided tour with our verified agent or view high-def video walkthroughs.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 text-slate-900" style={{ backgroundColor: Theme.secondaryColor }}>
                <FaKey className="text-2xl" />
              </div>
              <h3 className="font-bold text-xl mb-2">3. Pay & Move In</h3>
              <p className="text-gray-200 text-sm">Pay securely through Nsuk Nest escrow and get your keys without agent hassle.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LANDLORD / AGENT CTA */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div
          className="rounded-3xl p-10 md:p-16 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8"
          style={{ backgroundColor: Theme.primaryColor }}
        >
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold font-playfair mb-4">
              Are you a Lodge Owner or Agent in Keffi?
            </h2>
            <p className="text-emerald-100 text-sm md:text-base">
              List your property on Nsuk Nest and reach thousands of NSUK students searching for accommodation daily.
            </p>
          </div>
          <button
            className="px-8 py-4 font-bold rounded-xl whitespace-nowrap shadow-lg transition hover:scale-105"
            style={{ backgroundColor: Theme.secondaryColor, color: "#000" }}
          >
            Post Your Lodge Free
          </button>
        </div>
      </section>

      {/* FOOTER */}
     
    </div>
  )
}

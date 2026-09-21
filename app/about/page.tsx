import React from "react"
import { FaGraduationCap, FaShieldAlt, FaMapMarkedAlt, FaHandshake, FaArrowRight } from "react-icons/fa"
import { Theme } from "@/components/theme"

export default function AboutPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="px-4 pb-26 max-w-6xl mx-auto ">
        <div className="text-center max-w-3xl mx-auto">
          <span 
            className=" font-lobster text-xs font-extrabold tracking-widest uppercase px-4 py-2 rounded-full mb-6 inline-block"
            style={{ backgroundColor: `${Theme.primaryColor}15`, color: Theme.primaryColor }}
          >
            About Nsuk Nest
          </span>
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-black font-playfair tracking-tight mb-6 leading-tight"
            style={{ color: Theme.primaryColor }}
          >
            Redefining Student <span className="italic" style={{ color: Theme.secondaryColor }}>Living</span> in Keffi.
          </h1>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            Finding a comfortable, secure, and affordable lodge off-campus shouldn't be the hardest part of your university journey. We built Nsuk Nest to bridge the gap between NSUK students and their perfect homes.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY & MISSION (Responsive Split Section) */}
      <section className="px-4 py-12 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <h2 
              className="text-3xl md:text-4xl font-bold font-playfair mb-6"
              style={{ color: Theme.primaryColor }}
            >
              Built by students, <br />
              <span style={{ color: Theme.secondaryColor }}>for students.</span>
            </h2>
            <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
              <p>
                Every semester, hundreds of freshers and returning students at Nasarawa State University go through the grueling process of lodge hunting. The endless trekking under the Keffi sun, falling victim to fake housing agents, and moving into apartments that don't meet basic expectations.
              </p>
              <p>
                <strong>Nsuk Nest was born out of a simple idea:</strong> What if you could explore Angwan Lambu, High Court, and BCG from the comfort of your smartphone? 
              </p>
              <p>
                Our mission is to digitize off-campus accommodation, providing a transparent, verified, and seamless platform where students can view room layouts, compare rent prices, check proximity to the university gates, and contact caretakers directly.
              </p>
            </div>
          </div>

          {/* Image / Graphic Placeholder */}
          <div className="order-1 lg:order-2 relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
            {/* Fallback styling if you don't have an image yet. Just replace the img src when ready */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ 
                backgroundImage: `url('/nsuknestabout.png')`,
                backgroundColor: Theme.primaryColor 
              }}
            />
            {/* Overlay to ensure theme consistency */}
            <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply" />
            <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl text-white">
              <p className="font-bold text-xl mb-1">Stress-free lodge hunting.</p>
              <p className="text-sm opacity-90 text-white">Your academic focus starts with a comfortable home.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES / WHY CHOOSE US (Responsive Grid) */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-4xl font-bold font-playfair mb-4"
            style={{ color: Theme.primaryColor }}
          >
            Why Choose Nsuk Nest?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We hold ourselves to a high standard to ensure that every student who uses our platform finds exactly what they are looking for without the usual hassle.
          </p>
        </div>

        {/* The Grid: 1 col on small (sm), 2 on tablet (md), 4 on desktop (lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FaShieldAlt,
              title: "Verified Lodges",
              desc: "No scams. We physically verify properties and landlords before they are listed on our platform.",
            },
            {
              icon: FaMapMarkedAlt,
              title: "Accurate Locations",
              desc: "Know exactly how far you are from the Main Gate, Assembly Hall, or your faculty.",
            },
            {
              icon: FaHandshake,
              title: "No Hidden Fees",
              desc: "Transparent pricing. Connect directly with verified agents and caretakers without shady middle-men.",
            },
            {
              icon: FaGraduationCap,
              title: "Student Centric",
              desc: "Tailored specifically for NSUK culture, recognizing the unique vibe of every Keffi neighborhood.",
            },
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-2"
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#d7a928]"
                style={{ backgroundColor: `${Theme.primaryColor}15`, color: Theme.primaryColor }}
              >
                {/* Icon changes to black on hover to match the gold background */}
                <item.icon className="text-2xl transition-colors duration-300 group-hover:text-black" />
              </div>
              <h3 
                className="text-xl font-bold mb-3 transition-colors duration-300"
                style={{ color: Theme.primaryColor }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="px-4 py-12">
        <div 
          className="max-w-5xl mx-auto rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden"
          style={{ backgroundColor: Theme.primaryColor }}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-6">
              Ready to find your next home?
            </h2>
            <p className="text-emerald-100/90 mb-10 max-w-xl mx-auto text-sm md:text-base">
              Join thousands of NSUKites who have skipped the trekking and found their perfect lodges online.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-black transition-transform duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{ backgroundColor: Theme.secondaryColor }}
              >
                Explore Lodges <FaArrowRight className="text-sm" />
              </button>
              <button 
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                List a Property
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
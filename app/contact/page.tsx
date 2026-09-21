import React from "react"
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaWhatsapp, FaArrowRight } from "react-icons/fa"
import { Theme } from "@/components/theme"
import Link from "next/link"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-22 pb-20">
      
      {/* HEADER SECTION */}
      <section className="px-4 max-w-6xl mx-auto text-center mb-16">
        <span 
          className=" font-lobster text-xs font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full mb-3 inline-block"
          style={{ backgroundColor: `${Theme.primaryColor}15`, color: Theme.primaryColor }}
        >
          Get in Touch
        </span>
        <h1 
          className="text-4xl md:text-5xl font-black font-playfair tracking-tight mb-4"
          style={{ color: Theme.primaryColor }}
        >
          We'd love to <span className="italic" style={{ color: Theme.secondaryColor }}>hear</span> from you.
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Have questions about a lodge in Angwan Lambu, need help listing your property, or just want to say hi? Reach out to our team in Keffi.
        </p>
      </section>

      {/* CONTENT CONTAINER */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CONTACT INFO CARDS (1 Column on desktop) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Direct Info Card */}
            <div 
              className="p-8 rounded-3xl text-white relative overflow-hidden shadow-xl"
              style={{ backgroundColor: Theme.primaryColor }}
            >
              <h2 className="text-2xl font-bold font-playfair mb-6">Contact Information</h2>
              <ul className="space-y-6 text-sm">
                <li className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <FaMapMarkerAlt style={{ color: Theme.secondaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Location</p>
                    <p className="text-emerald-100/80 text-xs mt-0.5 leading-relaxed">
                      Nasarawa State University, Main Gate Environs, Keffi, Nasarawa State.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <FaPhoneAlt style={{ color: Theme.secondaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Phone Support</p>
                    <a href="tel:+2348000000000" className="text-emerald-100/80 text-xs mt-0.5 block hover:text-white transition-colors">
                      +234 09025486111
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <FaEnvelope style={{ color: Theme.secondaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email Us</p>
                    <a href="mailto:support@nsuknest.com" className="text-emerald-100/80 text-xs mt-0.5 block hover:text-white transition-colors">
                      support@nsuknest.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-white/10 flex-shrink-0">
                    <FaClock style={{ color: Theme.secondaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Office Hours</p>
                    <p className="text-emerald-100/80 text-xs mt-0.5">
                      Mon – Sat: 8:00 AM – 6:00 PM
                    </p>
                  </div>
                </li>
              </ul>

              {/* Quick WhatsApp Link */}
              <div className="mt-8 pt-6 border-t border-emerald-700/60">
                <a
                  href="https://wa.me/2348187341458"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 text-xs transition-transform duration-300 hover:scale-[1.02]"
                  style={{ backgroundColor: Theme.secondaryColor }}
                >
                  <FaWhatsapp className="text-base" /> Chat with us on WhatsApp
                </a>
              </div>
            </div>

          </div>

          {/* CONTACT FORM (2 Columns on desktop) - Pure Server Component Action */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-3xl border border-gray-200/80 shadow-sm">
            <h2 
              className="text-2xl font-bold font-playfair mb-2"
              style={{ color: Theme.primaryColor }}
            >
              Send us a message
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Fill out the form below and our support team will get back to you within 24 hours.
            </p>

            <form action="/api/contact" method="POST" className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="name">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Aminu Bello"
                    className=" text-black/60 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                    style={{ '--tw-ring-color': Theme.primaryColor } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="student@nsuk.edu.ng"
                    className=" text-black/60 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                    style={{ '--tw-ring-color': Theme.primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="subject">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder="e.g. Property Listing Inquiry / Lodge Verification"
                  className=" text-black/60 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all"
                  style={{ '--tw-ring-color': Theme.primaryColor } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  className=" text-black/60 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all resize-none"
                  style={{ '--tw-ring-color': Theme.primaryColor } as React.CSSProperties}
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 rounded-xl text-white font-bold text-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                style={{ backgroundColor: Theme.primaryColor }}
              >
                Send Message <FaArrowRight className="text-xs" />
              </button>

            </form>
          </div>

        </div>
      </section>

    </main>
  )
}
"use client"
import React from "react"
import { 
  FaInstagram, 
  FaTwitter, 
  FaFacebookF, 
  FaWhatsapp, 
  FaMapMarkerAlt, 
  FaEnvelope, 
  FaPhoneAlt 
} from "react-icons/fa"
import { Theme } from "@/components/theme"

export default function Footer(): React.JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#101d17] text-slate-300 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top Section: 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Brand & About */}
          <div className="space-y-6">
            <h2 
              className="text-3xl font-black font-playfair tracking-tight"
              style={{ color: "white"}}
            >
              Nsuk<span style={{color: Theme.primaryColor}}> Nest.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Your trusted companion for finding the perfect off-campus student accommodation in Keffi. We bridge the gap between students and comfortable living.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: FaWhatsapp, link: "#" },
                { icon: FaInstagram, link: "#" },
                { icon: FaTwitter, link: "#" },
                { icon: FaFacebookF, link: "#" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.link}
                  className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  style={{ 
                    // Use CSS variables for hover states to play nice with Tailwind
                    ["--hover-bg" as string]: Theme.secondaryColor,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = Theme.secondaryColor;
                    e.currentTarget.style.color = "#000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                  }}
                >
                  <social.icon className="text-[15px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              {["Find a Lodge", "List a Property", "Neighborhood Guide", "Roommate Finder", "About Us"].map((link, idx) => (
                <li key={idx}>
                  <a 
                    href="#" 
                    className="transition-colors duration-300 hover:pl-1 inline-block"
                    style={{ 
                      ["--hover-color" as string]: Theme.secondaryColor 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = Theme.secondaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = ""}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Top Areas */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Top Areas</h3>
            <ul className="space-y-4 text-sm">
              {["Angwan Lambu", "High Court Area", "Family & Friends", "BCG", "GRA", "Princess Sarah"].map((area, idx) => (
                <li key={idx}>
                  <a 
                    href="#" 
                    className="transition-colors duration-300 hover:pl-1 inline-block"
                    onMouseEnter={(e) => e.currentTarget.style.color = Theme.secondaryColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = ""}
                  >
                    {area}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 tracking-wide uppercase text-sm">Get in Touch</h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 flex-shrink-0" style={{ color: Theme.secondaryColor }} />
                <span className="text-slate-400">
                  Nasarawa State University, Keffi<br />
                  Main Campus Environs, Nasarawa State.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="flex-shrink-0" style={{ color: Theme.secondaryColor }} />
                <a href="tel:+2348000000000" className="text-slate-400 hover:text-white transition-colors">
                  +234 090 254 86111
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="flex-shrink-0" style={{ color: Theme.secondaryColor }} />
                <a href="mailto:support@nsuknest.com" className="text-slate-400 hover:text-white transition-colors">
                  support@nsuknest.com
                </a>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {currentYear} Nsuk Nest. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
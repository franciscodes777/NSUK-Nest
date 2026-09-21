import React from "react";
import { FaChevronDown, FaEnvelope, FaHeadset } from "react-icons/fa";
import { Theme } from "@/components/theme";
import Link from "next/link";

export default function FAQPage(): React.JSX.Element {
  const faqs = [
    {
      question: "How do I book a lodge through NSUK Nest?",
      answer: "Booking is simple. Browse our verified listings, find a lodge that suits your needs, and click 'Book Accommodation'. You will be given direct contact details or payment instructions for the verified landlord or agent to finalize your move-in.",
    },
    {
      question: "Are the lodges and agents on this platform verified?",
      answer: "Yes. Every property listed on NSUK Nest undergoes a strict verification process. We ensure that the landlords and agents are legitimate to protect students from housing scams in Keffi.",
    },
    {
      question: "Can I inspect a lodge physically before paying?",
      answer: "Absolutely. We strongly encourage physical inspections. Once you find a lodge you like, you can use the agent's contact details provided on the listing to schedule a physical tour before making any financial commitments.",
    },
    {
      question: "Are there any hidden agency or platform fees?",
      answer: "NSUK Nest is completely transparent. The annual rent and any standard agency/agreement fees are clearly stated on the property details page. We do not charge students hidden platform fees for browsing or contacting agents.",
    },
    {
      question: "Which areas in Keffi do you cover?",
      answer: "We currently list accommodations across all major student-friendly neighborhoods around Nasarawa State University, including Angwan Lambu, High Court, BCG, and Keffi GRA.",
    },
    {
      question: "Can I list my own property or room on NSUK Nest?",
      answer: "Yes! If you are a landlord, agent, or a student looking for a roommate, you can register as an 'Agent / Owner' on our Sign Up page to submit your property for verification and listing.",
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-4 md:px-8">
      <div className="mx-auto max-w-3xl">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <span 
            className=" font-lobster text-xs font-extrabold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 inline-block"
            style={{ backgroundColor: `${Theme.primaryColor}15`, color: Theme.primaryColor }}
          >
            Help & Support
          </span>
          <h1 
            className="text-4xl md:text-5xl font-black font-playfair tracking-tight mb-4"
            style={{ color: Theme.primaryColor }}
          >
            Frequently Asked <span className="italic" style={{ color: Theme.secondaryColor }}>Questions</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Everything you need to know about finding, booking, and moving into your perfect student accommodation in Keffi.
          </p>
        </div>

        {/* FAQs Accordion (Pure CSS / Server-Side) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {faqs.map((faq, index) => (
            <details 
              key={index} 
              className="group border-b border-slate-100 last:border-none [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 font-semibold text-slate-800 transition-colors hover:bg-slate-50">
                <span className="text-sm md:text-base">{faq.question}</span>
                <span 
                  className="transition-transform duration-300 group-open:-rotate-180 shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: `${Theme.primaryColor}10`, color: Theme.primaryColor }}
                >
                  <FaChevronDown className="text-xs" />
                </span>
              </summary>
              <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Still Have Questions CTA */}
        <div 
          className="mt-12 rounded-3xl p-8 text-center text-white relative overflow-hidden"
          style={{ backgroundColor: Theme.primaryColor }}
        >
          {/* Decorative background circle */}
          <div 
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: Theme.secondaryColor }}
          />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
              <FaHeadset className="text-3xl" style={{ color: Theme.secondaryColor }} />
            </div>
            <h2 className="text-2xl font-bold font-playfair mb-3">
              Still have questions?
            </h2>
            <p className="text-emerald-50 mb-8 max-w-md text-sm leading-relaxed">
              Can't find the answer you're looking for? Our support team in Keffi is here to help you navigate your lodge hunting stress-free.
            </p>
            <Link 
              href="/contact"
              className="px-8 py-3.5 bg-white rounded-xl font-bold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              style={{ color: Theme.primaryColor }}
            >
              <FaEnvelope /> Contact Support
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
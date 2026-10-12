"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

export const CHAMPIONSHIP_FAQS: FAQItem[] = [
  {
    question: "When should teams report?",
    answer:
      "On 26th October 2026 by 12:00 Noon at Mukesh Patel Technology Park – Shirpur Campus. Team managers and players must complete registration and accreditation upon arrival.",
  },
  {
    question: "When is the championship?",
    answer:
      "27th – 31st October 2026. Day 1 is 27 Oct (Opening Ceremony and League rounds) and Day 5 is 31 Oct (Finals and Closing Ceremony).",
  },
  {
    question: "Is travel pick-up available?",
    answer:
      "Yes. Pick-up is arranged from all the nearest railway stations and airports, including Indore International Airport, Nardana, Sindkheda, Dhule, Jalgaon, Bhusawal and Manmad railway stations, and Shirpur Bus Stand. Teams should share their arrival details with the Organising Committee in advance.",
  },
  {
    question: "Where will participants stay?",
    answer:
      "Accommodation (sharing basis, with bedding) is provided at MPTP Shirpur Campus and MRP School.",
  },
  {
    question: "What food is provided?",
    answer:
      "Nutritious vegetarian meals are provided for all participants: Breakfast 7:00–9:30 AM, Lunch 12:00–2:00 PM, Dinner 8:00–10:00 PM. The campus canteen is also open from 4:00–7:00 PM.",
  },
  {
    question: "What documents are needed?",
    answer:
      "See Eligibility: fee proof (annual or semester), previous year's or semester's mark sheet, signed photo ID from the competent authority, and one typed, signed Eligibility Proforma submitted on arrival without overwriting.",
  },
  {
    question: "What should I carry?",
    answer:
      "Your college ID, eligibility documents, official playing kit, personal medication, and light cotton clothes plus a light layer for cooler evenings.",
  },
  {
    question: "Who do I contact?",
    answer:
      "Contact Tushar Jain, Sports Director (+91 95886 75238), or Organising Committee members Aryan Pawar (+91 91569 88019), Mehi Manswa (+91 93249 79109), and Vishwesh Shukla (+91 95993 33064).",
  },
];

export default function FAQAccordion({ items = CHAMPIONSHIP_FAQS }: { items?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className={`rounded-2xl transition-all duration-200 border ${
              isOpen
                ? "bg-[#20255A]/90 border-gold/50 shadow-gold-glow"
                : "bg-[#161A40]/80 border-[rgba(217,178,111,0.18)] hover:border-gold/30"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-base sm:text-lg font-serif font-bold text-gold-light flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gold flex-shrink-0" />
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gold transition-transform duration-300 flex-shrink-0 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#F4EFE3]/90 leading-relaxed border-t border-[rgba(217,178,111,0.15)] mt-1 animate-fadeIn">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

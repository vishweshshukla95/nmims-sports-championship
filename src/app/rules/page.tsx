"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Download,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import FAQAccordion from "@/components/ui/FAQAccordion";

export default function RulesPage() {
  const [openRule, setOpenRule] = useState<number | null>(0);

  const generalRules = [
    {
      title: "1. Official Entry Channel",
      text: "Entries must be routed through the proper designated channel, duly certified by the Sports Officer or Campus In-charge.",
    },
    {
      title: "2. Federation & AIU Governance",
      text: "All matches shall strictly follow the latest rules, bylaws, and technical regulations of the respective International Sports Federations and the Association of Indian Universities (AIU).",
    },
    {
      title: "3. Finality of Organising Committee Decisions",
      text: "The Organising Committee's decision on all administrative, procedural, and on-field sporting matters shall be final and binding.",
    },
    {
      title: "4. Schedule & Venue Alterations",
      text: "The Organising Secretary reserves the right to alter or adjust the tournament venue, court allocations, fixtures, or match timings should exigencies arise.",
    },
    {
      title: "5. Punctual Reporting",
      text: "Every participating team must report at the designated venue in official playing kit at least 30 minutes prior to the scheduled start of the match.",
    },
    {
      title: "6. Sportsmanship & Collegiate Discipline",
      text: "Exemplary discipline, mutual respect, and high standards of sportsmanship are expected from all student-athletes, coaches, and managers both on and off the field.",
    },
    {
      title: "7. Zero Tolerance Policy",
      text: "Alcohol, smoking, tobacco, e-cigarettes, and banned psychotropic/performance-enhancing substances are strictly prohibited across all campus premises. Any breach warrants immediate disqualification and disciplinary referral.",
    },
    {
      title: "8. Medical & First Aid Provision",
      text: "Qualified medical staff, first aid, and ambulance emergency facilities are stationed at the central sports complex throughout the tournament.",
    },
    {
      title: "9. Official Protest Procedure",
      text: "All formal objections or protests must be lodged in writing as per established AIU protocols within the specified protest window following the conclusion of the match.",
    },
    {
      title: "10. Residual Jurisdiction",
      text: "Any point or contingency not explicitly covered in these regulations shall be referred to the Chairman of the Organising Committee, whose ruling shall be conclusive.",
    },
  ];

  const eligibilityRequirements = [
    "Proof of annual or current semester fee payment, accompanied by previous year's or semester's certified mark sheet.",
    "Official University / College Photo Identity Card signed by the competent campus authority.",
    "Each participating contingent must be officially accompanied by a Manager or Coach as mandated by AIU norms.",
    "One typed, signed, and stamped Eligibility Proforma must be submitted on arrival at the registration desk.",
    "Strict rule: No overwriting or manual tampering is permitted on the submitted Eligibility Proforma.",
  ];

  const handleDownloadProforma = () => {
    alert(
      "Eligibility Proforma template will be available for download from your campus sports director. Please submit on 26 October."
    );
  };

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen pb-24">
      {/* 1. Header Banner: highlight-04-opening-ceremony-anthem.webp */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[rgba(217,178,111,0.25)]">
        <Image
          src="/images/gallery/highlight-04-opening-ceremony-anthem.webp"
          alt="Opening ceremony and national anthem"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F4B] via-[#161A40]/75 to-[#0F122E]/85" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-end pb-8">
          <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Governance & Compliance
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            RULES & ELIGIBILITY
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] max-w-2xl">
            Official guidelines, player eligibility criteria, code of conduct, and championship rules.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* 2. Eligibility Section */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#161A40] via-[#20255A] to-[#161A40] border-2 border-gold/40 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 mb-6 border-b border-[rgba(217,178,111,0.2)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase text-gold">
                  Accreditation Requirements
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-gold-light uppercase">
                  Player Eligibility
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadProforma}
              className="px-6 py-3 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
            >
              <Download className="w-4 h-4" />
              <span>Download Eligibility Proforma (PDF)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibilityRequirements.map((req, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0F122E]/80 border border-[rgba(217,178,111,0.15)] flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-[#F4EFE3] leading-relaxed">
                  {req}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. General Tournament Rules (Accordion) */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
              Championship Code
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase text-gold-gradient">
              General Tournament Rules
            </h2>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {generalRules.map((rule, idx) => {
              const isOpen = openRule === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all border ${
                    isOpen
                      ? "bg-[#20255A] border-gold/40 shadow-gold-glow"
                      : "bg-[#161A40] border-[rgba(217,178,111,0.15)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenRule(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-sm sm:text-base font-serif font-bold text-gold-light">
                      {rule.title}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gold transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#AEB3D6] leading-relaxed border-t border-[rgba(217,178,111,0.1)] pt-3 animate-fadeIn">
                      {rule.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. FAQ Section Anchor: #faq */}
        <div id="faq" className="pt-10 border-t border-[rgba(217,178,111,0.2)]">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase text-gold-gradient">
              Clarifications & Help
            </h2>
          </div>

          <FAQAccordion />
        </div>
      </div>
    </NavyPatchBackground>
  );
}

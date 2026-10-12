import React from "react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import { TOURNAMENT_CONFIG } from "@/config/tournament";

export default function HomePage() {
  return (
    <NavyPatchBackground variant="full" className="min-h-[85vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#161A40] border border-[rgba(217,178,111,0.3)] text-xs font-semibold uppercase tracking-widest text-gold mb-6 shadow-sm">
          {TOURNAMENT_CONFIG.organizedBy}
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black text-gold-gradient tracking-tight leading-tight uppercase mb-6">
          {TOURNAMENT_CONFIG.fullName}
        </h1>

        <p className="text-lg md:text-xl text-[#F4EFE3] font-light max-w-2xl mx-auto mb-4">
          {TOURNAMENT_CONFIG.dates} · {TOURNAMENT_CONFIG.hostCampus}
        </p>

        <p className="text-sm text-gold font-mono tracking-wider">
          Reporting: {TOURNAMENT_CONFIG.reportingText}
        </p>
      </div>
    </NavyPatchBackground>
  );
}

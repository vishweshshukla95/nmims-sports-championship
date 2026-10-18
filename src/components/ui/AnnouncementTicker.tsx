"use client";

import React from "react";
import { Megaphone } from "lucide-react";

interface AnnouncementTickerProps {
  announcements?: string[];
}

export default function AnnouncementTicker({
  announcements = [
    "Welcome to SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27 at MPTP Shirpur Campus!",
    "Teams must report on 26th October 2026 by 12:00 Noon. Complimentary travel pick-up available from railway stations and airports.",
    "Submit signed Eligibility Proforma and college ID on arrival at the accreditation desk.",
  ],
}: AnnouncementTickerProps) {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="w-full bg-[#161A40] border-y border-[rgba(217,178,111,0.25)] py-2.5 px-4 overflow-hidden relative z-20">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/15 border border-gold/40 text-[11px] font-bold text-gold uppercase tracking-wider">
          <Megaphone className="w-3.5 h-3.5 text-gold-light" />
          <span>Notice</span>
        </div>

        {/* Ticker marquee text */}
        <div className="flex-1 overflow-hidden whitespace-nowrap relative">
          <div className="inline-block animate-marquee text-xs sm:text-sm text-[#F4EFE3] font-medium space-x-12">
            {announcements.map((text, idx) => (
              <span key={idx} className="inline-flex items-center gap-2">
                <span>{text}</span>
                <span className="text-gold">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

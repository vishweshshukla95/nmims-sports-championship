"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Archive, Trophy, Calendar, Users, Camera, Clock } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";

export default function PreviousEditionPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "champions" | "results" | "leaderboards" | "gallery"
  >("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: Calendar },
    { id: "champions", label: "Champions", icon: Trophy },
    { id: "results", label: "Results", icon: Clock },
    { id: "leaderboards", label: "Leaderboards", icon: Users },
    { id: "gallery", label: "Gallery", icon: Camera },
  ] as const;

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen pb-24">
      {/* Header Banner: highlight-05-inauguration.webp (darkened) */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[rgba(217,178,111,0.25)]">
        <Image
          src="/images/gallery/highlight-05-inauguration.webp"
          alt="Inauguration Ceremony"
          fill
          sizes="100vw"
          className="object-cover filter brightness-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F4B] via-[#161A40]/80 to-[#0F122E]/90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-end pb-8">
          <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Historical Archive
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            PREVIOUS EDITION
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] max-w-xl">
            Official archives and commemorative records from the previous edition of the SVKM&apos;s NMIMS Sports Championship.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 border-b border-[rgba(217,178,111,0.2)] mb-12 gap-2 sm:gap-4 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-serif text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gold text-indigo-black shadow-md border-b-2 border-gold"
                    : "bg-[#161A40] text-[#AEB3D6] hover:text-[#F4EFE3] border border-[rgba(217,178,111,0.15)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Placeholder Card (Strictly no fake data per Section 16) */}
        <div className="p-12 sm:p-20 rounded-3xl bg-[#161A40]/80 border-2 border-gold/30 text-center max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold">
            <Archive className="w-8 h-8 stroke-1 text-gold-light" />
          </div>
          <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-mono font-bold uppercase tracking-wider inline-block mb-3">
            Coming Soon
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-gradient">
            {tabs.find((t) => t.id === activeTab)?.label} Archive
          </h2>
          <p className="text-sm text-[#AEB3D6] mt-3 leading-relaxed">
            Previous edition records will be added here.
          </p>
          <div className="mt-6 pt-6 border-t border-[rgba(217,178,111,0.15)] text-xs text-gold/80 font-mono">
            Archived records for edition 2025-26 will be managed via the Admin Portal.
          </div>
        </div>
      </div>
    </NavyPatchBackground>
  );
}

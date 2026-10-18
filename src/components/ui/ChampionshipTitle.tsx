"use client";

import React from "react";

export default function ChampionshipTitle() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4">
      {/* Main Title - Uniform font, size and weight on all 3 lines */}
      <h1
        className="font-serif font-bold text-center leading-[1.1] animate-title-fade-up select-none"
        style={{
          fontFamily: "var(--font-cinzel), Cinzel, Georgia, serif",
          fontWeight: 700,
          fontSize: "clamp(30px, 5vw, 68px)",
          letterSpacing: "0.02em",
          filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.65))",
        }}
      >
        <span className="block animate-gold-shimmer">
          <span className="normal-case">SVKM&apos;s</span> NMIMS
        </span>
        <span className="block animate-gold-shimmer">
          INTER CAMPUS SPORTS
        </span>
        <span className="block animate-gold-shimmer">
          CHAMPIONSHIP
        </span>
      </h1>

      {/* Thin Gold Divider with Diamond Center */}
      <div className="flex items-center justify-center w-full max-w-md my-4 sm:my-6 animate-divider-draw origin-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D9B26F] to-[#D9B26F]/90" />
        <div className="mx-3 flex items-center justify-center">
          <span className="w-2 h-2 rotate-45 bg-[#F0D38F] border border-[#A88345] shadow-[0_0_8px_#F0D38F]" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#D9B26F] to-[#D9B26F]/90" />
      </div>

      {/* 2026-27 Date Tag */}
      <div
        className="flex items-center justify-center gap-3 animate-date-fade-in font-heading select-none"
        style={{
          fontFamily: "var(--font-oswald), Oswald, sans-serif",
          fontWeight: 600,
          fontSize: "clamp(26px, 3.6vw, 48px)",
          letterSpacing: "0.35em",
          color: "#F0D38F",
          fontVariantNumeric: "lining-nums tabular-nums",
        }}
      >
        <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#F0D38F]" />
        <span>2026-27</span>
        <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#F0D38F]" />
      </div>
    </div>
  );
}

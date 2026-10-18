"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Trophy,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import ChampionshipTitle from "@/components/ui/ChampionshipTitle";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import BrandLogos from "@/components/ui/BrandLogos";
import CampusBackground from "@/components/ui/CampusBackground";

const emptySubscribe = () => () => {};

export default function StartingEntryPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const targetDate = new Date("2026-10-27T09:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative isolate min-h-screen overflow-hidden flex flex-col justify-between text-text-main select-none">
      {/* 1. SHARED CAMPUS BACKGROUND */}
      <CampusBackground />

      {/* Layered royal-blue patches at about 10% opacity */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-10">
        <NavyPatchBackground variant="calm" className="w-full h-full" />
      </div>

      {/* 2. HEADER: BrandLogos size="xl" (120x120) with SVKM on far left and NMIMS on far right */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 py-6 sm:py-8">
        <BrandLogos size="xl" href="/home" />
      </header>

      {/* 3. CENTRE: Championship Title, Dates, Countdown, and Two Glass Cards */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full text-center">
        {/* Championship Title (Uniform Cinzel 700 on all lines, lowercase "s", shimmer) */}
        <ChampionshipTitle />

        {/* Dates Line */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-lg md:text-xl font-light text-[#F4EFE3] tracking-wide drop-shadow">
          27 – 31 October 2026 · MPTP Shirpur Campus
        </p>

        {/* Countdown Timer */}
        <div className="mt-6 sm:mt-7 flex items-center justify-center gap-3 sm:gap-6 font-heading">
          <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-[#161A40]/80 border border-gold/30 backdrop-blur-md min-w-[64px] sm:min-w-[80px] shadow-lg">
            <span className="text-xl sm:text-3xl font-bold text-gold tabular-nums">
              {mounted ? timeLeft.days : "00"}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mt-0.5">
              Days
            </span>
          </div>
          <span className="text-xl font-bold text-gold/60">:</span>
          <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-[#161A40]/80 border border-gold/30 backdrop-blur-md min-w-[64px] sm:min-w-[80px] shadow-lg">
            <span className="text-xl sm:text-3xl font-bold text-gold tabular-nums">
              {mounted ? String(timeLeft.hours).padStart(2, "0") : "00"}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mt-0.5">
              Hours
            </span>
          </div>
          <span className="text-xl font-bold text-gold/60">:</span>
          <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-[#161A40]/80 border border-gold/30 backdrop-blur-md min-w-[64px] sm:min-w-[80px] shadow-lg">
            <span className="text-xl sm:text-3xl font-bold text-gold tabular-nums">
              {mounted ? String(timeLeft.minutes).padStart(2, "0") : "00"}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mt-0.5">
              Minutes
            </span>
          </div>
        </div>

        {/* Two Large Glass Cards */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl text-left">
          {/* USER PORTAL CARD */}
          <div className="group relative p-6 sm:p-8 rounded-3xl bg-[#161A40]/75 backdrop-blur-xl border border-gold/30 hover:border-gold hover:shadow-[0_0_32px_rgba(217,178,111,0.25)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F0D38F]/20 to-[#A88345]/10 border border-gold/40 flex items-center justify-center text-gold shadow-md group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-gold" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
                  Public Access
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F4EFE3] group-hover:text-gold transition-colors">
                USER PORTAL
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] leading-relaxed">
                View schedules, results, points tables, teams, gallery and travel info.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(217,178,111,0.15)]">
              <Link
                href="/home"
                className="w-full py-3.5 px-6 rounded-full btn-gold text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold-glow group-hover:brightness-110 transition-all"
              >
                <span>Enter User Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* ADMIN PORTAL CARD */}
          <div className="group relative p-6 sm:p-8 rounded-3xl bg-[#161A40]/75 backdrop-blur-xl border border-royal/40 hover:border-gold/60 hover:shadow-[0_0_32px_rgba(30,63,168,0.35)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-royal/30 to-cobalt/20 border border-royal/60 flex items-center justify-center text-gold shadow-md group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-gold-light" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-royal/30 text-royal-light border border-royal/40 text-[#AEB3D6]">
                  Organisers Only
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F4EFE3] group-hover:text-gold transition-colors">
                ADMIN PORTAL
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] leading-relaxed">
                For organisers: manage teams, fixtures, results and points tables.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[rgba(217,178,111,0.15)]">
              <Link
                href="/admin/login"
                className="w-full py-3.5 px-6 rounded-full btn-royal text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 group-hover:border-gold transition-all"
              >
                <span>Admin Login</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FOOTER: Small footer "© 2026 SVKM's NMIMS Sports Department" */}
      <footer className="relative z-20 w-full py-5 text-center text-xs text-[#AEB3D6]/70 border-t border-[rgba(217,178,111,0.1)]">
        <p>© 2026 SVKM&apos;s NMIMS Sports Department</p>
      </footer>
    </main>
  );
}

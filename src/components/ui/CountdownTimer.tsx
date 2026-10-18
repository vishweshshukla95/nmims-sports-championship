"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";
import { TOURNAMENT_CONFIG } from "@/config/tournament";

const emptySubscribe = () => () => {};

export default function CountdownTimer() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: "upcoming", // "upcoming" | "during" | "concluded"
    dayOfTournament: 1,
  });

  useEffect(() => {
    const tournamentStart = new Date("2026-10-27T09:00:00+05:30").getTime();
    const tournamentEnd = new Date("2026-10-31T20:00:00+05:30").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();

      if (now > tournamentEnd) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: "concluded",
          dayOfTournament: 5,
        });
        return;
      }

      if (now >= tournamentStart && now <= tournamentEnd) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const currentDay = Math.min(
          5,
          Math.max(1, Math.floor((now - tournamentStart) / msPerDay) + 1)
        );
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          status: "during",
          dayOfTournament: currentDay,
        });
        return;
      }

      // Upcoming countdown
      const diff = tournamentStart - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        status: "upcoming",
        dayOfTournament: 1,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4">
        <div className="h-28 rounded-2xl bg-[#161A40]/80 animate-pulse border border-[rgba(217,178,111,0.2)]" />
      </div>
    );
  }

  if (timeLeft.status === "concluded") {
    return (
      <div className="w-full max-w-3xl mx-auto my-6 px-4">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161A40] via-[#20255A] to-[#161A40] border border-gold/40 text-center shadow-lg">
          <span className="text-xl md:text-2xl font-serif font-bold text-gold">
            Championship Concluded – See Results
          </span>
          <div className="mt-3">
            <Link
              href="/sports"
              className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full btn-gold"
            >
              View Match Results & Leaderboards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (timeLeft.status === "during") {
    return (
      <div className="w-full max-w-3xl mx-auto my-6 px-4">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#161A40] via-[#20255A] to-[#161A40] border-2 border-gold text-center shadow-gold-glow">
          <span className="px-3 py-1 rounded-full bg-gold text-indigo-black font-black text-xs uppercase tracking-widest inline-block mb-2">
            Day {timeLeft.dayOfTournament} of 5
          </span>
          <h3 className="text-2xl md:text-3xl font-serif font-black text-gold-gradient uppercase">
            Championship Underway in Shirpur
          </h3>
          <p className="text-sm text-[#AEB3D6] mt-2">
            Follow results and leaderboard updates across all 6 sports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 -mt-10 relative z-20">
      <div className="p-6 md:p-8 rounded-2xl bg-[#161A40]/90 backdrop-blur-md border border-[rgba(217,178,111,0.3)] shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(217,178,111,0.15)]">
          <div className="flex items-center gap-2 text-gold">
            <Clock className="w-5 h-5 text-gold-light" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider">
              Countdown to Opening Ceremony · 27 Oct, 09:00 IST
            </span>
          </div>

          {/* Reporting Time Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#20255A] border border-gold/40 text-xs font-medium text-gold-light shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-gold" />
            <span>Reporting: {TOURNAMENT_CONFIG.reportingText}</span>
          </div>
        </div>

        {/* 4 Flip Counters */}
        <div className="grid grid-cols-4 gap-3 md:gap-6 text-center">
          {[
            { label: "DAYS", value: timeLeft.days },
            { label: "HOURS", value: timeLeft.hours },
            { label: "MINUTES", value: timeLeft.minutes },
            { label: "SECONDS", value: timeLeft.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 md:p-4 rounded-xl bg-[#0F122E]/80 border border-[rgba(217,178,111,0.2)] flex flex-col items-center justify-center shadow-inner"
            >
              <span className="text-2xl sm:text-4xl md:text-5xl font-mono font-bold text-gold tabular-nums leading-none">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#AEB3D6] tracking-widest mt-2 uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Award, Crown, Medal, Filter, Sparkles } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import SportLeaderboard, {
  SportLeaderboardConfig,
} from "@/components/leaderboard/SportLeaderboard";
import { SPORTS_CONFIG } from "@/config/tournament";
import { SportType, CategoryGender } from "@/types/tournament";

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const initialSport = searchParams.get("sport") || "cricket";

  const [selectedSportSlug, setSelectedSportSlug] = useState(initialSport);
  const [selectedCategory, setSelectedCategory] = useState<CategoryGender>("men");

  const currentSport =
    SPORTS_CONFIG.find((s) => s.slug === selectedSportSlug) ||
    SPORTS_CONFIG[0];

  // Dynamic configuration per sport as specified in Section 11
  const config: SportLeaderboardConfig = {
    sportId: currentSport.slug as SportType,
    category: selectedCategory,
    board1Title:
      currentSport.slug === "cricket"
        ? "🏏 Highest Runs"
        : currentSport.slug === "football"
        ? "⚽ Top Scorers"
        : currentSport.slug === "basketball"
        ? "🏀 Top Scorers"
        : currentSport.slug === "volleyball"
        ? "🏐 Top Scorers"
        : "🏓 Most Matches Won",
    board1Unit:
      currentSport.slug === "cricket"
        ? "Runs"
        : currentSport.slug === "football"
        ? "Goals"
        : currentSport.slug === "basketball"
        ? "Points"
        : currentSport.slug === "volleyball"
        ? "Points"
        : "Wins",
    board1Data: [], // Filled dynamically by PostgreSQL views
    board2Title:
      currentSport.slug === "cricket"
        ? "🎯 Most Wickets"
        : currentSport.slug === "football"
        ? "🅰️ Most Assists"
        : currentSport.slug === "basketball"
        ? "🎯 Most 3-Pointers"
        : currentSport.slug === "volleyball"
        ? "🧱 Best Blockers"
        : currentSport.slug === "table-tennis"
        ? "🔥 Most Games Won"
        : "🔥 Most Sets Won",
    board2Unit:
      currentSport.slug === "cricket"
        ? "Wickets"
        : currentSport.slug === "football"
        ? "Assists"
        : currentSport.slug === "basketball"
        ? "3PM"
        : currentSport.slug === "volleyball"
        ? "Blocks"
        : currentSport.slug === "table-tennis"
        ? "Games"
        : "Sets",
    board2Data: [],
    mvpTitle: "⭐ MVP Standings",
    mvpData: [],
  };

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Official Tournament Statistics
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            OFFICIAL LEADERBOARDS
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#AEB3D6]">
            Live aggregated performance statistics, tournament MVPs, and statistical milestones computed strictly from verified match records.
          </p>
        </div>

        {/* Sport Switcher Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 sm:gap-3 mb-6 no-scrollbar">
          {SPORTS_CONFIG.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => {
                setSelectedSportSlug(sport.slug);
                setSelectedCategory("men");
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-serif font-bold whitespace-nowrap transition-all ${
                selectedSportSlug === sport.slug
                  ? "bg-gold text-indigo-black shadow-gold-glow font-black"
                  : "bg-[#161A40] text-[#AEB3D6] hover:text-[#F4EFE3] border border-[rgba(217,178,111,0.15)]"
              }`}
            >
              <span>{sport.icon}</span>
              <span>{sport.name}</span>
            </button>
          ))}
        </div>

        {/* Category Gender Toggle (Only where both exist) */}
        {currentSport.hasMen && currentSport.hasWomen && (
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-full bg-[#161A40] border border-gold/40 shadow-md">
              <button
                type="button"
                onClick={() => setSelectedCategory("men")}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === "men"
                    ? "bg-men text-indigo-black font-black shadow"
                    : "text-men hover:bg-men/10"
                }`}
              >
                Men&apos;s Division
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory("women")}
                className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === "women"
                    ? "bg-women text-indigo-black font-black shadow"
                    : "text-women hover:bg-women/10"
                }`}
              >
                Women&apos;s Division
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Tables Display */}
        <div className="mt-4">
          <SportLeaderboard config={config} />
        </div>
      </div>
    </NavyPatchBackground>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif text-lg">
          Loading Official Leaderboards...
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}

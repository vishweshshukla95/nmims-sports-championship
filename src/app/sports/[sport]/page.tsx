"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Trophy,
  Filter,
  CalendarDays,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import MatchCard from "@/components/match/MatchCard";
import MatchDetailsModal from "@/components/match/MatchDetailsModal";
import SportLeaderboard, {
  SportLeaderboardConfig,
} from "@/components/leaderboard/SportLeaderboard";
import {
  SPORTS_CONFIG,
  CAMPUSES_CONFIG,
  TOURNAMENT_DAYS,
  TOURNAMENT_CONFIG,
} from "@/config/tournament";
import { getMatches } from "@/lib/tournament-store";
import { Match, CategoryGender, SportType } from "@/types/tournament";

function SportDashboardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sportSlug = params.sport as string;

  const currentSport = SPORTS_CONFIG.find((s) => s.slug === sportSlug);

  // Category state (men vs women)
  const defaultCategory =
    searchParams.get("category") === "women" && currentSport?.hasWomen
      ? "women"
      : "men";
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryGender>(defaultCategory);

  // EXACTLY THREE TABS: Schedule · Results · Leaderboard
  const [activeTab, setActiveTab] = useState<"schedule" | "results" | "leaderboard">(
    "schedule"
  );

  // Filter chips for Schedule: Day & Campus
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [selectedCampus, setSelectedCampus] = useState<string | "all">("all");

  // Match details modal
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // All matches from store
  const allMatches = useMemo(() => getMatches(), []);

  // Filtered by sport and category
  const sportMatches = useMemo(() => {
    return allMatches.filter(
      (m) => m.sportId === sportSlug && m.category === selectedCategory
    );
  }, [allMatches, sportSlug, selectedCategory]);

  // Scheduled / Postponed matches for Schedule tab
  const scheduledMatches = useMemo(() => {
    let list = sportMatches.filter(
      (m) => m.status === "Scheduled" || m.status === "Postponed"
    );

    if (selectedDay !== "all") {
      const dayConfig = TOURNAMENT_DAYS.find((d) => d.dayNumber === selectedDay);
      if (dayConfig) {
        list = list.filter((m) => m.scheduledAt.startsWith(dayConfig.date));
      }
    }

    if (selectedCampus !== "all") {
      list = list.filter(
        (m) =>
          m.teamAShortCode === selectedCampus ||
          m.teamBShortCode === selectedCampus
      );
    }

    return list.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );
  }, [sportMatches, selectedDay, selectedCampus]);

  // Completed matches for Results tab (newest first)
  const completedMatches = useMemo(() => {
    return sportMatches
      .filter((m) => m.status === "Completed")
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
  }, [sportMatches]);

  if (!currentSport) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gold">Sport Not Found</h2>
          <Link href="/sports" className="mt-4 inline-block btn-gold px-6 py-2 text-xs font-bold uppercase">
            Return to Sports Overview
          </Link>
        </div>
      </div>
    );
  }

  // Leaderboard config for this sport per Section 11
  const leaderboardConfig: SportLeaderboardConfig = {
    sportId: currentSport.slug as SportType,
    category: selectedCategory,
    board1Title:
      currentSport.slug === "cricket"
        ? "Highest Runs"
        : currentSport.slug === "football"
        ? "Top Scorers"
        : currentSport.slug === "basketball"
        ? "Top Scorers"
        : currentSport.slug === "volleyball"
        ? "Top Scorers"
        : "Most Matches Won",
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
    board1Data: [], // Calculated by SQL views in Supabase; empty until matches recorded
    board2Title:
      currentSport.slug === "cricket"
        ? "Most Wickets"
        : currentSport.slug === "football"
        ? "Most Assists"
        : currentSport.slug === "basketball"
        ? "Most 3-Pointers"
        : currentSport.slug === "volleyball"
        ? "Best Blockers"
        : currentSport.slug === "table-tennis"
        ? "Most Games Won"
        : "Most Sets Won",
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
    mvpTitle: "⭐ Official MVP Standings",
    mvpData: [],
  };

  const openMatchDetails = (match: Match) => {
    setSelectedMatch(match);
    setModalOpen(true);
  };

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen pb-24">
      {/* 1. SPORT BANNER */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[rgba(217,178,111,0.25)]">
        <Image
          src={currentSport.image}
          alt={currentSport.name}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F4B] via-[#161A40]/70 to-[#0F122E]/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-end pb-8">
          <Link
            href="/sports"
            className="inline-flex items-center gap-1.5 text-xs text-gold/80 hover:text-gold mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Sports Overview</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentSport.icon}</span>
                <h1 className="text-3xl sm:text-5xl font-serif font-black text-gold-gradient uppercase tracking-tight">
                  {currentSport.name}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#AEB3D6] mt-2 max-w-xl">
                {currentSport.description}
              </p>
            </div>

            {/* STICKY / DYNAMIC MEN / WOMEN TOGGLE (only where both exist) */}
            {currentSport.hasMen && currentSport.hasWomen && (
              <div className="inline-flex p-1 rounded-full bg-[#0F122E]/90 border border-gold/40 shadow-lg backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("men")}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === "men"
                      ? "bg-men text-indigo-black shadow-md"
                      : "text-men hover:bg-men/10"
                  }`}
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("women")}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === "women"
                      ? "bg-women text-indigo-black shadow-md"
                      : "text-women hover:bg-women/10"
                  }`}
                >
                  Women
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THREE SECTIONS AS TABS: Schedule · Results · Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-center border-b border-[rgba(217,178,111,0.2)] mb-8">
          <div className="flex space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`px-6 py-3 font-serif font-bold text-sm sm:text-base border-b-2 transition-all ${
                activeTab === "schedule"
                  ? "border-gold text-gold"
                  : "border-transparent text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("results")}
              className={`px-6 py-3 font-serif font-bold text-sm sm:text-base border-b-2 transition-all ${
                activeTab === "results"
                  ? "border-gold text-gold"
                  : "border-transparent text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Results
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("leaderboard")}
              className={`px-6 py-3 font-serif font-bold text-sm sm:text-base border-b-2 transition-all ${
                activeTab === "leaderboard"
                  ? "border-gold text-gold"
                  : "border-transparent text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        {/* TAB 1: SCHEDULE ("COMING UP") */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(217,178,111,0.15)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-gold uppercase tracking-wide">
                  COMING UP
                </h2>
                <p className="text-xs text-[#AEB3D6] mt-0.5">
                  Scheduled matches for {currentSport.name} ({selectedCategory.toUpperCase()})
                </p>
              </div>

              {/* Day and Campus Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Day Filter */}
                <div className="flex items-center gap-1 bg-[#161A40] p-1 rounded-xl border border-[rgba(217,178,111,0.2)]">
                  <button
                    type="button"
                    onClick={() => setSelectedDay("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      selectedDay === "all" ? "bg-gold text-indigo-black" : "text-[#AEB3D6]"
                    }`}
                  >
                    All Days
                  </button>
                  {TOURNAMENT_DAYS.map((d) => (
                    <button
                      key={d.dayNumber}
                      type="button"
                      onClick={() => setSelectedDay(d.dayNumber)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        selectedDay === d.dayNumber
                          ? "bg-gold text-indigo-black"
                          : "text-[#AEB3D6] hover:text-[#F4EFE3]"
                      }`}
                    >
                      D{d.dayNumber}
                    </button>
                  ))}
                </div>

                {/* Campus Filter */}
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] text-xs text-gold font-semibold focus:outline-none"
                >
                  <option value="all">All Campuses</option>
                  {CAMPUSES_CONFIG.map((c) => (
                    <option key={c.shortCode} value={c.shortCode}>
                      {c.shortCode} - {c.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Match List or Empty State */}
            {scheduledMatches.length === 0 ? (
              <div className="p-12 sm:p-16 rounded-3xl bg-[#161A40]/80 border-2 border-gold/30 text-center max-w-2xl mx-auto shadow-xl">
                <Calendar className="w-14 h-14 text-gold mx-auto mb-4 stroke-1" />
                <h3 className="text-2xl font-serif font-bold text-gold uppercase tracking-wider">
                  COMING UP
                </h3>
                <p className="text-sm sm:text-base text-[#F4EFE3]/90 mt-3 leading-relaxed">
                  Fixtures for {currentSport.name} ({selectedCategory === "women" ? "Women" : "Men"}) will be announced soon. Stay tuned!
                </p>
                <div className="mt-6 pt-4 border-t border-[rgba(217,178,111,0.15)] text-xs text-[#AEB3D6]">
                  Tournament Dates: <strong>{TOURNAMENT_CONFIG.dates}</strong> at MPTP Shirpur
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scheduledMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    type="scheduled"
                    onSelect={openMatchDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESULTS */}
        {activeTab === "results" && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[rgba(217,178,111,0.15)]">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gold uppercase tracking-wide">
                MATCH RESULTS
              </h2>
              <p className="text-xs text-[#AEB3D6] mt-0.5">
                Official completed match scorecards and Man of the Match awards
              </p>
            </div>

            {completedMatches.length === 0 ? (
              <div className="p-12 sm:p-16 rounded-3xl bg-[#161A40]/80 border border-[rgba(217,178,111,0.2)] text-center max-w-2xl mx-auto shadow-xl">
                <Trophy className="w-14 h-14 text-gold mx-auto mb-4 stroke-1" />
                <h3 className="text-xl font-serif font-bold text-gold-light">
                  No Results Yet
                </h3>
                <p className="text-sm text-[#AEB3D6] mt-2">
                  Results will appear here after the first match.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    type="result"
                    onSelect={openMatchDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-[rgba(217,178,111,0.15)]">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gold uppercase tracking-wide">
                STATISTICAL LEADERBOARDS
              </h2>
              <p className="text-xs text-[#AEB3D6] mt-0.5">
                Official aggregated statistics and MVP ranking for {currentSport.name} ({selectedCategory.toUpperCase()})
              </p>
            </div>

            <SportLeaderboard config={leaderboardConfig} />
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      <MatchDetailsModal
        match={selectedMatch}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </NavyPatchBackground>
  );
}

export default function SportDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif text-lg">
          Loading Dashboard...
        </div>
      }
    >
      <SportDashboardContent />
    </Suspense>
  );
}


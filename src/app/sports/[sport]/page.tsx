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
  ArrowLeft,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import MatchCard from "@/components/match/MatchCard";
import MatchDetailsModal from "@/components/match/MatchDetailsModal";
import PointsTable from "@/components/sports/PointsTable";
import SportLeaderboard, {
  SportLeaderboardConfig,
} from "@/components/leaderboard/SportLeaderboard";
import {
  SPORTS_CONFIG,
  CAMPUSES_CONFIG,
  TOURNAMENT_DAYS,
} from "@/config/tournament";
import { getMatches, fetchMatches, getTeams, fetchTeams } from "@/lib/tournament-store";
import { getTeamGroups, fetchTeamGroups, fetchGroups } from "@/lib/groups-store";
import { Match, CategoryGender, SportType, Team, TeamGroup, Group } from "@/types/tournament";

export const dynamic = "force-dynamic";

function SportDashboardContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sportSlug = params.sport as SportType;

  const currentSport = SPORTS_CONFIG.find((s) => s.slug === sportSlug);

  // Category state (men vs women)
  const defaultCategory =
    searchParams.get("category") === "women" && currentSport?.hasWomen
      ? "women"
      : "men";
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryGender>(defaultCategory);

  // Tab state per Part 3: Schedule · Results · Points Table · Leaderboard
  const hasLeaderboard = sportSlug !== "table-tennis" && sportSlug !== "lawn-tennis";
  const [activeTab, setActiveTab] = useState<"schedule" | "results" | "points" | "leaderboard">(
    "schedule"
  );

  // Filter chips for Schedule: Day & Campus
  const [selectedDay, setSelectedDay] = useState<number | "all">("all");
  const [selectedCampus, setSelectedCampus] = useState<string | "all">("all");

  // Match details modal
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Store data with live Supabase fetch
  const [allMatches, setAllMatches] = useState<Match[]>(() => getMatches());
  const [allTeams, setAllTeams] = useState<Team[]>(() => getTeams());
  const [allGroups, setAllGroups] = useState<TeamGroup[]>(() => getTeamGroups());
  const [groupsList, setGroupsList] = useState<Group[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const [m, t, g, grps] = await Promise.all([
        fetchMatches(),
        fetchTeams(),
        fetchTeamGroups(),
        fetchGroups(sportSlug, selectedCategory),
      ]);
      setAllMatches(m);
      setAllTeams(t);
      setAllGroups(g);
      setGroupsList(grps);
    }
    loadData();
  }, [sportSlug, selectedCategory]);

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

  // Leaderboard config strictly matching Part 3 requirements
  const leaderboardConfig = useMemo<SportLeaderboardConfig | null>(() => {
    if (sportSlug === "cricket") {
      return {
        sportId: "cricket",
        category: selectedCategory,
        board1Title: "🏏 Highest Runs",
        board1Unit: "Runs",
        board1Data: [],
        board2Title: "🎯 Most Wickets",
        board2Unit: "Wickets",
        board2Data: [],
      };
    }
    if (sportSlug === "football") {
      return {
        sportId: "football",
        category: selectedCategory,
        board1Title: "⚽ Most Goals",
        board1Unit: "Goals",
        board1Data: [],
      };
    }
    if (sportSlug === "basketball") {
      return {
        sportId: "basketball",
        category: selectedCategory,
        board1Title: "🏀 Most Points Scored",
        board1Unit: "Points",
        board1Data: [],
      };
    }
    if (sportSlug === "volleyball") {
      return {
        sportId: "volleyball",
        category: selectedCategory,
        board1Title: "🏐 Most Points Scored",
        board1Unit: "Points",
        board1Data: [],
      };
    }
    return null;
  }, [sportSlug, selectedCategory]);

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

            {/* DYNAMIC MEN / WOMEN TOGGLE (only where both exist) */}
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

      {/* 2. TABS: Schedule · Results · Points Table · Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-center border-b border-[rgba(217,178,111,0.2)] mb-8 overflow-x-auto no-scrollbar">
          <div className="flex space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`px-4 sm:px-6 py-3 font-serif font-bold text-xs sm:text-base border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
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
              className={`px-4 sm:px-6 py-3 font-serif font-bold text-xs sm:text-base border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === "results"
                  ? "border-gold text-gold"
                  : "border-transparent text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Results
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("points")}
              className={`px-4 sm:px-6 py-3 font-serif font-bold text-xs sm:text-base border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === "points"
                  ? "border-gold text-gold"
                  : "border-transparent text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Points Table
            </button>
            {hasLeaderboard && (
              <button
                type="button"
                onClick={() => setActiveTab("leaderboard")}
                className={`px-4 sm:px-6 py-3 font-serif font-bold text-xs sm:text-base border-b-2 transition-all whitespace-nowrap min-h-[44px] ${
                  activeTab === "leaderboard"
                    ? "border-gold text-gold"
                    : "border-transparent text-[#AEB3D6] hover:text-[#F4EFE3]"
                }`}
              >
                Leaderboard
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            {/* Filter Chips: Days & Campuses */}
            <div className="p-4 rounded-2xl bg-[#161A40]/80 border border-[rgba(217,178,111,0.2)] flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Day Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                <span className="text-xs font-mono text-gold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" /> Day:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDay("all")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDay === "all"
                      ? "btn-gold"
                      : "bg-[#0F122E] text-[#AEB3D6] hover:text-[#F4EFE3]"
                  }`}
                >
                  All Days
                </button>
                {TOURNAMENT_DAYS.map((day) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setSelectedDay(day.dayNumber)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedDay === day.dayNumber
                        ? "btn-gold"
                        : "bg-[#0F122E] text-[#AEB3D6] hover:text-[#F4EFE3]"
                    }`}
                  >
                    Day {day.dayNumber} ({day.label.split(",")[0]})
                  </button>
                ))}
              </div>

              {/* Campus Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                <span className="text-xs font-mono text-gold uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Campus:
                </span>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="bg-[#0F122E] text-xs font-semibold text-[#F4EFE3] px-3 py-1.5 rounded-xl border border-[rgba(217,178,111,0.3)] focus:outline-none focus:border-gold"
                >
                  <option value="all">All Campuses</option>
                  {CAMPUSES_CONFIG.map((c) => (
                    <option key={c.shortCode} value={c.shortCode}>
                      {c.shortCode} – {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matches Grid */}
            {scheduledMatches.length === 0 ? (
              <div className="p-16 rounded-2xl bg-[#161A40]/40 border border-[rgba(217,178,111,0.15)] text-center max-w-lg mx-auto">
                <Calendar className="w-10 h-10 text-gold/60 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-bold text-gold-light">
                  No Fixtures Found
                </h3>
                <p className="text-xs text-[#AEB3D6] mt-2 leading-relaxed">
                  No scheduled fixtures match your current filters. Try selecting All Days or All Campuses.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scheduledMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onOpenDetails={openMatchDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESULTS (Completed Matches) */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {completedMatches.length === 0 ? (
              <div className="p-16 rounded-2xl bg-[#161A40]/40 border border-[rgba(217,178,111,0.15)] text-center max-w-lg mx-auto">
                <Trophy className="w-10 h-10 text-gold/60 mx-auto mb-3" />
                <h3 className="text-lg font-serif font-bold text-gold-light">
                  No Completed Matches Yet
                </h3>
                <p className="text-xs text-[#AEB3D6] mt-2 leading-relaxed">
                  Results, scoresheets, and Man of the Match awards will appear here as fixtures are played and declared.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onOpenDetails={openMatchDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: POINTS TABLE (Side-by-side Group A and Group B) */}
        {activeTab === "points" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(217,178,111,0.2)]">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-gold uppercase tracking-wider">
                {currentSport.name} ({selectedCategory.toUpperCase()}) – GROUP STAGE
              </h3>
              <span className="text-xs font-mono text-gold-light/80">
                Top 2 Qualify for Semi-Finals
              </span>
            </div>

            <PointsTable
              sportId={sportSlug}
              category={selectedCategory}
              teams={allTeams}
              groups={groupsList}
              teamGroups={allGroups}
              matches={allMatches}
            />
          </div>
        )}

        {/* TAB 4: LEADERBOARD (Only if hasLeaderboard) */}
        {activeTab === "leaderboard" && hasLeaderboard && leaderboardConfig && (
          <div className="space-y-6">
            <SportLeaderboard config={leaderboardConfig} />
          </div>
        )}
      </div>

      {/* MATCH DETAILS MODAL */}
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
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif">
          Loading Championship Dashboard...
        </div>
      }
    >
      <SportDashboardContent />
    </Suspense>
  );
}

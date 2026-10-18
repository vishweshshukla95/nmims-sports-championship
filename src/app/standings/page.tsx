"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Award, AlertCircle } from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import PointsTable from "@/components/sports/PointsTable";
import SportLeaderboard, {
  SportLeaderboardConfig,
} from "@/components/leaderboard/SportLeaderboard";
import { SPORTS_CONFIG } from "@/config/tournament";
import { SportType, CategoryGender, Team, Match, TeamGroup, Group } from "@/types/tournament";
import { getTeams, fetchTeams, getMatches, fetchMatches } from "@/lib/tournament-store";
import { getTeamGroups, fetchTeamGroups, fetchGroups } from "@/lib/groups-store";

export const dynamic = "force-dynamic";

function StandingsContent() {
  const searchParams = useSearchParams();
  const initialSport = (searchParams.get("sport") as SportType) || "cricket";

  const [selectedSportSlug, setSelectedSportSlug] = useState<SportType>(initialSport);
  const [selectedCategory, setSelectedCategory] = useState<CategoryGender>("men");

  const [teams, setTeams] = useState<Team[]>(() => getTeams());
  const [matches, setMatches] = useState<Match[]>(() => getMatches());
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>(() => getTeamGroups());
  const [groupsList, setGroupsList] = useState<Group[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const [m, t, g, grps] = await Promise.all([
        fetchMatches(),
        fetchTeams(),
        fetchTeamGroups(),
        fetchGroups(selectedSportSlug, selectedCategory),
      ]);
      setMatches(m);
      setTeams(t);
      setTeamGroups(g);
      setGroupsList(grps);
    }
    loadData();
  }, [selectedSportSlug, selectedCategory]);

  const currentSport = useMemo(
    () => SPORTS_CONFIG.find((s) => s.slug === selectedSportSlug) || SPORTS_CONFIG[0],
    [selectedSportSlug]
  );

  // Configure leaderboards strictly per Part 3 specification
  const leaderboardConfig = useMemo<SportLeaderboardConfig | null>(() => {
    if (selectedSportSlug === "cricket") {
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

    if (selectedSportSlug === "football") {
      return {
        sportId: "football",
        category: selectedCategory,
        board1Title: "⚽ Most Goals",
        board1Unit: "Goals",
        board1Data: [],
      };
    }

    if (selectedSportSlug === "basketball") {
      return {
        sportId: "basketball",
        category: selectedCategory,
        board1Title: "🏀 Most Points Scored",
        board1Unit: "Points",
        board1Data: [],
      };
    }

    if (selectedSportSlug === "volleyball") {
      return {
        sportId: "volleyball",
        category: selectedCategory,
        board1Title: "🏐 Most Points Scored",
        board1Unit: "Points",
        board1Data: [],
      };
    }

    // Table Tennis and Lawn Tennis have NO leaderboard
    return null;
  }, [selectedSportSlug, selectedCategory]);

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Official Standings & Statistics
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            POINTS & STATS
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#AEB3D6]">
            Group standings, qualification status, and verified player stat leaderboards computed strictly from official match scoresheets.
          </p>
        </div>

        {/* Sport Switcher Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 sm:gap-3 mb-6 no-scrollbar">
          {SPORTS_CONFIG.map((sport) => {
            const active = selectedSportSlug === sport.slug;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => {
                  setSelectedSportSlug(sport.slug as SportType);
                  // Default to men unless sport is women-only
                  setSelectedCategory("men");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap min-h-[44px] ${
                  active
                    ? "btn-gold shadow-gold-glow"
                    : "bg-[#161A40] text-[#AEB3D6] hover:text-[#F4EFE3] hover:bg-[#20255A] border border-[rgba(217,178,111,0.2)]"
                }`}
              >
                <span>{sport.icon}</span>
                <span>{sport.name}</span>
              </button>
            );
          })}
        </div>

        {/* Category Switcher (Men / Women) for sports with both */}
        {currentSport.hasMen && currentSport.hasWomen && (
          <div className="flex items-center justify-center gap-3 mb-10">
            <button
              type="button"
              onClick={() => setSelectedCategory("men")}
              className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all min-h-[36px] ${
                selectedCategory === "men"
                  ? "bg-men text-indigo-black shadow-md"
                  : "bg-[#161A40] text-[#AEB3D6] border border-men/30 hover:text-men"
              }`}
            >
              Men&apos;s Championship
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("women")}
              className={`px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all min-h-[36px] ${
                selectedCategory === "women"
                  ? "bg-women text-indigo-black shadow-md"
                  : "bg-[#161A40] text-[#AEB3D6] border border-women/30 hover:text-women"
              }`}
            >
              Women&apos;s Championship
            </button>
          </div>
        )}

        {/* SECTION 1: POINTS TABLE */}
        <div className="mb-14">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[rgba(217,178,111,0.2)]">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <h2 className="text-xl sm:text-2xl font-serif font-black text-gold uppercase tracking-wider">
                {currentSport.name} ({selectedCategory.toUpperCase()}) – GROUP POINTS TABLE
              </h2>
            </div>
            <span className="text-xs font-mono text-gold-light/80">
              Top 2 Qualify for Semis (Q)
            </span>
          </div>

          <PointsTable
            sportId={selectedSportSlug}
            category={selectedCategory}
            teams={teams}
            groups={groupsList}
            teamGroups={teamGroups}
            matches={matches}
          />
        </div>

        {/* SECTION 2: STAT LEADERBOARDS (Only Cricket, Football, Basketball, Volleyball) */}
        {leaderboardConfig ? (
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-[rgba(217,178,111,0.2)]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold" />
                <h2 className="text-xl sm:text-2xl font-serif font-black text-gold uppercase tracking-wider">
                  {currentSport.name} ({selectedCategory.toUpperCase()}) – STAT LEADERBOARDS
                </h2>
              </div>
              <span className="text-xs font-mono text-[#AEB3D6]">
                Official Records
              </span>
            </div>

            <SportLeaderboard config={leaderboardConfig} />
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#161A40]/50 border border-[rgba(217,178,111,0.2)] text-center text-xs sm:text-sm text-[#AEB3D6] max-w-xl mx-auto flex items-center justify-center gap-3">
            <AlertCircle className="w-5 h-5 text-gold flex-shrink-0" />
            <span>
              {currentSport.name} tournament standings and advancement are decided exclusively by the Group Points Table above.
            </span>
          </div>
        )}
      </div>
    </NavyPatchBackground>
  );
}

export default function StandingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif">
          Loading Points & Stats...
        </div>
      }
    >
      <StandingsContent />
    </Suspense>
  );
}

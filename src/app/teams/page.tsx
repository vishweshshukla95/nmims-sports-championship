"use client";

import React, { useState, useMemo, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  MapPin,
  Filter,
  CheckCircle2,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import CampusBadge from "@/components/ui/CampusBadge";
import {
  CAMPUSES_CONFIG,
  SPORTS_CONFIG,
  TOURNAMENT_CONFIG,
} from "@/config/tournament";
import { getSeededTeams } from "@/lib/tournament-store";
import { Team, Player, SportType, CategoryGender } from "@/types/tournament";

function TeamsContent() {
  const searchParams = useSearchParams();
  const campusQuery = searchParams.get("campus");

  const [viewMode, setViewMode] = useState<"campus" | "sport">("campus");
  const [selectedCampus, setSelectedCampus] = useState<string>(
    campusQuery || "all"
  );
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // All 70 seeded teams
  const allTeams = useMemo(() => getSeededTeams(), []);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return allTeams.filter((team) => {
      const campusMatch =
        selectedCampus === "all" ||
        team.campusId.toUpperCase() === selectedCampus.toUpperCase() ||
        CAMPUSES_CONFIG.find((c) => c.shortCode === selectedCampus)?.id ===
          team.campusId;

      const sportMatch =
        selectedSport === "all" || team.sportId === selectedSport;

      return campusMatch && sportMatch;
    });
  }, [allTeams, selectedCampus, selectedSport]);

  const toggleTeamExpand = (id: string) => {
    setExpandedTeamId(expandedTeamId === id ? null : id);
  };

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen pb-24">
      {/* 1. Header Banner: highlight-02-all-campuses-group.webp */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden border-b border-[rgba(217,178,111,0.25)]">
        <Image
          src="/images/gallery/highlight-02-all-campuses-group.webp"
          alt="All seven NMIMS campuses gathered at the championship"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F4B] via-[#161A40]/75 to-[#0F122E]/80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex flex-col justify-end pb-8">
          <div className="title-ornament justify-start text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Pan-India Delegations
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            Championship Teams
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#AEB3D6] max-w-2xl">
            7 campuses, 10 categories, 70 official teams competing in Shirpur. Browse rosters, player squads, and campus contingents.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Filters and View Switcher */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] mb-10 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* View Mode Toggle: Campus View vs Sport View */}
          <div className="flex items-center p-1 rounded-xl bg-[#0F122E] border border-gold/30">
            <button
              type="button"
              onClick={() => setViewMode("campus")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === "campus"
                  ? "bg-gold text-indigo-black shadow"
                  : "text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Campus View (Default)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("sport")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === "sport"
                  ? "bg-gold text-indigo-black shadow"
                  : "text-[#AEB3D6] hover:text-[#F4EFE3]"
              }`}
            >
              Sport View
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Campus Selector */}
            <div className="flex-1 sm:flex-none">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#0F122E] border border-gold/40 text-xs font-semibold text-gold focus:outline-none"
              >
                <option value="all">All 7 Campuses</option>
                {CAMPUSES_CONFIG.map((c) => (
                  <option key={c.shortCode} value={c.shortCode}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Sport Selector */}
            <div className="flex-1 sm:flex-none">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#0F122E] border border-gold/40 text-xs font-semibold text-gold focus:outline-none"
              >
                <option value="all">All 6 Sports</option>
                {SPORTS_CONFIG.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CAMPUS VIEW (Default) */}
        {viewMode === "campus" && (
          <div className="space-y-16">
            {CAMPUSES_CONFIG.filter(
              (c) =>
                selectedCampus === "all" ||
                selectedCampus.toUpperCase() === c.shortCode.toUpperCase()
            ).map((campus) => {
              const campusTeams = filteredTeams.filter(
                (t) => t.campusId === campus.id
              );

              return (
                <div key={campus.id} className="space-y-6">
                  {/* Campus Header Section */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#20255A] via-[#161A40] to-[#0F122E] border border-[rgba(217,178,111,0.25)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <CampusBadge
                        shortCode={campus.shortCode}
                        size="lg"
                        isHost={campus.isHost}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-serif font-black text-gold-light">
                            {campus.name}
                          </h2>
                          {campus.isHost && (
                            <span className="px-2 py-0.5 rounded-full bg-gold text-indigo-black font-black text-[10px] tracking-wider">
                              HOST
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#AEB3D6] mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gold" />
                          <span>
                            {campus.city}, {campus.state}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gold/90 font-mono">
                      {campusTeams.length} Competition Teams
                    </div>
                  </div>

                  {/* Campus Teams Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campusTeams.map((team) => {
                      const isExpanded = expandedTeamId === team.id;
                      const hasSquad =
                        team.players && team.players.length > 0;

                      return (
                        <div
                          key={team.id}
                          className="card-championship overflow-hidden border border-[rgba(217,178,111,0.2)] hover:border-gold/50"
                        >
                          <div
                            onClick={() => toggleTeamExpand(team.id)}
                            className="p-5 cursor-pointer flex items-center justify-between gap-3 bg-[#161A40]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {
                                  SPORTS_CONFIG.find(
                                    (s) => s.slug === team.sportId
                                  )?.icon
                                }
                              </span>
                              <div>
                                <h3 className="font-serif font-bold text-sm sm:text-base text-gold-light">
                                  {team.name}
                                </h3>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    team.category === "women"
                                      ? "bg-women/15 text-women"
                                      : "bg-men/15 text-men"
                                  }`}
                                >
                                  {team.category.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="p-1 rounded-full text-gold hover:bg-[#20255A]"
                              aria-label="Toggle team roster"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          {/* Expanded Squad Roster */}
                          {isExpanded && (
                            <div className="p-5 border-t border-[rgba(217,178,111,0.15)] bg-[#0F122E]/80 space-y-3 animate-fadeIn">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold">
                                Official Squad Roster
                              </h4>

                              {!hasSquad ? (
                                <div className="py-6 text-center text-xs text-[#AEB3D6] italic">
                                  Squad to be announced
                                </div>
                              ) : (
                                <div className="space-y-1.5 text-xs">
                                  {team.players!.map((player) => (
                                    <div
                                      key={player.id}
                                      className="p-2 rounded-lg bg-[#161A40] flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-gold font-bold w-5">
                                          #{player.jerseyNo || "-"}
                                        </span>
                                        <span className="font-semibold text-[#F4EFE3]">
                                          {player.name}
                                        </span>
                                        {player.isCaptain && (
                                          <span className="text-[10px] font-black text-gold bg-gold/15 px-1.5 py-0.2 rounded">
                                            (C)
                                          </span>
                                        )}
                                        {player.isWk && (
                                          <span className="text-[10px] font-black text-men bg-men/15 px-1.5 py-0.2 rounded">
                                            (WK)
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[#AEB3D6] text-[11px]">
                                        {player.role || "Player"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SPORT VIEW */}
        {viewMode === "sport" && (
          <div className="space-y-16">
            {SPORTS_CONFIG.filter(
              (s) => selectedSport === "all" || selectedSport === s.slug
            ).map((sport) => {
              const sportTeams = filteredTeams.filter(
                (t) => t.sportId === sport.slug
              );

              return (
                <div key={sport.id} className="space-y-6">
                  <div className="p-6 rounded-2xl bg-[#20255A] border border-gold/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{sport.icon}</span>
                      <h2 className="text-2xl font-serif font-black text-gold-light uppercase">
                        {sport.name} Teams
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-gold">
                      {sportTeams.length} Teams
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sportTeams.map((team) => (
                      <div
                        key={team.id}
                        className="card-championship p-5 border border-[rgba(217,178,111,0.2)]"
                      >
                        <div className="flex items-center gap-3">
                          <CampusBadge
                            shortCode={
                              CAMPUSES_CONFIG.find(
                                (c) => c.id === team.campusId
                              )?.shortCode || "MUM"
                            }
                            size="md"
                          />
                          <div>
                            <h3 className="font-serif font-bold text-sm text-gold-light">
                              {team.name}
                            </h3>
                            <span className="text-[11px] text-[#AEB3D6]">
                              {team.category.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[rgba(217,178,111,0.15)] text-xs text-[#AEB3D6] italic">
                          Squad to be announced
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </NavyPatchBackground>
  );
}

export default function TeamsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif text-lg">
          Loading Teams...
        </div>
      }
    >
      <TeamsContent />
    </Suspense>
  );
}


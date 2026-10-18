"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Trophy,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import CampusBadge from "@/components/ui/CampusBadge";
import MatchCard from "@/components/match/MatchCard";
import { getCampusDepartments } from "@/lib/campus-store";
import { getTeams, getMatches } from "@/lib/tournament-store";
import { SPORTS_CONFIG } from "@/config/tournament";

export default function CampusDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const departments = useMemo(() => getCampusDepartments(), []);
  const dept = departments.find((d) => d.slug === slug) || departments[0];

  const allTeams = useMemo(() => getTeams(), []);
  const allMatches = useMemo(() => getMatches(), []);

  // Teams for this campus
  const campusTeams = useMemo(() => {
    return allTeams.filter(
      (t) => t.campusId.toLowerCase() === dept.campusId.toLowerCase()
    );
  }, [allTeams, dept]);

  // Matches involving this campus
  const campusMatches = useMemo(() => {
    return allMatches.filter(
      (m) =>
        m.teamAShortCode.toUpperCase() === dept.shortCode.toUpperCase() ||
        m.teamBShortCode.toUpperCase() === dept.shortCode.toUpperCase()
    );
  }, [allMatches, dept]);

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/campuses"
          className="inline-flex items-center gap-1.5 text-xs text-gold/80 hover:text-gold mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Campuses</span>
        </Link>

        {/* Campus Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#161A40]/90 border-2 border-gold/30 shadow-2xl relative overflow-hidden mb-12">
          {dept.isHost && (
            <div className="absolute top-6 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold text-indigo-black font-black text-xs uppercase tracking-wider shadow-lg">
              HOST CAMPUS
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <CampusBadge shortCode={dept.shortCode} size="xl" isHost={false} />

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
                {dept.name} CAMPUS
              </h1>
              <p className="text-sm text-[#AEB3D6] mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                <span>
                  {dept.city}, {dept.state}
                </span>
              </p>

              {/* Stat Strip */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#0F122E]/80 border border-gold/20">
                  <div className="text-xl sm:text-2xl font-bold font-heading text-gold">
                    {dept.totalCount > 0 ? dept.totalCount : "Host Squads"}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-[#AEB3D6] mt-0.5">
                    Athletes
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0F122E]/80 border border-gold/20">
                  <div className="text-xl sm:text-2xl font-bold font-heading text-men">
                    {dept.menCount > 0 ? dept.menCount : "—"}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-[#AEB3D6] mt-0.5">
                    Men
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0F122E]/80 border border-gold/20">
                  <div className="text-xl sm:text-2xl font-bold font-heading text-women">
                    {dept.womenCount > 0 ? dept.womenCount : "—"}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-[#AEB3D6] mt-0.5">
                    Women
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0F122E]/80 border border-gold/20">
                  <div className="text-xl sm:text-2xl font-bold font-heading text-[#F4EFE3]">
                    {dept.staffMen + dept.staffWomen > 0
                      ? `${dept.staffMen + dept.staffWomen}`
                      : dept.isHost
                      ? "Host Staff"
                      : "—"}
                  </div>
                  <div className="text-[10px] uppercase font-mono text-[#AEB3D6] mt-0.5">
                    Staff & Officials
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competing Teams Section */}
        <div className="mb-14">
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[rgba(217,178,111,0.2)]">
            <h2 className="text-2xl font-serif font-black text-gold uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span>Participating Squads ({campusTeams.length})</span>
            </h2>
            <Link
              href="/teams"
              className="text-xs font-mono text-gold-light hover:underline flex items-center gap-1"
            >
              <span>View All 50 Teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campusTeams.map((team) => {
              const sport = SPORTS_CONFIG.find((s) => s.id === team.sportId);
              const isWomen = team.category === "women";

              return (
                <div
                  key={team.id}
                  className="card-championship p-6 bg-[#161A40]/90 border border-gold/30 rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{sport?.icon}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isWomen
                            ? "bg-women/10 border-women/30 text-women"
                            : "bg-men/10 border-men/30 text-men"
                        }`}
                      >
                        {team.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-gold-light">
                      {team.name}
                    </h3>
                    <p className="text-xs text-[#AEB3D6] mt-1 font-mono">
                      Squad Size: {team.squadSize || 12} Players
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[rgba(217,178,111,0.15)] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gold/80">
                      MPTP Shirpur 2026
                    </span>
                    <Link
                      href={`/sports/${team.sportId}?category=${team.category}`}
                      className="text-xs font-bold text-gold hover:text-gold-light flex items-center gap-1"
                    >
                      <span>Sport Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campus Fixtures & Matches */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-6 border-b border-[rgba(217,178,111,0.2)]">
            <h2 className="text-2xl font-serif font-black text-gold uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              <span>Fixtures & Results</span>
            </h2>
            <span className="text-xs font-mono text-[#AEB3D6]">
              {campusMatches.length} Matches Scheduled
            </span>
          </div>

          {campusMatches.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#161A40]/50 border border-[rgba(217,178,111,0.15)] text-center text-xs sm:text-sm text-[#AEB3D6]">
              Detailed fixtures for {dept.name} will be generated as group draws are finalised.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campusMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </NavyPatchBackground>
  );
}

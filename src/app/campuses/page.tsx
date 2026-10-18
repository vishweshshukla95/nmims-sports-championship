"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import NavyPatchBackground from "@/components/ui/NavyPatchBackground";
import CampusBadge from "@/components/ui/CampusBadge";
import { fetchCampusDepartments, getCampusDepartments, CampusDepartmentInfo } from "@/lib/campus-store";
import { fetchTeams, getTeams } from "@/lib/tournament-store";
import { SPORTS_CONFIG } from "@/config/tournament";
import { Team } from "@/types/tournament";

export default function CampusesPublicPage() {
  const [departments, setDepartments] = useState<CampusDepartmentInfo[]>(getCampusDepartments());
  const [allTeams, setAllTeams] = useState<Team[]>(getTeams());

  useEffect(() => {
    fetchCampusDepartments()
      .then((data) => {
        if (data && data.length > 0) setDepartments(data);
      })
      .catch((err) => console.error("fetchCampusDepartments error:", err));

    fetchTeams()
      .then((data) => {
        if (data && data.length > 0) setAllTeams(data);
      })
      .catch((err) => console.error("fetchTeams error:", err));
  }, []);

  return (
    <NavyPatchBackground variant="calm" className="min-h-screen py-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="title-ornament text-xs font-mono font-semibold uppercase tracking-widest text-gold mb-2">
            Pan-India Representation
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-gold-gradient tracking-tight">
            CAMPUS CONTINGENTS
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#AEB3D6]">
            Official contingent figures, participating disciplines, squad sizes, and staff details across all seven SVKM&apos;s NMIMS campuses.
          </p>
        </div>

        {/* 7 Campus Cards (Strict Order: MUM, NVM, IND, BLR, HYD, CHD, SHI host last) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept) => {
            // Get all teams for this campus
            const campusTeams = allTeams.filter(
              (t) => t.campusId.toLowerCase() === dept.campusId.toLowerCase()
            );

            return (
              <div
                key={dept.campusId}
                className="card-championship bg-[#161A40]/90 border border-[rgba(217,178,111,0.25)] rounded-2xl p-6 flex flex-col justify-between relative shadow-xl hover:border-gold transition-all duration-300"
              >
                {/* Single Host Ribbon on Shirpur only */}
                {dept.isHost && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold text-indigo-black font-black text-[11px] uppercase tracking-wider shadow-md">
                    HOST CAMPUS
                  </div>
                )}

                <div>
                  {/* Campus Header */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <CampusBadge
                      shortCode={dept.shortCode}
                      size="lg"
                      isHost={false}
                    />
                    <div>
                      <h2 className="text-xl font-serif font-bold text-gold-light">
                        {dept.name}
                      </h2>
                      <p className="text-xs text-[#AEB3D6] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gold/70" />
                        <span>
                          {dept.city}, {dept.state}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Contingent Breakdown */}
                  <div className="p-3.5 rounded-xl bg-[#0F122E]/80 border border-[rgba(217,178,111,0.15)] mb-4">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gold mb-2 font-bold flex items-center justify-between">
                      <span>Athletic Contingent</span>
                      <span className="text-xs text-gold-light">
                        {dept.isHost && dept.totalCount === 0
                          ? "Host Squads"
                          : `Total: ${dept.totalCount}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-[#161A40]">
                        <span className="text-men font-bold block text-sm">
                          {dept.menCount > 0 ? dept.menCount : "—"}
                        </span>
                        <span className="text-[10px] text-[#AEB3D6] uppercase tracking-wider">
                          Men
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#161A40]">
                        <span className="text-women font-bold block text-sm">
                          {dept.womenCount > 0 ? dept.womenCount : "—"}
                        </span>
                        <span className="text-[10px] text-[#AEB3D6] uppercase tracking-wider">
                          Women
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#161A40]">
                        <span className="text-gold font-bold block text-sm">
                          {dept.totalCount > 0 ? dept.totalCount : "—"}
                        </span>
                        <span className="text-[10px] text-[#AEB3D6] uppercase tracking-wider">
                          Athletes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accompanying Staff */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F122E]/50 border border-[rgba(217,178,111,0.1)] text-xs text-[#AEB3D6] mb-4">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-gold/90">
                      <UserCheck className="w-3.5 h-3.5 text-gold" />
                      Staff:
                    </span>
                    <span className="font-semibold text-[#F4EFE3]">
                      {dept.staffMen > 0 || dept.staffWomen > 0
                        ? `${dept.staffMen} Men / ${dept.staffWomen} Women`
                        : dept.isHost
                        ? "Host Faculty & Staff"
                        : "To be updated"}
                    </span>
                  </div>

                  {/* Sports Chips with Squad Sizes */}
                  <div className="mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#AEB3D6] block mb-2 font-semibold">
                      Competing Squads ({campusTeams.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {campusTeams.map((team) => {
                        const sport = SPORTS_CONFIG.find((s) => s.id === team.sportId);
                        const isWomen = team.category === "women";
                        return (
                          <span
                            key={team.id}
                            className={`px-2 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1 ${
                              isWomen
                                ? "bg-women/10 border-women/30 text-women"
                                : "bg-men/10 border-men/30 text-men"
                            }`}
                          >
                            <span>{sport?.icon}</span>
                            <span>{sport?.name}</span>
                            {team.squadSize && (
                              <span className="ml-0.5 px-1 py-0.2 rounded bg-black/40 text-[9px] font-mono text-gold-light">
                                {team.squadSize}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sports Officer / Contact (if available) */}
                  {dept.officerName ? (
                    <div className="p-2.5 rounded-xl bg-[#20255A]/50 border border-gold/20 text-xs text-[#F4EFE3] mb-4">
                      <div className="text-[10px] font-mono uppercase text-gold font-bold mb-0.5">
                        Sports Officer
                      </div>
                      <div className="font-semibold">{dept.officerName}</div>
                      {dept.officerPhone && (
                        <div className="text-[#AEB3D6] text-[11px] font-mono mt-0.5">
                          {dept.officerPhone}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Footer link to detail page */}
                <div className="pt-4 border-t border-[rgba(217,178,111,0.15)] flex items-center justify-between">
                  <span className="text-[11px] text-gold/80 font-mono">
                    {dept.isHost ? "Host Campus" : "Participating Contingent"}
                  </span>
                  <Link
                    href={`/campuses/${dept.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-light group"
                  >
                    <span>Campus Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </NavyPatchBackground>
  );
}

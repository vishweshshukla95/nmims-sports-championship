"use client";

import React, { useMemo } from "react";
import CampusBadge from "@/components/ui/CampusBadge";
import { Trophy } from "lucide-react";
import {
  SportType,
  CategoryGender,
  Team,
  Group,
  TeamGroup,
  Match,
  PointsTableRow,
} from "@/types/tournament";
import { computePointsTable } from "@/lib/points-calculator";

interface PointsTableProps {
  sportId: SportType;
  category: CategoryGender;
  teams: Team[];
  groups?: Group[];
  teamGroups: TeamGroup[];
  matches: Match[];
}

export default function PointsTable({
  sportId,
  category,
  teams,
  groups = [],
  teamGroups,
  matches,
}: PointsTableProps) {
  // Filter groups for current sport
  const relevantGroups = useMemo(() => {
    return [...groups]
      .filter((g) => g.sportId === sportId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [groups, sportId]);

  const renderSingleGroup = (group: Group) => {
    const rows: PointsTableRow[] = computePointsTable(
      group.id,
      group.name,
      sportId,
      category,
      teams,
      teamGroups,
      matches
    );

    return (
      <div
        key={group.id}
        className="card-championship bg-[#161A40]/90 border border-gold/30 rounded-2xl overflow-hidden shadow-xl flex-1 flex flex-col justify-between"
      >
        {/* Gold Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#20255A] via-[#161A40] to-[#20255A] border-b border-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
            <h3 className="font-serif font-black text-base sm:text-lg text-gold uppercase tracking-wider">
              {group.name.toUpperCase()}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-gold-light/80">
            {rows.length} {rows.length === 1 ? "Team" : "Teams"}
          </span>
        </div>

        {/* Content */}
        {rows.length === 0 ? (
          <div className="p-10 text-center text-xs sm:text-sm text-[#AEB3D6] italic">
            No teams assigned to this group yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[rgba(217,178,111,0.15)] bg-[#0F122E]/70 text-[10px] sm:text-[11px] font-mono uppercase text-gold tracking-wider">
                  <th className="py-2.5 px-3 text-center w-10">Pos</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-2 text-center">P</th>
                  <th className="py-2.5 px-2 text-center">W</th>
                  {sportId === "football" && (
                    <th className="py-2.5 px-2 text-center">D</th>
                  )}
                  <th className="py-2.5 px-2 text-center">L</th>
                  {sportId === "cricket" && (
                    <th className="py-2.5 px-2 text-center">NR</th>
                  )}
                  {sportId === "football" && (
                    <>
                      <th className="py-2.5 px-2 text-center">GF</th>
                      <th className="py-2.5 px-2 text-center">GA</th>
                      <th className="py-2.5 px-2 text-center">GD</th>
                    </>
                  )}
                  {sportId === "basketball" && (
                    <>
                      <th className="py-2.5 px-2 text-center">PF</th>
                      <th className="py-2.5 px-2 text-center">PA</th>
                      <th className="py-2.5 px-2 text-center">Diff</th>
                    </>
                  )}
                  {sportId === "volleyball" && (
                    <th className="py-2.5 px-2 text-center">Sets W–L</th>
                  )}
                  <th className="py-2.5 px-3 text-center font-bold text-gold-light">
                    Pts
                  </th>
                  {sportId === "cricket" && (
                    <th className="py-2.5 px-3 text-right">NRR</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(217,178,111,0.08)]">
                {rows.map((row) => (
                  <tr
                    key={row.teamId}
                    className={`transition-colors hover:bg-[#20255A]/40 ${
                      row.qualified
                        ? "border-l-4 border-l-gold bg-gold/[0.04]"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Position & Qualification */}
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={
                            row.qualified
                              ? "text-gold font-black"
                              : "text-[#AEB3D6]"
                          }
                        >
                          {row.pos}
                        </span>
                        {row.qualified && (
                          <span
                            title="Qualified for Semis"
                            className="px-1 py-0.2 rounded text-[9px] font-black bg-gold text-indigo-black leading-none"
                          >
                            Q
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Team Name + Monogram */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <CampusBadge shortCode={row.shortCode} size="sm" />
                        <div>
                          <div className="font-serif font-bold text-xs sm:text-sm text-gold-light leading-tight">
                            {row.teamName.split("–")[0].trim()}
                          </div>
                          <span className="text-[10px] text-[#AEB3D6] font-mono">
                            {row.shortCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Played, Won, Lost */}
                    <td className="py-3 px-2 text-center font-mono text-[#F4EFE3]">
                      {row.played}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-emerald-400 font-semibold">
                      {row.won}
                    </td>
                    {sportId === "football" && (
                      <td className="py-3 px-2 text-center font-mono text-amber-400">
                        {row.drawn ?? 0}
                      </td>
                    )}
                    <td className="py-3 px-2 text-center font-mono text-rose-400">
                      {row.lost}
                    </td>

                    {/* Cricket NR */}
                    {sportId === "cricket" && (
                      <td className="py-3 px-2 text-center font-mono text-[#AEB3D6]">
                        {row.noResult ?? 0}
                      </td>
                    )}

                    {/* Football GF, GA, GD */}
                    {sportId === "football" && (
                      <>
                        <td className="py-3 px-2 text-center font-mono text-[#AEB3D6]">
                          {row.gf ?? 0}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[#AEB3D6]">
                          {row.ga ?? 0}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-semibold">
                          {(row.gd ?? 0) > 0 ? `+${row.gd}` : row.gd ?? 0}
                        </td>
                      </>
                    )}

                    {/* Basketball PF, PA, Diff */}
                    {sportId === "basketball" && (
                      <>
                        <td className="py-3 px-2 text-center font-mono text-[#AEB3D6]">
                          {row.pf ?? 0}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-[#AEB3D6]">
                          {row.pa ?? 0}
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-semibold">
                          {(row.diff ?? 0) > 0 ? `+${row.diff}` : row.diff ?? 0}
                        </td>
                      </>
                    )}

                    {/* Volleyball Sets W-L */}
                    {sportId === "volleyball" && (
                      <td className="py-3 px-2 text-center font-mono text-[#F4EFE3]">
                        {row.setsWon ?? 0}–{row.setsLost ?? 0}
                      </td>
                    )}

                    {/* Points */}
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-gold">
                      {row.points}
                    </td>

                    {/* Cricket NRR */}
                    {sportId === "cricket" && (
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-[#AEB3D6]">
                        {(row.nrr ?? 0) >= 0
                          ? `+${(row.nrr ?? 0).toFixed(3)}`
                          : (row.nrr ?? 0).toFixed(3)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        {rows.length > 0 && (
          <div className="px-4 py-2.5 bg-[#0F122E]/40 border-t border-[rgba(217,178,111,0.12)] flex items-center justify-between text-[10px] text-[#AEB3D6]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>Top 2 advance to Knockouts</span>
            </span>
            <span className="font-mono text-gold/70">Completed group matches only</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[rgba(217,178,111,0.15)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-gold uppercase tracking-wide">
            OFFICIAL POINTS TABLE
          </h2>
          <p className="text-xs text-[#AEB3D6] mt-0.5">
            Stage 1 Group Standings · Top 2 teams from each group qualify for semi-finals
          </p>
        </div>
      </div>

      {relevantGroups.length === 0 ? (
        <div className="card-championship bg-[#161A40]/90 border border-gold/30 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#0F122E] border border-gold/40 flex items-center justify-center mx-auto mb-4 text-gold shadow-gold-glow">
            <Trophy className="w-7 h-7 text-gold/70" />
          </div>
          <h3 className="text-lg font-serif font-bold text-gold uppercase tracking-wider mb-2">
            Groups will be announced soon.
          </h3>
          <p className="text-xs text-[#AEB3D6] leading-relaxed">
            Participating team group allocations and pool fixtures will be published by the organising committee prior to tournament commencement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {relevantGroups.map((g) => renderSingleGroup(g))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { X, Award, MapPin, Calendar } from "lucide-react";
import { Match } from "@/types/tournament";
import CampusBadge from "@/components/ui/CampusBadge";

interface MatchDetailsModalProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchDetailsModal({ match, isOpen, onClose }: MatchDetailsModalProps) {
  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0F122E]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#161A40] border-2 border-gold/40 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#20255A] via-[#161A40] to-[#20255A] border-b border-[rgba(217,178,111,0.25)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#0F122E] border border-gold/40 font-mono text-xs font-bold text-gold">
              Match #{match.matchNo}
            </span>
            <span className="text-sm font-semibold text-gold-light uppercase tracking-wider">
              {match.round} · {match.sportId.toUpperCase()} ({match.category.toUpperCase()})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#0F122E] hover:bg-gold hover:text-indigo-black border border-gold/40 text-gold transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Match Score Summary & Teams Banner */}
          <div className="p-6 rounded-2xl bg-[#0F122E]/80 border border-[rgba(217,178,111,0.25)] text-center">
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5 flex flex-col items-center">
                <CampusBadge shortCode={match.teamAShortCode} size="lg" />
                <span
                  className={`mt-2 font-serif font-bold text-sm sm:text-base ${
                    match.winnerId === match.teamAId ? "text-gold" : "text-[#F4EFE3]"
                  }`}
                >
                  {match.playerAName || match.teamAName}
                </span>
              </div>

              <div className="col-span-2 flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-gold/80 px-2 py-0.5 rounded bg-[#161A40]">
                  VS
                </span>
                {match.scoreSummary && (
                  <span className="text-xs sm:text-sm font-mono font-bold text-gold mt-2 whitespace-nowrap">
                    {match.scoreSummary}
                  </span>
                )}
              </div>

              <div className="col-span-5 flex flex-col items-center">
                <CampusBadge shortCode={match.teamBShortCode} size="lg" />
                <span
                  className={`mt-2 font-serif font-bold text-sm sm:text-base ${
                    match.winnerId === match.teamBId ? "text-gold" : "text-[#F4EFE3]"
                  }`}
                >
                  {match.playerBName || match.teamBName}
                </span>
              </div>
            </div>

            {match.resultText && (
              <div className="mt-4 pt-4 border-t border-[rgba(217,178,111,0.15)] text-base font-serif font-bold text-gold">
                {match.resultText}
              </div>
            )}
          </div>

          {/* Man of the Match Card */}
          {match.motmPlayerName && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#20255A] to-[#161A40] border-2 border-gold shadow-gold-glow">
              <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4 text-gold-light" />
                <span>Man of the Match</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-serif font-black text-gold-light">
                    {match.motmPlayerName}
                  </h4>
                  <p className="text-xs text-[#AEB3D6] mt-0.5">
                    Campus: <strong>{match.motmCampusCode}</strong>
                  </p>
                </div>
                <CampusBadge shortCode={match.motmCampusCode || "MUM"} size="md" />
              </div>

              {match.motmNote && (
                <div className="mt-3 p-3 rounded-xl bg-[#0F122E]/80 border border-gold/30 text-xs font-mono text-gold-light">
                  Performance: {match.motmNote}
                </div>
              )}
            </div>
          )}

          {/* Player Stats Table (if available) */}
          {match.playerStats && match.playerStats.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
                Match Player Stats
              </h4>
              <div className="overflow-x-auto rounded-xl border border-[rgba(217,178,111,0.2)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#20255A] text-gold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Player</th>
                      <th className="p-3">Campus</th>
                      <th className="p-3 text-right">Match Stats</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(217,178,111,0.1)]">
                    {match.playerStats.map((stat, i) => (
                      <tr key={i} className="hover:bg-[#20255A]/50 transition-colors">
                        <td className="p-3 font-semibold text-[#F4EFE3]">{stat.playerName}</td>
                        <td className="p-3 text-[#AEB3D6]">{stat.campusCode}</td>
                        <td className="p-3 font-mono text-gold-light text-right">{stat.statsText}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Match Notes & Venue Details */}
          <div className="p-4 rounded-xl bg-[#0F122E]/60 border border-[rgba(217,178,111,0.15)] text-xs text-[#AEB3D6] space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>
                <strong>Venue:</strong> {match.venue}, Mukesh Patel Technology Park, Shirpur
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>
                <strong>Date & Time:</strong>{" "}
                {new Date(match.scheduledAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            {match.notes && (
              <div className="pt-2 border-t border-[rgba(217,178,111,0.1)] text-[#F4EFE3]/80">
                <strong>Notes:</strong> {match.notes}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

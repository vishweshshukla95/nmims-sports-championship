"use client";

import React from "react";
import { MapPin, Award, CalendarPlus } from "lucide-react";
import CampusBadge from "@/components/ui/CampusBadge";
import { Match } from "@/types/tournament";
import { downloadIcsFile, IST_TIME_ZONE } from "@/lib/calendar";

export interface MatchCardProps {
  match: Match;
  onSelect?: (match: Match) => void;
  onOpenDetails?: (match: Match) => void;
  type?: "scheduled" | "result";
}

export default function MatchCard({ match, onSelect, onOpenDetails, type = "scheduled" }: MatchCardProps) {
  const isFinal = match.round === "Final";
  const isCompleted = match.status === "Completed" || type === "result";
  const handleClick = onOpenDetails || onSelect;

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadIcsFile({
      title: `${match.round}: ${match.teamAName} vs ${match.teamBName}`,
      description: `SVKM's NMIMS Inter Campus Sports Championship 2026-27 - ${match.sportId.toUpperCase()} (${match.category.toUpperCase()})\nMatch #${match.matchNo} (${match.round})\nVenue: ${match.venue}`,
      location: `${match.venue}, Mukesh Patel Technology Park, Shirpur`,
      startDate: match.scheduledAt,
    });
  };

  const formattedDate = new Date(match.scheduledAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: IST_TIME_ZONE,
  });

  const formattedTime = new Date(match.scheduledAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: IST_TIME_ZONE,
  });

  return (
    <div
      onClick={() => handleClick && handleClick(match)}
      className={`card-championship p-5 relative overflow-hidden transition-all duration-300 ${
        handleClick ? "cursor-pointer" : ""
      } ${
        isFinal
          ? "border-2 border-gold shadow-gold-glow"
          : "border-[rgba(217,178,111,0.2)]"
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[rgba(217,178,111,0.15)] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-gold px-2 py-0.5 rounded bg-[#0F122E] border border-gold/30">
            M#{match.matchNo}
          </span>
          <span className="font-semibold px-2 py-0.5 rounded-full bg-[#20255A] text-gold-light border border-gold/20">
            {match.round}
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
              match.category === "women"
                ? "bg-women/15 text-women border border-women/30"
                : "bg-men/15 text-men border border-men/30"
            }`}
          >
            {match.category.toUpperCase()}
          </span>
        </div>

        {/* Status Chip */}
        <div>
          {match.status === "Postponed" ? (
            <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/40 font-bold text-[11px]">
              Postponed
            </span>
          ) : isCompleted ? (
            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success border border-success/40 font-bold text-[11px]">
              Completed
            </span>
          ) : (
            <span className="text-[#AEB3D6] font-mono text-[11px]">
              {formattedDate} · {formattedTime}
            </span>
          )}
        </div>
      </div>

      {/* Main Teams Matchup Row */}
      <div className="grid grid-cols-12 gap-3 items-center py-2">
        {/* Team A */}
        <div className="col-span-5 flex items-center gap-3">
          <CampusBadge shortCode={match.teamAShortCode} size="md" />
          <div className="overflow-hidden">
            <h4
              className={`text-sm sm:text-base font-serif font-bold truncate ${
                isCompleted && match.winnerId === match.teamAId
                  ? "text-gold"
                  : isCompleted && match.winnerId && match.winnerId !== match.teamAId
                  ? "text-text-muted/60"
                  : "text-text-main"
              }`}
            >
              {match.playerAName || match.teamAName}
            </h4>
            <span className="text-[11px] text-[#AEB3D6] block truncate">
              {match.teamAShortCode}
            </span>
          </div>
        </div>

        {/* VS / Score Divider */}
        <div className="col-span-2 text-center flex flex-col items-center justify-center">
          {isCompleted && match.scoreSummary ? (
            <div className="text-xs font-mono font-bold text-gold px-2 py-1 rounded bg-[#0F122E] border border-gold/30 whitespace-nowrap">
              {match.scoreSummary}
            </div>
          ) : (
            <span className="text-xs font-black font-mono tracking-widest text-gold/80 px-2 py-1 rounded-full bg-[#0F122E] border border-gold/20">
              VS
            </span>
          )}
        </div>

        {/* Team B */}
        <div className="col-span-5 flex items-center justify-end gap-3 text-right">
          <div className="overflow-hidden">
            <h4
              className={`text-sm sm:text-base font-serif font-bold truncate ${
                isCompleted && match.winnerId === match.teamBId
                  ? "text-gold"
                  : isCompleted && match.winnerId && match.winnerId !== match.teamBId
                  ? "text-text-muted/60"
                  : "text-text-main"
              }`}
            >
              {match.playerBName || match.teamBName}
            </h4>
            <span className="text-[11px] text-[#AEB3D6] block truncate">
              {match.teamBShortCode}
            </span>
          </div>
          <CampusBadge shortCode={match.teamBShortCode} size="md" />
        </div>
      </div>

      {/* Result Line (for completed matches) */}
      {isCompleted && match.resultText && (
        <div className="mt-3 pt-3 border-t border-[rgba(217,178,111,0.15)] text-center">
          <div className="text-xs sm:text-sm font-semibold text-gold-light">
            {match.resultText}
          </div>
          {match.motmPlayerName && (
            <div className="mt-1.5 text-xs text-gold flex items-center justify-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-gold-light" />
              <span>
                🏅 Man of the Match: <strong>{match.motmPlayerName}</strong> ({match.motmCampusCode || match.motmCampus})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer Info for Scheduled Matches */}
      {!isCompleted && (
        <div className="mt-4 pt-3 border-t border-[rgba(217,178,111,0.15)] flex items-center justify-between text-xs text-[#AEB3D6]">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
            <span className="truncate">{match.venue}</span>
          </div>

          <button
            type="button"
            onClick={handleCalendarClick}
            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#20255A] hover:bg-gold hover:text-indigo-black border border-gold/30 text-gold text-[11px] font-semibold transition-colors"
            title="Add to Calendar"
          >
            <CalendarPlus className="w-3 h-3" />
            <span>.ics</span>
          </button>
        </div>
      )}
    </div>
  );
}

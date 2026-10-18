"use client";

import React, { useState } from "react";
import { Crown } from "lucide-react";
import CampusBadge from "@/components/ui/CampusBadge";
import { LeaderboardEntry, SportType, CategoryGender } from "@/types/tournament";

export interface SingleLeaderboardConfig {
  title: string;
  unit: string;
  data: LeaderboardEntry[];
}

export interface SportLeaderboardConfig {
  sportId: SportType;
  category: CategoryGender;
  board1Title: string;
  board1Unit: string;
  board1Data: LeaderboardEntry[];
  board2Title?: string;
  board2Unit?: string;
  board2Data?: LeaderboardEntry[];
}

interface SportLeaderboardProps {
  config: SportLeaderboardConfig;
  lastUpdated?: string;
}

export default function SportLeaderboard({
  config,
  lastUpdated = "18:00 IST",
}: SportLeaderboardProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

  const hasSecondBoard = Boolean(config.board2Title && config.board2Unit);

  const renderBoardTable = (
    title: string,
    unit: string,
    entries: LeaderboardEntry[]
  ) => {
    const hasData = entries && entries.length > 0;

    return (
      <div className="card-championship p-6 bg-[#161A40]/90 border border-gold/30 rounded-2xl flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(217,178,111,0.2)]">
            <h3 className="font-serif font-black text-base sm:text-lg text-gold-light truncate">
              {title}
            </h3>
            <span className="text-xs font-mono font-semibold text-gold px-2.5 py-1 rounded-full bg-[#0F122E] border border-gold/30">
              {unit}
            </span>
          </div>

          {!hasData ? (
            <div className="py-12 text-center text-xs sm:text-sm text-[#AEB3D6] italic">
              Official records update after verified match scoresheets are entered.
            </div>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 10).map((entry) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;

                return (
                  <div
                    key={`${entry.rank}-${entry.name}`}
                    onClick={() => setSelectedPlayer(entry)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isFirst
                        ? "bg-gradient-to-r from-[#20255A] to-[#161A40] border-2 border-gold shadow-gold-glow"
                        : "bg-[#0F122E]/60 border border-[rgba(217,178,111,0.12)] hover:border-gold/40 hover:bg-[#20255A]/50"
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 text-center font-mono font-bold text-xs">
                        {isFirst ? (
                          <span className="text-gold flex items-center justify-center">
                            <Crown className="w-5 h-5 text-gold fill-gold" />
                          </span>
                        ) : isSecond ? (
                          <span className="text-silver font-black">#2</span>
                        ) : isThird ? (
                          <span className="text-bronze font-black">#3</span>
                        ) : (
                          <span className="text-[#AEB3D6]">#{entry.rank}</span>
                        )}
                      </div>

                      <CampusBadge shortCode={entry.campusCode} size="sm" />

                      <div>
                        <div
                          className={`font-serif font-bold ${
                            isFirst ? "text-base text-gold" : "text-sm text-[#F4EFE3]"
                          }`}
                        >
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-[#AEB3D6] font-mono">
                          {entry.campusCode}
                        </div>
                      </div>
                    </div>

                    {/* Stat Number */}
                    <div className="text-right">
                      <span className="text-lg sm:text-xl font-mono font-black text-gold tabular-nums">
                        {entry.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Last Updated Timestamp */}
      <div className="flex items-center justify-between text-xs text-[#AEB3D6]">
        <span>SVKM&apos;s NMIMS Official Stats Views</span>
        <span className="font-mono text-gold/80">Last updated: {lastUpdated}</span>
      </div>

      {/* Grid: 2 columns if second board exists, 1 centered column if only one */}
      <div
        className={`grid gap-6 ${
          hasSecondBoard ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {renderBoardTable(
          config.board1Title,
          config.board1Unit,
          config.board1Data
        )}
        {hasSecondBoard &&
          renderBoardTable(
            config.board2Title!,
            config.board2Unit!,
            config.board2Data || []
          )}
      </div>

      {/* Player Detail Dialog */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#161A40] border-2 border-gold p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <CampusBadge shortCode={selectedPlayer.campusCode} size="lg" />
            </div>
            <div>
              <h4 className="text-lg font-serif font-bold text-gold-light">
                {selectedPlayer.name}
              </h4>
              <p className="text-xs text-[#AEB3D6] font-mono mt-0.5">
                Campus: {selectedPlayer.campusCode}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/30">
              <span className="text-xs font-mono text-[#AEB3D6] uppercase tracking-wider block">
                Rank #{selectedPlayer.rank}
              </span>
              <span className="text-3xl font-mono font-black text-gold mt-1 block">
                {selectedPlayer.value}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlayer(null)}
              className="w-full py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Crown, Medal, Award, Search, X, User } from "lucide-react";
import { LeaderboardEntry, SportType, CategoryGender } from "@/types/tournament";

export interface SportLeaderboardConfig {
  sportId: SportType;
  category: CategoryGender;
  board1Title: string;
  board1Unit: string;
  board1Data: LeaderboardEntry[];
  board2Title: string;
  board2Unit: string;
  board2Data: LeaderboardEntry[];
  mvpTitle: string;
  mvpData: LeaderboardEntry[];
}

interface SportLeaderboardProps {
  config: SportLeaderboardConfig;
  lastUpdated?: string;
}

export default function SportLeaderboard({
  config,
  lastUpdated = "18:00 IST",
}: SportLeaderboardProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<"b1" | "b2" | "mvp">("b1");
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fullViewBoard, setFullViewBoard] = useState<"b1" | "b2" | "mvp" | null>(null);

  const renderBoardTable = (
    title: string,
    unit: string,
    entries: LeaderboardEntry[],
    isMvp: boolean = false,
    boardKey: "b1" | "b2" | "mvp"
  ) => {
    const hasData = entries && entries.length > 0;

    return (
      <div className="card-championship p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[rgba(217,178,111,0.2)]">
            <h3 className="font-serif font-bold text-base sm:text-lg text-gold-light truncate">
              {title}
            </h3>
            <span className="text-xs font-mono font-semibold text-gold/80 px-2 py-0.5 rounded bg-[#0F122E]">
              {unit}
            </span>
          </div>

          {!hasData ? (
            <div className="py-12 text-center text-xs sm:text-sm text-[#AEB3D6]">
              Leaderboard updates after the first match.
            </div>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 10).map((entry) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;

                return (
                  <div
                    key={entry.rank}
                    onClick={() => setSelectedPlayer(entry)}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isFirst
                        ? "bg-gradient-to-r from-[#20255A] to-[#161A40] border-2 border-gold shadow-gold-glow"
                        : "bg-[#0F122E]/60 border border-[rgba(217,178,111,0.12)] hover:border-gold/40 hover:bg-[#20255A]/50"
                    }`}
                  >
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center font-mono font-bold text-xs">
                        {isFirst ? (
                          <span className="text-gold flex items-center justify-center">
                            <Crown className="w-4 h-4 text-gold fill-gold" />
                          </span>
                        ) : isSecond ? (
                          <span className="text-silver">#2</span>
                        ) : isThird ? (
                          <span className="text-bronze">#3</span>
                        ) : (
                          <span className="text-[#AEB3D6]">#{entry.rank}</span>
                        )}
                      </div>

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
                      <span className="text-base sm:text-lg font-mono font-black text-gold tabular-nums">
                        {entry.value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hasData && (
          <div className="pt-4 mt-4 border-t border-[rgba(217,178,111,0.15)] text-center">
            <button
              type="button"
              onClick={() => setFullViewBoard(boardKey)}
              className="text-xs font-bold uppercase tracking-wider text-gold hover:underline"
            >
              View Full Leaderboard →
            </button>
          </div>
        )}
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

      {/* DESKTOP: 3 Side-by-Side Cards */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {renderBoardTable(
          config.board1Title,
          config.board1Unit,
          config.board1Data,
          false,
          "b1"
        )}
        {renderBoardTable(
          config.board2Title,
          config.board2Unit,
          config.board2Data,
          false,
          "b2"
        )}
        {renderBoardTable(
          config.mvpTitle,
          "MVP Points",
          config.mvpData,
          true,
          "mvp"
        )}
      </div>

      {/* MOBILE: 3 Tabs */}
      <div className="lg:hidden space-y-4">
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#0F122E] border border-[rgba(217,178,111,0.2)]">
          <button
            type="button"
            onClick={() => setActiveMobileTab("b1")}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all truncate ${
              activeMobileTab === "b1" ? "tab-active" : "tab-inactive"
            }`}
          >
            {config.board1Title.split(":")[0]}
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("b2")}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all truncate ${
              activeMobileTab === "b2" ? "tab-active" : "tab-inactive"
            }`}
          >
            {config.board2Title.split(":")[0]}
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab("mvp")}
            className={`py-2 px-2 rounded-lg text-xs font-bold transition-all truncate ${
              activeMobileTab === "mvp" ? "tab-active" : "tab-inactive"
            }`}
          >
            ⭐ MVP
          </button>
        </div>

        <div>
          {activeMobileTab === "b1" &&
            renderBoardTable(
              config.board1Title,
              config.board1Unit,
              config.board1Data,
              false,
              "b1"
            )}
          {activeMobileTab === "b2" &&
            renderBoardTable(
              config.board2Title,
              config.board2Unit,
              config.board2Data,
              false,
              "b2"
            )}
          {activeMobileTab === "mvp" &&
            renderBoardTable(
              config.mvpTitle,
              "MVP Points",
              config.mvpData,
              true,
              "mvp"
            )}
        </div>
      </div>

      {/* FULL LEADERBOARD MODAL (With Name Search) */}
      {fullViewBoard && (
        <div className="fixed inset-0 z-50 bg-[#0F122E]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)]">
              <h3 className="text-lg font-serif font-bold text-gold">
                {fullViewBoard === "b1"
                  ? config.board1Title
                  : fullViewBoard === "b2"
                  ? config.board2Title
                  : config.mvpTitle}
              </h3>
              <button
                type="button"
                onClick={() => setFullViewBoard(null)}
                className="p-1 rounded-full text-gold hover:bg-[#20255A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative my-4">
              <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search athlete by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-sm text-[#F4EFE3] focus:outline-none focus:border-gold"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(fullViewBoard === "b1"
                ? config.board1Data
                : fullViewBoard === "b2"
                ? config.board2Data
                : config.mvpData
              )
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((entry) => (
                  <div
                    key={entry.rank}
                    onClick={() => {
                      setFullViewBoard(null);
                      setSelectedPlayer(entry);
                    }}
                    className="p-3 rounded-xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex items-center justify-between cursor-pointer hover:border-gold hover:bg-[#20255A]/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-gold w-6">
                        #{entry.rank}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-[#F4EFE3]">
                          {entry.name}
                        </div>
                        <div className="text-[11px] text-[#AEB3D6]">
                          {entry.campusCode}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gold text-base">
                      {entry.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* PLAYER PROFILE DRAWER */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 bg-[#0F122E]/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#161A40] border-t sm:border-2 border-gold/40 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-gold hover:bg-[#20255A]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
              <div className="w-16 h-16 rounded-2xl bg-[#0F122E] border border-gold/40 flex items-center justify-center text-gold">
                <User className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase tracking-wider">
                  Rank #{selectedPlayer.rank}
                </span>
                <h3 className="text-xl font-serif font-black text-gold-light mt-1">
                  {selectedPlayer.name}
                </h3>
                <p className="text-xs text-[#AEB3D6]">
                  Campus: <strong>{selectedPlayer.campusCode}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] text-center">
                <span className="text-xs text-[#AEB3D6] block">Matches Played</span>
                <span className="text-2xl font-mono font-bold text-gold">
                  {selectedPlayer.matchesPlayed || "—"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] text-center">
                <span className="text-xs text-[#AEB3D6] block">MOTM Honours</span>
                <span className="text-2xl font-mono font-bold text-gold">
                  {selectedPlayer.motmAwards || 0}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#20255A] border border-gold/30 text-center">
              <span className="text-xs text-[#AEB3D6] block">Tournament Standing</span>
              <span className="text-xl font-mono font-bold text-gold-light mt-1 block">
                {selectedPlayer.value}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

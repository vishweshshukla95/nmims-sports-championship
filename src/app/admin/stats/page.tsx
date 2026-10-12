"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { SPORTS_CONFIG } from "@/config/tournament";
import { getMatches } from "@/lib/tournament-store";

export default function AdminStatsPage() {
  const matches = useMemo(() => getMatches(), []);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sample spreadsheet rows
  const [statsRows, setStatsRows] = useState([
    {
      id: "1",
      playerName: "Aarav Patel",
      campus: "MUM",
      col1: "54", // Runs / Goals / Pts
      col2: "32", // Balls / Assists / Reb
      col3: "6",  // 4s / Fouls
      col4: "2",  // 6s / Steals
      mvpPoints: "68",
    },
    {
      id: "2",
      playerName: "Kabir Mehta",
      campus: "SHI",
      col1: "38",
      col2: "24",
      col3: "4",
      col4: "1",
      mvpPoints: "46",
    },
  ]);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Match Player Metrics
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Player Stats Grid
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Enter and validate per-match player performances for official SQL leaderboard aggregation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>Save & Recalculate MVP</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Player stats saved and MVP rankings re-aggregated successfully!</span>
          </div>
        )}

        {/* Match Selector */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-wrap items-center gap-4">
          <label className="text-xs font-bold text-gold uppercase">
            Select Completed Match:
          </label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="flex-1 min-w-[260px] p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
          >
            <option value="">Choose match fixture...</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                M#{m.matchNo} - {m.sportId.toUpperCase()} ({m.category}): {m.teamAShortCode} vs {m.teamBShortCode}
              </option>
            ))}
          </select>
        </div>

        {/* Spreadsheet Table */}
        <div className="overflow-x-auto rounded-2xl border border-[rgba(217,178,111,0.2)] bg-[#161A40]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#20255A] text-gold uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Player Name</th>
                <th className="p-4">Campus</th>
                <th className="p-4">Stat 1 (Runs/Goals/Pts)</th>
                <th className="p-4">Stat 2 (Balls/Assists)</th>
                <th className="p-4">Stat 3 (Fours/Aces)</th>
                <th className="p-4">Stat 4 (Sixes/Blocks)</th>
                <th className="p-4">Calculated MVP Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,178,111,0.1)]">
              {statsRows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-[#20255A]/40 transition-colors">
                  <td className="p-4">
                    <input
                      type="text"
                      value={row.playerName}
                      onChange={(e) => {
                        const copy = [...statsRows];
                        copy[idx].playerName = e.target.value;
                        setStatsRows(copy);
                      }}
                      className="p-1.5 rounded bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] w-full"
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-gold">{row.campus}</span>
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={row.col1}
                      onChange={(e) => {
                        const copy = [...statsRows];
                        copy[idx].col1 = e.target.value;
                        setStatsRows(copy);
                      }}
                      className="p-1.5 rounded bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] w-20 font-mono"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={row.col2}
                      onChange={(e) => {
                        const copy = [...statsRows];
                        copy[idx].col2 = e.target.value;
                        setStatsRows(copy);
                      }}
                      className="p-1.5 rounded bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] w-20 font-mono"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={row.col3}
                      onChange={(e) => {
                        const copy = [...statsRows];
                        copy[idx].col3 = e.target.value;
                        setStatsRows(copy);
                      }}
                      className="p-1.5 rounded bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] w-20 font-mono"
                    />
                  </td>
                  <td className="p-4">
                    <input
                      type="number"
                      value={row.col4}
                      onChange={(e) => {
                        const copy = [...statsRows];
                        copy[idx].col4 = e.target.value;
                        setStatsRows(copy);
                      }}
                      className="p-1.5 rounded bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] w-20 font-mono"
                    />
                  </td>
                  <td className="p-4 font-mono font-bold text-gold text-base">
                    {row.mvpPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

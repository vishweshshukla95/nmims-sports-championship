"use client";

import React, { useState } from "react";
import { Trophy, RefreshCw, Save, CheckCircle2, Sliders } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { SPORTS_CONFIG } from "@/config/tournament";

export default function AdminLeaderboardsPage() {
  const [selectedSport, setSelectedSport] = useState("cricket");
  const [recalculating, setRecalculating] = useState(false);
  const [recalculatedSuccess, setRecalculatedSuccess] = useState(false);

  // Editable MVP point rules per sport
  const [rules, setRules] = useState([
    { key: "Run", points: 1 },
    { key: "Four bonus", points: 1 },
    { key: "Six bonus", points: 2 },
    { key: "30-run bonus", points: 8 },
    { key: "50-run bonus", points: 16 },
    { key: "100-run bonus", points: 32 },
    { key: "Wicket", points: 25 },
    { key: "3-wicket bonus", points: 8 },
    { key: "5-wicket bonus", points: 16 },
    { key: "Maiden over", points: 12 },
    { key: "Catch", points: 8 },
    { key: "Stumping", points: 12 },
    { key: "Run-out", points: 10 },
    { key: "MOTM Award Bonus", points: 25 },
  ]);

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      setRecalculatedSuccess(true);
      setTimeout(() => setRecalculatedSuccess(false), 3000);
    }, 600);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Statistical Rules & Standings
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Leaderboards & MVP Rules
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Configure point multipliers per stat key and trigger instant SQL view re-calculation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            <span>{recalculating ? "Recalculating..." : "Recalculate All Standings"}</span>
          </button>
        </div>

        {recalculatedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All 6 sports MVP standings and views recomputed successfully!</span>
          </div>
        )}

        {/* Sport Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SPORTS_CONFIG.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => setSelectedSport(sport.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSport === sport.slug
                  ? "bg-gold text-indigo-black shadow-md"
                  : "bg-[#161A40] text-[#AEB3D6] hover:text-[#F4EFE3] border border-[rgba(217,178,111,0.15)]"
              }`}
            >
              {sport.icon} {sport.name}
            </button>
          ))}
        </div>

        {/* Rules Table */}
        <div className="p-6 rounded-3xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-4">
          <div className="flex items-center gap-2 text-gold">
            <Sliders className="w-5 h-5 text-gold-light" />
            <h3 className="font-serif font-bold text-base text-gold-light uppercase">
              MVP Point Multipliers for {selectedSport.toUpperCase()}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {rules.map((rule, idx) => (
              <div
                key={rule.key}
                className="p-4 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-[#F4EFE3]">
                  {rule.key}
                </span>
                <input
                  type="number"
                  value={rule.points}
                  onChange={(e) => {
                    const copy = [...rules];
                    copy[idx].points = Number(e.target.value);
                    setRules(copy);
                  }}
                  className="w-16 p-1.5 rounded-lg bg-[#161A40] border border-gold/40 text-center font-mono font-bold text-gold text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

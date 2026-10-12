"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Edit,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CAMPUSES_CONFIG, SPORTS_CONFIG } from "@/config/tournament";
import { getSeededTeams } from "@/lib/tournament-store";
import CampusBadge from "@/components/ui/CampusBadge";

export default function AdminTeamsPage() {
  const teams = useMemo(() => getSeededTeams(), []);
  const [selectedCampus, setSelectedCampus] = useState("all");

  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "Player Name,Role,Jersey No,Is Captain,Is Wk\nAarav Patel,Batsman,18,Yes,No\nRohan Sharma,Bowler,7,No,No";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "squad_import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Delegations & Rosters
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Teams & Players Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Manage all 70 seeded teams, add players, or bulk import squads via CSV.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCsvTemplate}
              className="px-4 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-4 h-4 text-gold" />
              <span>CSV Template</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex items-center justify-between gap-4">
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold"
          >
            <option value="all">All 7 Campuses (70 Teams)</option>
            {CAMPUSES_CONFIG.map((c) => (
              <option key={c.shortCode} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </select>

          <span className="text-xs text-gold/80 font-mono">
            70 Official Teams Seeded
          </span>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams
            .filter((t) => selectedCampus === "all" || t.campusId === selectedCampus)
            .map((team) => (
              <div
                key={team.id}
                className="card-championship p-5 border border-[rgba(217,178,111,0.2)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">
                      {SPORTS_CONFIG.find((s) => s.slug === team.sportId)?.icon}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        team.category === "women"
                          ? "bg-women/15 text-women border border-women/30"
                          : "bg-men/15 text-men border border-men/30"
                      }`}
                    >
                      {team.category.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-gold-light">
                    {team.name}
                  </h3>
                  <p className="text-xs text-[#AEB3D6] mt-1">
                    Squad: 0 athletes entered
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[rgba(217,178,111,0.15)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => alert(`Upload CSV for ${team.name}`)}
                    className="text-xs font-bold text-gold hover:underline flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload CSV Squad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => alert(`Add player to ${team.name}`)}
                    className="p-1 rounded-lg bg-[#20255A] text-gold hover:bg-gold hover:text-indigo-black"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </AdminLayout>
  );
}

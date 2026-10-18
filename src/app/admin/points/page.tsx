"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Settings,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import PointsTable from "@/components/sports/PointsTable";
import { SPORTS_CONFIG } from "@/config/tournament";
import { fetchTeamGroups } from "@/lib/groups-store";
import { fetchTeams, fetchMatches } from "@/lib/tournament-store";
import {
  fetchPointsAdjustments,
  saveStoredAdjustment,
  deleteStoredAdjustment,
  getSportPointsRules,
  fetchSportPointsRules,
  saveSportPointsRules,
  StoredAdjustment,
} from "@/lib/adjustments-store";
import { SportType, CategoryGender, Team, Match, TeamGroup } from "@/types/tournament";

export default function AdminPointsPage() {
  const [selectedSport, setSelectedSport] = useState<SportType>("cricket");
  const [selectedCategory, setSelectedCategory] = useState<CategoryGender>("men");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [recalcKey, setRecalcKey] = useState(0);

  // Adjustments & Rules
  const [adjustments, setAdjustments] = useState<StoredAdjustment[]>([]);
  const [pointsRules, setPointsRules] = useState(getSportPointsRules());

  // Tournament Data
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<TeamGroup[]>([]);

  // Modal
  const [adjModalOpen, setAdjModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // New Adjustment Form
  const [adjTeamId, setAdjTeamId] = useState("");
  const [adjField, setAdjField] = useState("points");
  const [adjDelta, setAdjDelta] = useState<number>(0);
  const [adjReason, setAdjReason] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function load() {
      const [adj, rules, t, m, g] = await Promise.all([
        fetchPointsAdjustments(),
        fetchSportPointsRules(),
        fetchTeams(),
        fetchMatches(),
        fetchTeamGroups(),
      ]);
      setAdjustments(adj);
      setPointsRules(rules);
      setTeams(t);
      setMatches(m);
      setGroups(g);
    }
    load();
  }, [recalcKey]);

  const currentSport = useMemo(
    () => SPORTS_CONFIG.find((s) => s.slug === selectedSport) || SPORTS_CONFIG[0],
    [selectedSport]
  );

  const sportCategoryTeams = useMemo(() => {
    return teams.filter(
      (t) => t.sportId === selectedSport && t.category === selectedCategory
    );
  }, [teams, selectedSport, selectedCategory]);

  const effectiveAdjTeamId = useMemo(() => {
    if (adjTeamId && sportCategoryTeams.some((t) => t.id === adjTeamId)) {
      return adjTeamId;
    }
    return sportCategoryTeams[0]?.id || "";
  }, [sportCategoryTeams, adjTeamId]);

  // Filter adjustments for selected sport & category
  const activeAdjustments = useMemo(() => {
    return adjustments.filter(
      (a) => a.sportId === selectedSport && a.category === selectedCategory
    );
  }, [adjustments, selectedSport, selectedCategory]);

  // Recalculate
  const handleRecalculate = () => {
    setRecalcKey((k) => k + 1);
    showToast(`Recalculated ${currentSport.name} points table with latest results and adjustments!`);
  };

  // Add adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeamId = effectiveAdjTeamId;
    if (!targetTeamId || adjDelta === 0) {
      showToast("Please select a team and enter a non-zero adjustment delta", "error");
      return;
    }

    try {
      const saved = await saveStoredAdjustment({
        teamId: targetTeamId,
        sportId: selectedSport,
        category: selectedCategory,
        field: adjField,
        delta: Number(adjDelta),
        reason: adjReason.trim() || "Manual adjustment",
      });

      setAdjustments([...adjustments, saved]);
      setAdjModalOpen(false);
      setAdjDelta(0);
      setAdjReason("");
      setRecalcKey((k) => k + 1);
      showToast(`Adjustment applied successfully!`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to apply adjustment", "error");
    }
  };

  // Delete adjustment
  const handleDeleteAdjustment = async (id: string) => {
    try {
      await deleteStoredAdjustment(id);
      setAdjustments(adjustments.filter((a) => a.id !== id));
      setRecalcKey((k) => k + 1);
      showToast("Removed adjustment");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to remove adjustment", "error");
    }
  };

  // Save rules
  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveSportPointsRules(pointsRules);
      setSettingsModalOpen(false);
      setRecalcKey((k) => k + 1);
      showToast(`Updated points rules for ${currentSport.name}!`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update points rules", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 text-xs font-bold animate-fadeIn ${
              toast.type === "success"
                ? "bg-emerald-950 border-emerald-500 text-emerald-200"
                : "bg-red-950 border-red-500 text-red-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Group Tables & Offsets
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Points Tables Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Inspect calculated standings for Group A and B, configure scoring rules, and apply manual penalties/bonuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSettingsModalOpen(true)}
              className="px-4 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Settings className="w-4 h-4 text-gold" />
              <span>Scoring Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setAdjModalOpen(true)}
              className="px-4 py-2.5 rounded-full btn-outline-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>Manual Adjustment</span>
            </button>

            <button
              type="button"
              onClick={handleRecalculate}
              className="px-5 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recalculate</span>
            </button>
          </div>
        </div>

        {/* Sport & Category Toolbar */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSport}
              onChange={(e) => {
                const s = e.target.value as SportType;
                setSelectedSport(s);
                const sp = SPORTS_CONFIG.find((item) => item.slug === s);
                if (!sp?.hasWomen && selectedCategory === "women") {
                  setSelectedCategory("men");
                }
              }}
              className="px-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
            >
              {SPORTS_CONFIG.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>

            {currentSport.hasMen && currentSport.hasWomen && (
              <div className="inline-flex p-0.5 rounded-xl bg-[#0F122E] border border-gold/30">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("men")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === "men"
                      ? "bg-men text-indigo-black"
                      : "text-men hover:bg-men/10"
                  }`}
                >
                  Men
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("women")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === "women"
                      ? "bg-women text-indigo-black"
                      : "text-women hover:bg-women/10"
                  }`}
                >
                  Women
                </button>
              </div>
            )}
          </div>

          <div className="text-xs font-mono text-gold-light">
            Current Rules: Win={pointsRules[selectedSport]?.win || 2}pts, Draw={pointsRules[selectedSport]?.draw || 0}pts, Loss={pointsRules[selectedSport]?.loss || 0}pts, NR={pointsRules[selectedSport]?.nr || 0}pts
          </div>
        </div>

        {/* Group A & Group B Points Table Render */}
        <div className="space-y-4">
          <PointsTable
            key={`${selectedSport}-${selectedCategory}-${recalcKey}`}
            sportId={selectedSport}
            category={selectedCategory}
            teams={teams}
            teamGroups={groups}
            matches={matches}
          />
        </div>

        {/* ACTIVE MANUAL ADJUSTMENTS TABLE */}
        <div className="p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-base text-gold uppercase tracking-wider">
                Manual Table Adjustments ({activeAdjustments.length})
              </h3>
              <p className="text-xs text-[#AEB3D6] mt-0.5">
                Penalties, bonus points, or tiebreaker offsets stored in <code>points_adjustments</code> added on top of match results.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAdjModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg btn-outline-gold text-xs font-bold uppercase flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Adjustment</span>
            </button>
          </div>

          {activeAdjustments.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#AEB3D6] italic bg-[#0F122E]/40 rounded-xl border border-gold/10">
              No manual adjustments recorded for this sport. Standing calculations are pure match outcomes.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gold/20">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#20255A] text-gold uppercase">
                  <tr>
                    <th className="p-3">Team</th>
                    <th className="p-3">Field</th>
                    <th className="p-3 text-center">Delta</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(217,178,111,0.1)]">
                  {activeAdjustments.map((adj) => {
                    const team = teams.find((t) => t.id === adj.teamId);
                    return (
                      <tr key={adj.id} className="hover:bg-[#20255A]/30">
                        <td className="p-3 font-semibold text-[#F4EFE3]">{team?.name || adj.teamId}</td>
                        <td className="p-3 font-mono text-gold-light uppercase">{adj.field}</td>
                        <td className="p-3 font-mono font-bold text-center">
                          <span
                            className={
                              adj.delta > 0
                                ? "text-emerald-400"
                                : adj.delta < 0
                                ? "text-rose-400"
                                : "text-gold"
                            }
                          >
                            {adj.delta > 0 ? `+${adj.delta}` : adj.delta}
                          </span>
                        </td>
                        <td className="p-3 text-[#AEB3D6]">{adj.reason}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteAdjustment(adj.id)}
                            className="p-1.5 rounded text-red-400 hover:bg-red-950/40"
                            title="Remove Adjustment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: MANUAL ADJUSTMENT */}
        {adjModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="font-serif font-bold text-lg text-gold">Apply Manual Adjustment</h3>
                <button
                  type="button"
                  onClick={() => setAdjModalOpen(false)}
                  className="p-1 text-[#AEB3D6] hover:text-[#F4EFE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Team
                  </label>
                  <select
                    value={effectiveAdjTeamId}
                    onChange={(e) => setAdjTeamId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    {sportCategoryTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                      Target Field
                    </label>
                    <select
                      value={adjField}
                      onChange={(e) => setAdjField(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    >
                      <option value="points">Points (Pts)</option>
                      <option value="played">Matches Played (P)</option>
                      <option value="won">Matches Won (W)</option>
                      <option value="lost">Matches Lost (L)</option>
                      <option value="drawn">Matches Drawn (D)</option>
                      <option value="noResult">No Result (NR)</option>
                      <option value="nrr">Net Run Rate (NRR)</option>
                      <option value="gd">Goal Difference (GD)</option>
                      <option value="diff">Point Difference (Diff)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                      Delta (+ or -)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={adjDelta}
                      onChange={(e) => setAdjDelta(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. -1 or 2"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    placeholder="e.g. Slow over-rate penalty (-1 pt)"
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full btn-gold text-xs font-bold uppercase"
                  >
                    Save Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: SCORING RULES */}
        {settingsModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="font-serif font-bold text-lg text-gold">
                  {currentSport.name} Scoring Rules
                </h3>
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="p-1 text-[#AEB3D6] hover:text-[#F4EFE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRules} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#AEB3D6] mb-1">
                      Points Per Win
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsRules[selectedSport]?.win ?? 2}
                      onChange={(e) =>
                        setPointsRules({
                          ...pointsRules,
                          [selectedSport]: {
                            ...pointsRules[selectedSport],
                            win: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#AEB3D6] mb-1">
                      Points Per Draw
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsRules[selectedSport]?.draw ?? 0}
                      onChange={(e) =>
                        setPointsRules({
                          ...pointsRules,
                          [selectedSport]: {
                            ...pointsRules[selectedSport],
                            draw: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#AEB3D6] mb-1">
                      Points Per Loss
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsRules[selectedSport]?.loss ?? 0}
                      onChange={(e) =>
                        setPointsRules({
                          ...pointsRules,
                          [selectedSport]: {
                            ...pointsRules[selectedSport],
                            loss: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#AEB3D6] mb-1">
                      No Result (NR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pointsRules[selectedSport]?.nr ?? 0}
                      onChange={(e) =>
                        setPointsRules({
                          ...pointsRules,
                          [selectedSport]: {
                            ...pointsRules[selectedSport],
                            nr: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-bold"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSettingsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full btn-gold text-xs font-bold uppercase"
                  >
                    Save Rules
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

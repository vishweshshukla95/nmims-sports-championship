"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { CAMPUSES_CONFIG, SPORTS_CONFIG } from "@/config/tournament";
import { fetchTeams } from "@/lib/tournament-store";
import { fetchTeamGroups } from "@/lib/groups-store";
import { upsertTeamAction, deleteTeamAction } from "@/app/actions/tournament";
import { getGroupsAction, assignTeamGroupAction } from "@/app/actions/groups";
import CampusBadge from "@/components/ui/CampusBadge";
import { Team, TeamGroup, Group, SportType, CategoryGender } from "@/types/tournament";

export const dynamic = "force-dynamic";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [allGroupsList, setAllGroupsList] = useState<Group[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<Team | null>(null);

  // Form states
  const [activeTeam, setActiveTeam] = useState<Partial<Team>>({
    name: "",
    campusId: "mum",
    sportId: "cricket",
    category: "men",
    squadSize: 12,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function load() {
      const [t, g, grps] = await Promise.all([
        fetchTeams(),
        fetchTeamGroups(),
        getGroupsAction(),
      ]);
      setTeams(t);
      setGroups(g);
      setAllGroupsList(grps);
    }
    load();
  }, []);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const matchCampus = selectedCampus === "all" || t.campusId === selectedCampus;
      const matchSport = selectedSport === "all" || t.sportId === selectedSport;
      return matchCampus && matchSport;
    });
  }, [teams, selectedCampus, selectedSport]);

  const handleAssignGroup = async (teamId: string, groupId: string) => {
    try {
      const res = await assignTeamGroupAction(teamId, groupId === "unassigned" ? null : groupId);
      if (res?.error) {
        console.error("assignTeamGroup error:", res.error);
        showToast(res.error, "error");
        return;
      }
      const [t, g] = await Promise.all([fetchTeams(), fetchTeamGroups()]);
      setTeams(t);
      setGroups(g);
      showToast(groupId === "unassigned" ? "Team unassigned" : "Group assigned", "success");
    } catch (err: unknown) {
      console.error("handleAssignGroup exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to assign group", "error");
    }
  };

  const getTeamGroupId = (teamId: string): string => {
    const found = groups.find((g) => g.teamId === teamId);
    return found ? found.groupId : "unassigned";
  };

  // Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam.campusId || !activeTeam.sportId) return;

    const campus = CAMPUSES_CONFIG.find((c) => c.id === activeTeam.campusId);
    const sport = SPORTS_CONFIG.find((s) => s.id === activeTeam.sportId);

    const newTeam: Team = {
      id: `team-${activeTeam.campusId}-${activeTeam.sportId}-${activeTeam.category}-${crypto.randomUUID().slice(0, 8)}`,
      name: `${campus?.name} – ${sport?.name} ${activeTeam.category === "women" ? "(W)" : ""}`.trim(),
      campusId: activeTeam.campusId,
      sportId: activeTeam.sportId as SportType,
      category: (activeTeam.category as CategoryGender) || "men",
      squadSize: Number(activeTeam.squadSize) || 12,
      players: [],
    };

    try {
      await upsertTeamAction(newTeam);
      const nextTeams = [...teams, newTeam];
      setTeams(nextTeams);
      setAddModalOpen(false);
      showToast(`Created team ${newTeam.name} successfully!`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create team", "error");
    }
  };

  // Edit Team
  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam.id) return;

    const target = teams.find((t) => t.id === activeTeam.id);
    if (!target) return;

    const updated: Team = {
      ...target,
      name: activeTeam.name || target.name,
      squadSize: Number(activeTeam.squadSize) || target.squadSize,
    };

    try {
      await upsertTeamAction(updated);
      const nextTeams = teams.map((t) => (t.id === updated.id ? updated : t));
      setTeams(nextTeams);
      setEditModalOpen(false);
      showToast(`Updated ${updated.name}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to update team", "error");
    }
  };

  // Delete Team
  const handleDeleteTeam = async (team: Team) => {
    try {
      await deleteTeamAction(team.id);
      const nextTeams = teams.filter((t) => t.id !== team.id);
      setTeams(nextTeams);
      setDeleteConfirmTeam(null);
      showToast(`Removed team ${team.name}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete team", "error");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 text-xs font-bold transition-all animate-fadeIn ${
              toast.type === "success"
                ? "bg-emerald-950 border-emerald-500 text-emerald-200"
                : "bg-red-950 border-red-500 text-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Roster & Group Allocation
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Teams Management
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Manage participating squads, update official squad sizes, and assign teams to Group A or Group B.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTeam({
                  name: "",
                  campusId: "mum",
                  sportId: "cricket",
                  category: "men",
                  squadSize: 12,
                });
                setAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team</span>
            </button>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Campus Filter */}
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="p-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
            >
              <option value="all">All Campuses</option>
              {CAMPUSES_CONFIG.map((c) => (
                <option key={c.shortCode} value={c.id}>
                  {c.name} ({c.shortCode})
                </option>
              ))}
            </select>

            {/* Sport Filter */}
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="p-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
            >
              <option value="all">All Sports</option>
              {SPORTS_CONFIG.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs font-mono text-gold-light">
            Showing {filteredTeams.length} of {teams.length} Teams
          </span>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const assignedGroupId = getTeamGroupId(team.id);
            const sport = SPORTS_CONFIG.find((s) => s.id === team.sportId);
            const isWomen = team.category === "women";
            const sportGroups = allGroupsList.filter((g) => g.sportId === team.sportId);

            return (
              <div
                key={team.id}
                className="card-championship p-5 border border-[rgba(217,178,111,0.2)] flex flex-col justify-between relative group hover:border-gold/50"
              >
                <div>
                  {/* Card Top: Icon & Category */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CampusBadge shortCode={team.campusId.toUpperCase()} size="sm" />
                      <span className="text-lg">{sport?.icon}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        isWomen
                          ? "bg-women/15 text-women border-women/30"
                          : "bg-men/15 text-men border-men/30"
                      }`}
                    >
                      {team.category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-gold-light">
                    {team.name}
                  </h3>
                  <p className="text-xs text-[#AEB3D6] mt-1 font-mono">
                    Squad Size: <strong>{team.squadSize || 12}</strong> athletes
                  </p>

                  {/* Group Assignment Dropdown */}
                  <div className="mt-4 p-2 rounded-xl bg-[#0F122E] border border-[rgba(217,178,111,0.15)] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#AEB3D6] font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-gold" />
                      Group:
                    </span>
                    <select
                      value={assignedGroupId}
                      onChange={(e) => handleAssignGroup(team.id, e.target.value)}
                      className="bg-[#161A40] border border-gold/30 rounded-lg px-2.5 py-1 text-[11px] font-bold text-gold focus:outline-none focus:border-gold"
                    >
                      <option value="unassigned">Unassigned</option>
                      {sportGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Card Actions: Edit Squad Size / Delete */}
                <div className="mt-4 pt-3 border-t border-[rgba(217,178,111,0.15)] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTeam({ ...team });
                      setEditModalOpen(true);
                    }}
                    className="text-xs font-semibold text-gold/90 hover:text-gold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Team</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmTeam(team)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                    title="Delete Team"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL: ADD TEAM */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="font-serif font-bold text-lg text-gold">Add New Team</h3>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 text-[#AEB3D6] hover:text-[#F4EFE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Campus
                  </label>
                  <select
                    value={activeTeam.campusId}
                    onChange={(e) => setActiveTeam({ ...activeTeam, campusId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    {CAMPUSES_CONFIG.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Sport
                  </label>
                  <select
                    value={activeTeam.sportId}
                    onChange={(e) => setActiveTeam({ ...activeTeam, sportId: e.target.value as SportType })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    {SPORTS_CONFIG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Category
                  </label>
                  <select
                    value={activeTeam.category}
                    onChange={(e) => setActiveTeam({ ...activeTeam, category: e.target.value as CategoryGender })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Squad Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={activeTeam.squadSize}
                    onChange={(e) => setActiveTeam({ ...activeTeam, squadSize: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full btn-gold text-xs font-bold uppercase"
                  >
                    Save Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT TEAM */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="font-serif font-bold text-lg text-gold">Edit Team</h3>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 text-[#AEB3D6] hover:text-[#F4EFE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={activeTeam.name || ""}
                    onChange={(e) => setActiveTeam({ ...activeTeam, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Squad Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={activeTeam.squadSize || 12}
                    onChange={(e) => setActiveTeam({ ...activeTeam, squadSize: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full btn-gold text-xs font-bold uppercase"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmTeam && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-gold">Confirm Deletion</h3>
              <p className="text-xs text-[#AEB3D6] mt-2">
                Are you sure you want to delete <strong>{deleteConfirmTeam.name}</strong>? This action cannot be undone.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTeam(null)}
                  className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTeam(deleteConfirmTeam)}
                  className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

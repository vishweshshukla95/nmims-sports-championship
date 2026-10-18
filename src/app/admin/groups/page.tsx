"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  RotateCcw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { SPORTS_CONFIG } from "@/config/tournament";
import { SportType, CategoryGender, Team, Group, TeamGroup } from "@/types/tournament";
import { getTeamsAction } from "@/app/actions/tournament";
import {
  getGroupsAction,
  saveGroupAction,
  deleteGroupAction,
  getTeamGroupsAction,
  assignTeamGroupAction,
  clearTeamGroupAssignmentsAction,
} from "@/app/actions/groups";
import CampusBadge from "@/components/ui/CampusBadge";

export default function AdminGroupsPage() {
  const [selectedSport, setSelectedSport] = useState<SportType>("cricket");
  const [selectedCategory, setSelectedCategory] = useState<CategoryGender>("men");

  const [groups, setGroups] = useState<Group[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Editing group name inline
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Adding new group
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  const currentSportConfig = useMemo(
    () => SPORTS_CONFIG.find((s) => s.slug === selectedSport) || SPORTS_CONFIG[0],
    [selectedSport]
  );

  // Load groups, teams, and team_groups for selected sport & category
  const loadData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [allTeams, grps, tg] = await Promise.all([
        getTeamsAction(),
        getGroupsAction(selectedSport, selectedCategory),
        getTeamGroupsAction(),
      ]);
      setTeams(allTeams);
      setGroups(grps);
      setTeamGroups(tg);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load groups data";
      console.error("loadData error:", err);
      showToast(message, "error");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getTeamsAction(),
      getGroupsAction(selectedSport, selectedCategory),
      getTeamGroupsAction(),
    ])
      .then(([allTeams, grps, tg]) => {
        if (!ignore) {
          setTeams(allTeams);
          setGroups(grps);
          setTeamGroups(tg);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : "Failed to load groups data";
          console.error("loadData error:", err);
          showToast(message, "error");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedSport, selectedCategory]);

  // Teams participating in current sport & category
  const eligibleTeams = useMemo(() => {
    return teams.filter(
      (t) => t.sportId === selectedSport && t.category === selectedCategory
    );
  }, [teams, selectedSport, selectedCategory]);

  // Map of teamId -> groupId
  const teamAssignmentMap = useMemo(() => {
    const map = new Map<string, string>();
    teamGroups.forEach((tg) => {
      map.set(tg.teamId, tg.groupId);
    });
    return map;
  }, [teamGroups]);

  // Suggested next group name (Group A, Group B, Group C...)
  const suggestedGroupName = useMemo(() => {
    const charCode = 65 + groups.length; // 65 = 'A'
    if (charCode <= 90) {
      return `Group ${String.fromCharCode(charCode)}`;
    }
    return `Group ${groups.length + 1}`;
  }, [groups]);

  // Handle Add Group
  const handleAddGroup = async (nameToAdd?: string) => {
    const finalName = (nameToAdd || newGroupName || suggestedGroupName).trim();
    if (!finalName) return;

    try {
      setSavingAction(true);
      const nextSortOrder = groups.length > 0 ? Math.max(...groups.map((g) => g.sortOrder || 0)) + 1 : 1;
      const res = await saveGroupAction({
        sportId: selectedSport,
        categoryGender: selectedCategory,
        name: finalName,
        sortOrder: nextSortOrder,
      });

      if (res.error) {
        console.error("saveGroup error:", res.error);
        showToast(res.error, "error");
        return;
      }

      setNewGroupName("");
      setIsAddingGroup(false);
      showToast(`Group "${finalName}" created`, "success");
      await loadData();
    } catch (err: unknown) {
      console.error("handleAddGroup exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to create group", "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Rename Group
  const handleSaveRename = async (group: Group) => {
    if (!editingName.trim()) return;

    try {
      setSavingAction(true);
      const res = await saveGroupAction({
        id: group.id,
        sportId: group.sportId,
        categoryGender: selectedCategory,
        name: editingName.trim(),
        sortOrder: group.sortOrder,
      });

      if (res.error) {
        console.error("renameGroup error:", res.error);
        showToast(res.error, "error");
        return;
      }

      setEditingGroupId(null);
      setEditingName("");
      showToast(`Group renamed to "${editingName.trim()}"`, "success");
      await loadData();
    } catch (err: unknown) {
      console.error("handleSaveRename exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to rename group", "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Reorder Group (Up / Down)
  const handleMoveGroup = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const currentGroup = groups[index];
    const targetGroup = groups[targetIndex];

    try {
      setSavingAction(true);
      // Swap sortOrder
      const currentSort = currentGroup.sortOrder;
      const targetSort = targetGroup.sortOrder;

      const newCurrentSort = currentSort === targetSort ? targetIndex + 1 : targetSort;
      const newTargetSort = currentSort === targetSort ? index + 1 : currentSort;

      const [res1, res2] = await Promise.all([
        saveGroupAction({
          id: currentGroup.id,
          sportId: currentGroup.sportId,
          categoryGender: selectedCategory,
          name: currentGroup.name,
          sortOrder: newCurrentSort,
        }),
        saveGroupAction({
          id: targetGroup.id,
          sportId: targetGroup.sportId,
          categoryGender: selectedCategory,
          name: targetGroup.name,
          sortOrder: newTargetSort,
        }),
      ]);

      if (res1.error || res2.error) {
        const err = res1.error || res2.error;
        console.error("reorder error:", err);
        showToast(err || "Failed to reorder groups", "error");
        return;
      }

      showToast("Groups reordered", "success");
      await loadData();
    } catch (err: unknown) {
      console.error("handleMoveGroup exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to reorder groups", "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Delete Group
  const handleDeleteGroup = async (group: Group) => {
    const assignedCount = eligibleTeams.filter((t) => teamAssignmentMap.get(t.id) === group.id).length;
    const confirmMessage = assignedCount > 0
      ? `Delete "${group.name}"? This will unassign ${assignedCount} ${assignedCount === 1 ? "team" : "teams"} from this group.`
      : `Delete "${group.name}"?`;

    if (!confirm(confirmMessage)) return;

    try {
      setSavingAction(true);
      const res = await deleteGroupAction(group.id);
      if (res.error) {
        console.error("deleteGroup error:", res.error);
        showToast(res.error, "error");
        return;
      }

      showToast(`Group "${group.name}" deleted`, "success");
      await loadData();
    } catch (err: unknown) {
      console.error("handleDeleteGroup exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to delete group", "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Assign Team to Group
  const handleAssignTeam = async (teamId: string, groupId: string) => {
    try {
      const res = await assignTeamGroupAction(teamId, groupId === "unassigned" ? null : groupId);
      if (res.error) {
        console.error("assignTeamGroup error:", res.error);
        showToast(res.error, "error");
        return;
      }

      showToast(groupId === "unassigned" ? "Team unassigned" : "Team assigned to group", "success");
      await loadData();
    } catch (err: unknown) {
      console.error("handleAssignTeam exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to assign team", "error");
    }
  };

  // Handle Clear All Assignments
  const handleClearAllAssignments = async () => {
    if (
      !confirm(
        `Are you sure you want to clear all team group assignments for ${currentSportConfig.name} (${selectedCategory.toUpperCase()})? Teams will become unassigned.`
      )
    ) {
      return;
    }

    try {
      setSavingAction(true);
      const res = await clearTeamGroupAssignmentsAction(selectedSport, selectedCategory);
      if (res.error) {
        console.error("clearTeamGroupAssignments error:", res.error);
        showToast(res.error, "error");
        return;
      }

      showToast("All team assignments cleared", "success");
      await loadData();
    } catch (err: unknown) {
      console.error("handleClearAllAssignments exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to clear assignments", "error");
    } finally {
      setSavingAction(false);
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
              Tournament Structure
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1 flex items-center gap-2.5">
              <Layers className="w-7 h-7 text-gold" />
              <span>Groups & Pool Allocation</span>
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-1 max-w-2xl leading-relaxed">
              Create and manage dynamic groups per sport and category. Assign participating teams to pools for Stage 1 round-robin fixtures.
            </p>
          </div>
        </div>

        {/* Sport and Category Selector Card */}
        <div className="card-championship p-5 flex flex-wrap items-center justify-between gap-4 bg-[#161A40]/80">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sport selector */}
            <div>
              <label className="block text-[10px] font-mono text-[#AEB3D6] uppercase tracking-wider mb-1">
                Sport
              </label>
              <select
                value={selectedSport}
                onChange={(e) => {
                  const s = e.target.value as SportType;
                  setSelectedSport(s);
                  const conf = SPORTS_CONFIG.find((sc) => sc.slug === s);
                  if (!conf?.hasWomen && selectedCategory === "women") {
                    setSelectedCategory("men");
                  }
                }}
                className="bg-[#0F122E] border border-gold/30 rounded-xl px-3 py-2 text-xs font-semibold text-gold focus:outline-none focus:border-gold"
              >
                {SPORTS_CONFIG.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category toggle */}
            <div>
              <label className="block text-[10px] font-mono text-[#AEB3D6] uppercase tracking-wider mb-1">
                Category
              </label>
              <div className="inline-flex p-1 rounded-xl bg-[#0F122E] border border-gold/30">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("men")}
                  className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === "men"
                      ? "bg-gold text-indigo-black shadow-md"
                      : "text-gold hover:text-gold-light"
                  }`}
                >
                  Men
                </button>
                {currentSportConfig.hasWomen && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("women")}
                    className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === "women"
                        ? "bg-gold text-indigo-black shadow-md"
                        : "text-gold hover:text-gold-light"
                    }`}
                  >
                    Women
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-[#AEB3D6] block">
              {eligibleTeams.length} {eligibleTeams.length === 1 ? "Team" : "Teams"} Participating
            </span>
            <span className="text-xs font-serif font-bold text-gold">
              {groups.length} {groups.length === 1 ? "Group Defined" : "Groups Defined"}
            </span>
          </div>
        </div>

        {/* SECTION 1: GROUPS MANAGEMENT */}
        <div className="card-championship p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(217,178,111,0.15)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-gold uppercase tracking-wider">
                Pools & Groups ({groups.length})
              </h2>
            </div>

            {/* Add Group controls */}
            {!isAddingGroup ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddGroup(suggestedGroupName)}
                  disabled={savingAction}
                  className="btn-gold flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl shadow-md disabled:opacity-50"
                  title={`Quickly add ${suggestedGroupName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {suggestedGroupName}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingGroup(true);
                    setNewGroupName(suggestedGroupName);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
                >
                  Custom Group
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Group Name (e.g. Pool A)"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddGroup();
                    if (e.key === "Escape") setIsAddingGroup(false);
                  }}
                  className="bg-[#0F122E] border border-gold/40 text-xs text-[#F4EFE3] px-3 py-1.5 rounded-xl focus:outline-none focus:border-gold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleAddGroup()}
                  disabled={savingAction || !newGroupName.trim()}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
                  title="Create Group"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingGroup(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-[#AEB3D6] rounded-lg"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gold flex items-center justify-center gap-2 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading groups...</span>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0F122E]/40 border border-dashed border-[rgba(217,178,111,0.25)] text-center max-w-md mx-auto">
              <Layers className="w-8 h-8 text-gold/40 mx-auto mb-2" />
              <h3 className="text-sm font-serif font-bold text-gold-light">
                No Groups Decided Yet
              </h3>
              <p className="text-xs text-[#AEB3D6] mt-1 leading-relaxed">
                Click &quot;Add {suggestedGroupName}&quot; above to create the first pool for {currentSportConfig.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map((group, idx) => {
                const assignedTeams = eligibleTeams.filter(
                  (t) => teamAssignmentMap.get(t.id) === group.id
                );
                const isEditing = editingGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    className="p-4 rounded-2xl bg-[#0F122E] border border-gold/30 flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(group);
                              if (e.key === "Escape") setEditingGroupId(null);
                            }}
                            className="bg-[#161A40] border border-gold/50 text-xs font-serif font-bold text-gold px-2 py-1 rounded-lg w-full focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(group)}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingGroupId(null)}
                            className="p-1 bg-white/10 hover:bg-white/20 text-[#AEB3D6] rounded"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-black text-sm text-gold uppercase tracking-wider">
                            {group.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingGroupId(group.id);
                              setEditingName(group.name);
                            }}
                            className="p-1 text-[#AEB3D6] hover:text-gold transition-colors"
                            title="Rename Group"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Reorder and Delete controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveGroup(idx, "up")}
                          disabled={idx === 0 || savingAction}
                          className="p-1 text-[#AEB3D6] hover:text-gold disabled:opacity-20 transition-colors"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveGroup(idx, "down")}
                          disabled={idx === groups.length - 1 || savingAction}
                          className="p-1 text-[#AEB3D6] hover:text-gold disabled:opacity-20 transition-colors"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group)}
                          disabled={savingAction}
                          className="p-1 text-red-400/80 hover:text-red-400 transition-colors ml-1"
                          title="Delete Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[rgba(217,178,111,0.1)] flex items-center justify-between text-[11px] font-mono text-[#AEB3D6]">
                      <span>{assignedTeams.length} {assignedTeams.length === 1 ? "Team Assigned" : "Teams Assigned"}</span>
                      <span className="text-[10px] text-gold/70">Sort #{group.sortOrder}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: TEAM ASSIGNMENTS */}
        <div className="card-championship p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(217,178,111,0.15)]">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                <h2 className="text-base sm:text-lg font-serif font-bold text-gold uppercase tracking-wider">
                  Participating Teams Allocation ({eligibleTeams.length})
                </h2>
              </div>
              <p className="text-xs text-[#AEB3D6] mt-0.5">
                Assign each contingent team to a pool or keep unassigned.
              </p>
            </div>

            {eligibleTeams.some((t) => teamAssignmentMap.has(t.id)) && (
              <button
                type="button"
                onClick={handleClearAllAssignments}
                disabled={savingAction}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Assignments</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-8 text-center text-gold flex items-center justify-center gap-2 text-xs font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading teams...</span>
            </div>
          ) : eligibleTeams.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#AEB3D6] italic">
              No participating teams found for {currentSportConfig.name} ({selectedCategory}).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(217,178,111,0.15)] text-[10px] font-mono uppercase text-gold">
                    <th className="py-2.5 px-3">Team Name</th>
                    <th className="py-2.5 px-3">Campus</th>
                    <th className="py-2.5 px-3">Current Assignment</th>
                    <th className="py-2.5 px-3 text-right">Assign Group</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(217,178,111,0.08)]">
                  {eligibleTeams.map((team) => {
                    const assignedGroupId = teamAssignmentMap.get(team.id) || "unassigned";
                    const assignedGroupObj = groups.find((g) => g.id === assignedGroupId);

                    return (
                      <tr key={team.id} className="hover:bg-[#20255A]/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-[#F4EFE3]">
                          <div className="flex items-center gap-2.5">
                            <CampusBadge shortCode={team.campusId.toUpperCase()} size="sm" />
                            <span>{team.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 uppercase font-mono text-[#AEB3D6]">
                          {team.campusId}
                        </td>
                        <td className="py-3 px-3">
                          {assignedGroupObj ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold/15 border border-gold/40 text-gold uppercase tracking-wider">
                              {assignedGroupObj.name}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-[#AEB3D6] border border-white/10">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={assignedGroupId}
                            onChange={(e) => handleAssignTeam(team.id, e.target.value)}
                            disabled={groups.length === 0}
                            className="bg-[#0F122E] border border-gold/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-gold focus:outline-none focus:border-gold disabled:opacity-40"
                          >
                            <option value="unassigned">-- Unassigned --</option>
                            {groups.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

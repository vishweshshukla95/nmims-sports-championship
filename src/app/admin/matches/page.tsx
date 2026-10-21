"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Copy,
  Upload,
  Trash2,
  Edit,
  CheckCircle2,
  X,
  Search,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  SPORTS_CONFIG,
  TOURNAMENT_DAYS,
} from "@/config/tournament";
import {
  fetchMatches,
  saveMatch,
  deleteMatch,
  fetchTeams,
} from "@/lib/tournament-store";
import { fetchTeamGroups } from "@/lib/groups-store";
import { bulkImportMatchesAction } from "@/app/actions/tournament";
import { getGroupsAction } from "@/app/actions/groups";
import { IST_TIME_ZONE, toIstDateTimeParts } from "@/lib/calendar";
import {
  Match,
  Team,
  TeamGroup,
  Group,
  SportType,
  CategoryGender,
  MatchRound,
  MatchStatus,
} from "@/types/tournament";

export const dynamic = "force-dynamic";

function MatchesAdminContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");

  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [allGroupsList, setAllGroupsList] = useState<Group[]>([]);

  React.useEffect(() => {
    async function load() {
      const [m, t, g, grps] = await Promise.all([
        fetchMatches(),
        fetchTeams(),
        fetchTeamGroups(),
        getGroupsAction(),
      ]);
      setMatches(m);
      setTeams(t);
      setGroups(g);
      setAllGroupsList(grps);
    }
    load();
  }, []);

  // Filter state
  const [filterSport, setFilterSport] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Editor Modal State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(initialAction === "new");

  // Form fields strictly per Part 1C & Part 2
  const [formSport, setFormSport] = useState<SportType>("cricket");
  const [formCategory, setFormCategory] = useState<CategoryGender>("men");
  const [formRound, setFormRound] = useState<MatchRound>("Group Stage");
  const [formGroupId, setFormGroupId] = useState<string>("");
  const [formMatchNo, setFormMatchNo] = useState(1);
  const [formTeamAId, setFormTeamAId] = useState<string>("");
  const [formTeamBId, setFormTeamBId] = useState<string>("");
  const [formDate, setFormDate] = useState("2026-10-27");
  const [formTime, setFormTime] = useState("09:30");
  const [formVenue, setFormVenue] = useState("Main Cricket Ground");
  const [formStatus, setFormStatus] = useState<MatchStatus>("Scheduled");
  const [formNotes, setFormNotes] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Valid teams for current sport & category
  const sportCategoryTeams = useMemo(() => {
    return teams.filter(
      (t) => t.sportId === formSport && t.category === formCategory
    );
  }, [teams, formSport, formCategory]);

  // Groups for current sport & category. Men's and women's groups share names
  // ("Group A"), so match on the category ids used by this category's team assignments.
  const categoryGroups = useMemo(() => {
    const teamIds = new Set(sportCategoryTeams.map((t) => t.id));
    const categoryIds = new Set(
      groups
        .filter((tg) => teamIds.has(tg.teamId) && tg.categoryId)
        .map((tg) => tg.categoryId as string)
    );
    return allGroupsList.filter(
      (g) =>
        g.sportId === formSport &&
        (categoryIds.size === 0 || !g.categoryId || categoryIds.has(g.categoryId))
    );
  }, [allGroupsList, formSport, sportCategoryTeams, groups]);

  // Ignore a selected group that belongs to another sport/category
  const effectiveGroupId = categoryGroups.some((g) => g.id === formGroupId) ? formGroupId : "";

  // Teams filtered by group when round is Group Stage, Group A or Group B
  const eligibleTeams = useMemo(() => {
    if (formRound === "Group Stage") {
      if (effectiveGroupId) {
        const assignedIds = new Set(
          groups
            .filter((tg) => tg.groupId === effectiveGroupId)
            .map((tg) => tg.teamId)
        );
        const filtered = sportCategoryTeams.filter((t) => assignedIds.has(t.id));
        return filtered.length > 0 ? filtered : sportCategoryTeams;
      }
      return sportCategoryTeams;
    }
    if (formRound === "Group A" || formRound === "Group B") {
      const targetGroup = formRound === "Group A" ? "A" : "B";
      const assignedIds = new Set(
        groups
          .filter(
            (g) =>
              g.sportId === formSport &&
              (g.groupName === targetGroup ||
                g.groupName?.toLowerCase() === `group ${targetGroup}`.toLowerCase())
          )
          .map((g) => g.teamId)
      );

      const filtered = sportCategoryTeams.filter((t) => assignedIds.has(t.id));
      return filtered.length > 0 ? filtered : sportCategoryTeams;
    }
    return sportCategoryTeams;
  }, [sportCategoryTeams, formRound, effectiveGroupId, groups, formSport]);

  const effectiveTeamAId = useMemo(() => {
    if (formTeamAId && eligibleTeams.some((t) => t.id === formTeamAId)) {
      return formTeamAId;
    }
    return eligibleTeams[0]?.id || "";
  }, [eligibleTeams, formTeamAId]);

  const effectiveTeamBId = useMemo(() => {
    if (formTeamBId && formTeamBId !== effectiveTeamAId && eligibleTeams.some((t) => t.id === formTeamBId)) {
      return formTeamBId;
    }
    return eligibleTeams.find((t) => t.id !== effectiveTeamAId)?.id || eligibleTeams[1]?.id || "";
  }, [eligibleTeams, formTeamBId, effectiveTeamAId]);

  // Open New Match with auto-numbered matchNo
  const openNewMatch = () => {
    setEditingMatch(null);
    const maxNo = matches.reduce((max, m) => Math.max(max, m.matchNo || 0), 0);
    setFormMatchNo(maxNo + 1);
    setFormSport("cricket");
    setFormCategory("men");
    setFormRound("Group Stage");
    const cricketGroups = allGroupsList.filter((g) => g.sportId === "cricket");
    setFormGroupId(cricketGroups[0]?.id || "");
    setFormTeamAId("");
    setFormTeamBId("");
    setFormDate("2026-10-27");
    setFormTime("09:30");
    setFormVenue("Main Cricket Ground");
    setFormStatus("Scheduled");
    setFormNotes("");
    setIsEditorOpen(true);
  };

  // Open Edit Match
  const openEditMatch = (m: Match) => {
    setEditingMatch(m);
    setFormMatchNo(m.matchNo);
    setFormSport(m.sportId);
    setFormCategory(m.category);
    setFormRound(m.round as MatchRound);
    setFormGroupId(m.groupId || "");
    setFormTeamAId(m.teamAId);
    setFormTeamBId(m.teamBId);
    // scheduledAt comes back from Supabase in UTC; the form edits IST (saved with +05:30)
    const { date: d, time: t } = m.scheduledAt
      ? toIstDateTimeParts(m.scheduledAt)
      : { date: "2026-10-27", time: "09:30" };
    setFormDate(d);
    setFormTime(t);
    setFormVenue(m.venue);
    setFormStatus(m.status);
    setFormNotes(m.notes || "");
    setIsEditorOpen(true);
  };

  // Duplicate Match
  const handleDuplicate = async (m: Match) => {
    const maxNo = matches.reduce((max, cur) => Math.max(max, cur.matchNo || 0), 0);
    const dup: Match = {
      ...m,
      id: "",
      matchNo: maxNo + 1,
      status: "Scheduled",
      scoreText: undefined,
      resultText: undefined,
      scoreSummary: undefined,
      isWalkover: false,
      scoreDetails: undefined,
      winnerId: undefined,
      winnerName: undefined,
      motmPlayerId: undefined,
      motmPlayerName: undefined,
      motmCampus: undefined,
      motmNote: undefined,
      playerStats: [],
    };
    try {
      const res = await saveMatch(dup);
      if (res?.error) {
        console.error("Duplicate match error:", res.error);
        showToast(res.error, "error");
        return;
      }
      const updated = await fetchMatches();
      setMatches(updated);
      showToast(`Duplicated Match #${m.matchNo} as #${dup.matchNo}`);
    } catch (err: unknown) {
      console.error("handleDuplicate exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to duplicate match", "error");
    }
  };

  // Save Match Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const actualTeamAId = effectiveTeamAId;
    const actualTeamBId = effectiveTeamBId;

    if (!actualTeamAId || !actualTeamBId) {
      showToast("Please select two teams", "error");
      return;
    }

    if (actualTeamAId === actualTeamBId) {
      showToast("Team A and Team B cannot be the same squad", "error");
      return;
    }

    const teamA = teams.find((t) => t.id === actualTeamAId);
    const teamB = teams.find((t) => t.id === actualTeamBId);

    const matchData: Match = {
      id: editingMatch?.id || "",
      edition: "2026-27",
      sportId: formSport,
      category: formCategory,
      matchNo: Number(formMatchNo),
      round: formRound,
      groupId: formRound === "Group Stage" && effectiveGroupId ? effectiveGroupId : undefined,
      teamAId: actualTeamAId,
      teamBId: actualTeamBId,
      teamAName: teamA?.name || "Team A",
      teamBName: teamB?.name || "Team B",
      teamAShortCode: teamA?.campusId.toUpperCase() || "MUM",
      teamBShortCode: teamB?.campusId.toUpperCase() || "SHI",
      venue: formVenue,
      scheduledAt: `${formDate}T${formTime}:00+05:30`,
      status: formStatus,
      notes: formNotes,
      scoreText: editingMatch?.scoreText,
      scoreDetails: editingMatch?.scoreDetails,
      winnerId: editingMatch?.winnerId,
      winnerName: editingMatch?.winnerName,
      isWalkover: editingMatch?.isWalkover,
      motmPlayerId: editingMatch?.motmPlayerId,
      motmPlayerName: editingMatch?.motmPlayerName,
      motmCampus: editingMatch?.motmCampus,
      motmNote: editingMatch?.motmNote,
      playerStats: editingMatch?.playerStats || [],
    };

    try {
      const res = await saveMatch(matchData);
      if (res?.error) {
        console.error("saveMatch error:", res.error);
        showToast(res.error, "error");
        return;
      }
      const updated = await fetchMatches();
      setMatches(updated);
      setIsEditorOpen(false);
      showToast(`Fixture #${matchData.matchNo} saved successfully!`);
    } catch (err: unknown) {
      console.error("handleSaveForm exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to save match", "error");
    }
  };

  // Delete Match
  const handleDelete = async (id: string, matchNo: number) => {
    if (confirm(`Are you sure you want to delete fixture #${matchNo}?`)) {
      try {
        const res = await deleteMatch(id);
        if (res?.error) {
          console.error("deleteMatch error:", res.error);
          showToast(res.error, "error");
          return;
        }
        const updated = await fetchMatches();
        setMatches(updated);
        showToast(`Deleted fixture #${matchNo}`);
      } catch (err: unknown) {
        console.error("handleDelete exception:", err);
        showToast(err instanceof Error ? err.message : "Failed to delete fixture", "error");
      }
    }
  };

  // CSV Bulk Import
  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        showToast("CSV file is empty", "error");
        return;
      }

      // Expected format: sport,category,round,matchNo,teamAShortCode,teamBShortCode,date,time,venue
      const matchesToImport: Partial<Match>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const [sport, category, round, matchNo, teamACode, teamBCode, date, time, venue] = lines[i]
          .split(",")
          .map((s) => s.trim());

        if (sport && teamACode && teamBCode) {
          const tA = teams.find(
            (t) =>
              t.sportId === sport &&
              t.category === category &&
              t.campusId.toLowerCase() === teamACode.toLowerCase()
          );
          const tB = teams.find(
            (t) =>
              t.sportId === sport &&
              t.category === category &&
              t.campusId.toLowerCase() === teamBCode.toLowerCase()
          );

          if (tA && tB) {
            matchesToImport.push({
              edition: "2026-27",
              sportId: sport as SportType,
              category: (category as CategoryGender) || "men",
              matchNo: Number(matchNo) || i,
              round: (round as MatchRound) || "Group A",
              teamAId: tA.id,
              teamBId: tB.id,
              teamAName: tA.name,
              teamBName: tB.name,
              teamAShortCode: tA.campusId.toUpperCase(),
              teamBShortCode: tB.campusId.toUpperCase(),
              scheduledAt: `${date || "2026-10-27"}T${time || "10:00"}:00+05:30`,
              venue: venue || "Main Ground",
              status: "Scheduled",
              playerStats: [],
            });
          }
        }
      }

      if (matchesToImport.length > 0) {
        try {
          const res = await bulkImportMatchesAction(matchesToImport);
          const updated = await fetchMatches();
          setMatches(updated);
          if (!res.success) {
            showToast(res.error || "Failed to import fixtures", "error");
            return;
          }
          showToast(`Bulk imported ${matchesToImport.length} fixtures from CSV!`);
        } catch (err: unknown) {
          showToast(err instanceof Error ? err.message : "Failed to import fixtures", "error");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (filterSport !== "all" && m.sportId !== filterSport) return false;
      if (filterCategory !== "all" && m.category !== filterCategory) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (
        searchQuery &&
        !m.teamAName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !m.teamBName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [matches, filterSport, filterCategory, filterStatus, searchQuery]);

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
              Fixtures & Scheduling
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Schedule Matches
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Add new fixtures with group-filtered teams, duplicate existing matches, or bulk import schedules via CSV.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <label className="px-4 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-gold" />
              <span>Bulk CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkImport}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={openNewMatch}
              className="px-5 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Match</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campus team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
              />
            </div>

            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
            >
              <option value="all">All Sports</option>
              {SPORTS_CONFIG.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Postponed">Postponed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <span className="text-xs text-gold/80 font-mono">
            {filteredMatches.length} Fixtures Found
          </span>
        </div>

        {/* Matches Table */}
        <div className="overflow-x-auto rounded-2xl border border-[rgba(217,178,111,0.2)] bg-[#161A40]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#20255A] text-gold uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Match</th>
                <th className="p-4">Sport / Cat</th>
                <th className="p-4">Round</th>
                <th className="p-4">Teams</th>
                <th className="p-4">Date & Venue</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,178,111,0.1)]">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#AEB3D6] italic">
                    No fixtures found matching filters. Click &quot;Add Match&quot; to schedule a fixture.
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-[#20255A]/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-gold">#{m.matchNo}</td>
                    <td className="p-4">
                      <span className="font-semibold text-[#F4EFE3] block capitalize">
                        {m.sportId}
                      </span>
                      <span className="text-[10px] text-[#AEB3D6] uppercase">
                        {m.category}
                      </span>
                    </td>
                    <td className="p-4 text-gold-light font-medium">{m.round}</td>
                    <td className="p-4 font-semibold text-[#F4EFE3]">
                      {m.teamAShortCode} vs {m.teamBShortCode}
                    </td>
                    <td className="p-4 text-[#AEB3D6]">
                      <span className="block font-mono">
                        {new Date(m.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          timeZone: IST_TIME_ZONE,
                        })} · {new Date(m.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: IST_TIME_ZONE })}
                      </span>
                      <span className="text-[11px] truncate max-w-[140px] block text-gold/80">
                        {m.venue}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === "Completed"
                            ? "bg-success/20 text-success border border-success/40"
                            : m.status === "Postponed"
                            ? "bg-warning/20 text-warning border border-warning/40"
                            : m.status === "Cancelled"
                            ? "bg-red-950 text-red-400 border border-red-500/30"
                            : "bg-[#20255A] text-gold border border-gold/30"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(m)}
                        className="p-1.5 rounded-lg bg-[#20255A] text-gold hover:bg-gold hover:text-indigo-black transition-colors"
                        title="Duplicate Match"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditMatch(m)}
                        className="p-1.5 rounded-lg bg-[#20255A] text-gold hover:bg-gold hover:text-indigo-black transition-colors"
                        title="Edit Match"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, m.matchNo)}
                        className="p-1.5 rounded-lg bg-[#20255A] text-red-400 hover:bg-red-950 transition-colors"
                        title="Delete Match"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ADD / EDIT MATCH MODAL strictly per Part 1C */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 bg-[#0F122E]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="text-xl font-serif font-black uppercase text-gold">
                  {editingMatch ? `Edit Match #${editingMatch.matchNo}` : "Schedule New Fixture"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-gold hover:bg-[#20255A] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                {/* 1. Sport then Category (only valid ones) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Sport
                    </label>
                    <select
                      value={formSport}
                      onChange={(e) => {
                        const nextSport = e.target.value as SportType;
                        setFormSport(nextSport);
                        const sp = SPORTS_CONFIG.find((s) => s.slug === nextSport);
                        if (!sp?.hasWomen && formCategory === "women") {
                          setFormCategory("men");
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      {SPORTS_CONFIG.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as CategoryGender)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      <option value="men">Men</option>
                      {SPORTS_CONFIG.find((s) => s.slug === formSport)?.hasWomen && (
                        <option value="women">Women</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* 2. Round & Group & Auto-Match No */}
                <div className={`grid ${formRound === "Group Stage" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"} gap-4`}>
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Round
                    </label>
                    <select
                      value={formRound}
                      onChange={(e) => setFormRound(e.target.value as MatchRound)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      <option value="Group Stage">Group Stage</option>
                      <option value="Group A">Group A</option>
                      <option value="Group B">Group B</option>
                      <option value="League">League</option>
                      <option value="Quarter-Final">Quarter-Final</option>
                      <option value="Semi-Final">Semi-Final</option>
                      <option value="3rd Place">3rd Place</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>

                  {formRound === "Group Stage" && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Group / Pool
                      </label>
                      <select
                        value={effectiveGroupId}
                        onChange={(e) => setFormGroupId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold focus:outline-none"
                      >
                        <option value="">-- All Groups --</option>
                        {categoryGroups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Match No. (Auto-Numbered)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formMatchNo}
                      onChange={(e) => setFormMatchNo(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. Team A and Team B (Filtered by group when round is Group A or Group B) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Team A {formRound.startsWith("Group") ? `(${formRound})` : ""}
                    </label>
                    <select
                      value={effectiveTeamAId}
                      onChange={(e) => setFormTeamAId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      {eligibleTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Team B {formRound.startsWith("Group") ? `(${formRound})` : ""}
                    </label>
                    <select
                      value={effectiveTeamBId}
                      onChange={(e) => setFormTeamBId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      {eligibleTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Date (27–31 Oct 2026), Time, Venue/Court */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Date (27–31 Oct)
                    </label>
                    <select
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      {TOURNAMENT_DAYS.map((d) => (
                        <option key={d.date} value={d.date}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Time (IST)
                    </label>
                    <input
                      type="time"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Venue / Court
                    </label>
                    <input
                      type="text"
                      required
                      value={formVenue}
                      onChange={(e) => setFormVenue(e.target.value)}
                      placeholder="e.g. Court 1 / Main Ground"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Status & Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as MatchStatus)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Match Notes
                    </label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. Floodlit evening session"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3 border-t border-[rgba(217,178,111,0.15)]">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full btn-gold text-xs font-bold uppercase shadow-gold-glow"
                  >
                    Save Fixture
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

export default function AdminMatchesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif">
          Loading Fixtures...
        </div>
      }
    >
      <MatchesAdminContent />
    </Suspense>
  );
}

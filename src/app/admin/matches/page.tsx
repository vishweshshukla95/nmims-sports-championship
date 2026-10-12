"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Plus,
  Copy,
  Upload,
  FileSpreadsheet,
  Award,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  X,
  Search,
  Filter,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  SPORTS_CONFIG,
  CAMPUSES_CONFIG,
  TOURNAMENT_DAYS,
  TOURNAMENT_CONFIG,
} from "@/config/tournament";
import {
  getMatches,
  saveMatch,
  deleteMatch,
  getSeededTeams,
} from "@/lib/tournament-store";
import {
  Match,
  SportType,
  CategoryGender,
  MatchRound,
  MatchStatus,
} from "@/types/tournament";

function MatchesAdminContent() {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get("action");

  const [matches, setMatches] = useState<Match[]>(() => getMatches());
  const seededTeams = useMemo(() => getSeededTeams(), []);

  // Filter state
  const [filterSport, setFilterSport] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal State
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(initialAction === "new");
  const [activeEditorTab, setActiveEditorTab] = useState<
    "details" | "result" | "stats" | "motm"
  >("details");

  // Form fields
  const [formSport, setFormSport] = useState<SportType>("cricket");
  const [formCategory, setFormCategory] = useState<CategoryGender>("men");
  const [formRound, setFormRound] = useState<MatchRound>("League");
  const [formMatchNo, setFormMatchNo] = useState(1);
  const [formTeamA, setFormTeamA] = useState("mum");
  const [formTeamB, setFormTeamB] = useState("shi");
  const [formPlayerA, setFormPlayerA] = useState("");
  const [formPlayerB, setFormPlayerB] = useState("");
  const [formDate, setFormDate] = useState("2026-10-27");
  const [formTime, setFormTime] = useState("09:30");
  const [formVenue, setFormVenue] = useState("Main Ground");
  const [formStatus, setFormStatus] = useState<MatchStatus>("Scheduled");
  const [formNotes, setFormNotes] = useState("");

  // Result fields
  const [resultScoreA, setResultScoreA] = useState("");
  const [resultScoreB, setResultScoreB] = useState("");
  const [resultWinner, setResultWinner] = useState("");
  const [resultText, setResultText] = useState("");

  // MOTM fields
  const [motmPlayerName, setMotmPlayerName] = useState("");
  const [motmCampus, setMotmCampus] = useState("MUM");
  const [motmNote, setMotmNote] = useState("");

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (filterSport !== "all" && m.sportId !== filterSport) return false;
      if (filterCategory !== "all" && m.category !== filterCategory) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (filterDay !== "all" && !m.scheduledAt.startsWith(filterDay)) return false;
      if (
        searchQuery &&
        !m.teamAName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !m.teamBName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [matches, filterSport, filterCategory, filterStatus, filterDay, searchQuery]);

  const openNewMatch = () => {
    setEditingMatch(null);
    setFormSport("cricket");
    setFormCategory("men");
    setFormRound("League");
    setFormMatchNo(matches.length + 1);
    setFormTeamA("mum");
    setFormTeamB("shi");
    setFormPlayerA("");
    setFormPlayerB("");
    setFormDate("2026-10-27");
    setFormTime("09:30");
    setFormVenue("Central Sports Arena");
    setFormStatus("Scheduled");
    setFormNotes("");
    setResultScoreA("");
    setResultScoreB("");
    setResultWinner("");
    setResultText("");
    setMotmPlayerName("");
    setMotmCampus("MUM");
    setMotmNote("");
    setActiveEditorTab("details");
    setIsEditorOpen(true);
  };

  const openEditMatch = (m: Match) => {
    setEditingMatch(m);
    setFormSport(m.sportId);
    setFormCategory(m.category);
    setFormRound(m.round);
    setFormMatchNo(m.matchNo);
    setFormTeamA(m.teamAShortCode.toLowerCase());
    setFormTeamB(m.teamBShortCode.toLowerCase());
    setFormPlayerA(m.playerAName || "");
    setFormPlayerB(m.playerBName || "");
    const dateObj = new Date(m.scheduledAt);
    setFormDate(m.scheduledAt.slice(0, 10));
    setFormTime(
      dateObj.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    );
    setFormVenue(m.venue);
    setFormStatus(m.status);
    setFormNotes(m.notes || "");
    setResultText(m.resultText || "");
    setResultWinner(m.winnerId || "");
    setMotmPlayerName(m.motmPlayerName || "");
    setMotmCampus(m.motmCampusCode || "MUM");
    setMotmNote(m.motmNote || "");
    setActiveEditorTab("details");
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    const campusA = CAMPUSES_CONFIG.find(
      (c) => c.shortCode.toLowerCase() === formTeamA.toLowerCase() || c.id === formTeamA
    ) || CAMPUSES_CONFIG[0];

    const campusB = CAMPUSES_CONFIG.find(
      (c) => c.shortCode.toLowerCase() === formTeamB.toLowerCase() || c.id === formTeamB
    ) || CAMPUSES_CONFIG[1];

    const newMatch: Match = {
      id: editingMatch?.id || `match-${Date.now()}`,
      edition: "2026-27",
      sportId: formSport,
      category: formCategory,
      matchNo: Number(formMatchNo),
      round: formRound,
      teamAId: `${campusA.shortCode.toLowerCase()}-${formSport}-${formCategory}`,
      teamAName: `${campusA.name}`,
      teamAShortCode: campusA.shortCode,
      teamBId: `${campusB.shortCode.toLowerCase()}-${formSport}-${formCategory}`,
      teamBName: `${campusB.name}`,
      teamBShortCode: campusB.shortCode,
      playerAName: formPlayerA || undefined,
      playerBName: formPlayerB || undefined,
      scheduledAt: `${formDate}T${formTime}:00+05:30`,
      venue: formVenue,
      status: formStatus,
      winnerId: resultWinner || undefined,
      resultText: resultText || undefined,
      notes: formNotes || undefined,
      motmPlayerName: motmPlayerName || undefined,
      motmCampusCode: motmCampus || undefined,
      motmNote: motmNote || undefined,
    };

    saveMatch(newMatch);
    setMatches(getMatches());
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this fixture?")) {
      deleteMatch(id);
      setMatches(getMatches());
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(217,178,111,0.2)]">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-gold">
              Fixtures & Outcomes
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Schedule & Results Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Add matches, enter completed scorecards, assign Man of the Match awards, and manage schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openNewMatch}
              className="px-5 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Match</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-gold absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campus team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none focus:border-gold"
              />
            </div>

            {/* Sport Filter */}
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold"
            >
              <option value="all">All Sports</option>
              {SPORTS_CONFIG.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-gold font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Postponed">Postponed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <span className="text-xs text-gold/80 font-mono">
            {filteredMatches.length} Matches Found
          </span>
        </div>

        {/* Match Table */}
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
                    No fixtures found. Click &quot;Add Match&quot; to schedule the first match.
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
                    <td className="p-4 text-gold-light">{m.round}</td>
                    <td className="p-4 font-semibold text-[#F4EFE3]">
                      {m.teamAShortCode} vs {m.teamBShortCode}
                    </td>
                    <td className="p-4 text-[#AEB3D6]">
                      <span className="block font-mono">
                        {new Date(m.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="text-[11px] truncate max-w-[120px] block">
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
                            : "bg-[#20255A] text-gold border border-gold/30"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEditMatch(m)}
                        className="p-1.5 rounded-lg bg-[#20255A] text-gold hover:bg-gold hover:text-indigo-black transition-colors"
                        title="Edit Match & Result"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg bg-[#20255A] text-red-400 hover:bg-red-900 transition-colors"
                        title="Delete Match"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ADD / EDIT MATCH MODAL with 4 TABS: Details · Result · Stats · MOTM */}
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 bg-[#0F122E]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)]">
                <h3 className="text-xl font-serif font-black uppercase text-gold">
                  {editingMatch ? `Edit Match #${editingMatch.matchNo}` : "Add New Fixture"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-gold hover:bg-[#20255A] rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Tabs Inside Editor */}
              <div className="flex items-center gap-2 my-4 border-b border-[rgba(217,178,111,0.15)] pb-2 overflow-x-auto">
                {(
                  [
                    { id: "details", label: "Details" },
                    { id: "result", label: "Result" },
                    { id: "stats", label: "Player Stats" },
                    { id: "motm", label: "Man of the Match" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveEditorTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeEditorTab === tab.id
                        ? "bg-gold text-indigo-black shadow-md"
                        : "bg-[#0F122E] text-[#AEB3D6]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: DETAILS */}
              {activeEditorTab === "details" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Sport
                      </label>
                      <select
                        value={formSport}
                        onChange={(e) => setFormSport(e.target.value as SportType)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
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
                        onChange={(e) =>
                          setFormCategory(e.target.value as CategoryGender)
                        }
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      >
                        <option value="men">Men</option>
                        {SPORTS_CONFIG.find((s) => s.slug === formSport)?.hasWomen && (
                          <option value="women">Women</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Match Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formMatchNo}
                        onChange={(e) => setFormMatchNo(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Tournament Round
                      </label>
                      <select
                        value={formRound}
                        onChange={(e) => setFormRound(e.target.value as MatchRound)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      >
                        <option value="League">League</option>
                        <option value="Group Stage">Group Stage</option>
                        <option value="Quarter-Final">Quarter-Final</option>
                        <option value="Semi-Final">Semi-Final</option>
                        <option value="3rd Place">3rd Place</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Team A (Campus)
                      </label>
                      <select
                        value={formTeamA}
                        onChange={(e) => setFormTeamA(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      >
                        {CAMPUSES_CONFIG.map((c) => (
                          <option key={c.shortCode} value={c.shortCode.toLowerCase()}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Team B (Campus)
                      </label>
                      <select
                        value={formTeamB}
                        onChange={(e) => setFormTeamB(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      >
                        {CAMPUSES_CONFIG.map((c) => (
                          <option key={c.shortCode} value={c.shortCode.toLowerCase()}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Date (27–31 Oct 2026)
                      </label>
                      <input
                        type="date"
                        min="2026-10-27"
                        max="2026-10-31"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Time (IST)
                      </label>
                      <input
                        type="time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                        Venue / Court
                      </label>
                      <input
                        type="text"
                        value={formVenue}
                        onChange={(e) => setFormVenue(e.target.value)}
                        placeholder="Ground 1 / Court A"
                        className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as MatchStatus)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Postponed">Postponed</option>
                      <option value="Completed">Completed</option>
                      <option value="Walkover">Walkover</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 2: RESULT */}
              {activeEditorTab === "result" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div className="p-4 rounded-xl bg-[#20255A] text-xs text-gold">
                    Entering a result automatically marks this match as Completed.
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Official Result Headline
                    </label>
                    <input
                      type="text"
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                      placeholder="e.g. NMIMS Mumbai won by 4 runs"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Winning Campus / Team
                    </label>
                    <select
                      value={resultWinner}
                      onChange={(e) => setResultWinner(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    >
                      <option value="">Select Winner</option>
                      <option value={`${formTeamA}-${formSport}-${formCategory}`}>
                        {formTeamA.toUpperCase()} (Team A)
                      </option>
                      <option value={`${formTeamB}-${formSport}-${formCategory}`}>
                        {formTeamB.toUpperCase()} (Team B)
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: STATS */}
              {activeEditorTab === "stats" && (
                <div className="p-6 rounded-2xl bg-[#0F122E] border border-[rgba(217,178,111,0.2)] text-center space-y-2">
                  <span className="text-xs font-mono font-bold text-gold">
                    Spreadsheet Player Stats Grid
                  </span>
                  <p className="text-xs text-[#AEB3D6]">
                    To enter ball-by-ball or player stats for this match, use the dedicated Player Stats tab from the admin navigation menu.
                  </p>
                </div>
              )}

              {/* TAB 4: MAN OF THE MATCH */}
              {activeEditorTab === "motm" && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Awardee Athlete Name
                    </label>
                    <input
                      type="text"
                      value={motmPlayerName}
                      onChange={(e) => setMotmPlayerName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Campus Code
                    </label>
                    <select
                      value={motmCampus}
                      onChange={(e) => setMotmCampus(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    >
                      {CAMPUSES_CONFIG.map((c) => (
                        <option key={c.shortCode} value={c.shortCode}>
                          {c.shortCode} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#AEB3D6] uppercase mb-1">
                      Performance Summary Note
                    </label>
                    <input
                      type="text"
                      value={motmNote}
                      onChange={(e) => setMotmNote(e.target.value)}
                      placeholder="e.g. 52 (31) & 2/18"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                </div>
              )}

              {/* Footer Save */}
              <div className="pt-6 mt-6 border-t border-[rgba(217,178,111,0.2)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#AEB3D6] hover:bg-[#20255A]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Fixture</span>
                </button>
              </div>
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
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif text-lg">
          Loading Schedule Manager...
        </div>
      }
    >
      <MatchesAdminContent />
    </Suspense>
  );
}

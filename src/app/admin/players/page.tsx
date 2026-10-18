"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Upload,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchTeams } from "@/lib/tournament-store";
import {
  getPlayersAction,
  upsertPlayerAction,
  deletePlayerAction,
  bulkImportPlayersAction,
} from "@/app/actions/tournament";
import { Team, Player } from "@/types/tournament";

export default function AdminPlayersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmPlayer, setDeleteConfirmPlayer] = useState<Player | null>(null);

  // Active player form
  const [activePlayer, setActivePlayer] = useState<Partial<Player>>({
    name: "",
    jerseyNo: 7,
    role: "Player",
    isCaptain: false,
    isWk: false,
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPlayersForTeam = async (teamId: string) => {
    if (!teamId) return;
    try {
      const p = await getPlayersAction(teamId);
      setPlayers(p);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetchTeams().then((loaded) => {
      if (!ignore) {
        setTeams(loaded);
        setSelectedTeamId((prev) => (prev ? prev : (loaded[0]?.id || "")));
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (selectedTeamId) {
      getPlayersAction(selectedTeamId)
        .then((p) => {
          if (!ignore) {
            setPlayers(p);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
    return () => {
      ignore = true;
    };
  }, [selectedTeamId]);

  const currentTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) || teams[0],
    [teams, selectedTeamId]
  );

  // Download CSV Template
  const handleDownloadTemplate = () => {
    const csvHeader = "Name,JerseyNo,Role,IsCaptain,IsWk\n";
    const sampleRows =
      "Aarav Patel,18,Batsman,Yes,No\nRohan Sharma,7,Bowler,No,No\nKaran Verma,1,Wicketkeeper,No,Yes\n";
    const blob = new Blob([csvHeader + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `squad_template_${currentTeam?.campusId}_${currentTeam?.sportId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded CSV roster template");
  };

  // CSV Import
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTeam) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) {
        showToast("CSV file is empty or invalid", "error");
        return;
      }

      // Skip header
      const importedPlayers: Array<{ name: string; jerseyNo?: number; role?: string; isCaptain?: boolean; isWk?: boolean }> = [];
      for (let i = 1; i < lines.length; i++) {
        const [name, jerseyNo, role, isCaptain, isWk] = lines[i].split(",").map((s) => s.trim());
        if (name) {
          importedPlayers.push({
            name,
            jerseyNo: Number(jerseyNo) || i,
            role: role || "Player",
            isCaptain: isCaptain?.toLowerCase() === "yes" || isCaptain?.toLowerCase() === "true",
            isWk: isWk?.toLowerCase() === "yes" || isWk?.toLowerCase() === "true",
          });
        }
      }

      if (importedPlayers.length > 0) {
        try {
          const res = await bulkImportPlayersAction(currentTeam.id, importedPlayers);
          if (res?.error) {
            console.error("bulkImportPlayersAction error:", res.error);
            showToast(res.error, "error");
            return;
          }
          await loadPlayersForTeam(currentTeam.id);
          showToast(`Imported ${importedPlayers.length} players to ${currentTeam.name}!`);
        } catch (err: unknown) {
          console.error("bulkImportPlayersAction exception:", err);
          showToast(err instanceof Error ? err.message : "Failed to import players", "error");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Add Player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlayer.name || !currentTeam) return;

    try {
      const res = await upsertPlayerAction({
        teamId: currentTeam.id,
        name: activePlayer.name,
        jerseyNo: Number(activePlayer.jerseyNo) || 1,
        role: activePlayer.role || "Player",
        isCaptain: Boolean(activePlayer.isCaptain),
        isWk: Boolean(activePlayer.isWk),
      });
      if (res?.error) {
        console.error("upsertPlayerAction error:", res.error);
        showToast(res.error, "error");
        return;
      }
      await loadPlayersForTeam(currentTeam.id);
      setAddModalOpen(false);
      showToast(`Added ${activePlayer.name} to ${currentTeam.name}`);
    } catch (err: unknown) {
      console.error("upsertPlayerAction exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to add player", "error");
    }
  };

  // Edit Player
  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlayer.id || !activePlayer.name || !currentTeam) return;

    try {
      const res = await upsertPlayerAction({
        id: activePlayer.id,
        teamId: currentTeam.id,
        name: activePlayer.name,
        jerseyNo: Number(activePlayer.jerseyNo) || 1,
        role: activePlayer.role || "Player",
        isCaptain: Boolean(activePlayer.isCaptain),
        isWk: Boolean(activePlayer.isWk),
      });
      if (res?.error) {
        console.error("upsertPlayerAction update error:", res.error);
        showToast(res.error, "error");
        return;
      }
      await loadPlayersForTeam(currentTeam.id);
      setEditModalOpen(false);
      showToast(`Updated player ${activePlayer.name}`);
    } catch (err: unknown) {
      console.error("upsertPlayerAction update exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to update player", "error");
    }
  };

  // Delete Player
  const handleDeletePlayer = async (player: Player) => {
    if (!currentTeam) return;

    try {
      const res = await deletePlayerAction(player.id);
      if (res?.error) {
        console.error("deletePlayerAction error:", res.error);
        showToast(res.error, "error");
        return;
      }
      await loadPlayersForTeam(currentTeam.id);
      setDeleteConfirmPlayer(null);
      showToast(`Removed ${player.name} from roster`);
    } catch (err: unknown) {
      console.error("deletePlayerAction exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to remove player", "error");
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
              Squad Rosters
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Players Manager
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Add, edit, and delete players per team, or bulk import squads via CSV template.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-4 py-2.5 rounded-full btn-royal text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-gold" />
              <span>CSV Template</span>
            </button>

            <label className="px-4 py-2.5 rounded-full btn-outline-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-gold" />
              <span>Import CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvImport}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setActivePlayer({
                  name: "",
                  jerseyNo: (players.length || 0) + 1,
                  role: "Player",
                  isCaptain: false,
                  isWk: false,
                });
                setAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-gold-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Player</span>
            </button>
          </div>
        </div>

        {/* Team Selector Toolbar */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-mono uppercase text-gold font-bold whitespace-nowrap">
              Select Team:
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-semibold focus:outline-none w-full sm:w-80"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-mono text-[#AEB3D6]">
            Roster: <strong>{players.length}</strong> / {currentTeam?.squadSize || 12} Registered
          </div>
        </div>

        {/* Players Table */}
        <div className="card-championship bg-[#161A40]/90 border border-gold/30 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-[#20255A]/50 border-b border-gold/20 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-gold">
              {currentTeam?.name} Squad Roster
            </h3>
            <span className="text-xs font-mono text-gold-light/80">
              {players.length} Athletes
            </span>
          </div>

          {players.length === 0 ? (
            <div className="p-16 text-center text-xs sm:text-sm text-[#AEB3D6] italic">
              No players added yet for this squad. Click &quot;Add Player&quot; or &quot;Import CSV&quot; to populate.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[rgba(217,178,111,0.15)] bg-[#0F122E]/80 text-[11px] font-mono uppercase text-gold tracking-wider">
                    <th className="py-3 px-4 text-center w-14"># No</th>
                    <th className="py-3 px-4">Player Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4 text-center">Designations</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(217,178,111,0.08)]">
                  {players.map((p) => (
                    <tr key={p.id} className="hover:bg-[#20255A]/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-gold">
                        {p.jerseyNo}
                      </td>
                      <td className="py-3 px-4 font-serif font-bold text-sm text-[#F4EFE3]">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-[#AEB3D6] font-mono">
                        {p.role}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.isCaptain && (
                            <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 text-[10px] font-bold">
                              Captain (C)
                            </span>
                          )}
                          {p.isWk && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-400/40 text-[10px] font-bold">
                              WK / Libero
                            </span>
                          )}
                          {!p.isCaptain && !p.isWk && (
                            <span className="text-[10px] text-[#AEB3D6]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePlayer({ ...p });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gold hover:bg-[#20255A]"
                            title="Edit Player"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPlayer(p)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40"
                            title="Delete Player"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: ADD PLAYER */}
        {addModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="font-serif font-bold text-lg text-gold">Add Player</h3>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 text-[#AEB3D6] hover:text-[#F4EFE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPlayer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    required
                    value={activePlayer.name || ""}
                    onChange={(e) => setActivePlayer({ ...activePlayer, name: e.target.value })}
                    placeholder="e.g. Aarav Patel"
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                      Jersey No
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="99"
                      value={activePlayer.jerseyNo || 7}
                      onChange={(e) => setActivePlayer({ ...activePlayer, jerseyNo: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={activePlayer.role || "Player"}
                      onChange={(e) => setActivePlayer({ ...activePlayer, role: e.target.value })}
                      placeholder="e.g. Batsman, Striker"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#F4EFE3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activePlayer.isCaptain}
                      onChange={(e) => setActivePlayer({ ...activePlayer, isCaptain: e.target.checked })}
                      className="rounded border-gold/40 text-gold focus:ring-0"
                    />
                    <span>Is Captain</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#F4EFE3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activePlayer.isWk}
                      onChange={(e) => setActivePlayer({ ...activePlayer, isWk: e.target.checked })}
                      className="rounded border-gold/40 text-gold focus:ring-0"
                    />
                    <span>Is WK / Libero</span>
                  </label>
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
                    Save Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT PLAYER */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-gold/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(217,178,111,0.2)] mb-4">
                <h3 className="font-serif font-bold text-lg text-gold">Edit Player</h3>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 text-[#AEB3D6] hover:text-[#F4EFE3]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdatePlayer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    required
                    value={activePlayer.name || ""}
                    onChange={(e) => setActivePlayer({ ...activePlayer, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                      Jersey No
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="99"
                      value={activePlayer.jerseyNo || 7}
                      onChange={(e) => setActivePlayer({ ...activePlayer, jerseyNo: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#AEB3D6] mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={activePlayer.role || "Player"}
                      onChange={(e) => setActivePlayer({ ...activePlayer, role: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#F4EFE3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activePlayer.isCaptain}
                      onChange={(e) => setActivePlayer({ ...activePlayer, isCaptain: e.target.checked })}
                      className="rounded border-gold/40 text-gold focus:ring-0"
                    />
                    <span>Is Captain</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#F4EFE3] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activePlayer.isWk}
                      onChange={(e) => setActivePlayer({ ...activePlayer, isWk: e.target.checked })}
                      className="rounded border-gold/40 text-gold focus:ring-0"
                    />
                    <span>Is WK / Libero</span>
                  </label>
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
                    Update Player
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION */}
        {deleteConfirmPlayer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161A40] border-2 border-red-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-gold">Remove Player</h3>
              <p className="text-xs text-[#AEB3D6] mt-2">
                Are you sure you want to remove <strong>{deleteConfirmPlayer.name}</strong> from {currentTeam?.name}?
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmPlayer(null)}
                  className="flex-1 py-2.5 rounded-full btn-royal text-xs font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlayer(deleteConfirmPlayer)}
                  className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase shadow-md"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

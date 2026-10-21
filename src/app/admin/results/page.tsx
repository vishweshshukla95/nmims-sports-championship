"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Award,
  Plus,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchMatches, saveMatch } from "@/lib/tournament-store";
import { Match, MatchPlayerStat } from "@/types/tournament";

function ResultsAdminContent() {
  const searchParams = useSearchParams();
  const preselectedMatchId = searchParams.get("matchId");

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let ignore = false;
    fetchMatches().then((list) => {
      if (!ignore) {
        setMatches(list);
        if (preselectedMatchId) {
          setSelectedMatchId(preselectedMatchId);
        } else if (list.length > 0) {
          setSelectedMatchId((prev) => prev || list[0].id);
        }
      }
    });
    return () => {
      ignore = true;
    };
  }, [preselectedMatchId]);

  const currentMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId),
    [matches, selectedMatchId]
  );

  const handleSaveResult = async (updatedMatch: Match) => {
    try {
      const res = await saveMatch(updatedMatch);
      if (res?.error) {
        console.error("declareResult error:", res.error);
        showToast(res.error, "error");
        return;
      }
      const updated = await fetchMatches();
      setMatches(updated);
      showToast(`Result for Match #${updatedMatch.matchNo} successfully declared and completed!`);
    } catch (err: unknown) {
      console.error("declareResult exception:", err);
      showToast(err instanceof Error ? err.message : "Failed to declare match result", "error");
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
              Outcome Declaration
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-black uppercase text-gold-light mt-1">
              Declare Match Results
            </h1>
            <p className="text-xs text-[#AEB3D6] mt-0.5">
              Enter official scorecards, verify winners, record Man of the Match awards, and update points tables.
            </p>
          </div>
        </div>

        {/* Match Picker Toolbar */}
        <div className="p-4 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <label className="text-xs font-mono uppercase text-gold font-bold whitespace-nowrap">
              Select Match:
            </label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-semibold focus:outline-none w-full sm:max-w-xl"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  #{m.matchNo} · {m.sportId.toUpperCase()} ({m.category}) · {m.round} · {m.teamAShortCode} vs {m.teamBShortCode} [{m.status}]
                </option>
              ))}
            </select>
          </div>

          {currentMatch && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                currentMatch.status === "Completed"
                  ? "bg-success/20 text-success border border-success/40"
                  : "bg-gold/15 text-gold border border-gold/30"
              }`}
            >
              Status: {currentMatch.status}
            </span>
          )}
        </div>

        {currentMatch ? (
          <MatchResultEditor
            key={currentMatch.id}
            match={currentMatch}
            onSave={handleSaveResult}
            showToast={showToast}
          />
        ) : (
          <div className="p-16 rounded-2xl bg-[#161A40]/40 border border-[rgba(217,178,111,0.2)] text-center text-xs sm:text-sm text-[#AEB3D6]">
            No fixtures found. Schedule a match first before declaring results.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

interface MatchResultEditorProps {
  match: Match;
  onSave: (updated: Match) => Promise<void>;
  showToast: (message: string, type?: "success" | "error") => void;
}

function MatchResultEditor({ match, onSave, showToast }: MatchResultEditorProps) {
  const currentMatch = match;
  const details = match.scoreDetails || {};

  // Cricket score fields
  const [cricketRunsA, setCricketRunsA] = useState<number>(details.teamARuns || 0);
  const [cricketWicketsA, setCricketWicketsA] = useState<number>(details.teamAWickets || 0);
  const [cricketOversA, setCricketOversA] = useState<string>(details.teamAOvers || "20.0");
  const [cricketRunsB, setCricketRunsB] = useState<number>(details.teamBRuns || 0);
  const [cricketWicketsB, setCricketWicketsB] = useState<number>(details.teamBWickets || 0);
  const [cricketOversB, setCricketOversB] = useState<string>(details.teamBOvers || "20.0");
  const [cricketToss, setCricketToss] = useState<string>(details.toss || "");

  // Football fields
  const [footballGoalsA, setFootballGoalsA] = useState<number>(details.teamAGoals || 0);
  const [footballGoalsB, setFootballGoalsB] = useState<number>(details.teamBGoals || 0);
  const [footballScorers, setFootballScorers] = useState<string>(details.scorersText || "");

  // Basketball fields
  const [basketballPtsA, setBasketballPtsA] = useState<number>(details.teamAPoints || 0);
  const [basketballPtsB, setBasketballPtsB] = useState<number>(details.teamBPoints || 0);

  // Volleyball / TT / LT fields
  const [setsA, setSetsA] = useState<number>(details.teamASets || 0);
  const [setsB, setSetsB] = useState<number>(details.teamBSets || 0);
  const [setScoresText, setSetScoresText] = useState<string>(
    Array.isArray(details.setScores) ? details.setScores.join(", ") : ""
  );

  // Result Override & MOTM
  // Map the stored winner back onto the dropdown's option values
  const [winnerOverride, setWinnerOverride] = useState<string>(() => {
    if (match.winnerId === match.teamAId) return match.isWalkover ? "walkoverA" : "teamA";
    if (match.winnerId === match.teamBId) return match.isWalkover ? "walkoverB" : "teamB";
    if (match.status === "Completed" && match.scoreText === "Match Abandoned / No Result") return "noResult";
    return "auto";
  });
  const [motmPlayerName, setMotmPlayerName] = useState<string>(match.motmPlayerName || "");
  const [motmCampus, setMotmCampus] = useState<string>(match.motmCampus || match.teamAShortCode);
  const [motmNote, setMotmNote] = useState<string>(match.motmNote || "");

  // Player Stats for remaining leaderboards
  const [playerStats, setPlayerStats] = useState<MatchPlayerStat[]>(match.playerStats || []);
  const [newStatPlayer, setNewStatPlayer] = useState({
    name: "",
    campus: match.teamAShortCode,
    statType: "runs",
    val: 0,
  });

  // Automatic Winner Detection & Result Text calculation
  const { autoWinnerId, autoResultText } = useMemo(() => {
    const sport = match.sportId;

    if (sport === "cricket") {
      if (cricketRunsA > cricketRunsB) {
        const diff = cricketRunsA - cricketRunsB;
        return {
          autoWinnerId: match.teamAId,
          autoResultText: `${match.teamAName} won by ${diff} runs`,
        };
      } else if (cricketRunsB > cricketRunsA) {
        const remainingWickets = 10 - cricketWicketsB;
        return {
          autoWinnerId: match.teamBId,
          autoResultText: `${match.teamBName} won by ${remainingWickets} wickets`,
        };
      }
      return { autoWinnerId: undefined, autoResultText: "Match Tied" };
    }

    if (sport === "football") {
      if (footballGoalsA > footballGoalsB) {
        return {
          autoWinnerId: match.teamAId,
          autoResultText: `${match.teamAName} won ${footballGoalsA}–${footballGoalsB}`,
        };
      } else if (footballGoalsB > footballGoalsA) {
        return {
          autoWinnerId: match.teamBId,
          autoResultText: `${match.teamBName} won ${footballGoalsB}–${footballGoalsA}`,
        };
      }
      return { autoWinnerId: undefined, autoResultText: `Match Drawn ${footballGoalsA}–${footballGoalsB}` };
    }

    if (sport === "basketball") {
      if (basketballPtsA > basketballPtsB) {
        return {
          autoWinnerId: match.teamAId,
          autoResultText: `${match.teamAName} won ${basketballPtsA}–${basketballPtsB}`,
        };
      } else if (basketballPtsB > basketballPtsA) {
        return {
          autoWinnerId: match.teamBId,
          autoResultText: `${match.teamBName} won ${basketballPtsB}–${basketballPtsA}`,
        };
      }
      return { autoWinnerId: undefined, autoResultText: "Scores Tied" };
    }

    // Volleyball / TT / LT
    if (setsA > setsB) {
      return {
        autoWinnerId: match.teamAId,
        autoResultText: `${match.teamAName} won ${setsA}–${setsB}`,
      };
    } else if (setsB > setsA) {
      return {
        autoWinnerId: match.teamBId,
        autoResultText: `${match.teamBName} won ${setsB}–${setsA}`,
      };
    }

    return { autoWinnerId: undefined, autoResultText: "" };
  }, [
    match,
    cricketRunsA,
    cricketRunsB,
    cricketWicketsB,
    footballGoalsA,
    footballGoalsB,
    basketballPtsA,
    basketballPtsB,
    setsA,
    setsB,
  ]);

  // Add a player stat entry
  const handleAddPlayerStat = () => {
    if (!newStatPlayer.name.trim() || newStatPlayer.val <= 0) return;

    let text = `${newStatPlayer.val} ${newStatPlayer.statType}`;
    if (newStatPlayer.statType === "runs") text = `${newStatPlayer.val} Runs`;
    else if (newStatPlayer.statType === "wickets") text = `${newStatPlayer.val} Wkts`;
    else if (newStatPlayer.statType === "goals") text = `${newStatPlayer.val} Goals`;
    else if (newStatPlayer.statType === "points") text = `${newStatPlayer.val} Pts`;

    const newStat: MatchPlayerStat = {
      playerId: `stat-${crypto.randomUUID()}`,
      playerName: newStatPlayer.name.trim(),
      campusCode: newStatPlayer.campus,
      statsText: text,
    };

    setPlayerStats([...playerStats, newStat]);
    setNewStatPlayer({ ...newStatPlayer, name: "", val: 0 });
    showToast(`Added stat for ${newStat.playerName}`);
  };

  const handleRemovePlayerStat = (idx: number) => {
    setPlayerStats(playerStats.filter((_, i) => i !== idx));
  };

  // Declare & Save Result
  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalWinnerId = autoWinnerId;
    let finalWinnerName: string | undefined = undefined;
    let finalResultText = autoResultText;

    if (winnerOverride === "teamA") {
      finalWinnerId = match.teamAId;
      finalWinnerName = match.teamAName;
      if (autoWinnerId !== finalWinnerId) finalResultText = `${match.teamAName} won`;
    } else if (winnerOverride === "teamB") {
      finalWinnerId = match.teamBId;
      finalWinnerName = match.teamBName;
      if (autoWinnerId !== finalWinnerId) finalResultText = `${match.teamBName} won`;
    } else if (winnerOverride === "walkoverA") {
      finalWinnerId = match.teamAId;
      finalWinnerName = match.teamAName;
      finalResultText = `${match.teamAName} won by Walkover`;
    } else if (winnerOverride === "walkoverB") {
      finalWinnerId = match.teamBId;
      finalWinnerName = match.teamBName;
      finalResultText = `${match.teamBName} won by Walkover`;
    } else if (winnerOverride === "noResult") {
      finalWinnerId = undefined;
      finalWinnerName = undefined;
      finalResultText = "Match Abandoned / No Result";
    } else if (autoWinnerId) {
      finalWinnerName =
        autoWinnerId === match.teamAId
          ? match.teamAName
          : match.teamBName;
    }

    const updatedMatch: Match = {
      ...match,
      status: "Completed",
      scoreText: finalResultText,
      // Overwrite values carried over from an earlier declaration; the server prefers these over scoreText
      resultText: finalResultText,
      scoreSummary: finalResultText,
      winnerId: finalWinnerId,
      winnerName: finalWinnerName,
      isWalkover: winnerOverride === "walkoverA" || winnerOverride === "walkoverB",
      motmPlayerName: motmPlayerName.trim() || undefined,
      motmCampus: motmCampus.trim() || undefined,
      motmNote: motmNote.trim() || undefined,
      playerStats: playerStats,
      scoreDetails: {
        teamARuns: cricketRunsA,
        teamAWickets: cricketWicketsA,
        teamAOvers: cricketOversA,
        teamBRuns: cricketRunsB,
        teamBWickets: cricketWicketsB,
        teamBOvers: cricketOversB,
        toss: cricketToss,
        teamAGoals: footballGoalsA,
        teamBGoals: footballGoalsB,
        scorersText: footballScorers,
        teamAPoints: basketballPtsA,
        teamBPoints: basketballPtsB,
        teamASets: setsA,
        teamBSets: setsB,
        setScores: setScoresText.split(",").map((s) => s.trim()).filter(Boolean),
      },
    };

    await onSave(updatedMatch);
  };

  return (
          <form onSubmit={handleSaveResult} className="space-y-6">
            {/* Match Fixture Summary Card */}
            <div className="p-6 rounded-2xl bg-[#161A40]/80 border border-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold">
                  {currentMatch.sportId.toUpperCase()} ({currentMatch.category.toUpperCase()}) · {currentMatch.round}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-gold-light mt-1">
                  {currentMatch.teamAName} vs {currentMatch.teamBName}
                </h2>
                <p className="text-xs text-[#AEB3D6] mt-1 font-mono">
                  {currentMatch.venue} · {new Date(currentMatch.scheduledAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#0F122E] border border-gold/20 text-xs font-mono text-gold-light max-w-xs text-center">
                <span className="text-[10px] text-[#AEB3D6] block uppercase mb-0.5">Calculated Result</span>
                <strong>{autoResultText || "Awaiting scores..."}</strong>
              </div>
            </div>

            {/* SPORT-SPECIFIC SCORE INPUTS */}
            <div className="p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-5">
              <h3 className="font-serif font-bold text-base text-gold uppercase tracking-wider">
                1. Match Scoresheet ({currentMatch.sportId.toUpperCase()})
              </h3>

              {/* CRICKET */}
              {currentMatch.sportId === "cricket" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Team A Cricket */}
                    <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20 space-y-3">
                      <div className="font-bold text-sm text-gold-light">
                        {currentMatch.teamAName}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-[#AEB3D6] uppercase mb-1">Runs</label>
                          <input
                            type="number"
                            min="0"
                            value={cricketRunsA}
                            onChange={(e) => setCricketRunsA(Number(e.target.value))}
                            className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-gold font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#AEB3D6] uppercase mb-1">Wickets</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={cricketWicketsA}
                            onChange={(e) => setCricketWicketsA(Number(e.target.value))}
                            className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-gold font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#AEB3D6] uppercase mb-1">Overs</label>
                          <input
                            type="text"
                            value={cricketOversA}
                            onChange={(e) => setCricketOversA(e.target.value)}
                            placeholder="20.0"
                            className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-gold font-bold font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Team B Cricket */}
                    <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20 space-y-3">
                      <div className="font-bold text-sm text-gold-light">
                        {currentMatch.teamBName}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-[#AEB3D6] uppercase mb-1">Runs</label>
                          <input
                            type="number"
                            min="0"
                            value={cricketRunsB}
                            onChange={(e) => setCricketRunsB(Number(e.target.value))}
                            className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-gold font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#AEB3D6] uppercase mb-1">Wickets</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={cricketWicketsB}
                            onChange={(e) => setCricketWicketsB(Number(e.target.value))}
                            className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-gold font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#AEB3D6] uppercase mb-1">Overs</label>
                          <input
                            type="text"
                            value={cricketOversB}
                            onChange={(e) => setCricketOversB(e.target.value)}
                            placeholder="20.0"
                            className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-gold font-bold font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">Toss Details</label>
                    <input
                      type="text"
                      value={cricketToss}
                      onChange={(e) => setCricketToss(e.target.value)}
                      placeholder="e.g. Mumbai won the toss and elected to bat first"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                </div>
              )}

              {/* FOOTBALL */}
              {currentMatch.sportId === "football" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                      <label className="block text-xs text-[#AEB3D6] mb-1 font-bold">
                        {currentMatch.teamAName} Goals
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={footballGoalsA}
                        onChange={(e) => setFootballGoalsA(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-base text-gold font-black"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                      <label className="block text-xs text-[#AEB3D6] mb-1 font-bold">
                        {currentMatch.teamBName} Goals
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={footballGoalsB}
                        onChange={(e) => setFootballGoalsB(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-base text-gold font-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">Goal Scorers</label>
                    <input
                      type="text"
                      value={footballScorers}
                      onChange={(e) => setFootballScorers(e.target.value)}
                      placeholder="e.g. Aarav Patel 24', Rohan Sharma 78'"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                    />
                  </div>
                </div>
              )}

              {/* BASKETBALL */}
              {currentMatch.sportId === "basketball" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                    <label className="block text-xs text-[#AEB3D6] mb-1 font-bold">
                      {currentMatch.teamAName} Points
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={basketballPtsA}
                      onChange={(e) => setBasketballPtsA(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-base text-gold font-black"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                    <label className="block text-xs text-[#AEB3D6] mb-1 font-bold">
                      {currentMatch.teamBName} Points
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={basketballPtsB}
                      onChange={(e) => setBasketballPtsB(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-base text-gold font-black"
                    />
                  </div>
                </div>
              )}

              {/* VOLLEYBALL / TABLE TENNIS / LAWN TENNIS */}
              {(currentMatch.sportId === "volleyball" ||
                currentMatch.sportId === "table-tennis" ||
                currentMatch.sportId === "lawn-tennis") && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                      <label className="block text-xs text-[#AEB3D6] mb-1 font-bold">
                        {currentMatch.teamAName} Sets / Rubbers
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={setsA}
                        onChange={(e) => setSetsA(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-base text-gold font-black"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20">
                      <label className="block text-xs text-[#AEB3D6] mb-1 font-bold">
                        {currentMatch.teamBName} Sets / Rubbers
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={setsB}
                        onChange={(e) => setSetsB(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-[#161A40] border border-gold/30 text-base text-gold font-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">Set Scores Breakdown</label>
                    <input
                      type="text"
                      value={setScoresText}
                      onChange={(e) => setSetScoresText(e.target.value)}
                      placeholder="e.g. 25-21, 23-25, 15-11"
                      className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. WINNER DETECTION & OVERRIDE */}
            <div className="p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-4">
              <h3 className="font-serif font-bold text-base text-gold uppercase tracking-wider">
                2. Winner & Match Outcome
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">
                    Winner Determination
                  </label>
                  <select
                    value={winnerOverride}
                    onChange={(e) => setWinnerOverride(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3] focus:outline-none"
                  >
                    <option value="auto">
                      Auto-Detect: {autoResultText || "Based on scores"}
                    </option>
                    <option value="teamA">Winner: {currentMatch.teamAName}</option>
                    <option value="teamB">Winner: {currentMatch.teamBName}</option>
                    <option value="walkoverA">Walkover: {currentMatch.teamAName} (Opponent forfeit)</option>
                    <option value="walkoverB">Walkover: {currentMatch.teamBName} (Opponent forfeit)</option>
                    <option value="noResult">No Result / Abandoned</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#0F122E] border border-gold/15 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="text-xs text-[#AEB3D6] leading-relaxed">
                    Saving as Completed automatically moves this match to Results and recalculates group standings.
                  </span>
                </div>
              </div>
            </div>

            {/* 3. MAN OF THE MATCH */}
            <div className="p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold" />
                <h3 className="font-serif font-bold text-base text-gold uppercase tracking-wider">
                  3. Man of the Match Honours
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">Player Name</label>
                  <input
                    type="text"
                    value={motmPlayerName}
                    onChange={(e) => setMotmPlayerName(e.target.value)}
                    placeholder="e.g. Aarav Patel"
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">Campus</label>
                  <select
                    value={motmCampus}
                    onChange={(e) => setMotmCampus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    <option value={currentMatch.teamAShortCode}>{currentMatch.teamAShortCode}</option>
                    <option value={currentMatch.teamBShortCode}>{currentMatch.teamBShortCode}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#AEB3D6] mb-1">Performance Note</label>
                  <input
                    type="text"
                    value={motmNote}
                    onChange={(e) => setMotmNote(e.target.value)}
                    placeholder="e.g. 84 runs off 48 balls & 2 wickets"
                    className="w-full p-2.5 rounded-xl bg-[#0F122E] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>
              </div>
            </div>

            {/* 4. PLAYER STATS FOR REMAINING LEADERBOARDS */}
            <div className="p-6 rounded-2xl bg-[#161A40] border border-[rgba(217,178,111,0.2)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-gold uppercase tracking-wider">
                    4. Player Statistics (Official Leaderboards)
                  </h3>
                  <p className="text-xs text-[#AEB3D6] mt-0.5">
                    Enter individual athlete totals (runs, wickets, goals, points) used for tournament stat boards.
                  </p>
                </div>
              </div>

              {/* Add stat row */}
              <div className="p-4 rounded-xl bg-[#0F122E] border border-gold/20 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[10px] uppercase font-mono text-[#AEB3D6] mb-1">Player Name</label>
                  <input
                    type="text"
                    value={newStatPlayer.name}
                    onChange={(e) => setNewStatPlayer({ ...newStatPlayer, name: e.target.value })}
                    placeholder="Athlete Name"
                    className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-[#F4EFE3]"
                  />
                </div>

                <div className="w-24">
                  <label className="block text-[10px] uppercase font-mono text-[#AEB3D6] mb-1">Campus</label>
                  <select
                    value={newStatPlayer.campus}
                    onChange={(e) => setNewStatPlayer({ ...newStatPlayer, campus: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    <option value={currentMatch.teamAShortCode}>{currentMatch.teamAShortCode}</option>
                    <option value={currentMatch.teamBShortCode}>{currentMatch.teamBShortCode}</option>
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-[10px] uppercase font-mono text-[#AEB3D6] mb-1">Stat Type</label>
                  <select
                    value={newStatPlayer.statType}
                    onChange={(e) => setNewStatPlayer({ ...newStatPlayer, statType: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-[#F4EFE3]"
                  >
                    <option value="runs">Runs</option>
                    <option value="wickets">Wickets</option>
                    <option value="goals">Goals</option>
                    <option value="points">Points</option>
                  </select>
                </div>

                <div className="w-20">
                  <label className="block text-[10px] uppercase font-mono text-[#AEB3D6] mb-1">Value</label>
                  <input
                    type="number"
                    min="1"
                    value={newStatPlayer.val || ""}
                    onChange={(e) => setNewStatPlayer({ ...newStatPlayer, val: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full p-2 rounded-lg bg-[#161A40] border border-gold/30 text-xs text-[#F4EFE3] font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddPlayerStat}
                  className="px-4 py-2 rounded-lg btn-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Stat</span>
                </button>
              </div>

              {/* Player Stats Table */}
              {playerStats.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gold/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#20255A] text-gold uppercase">
                      <tr>
                        <th className="p-3">Player</th>
                        <th className="p-3">Campus</th>
                        <th className="p-3">Stat Recorded</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(217,178,111,0.1)]">
                      {playerStats.map((stat, i) => (
                        <tr key={i} className="hover:bg-[#20255A]/30">
                          <td className="p-3 font-semibold text-[#F4EFE3]">{stat.playerName}</td>
                          <td className="p-3 font-mono text-[#AEB3D6]">{stat.campusCode}</td>
                          <td className="p-3 font-mono font-bold text-gold-light">{stat.statsText}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemovePlayerStat(i)}
                              className="p-1 rounded text-red-400 hover:bg-red-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-full btn-gold text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Declare Result & Update Standings</span>
              </button>
            </div>
          </form>
  );
}

export default function AdminResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-gold font-serif">
          Loading Result Declarator...
        </div>
      }
    >
      <ResultsAdminContent />
    </Suspense>
  );
}

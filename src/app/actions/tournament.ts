"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";
import {
  Team,
  Player,
  Match,
  MatchPlayerStat,
  SportType,
  CategoryGender,
  MatchRound,
  MatchStatus,
} from "@/types/tournament";
import { getSeededTeams } from "@/lib/seed-teams";

function sanitizeString(str?: string): string {
  if (!str) return "";
  // Strip CSV/formula injection characters (=, +, -, @)
  return str.replace(/^[\s=+@-]/, "").trim();
}

interface TeamRow {
  id: string;
  campus_id: string;
  sport_id: string;
  name: string;
  squad_size: number | null;
  categories?: { gender: string } | null;
}

interface PlayerRow {
  id: string;
  team_id: string;
  name: string;
  role: string | null;
  jersey_no: number | null;
  photo_url: string | null;
  is_captain: boolean | null;
  is_wk: boolean | null;
}

interface MatchRow {
  id: string;
  edition: string | null;
  sport_id: string;
  match_no: number;
  round: string;
  group_id: string | null;
  scheduled_at: string;
  venue: string;
  status: string;
  winner_id: string | null;
  result_text: string | null;
  score_summary: {
    summary?: string;
    scoreText?: string;
    winnerName?: string;
    scoreDetails?: Record<string, unknown>;
    motmPlayerName?: string;
    motmCampus?: string;
    motmNote?: string;
    playerStats?: MatchPlayerStat[];
  } | null;
  notes: string | null;
  motm_note: string | null;
  is_walkover: boolean | null;
  team_a?: { id: string; name: string; campus_id: string } | null;
  team_b?: { id: string; name: string; campus_id: string } | null;
  categories?: { gender: string } | null;
}

const teamInputSchema = z.object({
  id: z.string().min(1).max(100),
  campusId: z.string().min(1).max(50),
  sportId: z.string().min(1).max(50),
  category: z.enum(["men", "women"]),
  name: z.string().min(1, "Team name is required").max(100),
  squadSize: z.number().int().min(1).max(50).default(12),
});

const playerInputSchema = z.object({
  id: z.string().optional(),
  teamId: z.string().min(1).max(100),
  name: z.string().min(1, "Player name is required").max(100),
  role: z.string().max(50).optional(),
  jerseyNo: z.number().int().min(0).max(999).optional(),
  isCaptain: z.boolean().optional(),
  isWk: z.boolean().optional(),
});

const matchInputSchema = z.object({
  id: z.string().optional(),
  edition: z.string().max(20).default("2026-27"),
  sportId: z.string().min(1).max(50),
  category: z.enum(["men", "women"]),
  matchNo: z.number().int().min(1).max(1000),
  round: z.string().min(1).max(50),
  groupId: z.string().nullable().optional(),
  teamAId: z.string().min(1).max(100),
  teamBId: z.string().min(1).max(100),
  scheduledAt: z.string().min(1),
  venue: z.string().min(1).max(100),
  status: z.enum(["Scheduled", "Live", "Completed", "Abandoned", "Postponed"]),
  winnerId: z.string().nullable().optional(),
  winnerName: z.string().max(100).optional(),
  resultText: z.string().max(255).optional(),
  scoreText: z.string().max(255).optional(),
  scoreSummary: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  motmPlayerName: z.string().max(100).optional(),
  motmCampus: z.string().max(100).optional(),
  motmNote: z.string().max(255).optional(),
  isWalkover: z.boolean().optional(),
});

async function ensureTeamExists(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  teamId: string,
  catId?: string | null
) {
  if (!teamId) return;
  const { data: exists } = await supabase
    .from("teams")
    .select("id")
    .eq("id", teamId)
    .maybeSingle();

  if (!exists) {
    const seeded = getSeededTeams().find((t) => t.id === teamId);
    if (seeded) {
      let categoryIdToUse = catId;
      if (!categoryIdToUse) {
        const { data: cData } = await supabase
          .from("categories")
          .select("id")
          .eq("sport_id", seeded.sportId)
          .eq("gender", seeded.category)
          .maybeSingle();
        categoryIdToUse = cData?.id || null;
      }

      await supabase.from("teams").upsert({
        id: seeded.id,
        campus_id: seeded.campusId.toLowerCase(),
        sport_id: seeded.sportId,
        category_id: categoryIdToUse,
        name: seeded.name,
        squad_size: seeded.squadSize,
      });
    }
  }
}

// ----------------------------------------------------------------------------
// TEAMS
// ----------------------------------------------------------------------------

export async function getTeamsAction(): Promise<Team[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, campus_id, sport_id, name, squad_size, categories(gender)")
    .order("name");

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as TeamRow[];

  return rows.map((t) => ({
    id: t.id,
    campusId: t.campus_id,
    sportId: t.sport_id as SportType,
    category: (t.categories?.gender ||
      (t.id.endsWith("-women") ? "women" : "men")) as CategoryGender,
    name: t.name,
    squadSize: t.squad_size ?? 12,
  }));
}

export async function upsertTeamAction(
  team: Partial<Team> & {
    id: string;
    campusId: string;
    sportId: string;
    category: CategoryGender;
    name: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = teamInputSchema.safeParse(team);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid team data" };
    }

    const valid = parsed.data;

    // Find or determine category_id
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("sport_id", valid.sportId)
      .eq("gender", valid.category)
      .maybeSingle();

    const { error } = await supabase.from("teams").upsert({
      id: valid.id,
      campus_id: valid.campusId.toLowerCase(),
      sport_id: valid.sportId,
      category_id: categoryData?.id || null,
      name: sanitizeString(valid.name),
      squad_size: valid.squadSize || 12,
    });

    if (error) {
      console.error("upsertTeamAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/teams");
    revalidatePath("/campuses");
    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save team";
    console.error("upsertTeamAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deleteTeamAction(
  teamId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (error) {
      console.error("deleteTeamAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/teams");
    revalidatePath("/campuses");
    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete team";
    console.error("deleteTeamAction exception:", err);
    return { success: false, error: message };
  }
}

// ----------------------------------------------------------------------------
// PLAYERS
// ----------------------------------------------------------------------------

export async function getPlayersAction(teamId?: string): Promise<Player[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("players").select("id, team_id, name, role, jersey_no, photo_url, is_captain, is_wk");
  if (teamId) {
    query = query.eq("team_id", teamId);
  }
  const { data, error } = await query.order("name");

  if (error || !data) return [];

  const rows = data as unknown as PlayerRow[];

  return rows.map((p) => ({
    id: p.id,
    teamId: p.team_id,
    name: p.name,
    role: p.role || "Player",
    jerseyNo: p.jersey_no ?? 0,
    photoUrl: p.photo_url || undefined,
    isCaptain: Boolean(p.is_captain),
    isWk: Boolean(p.is_wk),
  }));
}

export async function upsertPlayerAction(
  player: Partial<Player> & { teamId: string; name: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = playerInputSchema.safeParse(player);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid player data" };
    }

    const valid = parsed.data;
    await ensureTeamExists(supabase, valid.teamId);

    const isUuid =
      valid.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        valid.id
      );

    const payload = {
      id: isUuid && valid.id ? valid.id : crypto.randomUUID(),
      team_id: valid.teamId,
      name: sanitizeString(valid.name),
      role: sanitizeString(valid.role || "Player"),
      jersey_no: valid.jerseyNo ? Number(valid.jerseyNo) : null,
      is_captain: Boolean(valid.isCaptain),
      is_wk: Boolean(valid.isWk),
    };

    const { error } = await supabase.from("players").upsert(payload);
    if (error) {
      console.error("upsertPlayerAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/teams");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save player";
    console.error("upsertPlayerAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deletePlayerAction(
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();
    const { error } = await supabase.from("players").delete().eq("id", playerId);
    if (error) {
      console.error("deletePlayerAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/teams");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete player";
    console.error("deletePlayerAction exception:", err);
    return { success: false, error: message };
  }
}

export async function bulkImportPlayersAction(
  teamId: string,
  players: Array<{
    name: string;
    jerseyNo?: number;
    role?: string;
    isCaptain?: boolean;
    isWk?: boolean;
  }>
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    if (players.length > 1000) {
      return { success: false, error: "Import exceeds maximum allowable batch size of 1000 records." };
    }

    await ensureTeamExists(supabase, teamId);

    const payloads = players.map((p) => ({
      id: crypto.randomUUID(),
      team_id: teamId,
      name: sanitizeString(p.name),
      jersey_no: p.jerseyNo || null,
      role: sanitizeString(p.role || "Player"),
      is_captain: Boolean(p.isCaptain),
      is_wk: Boolean(p.isWk),
    }));

    const { error } = await supabase.from("players").insert(payloads);
    if (error) {
      console.error("bulkImportPlayersAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/teams");
    return { success: true, count: payloads.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to import players";
    console.error("bulkImportPlayersAction exception:", err);
    return { success: false, error: message };
  }
}

// ----------------------------------------------------------------------------
// MATCHES
// ----------------------------------------------------------------------------

export async function getMatchesAction(): Promise<Match[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      edition,
      sport_id,
      match_no,
      round,
      group_id,
      scheduled_at,
      venue,
      status,
      winner_id,
      result_text,
      score_summary,
      notes,
      motm_note,
      is_walkover,
      team_a:teams!matches_team_a_id_fkey(id, name, campus_id),
      team_b:teams!matches_team_b_id_fkey(id, name, campus_id),
      categories(gender)
    `)
    .order("match_no", { ascending: true });

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as MatchRow[];

  return rows.map((m) => {
    const scoreJson = m.score_summary || {};
    const teamA = m.team_a || { id: "", name: "Team A", campus_id: "" };
    const teamB = m.team_b || { id: "", name: "Team B", campus_id: "" };

    return {
      id: m.id,
      edition: m.edition || "2026-27",
      sportId: m.sport_id as SportType,
      category: (m.categories?.gender ||
        (teamA.id?.endsWith("-women") ? "women" : "men")) as CategoryGender,
      matchNo: m.match_no,
      round: m.round as MatchRound,
      groupId: m.group_id || undefined,
      teamAId: teamA.id,
      teamAName: teamA.name || "Team A",
      teamAShortCode: (teamA.campus_id || "").toUpperCase(),
      teamBId: teamB.id,
      teamBName: teamB.name || "Team B",
      teamBShortCode: (teamB.campus_id || "").toUpperCase(),
      scheduledAt: m.scheduled_at,
      venue: m.venue,
      status: m.status as MatchStatus,
      winnerId: m.winner_id || undefined,
      winnerName: scoreJson.winnerName || undefined,
      resultText: m.result_text || scoreJson.scoreText || undefined,
      scoreText: m.result_text || scoreJson.scoreText || undefined,
      scoreSummary: scoreJson.summary || m.result_text || undefined,
      scoreDetails: (scoreJson.scoreDetails as Match["scoreDetails"]) || undefined,
      notes: m.notes || undefined,
      motmPlayerName: scoreJson.motmPlayerName || undefined,
      motmCampus: scoreJson.motmCampus || undefined,
      motmNote: m.motm_note || scoreJson.motmNote || undefined,
      playerStats: scoreJson.playerStats || [],
      isWalkover: Boolean(m.is_walkover),
    };
  });
}

export async function saveMatchAction(
  match: Match
): Promise<{ success: boolean; match?: Match; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = matchInputSchema.safeParse(match);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid match data" };
    }

    const valid = parsed.data;

    // Find category_id
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id")
      .eq("sport_id", valid.sportId)
      .eq("gender", valid.category)
      .maybeSingle();

    await ensureTeamExists(supabase, valid.teamAId, categoryData?.id);
    await ensureTeamExists(supabase, valid.teamBId, categoryData?.id);

    const scoreSummaryJson = {
      summary: valid.scoreSummary || valid.scoreText || valid.resultText || "",
      scoreText: valid.scoreText || valid.resultText || "",
      winnerName: valid.winnerName || "",
      scoreDetails: match.scoreDetails || {},
      motmPlayerName: valid.motmPlayerName || "",
      motmCampus: valid.motmCampus || "",
      motmNote: valid.motmNote || "",
      playerStats: match.playerStats || [],
    };

    const isUuid =
      valid.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        valid.id
      );

    const payload = {
      id: isUuid && valid.id ? valid.id : crypto.randomUUID(),
      edition: valid.edition || "2026-27",
      sport_id: valid.sportId,
      category_id: categoryData?.id || null,
      match_no: valid.matchNo,
      round: valid.round,
      group_id: valid.groupId || null,
      team_a_id: valid.teamAId,
      team_b_id: valid.teamBId,
      scheduled_at: valid.scheduledAt,
      venue: sanitizeString(valid.venue),
      status: valid.status,
      winner_id: valid.winnerId || null,
      result_text: valid.resultText || valid.scoreText || null,
      score_summary: scoreSummaryJson,
      notes: valid.notes ? sanitizeString(valid.notes) : null,
      motm_note: valid.motmNote ? sanitizeString(valid.motmNote) : null,
      is_walkover: Boolean(valid.isWalkover),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("matches")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("saveMatchAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sports");
    revalidatePath(`/sports/${valid.sportId}`);
    revalidatePath("/standings");
    revalidatePath("/home");

    return { success: true, match };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save match";
    console.error("saveMatchAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deleteMatchAction(
  matchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();
    const { error } = await supabase.from("matches").delete().eq("id", matchId);
    if (error) {
      console.error("deleteMatchAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/sports");
    revalidatePath("/standings");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete match";
    console.error("deleteMatchAction exception:", err);
    return { success: false, error: message };
  }
}

export async function bulkImportMatchesAction(
  matchesList: Array<Partial<Match>>
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    if (matchesList.length > 1000) {
      return { success: false, error: "Import exceeds maximum allowable batch size of 1000 fixtures." };
    }

    for (const m of matchesList) {
      if (m.teamAId && m.teamBId && m.sportId) {
        const res = await saveMatchAction(m as Match);
        if (!res.success) {
          return { success: false, error: res.error };
        }
      }
    }

    revalidatePath("/sports");
    revalidatePath("/standings");
    revalidatePath("/home");

    return { success: true, count: matchesList.length };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to import matches";
    console.error("bulkImportMatchesAction exception:", err);
    return { success: false, error: message };
  }
}

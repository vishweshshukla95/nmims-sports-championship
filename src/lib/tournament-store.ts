import { Team, Match } from "@/types/tournament";
import { getSeededTeams, OFFICIAL_SQUAD_SIZES } from "./seed-teams";
export { getSeededTeams, OFFICIAL_SQUAD_SIZES };
import {
  getTeamsAction,
  getMatchesAction,
  saveMatchAction,
  deleteMatchAction,
  upsertTeamAction,
} from "@/app/actions/tournament";

// In-memory runtime cache for synchronous fallbacks
let runtimeMatchesCache: Match[] = [];
let runtimeTeamsCache: Team[] = [];

export function getTeams(): Team[] {
  if (runtimeTeamsCache.length > 0) return runtimeTeamsCache;
  return getSeededTeams();
}

export function setRuntimeTeams(teams: Team[]): void {
  runtimeTeamsCache = teams;
}

export async function fetchTeams(): Promise<Team[]> {
  try {
    const teams = await getTeamsAction();
    if (teams.length > 0) {
      runtimeTeamsCache = teams;
      return teams;
    }
  } catch (err) {
    console.warn("fetchTeams fallback to seeded teams:", err);
  }
  return getSeededTeams();
}

export async function saveTeams(teams: Team[]): Promise<void> {
  runtimeTeamsCache = teams;
  for (const team of teams) {
    await upsertTeamAction(team);
  }
}

export function getMatches(): Match[] {
  return runtimeMatchesCache;
}

export function setRuntimeMatches(matches: Match[]): void {
  runtimeMatchesCache = matches;
}

export async function fetchMatches(): Promise<Match[]> {
  try {
    const matches = await getMatchesAction();
    runtimeMatchesCache = matches;
    return matches;
  } catch (err) {
    console.warn("fetchMatches error:", err);
    return runtimeMatchesCache;
  }
}

export async function saveMatch(match: Match): Promise<{ success: boolean; error?: string }> {
  const res = await saveMatchAction(match);
  if (res.success) {
    const current = runtimeMatchesCache;
    const index = current.findIndex((m) => m.id === match.id);
    if (index >= 0) {
      current[index] = match;
    } else {
      current.unshift(match);
    }
    runtimeMatchesCache = [...current];
  }
  return res;
}

export async function deleteMatch(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await deleteMatchAction(id);
  if (res.success) {
    runtimeMatchesCache = runtimeMatchesCache.filter((m) => m.id !== id);
  }
  return res;
}

export async function clearDemoMatches(): Promise<void> {
  const current = runtimeMatchesCache;
  const toDelete = current.filter((m) => m.isDemo);
  for (const m of toDelete) {
    await deleteMatchAction(m.id);
  }
  runtimeMatchesCache = current.filter((m) => !m.isDemo);
}

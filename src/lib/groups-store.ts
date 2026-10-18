import { Group, TeamGroup } from "@/types/tournament";
import {
  getGroupsAction,
  getTeamGroupsAction,
  assignTeamGroupAction,
} from "@/app/actions/groups";

let runtimeGroupsCache: Group[] = [];
let runtimeTeamGroupsCache: TeamGroup[] = [];

export function getGroups(): Group[] {
  return runtimeGroupsCache;
}

export function setRuntimeGroups(groups: Group[]): void {
  runtimeGroupsCache = groups;
}

export async function fetchGroups(
  sportId?: string,
  categoryGender?: string
): Promise<Group[]> {
  try {
    const groups = await getGroupsAction(sportId, categoryGender);
    if (groups) {
      runtimeGroupsCache = groups;
      return groups;
    }
  } catch (err) {
    console.warn("fetchGroups error:", err);
  }
  return [];
}

export function getTeamGroups(): TeamGroup[] {
  return runtimeTeamGroupsCache;
}

export function setRuntimeTeamGroups(teamGroups: TeamGroup[]): void {
  runtimeTeamGroupsCache = teamGroups;
}

export async function fetchTeamGroups(): Promise<TeamGroup[]> {
  try {
    const teamGroups = await getTeamGroupsAction();
    if (teamGroups) {
      runtimeTeamGroupsCache = teamGroups;
      return teamGroups;
    }
  } catch (err) {
    console.warn("fetchTeamGroups error:", err);
  }
  return [];
}

export async function assignTeamToGroup(
  teamId: string,
  groupId: string | null
): Promise<{ success: boolean; error?: string }> {
  const res = await assignTeamGroupAction(teamId, groupId);
  if (res.success) {
    await fetchTeamGroups();
  }
  return res;
}

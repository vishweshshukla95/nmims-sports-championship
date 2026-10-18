import { PointAdjustment, PointsRules, DEFAULT_POINTS_RULES } from "@/lib/points-calculator";
export type { PointAdjustment, PointsRules };
import { SportType } from "@/types/tournament";
import {
  getPointsAdjustmentsAction,
  addPointsAdjustmentAction,
  deletePointsAdjustmentAction,
  getPointsRulesAction,
  savePointsRulesAction,
} from "@/app/actions/points";

export interface StoredAdjustment extends PointAdjustment {
  id: string;
  sportId: string;
  category: string;
  createdAt: string;
}

export interface SportPointsRule {
  win: number;
  draw: number;
  loss: number;
  nr: number;
}

let runtimeAdjustmentsCache: StoredAdjustment[] = [];
let runtimeRulesCache: Record<SportType, PointsRules> = DEFAULT_POINTS_RULES;

export function getStoredAdjustments(): StoredAdjustment[] {
  return runtimeAdjustmentsCache;
}

export async function fetchPointsAdjustments(): Promise<StoredAdjustment[]> {
  try {
    const list = await getPointsAdjustmentsAction();
    const mapped: StoredAdjustment[] = list.map((a) => ({
      id: a.id || `adj-${Date.now().toString(36)}`,
      teamId: a.teamId,
      field: a.field,
      delta: a.delta,
      reason: a.reason,
      sportId: "cricket", // default / inferred
      category: "men",
      createdAt: a.createdAt || new Date().toISOString(),
    }));
    runtimeAdjustmentsCache = mapped;
    return mapped;
  } catch (err) {
    console.warn("fetchPointsAdjustments error:", err);
    return runtimeAdjustmentsCache;
  }
}

export async function saveStoredAdjustment(
  adj: Omit<StoredAdjustment, "id" | "createdAt">
): Promise<StoredAdjustment> {
  const res = await addPointsAdjustmentAction({
    teamId: adj.teamId,
    field: adj.field,
    delta: adj.delta,
    reason: adj.reason,
  });

  if (res.error) {
    throw new Error(res.error);
  }

  const newAdj: StoredAdjustment = {
    ...adj,
    id: res.adjustment?.id || `adj-${Date.now().toString(36)}`,
    createdAt: res.adjustment?.created_at || new Date().toISOString(),
  };

  runtimeAdjustmentsCache = [...runtimeAdjustmentsCache, newAdj];
  return newAdj;
}

export async function deleteStoredAdjustment(id: string): Promise<void> {
  const res = await deletePointsAdjustmentAction(id);
  if (res.error) {
    throw new Error(res.error);
  }
  runtimeAdjustmentsCache = runtimeAdjustmentsCache.filter((a) => a.id !== id);
}

export function getSportPointsRules(): Record<SportType, PointsRules> {
  return runtimeRulesCache;
}

export async function fetchSportPointsRules(): Promise<Record<SportType, PointsRules>> {
  try {
    const rules = await getPointsRulesAction();
    runtimeRulesCache = rules as Record<SportType, PointsRules>;
    return runtimeRulesCache;
  } catch (err) {
    console.warn("fetchSportPointsRules error:", err);
    return runtimeRulesCache;
  }
}

export async function saveSportPointsRules(rules: Record<SportType, PointsRules>): Promise<void> {
  const res = await savePointsRulesAction(rules);
  if (res.error) {
    throw new Error(res.error);
  }
  runtimeRulesCache = rules;
}

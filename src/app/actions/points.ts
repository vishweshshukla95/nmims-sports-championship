"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";
import { SportPointsRule } from "@/lib/adjustments-store";
import { getSeededTeams } from "@/lib/seed-teams";

export interface PointAdjustmentRecord {
  id?: string;
  teamId: string;
  categoryId?: string;
  field: string;
  delta: number;
  reason?: string;
  createdAt?: string;
}

interface PointsAdjustmentRow {
  id: string;
  team_id: string;
  category_id: string | null;
  field: string;
  delta: number;
  reason: string | null;
  created_at?: string;
}

const pointAdjustmentSchema = z.object({
  teamId: z.string().min(1).max(100),
  categoryId: z.string().optional(),
  field: z.string().min(1).max(50),
  delta: z.number().int().min(-100).max(100),
  reason: z.string().max(255).optional(),
});

const sportPointsRuleSchema = z.object({
  win: z.number().int().min(0).max(10),
  draw: z.number().int().min(0).max(10),
  loss: z.number().int().min(0).max(10),
  nr: z.number().int().min(0).max(10),
});

const DEFAULT_POINTS_RULES: Record<string, SportPointsRule> = {
  cricket: { win: 2, draw: 0, loss: 0, nr: 1 },
  football: { win: 3, draw: 1, loss: 0, nr: 0 },
  basketball: { win: 2, draw: 0, loss: 0, nr: 0 },
  volleyball: { win: 2, draw: 0, loss: 0, nr: 0 },
  "table-tennis": { win: 2, draw: 0, loss: 0, nr: 0 },
  "lawn-tennis": { win: 2, draw: 0, loss: 0, nr: 0 },
};

export async function getPointsAdjustmentsAction(): Promise<PointAdjustmentRecord[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("points_adjustments")
    .select("id, team_id, category_id, field, delta, reason, created_at");

  if (error || !data) return [];

  const rows = data as unknown as PointsAdjustmentRow[];

  return rows.map((a) => ({
    id: a.id,
    teamId: a.team_id,
    categoryId: a.category_id || undefined,
    field: a.field,
    delta: Number(a.delta),
    reason: a.reason || undefined,
    createdAt: a.created_at,
  }));
}

export async function addPointsAdjustmentAction(adj: PointAdjustmentRecord) {
  const { supabase } = await verifyAdminSession();

  const parsed = pointAdjustmentSchema.safeParse(adj);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue ? issue.message : "Invalid adjustment data" };
  }

  const valid = parsed.data;

  let catId = valid.categoryId;
  const isUuid = catId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId);
  if (!isUuid) {
    const { data: teamData } = await supabase
      .from("teams")
      .select("category_id, sport_id")
      .eq("id", valid.teamId)
      .maybeSingle();

    if (teamData?.category_id) {
      catId = teamData.category_id;
    } else {
      const isWomen = valid.teamId.endsWith("-women");
      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .eq("gender", isWomen ? "women" : "men")
        .limit(1)
        .maybeSingle();
      catId = catData?.id;
    }
  }

  // Ensure team exists
  const { data: teamExists } = await supabase.from("teams").select("id").eq("id", valid.teamId).maybeSingle();
  if (!teamExists) {
    const seeded = getSeededTeams().find((t) => t.id === valid.teamId);
    if (seeded) {
      await supabase.from("teams").upsert({
        id: seeded.id,
        campus_id: seeded.campusId.toLowerCase(),
        sport_id: seeded.sportId,
        category_id: catId || null,
        name: seeded.name,
        squad_size: seeded.squadSize,
      });
    }
  }

  try {
    const { data, error } = await supabase
      .from("points_adjustments")
      .insert({
        id: crypto.randomUUID(),
        team_id: valid.teamId,
        category_id: catId,
        field: valid.field,
        delta: valid.delta,
        reason: valid.reason,
      })
      .select()
      .single();

    if (error) {
      console.error("addPointsAdjustmentAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/standings");
    revalidatePath("/sports");
    revalidatePath("/home");

    return { success: true, adjustment: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add adjustment";
    console.error("addPointsAdjustmentAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deletePointsAdjustmentAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    if (!id) {
      return { success: false, error: "Adjustment ID is required" };
    }

    const { error } = await supabase.from("points_adjustments").delete().eq("id", id);
    if (error) {
      console.error("deletePointsAdjustmentAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/standings");
    revalidatePath("/sports");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete adjustment";
    console.error("deletePointsAdjustmentAction exception:", err);
    return { success: false, error: message };
  }
}

export async function getPointsRulesAction(): Promise<Record<string, SportPointsRule>> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "points_rules")
    .maybeSingle();

  if (error || !data || !data.value) {
    return DEFAULT_POINTS_RULES;
  }

  return { ...DEFAULT_POINTS_RULES, ...(data.value as Record<string, SportPointsRule>) };
}

export async function savePointsRulesAction(
  rules: Record<string, SportPointsRule>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    // Validate rules map
    for (const [sport, rule] of Object.entries(rules)) {
      const parsed = sportPointsRuleSchema.safeParse(rule);
      if (!parsed.success) {
        return { success: false, error: `Invalid rule definition for ${sport}` };
      }
    }

    const { error } = await supabase.from("site_config").upsert({
      key: "points_rules",
      value: rules,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("savePointsRulesAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/standings");
    revalidatePath("/sports");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save points rules";
    console.error("savePointsRulesAction exception:", err);
    return { success: false, error: message };
  }
}

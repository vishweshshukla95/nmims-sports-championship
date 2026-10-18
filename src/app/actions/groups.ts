"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";
import { Group, TeamGroup } from "@/types/tournament";

interface GroupRow {
  id: string;
  sport_id: string;
  category_id: string;
  name: string;
  sort_order: number | null;
  created_at?: string;
}

interface TeamGroupRow {
  id: string;
  team_id: string;
  group_id: string;
  groups?: {
    id: string;
    name: string;
    sport_id: string;
    category_id: string;
  } | null;
}

const saveGroupSchema = z.object({
  id: z.string().optional(),
  sportId: z.string().min(1).max(50),
  categoryGender: z.enum(["men", "women"]),
  name: z.string().min(1, "Group name is required").max(50),
  sortOrder: z.number().int().min(0).max(100).default(0),
});

const assignTeamGroupSchema = z.object({
  teamId: z.string().min(1).max(100),
  groupId: z.string().nullable(),
});

// ----------------------------------------------------------------------------
// GROUPS
// ----------------------------------------------------------------------------

export async function getGroupsAction(
  sportId?: string,
  categoryGender?: string
): Promise<Group[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("groups")
    .select("id, sport_id, category_id, name, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (sportId) {
    query = query.eq("sport_id", sportId);
  }

  if (categoryGender && sportId) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("sport_id", sportId)
      .eq("gender", categoryGender)
      .maybeSingle();

    if (cat?.id) {
      query = query.eq("category_id", cat.id);
    }
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  const rows = data as unknown as GroupRow[];

  return rows.map((g) => ({
    id: g.id,
    sportId: g.sport_id,
    categoryId: g.category_id,
    name: g.name,
    sortOrder: g.sort_order ?? 0,
    createdAt: g.created_at,
  }));
}

export async function saveGroupAction(group: {
  id?: string;
  sportId: string;
  categoryGender: string;
  name: string;
  sortOrder?: number;
}): Promise<{ success: boolean; group?: Group; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = saveGroupSchema.safeParse(group);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid group configuration" };
    }

    const valid = parsed.data;

    // Resolve category_id
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("sport_id", valid.sportId)
      .eq("gender", valid.categoryGender)
      .maybeSingle();

    if (catErr || !cat) {
      return { success: false, error: `Category ${valid.categoryGender} not found for ${valid.sportId}` };
    }

    const isUuid =
      valid.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        valid.id
      );

    const payload = {
      id: isUuid && valid.id ? valid.id : crypto.randomUUID(),
      sport_id: valid.sportId,
      category_id: cat.id,
      name: valid.name.trim(),
      sort_order: valid.sortOrder ?? 0,
    };

    const { data, error } = await supabase
      .from("groups")
      .upsert(payload)
      .select("id, sport_id, category_id, name, sort_order, created_at")
      .single();

    if (error) {
      console.error("saveGroupAction error:", error);
      return { success: false, error: error.message };
    }

    const row = data as GroupRow;

    revalidatePath("/admin/groups");
    revalidatePath("/sports");
    revalidatePath(`/sports/${valid.sportId}`);
    revalidatePath("/standings");
    revalidatePath("/home");

    return {
      success: true,
      group: {
        id: row.id,
        sportId: row.sport_id,
        categoryId: row.category_id,
        name: row.name,
        sortOrder: row.sort_order ?? 0,
        createdAt: row.created_at,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save group";
    console.error("saveGroupAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deleteGroupAction(
  groupId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    if (!groupId) {
      return { success: false, error: "Group ID is required" };
    }

    const { error } = await supabase.from("groups").delete().eq("id", groupId);
    if (error) {
      console.error("deleteGroupAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/groups");
    revalidatePath("/sports");
    revalidatePath("/standings");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete group";
    console.error("deleteGroupAction exception:", err);
    return { success: false, error: message };
  }
}

// ----------------------------------------------------------------------------
// TEAM GROUP ASSIGNMENTS
// ----------------------------------------------------------------------------

export async function getTeamGroupsAction(): Promise<TeamGroup[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("team_groups")
    .select(`
      id,
      team_id,
      group_id,
      groups:groups!team_groups_group_id_fkey(id, name, sport_id, category_id)
    `);

  if (error || !data) {
    return [];
  }

  const rows = data as unknown as TeamGroupRow[];

  return rows.map((tg) => ({
    id: tg.id,
    teamId: tg.team_id,
    groupId: tg.group_id,
    groupName: tg.groups?.name || "",
    sportId: tg.groups?.sport_id || "",
    categoryId: tg.groups?.category_id || "",
  }));
}

export async function assignTeamGroupAction(
  teamId: string,
  groupId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = assignTeamGroupSchema.safeParse({ teamId, groupId });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid assignment parameters" };
    }

    const { teamId: validTeamId, groupId: validGroupId } = parsed.data;

    if (!validGroupId || validGroupId === "unassigned") {
      const { error } = await supabase
        .from("team_groups")
        .delete()
        .eq("team_id", validTeamId);

      if (error) {
        console.error("assignTeamGroupAction unassign error:", error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase.from("team_groups").upsert(
        {
          id: crypto.randomUUID(),
          team_id: validTeamId,
          group_id: validGroupId,
        },
        { onConflict: "team_id" }
      );

      if (error) {
        console.error("assignTeamGroupAction assign error:", error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/admin/groups");
    revalidatePath("/admin/teams");
    revalidatePath("/sports");
    revalidatePath("/standings");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign team to group";
    console.error("assignTeamGroupAction exception:", err);
    return { success: false, error: message };
  }
}

export async function clearTeamGroupAssignmentsAction(
  sportId: string,
  categoryGender?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    let groupsQuery = supabase.from("groups").select("id").eq("sport_id", sportId);

    if (categoryGender) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("sport_id", sportId)
        .eq("gender", categoryGender)
        .maybeSingle();

      if (cat?.id) {
        groupsQuery = groupsQuery.eq("category_id", cat.id);
      }
    }

    const { data: groupList, error: grpErr } = await groupsQuery;
    if (grpErr || !groupList || groupList.length === 0) {
      return { success: true };
    }

    const groupIds = groupList.map((g) => g.id);
    const { error: delErr } = await supabase
      .from("team_groups")
      .delete()
      .in("group_id", groupIds);

    if (delErr) {
      console.error("clearTeamGroupAssignmentsAction error:", delErr);
      return { success: false, error: delErr.message };
    }

    revalidatePath("/admin/groups");
    revalidatePath("/admin/teams");
    revalidatePath("/sports");
    revalidatePath("/standings");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to clear team assignments";
    console.error("clearTeamGroupAssignmentsAction exception:", err);
    return { success: false, error: message };
  }
}

"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";
import { CampusDepartmentInfo, INITIAL_CAMPUS_DEPARTMENTS } from "@/lib/campus-store";
import { CampusDepartmentAdmin, CampusAccommodation } from "@/types/tournament";

export type { CampusAccommodation, CampusDepartmentAdmin };

interface CampusDepartmentRow {
  id: string;
  campus_id: string;
  men_count: number | null;
  women_count: number | null;
  staff_men: number | null;
  staff_women: number | null;
  officer_name: string | null;
  officer_phone: string | null;
  officer_email: string | null;
  campuses?: {
    name: string;
    short_code: string;
    city: string;
    state: string;
    is_host: boolean;
  } | null;
}

interface CampusAccommodationRow {
  campus_id: string;
  day_scholar: number | null;
  hosteller: number | null;
  updated_at?: string;
}

const campusDeptSchema = z.object({
  campusId: z.string().min(1).max(50),
  shortCode: z.string().min(1).max(10),
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  isHost: z.boolean().optional(),
  slug: z.string().min(1).max(50),
  menCount: z.number().int().min(0).max(500),
  womenCount: z.number().int().min(0).max(500),
  staffMen: z.number().int().min(0).max(50),
  staffWomen: z.number().int().min(0).max(50),
  officerName: z.string().max(100).optional(),
  officerPhone: z.string().max(30).optional(),
  officerEmail: z.string().max(100).optional(),
});

const adminCampusDeptSchema = campusDeptSchema.extend({
  dayScholar: z.number().int().min(0).max(500),
  hosteller: z.number().int().min(0).max(500),
});

// ----------------------------------------------------------------------------
// PUBLIC ACTIONS (No accommodation data queried or returned)
// ----------------------------------------------------------------------------

export async function getCampusDepartmentsAction(): Promise<CampusDepartmentInfo[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campus_departments")
    .select(`
      id,
      campus_id,
      men_count,
      women_count,
      staff_men,
      staff_women,
      officer_name,
      officer_phone,
      officer_email,
      campuses(name, short_code, city, state, is_host)
    `);

  if (error || !data || data.length === 0) {
    return INITIAL_CAMPUS_DEPARTMENTS;
  }

  const rows = data as unknown as CampusDepartmentRow[];
  const dbMap = new Map<string, CampusDepartmentRow>(
    rows.map((row) => [row.campus_id.toLowerCase(), row])
  );

  return INITIAL_CAMPUS_DEPARTMENTS.map((base) => {
    const row = dbMap.get(base.campusId.toLowerCase());
    if (!row) return base;

    const men = row.men_count ?? base.menCount;
    const women = row.women_count ?? base.womenCount;

    return {
      campusId: base.campusId,
      shortCode: base.shortCode,
      name: base.name,
      city: base.city,
      state: base.state,
      isHost: base.isHost,
      slug: base.slug,
      menCount: men,
      womenCount: women,
      totalCount: men + women,
      staffMen: row.staff_men ?? base.staffMen,
      staffWomen: row.staff_women ?? base.staffWomen,
      officerName: row.officer_name || base.officerName || "",
      officerPhone: row.officer_phone || base.officerPhone || "",
      officerEmail: row.officer_email || base.officerEmail || "",
    };
  });
}

export async function saveCampusDepartmentAction(
  dept: CampusDepartmentInfo
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = campusDeptSchema.safeParse(dept);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid department data" };
    }

    const validDept = parsed.data;

    const { error } = await supabase.from("campus_departments").upsert(
      {
        campus_id: validDept.campusId.toLowerCase(),
        men_count: validDept.menCount,
        women_count: validDept.womenCount,
        staff_men: validDept.staffMen,
        staff_women: validDept.staffWomen,
        officer_name: validDept.officerName || "",
        officer_phone: validDept.officerPhone || "",
        officer_email: validDept.officerEmail || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campus_id" }
    );

    if (error) {
      console.error("saveCampusDepartmentAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/campuses");
    revalidatePath(`/campuses/${validDept.slug}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save campus department";
    console.error("saveCampusDepartmentAction exception:", err);
    return { success: false, error: message };
  }
}

// ----------------------------------------------------------------------------
// ADMIN ACTIONS (Secure accommodation data handled in campus_accommodation table)
// ----------------------------------------------------------------------------

export async function getAdminCampusDepartmentsAction(): Promise<CampusDepartmentAdmin[]> {
  const { supabase } = await verifyAdminSession();

  const [deptRes, accomRes] = await Promise.all([
    supabase
      .from("campus_departments")
      .select(`
        id,
        campus_id,
        men_count,
        women_count,
        staff_men,
        staff_women,
        officer_name,
        officer_phone,
        officer_email,
        campuses(name, short_code, city, state, is_host)
      `),
    supabase
      .from("campus_accommodation")
      .select("campus_id, day_scholar, hosteller, updated_at"),
  ]);

  const rows = (deptRes.data || []) as unknown as CampusDepartmentRow[];
  const dbMap = new Map<string, CampusDepartmentRow>(
    rows.map((row) => [row.campus_id.toLowerCase(), row])
  );

  const accomRows = (accomRes.data || []) as unknown as CampusAccommodationRow[];
  const accomMap = new Map<string, CampusAccommodationRow>(
    accomRows.map((r) => [r.campus_id.toLowerCase(), r])
  );

  return INITIAL_CAMPUS_DEPARTMENTS.map((base) => {
    const row = dbMap.get(base.campusId.toLowerCase());
    const accom = accomMap.get(base.campusId.toLowerCase());

    const men = row ? (row.men_count ?? base.menCount) : base.menCount;
    const women = row ? (row.women_count ?? base.womenCount) : base.womenCount;

    return {
      id: row?.id || `dept-${base.campusId}`,
      campusId: base.campusId,
      shortCode: base.shortCode,
      name: base.name,
      city: base.city,
      state: base.state,
      isHost: base.isHost,
      slug: base.slug,
      menCount: men,
      womenCount: women,
      totalCount: men + women,
      staffMen: row ? (row.staff_men ?? base.staffMen) : base.staffMen,
      staffWomen: row ? (row.staff_women ?? base.staffWomen) : base.staffWomen,
      dayScholar: accom?.day_scholar ?? 0,
      hosteller: accom?.hosteller ?? 0,
      officerName: row?.officer_name || base.officerName || "",
      officerPhone: row?.officer_phone || base.officerPhone || "",
      officerEmail: row?.officer_email || base.officerEmail || "",
      updatedAt: accom?.updated_at || undefined,
    };
  });
}

export async function saveAdminCampusDepartmentAction(
  dept: CampusDepartmentAdmin
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = adminCampusDeptSchema.safeParse(dept);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid department data" };
    }

    const validDept = parsed.data;

    // 1. Save public department fields to campus_departments
    const { error: deptError } = await supabase.from("campus_departments").upsert(
      {
        campus_id: validDept.campusId.toLowerCase(),
        men_count: validDept.menCount,
        women_count: validDept.womenCount,
        staff_men: validDept.staffMen,
        staff_women: validDept.staffWomen,
        officer_name: validDept.officerName || "",
        officer_phone: validDept.officerPhone || "",
        officer_email: validDept.officerEmail || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campus_id" }
    );

    if (deptError) {
      console.error("saveAdminCampusDepartmentAction dept error:", deptError);
      return { success: false, error: deptError.message };
    }

    // 2. Save private accommodation numbers to admin-only campus_accommodation table
    const { error: accomError } = await supabase.from("campus_accommodation").upsert(
      {
        campus_id: validDept.campusId.toLowerCase(),
        day_scholar: validDept.dayScholar,
        hosteller: validDept.hosteller,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "campus_id" }
    );

    if (accomError) {
      console.error("saveAdminCampusDepartmentAction accommodation error:", accomError);
      return { success: false, error: accomError.message };
    }

    revalidatePath("/campuses");
    revalidatePath(`/campuses/${validDept.slug}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save admin campus department";
    console.error("saveAdminCampusDepartmentAction exception:", err);
    return { success: false, error: message };
  }
}

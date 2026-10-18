"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";

export interface AnnouncementItem {
  id: string;
  title?: string;
  content: string;
  startTime: string;
  endTime: string;
  priority: number;
}

interface AnnouncementRow {
  id: string;
  title: string | null;
  content: string;
  priority: number | null;
  start_time: string | null;
  end_time: string | null;
}

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().max(150).optional(),
  content: z.string().min(1, "Announcement content cannot be empty").max(1000),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  priority: z.number().int().min(1).max(100).default(1),
});

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ann-1",
    title: "Championship Welcome",
    content: "Welcome to SVKM's NMIMS Inter Campus Sports Championship 2026-27 at MPTP Shirpur Campus!",
    startTime: "2026-10-25T08:00",
    endTime: "2026-10-31T22:00",
    priority: 1,
  },
  {
    id: "ann-2",
    title: "Team Reporting Notice",
    content: "Teams must report on 26th October 2026 by 12:00 Noon. Complimentary travel pick-up available from railway stations and airports.",
    startTime: "2026-10-25T08:00",
    endTime: "2026-10-27T12:00",
    priority: 2,
  },
  {
    id: "ann-3",
    title: "Accreditation & Eligibility",
    content: "Submit signed Eligibility Proforma and college ID on arrival at the accreditation desk.",
    startTime: "2026-10-25T08:00",
    endTime: "2026-10-28T18:00",
    priority: 3,
  },
];

export async function getAnnouncementsAction(): Promise<AnnouncementItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, content, priority, start_time, end_time")
    .order("priority", { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_ANNOUNCEMENTS;
  }

  const rows = data as unknown as AnnouncementRow[];

  return rows.map((a) => ({
    id: a.id,
    title: a.title || "",
    content: a.content,
    priority: a.priority ?? 1,
    startTime: a.start_time ? a.start_time.substring(0, 16) : "2026-10-26T09:00",
    endTime: a.end_time ? a.end_time.substring(0, 16) : "2026-10-31T20:00",
  }));
}

export async function saveAnnouncementAction(
  item: AnnouncementItem
): Promise<{ success: boolean; announcement?: AnnouncementItem; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = announcementSchema.safeParse(item);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid announcement details" };
    }

    const validItem = parsed.data;

    const isUuid =
      validItem.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        validItem.id
      );

    const payload = {
      id: isUuid && validItem.id ? validItem.id : crypto.randomUUID(),
      title: validItem.title?.trim() || validItem.content.slice(0, 50).trim(),
      content: validItem.content.trim(),
      priority: validItem.priority || 1,
      start_time: new Date(validItem.startTime).toISOString(),
      end_time: new Date(validItem.endTime).toISOString(),
      published_at: new Date(validItem.startTime).toISOString(),
      expires_at: new Date(validItem.endTime).toISOString(),
    };

    const { data, error } = await supabase
      .from("announcements")
      .upsert(payload)
      .select("id, title, content, priority, start_time, end_time")
      .single();

    if (error) {
      console.error("saveAnnouncementAction error:", error);
      return { success: false, error: error.message };
    }

    const row = data as AnnouncementRow;
    const resultItem: AnnouncementItem = {
      id: row.id,
      title: row.title || "",
      content: row.content,
      priority: row.priority ?? 1,
      startTime: row.start_time ? row.start_time.substring(0, 16) : validItem.startTime,
      endTime: row.end_time ? row.end_time.substring(0, 16) : validItem.endTime,
    };

    revalidatePath("/home");
    return { success: true, announcement: resultItem };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save announcement";
    console.error("saveAnnouncementAction exception:", err);
    return { success: false, error: message };
  }
}

export async function deleteAnnouncementAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    if (!id || typeof id !== "string") {
      return { success: false, error: "Announcement ID is required" };
    }

    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      console.error("deleteAnnouncementAction error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/home");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete announcement";
    console.error("deleteAnnouncementAction exception:", err);
    return { success: false, error: message };
  }
}

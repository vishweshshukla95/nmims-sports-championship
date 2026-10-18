"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";
import { ContactPerson, LEADERSHIP_CONFIG, COMMITTEE_CONFIG } from "@/config/contacts";

interface ContactRow {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  group: string;
  sort_order: number;
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  role: z.string().min(1, "Role is required").max(150),
  phone: z.string().max(30).nullable().optional(),
  cleanPhone: z.string().max(30).nullable().optional(),
  group: z.enum(["leadership", "committee"]).default("committee"),
});

const contactsListSchema = z.array(contactSchema).max(100);

export async function getContactsAction(): Promise<ContactPerson[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, role, phone, group, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return [LEADERSHIP_CONFIG, ...COMMITTEE_CONFIG];
  }

  const rows = data as unknown as ContactRow[];

  return rows.map((c) => ({
    name: c.name,
    role: c.role,
    phone: c.phone || null,
    cleanPhone: c.phone ? c.phone.replace(/[^0-9]/g, "") : null,
    group: (c.group === "leadership" ? "leadership" : "committee") as "leadership" | "committee",
  }));
}

export async function saveContactsAction(
  contacts: ContactPerson[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = contactsListSchema.safeParse(contacts);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid contact data" };
    }

    // Clear existing contacts
    const { error: delErr } = await supabase
      .from("contacts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (delErr) {
      console.error("saveContactsAction delete error:", delErr);
      return { success: false, error: "Failed to reset contacts list" };
    }

    const rows = parsed.data.map((c, idx) => ({
      id: crypto.randomUUID(),
      name: c.name.trim(),
      role: c.role.trim(),
      phone: c.phone?.trim() || null,
      group: c.group || "committee",
      sort_order: idx + 1,
    }));

    const { error: insErr } = await supabase.from("contacts").insert(rows);
    if (insErr) {
      console.error("saveContactsAction insert error:", insErr);
      return { success: false, error: "Failed to insert contacts" };
    }

    revalidatePath("/contact");
    revalidatePath("/home");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save contacts";
    console.error("saveContactsAction exception:", err);
    return { success: false, error: message };
  }
}

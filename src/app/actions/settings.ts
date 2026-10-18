"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "./admin-auth";
import { TOURNAMENT_CONFIG } from "@/config/tournament";
import { CHAMPIONSHIP_FAQS, FAQItem } from "@/components/ui/FAQAccordion";

export interface SiteSettings {
  venue: string;
  reporting: string;
  faqs: FAQItem[];
}

interface SiteConfigRow {
  key: string;
  value: unknown;
}

const faqItemSchema = z.object({
  q: z.string().min(1).max(300),
  a: z.string().min(1).max(2000),
});

const siteSettingsSchema = z.object({
  venue: z.string().min(1, "Venue is required").max(500),
  reporting: z.string().min(1, "Reporting text is required").max(1000),
  faqs: z.array(faqItemSchema).max(50),
});

export async function getSiteSettingsAction(): Promise<SiteSettings> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("key, value")
    .in("key", ["venue_address", "reporting_text", "faqs"]);

  let venue = TOURNAMENT_CONFIG.venueAddress;
  let reporting = TOURNAMENT_CONFIG.reportingText;
  let faqs = CHAMPIONSHIP_FAQS;

  if (!error && data) {
    const rows = data as unknown as SiteConfigRow[];
    rows.forEach((row) => {
      if (row.key === "venue_address" && typeof row.value === "string") venue = row.value;
      if (row.key === "reporting_text" && typeof row.value === "string") reporting = row.value;
      if (row.key === "faqs") {
        if (Array.isArray(row.value)) {
          faqs = row.value as FAQItem[];
        } else if (typeof row.value === "string") {
          try {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed)) faqs = parsed;
          } catch {
            // keep fallback
          }
        }
      }
    });
  }

  return { venue, reporting, faqs };
}

export async function saveSiteSettingsAction(
  settings: SiteSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await verifyAdminSession();

    const parsed = siteSettingsSchema.safeParse(settings);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue ? issue.message : "Invalid settings" };
    }

    const valid = parsed.data;

    const upserts = [
      { key: "venue_address", value: valid.venue, updated_at: new Date().toISOString() },
      { key: "reporting_text", value: valid.reporting, updated_at: new Date().toISOString() },
      { key: "faqs", value: JSON.stringify(valid.faqs), updated_at: new Date().toISOString() },
    ];

    for (const row of upserts) {
      const { error } = await supabase.from("site_config").upsert(row, { onConflict: "key" });
      if (error) {
        console.error("saveSiteSettingsAction error:", error);
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/home");
    revalidatePath("/rules");
    revalidatePath("/contact");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    console.error("saveSiteSettingsAction exception:", err);
    return { success: false, error: message };
  }
}

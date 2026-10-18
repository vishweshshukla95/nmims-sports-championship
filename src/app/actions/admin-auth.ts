import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface VerifiedAdmin {
  id: string;
  email: string;
  role: "super_admin" | "admin";
  sports: string[];
}

export async function verifyAdminSession(requireSuperAdmin = false) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    throw new Error("Not authorised: No active user session.");
  }

  const { data: adminRecord, error: adminErr } = await supabase
    .from("admins")
    .select("id, email, role, sports")
    .eq("email", user.email.toLowerCase().trim())
    .maybeSingle();

  if (adminErr || !adminRecord) {
    throw new Error("Not authorised: Email not registered in admins directory.");
  }

  const admin: VerifiedAdmin = {
    id: adminRecord.id,
    email: adminRecord.email,
    role: adminRecord.role,
    sports: adminRecord.sports || [],
  };

  if (requireSuperAdmin && admin.role !== "super_admin") {
    throw new Error("Forbidden: Action requires super_admin privileges.");
  }

  return { supabase, user, admin };
}

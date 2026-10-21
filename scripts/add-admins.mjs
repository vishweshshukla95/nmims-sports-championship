
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

// ✏️ Put the real emails here
const ADMINS = [
  { email: "tushar.email@example.com", role: "admin" },
  { email: "aryan.email@example.com",  role: "admin" },
  { email: "mehi.email@example.com",   role: "admin" },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing env vars in .env.local"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

const genPass = () => "Nm" + crypto.randomBytes(6).toString("base64url") + "9a";

for (const { email, role } of ADMINS) {
  const e = email.trim().toLowerCase();
  const password = genPass();
  const { error: authErr } = await sb.auth.admin.createUser({ email: e, password, email_confirm: true });
  const exists = authErr && /already|registered|exists/i.test(authErr.message);
  if (authErr && !exists) { console.error(`❌ ${e}: ${authErr.message}`); continue; }
  const { error: dbErr } = await sb.from("admins").upsert({ email: e, role }, { onConflict: "email" });
  if (dbErr) { console.error(`❌ ${e} (admins table): ${dbErr.message}`); continue; }
  console.log(exists
    ? `✅ ${e} — already had a login, now an admin (use their existing password)`
    : `✅ ${e} — admin created | temp password: ${password}`);
}

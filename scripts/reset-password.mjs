import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.argv[2] || "").trim().toLowerCase();
const pw = process.env.NEW_PW || "";

if (!url || !key) { console.error("❌ Missing Supabase env vars in .env.local"); process.exit(1); }
if (!email) { console.error("❌ Usage: node --env-file=.env.local scripts/reset-password.mjs <email>"); process.exit(1); }
if (pw.length < 8) { console.error("❌ Password must be at least 8 characters"); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (error) { console.error("❌", error.message); process.exit(1); }

const user = data.users.find((u) => (u.email || "").toLowerCase() === email);
if (!user) { console.error("❌ No user found with email", email); process.exit(1); }

const { error: upErr } = await sb.auth.admin.updateUserById(user.id, { password: pw, email_confirm: true });
if (upErr) { console.error("❌", upErr.message); process.exit(1); }
console.log("✅ Password updated for", email);

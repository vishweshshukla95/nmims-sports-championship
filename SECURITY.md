# Security Policy & Incident Response Guide

## SVKM's NMIMS Inter Campus Sports Championship 2026-27

### 1. Incident Response Checklist

In the event of suspected key leakage, unauthorized administrative activity, or security incidents:

#### Step 1: Rotate Supabase Keys
1. Navigate to the **Supabase Dashboard** -> Project Settings -> **API**.
2. Under **Project API keys**, click **Generate new secret key** for `service_role`.
3. Update the `SUPABASE_SERVICE_ROLE_KEY` in:
   - **Vercel Project Settings** -> Environment Variables (Production & Preview).
   - Local `.env.local` files on trusted administrator machines.
4. If the `anon` key is suspected compromised, regenerate the `anon` public key, update `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel, and trigger a redeployment.

#### Step 2: Revoke or Demote an Administrator
1. Sign in as `super_admin` to the portal at `/admin/users`.
2. Locate the compromised email account and click **Remove Admin**.
3. Alternatively, via Supabase SQL Editor:
   ```sql
   DELETE FROM public.admins WHERE email = 'compromised_email@example.com';
   ```
4. Revoke active sessions in **Supabase Auth** -> Users -> select user -> **Log out user** (or delete user).

#### Step 3: Database Rollback & Point-in-Time Recovery
1. Supabase Pro/Team projects maintain automatic WAL backups.
2. Go to **Supabase Dashboard** -> Database -> **Backups**.
3. Select the desired restore timestamp prior to the incident and initiate Point-in-Time Recovery (PITR).
4. For manual emergency snapshot restoration, execute database dump migrations located in `supabase/migrations/`.

---

### 2. Supply Chain & Code Hardening
- Dependencies are locked via `package-lock.json` and validated through `npm audit`.
- Server actions and API routes use `zod` validation and verify administrative session cookies before writing.
- Service role keys are isolated exclusively in server-only modules (`src/lib/supabase/admin.ts`).
- All admin entry points are protected by `@supabase/ssr` session checks in `src/middleware.ts`.

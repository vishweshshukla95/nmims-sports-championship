# Production Deployment Guide: SVKM'S NMIMS Inter Campus Sports Championship 2026-27

This guide covers deploying the official website to **Vercel** with a custom domain and setting up the **Supabase** backend.

---

## 1. Supabase Backend Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/001_init.sql` from this codebase, copy its entire contents, paste it into the SQL editor, and click **Run**.
4. Open `supabase/seed.sql`, paste its contents into the SQL editor, and click **Run**.
   - This sets up all 6 sports, the 10 categories, the 7 campuses with cities, all 70 seeded teams, default MVP multipliers, and key contacts.
5. In Supabase Dashboard, go to **Settings → API** and copy:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - anon public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role secret key (`SUPABASE_SERVICE_ROLE_KEY`)
6. Go to **Storage**, create a public bucket named `gallery`, and set the file upload limit to 10 MB with MIME types `image/webp, image/jpeg, image/png`.

---

## 2. GitHub & Vercel Deployment

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/your-username/nmims-sports-championship.git
   git branch -M main
   git push -u origin main
   ```
2. Open [Vercel](https://vercel.com) and click **"Add New Project"** → **"Import Git Repository"**.
3. Select your repository.
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
5. Under Build Command, ensure it is `next build --webpack` (default configured in `package.json`).
6. Click **Deploy**.

---

## 3. Custom Domain & DNS Configuration

1. Purchase your domain (e.g., from Namecheap, GoDaddy, or Cloudflare).
2. In your Vercel project dashboard:
   - Navigate to **Settings → Domains**.
   - Add your apex domain (e.g., `nmimssports.com`) and `www.nmimssports.com`.
3. Configure your domain registrar's DNS records:
   - **A Record**:
     - Host: `@`
     - Value: `76.76.21.21`
   - **CNAME Record**:
     - Host: `www`
     - Value: `cname.vercel-dns.com`
4. Wait 5–15 minutes for DNS propagation. Vercel will automatically provision and issue an SSL/TLS HTTPS certificate.
5. Verify SSL/TLS is active by opening `https://nmimssports.com`.

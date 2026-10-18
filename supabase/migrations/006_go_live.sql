-- ============================================================================
-- SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27
-- Migration 006: Go-Live Hardening (Security, RLS, Constraints, & Cleanup)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HARDEN IS_ADMIN() FUNCTION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(auth.jwt()->>'email'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Ensure super_admin vishweshshukla95@gmail.com is present with all sports access
INSERT INTO public.admins (email, role, sports)
VALUES (
  'vishweshshukla95@gmail.com',
  'super_admin',
  ARRAY['cricket', 'football', 'basketball', 'volleyball', 'table-tennis', 'lawn-tennis']
)
ON CONFLICT (email) DO UPDATE SET
  role = 'super_admin',
  sports = EXCLUDED.sports;

-- ----------------------------------------------------------------------------
-- 2. HARDEN ADMINS TABLE RLS (NO PUBLIC READ)
-- ----------------------------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read admins" ON public.admins;
DROP POLICY IF EXISTS "Admins read own or all if admin" ON public.admins;
DROP POLICY IF EXISTS "Admin write admins" ON public.admins;

-- Users may only read their own row, or all rows if they are an admin
CREATE POLICY "Admins read own or all if admin" ON public.admins
FOR SELECT TO authenticated
USING (
  LOWER(TRIM(email)) = LOWER(TRIM(auth.jwt()->>'email'))
  OR public.is_admin()
);

-- Only existing admins can insert, update, or delete admin entries
CREATE POLICY "Admin write admins" ON public.admins
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. ISOLATE PRIVATE ACCOMMODATION DATA (DAY SCHOLAR / HOSTELLER NUMBERS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campus_accommodation (
  campus_id TEXT PRIMARY KEY REFERENCES public.campuses(id) ON DELETE CASCADE,
  day_scholar INT DEFAULT 0 CHECK (day_scholar >= 0),
  hosteller INT DEFAULT 0 CHECK (hosteller >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migrate existing numbers from campus_departments if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campus_departments' AND column_name = 'day_scholar'
  ) THEN
    INSERT INTO public.campus_accommodation (campus_id, day_scholar, hosteller, updated_at)
    SELECT campus_id, COALESCE(day_scholar, 0), COALESCE(hosteller, 0), NOW()
    FROM public.campus_departments
    ON CONFLICT (campus_id) DO UPDATE SET
      day_scholar = EXCLUDED.day_scholar,
      hosteller = EXCLUDED.hosteller,
      updated_at = NOW();
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS on campus_accommodation: strictly ADMIN-ONLY SELECT & WRITE
ALTER TABLE public.campus_accommodation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin only read campus_accommodation" ON public.campus_accommodation;
CREATE POLICY "Admin only read campus_accommodation" ON public.campus_accommodation
FOR SELECT TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admin write campus_accommodation" ON public.campus_accommodation;
CREATE POLICY "Admin write campus_accommodation" ON public.campus_accommodation
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. CONSTRAINTS & DATA INTEGRITY
-- ----------------------------------------------------------------------------

-- Matches constraints: match_no > 0
DO $$
BEGIN
  ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_match_no_positive;
  ALTER TABLE public.matches ADD CONSTRAINT matches_match_no_positive CHECK (match_no > 0);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Points adjustments: delta between -100 and +100
DO $$
BEGIN
  ALTER TABLE public.points_adjustments DROP CONSTRAINT IF EXISTS points_adjustments_delta_range;
  ALTER TABLE public.points_adjustments ADD CONSTRAINT points_adjustments_delta_range CHECK (delta >= -100 AND delta <= 100);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Contacts: role and name not empty
DO $$
BEGIN
  ALTER TABLE public.contacts ALTER COLUMN name SET NOT NULL;
  ALTER TABLE public.contacts ALTER COLUMN role SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Announcements: content not empty
DO $$
BEGIN
  ALTER TABLE public.announcements ALTER COLUMN content SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 5. STORAGE BUCKET RLS (GALLERY)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove any overly permissive legacy policies
DROP POLICY IF EXISTS "Public read storage gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin write storage gallery" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to gallery" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Strict public read for gallery bucket
CREATE POLICY "Public read storage gallery" ON storage.objects
FOR SELECT
USING (bucket_id = 'gallery');

-- Strict admin write for gallery bucket
CREATE POLICY "Admin write storage gallery" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'gallery' AND public.is_admin())
WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. PURGE TEST / DEMO DATA
-- ----------------------------------------------------------------------------

-- Purge test matches
DELETE FROM public.matches
WHERE id ILIKE 'test%'
   OR notes ILIKE '%test match%'
   OR result_text ILIKE '%test%';

-- Purge test announcements
DELETE FROM public.announcements
WHERE title ILIKE '%test%'
   OR content ILIKE '%test announcement%'
   OR content ILIKE '%placeholder%';

-- Purge test players
DELETE FROM public.players
WHERE name ILIKE '%test player%'
   OR name ILIKE 'test %'
   OR id ILIKE 'test%';

-- Purge test groups
DELETE FROM public.groups
WHERE name ILIKE '%test%';

-- Verify clean state
SELECT 'Matches remaining: ' || count(*)::text FROM public.matches;
SELECT 'Announcements remaining: ' || count(*)::text FROM public.announcements;
SELECT 'Admins registered: ' || count(*)::text FROM public.admins;

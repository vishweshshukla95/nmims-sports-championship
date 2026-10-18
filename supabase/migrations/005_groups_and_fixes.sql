-- ============================================================================
-- SVKM's NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27
-- Migration 005: Admin-Controlled Groups, Table Schema Fixes, and RLS Policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. IS_ADMIN() FUNCTION WITH CASE-INSENSITIVE EMAIL & EXPLICIT SEARCH PATH
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Grant execute on is_admin to authenticated & anon
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Ensure super_admin vishweshshukla95@gmail.com is in admins table
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
-- 2. GROUPS TABLE & TEAM_GROUPS REFACTOR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (category_id, name)
);

-- Recreate team_groups with group_id reference
DROP TABLE IF EXISTS public.team_groups CASCADE;
CREATE TABLE public.team_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id)
);

-- Add group_id to matches and update round check constraint
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS group_id UUID NULL REFERENCES public.groups(id) ON DELETE SET NULL;

ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_round_check;
ALTER TABLE public.matches ADD CONSTRAINT matches_round_check CHECK (
  round IN ('Group Stage', 'Group A', 'Group B', 'League', 'Quarter-Final', 'Semi-Final', '3rd Place', 'Final')
);

-- ----------------------------------------------------------------------------
-- 3. ANNOUNCEMENTS TABLE SCHEMA FIXES
-- ----------------------------------------------------------------------------
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ----------------------------------------------------------------------------
-- 4. CONTACTS TABLE SCHEMA FIXES
-- ----------------------------------------------------------------------------
ALTER TABLE public.contacts DROP CONSTRAINT IF EXISTS contacts_group_check;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_group_check CHECK ("group" IN ('leadership', 'committee', 'director'));
ALTER TABLE public.contacts ALTER COLUMN phone DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 5. GALLERY_IMAGES TABLE SCHEMA FIXES
-- ----------------------------------------------------------------------------
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.gallery_images ALTER COLUMN caption SET DEFAULT '';

-- ----------------------------------------------------------------------------
-- 6. CAMPUS_DEPARTMENTS UNIQUE CONSTRAINT
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'campus_departments_campus_id_key'
  ) THEN
    ALTER TABLE public.campus_departments ADD CONSTRAINT campus_departments_campus_id_key UNIQUE (campus_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) FOR ALL 12 TABLES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 1. ANNOUNCEMENTS
DROP POLICY IF EXISTS "Public read announcements" ON public.announcements;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write announcements" ON public.announcements;
CREATE POLICY "Admin write announcements" ON public.announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. GROUPS
DROP POLICY IF EXISTS "Public read groups" ON public.groups;
CREATE POLICY "Public read groups" ON public.groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write groups" ON public.groups;
CREATE POLICY "Admin write groups" ON public.groups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. TEAM_GROUPS
DROP POLICY IF EXISTS "Public read team_groups" ON public.team_groups;
CREATE POLICY "Public read team_groups" ON public.team_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write team_groups" ON public.team_groups;
CREATE POLICY "Admin write team_groups" ON public.team_groups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. MATCHES
DROP POLICY IF EXISTS "Public read matches" ON public.matches;
CREATE POLICY "Public read matches" ON public.matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write matches" ON public.matches;
CREATE POLICY "Admin write matches" ON public.matches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. TEAMS
DROP POLICY IF EXISTS "Public read teams" ON public.teams;
CREATE POLICY "Public read teams" ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write teams" ON public.teams;
CREATE POLICY "Admin write teams" ON public.teams FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. PLAYERS
DROP POLICY IF EXISTS "Public read players" ON public.players;
CREATE POLICY "Public read players" ON public.players FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write players" ON public.players;
CREATE POLICY "Admin write players" ON public.players FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. POINTS_ADJUSTMENTS
DROP POLICY IF EXISTS "Public read points_adjustments" ON public.points_adjustments;
CREATE POLICY "Public read points_adjustments" ON public.points_adjustments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write points_adjustments" ON public.points_adjustments;
CREATE POLICY "Admin write points_adjustments" ON public.points_adjustments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. CONTACTS
DROP POLICY IF EXISTS "Public read contacts" ON public.contacts;
CREATE POLICY "Public read contacts" ON public.contacts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write contacts" ON public.contacts;
CREATE POLICY "Admin write contacts" ON public.contacts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9. CAMPUS_DEPARTMENTS
DROP POLICY IF EXISTS "Public read campus_departments" ON public.campus_departments;
CREATE POLICY "Public read campus_departments" ON public.campus_departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write campus_departments" ON public.campus_departments;
CREATE POLICY "Admin write campus_departments" ON public.campus_departments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10. SITE_CONFIG
DROP POLICY IF EXISTS "Public read site_config" ON public.site_config;
CREATE POLICY "Public read site_config" ON public.site_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write site_config" ON public.site_config;
CREATE POLICY "Admin write site_config" ON public.site_config FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 11. GALLERY_IMAGES
DROP POLICY IF EXISTS "Public read gallery_images" ON public.gallery_images;
CREATE POLICY "Public read gallery_images" ON public.gallery_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write gallery_images" ON public.gallery_images;
CREATE POLICY "Admin write gallery_images" ON public.gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 12. ADMINS
DROP POLICY IF EXISTS "Public read admins" ON public.admins;
CREATE POLICY "Public read admins" ON public.admins FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write admins" ON public.admins;
CREATE POLICY "Admin write admins" ON public.admins FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Storage Bucket for Gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read storage gallery" ON storage.objects;
CREATE POLICY "Public read storage gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin write storage gallery" ON storage.objects;
CREATE POLICY "Admin write storage gallery" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'gallery' AND public.is_admin()) WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

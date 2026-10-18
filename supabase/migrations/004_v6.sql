-- ============================================================================
-- 004_v6.sql
-- SVKM's NMIMS Inter Campus Sports Championship 2026-27 (v6 Final Structure)
-- ============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. NAME SPELLING: "SVKM'S" -> "SVKM's"
-- ----------------------------------------------------------------------------
UPDATE editions
SET name = REPLACE(name, 'SVKM''S', 'SVKM''s')
WHERE name LIKE '%SVKM''S%';

-- ----------------------------------------------------------------------------
-- 2. REMOVE MVP EVERYWHERE & DROP UNUSED STAT VIEWS / TABLES
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_cricket_mvp CASCADE;
DROP VIEW IF EXISTS v_football_assists CASCADE;
DROP VIEW IF EXISTS v_football_mvp CASCADE;
DROP VIEW IF EXISTS v_basketball_threes CASCADE;
DROP VIEW IF EXISTS v_basketball_mvp CASCADE;
DROP VIEW IF EXISTS v_volleyball_blocks CASCADE;
DROP VIEW IF EXISTS v_volleyball_mvp CASCADE;
DROP VIEW IF EXISTS v_tt_most_wins CASCADE;
DROP VIEW IF EXISTS v_tt_most_games CASCADE;
DROP VIEW IF EXISTS v_tt_mvp CASCADE;
DROP VIEW IF EXISTS v_tennis_most_wins CASCADE;
DROP VIEW IF EXISTS v_tennis_most_sets CASCADE;
DROP VIEW IF EXISTS v_tennis_mvp CASCADE;

DROP TABLE IF EXISTS mvp_rules CASCADE;

-- ----------------------------------------------------------------------------
-- 3. TEAMS: OFFICIAL 50 TEAMS INSERT & SQUAD SIZES
-- ----------------------------------------------------------------------------
ALTER TABLE teams ADD COLUMN IF NOT EXISTS squad_size INT DEFAULT 12;

-- Insert all official 50 teams
INSERT INTO teams (id, campus_id, sport_id, category_id, name, squad_size) VALUES
-- Cricket Men (7)
('mum-cricket-men', 'mum', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Mumbai – Cricket (Men)', 17),
('shi-cricket-men', 'shi', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Shirpur (Host) – Cricket (Men)', 16),
('blr-cricket-men', 'blr', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Bengaluru – Cricket (Men)', 15),
('hyd-cricket-men', 'hyd', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Hyderabad – Cricket (Men)', 16),
('ind-cricket-men', 'ind', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Indore – Cricket (Men)', 16),
('nvm-cricket-men', 'nvm', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Navi Mumbai – Cricket (Men)', 16),
('chd-cricket-men', 'chd', 'cricket', (SELECT id FROM categories WHERE sport_id = 'cricket' AND gender = 'men'), 'NMIMS Chandigarh – Cricket (Men)', 16),

-- Football Men (7)
('mum-football-men', 'mum', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Mumbai – Football (Men)', 18),
('shi-football-men', 'shi', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Shirpur (Host) – Football (Men)', 20),
('blr-football-men', 'blr', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Bengaluru – Football (Men)', 14),
('hyd-football-men', 'hyd', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Hyderabad – Football (Men)', 20),
('ind-football-men', 'ind', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Indore – Football (Men)', 18),
('nvm-football-men', 'nvm', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Navi Mumbai – Football (Men)', 18),
('chd-football-men', 'chd', 'football', (SELECT id FROM categories WHERE sport_id = 'football' AND gender = 'men'), 'NMIMS Chandigarh – Football (Men)', 18),

-- Basketball Men (7)
('mum-basketball-men', 'mum', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Mumbai – Basketball (Men)', 12),
('shi-basketball-men', 'shi', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Shirpur (Host) – Basketball (Men)', 12),
('blr-basketball-men', 'blr', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Bengaluru – Basketball (Men)', 12),
('hyd-basketball-men', 'hyd', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Hyderabad – Basketball (Men)', 12),
('ind-basketball-men', 'ind', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Indore – Basketball (Men)', 12),
('nvm-basketball-men', 'nvm', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Navi Mumbai – Basketball (Men)', 12),
('chd-basketball-men', 'chd', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'men'), 'NMIMS Chandigarh – Basketball (Men)', 12),

-- Basketball Women (7)
('mum-basketball-women', 'mum', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Mumbai – Basketball (Women)', 12),
('shi-basketball-women', 'shi', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Shirpur (Host) – Basketball (Women)', 12),
('blr-basketball-women', 'blr', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Bengaluru – Basketball (Women)', 8),
('hyd-basketball-women', 'hyd', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Hyderabad – Basketball (Women)', 10),
('ind-basketball-women', 'ind', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Indore – Basketball (Women)', 9),
('nvm-basketball-women', 'nvm', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Navi Mumbai – Basketball (Women)', 12),
('chd-basketball-women', 'chd', 'basketball', (SELECT id FROM categories WHERE sport_id = 'basketball' AND gender = 'women'), 'NMIMS Chandigarh – Basketball (Women)', 10),

-- Volleyball Men (7)
('mum-volleyball-men', 'mum', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Mumbai – Volleyball (Men)', 12),
('shi-volleyball-men', 'shi', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Shirpur (Host) – Volleyball (Men)', 12),
('blr-volleyball-men', 'blr', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Bengaluru – Volleyball (Men)', 7),
('hyd-volleyball-men', 'hyd', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Hyderabad – Volleyball (Men)', 12),
('ind-volleyball-men', 'ind', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Indore – Volleyball (Men)', 12),
('nvm-volleyball-men', 'nvm', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Navi Mumbai – Volleyball (Men)', 12),
('chd-volleyball-men', 'chd', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'men'), 'NMIMS Chandigarh – Volleyball (Men)', 11),

-- Volleyball Women (6)
('shi-volleyball-women', 'shi', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'women'), 'NMIMS Shirpur (Host) – Volleyball (Women)', 12),
('blr-volleyball-women', 'blr', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'women'), 'NMIMS Bengaluru – Volleyball (Women)', 8),
('hyd-volleyball-women', 'hyd', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'women'), 'NMIMS Hyderabad – Volleyball (Women)', 10),
('ind-volleyball-women', 'ind', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'women'), 'NMIMS Indore – Volleyball (Women)', 8),
('nvm-volleyball-women', 'nvm', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'women'), 'NMIMS Navi Mumbai – Volleyball (Women)', 12),
('chd-volleyball-women', 'chd', 'volleyball', (SELECT id FROM categories WHERE sport_id = 'volleyball' AND gender = 'women'), 'NMIMS Chandigarh – Volleyball (Women)', 8),

-- Lawn Tennis Men (5)
('mum-lawn-tennis-men', 'mum', 'lawn-tennis', (SELECT id FROM categories WHERE sport_id = 'lawn-tennis' AND gender = 'men'), 'NMIMS Mumbai – Lawn Tennis (Men)', 5),
('shi-lawn-tennis-men', 'shi', 'lawn-tennis', (SELECT id FROM categories WHERE sport_id = 'lawn-tennis' AND gender = 'men'), 'NMIMS Shirpur (Host) – Lawn Tennis (Men)', 5),
('blr-lawn-tennis-men', 'blr', 'lawn-tennis', (SELECT id FROM categories WHERE sport_id = 'lawn-tennis' AND gender = 'men'), 'NMIMS Bengaluru – Lawn Tennis (Men)', 2),
('hyd-lawn-tennis-men', 'hyd', 'lawn-tennis', (SELECT id FROM categories WHERE sport_id = 'lawn-tennis' AND gender = 'men'), 'NMIMS Hyderabad – Lawn Tennis (Men)', 2),
('chd-lawn-tennis-men', 'chd', 'lawn-tennis', (SELECT id FROM categories WHERE sport_id = 'lawn-tennis' AND gender = 'men'), 'NMIMS Chandigarh – Lawn Tennis (Men)', 2),

-- Table Tennis Men (4)
('mum-table-tennis-men', 'mum', 'table-tennis', (SELECT id FROM categories WHERE sport_id = 'table-tennis' AND gender = 'men'), 'NMIMS Mumbai – Table Tennis (Men)', 5),
('shi-table-tennis-men', 'shi', 'table-tennis', (SELECT id FROM categories WHERE sport_id = 'table-tennis' AND gender = 'men'), 'NMIMS Shirpur (Host) – Table Tennis (Men)', 5),
('blr-table-tennis-men', 'blr', 'table-tennis', (SELECT id FROM categories WHERE sport_id = 'table-tennis' AND gender = 'men'), 'NMIMS Bengaluru – Table Tennis (Men)', 4),
('nvm-table-tennis-men', 'nvm', 'table-tennis', (SELECT id FROM categories WHERE sport_id = 'table-tennis' AND gender = 'men'), 'NMIMS Navi Mumbai – Table Tennis (Men)', 5)
ON CONFLICT (id) DO UPDATE SET
  squad_size = EXCLUDED.squad_size,
  name = EXCLUDED.name;

-- Delete any non-participating teams if present
DELETE FROM teams
WHERE id IN (
  SELECT t.id
  FROM teams t
  JOIN campuses c ON t.campus_id = c.id
  JOIN categories cat ON t.category_id = cat.id
  WHERE (c.short_code = 'MUM' AND cat.sport_id = 'volleyball' AND cat.gender = 'women')
     OR (c.short_code = 'NVM' AND cat.sport_id = 'lawn-tennis' AND cat.gender = 'men')
     OR (c.short_code = 'IND' AND cat.sport_id = 'lawn-tennis' AND cat.gender = 'men')
     OR (c.short_code = 'HYD' AND cat.sport_id = 'table-tennis' AND cat.gender = 'men')
     OR (c.short_code = 'IND' AND cat.sport_id = 'table-tennis' AND cat.gender = 'men')
     OR (c.short_code = 'CHD' AND cat.sport_id = 'table-tennis' AND cat.gender = 'men')
);

-- ----------------------------------------------------------------------------
-- 4. MATCHES: ROUND CONSTRAINT UPDATE (Group A, Group B, Knockouts)
-- ----------------------------------------------------------------------------
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_round_check;
ALTER TABLE matches ADD CONSTRAINT matches_round_check CHECK (
  round IN ('Group A', 'Group B', 'League', 'Group Stage', 'Quarter-Final', 'Semi-Final', '3rd Place', 'Final')
);

-- ----------------------------------------------------------------------------
-- 5. ADMINS TABLE & is_admin() FUNCTION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  sports TEXT[] DEFAULT ARRAY['cricket', 'football', 'basketball', 'volleyball', 'table-tennis', 'lawn-tennis'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed primary official tournament admin
INSERT INTO admins (email, role)
VALUES
  ('sports.shirpur@nmims.edu', 'super_admin'),
  ('admin@nmims.edu', 'admin')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE email = auth.jwt()->>'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 6. TEAM GROUPS TABLE (team_groups)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sport_id TEXT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL CHECK (group_name IN ('A', 'B')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id)
);

-- ----------------------------------------------------------------------------
-- 7. POINTS ADJUSTMENTS TABLE (points_adjustments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS points_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  delta NUMERIC NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. CAMPUS DEPARTMENTS TABLE (campus_departments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campus_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id TEXT UNIQUE NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
  men_count INT DEFAULT 0,
  women_count INT DEFAULT 0,
  staff_men INT DEFAULT 0,
  staff_women INT DEFAULT 0,
  day_scholar INT DEFAULT 0,
  hosteller INT DEFAULT 0,
  officer_name TEXT DEFAULT '',
  officer_phone TEXT DEFAULT '',
  officer_email TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed campus_departments with official figures
INSERT INTO campus_departments (campus_id, men_count, women_count, staff_men, staff_women, day_scholar, hosteller) VALUES
('hyd', 67, 24, 5, 2, 9, 82),
('blr', 58, 18, 4, 1, 56, 20),
('nvm', 69, 24, 6, 0, 83, 10),
('ind', 62, 18, 4, 1, 33, 47),
('chd', 61, 19, 2, 1, 76, 4),
('mum', 69, 13, 0, 0, 90, 0),
('shi', 0, 0, 0, 0, 0, 0)
ON CONFLICT (campus_id) DO UPDATE SET
  men_count = EXCLUDED.men_count,
  women_count = EXCLUDED.women_count,
  staff_men = EXCLUDED.staff_men,
  staff_women = EXCLUDED.staff_women,
  day_scholar = EXCLUDED.day_scholar,
  hosteller = EXCLUDED.hosteller,
  updated_at = NOW();

-- ----------------------------------------------------------------------------
-- 9. GALLERY IMAGES TABLE (gallery_images)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  tag TEXT DEFAULT 'Ceremonies',
  edition TEXT DEFAULT '2026-27',
  storage_path TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. CONTACTS: UPDATE SCHEMA & OFFICIAL COMMITTEE (Vishwesh Shukla REMOVED)
-- ----------------------------------------------------------------------------
ALTER TABLE contacts ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE contacts ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_group_check;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS "group" TEXT DEFAULT 'committee';
ALTER TABLE contacts ADD CONSTRAINT contacts_group_check CHECK ("group" IN ('leadership', 'committee', 'director'));

-- Remove Vishwesh Shukla completely
DELETE FROM contacts WHERE name ILIKE '%Vishwesh%';

-- Upsert official leadership & committee
DELETE FROM contacts;

INSERT INTO contacts (name, role, phone, "group", sort_order) VALUES
('Dr. Kiran Anchan', 'Director – Sports, SVKM''s & NMIMS University', NULL, 'leadership', 1),
('Tushar Jain', 'Sports Incharge, MPTP Shirpur Campus', '+91 95886 75238', 'committee', 2),
('Aryan Pawar', 'Sports Council Member, MPTP Shirpur Campus', '+91 91569 88019', 'committee', 3),
('Mehi Manswa', 'Sports Council Member, MPTP Shirpur Campus', '+91 93249 79109', 'committee', 4);

-- ----------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET: gallery
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read Gallery" ON storage.objects;
CREATE POLICY "Public Read Gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin Insert Gallery" ON storage.objects;
CREATE POLICY "Admin Insert Gallery" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin Update Gallery" ON storage.objects;
CREATE POLICY "Admin Update Gallery" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Admin Delete Gallery" ON storage.objects;
CREATE POLICY "Admin Delete Gallery" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery');

-- ----------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY POLICIES (Public Read, Admin Write via is_admin())
-- ----------------------------------------------------------------------------
-- Enable RLS across all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Public read policies (SELECT USING true)
DROP POLICY IF EXISTS "Public read teams" ON teams;
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read players" ON players;
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read matches" ON matches;
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read team_groups" ON team_groups;
CREATE POLICY "Public read team_groups" ON team_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read points_adjustments" ON points_adjustments;
CREATE POLICY "Public read points_adjustments" ON points_adjustments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read campus_departments" ON campus_departments;
CREATE POLICY "Public read campus_departments" ON campus_departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read gallery_images" ON gallery_images;
CREATE POLICY "Public read gallery_images" ON gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read contacts" ON contacts;
CREATE POLICY "Public read contacts" ON contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read announcements" ON announcements;
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site_config" ON site_config;
CREATE POLICY "Public read site_config" ON site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read admins" ON admins;
CREATE POLICY "Public read admins" ON admins FOR SELECT USING (true);

-- Admin write policies (Checked against public.is_admin())
DROP POLICY IF EXISTS "Admin write teams" ON teams;
CREATE POLICY "Admin write teams" ON teams FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write players" ON players;
CREATE POLICY "Admin write players" ON players FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write matches" ON matches;
CREATE POLICY "Admin write matches" ON matches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write team_groups" ON team_groups;
CREATE POLICY "Admin write team_groups" ON team_groups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write points_adjustments" ON points_adjustments;
CREATE POLICY "Admin write points_adjustments" ON points_adjustments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write campus_departments" ON campus_departments;
CREATE POLICY "Admin write campus_departments" ON campus_departments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write gallery_images" ON gallery_images;
CREATE POLICY "Admin write gallery_images" ON gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write contacts" ON contacts;
CREATE POLICY "Admin write contacts" ON contacts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write announcements" ON announcements;
CREATE POLICY "Admin write announcements" ON announcements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write site_config" ON site_config;
CREATE POLICY "Admin write site_config" ON site_config FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin write admins" ON admins;
CREATE POLICY "Admin write admins" ON admins FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 13. DEFAULT CONFIG IN site_config
-- ----------------------------------------------------------------------------
INSERT INTO site_config (key, value) VALUES
('points_rules', '{
  "cricket": { "win": 2, "draw": 0, "loss": 0, "nr": 1 },
  "football": { "win": 3, "draw": 1, "loss": 0, "nr": 0 },
  "basketball": { "win": 2, "draw": 0, "loss": 0, "nr": 0 },
  "volleyball": { "win": 2, "draw": 0, "loss": 0, "nr": 0 },
  "table-tennis": { "win": 2, "draw": 0, "loss": 0, "nr": 0 },
  "lawn-tennis": { "win": 2, "draw": 0, "loss": 0, "nr": 0 }
}'::jsonb),
('venue_address', '"Mukesh Patel Technology Park – Shirpur Campus\nBabulde, Near Tapi River Bridge, Mumbai-Agra Road (NH3),\nShirpur – 425405, Dist.: Dhule, Maharashtra, INDIA"'::jsonb),
('reporting_text', '"26th October 2026, 12:00 Noon"'::jsonb),
('faqs', '[
  {
    "question": "When should teams report?",
    "answer": "On 26th October 2026 by 12:00 Noon at Mukesh Patel Technology Park – Shirpur Campus. Team managers and players must complete registration and accreditation upon arrival."
  },
  {
    "question": "When is the championship?",
    "answer": "27th – 31st October 2026. Day 1 is 27 Oct (Opening Ceremony and League rounds) and Day 5 is 31 Oct (Finals and Closing Ceremony)."
  },
  {
    "question": "Is travel pick-up available?",
    "answer": "Yes. Pick-up is arranged from all the nearest railway stations and airports, including Indore International Airport, Nardana, Sindkheda, Dhule, Jalgaon, Bhusawal and Manmad railway stations, and Shirpur Bus Stand. Teams should share their arrival details with the Organising Committee in advance."
  },
  {
    "question": "Where will participants stay?",
    "answer": "Accommodation (sharing basis, with bedding) is provided at MPTP Shirpur Campus and MRP School."
  },
  {
    "question": "What food is provided?",
    "answer": "Nutritious vegetarian meals are provided for all participants: Breakfast 7:00–9:30 AM, Lunch 12:00–2:00 PM, Dinner 8:00–10:00 PM. The campus canteen is also open from 4:00–7:00 PM."
  },
  {
    "question": "What documents are needed?",
    "answer": "See Eligibility: fee proof (annual or semester), previous year or semester mark sheet, signed photo ID from the competent authority, and one typed, signed Eligibility Proforma submitted on arrival without overwriting."
  },
  {
    "question": "What should I carry?",
    "answer": "Your college ID, eligibility documents, official playing kit, personal medication, and light cotton clothes plus a light layer for cooler evenings."
  },
  {
    "question": "Who do I contact?",
    "answer": "Contact Tushar Jain, Sports Incharge (+91 95886 75238), or Sports Council members Aryan Pawar (+91 91569 88019) and Mehi Manswa (+91 93249 79109)."
  }
]'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------------------------------------------------------
-- 14. VERIFICATION QUERY
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_team_count INT;
  v_contact_count INT;
  v_admin_count INT;
BEGIN
  SELECT count(*) INTO v_team_count FROM teams;
  SELECT count(*) INTO v_contact_count FROM contacts;
  SELECT count(*) INTO v_admin_count FROM admins;
  RAISE NOTICE 'Teams: % (Expected: 50). Contacts: % (Expected: 4). Admins: % (Expected >= 2).', v_team_count, v_contact_count, v_admin_count;
END $$;

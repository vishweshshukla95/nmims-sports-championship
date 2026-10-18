-- ============================================================================
-- 003_v5_updates.sql
-- SVKM's NMIMS Inter Campus Sports Championship 2026-27 (v5 Update)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. NAME SPELLING: "SVKM'S" -> "SVKM's"
-- ----------------------------------------------------------------------------
UPDATE editions
SET name = REPLACE(name, 'SVKM''S', 'SVKM''s')
WHERE name LIKE '%SVKM''S%';

-- ----------------------------------------------------------------------------
-- 2. REMOVE MVP EVERYWHERE & DROP UNUSED VIEWS / TABLES
-- ----------------------------------------------------------------------------
-- Drop MVP and non-retained stat views
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

-- Drop MVP rules table
DROP TABLE IF EXISTS mvp_rules CASCADE;

-- ----------------------------------------------------------------------------
-- 3. TEAMS: REMOVE NON-PARTICIPATING TEAMS & ADD squad_size
-- ----------------------------------------------------------------------------
ALTER TABLE teams ADD COLUMN IF NOT EXISTS squad_size INT DEFAULT 12;

-- Delete the 6 non-participating teams by joining on campus short_code and category
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

-- Update official squad sizes for all remaining teams
-- Basketball Men
UPDATE teams SET squad_size = 12 FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'basketball' AND cat.gender = 'men';

-- Basketball Women
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'HYD' THEN 10
  WHEN 'BLR' THEN 8
  WHEN 'NVM' THEN 12
  WHEN 'IND' THEN 9
  WHEN 'CHD' THEN 10
  WHEN 'MUM' THEN 12
  ELSE 12
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'basketball' AND cat.gender = 'women';

-- Cricket Men
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'HYD' THEN 16
  WHEN 'BLR' THEN 15
  WHEN 'NVM' THEN 16
  WHEN 'IND' THEN 16
  WHEN 'CHD' THEN 16
  WHEN 'MUM' THEN 17
  ELSE 16
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'cricket' AND cat.gender = 'men';

-- Football Men
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'HYD' THEN 20
  WHEN 'BLR' THEN 14
  WHEN 'NVM' THEN 18
  WHEN 'IND' THEN 18
  WHEN 'CHD' THEN 18
  WHEN 'MUM' THEN 18
  ELSE 20
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'football' AND cat.gender = 'men';

-- Volleyball Men
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'HYD' THEN 12
  WHEN 'BLR' THEN 7
  WHEN 'NVM' THEN 12
  WHEN 'IND' THEN 12
  WHEN 'CHD' THEN 11
  WHEN 'MUM' THEN 12
  ELSE 12
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'volleyball' AND cat.gender = 'men';

-- Volleyball Women
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'HYD' THEN 10
  WHEN 'BLR' THEN 8
  WHEN 'NVM' THEN 12
  WHEN 'IND' THEN 8
  WHEN 'CHD' THEN 8
  ELSE 12
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'volleyball' AND cat.gender = 'women';

-- Lawn Tennis Men
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'HYD' THEN 2
  WHEN 'BLR' THEN 2
  WHEN 'CHD' THEN 2
  WHEN 'MUM' THEN 5
  ELSE 5
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'lawn-tennis' AND cat.gender = 'men';

-- Table Tennis Men
UPDATE teams SET squad_size = CASE c.short_code
  WHEN 'BLR' THEN 4
  WHEN 'NVM' THEN 5
  WHEN 'MUM' THEN 5
  ELSE 5
END FROM campuses c, categories cat
WHERE teams.campus_id = c.id AND teams.category_id = cat.id
AND cat.sport_id = 'table-tennis' AND cat.gender = 'men';

-- ----------------------------------------------------------------------------
-- 4. GROUPS TABLE (team_groups)
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

ALTER TABLE team_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read team_groups" ON team_groups;
CREATE POLICY "Public read team_groups" ON team_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write team_groups" ON team_groups;
CREATE POLICY "Admin write team_groups" ON team_groups FOR ALL USING (true);

-- ----------------------------------------------------------------------------
-- 5. CAMPUS SPORTS DEPARTMENTS (campus_departments)
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

ALTER TABLE campus_departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read campus_departments" ON campus_departments;
CREATE POLICY "Public read campus_departments" ON campus_departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin write campus_departments" ON campus_departments;
CREATE POLICY "Admin write campus_departments" ON campus_departments FOR ALL USING (true);

-- Seed campus_departments with official figures from v5 specifications
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
-- 6. TWO LOGINS: ADMIN AND VIEWER (portal_users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read portal_users" ON portal_users;
CREATE POLICY "Public read portal_users" ON portal_users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service write portal_users" ON portal_users;
CREATE POLICY "Service write portal_users" ON portal_users FOR ALL USING (true);

-- Migrate existing admins to portal_users as 'admin'
INSERT INTO portal_users (email, role)
SELECT email, 'admin' FROM admins
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- ----------------------------------------------------------------------------
-- 7. DEFAULT POINTS RULES IN site_config
-- ----------------------------------------------------------------------------
INSERT INTO site_config (key, value) VALUES
('points_rules', '{
  "cricket": { "win": 2, "draw": 0, "loss": 0, "nr": 1 },
  "football": { "win": 3, "draw": 1, "loss": 0, "nr": 0 },
  "basketball": { "win": 2, "draw": 0, "loss": 0, "nr": 0 },
  "volleyball": { "win": 2, "draw": 0, "loss": 0, "nr": 0 },
  "table-tennis": { "win": 2, "draw": 0, "loss": 0, "nr": 0 },
  "lawn-tennis": { "win": 2, "draw": 0, "loss": 0, "nr": 0 }
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------------------------------------------------------
-- VERIFICATION: Count teams (Should be 50)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_team_count INT;
BEGIN
  SELECT count(*) INTO v_team_count FROM teams;
  RAISE NOTICE 'Total teams remaining in database: % (Expected: 50)', v_team_count;
END $$;

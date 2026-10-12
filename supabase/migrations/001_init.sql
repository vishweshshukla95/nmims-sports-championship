-- ============================================================================
-- SVKM'S NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27
-- Database Initialization & Schema Definition
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EDITIONS
CREATE TABLE IF NOT EXISTS editions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SPORTS
CREATE TABLE IF NOT EXISTS sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  has_men BOOLEAN DEFAULT true,
  has_women BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id TEXT REFERENCES sports(id) ON DELETE CASCADE,
  gender TEXT NOT NULL CHECK (gender IN ('men', 'women')),
  UNIQUE(sport_id, gender)
);

-- 4. CAMPUSES
CREATE TABLE IF NOT EXISTS campuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  logo_url TEXT,
  is_host BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAMS (70 Seeded Teams)
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  campus_id TEXT REFERENCES campuses(id) ON DELETE CASCADE,
  sport_id TEXT REFERENCES sports(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PLAYERS
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  jersey_no INT,
  photo_url TEXT,
  is_captain BOOLEAN DEFAULT false,
  is_wk BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edition TEXT REFERENCES editions(id) DEFAULT '2026-27',
  sport_id TEXT REFERENCES sports(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  match_no INT NOT NULL,
  round TEXT NOT NULL CHECK (round IN ('League', 'Group Stage', 'Quarter-Final', 'Semi-Final', '3rd Place', 'Final')),
  team_a_id TEXT REFERENCES teams(id),
  team_b_id TEXT REFERENCES teams(id),
  player_a_id UUID REFERENCES players(id),
  player_b_id UUID REFERENCES players(id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Postponed', 'Completed', 'Cancelled', 'Walkover')),
  winner_id TEXT REFERENCES teams(id),
  result_text TEXT,
  score_summary JSONB,
  toss_winner_id TEXT REFERENCES teams(id),
  toss_decision TEXT CHECK (toss_decision IN ('bat', 'bowl')),
  is_walkover BOOLEAN DEFAULT false,
  notes TEXT,
  motm_player_id UUID REFERENCES players(id),
  motm_note TEXT,
  is_demo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BREAKDOWN SCORE TABLES
CREATE TABLE IF NOT EXISTS volleyball_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  set_no INT NOT NULL,
  team_a_points INT NOT NULL,
  team_b_points INT NOT NULL
);

CREATE TABLE IF NOT EXISTS basketball_quarters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  quarter_no INT NOT NULL,
  team_a_points INT NOT NULL,
  team_b_points INT NOT NULL
);

CREATE TABLE IF NOT EXISTS football_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  team_id TEXT REFERENCES teams(id),
  minute INT,
  is_penalty BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tt_rubbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  rubber_no INT NOT NULL,
  player_a_id UUID REFERENCES players(id),
  player_b_id UUID REFERENCES players(id),
  winner_id UUID REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS tt_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rubber_id UUID REFERENCES tt_rubbers(id) ON DELETE CASCADE,
  game_no INT NOT NULL,
  player_a_points INT NOT NULL,
  player_b_points INT NOT NULL
);

CREATE TABLE IF NOT EXISTS tennis_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  set_no INT NOT NULL,
  team_a_games INT NOT NULL,
  team_b_games INT NOT NULL,
  tiebreak_points_a INT,
  tiebreak_points_b INT
);

-- 9. MVP RULES TABLE
CREATE TABLE IF NOT EXISTS mvp_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport TEXT NOT NULL,
  stat_key TEXT NOT NULL,
  points_per_unit NUMERIC NOT NULL,
  UNIQUE(sport, stat_key)
);

-- 10. PLAYER STATS TABLES (PER MATCH)
CREATE TABLE IF NOT EXISTS cricket_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  runs INT DEFAULT 0,
  balls_faced INT DEFAULT 0,
  fours INT DEFAULT 0,
  sixes INT DEFAULT 0,
  is_out BOOLEAN DEFAULT false,
  batting_position INT,
  overs NUMERIC(3,1) DEFAULT 0,
  maidens INT DEFAULT 0,
  runs_conceded INT DEFAULT 0,
  wickets INT DEFAULT 0,
  wides INT DEFAULT 0,
  no_balls INT DEFAULT 0,
  catches INT DEFAULT 0,
  run_outs INT DEFAULT 0,
  stumpings INT DEFAULT 0,
  mvp_points NUMERIC DEFAULT 0,
  mvp_override NUMERIC,
  UNIQUE(match_id, player_id)
);

CREATE TABLE IF NOT EXISTS football_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT false,
  saves INT DEFAULT 0,
  mvp_points NUMERIC DEFAULT 0,
  mvp_override NUMERIC,
  UNIQUE(match_id, player_id)
);

CREATE TABLE IF NOT EXISTS basketball_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  points INT DEFAULT 0,
  three_pointers INT DEFAULT 0,
  rebounds INT DEFAULT 0,
  assists INT DEFAULT 0,
  steals INT DEFAULT 0,
  blocks INT DEFAULT 0,
  fouls INT DEFAULT 0,
  mvp_points NUMERIC DEFAULT 0,
  mvp_override NUMERIC,
  UNIQUE(match_id, player_id)
);

CREATE TABLE IF NOT EXISTS volleyball_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  attack_points INT DEFAULT 0,
  block_points INT DEFAULT 0,
  service_aces INT DEFAULT 0,
  service_errors INT DEFAULT 0,
  digs INT DEFAULT 0,
  total_points INT GENERATED ALWAYS AS (attack_points + block_points + service_aces) STORED,
  mvp_points NUMERIC DEFAULT 0,
  mvp_override NUMERIC,
  UNIQUE(match_id, player_id)
);

CREATE TABLE IF NOT EXISTS tt_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  matches_played INT DEFAULT 0,
  matches_won INT DEFAULT 0,
  games_won INT DEFAULT 0,
  games_lost INT DEFAULT 0,
  points_won INT DEFAULT 0,
  points_lost INT DEFAULT 0,
  mvp_points NUMERIC DEFAULT 0,
  mvp_override NUMERIC,
  UNIQUE(match_id, player_id)
);

CREATE TABLE IF NOT EXISTS lawn_tennis_player_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  matches_played INT DEFAULT 0,
  matches_won INT DEFAULT 0,
  sets_won INT DEFAULT 0,
  sets_lost INT DEFAULT 0,
  games_won INT DEFAULT 0,
  games_lost INT DEFAULT 0,
  mvp_points NUMERIC DEFAULT 0,
  mvp_override NUMERIC,
  UNIQUE(match_id, player_id)
);

-- 11. AUXILIARY TABLES
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  caption TEXT NOT NULL,
  tag TEXT DEFAULT 'Ceremonies',
  edition TEXT REFERENCES editions(id) DEFAULT '2026-27',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  priority INT DEFAULT 0,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  "group" TEXT NOT NULL CHECK ("group" IN ('director', 'committee')),
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'sport_admin')),
  sports TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SQL VIEWS FOR LEADERBOARDS
-- ============================================================================

-- Cricket: Highest Runs
CREATE OR REPLACE VIEW v_cricket_most_runs AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.runs) AS total_runs,
  SUM(s.balls_faced) AS total_balls,
  CASE WHEN SUM(s.balls_faced) > 0 THEN ROUND((SUM(s.runs)::numeric / SUM(s.balls_faced)) * 100, 2) ELSE 0 END AS strike_rate,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.runs) DESC, (CASE WHEN SUM(s.balls_faced) > 0 THEN (SUM(s.runs)::numeric / SUM(s.balls_faced)) ELSE 0 END) DESC, SUM(s.balls_faced) ASC) AS rank
FROM cricket_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Cricket: Most Wickets
CREATE OR REPLACE VIEW v_cricket_most_wickets AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.wickets) AS total_wickets,
  SUM(s.runs_conceded) AS runs_conceded,
  SUM(s.overs) AS overs_bowled,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.wickets) DESC, SUM(s.runs_conceded) ASC) AS rank
FROM cricket_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Cricket: MVP
CREATE OR REPLACE VIEW v_cricket_mvp AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(COALESCE(s.mvp_override, s.mvp_points)) AS total_mvp_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  COUNT(DISTINCT CASE WHEN m.motm_player_id = p.id THEN m.id END) AS motm_count,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(COALESCE(s.mvp_override, s.mvp_points)) DESC, COUNT(DISTINCT CASE WHEN m.motm_player_id = p.id THEN m.id END) DESC, p.name ASC) AS rank
FROM cricket_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Football: Top Scorers
CREATE OR REPLACE VIEW v_football_top_scorers AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.goals) AS total_goals,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.goals) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM football_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Football: Assists
CREATE OR REPLACE VIEW v_football_assists AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.assists) AS total_assists,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.assists) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM football_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Football: MVP
CREATE OR REPLACE VIEW v_football_mvp AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(COALESCE(s.mvp_override, s.mvp_points)) AS total_mvp_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(COALESCE(s.mvp_override, s.mvp_points)) DESC, p.name ASC) AS rank
FROM football_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Basketball: Top Scorers
CREATE OR REPLACE VIEW v_basketball_top_scorers AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.points) AS total_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.points) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM basketball_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Basketball: Threes
CREATE OR REPLACE VIEW v_basketball_threes AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.three_pointers) AS total_threes,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.three_pointers) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM basketball_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Basketball: MVP
CREATE OR REPLACE VIEW v_basketball_mvp AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(COALESCE(s.mvp_override, s.mvp_points)) AS total_mvp_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(COALESCE(s.mvp_override, s.mvp_points)) DESC, p.name ASC) AS rank
FROM basketball_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Volleyball: Top Scorers
CREATE OR REPLACE VIEW v_volleyball_top_scorers AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.total_points) AS total_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.total_points) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM volleyball_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Volleyball: Blocks
CREATE OR REPLACE VIEW v_volleyball_blocks AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.block_points) AS total_blocks,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.block_points) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM volleyball_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Volleyball: MVP
CREATE OR REPLACE VIEW v_volleyball_mvp AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(COALESCE(s.mvp_override, s.mvp_points)) AS total_mvp_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(COALESCE(s.mvp_override, s.mvp_points)) DESC, p.name ASC) AS rank
FROM volleyball_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Table Tennis: Most Wins
CREATE OR REPLACE VIEW v_tt_most_wins AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.matches_won) AS total_wins,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.matches_won) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM tt_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Table Tennis: Most Games Won
CREATE OR REPLACE VIEW v_tt_most_games AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.games_won) AS total_games,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.games_won) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM tt_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Table Tennis: MVP
CREATE OR REPLACE VIEW v_tt_mvp AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(COALESCE(s.mvp_override, s.mvp_points)) AS total_mvp_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(COALESCE(s.mvp_override, s.mvp_points)) DESC, p.name ASC) AS rank
FROM tt_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Lawn Tennis: Most Wins
CREATE OR REPLACE VIEW v_tennis_most_wins AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.matches_won) AS total_wins,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.matches_won) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM lawn_tennis_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Lawn Tennis: Most Sets Won
CREATE OR REPLACE VIEW v_tennis_most_sets AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(s.sets_won) AS total_sets,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(s.sets_won) DESC, COUNT(DISTINCT s.match_id) ASC, p.name ASC) AS rank
FROM lawn_tennis_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- Lawn Tennis: MVP
CREATE OR REPLACE VIEW v_tennis_mvp AS
SELECT
  p.id AS player_id,
  p.name,
  c.short_code AS campus_code,
  cat.gender,
  m.edition,
  SUM(COALESCE(s.mvp_override, s.mvp_points)) AS total_mvp_points,
  COUNT(DISTINCT s.match_id) AS matches_played,
  RANK() OVER (PARTITION BY cat.gender, m.edition ORDER BY SUM(COALESCE(s.mvp_override, s.mvp_points)) DESC, p.name ASC) AS rank
FROM lawn_tennis_player_stats s
JOIN players p ON s.player_id = p.id
JOIN teams t ON p.team_id = t.id
JOIN campuses c ON t.campus_id = c.id
JOIN matches m ON s.match_id = m.id
JOIN categories cat ON m.category_id = cat.id
GROUP BY p.id, p.name, c.short_code, cat.gender, m.edition;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Public: SELECT only. Admins: ALL permissions.
-- ============================================================================

ALTER TABLE editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cricket_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE basketball_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE volleyball_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawn_tennis_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read editions" ON editions FOR SELECT USING (true);
CREATE POLICY "Public read sports" ON sports FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read campuses" ON campuses FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read cricket_stats" ON cricket_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read football_stats" ON football_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read basketball_stats" ON basketball_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read volleyball_stats" ON volleyball_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read tt_stats" ON tt_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read tennis_stats" ON lawn_tennis_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read mvp_rules" ON mvp_rules FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Public read site_config" ON site_config FOR SELECT USING (true);

-- ============================================================================
-- SVKM'S NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27
-- Seed Data (No Fixtures per Section 5)
-- ============================================================================

-- 1. EDITIONS
INSERT INTO editions (id, name, is_current) VALUES
('2026-27', 'SVKM''S NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2026-27', true),
('2025-26', 'SVKM''S NMIMS INTER CAMPUS SPORTS CHAMPIONSHIP 2025-26', false)
ON CONFLICT (id) DO NOTHING;

-- 2. SPORTS
INSERT INTO sports (id, name, slug, has_men, has_women, icon) VALUES
('cricket', 'Cricket', 'cricket', true, false, '🏏'),
('football', 'Football', 'football', true, false, '⚽'),
('basketball', 'Basketball', 'basketball', true, true, '🏀'),
('volleyball', 'Volleyball', 'volleyball', true, true, '🏐'),
('table-tennis', 'Table Tennis', 'table-tennis', true, false, '🏓'),
('lawn-tennis', 'Lawn Tennis', 'lawn-tennis', true, false, '🎾')
ON CONFLICT (id) DO NOTHING;

-- 3. CATEGORIES (10 Categories Total)
INSERT INTO categories (sport_id, gender) VALUES
('cricket', 'men'),
('football', 'men'),
('basketball', 'men'),
('basketball', 'women'),
('volleyball', 'men'),
('volleyball', 'women'),
('table-tennis', 'men'),
('lawn-tennis', 'men')
ON CONFLICT (sport_id, gender) DO NOTHING;

-- 4. CAMPUSES (All 7 with Cities & Short Codes)
INSERT INTO campuses (id, name, short_code, city, state, is_host) VALUES
('mum', 'NMIMS Mumbai', 'MUM', 'Mumbai', 'Maharashtra', false),
('nvm', 'NMIMS Navi Mumbai', 'NVM', 'Navi Mumbai', 'Maharashtra', false),
('shi', 'NMIMS Shirpur (Host)', 'SHI', 'Shirpur', 'Maharashtra', true),
('ind', 'NMIMS Indore', 'IND', 'Indore', 'Madhya Pradesh', false),
('blr', 'NMIMS Bengaluru', 'BLR', 'Bengaluru', 'Karnataka', false),
('hyd', 'NMIMS Hyderabad', 'HYD', 'Hyderabad', 'Telangana', false),
('chd', 'NMIMS Chandigarh', 'CHD', 'Chandigarh', 'Chandigarh', false)
ON CONFLICT (id) DO NOTHING;

-- 5. MVP RULES (Seeded defaults from Section 17.8)
-- Cricket
INSERT INTO mvp_rules (sport, stat_key, points_per_unit) VALUES
('cricket', 'run', 1),
('cricket', 'four_bonus', 1),
('cricket', 'six_bonus', 2),
('cricket', 'run_30_bonus', 8),
('cricket', 'run_50_bonus', 16),
('cricket', 'run_100_bonus', 32),
('cricket', 'wicket', 25),
('cricket', 'wicket_3_bonus', 8),
('cricket', 'wicket_5_bonus', 16),
('cricket', 'maiden', 12),
('cricket', 'catch', 8),
('cricket', 'stumping', 12),
('cricket', 'run_out', 10),
('cricket', 'motm', 25)
ON CONFLICT (sport, stat_key) DO NOTHING;

-- Football
INSERT INTO mvp_rules (sport, stat_key, points_per_unit) VALUES
('football', 'goal', 20),
('football', 'assist', 12),
('football', 'clean_sheet', 15),
('football', 'save', 2),
('football', 'yellow_card', -3),
('football', 'red_card', -10),
('football', 'motm', 15)
ON CONFLICT (sport, stat_key) DO NOTHING;

-- Basketball
INSERT INTO mvp_rules (sport, stat_key, points_per_unit) VALUES
('basketball', 'point', 1),
('basketball', 'three_pointer_bonus', 1),
('basketball', 'rebound', 1),
('basketball', 'assist', 1.5),
('basketball', 'steal', 2),
('basketball', 'block', 2),
('basketball', 'foul', -1),
('basketball', 'motm', 15)
ON CONFLICT (sport, stat_key) DO NOTHING;

-- Volleyball
INSERT INTO mvp_rules (sport, stat_key, points_per_unit) VALUES
('volleyball', 'attack_point', 2),
('volleyball', 'block', 3),
('volleyball', 'ace', 3),
('volleyball', 'dig', 1),
('volleyball', 'service_error', -1),
('volleyball', 'team_win', 5),
('volleyball', 'motm', 15)
ON CONFLICT (sport, stat_key) DO NOTHING;

-- Table Tennis
INSERT INTO mvp_rules (sport, stat_key, points_per_unit) VALUES
('table-tennis', 'rubber_won', 20),
('table-tennis', 'game_won', 5),
('table-tennis', 'point_won', 0.2),
('table-tennis', 'straight_games_bonus', 10),
('table-tennis', 'motm', 15)
ON CONFLICT (sport, stat_key) DO NOTHING;

-- Lawn Tennis
INSERT INTO mvp_rules (sport, stat_key, points_per_unit) VALUES
('lawn-tennis', 'match_won', 20),
('lawn-tennis', 'set_won', 8),
('lawn-tennis', 'game_won', 1),
('lawn-tennis', 'straight_sets_bonus', 10),
('lawn-tennis', 'motm', 15)
ON CONFLICT (sport, stat_key) DO NOTHING;

-- 6. CONTACTS (Section 14 Seed)
INSERT INTO contacts (name, role, phone, "group", sort_order) VALUES
('Tushar Jain', 'Sports Director, MPTP Shirpur Campus', '+91 95886 75238', 'director', 1),
('Aryan Pawar', 'Organising Committee', '+91 91569 88019', 'committee', 2),
('Mehi Manswa', 'Organising Committee', '+91 93249 79109', 'committee', 3),
('Vishwesh Shukla', 'Organising Committee', '+91 95993 33064', 'committee', 4);

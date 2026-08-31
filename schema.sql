-- ==========================================
-- RISE NETWORK DATABASE SCHEMA
-- Cloudflare D1 / SQLite
-- ==========================================

PRAGMA foreign_keys = ON;

-- ==========================================
-- ANNOUNCEMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- STAFF MEMBERS
-- ==========================================

CREATE TABLE IF NOT EXISTS staff_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    role TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SERVER STATUS
-- ==========================================

CREATE TABLE IF NOT EXISTS server_status (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    status TEXT NOT NULL DEFAULT 'offline',
    player_count INTEGER NOT NULL DEFAULT 0,
    max_players INTEGER NOT NULL DEFAULT 100,
    motd TEXT DEFAULT 'RISE NETWORK',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- GAMEMODES
-- ==========================================

CREATE TABLE IF NOT EXISTS gamemodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'available',
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- WEBSITE SETTINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS site_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DEFAULT SERVER STATUS
-- ==========================================

INSERT OR IGNORE INTO server_status
    (id, status, player_count, max_players, motd)
VALUES
    (1, 'offline', 0, 100, 'RISE NETWORK');

-- ==========================================
-- DEFAULT GAMEMODES
-- ==========================================

INSERT INTO gamemodes
    (name, description, status, display_order)
SELECT
    'SURVIVAL SMP',
    'Explore, build, survive and create your own journey.',
    'available',
    1
WHERE NOT EXISTS (
    SELECT 1 FROM gamemodes WHERE name = 'SURVIVAL SMP'
);

INSERT INTO gamemodes
    (name, description, status, display_order)
SELECT
    'BEDWARS',
    'Fight opposing teams, protect your bed and be the last team standing.',
    'available',
    2
WHERE NOT EXISTS (
    SELECT 1 FROM gamemodes WHERE name = 'BEDWARS'
);

INSERT INTO gamemodes
    (name, description, status, display_order)
SELECT
    'MORE COMING SOON',
    'New gamemodes are planned for the future.',
    'future',
    3
WHERE NOT EXISTS (
    SELECT 1 FROM gamemodes WHERE name = 'MORE COMING SOON'
);

-- ==========================================
-- DEFAULT WEBSITE SETTINGS
-- ==========================================

INSERT OR IGNORE INTO site_settings
    (setting_key, setting_value)
VALUES
    ('server_ip', 'risesmp.online');

INSERT OR IGNORE INTO site_settings
    (setting_key, setting_value)
VALUES
    ('bedrock_port', '25890');

INSERT OR IGNORE INTO site_settings
    (setting_key, setting_value)
VALUES
    ('discord_url', 'https://discord.gg/KMJ9RcWvMm');

INSERT OR IGNORE INTO site_settings
    (setting_key, setting_value)
VALUES
    ('server_name', 'RISE NETWORK');

INSERT OR IGNORE INTO site_settings
    (setting_key, setting_value)
VALUES
    ('server_platform', 'Java + Bedrock');

-- ==========================================
-- DEFAULT STAFF
-- ==========================================

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'Worst gamer',
    'FOUNDER',
    1,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'Worst gamer'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'PatricXD',
    'CO-FOUNDER',
    2,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'PatricXD'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'Master_YTX',
    'CO-FOUNDER',
    3,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'Master_YTX'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'INACTIVE SHAZ',
    'CO-FOUNDER',
    4,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'INACTIVE SHAZ'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'ZABIYA',
    'BEDWARS OWNER',
    5,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'ZABIYA'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'AKM',
    'SENIOR MODERATOR',
    6,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'AKM'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'spax',
    'BEDWARS MODERATOR',
    7,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'spax'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'HAMOUR',
    'TRIAL MODERATOR',
    8,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'HAMOUR'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'Beast',
    'TRIAL MODERATOR',
    9,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'Beast'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'Nihal',
    'TRIAL MODERATOR',
    10,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'Nihal'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'LEO LISTER',
    'TRIAL MODERATOR',
    11,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'LEO LISTER'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'BINIL',
    'TRIAL MODERATOR',
    12,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'BINIL'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'shaizz',
    'TRIAL MODERATOR',
    13,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'shaizz'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'FROST CALIBR',
    'SENIOR STAFF',
    14,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'FROST CALIBR'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'ShifinXD',
    'SENIOR STAFF',
    15,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'ShifinXD'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'Ashwin OP',
    'STAFF',
    16,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'Ashwin OP'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'unread',
    'TRIAL STAFF',
    17,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'unread'
);

INSERT INTO staff_members
    (username, role, display_order, active)
SELECT
    'VIPERBLADE',
    'TRIAL STAFF',
    18,
    1
WHERE NOT EXISTS (
    SELECT 1
    FROM staff_members
    WHERE username = 'VIPERBLADE'
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_announcements_created
ON announcements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_order
ON staff_members(display_order);

CREATE INDEX IF NOT EXISTS idx_staff_active
ON staff_members(active);

CREATE INDEX IF NOT EXISTS idx_gamemodes_order
ON gamemodes(display_order);

-- ==========================================
-- END
-- ==========================================

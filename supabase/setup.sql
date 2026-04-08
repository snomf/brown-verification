-- ################################################################
-- BRUNO VERIFIES - SUPABASE SETUP SCRIPT
-- ################################################################

-- 1. VERIFICATIONS TABLE
-- Stores permanent hashes of students
CREATE TABLE IF NOT EXISTS verifications (
    id BIGSERIAL PRIMARY KEY,
    discord_id TEXT UNIQUE NOT NULL,
    email_hash TEXT NOT NULL,
    verification_method TEXT DEFAULT 'website', -- 'website', 'command', 'admin', 'website_google'
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    type TEXT DEFAULT 'accepted' -- 'accepted', 'alumni', '2026', '2027', etc.
);

-- 2. PENDING CODES TABLE
-- Temporary table for 6-digit email codes
CREATE TABLE IF NOT EXISTS pending_codes (
    discord_id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    email_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- 2.5 VERIFY TOKENS TABLE
-- Short-lived tokens for Discord -> Google bridge
CREATE TABLE IF NOT EXISTS verify_tokens (
    token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discord_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

-- 3. TEMP VERIFICATIONS TABLE
-- Stores status of acceptance letter image reviews
CREATE TABLE IF NOT EXISTS temp_verifications (
    discord_id TEXT PRIMARY KEY,
    status TEXT DEFAULT 'pending', -- 'pending', 'auto_approved', 'mod_approved', 'denied', 'needs_manual_dm'
    score INTEGER DEFAULT 0,
    mod_message_id TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVER SETTINGS TABLE
-- Central configuration for the entire bot (UNIVERSAL!)
CREATE TABLE IF NOT EXISTS server_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    
    -- Bot & Discord Status
    bot_status_presence TEXT DEFAULT 'online',
    bot_status_text TEXT DEFAULT 'ROARRRRRRRRR! 🐻 I''m verifying Brown Students!',
    
    -- IDs
    guild_id TEXT, -- The ID of the Discord Server
    bot_id TEXT, -- The ID of the Bot itself
    admin_role_ids TEXT, -- Comma-separated list of Role IDs allowed to use /manage
    mod_review_channel_id TEXT, -- Where acceptance letters are sent for review
    allowed_mod_role_ids TEXT, -- Comma-separated list of Role IDs allowed to use approval buttons
    
    -- Emails
    email_from_address TEXT DEFAULT 'Bruno Verifies <verify@brunov.juainny.com>',
    allowed_email_domains TEXT DEFAULT '@brown.edu,@alumni.brown.edu',
    
    -- Roles (Discord Role Snowflakes)
    role_accepted TEXT,
    role_certified TEXT,
    role_alumni TEXT,
    role_student TEXT,
    role_2026 TEXT,
    role_2027 TEXT,
    role_2028 TEXT,
    role_2029 TEXT,
    role_2030 TEXT,

    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT only_one_row CHECK (id = 1)
);

-- Insert a default row so we always have ID 1
INSERT INTO server_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ################################################################
-- OPTIONAL: INDEXES
-- ################################################################
CREATE INDEX IF NOT EXISTS idx_verifications_email_hash ON verifications(email_hash);
CREATE INDEX IF NOT EXISTS idx_pending_codes_expires_at ON pending_codes(expires_at);

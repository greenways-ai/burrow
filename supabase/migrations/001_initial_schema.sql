-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (indexed by wallet address)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Index for wallet lookups
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Conversations table (stores encrypted data)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    encrypted_data TEXT NOT NULL,  -- JSON array of encrypted messages
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversation queries
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);

-- System prompts table (admin-managed)
CREATE TABLE system_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT NOT NULL
);

-- Index for active prompt
CREATE INDEX idx_system_prompts_active ON system_prompts(is_active) WHERE is_active = TRUE;

-- Insert default system prompt
INSERT INTO system_prompts (content, version, is_active, updated_by)
VALUES (
    'You are a helpful AI assistant. You provide clear, accurate, and helpful responses while maintaining user privacy and security.',
    1,
    TRUE,
    'system'
);

-- RLS (Row Level Security) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own user data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (
        wallet_address = current_setting('app.current_wallet', TRUE)::TEXT
    );

-- Users can only update their own last_login
CREATE POLICY "Users can update own last_login" ON users
    FOR UPDATE USING (
        wallet_address = current_setting('app.current_wallet', TRUE)::TEXT
    );

-- Users can only read their own conversations
CREATE POLICY "Users can read own conversations" ON conversations
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users 
            WHERE wallet_address = current_setting('app.current_wallet', TRUE)::TEXT
        )
    );

-- Users can only insert conversations for themselves
CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users 
            WHERE wallet_address = current_setting('app.current_wallet', TRUE)::TEXT
        )
    );

-- Users can only update their own conversations
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users 
            WHERE wallet_address = current_setting('app.current_wallet', TRUE)::TEXT
        )
    );

-- Users can only delete their own conversations
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (
        user_id IN (
            SELECT id FROM users 
            WHERE wallet_address = current_setting('app.current_wallet', TRUE)::TEXT
        )
    );

-- Everyone can read active system prompt
CREATE POLICY "Anyone can read active system prompt" ON system_prompts
    FOR SELECT USING (is_active = TRUE);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_prompts_updated_at
    BEFORE UPDATE ON system_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create user by wallet address
CREATE OR REPLACE FUNCTION get_or_create_user(p_wallet_address TEXT)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Try to get existing user
    SELECT id INTO v_user_id
    FROM users
    WHERE wallet_address = LOWER(p_wallet_address);
    
    -- If not found, create new user
    IF v_user_id IS NULL THEN
        INSERT INTO users (wallet_address)
        VALUES (LOWER(p_wallet_address))
        RETURNING id INTO v_user_id;
    ELSE
        -- Update last_login
        UPDATE users
        SET last_login = NOW()
        WHERE id = v_user_id;
    END IF;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get active system prompt
CREATE OR REPLACE FUNCTION get_active_system_prompt()
RETURNS TEXT AS $$
DECLARE
    v_content TEXT;
BEGIN
    SELECT content INTO v_content
    FROM system_prompts
    WHERE is_active = TRUE
    ORDER BY version DESC
    LIMIT 1;
    
    RETURN COALESCE(v_content, 'You are a helpful assistant.');
END;
$$ LANGUAGE plpgsql;

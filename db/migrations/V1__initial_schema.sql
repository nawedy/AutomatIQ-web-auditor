-- db/migrations/V1__initial_schema.sql
-- Initial schema for the AutomatIQ AI Website Auditor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (id = auth.uid()); -- Assuming auth.uid() is available from your auth system (e.g., Supabase)
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

-- API Keys Table (for user-generated API keys)
CREATE TABLE user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_prefix VARCHAR(8) NOT NULL UNIQUE, -- First few chars of the key for identification
    hashed_key TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE TRIGGER set_user_api_keys_updated_at
BEFORE UPDATE ON user_api_keys
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own API keys" ON user_api_keys
    FOR ALL USING (user_id = auth.uid());

-- Password Resets Table
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);

-- Plans Table (Subscription Plans)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'Free', 'Pro', 'Enterprise'
    description TEXT,
    price_monthly NUMERIC(10, 2) DEFAULT 0.00,
    price_yearly NUMERIC(10, 2) DEFAULT 0.00,
    stripe_price_id_monthly TEXT UNIQUE,
    stripe_price_id_yearly TEXT UNIQUE,
    audit_limit_monthly INTEGER DEFAULT 5,
    features JSONB, -- e.g., {"reports": true, "competitor_analysis": false}
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER set_plans_updated_at
BEFORE UPDATE ON plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    stripe_subscription_id TEXT UNIQUE, -- Can be NULL if managed internally or other payment provider
    status VARCHAR(50) NOT NULL, -- e.g., 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ, -- When the subscription fully ended
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE TRIGGER set_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions
    FOR ALL USING (user_id = auth.uid());

-- Websites Table (Websites to be audited)
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    name TEXT, -- User-defined name for the website
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, url) -- A user cannot add the same URL twice
);
CREATE INDEX idx_websites_user_id ON websites(user_id);
CREATE TRIGGER set_websites_updated_at
BEFORE UPDATE ON websites
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own websites" ON websites
    FOR ALL USING (user_id = auth.uid());

-- Audits Table
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Denormalized for easier RLS and querying
    status VARCHAR(50) NOT NULL, -- e.g., 'pending', 'queued', 'running', 'completed', 'failed', 'partial_success'
    audit_trigger VARCHAR(50) DEFAULT 'manual', -- e.g., 'manual', 'scheduled', 'webhook'
    config JSONB, -- Audit configuration (e.g., specific modules to run, device type)
    overall_score INTEGER, -- An aggregated score (0-100)
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audits_website_id ON audits(website_id);
CREATE INDEX idx_audits_user_id ON audits(user_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE TRIGGER set_audits_updated_at
BEFORE UPDATE ON audits
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own audits" ON audits
    FOR ALL USING (user_id = auth.uid());

-- Generic Audit Results Table (flexible for various modules)
-- For more structured data, consider separate tables per module if JSONB becomes unwieldy.
CREATE TABLE audit_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL, -- e.g., 'seo', 'performance_lighthouse', 'accessibility_axe', 'security_headers', 'content_nlp'
    score INTEGER, -- Module-specific score (0-100)
    summary TEXT,
    details JSONB, -- Detailed findings, issues, recommendations from the module
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (audit_id, module_name)
);
CREATE INDEX idx_audit_results_audit_id ON audit_results(audit_id);
CREATE TRIGGER set_audit_results_updated_at
BEFORE UPDATE ON audit_results
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS for audit_results (indirectly via audits table join)
-- This requires a helper function or more complex policy if direct user_id is not on audit_results
-- For simplicity, we'll assume access is controlled by access to the parent audit.
-- A more secure way would be to add user_id to audit_results or use a SECURITY DEFINER function.
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view results for their audits" ON audit_results
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM audits WHERE audits.id = audit_results.audit_id AND audits.user_id = auth.uid()
    ));
CREATE POLICY "Users can insert results for their audits" ON audit_results
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM audits WHERE audits.id = audit_results.audit_id AND audits.user_id = auth.uid()
    ));
-- Update/Delete policies would follow a similar pattern.

-- Scheduled Audits Table
CREATE TABLE scheduled_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    frequency VARCHAR(50) NOT NULL, -- e.g., 'daily', 'weekly', 'monthly'
    cron_expression TEXT, -- For more precise scheduling if needed
    next_run_at TIMESTAMPTZ NOT NULL,
    audit_config JSONB, -- Configuration for scheduled audits
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_audit_id UUID REFERENCES audits(id) ON DELETE SET NULL, -- Link to the last audit run by this schedule
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_scheduled_audits_website_id ON scheduled_audits(website_id);
CREATE INDEX idx_scheduled_audits_user_id ON scheduled_audits(user_id);
CREATE INDEX idx_scheduled_audits_next_run_at ON scheduled_audits(next_run_at) WHERE is_active = TRUE;
CREATE TRIGGER set_scheduled_audits_updated_at
BEFORE UPDATE ON scheduled_audits
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE scheduled_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own scheduled audits" ON scheduled_audits
    FOR ALL USING (user_id = auth.uid());

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- e.g., 'audit_completed', 'payment_failed', 'new_feature'
    title TEXT NOT NULL,
    message TEXT,
    link_url TEXT, -- Optional URL for the notification to link to
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE TRIGGER set_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- Transactions Table (for sales/revenue tracking)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL, -- If related to a subscription
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL, -- Denormalized for easier reporting if subscription is gone
    stripe_charge_id TEXT UNIQUE, -- Or payment provider's charge ID
    stripe_invoice_id TEXT UNIQUE, -- Optional
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- e.g., 'pending', 'succeeded', 'failed', 'refunded'
    description TEXT,
    payment_method_details JSONB,
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_subscription_id ON transactions(subscription_id);
CREATE TRIGGER set_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());
-- Insert/Update/Delete for transactions might be restricted to backend processes only.

COMMIT;

-- End of V1__initial_schema.sql

-- ==============================================================================
-- SaaS Tiket Wisata Alam - Full Database Schema
-- Multi-Tenant with Row-Level Security (RLS)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TENANTS & ORGANIZATION
-- ==============================================================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#059669',
    secondary_color VARCHAR(20) DEFAULT '#047857',
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_setting UNIQUE(tenant_id, setting_key)
);

-- ==============================================================================
-- 2. USERS & AUTHENTICATION
-- ==============================================================================

CREATE TYPE user_role AS ENUM (
    'super_admin',
    'tenant_admin',
    'tenant_staff',
    'gate_officer',
    'vendor',
    'visitor'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'visitor',
    id_card_type VARCHAR(20),       -- 'KTP', 'PASSPORT', 'SIM'
    id_card_number VARCHAR(100),
    nationality VARCHAR(10) DEFAULT 'WNI', -- 'WNI' or 'WNA'
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. DESTINATIONS (Wisata Alam)
-- ==============================================================================

CREATE TYPE destination_type AS ENUM (
    'taman_nasional',
    'gunung',
    'air_terjun',
    'pantai',
    'kawah',
    'hutan_pinus',
    'danau',
    'goa',
    'lainnya'
);

CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    destination_type destination_type DEFAULT 'lainnya',
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    max_daily_capacity INT NOT NULL,
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '17:00:00',
    cover_image_url TEXT,
    gallery_urls TEXT[],
    facilities TEXT[],
    rules TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_dest_slug UNIQUE(tenant_id, slug)
);

-- ==============================================================================
-- 4. TICKET CATEGORIES & PRICING
-- ==============================================================================

CREATE TYPE ticket_type AS ENUM (
    'visitor_domestic',
    'visitor_foreign',
    'child_domestic',
    'child_foreign',
    'vehicle_motorcycle',
    'vehicle_car',
    'vehicle_bus',
    'insurance',
    'retribusi',
    'camping',
    'guide',
    'equipment_rental',
    'addon'
);

CREATE TABLE ticket_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    ticket_type ticket_type NOT NULL,
    base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    weekend_price DECIMAL(12,2),          -- Harga weekend/libur (nullable = sama dengan base)
    holiday_price DECIMAL(12,2),          -- Harga hari libur nasional
    insurance_fee DECIMAL(12,2) DEFAULT 0,
    retribusi_fee DECIMAL(12,2) DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT FALSE,   -- Wajib dibeli (misal: asuransi, retribusi)
    is_per_person BOOLEAN DEFAULT TRUE,   -- True = per orang, False = per unit (kendaraan)
    max_qty_per_order INT DEFAULT 10,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. DAILY QUOTAS & TIME SLOTS (Carrying Capacity)
-- ==============================================================================

CREATE TABLE daily_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    total_quota INT NOT NULL,
    booked_quota INT DEFAULT 0,
    is_closed BOOLEAN DEFAULT FALSE,  -- Penutupan manual (cuaca buruk, dll)
    close_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dest_date UNIQUE(destination_id, visit_date)
);

CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slot_label VARCHAR(50) NOT NULL,     -- e.g., "Sesi Pagi", "Sesi Siang"
    start_time TIME NOT NULL,            -- e.g., 08:00
    end_time TIME NOT NULL,              -- e.g., 12:00
    max_capacity INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dest_slot UNIQUE(destination_id, slot_label)
);

CREATE TABLE slot_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_quota_id UUID NOT NULL REFERENCES daily_quotas(id) ON DELETE CASCADE,
    time_slot_id UUID NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booked_quota INT DEFAULT 0,
    is_closed BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_daily_slot UNIQUE(daily_quota_id, time_slot_id)
);

-- ==============================================================================
-- 6. TRANSACTIONS & ORDERS
-- ==============================================================================

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'expired',
    'failed',
    'refunded',
    'partially_refunded'
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,    -- e.g., TWA-20240101-XXXX
    visit_date DATE NOT NULL,
    time_slot_id UUID REFERENCES time_slots(id),
    destination_id UUID NOT NULL REFERENCES destinations(id),
    visitor_count INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL DEFAULT 2500.00,
    total_platform_fee DECIMAL(12,2) NOT NULL,   -- platform_fee * jumlah_tiket
    grand_total DECIMAL(12,2) NOT NULL,
    net_payout_amount DECIMAL(12,2) NOT NULL,    -- grand_total - total_platform_fee
    payment_status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),                  -- 'va_bca', 'qris', 'ewallet_gopay', etc.
    payment_gateway_ref VARCHAR(255),            -- External ID from Xendit/Midtrans
    payment_url TEXT,                            -- Redirect URL for payment
    paid_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. TICKETS (Individual E-Tickets)
-- ==============================================================================

CREATE TYPE ticket_status AS ENUM (
    'active',
    'used',
    'cancelled',
    'expired',
    'refunded'
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES ticket_categories(id),
    destination_id UUID NOT NULL REFERENCES destinations(id),
    ticket_code VARCHAR(20) UNIQUE NOT NULL,     -- Short readable code: TWA-XXXXX
    visit_date DATE NOT NULL,
    time_slot_id UUID REFERENCES time_slots(id),
    visitor_name VARCHAR(255),
    visitor_id_type VARCHAR(20),
    visitor_id_number VARCHAR(100),
    visitor_nationality VARCHAR(10) DEFAULT 'WNI',
    unit_price DECIMAL(12,2) NOT NULL,
    totp_secret_key VARCHAR(64) NOT NULL,        -- HMAC secret for Dynamic QR offline validation
    qr_payload TEXT,                             -- Encrypted QR content
    status ticket_status DEFAULT 'active',
    used_at TIMESTAMP WITH TIME ZONE,
    used_by_gate_device_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. PAYOUTS (Disbursements to Tenant)
-- ==============================================================================

CREATE TYPE payout_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    total_transactions INT NOT NULL,
    gross_amount DECIMAL(12,2) NOT NULL,
    total_platform_fee DECIMAL(12,2) NOT NULL,
    net_payout_amount DECIMAL(12,2) NOT NULL,
    payout_status payout_status DEFAULT 'pending',
    gateway_payout_ref VARCHAR(255),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(255),
    transferred_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    amount DECIMAL(12,2) NOT NULL
);

-- ==============================================================================
-- 9. CASHLESS QR WALLET
-- ==============================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    balance DECIMAL(12,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE wallet_tx_type AS ENUM (
    'topup',
    'payment',
    'refund',
    'auto_refund'
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    tx_type wallet_tx_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    balance_before DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    reference_id VARCHAR(255),           -- Linked transaction or vendor booth ID
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 10. VENDOR BOOTHS (F&B, Sewa, Souvenir)
-- ==============================================================================

CREATE TABLE vendor_booths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),   -- Owner/operator
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,       -- 'fnb', 'rental', 'souvenir', 'guide'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booth_id UUID NOT NULL REFERENCES vendor_booths(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendor_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    booth_id UUID NOT NULL REFERENCES vendor_booths(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    product_id UUID REFERENCES vendor_products(id),
    quantity INT DEFAULT 1,
    total_amount DECIMAL(12,2) NOT NULL,
    qr_scan_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. GATE DEVICES & SCAN LOGS
-- ==============================================================================

CREATE TABLE gate_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_code VARCHAR(50) UNIQUE NOT NULL,
    gate_type VARCHAR(20) DEFAULT 'entrance',  -- 'entrance', 'exit'
    hmac_shared_key VARCHAR(128) NOT NULL,      -- Shared key for offline HMAC validation
    last_manifest_sync_at TIMESTAMP WITH TIME ZONE,
    last_log_sync_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE scan_result AS ENUM (
    'valid',
    'invalid',
    'expired',
    'already_used',
    'quota_exceeded',
    'wrong_date'
);

CREATE TABLE scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    gate_device_id UUID NOT NULL REFERENCES gate_devices(id),
    ticket_id UUID REFERENCES tickets(id),
    ticket_code VARCHAR(20),
    scanned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scan_result scan_result NOT NULL,
    is_offline_scan BOOLEAN DEFAULT FALSE,
    synced_at TIMESTAMP WITH TIME ZONE,       -- NULL = belum sync, filled = sudah sync
    raw_qr_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 12. INDEXES
-- ==============================================================================

-- Users
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Destinations
CREATE INDEX idx_destinations_tenant_id ON destinations(tenant_id);
CREATE INDEX idx_destinations_type ON destinations(destination_type);

-- Ticket Categories
CREATE INDEX idx_ticket_categories_destination ON ticket_categories(destination_id);
CREATE INDEX idx_ticket_categories_tenant ON ticket_categories(tenant_id);

-- Daily Quotas
CREATE INDEX idx_daily_quotas_dest_date ON daily_quotas(destination_id, visit_date);
CREATE INDEX idx_daily_quotas_tenant ON daily_quotas(tenant_id);

-- Transactions
CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(payment_status);
CREATE INDEX idx_transactions_visit_date ON transactions(visit_date);
CREATE INDEX idx_transactions_order_number ON transactions(order_number);

-- Tickets
CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_transaction ON tickets(transaction_id);
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_visit_date ON tickets(visit_date);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Payouts
CREATE INDEX idx_payouts_tenant ON payouts(tenant_id);
CREATE INDEX idx_payouts_status ON payouts(payout_status);

-- Wallets
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_wallet_tx_wallet ON wallet_transactions(wallet_id);

-- Scan Logs
CREATE INDEX idx_scan_logs_tenant ON scan_logs(tenant_id);
CREATE INDEX idx_scan_logs_gate ON scan_logs(gate_device_id);
CREATE INDEX idx_scan_logs_ticket ON scan_logs(ticket_id);
CREATE INDEX idx_scan_logs_synced ON scan_logs(synced_at) WHERE synced_at IS NULL;

-- ==============================================================================
-- 13. ROW-LEVEL SECURITY (RLS) for Multi-Tenancy
-- ==============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using current_setting('app.current_tenant_id')
-- The application sets this per-connection via: SET app.current_tenant_id = '<uuid>';

CREATE POLICY tenant_isolation_destinations ON destinations
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_ticket_categories ON ticket_categories
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_daily_quotas ON daily_quotas
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_time_slots ON time_slots
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_slot_quotas ON slot_quotas
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_transactions ON transactions
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_tickets ON tickets
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_payouts ON payouts
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_wallets ON wallets
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_wallet_transactions ON wallet_transactions
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_vendor_booths ON vendor_booths
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_vendor_products ON vendor_products
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_vendor_sales ON vendor_sales
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_gate_devices ON gate_devices
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_scan_logs ON scan_logs
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY tenant_isolation_tenant_settings ON tenant_settings
    USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

-- ==============================================================================
-- 14. UPDATED_AT TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_destinations_updated_at BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ticket_categories_updated_at BEFORE UPDATE ON ticket_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_daily_quotas_updated_at BEFORE UPDATE ON daily_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payouts_updated_at BEFORE UPDATE ON payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_gate_devices_updated_at BEFORE UPDATE ON gate_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_vendor_booths_updated_at BEFORE UPDATE ON vendor_booths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tenant_settings_updated_at BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SaaS Tiket Wisata Alam - Rollback Migration
-- ==============================================================================

-- Drop triggers
DROP TRIGGER IF EXISTS trg_tenant_settings_updated_at ON tenant_settings;
DROP TRIGGER IF EXISTS trg_vendor_booths_updated_at ON vendor_booths;
DROP TRIGGER IF EXISTS trg_gate_devices_updated_at ON gate_devices;
DROP TRIGGER IF EXISTS trg_wallets_updated_at ON wallets;
DROP TRIGGER IF EXISTS trg_payouts_updated_at ON payouts;
DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
DROP TRIGGER IF EXISTS trg_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS trg_daily_quotas_updated_at ON daily_quotas;
DROP TRIGGER IF EXISTS trg_ticket_categories_updated_at ON ticket_categories;
DROP TRIGGER IF EXISTS trg_destinations_updated_at ON destinations;
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
DROP TRIGGER IF EXISTS trg_tenants_updated_at ON tenants;

DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS scan_logs;
DROP TABLE IF EXISTS gate_devices;
DROP TABLE IF EXISTS vendor_sales;
DROP TABLE IF EXISTS vendor_products;
DROP TABLE IF EXISTS vendor_booths;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS payout_items;
DROP TABLE IF EXISTS payouts;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS slot_quotas;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS daily_quotas;
DROP TABLE IF EXISTS ticket_categories;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenant_settings;
DROP TABLE IF EXISTS tenants;

-- Drop types
DROP TYPE IF EXISTS scan_result;
DROP TYPE IF EXISTS wallet_tx_type;
DROP TYPE IF EXISTS ticket_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS ticket_type;
DROP TYPE IF EXISTS destination_type;
DROP TYPE IF EXISTS payout_status;
DROP TYPE IF EXISTS user_role;

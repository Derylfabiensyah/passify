-- ==============================================================================
-- Seed Additional Multi-Role Accounts (Cashier, Owner, Customer, etc.)
-- Password: password123
-- ==============================================================================

-- 1. cashier@curug-cilember.id
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000010',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'cashier@curug-cilember.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Petugas Kasir & POS Curug Cilember',
  'vendor',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  password_hash = EXCLUDED.password_hash,
  role = 'vendor',
  full_name = EXCLUDED.full_name,
  is_active = true;

INSERT INTO vendor_booths (id, tenant_id, destination_id, user_id, name, category, description, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000056',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  '3bb81d49-64d3-491a-b0fb-93c636064440',
  '10000000-0000-0000-0000-000000000010',
  'Loket Kasir & Tiket',
  'Loket Tiket & POS',
  'Loket kasir tiket dan pembayaran cashless kawasan',
  true
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name;

INSERT INTO wallets (id, user_id, tenant_id, balance, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000067',
  '10000000-0000-0000-0000-000000000010',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  1000000.00,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  is_active = true;

-- 2. cashier@curugcikanteh.com
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000011',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'cashier@curugcikanteh.com',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Petugas Kasir & POS Curug Cikanteh',
  'vendor',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  password_hash = EXCLUDED.password_hash,
  role = 'vendor',
  full_name = EXCLUDED.full_name,
  is_active = true;

INSERT INTO vendor_booths (id, tenant_id, destination_id, user_id, name, category, description, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000057',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  '3bb81d49-64d3-491a-b0fb-93c636064440',
  '10000000-0000-0000-0000-000000000011',
  'Loket Kasir Cikanteh',
  'Loket Tiket & POS',
  'Loket kasir tiket dan pembayaran cashless kawasan',
  true
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name;

INSERT INTO wallets (id, user_id, tenant_id, balance, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000068',
  '10000000-0000-0000-0000-000000000011',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  1000000.00,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  is_active = true;

-- 3. owner@curug-cilember.id
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000012',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'owner@curug-cilember.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Pemilik Destinasi (Tenant Owner)',
  'tenant_admin',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  password_hash = EXCLUDED.password_hash,
  role = 'tenant_admin',
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 4. admin@curug-cilember.id
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000013',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'admin@curug-cilember.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Pengelola Kawasan (Tenant Admin)',
  'tenant_admin',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  password_hash = EXCLUDED.password_hash,
  role = 'tenant_admin',
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 5. gate@curug-cilember.id
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000014',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'gate@curug-cilember.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Petugas Scanner Gerbang Masuk',
  'gate_officer',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  password_hash = EXCLUDED.password_hash,
  role = 'gate_officer',
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 6. customer@passify.id
INSERT INTO users (id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000015',
  'customer@passify.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Customer Wisatawan Passify',
  'visitor',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'visitor',
  full_name = EXCLUDED.full_name,
  is_active = true;

INSERT INTO wallets (id, user_id, tenant_id, balance, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000069',
  '10000000-0000-0000-0000-000000000015',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  500000.00,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  balance = 500000.00,
  is_active = true;

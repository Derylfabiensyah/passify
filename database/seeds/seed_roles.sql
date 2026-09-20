-- ==============================================================================
-- Passify - Multi-Role Seed Accounts
-- Default password for all accounts: password123
-- Bcrypt hash: $2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2
-- ==============================================================================

-- 1. Super Admin (Administrator Utama Platform Passify)
INSERT INTO users (id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'superadmin@passify.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Super Administrator Passify',
  'super_admin',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = 'super_admin',
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 2. Tenant Admin (Pengelola Kawasan Wisata Curug Cikanteh)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'admin@curugcikanteh.com',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Pengelola Curug Cikanteh (Tenant Admin)',
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

-- 3. Tenant Staff (Staf Operasional Kawasan Wisata)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'staff@curugcikanteh.com',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Staf Operasional Cikanteh',
  'tenant_staff',
  true,
  'WNI',
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  tenant_id = EXCLUDED.tenant_id,
  password_hash = EXCLUDED.password_hash,
  role = 'tenant_staff',
  full_name = EXCLUDED.full_name,
  is_active = true;

-- 4. Gate Officer (Petugas Scanner Tiket Gerbang Masuk)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'gate@curugcikanteh.com',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Petugas Scanner Gerbang Utama',
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

-- 5. Vendor (Pedagang / Booth Cashless & Topup)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  'vendor@curugcikanteh.com',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Warung Alam Bu Siti (Vendor Booth)',
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

-- Booth untuk Vendor
INSERT INTO vendor_booths (id, tenant_id, destination_id, user_id, name, category, description, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000055',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  '3bb81d49-64d3-491a-b0fb-93c636064440',
  '10000000-0000-0000-0000-000000000005',
  'Warung Alam Bu Siti',
  'Makanan & Minuman',
  'Aneka makanan khas dan minuman hangat di kawasan wisata Curug Cikanteh',
  true
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- 6. Visitor (Wisatawan)
INSERT INTO users (id, email, password_hash, full_name, role, is_active, nationality, email_verified_at)
VALUES (
  '10000000-0000-0000-0000-000000000006',
  'wisatawan@passify.id',
  '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2',
  'Wisatawan Nusantara',
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

-- Dompet Digital Wisatawan dengan saldo awal Rp 250.000
INSERT INTO wallets (id, user_id, tenant_id, balance, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000066',
  '10000000-0000-0000-0000-000000000006',
  '413baace-9c74-4abb-8aa4-a8310ffc4c0b',
  250000.00,
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  balance = 250000.00,
  is_active = true;

-- Update akun yang sudah ada sebelumnya agar juga bisa login dengan password123
UPDATE users SET 
  password_hash = '$2a$10$kP.AwfOimEZsBJ0cqk9SyOX6IE/aEYpLJ/SVwToGqC21ioZnrgMS2', 
  is_active = true
WHERE email IN ('kiano@gmail.com', 'derylfabien09@gmail.com', 'deryl@passify.id');

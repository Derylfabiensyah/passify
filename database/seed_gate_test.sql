INSERT INTO destinations (id, tenant_id, name, slug, description, destination_type, city, province, max_daily_capacity, opening_time, closing_time, is_active)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'e3badbe6-9714-41f8-b54a-ce902cd1c44d',
  'Wisata Curug Bidadari Sentul',
  'curugbidadari',
  'Wisata air terjun alami dengan kolam renang alami di Sentul Paradise Park.',
  'air_terjun',
  'Bogor',
  'Jawa Barat',
  500,
  '08:00:00',
  '17:00:00',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO gate_devices (id, tenant_id, destination_id, device_name, device_code, gate_type, hmac_shared_key, is_active)
VALUES (
  'c8b9d319-36e1-4288-b9cf-fe79eaff0001',
  'e3badbe6-9714-41f8-b54a-ce902cd1c44d',
  '11111111-1111-1111-1111-111111111111',
  'Gate Masuk Utama 1',
  'GATE-BIDADARI-01',
  'entrance',
  'passify_secret_key_123',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO ticket_categories (id, destination_id, tenant_id, name, description, ticket_type, base_price, weekend_price, holiday_price, is_mandatory, is_per_person, max_qty_per_order, is_active)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'e3badbe6-9714-41f8-b54a-ce902cd1c44d',
  'Tiket Masuk Reguler (Dewasa)',
  'Tiket masuk area wisata Curug Bidadari untuk 1 orang dewasa',
  'visitor_domestic',
  35000,
  45000,
  50000,
  true,
  true,
  10,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO transactions (id, tenant_id, user_id, order_number, visit_date, destination_id, visitor_count, subtotal, platform_fee, total_platform_fee, grand_total, net_payout_amount, payment_status, payment_method, paid_at)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'e3badbe6-9714-41f8-b54a-ce902cd1c44d',
  'de6cda63-9036-437b-baa6-345459f1d093',
  'TWA-ORD-20260829-001',
  CURRENT_DATE,
  '11111111-1111-1111-1111-111111111111',
  2,
  70000,
  2500,
  5000,
  75000,
  70000,
  'paid',
  'qris',
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO tickets (id, tenant_id, transaction_id, category_id, destination_id, ticket_code, visit_date, visitor_name, visitor_nationality, unit_price, totp_secret_key, status)
VALUES 
(
  '44444444-4444-4444-4444-444444444001',
  'e3badbe6-9714-41f8-b54a-ce902cd1c44d',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'TWA-20260829-001',
  CURRENT_DATE,
  'Derylfabiensyah',
  'WNI',
  35000,
  '0123456789abcdef0123456789abcdef01234567',
  'active'
),
(
  '44444444-4444-4444-4444-444444444002',
  'e3badbe6-9714-41f8-b54a-ce902cd1c44d',
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'TWA-20260829-002',
  CURRENT_DATE,
  'Budi Santoso',
  'WNI',
  35000,
  '0123456789abcdef0123456789abcdef01234567',
  'active'
) ON CONFLICT (id) DO NOTHING;

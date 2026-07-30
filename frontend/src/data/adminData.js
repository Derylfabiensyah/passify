// Mock data for Tenant Admin Dashboard
// Simulates data that would come from the backend API

export const TENANT_INFO = {
  id: "tenant-001",
  name: "Dinas Pariwisata Kab. Probolinggo",
  logo_url: null,
  primary_color: "#10b981",
  subscription_plan: "Professional",
  subscription_status: "active",
  created_at: "2025-01-15T08:00:00Z"
};

export const ADMIN_USER = {
  id: "user-admin-001",
  name: "Deryl Fabiensyah",
  email: "admin@passify.id",
  role: "tenant_admin",
  avatar_url: null
};

export const DASHBOARD_STATS = {
  today: {
    revenue: 18450000,
    tickets_sold: 342,
    visitors_entered: 289,
    remaining_quota: 912,
    total_capacity: 2752,
    wallet_topups: 4250000,
    vendor_transactions: 1890000,
  },
  yesterday: {
    revenue: 15200000,
    tickets_sold: 298,
    visitors_entered: 298,
  },
  this_month: {
    revenue: 487500000,
    tickets_sold: 8940,
    total_visitors: 8720,
    avg_daily_visitors: 310,
    payout_settled: 425000000,
    payout_pending: 62500000,
  }
};

export const HOURLY_VISITORS = [
  { hour: "06:00", entered: 12, exited: 0 },
  { hour: "07:00", entered: 38, exited: 2 },
  { hour: "08:00", entered: 64, exited: 8 },
  { hour: "09:00", entered: 52, exited: 14 },
  { hour: "10:00", entered: 45, exited: 22 },
  { hour: "11:00", entered: 28, exited: 30 },
  { hour: "12:00", entered: 22, exited: 35 },
  { hour: "13:00", entered: 15, exited: 42 },
  { hour: "14:00", entered: 10, exited: 48 },
  { hour: "15:00", entered: 3, exited: 56 },
  { hour: "16:00", entered: 0, exited: 32 },
];

export const REVENUE_WEEKLY = [
  { day: "Sen", revenue: 12400000 },
  { day: "Sel", revenue: 14800000 },
  { day: "Rab", revenue: 13200000 },
  { day: "Kam", revenue: 15200000 },
  { day: "Jum", revenue: 19800000 },
  { day: "Sab", revenue: 28400000 },
  { day: "Min", revenue: 32500000 },
];

export const TICKET_CATEGORY_SALES = [
  { name: "WNI Weekday", sold: 4200, revenue: 142800000, percentage: 47 },
  { name: "WNI Weekend", sold: 2800, revenue: 123200000, percentage: 31 },
  { name: "WNA International", sold: 340, revenue: 105400000, percentage: 12 },
  { name: "Kendaraan Jeep", sold: 1600, revenue: 16000000, percentage: 10 },
];

export const RECENT_TRANSACTIONS = [
  { id: "trx-001", code: "TWA-20260730-1234", visitor: "Ahmad Rizky", category: "WNI Weekend", qty: 2, amount: 88000, status: "paid", time: "10 menit lalu" },
  { id: "trx-002", code: "TWA-20260730-1235", visitor: "Sarah Johnson", category: "WNA International", qty: 1, amount: 310000, status: "paid", time: "15 menit lalu" },
  { id: "trx-003", code: "TWA-20260730-1236", visitor: "Budi Santoso", category: "WNI Weekday", qty: 4, amount: 136000, status: "paid", time: "22 menit lalu" },
  { id: "trx-004", code: "TWA-20260730-1237", visitor: "Maria Chen", category: "WNA International", qty: 2, amount: 620000, status: "paid", time: "35 menit lalu" },
  { id: "trx-005", code: "TWA-20260730-1238", visitor: "Rudi Hartono", category: "WNI Weekday", qty: 3, amount: 102000, status: "refunded", time: "1 jam lalu" },
  { id: "trx-006", code: "TWA-20260730-1239", visitor: "Dewi Lestari", category: "Kendaraan Jeep", qty: 1, amount: 10000, status: "paid", time: "1 jam lalu" },
];

export const GATE_SCAN_STATS = [
  { device: "Gate A - Pintu Utama", scans_today: 148, valid: 145, invalid: 3, status: "online" },
  { device: "Gate B - Pintu Selatan", scans_today: 96, valid: 94, invalid: 2, status: "online" },
  { device: "Gate C - Exit Kawah", scans_today: 45, valid: 45, invalid: 0, status: "offline" },
];

export const ADMIN_DESTINATIONS = [
  {
    id: "dest-bromo",
    name: "Taman Nasional Gunung Bromo",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Probolinggo",
    is_active: true,
    max_daily_capacity: 2752,
    booked_today: 1840,
    cover_image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80",
    ticket_categories: [
      { id: "cat-1", name: "WNI Weekday", price: 34000, insurance: 3000, retribusi: 5000, is_active: true },
      { id: "cat-2", name: "WNI Weekend/Libur", price: 44000, insurance: 3000, retribusi: 5000, is_active: true },
      { id: "cat-3", name: "WNA International", price: 310000, insurance: 10000, retribusi: 15000, is_active: true },
      { id: "cat-4", name: "Kendaraan Jeep", price: 10000, insurance: 0, retribusi: 0, is_active: true },
    ],
    time_slots: [
      { id: "ts-1", label: "Sunrise (03:00 - 09:00)", max_capacity: 1000, booked: 780, is_active: true },
      { id: "ts-2", label: "Day (09:00 - 16:00)", max_capacity: 1752, booked: 1060, is_active: true },
    ]
  },
  {
    id: "dest-ijen",
    name: "Kawah Ijen & Blue Fire",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Banyuwangi",
    is_active: true,
    max_daily_capacity: 1500,
    booked_today: 920,
    cover_image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
    ticket_categories: [
      { id: "cat-1", name: "WNI Weekdays", price: 20000, insurance: 2500, retribusi: 2500, is_active: true },
      { id: "cat-2", name: "WNI Weekend", price: 30000, insurance: 2500, retribusi: 2500, is_active: true },
      { id: "cat-3", name: "WNA International", price: 150000, insurance: 5000, retribusi: 10000, is_active: true },
    ],
    time_slots: [
      { id: "ts-1", label: "Midnight Blue Fire (02:00 - 07:00)", max_capacity: 800, booked: 610, is_active: true },
      { id: "ts-2", label: "Morning Trek (07:00 - 12:00)", max_capacity: 700, booked: 310, is_active: true },
    ]
  }
];

export const GATE_DEVICES = [
  { id: "gd-001", device_name: "Gate A - Pintu Utama", device_code: "GATE-A-001", gate_type: "entrance", destination: "Taman Nasional Gunung Bromo", is_active: true, hmac_key: "a3f8c2d1e6b9...masked", last_manifest_sync: "2026-07-30T06:00:00Z", last_log_sync: "2026-07-30T10:35:00Z", total_scans_today: 148 },
  { id: "gd-002", device_name: "Gate B - Pintu Selatan", device_code: "GATE-B-002", gate_type: "entrance", destination: "Taman Nasional Gunung Bromo", is_active: true, hmac_key: "b7d4e1f2a3c8...masked", last_manifest_sync: "2026-07-30T06:00:00Z", last_log_sync: "2026-07-30T10:30:00Z", total_scans_today: 96 },
  { id: "gd-003", device_name: "Gate C - Exit Kawah", device_code: "GATE-C-003", gate_type: "exit", destination: "Taman Nasional Gunung Bromo", is_active: false, hmac_key: "c5e2f3a4b1d7...masked", last_manifest_sync: "2026-07-29T06:00:00Z", last_log_sync: "2026-07-29T16:00:00Z", total_scans_today: 0 },
  { id: "gd-004", device_name: "Gate Paltuding", device_code: "GATE-PLT-001", gate_type: "entrance", destination: "Kawah Ijen & Blue Fire", is_active: true, hmac_key: "d8f1a2b3c4e5...masked", last_manifest_sync: "2026-07-30T01:30:00Z", last_log_sync: "2026-07-30T07:15:00Z", total_scans_today: 85 },
];

export const PAYOUT_HISTORY = [
  { id: "po-001", period: "21 - 27 Jul 2026", gross: 198500000, platform_fee: 22350000, net_payout: 176150000, status: "settled", settled_at: "2026-07-28T10:00:00Z", bank: "BCA - ****4821" },
  { id: "po-002", period: "14 - 20 Jul 2026", gross: 175200000, platform_fee: 19800000, net_payout: 155400000, status: "settled", settled_at: "2026-07-21T10:00:00Z", bank: "BCA - ****4821" },
  { id: "po-003", period: "7 - 13 Jul 2026", gross: 162800000, platform_fee: 18400000, net_payout: 144400000, status: "settled", settled_at: "2026-07-14T10:00:00Z", bank: "BCA - ****4821" },
  { id: "po-004", period: "28 Jul - 3 Ags 2026", gross: 62500000, platform_fee: 7000000, net_payout: 55500000, status: "pending", settled_at: null, bank: "BCA - ****4821" },
];

export const QUOTA_CALENDAR = (() => {
  const data = [];
  const base = new Date("2026-07-28");
  for (let i = 0; i < 14; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const maxCap = 2752;
    const booked = isWeekend ? Math.floor(Math.random() * 800 + 1800) : Math.floor(Math.random() * 600 + 1200);
    const isClosed = i === 10;
    data.push({
      date: d.toISOString().split('T')[0],
      dayLabel: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      max_capacity: maxCap,
      booked: isClosed ? 0 : Math.min(booked, maxCap),
      is_closed: isClosed,
      close_reason: isClosed ? "Kondisi Cuaca Buruk" : null,
    });
  }
  return data;
})();

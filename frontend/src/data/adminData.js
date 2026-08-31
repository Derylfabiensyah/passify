// Clean data model defaults for Tenant Admin Console
// All statistics and entities reflect real tenant data from microservices

export const TENANT_INFO = {
  id: null,
  name: "Kawasan Konservasi Wisata Alam",
  logo_url: null,
  primary_color: "#059669",
  subscription_plan: "Standard White-Label SaaS",
  subscription_status: "active",
  created_at: new Date().toISOString()
};

export const ADMIN_USER = {
  id: "user-admin",
  name: "Pengelola Kawasan",
  email: "admin@passify.id",
  role: "tenant_admin",
  avatar_url: null
};

export const DASHBOARD_STATS = {
  today: {
    revenue: 0,
    tickets_sold: 0,
    visitors_entered: 0,
    remaining_quota: 1000,
    total_capacity: 1000,
    wallet_topups: 0,
    vendor_transactions: 0,
  },
  yesterday: {
    revenue: 0,
    tickets_sold: 0,
    visitors_entered: 0,
  },
  this_month: {
    revenue: 0,
    tickets_sold: 0,
    total_visitors: 0,
    avg_daily_visitors: 0,
    payout_settled: 0,
    payout_pending: 0,
  }
};

export const HOURLY_VISITORS = [
  { hour: "06:00", entered: 0, exited: 0 },
  { hour: "08:00", entered: 0, exited: 0 },
  { hour: "10:00", entered: 0, exited: 0 },
  { hour: "12:00", entered: 0, exited: 0 },
  { hour: "14:00", entered: 0, exited: 0 },
  { hour: "16:00", entered: 0, exited: 0 },
];

export const REVENUE_WEEKLY = [
  { day: "Sen", revenue: 0 },
  { day: "Sel", revenue: 0 },
  { day: "Rab", revenue: 0 },
  { day: "Kam", revenue: 0 },
  { day: "Jum", revenue: 0 },
  { day: "Sab", revenue: 0 },
  { day: "Min", revenue: 0 },
];

export const TICKET_CATEGORY_SALES = [];

export const RECENT_TRANSACTIONS = [];

export const GATE_SCAN_STATS = {
  scans_today: 0,
  valid_scans: 0,
  rejected_scans: 0,
  offline_synced: 0,
};

export const ADMIN_DESTINATIONS = [];

export const GATE_DEVICES = [];

export const PAYOUT_HISTORY = [];

export const QUOTA_CALENDAR = (() => {
  const data = [];
  const today = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    data.push({
      date: d.toISOString().split('T')[0],
      dayLabel: i === 0 ? 'Hari Ini' : i === 1 ? 'Besok' : days[d.getDay()],
      max_capacity: 1000,
      booked: 0,
      is_closed: false,
      close_reason: null,
    });
  }
  return data;
})();

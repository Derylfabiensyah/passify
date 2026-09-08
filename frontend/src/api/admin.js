import { apiRequest } from './client';
import { fetchDestinationBySlug, getLocalBookedCount } from './tenant';
import {
  HOURLY_VISITORS,
  REVENUE_WEEKLY,
  TICKET_CATEGORY_SALES,
  GATE_SCAN_STATS,
  ADMIN_DESTINATIONS,
  PAYOUT_HISTORY
} from '../data/adminData';

/**
 * Returns current authenticated admin user from localStorage
 */
export function getAdminUser() {
  let user = null;
  try {
    const raw = localStorage.getItem('passify_user');
    if (raw) user = JSON.parse(raw);
  } catch (_) {}

  // 1. Logged in user's explicit tenant info (Highest Priority)
  const userTenant = user?.tenant || {};
  const userTenantName = userTenant.name || user?.tenant_name || null;
  const userTenantSlug = userTenant.slug || userTenant.subdomain || user?.tenant_slug || null;
  const userTenantId = user?.tenant_id || userTenant.id || null;

  // 2. Local destinations cache (Secondary Priority)
  let localDest = null;
  try {
    const rawDests = localStorage.getItem('passify_admin_destinations');
    if (rawDests) {
      const dests = JSON.parse(rawDests);
      if (Array.isArray(dests) && dests.length > 0) {
        // Only use localDest if it matches user's slug or user has no specific slug
        if (!userTenantSlug || dests[0].slug === userTenantSlug) {
          localDest = dests[0];
        }
      }
    }
  } catch (_) {}

  const currentSlugStorage = localStorage.getItem('passify_current_tenant');
  const activeTenantName = userTenantName || localDest?.name || 'Kawasan Wisata';
  const activeTenantSlug = userTenantSlug || (currentSlugStorage && currentSlugStorage !== 'curug-citambur' ? currentSlugStorage : (localDest?.slug || 'curug-citambur'));
  const activeTenantId = userTenantId || localDest?.id || '002bdabd-c79d-40b4-b624-4fbcdc31d390';

  if (user) {
    return {
      id: user.id || 'usr-admin',
      name: user.full_name || user.name || 'Pengelola Kawasan',
      email: user.email || 'admin@passify.id',
      role: user.role || 'tenant_admin',
      tenant_id: activeTenantId,
      tenant_slug: activeTenantSlug,
      tenant_name: activeTenantName,
      tenant: {
        id: activeTenantId,
        name: activeTenantName,
        slug: activeTenantSlug,
      },
    };
  }

  return {
    id: 'usr-admin-default',
    name: 'Pengelola Kawasan',
    email: 'admin@passify.id',
    role: 'tenant_admin',
    tenant_id: activeTenantId,
    tenant_slug: activeTenantSlug,
    tenant_name: activeTenantName,
    tenant: {
      id: activeTenantId,
      name: activeTenantName,
      slug: activeTenantSlug,
    },
  };
}

/**
 * Returns the active tenant slug and info for routing
 */
export function getActiveAdminTenant() {
  const user = getAdminUser();
  return {
    id: user.tenant_id,
    name: user.tenant_name,
    slug: user.tenant_slug,
  };
}

/**
 * Fetch real destinations for the current tenant
 */
export async function fetchAdminDestinations(slug) {
  const user = getAdminUser();
  const currentSlug = slug || user.tenant_slug || getActiveAdminTenant()?.slug || 'curug-citambur';
  const effectiveTenantId = user.tenant_id;

  // 1. Fetch authoritative destination data directly (shared with public portal)
  try {
    const [dest, financeData] = await Promise.all([
      fetchDestinationBySlug(currentSlug),
      effectiveTenantId ? fetchAdminFinanceData(effectiveTenantId) : Promise.resolve({ transactions: [] }),
    ]);

    if (dest) {
      let trxBookedCount = 0;
      if (Array.isArray(financeData?.transactions)) {
        trxBookedCount = financeData.transactions
          .filter((t) => {
            const st = (t.payment_status || t.status || '').toLowerCase();
            return st === 'paid' || st === 'settlement' || st === 'success';
          })
          .reduce((sum, t) => sum + Number(t.visitor_count || 1), 0);
      }

      const totalBooked = Math.max(Number(dest.booked_today || 0), trxBookedCount);
      let slots = dest.time_slots || [];
      if (slots.length > 0 && totalBooked > 0) {
        const hasSlotBooked = slots.some((s) => Number(s.booked || 0) > 0);
        if (!hasSlotBooked) {
          slots = slots.map((s, idx) => (idx === 0 ? { ...s, booked: totalBooked } : s));
        }
      }

      const updatedDest = {
        ...dest,
        booked_today: totalBooked,
        time_slots: slots,
      };

      const unifiedList = [updatedDest];
      try {
        localStorage.setItem('passify_admin_destinations', JSON.stringify(unifiedList));
        localStorage.setItem('passify_current_tenant', dest.slug);
      } catch (_) {}
      return unifiedList;
    }
  } catch (err) {
    console.warn('Failed to fetch destination by slug:', err);
  }

  // 2. Fallback only if offline / network error
  let localDests = [];
  try {
    const raw = localStorage.getItem('passify_admin_destinations');
    if (raw) localDests = JSON.parse(raw);
  } catch (_) {}

  return localDests.length > 0 ? localDests : ADMIN_DESTINATIONS;
}

/**
 * Fetch real quotas and calendar slots for destination
 */
export async function fetchAdminQuotas(destinationId) {
  if (!destinationId) return { quotas: [], timeSlots: [] };

  try {
    const [quotasRes, slotsRes] = await Promise.allSettled([
      apiRequest(`/api/v1/tickets/destinations/${destinationId}/quotas`),
      apiRequest(`/api/v1/tickets/destinations/${destinationId}/time-slots`),
    ]);

    const quotas = quotasRes.status === 'fulfilled' && quotasRes.value?.data ? quotasRes.value.data : [];
    let timeSlots = slotsRes.status === 'fulfilled' && slotsRes.value?.data ? slotsRes.value.data : [];

    if (Array.isArray(timeSlots) && timeSlots.length > 0) {
      timeSlots = timeSlots.map((s) => ({
        id: s.id,
        label: s.slot_label || s.label || 'Sesi Kunjungan',
        slot_label: s.slot_label || s.label,
        time_range: s.time_range || (s.start_time && s.end_time ? `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)} WIB` : ''),
        max_capacity: Number(s.max_capacity || 500),
        booked: Number(s.booked || 0),
        is_active: s.is_active !== false,
      }));
    }

    return { quotas, timeSlots };
  } catch (err) {
    console.warn('Failed to fetch quotas from backend:', err.message);
    return { quotas: [], timeSlots: [] };
  }
}

/**
 * Fetch real gate devices and scan stats
 */
export async function fetchAdminGateTelemetry(destinationId) {
  if (!destinationId) return { devices: [], stats: { scans_today: 0, valid_scans: 0, rejected_scans: 0, offline_synced: 0 } };

  try {
    const [devicesRes, statsRes] = await Promise.allSettled([
      apiRequest(`/api/v1/gate/destinations/${destinationId}/devices`),
      apiRequest(`/api/v1/gate/destinations/${destinationId}/stats`),
    ]);

    const devices = devicesRes.status === 'fulfilled' && devicesRes.value?.data ? devicesRes.value.data : [];
    const stats = statsRes.status === 'fulfilled' && statsRes.value?.data
      ? statsRes.value.data
      : { scans_today: 0, valid_scans: 0, rejected_scans: 0, offline_synced: 0 };

    return { devices, stats };
  } catch (err) {
    console.warn('Failed to fetch gate telemetry:', err.message);
    return { devices: [], stats: { scans_today: 0, valid_scans: 0, rejected_scans: 0, offline_synced: 0 } };
  }
}

/**
 * Fetch real transactions and payouts from payment microservice
 */
export async function fetchAdminFinanceData(tenantId) {
  const user = getAdminUser();
  const effectiveTenantId = tenantId || user.tenant_id;

  if (!effectiveTenantId) {
    return {
      transactions: [],
      payouts: [],
      weeklyRevenue: [
        { day: 'Sen', revenue: 0 },
        { day: 'Sel', revenue: 0 },
        { day: 'Rab', revenue: 0 },
        { day: 'Kam', revenue: 0 },
        { day: 'Jum', revenue: 0 },
        { day: 'Sab', revenue: 0 },
        { day: 'Min', revenue: 0 },
      ],
    };
  }

  try {
    const [trxRes, payoutRes] = await Promise.allSettled([
      apiRequest(`/api/v1/payments/tenants/${effectiveTenantId}/transactions`),
      apiRequest(`/api/v1/payments/tenants/${effectiveTenantId}/payouts`),
    ]);

    const transactions = trxRes.status === 'fulfilled' && trxRes.value?.data ? trxRes.value.data : [];
    const payouts = payoutRes.status === 'fulfilled' && payoutRes.value?.data ? payoutRes.value.data : [];

    return {
      transactions,
      payouts,
      weeklyRevenue: [
        { day: 'Sen', revenue: 0 },
        { day: 'Sel', revenue: 0 },
        { day: 'Rab', revenue: 0 },
        { day: 'Kam', revenue: 0 },
        { day: 'Jum', revenue: 0 },
        { day: 'Sab', revenue: 0 },
        { day: 'Min', revenue: 0 },
      ],
    };
  } catch (err) {
    console.warn('Failed to fetch finance telemetry:', err.message);
    return {
      transactions: [],
      payouts: [],
      weeklyRevenue: [],
    };
  }
}

/**
 * Aggregate telemetry for dashboard overview
 */
export async function fetchDashboardOverviewTelemetry(slug) {
  const user = getAdminUser();
  const destinations = await fetchAdminDestinations(slug || user.tenant_slug);
  const primaryDest = destinations[0] || {};

  const [quotaData, gateData, financeData] = await Promise.all([
    fetchAdminQuotas(primaryDest.id),
    fetchAdminGateTelemetry(primaryDest.id),
    fetchAdminFinanceData(user.tenant_id),
  ]);

  // Compute live today metrics
  const totalCapacity = Number(primaryDest.max_daily_capacity) || 1000;
  const localBooked = getLocalBookedCount(primaryDest.id, primaryDest.slug, primaryDest.name).total;
  const bookedToday = Math.max(Number(primaryDest.booked_today || 0), localBooked);

  // Compute revenue from transactions if available
  let calculatedRevenue = 0;
  let trxVisitors = 0;
  if (Array.isArray(financeData.transactions) && financeData.transactions.length > 0) {
    const paidTxs = financeData.transactions.filter((t) => {
      const st = (t.payment_status || t.status || '').toLowerCase();
      return st === 'paid' || st === 'settlement' || st === 'success';
    });
    calculatedRevenue = paidTxs.reduce(
      (sum, t) => sum + (Number(t.grand_total ?? t.amount ?? t.total_amount ?? 0)),
      0
    );
    trxVisitors = paidTxs.reduce((sum, t) => sum + Number(t.visitor_count || 1), 0);
  }

  // Compute live scan and ticket metrics
  const totalScans = Number(gateData.stats?.total_scans ?? gateData.stats?.scans_today ?? 0);
  const ticketsSold = Math.max(
    bookedToday,
    trxVisitors,
    Array.isArray(financeData.transactions) ? financeData.transactions.length : 0,
    totalScans
  );
  const remainingQuota = Math.max(0, totalCapacity - ticketsSold);

  const liveStats = {
    today: {
      revenue: calculatedRevenue,
      tickets_sold: ticketsSold,
      visitors_entered: totalScans,
      remaining_quota: remainingQuota,
      total_capacity: totalCapacity,
      wallet_topups: 0,
      vendor_transactions: 0,
    },
    yesterday: {
      revenue: 0,
      tickets_sold: 0,
      visitors_entered: 0,
    },
    this_month: {
      revenue: calculatedRevenue,
      tickets_sold: ticketsSold,
      visitors_entered: totalScans,
    },
  };

  const defaultHourly = [
    { hour: '07:00', entered: 0, exited: 0 },
    { hour: '09:00', entered: 0, exited: 0 },
    { hour: '11:00', entered: 0, exited: 0 },
    { hour: '13:00', entered: 0, exited: 0 },
    { hour: '15:00', entered: 0, exited: 0 },
    { hour: '17:00', entered: 0, exited: 0 },
  ];

  return {
    destinations,
    stats: liveStats,
    hourlyVisitors: defaultHourly,
    revenueWeekly: financeData.weeklyRevenue?.length > 0 ? financeData.weeklyRevenue : [
      { day: 'Sen', revenue: 0 },
      { day: 'Sel', revenue: 0 },
      { day: 'Rab', revenue: 0 },
      { day: 'Kam', revenue: 0 },
      { day: 'Jum', revenue: 0 },
      { day: 'Sab', revenue: 0 },
      { day: 'Min', revenue: 0 },
    ],
    ticketCategorySales: primaryDest.ticket_categories
      ? primaryDest.ticket_categories.map((c) => ({
          name: c.name,
          sold: 0,
          revenue: 0,
          percentage: 0,
        }))
      : [],
    recentTransactions: Array.isArray(financeData.transactions) ? financeData.transactions : [],
    gateScanStats: Array.isArray(gateData.devices) && gateData.devices.length > 0
      ? gateData.devices.map((d) => {
          const gateStatsMap = {};
          if (gateData.stats?.by_gate) {
            gateData.stats.by_gate.forEach((g) => {
              gateStatsMap[g.device_id] = g.total_scans;
            });
          }
          return {
            gate_name: d.device_name || d.device_code || 'Gerbang Masuk',
            total_scanned: gateStatsMap[d.id] ?? (gateData.stats?.total_scans ?? gateData.stats?.scans_today ?? 0),
            last_scan: d.last_log_sync_at ? new Date(d.last_log_sync_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Hari ini',
            status: d.is_active ? 'online' : 'offline',
          };
        })
      : [
          {
            gate_name: 'Pintu Masuk Utama 01',
            total_scanned: gateData.stats?.total_scans ?? gateData.stats?.scans_today ?? 0,
            last_scan: 'Hari ini',
            status: 'online',
          }
        ],
  };
}

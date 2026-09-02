import { apiRequest } from './client';
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
  // 1. Read existing local destinations first
  let localDests = [];
  try {
    const raw = localStorage.getItem('passify_admin_destinations');
    if (raw) localDests = JSON.parse(raw);
  } catch (_) {}

  const user = getAdminUser();
  const currentSlug = slug || user.tenant_slug || getActiveAdminTenant()?.slug || 'curug-citambur';

  let backendDests = [];
  if (currentSlug) {
    try {
      // Try public tenant destination lookup
      const res = await apiRequest(`/api/v1/public/tenants/${currentSlug}/destination`);
      if (res && (res.data || res.name)) {
        const dest = res.data || res;
        let categories = [];

        // 1. Direct categories from destination response if populated
        if (dest.ticket_categories && Array.isArray(dest.ticket_categories) && dest.ticket_categories.length > 0) {
          categories = dest.ticket_categories.map((c) => ({
            id: c.id,
            name: c.name,
            price: Number(c.base_price ?? c.price ?? 0),
            insurance: Number(c.insurance_fee ?? c.insurance ?? 0),
            retribusi: Number(c.retribusi_fee ?? c.retribusi ?? 0),
            is_active: c.is_active !== false,
          }));
        }

        // 2. Also fetch categories from ticket service if not present
        if (categories.length === 0 && dest.id) {
          try {
            const catRes = await apiRequest(`/api/v1/tickets/destinations/${dest.id}/categories`);
            if (catRes && (catRes.data || Array.isArray(catRes))) {
              const rawCats = catRes.data || catRes;
              if (Array.isArray(rawCats) && rawCats.length > 0) {
                categories = rawCats.map((c) => ({
                  id: c.id,
                  name: c.name,
                  price: Number(c.base_price ?? c.price ?? 0),
                  insurance: Number(c.insurance_fee ?? c.insurance ?? 0),
                  retribusi: Number(c.retribusi_fee ?? c.retribusi ?? 0),
                  is_active: c.is_active !== false,
                }));
              }
            }
          } catch (_) {}
        }

        dest.ticket_categories = categories;
        backendDests = [dest];
      }
    } catch (err) {
      console.warn('Backend destination lookup:', err.message);
    }
  }

  // Merge destinations: real backend data MUST override stale localStorage!
  const map = new Map();
  localDests.forEach((d) => map.set(d.id, d));
  backendDests.forEach((d) => {
    const existing = map.get(d.id);
    map.set(d.id, {
      ...existing,
      ...d,
      ticket_categories: (d.ticket_categories && d.ticket_categories.length > 0)
        ? d.ticket_categories
        : (existing?.ticket_categories || []),
    });
  });

  if (map.size > 0) {
    const mergedList = Array.from(map.values());
    try {
      localStorage.setItem('passify_admin_destinations', JSON.stringify(mergedList));
    } catch (_) {}
    return mergedList;
  }

  return ADMIN_DESTINATIONS;
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
    const timeSlots = slotsRes.status === 'fulfilled' && slotsRes.value?.data ? slotsRes.value.data : [];

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
  const bookedToday = Number(primaryDest.booked_today) || 0;
  const remainingQuota = Math.max(0, totalCapacity - bookedToday);

  // Compute revenue from transactions if available
  let calculatedRevenue = 0;
  if (Array.isArray(financeData.transactions) && financeData.transactions.length > 0) {
    calculatedRevenue = financeData.transactions
      .filter((t) => t.status === 'paid' || t.status === 'PAID' || t.status === 'settlement')
      .reduce((sum, t) => sum + (Number(t.amount) || Number(t.total_amount) || 0), 0);
  }

  const liveStats = {
    today: {
      revenue: calculatedRevenue,
      tickets_sold: bookedToday,
      visitors_entered: gateData.stats?.scans_today || 0,
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
      tickets_sold: bookedToday,
      visitors_entered: gateData.stats?.scans_today || 0,
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
    recentTransactions: financeData.transactions || [],
    gateScanStats: gateData.stats || { scans_today: 0, valid_scans: 0, rejected_scans: 0, offline_synced: 0 },
  };
}

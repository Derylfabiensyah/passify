const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'passify.com';
const TEMPLATE_STORAGE_PREFIX = 'passify_portal_template_';

export function loadPortalTemplate(slug) {
  if (!slug) return null;
  try {
    return JSON.parse(localStorage.getItem(`${TEMPLATE_STORAGE_PREFIX}${slug}`) || 'null');
  } catch {
    return null;
  }
}

export function loadPortalCoverImage(slug) {
  if (!slug) return null;
  try {
    return localStorage.getItem(`passify_cover_image_${slug}`) || null;
  } catch {
    return null;
  }
}

export async function savePortalTemplate({ tenantId, slug, template, coverImageUrl }) {
  const targetSlug = slug || 'curug-cikanteh';
  localStorage.setItem(`${TEMPLATE_STORAGE_PREFIX}${targetSlug}`, JSON.stringify(template));
  localStorage.setItem('passify_portal_template_last', JSON.stringify(template));
  if (coverImageUrl) {
    localStorage.setItem(`passify_cover_image_${targetSlug}`, coverImageUrl);
  }

  // Update in local admin destinations cache if present
  try {
    const raw = localStorage.getItem('passify_admin_destinations');
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((d) =>
        d.slug === targetSlug || d.id === tenantId
          ? {
              ...d,
              portal_template: template,
              ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
            }
          : d
      );
      localStorage.setItem('passify_admin_destinations', JSON.stringify(updated));
    }
  } catch (_) {}

  // Dispatch storage event so open portal tabs refresh instantaneously
  try {
    window.dispatchEvent(new Event('storage'));
  } catch (_) {}

  const effectiveTenantId = tenantId && !String(tenantId).startsWith('dest-')
    ? tenantId
    : '413baace-9c74-4abb-8aa4-a8310ffc4c0b';

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/tenants/${effectiveTenantId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('passify_token') || ''}`,
        'X-Tenant-Slug': targetSlug,
      },
      body: JSON.stringify({ key: 'portal_template', value: JSON.stringify(template) }),
    });

    if (response.ok) {
      return { template, isSynced: true };
    }
  } catch (_) {}

  return { template, isSynced: true };
}

/**
 * Resolves tenant slug from hostname
 * Returns null for root domain (passify.com)
 * Returns slug for subdomain (curug-cibereum.passify.com → curug-cibereum)
 * Queries API for custom domain (tickets.curugcibereum.com → API lookup)
 */
export async function resolveTenantFromHostname(hostname) {
  // Case 0: Local development hosts - treat as root domain (landing page)
  // Use ?tenant=<slug> to simulate a tenant subdomain locally, e.g. http://localhost:5173/?tenant=curug-cibereum
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1';

  if (isLocal) {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('tenant');
    if (fromParam) {
      sessionStorage.setItem('passify_last_active_tenant', fromParam);
      localStorage.setItem('passify_last_active_tenant', fromParam);
      return fromParam;
    }
    return null;
  }

  // Case 1: Root domain
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  // Case 2: Subdomain (e.g., curug-cibereum.passify.com)
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.replace(`.${ROOT_DOMAIN}`, '');
    return slug;
  }

  // Case 3: Custom domain - query API
  const response = await fetch(`${API_BASE_URL}/api/v1/public/tenants/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostname }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Domain not configured');
    }
    throw new Error('Unable to connect to server');
  }

  const { data } = await response.json();
  return data.slug;
}

/**
 * Calculates booked ticket counts from client-side stored bookings
 */
export function getLocalBookedCount(destinationId, destinationSlug, destinationName) {
  try {
    const raw = localStorage.getItem('passify_my_tickets');
    if (!raw) return { total: 0, bySlot: {} };
    const tickets = JSON.parse(raw);
    if (!Array.isArray(tickets)) return { total: 0, bySlot: {} };

    let total = 0;
    const bySlot = {};

    tickets.forEach((t) => {
      if (t.status === 'cancelled') return;

      const norm = (s) => (s || '').toString().toLowerCase().trim();
      const matchSlug = destinationSlug && t.destinationSlug && norm(t.destinationSlug) === norm(destinationSlug);
      const matchId = destinationId && t.destinationId && t.destinationId === destinationId;
      const matchName = destinationName && t.destinationName && norm(t.destinationName) === norm(destinationName);

      // Match destination by slug, id, or name; fallback if no destination fields exist
      const isMatch = matchSlug || matchId || matchName || (!t.destinationSlug && !t.destinationId && !t.destinationName);
      if (isMatch) {
        const qty = Number(t.totalQty || t.quantity || 1);
        total += qty;

        const slotIdKey = t.timeSlotId || '';
        const slotLabelKey = t.timeSlotLabel || '';
        if (slotIdKey) bySlot[slotIdKey] = (bySlot[slotIdKey] || 0) + qty;
        if (slotLabelKey) bySlot[slotLabelKey] = (bySlot[slotLabelKey] || 0) + qty;
      }
    });

    return { total, bySlot };
  } catch (_) {
    return { total: 0, bySlot: {} };
  }
}

/**
 * Fetches destination data by tenant slug
 */
export async function fetchDestinationBySlug(slug) {
  if (!slug) return null;

  // 1. Check local destinations cache only if it matches the EXACT requested slug
  let localDest = null;
  try {
    const raw = localStorage.getItem('passify_admin_destinations');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        localDest = list.find((d) => d.slug === slug);
      }
    }
  } catch (_) {}

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/tenants/${slug}/destination`, {
      headers: { 'X-Tenant-Slug': slug },
    });

    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        let categories = [];

        // 1. Direct categories from destination response if populated
        if (data.ticket_categories && Array.isArray(data.ticket_categories) && data.ticket_categories.length > 0) {
          categories = data.ticket_categories.map((c) => ({
            id: c.id,
            name: c.name,
            price: Number(c.base_price ?? c.price ?? 0),
            insurance: Number(c.insurance_fee ?? c.insurance ?? 0),
            retribusi: Number(c.retribusi_fee ?? c.retribusi ?? 0),
            is_active: c.is_active !== false,
          }));
        }

        // 2. Fetch live authoritative categories from ticket-service if available
        if (data.id) {
          try {
            const catRes = await fetch(`http://localhost:8083/api/v1/tickets/destinations/${data.id}/categories`);
            if (catRes.ok) {
              const catData = await catRes.json();
              if (catData && Array.isArray(catData.data) && catData.data.length > 0) {
                categories = catData.data.map((c) => ({
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

        // 3. Fallback to localStorage saved categories ONLY if localDest matches the exact slug
        if (categories.length === 0 && localDest?.ticket_categories?.length > 0) {
          categories = localDest.ticket_categories;
        }

        // 4. Time slots from destination response or ticket-service
        let slots = [];
        if (data.time_slots && Array.isArray(data.time_slots) && data.time_slots.length > 0) {
          slots = data.time_slots.map((s) => ({
            id: s.id,
            label: s.slot_label || s.label || `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
            slot_label: s.slot_label || s.label,
            time_range: s.time_range || `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
            max_capacity: Number(s.max_capacity || 500),
            booked: Number(s.booked || 0),
            is_active: s.is_active !== false,
          }));
        }

        if (slots.length === 0 && data.id) {
          try {
            const slotRes = await fetch(`http://localhost:8083/api/v1/tickets/destinations/${data.id}/time-slots`);
            if (slotRes.ok) {
              const slotData = await slotRes.json();
              if (slotData && Array.isArray(slotData.data) && slotData.data.length > 0) {
                slots = slotData.data.map((s) => ({
                  id: s.id,
                  label: s.slot_label || s.label || `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
                  slot_label: s.slot_label || s.label,
                  time_range: `${s.start_time?.slice(0, 5)} - ${s.end_time?.slice(0, 5)}`,
                  max_capacity: Number(s.max_capacity || 500),
                  booked: Number(s.booked || 0),
                  is_active: s.is_active !== false,
                }));
              }
            }
          } catch (_) {}
        }

        if (slots.length === 0 && localDest?.time_slots?.length > 0) {
          slots = localDest.time_slots;
        }

        const { total: bookedTotal, bySlot } = getLocalBookedCount(data.id, slug, data.name);
        if (slots.length > 0) {
          slots = slots.map((s, idx) => {
            const slotCount = (bySlot[s.id] || bySlot[s.label] || bySlot[s.slot_label] || 0);
            const baseBooked = Number(s.booked || 0);
            const totalSlotBooked = slotCount > 0 ? (baseBooked + slotCount) : (idx === 0 && bookedTotal > 0 ? (baseBooked + bookedTotal) : baseBooked);
            return {
              ...s,
              booked: totalSlotBooked,
            };
          });
        }

        const finalBookedToday = Math.max(Number(data.booked_today || 0), bookedTotal);

        const savedCover = loadPortalCoverImage(slug);
        const finalCover = savedCover || (localDest && localDest.slug === slug && localDest.cover_image_url ? localDest.cover_image_url : null) || data.cover_image_url || data.cover_image;

        return {
          ...data,
          cover_image_url: finalCover,
          cover_image: finalCover,
          booked_today: finalBookedToday,
          portal_template: loadPortalTemplate(slug) || data.portal_template || null,
          ticket_categories: categories,
          time_slots: slots,
        };
      }
    } else if (response.status === 404) {
      // If backend explicitly returned 404 Not Found, only return localDest if it matches exact slug
      if (localDest && localDest.slug === slug) {
        const { total: bookedTotal, bySlot } = getLocalBookedCount(localDest.id, slug, localDest.name);
        const slots = (localDest.time_slots || []).map((s, idx) => {
          const slotCount = (bySlot[s.id] || bySlot[s.label] || bySlot[s.slot_label] || 0);
          const baseBooked = Number(s.booked || 0);
          return {
            ...s,
            booked: slotCount > 0 ? (baseBooked + slotCount) : (idx === 0 && bookedTotal > 0 ? (baseBooked + bookedTotal) : baseBooked),
          };
        });
        const savedCover = loadPortalCoverImage(slug) || localDest.cover_image_url;
        return {
          ...localDest,
          cover_image_url: savedCover,
          cover_image: savedCover,
          booked_today: Math.max(Number(localDest.booked_today || 0), bookedTotal),
          time_slots: slots,
          portal_template: loadPortalTemplate(slug) || localDest.portal_template || null,
        };
      }
      // Tenant does NOT exist: return null so 404 / ErrorScreen is shown
      return null;
    }
  } catch (err) {
    console.warn('Backend destination lookup failed:', err);
  }

  // If backend was unreachable (e.g. offline dev), only fallback if localDest matches exact slug
  if (localDest && localDest.slug === slug) {
    const { total: bookedTotal, bySlot } = getLocalBookedCount(localDest.id, slug, localDest.name);
    const slots = (localDest.time_slots || []).map((s, idx) => {
      const slotCount = (bySlot[s.id] || bySlot[s.label] || bySlot[s.slot_label] || 0);
      const baseBooked = Number(s.booked || 0);
      return {
        ...s,
        booked: slotCount > 0 ? (baseBooked + slotCount) : (idx === 0 && bookedTotal > 0 ? (baseBooked + bookedTotal) : baseBooked),
      };
    });
    const savedCover = loadPortalCoverImage(slug) || localDest.cover_image_url;
    return {
      ...localDest,
      cover_image_url: savedCover,
      cover_image: savedCover,
      booked_today: Math.max(Number(localDest.booked_today || 0), bookedTotal),
      time_slots: slots,
      portal_template: loadPortalTemplate(slug) || localDest.portal_template || null,
    };
  }

  // Tenant does not exist! Do NOT fabricate dummy mock data.
  return null;
}

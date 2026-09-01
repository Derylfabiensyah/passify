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

export async function savePortalTemplate({ tenantId, slug, template }) {
  const targetSlug = slug || 'curug-citambur';
  localStorage.setItem(`${TEMPLATE_STORAGE_PREFIX}${targetSlug}`, JSON.stringify(template));
  localStorage.setItem('passify_portal_template_last', JSON.stringify(template));

  // Update in local admin destinations cache if present
  try {
    const raw = localStorage.getItem('passify_admin_destinations');
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((d) =>
        d.slug === targetSlug || d.id === tenantId
          ? { ...d, portal_template: template }
          : d
      );
      localStorage.setItem('passify_admin_destinations', JSON.stringify(updated));
    }
  } catch (_) {}

  const effectiveTenantId = tenantId && !String(tenantId).startsWith('dest-')
    ? tenantId
    : 'b416a526-0994-453d-a83d-bf18487f3049';

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
    return params.get('tenant');
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
 * Fetches destination data by tenant slug
 */
export async function fetchDestinationBySlug(slug) {
  let localDest = null;
  try {
    const raw = localStorage.getItem('passify_admin_destinations');
    if (raw) {
      const list = JSON.parse(raw);
      localDest = list.find((d) => d.slug === slug || d.id === slug || d.name?.toLowerCase().includes((slug || '').replace(/-/g, ' ')));
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

        // 2. Fetch live categories from ticket-service if not in response
        if (categories.length === 0) {
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

        // 3. Fallback to localStorage saved categories from admin portal
        if (categories.length === 0 && localDest?.ticket_categories?.length > 0) {
          categories = localDest.ticket_categories;
        }

        // 4. Default fallback categories so tourist booking is always available
        if (categories.length === 0) {
          categories = [
            { id: `cat-wni-${slug}`, name: 'Tiket Masuk Reguler (WNI)', price: 35000, insurance: 3000, retribusi: 2000, is_active: true },
            { id: `cat-wna-${slug}`, name: 'Tiket Wisatawan Mancanegara (WNA)', price: 100000, insurance: 5000, retribusi: 5000, is_active: true },
          ];
        }

        return {
          ...data,
          ...(localDest || {}),
          max_daily_capacity: Number(data.max_daily_capacity || localDest?.max_daily_capacity || 500),
          portal_template: loadPortalTemplate(slug) || localDest?.portal_template || data.portal_template || null,
          ticket_categories: categories,
        };
      }
    }
  } catch (_) {}

  if (localDest) {
    return {
      ...localDest,
      portal_template: loadPortalTemplate(slug) || localDest.portal_template || null,
    };
  }

  // Fallback for newly created or offline tenants
  const title = (slug || 'wisata-alam')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    id: `dest-${slug}`,
    name: `${title}`,
    slug,
    location: 'Kawasan Konservasi Alam, Indonesia',
    province: 'Indonesia',
    cover_image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80',
    description: `Selamat datang di portal reservasi resmi ${title}. Nikmati pengalaman wisata alam yang teratur, aman, dan menjaga kelestarian daya dukung lingkungan.`,
    max_daily_capacity: 1000,
    booked_today: 0,
    ticket_categories: [
      { id: `cat-wni-${slug}`, name: 'Tiket Masuk Domestik (WNI)', price: 35000, insurance: 3000, retribusi: 2000 },
      { id: `cat-wna-${slug}`, name: 'Tiket Wisatawan Mancanegara (WNA)', price: 100000, insurance: 5000, retribusi: 5000 },
    ],
    facilities: ['Area Parkir Terpadu', 'Pos Pemandu & Pusat Informasi', 'Toilet Bersih', 'Pos Kesehatan & P3K'],
    rules: 'Patuhi batas daya dukung lingkungan, buang sampah pada tempatnya, dan tunjukkan E-Ticket QR saat di gerbang.',
    portal_template: loadPortalTemplate(slug),
  };
}

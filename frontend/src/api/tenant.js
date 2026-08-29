const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'passify.com';

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
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/tenants/${slug}/destination`, {
      headers: { 'X-Tenant-Slug': slug },
    });

    if (response.ok) {
      const { data } = await response.json();
      if (data) return data;
    }
  } catch (_) {}

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
    cover_image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    description: `Selamat datang di portal reservasi resmi ${title}. Nikmati pengalaman wisata alam yang teratur, aman, dan menjaga kelestarian daya dukung lingkungan.`,
    max_daily_capacity: 1000,
    booked_today: 145,
    ticket_categories: [
      { id: `cat-wni-${slug}`, name: 'Tiket Masuk Domestik (WNI)', price: 35000, insurance: 3000, retribusi: 2000 },
      { id: `cat-wna-${slug}`, name: 'Tiket Wisatawan Mancanegara (WNA)', price: 100000, insurance: 5000, retribusi: 5000 },
    ],
    facilities: ['Area Parkir Terpadu', 'Pos Pemandu & Pusat Informasi', 'Toilet Bersih', 'Pos Kesehatan & P3K'],
    rules: 'Patuhi batas daya dukung lingkungan, buang sampah pada tempatnya, dan tunjukkan E-Ticket QR saat di gerbang.',
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'passify.com';

/**
 * Resolves tenant slug from hostname
 * Returns null for root domain (passify.com)
 * Returns slug for subdomain (curug-cibereum.passify.com → curug-cibereum)
 * Queries API for custom domain (tickets.curugcibereum.com → API lookup)
 */
export async function resolveTenantFromHostname(hostname) {
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
  const response = await fetch(`${API_BASE_URL}/api/tenants/resolve`, {
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

  const data = await response.json();
  return data.slug;
}

/**
 * Fetches destination data by tenant slug
 */
export async function fetchDestinationBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/api/destinations/${slug}`, {
    headers: { 'X-Tenant-Slug': slug },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Destination not found');
    }
    throw new Error('Unable to load destination');
  }

  return response.json();
}

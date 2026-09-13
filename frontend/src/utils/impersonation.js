/**
 * Impersonation helper for SuperAdmin to securely manage tenants
 */

const STORAGE_KEY = 'passify_impersonated_tenant';

export function getImpersonatedTenant() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isImpersonating() {
  return Boolean(getImpersonatedTenant()?.slug);
}

export function startImpersonation(tenant, redirectTo = '/admin/destinations') {
  if (!tenant || !tenant.slug) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
  }));
  localStorage.setItem('passify_last_active_tenant', tenant.slug);
  if (redirectTo) {
    window.location.href = redirectTo;
  }
}

export function stopImpersonation(redirectTo = '/admin') {
  localStorage.removeItem(STORAGE_KEY);
  if (redirectTo) {
    window.location.href = redirectTo;
  }
}

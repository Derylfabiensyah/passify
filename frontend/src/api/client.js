import { useTenant } from '../contexts/TenantContext';

export const SERVICE_URLS = {
  auth: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081',
  tenant: import.meta.env.VITE_TENANT_API_URL || 'http://localhost:8082',
  ticket: import.meta.env.VITE_TICKET_API_URL || 'http://localhost:8083',
  payment: import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:8084',
  cashless: import.meta.env.VITE_CASHLESS_API_URL || 'http://localhost:8085',
  gate: import.meta.env.VITE_GATE_API_URL || 'http://localhost:8086',
};

export const API_BASE_URL = SERVICE_URLS.tenant;

/**
 * Shared currency formatter for IDR (Rupiah)
 */
export function formatRupiah(num) {
  return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
}

/**
 * Resolves the appropriate service base URL based on endpoint path
 */
export function resolveServiceUrl(endpoint) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanEndpoint.startsWith('/api/v1/auth')) {
    return `${SERVICE_URLS.auth}${cleanEndpoint}`;
  }
  if (
    cleanEndpoint.startsWith('/api/v1/tickets') ||
    cleanEndpoint.startsWith('/api/v1/seatmap') ||
    cleanEndpoint.startsWith('/api/v1/nfc')
  ) {
    return `${SERVICE_URLS.ticket}${cleanEndpoint}`;
  }
  if (
    cleanEndpoint.startsWith('/api/v1/payments') ||
    cleanEndpoint.startsWith('/api/payments') ||
    cleanEndpoint.startsWith('/api/v1/invoices')
  ) {
    return `${SERVICE_URLS.payment}${cleanEndpoint}`;
  }
  if (
    cleanEndpoint.startsWith('/api/v1/cashless') ||
    cleanEndpoint.startsWith('/api/v1/wallet') ||
    cleanEndpoint.startsWith('/api/v1/cards') ||
    cleanEndpoint.startsWith('/api/v1/merchants')
  ) {
    return `${SERVICE_URLS.cashless}${cleanEndpoint}`;
  }
  if (cleanEndpoint.startsWith('/api/v1/gate')) {
    return `${SERVICE_URLS.gate}${cleanEndpoint}`;
  }

  // Default to tenant service
  return `${SERVICE_URLS.tenant}${cleanEndpoint}`;
}

/**
 * Generate or get existing device fingerprint for anti-bot / rate-limiting protection
 */
export function getDeviceFingerprint() {
  let fp = localStorage.getItem('passify_device_fp');
  if (!fp) {
    const raw = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}|${Math.random().toString(36).substring(2)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    fp = 'fp_' + Math.abs(hash).toString(16) + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('passify_device_fp', fp);
  }
  return fp;
}

/**
 * Direct API request helper (can be used outside React hooks)
 */
export async function apiRequest(endpoint, options = {}) {
  const targetUrl = resolveServiceUrl(endpoint);
  const isBookingOrQueue = endpoint.includes('/book') || endpoint.includes('/queue');
  const headers = {
    'Content-Type': 'application/json',
    ...(isBookingOrQueue ? { 'X-Device-Fingerprint': getDeviceFingerprint() } : {}),
    ...options.headers,
  };

  const currentSlug = localStorage.getItem('passify_current_tenant');
  if (currentSlug && !headers['X-Tenant-Slug']) {
    headers['X-Tenant-Slug'] = currentSlug;
  }

  const token = localStorage.getItem('passify_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body = (options.body && typeof options.body === 'object' && !(options.body instanceof FormData))
    ? JSON.stringify(options.body)
    : options.body;

  const response = await fetch(targetUrl, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(error.message || error.error?.details || 'Request failed');
  }

  return response.json();
}

/**
 * API client hook that automatically includes tenant context and device fingerprint
 */
export function useApiClient() {
  const { slug } = useTenant();

  const request = async (endpoint, options = {}) => {
    const customHeaders = { ...options.headers };
    if (slug) {
      customHeaders['X-Tenant-Slug'] = slug;
    }
    return apiRequest(endpoint, { ...options, headers: customHeaders });
  };

  return {
    get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
    post: (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
    put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
    delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
  };
}

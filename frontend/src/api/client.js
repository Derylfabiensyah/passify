import { useTenant } from '../contexts/TenantContext';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

/**
 * Generate or get existing device fingerprint for anti-bot / rate-limiting protection
 */
export function getDeviceFingerprint() {
  let fp = localStorage.getItem('passify_device_fp');
  if (!fp) {
    // Generate a pseudo-fingerprint using screen, language, timezone, userAgent, and random salt
    const raw = `${navigator.userAgent}|${navigator.language}|${screen.width}x${screen.height}|${new Date().getTimezoneOffset()}|${Math.random().toString(36).substring(2)}`;
    // Simple hash function
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
 * API client hook that automatically includes tenant context and device fingerprint
 */
export function useApiClient() {
  const { slug } = useTenant();

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      'X-Device-Fingerprint': getDeviceFingerprint(),
      ...options.headers,
    };

    // Add tenant slug header if tenant context exists
    if (slug) {
      headers['X-Tenant-Slug'] = slug;
    }

    // Add authentication token if present
    const token = localStorage.getItem('passify_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  };

  return {
    get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
    post: (endpoint, body, options) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
    put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
    delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
  };
}

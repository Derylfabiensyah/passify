import { useTenant } from '../contexts/TenantContext';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * API client hook that automatically includes tenant context
 */
export function useApiClient() {
  const { slug } = useTenant();

  const request = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
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

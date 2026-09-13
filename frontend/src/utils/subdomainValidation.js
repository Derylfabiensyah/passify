/**
 * Subdomain validation utility for Passify white-label platform
 */

export const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'billing',
  'cashless',
  'dashboard',
  'gate',
  'help',
  'login',
  'mail',
  'passify',
  'payment',
  'portal',
  'root',
  'status',
  'superadmin',
  'support',
  'system',
  'test',
  'ticket',
  'www'
]);

export function isValidSubdomainFormat(subdomain) {
  if (!subdomain) return false;
  const clean = subdomain.trim().toLowerCase();
  if (clean.length < 3 || clean.length > 50) return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(clean);
}

export function isReservedSubdomain(subdomain) {
  if (!subdomain) return false;
  return RESERVED_SUBDOMAINS.has(subdomain.trim().toLowerCase());
}

export function validateSubdomainInput(subdomain) {
  const clean = (subdomain || '').trim().toLowerCase();
  if (!clean) {
    return { isValid: false, message: 'Subdomain wajib diisi' };
  }
  if (clean.length < 3) {
    return { isValid: false, message: 'Subdomain minimal 3 karakter' };
  }
  if (clean.length > 50) {
    return { isValid: false, message: 'Subdomain maksimal 50 karakter' };
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(clean)) {
    return {
      isValid: false,
      message: 'Subdomain hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)'
    };
  }
  if (isReservedSubdomain(clean)) {
    return {
      isValid: false,
      message: `Subdomain "${clean}" dilindungi sistem Passify dan tidak dapat digunakan`
    };
  }
  return { isValid: true, message: '' };
}

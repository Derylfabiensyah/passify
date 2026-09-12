import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Compass, Lock, Mail, Phone, ShieldCheck, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const AUTH_API = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api/v1/auth';
const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'passify.com';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1025715735364-f9ajif8q1dkcbkp25faubg92he1p7j29.apps.googleusercontent.com';

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function TravelerAuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [registration, setRegistration] = useState({ name: '', email: '', phone: '', password: '' });

  const queryReturn = searchParams.get('return') || searchParams.get('redirect');
  const queryTenant = searchParams.get('tenant');
  const returnTo = location.state?.from || queryReturn;
  const targetTenant =
    location.state?.tenantSlug ||
    queryTenant ||
    sessionStorage.getItem('passify_last_active_tenant') ||
    localStorage.getItem('passify_last_active_tenant');
  const nextState = location.state?.openBooking ? { openBooking: true } : undefined;

  const handleAuthenticationSuccess = (user, token) => {
    localStorage.setItem('passify_user', JSON.stringify(user));
    localStorage.setItem('passify_token', token || 'demo-jwt-token');

    // Role-based smart redirection
    const role = user.role || 'visitor';
    const isManager = role === 'tenant_admin' || role === 'super_admin' || role === 'tenant_staff' || role === 'gate_officer' || role === 'vendor' || role === 'pengelola';
    const tenantSlug = user.tenant?.slug || user.tenant?.subdomain || user.tenant_slug;

    if (isManager) {
      const activeTenant = tenantSlug || targetTenant;
      if (activeTenant) {
        localStorage.setItem('passify_current_tenant', activeTenant);
        sessionStorage.setItem('passify_last_active_tenant', activeTenant);
        try {
          const raw = localStorage.getItem('passify_admin_destinations');
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.length > 0 && list[0].slug !== activeTenant) {
              localStorage.removeItem('passify_admin_destinations');
            }
          }
        } catch (_) {}
      }
      navigate('/admin');
      return;
    }

    // Traveler (Wisatawan) redirection
    // 1. If explicit returnTo is provided and not generic
    if (returnTo && returnTo !== '/jelajah' && returnTo !== '/masuk' && returnTo !== '/daftar') {
      navigate(returnTo, { state: nextState });
      return;
    }

    // 2. If user logged out from a tenant or targetTenant is specified, redirect directly to that tenant
    if (targetTenant) {
      navigate(`/?tenant=${targetTenant}`);
      return;
    }

    navigate('/jelajah');
  };

  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      let email = '';
      let name = '';
      let picture = '';
      const token = credentialResponse?.credential || credentialResponse;

      if (token && typeof token === 'string') {
        const payload = parseJwt(token);
        email = payload?.email || '';
        name = payload?.name || '';
        picture = payload?.picture || '';
      }

      const res = await fetch(`${AUTH_API}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'wisatawan.google@gmail.com',
          name: name || 'Wisatawan Google',
          avatar: picture || '',
          id_token: token || 'google-id-token',
          role: 'visitor',
        }),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.data?.access_token)) {
        const payload = data.data || data;
        const rawUser = payload.user || payload;
        const userObj = {
          id: rawUser.id || 'usr-google',
          email: rawUser.email || email,
          name: rawUser.full_name || rawUser.name || name || email.split('@')[0],
          full_name: rawUser.full_name || rawUser.name || name,
          role: rawUser.role || 'visitor',
          avatar_url: rawUser.avatar_url || picture,
          tenant_id: rawUser.tenant_id || null,
          tenant_slug: rawUser.tenant_slug || null,
          tenant_name: rawUser.tenant_name || null,
        };
        handleAuthenticationSuccess(userObj, payload.access_token);
        return;
      }
      throw new Error(data.message || 'Gagal autentikasi Google.');
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const demoUser = {
          id: 'usr-google-demo',
          name: 'Wisatawan Google (Demo)',
          email: 'wisatawan.google@gmail.com',
          role: 'visitor',
        };
        handleAuthenticationSuccess(demoUser, 'demo-google-token');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [googleGsiReady, setGoogleGsiReady] = useState(false);

  useEffect(() => {
    const initGoogleGSI = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleAuth,
        });
        const container = document.getElementById('google-signin-btn-container');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: isLogin ? 'signin_with' : 'signup_with',
            shape: 'pill',
          });
          setTimeout(() => {
            if (container.children && container.children.length > 0) {
              setGoogleGsiReady(true);
            }
          }, 400);
        }
      }
    };

    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogleGSI;
      document.body.appendChild(script);
    } else {
      initGoogleGSI();
    }
  }, [isLogin]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!login.email || !login.password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      // Call Auth Microservice
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: login.email.trim(),
          password: login.password,
        }),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.data?.access_token)) {
        const payload = data.data || data;
        const rawUser = payload.user || payload;
        const tenantInfo = rawUser.tenant || payload.tenant || {};
        const tenantSlug = tenantInfo.slug || tenantInfo.subdomain || rawUser.tenant_slug;
        const tenantName = tenantInfo.name || rawUser.tenant_name;

        const userObj = {
          id: rawUser.id || 'usr-default',
          email: login.email,
          name: rawUser.full_name || rawUser.name || login.email.split('@')[0],
          full_name: rawUser.full_name || rawUser.name || login.email.split('@')[0],
          role: rawUser.role || (login.email.includes('admin') ? 'tenant_admin' : 'visitor'),
          tenant_id: rawUser.tenant_id || tenantInfo.id || null,
          tenant_slug: tenantSlug || null,
          tenant_name: tenantName || null,
          tenant: tenantInfo.id ? tenantInfo : (tenantSlug ? { id: rawUser.tenant_id, name: tenantName, slug: tenantSlug } : null),
        };

        handleAuthenticationSuccess(userObj, payload.access_token || payload.token);
        return;
      }

      // Backend error returned
      throw new Error(data.message || data.error?.details || 'Email atau kata sandi tidak valid.');
    } catch (err) {
      // If backend unreachable or demo account
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const isManager = login.email.includes('admin') || login.email.includes('pengelola') || login.email.includes('tenant');
        const demoUser = {
          id: `usr-${Math.floor(100 + Math.random() * 900)}`,
          name: login.email.split('@')[0].toUpperCase(),
          email: login.email,
          role: isManager ? 'tenant_admin' : 'visitor',
          tenant_slug: isManager ? 'curug-bidadari' : undefined,
          phone: '081234567890',
        };
        handleAuthenticationSuccess(demoUser, 'demo-offline-token');
        return;
      }

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async (event) => {
    event.preventDefault();
    setError('');

    if (!registration.name || !registration.email || !registration.password) {
      setError('Mohon lengkapi seluruh field wajib.');
      return;
    }

    if (registration.password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      // Call Auth Microservice
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: registration.name.trim(),
          email: registration.email.trim(),
          password: registration.password,
          phone: registration.phone.trim() || undefined,
          role: 'visitor',
        }),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.data)) {
        const payload = data.data || data;
        const userObj = payload.user || payload || {
          name: registration.name,
          email: registration.email,
          role: 'visitor',
          phone: registration.phone,
        };
        handleAuthenticationSuccess(userObj, payload.access_token || payload.token);
        return;
      }

      throw new Error(data.message || data.error?.details || 'Pendaftaran gagal diproses.');
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const demoUser = {
          id: `usr-${Math.floor(100 + Math.random() * 900)}`,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          role: 'visitor',
        };
        handleAuthenticationSuccess(demoUser, 'demo-offline-token');
        return;
      }

      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setRegistrationValue = (field, value) =>
    setRegistration((previous) => ({ ...previous, [field]: value }));

  const backTarget =
    returnTo && returnTo !== '/masuk' && returnTo !== '/daftar'
      ? returnTo
      : targetTenant
      ? `/?tenant=${targetTenant}`
      : '/';

  return (
    <div className="min-h-screen bg-transparent text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
      <header className="nav-bar sticky top-0 z-40">
        <div className="mx-auto flex min-h-[68px] max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="text-2xl font-bold tracking-[-.05em] text-[var(--forest-deep)]">passify</span>
          </Link>
          <Link to={backTarget} className="text-xs font-bold text-[var(--forest)] hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-68px)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.78fr_1.22fr] lg:py-14 flex-1">
        {/* Left Side Banner */}
        <section className="order-2 rounded-2xl bg-[var(--forest-deep)] p-7 text-white shadow-md lg:order-1 lg:p-9 space-y-5">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-[var(--leaf)]">
            Akses Terpadu Passify
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-[1.05] text-white">
            Kelola wisata atau nikmati perjalanan alam tanpa antre.
          </h1>
          <p className="text-xs sm:text-sm leading-relaxed text-white/75">
            Satu akun untuk mengelola tiket, mengakses <strong>Dashboard Pengelola Wisata</strong>, dan membuka <strong>E-Ticket Dynamic QR 10 Menit</strong> Anda.
          </p>

          <ul className="space-y-3.5 text-xs text-white/85 pt-2">
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--leaf)] mt-0.5" />
              <span><strong>Pengelola Wisata (Tenant):</strong> Masuk untuk membuka Dashboard Penjualan, Kuota, & Gate Scanner.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--leaf)] mt-0.5" />
              <span><strong>Wisatawan:</strong> Lihat riwayat tiket aktif & invoice reservasi resmi.</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-white/15">
            <p className="text-[11px] text-white/60">
              Belum punya akun destinasi wisata?{' '}
              <Link to="/daftar-wisata" className="text-[var(--leaf)] font-bold hover:underline">
                Daftarkan Wisata Baru
              </Link>
            </p>
          </div>
        </section>

        {/* Right Side Form Card */}
        <section className="order-1 glass-panel p-6 rounded-2xl sm:p-8 lg:order-2 space-y-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--bark)]">
              {isLogin ? 'Autentikasi Akun' : 'Registrasi Wisatawan'}
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[var(--forest-deep)]">
              {isLogin ? 'Masuk ke Akun Anda' : 'Daftar Akun Wisatawan'}
            </h2>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              {isLogin
                ? 'Gunakan email dan password terdaftar Anda.'
                : 'Simpan tiket, riwayat pesanan, dan buka QR dinamis dengan mudah.'}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 p-3.5 text-xs text-red-800 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Google Auth Button */}
          <div className="space-y-3">
            <div id="google-signin-btn-container" className="w-full flex justify-center min-h-[44px]"></div>
            
            {!googleGsiReady && (
              <button
                type="button"
                onClick={() => handleGoogleAuth('1025715735364-f9ajif8q1dkcbkp25faubg92he1p7j29.apps.googleusercontent.com')}
                className="w-full flex items-center justify-center gap-2.5 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 hover:shadow-xs transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isLogin ? 'Lanjutkan dengan Google' : 'Daftar dengan Google'}</span>
              </button>
            )}

            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-emerald-900/15"></div>
              <span className="absolute left-1/2 -translate-x-1/2 bg-[#e3eedf] px-3.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#3d4d38] rounded-full border border-white/80 shadow-2xs whitespace-nowrap">
                atau email & password
              </span>
            </div>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" />
                  <input
                    id="login-email-input"
                    type="email"
                    className="field-control pl-10 text-xs font-medium"
                    value={login.email}
                    onChange={(e) => setLogin({ ...login, email: e.target.value })}
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="field-control pl-10 pr-10 text-xs font-medium"
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[var(--ink-soft)] hover:text-[var(--forest-deep)] transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke Akun <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" />
                  <input
                    id="register-name-input"
                    className="field-control pl-10 text-xs font-medium"
                    value={registration.name}
                    onChange={(e) => setRegistrationValue('name', e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" />
                  <input
                    id="register-email-input"
                    type="email"
                    className="field-control pl-10 text-xs font-medium"
                    value={registration.email}
                    onChange={(e) => setRegistrationValue('email', e.target.value)}
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                  Nomor WhatsApp <span className="normal-case font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    className="field-control pl-10 text-xs font-medium"
                    value={registration.phone}
                    onChange={(e) => setRegistrationValue('phone', e.target.value)}
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-1.5">
                  Kata Sandi <span className="normal-case font-normal">(min. 6 karakter)</span>
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" />
                  <input
                    id="register-password-input"
                    type={showRegisterPassword ? 'text' : 'password'}
                    className="field-control pl-10 pr-10 text-xs font-medium"
                    value={registration.password}
                    onChange={(e) => setRegistrationValue('password', e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    aria-label={showRegisterPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[var(--ink-soft)] hover:text-[var(--forest-deep)] transition-colors cursor-pointer"
                  >
                    {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mendaftarkan...
                  </>
                ) : (
                  <>
                    Buat Akun Wisatawan <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-[var(--ink-soft)]">
            {isLogin ? (
              <>
                Belum memiliki akun?{' '}
                <Link
                  to={{ pathname: '/daftar', search: location.search }}
                  state={location.state}
                  className="font-bold text-[var(--forest)] hover:underline"
                >
                  Daftar sekarang
                </Link>
              </>
            ) : (
              <>
                Sudah memiliki akun?{' '}
                <Link
                  to={{ pathname: '/masuk', search: location.search }}
                  state={location.state}
                  className="font-bold text-[var(--forest)] hover:underline"
                >
                  Masuk ke akun
                </Link>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}



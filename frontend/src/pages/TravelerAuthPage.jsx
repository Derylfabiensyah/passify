import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Lock, Mail, Phone, ShieldCheck, User, Loader2, AlertCircle } from 'lucide-react';

const AUTH_API = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api/v1/auth';
const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'passify.com';

export default function TravelerAuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [registration, setRegistration] = useState({ name: '', email: '', phone: '', password: '' });

  const returnTo = location.state?.from;
  const nextState = location.state?.openBooking ? { openBooking: true } : undefined;

  const handleAuthenticationSuccess = (user, token) => {
    localStorage.setItem('passify_user', JSON.stringify(user));
    localStorage.setItem('passify_token', token || 'demo-jwt-token');

    // Role-based smart redirection
    const role = user.role || 'visitor';
    const isManager = role === 'tenant_admin' || role === 'super_admin' || role === 'tenant_staff' || role === 'gate_officer' || role === 'vendor' || role === 'pengelola';
    const tenantSlug = user.tenant?.slug || user.tenant?.subdomain || user.tenant_slug;

    if (isManager) {
      const slug = tenantSlug || 'curug-bidadari';
      localStorage.setItem('passify_current_tenant', slug);

      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '::1';

      if (isLocal) {
        // Open the Tenant's Website Template for their specific nature destination
        window.location.href = `/?tenant=${slug}`;
        return;
      } else {
        // On production, redirect to the tenant's official domain
        window.location.href = `https://${slug}.${ROOT_DOMAIN}`;
        return;
      }
    }

    // Traveler (Wisatawan) redirection
    if (returnTo && returnTo !== '/jelajah' && returnTo !== '/masuk' && returnTo !== '/daftar') {
      navigate(returnTo, { replace: true, state: nextState });
    } else {
      navigate('/riwayat-pesanan', { replace: true });
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!login.email || !login.password) {
      setError('Masukkan email dan kata sandi untuk melanjutkan.');
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
        const userObj = payload.user || {
          id: payload.id || 'usr-default',
          email: login.email,
          name: payload.full_name || login.email.split('@')[0],
          role: payload.role || (login.email.includes('admin') ? 'tenant_admin' : 'visitor'),
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

  const backTarget = returnTo && returnTo !== '/masuk' ? returnTo : '/';

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
      <header className="nav-bar sticky top-0 z-40 bg-white/90 backdrop-blur-md">
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
        <section className="order-2 rounded-3xl bg-[var(--forest-deep)] p-7 text-white shadow-md lg:order-1 lg:p-9 space-y-5">
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
        <section className="order-1 card bg-white p-6 shadow-sm rounded-3xl sm:p-8 lg:order-2 space-y-5">
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
                    type="password"
                    className="field-control pl-10 text-xs font-medium"
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm disabled:opacity-60 cursor-pointer"
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
                    type="password"
                    className="field-control pl-10 text-xs font-medium"
                    value={registration.password}
                    onChange={(e) => setRegistrationValue('password', e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm disabled:opacity-60 cursor-pointer"
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
                <Link to="/daftar" state={location.state} className="font-bold text-[var(--forest)] hover:underline">
                  Daftar sekarang
                </Link>
              </>
            ) : (
              <>
                Sudah memiliki akun?{' '}
                <Link to="/masuk" state={location.state} className="font-bold text-[var(--forest)] hover:underline">
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

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';

function createUser({ name, email, phone, role }) {
  return {
    id: `usr-${Math.floor(100 + Math.random() * 900)}`,
    name,
    email,
    role,
    phone: phone || '081234567890',
    avatar: name.charAt(0).toUpperCase(),
  };
}

export default function TravelerAuthPage({ mode }) {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [registration, setRegistration] = useState({ name: '', email: '', phone: '', password: '' });
  const returnTo = location.state?.from || '/jelajah';
  const nextState = location.state?.openBooking ? { openBooking: true } : undefined;

  const finishAuthentication = (user) => {
    localStorage.setItem('passify_user', JSON.stringify(user));
    localStorage.setItem('passify_token', 'demo-jwt-token-99281');
    navigate(returnTo, { replace: true, state: nextState });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setError('');
    if (!login.email || !login.password) {
      setError('Masukkan email dan kata sandi untuk melanjutkan.');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const isManager = login.email.includes('admin') || login.email.includes('pengelola');
      finishAuthentication(createUser({ name: login.email.split('@')[0].toUpperCase(), email: login.email, role: isManager ? 'pengelola' : 'wisatawan' }));
      setLoading(false);
    }, 500);
  };

  const handleRegistration = (event) => {
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
    window.setTimeout(() => {
      finishAuthentication(createUser({ name: registration.name, email: registration.email, phone: registration.phone, role: 'wisatawan' }));
      setLoading(false);
    }, 500);
  };

  const setRegistrationValue = (field, value) => setRegistration((previous) => ({ ...previous, [field]: value }));
  const backTarget = returnTo === '/' ? '/' : '/jelajah';

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="nav-bar">
        <div className="mx-auto flex min-h-[68px] max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 no-underline"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--forest-deep)] text-white"><Compass className="h-4 w-4" /></span><span><span className="block font-serif text-xl font-bold text-[var(--forest-deep)]">passify</span><span className="block text-[9px] font-extrabold uppercase tracking-[.14em] text-[var(--ink-soft)]">Portal perjalanan</span></span></Link>
          <Link to={backTarget} className="text-xs font-bold text-[var(--forest)] hover:text-[var(--bark)]">Kembali</Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-68px)] max-w-5xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[.78fr_1.22fr] lg:py-14">
        <section className="order-2 rounded-[var(--radius-lg)] bg-[var(--forest-deep)] p-7 text-white shadow-[var(--shadow-lift)] lg:order-1 lg:p-9">
          <p className="eyebrow !text-[var(--leaf)]">Akun Passify</p>
          <h1 className="mt-3 text-4xl font-bold leading-[.98] text-white">Satu langkah menuju perjalanan yang lebih tertata.</h1>
          <p className="mt-5 text-sm leading-6 text-white/75">Simpan informasi pemesanan, dapatkan e-ticket, dan gunakan QR aman saat memasuki kawasan.</p>
          <ul className="mt-7 space-y-4 text-sm text-white/85"><li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[var(--leaf)]" />Data pemesanan tersimpan rapi di akun Anda.</li><li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[var(--leaf)]" />QR tiket diterbitkan setelah konfirmasi pesanan.</li></ul>
        </section>

        <section className="order-1 card p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:order-2">
          <p className="eyebrow">{isLogin ? 'Akses akun' : 'Akun baru'}</p>
          <h2 className="mt-2 text-3xl font-bold">{isLogin ? 'Masuk ke akun Anda' : 'Daftar sebagai wisatawan'}</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{isLogin ? 'Lanjutkan pemesanan atau lihat informasi tiket Anda.' : 'Buat akun agar pemesanan dan e-ticket Anda mudah dikelola.'}</p>
          {error && <p role="alert" className="mt-5 rounded-xl border border-[var(--bark)]/25 bg-[var(--bark-pale)] px-3.5 py-3 text-xs font-semibold text-[var(--bark)]">{error}</p>}

          {isLogin ? <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="login-email-input" type="email" className="field-control pl-10" value={login.email} onChange={(event) => setLogin((previous) => ({ ...previous, email: event.target.value }))} placeholder="nama@email.com" required /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 flex items-center justify-between uppercase tracking-wide text-[var(--ink-soft)]">Kata sandi <span className="normal-case tracking-normal text-[var(--bark)]">Minimal 6 karakter</span></span><span className="relative block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="login-password-input" type="password" className="field-control pl-10" value={login.password} onChange={(event) => setLogin((previous) => ({ ...previous, password: event.target.value }))} placeholder="••••••••" required /></span></label>
            <button id="login-submit-btn" type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Memproses…' : 'Masuk dan lanjutkan'}<ArrowRight className="h-4 w-4" /></button>
          </form> : <form onSubmit={handleRegistration} className="mt-6 space-y-4">
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Nama lengkap</span><span className="relative block"><User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-name-input" className="field-control pl-10" value={registration.name} onChange={(event) => setRegistrationValue('name', event.target.value)} placeholder="Nama lengkap Anda" required /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Alamat email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-email-input" type="email" className="field-control pl-10" value={registration.email} onChange={(event) => setRegistrationValue('email', event.target.value)} placeholder="nama@email.com" required /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Nomor WhatsApp <em className="normal-case text-[var(--ink-muted)]">(opsional)</em></span><span className="relative block"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-phone-input" type="tel" className="field-control pl-10" value={registration.phone} onChange={(event) => setRegistrationValue('phone', event.target.value)} placeholder="081234567890" /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Kata sandi</span><span className="relative block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-password-input" type="password" className="field-control pl-10" value={registration.password} onChange={(event) => setRegistrationValue('password', event.target.value)} placeholder="Minimal 6 karakter" required /></span></label>
            <button id="register-submit-btn" type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Membuat akun…' : 'Buat akun dan lanjutkan'}<ArrowRight className="h-4 w-4" /></button>
          </form>}
          <p className="mt-6 border-t border-[var(--border)] pt-5 text-center text-xs text-[var(--ink-soft)]">{isLogin ? <>Belum memiliki akun? <Link to="/daftar" state={location.state} className="font-bold text-[var(--forest)] hover:text-[var(--bark)]">Daftar sekarang</Link></> : <>Sudah memiliki akun? <Link to="/masuk" state={location.state} className="font-bold text-[var(--forest)] hover:text-[var(--bark)]">Masuk ke akun</Link></>}</p>
        </section>
      </main>
    </div>
  );
}

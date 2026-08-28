import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registration, setRegistration] = useState({ name: '', email: '', phone: '', role: 'wisatawan', password: '' });

  if (!isOpen) return null;

  const completeAuth = (user) => {
    localStorage.setItem('passify_user', JSON.stringify(user));
    localStorage.setItem('passify_token', 'demo-jwt-token-99281');
    onAuthSuccess(user);
  };

  const submitLogin = (event) => {
    event.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) return setError('Silakan masukkan email dan kata sandi Anda.');
    setLoading(true);
    setTimeout(() => {
      const isManager = loginEmail.includes('admin') || loginEmail.includes('pengelola');
      completeAuth({ id: `usr-${Math.floor(100 + Math.random() * 900)}`, name: loginEmail.split('@')[0].toUpperCase(), email: loginEmail, role: isManager ? 'pengelola' : 'wisatawan', phone: '081234567890', avatar: loginEmail.charAt(0).toUpperCase() });
      setLoading(false);
    }, 600);
  };

  const submitRegistration = (event) => {
    event.preventDefault();
    setError('');
    if (!registration.name || !registration.email || !registration.password) return setError('Mohon lengkapi seluruh field wajib.');
    if (registration.password.length < 6) return setError('Kata sandi minimal 6 karakter.');
    setLoading(true);
    setTimeout(() => {
      completeAuth({ id: `usr-${Math.floor(100 + Math.random() * 900)}`, name: registration.name, email: registration.email, role: registration.role, phone: registration.phone || '081234567890', avatar: registration.name.charAt(0).toUpperCase() });
      setLoading(false);
    }, 600);
  };

  const updateRegistration = (field, value) => setRegistration((previous) => ({ ...previous, [field]: value }));
  const inputClass = 'field-control pl-10';

  return (
    <div className="modal-overlay" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="modal-content card relative max-w-md overflow-hidden bg-[var(--sand)]">
        <div className="bg-[var(--forest-deep)] px-6 pb-6 pt-7 text-white sm:px-7">
          <button id="close-auth-modal-btn" type="button" onClick={onClose} aria-label="Tutup modal" className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 transition-colors hover:bg-white/20"><X className="h-4 w-4" /></button>
          <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[var(--leaf)]">Akses akun</p>
          <h2 className="mt-2 pr-10 font-serif text-3xl font-bold text-white">{mode === 'login' ? 'Selamat datang kembali' : 'Mulai perjalanan Anda'}</h2>
          <p className="mt-2 text-sm text-white/75">{mode === 'login' ? 'Masuk untuk menyimpan dan melanjutkan pemesanan.' : 'Buat akun untuk memesan tiket atau mengelola kawasan.'}</p>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-2 rounded-xl border border-[var(--border)] bg-[var(--fog)] p-1">
            {[['login', 'Masuk'], ['register', 'Daftar baru']].map(([value, label]) => <button key={value} id={`auth-tab-${value}`} type="button" onClick={() => { setMode(value); setError(''); }} className={`min-h-10 rounded-lg px-3 text-sm font-bold transition-colors ${mode === value ? 'bg-[var(--sand)] text-[var(--forest-deep)] shadow-sm' : 'text-[var(--ink-soft)] hover:text-[var(--forest-deep)]'}`}>{label}</button>)}
          </div>

          {error && <div role="alert" className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-[var(--bark)]/25 bg-[var(--bark-pale)] px-3.5 py-3 text-xs font-semibold text-[var(--bark)]"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Tutup pesan kesalahan"><X className="h-4 w-4" /></button></div>}

          {mode === 'login' ? <form onSubmit={submitLogin} className="mt-5 space-y-4">
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Email akses</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="login-email-input" type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} className={inputClass} placeholder="nama@email.com" required /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 flex items-center justify-between uppercase tracking-wide text-[var(--ink-soft)]">Kata sandi <button type="button" className="normal-case tracking-normal text-[var(--bark)] hover:underline">Lupa sandi?</button></span><span className="relative block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="login-password-input" type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} className="field-control px-10" placeholder="••••••••" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            <button id="login-submit-btn" type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Memproses…' : 'Masuk dan lanjutkan'}<ArrowRight className="h-4 w-4" /></button>
          </form> : <form onSubmit={submitRegistration} className="mt-5 space-y-4">
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Nama lengkap</span><span className="relative block"><User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-name-input" value={registration.name} onChange={(event) => updateRegistration('name', event.target.value)} className={inputClass} placeholder="Nama lengkap Anda" required /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Alamat email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-email-input" type="email" value={registration.email} onChange={(event) => updateRegistration('email', event.target.value)} className={inputClass} placeholder="nama@email.com" required /></span></label>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Nomor WhatsApp <em className="normal-case text-[var(--ink-muted)]">(opsional)</em></span><span className="relative block"><Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-phone-input" type="tel" value={registration.phone} onChange={(event) => updateRegistration('phone', event.target.value)} className={inputClass} placeholder="081234567890" /></span></label>
            <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--ink-soft)]">Saya mendaftar sebagai</legend><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => updateRegistration('role', 'wisatawan')} className={`rounded-xl border p-3 text-left text-xs font-semibold ${registration.role === 'wisatawan' ? 'border-[var(--forest)] bg-[var(--leaf-pale)] text-[var(--forest-deep)]' : 'border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--fog)]'}`}><User className="mb-2 h-4 w-4 text-[var(--bark)]" />Wisatawan</button><button type="button" onClick={() => updateRegistration('role', 'pengelola')} className={`rounded-xl border p-3 text-left text-xs font-semibold ${registration.role === 'pengelola' ? 'border-[var(--forest)] bg-[var(--leaf-pale)] text-[var(--forest-deep)]' : 'border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--fog)]'}`}><ShieldCheck className="mb-2 h-4 w-4 text-[var(--bark)]" />Pengelola</button></div></fieldset>
            <label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Kata sandi</span><span className="relative block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bark)]" /><input id="register-password-input" type={showPassword ? 'text' : 'password'} value={registration.password} onChange={(event) => updateRegistration('password', event.target.value)} className="field-control px-10" placeholder="Minimal 6 karakter" required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            <button id="register-submit-btn" type="submit" disabled={loading} className="btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Membuat akun…' : 'Buat akun'}<ArrowRight className="h-4 w-4" /></button>
          </form>}
        </div>
      </div>
    </div>
  );
}

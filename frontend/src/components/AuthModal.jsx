import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('wisatawan');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isManager = loginEmail.includes('admin') || loginEmail.includes('pengelola');
      const userObj = {
        id: `usr-${Math.floor(100 + Math.random() * 900)}`,
        name: loginEmail.split('@')[0].toUpperCase(),
        email: loginEmail,
        role: isManager ? 'pengelola' : 'wisatawan',
        phone: '081234567890',
        avatar: loginEmail.charAt(0).toUpperCase()
      };
      localStorage.setItem('passify_user', JSON.stringify(userObj));
      localStorage.setItem('passify_token', 'demo-jwt-token-99281');
      onAuthSuccess(userObj);
    }, 600);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPassword) {
      setError('Mohon lengkapi seluruh field wajib.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser = {
        id: `usr-${Math.floor(100 + Math.random() * 900)}`,
        name: regName,
        email: regEmail,
        role: regRole,
        phone: regPhone || '081234567890',
        avatar: regName.charAt(0).toUpperCase()
      };
      localStorage.setItem('passify_user', JSON.stringify(newUser));
      localStorage.setItem('passify_token', 'demo-jwt-token-99281');
      onAuthSuccess(newUser);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content card relative max-w-md w-full overflow-hidden rounded-[18px] border border-[#cddac8] bg-[#fffdf8] p-0 shadow-[0_24px_60px_rgba(23,59,50,0.18)]">
        {/* Header Tabs */}
        <div className="flex items-start justify-between border-b border-[#28594e] bg-[#173b32] px-6 py-5 sm:px-7 sm:py-6">
          <div>
            <h2 className="font-['Outfit'] text-[1.25rem] font-bold leading-tight text-white">
              Portal Akses Passify Cloud
            </h2>
            <p className="mt-1 text-sm leading-snug text-[#dce8d3]">
              {mode === 'login' ? 'Masuk ke akun Anda' : 'Daftarkan akun tenant / pengunjung'}
            </p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-[#9aae85] hover:text-[#173b32] focus:outline-none focus:ring-2 focus:ring-[#dce8d3]"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-5 sm:px-7">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#cddac8] bg-[#e7efdf] p-1">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#9aae85] ${
                mode === 'login'
                  ? 'border border-[#b8cbb0] bg-white text-[#173b32] shadow-sm'
                  : 'text-[#52635d] hover:bg-white/60 hover:text-[#173b32]'
              }`}
            >
              Masuk
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#9aae85] ${
                mode === 'register'
                  ? 'border border-[#b8cbb0] bg-white text-[#173b32] shadow-sm'
                  : 'text-[#52635d] hover:bg-white/60 hover:text-[#173b32]'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#c98c66] bg-[#fff3e8] px-3.5 py-3 text-sm leading-snug text-[#704127]">
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-3 text-[#9a5c35] transition-colors hover:text-[#5f3622]" aria-label="Tutup pesan kesalahan">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#173b32]">Email Akses</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80512f]" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] py-2.5 pl-10 pr-4 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-[#173b32]">Kata Sandi</label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs font-semibold text-[#80512f] hover:underline">
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80512f]" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] py-2.5 pl-10 pr-10 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#80512f] transition-colors hover:text-[#173b32]"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#173b32] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#28594e] focus:outline-none focus:ring-2 focus:ring-[#9aae85] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#7b9680]"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>


            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#173b32]">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80512f]" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] py-2.5 pl-10 pr-4 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#173b32]">Alamat Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80512f]" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] py-2.5 pl-10 pr-4 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#173b32]">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80512f]" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    placeholder="081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] py-2.5 pl-10 pr-4 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#173b32]">Peran Akun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('wisatawan')}
                    className={`flex min-h-16 items-center gap-2 rounded-xl border p-3 text-left text-xs leading-snug font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#9aae85] ${
                      regRole === 'wisatawan'
                        ? 'border-[#173b32] bg-[#e7efdf] font-semibold text-[#173b32] shadow-sm'
                        : 'border-[#c6d2c2] bg-white text-[#52635d] hover:border-[#9aae85]'
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0 text-[#80512f]" />
                    <span>Wisatawan / Pengunjung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('pengelola')}
                    className={`flex min-h-16 items-center gap-2 rounded-xl border p-3 text-left text-xs leading-snug font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#9aae85] ${
                      regRole === 'pengelola'
                        ? 'border-[#173b32] bg-[#e7efdf] font-semibold text-[#173b32] shadow-sm'
                        : 'border-[#c6d2c2] bg-white text-[#52635d] hover:border-[#9aae85]'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4 shrink-0 text-[#80512f]" />
                    <span>Pengelola / Tenant Admin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#173b32]">Kata Sandi *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#80512f]" />
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] py-2.5 pl-10 pr-10 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#80512f] transition-colors hover:text-[#173b32]"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#173b32] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#28594e] focus:outline-none focus:ring-2 focus:ring-[#9aae85] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#7b9680]"
              >
                {loading ? 'Membuat Akun...' : 'Buat Akun Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

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

  const handleDemoLogin = (role) => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const demoUser =
        role === 'admin'
          ? {
              id: 'adm-101',
              name: 'Admin Passify',
              email: 'admin@passify.id',
              role: 'pengelola',
              phone: '081122334455',
              avatar: 'A'
            }
          : {
              id: 'usr-202',
              name: 'Deryl Fabiensyah',
              email: 'deryl@passify.id',
              role: 'wisatawan',
              phone: '081234567890',
              avatar: 'D'
            };

      localStorage.setItem('passify_user', JSON.stringify(demoUser));
      localStorage.setItem('passify_token', 'demo-jwt-token-99281');
      setLoading(false);
      onAuthSuccess(demoUser);
    }, 400);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) {
      setError('Silakan masukkan email dan kata sandi Anda.');
      return;
    }

    setLoading(true);
    // Simulate auth check / backend fallback
    setTimeout(() => {
      const isManager = loginEmail.includes('admin') || loginEmail.includes('pengelola');
      const userObj = {
        id: `usr-${Date.now()}`,
        name: isManager ? 'Pengelola Destinasi' : loginEmail.split('@')[0],
        email: loginEmail,
        role: isManager ? 'pengelola' : 'wisatawan',
        phone: '081234567890',
        avatar: loginEmail.charAt(0).toUpperCase()
      };

      localStorage.setItem('passify_user', JSON.stringify(userObj));
      localStorage.setItem('passify_token', `jwt-token-${Date.now()}`);
      setLoading(false);
      onAuthSuccess(userObj);
    }, 500);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPassword) {
      setError('Lengkapi semua bidang wajib (*).');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: regName,
        email: regEmail,
        phone: regPhone || '081234567890',
        role: regRole,
        avatar: regName.charAt(0).toUpperCase()
      };

      localStorage.setItem('passify_user', JSON.stringify(newUser));
      localStorage.setItem('passify_token', `jwt-token-${Date.now()}`);
      setLoading(false);
      onAuthSuccess(newUser);
    }, 500);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header & Tabs */}
        <div className="p-6 pb-4 border-b border-zinc-800/80 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                P
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-['Outfit']">
                  {mode === 'login' ? 'Masuk ke Passify' : 'Daftar Akun Baru'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {mode === 'login'
                    ? 'Akses tiket, dompet digital, dan manajemen gerbang'
                    : 'Buat akun dalam hitungan detik'}
                </p>
              </div>
            </div>
            <button
              id="close-auth-modal"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab buttons */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Masuk Akun
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Akses</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">Kata Sandi</label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-emerald-400 hover:underline">
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm font-semibold rounded-xl"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Access Section */}
              <div className="pt-4 border-t border-zinc-800/80">
                <div className="text-[11px] text-zinc-500 text-center mb-2.5 font-medium flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cepat Uji Coba Tanpa Mengetik (Demo Akses)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('wisatawan')}
                    className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all text-center flex flex-col items-center gap-0.5"
                  >
                    <span className="font-semibold text-zinc-100">Wisatawan</span>
                    <span className="text-[10px] text-zinc-500">Deryl Fabiensyah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-all text-center flex flex-col items-center gap-0.5"
                  >
                    <span className="font-semibold text-emerald-400">Pengelola</span>
                    <span className="text-[10px] text-zinc-500">Admin Destinasi</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Nama Lengkap *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    placeholder="081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Peran Akun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('wisatawan')}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 ${
                      regRole === 'wisatawan'
                        ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>Wisatawan / Pengunjung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('pengelola')}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 ${
                      regRole === 'pengelola'
                        ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Pengelola Destinasi</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Kata Sandi *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm font-semibold rounded-xl"
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

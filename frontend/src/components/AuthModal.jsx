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
              name: 'Admin Venue Passify',
              email: 'admin@passify-cloud.id',
              role: 'pengelola',
              phone: '081122334455',
              avatar: 'A'
            }
          : {
              id: 'usr-202',
              name: 'Deryl Fabiensyah',
              email: 'deryl@passify-cloud.id',
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
      <div className="modal-content card relative p-0 max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Header Tabs */}
        <div className="bg-gray-50 p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">
              Portal Akses Passify Cloud
            </h2>
            <p className="text-xs text-gray-500">
              {mode === 'login' ? 'Masuk ke akun Anda' : 'Daftarkan akun tenant / pengunjung'}
            </p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Masuk
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-gray-900 shadow-xs border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Daftar Baru
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Akses</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">Kata Sandi</label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-emerald-600 hover:underline font-medium">
                    Lupa sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm font-semibold rounded-xl shadow-sm"
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>


            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    placeholder="Nama lengkap Anda"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp / HP</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-phone-input"
                    type="tel"
                    placeholder="081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Peran Akun *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('wisatawan')}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 ${
                      regRole === 'wisatawan'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <User className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>Wisatawan / Pengunjung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('pengelola')}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left flex items-center gap-2 ${
                      regRole === 'pengelola'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold shadow-2xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>Pengelola / Tenant Admin</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kata Sandi *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3 text-sm font-semibold rounded-xl shadow-sm"
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

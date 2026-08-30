import React, { useState, useEffect } from 'react';
import {
  Mountain,
  ArrowRight,
  Shield,
  LogIn,
  LogOut,
  PhoneCall,
  Sparkles,
  Menu,
  X,
  Layers,
  Cpu,
  Coins,
  FileCheck,
  MessageSquareQuote,
  Compass,
  Building2,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close drawer on Escape key and prevent body background scrolling when open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Fitur', target: 'features-section', icon: Layers },
    { label: 'Teknologi Offline', target: 'offline-infrastructure', icon: Cpu },
    { label: 'Hardware', target: 'hardware-integration', icon: Smartphone },
    { label: 'Harga Bagi Hasil', target: 'pricing-section', icon: Coins },
    { label: 'Legalitas B2G', target: 'security-legal', icon: FileCheck },
    { label: 'Testimoni', target: 'testimonials-section', icon: MessageSquareQuote },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-3.5 bg-white/85 backdrop-blur-lg border-b border-gray-200/80 shadow-2xs transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand - B2B/B2G Enterprise SaaS Logo */}
        <Link to="/" className="flex items-center gap-3 decoration-none group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
            <Mountain className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-gray-900 font-['Outfit'] tracking-tight">Passify</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 tracking-wider uppercase border border-emerald-200">
                SaaS B2B
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium -mt-0.5">
              E-Ticketing & Manajemen Wisata Alam
            </span>
          </div>
        </Link>

        {/* Menu Navigasi B2B SaaS Murni (Tanpa Search/Wallet/E-Ticket B2C) */}
        <nav className="hidden lg:flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-full border border-gray-200/70">
          {[
            { label: 'Fitur', target: 'features-section' },
            { label: 'Teknologi Offline', target: 'offline-infrastructure' },
            { label: 'Hardware', target: 'hardware-integration' },
            { label: 'Harga Bagi Hasil', target: 'pricing-section' },
            { label: 'Legalitas B2G', target: 'security-legal' },
            { label: 'Testimoni', target: 'testimonials-section' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleScrollTo(item.target)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-white transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action CTAs: Desktop */}
        <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
          <button
            id="nav-tourist-demo-btn"
            onClick={() => handleScrollTo('tourist-demo-banner')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Demo Wisatawan</span>
          </button>

          <a
            id="nav-contact-b2g-btn"
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Passify,%20saya%20tertarik%20dengan%20solusi%20SaaS%20e-Ticketing%20Wisata%20Alam"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-semibold shadow-sm hover:shadow transition-all duration-200"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hubungi Tim B2G</span>
          </a>

          {/* Admin / User Console Button */}
          {user && (user.role === 'pengelola' || user.role === 'admin') && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console</span>
            </Link>
          )}

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-900">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                title="Keluar"
                className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="login-btn"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-gray-700" />
              <span>Masuk</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Passify,%20saya%20tertarik%20dengan%20solusi%20SaaS%20e-Ticketing%20Wisata%20Alam"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-semibold shadow-xs"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>Kontak</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Tutup navigasi mobile' : 'Buka navigasi mobile'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu Navigasi Mobile">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 decoration-none"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm">
                  <Mountain className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-gray-900 font-['Outfit']">Passify</span>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">SaaS E-Ticketing</span>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                Solusi Kawasan Wisata
              </div>
              {navItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScrollTo(item.target)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-emerald-50/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-emerald-600" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
                  Portal & Akses Cepat
                </div>
                <Link
                  to="/jelajah"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-teal-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-teal-600" />
                    <span>Jelajah Destinasi Wisata</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
                <Link
                  to="/daftar-wisata"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-emerald-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Registrasi Kawasan Baru</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
                {user && (user.role === 'pengelola' || user.role === 'admin') && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors mt-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-emerald-700" />
                      <span>Console Pengelola</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/70 space-y-2.5">
              <button
                onClick={() => handleScrollTo('tourist-demo-banner')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Lihat Demo Wisatawan</span>
              </button>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Tim%20Passify,%20saya%20tertarik%20dengan%20solusi%20SaaS%20e-Ticketing%20Wisata%20Alam"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold text-xs shadow-md transition-all"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Hubungi Tim B2G (WhatsApp)</span>
              </a>

              {user ? (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-900">
                      {user.avatar || user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[140px]">{user.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-1 text-xs text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-semibold transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-gray-700" />
                  <span>Masuk Akun Pengelola</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

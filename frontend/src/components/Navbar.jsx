import React from 'react';
import { Mountain, ArrowRight, Shield, LogIn, LogOut, PhoneCall, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout
}) {
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            { label: 'Hardware', target: 'hardware-section' },
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

        {/* Action CTAs: Konversi B2B/B2G + Link ke Demo Wisatawan */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            id="nav-tourist-demo-btn"
            onClick={() => handleScrollTo('tourist-demo-banner')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors"
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
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
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
      </div>
    </header>
  );
}

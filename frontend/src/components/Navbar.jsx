import React from 'react';
import { Wallet, Ticket, Search, Mountain, LogIn, LogOut, Shield, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({
  walletBalance,
  onOpenWallet,
  onOpenTicketModal,
  searchQuery,
  setSearchQuery,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-3.5 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand - White-label Configurable */}
        <Link to="/" className="flex items-center gap-2.5 decoration-none group">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center transition-transform group-hover:scale-105">
            <Mountain className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-gray-900 font-['Outfit'] tracking-tight">Passify</span>
            <span className="text-[10px] font-medium text-gray-400 tracking-wide">White-Label</span>
          </div>
        </Link>

        {/* Minimalist Search */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4 relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="nav-search-input"
            type="text"
            placeholder="Cari venue wisata klien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-transparent rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-200 transition-all"
          />
        </div>

        {/* Actions & Auth */}
        <div className="flex items-center gap-2">
          {/* Wallet Button - Sleek Pill */}
          <button
            id="open-wallet-btn"
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100/80 text-xs font-medium text-gray-700 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-gray-900">
              Rp {walletBalance.toLocaleString('id-ID')}
            </span>
          </button>

          {/* Tickets Button - Minimalist */}
          <button
            id="view-tickets-btn"
            onClick={onOpenTicketModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100/80 text-gray-700 text-xs font-medium transition-colors"
          >
            <Ticket className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">E-Ticket</span>
          </button>

          {/* Admin link if user is manager */}
          {user && (user.role === 'pengelola' || user.role === 'admin') && (
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Portal Pengelola</span>
            </Link>
          )}

          {/* User Profile Badge / Login CTA */}
          {user ? (
            <div className="flex items-center gap-2 pl-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block">
                  <div className="text-xs font-medium text-gray-900 leading-none">{user.name}</div>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={onLogout}
                title="Keluar Sesi"
                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="login-btn"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-emerald-600 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

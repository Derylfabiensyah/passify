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
    <header className="nav-bar fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 decoration-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white font-['Outfit']">Passify</span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="nav-search-input"
            type="text"
            placeholder="Cari destinasi wisata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wallet Button */}
          <button
            id="open-wallet-btn"
            onClick={onOpenWallet}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-zinc-800 text-sm text-zinc-300 hover:border-zinc-700 transition-colors bg-zinc-900/60"
          >
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline text-xs font-medium text-emerald-400">
              Rp {walletBalance.toLocaleString('id-ID')}
            </span>
          </button>

          {/* Tickets Button */}
          <button
            id="view-tickets-btn"
            onClick={onOpenTicketModal}
            className="btn-secondary btn-sm"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Tiket Saya</span>
          </button>

          {/* Admin link if user is manager */}
          {user && (user.role === 'pengelola' || user.role === 'admin') && (
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* User Profile Badge / Login CTA */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                  {user.avatar || user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xl:block">
                  <div className="text-xs font-semibold text-zinc-200 leading-none">{user.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{user.role}</div>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={onLogout}
                title="Keluar Sesi"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="open-auth-modal-btn"
              onClick={onOpenAuth}
              className="btn-primary btn-sm ml-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk / Daftar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

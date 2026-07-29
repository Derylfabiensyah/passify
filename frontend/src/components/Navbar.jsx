import React from 'react';
import { Compass, Wallet, Ticket, Search, ShieldCheck, Mountain } from 'lucide-react';

export default function Navbar({ walletBalance, onOpenWallet, onOpenTicketModal, searchQuery, setSearchQuery }) {
  return (
    <header className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
              Passify <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SaaS</span>
            </span>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Platform Tiket & Cashless Wisata Alam</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="nav-search-input"
            type="text"
            placeholder="Cari Bromo, Kawah Ijen, Komodo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-full pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance Widget */}
          <button
            id="open-wallet-btn"
            onClick={onOpenWallet}
            className="glass-panel px-3.5 py-1.5 flex items-center gap-2 text-sm text-slate-200 hover:border-emerald-500/40 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 block -mb-1">Saldo Wallet</span>
              <span className="font-bold text-xs text-emerald-400">
                Rp {walletBalance.toLocaleString('id-ID')}
              </span>
            </div>
          </button>

          {/* Cek Tiket Button */}
          <button
            id="view-tickets-btn"
            onClick={onOpenTicketModal}
            className="btn-secondary btn-sm"
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Tiket Saya</span>
          </button>
        </div>
      </div>
    </header>
  );
}

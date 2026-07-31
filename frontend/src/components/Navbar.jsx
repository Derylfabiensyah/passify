import React from 'react';
import { Wallet, Ticket, Search, Mountain } from 'lucide-react';

export default function Navbar({ walletBalance, onOpenWallet, onOpenTicketModal, searchQuery, setSearchQuery }) {
  return (
    <header className="nav-bar fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white font-['Outfit']">Passify</span>
        </div>

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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            id="open-wallet-btn"
            onClick={onOpenWallet}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 text-sm text-zinc-300 hover:border-zinc-700 transition-colors"
          >
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline text-xs font-medium text-emerald-500">
              Rp {walletBalance.toLocaleString('id-ID')}
            </span>
          </button>

          <button
            id="view-tickets-btn"
            onClick={onOpenTicketModal}
            className="btn-secondary btn-sm"
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">Tiket Saya</span>
          </button>
        </div>
      </div>
    </header>
  );
}

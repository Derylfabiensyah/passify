import React from 'react';
import { ShieldCheck, Zap, Users, Compass, Search } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="relative pt-32 pb-20 px-4 lg:px-8 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="hero-glow"></div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-emerald-400" />
          <span>SaaS Platform e-Tiketing & Carrying Capacity #1 di Indonesia</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Jelajahi Wisata Alam Indonesia <br />
          <span className="text-gradient">Tanpa Antre & Bebas Kerumunan</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto mb-10 leading-relaxed">
          Pesan tiket destinasi wisata alam favorit dengan proteksi <strong className="text-slate-200">Kuota Harian (Carrying Capacity)</strong>, e-Ticket QR <strong>Dynamic TOTP Anti-Pemalsuan</strong>, dan transaksi non-tunai di lokasi wisata.
        </p>

        {/* Hero CTA & Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="btn-primary py-3.5 px-8 text-base font-bold shadow-lg"
          >
            <Compass className="w-5 h-5" />
            Jelajahi Katalog Destinasi
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-panel p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Outfit'] mb-1">50+</div>
            <div className="text-xs text-slate-400">Destinasi Wisata Alam</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-['Outfit'] mb-1">1.2M+</div>
            <div className="text-xs text-slate-400">Tiket Terverifikasi</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-['Outfit'] mb-1">&lt; 0.5 detik</div>
            <div className="text-xs text-slate-400">Kecepatan Validasi Gate</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-['Outfit'] mb-1">100%</div>
            <div className="text-xs text-slate-400">Offline-First Gate Ready</div>
          </div>
        </div>
      </div>
    </section>
  );
}

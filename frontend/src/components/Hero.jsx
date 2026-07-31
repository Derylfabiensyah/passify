import React from 'react';
import { Compass } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="relative pt-28 pb-16 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-emerald-500 text-xs font-medium tracking-widest uppercase mb-4">
          Platform E-Tiketing Wisata Alam
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight font-['Outfit'] text-zinc-100">
          Jelajahi Wisata Alam Indonesia{' '}
          <span className="text-emerald-500">Tanpa Antre</span>
        </h1>

        <p className="text-zinc-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Pesan tiket dengan proteksi kuota harian, e-Ticket QR anti-pemalsuan, dan transaksi cashless di lokasi wisata.
        </p>

        <div className="flex justify-center mb-14">
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="btn-primary text-sm sm:text-base"
          >
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            Jelajahi Destinasi
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '50+', label: 'Destinasi' },
            { value: '1.2M+', label: 'Tiket Terverifikasi' },
            { value: '< 0.5s', label: 'Validasi Gate' },
            { value: '100%', label: 'Offline-Ready' },
          ].map((m, i) => (
            <div key={i} className="card p-4 text-center bg-zinc-900/60 border-zinc-800">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-100 font-['Outfit'] mb-0.5">{m.value}</div>
              <div className="text-xs text-zinc-500">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

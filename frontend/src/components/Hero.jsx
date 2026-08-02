import React from 'react';
import { Compass, ArrowUpRight } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="relative pt-24 pb-20 px-4 lg:px-8 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200/80 text-gray-700 text-xs font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Passify Cloud Engine • White-Label SaaS E-Ticketing</span>
        </div>

        {/* Clean, High-Contrast Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.12] font-['Outfit'] text-gray-900">
          Kelola & Pesan Tiket Wisata Alam{' '}
          <span className="text-emerald-600 font-normal">Terintegrasi Cloud.</span>
        </h1>

        {/* Refined Minimalist Subtitle */}
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
          Platform White-Label untuk pengelola taman nasional dan kawasan konservasi. Dilengkapi proteksi kuota harian, validasi QR offline, serta ekosistem cashless tenant.
        </p>

        {/* Minimalist CTA Button */}
        <div className="flex justify-center mb-16">
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gray-900 text-white font-medium text-sm hover:bg-emerald-600 transition-colors duration-200 shadow-2xs"
          >
            <span>Jelajahi Venue Destinasi</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Ultra-Minimalist Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-gray-100">
          {[
            { value: 'Multi-Tenant', label: 'White-Label Config' },
            { value: '1.2M+', label: 'Tiket Terverifikasi' },
            { value: '< 0.5s', label: 'Validasi Gate Offline' },
            { value: '99.9%', label: 'Cloud Uptime SLA' },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 font-['Outfit'] tracking-tight">
                {m.value}
              </div>
              <div className="text-xs text-gray-400 font-medium mt-1">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

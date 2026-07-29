import React, { useState } from 'react';
import { Star, MapPin, Users, ArrowRight, ShieldCheck, Ticket, CheckCircle } from 'lucide-react';

export default function Catalog({ destinations, searchQuery, onSelectDestination }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Destinasi' },
    { id: 'gunung', label: '🌋 Gunung & Kawah' },
    { id: 'air_terjun', label: '🌊 Air Terjun' },
    { id: 'taman_nasional', label: '🌲 Taman Nasional' },
    { id: 'danau', label: '🏝️ Danau & Pantai' },
  ];

  const filteredDestinations = destinations.filter((dest) => {
    const matchesCategory = selectedCategory === 'all' || dest.type === selectedCategory;
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.province.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalog-section" className="py-12 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-emerald-400 font-semibold text-sm tracking-wide uppercase mb-1">
            Katalog Destinasi Wisata
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Pilih Destinasi Alam Favorit Anda
          </h2>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="glass-panel p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">Destinasi Tidak Ditemukan</h3>
          <p className="text-sm text-slate-400">Coba gunakan kata kunci pencarian atau kategori yang berbeda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const remainingQuota = dest.max_daily_capacity - dest.booked_today;
            const quotaPercentage = Math.round((dest.booked_today / dest.max_daily_capacity) * 100);

            return (
              <div
                key={dest.id}
                id={`card-${dest.id}`}
                className="glass-panel overflow-hidden flex flex-col group hover:border-emerald-500/50 transition-all duration-300"
              >
                {/* Image & Badges Header */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={dest.cover_image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* Quota Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-emerald">
                      <span className="pulse-dot" />
                      Sisa Kuota Hari Ini: {remainingQuota}
                    </span>
                  </div>

                  {/* Type Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-slate-200 border border-slate-700/60">
                      {dest.typeLabel}
                    </span>
                  </div>

                  {/* Rating & Location overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
                    <div className="flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{dest.location}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-md text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{dest.rating}</span>
                      <span className="text-slate-400 font-normal">({dest.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Facilities Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {dest.facilities.slice(0, 3).map((fac, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                        >
                          ✓ {fac}
                        </span>
                      ))}
                      {dest.facilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          +{dest.facilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block -mb-0.5">Harga Mulai Dari</span>
                      <span className="text-lg font-extrabold text-emerald-400 font-['Outfit']">
                        Rp {dest.starting_price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      id={`book-btn-${dest.id}`}
                      onClick={() => onSelectDestination(dest)}
                      className="btn-primary btn-sm"
                    >
                      <span>Pesan Tiket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

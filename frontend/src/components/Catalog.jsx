import React, { useState } from 'react';
import { Star, MapPin, ArrowRight } from 'lucide-react';

export default function Catalog({ destinations, searchQuery, onSelectDestination }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Destinasi' },
    { id: 'gunung', label: 'Gunung & Kawah' },
    { id: 'air_terjun', label: 'Air Terjun' },
    { id: 'taman_nasional', label: 'Taman Nasional' },
    { id: 'danau', label: 'Danau & Pantai' },
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
    <section id="catalog-section" className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="text-emerald-500 font-semibold text-xs tracking-widest uppercase mb-2">
            Katalog Destinasi Wisata
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100 font-['Outfit']">
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
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400 text-lg">
            !
          </div>
          <h3 className="text-lg font-bold text-zinc-200 mb-1">Destinasi Tidak Ditemukan</h3>
          <p className="text-sm text-zinc-400">Coba gunakan kata kunci pencarian atau kategori yang berbeda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const remainingQuota = dest.max_daily_capacity - dest.booked_today;

            return (
              <div
                key={dest.id}
                id={`card-${dest.id}`}
                className="card overflow-hidden flex flex-col group transition-all"
              >
                {/* Image & Header Tags */}
                <div className="relative h-48 overflow-hidden bg-zinc-900">
                  <img
                    src={dest.cover_image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />

                  {/* Quota Indicator */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 text-[11px] font-medium text-emerald-400 border border-zinc-700/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sisa Kuota Hari Ini: {remainingQuota}
                    </span>
                  </div>

                  {/* Type Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-[11px] font-medium text-zinc-300 border border-zinc-700/60">
                      {dest.typeLabel}
                    </span>
                  </div>

                  {/* Rating & Location overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-200">
                    <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-800">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{dest.location}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-900/90 px-2.5 py-1 rounded-md text-amber-400 font-bold border border-zinc-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{dest.rating}</span>
                      <span className="text-zinc-400 font-normal">({dest.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-emerald-500 transition-colors">
                      {dest.name}
                    </h3>

                    <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Facilities Chips */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {dest.facilities.slice(0, 3).map((fac, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                        >
                          ✓ {fac}
                        </span>
                      ))}
                      {dest.facilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                          +{dest.facilities.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 block -mb-0.5">Harga Mulai Dari</span>
                      <span className="text-base font-extrabold text-emerald-500 font-['Outfit']">
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

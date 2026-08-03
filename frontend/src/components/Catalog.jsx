import React, { useState } from 'react';
import { Star, MapPin, ArrowUpRight, Layers, Sparkles, ShieldCheck, Ticket } from 'lucide-react';

export default function Catalog({ destinations, searchQuery, onSelectDestination }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'gunung', label: 'Gunung & Kawah' },
    { id: 'air_terjun', label: 'Air Terjun & Ekowisata' },
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
    <section id="catalog-section" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* EXECUTIVE TRANSITION BANNER — CLEAR INTERFACE LOGIC SEPARATION (B2B vs B2C DEMO ZONE) */}
      <div className="mb-16 p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-emerald-950 to-gray-900 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ZONA SIMULASI WISATAWAN (LIVE DEMO PORTAL)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
              Uji Coba Pengalaman Beli Tiket Wisatawan Anda
            </h3>
            <p className="text-gray-200 text-xs sm:text-sm max-w-3xl font-medium leading-relaxed">
              Berikut adalah tampilan portal e-Ticket, indikator sisa kuota alam secara real-time, dan checkout tanpa tunai yang akan diakses oleh wisatawan/turis di kawasan wisata Anda. Silakan coba klik untuk menguji kemudahan proses transaksi.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-gray-950 font-bold text-xs font-mono shadow-md">
              <Ticket className="w-4 h-4" />
              <span>SIMULATOR AKTIF</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-emerald-800 font-bold text-xs tracking-wider uppercase mb-2">
            Katalog Venue • Passify White-Label
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Outfit'] tracking-tight">
            Destinasi & Kawasan Konservasi Klien
          </h2>
        </div>

        {/* Minimalist Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:text-gray-900 hover:bg-gray-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="p-16 text-center max-w-md mx-auto my-8 bg-gray-50/50 rounded-3xl shadow-md">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-700">
            <Layers className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Venue Tidak Ditemukan</h3>
          <p className="text-xs text-gray-800 font-medium">Coba gunakan kata kunci pencarian atau kategori venue yang berbeda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((dest) => {
            const remainingQuota = dest.max_daily_capacity - dest.booked_today;
            const quotaPct = Math.round((dest.booked_today / dest.max_daily_capacity) * 100);

            return (
              <div
                key={dest.id}
                id={`card-${dest.id}`}
                onClick={() => onSelectDestination(dest)}
                className="group cursor-pointer flex flex-col bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Image & Sleek Tags */}
                <div className="relative h-52 overflow-hidden bg-gray-100">
                  <img
                    src={dest.cover_image_url}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Subtle Type Label Top Right */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-gray-900 shadow-xs">
                      {dest.typeLabel}
                    </span>
                  </div>

                  {/* Rating Badge Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-gray-900 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{dest.rating}</span>
                    </span>
                  </div>
                </div>

                {/* Minimalist Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="truncate">{dest.location}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 font-['Outfit'] mb-2 group-hover:text-emerald-700 transition-colors">
                      {dest.name}
                    </h3>

                    {/* High-Contrast Description Text (#1f2937 / text-gray-800 font-medium) */}
                    <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-relaxed mb-6">
                      {dest.description}
                    </p>
                  </div>

                  {/* Quota & Pricing Row */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-700 font-semibold">Kuota Terisi</span>
                      <span className="font-bold text-gray-900">
                        Sisa <strong className="text-emerald-700 font-extrabold">{remainingQuota}</strong> pax
                      </span>
                    </div>

                    {/* Subtle Quota Bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                        style={{ width: `${quotaPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-700 font-semibold block uppercase">Tiket Mulai</span>
                        <span className="text-base font-extrabold text-gray-900 font-['Outfit']">
                          Rp {(dest.starting_price || dest.price_per_ticket || 0).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                        <span>Pilih Tiket</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
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

import React, { useState } from 'react';
import { ArrowUpRight, Layers, MapPin, Star } from 'lucide-react';

export default function Catalog({ destinations, searchQuery, onSelectDestination }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { id: 'all', label: 'Semua tempat' },
    { id: 'gunung', label: 'Gunung & kawah' },
    { id: 'hutan', label: 'Hutan & air terjun' },
    { id: 'taman_nasional', label: 'Taman nasional' },
    { id: 'danau', label: 'Danau & pantai' },
  ];

  const query = searchQuery.toLowerCase().trim();
  const filteredDestinations = destinations.filter((destination) => {
    const matchesCategory = selectedCategory === 'all' || destination.type === selectedCategory;
    const matchesSearch = !query || [destination.name, destination.location, destination.province]
      .some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalog-section" className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-500">
          {filteredDestinations.length} tujuan tersedia untuk dijelajahi
        </p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                id={`cat-filter-${category.id}`}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-emerald-900 text-white'
                    : 'border border-stone-200 bg-white text-slate-600 hover:border-emerald-700 hover:text-emerald-900'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredDestinations.length === 0 ? (
        <div className="border-b border-stone-200 py-16 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-stone-100 text-emerald-900"><Layers className="h-4 w-4" /></span>
          <h3 className="mt-4 text-base font-bold text-slate-900">Tujuan belum ditemukan</h3>
          <p className="mt-1 text-sm text-slate-500">Coba kata kunci atau kategori yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pt-7 md:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => {
            const remainingQuota = destination.max_daily_capacity - destination.booked_today;
            const quotaPercentage = Math.round((destination.booked_today / destination.max_daily_capacity) * 100);

            return (
              <article key={destination.id} className="group overflow-hidden rounded-[1.25rem] bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-900/5">
                <button
                  id={`card-${destination.id}`}
                  type="button"
                  onClick={() => onSelectDestination(destination)}
                  className="block w-full text-left"
                >
                  <div className="relative h-52 overflow-hidden bg-stone-100">
                    <img src={destination.cover_image_url} alt={destination.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] font-semibold text-white">
                      <span className="rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-sm">{destination.typeLabel}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-sm"><Star className="h-3 w-3 fill-amber-300 text-amber-300" />{destination.rating}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><MapPin className="h-3.5 w-3.5 text-emerald-700" />{destination.province}</div>
                    <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-[-0.035em] text-slate-900 group-hover:text-emerald-800">{destination.name}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{destination.description}</p>

                    <div className="mt-5 border-t border-stone-100 pt-4">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500"><span>Sisa kunjungan hari ini</span><span className="font-bold text-emerald-800">{remainingQuota} orang</span></div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-100"><span className="block h-full bg-[#9aae85]" style={{ width: `${quotaPercentage}%` }} /></div>
                      <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Mulai dari</p><p className="mt-0.5 text-base font-extrabold tracking-tight text-slate-900">Rp {(destination.starting_price || destination.price_per_ticket || 0).toLocaleString('id-ID')}</p></div><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">Pilih tiket <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span></div>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

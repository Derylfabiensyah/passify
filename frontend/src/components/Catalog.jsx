import React, { useState } from 'react';
import { ArrowUpRight, Layers, MapPin, Star } from 'lucide-react';

export default function Catalog({ destinations = [], searchQuery = '' }) {
  const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || 'passify.com';
  const [selectedCategory, setSelectedCategory] = useState('all');
  const categories = [
    { id: 'all', label: 'Semua tempat' },
    { id: 'gunung', label: 'Gunung & kawah' },
    { id: 'hutan', label: 'Hutan & air terjun' },
    { id: 'taman_nasional', label: 'Taman nasional' },
    { id: 'danau', label: 'Danau & pantai' },
  ];

  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  const query = (searchQuery || '').toLowerCase().trim();

  const filteredDestinations = safeDestinations.filter((destination) => {
    if (!destination) return false;
    const matchesCategory = selectedCategory === 'all' || destination.type === selectedCategory;
    const matchesSearch =
      !query ||
      [destination.name, destination.location, destination.province, destination.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1');

  return (
    <section id="catalog-section" className="mx-auto max-w-[1240px] px-4 pb-16 pt-6 sm:px-6 sm:pb-20 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[var(--ink-soft)]">
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
                className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-[var(--forest)] text-white'
                    : 'border border-[var(--border)] bg-white text-[var(--ink-soft)] hover:border-[var(--forest-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest)]'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredDestinations.length === 0 ? (
        <div className="border-b border-[var(--border)] py-14 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[var(--leaf-pale)] text-[var(--forest)]">
            <Layers className="h-4 w-4" />
          </span>
          <h3 className="mt-4 text-base font-bold text-[var(--forest-deep)]">Tujuan belum ditemukan</h3>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Coba kata kunci atau kategori yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 pt-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDestinations.map((destination) => {
            const maxCap = Number(destination.max_daily_capacity) || 1000;
            const booked = Number(destination.booked_today) || 0;
            const remainingQuota = Math.max(0, maxCap - booked);
            const quotaPercentage = Math.min(100, Math.round((booked / maxCap) * 100));

            // In local development, route to query param `/?tenant=<slug>` so developers can test immediately
            const tenantUrl = isLocal
              ? `/?tenant=${destination.slug}`
              : `https://${destination.slug}.${ROOT_DOMAIN}`;

            const startingPrice =
              Number(destination.starting_price) ||
              Number(destination.price_per_ticket) ||
              (destination.ticket_categories?.[0]?.price) ||
              0;

            return (
              <article
                key={destination.id || destination.slug}
                className="group overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--forest-soft)] hover:shadow-[0_14px_28px_rgba(16,45,32,.08)]"
              >
                <a
                  id={`card-${destination.id || destination.slug}`}
                  href={tenantUrl}
                  className="block w-full text-left no-underline"
                >
                  <div className="relative h-48 overflow-hidden bg-[var(--leaf-pale)]">
                    {destination.cover_image_url ? (
                      <img
                        src={destination.cover_image_url}
                        alt={destination.name || 'Destinasi'}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[var(--leaf-pale)] text-[var(--forest)] font-bold text-sm">
                        {destination.name}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,45,32,.65)] via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[11px] font-bold">
                      <span className="rounded-full bg-white/90 px-2.5 py-1.5 text-[var(--forest)] backdrop-blur-sm">
                        {destination.typeLabel || destination.type || 'Wisata Alam'}
                      </span>
                      {destination.rating && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bark-pale)] px-2.5 py-1.5 text-[var(--bark)] backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-current" />
                          {destination.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)]">
                      <MapPin className="h-3.5 w-3.5 text-[var(--forest-soft)]" />
                      {destination.province || destination.location || 'Indonesia'}
                    </div>
                    <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-[-0.035em] text-[var(--forest-deep)] group-hover:text-[var(--forest)]">
                      {destination.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--ink-soft)]">
                      {destination.description}
                    </p>

                    <div className="mt-5 border-t border-[var(--border)] pt-4">
                      <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ink-soft)]">
                        <span>Sisa kunjungan hari ini</span>
                        <span className="font-bold text-[var(--forest)]">{remainingQuota.toLocaleString('id-ID')} orang</span>
                      </div>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--leaf-pale)]">
                        <span className="block h-full bg-[var(--leaf)]" style={{ width: `${quotaPercentage}%` }} />
                      </div>
                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                            Mulai dari
                          </p>
                          <p className="mt-0.5 text-base font-extrabold tracking-tight text-[var(--forest-deep)]">
                            Rp {startingPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--bark)]">
                          Kunjungi Web Wisata{' '}
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

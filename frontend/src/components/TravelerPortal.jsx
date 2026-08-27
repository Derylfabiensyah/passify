import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import AuthModal from './AuthModal';
import Catalog from './Catalog';
import { DESTINATIONS } from '../data/destinations';

export default function TravelerPortal() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('passify_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const safeDestinations = Array.isArray(DESTINATIONS) ? DESTINATIONS : [];
  const featuredDestination = safeDestinations[0] || null;

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    scrollToCatalog();
  };

  return (
    <div className="min-h-screen bg-[var(--canvas,#f8fbf5)] text-[var(--text-primary,#193024)] selection:bg-[var(--leaf,#9cbd72)] selection:text-[var(--forest-deep,#102d20)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border,#d6e2cf)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group inline-flex items-center gap-2.5 no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--forest,#1e4b35)] text-white transition-transform duration-200 group-hover:scale-105">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-lg font-bold tracking-[-0.035em] text-[var(--forest-deep,#102d20)]">
                Jelajah Rimba
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft,#586d5d)]">
                tiket wisata alam
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-[var(--bark-pale,#f2e5da)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--bark,#8a5638)] sm:inline-flex">
              Portofolio Tenant
            </span>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold text-[var(--ink-soft,#586d5d)] sm:inline">
                  Halo, {user.name?.split(' ')[0] || 'Wisatawan'}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--leaf-pale,#e8f1dc)] text-xs font-bold text-[var(--forest-deep,#102d20)]">
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'W'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar"
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-soft,#586d5d)] transition-colors hover:bg-[var(--bark-pale,#f2e5da)] hover:text-[var(--bark,#8a5638)]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border,#d6e2cf)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--forest,#1e4b35)] transition-colors hover:border-[var(--forest-soft,#3c7152)] hover:bg-[var(--leaf-pale,#e8f1dc)]"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[1.5rem] bg-[var(--forest-deep,#102d20)]">
            {featuredDestination?.cover_image_url && (
              <img
                src={featuredDestination.cover_image_url}
                alt={featuredDestination.name || ''}
                className="absolute inset-0 h-full w-full object-cover opacity-40 saturate-[.7]"
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,45,32,.92),rgba(16,45,32,.66))]" />

            <div className="relative grid min-h-[410px] items-end gap-7 px-6 py-7 sm:min-h-[450px] sm:px-9 sm:py-9 lg:grid-cols-[1fr_330px] lg:items-center lg:gap-12 lg:px-12 lg:py-12">
              <div className="max-w-2xl">
                <p className="mb-3 text-[12px] font-semibold text-[var(--leaf,#9cbd72)]">{todayLabel}</p>
                <h1 className="max-w-xl font-serif text-4xl font-semibold leading-[1] tracking-[-0.05em] text-white sm:text-5xl">
                  Galeri Destinasi Wisata
                </h1>
                <p className="mt-5 max-w-lg text-[14px] leading-6 text-white/80 sm:text-[15px] sm:leading-7">
                  Jelajahi berbagai destinasi wisata alam yang telah didukung oleh sistem e-ticketing white-label, kuota real-time, dan ekosistem non-tunai Passify.
                </p>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="rounded-[1.25rem] bg-white p-4 text-[var(--text-primary,#193024)] shadow-[0_16px_40px_rgba(16,45,32,.25)] sm:p-5"
              >
                <div className="mb-4 flex items-center gap-2 text-xs font-extrabold text-[var(--forest,#1e4b35)]">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Cari Destinasi Wisata
                </div>
                <label htmlFor="traveler-search" className="sr-only">
                  Cari destinasi
                </label>
                <div className="flex items-center rounded-xl border border-[var(--border,#d6e2cf)] bg-[var(--bg-input,#f6f9f2)] px-3 focus-within:border-[var(--forest-soft,#3c7152)] focus-within:bg-white">
                  <Search className="h-4 w-4 flex-none text-[var(--ink-soft,#586d5d)]" aria-hidden="true" />
                  <input
                    id="traveler-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Gunung, kawah, danau, provinsi..."
                    className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm text-[var(--text-primary,#193024)] outline-none placeholder:text-[var(--text-muted,#809080)]"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--bark,#8a5638)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--forest,#1e4b35)]"
                >
                  Cari Destinasi <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--ink-soft,#586d5d)]">
                  Pilih destinasi untuk langsung membuka portal tiket resmi masing-masing pengelola.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border,#d6e2cf)] bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1240px] gap-5 sm:grid-cols-3 sm:gap-7">
            {[
              [CalendarDays, 'Pilih waktu & kuota', 'Pantau sisa kuota harian daya dukung alam secara real-time.'],
              [Ticket, 'E-Ticket QR Dinamis (TOTP)', 'Kode QR terus diperbarui otomatis setiap 30 detik untuk keamanan.'],
              [Leaf, 'Ekosistem Cashless & NFC', 'Belanja di merchant & posko wisata cukup dengan tap gelang pintar.'],
            ].map(([Icon, title, detail]) => (
              <div className="flex gap-3" key={title}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--leaf-pale,#e8f1dc)] text-[var(--forest,#1e4b35)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[15px] font-bold text-[var(--forest-deep,#102d20)]">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-soft,#586d5d)]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--border,#d6e2cf)] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--bark,#8a5638)]">
                Katalog Wisata Alam
              </p>
              <h2 className="max-w-xl font-serif text-3xl font-semibold leading-[1.03] tracking-[-0.04em] text-[var(--forest-deep,#102d20)] sm:text-4xl">
                Destinasi resmi dengan sistem e-Ticketing terintegrasi.
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bark-pale,#f2e5da)] px-3 py-2 text-xs font-semibold text-[var(--bark,#8a5638)]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              White-Label Certified
            </div>
          </div>
        </section>

        <Catalog destinations={safeDestinations} searchQuery={searchQuery} />
      </main>

      <footer className="border-t border-[var(--border,#d6e2cf)] bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-[var(--ink-soft,#586d5d)] sm:flex-row sm:items-center sm:justify-between">
          <span>Jelajah Rimba · Showcase Portofolio SaaS Passify</span>
          <span>© {new Date().getFullYear()} Passify Ticketing Ecosystem. Hak cipta dilindungi.</span>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}

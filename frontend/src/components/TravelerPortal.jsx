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
  UserRound,
} from 'lucide-react';
import Catalog from './Catalog';
import BookingModal from './BookingModal';
import ETicketModal from './ETicketModal';
import AuthModal from './AuthModal';
import { DESTINATIONS } from '../data/destinations';

/**
 * A consumer-facing demo surface for a tourism tenant.  It intentionally keeps
 * the SaaS controls out of sight and lets the existing booking flow do the work.
 */
export default function TravelerPortal() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('passify_user');

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [pendingDestination, setPendingDestination] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const featuredDestination = DESTINATIONS[0];
  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const openAuthModal = () => {
    setPendingDestination(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setPendingDestination(null);
    setIsAuthModalOpen(false);
  };

  const handleDestinationSelect = (destination) => {
    if (!user) {
      setPendingDestination(destination);
      setIsAuthModalOpen(true);
      return;
    }

    setSelectedDestination(destination);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);

    if (pendingDestination) {
      setSelectedDestination(pendingDestination);
      setPendingDestination(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
  };

  const handleBookingSuccess = (order) => {
    setActiveOrder(order);
    setSelectedDestination(null);
    setIsTicketModalOpen(true);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    scrollToCatalog();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-stone-50/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group inline-flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-lg font-bold tracking-[-0.035em] text-slate-900">
                Jelajah Rimba
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-slate-500">
                tiket wisata alam
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-800 sm:inline-flex">
              Data demo
            </span>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-medium text-slate-600 sm:inline">
                  Halo, {user.name?.split(' ')[0] || 'Wisatawan'}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-xs font-bold text-emerald-900">
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'W'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:border-emerald-700 hover:text-emerald-800"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-8 pt-5 sm:px-6 sm:pt-7 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-950 shadow-xl shadow-emerald-950/10">
            {featuredDestination && (
              <img
                src={featuredDestination.cover_image_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
            )}
            <div className="absolute inset-0 bg-emerald-950/45" />

            <div className="relative grid min-h-[450px] items-end gap-8 px-6 py-8 sm:min-h-[490px] sm:px-10 sm:py-10 lg:grid-cols-[1fr_360px] lg:px-14 lg:py-14">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Portal wisatawan · mode simulasi
                </div>
                <p className="mb-3 text-sm font-medium text-emerald-100">{todayLabel}</p>
                <h1 className="max-w-xl font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                  Luangkan waktu untuk kembali ke alam.
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-emerald-50/90 sm:text-base">
                  Pesan tiket kunjungan dengan ritme yang sederhana—pilih tempat, tentukan sesi, lalu simpan e-ticket Anda sebelum berangkat.
                </p>
              </div>

              <form
                onSubmit={handleSearchSubmit}
                className="rounded-3xl border border-white/25 bg-white p-4 text-slate-900 shadow-2xl shadow-emerald-950/25 sm:p-5"
              >
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-emerald-900">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Mulai dari tujuan Anda
                </div>
                <label htmlFor="traveler-search" className="sr-only">
                  Cari destinasi
                </label>
                <div className="flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-3 focus-within:border-emerald-700 focus-within:bg-white">
                  <Search className="h-4 w-4 flex-none text-slate-400" aria-hidden="true" />
                  <input
                    id="traveler-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Gunung, danau, provinsi..."
                    className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
                >
                  Cari tiket
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
                  Harga, ketersediaan, dan pembayaran di halaman ini hanya untuk demonstrasi produk.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-3 sm:gap-8">
            <div className="flex gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-stone-100 text-emerald-800">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Pilih waktu yang pas</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">Lihat pilihan sesi dan kuota sebelum mengunci rencana.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-stone-100 text-emerald-800">
                <Ticket className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Satu tiket, lebih ringan</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">E-ticket tersimpan setelah pemesanan selesai.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-stone-100 text-emerald-800">
                <Leaf className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Berjalan dengan sadar</h2>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">Kuota membantu menjaga pengalaman dan ruang alam tetap nyaman.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-16 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-7 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Pilih tujuan</p>
              <h2 className="max-w-xl font-serif text-3xl font-semibold leading-[1.04] tracking-[-0.04em] text-slate-900 sm:text-4xl">
                Tempat yang membuat perjalanan terasa lebih panjang.
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700" aria-hidden="true" />
              Inventori bersifat demo
            </div>
          </div>
        </section>

        <Catalog
          destinations={DESTINATIONS}
          searchQuery={searchQuery}
          onSelectDestination={handleDestinationSelect}
        />
      </main>

      <footer className="border-t border-stone-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Jelajah Rimba · portal simulasi wisatawan untuk Passify</span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
            Masuk untuk melanjutkan ke pemesanan
          </span>
        </div>
      </footer>

      {selectedDestination && (
        <BookingModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      {isTicketModalOpen && activeOrder && (
        <ETicketModal order={activeOrder} onClose={() => setIsTicketModalOpen(false)} />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

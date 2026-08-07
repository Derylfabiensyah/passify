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

  const scrollToCatalog = () => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group inline-flex items-center gap-2.5 no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--forest)] text-white transition-transform duration-200 group-hover:scale-105">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-lg font-bold tracking-[-0.035em] text-[var(--forest-deep)]">Jelajah Rimba</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">tiket wisata alam</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-[var(--bark-pale)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--bark)] sm:inline-flex">Data demo</span>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold text-[var(--ink-soft)] sm:inline">Halo, {user.name?.split(' ')[0] || 'Wisatawan'}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--leaf-pale)] text-xs font-bold text-[var(--forest-deep)]">{user.avatar || user.name?.charAt(0)?.toUpperCase() || 'W'}</span>
                <button type="button" onClick={handleLogout} title="Keluar" className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-soft)] transition-colors hover:bg-[var(--bark-pale)] hover:text-[var(--bark)]">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Keluar</span>
                </button>
              </div>
            ) : (
              <button type="button" onClick={openAuthModal} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--forest)] transition-colors hover:border-[var(--forest-soft)] hover:bg-[var(--leaf-pale)]">
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[1.5rem] bg-[var(--forest-deep)]">
            {featuredDestination && <img src={featuredDestination.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 saturate-[.7]" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,45,32,.92),rgba(16,45,32,.66))]" />

            <div className="relative grid min-h-[410px] items-end gap-7 px-6 py-7 sm:min-h-[450px] sm:px-9 sm:py-9 lg:grid-cols-[1fr_330px] lg:items-center lg:gap-12 lg:px-12 lg:py-12">
              <div className="max-w-2xl">
                <p className="mb-3 text-[12px] font-semibold text-[var(--leaf)]">{todayLabel}</p>
                <h1 className="max-w-xl font-serif text-4xl font-semibold leading-[1] tracking-[-0.05em] text-white sm:text-5xl">Luangkan waktu untuk kembali ke alam.</h1>
                <p className="mt-5 max-w-lg text-[14px] leading-6 text-white/80 sm:text-[15px] sm:leading-7">Pesan tiket kunjungan dengan ritme yang sederhana—pilih tempat, tentukan sesi, lalu simpan e-ticket sebelum berangkat.</p>
              </div>

              <form onSubmit={handleSearchSubmit} className="rounded-[1.25rem] bg-white p-4 text-[var(--text-primary)] shadow-[0_16px_40px_rgba(16,45,32,.25)] sm:p-5">
                <div className="mb-4 flex items-center gap-2 text-xs font-extrabold text-[var(--forest)]"><MapPin className="h-4 w-4" aria-hidden="true" />Mulai dari tujuan Anda</div>
                <label htmlFor="traveler-search" className="sr-only">Cari destinasi</label>
                <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 focus-within:border-[var(--forest-soft)] focus-within:bg-white">
                  <Search className="h-4 w-4 flex-none text-[var(--ink-soft)]" aria-hidden="true" />
                  <input id="traveler-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Gunung, danau, provinsi..." className="min-w-0 flex-1 bg-transparent px-2.5 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]" />
                </div>
                <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--bark)] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--forest)]">Cari tiket <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                <p className="mt-3 text-center text-[11px] leading-relaxed text-[var(--ink-soft)]">Harga, ketersediaan, dan pembayaran pada halaman ini merupakan demonstrasi produk.</p>
              </form>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1240px] gap-5 sm:grid-cols-3 sm:gap-7">
            {[
              [CalendarDays, 'Pilih waktu yang pas', 'Lihat pilihan sesi dan kuota sebelum mengunci rencana.'],
              [Ticket, 'Satu tiket, lebih ringan', 'E-ticket tersimpan setelah pemesanan selesai.'],
              [Leaf, 'Berjalan dengan sadar', 'Kuota membantu menjaga pengalaman dan ruang alam tetap nyaman.'],
            ].map(([Icon, title, detail]) => (
              <div className="flex gap-3" key={title}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--leaf-pale)] text-[var(--forest)]"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <div><h2 className="text-[15px] font-bold text-[var(--forest-deep)]">{title}</h2><p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8">
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--bark)]">Pilih tujuan</p>
              <h2 className="max-w-xl font-serif text-3xl font-semibold leading-[1.03] tracking-[-0.04em] text-[var(--forest-deep)] sm:text-4xl">Tempat yang membuat perjalanan terasa lebih panjang.</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bark-pale)] px-3 py-2 text-xs font-semibold text-[var(--bark)]"><ShieldCheck className="h-4 w-4" aria-hidden="true" />Inventori bersifat demo</div>
          </div>
        </section>

        <Catalog destinations={DESTINATIONS} searchQuery={searchQuery} onSelectDestination={handleDestinationSelect} />
      </main>

      <footer className="border-t border-[var(--border)] bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <span>Jelajah Rimba · portal simulasi wisatawan untuk Passify</span>
          <span className="inline-flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5" aria-hidden="true" />Masuk untuk melanjutkan ke pemesanan</span>
        </div>
      </footer>

      {selectedDestination && <BookingModal destination={selectedDestination} onClose={() => setSelectedDestination(null)} onBookingSuccess={handleBookingSuccess} />}
      {isTicketModalOpen && activeOrder && <ETicketModal order={activeOrder} onClose={() => setIsTicketModalOpen(false)} />}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}

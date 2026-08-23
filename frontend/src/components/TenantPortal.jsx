import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Compass, Leaf, LogIn, LogOut, Ticket } from 'lucide-react';
import BookingModal from './BookingModal';
import ETicketModal from './ETicketModal';
import AuthModal from './AuthModal';
import { useTenant } from '../contexts/TenantContext';

export default function TenantPortal() {
  const { destination } = useTenant();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('passify_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const handleBookNowClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    setIsBookingModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
  };

  const handleBookingSuccess = (order) => {
    setActiveOrder(order);
    setIsBookingModalOpen(false);
    setIsTicketModalOpen(true);
  };

  if (!destination) {
    return <div>Loading destination...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--forest)] text-white">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-serif text-lg font-bold tracking-[-0.035em] text-[var(--forest-deep)]">
                {destination.name}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                tiket wisata alam
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold text-[var(--ink-soft)] sm:inline">
                  Halo, {user.name?.split(' ')[0] || 'Wisatawan'}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--leaf-pale)] text-xs font-bold text-[var(--forest-deep)]">
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'W'}
                </span>
                <button type="button" onClick={handleLogout} title="Keluar" className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-soft)] transition-colors hover:bg-[var(--bark-pale)] hover:text-[var(--bark)]">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--forest)] transition-colors hover:border-[var(--forest-soft)] hover:bg-[var(--leaf-pale)]">
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Single Destination */}
        <section className="px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8">
          <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[1.5rem] bg-[var(--forest-deep)]">
            <img src={destination.cover_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 saturate-[.7]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,45,32,.92),rgba(16,45,32,.66))]" />

            <div className="relative grid min-h-[410px] items-center gap-7 px-6 py-7 sm:min-h-[450px] sm:px-9 sm:py-9 lg:px-12 lg:py-12">
              <div className="max-w-2xl">
                <p className="mb-3 text-[12px] font-semibold text-[var(--leaf)]">{todayLabel}</p>
                <h1 className="max-w-xl font-serif text-4xl font-semibold leading-[1] tracking-[-0.05em] text-white sm:text-5xl">
                  {destination.name}
                </h1>
                <p className="mt-5 max-w-lg text-[14px] leading-6 text-white/80 sm:text-[15px] sm:leading-7">
                  {destination.description}
                </p>
                <button
                  onClick={handleBookNowClick}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--bark)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--forest)]"
                >
                  <Ticket className="h-4 w-4" />
                  Pesan Tiket Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-[var(--border)] bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1240px] gap-5 sm:grid-cols-3 sm:gap-7">
            {[
              [CalendarDays, 'Pilih waktu yang pas', 'Lihat pilihan sesi dan kuota sebelum mengunci rencana.'],
              [Ticket, 'Satu tiket, lebih ringan', 'E-ticket tersimpan setelah pemesanan selesai.'],
              [Leaf, 'Berjalan dengan sadar', 'Kuota membantu menjaga pengalaman dan ruang alam tetap nyaman.'],
            ].map(([Icon, title, detail]) => (
              <div className="flex gap-3" key={title}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--leaf-pale)] text-[var(--forest)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[15px] font-bold text-[var(--forest-deep)]">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Destination Details Section */}
        <section className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[var(--forest-deep)]">Tentang Destinasi</h2>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{destination.description}</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[var(--forest-deep)]">Informasi Tiket</h2>
              <div className="mt-4 space-y-3">
                {destination.ticket_categories?.map((cat) => (
                  <div key={cat.id} className="rounded-xl border border-[var(--border)] bg-white p-4">
                    <div className="font-semibold text-[var(--forest-deep)]">{cat.name}</div>
                    <div className="mt-1 text-sm font-bold text-[var(--bark)]">
                      Rp {cat.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <span>{destination.name} · Powered by Passify</span>
          <Link to="https://passify.com" className="hover:text-[var(--forest)]">
            Lihat Destinasi Lainnya
          </Link>
        </div>
      </footer>

      {isBookingModalOpen && (
        <BookingModal
          destination={destination}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      {isTicketModalOpen && activeOrder && (
        <ETicketModal order={activeOrder} onClose={() => setIsTicketModalOpen(false)} />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

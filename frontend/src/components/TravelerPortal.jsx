import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock, Compass,
  Info, Leaf, LogIn, LogOut, MapPin, ShieldCheck, Sparkles, Ticket, Users,
} from 'lucide-react';
import BookingModal from './BookingModal';
import ETicketModal from './ETicketModal';
import { DESTINATIONS } from '../data/destinations';

const fallbackDestination = {
  id: 'dest-demo',
  name: 'Kawasan Konservasi & Wisata Alam Pegunungan',
  location: 'Kawasan Konservasi',
  province: 'Jawa Timur',
  max_daily_capacity: 2500,
  booked_today: 1420,
  cover_image_url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
  description: 'Portal tiket resmi untuk pengalaman alam yang teratur, aman, dan menjaga daya dukung kawasan.',
  facilities: ['Area Parkir', 'Pos Pemandu', 'Toilet Bersih', 'Pos Kesehatan'],
  rules: 'Jaga kebersihan kawasan dan patuhi batas daya dukung lingkungan selama kunjungan.',
  time_slots: [{ id: 'morning', label: 'Sesi Pagi', max_capacity: 1200, booked: 850 }],
  ticket_categories: [{ id: 'regular', name: 'Tiket Reguler', price: 35000, insurance: 3000, retribusi: 5000 }],
};

function formatRupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export default function TravelerPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [demoIndex, setDemoIndex] = useState(0);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('passify_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const destinations = Array.isArray(DESTINATIONS) && DESTINATIONS.length ? DESTINATIONS : [fallbackDestination];
  const destination = destinations[demoIndex] || destinations[0] || fallbackDestination;
  const capacity = Number(destination.max_daily_capacity) || 0;
  const booked = Number(destination.booked_today) || 0;
  const remainingQuota = Math.max(0, capacity - booked);
  const quotaPercentage = capacity ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
  const lowestPrice = Math.min(...(destination.ticket_categories || []).map((cat) => Number(cat.price) || 0));
  const todayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  useEffect(() => {
    if (user && location.state?.openBooking) {
      setIsBookingModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state?.openBooking, navigate, user]);

  const handleBookNowClick = () => {
    const slug = destination.slug || destination.id || 'curug-bidadari';
    navigate(`/pesan/${slug}`);
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

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      <header className="nav-bar sticky top-0 z-40">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 no-underline" aria-label="Kembali ke Passify">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--forest-deep)] text-white shadow-[0_8px_18px_rgba(16,45,32,.16)]">
              <Compass className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-bold text-[var(--forest-deep)] sm:text-xl">{destination.name}</span>
              <span className="block truncate text-[10px] font-extrabold uppercase tracking-[.13em] text-[var(--ink-soft)]">Portal tiket resmi kawasan</span>
            </span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs font-semibold text-[var(--ink-soft)] sm:inline">Halo, {user.name?.split(' ')[0] || 'Wisatawan'}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--leaf-pale)] text-xs font-bold text-[var(--forest-deep)]">{user.avatar || user.name?.charAt(0)?.toUpperCase() || 'W'}</span>
              <button type="button" onClick={handleLogout} title="Keluar" className="grid h-9 w-9 place-items-center rounded-full border border-transparent text-[var(--ink-soft)] transition-colors hover:border-[var(--border)] hover:bg-[var(--bark-pale)] hover:text-[var(--bark)]">
                <LogOut className="h-4 w-4" /><span className="sr-only">Keluar</span>
              </button>
            </div>
          ) : (
            <Link to="/masuk" state={{ from: location.pathname }} className="btn-secondary rounded-xl px-3.5 sm:px-4"><LogIn className="h-3.5 w-3.5" /><span className="hidden sm:inline">Masuk / Daftar</span><span className="sm:hidden">Masuk</span></Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <section className="mb-6 flex flex-col gap-3 rounded-2xl bg-[var(--leaf-pale)]/80 px-5 py-3.5 text-xs text-[var(--ink-soft)] shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span>
              <strong className="font-bold text-[var(--forest-deep)]">Mode demo.</strong> Lihat contoh portal untuk beberapa pengelola wisata.
            </span>
          </div>
          <label className="flex min-w-0 items-center gap-2.5 font-bold text-[var(--forest-deep)]">
            <span className="hidden sm:inline text-xs">Pilih kawasan</span>
            <select
              aria-label="Pilih contoh kawasan wisata"
              value={demoIndex}
              onChange={(event) => setDemoIndex(Number(event.target.value))}
              className="max-w-[280px] rounded-xl bg-white px-3 py-2 text-xs font-bold text-[var(--forest-deep)] shadow-xs outline-none cursor-pointer"
            >
              {destinations.map((item, index) => (
                <option key={item.id || index} value={index}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--forest-deep)] shadow-[var(--shadow-lift)]">
          {destination.cover_image_url && <img src={destination.cover_image_url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35 saturate-[.7]" />}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(16,45,32,.98),rgba(16,45,32,.82)_50%,rgba(16,45,32,.48))]" />
          <div className="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end lg:gap-12 lg:px-12 lg:py-14">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-sm"><MapPin className="h-3.5 w-3.5 text-[var(--leaf)]" />{destination.location || destination.province}</div>
              <p className="eyebrow !text-[var(--leaf)]">Kunjungan yang terjaga</p>
              <h1 className="mt-3 max-w-[760px] text-4xl font-bold leading-[.98] text-white sm:text-5xl lg:text-6xl">{destination.name}</h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-[15px] sm:leading-7">{destination.description}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button id="book-now-hero-btn" type="button" onClick={handleBookNowClick} className="btn-clay px-5 py-3.5 text-sm"><Ticket className="h-4 w-4" />Pesan tiket kunjungan<ArrowRight className="h-4 w-4" /></button>
                <span className="flex items-center gap-2 text-xs font-medium text-white/75"><ShieldCheck className="h-4 w-4 text-[var(--leaf)]" />Kuota dan QR tiket terlindungi</span>
              </div>
            </div>

            <aside className="rounded-2xl border border-white/16 bg-[rgba(255,254,250,.97)] p-5 text-[var(--ink)] shadow-[0_16px_36px_rgba(0,0,0,.16)] backdrop-blur-md">
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div><p className="eyebrow">Ketersediaan hari ini</p><p className="mt-1 text-xs font-semibold text-[var(--ink-soft)]">{todayLabel}</p></div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--leaf-pale)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)]"><span className="status-dot" />Buka</span>
              </div>
              <div className="mt-5">
                <div className="flex items-end justify-between"><span className="text-xs font-bold text-[var(--ink-soft)]">Kuota terisi</span><strong className="text-2xl font-extrabold text-[var(--forest-deep)]">{quotaPercentage}%</strong></div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--leaf-pale)]"><div className="h-full rounded-full bg-[var(--leaf)]" style={{ width: `${quotaPercentage}%` }} /></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-3"><span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Sisa kuota</span><strong className="mt-1 block text-xl font-extrabold text-[var(--forest-deep)]">{remainingQuota.toLocaleString('id-ID')}</strong></div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-3"><span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Mulai dari</span><strong className="mt-1 block text-lg font-extrabold text-[var(--bark)]">{formatRupiah(lowestPrice)}</strong></div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="eyebrow">Pilih sesuai rencana</p><h2 className="mt-2 text-3xl font-bold">Tiket resmi untuk kunjungan Anda</h2><p className="mt-2 max-w-xl text-sm text-[var(--ink-soft)]">Harga ditampilkan transparan, termasuk asuransi dan retribusi kawasan bila berlaku.</p></div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--forest)]"><CalendarDays className="h-4 w-4" />Pilih tanggal di langkah berikutnya</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(destination.ticket_categories || []).map((cat) => {
                const total = Number(cat.price || 0) + Number(cat.insurance || 0) + Number(cat.retribusi || 0);
                return <article key={cat.id} className="card group flex min-h-[242px] flex-col justify-between p-5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
                  <div><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--leaf-pale)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)]"><Ticket className="h-3 w-3" />E-ticket resmi</span><h3 className="mt-4 text-xl font-bold leading-snug">{cat.name}</h3><dl className="mt-4 space-y-1.5 text-xs text-[var(--ink-soft)]"><div className="flex justify-between gap-3"><dt>Tarif masuk</dt><dd className="font-semibold text-[var(--ink)]">{formatRupiah(cat.price)}</dd></div>{Number(cat.insurance) > 0 && <div className="flex justify-between gap-3"><dt>Asuransi</dt><dd>{formatRupiah(cat.insurance)}</dd></div>}{Number(cat.retribusi) > 0 && <div className="flex justify-between gap-3"><dt>Retribusi kawasan</dt><dd>{formatRupiah(cat.retribusi)}</dd></div>}</dl></div>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-[var(--border)] pt-4"><div><span className="block text-[10px] font-bold uppercase tracking-wide text-[var(--ink-muted)]">Total per orang</span><strong className="mt-1 block font-serif text-xl text-[var(--bark)]">{formatRupiah(total)}</strong></div><button type="button" onClick={handleBookNowClick} className="btn-primary btn-sm">Pilih<ChevronRight className="h-3.5 w-3.5" /></button></div>
                </article>;
              })}
            </div>
          </div>

          <aside className="surface-muted h-fit p-5 lg:sticky lg:top-24">
            <Leaf className="h-5 w-5 text-[var(--forest)]" />
            <h2 className="mt-4 text-xl font-bold">Sebelum berkunjung</h2>
            <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">Tiket dikaitkan dengan waktu kunjungan agar kawasan tetap nyaman bagi semua orang.</p>
            <ul className="mt-5 space-y-3 text-xs text-[var(--ink-soft)]">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />Pilih sesi yang masih tersedia.</li>
              <li className="flex gap-2"><Users className="h-4 w-4 shrink-0 text-[var(--forest)]" />Isi data untuk setiap pengunjung.</li>
              <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-[var(--forest)]" />Simpan QR tiket untuk dipindai di gerbang.</li>
            </ul>
          </aside>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="card p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]"><Leaf className="h-5 w-5" /></span><div><p className="eyebrow">Di kawasan</p><h2 className="mt-1 text-xl font-bold">Fasilitas untuk perjalanan nyaman</h2></div></div><ul className="mt-5 grid gap-2 sm:grid-cols-2">{(destination.facilities || []).map((facility) => <li key={facility} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-xs font-semibold text-[var(--ink-soft)]"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />{facility}</li>)}</ul></article>
          <article className="rounded-[var(--radius)] border border-[var(--bark)]/25 bg-[var(--bark-pale)]/55 p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/75 text-[var(--bark)]"><Info className="h-5 w-5" /></span><div><p className="eyebrow !text-[var(--bark)]">Etika berkunjung</p><h2 className="mt-1 text-xl font-bold">Aturan konservasi</h2></div></div><p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">{destination.rules}</p><p className="mt-5 flex items-center gap-2 text-xs font-bold text-[var(--bark)]"><Clock className="h-4 w-4" />Tunjukkan QR aktif saat memasuki kawasan.</p></article>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[rgba(255,254,250,.94)] px-4 py-3 backdrop-blur-md lg:hidden">
        <button type="button" onClick={handleBookNowClick} className="btn-clay w-full text-sm"><Ticket className="h-4 w-4" />Pesan tiket kunjungan</button>
      </div>
      <footer className="border-t border-[var(--border)] bg-[var(--sand)] px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between"><span><strong className="text-[var(--forest-deep)]">{destination.name}</strong> · Didukung Passify</span><Link to="/" className="font-semibold text-[var(--forest)] hover:text-[var(--bark)]">Kembali ke beranda Passify</Link></div></footer>

      {isBookingModalOpen && <BookingModal isOpen={isBookingModalOpen} destination={destination} onClose={() => setIsBookingModalOpen(false)} onBookingSuccess={handleBookingSuccess} />}
      {isTicketModalOpen && activeOrder && <ETicketModal order={activeOrder} onClose={() => setIsTicketModalOpen(false)} />}
    </div>
  );
}

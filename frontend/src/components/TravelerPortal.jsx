import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock, Compass,
  Info, Leaf, LogIn, LogOut, MapPin, ShieldCheck, Sparkles, Ticket, Users, Wallet,
} from 'lucide-react';
import { formatRupiah } from '../api/client';
import { DESTINATIONS } from '../data/destinations';
import WalletModal from './WalletModal';

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
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('passify_wallet_balance');
    return saved !== null ? Number(saved) : 150000;
  });

  React.useEffect(() => {
    const syncWallet = () => {
      const saved = localStorage.getItem('passify_wallet_balance');
      if (saved !== null) setWalletBalance(Number(saved));
    };
    window.addEventListener('storage', syncWallet);
    return () => window.removeEventListener('storage', syncWallet);
  }, []);

  const destinations = Array.isArray(DESTINATIONS) && DESTINATIONS.length ? DESTINATIONS : [fallbackDestination];
  const destination = destinations[demoIndex] || destinations[0] || fallbackDestination;
  const capacity = Number(destination.max_daily_capacity) || 0;
  const booked = Number(destination.booked_today) || 0;
  const remainingQuota = Math.max(0, capacity - booked);
  const quotaPercentage = capacity ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
  const lowestPrice = Math.min(...(destination.ticket_categories || []).map((cat) => Number(cat.price) || 0));
  const todayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

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
    <div className="min-h-screen bg-transparent text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/85 backdrop-blur-2xl shadow-xs transition-all">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 no-underline group" aria-label="Kembali ke Passify">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-800 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black text-[#14281a] sm:text-xl">{destination.name}</span>
              <span className="block truncate text-[10px] font-extrabold uppercase tracking-[.13em] text-emerald-800/80">Portal tiket resmi kawasan</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/riwayat-pesanan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281a] bg-white/80 hover:bg-white border border-gray-200/90 hover:border-gray-300 px-3 py-1.5 rounded-xl no-underline transition-all shadow-2xs"
              title="Lihat riwayat pesanan dan e-tiket saya"
            >
              <Ticket className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Riwayat Pesanan</span>
              <span className="sm:hidden">Pesanan</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281a] bg-white/80 hover:bg-white border border-gray-200/90 hover:border-gray-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Buka Dompet Digital Cashless & Simulasi Gelang NFC"
            >
              <Wallet className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Dompet:</span> <span className="font-extrabold text-emerald-800">{formatRupiah(walletBalance)}</span>
            </button>

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
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <section className="mb-6 flex flex-col gap-3 rounded-2xl glass-panel px-5 py-3.5 text-xs text-[#2f382a] shadow-xs sm:flex-row sm:items-center sm:justify-between">
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

        <section className="relative isolate overflow-hidden rounded-2xl bg-[var(--forest-deep)] text-white shadow-[var(--shadow-lift)]">
          {destination.cover_image_url && (
            <img
              src={destination.cover_image_url}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60 saturate-[.9]"
            />
          )}
          <div
            className="absolute inset-0 -z-10"
            style={{ backgroundImage: 'linear-gradient(105deg, rgba(16,45,32,.94) 4%, rgba(16,45,32,.78) 46%, rgba(16,45,32,.35))' }}
          />
          <div className="grid gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end lg:gap-12 lg:px-12 lg:py-14">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                {destination.location || destination.province}
              </div>
              <p className="eyebrow !text-emerald-300">Kunjungan yang terjaga</p>
              <h1 className="mt-3 max-w-[760px] text-4xl font-bold leading-[.98] text-white sm:text-5xl lg:text-6xl">
                {destination.name}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/85 sm:text-[15px] sm:leading-7">
                {destination.description}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  id="book-now-hero-btn"
                  type="button"
                  onClick={handleBookNowClick}
                  className="btn-clay px-5 py-3.5 text-sm"
                >
                  <Ticket className="h-4 w-4" />Pesan tiket kunjungan<ArrowRight className="h-4 w-4" />
                </button>
                <span className="flex items-center gap-2 text-xs font-medium text-white/80">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />Kuota dan QR tiket terlindungi
                </span>
              </div>
            </div>

            <aside className="glass-card-dark p-5 sm:p-6 text-white">
              <div className="flex items-start justify-between gap-3 border-b border-white/20 pb-4">
                <div>
                  <p className="eyebrow !text-emerald-300">Ketersediaan hari ini</p>
                  <p className="mt-1 text-xs font-semibold text-white/80">{todayLabel}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-300 border border-white/20">
                  <span className="status-dot text-emerald-400" />Buka
                </span>
              </div>
              <div className="mt-5">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold text-white/80">Kuota terisi</span>
                  <strong className="text-2xl font-extrabold text-white">{quotaPercentage}%</strong>
                </div>
                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15 backdrop-blur-md"
                  role="progressbar"
                  aria-valuenow={quotaPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Persentase kuota terisi destinasi"
                >
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${quotaPercentage}%` }} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/15">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wide text-white/65">Sisa kuota</span>
                  <strong className="mt-1 block text-xl font-extrabold text-white">{remainingQuota.toLocaleString('id-ID')}</strong>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/15">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wide text-white/65">Mulai dari</span>
                  <strong className="mt-1 block text-lg font-extrabold text-amber-300">{formatRupiah(lowestPrice)}</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="flex flex-col gap-3 border-b border-black/[0.08] dark:border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow !text-emerald-800">Pilih sesuai rencana</p>
                <h2 className="mt-2 text-3xl font-black text-[#14281a]">Tiket resmi untuk kunjungan Anda</h2>
                <p className="mt-2 max-w-xl text-sm font-medium text-[#3b4836]">Harga ditampilkan transparan, termasuk asuransi dan retribusi kawasan bila berlaku.</p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800"><CalendarDays className="h-4 w-4" />Pilih tanggal di langkah berikutnya</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(destination.ticket_categories || []).map((cat) => {
                const total = Number(cat.price || 0) + Number(cat.insurance || 0) + Number(cat.retribusi || 0);
                return (
                  <article key={cat.id} className="glass-panel group flex min-h-[220px] flex-col justify-between p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
                    <div>
                      <h3 className="text-xl font-bold leading-snug text-[#14281a] group-hover:text-emerald-800 transition-colors">{cat.name}</h3>
                      <dl className="mt-4 space-y-1.5 text-xs text-[#3b4836]">
                        <div className="flex justify-between gap-3">
                          <dt>Tarif masuk</dt>
                          <dd className="font-bold text-[#14281a]">{formatRupiah(cat.price)}</dd>
                        </div>
                        {Number(cat.insurance) > 0 && (
                          <div className="flex justify-between gap-3">
                            <dt>Asuransi</dt>
                            <dd className="font-semibold">{formatRupiah(cat.insurance)}</dd>
                          </div>
                        )}
                        {Number(cat.retribusi) > 0 && (
                          <div className="flex justify-between gap-3">
                            <dt>Retribusi kawasan</dt>
                            <dd className="font-semibold">{formatRupiah(cat.retribusi)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-black/[0.08] dark:border-white/10 pt-4">
                      <div>
                        <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#556350]">Total per orang</span>
                        <strong className="mt-1 block text-2xl font-black text-[#14281a]">{formatRupiah(total)}</strong>
                      </div>
                      <button type="button" onClick={handleBookNowClick} className="btn-primary btn-sm rounded-xl font-bold shadow-xs hover:shadow-md cursor-pointer">
                        Pilih <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="glass-panel h-fit p-6 lg:sticky lg:top-24 shadow-xs">
            <h2 className="text-xl font-bold text-[#14281a]">Sebelum berkunjung</h2>
            <p className="mt-2 text-xs font-medium leading-5 text-[#3b4836]">Tiket dikaitkan dengan waktu kunjungan agar kawasan tetap nyaman bagi semua orang.</p>
            <ul className="mt-5 space-y-3.5 text-xs font-medium text-[#2f382a]">
              <li className="flex items-start gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" /><span>Pilih sesi yang masih tersedia.</span></li>
              <li className="flex items-start gap-2.5"><Users className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" /><span>Isi data untuk setiap pengunjung.</span></li>
              <li className="flex items-start gap-2.5"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" /><span>Simpan QR tiket untuk dipindai di gerbang.</span></li>
            </ul>
          </aside>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="glass-panel p-6 shadow-xs">
            <div>
              <p className="eyebrow !text-emerald-800">Di kawasan</p>
              <h2 className="mt-1 text-xl font-bold text-[#14281a]">Fasilitas untuk perjalanan nyaman</h2>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {(destination.facilities || []).map((facility) => (
                <li key={facility} className="flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-xs px-3.5 py-2.5 text-xs font-bold text-[#14281a] border border-white/80 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />{facility}
                </li>
              ))}
            </ul>
          </article>
          <article className="glass-panel p-6 shadow-xs">
            <div>
              <p className="eyebrow !text-emerald-800">Etika berkunjung</p>
              <h2 className="mt-1 text-xl font-bold text-[#14281a]">Aturan konservasi</h2>
            </div>
            <p className="mt-4 text-sm font-medium leading-6 text-[#2f382a]">{destination.rules}</p>
            <p className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Clock className="h-4 w-4 text-emerald-700" />Tunjukkan QR aktif saat memasuki kawasan.
            </p>
          </article>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden shadow-lg">
        <button type="button" onClick={handleBookNowClick} className="btn-clay w-full text-sm font-bold"><Ticket className="h-4 w-4" />Pesan tiket kunjungan</button>
      </div>
      <footer className="border-t border-white/60 bg-white/50 backdrop-blur-md px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-[#3b4836] sm:flex-row sm:items-center sm:justify-between">
          <span><strong className="text-[#14281a] font-bold">{destination.name}</strong> · Didukung Passify</span>
          <Link to="/" className="font-bold text-emerald-800 hover:text-emerald-950">Kembali ke beranda Passify</Link>
        </div>
      </footer>

      {/* Passify Cashless Wallet Modal */}
      {showWalletModal && (
        <WalletModal
          walletBalance={walletBalance}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </div>
  );
}


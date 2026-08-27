import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Compass,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import BookingModal from './BookingModal';
import ETicketModal from './ETicketModal';
import AuthModal from './AuthModal';
import { DESTINATIONS } from '../data/destinations';

export default function TravelerPortal() {
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const safeDestinations = Array.isArray(DESTINATIONS) && DESTINATIONS.length > 0 ? DESTINATIONS : [];
  const destination = safeDestinations[demoIndex] || safeDestinations[0] || {
    id: 'dest-demo',
    name: 'Kawasan Konservasi & Wisata Alam Pegunungan',
    slug: 'konservasi-pegunungan-alpha',
    location: 'Kawasan Konservasi • White-Label Tenant',
    province: 'Jawa Timur',
    rating: 4.9,
    max_daily_capacity: 2500,
    booked_today: 1420,
    cover_image_url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    description: 'Penerapan portal tiket resmi mandiri dengan integrasi kuota daya dukung, TOTP QR code, dan ekosistem non-tunai.',
    facilities: ['Area Parkir', 'Pos Pemandu', 'Toilet Bersih', 'Pos Kesehatan', 'Gate Scanner QR'],
    rules: 'Wajib mematuhi kuota harian daya dukung alam dan menjaga kebersihan kawasan.',
    time_slots: [
      { id: 'ts-1', label: 'Sesi Pagi (06:00 - 12:00)', max_capacity: 1200, booked: 850 },
      { id: 'ts-2', label: 'Sesi Siang (12:00 - 17:00)', max_capacity: 1300, booked: 570 },
    ],
    ticket_categories: [
      { id: 'cat-1', name: 'Tiket Masuk Reguler (WNI)', price: 35000, insurance: 3000, retribusi: 5000 },
      { id: 'cat-2', name: 'Tiket Wisatawan Mancanegara (WNA)', price: 250000, insurance: 10000, retribusi: 15000 },
    ],
  };

  const maxCap = Number(destination.max_daily_capacity) || 2000;
  const booked = Number(destination.booked_today) || 0;
  const remainingQuota = Math.max(0, maxCap - booked);
  const quotaPercentage = Math.min(100, Math.round((booked / maxCap) * 100));

  const todayLabel = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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

  return (
    <div className="min-h-screen bg-[var(--canvas,#f8fbf5)] text-[var(--text-primary,#193024)]">
      
      {/* 🚀 Floating Demo Switcher Bar (Sticky Top Banner) */}
      <div className="sticky top-0 z-50 bg-[#102d20] text-white border-b border-emerald-900/60 shadow-md">
        <div className="mx-auto max-w-[1240px] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold tracking-wide uppercase text-[10px] border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Live Demo Showcase
            </span>
            <span className="hidden sm:inline text-white/75">
              Simulasi 1 Portal Mandiri Pengelola Wisata (White-Label)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="demo-dest-select" className="text-white/70 text-[11px] font-medium hidden md:inline">
              Ganti Contoh Pengelola:
            </label>
            <select
              id="demo-dest-select"
              value={demoIndex}
              onChange={(e) => setDemoIndex(Number(e.target.value))}
              className="bg-[#193024] text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-700/50 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {safeDestinations.map((dest, idx) => (
                <option key={dest.id || idx} value={idx}>
                  {dest.name} ({dest.province || 'Wisata'})
                </option>
              ))}
            </select>

            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-[11px] font-bold inline-flex items-center gap-1"
            >
              ← Ke Beranda SaaS
            </Link>
          </div>
        </div>
      </div>

      {/* 🌲 Tenant Navigation Header (White-Label Brand) */}
      <header className="border-b border-[var(--border,#d6e2cf)] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--forest,#1e4b35)] text-white shadow-sm">
              <Compass className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <span className="block font-serif text-lg font-bold tracking-[-0.035em] text-[var(--forest-deep,#102d20)]">
                {destination.name}
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft,#586d5d)]">
                Portal Resmi Tiket &amp; Daya Dukung Kawasan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
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
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border,#d6e2cf)] bg-white px-3.5 py-2 text-xs font-bold text-[var(--forest,#1e4b35)] transition-colors hover:border-[var(--forest-soft,#3c7152)] hover:bg-[var(--leaf-pale,#e8f1dc)]"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        
        {/* 🏔️ Hero Showcase Section */}
        <section className="relative overflow-hidden rounded-[2rem] bg-[var(--forest-deep,#102d20)] shadow-[0_20px_50px_rgba(16,45,32,0.18)]">
          {destination.cover_image_url && (
            <img
              src={destination.cover_image_url}
              alt={destination.name}
              className="absolute inset-0 h-full w-full object-cover opacity-35 saturate-125"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,45,32,0.95)] via-[rgba(16,45,32,0.65)] to-transparent" />

          <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_360px] lg:items-center lg:gap-12 lg:p-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-md mb-4">
                <MapPin className="h-3.5 w-3.5 text-amber-300" />
                <span>{destination.location || destination.province}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {destination.name}
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/85">
                {destination.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  id="book-now-hero-btn"
                  onClick={handleBookNowClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--bark,#8a5638)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--forest,#1e4b35)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Pesan Tiket Kunjungan</span>
                </button>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Enkripsi QR TOTP &amp; Jaminan Kuota Pasti</span>
                </div>
              </div>
            </div>

            {/* 📊 Real-Time Carrying Capacity Card */}
            <div className="rounded-2xl border border-white/20 bg-white/95 p-6 text-[var(--text-primary,#193024)] backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#d6e2cf] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft,#586d5d)]">
                  Status Kuota Hari Ini
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Buka
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-[var(--ink-soft,#586d5d)]">
                  <span>Daya Dukung Terpakai</span>
                  <span className="font-bold text-[var(--forest-deep,#102d20)]">{quotaPercentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[var(--leaf-pale,#e8f1dc)]">
                  <div
                    className="h-full rounded-full bg-[var(--leaf,#9cbd72)] transition-all duration-500"
                    style={{ width: `${quotaPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl bg-[var(--canvas,#f8fbf5)] p-3 border border-[#d6e2cf]">
                  <span className="block text-[10px] font-bold uppercase text-[var(--ink-soft,#586d5d)]">
                    Sisa Kuota
                  </span>
                  <span className="font-serif text-xl font-bold text-[var(--forest-deep,#102d20)]">
                    {remainingQuota.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="rounded-xl bg-[var(--canvas,#f8fbf5)] p-3 border border-[#d6e2cf]">
                  <span className="block text-[10px] font-bold uppercase text-[var(--ink-soft,#586d5d)]">
                    Total Kapasitas
                  </span>
                  <span className="font-serif text-xl font-bold text-[var(--forest-deep,#102d20)]">
                    {maxCap.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-[var(--ink-soft,#586d5d)] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--forest,#1e4b35)]" />
                <span>Pembaruan real-time: {todayLabel}</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🎟️ Ticket Packages / Categories Grid */}
        <section className="space-y-5">
          <div className="border-b border-[var(--border,#d6e2cf)] pb-4">
            <h2 className="font-serif text-2xl font-bold text-[var(--forest-deep,#102d20)]">
              Kategori &amp; Tarif Tiket Resmi
            </h2>
            <p className="text-xs sm:text-sm text-[var(--ink-soft,#586d5d)] mt-1">
              Pilih kategori tiket sesuai dengan identitas dan kebutuhan rombongan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(destination.ticket_categories || []).map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-[var(--border,#d6e2cf)] bg-white p-6 shadow-sm hover:border-[var(--forest-soft,#3c7152)] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--leaf-pale,#e8f1dc)] px-2.5 py-1 text-[11px] font-bold text-[var(--forest-deep,#102d20)] mb-3">
                    <Ticket className="h-3.5 w-3.5 text-[var(--bark,#8a5638)]" />
                    <span>E-Ticket Resmi</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[var(--forest-deep,#102d20)] leading-snug">
                    {cat.name}
                  </h3>
                  <div className="mt-4 space-y-1.5 text-xs text-[var(--ink-soft,#586d5d)]">
                    <div className="flex justify-between">
                      <span>Tarif Dasar Wisata:</span>
                      <span className="font-semibold text-[var(--text-primary,#193024)]">
                        Rp {Number(cat.price).toLocaleString('id-ID')}
                      </span>
                    </div>
                    {cat.insurance > 0 && (
                      <div className="flex justify-between">
                        <span>Asuransi Keselamatan Jiwa:</span>
                        <span className="font-semibold text-[var(--text-primary,#193024)]">
                          Rp {Number(cat.insurance).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    {cat.retribusi > 0 && (
                      <div className="flex justify-between">
                        <span>Retribusi Kawasan Konservasi:</span>
                        <span className="font-semibold text-[var(--text-primary,#193024)]">
                          Rp {Number(cat.retribusi).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border,#d6e2cf)] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--ink-soft,#586d5d)] block">
                      Total per Pengunjung
                    </span>
                    <span className="font-serif text-lg font-bold text-[var(--bark,#8a5638)]">
                      Rp {(Number(cat.price) + Number(cat.insurance || 0) + Number(cat.retribusi || 0)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBookNowClick}
                    className="px-4 py-2 rounded-xl bg-[var(--forest,#1e4b35)] hover:bg-[var(--forest-deep,#102d20)] text-white text-xs font-bold transition-colors"
                  >
                    Pilih
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🌿 Facilities & Conservation Rules */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[var(--border,#d6e2cf)] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[var(--forest-deep,#102d20)]">
              <Leaf className="h-5 w-5 text-[var(--forest,#1e4b35)]" />
              <h3 className="font-serif text-lg font-bold">Fasilitas Kawasan Wisata</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[var(--text-primary,#193024)]">
              {(destination.facilities || ['Pusat Informasi', 'Pos Penyelamatan', 'Toilet Bersih']).map((fac, i) => (
                <li key={i} className="flex items-center gap-2 bg-[var(--canvas,#f8fbf5)] p-2.5 rounded-xl border border-[#d6e2cf]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{fac}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif text-lg font-bold">Aturan &amp; Kebijakan Konservasi</h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              {destination.rules || 'Pengunjung wajib mematuhi batas daya dukung lingkungan, membawa kembali sampah pribadi, dan menaati jam operasional yang telah ditetapkan demi kelestarian ekosistem alam.'}
            </p>
            <div className="pt-2 text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              <span>Tiket yang telah diterbitkan dilindungi enkripsi Dynamic QR TOTP.</span>
            </div>
          </div>
        </section>
      </main>

      {/* 🌲 Tenant Footer */}
      <footer className="mt-16 border-t border-[var(--border,#d6e2cf)] bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1240px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-soft,#586d5d)]">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-[var(--forest,#1e4b35)]" />
            <span className="font-bold text-[var(--forest-deep,#102d20)]">{destination.name}</span>
            <span>· Didukung oleh Infrastruktur Cloud Passify</span>
          </div>
          <span>© {new Date().getFullYear()} Hak Cipta Dilindungi Pengelola Kawasan.</span>
        </div>
      </footer>

      {/* 🔐 Modals Integration */}
      <BookingModal
        destination={destination}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={handleBookingSuccess}
      />

      <ETicketModal
        order={activeOrder}
        onClose={() => setIsTicketModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

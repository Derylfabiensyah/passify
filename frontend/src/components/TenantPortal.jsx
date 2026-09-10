import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Ticket,
  History,
  Wallet
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { PortalPageSkeleton } from './common/Skeleton';

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(16, 45, 32, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(16, 45, 32, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatCleanLocation(dest) {
  if (!dest) return 'Indonesia';
  const raw = dest.location || [dest.address, dest.city, dest.province].filter(Boolean).join(', ');
  if (!raw) return dest.province || dest.city || 'Indonesia';

  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  const uniqueParts = [];
  for (const part of parts) {
    if (!uniqueParts.some((p) => p.toLowerCase() === part.toLowerCase())) {
      uniqueParts.push(part);
    }
  }
  return uniqueParts.join(', ') || 'Indonesia';
}

export default function TenantPortal() {
  const { destination, isLoading } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('passify_user') || 'null'); } catch { return null; }
  });

  if (isLoading) {
    return <PortalPageSkeleton />;
  }

  if (!destination) return null;

  const isManager = user?.role === 'tenant_admin' || user?.role === 'pengelola' || user?.role === 'super_admin';
  const capacity = Number(destination.max_daily_capacity || 0);
  const booked = Number(destination.booked_today || 0);
  const remaining = Math.max(0, capacity - booked);
  const used = capacity ? Math.round((booked / capacity) * 100) : 0;
  const startingPrice = destination.ticket_categories && destination.ticket_categories.length > 0
    ? Math.min(
        ...destination.ticket_categories.map((c) =>
          Number(c.price || 0) + Number(c.insurance || 0) + Number(c.retribusi || 0)
        )
      )
    : 0;
  const template = destination.portal_template || {};
  const primaryColor = template.primary_color || '#394032';
  const accentColor = template.accent_color || '#454f2d';
  const portalStyle = { '--tenant-primary': primaryColor, '--tenant-accent': accentColor };
  const portalEyebrow = template.eyebrow || 'Tiket resmi kawasan';
  const portalHeading = template.hero_heading || destination.name;
  const portalCopy = template.hero_copy || destination.description;

  React.useEffect(() => {
    if (destination?.slug) {
      sessionStorage.setItem('passify_last_active_tenant', destination.slug);
      localStorage.setItem('passify_last_active_tenant', destination.slug);
    }
  }, [destination?.slug]);

  const openBooking = () => {
    navigate(`/pesan/${destination.slug || destination.id}`);
  };
  const logout = () => {
    if (destination?.slug) {
      sessionStorage.setItem('passify_last_active_tenant', destination.slug);
      localStorage.setItem('passify_last_active_tenant', destination.slug);
    }
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
  };

  return (
    <div className="tenant-portal min-h-screen bg-transparent text-[var(--ink)]" style={portalStyle}>
      {/* Pengelola Top Bar (Only visible for Tenant Admins) */}
      {isManager && (
        <div className="bg-[#14281a] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Template Website Resmi: {destination.name}</span>
            <span className="hidden sm:inline text-white/70">({destination.slug}.passify.id)</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-[11px] py-1 px-3.5 rounded-xl flex items-center gap-1.5 no-underline font-bold shadow-xs transition-all"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-emerald-300" /> Buka Dashboard Admin
            </Link>
            <Link
              to="/"
              onClick={() => localStorage.removeItem('passify_current_tenant')}
              className="text-white/80 hover:text-white text-xs no-underline font-medium transition-colors"
            >
              Beranda Utama Passify
            </Link>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/85 backdrop-blur-2xl shadow-xs transition-all">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 no-underline group">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-800 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-black text-[#14281a] sm:text-xl">
                {destination.name}
              </span>
              <span className="block truncate text-[10px] font-extrabold uppercase tracking-[.13em] text-emerald-800/80">
                {portalEyebrow}
              </span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {isManager && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#14281a] bg-white/80 hover:bg-white border border-gray-200/90 px-3 py-1.5 rounded-xl no-underline hover:border-gray-300 transition-all shadow-2xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[var(--forest)]" /> Dashboard Admin
              </Link>
            )}

            {user ? (
              <Link
                to={destination?.slug ? `/profil?tenant=${destination.slug}` : '/profil'}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-white/90 hover:bg-white border border-gray-200/90 hover:border-gray-300 px-3 py-1.5 transition-all shadow-2xs group no-underline"
                title="Buka Halaman Profil & Dompet"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-800 text-white text-xs font-black shadow-2xs group-hover:scale-105 transition-transform">
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || (isManager ? 'P' : 'W')}
                </span>
                <div className="text-left hidden sm:block">
                  <span className="block text-xs font-bold text-[#14281a] leading-none group-hover:text-emerald-800 transition-colors">
                    {user.name?.split(' ')[0] || (isManager ? 'Pengelola' : 'Wisatawan')}
                  </span>
                  <span className="block text-[10px] text-gray-500 font-medium mt-0.5">Profil & Dompet</span>
                </div>
              </Link>
            ) : (
              <Link
                to={destination?.slug ? `/masuk?tenant=${destination.slug}` : '/masuk'}
                state={{
                  from: destination?.slug ? `/?tenant=${destination.slug}` : location.pathname,
                  tenantSlug: destination?.slug
                }}
                className="btn-secondary rounded-xl px-3.5 sm:px-4"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <section
          className="relative isolate overflow-hidden rounded-2xl text-white shadow-2xl border border-white/10 transition-colors duration-300"
          style={{ backgroundColor: '#111811' }}
        >
          <img
            src={destination.cover_image_url || destination.cover_image || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80'}
            alt={destination.name || 'Pemandangan Wisata Alam'}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center scale-[1.02] brightness-95 saturate-[1.1] transition-all duration-500"
          />
          <div
            className="absolute inset-0 -z-10 transition-colors duration-300"
            style={{
              backgroundImage: `linear-gradient(90deg, ${hexToRgba(primaryColor, 0.90)} 0%, ${hexToRgba(primaryColor, 0.65)} 48%, ${hexToRgba(primaryColor, 0.18)} 100%)`
            }}
          />
          
          <div className={`grid gap-8 px-6 py-10 sm:px-9 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:px-12 lg:py-14 ${template.show_availability === false ? 'lg:grid-cols-1' : ''}`}>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-xl shadow-md">
                <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                {formatCleanLocation(destination)}
              </span>
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-300 drop-shadow-xs">
                {portalEyebrow}
              </p>
              <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                {portalHeading}
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-white/90 drop-shadow-xs">
                {portalCopy}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={openBooking}
                  style={{ backgroundColor: accentColor }}
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-black/40 transition-all hover:brightness-110 active:scale-[0.98] cursor-pointer"
                >
                  <Ticket className="h-4 w-4" />
                  Pesan tiket
                </button>
                <Link
                  to={destination?.slug ? `/riwayat-pesanan?tenant=${destination.slug}` : '/riwayat-pesanan'}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 transition-all shadow-md active:scale-[0.98] no-underline"
                >
                  <History className="h-4 w-4 text-emerald-300" />
                  Riwayat Pesanan
                </Link>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-white/90 drop-shadow-xs">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  QR aman untuk gerbang
                </span>
              </div>
            </div>

            {template.show_availability !== false && (
              <aside
                className="relative isolate overflow-hidden rounded-2xl p-6 sm:p-7 text-white backdrop-blur-2xl backdrop-saturate-150 border transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.45)]"
                style={{
                  background: `linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 100%), ${hexToRgba(primaryColor, 0.32)}`,
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-3.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 drop-shadow-xs">
                    Ketersediaan Hari Ini
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold shadow-xs backdrop-blur-md border border-white/30 bg-white/20 text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sistem Aktif
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-xs font-semibold text-white/85">Kuota terisi</span>
                  <strong className="text-3xl font-black tracking-tight text-white drop-shadow-sm">{used}%</strong>
                </div>
                <div
                  className="mt-2.5 h-3 overflow-hidden rounded-full bg-black/35 backdrop-blur-sm p-0.5 border border-white/20"
                  role="progressbar"
                  aria-valuenow={used}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Persentase kuota terisi hari ini"
                >
                  <div
                    className="h-full rounded-full shadow-[0_0_14px_rgba(52,211,153,0.7)] transition-all duration-500"
                    style={{ width: `${used}%`, backgroundColor: accentColor || '#10b981' }}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/20 bg-black/25 p-3.5 backdrop-blur-md shadow-inner transition-transform hover:scale-[1.02]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/75">Tersisa</span>
                    <strong className="mt-1 block text-2xl font-black text-white drop-shadow-xs">{remaining.toLocaleString('id-ID')} pax</strong>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-black/25 p-3.5 backdrop-blur-md shadow-inner transition-transform hover:scale-[1.02]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-300">Mulai dari</span>
                    <strong className="mt-1 block text-xl font-black text-emerald-300 drop-shadow-xs">{rupiah(startingPrice)}</strong>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="eyebrow !text-emerald-800">Pilih tiket</p>
            <h2 className="mt-2 text-3xl font-black text-[#14281a]">Satu perjalanan, satu tiket resmi</h2>
            <p className="mt-2 text-sm font-medium text-[#3b4836]">
              Pilih tiket yang sesuai, kemudian lengkapi jadwal dan data pengunjung dalam tiga langkah singkat.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(destination.ticket_categories || []).length === 0 ? (
                <div className="col-span-full glass-panel rounded-2xl p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[#14281a]">Pemesanan Tiket Belum Dibuka</h3>
                  <p className="mt-1 text-xs text-[#3b4836] max-w-md mx-auto">
                    Pengelola kawasan {destination.name} saat ini sedang mempersiapkan kategori kuota tiket online.
                  </p>
                </div>
              ) : (
                (destination.ticket_categories || []).map((category) => {
                  const total = Number(category.price || 0) + Number(category.insurance || 0) + Number(category.retribusi || 0);
                  return (
                    <article
                      key={category.id}
                      className="glass-panel rounded-2xl flex min-h-[200px] flex-col justify-between p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 group"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-[#14281a] group-hover:text-emerald-800 transition-colors">{category.name}</h3>
                        <p className="mt-2 text-xs font-medium text-[#4a5845]">
                          Termasuk komponen asuransi dan retribusi resmi.
                        </p>
                      </div>
                      <div className="mt-5 flex items-end justify-between border-t border-black/[0.08] dark:border-white/10 pt-4">
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[#556350]">
                            Total per orang
                          </span>
                          <strong className="mt-1 block text-2xl font-black text-[#14281a]">
                            {rupiah(total)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={openBooking}
                          className="btn-primary btn-sm rounded-xl font-bold shadow-xs hover:shadow-md cursor-pointer"
                        >
                          Pilih <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
          <aside className="glass-panel rounded-2xl h-fit p-6 lg:sticky lg:top-24 shadow-xs">
            <h2 className="text-xl font-bold text-[#14281a]">Kunjungan tertata</h2>
            <ul className="mt-4 space-y-3 text-xs font-medium leading-5 text-[#2f382a]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>Pilih tanggal dan sesi yang sesuai.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>Isi data setiap pemegang tiket.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                <span>Tunjukkan QR aktif di gerbang.</span>
              </li>
            </ul>
          </aside>
        </section>

        {(template.show_facilities !== false || template.show_rules !== false) && (
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            {template.show_facilities !== false && (
              <article className="glass-panel rounded-2xl p-6 shadow-xs">
                <div>
                  <h2 className="text-xl font-bold text-[#14281a]">Fasilitas kawasan</h2>
                </div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {(destination.facilities || []).map((facility) => (
                    <li
                      key={facility}
                      className="flex items-center gap-2 rounded-xl bg-white/70 backdrop-blur-xs px-3.5 py-2.5 text-xs font-bold text-[#14281a] border border-white/80 shadow-2xs"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                      {facility}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {template.show_rules !== false && (
              <article className="glass-panel rounded-2xl p-6 shadow-xs">
                <p className="eyebrow !text-emerald-800">Etika berkunjung</p>
                <h2 className="mt-1.5 text-xl font-bold text-[#14281a]">Jaga kawasan bersama</h2>
                <p className="mt-4 text-sm font-medium leading-relaxed text-[#2f382a] whitespace-pre-line">
                  {destination.rules || 'Dilarang membuang sampah sembarangan dan wajib menjaga kelestarian alam.'}
                </p>
              </article>
            )}
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/85 px-4 py-3 backdrop-blur-xl lg:hidden flex items-center gap-2 shadow-lg">
        <button type="button" onClick={openBooking} className="btn-clay flex-1 justify-center py-3">
          <Ticket className="h-4 w-4" />
          <span>Pesan tiket</span>
        </button>
        <Link
          to={destination?.slug ? `/profil?tenant=${destination.slug}` : '/profil'}
          className="btn-secondary px-3.5 py-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold no-underline whitespace-nowrap"
          title="Halaman Profil & Dompet"
        >
          <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-800 text-[9px] text-white font-bold">
            {user?.avatar || user?.name?.charAt(0)?.toUpperCase() || 'P'}
          </span>
          <span>Profil</span>
        </Link>
      </div>
      <footer className="w-full bg-white/85 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-t-[2.5rem] rounded-b-none border-t border-white/80 border-x-0 border-b-0 shadow-lg px-4 py-7 text-center text-xs text-[#3b4836] space-y-2">
        <div className="flex flex-wrap justify-center items-center gap-3 text-xs font-medium">
          <Link to={destination?.slug ? `/profil?tenant=${destination.slug}` : '/profil'} className="text-emerald-800 hover:underline font-bold flex items-center gap-1">
            Profil & Dompet
          </Link>
          <span>•</span>
          <Link to={destination?.slug ? `/riwayat-pesanan?tenant=${destination.slug}` : '/riwayat-pesanan'} className="hover:underline font-medium text-[#3b4836]">
            Riwayat Pesanan
          </Link>
          <span>•</span>
          <Link to={isManager ? "/admin" : (user ? (destination?.slug ? `/profil?tenant=${destination.slug}` : '/profil') : "/masuk")} className="hover:underline font-semibold text-[#14281a]">
            {isManager ? "Portal Pengelola" : (user ? "Akun Saya" : "Masuk Akun")}
          </Link>
        </div>
        <p className="text-[#4a5845] font-medium">{destination.name} · Didukung oleh Passify</p>
      </footer>
    </div>
  );
}



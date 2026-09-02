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
  Ticket
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { PortalPageSkeleton } from './common/Skeleton';

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
const isPortalColor = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;

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
  const primaryColor = isPortalColor(template.primary_color, ['#394032', '#454F2D'], '#394032');
  const accentColor = template.accent_color === '#797F3E' ? '#50572E' : '#765A31';
  const portalStyle = { '--tenant-primary': primaryColor, '--tenant-accent': accentColor };
  const portalEyebrow = template.eyebrow || 'Tiket resmi kawasan';
  const portalHeading = template.hero_heading || destination.name;
  const portalCopy = template.hero_copy || destination.description;

  const openBooking = () => {
    navigate(`/pesan/${destination.slug || destination.id}`);
  };
  const logout = () => {
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    localStorage.removeItem('passify_current_tenant');
    setUser(null);
  };

  return (
    <div className="tenant-portal min-h-screen bg-[var(--canvas)] text-[var(--ink)]" style={portalStyle}>
      {/* Pengelola Top Bar (Only visible for Tenant Admins) */}
      {isManager && (
        <div className="tenant-primary text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Template Website Resmi: {destination.name}</span>
            <span className="hidden sm:inline text-white/60">({destination.slug}.passify.id)</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="btn-primary text-[11px] py-1 px-3.5 rounded-xl flex items-center gap-1.5 no-underline font-bold shadow-xs"
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Buka Dashboard Admin
            </Link>
            <Link
              to="/"
              onClick={() => localStorage.removeItem('passify_current_tenant')}
              className="text-white/75 hover:text-white text-xs no-underline font-medium"
            >
              Beranda Utama Passify
            </Link>
          </div>
        </div>
      )}

      <header className="nav-bar sticky top-0 z-40 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3 no-underline">
            <span className="tenant-primary grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white">
              <Compass className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-bold text-[var(--forest-deep)] sm:text-xl">
                {destination.name}
              </span>
              <span className="block truncate text-[10px] font-extrabold uppercase tracking-[.13em] text-[var(--ink-soft)]">
                {portalEyebrow}
              </span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {isManager && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[var(--forest-deep)] bg-[var(--leaf-pale)] px-3 py-1.5 rounded-xl no-underline hover:bg-[var(--sand)]"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[var(--forest)]" /> Dashboard Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold text-[var(--ink-soft)] sm:inline">
                  Halo, {user.name?.split(' ')[0] || (isManager ? 'Pengelola' : 'Wisatawan')}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--leaf-pale)] text-xs font-bold text-[var(--forest-deep)]">
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'P'}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title="Keluar"
                  className="grid h-9 w-9 place-items-center rounded-xl text-[var(--ink-soft)] hover:bg-[var(--bark-pale)] hover:text-[var(--bark)] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/masuk" state={{ from: location.pathname }} className="btn-secondary rounded-xl">
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <section className="tenant-primary relative isolate overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
          <img
            src={destination.cover_image_url || destination.cover_image || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80'}
            alt={destination.name || 'Pemandangan Wisata Alam'}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center scale-[1.02]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/85" />
          <div className={`grid gap-8 px-6 py-10 sm:px-9 sm:py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:px-12 lg:py-14 ${template.show_availability === false ? 'lg:grid-cols-1' : ''}`}>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-xs">
                <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                {destination.location || [destination.address, destination.city, destination.province].filter(Boolean).join(', ') || destination.province || destination.city || 'Indonesia'}
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
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={openBooking}
                  className="tenant-accent inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-extrabold shadow-lg shadow-black/30 transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <Ticket className="h-4 w-4" />
                  Pesan tiket
                </button>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-white/90">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  QR aman untuk gerbang
                </span>
              </div>
            </div>

            {template.show_availability !== false && (
              <div className="glass-card-dark rounded-2xl p-5 sm:p-6 text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                    Ketersediaan Hari Ini
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sistem Aktif
                  </span>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-xs font-medium text-white/70">Kuota terisi</span>
                  <strong className="text-3xl font-extrabold tracking-tight text-white">{used}%</strong>
                </div>
                <div
                  className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15"
                  role="progressbar"
                  aria-valuenow={used}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Persentase kuota terisi hari ini"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all duration-500"
                    style={{ width: `${used}%` }}
                  />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.08] p-3.5 backdrop-blur-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">Tersisa</span>
                    <strong className="mt-1 block text-xl font-black text-white">{remaining.toLocaleString('id-ID')}</strong>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.08] p-3.5 backdrop-blur-sm">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">Mulai dari</span>
                    <strong className="mt-1 block text-lg font-black text-[#E8C58C]">{rupiah(startingPrice)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="eyebrow">Pilih tiket</p>
            <h2 className="mt-2 text-3xl font-bold">Satu perjalanan, satu tiket resmi</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Pilih tiket yang sesuai, kemudian lengkapi jadwal dan data pengunjung dalam tiga langkah singkat.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(destination.ticket_categories || []).length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center backdrop-blur-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--leaf-pale)] text-[var(--forest-deep)]">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-[var(--forest-deep)]">Pemesanan Tiket Belum Dibuka</h3>
                  <p className="mt-1 text-xs text-[var(--ink-soft)] max-w-md mx-auto">
                    Pengelola kawasan {destination.name} saat ini sedang mempersiapkan kategori kuota tiket online.
                  </p>
                </div>
              ) : (
                (destination.ticket_categories || []).map((category) => {
                  const total = Number(category.price || 0) + Number(category.insurance || 0) + Number(category.retribusi || 0);
                  return (
                    <article
                      key={category.id}
                      className="card flex min-h-[200px] flex-col justify-between p-5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)] transition-all"
                    >
                      <div>
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        <p className="mt-2 text-xs text-[var(--ink-soft)]">
                          Termasuk komponen asuransi dan retribusi resmi.
                        </p>
                      </div>
                      <div className="mt-5 flex items-end justify-between border-t border-[var(--border)] pt-4">
                        <div>
                          <span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">
                            Total per orang
                          </span>
                          <strong className="mt-1 block text-xl font-extrabold text-[var(--bark)]">
                            {rupiah(total)}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={openBooking}
                          className="btn-primary btn-sm rounded-xl cursor-pointer"
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
          <aside className="surface-muted h-fit p-5 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">Kunjungan tertata</h2>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-[var(--ink-soft)]">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />
                Pilih tanggal dan sesi yang sesuai.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />
                Isi data setiap pemegang tiket.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />
                Tunjukkan QR aktif di gerbang.
              </li>
            </ul>
          </aside>
        </section>

        {(template.show_facilities !== false || template.show_rules !== false) && (
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            {template.show_facilities !== false && (
              <article className="card p-6 border border-[var(--border)] bg-white/80 backdrop-blur-md shadow-xs">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[var(--forest-deep)]">Fasilitas kawasan</h2>
                </div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {(destination.facilities || []).map((facility) => (
                    <li
                      key={facility}
                      className="flex items-center gap-2 rounded-xl bg-[var(--canvas)]/80 px-3 py-2.5 text-xs font-semibold text-[var(--ink-soft)] border border-[var(--border)] shadow-2xs"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />
                      {facility}
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {template.show_rules !== false && (
              <article className="card p-6 border border-white/60 bg-white/70 backdrop-blur-xl shadow-xs transition-all">
                <p className="eyebrow !text-[var(--bark)]">Etika berkunjung</p>
                <h2 className="mt-1.5 text-xl font-bold font-serif text-[var(--forest-deep)]">Jaga kawasan bersama</h2>
                <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)] whitespace-pre-line">
                  {destination.rules || 'Dilarang membuang sampah sembarangan dan wajib menjaga kelestarian alam.'}
                </p>
              </article>
            )}
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[rgba(255,254,250,.94)] px-4 py-3 backdrop-blur-md lg:hidden"><button type="button" onClick={openBooking} className="btn-clay w-full"><Ticket className="h-4 w-4" />Pesan tiket kunjungan</button></div>
      <footer className="border-t border-[var(--border)] bg-[var(--sand)] px-4 py-7 text-center text-xs text-[var(--ink-soft)]">{destination.name} · Didukung oleh Passify</footer>
    </div>
  );
}

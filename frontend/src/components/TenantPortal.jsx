import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  LayoutDashboard,
  Leaf,
  LogIn,
  LogOut,
  MapPin,
  Mountain,
  ShieldCheck,
  Sparkles,
  Ticket
} from 'lucide-react';
import BookingModal from './BookingModal';
import ETicketModal from './ETicketModal';
import { useTenant } from '../contexts/TenantContext';

const rupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function TenantPortal() {
  const { destination } = useTenant();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('passify_user') || 'null'); } catch { return null; }
  });
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  useEffect(() => {
    if (user && location.state?.openBooking) {
      setIsBookingModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state?.openBooking, navigate, user]);

  if (!destination) return null;

  const isManager = user?.role === 'tenant_admin' || user?.role === 'pengelola' || user?.role === 'super_admin';
  const capacity = Number(destination.max_daily_capacity || 0);
  const booked = Number(destination.booked_today || 0);
  const remaining = Math.max(0, capacity - booked);
  const used = capacity ? Math.round((booked / capacity) * 100) : 0;
  const startingPrice = Math.min(...(destination.ticket_categories || []).map((category) => Number(category.price || 0)));

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
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
      {/* Pengelola Top Bar (Only visible for Tenant Admins) */}
      {isManager && (
        <div className="bg-[var(--forest-deep)] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10 shadow-xs">
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
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--forest-deep)] text-white">
              <Compass className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif text-lg font-bold text-[var(--forest-deep)] sm:text-xl">
                {destination.name}
              </span>
              <span className="block truncate text-[10px] font-extrabold uppercase tracking-[.13em] text-[var(--ink-soft)]">
                Tiket resmi kawasan
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
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--forest-deep)] shadow-[var(--shadow-lift)]">
          <img src={destination.cover_image_url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35 saturate-[.65]" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(16,45,32,.98),rgba(16,45,32,.7))]" />
          <div className="grid gap-8 px-6 py-9 sm:px-9 sm:py-11 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:px-12 lg:py-14">
            <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white/90"><MapPin className="h-3.5 w-3.5 text-[var(--leaf)]" />{destination.location || destination.province}</span><p className="eyebrow mt-6 !text-[var(--leaf)]">Rencanakan perjalanan Anda</p><h1 className="mt-3 text-4xl font-bold leading-[.98] text-white sm:text-5xl lg:text-6xl">{destination.name}</h1><p className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-[15px]">{destination.description}</p><div className="mt-7 flex flex-wrap items-center gap-4"><button type="button" onClick={openBooking} className="btn-clay px-5 py-3.5 text-sm"><Ticket className="h-4 w-4" />Pesan tiket<ArrowRight className="h-4 w-4" /></button><span className="flex items-center gap-2 text-xs font-medium text-white/75"><ShieldCheck className="h-4 w-4 text-[var(--leaf)]" />QR aman untuk gerbang</span></div></div>
            <div className="rounded-2xl border border-white/15 bg-[rgba(255,254,250,.96)] p-5 shadow-[0_16px_36px_rgba(0,0,0,.15)]"><p className="eyebrow">Ketersediaan hari ini</p><div className="mt-4 flex items-end justify-between"><span className="text-xs font-bold text-[var(--ink-soft)]">Kuota terisi</span><strong className="text-2xl font-extrabold text-[var(--forest-deep)]">{used}%</strong></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--leaf-pale)]"><div className="h-full rounded-full bg-[var(--leaf)]" style={{ width: `${used}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-3"><span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Tersisa</span><strong className="mt-1 block text-xl font-extrabold text-[var(--forest-deep)]">{remaining.toLocaleString('id-ID')}</strong></div><div className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-3"><span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Mulai dari</span><strong className="mt-1 block text-lg font-extrabold text-[var(--bark)]">{rupiah(startingPrice)}</strong></div></div></div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]"><div><p className="eyebrow">Pilih tiket</p><h2 className="mt-2 text-3xl font-bold">Satu perjalanan, satu tiket resmi</h2><p className="mt-2 text-sm text-[var(--ink-soft)]">Pilih tiket yang sesuai, kemudian lengkapi jadwal dan data pengunjung dalam tiga langkah singkat.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{(destination.ticket_categories || []).map((category) => { const total = Number(category.price || 0) + Number(category.insurance || 0) + Number(category.retribusi || 0); return <article key={category.id} className="card flex min-h-[200px] flex-col justify-between p-5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"><div><h3 className="text-xl font-bold">{category.name}</h3><p className="mt-2 text-xs text-[var(--ink-soft)]">Termasuk komponen resmi sesuai kebijakan kawasan.</p></div><div className="mt-5 flex items-end justify-between border-t border-[var(--border)] pt-4"><div><span className="block text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Total per orang</span><strong className="mt-1 block text-xl font-extrabold text-[var(--bark)]">{rupiah(total)}</strong></div><button type="button" onClick={openBooking} className="btn-primary btn-sm rounded-xl">Pilih<ArrowRight className="h-3.5 w-3.5" /></button></div></article>; })}</div></div>
          <aside className="surface-muted h-fit p-5 lg:sticky lg:top-24"><h2 className="text-xl font-bold">Kunjungan tertata</h2><ul className="mt-4 space-y-3 text-xs leading-5 text-[var(--ink-soft)]"><li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />Pilih tanggal dan sesi yang sesuai.</li><li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />Isi data setiap pemegang tiket.</li><li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />Tunjukkan QR aktif di gerbang.</li></ul></aside>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2"><article className="card p-6"><div><h2 className="text-xl font-bold">Fasilitas kawasan</h2></div><ul className="mt-5 grid gap-2 sm:grid-cols-2">{(destination.facilities || []).map((facility) => <li key={facility} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--canvas)] px-3 py-2.5 text-xs font-semibold text-[var(--ink-soft)]"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--forest)]" />{facility}</li>)}</ul></article><article className="rounded-[var(--radius)] border border-[var(--bark)]/25 bg-[var(--bark-pale)]/55 p-6"><p className="eyebrow !text-[var(--bark)]">Etika berkunjung</p><h2 className="mt-2 text-xl font-bold">Jaga kawasan bersama</h2><p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">{destination.rules}</p></article></section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[rgba(255,254,250,.94)] px-4 py-3 backdrop-blur-md lg:hidden"><button type="button" onClick={openBooking} className="btn-clay w-full"><Ticket className="h-4 w-4" />Pesan tiket kunjungan</button></div>
      <footer className="border-t border-[var(--border)] bg-[var(--sand)] px-4 py-7 text-center text-xs text-[var(--ink-soft)]">{destination.name} · Didukung oleh Passify</footer>

      {isBookingModalOpen && <BookingModal destination={destination} onClose={() => setIsBookingModalOpen(false)} onBookingSuccess={(order) => { setActiveOrder(order); setIsBookingModalOpen(false); setIsTicketModalOpen(true); }} />}
      {isTicketModalOpen && activeOrder && <ETicketModal order={activeOrder} onClose={() => setIsTicketModalOpen(false)} />}
    </div>
  );
}

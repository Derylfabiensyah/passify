import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell, CalendarClock, ChevronLeft, ChevronRight, Landmark, LayoutDashboard,
  MapPin, Menu, Mountain, ScanLine, X,
} from 'lucide-react';
import { ADMIN_USER, TENANT_INFO } from '../../data/adminData';

const menuItems = [
  { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard, path: '/admin' },
  { id: 'destinations', label: 'Destinasi & Tiket', icon: MapPin, path: '/admin/destinations' },
  { id: 'quotas', label: 'Kuota & Sesi', icon: CalendarClock, path: '/admin/quotas' },
  { id: 'gates', label: 'Perangkat Gerbang', icon: ScanLine, path: '/admin/gates' },
  { id: 'finance', label: 'Keuangan & Payout', icon: Landmark, path: '/admin/finance' },
];

const adminThemeStyles = `
  .admin-shell { background: var(--canvas); color: var(--ink); font-family: var(--font-body); }
  .admin-shell h1, .admin-shell h2, .admin-shell h3, .admin-shell h4 { font-family: var(--font-body); letter-spacing: -.03em; }
  .admin-shell .card { border-radius: var(--radius); box-shadow: var(--shadow-soft); }
  .admin-shell .btn-primary { background: var(--forest); border-color: var(--forest); }
  .admin-shell .btn-primary:hover { background: var(--forest-deep); }
  .admin-shell .btn-secondary { color: var(--forest); }
  .admin-shell table th { font-size: .6875rem; letter-spacing: .08em; }
`;

function Brand({ collapsed = false }) {
  return <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--forest-deep)] text-white shadow-[0_6px_14px_rgba(16,45,32,.15)]"><Mountain className="h-4 w-4" /></span>
    {!collapsed && <span className="min-w-0"><span className="block truncate font-serif text-lg font-bold text-[var(--forest-deep)]">Passify</span><span className="block truncate text-[9px] font-extrabold uppercase tracking-[.14em] text-[var(--ink-soft)]">Console pengelola</span></span>}
  </div>;
}

function SidebarContent({ collapsed, location, onNavigate, onToggle }) {
  return <>
    <div className="border-b border-[var(--border)] px-4 py-5"><Brand collapsed={collapsed} /></div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Navigasi pengelola">
      <p className={`mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--ink-muted)] ${collapsed ? 'sr-only' : ''}`}>Operasional</p>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
        const Icon = item.icon;
        return <Link key={item.id} id={`nav-${item.id}`} to={item.path} onClick={onNavigate} title={collapsed ? item.label : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold no-underline transition-colors ${isActive ? 'bg-[var(--forest-deep)] text-white shadow-[0_7px_16px_rgba(16,45,32,.13)]' : 'text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)]'} ${collapsed ? 'justify-center' : ''}`}><Icon className="h-4 w-4 shrink-0" /><span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span></Link>;
      })}
    </nav>
    <div className="border-t border-[var(--border)] p-3">
      {!collapsed && <div className="mb-2 flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--fog)] p-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-xs font-bold text-white">{ADMIN_USER.name.charAt(0)}</span><span className="min-w-0"><span className="block truncate text-xs font-bold text-[var(--forest-deep)]">{ADMIN_USER.name}</span><span className="block truncate text-[10px] text-[var(--ink-soft)]">{TENANT_INFO.name}</span></span></div>}
      {onToggle && <button id="toggle-sidebar-btn" type="button" onClick={onToggle} className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)] md:flex">{collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Tutup menu</span></>}</button>}
    </div>
  </>;
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const currentItem = menuItems.find((item) => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)));

  return (
    <div className="admin-shell min-h-screen">
      <style>{adminThemeStyles}</style>
      <aside className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--border)] bg-[var(--sand)] transition-[width] duration-200 md:flex" style={{ width: collapsed ? 76 : 264 }}><SidebarContent collapsed={collapsed} location={location} onToggle={() => setCollapsed((value) => !value)} /></aside>

      {mobileOpen && <button type="button" aria-label="Tutup menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-[rgba(16,45,32,.48)] md:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[284px] flex-col border-r border-[var(--border)] bg-[var(--sand)] shadow-[var(--shadow-lift)] transition-transform duration-200 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}><div className="absolute right-3 top-3"><button type="button" onClick={() => setMobileOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)]" aria-label="Tutup menu"><X className="h-4 w-4" /></button></div><SidebarContent collapsed={false} location={location} onNavigate={() => setMobileOpen(false)} /></aside>

      <div className="min-h-screen transition-[margin] duration-200" style={{ marginLeft: collapsed ? 76 : 264 }}>
        <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[rgba(255,254,250,.9)] px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setMobileOpen(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--forest)] hover:bg-[var(--leaf-pale)] md:hidden" aria-label="Buka menu"><Menu className="h-4 w-4" /></button><div className="min-w-0"><h1 className="truncate text-lg font-bold text-[var(--forest-deep)] sm:text-xl">{currentItem?.label || 'Ringkasan'}</h1></div></div>
          <div className="flex shrink-0 items-center gap-2"><Link to="/" className="hidden rounded-full border border-[var(--border)] bg-[var(--sand)] px-3 py-2 text-xs font-bold text-[var(--forest)] no-underline transition-colors hover:bg-[var(--leaf-pale)] sm:inline">Lihat portal publik</Link><button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--sand)] text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)]" aria-label="Notifikasi"><Bell className="h-4 w-4" /></button></div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <style>{`@media (max-width: 767px) { .admin-shell > div:nth-of-type(1) { margin-left: 0 !important; } }`}</style>
    </div>
  );
}

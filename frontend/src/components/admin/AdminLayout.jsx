import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, CalendarClock, ChevronDown, ChevronLeft, ChevronRight,
  Landmark, LayoutDashboard, MapPin, Menu, ScanLine,
  X, LogOut, User, Check, Building2, ExternalLink, AlertTriangle, ShieldCheck, Palette
} from 'lucide-react';
import { getAdminUser, getActiveAdminTenant } from '../../api/admin';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';
import ModalWrapper from '../common/ModalWrapper';

const menuItems = [
  { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard, path: '/admin' },
  { id: 'destinations', label: 'Destinasi & Tiket', icon: MapPin, path: '/admin/destinations' },
  { id: 'template', label: 'Portal & Tampilan', icon: Palette, path: '/admin/template' },
  { id: 'quotas', label: 'Kuota & Sesi', icon: CalendarClock, path: '/admin/quotas' },
  { id: 'gates', label: 'Perangkat Gerbang', icon: ScanLine, path: '/admin/gates' },
  { id: 'finance', label: 'Keuangan & Payout', icon: Landmark, path: '/admin/finance' },
];

const adminThemeStyles = `
  .admin-shell { background: transparent; color: var(--ink); font-family: var(--font-body); min-height: 100vh; }
  .admin-shell h1, .admin-shell h2, .admin-shell h3, .admin-shell h4 { font-family: var(--font-body); letter-spacing: -.03em; }
  .admin-shell .btn-primary { background: var(--forest); border-color: var(--forest); }
  .admin-shell .btn-primary:hover { background: var(--forest-deep); }
  .admin-shell .btn-secondary { color: var(--forest); }
  .admin-shell table th { font-size: .6875rem; letter-spacing: .08em; }
  .admin-shell aside a,
  .admin-shell aside a:focus,
  .admin-shell aside a:focus-visible,
  .admin-shell aside button,
  .admin-shell aside button:focus,
  .admin-shell aside button:focus-visible {
    outline: none !important;
    outline-offset: 0 !important;
  }
`;

function Brand({ collapsed = false }) {
  return (
    <Link
      to="/admin"
      className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-85 outline-none focus:outline-none focus-visible:outline-none"
      aria-label="Passify Console"
    >
      <span className="text-2xl font-bold tracking-[-.05em] text-[var(--forest-deep)]">
        {collapsed ? 'p' : 'passify'}
      </span>
    </Link>
  );
}

function SidebarContent({ collapsed, location, onNavigate, onToggle, onLogout }) {
  const adminUser = getAdminUser();
  const activeTenant = getActiveAdminTenant();
  const tenantDisplayName = activeTenant.name || adminUser.tenant_name || 'Curug Citambur';
  const userInitial = (adminUser.name || 'P').charAt(0).toUpperCase();

  return (
    <>
      <div className="border-b border-white/70 px-5 py-5 flex items-center justify-between">
        <Brand collapsed={collapsed} />
      </div>
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5" aria-label="Navigasi pengelola">
        <p className={`mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#4d5c48] ${collapsed ? 'sr-only' : ''}`}>
          Operasional
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              id={`nav-${item.id}`}
              to={item.path}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold no-underline transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
                isActive
                  ? 'bg-[#284430] text-white shadow-[0_6px_20px_rgba(30,55,38,0.22)]'
                  : 'text-[#2a3426] hover:text-[#14281a] hover:bg-emerald-800/10'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#3d4d38]'}`} />
              <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/70 p-3.5">
        {!collapsed && (
          <div className="mb-2.5 flex items-center justify-between gap-2 rounded-xl border border-white/85 bg-white/75 p-2.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#284430] text-xs font-bold text-white shadow-2xs">
                {userInitial}
              </span>
              <div className="min-w-0">
                <span className="block truncate text-xs font-bold text-[#14281a]">{adminUser.name}</span>
                <span className="block truncate text-[10px] font-semibold text-[#4d5c48]">{tenantDisplayName}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Keluar (Logout)"
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shrink-0"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
        {onToggle && (
          <button
            id="toggle-sidebar-btn"
            type="button"
            onClick={onToggle}
            className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#2a3426] hover:bg-emerald-800/10 hover:text-[#14281a] md:flex cursor-pointer transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Tutup menu</span></>}
          </button>
        )}
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { slug: currentSlug } = useTenant();

  const activeTenant = getActiveAdminTenant();
  const activeTenantSlug = activeTenant.slug || currentSlug || 'curug-citambur';

  const currentItem = menuItems.find(
    (item) => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );

  const handleLogout = () => {
    try {
      localStorage.removeItem('passify_token');
      localStorage.removeItem('passify_user');
      localStorage.removeItem('passify_current_tenant');
      setShowLogoutModal(false);
      toast.success('Berhasil keluar dari sesi pengelola.');
      navigate('/masuk');
    } catch (_) {
      toast.error('Gagal keluar.');
    }
  };

  return (
    <div className="admin-shell min-h-screen">
      <style>{adminThemeStyles}</style>

      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/80 bg-white/85 backdrop-blur-2xl transition-[width] duration-200 md:flex shadow-[4px_0_30px_rgba(24,45,28,0.04)]"
        style={{ width: collapsed ? 76 : 264 }}
      >
        <SidebarContent
          collapsed={collapsed}
          location={location}
          onToggle={() => setCollapsed((v) => !v)}
          onLogout={() => setShowLogoutModal(true)}
        />
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[rgba(16,45,32,.48)] backdrop-blur-xs md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[284px] flex-col border-r border-white/80 bg-white/95 backdrop-blur-2xl shadow-2xl transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-[#2a3426] hover:bg-emerald-800/10 cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          collapsed={false}
          location={location}
          onNavigate={() => setMobileOpen(false)}
          onLogout={() => {
            setMobileOpen(false);
            setShowLogoutModal(true);
          }}
        />
      </aside>

      {/* Main Content Area */}
      <div className="min-h-screen transition-[margin] duration-200" style={{ marginLeft: collapsed ? 76 : 264 }}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-3 border-b border-white/80 bg-white/85 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8 shadow-[0_2px_16px_rgba(24,45,28,0.03)]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/80 bg-white/90 text-[#14281a] hover:bg-white md:hidden cursor-pointer shadow-2xs"
              aria-label="Buka menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold text-[#14281a] sm:text-xl font-heading">
                {currentItem?.label || 'Ringkasan'}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* View Public Portal Link */}
            <Link
              to={`/?tenant=${activeTenantSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-gray-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#2a3426] hover:text-[#14281a] hover:bg-white no-underline transition-all hover:shadow-xs shadow-2xs sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
              <span>Portal Publik</span>
            </Link>

            {/* Notification Button */}
            <button
              type="button"
              onClick={() => toast.info('Tidak ada notifikasi baru saat ini.')}
              className="grid h-9 w-9 place-items-center rounded-full border border-gray-200/90 bg-white/90 text-[#2a3426] hover:bg-white hover:text-[#14281a] transition-all shadow-2xs hover:shadow-xs cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Logout Confirmation Modal */}
      <ModalWrapper
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        size="sm"
        title="Konfirmasi Keluar Sesi"
        ariaLabel="Konfirmasi Keluar Sesi Admin"
      >
        <div className="space-y-4 pt-1">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              Apakah Anda yakin ingin keluar dari konsol pengelolaan Passify? Sesi Anda akan dihentikan dan diarahkan ke halaman login.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              id="confirm-logout-btn"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Ya, Keluar</span>
            </button>
          </div>
        </div>
      </ModalWrapper>

      <style>{`@media (max-width: 767px) { .admin-shell > div:nth-of-type(1) { margin-left: 0 !important; } }`}</style>
    </div>
  );
}


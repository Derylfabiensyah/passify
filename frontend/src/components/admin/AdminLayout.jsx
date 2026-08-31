import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, CalendarClock, ChevronDown, ChevronLeft, ChevronRight,
  Landmark, LayoutDashboard, MapPin, Menu, Mountain, ScanLine,
  X, LogOut, User, Check, Building2, ExternalLink, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { getAdminUser } from '../../api/admin';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';
import ModalWrapper from '../ModalWrapper';

const menuItems = [
  { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard, path: '/admin' },
  { id: 'destinations', label: 'Destinasi & Tiket', icon: MapPin, path: '/admin/destinations' },
  { id: 'quotas', label: 'Kuota & Sesi', icon: CalendarClock, path: '/admin/quotas' },
  { id: 'gates', label: 'Perangkat Gerbang', icon: ScanLine, path: '/admin/gates' },
  { id: 'finance', label: 'Keuangan & Payout', icon: Landmark, path: '/admin/finance' },
];

const AVAILABLE_TENANTS = [
  { slug: 'curug-bidadari', name: 'Curug Bidadari Eco Park', location: 'Bogor, Jawa Barat' },
  { slug: 'kawah-ijen', name: 'Kawah Ijen Geopark & Blue Fire', location: 'Banyuwangi, Jawa Timur' },
  { slug: 'baluran', name: 'Taman Nasional Baluran', location: 'Situbondo, Jawa Timur' },
  { slug: 'tangkuban-parahu', name: 'Tangkuban Parahu Geotourism', location: 'Subang, Jawa Barat' },
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
  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--forest-deep)] text-white shadow-[0_6px_14px_rgba(16,45,32,.15)]">
        <Mountain className="h-4 w-4" />
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate font-serif text-lg font-bold text-[var(--forest-deep)]">Passify</span>
          <span className="block truncate text-[9px] font-extrabold uppercase tracking-[.14em] text-[var(--ink-soft)]">
            Console Pengelola
          </span>
        </span>
      )}
    </div>
  );
}

function SidebarContent({ collapsed, location, onNavigate, onToggle, onOpenUserMenu }) {
  const adminUser = getAdminUser();
  const { destination } = useTenant();
  const tenantDisplayName = adminUser.tenant_name || destination?.name || 'Kawasan Konservasi Alam';
  const userInitial = (adminUser.name || 'P').charAt(0).toUpperCase();

  return (
    <>
      <div className="border-b border-[var(--border)] px-4 py-5">
        <Brand collapsed={collapsed} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Navigasi pengelola">
        <p className={`mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.14em] text-[var(--ink-muted)] ${collapsed ? 'sr-only' : ''}`}>
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold no-underline transition-colors ${
                isActive
                  ? 'bg-[var(--forest-deep)] text-white shadow-[0_7px_16px_rgba(16,45,32,.13)]'
                  : 'text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)]'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--border)] p-3">
        {!collapsed && (
          <button
            type="button"
            onClick={onOpenUserMenu}
            className="mb-2 flex w-full items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--fog)] p-2.5 text-left transition-colors hover:bg-[var(--leaf-pale)] cursor-pointer"
            aria-label="Buka profil pengelola"
          >
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-xs font-bold text-white">
              {userInitial}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[var(--forest-deep)]">{adminUser.name}</span>
              <span className="block truncate text-[10px] text-[var(--ink-soft)]">{tenantDisplayName}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--ink-soft)]" />
          </button>
        )}
        {onToggle && (
          <button
            id="toggle-sidebar-btn"
            type="button"
            onClick={onToggle}
            className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)] md:flex cursor-pointer"
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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { slug: currentSlug, destination, refetch } = useTenant();

  const adminUser = getAdminUser();
  const tenantDisplayName = adminUser.tenant_name || destination?.name || 'Kawasan Konservasi Alam';
  const activeTenantSlug = currentSlug || adminUser.tenant_slug || 'curug-bidadari';
  const userInitial = (adminUser.name || 'P').charAt(0).toUpperCase();

  const currentItem = menuItems.find(
    (item) => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    }
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userDropdownOpen]);

  const handleSwitchTenant = (tenant) => {
    try {
      localStorage.setItem('passify_current_tenant', tenant.slug);
      const savedUser = JSON.parse(localStorage.getItem('passify_user') || '{}');
      savedUser.tenant_slug = tenant.slug;
      savedUser.tenant_name = tenant.name;
      localStorage.setItem('passify_user', JSON.stringify(savedUser));

      if (refetch) refetch();
      toast.success(`Beralih ke kawasan: ${tenant.name}`);
      setUserDropdownOpen(false);
    } catch (_) {
      toast.error('Gagal mengganti kawasan');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('passify_token');
      localStorage.removeItem('passify_user');
      localStorage.removeItem('passify_current_tenant');
      setShowLogoutModal(false);
      setUserDropdownOpen(false);
      toast.success('Berhasil keluar dari sesi pengelola.');
      navigate('/masuk');
    } catch (_) {
      navigate('/masuk');
    }
  };

  return (
    <div className="admin-shell min-h-screen">
      <style>{adminThemeStyles}</style>

      {/* Desktop Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--border)] bg-[var(--sand)] transition-[width] duration-200 md:flex"
        style={{ width: collapsed ? 76 : 264 }}
      >
        <SidebarContent
          collapsed={collapsed}
          location={location}
          onToggle={() => setCollapsed((v) => !v)}
          onOpenUserMenu={() => setUserDropdownOpen(true)}
        />
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[rgba(16,45,32,.48)] md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[284px] flex-col border-r border-[var(--border)] bg-[var(--sand)] shadow-[var(--shadow-lift)] transition-transform duration-200 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent
          collapsed={false}
          location={location}
          onNavigate={() => setMobileOpen(false)}
          onOpenUserMenu={() => {
            setMobileOpen(false);
            setUserDropdownOpen(true);
          }}
        />
      </aside>

      {/* Main Content Area */}
      <div className="min-h-screen transition-[margin] duration-200" style={{ marginLeft: collapsed ? 76 : 264 }}>
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 flex min-h-[68px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[rgba(255,254,250,.9)] px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--forest)] hover:bg-[var(--leaf-pale)] md:hidden cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-[var(--forest-deep)] sm:text-xl font-['Outfit']">
                {currentItem?.label || 'Ringkasan'}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {/* View Public Portal Link */}
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--sand)] px-3.5 py-2 text-xs font-bold text-[var(--forest)] no-underline transition-colors hover:bg-[var(--leaf-pale)] sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Portal Publik</span>
            </Link>

            {/* Notification Button */}
            <button
              type="button"
              onClick={() => toast.info('Tidak ada notifikasi baru saat ini.')}
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--sand)] text-[var(--ink-soft)] hover:bg-[var(--leaf-pale)] hover:text-[var(--forest-deep)] transition-colors cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* User Menu Trigger & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="admin-user-menu-btn"
                onClick={() => setUserDropdownOpen((v) => !v)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--sand)] p-1 pr-3 text-left transition-all hover:bg-[var(--leaf-pale)] cursor-pointer"
              >
                <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-xs font-bold text-white">
                  {userInitial}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                </span>
                <span className="hidden text-xs font-bold text-[var(--forest-deep)] sm:inline max-w-[120px] truncate">
                  {adminUser.name}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-[var(--ink-soft)] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-[var(--border)] bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--fog)] border border-[var(--border)] mb-2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--forest)] text-sm font-bold text-white shadow-2xs">
                      {userInitial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="block truncate text-xs font-bold text-[var(--forest-deep)]">{adminUser.name}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <span className="block truncate text-[11px] text-[var(--ink-soft)]">{adminUser.email}</span>
                      <span className="mt-1 inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wide">
                        {adminUser.role === 'super_admin' ? 'Super Admin' : 'Pengelola Kawasan'}
                      </span>
                    </div>
                  </div>

                  {/* Tenant Switcher Section */}
                  <div className="p-2 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-1.5">
                        <Building2 className="h-3 w-3 text-[var(--forest)]" />
                        Ganti Kawasan Konservasi
                      </span>
                    </div>
                    <div className="space-y-1">
                      {AVAILABLE_TENANTS.map((t) => {
                        const isCurrent = t.slug === activeTenantSlug;
                        return (
                          <button
                            key={t.slug}
                            type="button"
                            onClick={() => handleSwitchTenant(t)}
                            className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block truncate text-xs">{t.name}</span>
                              <span className="block text-[10px] text-gray-500 truncate">{t.location}</span>
                            </div>
                            {isCurrent && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="p-1 space-y-0.5 border-b border-gray-100">
                    <Link
                      to="/jelajah"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <span>Jelajah Wisata Alam</span>
                    </Link>
                    <Link
                      to="/riwayat-pesanan"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <CalendarClock className="h-4 w-4 text-gray-500" />
                      <span>Tiket & Reservasi Saya</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="p-1 pt-1.5">
                    <button
                      type="button"
                      id="admin-logout-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, CalendarClock, ScanLine, Landmark,
  ChevronLeft, ChevronRight, Mountain, Bell
} from 'lucide-react';
import { ADMIN_USER, TENANT_INFO } from '../../data/adminData';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'destinations', label: 'Destinasi & Tiket', icon: MapPin, path: '/admin/destinations' },
  { id: 'quotas', label: 'Kuota & Sesi', icon: CalendarClock, path: '/admin/quotas' },
  { id: 'gates', label: 'Device Gate Scanner', icon: ScanLine, path: '/admin/gates' },
  { id: 'finance', label: 'Laporan & Payout', icon: Landmark, path: '/admin/finance' },
];

const adminThemeStyles = `
  .admin-shell {
    --admin-forest: #1f563f;
    --admin-forest-deep: #173f2e;
    --admin-leaf: #7da66d;
    --admin-leaf-pale: #e5efdf;
    --admin-leaf-wash: #f4f8f1;
    --admin-paper: #fffefa;
    --admin-bark: #694934;
    --admin-bark-deep: #4f3425;
    --admin-bark-pale: #f5e9df;
    --admin-ink: #264434;
    --admin-copy: #506452;
    --admin-muted: #788677;
    --admin-border: #d2dfcb;
    --admin-border-strong: #b9cdb1;
    --canvas: var(--admin-leaf-wash);
    --sand: var(--admin-paper);
    --fog: var(--admin-leaf-pale);
    --ink: var(--admin-ink);
    --ink-soft: var(--admin-copy);
    --river: var(--admin-forest);
    --moss: var(--admin-leaf);
    --clay: var(--admin-bark);
    --bg-base: var(--admin-leaf-wash);
    --bg-card: var(--admin-paper);
    --bg-elevated: var(--admin-leaf-wash);
    --bg-input: #f0f6eb;
    --border: var(--admin-border);
    --border-hover: var(--admin-border-strong);
    --text-primary: var(--admin-ink);
    --text-secondary: var(--admin-copy);
    --text-muted: var(--admin-muted);
    --accent: var(--admin-forest);
    --accent-hover: var(--admin-forest-deep);
    --accent-muted: rgba(31, 86, 63, 0.1);
    background: var(--admin-leaf-wash);
    color: var(--admin-ink);
    font-family: 'Plus Jakarta Sans', Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 0.875rem;
    line-height: 1.55;
  }

  .admin-shell h1,
  .admin-shell h2,
  .admin-shell h3,
  .admin-shell h4,
  .admin-shell h5,
  .admin-shell h6 {
    color: var(--admin-bark) !important;
    font-family: 'Outfit', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif !important;
    letter-spacing: -0.025em;
  }

  .admin-shell main h1 {
    font-size: clamp(1.5rem, 2vw, 1.875rem) !important;
    line-height: 1.18;
  }

  .admin-shell h3 {
    line-height: 1.3;
  }

  .admin-shell [class~="text-[10px]"] {
    font-size: 0.6875rem;
    line-height: 1.4;
  }

  .admin-shell [class~="text-[11px]"] {
    font-size: 0.71875rem;
    line-height: 1.45;
  }

  .admin-shell main > .flex.flex-col.gap-6 {
    gap: 1.75rem;
  }

  .admin-shell .card {
    border-radius: 0.875rem;
    box-shadow: 0 10px 28px rgba(31, 86, 63, 0.055);
  }

  .admin-shell .shadow-2xs,
  .admin-shell .shadow-xs {
    box-shadow: 0 4px 14px rgba(31, 86, 63, 0.045);
  }

  .admin-shell [class~="text-gray-900"] { color: var(--admin-ink); }
  .admin-shell [class~="text-gray-700"] { color: var(--admin-copy); }
  .admin-shell [class~="text-gray-600"] { color: #617260; }
  .admin-shell [class~="text-gray-500"] { color: var(--admin-muted); }
  .admin-shell [class~="text-gray-400"] { color: #98a593; }

  .admin-shell [class~="text-emerald-600"],
  .admin-shell [class~="text-emerald-700"],
  .admin-shell [class~="text-emerald-800"],
  .admin-shell [class~="text-emerald-900"] { color: var(--admin-forest); }

  .admin-shell [class~="text-amber-800"],
  .admin-shell [class~="text-red-500"],
  .admin-shell [class~="text-red-600"],
  .admin-shell [class~="text-red-700"],
  .admin-shell [class~="text-red-800"] { color: var(--admin-bark); }

  .admin-shell [class~="bg-gray-900"] { background-color: var(--admin-forest); }
  .admin-shell [class~="bg-gray-200/70"] { background-color: rgba(210, 223, 203, 0.7); }
  .admin-shell [class~="bg-gray-100"] { background-color: var(--admin-leaf-pale); }
  .admin-shell [class~="bg-gray-100/70"] { background-color: rgba(229, 239, 223, 0.7); }
  .admin-shell [class~="bg-gray-100/80"] { background-color: rgba(229, 239, 223, 0.8); }
  .admin-shell [class~="bg-gray-50"] { background-color: var(--admin-leaf-wash); }
  .admin-shell [class~="bg-gray-50/30"] { background-color: rgba(244, 248, 241, 0.82); }
  .admin-shell [class~="bg-gray-50/60"] { background-color: rgba(229, 239, 223, 0.48); }
  .admin-shell [class~="bg-gray-50/70"] { background-color: rgba(229, 239, 223, 0.7); }
  .admin-shell [class~="bg-gray-50/80"] { background-color: rgba(229, 239, 223, 0.8); }
  .admin-shell [class~="bg-white/80"] { background-color: rgba(255, 254, 250, 0.9); }

  .admin-shell [class~="bg-emerald-50"],
  .admin-shell [class~="bg-emerald-50/70"] { background-color: var(--admin-leaf-pale); }
  .admin-shell [class~="bg-emerald-500"],
  .admin-shell [class~="bg-emerald-600"] { background-color: var(--admin-forest); }
  .admin-shell [class~="bg-amber-50"],
  .admin-shell [class~="bg-red-50"],
  .admin-shell [class~="bg-red-50/70"] { background-color: var(--admin-bark-pale); }

  .admin-shell [class~="border-gray-100"] { border-color: #e0eadb; }
  .admin-shell [class~="border-gray-200"],
  .admin-shell [class~="border-gray-200/80"] { border-color: var(--admin-border); }
  .admin-shell [class~="border-gray-300"] { border-color: var(--admin-border-strong); }
  .admin-shell [class~="border-emerald-200"],
  .admin-shell [class~="border-emerald-600"] { border-color: #b7cfac; }
  .admin-shell [class~="border-amber-200"],
  .admin-shell [class~="border-red-200"] { border-color: #dfc3b0; }
  .admin-shell [class~="divide-gray-200"] > :not(:last-child) { border-color: var(--admin-border); }

  .admin-shell [class~="placeholder-gray-400"]::placeholder { color: #98a593; }
  .admin-shell [class~="hover:text-gray-900"]:hover,
  .admin-shell [class~="hover:text-gray-700"]:hover { color: var(--admin-forest-deep); }
  .admin-shell [class~="hover:text-emerald-900"]:hover { color: var(--admin-forest-deep); }
  .admin-shell [class~="hover:bg-gray-50"]:hover,
  .admin-shell [class~="hover:bg-gray-100/70"]:hover { background-color: var(--admin-leaf-pale); }
  .admin-shell [class~="hover:bg-gray-200/70"]:hover { background-color: #dce9d5; }
  .admin-shell [class~="hover:border-gray-300"]:hover { border-color: var(--admin-border-strong); }
  .admin-shell .group:hover [class~="group-hover:text-gray-600"] { color: var(--admin-forest); }
  .admin-shell [class~="focus:border-emerald-600"]:focus { border-color: var(--admin-forest); }
  .admin-shell [class~="focus:bg-white"]:focus { background-color: var(--admin-paper); }

  .admin-shell .status-dot { background: var(--admin-forest); }
  .admin-shell [class~="bg-red-50"] .status-dot,
  .admin-shell [class~="bg-red-50/70"] .status-dot,
  .admin-shell [class~="bg-amber-50"] .status-dot { background: var(--admin-bark); }

  .admin-shell .btn-primary {
    background: var(--admin-forest);
    box-shadow: 0 6px 16px rgba(31, 86, 63, 0.14);
  }

  .admin-shell .btn-primary:hover { background: var(--admin-forest-deep); }
  .admin-shell .btn-secondary { color: var(--admin-bark); }

  .admin-shell .modal-overlay { background: rgba(23, 63, 46, 0.38); }
  .admin-shell ::-webkit-scrollbar-thumb { background: #b9cdb1; }
  .admin-shell ::-webkit-scrollbar-thumb:hover { background: var(--admin-forest); }

  @media (max-width: 640px) {
    .admin-shell main > .flex.flex-col.gap-6 { gap: 1.25rem; }
  }
`;

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="admin-shell flex min-h-screen bg-white text-gray-900">
      <style>{adminThemeStyles}</style>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out bg-white border-r border-gray-100"
        style={{ width: collapsed ? 72 : 250 }}
      >
        {/* Brand Header */}
        <div className={`flex items-center gap-2.5 px-5 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <Mountain className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-gray-900 font-['Outfit'] truncate">Passify Cloud</div>
              <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">White-Label Console</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                id={`nav-${item.id}`}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/70'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Collapse Toggle */}
        <div className="border-t border-gray-100 p-3.5 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/70 border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {ADMIN_USER.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-gray-900 truncate">{ADMIN_USER.name}</div>
                <div className="text-[10px] text-gray-400 truncate">{TENANT_INFO.name}</div>
              </div>
            </div>
          )}
          <button
            id="toggle-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Tutup Menu</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className="flex-1 transition-all duration-300 min-w-0 bg-gray-50/30"
        style={{ marginLeft: collapsed ? 72 : 250 }}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-5 py-4 sm:px-7 lg:px-8 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div>
            <h1 className="text-base font-bold text-gray-900 font-['Outfit']">
              {menuItems.find(m => location.pathname === m.path || (m.path !== '/admin' && location.pathname.startsWith(m.path)))?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-gray-400">
              {TENANT_INFO.name} — Mode Pengelola
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100/80 hover:bg-gray-200/70 px-3.5 py-1.5 rounded-full transition-colors"
            >
              Lihat Portal Publik ↗
            </Link>
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="w-full p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

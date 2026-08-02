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

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
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
        <nav className="flex-1 px-3.5 py-6 space-y-1 overflow-y-auto">
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
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-8 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
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
        <main className="p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

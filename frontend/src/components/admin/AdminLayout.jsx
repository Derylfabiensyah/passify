import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, CalendarClock, ScanLine, Landmark,
  ChevronLeft, ChevronRight, LogOut, Mountain, Settings, Bell
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
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out bg-zinc-950 border-r border-zinc-800"
        style={{ width: collapsed ? 72 : 260 }}
      >
        {/* Brand Header */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-zinc-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Mountain className="w-4 h-4 text-zinc-950" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-bold text-sm text-zinc-100 font-['Outfit'] truncate">Passify</div>
              <div className="text-[10px] text-zinc-500 truncate">Admin Panel</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                id={`nav-${item.id}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Collapse Toggle */}
        <div className="border-t border-zinc-800 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-zinc-900">
              <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-zinc-100 text-xs font-semibold flex-shrink-0">
                {ADMIN_USER.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-zinc-200 truncate">{ADMIN_USER.name}</div>
                <div className="text-[10px] text-zinc-500 truncate">{TENANT_INFO.name}</div>
              </div>
            </div>
          )}
          <button
            id="toggle-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Tutup Sidebar</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className="flex-1 transition-all duration-300 min-w-0"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div>
            <h1 className="text-base font-bold text-zinc-100 font-['Outfit']">
              {menuItems.find(m => location.pathname === m.path || (m.path !== '/admin' && location.pathname.startsWith(m.path)))?.label || 'Dashboard'}
            </h1>
            <p className="text-[11px] text-zinc-500">{TENANT_INFO.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border border-zinc-800">
              <Bell className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Kembali ke Portal</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

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
    <div className="flex min-h-screen bg-[#090d16]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0c1220 0%, #0a0f1a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Brand Header */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/40 flex-shrink-0">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-extrabold text-base text-white tracking-tight font-['Outfit'] truncate">Passify</div>
              <div className="text-[10px] text-slate-500 truncate">Admin Panel</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                id={`nav-${item.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Collapse Toggle */}
        <div className="border-t border-slate-800/60 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {ADMIN_USER.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 truncate">{ADMIN_USER.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{TENANT_INFO.name}</div>
              </div>
            </div>
          )}
          <button
            id="toggle-sidebar-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Tutup Sidebar</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-800/50 bg-[#090d16]/90 backdrop-blur-md">
          <div>
            <h1 className="text-lg font-bold text-white font-['Outfit']">
              {menuItems.find(m => location.pathname === m.path || (m.path !== '/admin' && location.pathname.startsWith(m.path)))?.label || 'Dashboard'}
            </h1>
            <p className="text-[11px] text-slate-500">{TENANT_INFO.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 border border-slate-800 transition-all flex items-center gap-1.5"
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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Edit3,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  Ticket,
  User as UserIcon,
  Wallet,
  X
} from 'lucide-react';
import { formatRupiah } from '../api/client';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import WalletModal from '../components/WalletModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { slug, destination } = useTenant();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('passify_user') || 'null');
    } catch {
      return null;
    }
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('passify_wallet_balance');
    return saved !== null ? Number(saved) : 150000;
  });

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || user?.full_name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '081234567890');
  const [activeTicketsCount, setActiveTicketsCount] = useState(0);

  // Sync wallet balance
  useEffect(() => {
    const syncWallet = () => {
      const saved = localStorage.getItem('passify_wallet_balance');
      if (saved !== null) setWalletBalance(Number(saved));
    };
    window.addEventListener('storage', syncWallet);
    return () => window.removeEventListener('storage', syncWallet);
  }, []);

  // Calculate active tickets
  useEffect(() => {
    try {
      const stored = localStorage.getItem('passify_my_tickets');
      if (stored) {
        const parsed = JSON.parse(stored);
        const userEmail = (user?.email || '').toLowerCase().trim();
        const userId = user?.id;
        const userTickets = parsed.filter((t) => {
          const ticketEmail = (t.userEmail || t.contact?.email || '').toLowerCase().trim();
          return (userEmail && ticketEmail === userEmail) || (userId && t.userId === userId);
        });
        const active = userTickets.filter((t) => (t.status || 'active') === 'active').length;
        setActiveTicketsCount(active);
      }
    } catch (_) {}
  }, [user]);

  const currentTenantSlug =
    searchParams.get('tenant') ||
    slug ||
    destination?.slug ||
    sessionStorage.getItem('passify_last_active_tenant') ||
    localStorage.getItem('passify_last_active_tenant');

  const backUrl = currentTenantSlug ? `/?tenant=${currentTenantSlug}` : '/jelajah';

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong');
      return;
    }

    const updatedUser = {
      ...user,
      name: editName.trim(),
      full_name: editName.trim(),
      phone: editPhone.trim(),
    };

    localStorage.setItem('passify_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Informasi profil berhasil diperbarui!');
  };

  const handleLogout = () => {
    if (currentTenantSlug) {
      sessionStorage.setItem('passify_last_active_tenant', currentTenantSlug);
      localStorage.setItem('passify_last_active_tenant', currentTenantSlug);
    }
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
    toast.info('Anda telah keluar dari akun.');
    navigate(backUrl);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/80 bg-white/85 backdrop-blur-2xl shadow-xs">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
            <Link
              to={backUrl}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#14281a] hover:text-emerald-800 transition-colors no-underline"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
            <span className="text-sm font-extrabold text-[#14281a]">Akun Wisatawan</span>
            <div className="w-16" />
          </div>
        </header>

        {/* Empty / Not logged in State */}
        <main className="mx-auto max-w-md w-full px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="h-20 w-20 rounded-2xl bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-center text-emerald-800 shadow-sm mb-6">
            <UserIcon className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-[#14281a]">Belum Masuk ke Akun</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm">
            Masuk atau buat akun untuk melihat profil, mengakses saldo dompet cashless, dan melihat riwayat tiket wisata Anda.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              to={currentTenantSlug ? `/masuk?tenant=${currentTenantSlug}` : '/masuk'}
              state={{ from: '/profil', tenantSlug: currentTenantSlug }}
              className="btn-primary flex-1 justify-center py-3 text-xs font-bold no-underline"
            >
              Masuk Sekarang
            </Link>
            <Link
              to={currentTenantSlug ? `/daftar?tenant=${currentTenantSlug}` : '/daftar'}
              state={{ from: '/profil', tenantSlug: currentTenantSlug }}
              className="btn-secondary flex-1 justify-center py-3 text-xs font-bold no-underline"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </main>

        <footer className="w-full bg-white/85 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-t-[2.5rem] border-t border-white/80 shadow-lg py-6 text-center text-xs text-[#3b4836]">
          © {new Date().getFullYear()} Passify Cloud OS · Portal Tiket & Dompet Wisata
        </footer>
      </div>
    );
  }

  const isManager = user?.role === 'tenant_admin' || user?.role === 'pengelola' || user?.role === 'super_admin';
  const roleLabel = isManager ? 'Pengelola Kawasan' : 'Wisatawan Terverifikasi';
  const initial = (user.name || user.full_name || 'W').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-transparent text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/80 bg-white/85 backdrop-blur-2xl shadow-xs">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            to={backUrl}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#14281a] hover:text-emerald-800 transition-colors no-underline"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Link>
          <span className="text-sm font-extrabold text-[#14281a]">Halaman Profil</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="Keluar dari akun"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl w-full px-4 py-8 sm:px-6 flex-1 space-y-6">
        {/* User Identity Card */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <span className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-2xl bg-emerald-800 text-2xl sm:text-3xl font-black text-white shadow-md">
                  {initial}
                </span>
                <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white border-2 border-white shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#14281a] tracking-tight">
                    {user.name || user.full_name || 'Wisatawan Passify'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 text-[11px] font-extrabold border border-emerald-200/80">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    {roleLabel}
                  </span>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    {user.email || 'user@example.com'}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281a] bg-white hover:bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer self-stretch sm:self-auto justify-center"
            >
              {isEditing ? (
                <>
                  <X className="h-3.5 w-3.5 text-gray-500" /> Batal Edit
                </>
              ) : (
                <>
                  <Edit3 className="h-3.5 w-3.5 text-emerald-700" /> Ubah Profil
                </>
              )}
            </button>
          </div>

          {/* Edit Form Dropdown */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-gray-200/80 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#14281a] focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nomor Telepon</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#14281a] focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  placeholder="0812xxxxxxxx"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> Simpan Perubahan
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Passify Cashless Wallet Card */}
        <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#102d20] via-[#143a29] to-[#0d2218] p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute right-0 top-0 -z-10 translate-x-12 -translate-y-8 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
                <Wallet className="h-3.5 w-3.5" />
                Dompet Digital Cashless & NFC
              </div>
              <div>
                <span className="block text-xs font-medium text-emerald-100/75">Saldo Tersedia</span>
                <strong className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 block">
                  {formatRupiah(walletBalance)}
                </strong>
              </div>
              <p className="text-xs text-white/80 max-w-lg leading-relaxed pt-1">
                Dapat digunakan untuk tap gerbang masuk wisata serta transaksi merchant F&B / suvenir di kawasan secara instan tanpa sinyal.
              </p>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowWalletModal(true)}
                className="btn-clay py-3 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> Kelola Saldo / Top Up
              </button>
            </div>
          </div>
        </section>

        {/* Riwayat Pemesanan & E-Tiket */}
        <section>
          <Link
            to={currentTenantSlug ? `/riwayat-pesanan?tenant=${currentTenantSlug}` : '/riwayat-pesanan'}
            className="glass-panel p-6 sm:p-7 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 no-underline group block"
          >
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs group-hover:scale-105 transition-transform">
                <Ticket className="h-7 w-7" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-[#14281a] group-hover:text-emerald-800 transition-colors">
                    Riwayat Pemesanan & E-Tiket
                  </h2>
                  {activeTicketsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      {activeTicketsCount} Tiket Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium max-w-xl">
                  Lihat daftar e-tiket aktif, barcode QR masuk gerbang otomatis (TOTP), dan unduh bukti invoice PDF resmi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200/60 w-full sm:w-auto justify-between sm:justify-start">
              <span>Buka Tiket Saya</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>
      </main>

      {/* Cashless Wallet Modal */}
      {showWalletModal && (
        <WalletModal
          walletBalance={walletBalance}
          onTopUp={(delta) => {
            const next = Math.max(0, walletBalance + delta);
            setWalletBalance(next);
            try {
              localStorage.setItem('passify_wallet_balance', String(next));
              window.dispatchEvent(new Event('storage'));
            } catch (_) {}
          }}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      {/* Grounded Card Footer */}
      <footer className="mt-12 w-full bg-white/85 backdrop-blur-2xl rounded-t-[2rem] sm:rounded-t-[2.5rem] rounded-b-none border-t border-white/80 border-x-0 border-b-0 shadow-lg py-7 text-center text-xs text-[#3b4836]">
        © {new Date().getFullYear()} Passify Cloud OS · Platform Reservasi & E-Ticketing Wisata Alam
      </footer>
    </div>
  );
}

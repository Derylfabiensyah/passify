import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileText,
  History,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Users
} from 'lucide-react';
import ETicketModal from '../components/ETicketModal';

const DEFAULT_SAMPLE_TICKETS = [
  {
    orderNumber: 'TWA-20260828-8921',
    ticketId: 'tkt-curug-001',
    ticketCode: 'TWA-QR-89210',
    destinationName: 'Curug Bidadari Eco Park',
    tenantName: 'PT Wisata Alam Mandiri',
    location: 'Sentul Paradise Park, Bogor, Jawa Barat',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=800&q=80',
    visitDate: new Date().toISOString().split('T')[0],
    timeSlotLabel: 'Sesi Pagi (07:00 - 11:30)',
    totalQty: 2,
    grandTotal: 77500,
    paymentMethod: 'QRIS',
    status: 'active', // 'active' | 'used' | 'expired'
    visitors: [
      { name: 'Budi Santoso', nik: '3201123456780001' },
      { name: 'Siti Aminah', nik: '3201123456780002' },
    ],
    visitorName: 'Budi Santoso',
    createdAt: new Date().toISOString(),
  },
  {
    orderNumber: 'TWA-20260815-4102',
    ticketId: 'tkt-kawah-002',
    ticketCode: 'TWA-QR-41020',
    destinationName: 'Kawah Putih Ciwidey',
    tenantName: 'Perum Perhutani Unit III',
    location: 'Ciwidey, Bandung, Jawa Barat',
    image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    visitDate: '2026-08-15',
    timeSlotLabel: 'Sesi Pagi (07:00 - 12:00)',
    totalQty: 1,
    grandTotal: 47500,
    paymentMethod: 'VA BCA',
    status: 'used',
    visitors: [{ name: 'Budi Santoso', nik: '3201123456780001' }],
    visitorName: 'Budi Santoso',
    createdAt: '2026-08-14T10:00:00Z',
  },
];

function formatRupiah(num) {
  return `Rp ${Number(num || 0).toLocaleString('id-ID')}`;
}

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'used' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketForQR, setSelectedTicketForQR] = useState(null);

  // User auth state
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('passify_user') || 'null');
    } catch {
      return null;
    }
  });

  // Load bookings from LocalStorage or default sample
  useEffect(() => {
    try {
      const stored = localStorage.getItem('passify_my_tickets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with default sample so user always has rich interactive data
          const merged = [...parsed];
          DEFAULT_SAMPLE_TICKETS.forEach((sample) => {
            if (!merged.some((m) => m.orderNumber === sample.orderNumber)) {
              merged.push(sample);
            }
          });
          setTickets(merged);
          return;
        }
      }
      setTickets(DEFAULT_SAMPLE_TICKETS);
      localStorage.setItem('passify_my_tickets', JSON.stringify(DEFAULT_SAMPLE_TICKETS));
    } catch (_) {
      setTickets(DEFAULT_SAMPLE_TICKETS);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
  };

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    // Status filter
    const status = t.status || 'active';
    if (filterTab === 'active' && status !== 'active') return false;
    if (filterTab === 'used' && status !== 'used') return false;
    if (filterTab === 'expired' && status !== 'expired') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.destinationName?.toLowerCase().includes(q);
      const matchOrder = t.orderNumber?.toLowerCase().includes(q);
      const matchVisitor = t.visitorName?.toLowerCase().includes(q);
      return matchName || matchOrder || matchVisitor;
    }
    return true;
  });

  const activeCount = tickets.filter((t) => (t.status || 'active') === 'active').length;
  const usedCount = tickets.filter((t) => t.status === 'used').length;
  const expiredCount = tickets.filter((t) => t.status === 'expired').length;

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--leaf)] selection:text-[var(--forest-deep)]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-2xl font-bold tracking-[-.05em] text-[var(--forest-deep)] no-underline">
            passify
          </Link>

          <nav className="flex items-center gap-4 text-xs font-bold">
            <Link to="/jelajah" className="text-[var(--ink-soft)] hover:text-[var(--forest-deep)] transition-colors">
              Jelajahi Wisata
            </Link>
            <Link
              to="/riwayat-pesanan"
              className="text-[var(--forest-deep)] font-extrabold bg-[var(--leaf-pale)] px-3 py-1.5 rounded-full"
            >
              Tiket Saya
            </Link>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <span className="hidden sm:inline text-xs text-[var(--ink-soft)] font-medium">
                  {user.name || user.full_name || 'Wisatawan'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar"
                  className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/masuk" className="btn-secondary px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <LogIn className="h-3.5 w-3.5" /> Masuk
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 w-full flex-1 space-y-8">
        {/* Page Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200/60">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[var(--leaf-deep)] mb-1">
              <History className="h-3.5 w-3.5 text-[var(--forest)]" />
              <span>Portal E-Ticket Wisatawan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--forest-deep)]">
              Riwayat Pemesanan & Tiket Saya
            </h1>
            <p className="text-xs text-[var(--ink-soft)] mt-1 max-w-xl">
              Buka E-Ticket Dynamic QR 10 Menit saat tiba di gerbang, atau cetak bukti invoice reservasi resmi Anda.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-soft)]" />
            <input
              type="text"
              placeholder="Cari nama wisata atau nomor order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="field-control pl-9 text-xs font-medium"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Semua Tiket', count: tickets.length },
            { id: 'active', label: 'Tiket Aktif', count: activeCount },
            { id: 'used', label: 'Sudah Digunakan', count: usedCount },
            { id: 'expired', label: 'Kedaluwarsa', count: expiredCount },
          ].map((tab) => {
            const isSelected = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[var(--forest-deep)] text-white shadow-xs'
                    : 'bg-white hover:bg-[var(--fog)] text-[var(--ink-soft)]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm space-y-4 max-w-md mx-auto my-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--leaf-pale)] text-[var(--forest)]">
              <Ticket className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--forest-deep)]">Belum Ada Tiket yang Cocok</h3>
              <p className="text-xs text-[var(--ink-soft)]">
                {searchQuery
                  ? 'Tidak ada tiket dengan kata kunci pencarian tersebut.'
                  : 'Anda belum memesan tiket wisata alam. Yuk jelajahi berbagai destinasi alam menarik!'}
              </p>
            </div>
            <Link
              to="/jelajah"
              className="inline-flex items-center justify-center gap-2 btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold no-underline"
            >
              Jelajahi Destinasi Wisata <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket, index) => {
              const status = ticket.status || 'active';
              const isActive = status === 'active';
              const isUsed = status === 'used';

              return (
                <div
                  key={ticket.orderNumber || index}
                  className="rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                >
                  {/* Card Header with Image */}
                  <div>
                    <div className="relative h-36 w-full bg-[var(--forest-deep)] overflow-hidden">
                      {ticket.image && (
                        <img
                          src={ticket.image}
                          alt={ticket.destinationName}
                          className="h-full w-full object-cover opacity-60"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute top-3.5 left-3.5">
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-3 py-1 text-[10px] font-extrabold tracking-wide uppercase shadow-xs">
                            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                            Tiket Siap Digunakan
                          </span>
                        )}
                        {isUsed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white px-3 py-1 text-[10px] font-extrabold tracking-wide uppercase">
                            <CheckCircle2 className="h-3 w-3" /> Selesai Dipindai
                          </span>
                        )}
                        {!isActive && !isUsed && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-500 text-white px-3 py-1 text-[10px] font-extrabold tracking-wide uppercase">
                            Kedaluwarsa
                          </span>
                        )}
                      </div>

                      {/* Order Code */}
                      <div className="absolute top-3.5 right-3.5 font-mono text-[11px] font-bold text-white bg-black/40 px-2.5 py-1 rounded-xl backdrop-blur-xs">
                        #{ticket.orderNumber}
                      </div>

                      {/* Destination Title */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                        <p className="text-[10px] uppercase font-bold text-[var(--leaf)] tracking-wider">
                          {ticket.tenantName || 'Wisata Alam Mandiri'}
                        </p>
                        <h3 className="text-lg font-bold leading-tight">{ticket.destinationName}</h3>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-[var(--forest)]" /> Tanggal
                          </span>
                          <p className="font-bold text-[var(--forest-deep)]">{ticket.visitDate}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[var(--forest)]" /> Sesi Waktu
                          </span>
                          <p className="font-bold text-[var(--forest-deep)]">{ticket.timeSlotLabel}</p>
                        </div>
                      </div>

                      {/* Visitors List */}
                      <div className="rounded-2xl bg-[var(--fog)] p-3.5 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)] flex items-center gap-1">
                            <Users className="h-3 w-3" /> {ticket.totalQty || ticket.visitors?.length || 1} Pengunjung Terdaftar
                          </span>
                          <span className="text-[10px] font-bold text-[var(--bark)]">Asuransi Jasa Raharja Aktif</span>
                        </div>

                        <div className="space-y-1">
                          {(ticket.visitors || [{ name: ticket.visitorName || 'Pengunjung' }]).map((v, vIdx) => (
                            <div key={vIdx} className="flex justify-between text-[11px] text-[var(--ink)]">
                              <span>• {v.name}</span>
                              {v.nik && <span className="font-mono text-gray-500 text-[10px]">NIK: {v.nik}</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Tag */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                        <span className="text-[var(--ink-soft)]">Total Tagihan ({ticket.paymentMethod || 'LUNAS'})</span>
                        <strong className="text-sm font-extrabold text-[var(--bark)]">
                          {formatRupiah(ticket.grandTotal)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 sm:p-6 pt-0 space-y-2">
                    {/* Primary Button: Open Dynamic QR E-Ticket */}
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => setSelectedTicketForQR(ticket)}
                        className="w-full btn-primary py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-extrabold shadow-md"
                      >
                        <QrCode className="h-4 w-4" /> Buka E-Ticket (Live Dynamic QR 10 Menit)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedTicketForQR(ticket)}
                        className="w-full btn-secondary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
                      >
                        <FileText className="h-4 w-4" /> Lihat Detail Tiket
                      </button>
                    )}

                    {/* Secondary Action */}
                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh Dokumen Invoice & Bukti Reservasi Resmi #${ticket.orderNumber}...`)}
                      className="w-full text-center text-[11px] font-bold text-[var(--ink-soft)] hover:text-[var(--forest)] py-1 flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh Invoice / Bukti Reservasi (PDF)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Dynamic 10-Minute TOTP QR Modal */}
      {selectedTicketForQR && (
        <ETicketModal order={selectedTicketForQR} onClose={() => setSelectedTicketForQR(null)} />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-[var(--ink-soft)]">
        © {new Date().getFullYear()} Passify Cloud OS · Platform Reservasi & E-Ticketing Wisata Alam
      </footer>
    </div>
  );
}

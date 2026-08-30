import React, { useMemo } from 'react';
import {
  TrendingUp,
  Ticket,
  Users,
  DollarSign,
  Wallet,
  Clock,
  Activity,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

import { useApiClient } from '../../api/client';
import AdminStatCard from '../../components/admin/AdminStatCard';
import DataTable from '../../components/admin/DataTable';
import {
  DASHBOARD_STATS,
  HOURLY_VISITORS,
  REVENUE_WEEKLY,
  TICKET_CATEGORY_SALES,
  RECENT_TRANSACTIONS,
  GATE_SCAN_STATS
} from '../../data/adminData';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardOverview() {
  const apiClient = useApiClient(); // API client with automatic tenant header injection
  // TODO: Replace static DASHBOARD_STATS with: const stats = await apiClient.get('/api/admin/stats');
  
  const stats = DASHBOARD_STATS;
  const revGrowth = Math.round(
    ((stats.today.revenue - stats.yesterday.revenue) / stats.yesterday.revenue) * 100
  );
  const ticketGrowth = Math.round(
    ((stats.today.tickets_sold - stats.yesterday.tickets_sold) /
      stats.yesterday.tickets_sold) *
      100
  );
  const quotaUsedPct = Math.round(
    ((stats.today.total_capacity - stats.today.remaining_quota) /
      stats.today.total_capacity) *
      100
  );

  // ─── Chart.js Configuration: Hourly Visitors ──────────────────
  const hourlyChartData = {
    labels: HOURLY_VISITORS.map((h) => h.hour),
    datasets: [
      {
        label: 'Masuk (Entered)',
        data: HOURLY_VISITORS.map((h) => h.entered),
        backgroundColor: '#1e4b35',
        hoverBackgroundColor: '#3c7152',
        borderRadius: 4,
        barPercentage: 0.7
      },
      {
        label: 'Keluar (Exited)',
        data: HOURLY_VISITORS.map((h) => h.exited),
        backgroundColor: '#8a5638',
        hoverBackgroundColor: '#71452f',
        borderRadius: 4,
        barPercentage: 0.7
      }
    ]
  };

  const hourlyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#526b5a',
          font: { size: 11, family: 'Outfit' },
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#fffefa',
        titleColor: '#102d20',
        bodyColor: '#526b5a',
        borderColor: '#d6e2cf',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#526b5a', font: { size: 10 } }
      },
      y: {
        grid: { color: '#e8f1dc' },
        ticks: {
          color: '#526b5a',
          font: { size: 10 },
          callback: (value) => `${value} pax`
        }
      }
    }
  };

  // ─── Chart.js Configuration: Weekly Revenue ───────────────────
  const revenueChartData = {
    labels: REVENUE_WEEKLY.map((d) => d.day),
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: REVENUE_WEEKLY.map((d) => d.revenue),
        backgroundColor: '#1e4b35',
        hoverBackgroundColor: '#3c7152',
        borderRadius: 6
      }
    ]
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fffefa',
        titleColor: '#102d20',
        bodyColor: '#526b5a',
        borderColor: '#d6e2cf',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            return `Rp ${Number(context.raw).toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#526b5a', font: { size: 10 } }
      },
      y: {
        grid: { color: '#e8f1dc' },
        ticks: {
          color: '#526b5a',
          font: { size: 10 },
          callback: (value) => `Rp ${(value / 1000000).toFixed(0)}jt`
        }
      }
    }
  };

  // ─── TanStack React Table: Recent Transactions Columns ─────────
  const transactionColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID Transaksi',
        cell: (info) => (
          <span className="font-mono font-bold text-emerald-700">
            {info.getValue()}
          </span>
        )
      },
      {
        id: 'visitor',
        accessorFn: (row) => row.visitor || row.visitor_name,
        header: 'Wisatawan / Pemesan',
        cell: (info) => (
          <div>
            <div className="font-semibold text-gray-900">{info.getValue()}</div>
            <div className="text-[10px] text-gray-500">
              {info.row.original.category} {info.row.original.qty ? `(${info.row.original.qty} pax)` : ''}
            </div>
          </div>
        )
      },
      {
        accessorKey: 'amount',
        header: 'Nominal',
        cell: (info) => (
          <span className="font-bold text-gray-900">
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'time',
        header: 'Waktu Transaksi',
        cell: (info) => (
          <span className="text-gray-500 text-xs">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const rawStatus = (info.getValue() || '').toLowerCase();
          const cfg =
            rawStatus === 'paid' || rawStatus === 'success' || rawStatus === 'settled' || rawStatus === 'completed'
              ? {
                  label: 'Berhasil',
                  cls: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }
              : rawStatus === 'pending' || rawStatus === 'process' || rawStatus === 'waiting'
              ? {
                  label: 'Proses',
                  cls: 'bg-amber-50 text-amber-800 border-amber-200'
                }
              : rawStatus === 'refunded'
              ? {
                  label: 'Refund',
                  cls: 'bg-purple-50 text-purple-800 border-purple-200'
                }
              : {
                  label: 'Gagal',
                  cls: 'bg-red-50 text-red-800 border-red-200'
                };

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${cfg.cls}`}
            >
              <span className="status-dot" />
              <span>{cfg.label}</span>
            </span>
          );
        }
      }
    ],
    []
  );

  // ─── TanStack React Table: Gate Scans Columns ──────────────────
  const gateColumns = useMemo(
    () => [
      {
        accessorKey: 'gate_name',
        header: 'Gerbang Akses',
        cell: (info) => (
          <span className="font-bold text-gray-900">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'total_scanned',
        header: 'Total Pindai (Scan)',
        cell: (info) => (
          <span className="font-semibold text-gray-900">
            {info.getValue().toLocaleString('id-ID')} pax
          </span>
        )
      },
      {
        accessorKey: 'last_scan',
        header: 'Aktivitas Terakhir',
        cell: (info) => (
          <span className="text-gray-500 text-xs">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status Terminal',
        cell: (info) => {
          const st = (info.getValue() || '').toLowerCase();
          const isOnline = st === 'online';
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <span className="status-dot" />
              <span>{st.toUpperCase()}</span>
            </span>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="text-xs text-emerald-700 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Cloud Engine • White-Label SaaS Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit']">
            Dasbor Analitik Kawasan Tenant
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 bg-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sinkronisasi Live Tiap 60s</span>
          </span>
        </div>
      </div>

      {/* Top Stats Grid (Minimalist KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={DollarSign}
          label="Pendapatan Hari Ini"
          value={`Rp ${(stats.today.revenue / 1000000).toFixed(1)}jt`}
          subValue={`Kemarin: Rp ${(stats.yesterday.revenue / 1000000).toFixed(1)}jt`}
          trend={revGrowth}
          badgeText="FINANCE"
        />
        <AdminStatCard
          icon={Ticket}
          label="Tiket Terjual Hari Ini"
          value={stats.today.tickets_sold.toLocaleString('id-ID')}
          subValue={`Kemarin: ${stats.yesterday.tickets_sold} tiket`}
          trend={ticketGrowth}
          badgeText="SALES"
        />
        <AdminStatCard
          icon={Users}
          label="Pengunjung Di Dalam Kawasan"
          value={(stats.today.visitors_entered || 289).toLocaleString('id-ID')}
          subValue={`Kapasitas Maks: ${(stats.today.total_capacity || 2752).toLocaleString('id-ID')}`}
          progress={quotaUsedPct}
          badgeText="CROWD"
        />
        <AdminStatCard
          icon={Wallet}
          label="Transaksi Cashless (NFC/QR)"
          value={`Rp ${((stats.today.wallet_topups || 4250000) / 1000000).toFixed(1)}jt`}
          subValue="45 transaksi merchant"
          badgeText="TENANT"
        />
      </div>

      {/* Main Chart Section: Hourly Visitors Traffic (Chart.js) */}
      <div className="card p-5 sm:p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-600" />
              <span>Arus Wisatawan Hari Ini (Per Jam)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Powered by Chart.js — Pemantauan pintu masuk & keluar real-time
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <Bar data={hourlyChartData} options={hourlyChartOptions} />
        </div>
      </div>

      {/* Revenue Weekly (Chart.js) + Ticket Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Revenue Chart.js */}
        <div className="card p-5 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Outfit']">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Pendapatan 7 Hari Terakhir</span>
              </h3>
              <p className="text-xs text-gray-500">
                Total Bulan Ini: Rp {(stats.this_month.revenue / 1000000).toFixed(0)}jt
              </p>
            </div>
          </div>

          <div className="h-48 w-full">
            <Bar data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Ticket Category Breakdown Card */}
        <div className="card p-5 bg-white rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Outfit']">
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>Penjualan Per Kategori Tiket</span>
              </h3>
              <span className="text-xs text-gray-500">Persentase & Kuota</span>
            </div>

            <div className="space-y-4">
              {TICKET_CATEGORY_SALES.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700">{cat.name}</span>
                    <span className="text-emerald-700 font-bold">
                      {cat.sold.toLocaleString('id-ID')} tiket ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Total Kategori Terdaftar: 4 Kategori</span>
            <span className="text-emerald-700 font-bold">100% Validasi Aktif</span>
          </div>
        </div>
      </div>

      {/* TanStack React Table: Recent Transactions */}
      <DataTable
        data={RECENT_TRANSACTIONS}
        columns={transactionColumns}
        title="Riwayat Transaksi & Pembelian Terbaru"
        subtitle="Dukungan sorting, filtering, & pagination oleh TanStack React Table v8"
        defaultPageSize={5}
        searchPlaceholder="Cari wisatawan, ID transaksi, atau status..."
      />

      {/* TanStack React Table: Gate Scan Stats */}
      <DataTable
        data={GATE_SCAN_STATS}
        columns={gateColumns}
        title="Performa & Terminal Pemindai Gerbang (Gates)"
        subtitle="Status pemindai e-Ticket & gelang NFC secara waktu nyata"
        defaultPageSize={5}
        searchPlaceholder="Cari nama gerbang atau status..."
      />

      {/* System Health / Alerts Footer Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 bg-white rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 shadow-2xs flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">
              Sistem Keamanan & Enkripsi TOTP Normal
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Seluruh gerbang e-Ticket Kawasan Wisata terhubung dengan enkripsi HMAC SHA-256. Sinkronisasi offline-first bekerja optimal.
            </p>
          </div>
        </div>

        <div className="card p-4 bg-white rounded-2xl flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 shadow-2xs flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">
              Sinkronisasi Merchant NFC & QR Aktif
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Seluruh booth tenant F&B & merchandise di posko pengawasan melaporkan latensi transaksi di bawah 250 milidetik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

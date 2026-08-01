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
        backgroundColor: '#10b981', // emerald-500
        hoverBackgroundColor: '#34d399',
        borderRadius: 4,
        barPercentage: 0.7
      },
      {
        label: 'Keluar (Exited)',
        data: HOURLY_VISITORS.map((h) => h.exited),
        backgroundColor: '#3f3f46', // zinc-700
        hoverBackgroundColor: '#52525b',
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
          color: '#a1a1aa', // zinc-400
          font: { size: 11, family: 'Outfit' },
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#18181b', // zinc-900
        titleColor: '#f4f4f5',
        bodyColor: '#d4d4d8',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#71717a', font: { size: 10 } }
      },
      y: {
        grid: { color: '#27272a' },
        ticks: { color: '#71717a', font: { size: 10 } }
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
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#34d399',
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
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#d4d4d8',
        borderColor: '#27272a',
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
        ticks: { color: '#71717a', font: { size: 10 } }
      },
      y: {
        grid: { color: '#27272a' },
        ticks: {
          color: '#71717a',
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
          <span className="font-mono font-bold text-emerald-400">
            {info.getValue()}
          </span>
        )
      },
      {
        accessorKey: 'visitor_name',
        header: 'Wisatawan / Pemesan',
        cell: (info) => (
          <div>
            <div className="font-semibold text-zinc-200">{info.getValue()}</div>
            <div className="text-[10px] text-zinc-500">
              {info.row.original.category}
            </div>
          </div>
        )
      },
      {
        accessorKey: 'amount',
        header: 'Nominal',
        cell: (info) => (
          <span className="font-bold text-zinc-200">
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'time',
        header: 'Waktu Transaksi',
        cell: (info) => (
          <span className="text-zinc-400 text-xs">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                status === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span className="status-dot" />
              <span>
                {status === 'success'
                  ? 'Berhasil'
                  : status === 'pending'
                  ? 'Proses'
                  : 'Gagal'}
              </span>
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
          <span className="font-bold text-zinc-200">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'total_scanned',
        header: 'Total Pindai (Scan)',
        cell: (info) => (
          <span className="font-semibold text-zinc-200">
            {info.getValue().toLocaleString('id-ID')} pax
          </span>
        )
      },
      {
        accessorKey: 'last_scan',
        header: 'Aktivitas Terakhir',
        cell: (info) => (
          <span className="text-zinc-400 text-xs">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status Terminal',
        cell: (info) => {
          const st = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                st === 'online'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="text-xs text-emerald-500 uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Admin Control Tower • Tremor UI & Chart.js Powered</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 font-['Outfit']">
            Dasbor Analitik Real-Time
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sinkronisasi Otomatis Tiap 60s</span>
          </span>
        </div>
      </div>

      {/* Top Stats Grid (Tremor UI-inspired KPI Cards) */}
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
          value={stats.today.active_visitors.toLocaleString('id-ID')}
          subValue={`Kapasitas Maks: ${stats.today.total_capacity.toLocaleString('id-ID')}`}
          progress={quotaUsedPct}
          badgeText="CROWD"
        />
        <AdminStatCard
          icon={Wallet}
          label="Transaksi Cashless (NFC/QR)"
          value={`Rp ${(stats.today.cashless_volume / 1000000).toFixed(1)}jt`}
          subValue={`${stats.today.cashless_tx_count} transaksi merchant`}
          badgeText="VENUE"
        />
      </div>

      {/* Main Chart Section: Hourly Visitors Traffic (Chart.js) */}
      <div className="card p-5 sm:p-6 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-500" />
              <span>Arus Wisatawan Hari Ini (Per Jam)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Powered by Chart.js — Pemantauan pintu masuk & keluar real-time
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Gate Telemetry</span>
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <Bar data={hourlyChartData} options={hourlyChartOptions} />
        </div>
      </div>

      {/* Revenue Weekly (Chart.js) + Ticket Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Revenue Chart.js */}
        <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-['Outfit']">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Pendapatan 7 Hari Terakhir</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Total Bulan Ini: Rp {(stats.this_month.revenue / 1000000).toFixed(0)}jt
              </p>
            </div>
          </div>

          <div className="h-48 w-full">
            <Bar data={revenueChartData} options={revenueChartOptions} />
          </div>
        </div>

        {/* Ticket Category Breakdown Card */}
        <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 font-['Outfit']">
                <Ticket className="w-4 h-4 text-emerald-500" />
                <span>Penjualan Per Kategori Tiket</span>
              </h3>
              <span className="text-xs text-zinc-500">Persentase & Kuota</span>
            </div>

            <div className="space-y-4">
              {TICKET_CATEGORY_SALES.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-zinc-200">{cat.name}</span>
                    <span className="text-emerald-400 font-bold">
                      {cat.sold.toLocaleString('id-ID')} tiket ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400">
            <span>Total Kategori Terdaftar: 4 Kategori</span>
            <span className="text-emerald-400 font-medium">100% Validasi Aktif</span>
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
        <div className="card p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">
              Sistem Keamanan & Enkripsi TOTP Normal
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Seluruh gerbang e-Ticket Bromo & Rinjani terhubung dengan enkripsi HMAC SHA-256. Sinkronisasi offline-first bekerja optimal.
            </p>
          </div>
        </div>

        <div className="card p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">
              Sinkronisasi Merchant NFC & QR Aktif
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              12 booth tenant F&B & merchandise di posko pengawasan melaporkan latensi transaksi di bawah 250 milidetik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

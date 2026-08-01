import React, { useState, useMemo } from 'react';
import {
  Landmark,
  TrendingUp,
  DollarSign,
  Download,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Wallet,
  CreditCard,
  Banknote,
  FileText
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
  REVENUE_WEEKLY,
  PAYOUT_HISTORY,
  TICKET_CATEGORY_SALES
} from '../../data/adminData';

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

export default function FinancePage() {
  const stats = DASHBOARD_STATS;
  const [dateRange, setDateRange] = useState('month');

  const totalPayout = PAYOUT_HISTORY.reduce((sum, p) => sum + p.net_payout, 0);
  const totalFee = PAYOUT_HISTORY.reduce((sum, p) => sum + p.platform_fee, 0);
  const pendingPayout = PAYOUT_HISTORY.filter((p) => p.status === 'pending').reduce(
    (sum, p) => sum + p.net_payout,
    0
  );

  // ─── Chart.js: Weekly Revenue & Payout Analysis ────────────────
  const financeChartData = {
    labels: REVENUE_WEEKLY.map((r) => r.day),
    datasets: [
      {
        label: 'Pendapatan Kotor (Gross)',
        data: REVENUE_WEEKLY.map((r) => r.revenue),
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#34d399',
        borderRadius: 4
      },
      {
        label: 'Net Payout Pengelola (95%)',
        data: REVENUE_WEEKLY.map((r) => Math.round(r.revenue * 0.95)),
        backgroundColor: '#27272a',
        hoverBackgroundColor: '#3f3f46',
        borderRadius: 4
      }
    ]
  };

  const financeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { color: '#a1a1aa', font: { size: 11, family: 'Outfit' } }
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#d4d4d8',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => `Rp ${Number(context.raw).toLocaleString('id-ID')}`
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
          callback: (val) => `Rp ${(val / 1000000).toFixed(0)}jt`
        }
      }
    }
  };

  // ─── TanStack React Table: Payout History Columns ──────────────
  const payoutColumns = useMemo(
    () => [
      {
        accessorKey: 'period',
        header: 'Periode Settlement',
        cell: (info) => (
          <span className="font-bold text-zinc-200">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'gross',
        header: 'Pendapatan Kotor',
        cell: (info) => (
          <span className="text-zinc-300">
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'platform_fee',
        header: 'Biaya Platform (5%)',
        cell: (info) => (
          <span className="text-rose-400 font-mono">
            -Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'net_payout',
        header: 'Pencairan Bersih (Net)',
        cell: (info) => (
          <span className="font-bold text-emerald-400 font-['Outfit'] text-sm">
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const cfg =
            status === 'settled'
              ? {
                  label: 'Dicairkan',
                  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }
              : status === 'pending'
              ? {
                  label: 'Menunggu',
                  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }
              : {
                  label: 'Gagal',
                  cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
      },
      {
        accessorKey: 'bank',
        header: 'Rekening Tujuan',
        cell: (info) => (
          <span className="text-zinc-400 text-xs font-mono">
            {info.getValue()}
          </span>
        )
      },
      {
        accessorKey: 'settled_at',
        header: 'Tanggal Cair',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span className="text-zinc-500 text-xs">
              {val
                ? new Date(val).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                : '-'}
            </span>
          );
        }
      }
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="text-xs text-emerald-500 uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Finance Engine • Tremor UI & Chart.js Powered</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 font-['Outfit']">
            Keuangan & Pencairan Dana (Settlement)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Tremor UI style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Landmark}
          label="Total Dicairkan (YTD)"
          value={`Rp ${(totalPayout / 1000000).toFixed(1)}jt`}
          subValue="Settlement ke rekening bank pengelola"
          badgeText="SETTLED"
        />
        <AdminStatCard
          icon={Wallet}
          label="Pendapatan Bulan Ini"
          value={`Rp ${(stats.this_month.revenue / 1000000).toFixed(0)}jt`}
          subValue="Sebelum dipotong biaya platform"
          trend={14}
          badgeText="GROSS"
        />
        <AdminStatCard
          icon={Clock}
          label="Menunggu Settlement"
          value={`Rp ${(pendingPayout / 1000000).toFixed(1)}jt`}
          subValue="Pencairan otomatis H+1 jam 06:00 WIB"
          badgeText="PENDING"
        />
        <AdminStatCard
          icon={TrendingUp}
          label="Biaya Platform (5%)"
          value={`Rp ${(totalFee / 1000000).toFixed(1)}jt`}
          subValue="Untuk infrastruktur server, SMS, & NFC"
          badgeText="FEE"
        />
      </div>

      {/* Chart.js Section: Gross vs Net Payout */}
      <div className="card p-5 sm:p-6 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-zinc-100 font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-500" />
              <span>Analisis Pendapatan vs Pencairan Bersih (7 Hari Terakhir)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Powered by Chart.js — Rekonsiliasi gross revenue dan net payout (95%)
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <Bar data={financeChartData} options={financeChartOptions} />
        </div>
      </div>

      {/* TanStack React Table: Payout History */}
      <DataTable
        data={PAYOUT_HISTORY}
        columns={payoutColumns}
        title="Riwayat Pencairan Dana (Payout Settlement History)"
        subtitle="Dukungan sorting, searching, & pagination oleh TanStack React Table v8"
        defaultPageSize={5}
        searchPlaceholder="Cari periode, nama bank, atau status..."
      />

      {/* Payout Schedule Policy Banner */}
      <div className="card p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <div className="text-xs text-zinc-400 leading-relaxed">
          <strong className="text-zinc-200">Kebijakan Automated Settlement (H+1):</strong>{' '}
          Semua pendapatan tiket masuk dan transaksi Cashless Venue (NFC & QR) direkonsiliasi setiap pukul 23:59 WIB dan dicairkan secara otomatis ke rekening Bank Mandiri / BCA pengelola pada pukul 06:00 WIB hari berikutnya tanpa potongan biaya antarbank.
        </div>
      </div>
    </div>
  );
}

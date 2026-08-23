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

import { useApiClient } from '../../api/client';
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
  const apiClient = useApiClient(); // API client with automatic tenant header injection
  // TODO: Fetch financial data from API: const financeData = await apiClient.get('/api/admin/finance');
  
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
        backgroundColor: '#1f563f',
        hoverBackgroundColor: '#356f4c',
        borderRadius: 4
      },
      {
        label: 'Net Payout Klien (95%)',
        data: REVENUE_WEEKLY.map((r) => Math.round(r.revenue * 0.95)),
        backgroundColor: '#a97857',
        hoverBackgroundColor: '#8b5b3d',
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
        labels: { color: '#506452', font: { size: 11, family: 'Outfit' } }
      },
      tooltip: {
        backgroundColor: '#fffefa',
        titleColor: '#4f3425',
        bodyColor: '#506452',
        borderColor: '#d2dfcb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Rp ${Number(context.raw).toLocaleString('id-ID')}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6d7d6b', font: { size: 10 } }
      },
      y: {
        grid: { color: '#e5efdf' },
        ticks: {
          color: '#6d7d6b',
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
          <span className="font-bold text-gray-900">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'gross',
        header: 'Pendapatan Kotor',
        cell: (info) => (
          <span className="text-gray-700">
            Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'platform_fee',
        header: 'Biaya Layanan (5%)',
        cell: (info) => (
          <span className="text-red-600 font-mono">
            -Rp {info.getValue().toLocaleString('id-ID')}
          </span>
        )
      },
      {
        accessorKey: 'net_payout',
        header: 'Pencairan Bersih (Net)',
        cell: (info) => (
          <span className="font-bold text-emerald-700 font-['Outfit'] text-sm">
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
                  cls: 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }
              : status === 'pending'
              ? {
                  label: 'Menunggu',
                  cls: 'bg-amber-50 text-amber-800 border-amber-200'
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
      },
      {
        accessorKey: 'bank',
        header: 'Rekening Klien',
        cell: (info) => (
          <span className="text-gray-600 text-xs font-mono">
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
            <span className="text-gray-500 text-xs">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="text-xs text-emerald-700 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Finance Engine • White-Label SaaS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit']">
            Keuangan & Pencairan Dana (Settlement)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm shadow-2xs">
            <Download className="w-4 h-4" />
            <span>Ekspor CSV / PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Minimalist style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Landmark}
          label="Total Dicairkan (YTD)"
          value={`Rp ${(totalPayout / 1000000).toFixed(1)}jt`}
          subValue="Settlement ke rekening bank klien"
          badgeText="SETTLED"
        />
        <AdminStatCard
          icon={Wallet}
          label="Pendapatan Bulan Ini"
          value={`Rp ${(stats.this_month.revenue / 1000000).toFixed(0)}jt`}
          subValue="Sebelum dipotong biaya layanan"
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
          label="Biaya Layanan (5%)"
          value={`Rp ${(totalFee / 1000000).toFixed(1)}jt`}
          subValue="Untuk infrastruktur server, SMS, & NFC"
          badgeText="FEE"
        />
      </div>

      {/* Chart.js Section: Gross vs Net Payout */}
      <div className="card p-5 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-600" />
              <span>Analisis Pendapatan vs Pencairan Bersih (7 Hari Terakhir)</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
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
      <div className="card p-4 bg-white border border-gray-200 rounded-xl flex items-start gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4.5 h-4.5 text-emerald-600" />
        </div>
        <div className="text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-900">Kebijakan Automated Settlement (H+1):</strong>{' '}
          Semua pendapatan tiket masuk dan transaksi Cashless Venue (NFC & QR) direkonsiliasi setiap pukul 23:59 WIB dan dicairkan secara otomatis ke rekening bank terdaftar klien pada pukul 06:00 WIB hari berikutnya tanpa potongan biaya antarbank.
        </div>
      </div>
    </div>
  );
}

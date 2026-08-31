import React, { useState, useEffect, useMemo } from 'react';
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
import { Bar } from 'react-chartjs-2';

import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';
import { fetchAdminFinanceData, getAdminUser } from '../../api/admin';
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
  const { slug } = useTenant();
  const { toast } = useToast();
  const [financeData, setFinanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState('7d'); // '7d' | '30d' | 'month' | 'all'

  // Load real financial data from payment microservice
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const user = getAdminUser();
        const data = await fetchAdminFinanceData(user.tenant_id);
        setFinanceData(data);
      } catch (err) {
        console.warn('Finance telemetry load fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const defaultWeekly = [
    { day: 'Sen', revenue: 0 },
    { day: 'Sel', revenue: 0 },
    { day: 'Rab', revenue: 0 },
    { day: 'Kam', revenue: 0 },
    { day: 'Jum', revenue: 0 },
    { day: 'Sab', revenue: 0 },
    { day: 'Min', revenue: 0 },
  ];

  const rawPayouts = financeData?.payouts || [];
  const rawWeeklyRevenue = financeData?.weeklyRevenue?.length > 0 ? financeData.weeklyRevenue : defaultWeekly;

  // Filter payouts based on selected period
  const filteredPayouts = useMemo(() => {
    if (period === '7d') {
      return rawPayouts.slice(0, 3);
    } else if (period === '30d') {
      return rawPayouts.slice(0, 6);
    } else if (period === 'month') {
      return rawPayouts.slice(0, 4);
    }
    return rawPayouts;
  }, [rawPayouts, period]);

  const weeklyRevenue = useMemo(() => {
    return rawWeeklyRevenue;
  }, [rawWeeklyRevenue, period]);

  const totalPaidOut = filteredPayouts.filter((p) => p.status === 'settled').reduce((sum, p) => sum + (p.net_payout || 0), 0);
  const totalPending = filteredPayouts.filter((p) => p.status === 'pending').reduce((sum, p) => sum + (p.net_payout || 0), 0);
  const totalFee = filteredPayouts.reduce((sum, p) => sum + (p.platform_fee || 0), 0);
  const totalGross = totalPaidOut + totalPending + totalFee;

  const handleExportCSV = () => {
    const headers = ['Periode Settlement', 'Pendapatan Kotor (Rp)', 'Biaya Layanan (Rp)', 'Pencairan Bersih (Rp)', 'Status', 'Rekening Bank', 'Tanggal Cair'];
    const rows = filteredPayouts.map((p) => [
      `"${p.period || ''}"`,
      p.gross || 0,
      p.platform_fee || 0,
      p.net_payout || 0,
      `"${p.status === 'settled' ? 'Dicairkan' : p.status === 'pending' ? 'Menunggu' : 'Gagal'}"`,
      `"${p.bank || ''}"`,
      `"${p.settled_at ? new Date(p.settled_at).toLocaleDateString('id-ID') : '-'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `passify-settlement-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data riwayat settlement berhasil diekspor ke CSV!');
  };

  // ─── Chart.js: Revenue & Payout Analysis ────────────────
  const financeChartData = {
    labels: weeklyRevenue.map((r) => r.day),
    datasets: [
      {
        label: 'Pendapatan Kotor (Gross)',
        data: weeklyRevenue.map((r) => r.revenue),
        backgroundColor: '#1e4b35',
        hoverBackgroundColor: '#2d6a4f',
        borderRadius: 6
      },
      {
        label: 'Net Payout Klien (95%)',
        data: weeklyRevenue.map((r) => Math.round(r.revenue * 0.95)),
        backgroundColor: '#80512f',
        hoverBackgroundColor: '#673e21',
        borderRadius: 6
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
        labels: { color: '#546657', font: { size: 11, family: 'Plus Jakarta Sans' } }
      },
      tooltip: {
        backgroundColor: '#f8faf5',
        titleColor: '#102d20',
        bodyColor: '#546657',
        borderColor: '#cddac8',
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
        ticks: { color: '#546657', font: { size: 10 } }
      },
      y: {
        grid: { color: '#e7efdf' },
        ticks: {
          color: '#546657',
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
          <span className="font-bold text-[var(--forest-deep)]">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'gross',
        header: 'Pendapatan Kotor',
        cell: (info) => (
          <span className="text-[var(--ink)]">
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
          <span className="font-bold text-[var(--forest)] font-heading text-sm">
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
          <span className="text-[var(--ink-soft)] text-xs font-mono">
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
            <span className="text-[var(--ink-soft)] text-xs">
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
      {/* Header & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--forest-deep)] font-heading">
            Keuangan & Pencairan Dana (Settlement)
          </h1>
          <p className="text-xs text-[var(--ink-soft)] mt-1">
            Rekonsiliasi transaksi pendapatan tiket, biaya layanan, dan histori transfer otomatis ke rekening mitra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period Selector Tabs */}
          <div className="flex items-center bg-[var(--canvas)] p-1 rounded-xl border border-[var(--border)] text-xs" role="radiogroup" aria-label="Filter Rentang Waktu">
            {[
              { id: '7d', label: '7 Hari' },
              { id: '30d', label: '30 Hari' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={period === t.id}
                onClick={() => setPeriod(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  period === t.id
                    ? 'bg-[var(--surface)] text-[var(--forest-deep)] shadow-2xs'
                    : 'text-[var(--ink-soft)] hover:text-[var(--forest-deep)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-secondary btn-sm shadow-2xs cursor-pointer flex items-center gap-1.5"
            title="Ekspor data settlement saat ini ke CSV"
          >
            <Download className="w-4 h-4 text-[var(--forest)]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={DollarSign}
          label="Total Pendapatan Kotor"
          value={`Rp ${(totalGross / 1000000).toFixed(1)}jt`}
          subValue="Tiket + Topup Cashless Venue"
          badgeText="GROSS"
        />
        <AdminStatCard
          icon={CreditCard}
          label="Total Dana Dicairkan"
          value={`Rp ${(totalPaidOut / 1000000).toFixed(1)}jt`}
          subValue="Ditransfer ke Rekening BCA"
          badgeText="SETTLED"
        />
        <AdminStatCard
          icon={Wallet}
          label="Saldo Tertunda (Pending)"
          value={`Rp ${(totalPending / 1000000).toFixed(1)}jt`}
          subValue="Settlement pukul 06:00 besok"
          badgeText="PENDING"
        />
        <AdminStatCard
          icon={TrendingUp}
          label="Biaya Layanan (5%)"
          value={`Rp ${(totalFee / 1000000).toFixed(1)}jt`}
          subValue="Untuk infrastruktur server & gerbang"
          badgeText="FEE"
        />
      </div>

      {/* Chart Section: Gross vs Net Payout */}
      <div className="card p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-[var(--forest-deep)] font-heading flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-[var(--forest)]" />
              <span>Analisis Pendapatan vs Pencairan Bersih ({period === '7d' ? '7 Hari Terakhir' : period === '30d' ? '30 Hari Terakhir' : period === 'month' ? 'Bulan Ini' : 'Semua Data'})</span>
            </h3>
            <p className="text-xs text-[var(--ink-soft)] mt-0.5">
              Rekonsiliasi perbandingan gross revenue dan net payout (95%)
            </p>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <Bar data={financeChartData} options={financeChartOptions} />
        </div>
      </div>

      {/* TanStack React Table: Payout History */}
      <DataTable
        data={filteredPayouts}
        columns={payoutColumns}
        title="Riwayat Pencairan Dana (Payout Settlement History)"
        subtitle="Dukungan sorting, searching, & pagination oleh TanStack React Table v8"
        defaultPageSize={5}
        searchPlaceholder="Cari periode, nama bank, atau status..."
        isLoading={isLoading}
      />

      {/* Payout Schedule Policy Banner */}
      <div className="card p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex items-start gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-[var(--leaf-pale)] shadow-2xs flex items-center justify-center flex-shrink-0">
          <FileText className="w-4.5 h-4.5 text-[var(--forest)]" />
        </div>
        <div className="text-xs text-[var(--ink-soft)] leading-relaxed">
          <strong className="text-[var(--forest-deep)]">Kebijakan Automated Settlement (H+1):</strong>{' '}
          Semua pendapatan tiket masuk dan transaksi Cashless Venue (NFC & QR) direkonsiliasi setiap pukul 23:59 WIB dan dicairkan secara otomatis ke rekening bank terdaftar klien pada pukul 06:00 WIB hari berikutnya tanpa potongan biaya antarbank.
        </div>
      </div>
    </div>
  );
}

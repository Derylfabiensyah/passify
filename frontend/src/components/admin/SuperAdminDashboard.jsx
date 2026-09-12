import React, { useState, useEffect } from 'react';
import {
  Activity, ArrowUpRight, Building2, CheckCircle2, ChevronRight,
  Clock, DollarSign, ExternalLink, Globe, HardDrive, Layers,
  RefreshCw, ScanLine, ShieldCheck, Ticket, Users, AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { fetchSuperAdminTelemetry } from '../../api/admin';
import { formatRupiah } from '../../api/client';
import AdminStatCard from './AdminStatCard';
import DataTable from './DataTable';
import { ChartContainerSkeleton } from '../common/Skeleton';

// Register Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function SuperAdminDashboard() {
  const [telemetry, setTelemetry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartMode, setChartMode] = useState('hourly');
  const [lastSync, setLastSync] = useState(new Date());

  const loadData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await fetchSuperAdminTelemetry();
      setTelemetry(data);
      setLastSync(new Date());
    } catch (err) {
      console.warn('Super Admin Telemetry error:', err);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = telemetry?.platformStats || {
    totalTenants: 3,
    activeTenants: 3,
    totalTicketsSold: 0,
    totalGMV: 0,
    totalPlatformFee: 0,
    totalVisitorsEntered: 0,
    totalGatesActive: 6,
  };

  const tenants = telemetry?.tenants || [];
  const servicesHealth = telemetry?.servicesHealth || [];
  const trafficHourly = telemetry?.trafficHourly || [];
  const trafficWeekly = telemetry?.trafficWeekly || [];
  const recentTransactions = telemetry?.allRecentTransactions || [];

  // Hourly Traffic Multi-Tenant Line Chart
  const hourlyChartData = {
    labels: trafficHourly.map((t) => t.hour),
    datasets: [
      {
        label: 'Total Platform',
        data: trafficHourly.map((t) => t.total),
        borderColor: '#14281a',
        backgroundColor: 'rgba(20, 40, 26, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Curug Cikanteh',
        data: trafficHourly.map((t) => t.cikanteh),
        borderColor: '#1b4d3e',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Curug Citambur',
        data: trafficHourly.map((t) => t.citambur),
        borderColor: '#3a7d44',
        backgroundColor: 'transparent',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Curug Cibereum',
        data: trafficHourly.map((t) => t.cibereum),
        borderColor: '#b48121',
        backgroundColor: 'transparent',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  // Weekly GMV Bar Chart
  const weeklyChartData = {
    labels: trafficWeekly.map((w) => w.day),
    datasets: [
      {
        label: 'Platform GMV (Omset)',
        data: trafficWeekly.map((w) => w.gmv),
        backgroundColor: '#1b4d3e',
        borderRadius: 8,
      },
      {
        label: 'Platform Share (Fee Passify)',
        data: trafficWeekly.map((w) => w.platformFee),
        backgroundColor: '#d4a345',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          font: { family: 'var(--font-body, system-ui)', size: 11, weight: '600' },
          color: '#2a3426',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(20, 40, 26, 0.95)',
        padding: 12,
        titleFont: { size: 12, weight: '700' },
        bodyFont: { size: 11 },
        callbacks: {
          label: (context) => {
            const val = context.parsed.y;
            if (chartMode === 'weekly') {
              return ` ${context.dataset.label}: ${formatRupiah(val)}`;
            }
            return ` ${context.dataset.label}: ${val.toLocaleString('id-ID')} Pengunjung`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '600' }, color: '#4d5c48' },
      },
      y: {
        border: { dash: [4, 4] },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { size: 11 },
          color: '#4d5c48',
          callback: (value) => (chartMode === 'weekly' ? `Rp ${(value / 1000000).toFixed(1)}jt` : value),
        },
      },
    },
  };

  // Columns for Tenant Performance Table
  const tenantColumns = [
    {
      header: 'Mitra Kawasan Wisata',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-800/10 text-emerald-800 font-bold text-xs border border-emerald-900/15">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-[#14281a] text-xs sm:text-sm">{row.original.name}</span>
            <span className="block text-[11px] font-medium text-[#4d5c48]">/{row.original.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tiket Terjual',
      accessorKey: 'ticketsSold',
      cell: ({ getValue }) => (
        <span className="font-extrabold text-[#14281a] text-xs sm:text-sm">
          {getValue()?.toLocaleString('id-ID')} tiket
        </span>
      ),
    },
    {
      header: 'Validasi Gerbang',
      accessorKey: 'visitorsEntered',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
          <ScanLine className="h-3.5 w-3.5" />
          <span>{getValue()?.toLocaleString('id-ID')} masuk</span>
        </div>
      ),
    },
    {
      header: 'Omset Kawasan (GMV)',
      accessorKey: 'gmv',
      cell: ({ getValue }) => (
        <span className="font-bold text-[#14281a] text-xs">
          {formatRupiah(getValue())}
        </span>
      ),
    },
    {
      header: 'Fee Passify',
      accessorKey: 'platformFee',
      cell: ({ getValue }) => (
        <span className="font-extrabold text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {formatRupiah(getValue())}
        </span>
      ),
    },
    {
      header: 'Kapasitas Kuota',
      accessorKey: 'occupancyPct',
      cell: ({ getValue }) => {
        const pct = getValue() || 0;
        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-[#4d5c48]">
              <span>Keterisian</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-emerald-900/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct > 80 ? 'bg-amber-500' : 'bg-emerald-700'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: () => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Aktif
        </span>
      ),
    },
    {
      header: 'Aksi',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/?tenant=${row.original.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka Portal Publik"
            className="p-1.5 rounded-lg border border-white/80 bg-white/90 text-[#2a3426] hover:text-[#14281a] hover:bg-white transition-colors cursor-pointer shadow-2xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Platform Header Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#284430] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super Admin Console
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live Platform Telemetry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-[-.04em] text-[#14281a]">
            Passify Platform Intelligence
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#4d5c48]">
            Monitoring lalu lintas pengunjung, transaksi real-time, dan performa seluruh mitra kawasan wisata.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="text-right hidden md:block">
            <span className="block text-[10px] font-semibold text-[#4d5c48]">Sinkronisasi Terakhir</span>
            <span className="block text-xs font-bold text-[#14281a]">
              {lastSync.toLocaleTimeString('id-ID')} WIB
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-900/20 bg-white/90 px-3.5 py-2 text-xs font-bold text-[#14281a] hover:bg-white hover:shadow-xs transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-800 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          icon={Building2}
          label="Mitra Kawasan Aktif"
          value={stats.activeTenants}
          subValue={`${stats.totalTenants} Kawasan Terdaftar`}
          trend={100}
          trendDirection="up"
          badgeText="Platform"
          isLoading={isLoading}
        />
        <AdminStatCard
          icon={Ticket}
          label="Total Tiket Terjual"
          value={stats.totalTicketsSold?.toLocaleString('id-ID')}
          subValue="Lintas semua destinasi"
          trend={18}
          trendDirection="up"
          badgeText="Tiket Masuk"
          isLoading={isLoading}
        />
        <AdminStatCard
          icon={DollarSign}
          label="Platform GMV (Omset)"
          value={formatRupiah(stats.totalGMV)}
          subValue="Gross Merchandise Value"
          trend={14}
          trendDirection="up"
          badgeText="Transaksi"
          isLoading={isLoading}
        />
        <AdminStatCard
          icon={Layers}
          label="Pendapatan Fee Platform"
          value={formatRupiah(stats.totalPlatformFee)}
          subValue="Bagi hasil tiket Passify"
          trend={22}
          trendDirection="up"
          badgeText="Net Passify"
          isLoading={isLoading}
        />
      </div>

      {/* Traffic Chart & Microservices Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart (2 cols) */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4d5c48]">
                Analisis Lalu Lintas
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#14281a]">
                {chartMode === 'hourly'
                  ? 'Lalu Lintas Pengunjung Hari Ini (Per Jam)'
                  : 'Proyeksi Omset & Fee Mingguan Platform'}
              </h3>
            </div>

            <div className="flex items-center rounded-xl bg-emerald-950/5 p-1 border border-emerald-900/10">
              <button
                type="button"
                onClick={() => setChartMode('hourly')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'hourly'
                    ? 'bg-[#284430] text-white shadow-2xs'
                    : 'text-[#4d5c48] hover:text-[#14281a]'
                }`}
              >
                Traffic Per Jam
              </button>
              <button
                type="button"
                onClick={() => setChartMode('weekly')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'weekly'
                    ? 'bg-[#284430] text-white shadow-2xs'
                    : 'text-[#4d5c48] hover:text-[#14281a]'
                }`}
              >
                Omset Mingguan
              </button>
            </div>
          </div>

          <div className="h-[280px] sm:h-[320px] w-full pt-2">
            {isLoading ? (
              <ChartContainerSkeleton />
            ) : chartMode === 'hourly' ? (
              <Line data={hourlyChartData} options={chartOptions} />
            ) : (
              <Bar data={weeklyChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Microservices Cluster Health (1 col) */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/70">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4d5c48]">
                  Infrastructure
                </span>
                <h3 className="text-base font-black text-[#14281a]">Klaster Microservice</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                Live
              </span>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {servicesHealth.map((svc) => (
                <div
                  key={svc.port}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/75 border border-white/80 backdrop-blur-xs text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
                      <span className="font-bold text-[#14281a] truncate">{svc.name}</span>
                    </div>
                    <span className="text-[10px] text-[#4d5c48] block truncate">
                      Port :{svc.port} • {svc.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        svc.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : svc.status === 'degraded'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {svc.status === 'online' ? `${svc.latencyMs}ms` : svc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/70">
            <div className="flex items-center justify-between text-xs text-[#4d5c48]">
              <span>Docker Orchestration:</span>
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sehat (Healthy)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Performance Table */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4d5c48]">
              Performa Mitra
            </span>
            <h3 className="text-base sm:text-lg font-black text-[#14281a]">
              Laporan Lalu Lintas & Transaksi Seluruh Mitra Wisata
            </h3>
          </div>
          <span className="text-xs font-bold text-[#4d5c48]">
            Menampilkan {tenants.length} Destinasi Terhubung
          </span>
        </div>

        <DataTable
          data={tenants}
          columns={tenantColumns}
          defaultPageSize={5}
          searchPlaceholder="Cari nama destinasi atau slug..."
          isLoading={isLoading}
        />
      </div>

      {/* Live Transaction Feed Across Platform */}
      {recentTransactions.length > 0 && (
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4d5c48]">
                Real-Time Stream
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#14281a]">
                Aktivitas Transaksi Lintas Kawasan Terkini
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-800">
              {recentTransactions.length} Transaksi Terverifikasi
            </span>
          </div>

          <div className="divide-y divide-white/70">
            {recentTransactions.slice(0, 5).map((tx, idx) => (
              <div key={tx.id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-800/10 text-emerald-800">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#14281a] truncate">
                        {tx.visitor_name || tx.visitor || 'Wisatawan Passify'}
                      </span>
                      {tx.tenantName && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 truncate">
                          {tx.tenantName}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#4d5c48] block">
                      {tx.order_number || tx.id} • {tx.visitor_count || tx.qty || 1} Tiket Masuk
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block font-bold text-[#14281a]">
                    {formatRupiah(tx.grand_total || tx.amount || 0)}
                  </span>
                  <span className="block text-[10px] font-medium text-emerald-700">
                    Settled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import {
  TrendingUp, TrendingDown, Ticket, Users, DollarSign, Wallet,
  ArrowUpRight, ArrowDownRight, Clock, BarChart3, Activity,
  ShieldCheck, AlertTriangle, RefreshCw
} from 'lucide-react';
import {
  DASHBOARD_STATS, HOURLY_VISITORS, REVENUE_WEEKLY,
  TICKET_CATEGORY_SALES, RECENT_TRANSACTIONS, GATE_SCAN_STATS
} from '../../data/adminData';

function StatCard({ icon: Icon, label, value, subValue, trend }) {
  const trendUp = trend > 0;
  return (
    <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-800">
          <Icon className="w-5 h-5 text-zinc-100" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trendUp ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-zinc-100 mb-1">{value}</div>
      <div className="text-xs text-zinc-400">{label}</div>
      {subValue && <div className="text-[10px] text-zinc-500 mt-1.5">{subValue}</div>}
    </div>
  );
}

export default function DashboardOverview() {
  const stats = DASHBOARD_STATS;
  const revGrowth = Math.round(((stats.today.revenue - stats.yesterday.revenue) / stats.yesterday.revenue) * 100);
  const ticketGrowth = Math.round(((stats.today.tickets_sold - stats.yesterday.tickets_sold) / stats.yesterday.tickets_sold) * 100);

  const quotaUsedPct = Math.round(((stats.today.total_capacity - stats.today.remaining_quota) / stats.today.total_capacity) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Pendapatan Hari Ini"
          value={`Rp ${(stats.today.revenue / 1000000).toFixed(1)}jt`}
          subValue={`Kemarin: Rp ${(stats.yesterday.revenue / 1000000).toFixed(1)}jt`}
          trend={revGrowth}
        />
        <StatCard
          icon={Ticket}
          label="Tiket Terjual Hari Ini"
          value={stats.today.tickets_sold.toLocaleString('id-ID')}
          subValue={`Kemarin: ${stats.yesterday.tickets_sold} tiket`}
          trend={ticketGrowth}
        />
        <StatCard
          icon={Users}
          label="Pengunjung Masuk"
          value={stats.today.visitors_entered.toLocaleString('id-ID')}
          subValue={`Sisa kuota: ${stats.today.remaining_quota} dari ${stats.today.total_capacity}`}
        />
        <StatCard
          icon={Wallet}
          label="Top-Up Cashless Wallet"
          value={`Rp ${(stats.today.wallet_topups / 1000000).toFixed(1)}jt`}
          subValue={`Transaksi vendor: Rp ${(stats.today.vendor_transactions / 1000000).toFixed(1)}jt`}
        />
      </div>

      {/* Carrying Capacity Gauge + Hourly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carrying Capacity Progress */}
        <div className="card p-5 lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" />
              Carrying Capacity
            </h3>
          </div>

          {/* Circular Progress */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={quotaUsedPct > 85 ? '#ef4444' : quotaUsedPct > 65 ? '#f59e0b' : '#10b981'}
                  strokeWidth="3"
                  strokeDasharray={`${quotaUsedPct}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-zinc-100">{quotaUsedPct}%</span>
                <span className="text-[10px] text-zinc-500">Terisi</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-zinc-500">
              <span>Kapasitas Harian</span>
              <span className="text-zinc-100 font-medium">{stats.today.total_capacity.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-500">
              <span>Sudah Masuk</span>
              <span className="text-zinc-100 font-medium">{stats.today.visitors_entered.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-500">
              <span>Sisa Kuota</span>
              <span className="text-zinc-100 font-medium">{stats.today.remaining_quota.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Hourly Visitor Chart */}
        <div className="card p-5 lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              Traffic Pengunjung Per Jam
            </h3>
            <span className="text-[10px] text-zinc-500">Hari ini</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 flex-1 min-h-[160px] mb-4 px-1">
            {HOURLY_VISITORS.map((h, idx) => {
              const maxH = Math.max(...HOURLY_VISITORS.map(x => Math.max(x.entered, x.exited)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1" title={`${h.hour}: Masuk ${h.entered}, Keluar ${h.exited}`}>
                  <div className="w-full flex gap-1 items-end h-full">
                    {/* Entered Bar */}
                    <div
                      className="flex-1 rounded-sm bg-emerald-500 transition-all duration-500"
                      style={{ height: `${Math.max(3, (h.entered / maxH) * 100)}%` }}
                    />
                    {/* Exited Bar */}
                    <div
                      className="flex-1 rounded-sm bg-zinc-700 transition-all duration-500"
                      style={{ height: `${Math.max(3, (h.exited / maxH) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between px-1 border-t border-zinc-800/50 pt-2">
            {HOURLY_VISITORS.map((h, idx) => (
              <span key={idx} className="flex-1 text-center text-[10px] text-zinc-500">{h.hour.split(':')[0]}</span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-emerald-500"></div>
              <span>Masuk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm bg-zinc-700"></div>
              <span>Keluar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart + Ticket Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Revenue */}
        <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              Pendapatan 7 Hari Terakhir
            </h3>
            <span className="text-zinc-100 text-sm font-medium">
              Rp {(stats.this_month.revenue / 1000000).toFixed(0)}jt <span className="text-zinc-500 text-xs font-normal">bulan ini</span>
            </span>
          </div>

          <div className="flex items-end gap-3 h-40 px-1 mb-4 border-b border-zinc-800/50 pb-2">
            {REVENUE_WEEKLY.map((d, idx) => {
              const maxR = Math.max(...REVENUE_WEEKLY.map(x => x.revenue));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full" title={`${d.day}: Rp ${d.revenue.toLocaleString('id-ID')}`}>
                  <div
                    className="w-full rounded-sm bg-emerald-500 transition-all duration-500 hover:bg-emerald-400 cursor-pointer"
                    style={{ height: `${Math.max(4, (d.revenue / maxR) * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-1">
            {REVENUE_WEEKLY.map((d, idx) => (
              <span key={idx} className="flex-1 text-center text-[10px] text-zinc-500">{d.day}</span>
            ))}
          </div>
        </div>

        {/* Ticket Category Breakdown */}
        <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-zinc-400" />
              Penjualan Per Kategori
            </h3>
            <span className="text-zinc-500 text-[10px]">Bulan ini</span>
          </div>

          <div className="space-y-4">
            {TICKET_CATEGORY_SALES.map((cat, idx) => {
              const colors = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500'];
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-300">{cat.name}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-500">{cat.sold.toLocaleString('id-ID')} tiket</span>
                      <span className="text-zinc-100 font-medium">Rp {(cat.revenue / 1000000).toFixed(0)}jt</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${colors[idx % colors.length]}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gate Scanner Status + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gate Scanner Status */}
        <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              Status Gate Scanner
            </h3>
          </div>
          <div className="space-y-3">
            {GATE_SCAN_STATS.map((gate, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">{gate.device}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${gate.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                    <span className="text-[10px] text-zinc-500 capitalize">{gate.status}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800">
                  <span>Total: <span className="text-zinc-300">{gate.scans_today}</span></span>
                  <span>Valid: <span className="text-zinc-300">{gate.valid}</span></span>
                  <span>Invalid: <span className="text-zinc-300">{gate.invalid}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-5 lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              Transaksi Terbaru
            </h3>
            <button className="text-[10px] text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800">
                  <th className="py-2 text-left font-medium">Order</th>
                  <th className="py-2 text-left font-medium">Pengunjung</th>
                  <th className="py-2 text-left font-medium hidden sm:table-cell">Kategori</th>
                  <th className="py-2 text-right font-medium">Jumlah</th>
                  <th className="py-2 text-center font-medium">Status</th>
                  <th className="py-2 text-right font-medium hidden md:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TRANSACTIONS.map((trx) => (
                  <tr key={trx.id} className="border-b border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <td className="py-3 text-zinc-400 font-mono text-[10px]">{trx.code}</td>
                    <td className="py-3 text-zinc-200">{trx.visitor}</td>
                    <td className="py-3 text-zinc-500 hidden sm:table-cell">{trx.category}</td>
                    <td className="py-3 text-right text-zinc-100 font-medium">Rp {trx.amount.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-medium ${
                        trx.status === 'paid'
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : 'text-zinc-400 bg-zinc-800'
                      }`}>
                        {trx.status === 'paid' ? 'Lunas' : 'Refund'}
                      </span>
                    </td>
                    <td className="py-3 text-right text-zinc-500 hidden md:table-cell">{trx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            Ringkasan Bulan Ini
          </h3>
          <span className="text-[10px] text-zinc-500">Juli 2026</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
            <div className="text-xl font-semibold text-zinc-100">Rp {(stats.this_month.revenue / 1000000).toFixed(0)}jt</div>
            <div className="text-[10px] text-zinc-500 mt-1">Total Revenue</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
            <div className="text-xl font-semibold text-zinc-100">{stats.this_month.tickets_sold.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Tiket Terjual</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
            <div className="text-xl font-semibold text-zinc-100">{stats.this_month.avg_daily_visitors}</div>
            <div className="text-[10px] text-zinc-500 mt-1">Rata-Rata Harian</div>
          </div>
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
            <div className="text-xl font-semibold text-zinc-100">Rp {(stats.this_month.payout_settled / 1000000).toFixed(0)}jt</div>
            <div className="text-[10px] text-zinc-500 mt-1">Payout Dicairkan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

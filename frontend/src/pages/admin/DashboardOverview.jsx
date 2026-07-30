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

function StatCard({ icon: Icon, label, value, subValue, trend, trendLabel, color = "emerald", iconBg }) {
  const trendUp = trend > 0;
  return (
    <div className="glass-panel p-5 hover:border-emerald-500/30">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg || 'bg-emerald-500/15'}`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-white font-['Outfit'] mb-0.5">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
      {subValue && <div className="text-[10px] text-slate-500 mt-1">{subValue}</div>}
    </div>
  );
}

function MiniBarChart({ data, maxVal, color = '#10b981' }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val, idx) => (
        <div
          key={idx}
          className="flex-1 rounded-t transition-all duration-500 min-w-[8px]"
          style={{
            height: `${Math.max(4, (val / maxVal) * 100)}%`,
            background: `linear-gradient(180deg, ${color} 0%, ${color}44 100%)`,
          }}
          title={`${val.toLocaleString('id-ID')}`}
        />
      ))}
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
      {/* Top Banner Status */}
      <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-2 text-xs text-emerald-400">
        <span className="flex items-center gap-2 font-medium">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          Live Monitoring Dashboard — Data real-time tersinkronisasi dari gate scanner dan payment gateway
        </span>
        <span className="text-slate-400 font-mono text-[11px]">Sync: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Pendapatan Hari Ini"
          value={`Rp ${(stats.today.revenue / 1000000).toFixed(1)}jt`}
          subValue={`Kemarin: Rp ${(stats.yesterday.revenue / 1000000).toFixed(1)}jt`}
          trend={revGrowth}
          color="emerald"
          iconBg="bg-emerald-500/15"
        />
        <StatCard
          icon={Ticket}
          label="Tiket Terjual Hari Ini"
          value={stats.today.tickets_sold.toLocaleString('id-ID')}
          subValue={`Kemarin: ${stats.yesterday.tickets_sold} tiket`}
          trend={ticketGrowth}
          color="sky"
          iconBg="bg-sky-500/15"
        />
        <StatCard
          icon={Users}
          label="Pengunjung Masuk"
          value={stats.today.visitors_entered.toLocaleString('id-ID')}
          subValue={`Sisa kuota: ${stats.today.remaining_quota} dari ${stats.today.total_capacity}`}
          color="violet"
          iconBg="bg-violet-500/15"
        />
        <StatCard
          icon={Wallet}
          label="Top-Up Cashless Wallet"
          value={`Rp ${(stats.today.wallet_topups / 1000000).toFixed(1)}jt`}
          subValue={`Transaksi vendor: Rp ${(stats.today.vendor_transactions / 1000000).toFixed(1)}jt`}
          color="amber"
          iconBg="bg-amber-500/15"
        />
      </div>

      {/* Carrying Capacity Gauge + Hourly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Carrying Capacity Progress */}
        <div className="glass-panel p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Carrying Capacity
            </h3>
            <span className="badge badge-emerald text-[10px]">
              <span className="pulse-dot" style={{ width: 5, height: 5 }} />
              Live
            </span>
          </div>

          {/* Circular Progress */}
          <div className="flex justify-center mb-4">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={quotaUsedPct > 85 ? '#f43f5e' : quotaUsedPct > 65 ? '#f59e0b' : '#10b981'}
                  strokeWidth="3"
                  strokeDasharray={`${quotaUsedPct}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white font-['Outfit']">{quotaUsedPct}%</span>
                <span className="text-[10px] text-slate-400">Terisi</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Kapasitas Harian</span>
              <span className="text-white font-semibold">{stats.today.total_capacity.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sudah Masuk</span>
              <span className="text-emerald-400 font-semibold">{stats.today.visitors_entered.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Sisa Kuota</span>
              <span className="text-amber-400 font-semibold">{stats.today.remaining_quota.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Hourly Visitor Chart */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Traffic Pengunjung Per Jam
            </h3>
            <span className="text-[10px] text-slate-500">Hari ini</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-2 h-36 mb-3 px-1">
            {HOURLY_VISITORS.map((h, idx) => {
              const maxH = Math.max(...HOURLY_VISITORS.map(x => Math.max(x.entered, x.exited)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1" title={`${h.hour}: Masuk ${h.entered}, Keluar ${h.exited}`}>
                  <div className="w-full flex gap-0.5 items-end" style={{ height: '100%' }}>
                    {/* Entered Bar */}
                    <div
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600/60 to-emerald-400 transition-all duration-500"
                      style={{ height: `${Math.max(3, (h.entered / maxH) * 100)}%` }}
                    />
                    {/* Exited Bar */}
                    <div
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-sky-600/60 to-sky-400 transition-all duration-500"
                      style={{ height: `${Math.max(3, (h.exited / maxH) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1 justify-between px-1">
            {HOURLY_VISITORS.map((h, idx) => (
              <span key={idx} className="flex-1 text-center text-[9px] text-slate-500">{h.hour.split(':')[0]}</span>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500"></div>
              <span>Masuk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-sky-500"></div>
              <span>Keluar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart + Ticket Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Revenue */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Pendapatan 7 Hari Terakhir
            </h3>
            <span className="text-emerald-400 text-xs font-bold font-['Outfit']">
              Rp {(stats.this_month.revenue / 1000000).toFixed(0)}jt <span className="text-slate-500 font-normal">bulan ini</span>
            </span>
          </div>

          <div className="flex items-end gap-3 h-32 px-1 mb-3">
            {REVENUE_WEEKLY.map((d, idx) => {
              const maxR = Math.max(...REVENUE_WEEKLY.map(x => x.revenue));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: Rp ${d.revenue.toLocaleString('id-ID')}`}>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600/50 to-emerald-400 transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300 cursor-pointer"
                    style={{ height: `${Math.max(8, (d.revenue / maxR) * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-1">
            {REVENUE_WEEKLY.map((d, idx) => (
              <span key={idx} className="flex-1 text-center text-[10px] text-slate-500 font-medium">{d.day}</span>
            ))}
          </div>
        </div>

        {/* Ticket Category Breakdown */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-sky-400" />
              Penjualan Per Kategori Tiket
            </h3>
            <span className="text-slate-400 text-xs">Bulan ini</span>
          </div>

          <div className="space-y-3">
            {TICKET_CATEGORY_SALES.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-300 font-medium">{cat.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">{cat.sold.toLocaleString('id-ID')} tiket</span>
                    <span className="text-emerald-400 font-bold">Rp {(cat.revenue / 1000000).toFixed(0)}jt</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.percentage}%`,
                      background: idx === 0 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                        idx === 1 ? 'linear-gradient(90deg, #0ea5e9, #38bdf8)' :
                        idx === 2 ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' :
                        'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gate Scanner Status + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gate Scanner Status */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Status Gate Scanner
            </h3>
          </div>
          <div className="space-y-3">
            {GATE_SCAN_STATS.map((gate, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200">{gate.device}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    gate.status === 'online'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                      : 'bg-slate-700/50 text-slate-500 border border-slate-700'
                  }`}>
                    {gate.status === 'online' ? '● Online' : '○ Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Total: <strong className="text-white">{gate.scans_today}</strong></span>
                  <span>Valid: <strong className="text-emerald-400">{gate.valid}</strong></span>
                  <span>Invalid: <strong className={gate.invalid > 0 ? 'text-rose-400' : 'text-slate-500'}>{gate.invalid}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Transaksi Terbaru
            </h3>
            <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="py-2 text-left font-semibold">Kode Order</th>
                  <th className="py-2 text-left font-semibold">Pengunjung</th>
                  <th className="py-2 text-left font-semibold hidden sm:table-cell">Kategori</th>
                  <th className="py-2 text-right font-semibold">Jumlah</th>
                  <th className="py-2 text-center font-semibold">Status</th>
                  <th className="py-2 text-right font-semibold hidden md:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_TRANSACTIONS.map((trx) => (
                  <tr key={trx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-300 font-mono text-[10px]">{trx.code}</td>
                    <td className="py-2.5 text-slate-200 font-medium">{trx.visitor}</td>
                    <td className="py-2.5 text-slate-400 hidden sm:table-cell">{trx.category}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-bold">Rp {trx.amount.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        trx.status === 'paid'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}>
                        {trx.status === 'paid' ? 'Lunas' : 'Refund'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-500 hidden md:table-cell">{trx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            Ringkasan Bulan Ini
          </h3>
          <span className="text-[10px] text-slate-500">Juli 2026</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-900/60 text-center">
            <div className="text-xl font-extrabold text-emerald-400 font-['Outfit']">Rp {(stats.this_month.revenue / 1000000).toFixed(0)}jt</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total Revenue</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 text-center">
            <div className="text-xl font-extrabold text-sky-400 font-['Outfit']">{stats.this_month.tickets_sold.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tiket Terjual</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 text-center">
            <div className="text-xl font-extrabold text-violet-400 font-['Outfit']">{stats.this_month.avg_daily_visitors}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Rata-Rata Harian</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 text-center">
            <div className="text-xl font-extrabold text-amber-400 font-['Outfit']">Rp {(stats.this_month.payout_settled / 1000000).toFixed(0)}jt</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Payout Dicairkan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

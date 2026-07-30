import React, { useState } from 'react';
import {
  Landmark, TrendingUp, DollarSign, Download, Filter, Calendar,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Wallet, CreditCard, Banknote, FileText, Search
} from 'lucide-react';
import { DASHBOARD_STATS, REVENUE_WEEKLY, PAYOUT_HISTORY, TICKET_CATEGORY_SALES } from '../../data/adminData';

function StatCard({ icon: Icon, label, value, subLabel, iconBg, valueColor = 'text-white' }) {
  return (
    <div className="glass-panel p-5 hover:border-emerald-500/30">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className={`text-2xl font-extrabold font-['Outfit'] ${valueColor}`}>{value}</div>
      {subLabel && <div className="text-[10px] text-slate-500 mt-1">{subLabel}</div>}
    </div>
  );
}

function PayoutRow({ payout }) {
  const statusConfig = {
    settled: { label: 'Dicairkan', icon: CheckCircle2, bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25' },
    pending: { label: 'Menunggu', icon: Clock, bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/25' },
    failed: { label: 'Gagal', icon: AlertCircle, bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/25' },
  };
  const cfg = statusConfig[payout.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="py-3.5 text-sm text-slate-200 font-medium">{payout.period}</td>
      <td className="py-3.5 text-sm text-right text-slate-300">Rp {payout.gross.toLocaleString('id-ID')}</td>
      <td className="py-3.5 text-sm text-right text-rose-400">-Rp {payout.platform_fee.toLocaleString('id-ID')}</td>
      <td className="py-3.5 text-sm text-right text-emerald-400 font-bold">Rp {payout.net_payout.toLocaleString('id-ID')}</td>
      <td className="py-3.5 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </td>
      <td className="py-3.5 text-xs text-slate-400">{payout.bank}</td>
      <td className="py-3.5 text-xs text-slate-500">
        {payout.settled_at ? new Date(payout.settled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
      </td>
    </tr>
  );
}

export default function FinancePage() {
  const stats = DASHBOARD_STATS;
  const [dateRange, setDateRange] = useState('month');

  const totalPayout = PAYOUT_HISTORY.reduce((sum, p) => sum + p.net_payout, 0);
  const totalFee = PAYOUT_HISTORY.reduce((sum, p) => sum + p.platform_fee, 0);
  const pendingPayout = PAYOUT_HISTORY.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.net_payout, 0);
  const platformFeePct = ((totalFee / PAYOUT_HISTORY.reduce((s, p) => s + p.gross, 0)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-['Outfit']">Laporan Keuangan & Payout</h2>
          <p className="text-xs text-slate-400 mt-1">Ringkasan pendapatan, biaya platform, dan status pencairan dana</p>
        </div>
        <div className="flex items-center gap-2">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateRange === range ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
              }`}
            >
              {range === 'week' ? 'Minggu Ini' : range === 'month' ? 'Bulan Ini' : 'Kuartal'}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700/50 flex items-center gap-1.5 hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Pendapatan Gross"
          value={`Rp ${(stats.this_month.revenue / 1000000).toFixed(0)}jt`}
          subLabel={`${stats.this_month.tickets_sold.toLocaleString('id-ID')} tiket terjual`}
          iconBg="bg-emerald-500/15 text-emerald-400"
          valueColor="text-emerald-400"
        />
        <StatCard
          icon={Banknote}
          label="Total Payout Dicairkan"
          value={`Rp ${(stats.this_month.payout_settled / 1000000).toFixed(0)}jt`}
          subLabel="Setelah dipotong platform fee"
          iconBg="bg-sky-500/15 text-sky-400"
          valueColor="text-sky-400"
        />
        <StatCard
          icon={Clock}
          label="Payout Pending"
          value={`Rp ${(pendingPayout / 1000000).toFixed(1)}jt`}
          subLabel="Pencairan periode berjalan"
          iconBg="bg-amber-500/15 text-amber-400"
          valueColor="text-amber-400"
        />
        <StatCard
          icon={CreditCard}
          label="Platform Fee"
          value={`${platformFeePct}%`}
          subLabel={`Total: Rp ${(totalFee / 1000000).toFixed(0)}jt bulan ini`}
          iconBg="bg-violet-500/15 text-violet-400"
          valueColor="text-violet-400"
        />
      </div>

      {/* Revenue Breakdown Chart + Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Bar Chart */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Grafik Pendapatan Mingguan
            </h3>
          </div>

          <div className="flex items-end gap-3 h-36 px-1 mb-3">
            {REVENUE_WEEKLY.map((d, idx) => {
              const maxR = Math.max(...REVENUE_WEEKLY.map(x => x.revenue));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" title={`${d.day}: Rp ${d.revenue.toLocaleString('id-ID')}`}>
                  <span className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Rp {(d.revenue / 1000000).toFixed(0)}jt
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-600/50 to-emerald-400 transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-300"
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

        {/* Revenue by Category */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              Revenue Per Kategori Tiket
            </h3>
          </div>

          <div className="space-y-3">
            {TICKET_CATEGORY_SALES.map((cat, idx) => {
              const colors = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b'];
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[idx] }}></div>
                      <span className="text-xs text-slate-300 font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{cat.sold.toLocaleString('id-ID')} tiket</span>
                      <span className="text-white font-bold">Rp {(cat.revenue / 1000000).toFixed(0)}jt</span>
                      <span className="text-slate-500">{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.percentage}%`, background: colors[idx] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Summary */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Total Revenue Bulan Ini</span>
              <span className="text-emerald-400 font-extrabold font-['Outfit'] text-lg">
                Rp {(TICKET_CATEGORY_SALES.reduce((s, c) => s + c.revenue, 0) / 1000000).toFixed(0)}jt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            Rincian Biaya Platform
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Gross Revenue</div>
            <div className="text-xl font-extrabold text-white font-['Outfit']">
              Rp {(PAYOUT_HISTORY.reduce((s, p) => s + p.gross, 0) / 1000000).toFixed(0)}jt
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total penjualan tiket sebelum potongan</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Platform Fee ({platformFeePct}%)</div>
            <div className="text-xl font-extrabold text-rose-400 font-['Outfit']">
              -Rp {(totalFee / 1000000).toFixed(0)}jt
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Biaya SaaS Passify, termasuk Payment Gateway</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
            <div className="text-xs text-emerald-400 mb-1">Net Payout (Diterima Pengelola)</div>
            <div className="text-xl font-extrabold text-emerald-400 font-['Outfit']">
              Rp {(totalPayout / 1000000).toFixed(0)}jt
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Total yang sudah + akan dicairkan ke rekening</div>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Riwayat Payout (Pencairan Dana)
          </h3>
          <span className="text-[10px] text-slate-400">Pencairan otomatis setiap Senin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="py-2.5 text-left font-semibold">Periode</th>
                <th className="py-2.5 text-right font-semibold">Gross</th>
                <th className="py-2.5 text-right font-semibold">Platform Fee</th>
                <th className="py-2.5 text-right font-semibold">Net Payout</th>
                <th className="py-2.5 text-center font-semibold">Status</th>
                <th className="py-2.5 text-left font-semibold">Rekening</th>
                <th className="py-2.5 text-left font-semibold">Tanggal Cair</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUT_HISTORY.map((payout) => (
                <PayoutRow key={payout.id} payout={payout} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-700">
                <td className="py-3 text-sm font-bold text-white">Total</td>
                <td className="py-3 text-sm text-right text-slate-200 font-bold">
                  Rp {PAYOUT_HISTORY.reduce((s, p) => s + p.gross, 0).toLocaleString('id-ID')}
                </td>
                <td className="py-3 text-sm text-right text-rose-400 font-bold">
                  -Rp {totalFee.toLocaleString('id-ID')}
                </td>
                <td className="py-3 text-sm text-right text-emerald-400 font-extrabold">
                  Rp {totalPayout.toLocaleString('id-ID')}
                </td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bank Account Info */}
      <div className="glass-panel p-4 border-sky-500/20 bg-sky-950/10">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-sky-400 mb-1">Rekening Pencairan</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dana akan dicairkan secara otomatis setiap hari Senin ke rekening: <strong className="text-white">BCA - ****4821</strong> a.n. <strong className="text-white">Dinas Pariwisata Kab. Probolinggo</strong>.
              Hubungi support Passify untuk mengubah informasi rekening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Landmark, TrendingUp, DollarSign, Download, Filter, Calendar,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  BarChart3, PieChart, Wallet, CreditCard, Banknote, FileText, Search
} from 'lucide-react';
import { DASHBOARD_STATS, REVENUE_WEEKLY, PAYOUT_HISTORY, TICKET_CATEGORY_SALES } from '../../data/adminData';

function StatCard({ icon: Icon, label, value, subLabel }) {
  return (
    <div className="card p-5 border border-zinc-800">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-zinc-100">{value}</div>
      {subLabel && <div className="text-[10px] text-zinc-500 mt-1">{subLabel}</div>}
    </div>
  );
}

function PayoutRow({ payout }) {
  const statusConfig = {
    settled: { label: 'Dicairkan', icon: CheckCircle2, text: 'text-emerald-500' },
    pending: { label: 'Menunggu', icon: Clock, text: 'text-zinc-400' },
    failed: { label: 'Gagal', icon: AlertCircle, text: 'text-zinc-400' },
  };
  const cfg = statusConfig[payout.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
      <td className="py-3.5 text-sm text-zinc-100 font-medium">{payout.period}</td>
      <td className="py-3.5 text-sm text-right text-zinc-300">Rp {payout.gross.toLocaleString('id-ID')}</td>
      <td className="py-3.5 text-sm text-right text-zinc-400">-Rp {payout.platform_fee.toLocaleString('id-ID')}</td>
      <td className="py-3.5 text-sm text-right text-zinc-100 font-semibold">Rp {payout.net_payout.toLocaleString('id-ID')}</td>
      <td className="py-3.5 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-zinc-900 border border-zinc-800 ${cfg.text}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </td>
      <td className="py-3.5 text-xs text-zinc-400">{payout.bank}</td>
      <td className="py-3.5 text-xs text-zinc-500">
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Laporan Keuangan & Payout</h2>
          <p className="text-xs text-zinc-400 mt-1">Ringkasan pendapatan, biaya platform, dan status pencairan dana</p>
        </div>
        <div className="flex items-center gap-2">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                dateRange === range ? 'bg-zinc-700 text-zinc-100' : 'bg-transparent text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              {range === 'week' ? 'Minggu Ini' : range === 'month' ? 'Bulan Ini' : 'Kuartal'}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-transparent text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-colors flex items-center gap-1.5">
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
        />
        <StatCard
          icon={Banknote}
          label="Total Payout Dicairkan"
          value={`Rp ${(stats.this_month.payout_settled / 1000000).toFixed(0)}jt`}
          subLabel="Setelah dipotong platform fee"
        />
        <StatCard
          icon={Clock}
          label="Payout Pending"
          value={`Rp ${(pendingPayout / 1000000).toFixed(1)}jt`}
          subLabel="Pencairan periode berjalan"
        />
        <StatCard
          icon={CreditCard}
          label="Platform Fee"
          value={`${platformFeePct}%`}
          subLabel={`Total: Rp ${(totalFee / 1000000).toFixed(0)}jt bulan ini`}
        />
      </div>

      {/* Revenue Breakdown Chart + Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Bar Chart */}
        <div className="card p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Grafik Pendapatan Mingguan
            </h3>
          </div>

          <div className="flex items-end gap-3 h-36 px-1 mb-3">
            {REVENUE_WEEKLY.map((d, idx) => {
              const maxR = Math.max(...REVENUE_WEEKLY.map(x => x.revenue));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer" title={`${d.day}: Rp ${d.revenue.toLocaleString('id-ID')}`}>
                  <span className="text-[9px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    Rp {(d.revenue / 1000000).toFixed(0)}jt
                  </span>
                  <div
                    className="w-full rounded-t-md bg-emerald-500"
                    style={{ height: `${Math.max(8, (d.revenue / maxR) * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-1">
            {REVENUE_WEEKLY.map((d, idx) => (
              <span key={idx} className="flex-1 text-center text-[10px] text-zinc-500 font-medium">{d.day}</span>
            ))}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="card p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              Revenue Per Kategori Tiket
            </h3>
          </div>

          <div className="space-y-3">
            {TICKET_CATEGORY_SALES.map((cat, idx) => {
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-300 font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-500">{cat.sold.toLocaleString('id-ID')} tiket</span>
                      <span className="text-zinc-100 font-semibold">Rp {(cat.revenue / 1000000).toFixed(0)}jt</span>
                      <span className="text-zinc-400">{cat.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Summary */}
          <div className="mt-4 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-medium">Total Revenue Bulan Ini</span>
              <span className="text-zinc-100 font-bold text-lg">
                Rp {(TICKET_CATEGORY_SALES.reduce((s, c) => s + c.revenue, 0) / 1000000).toFixed(0)}jt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="card p-5 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Rincian Biaya Platform
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 mb-1">Gross Revenue</div>
            <div className="text-xl font-bold text-zinc-100">
              Rp {(PAYOUT_HISTORY.reduce((s, p) => s + p.gross, 0) / 1000000).toFixed(0)}jt
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Total penjualan tiket sebelum potongan</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 mb-1">Platform Fee ({platformFeePct}%)</div>
            <div className="text-xl font-bold text-zinc-400">
              -Rp {(totalFee / 1000000).toFixed(0)}jt
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Biaya SaaS Passify, termasuk Payment Gateway</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-emerald-500 mb-1">Net Payout (Diterima Pengelola)</div>
            <div className="text-xl font-bold text-emerald-500">
              Rp {(totalPayout / 1000000).toFixed(0)}jt
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Total yang sudah + akan dicairkan ke rekening</div>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      <div className="card p-5 border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-500" />
            Riwayat Payout (Pencairan Dana)
          </h3>
          <span className="text-[10px] text-zinc-500">Pencairan otomatis setiap Senin</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="py-2.5 text-left font-medium">Periode</th>
                <th className="py-2.5 text-right font-medium">Gross</th>
                <th className="py-2.5 text-right font-medium">Platform Fee</th>
                <th className="py-2.5 text-right font-medium">Net Payout</th>
                <th className="py-2.5 text-center font-medium">Status</th>
                <th className="py-2.5 text-left font-medium">Rekening</th>
                <th className="py-2.5 text-left font-medium">Tanggal Cair</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUT_HISTORY.map((payout) => (
                <PayoutRow key={payout.id} payout={payout} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-zinc-800">
                <td className="py-3 text-sm font-semibold text-zinc-100">Total</td>
                <td className="py-3 text-sm text-right text-zinc-300 font-semibold">
                  Rp {PAYOUT_HISTORY.reduce((s, p) => s + p.gross, 0).toLocaleString('id-ID')}
                </td>
                <td className="py-3 text-sm text-right text-zinc-400 font-semibold">
                  -Rp {totalFee.toLocaleString('id-ID')}
                </td>
                <td className="py-3 text-sm text-right text-emerald-500 font-bold">
                  Rp {totalPayout.toLocaleString('id-ID')}
                </td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bank Account Info */}
      <div className="card p-4 border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-zinc-100 mb-1">Rekening Pencairan</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Dana akan dicairkan secara otomatis setiap hari Senin ke rekening: <strong className="text-zinc-100">BCA - ****4821</strong> a.n. <strong className="text-zinc-100">Dinas Pariwisata Kab. Probolinggo</strong>.
              Hubungi support Passify untuk mengubah informasi rekening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

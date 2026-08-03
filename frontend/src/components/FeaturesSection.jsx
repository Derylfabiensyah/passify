import React from 'react';
import { WifiOff, Wallet, Landmark, Zap, ShieldCheck, ArrowRight, Activity, Cpu, Monitor, CheckCircle2, BarChart3, AlertCircle } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features-section" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
          <Cpu className="w-4 h-4 text-emerald-700" />
          <span>Arsitektur Modular Enterprise</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight mb-5 leading-tight">
          Modul Teknologi Pengelola Kawasan
        </h2>
        <p className="text-[#212529] font-medium text-base sm:text-lg leading-relaxed">
          Didesain secara modular Bento Grid agar dapat disesuaikan dengan identitas brand (White-Label) dan regulasi pengelola taman wisata alam, dengan jarak ruang napas maksimal.
        </p>
      </div>

      {/* ASYMMETRICAL BENTO MODULAR GRID — GENEROUS GAPS & REALISTIC DEVICE MOCKUPS */}
      <div className="space-y-10">
        
        {/* Row 1: Large Card (7 cols) + Compact Card (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Card 1: Dynamic Carrying Capacity + MACBOOK LAPTOP SCREEN MOCKUP (7 cols) */}
          <div className="lg:col-span-7 p-10 sm:p-12 lg:p-14 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Zap className="w-7 h-7 text-emerald-700" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full">
                  MODUL KUOTA ALAM
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-['Outfit'] mb-4 leading-snug">
                Dynamic Carrying Capacity & Manajemen Kuota
              </h3>

              <p className="text-[#212529] font-medium text-base sm:text-lg leading-relaxed mb-8">
                Batasi kuota kunjungan harian & per sesi waktu secara otomatis berbasis daya dukung lingkungan untuk setiap venue klien. Menjaga kelestarian alam sekaligus mencegah penumpukan di pintu masuk.
              </p>

              {/* MACBOOK / LAPTOP SCREEN DEVICE MOCKUP */}
              <div className="my-8 rounded-2xl bg-gray-900 p-2 shadow-2xl border border-gray-800">
                {/* macOS Top Bar */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-950 rounded-t-xl border-b border-gray-800">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/90" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/90" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/90" />
                  </div>
                  <div className="text-[11px] font-mono text-gray-400 bg-gray-900 px-4 py-0.5 rounded-md truncate max-w-[240px]">
                    console.passify.id/admin/kuota-live
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE TELEMETRY</span>
                </div>

                {/* Laptop Screen Content: Live Simulation Data Table */}
                <div className="p-4 sm:p-6 bg-gray-950 text-white rounded-b-xl font-mono text-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                    <span className="text-gray-400">STATUS DAYA DUKUNG KAWASAN:</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded">
                      KUOTA AMAN (71% AVG)
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="font-bold text-white">06:00 - 10:00 (Sesi Sunrise)</div>
                        <div className="text-[11px] text-gray-400">Jalur Pendakian Puncak Alpha</div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold">1.420 / 2.000 Pax</span>
                        <div className="w-28 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: '71%' }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="font-bold text-white">10:00 - 15:00 (Sesi Siang)</div>
                        <div className="text-[11px] text-gray-400">Jalur Kawah & Air Terjun</div>
                      </div>
                      <div className="text-right">
                        <span className="text-amber-400 font-bold">980 / 1.000 Pax (98%)</span>
                        <div className="w-28 h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: '98%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400">
                    <span>*Auto-Lock Gate triggered when max capacity = 100%</span>
                    <span className="text-emerald-400 font-bold">[ BKSDA COMPLIANT ]</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800">
              <span>Rekomendasi Resmi Taman Nasional</span>
              <span className="text-emerald-700 font-extrabold">100% Otomatis</span>
            </div>
          </div>

          {/* Card 2: Offline-First Gate Validation (5 cols) */}
          <div className="lg:col-span-5 p-10 sm:p-12 lg:p-14 rounded-3xl bg-gray-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-xs">
                  <WifiOff className="w-7 h-7 text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-4 py-2 rounded-full">
                  MODUL GATE
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white mb-4 leading-snug">
                Offline-First Gate Validation
              </h3>

              <p className="text-gray-200 font-medium text-base sm:text-lg leading-relaxed mb-8">
                Perangkat scanner gerbang tetap bekerja akurat di area tanpa sinyal dengan protokol kriptografi HMAC TOTP offline. Tidak ada kata sistem down di hutan.
              </p>

              {/* Compact NFC Simulator Box */}
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono space-y-2 my-6">
                <div className="flex justify-between text-emerald-300">
                  <span>LOCAL SQLITE ENGINE:</span>
                  <span className="font-bold">ACTIVE</span>
                </div>
                <div className="text-gray-300 text-[11px]">
                  Memory Buffer: 250,000 Offline Tickets • Synced H+0
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-800 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-400">
              <span>HMAC SHA-256 TOTP</span>
              <span className="font-bold">&lt; 0.28 Detik</span>
            </div>
          </div>
        </div>

        {/* Row 2: Compact Card (5 cols) + Large Card (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Card 3: White-Label Cashless Ecosystem (5 cols) */}
          <div className="lg:col-span-5 p-10 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-7 h-7 text-emerald-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-4 py-2 rounded-full">
                  MODUL UMKM
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white mb-4 leading-snug">
                White-Label Cashless Ecosystem
              </h3>

              <p className="text-gray-200 font-medium text-base sm:text-lg leading-relaxed mb-8">
                Dompet digital terintegrasi untuk transaksi F&B, penyewaan alat, dan suvenir di seluruh merchant kawasan wisata tanpa perantara tunai.
              </p>
            </div>

            <div className="pt-8 mt-8 border-t border-emerald-800 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-300">
              <span>EDC & QRIS BI-FAST</span>
              <span className="font-bold">Zero Leakage</span>
            </div>
          </div>

          {/* Card 4: Automated Multi-Party Payouts + ACCOUNTING SETTLEMENT MOCKUP (7 cols) */}
          <div className="lg:col-span-7 p-10 sm:p-12 lg:p-14 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Landmark className="w-7 h-7 text-emerald-700" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-4 py-2 rounded-full">
                  MODUL KEUANGAN B2G
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-['Outfit'] mb-4 leading-snug">
                Automated Multi-Party Payouts & Audit Trail
              </h3>

              <p className="text-[#212529] font-medium text-base sm:text-lg leading-relaxed mb-8">
                Rekonsiliasi dan pencairan dana pendapatan tiket, PNBP Kementerian, serta bagi hasil UMKM secara otomatis dan transparan ke rekening bank pengelola setiap hari kerja.
              </p>

              {/* ENTERPRISE FINANCIAL AUDIT MOCKUP TABLE */}
              <div className="my-8 p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm font-mono text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 font-bold text-gray-900">
                  <span>DAILY SETTLEMENT BATCH #B2G-20260803</span>
                  <span className="text-emerald-700 font-sans">STATUS: DISBURSED H+1</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white shadow-2xs">
                    <span className="text-gray-700 font-medium">1. PNBP KLHK / Kemenhut (30%):</span>
                    <span className="font-bold text-gray-900">Rp 10.650.000 (Bank Mandiri)</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white shadow-2xs">
                    <span className="text-gray-700 font-medium">2. Kas Desa & Retribusi Pemda (40%):</span>
                    <span className="font-bold text-gray-900">Rp 14.200.000 (Bank BPD)</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-white shadow-2xs">
                    <span className="text-gray-700 font-medium">3. Pengelola Balai & Pokdarwis (30%):</span>
                    <span className="font-bold text-gray-900">Rp 10.650.000 (Bank BRI)</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-[11px] text-gray-600">
                  <span>*Settlement otomatis tanpa intervensi manual kasir</span>
                  <span className="font-bold text-emerald-800">[ BI-FAST INTEGRATED ]</span>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800">
              <span>Laporan Audit SIAP BPK / BI</span>
              <span className="text-emerald-700 font-extrabold">Settlement H+1</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

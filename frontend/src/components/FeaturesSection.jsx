import React from 'react';
import { WifiOff, Wallet, Landmark, Zap, ShieldCheck, ArrowRight, Activity, Cpu } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features-section" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-emerald-700" />
          <span>Arsitektur Modular Enterprise</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Outfit'] tracking-tight mb-4">
          Modul Teknologi Pengelola Kawasan
        </h2>
        <p className="text-gray-800 font-medium text-base leading-relaxed">
          Didesain secara modular Bento Grid agar dapat disesuaikan dengan identitas brand (White-Label) dan regulasi pengelola taman wisata alam.
        </p>
      </div>

      {/* ASYMMETRICAL BENTO MODULAR GRID — 2 ROWS (No repetitive equal grid!) */}
      <div className="space-y-6">
        
        {/* Row 1: Large Card (7 cols) + Compact Card (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Dynamic Carrying Capacity (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Zap className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full">
                  MODUL KUOTA ALAM
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 font-['Outfit'] mb-3">
                Dynamic Carrying Capacity & Manajemen Kuota
              </h3>

              <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed">
                Batasi kuota kunjungan harian & per sesi waktu secara otomatis berbasis daya dukung lingkungan untuk setiap venue klien. Menjaga kelestarian alam sekaligus mencegah penumpukan di pintu masuk.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-800">
              <span>Rekomendasi Resmi Taman Nasional</span>
              <span className="text-emerald-700">100% Otomatis</span>
            </div>
          </div>

          {/* Card 2: Offline-First Gate Validation (5 cols) */}
          <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-gray-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-xs">
                  <WifiOff className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">
                  MODUL GATE
                </span>
              </div>

              <h3 className="text-2xl font-extrabold font-['Outfit'] text-white mb-3">
                Offline-First Gate Validation
              </h3>

              <p className="text-gray-300 font-normal text-sm sm:text-base leading-relaxed">
                Perangkat scanner gerbang tetap bekerja akurat di area tanpa sinyal dengan protokol kriptografi HMAC TOTP offline. Tidak ada kata sistem down di hutan.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-800 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>HMAC SHA-256 TOTP</span>
              <span>&lt; 0.28 Detik</span>
            </div>
          </div>
        </div>

        {/* Row 2: Compact Card (5 cols) + Large Card (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 3: White-Label Cashless Ecosystem (5 cols) */}
          <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-6 h-6 text-emerald-300" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/10 px-3 py-1 rounded-full">
                  MODUL UMKM
                </span>
              </div>

              <h3 className="text-2xl font-extrabold font-['Outfit'] text-white mb-3">
                White-Label Cashless Ecosystem
              </h3>

              <p className="text-gray-200 font-normal text-sm sm:text-base leading-relaxed">
                Dompet digital terintegrasi untuk transaksi F&B, penyewaan alat, dan suvenir di seluruh merchant kawasan wisata tanpa perantara tunai.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-emerald-800 flex items-center justify-between text-xs font-mono text-emerald-300">
              <span>EDC & QRIS BI-FAST</span>
              <span>Zero Leakage</span>
            </div>
          </div>

          {/* Card 4: Automated Multi-Party Payouts (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Landmark className="w-6 h-6 text-emerald-700" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full">
                  MODUL KEUANGAN B2G
                </span>
              </div>

              <h3 className="text-2xl font-extrabold text-gray-900 font-['Outfit'] mb-3">
                Automated Multi-Party Payouts & Audit Trail
              </h3>

              <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed">
                Rekonsiliasi dan pencairan dana pendapatan tiket, PNBP Kementerian, serta bagi hasil UMKM secara otomatis dan transparan ke rekening bank pengelola setiap hari kerja.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-800">
              <span>Laporan Audit SIAP BPK / BI</span>
              <span className="text-emerald-700">Settlement H+1</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

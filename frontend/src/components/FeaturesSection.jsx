import React from 'react';
import { WifiOff, Wallet, Landmark, Zap, ShieldCheck, ArrowRight, Activity, Cpu } from 'lucide-react';

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

      {/* ASYMMETRICAL BENTO MODULAR GRID — GENEROUS GAPS (gap-10 lg:gap-12) & PADDING (p-10 sm:p-12 lg:p-14) */}
      <div className="space-y-10">
        
        {/* Row 1: Large Card (7 cols) + Compact Card (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Card 1: Dynamic Carrying Capacity (7 cols) */}
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

          {/* Card 4: Automated Multi-Party Payouts (7 cols) */}
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

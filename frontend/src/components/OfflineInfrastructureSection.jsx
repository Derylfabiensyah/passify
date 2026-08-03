import React from 'react';
import { WifiOff, Trees, Tent, Cpu, RefreshCw, CheckCircle2, BatteryCharging, ShieldAlert, Users, Compass, Shield, HeartHandshake, Zap, Activity, Database, Lock } from 'lucide-react';

export default function OfflineInfrastructureSection() {
  return (
    <section id="offline-infrastructure" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-emerald-700" />
          <span>Arsitektur Lapangan & Konservasi Alam</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight mb-4">
          Teknologi Tangguh untuk Hutan & Pegunungan
        </h2>
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed font-medium">
          Mengatasi masalah ketiadaan sinyal internet dan listrik di area terpencil. Disusun dalam tata letak modular Bento Grid agar Anda dapat meninjau keunggulan utama (USP) sistem kami secara intuitif.
        </p>
      </div>

      {/* BENTO GRID ROW 1: USP SPOTLIGHT #1 — OFFLINE-FIRST CRYPTOGRAPHY ENGINE (8 cols) + OFFLINE TELEMETRY BADGE CARD (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* HERO BENTO CARD 1 (8 cols): Kriptografi HMAC TOTP Offline-First */}
        <div className="lg:col-span-8 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono tracking-wider">
                <WifiOff className="w-3.5 h-3.5" />
                <span>KEUNGGULAN UTAMA (USP) #1 — 0% SINYAL INTERNET</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-white/10 px-3 py-1 rounded-full">
                LOCAL SQLITE ENGINE
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit'] text-white mb-4 leading-tight">
              Validasi Gerbang Offline-First via Kriptografi HMAC TOTP
            </h3>

            <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
              Jangan biarkan antrean panjang terjadi karena sinyal seluler putus di tengah hutan. Passify menggunakan arsitektur lokal dengan keamanan ganda anti-tiket palsu yang memvalidasi gelang pengunjung tanpa butuh koneksi server pusat.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              {[
                {
                  step: '01',
                  title: 'Basecamp Sync (Pagi)',
                  desc: 'Petugas gerbang mengunduh manifes tiket harian terenkripsi saat di basecamp bersinyal/Wi-Fi.'
                },
                {
                  step: '02',
                  title: 'Validasi < 0.28 Detik',
                  desc: 'Scanner memeriksa tanda tangan digital NFC & QR secara seketika di pintu hutan tanpa delay.'
                },
                {
                  step: '03',
                  title: 'Auto-Batch Cloud Upload',
                  desc: 'Seluruh riwayat check-in otomatis terunggah ke cloud begitu perangkat kembali ke zona sinyal.'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 shadow-md">
                  <span className="text-xs font-mono font-bold text-emerald-400">{item.step} • ALUR KERJA</span>
                  <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-gray-300 gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Enkripsi 256-Bit Standar Perbankan</span>
            </div>
            <div className="text-emerald-400 font-bold">
              ZERO TICKET FRAUD GUARANTEE
            </div>
          </div>
        </div>

        {/* COMPACT BENTO CARD (4 cols): Active Field Telemetry & Power Specs */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-4">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-700" />
              <span>Daya & Ketahanan Gawai</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit'] mb-3">
              14 Jam Operasional Tanpa Listrik
            </h3>

            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed font-medium mb-6">
              Handheld Gate Scanner kami dilengkapi baterai industri 6000 mAh dan chip NFC hemat daya untuk bertugas di posko pendakian tertinggi.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 shadow-sm flex items-center justify-between">
                <span className="text-gray-700 font-medium">Respons Scan NFC:</span>
                <span className="font-bold text-gray-900">0.28 Detik</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 shadow-sm flex items-center justify-between">
                <span className="text-gray-700 font-medium">Kapasitas Memory Offline:</span>
                <span className="font-bold text-gray-900">250.000 Tiket</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-gray-50 shadow-sm flex items-center justify-between">
                <span className="text-gray-700 font-medium">Sertifikasi Outdoor:</span>
                <span className="font-bold text-emerald-700">IP68 / Drop-Proof 1.5m</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 text-xs text-gray-700 font-semibold italic">
            "Petugas Ranger hutan tidak pernah kehilangan riwayat scan tiket walau baterai cadangan baru diganti sore hari."
          </div>
        </div>

      </div>

      {/* BENTO GRID ROW 2: USP SPOTLIGHT #2 — KLHK CARRYING CAPACITY (7 cols) + PEMBERDAYAAN ADDON BUNDLING (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COMPACT BENTO CARD (5 cols): Pemberdayaan Pokdarwis (Rentals, Ranger, Asuransi) */}
        <div className="lg:col-span-5 p-8 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold mb-4">
              <Tent className="w-3.5 h-3.5 text-teal-700" />
              <span>Pemberdayaan Warga Lokal</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit'] mb-3">
              Penyewaan Alat & Pemandu dalam 1 Barcode Tiket
            </h3>

            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed font-medium mb-6">
              Tingkatkan pendapatan kawasan sekaligus berdayakan UMKM sekitar. Wisatawan menyewa tenda, memesan jasa pemandu gunung, dan membayar asuransi kecelakaan resmi sekaligus.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Tent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Tenda Dome + Sleeping Bag</div>
                    <div className="text-[11px] text-gray-600">Inventaris alat terikat barcode</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  +Rp 75.000
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Ranger Gunung Pokdarwis</div>
                    <div className="text-[11px] text-gray-600">Sertifikasi keselamatan resmi</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full">
                  +Rp 150.000
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Asuransi Kecelakaan Resmi</div>
                    <div className="text-[11px] text-gray-600">Perlindungan jiwa pendakian</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full">
                  +Rp 5.000
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Satu Barcode Untuk Seluruh Layanan</span>
            <span className="underline">Lihat Modul Kasir →</span>
          </div>
        </div>

        {/* HERO BENTO CARD 2 (7 cols): KLHK Conservation Carrying Capacity */}
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-emerald-900 text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-200 text-xs font-bold font-mono uppercase">
                <Trees className="w-3.5 h-3.5" />
                <span>KEUNGGULAN UTAMA (USP) #2 — KONSISTENSI ALAM</span>
              </div>
              <span className="text-xs font-bold text-emerald-950 bg-emerald-300 px-3 py-1 rounded-full">
                STANDAR TAMAN NASIONAL
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white mb-4 leading-tight">
              Monitor Daya Dukung Lingkungan (Carrying Capacity KLHK)
            </h3>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed font-medium mb-6">
              Mencegah kerusakan alam akibat overtourism. Sistem Passify secara otomatis mengunci penjualan tiket apabila kuota sesi pagi atau sore telah melampaui batas aman ekosistem yang ditetapkan oleh balai konservasi.
            </p>

            {/* Carrying Capacity Visual Progress */}
            <div className="p-6 rounded-2xl bg-emerald-950/80 shadow-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-emerald-300 font-semibold uppercase">Kuota Pengunjung Jalur Pendakian</span>
                <span className="text-lg font-extrabold text-white font-['Outfit']">142 / 200 Pendaki</span>
              </div>
              <div className="w-full h-3 rounded-full bg-emerald-950 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500" style={{ width: '71%' }} />
              </div>
              <div className="flex justify-between text-xs text-emerald-300 mt-2 font-medium">
                <span>Sesi Pagi (06:00 - 11:00)</span>
                <span>Tersisa 58 Kuota Konservasi</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-950/50 shadow-md">
                <div className="text-xs text-emerald-300 font-medium">Retribusi Daerah</div>
                <div className="text-base font-bold text-white mt-1 font-mono">Rp 710.000</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/50 shadow-md">
                <div className="text-xs text-emerald-300 font-medium">Kas Desa / PNBP</div>
                <div className="text-base font-bold text-white mt-1 font-mono">Rp 1.420.000</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/50 shadow-md col-span-2 sm:col-span-1">
                <div className="text-xs text-emerald-300 font-medium">Indeks Konservasi</div>
                <div className="text-base font-bold text-emerald-400 mt-1">98.4% (Aman)</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-800/80 mt-6 flex items-center justify-between text-xs font-mono text-emerald-200">
            <span>Satu Pintu KLHK • Pemisahan Rekonsiliasi Otomatis</span>
            <span className="text-white font-bold">100% COMPLIANT</span>
          </div>
        </div>

      </div>
    </section>
  );
}

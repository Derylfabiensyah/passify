import React from 'react';
import { WifiOff, Trees, Tent, Cpu, RefreshCw, CheckCircle2, BatteryCharging, ShieldAlert, Users, Compass, Shield, HeartHandshake, Zap, Activity, Database, Lock, Smartphone, Check, ArrowRight } from 'lucide-react';

export default function OfflineInfrastructureSection() {
  return (
    <section id="offline-infrastructure" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header with Generous Breathing Room */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
          <Cpu className="w-4 h-4 text-emerald-700" />
          <span>Arsitektur Lapangan & Konservasi Alam</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight mb-5 leading-tight">
          Teknologi Tangguh untuk Hutan & Pegunungan
        </h2>
        <p className="text-[#212529] text-base sm:text-lg leading-relaxed font-medium">
          Mengatasi masalah ketiadaan sinyal internet dan listrik di area terpencil. Disusun dalam tata letak modular Bento Grid dengan jarak ruang napas eksekutif agar setiap keunggulan utama (USP) tampil maksimal.
        </p>
      </div>

      {/* BENTO GRID ROW 1: GENEROUS GAP (gap-10 lg:gap-12) & INTERNAL PADDING (p-10 sm:p-12 lg:p-14) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 mb-12">
        
        {/* HERO BENTO CARD 1 (8 cols): Kriptografi HMAC TOTP + RUGGED HANDHELD SCANNER DEVICE MOCKUP */}
        <div className="lg:col-span-8 p-10 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono tracking-wider">
                <WifiOff className="w-4 h-4" />
                <span>KEUNGGULAN UTAMA (USP) #1 — 0% SINYAL INTERNET</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-white/10 px-3.5 py-1.5 rounded-full">
                LOCAL SQLITE ENGINE
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit'] text-white mb-5 leading-tight">
              Validasi Gerbang Offline-First via Kriptografi HMAC TOTP
            </h3>

            <p className="text-gray-200 text-base sm:text-lg leading-relaxed font-medium max-w-2xl mb-10">
              Jangan biarkan antrean panjang terjadi karena sinyal seluler putus di tengah hutan. Passify menggunakan arsitektur lokal dengan keamanan ganda anti-tiket palsu yang memvalidasi gelang pengunjung tanpa butuh koneksi server pusat.
            </p>

            {/* RUGGED HANDHELD SMARTPHONE DEVICE MOCKUP (Replacing dry text table!) */}
            <div className="my-10 p-6 sm:p-8 rounded-3xl bg-gray-900/90 border border-gray-800 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-800 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>PASSIFY RANGER TERMINAL OS • RUGGED HANDHELD #01</span>
                </div>
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5" /> 100% OFFLINE MODE
                </span>
              </div>

              {/* Device Mockup Screen Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Left: Interactive Scan Telemetry Screen */}
                <div className="p-5 rounded-2xl bg-gray-950 border border-emerald-500/30 font-mono text-xs">
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mb-2">
                    <span>STATUS POSKO GERBANG</span>
                    <span className="text-emerald-400 font-bold">READY TO TAP</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold text-center mb-3">
                    [ NFC / QR GATE SCAN ACTIVE ]
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tiket Terakhir:</span>
                      <span className="text-white font-bold">#TWA-QR-98214</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Waktu Validasi:</span>
                      <span className="text-emerald-400 font-bold">0.28 Detik (HMAC OK)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nama Pendaki:</span>
                      <span className="text-white font-semibold">Deryl Fabiensyah</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sesi Kunjungan:</span>
                      <span className="text-amber-300">Sunrise (06:00 - 11:00)</span>
                    </div>
                  </div>
                </div>

                {/* Right: Step-by-Step Crypto Alur Kerja */}
                <div className="space-y-3 font-sans">
                  {[
                    {
                      title: '01. Basecamp Sync (Pagi)',
                      desc: 'Unduh manifes tiket harian terenkripsi saat di basecamp bersinyal/Wi-Fi.'
                    },
                    {
                      title: '02. Validasi < 0.28 Detik',
                      desc: 'Scanner memeriksa tanda tangan digital NFC & QR secara lokal di pintu hutan tanpa delay.'
                    },
                    {
                      title: '03. Auto-Batch Upload',
                      desc: 'Riwayat scan otomatis tersinkron ke cloud saat ranger kembali ke zona sinyal.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/5 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-gray-300 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-between text-xs sm:text-sm font-mono text-gray-300 gap-3">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Enkripsi 256-Bit Standar Perbankan</span>
            </div>
            <div className="text-emerald-400 font-bold">
              ZERO TICKET FRAUD GUARANTEE
            </div>
          </div>
        </div>

        {/* COMPACT BENTO CARD (4 cols): Active Field Telemetry & Power Specs */}
        <div className="lg:col-span-4 p-10 sm:p-12 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-6">
              <BatteryCharging className="w-4 h-4 text-emerald-700" />
              <span>Daya & Ketahanan Gawai</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit'] mb-4 leading-snug">
              14 Jam Operasional Tanpa Listrik
            </h3>

            <p className="text-[#212529] text-sm sm:text-base leading-relaxed font-medium mb-8">
              Handheld Gate Scanner kami dilengkapi baterai industri 6000 mAh dan chip NFC hemat daya untuk bertugas di posko pendakian tertinggi.
            </p>

            <div className="space-y-4 font-mono text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-gray-50 shadow-xs flex items-center justify-between">
                <span className="text-[#212529] font-medium">Respons Scan NFC:</span>
                <span className="font-bold text-gray-900">0.28 Detik</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 shadow-xs flex items-center justify-between">
                <span className="text-[#212529] font-medium">Kapasitas Memory Offline:</span>
                <span className="font-bold text-gray-900">250.000 Tiket</span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 shadow-xs flex items-center justify-between">
                <span className="text-[#212529] font-medium">Sertifikasi Outdoor:</span>
                <span className="font-bold text-emerald-700">IP68 / Drop-Proof 1.5m</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-100 text-xs sm:text-sm text-[#212529] font-semibold italic leading-relaxed">
            "Petugas Ranger hutan tidak pernah kehilangan riwayat scan tiket walau baterai cadangan baru diganti sore hari."
          </div>
        </div>

      </div>

      {/* BENTO GRID ROW 2: USP SPOTLIGHT #2 — KLHK CARRYING CAPACITY (7 cols) + PEMBERDAYAAN ADDON BUNDLING (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        
        {/* COMPACT BENTO CARD (5 cols): Pemberdayaan Pokdarwis (Rentals, Ranger, Asuransi) */}
        <div className="lg:col-span-5 p-10 sm:p-12 rounded-3xl bg-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-900 text-xs font-bold mb-6">
              <Tent className="w-4 h-4 text-teal-700" />
              <span>Pemberdayaan Warga Lokal</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit'] mb-4 leading-snug">
              Penyewaan Alat & Pemandu dalam 1 Barcode Tiket
            </h3>

            <p className="text-[#212529] text-sm sm:text-base leading-relaxed font-medium mb-8">
              Tingkatkan pendapatan kawasan sekaligus berdayakan UMKM sekitar. Wisatawan menyewa tenda, memesan jasa pemandu gunung, dan membayar asuransi kecelakaan resmi sekaligus.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gray-50 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Tent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">Tenda Dome + Sleeping Bag</div>
                    <div className="text-xs text-[#212529] font-medium">Inventaris alat terikat barcode</div>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full">
                  +Rp 75.000
                </span>
              </div>

              <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gray-50 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">Ranger Gunung Pokdarwis</div>
                    <div className="text-xs text-[#212529] font-medium">Sertifikasi keselamatan resmi</div>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full">
                  +Rp 150.000
                </span>
              </div>

              <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gray-50 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">Asuransi Kecelakaan Resmi</div>
                    <div className="text-xs text-[#212529] font-medium">Perlindungan jiwa pendakian</div>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full">
                  +Rp 5.000
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-800">
            <span>Satu Barcode Untuk Seluruh Layanan</span>
            <span className="underline">Lihat Modul Kasir →</span>
          </div>
        </div>

        {/* HERO BENTO CARD 2 (7 cols): KLHK Conservation Carrying Capacity */}
        <div className="lg:col-span-7 p-10 sm:p-12 lg:p-14 rounded-3xl bg-emerald-900 text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-200 text-xs font-bold font-mono uppercase">
                <Trees className="w-4 h-4" />
                <span>KEUNGGULAN UTAMA (USP) #2 — KONSISTENSI ALAM</span>
              </div>
              <span className="text-xs font-bold text-emerald-950 bg-emerald-300 px-3.5 py-1.5 rounded-full">
                STANDAR TAMAN NASIONAL
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Outfit'] text-white mb-5 leading-tight">
              Monitor Daya Dukung Lingkungan (Carrying Capacity KLHK)
            </h3>

            <p className="text-emerald-100 text-base sm:text-lg leading-relaxed font-medium mb-10">
              Mencegah kerusakan alam akibat overtourism. Sistem Passify secara otomatis mengunci penjualan tiket apabila kuota sesi pagi atau sore telah melampaui batas aman ekosistem yang ditetapkan oleh balai konservasi.
            </p>

            {/* Carrying Capacity Visual Progress */}
            <div className="p-8 rounded-3xl bg-emerald-950/90 shadow-xl mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs sm:text-sm text-emerald-300 font-semibold uppercase tracking-wide">Kuota Pengunjung Jalur Pendakian</span>
                <span className="text-xl font-extrabold text-white font-['Outfit']">142 / 200 Pendaki</span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-emerald-950 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500" style={{ width: '71%' }} />
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-emerald-300 mt-3 font-medium">
                <span>Sesi Pagi (06:00 - 11:00)</span>
                <span>Tersisa 58 Kuota Konservasi</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-center">
              <div className="p-5 rounded-2xl bg-emerald-950/60 shadow-md">
                <div className="text-xs sm:text-sm text-emerald-300 font-medium">Retribusi Daerah</div>
                <div className="text-lg font-bold text-white mt-1.5 font-mono">Rp 710.000</div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-950/60 shadow-md">
                <div className="text-xs sm:text-sm text-emerald-300 font-medium">Kas Desa / PNBP</div>
                <div className="text-lg font-bold text-white mt-1.5 font-mono">Rp 1.420.000</div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-950/60 shadow-md col-span-2 sm:col-span-1">
                <div className="text-xs sm:text-sm text-emerald-300 font-medium">Indeks Konservasi</div>
                <div className="text-lg font-bold text-emerald-400 mt-1.5">98.4% (Aman)</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-emerald-800/80 mt-8 flex items-center justify-between text-xs sm:text-sm font-mono text-emerald-200">
            <span>Satu Pintu KLHK • Pemisahan Rekonsiliasi Otomatis</span>
            <span className="text-white font-bold">100% COMPLIANT</span>
          </div>
        </div>

      </div>
    </section>
  );
}

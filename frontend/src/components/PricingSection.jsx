import React, { useState } from 'react';
import { Check, Sparkles, Building2, Ticket, Calculator, ArrowRight, ShieldCheck, HelpCircle, TrendingUp, Sliders } from 'lucide-react';

export default function PricingSection() {
  const [monthlyTickets, setMonthlyTickets] = useState(5000);
  const [ticketPrice, setTicketPrice] = useState(25000);

  // Perhitungan Bagi Hasil: Rp 1.500 per tiket
  const passifyFeePerTicket = 1500;
  const totalGrossRevenue = monthlyTickets * ticketPrice;
  const totalPassifyFee = monthlyTickets * passifyFeePerTicket;
  const totalNetRevenue = totalGrossRevenue - totalPassifyFee;

  return (
    <section id="pricing-section" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <Ticket className="w-3.5 h-3.5 text-emerald-700" />
          <span>Model Harga Khusus Wisata Alam (Bagi Hasil)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight mb-4">
          Tanpa Beban Biaya Bulanan saat Low-Season
        </h2>
        <p className="text-[#212529] text-base sm:text-lg leading-relaxed font-medium">
          Kami memahami tantangan pasang surut musim liburan. Anda tidak perlu membayar langganan server bulanan berbiaya tinggi saat jumlah pengunjung menurun.
        </p>
      </div>

      {/* INTERACTIVE REVENUE-SHARE SLIDER SIMULATOR - Tanpa Outline */}
      <div className="mb-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 uppercase">
                <Sliders className="w-4 h-4" />
                <span>KALKULATOR BAGI HASIL INTERAKTIF</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white mt-1">
                Simulasikan Pendapatan Bersih Kawasan Anda
              </h3>
            </div>
            <span className="text-xs font-bold bg-emerald-500 text-gray-950 px-3.5 py-1.5 rounded-full shadow-md">
              Hanya Rp 1.500 / Tiket Terjual
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Responsive Range Sliders */}
            <div className="lg:col-span-7 space-y-8">
              {/* Slider 1: Monthly Tickets */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="tickets-slider" className="text-sm font-semibold text-gray-200">
                    Perkiraan Tiket Terjual per Bulan:
                  </label>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {monthlyTickets.toLocaleString('id-ID')} Tiket
                  </span>
                </div>
                <input
                  id="tickets-slider"
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={monthlyTickets}
                  onChange={(e) => setMonthlyTickets(Number(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-medium mt-1">
                  <span>500 (Low Season)</span>
                  <span>25.000 (Normal)</span>
                  <span>50.000+ (High Season)</span>
                </div>
              </div>

              {/* Slider 2: Ticket Price */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="price-slider" className="text-sm font-semibold text-gray-200">
                    Harga Tiket Masuk Kawasan:
                  </label>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    Rp {ticketPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <input
                  id="price-slider"
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-gray-400 font-medium mt-1">
                  <span>Rp 5.000 (Desa Wisata)</span>
                  <span>Rp 25.000 (TWA)</span>
                  <span>Rp 150.000 (Camping / Premium)</span>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Profit Calculation Breakdown Cards - Tanpa Outline */}
            <div className="lg:col-span-5">
              <div className="p-6 rounded-2xl bg-white/5 shadow-lg space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-300 font-medium">Estimasi Omzet Bruto:</span>
                  <span className="font-mono text-gray-200 font-semibold">
                    Rp {totalGrossRevenue.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-emerald-400">
                  <span className="font-medium">Biaya Bagi Hasil Passify (Rp 1.500/tkt):</span>
                  <span className="font-mono font-bold">
                    - Rp {totalPassifyFee.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-4">
                  <div className="text-xs text-gray-300 font-semibold uppercase tracking-wider">
                    Pendapatan Bersih Pengelola / Pokdarwis:
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Outfit'] mt-1">
                    Rp {totalNetRevenue.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-gray-300 font-medium mt-1">
                    *Sudah termasuk server cloud offline, auto-backup, & maintenance SLA.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pricing Tiers Cards — TANPA OUTLINE/BORDER, HANYA ELEGAN SHADOW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Bagi Hasil per Tiket */}
        <div className="p-8 rounded-3xl bg-white shadow-2xl relative flex flex-col justify-between">
          <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
            Rekomendasi Guru / Terpopuler
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
              PAKET BAGI HASIL WISATA
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-['Outfit']">
              Revenue Share
            </h3>
            <p className="text-[#212529] text-sm font-medium mt-2 leading-relaxed">
              Pilihan tepat untuk Pokdarwis, Desa Wisata, dan Taman Wisata Alam yang ingin bebas dari beban abonemen bulanan.
            </p>

            <div className="my-6">
              <span className="text-4xl font-extrabold text-gray-900 font-['Outfit']">Rp 1.500</span>
              <span className="text-gray-700 text-sm font-semibold"> / tiket terjual</span>
              <div className="text-xs text-emerald-700 font-bold mt-1">
                Rp 0 / bulan jika tidak ada pengunjung
              </div>
            </div>

            <ul className="space-y-3 my-6 pt-6">
              {[
                'Semua Fitur E-Ticketing & Kuota Konservasi',
                'Modul Offline-First untuk Gerbang Tanpa Sinyal',
                'Dukungan QRIS Dinamis & Settlement Finansial',
                'Tanpa Batasan Jumlah Petugas & Ranger'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-semibold text-gray-800">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Passify,%20kami%20ingin%20memilih%20Paket%20Bagi%20Hasil%20Rp%201.500"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm text-center block shadow-md transition-all"
          >
            Pilih Paket Bagi Hasil
          </a>
        </div>

        {/* Card 2: Pro Annual (Flat) */}
        <div className="p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              KAWASAN PADAT & KOMERSIAL
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-['Outfit']">
              Pro Annual Server
            </h3>
            <p className="text-gray-700 text-sm font-medium mt-2 leading-relaxed">
              Untuk objek wisata dengan kapasitas di atas 100.000 pengunjung/bulan yang ingin biaya server tahunan flat.
            </p>

            <div className="my-6">
              <span className="text-4xl font-extrabold text-gray-900 font-['Outfit']">Rp 3,8 Jt</span>
              <span className="text-gray-700 text-sm font-semibold"> / bulan</span>
              <div className="text-xs text-gray-700 font-medium mt-1">
                Ditagihkan tahunan — Rp 0 biaya bagi hasil
              </div>
            </div>

            <ul className="space-y-3 my-6 pt-6">
              {[
                'Semua fitur Paket Bagi Hasil (Tanpa Potongan Tiket)',
                'Dukungan White-Label Domain & Portal Resmi',
                '2 Unit Handheld Rugged Scanner Android',
                'SLA Uptime 99.9% & Prioritas Support 24/7'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-semibold text-gray-800">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Passify,%20kami%20tertarik%20dengan%20Paket%20Pro%20Annual"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm text-center block shadow-md transition-all"
          >
            Konsultasi Paket Pro
          </a>
        </div>

        {/* Card 3: B2G Pemerintah */}
        <div className="p-8 rounded-3xl bg-gray-950 text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              INSTANSI, KLHK, & PEMDA
            </div>
            <h3 className="text-2xl font-bold font-['Outfit']">
              B2G Enterprise
            </h3>
            <p className="text-gray-300 text-sm font-normal mt-2 leading-relaxed">
              Solusi kustom untuk Kementerian Kehutanan, Balai Besar KSDA, atau Pemerintah Daerah dengan kebutuhan On-Premise.
            </p>

            <div className="my-6">
              <span className="text-3xl font-extrabold font-['Outfit']">Kustom B2G</span>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                Sesuai anggaran retribusi daerah / e-Katalog
              </div>
            </div>

            <ul className="space-y-3 my-6 pt-6">
              {[
                'Kustomisasi integrasi PNBP & Satu Pintu KLHK',
                'Opsi Server Lokal (On-Premise) / Sovereign Cloud',
                'Sertifikasi ISO/IEC 27001 & BI-FAST QRIS',
                'Pelatihan Petugas & Pengawasan Berkelanjutan'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm font-normal text-gray-200">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Tim%20Passify,%20kami%20ingin%20berdiskusi%20untuk%20proyek%20B2G/Pemerintah"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm text-center block shadow-md transition-all"
          >
            Hubungi Tim B2G
          </a>
        </div>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { Compass, ArrowUpRight, ShieldCheck, Building2, Ticket, Sparkles, Award, Landmark, Trees, Shield, Cpu, WifiOff, Users, TrendingUp, CheckCircle2, RefreshCw, BarChart3, Activity } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  const [liveVisitors, setLiveVisitors] = useState(1420);
  const [liveRevenue, setLiveRevenue] = useState(35500000);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(2);

  // Micro-simulation ticker for the dashboard mockup to feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveVisitors((prev) => (prev < 1980 ? prev + 1 : prev));
      setLiveRevenue((prev) => prev + 25000);
      setLastSyncSeconds((prev) => (prev > 1 ? prev - 1 : 4));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-28 pb-20 px-4 lg:px-8 bg-gradient-to-b from-emerald-50/70 via-white to-stone-50/40 overflow-hidden">
      {/* Soft Ambient Emerald Glow */}
      <div className="absolute top-0 right-10 w-[600px] h-[350px] bg-gradient-to-l from-emerald-400/20 via-teal-400/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* SPLIT-SCREEN LAYOUT: LEFT (Human-Centric Copy & CTA), RIGHT (Live Dashboard Mockup) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center mb-16">
          
          {/* LEFT COLUMN: Human-Centric Copywriting (6 cols) */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Top Audience Pill - No Outline */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-md text-emerald-900 text-xs font-bold uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SaaS White-Label E-Ticketing & Manajemen Wisata Alam (B2B / B2G)</span>
            </div>

            {/* Concise & Powerful Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] font-['Outfit'] text-gray-900">
              Digitalisasi Wisata Alam: <br />
              <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                Satu Dasbor untuk Tiket, Kuota, & Pos Gerbang.
              </span>
            </h1>

            {/* High-Contrast Human-Centric Copywriting (#212529) */}
            <p className="text-[#212529] text-base sm:text-lg leading-relaxed font-medium">
              Solusi terbukti untuk Pengelola Taman Nasional, BKSDA, dan Pokdarwis. Mencegah kebocoran tiket, membatasi kuota konservasi alam secara otomatis, serta bekerja lancar 100% tanpa sinyal internet di pegunungan maupun pedalaman hutan.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                id="hero-saas-pricing-btn"
                onClick={() => handleScrollToSection('pricing-section')}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white font-bold text-sm hover:from-emerald-800 hover:to-gray-900 transition-all duration-200 shadow-xl group"
              >
                <Building2 className="w-4 h-4 text-emerald-300 group-hover:text-white" />
                <span>Lihat Solusi & Harga (Pengelola)</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                id="hero-tourist-demo-btn"
                onClick={() => {
                  const catalogEl = document.getElementById('catalog-section');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                  else if (onExploreClick) onExploreClick();
                }}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white hover:bg-gray-50 text-gray-900 font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>Coba Demo Beli Tiket (Wisatawan)</span>
              </button>
            </div>

            {/* Key Value Highlights - AAA Readability (#1f2937) */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { label: 'Kecepatan Scan Gate', val: '< 0.28 Detik' },
                { label: 'Operasional Offline', val: '100% Tanpa Sinyal' },
                { label: 'Beban Langganan', val: 'Rp 0 (Bagi Hasil)' },
              ].map((k, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white shadow-md">
                  <div className="text-base sm:text-lg font-extrabold text-gray-900 font-['Outfit']">
                    {k.val}
                  </div>
                  <div className="text-xs font-semibold text-gray-800 mt-0.5">
                    {k.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive SaaS Dashboard Mockup & Hardware Badge (6 cols) */}
          <div className="lg:col-span-6 relative">
            {/* The Dashboard Card Container - Zero Outline */}
            <div className="rounded-3xl bg-gray-950 text-white p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              {/* Subtle accent header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 ml-2 tracking-wide">
                    PASSIFY CLOUD OS v4.2 • CONSOLE BKSDA / POKDARWIS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE SYNC: {lastSyncSeconds}s AGO</span>
                </div>
              </div>

              {/* Dashboard Main Visual Widgets */}
              <div className="space-y-4 font-mono">
                {/* Top Row: Carrying Capacity Gauge & Gate Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Widget 1: Kuota Konservasi KLHK */}
                  <div className="p-4 rounded-2xl bg-white/5 shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Kuota Konservasi Sesi Pagi</span>
                      <span className="text-xs font-bold text-emerald-400">AMAN (71%)</span>
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xl font-extrabold text-white font-['Outfit'] font-sans">
                        {liveVisitors.toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-gray-400 font-sans">/ 2.000 Max Pendaki</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: '71%' }} />
                    </div>
                  </div>

                  {/* Widget 2: Offline Gate Scanner Telemetry */}
                  <div className="p-4 rounded-2xl bg-white/5 shadow-md flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Gerbang Offline-First #01</span>
                      <WifiOff className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white font-sans">
                        HMAC SHA-256 TOTP
                      </div>
                      <div className="text-[11px] text-emerald-300 font-sans mt-0.5">
                        Kecepatan Scan QR: 0.28 Detik • Anti-Tiket Palsu
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Baterai Scanner 94% (14 Jam Operational)</span>
                    </div>
                  </div>
                </div>

                {/* Middle Row: Revenue Share Real-Time Counter */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-emerald-300 font-sans uppercase font-bold">
                        Akumulasi Omzet Hari Ini (Real-Time Audit BI)
                      </div>
                      <div className="text-2xl font-extrabold text-white font-['Outfit'] font-sans mt-0.5">
                        Rp {liveRevenue.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-[10px] text-gray-400 font-sans">Bagi Hasil Pokdarwis (Rp 1.500/tkt)</div>
                      <div className="text-lg font-bold text-emerald-400 font-['Outfit'] font-sans">
                        Rp {(liveVisitors * 1500).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Hardware Ecosystem Preview Card - Floating Inside Dashboard */}
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/rfid_wristband_mockup.jpg"
                      alt="Gelang RFID Passify"
                      className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                    />
                    <div className="font-sans">
                      <div className="text-xs font-bold text-white">
                        Gelang RFID IP68 & E-Kiosk Ready
                      </div>
                      <div className="text-[11px] text-emerald-300">
                        Tiket tahan air & dompet cashless untuk alam bebas
                      </div>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-500 text-gray-950 px-2.5 py-1 rounded-full font-sans">
                    HARDWARE NYATA
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-4 text-[11px] text-gray-400 font-sans italic text-center">
                *Tampilan dasbor riil yang digunakan oleh Kepala Balai KSDA, Kemenhut, & Ketua Pokdarwis.
              </div>
            </div>
          </div>
        </div>

        {/* THE HUMAN TOUCH: National Compliance & Client Badges (Below Split-Screen) - ZERO OUTLINE */}
        <div className="pt-8 pb-4">
          <div className="text-xs font-extrabold text-gray-800 uppercase tracking-widest text-center mb-6">
            DIPERCAYA OLEH KAWASAN KONSERVASI & PATUH REGULASI NASIONAL
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 items-center justify-center max-w-5xl mx-auto">
            {[
              {
                name: 'Kemenhut / KLHK',
                sub: 'Satu Pintu E-Ticketing',
                icon: <Trees className="w-5 h-5 text-emerald-700" />,
                bg: 'bg-emerald-50/90 text-emerald-950'
              },
              {
                name: 'Kemenparekraf RI',
                sub: 'Digitalisasi Desa Wisata',
                icon: <Award className="w-5 h-5 text-teal-700" />,
                bg: 'bg-teal-50/90 text-teal-950'
              },
              {
                name: 'BKSDA Indonesia',
                sub: 'Konservasi Cagar Alam',
                icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
                bg: 'bg-emerald-50/90 text-emerald-950'
              },
              {
                name: 'Pokdarwis Nusantara',
                sub: 'Wisata Berbasis Warga',
                icon: <Landmark className="w-5 h-5 text-amber-700" />,
                bg: 'bg-amber-50/90 text-amber-950'
              },
              {
                name: 'QRIS Bank Indonesia',
                sub: 'Keamanan BI-FAST',
                icon: <Shield className="w-5 h-5 text-blue-700" />,
                bg: 'bg-blue-50/90 text-blue-950 col-span-2 sm:col-span-1'
              }
            ].map((client, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl ${client.bg} shadow-md hover:shadow-lg transition-all duration-200`}
              >
                <div className="mb-1.5">{client.icon}</div>
                <div className="text-xs font-bold leading-tight text-center font-['Outfit']">
                  {client.name}
                </div>
                <div className="text-[11px] font-semibold text-center mt-0.5 opacity-90">
                  {client.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

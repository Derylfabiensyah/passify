import React from 'react';
import { Cpu, Radio, Terminal, ScanLine, QrCode, CheckCircle2, ShieldCheck, ArrowRight, Zap, Award } from 'lucide-react';

export default function HardwareIntegrationSection() {
  const hardwareShowcases = [
    {
      id: 'handheld-scanner',
      name: 'Handheld Offline Gate Scanner',
      tagline: 'Gawai Pemindai untuk Ranger & Pos Gerbang',
      badge: 'RUGGED ANDROID — BATERAI 6000mAh',
      image: '/handheld_scanner_mockup.jpg',
      description: 'Perangkat genggam tahan banting yang dirancang untuk petugas gerbang di titik pendakian atau hutan rimba. Mampu memindai QR Code e-Ticket secara lokal tanpa sambungan internet dengan respons super cepat.',
      specs: [
        'Baterai tahan hingga 14 jam operasional nonstop di lapangan',
        'Konektivitas offline murni dengan enkripsi lokal ganda HMAC SHA-256',
        'Sertifikasi tahan jatuh (Drop Proof 1.5 Meter) & layar tahan gores'
      ],
      imageLeft: true
    }
  ];

  return (
    <section id="hardware-integration" className="py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header with Spacious Executive Padding */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
          <Terminal className="w-4 h-4 text-emerald-700" />
          <span>Ekosistem Perangkat Fisik (IoT Ready)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight mb-5 leading-tight">
          Perangkat Keras Siap Pakai di Gerbang Wisata
        </h2>
        <p className="text-[#212529] text-base sm:text-lg leading-relaxed font-medium">
          Tidak sekadar narasi perangkat keras abstrak. Berikut adalah spesifikasi nyata gawai pemindai offline yang siap kami deploy ke titik loket dan pos gerbang kawasan wisata Anda.
        </p>
      </div>

      {/* Alternating Showcase with Spacious Cards (p-10 sm:p-12 lg:p-14) */}
      <div className="space-y-20">
        {hardwareShowcases.map((hw, index) => (
          <div
            key={hw.id}
            className="p-10 sm:p-12 lg:p-14 rounded-3xl bg-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
          >
            {/* Image Column - Tanpa Outline/Border */}
            <div
              className={`lg:col-span-6 ${
                hw.imageLeft ? 'order-1' : 'order-1 lg:order-2'
              }`}
            >
              <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
                <img
                  src={hw.image}
                  alt={hw.name}
                  className="w-full h-[340px] sm:h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-emerald-300 bg-gray-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xs">
                    {hw.badge}
                  </span>
                  <span className="text-[11px] font-bold text-white bg-emerald-700 px-3 py-1.5 rounded-full shadow-md">
                    PRODUK NYATA PASSIFY
                  </span>
                </div>
              </div>
            </div>

            {/* Text & Specs Column with Generous Spacing */}
            <div
              className={`lg:col-span-6 space-y-6 ${
                hw.imageLeft ? 'order-2' : 'order-2 lg:order-1'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold shadow-xs">
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>{hw.tagline}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 font-['Outfit'] leading-tight">
                {hw.name}
              </h3>

              <p className="text-[#212529] text-base sm:text-lg leading-relaxed font-medium">
                {hw.description}
              </p>

              <div className="space-y-4 pt-3">
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                  Spesifikasi Teknis & Keunggulan:
                </div>
                {hw.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-[#212529] font-medium text-sm sm:text-base leading-relaxed">
                      {spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hardware Guarantee Callout with Generous Spacing */}
      <div className="mt-20 p-10 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-950 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
              <Award className="w-4 h-4" />
              <span>Sewa atau Beli Hardware Tanpa Ribet</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
              Dukungan Garansi Ganti Baru & Maintenance Lapangan
            </h3>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
              Setiap perangkat yang dikirim ke Taman Nasional atau kawasan wisata alam mendapat dukungan perawatan bulanan serta penggantian langsung apabila terjadi kerusakan teknis di lokasi.
            </p>
          </div>
          <a
            href="#pricing-section"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg flex-shrink-0"
          >
            <span>Paket Bundling Hardware</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

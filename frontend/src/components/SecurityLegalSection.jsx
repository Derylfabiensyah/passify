import React from 'react';
import { ShieldCheck, Landmark, FileText, Lock, CheckCircle2, Award, Scale, FileSpreadsheet } from 'lucide-react';

export default function SecurityLegalSection() {
  const compliancePillars = [
    {
      icon: <Landmark className="w-5 h-5 text-gray-900" />,
      title: 'Kepatuhan Satu Pintu Kemenhut / KLHK',
      badge: 'Standar Taman Nasional',
      description: 'Sistem e-Ticketing Passify mematuhi regulasi Kementerian Kehutanan dan KLHK mengenai pembatasan kuota konservasi dan manajemen satu pintu (Single-Window Entrance).'
    },
    {
      icon: <Lock className="w-5 h-5 text-gray-900" />,
      title: 'Keamanan Data ISO/IEC 27001 & QRIS BI',
      badge: 'Keamanan Finansial',
      description: 'Seluruh transmisi data pengunjung, enkripsi transaksi tiket, dan integrasi pembayaran QRIS mematuhi standar perbankan Bank Indonesia dan Undang-Undang Perlindungan Data Pribadi (UU PDP).'
    },
    {
      icon: <Scale className="w-5 h-5 text-gray-900" />,
      title: 'Rekonsiliasi PNBP & Retribusi Daerah',
      badge: 'B2G / Pemerintah Daerah',
      description: 'Pemisahan otomatis dana Pendapatan Negara Bukan Pajak (PNBP), Pajak Barang dan Jasa Tertentu (PBJT/Pajak Hiburan Daerah), serta bagi hasil Pokdarwis dalam satu laporan audit.'
    },
    {
      icon: <FileSpreadsheet className="w-5 h-5 text-gray-900" />,
      title: 'Audit Trail Anti-Kebocoran Tiket',
      badge: 'Transparansi Penuh',
      description: 'Catatan log transaksi permanen yang tidak dapat dimanipulasi oleh petugas loket lapangan, mencegah kerugian kebocoran tiket secara signifikan.'
    }
  ];

  return (
    <section id="security-legal" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold mb-3 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Keamanan, Kepatuhan Regulasi, & Standar B2G</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Outfit'] tracking-tight mb-4">
          Siap untuk Instansi Pemerintah & Taman Nasional
        </h2>
        <p className="text-[#212529] text-sm sm:text-base leading-relaxed font-medium">
          Keamanan finansial dan kepatuhan hukum adalah prioritas tertinggi. Passify siap diimplementasikan untuk proyek B2G (Business to Government), BKSDA, dan BUMDes/Pokdarwis di seluruh Indonesia.
        </p>
      </div>

      {/* Pillars Grid - Tanpa Outline/Border */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {compliancePillars.map((item, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center shadow-xs">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                {item.badge}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 font-['Outfit'] mb-2">
              {item.title}
            </h3>
            <p className="text-xs text-[#212529] font-medium leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Trust & Certification Footer Banner - Tanpa Outline/Border */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white font-['Outfit']">
              Dukungan Kustomisasi SLA & On-Premise Cloud
            </div>
            <div className="text-xs text-gray-300 font-medium mt-0.5">
              Untuk instansi kementerian atau Dinas Pariwisata yang membutuhkan dedicated server lokal.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-900 bg-emerald-300 px-4 py-2 rounded-full shadow-md">
            SLA Uptime 99.9%
          </span>
          <span className="text-xs font-bold text-emerald-900 bg-emerald-300 px-4 py-2 rounded-full shadow-md">
            Enkripsi BI-FAST
          </span>
        </div>
      </div>
    </section>
  );
}

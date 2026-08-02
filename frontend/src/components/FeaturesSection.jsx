import React from 'react';
import { WifiOff, Wallet, Landmark, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-gray-900" />,
      title: "Dynamic Carrying Capacity",
      desc: "Batasi kuota kunjungan harian & per sesi waktu secara otomatis berbasis daya dukung lingkungan untuk setiap venue klien."
    },
    {
      icon: <WifiOff className="w-5 h-5 text-gray-900" />,
      title: "Offline-First Gate Validation",
      desc: "Perangkat scanner gerbang tetap bekerja akurat di area tanpa sinyal dengan protokol kriptografi HMAC TOTP offline."
    },
    {
      icon: <Wallet className="w-5 h-5 text-gray-900" />,
      title: "White-Label Cashless Ecosystem",
      desc: "Dompet digital terintegrasi untuk transaksi F&B, penyewaan alat, dan suvenir di seluruh merchant dalam kawasan wisata."
    },
    {
      icon: <Landmark className="w-5 h-5 text-gray-900" />,
      title: "Automated Multi-Party Payouts",
      desc: "Rekonsiliasi dan pencairan dana pendapatan tiket serta bagi hasil UMKM secara transparan ke rekening pengelola."
    }
  ];

  return (
    <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto border-t border-gray-100">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2">
          Arsitektur SaaS Khusus Wisata Alam
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Outfit'] tracking-tight mb-4">
          Modul Teknologi Pengelola Kawasan
        </h2>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          Didesain secara modular agar dapat disesuaikan dengan identitas brand (White-Label) dan regulasi pengelola taman wisata alam.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="p-8 rounded-2xl bg-gray-50/60 border border-gray-100/80 hover:bg-white hover:border-gray-200/80 transition-all duration-300 hover:shadow-sm"
          >
            <div className="w-11 h-11 rounded-full bg-white border border-gray-200/60 flex items-center justify-center mb-6 shadow-2xs">
              {feat.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-['Outfit'] mb-2">{feat.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

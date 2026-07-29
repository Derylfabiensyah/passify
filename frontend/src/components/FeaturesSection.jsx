import React from 'react';
import { ShieldCheck, WifiOff, Wallet, Landmark, Smartphone, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Carrying Capacity Control",
      desc: "Batasi jumlah kunjungan per hari & per sesi waktu secara presisi untuk menjaga kelestarian ekosistem alam."
    },
    {
      icon: <WifiOff className="w-6 h-6 text-emerald-400" />,
      title: "Offline-First Gate Scanner",
      desc: "Gate scanner tetap bekerja cepat & akurat meski tanpa sinyal seluler di hutan/pegunungan dengan enkripsi HMAC TOTP."
    },
    {
      icon: <Wallet className="w-6 h-6 text-emerald-400" />,
      title: "Passify Cashless Venue Wallet",
      desc: "Wisatawan belanja F&B, sewa tenda, atau merchandise di stand pedagang cukup dengan scan QR dompet digital."
    },
    {
      icon: <Landmark className="w-6 h-6 text-emerald-400" />,
      title: "Automatic Payout & Settlement",
      desc: "Pencairan dana penjualan tiket & hasil usaha tenant secara otomatis dan transparan ke rekening bank pengelola."
    }
  ];

  return (
    <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-emerald-400 font-semibold text-xs uppercase tracking-widest mb-2">
          Platform SaaS Khusus Wisata Alam
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] mb-4">
          Solusi Teknologi Lengkap Pengelola Destinasi
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Dirancang khusus untuk memodernisasi tata kelola ticketing, kenyamanan pengunjung, dan efisiensi operasional gerbang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => (
          <div key={idx} className="glass-panel p-6 flex flex-col justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              {feat.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

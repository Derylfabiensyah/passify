import React from 'react';
import { WifiOff, Wallet, Landmark, Zap } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      title: "Carrying Capacity Control",
      desc: "Batasi jumlah kunjungan per hari & per sesi waktu secara presisi untuk menjaga kelestarian ekosistem alam."
    },
    {
      icon: <WifiOff className="w-5 h-5 text-emerald-500" />,
      title: "Offline-First Gate Scanner",
      desc: "Gate scanner tetap bekerja cepat & akurat meski tanpa sinyal seluler di hutan/pegunungan dengan enkripsi HMAC TOTP."
    },
    {
      icon: <Wallet className="w-5 h-5 text-emerald-500" />,
      title: "Passify Cashless Venue Wallet",
      desc: "Wisatawan belanja F&B, sewa tenda, atau merchandise di stand pedagang cukup dengan scan QR dompet digital."
    },
    {
      icon: <Landmark className="w-5 h-5 text-emerald-500" />,
      title: "Automatic Payout & Settlement",
      desc: "Pencairan dana penjualan tiket & hasil usaha tenant secara otomatis dan transparan ke rekening bank pengelola."
    }
  ];

  return (
    <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-2">
          Platform SaaS Khusus Wisata Alam
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100 font-['Outfit'] mb-4">
          Solusi Teknologi Lengkap Pengelola Destinasi
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Dirancang khusus untuk memodernisasi tata kelola ticketing, kenyamanan pengunjung, dan efisiensi operasional gerbang.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => (
          <div key={idx} className="card p-6 flex flex-col justify-between bg-zinc-900/40 border-zinc-800">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              {feat.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">{feat.title}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

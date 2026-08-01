import React, { useState } from 'react';
import { Radio, QrCode, RotateCcw, ArrowRight, ShieldCheck, CheckCircle2, ShoppingBag, Coffee, Sparkles } from 'lucide-react';

export default function CashlessEcosystemSection({ onOpenWallet }) {
  const [activeTab, setActiveTab] = useState('nfc'); // 'nfc' | 'fnb' | 'refund'
  const [demoTapSuccess, setDemoTapSuccess] = useState(false);

  const handleDemoTap = () => {
    setDemoTapSuccess(true);
    setTimeout(() => setDemoTapSuccess(false), 2500);
  };

  const pillars = [
    {
      id: 'nfc',
      title: 'NFC Wristband Sync',
      subtitle: 'Ditautkan langsung di gerbang masuk',
      icon: <Radio className="w-5 h-5 text-emerald-500" />,
      description:
        'Setiap pengunjung ditautkan dengan gelang NFC di gerbang masuk untuk akses gate dan identitas cashless yang aman tanpa sinyal seluler.',
      features: [
        'Sinkronisasi gelang dalam < 0.5 detik saat pemindai e-Ticket',
        'Tanpa baterai, tahan air (Waterproof IP68) untuk mendaki & basah-basahan',
        'Enkripsi UID anti-kloning & pengamanan sesi harian'
      ]
    },
    {
      id: 'fnb',
      title: 'F&B / Merch Payment',
      subtitle: 'Belanja tanpa uang tunai di lokasi',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
      description:
        'Transaksi di booth vendor dilakukan dengan melakukan tap gelang NFC atau scan QR Wallet tanpa memerlukan uang tunai.',
      features: [
        'Bayar kopi, mi hangat, sewa tenda, atau suvenir dengan sekali tap',
        'Kasir tenant bekerja offline-first dengan sinkronisasi batch malam hari',
        'Struk digital tercatat otomatis di akun aplikasi pengunjung'
      ]
    },
    {
      id: 'refund',
      title: 'Refund & Payout Otomatis',
      subtitle: 'Pengembalian sisa saldo pasca-kunjungan',
      icon: <RotateCcw className="w-5 h-5 text-emerald-500" />,
      description:
        'Sisa saldo wallet pengguna dapat ditarik kembali (refund) secara otomatis setelah event selesai ke rekening bank atau e-Wallet.',
      features: [
        'Zero-fee instant refund ke BCA, Mandiri, BRI, GoPay, OVO, & Dana',
        'Opsi refund otomatis terjadwal H+1 setelah kunjungan berakhir',
        'Rekonsiliasi saldo transparan untuk wisatawan dan pengelola'
      ]
    }
  ];

  const currentPillar = pillars.find((p) => p.id === activeTab);

  return (
    <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-emerald-500 font-semibold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="status-dot" />
            <span>C. Ekosistem Cashless Venue (NFC & QR Wallet)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-100 font-['Outfit']">
            Transaksi Tanpa Tunai di Lokasi Wisata Alam
          </h2>
        </div>

        <button
          id="btn-open-wallet-ecosystem"
          onClick={onOpenWallet}
          className="btn-secondary self-start md:self-auto text-xs sm:text-sm"
        >
          <QrCode className="w-4 h-4 text-emerald-500" />
          <span>Buka Dompet Cashless & NFC Saya</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Ecosystem Switcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Pillar Selectors */}
        <div className="lg:col-span-5 space-y-3">
          {pillars.map((pillar) => {
            const isActive = activeTab === pillar.id;
            return (
              <div
                key={pillar.id}
                id={`ecosystem-tab-${pillar.id}`}
                onClick={() => setActiveTab(pillar.id)}
                className={`card p-5 cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-zinc-900 border-emerald-500/60 shadow-lg'
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-zinc-950 border border-zinc-800'
                  }`}>
                    {pillar.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold text-zinc-100 font-['Outfit']">
                        {pillar.title}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-medium mb-1.5">{pillar.subtitle}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Interactive Pillar Preview & Demo Simulator */}
        <div className="lg:col-span-7">
          <div className="card p-6 sm:p-8 bg-zinc-900/80 border-zinc-800">
            {/* Top Indicator */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                  {currentPillar.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-100 font-['Outfit']">
                    {currentPillar.title}
                  </div>
                  <div className="text-xs text-zinc-400">{currentPillar.subtitle}</div>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-3 py-1 rounded-md border border-zinc-800">
                PASSIFY-NFC-V2
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              {currentPillar.description}
            </p>

            {/* Features Checklist */}
            <div className="space-y-2.5 mb-8">
              {currentPillar.features.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Live Interactive Simulation Banner */}
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-200">
                    {activeTab === 'nfc' && 'Simulasi Sinkronisasi Gelang NFC'}
                    {activeTab === 'fnb' && 'Simulasi Tap Bayar Kedai Kopi Bromo'}
                    {activeTab === 'refund' && 'Simulasi Pengembalian Saldo Otomatis'}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {activeTab === 'nfc' && 'Gelang #NFC-88219 siap dikaitkan ke e-Ticket'}
                    {activeTab === 'fnb' && 'Kopi Hangat Lembah — Rp 25.000'}
                    {activeTab === 'refund' && 'Refund tanpa potongan biaya ke Rekening/E-Wallet'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoTap}
                className="btn-primary btn-sm w-full sm:w-auto justify-center"
              >
                {demoTapSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Berhasil!</span>
                  </>
                ) : (
                  <>
                    <span>Coba Simulasi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Alert banner on simulation */}
            {demoTapSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  {activeTab === 'nfc' && '✓ Gelang NFC #88219 berhasil ditautkan ke akun pengunjung Deryl Fabiensyah.'}
                  {activeTab === 'fnb' && '✓ Transaksi F&B Rp 25.000 berhasil! Saldo dompet terpotong otomatis.'}
                  {activeTab === 'refund' && '✓ Permintaan Instant Refund Rp 250.000 telah diproses ke rekening BCA.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

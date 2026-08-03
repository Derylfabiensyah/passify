import React, { useState } from 'react';
import { Radio, QrCode, RotateCcw, ArrowRight, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';

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
      title: 'NFC Wristband & QR Cloud',
      subtitle: 'Sinkronisasi identitas pengunjung offline & online',
      icon: <Radio className="w-4 h-4 text-gray-900" />,
      description:
        'Setiap pengunjung ditautkan dengan gelang NFC atau QR dinamis di gerbang masuk untuk akses gate dan identitas cashless yang aman tanpa sinyal seluler.',
      features: [
        'Sinkronisasi identitas dalam < 0.5 detik saat verifikasi gerbang',
        'Tanpa baterai, tahan air (Waterproof IP68) untuk alam bebas',
        'Enkripsi UID anti-kloning & pengamanan sesi multi-tenant'
      ]
    },
    {
      id: 'fnb',
      title: 'Merchant & F&B Cashless',
      subtitle: 'Belanja tanpa tunai di seluruh merchant venue',
      icon: <ShoppingBag className="w-4 h-4 text-gray-900" />,
      description:
        'Transaksi di booth vendor atau UMKM kawasan wisata cukup dengan tap gelang NFC atau scan QR Dompet Tanpa Tunai.',
      features: [
        'Pembayaran F&B, penyewaan alat, dan suvenir dalam sekali tap',
        'Kasir tenant bekerja offline-first dengan sinkronisasi batch otomatis',
        'Struk digital tercatat di riwayat transaksi pengguna'
      ]
    },
    {
      id: 'refund',
      title: 'Automated Refund & Payout',
      subtitle: 'Pengembalian sisa saldo & pencairan dana transparan',
      icon: <RotateCcw className="w-4 h-4 text-gray-900" />,
      description:
        'Sisa saldo wallet dapat ditarik kembali (refund) secara otomatis pasca-kunjungan ke rekening bank atau e-Wallet wisatawan.',
      features: [
        'Zero-fee instant refund ke seluruh bank nasional & e-Wallet',
        'Opsi refund otomatis terjadwal H+1 setelah kunjungan berakhir',
        'Rekonsiliasi saldo akurat untuk wisatawan dan pengelola kawasan'
      ]
    }
  ];

  const currentPillar = pillars.find((p) => p.id === activeTab);

  return (
    <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Modul Cashless & Identitas Digital Kawasan</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Outfit'] tracking-tight">
            Ekosistem Transaksi Tanpa Tunai
          </h2>
        </div>

        <button
          id="btn-open-wallet-ecosystem"
          onClick={onOpenWallet}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200/80 text-gray-900 text-xs font-medium transition-colors self-start md:self-auto shadow-sm"
        >
          <QrCode className="w-4 h-4 text-gray-700" />
          <span>Buka Dompet Digital & NFC Saya</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Ecosystem Switcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Pillar Selectors - Tanpa Outline/Border */}
        <div className="lg:col-span-5 space-y-3">
          {pillars.map((pillar) => {
            const isActive = activeTab === pillar.id;
            return (
              <div
                key={pillar.id}
                id={`ecosystem-tab-${pillar.id}`}
                onClick={() => setActiveTab(pillar.id)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white text-gray-900 shadow-md hover:shadow-lg hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-white/10 text-white shadow-xs' : 'bg-gray-100 text-gray-900 shadow-xs'
                  }`}>
                    {pillar.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-bold font-['Outfit']">
                        {pillar.title}
                      </h3>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mb-1.5 ${isActive ? 'text-gray-300' : 'text-gray-500 font-medium'}`}>
                      {pillar.subtitle}
                    </p>
                    <p className={`text-xs line-clamp-2 leading-relaxed ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Interactive Pillar Preview & Demo Simulator - Tanpa Outline/Border */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-white shadow-xl">
            {/* Top Indicator */}
            <div className="flex items-center justify-between pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shadow-xs">
                  {currentPillar.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900 font-['Outfit']">
                    {currentPillar.title}
                  </div>
                  <div className="text-xs text-gray-500">{currentPillar.subtitle}</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-3 py-1 rounded-full shadow-xs">
                PASSIFY-CLOUD-V2
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-[#212529] font-medium leading-relaxed mb-6">
              {currentPillar.description}
            </p>

            {/* Features Checklist */}
            <div className="space-y-3 mb-8">
              {currentPillar.features.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#212529] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Live Interactive Simulation Banner - Tanpa Outline */}
            <div className="p-5 rounded-xl bg-gray-50 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-gray-900" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">
                    {activeTab === 'nfc' && 'Simulasi Sinkronisasi Gelang NFC Klien'}
                    {activeTab === 'fnb' && 'Simulasi Tap Bayar Merchant Wisata'}
                    {activeTab === 'refund' && 'Simulasi Pengembalian Saldo Otomatis'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {activeTab === 'nfc' && 'Gelang #NFC-88219 siap dikaitkan ke e-Ticket'}
                    {activeTab === 'fnb' && 'Kopi & Suvenir Alam — Rp 25.000'}
                    {activeTab === 'refund' && 'Refund tanpa potongan biaya ke Rekening/E-Wallet'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDemoTap}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-medium hover:bg-emerald-600 transition-colors shadow-md w-full sm:w-auto justify-center"
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
              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/90 text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>
                  {activeTab === 'nfc' && '✓ Gelang NFC #88219 berhasil ditautkan ke akun pengunjung Deryl Fabiensyah.'}
                  {activeTab === 'fnb' && '✓ Transaksi Merchant Rp 25.000 berhasil! Saldo dompet terpotong otomatis.'}
                  {activeTab === 'refund' && '✓ Permintaan Instant Refund Rp 250.000 telah diproses ke rekening pengelola / pengunjung.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

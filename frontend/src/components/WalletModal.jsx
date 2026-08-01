import React, { useState } from 'react';
import {
  X,
  Wallet,
  Radio,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  QrCode,
  Sparkles,
  ArrowRight,
  Coffee,
  Utensils,
  Shirt,
  Banknote,
  History,
  ShieldCheck
} from 'lucide-react';

export default function WalletModal({ walletBalance, onTopUp, onClose }) {
  const [activeTab, setActiveTab] = useState('nfc'); // 'nfc' | 'qr' | 'refund' | 'topup'
  const [amount, setAmount] = useState(100000);
  const [isSuccessMsg, setIsSuccessMsg] = useState('');
  const [nfcLinked, setNfcLinked] = useState(true);
  const [nfcUid] = useState('BROMO-NFC-88219');

  // Simulated transaction history state
  const [transactions, setTransactions] = useState([
    { id: 'TX-101', title: 'Top Up Dompet Awal', amount: 250000, type: 'topup', time: 'Hari ini, 07:15' },
    { id: 'TX-102', title: 'Kopi Hangat Lembah Bromo', amount: -25000, type: 'fnb', time: 'Hari ini, 08:30' }
  ]);

  const presets = [50000, 100000, 250000, 500000];

  const merchants = [
    { id: 'm1', name: 'Kedai Kopi Lembah Bromo', item: 'Kopi Arabika + Roti Bakar', price: 25000, icon: <Coffee className="w-4 h-4 text-amber-400" /> },
    { id: 'm2', name: 'Warung Mie Hangat Pos 1', item: 'Mie Rebus Telur Hangat', price: 35000, icon: <Utensils className="w-4 h-4 text-emerald-400" /> },
    { id: 'm3', name: 'Bromo Souvenir Rimba', item: 'Topi Kupluk & Sarung Tangan', price: 75000, icon: <Shirt className="w-4 h-4 text-blue-400" /> }
  ];

  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    if (amount <= 0) return;

    onTopUp(amount);
    setTransactions((prev) => [
      {
        id: `TX-${Date.now()}`,
        title: 'Top Up Saldo Mandiri',
        amount: amount,
        type: 'topup',
        time: 'Baru saja'
      },
      ...prev
    ]);

    setIsSuccessMsg(`Top-Up Rp ${amount.toLocaleString('id-ID')} berhasil ditambahkan!`);
    setTimeout(() => setIsSuccessMsg(''), 3000);
  };

  const handlePayMerchant = (merch) => {
    if (walletBalance < merch.price) {
      setIsSuccessMsg('❌ Saldo dompet Anda tidak mencukupi untuk transaksi ini.');
      setTimeout(() => setIsSuccessMsg(''), 3000);
      return;
    }

    onTopUp(-merch.price);
    setTransactions((prev) => [
      {
        id: `TX-${Date.now()}`,
        title: `${merch.name} (${merch.item})`,
        amount: -merch.price,
        type: 'fnb',
        time: 'Baru saja'
      },
      ...prev
    ]);

    setIsSuccessMsg(`✓ Pembayaran Rp ${merch.price.toLocaleString('id-ID')} ke ${merch.name} berhasil!`);
    setTimeout(() => setIsSuccessMsg(''), 3500);
  };

  const handleInstantRefund = () => {
    if (walletBalance <= 0) {
      setIsSuccessMsg('❌ Saldo dompet sudah kosong atau telah ditarik.');
      setTimeout(() => setIsSuccessMsg(''), 3000);
      return;
    }

    const currentBal = walletBalance;
    onTopUp(-currentBal);
    setTransactions((prev) => [
      {
        id: `TX-${Date.now()}`,
        title: 'Instant Refund & Payout ke Bank BCA',
        amount: -currentBal,
        type: 'refund',
        time: 'Baru saja'
      },
      ...prev
    ]);

    setIsSuccessMsg(`✓ Refund Rp ${currentBal.toLocaleString('id-ID')} telah dikirim tanpa potongan biaya!`);
    setTimeout(() => setIsSuccessMsg(''), 4000);
  };

  const handleSyncWristband = () => {
    setNfcLinked(true);
    setIsSuccessMsg(`✓ Gelang NFC ${nfcUid} tersinkron ke dompet & e-Ticket Anda.`);
    setTimeout(() => setIsSuccessMsg(''), 3000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content card relative p-6 sm:p-8 max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          id="close-wallet-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100 font-['Outfit']">
              Passify Cashless Venue Wallet
            </h2>
            <p className="text-xs text-zinc-400">
              C. Ekosistem Cashless Venue (NFC & QR Wallet)
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between mb-5">
          <div>
            <span className="text-xs text-zinc-400 font-medium block mb-0.5">Saldo Tersedia Sekarang</span>
            <span className="text-2xl font-bold text-emerald-400 font-['Outfit']">
              Rp {walletBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-[11px] font-medium text-emerald-400 border border-zinc-700/60">
              <span className="status-dot" />
              <span>{nfcLinked ? 'Gelang NFC Aktif' : 'NFC Belum Taut'}</span>
            </span>
          </div>
        </div>

        {/* Tabs Grid */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 mb-6">
          <button
            id="tab-nfc-wristband"
            type="button"
            onClick={() => { setActiveTab('nfc'); setIsSuccessMsg(''); }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'nfc'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Gelang NFC</span>
          </button>

          <button
            id="tab-fnb-pay"
            type="button"
            onClick={() => { setActiveTab('qr'); setIsSuccessMsg(''); }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'qr'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>F&B / Merch</span>
          </button>

          <button
            id="tab-refund-payout"
            type="button"
            onClick={() => { setActiveTab('refund'); setIsSuccessMsg(''); }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'refund'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refund</span>
          </button>

          <button
            id="tab-topup-action"
            type="button"
            onClick={() => { setActiveTab('topup'); setIsSuccessMsg(''); }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
              activeTab === 'topup'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Top Up</span>
          </button>
        </div>

        {/* Alert Msg */}
        {isSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <span>{isSuccessMsg}</span>
            <button onClick={() => setIsSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: NFC Wristband Sync */}
        {activeTab === 'nfc' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-100">NFC Wristband Sync</div>
                    <div className="text-[11px] text-zinc-400">UID: {nfcUid}</div>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {nfcLinked ? 'TERTAUT' : 'LEPAS'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Setiap pengunjung ditautkan dengan gelang NFC di gerbang masuk. Gelang digunakan untuk akses gerbang & belanja tenant tanpa perlu uang tunai atau sinyal internet.
              </p>
              <button
                type="button"
                onClick={handleSyncWristband}
                className="w-full btn-secondary btn-sm justify-center"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Uji Ulang Sinkronisasi Gelang NFC</span>
              </button>
            </div>

            {/* Security feature card */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Proteksi Sesi & Enkripsi Gelang</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Gelang NFC menggunakan enkripsi dinamis HMAC dan otomatis kedaluwarsa setelah sesi kunjungan hari ini selesai untuk mencegah kloning kartu.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: F&B / Merch Payment */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
              <div className="text-xs font-bold text-zinc-200 mb-2">
                F&B / Merch Payment (Tap NFC atau QR)
              </div>
              <p className="text-[11px] text-zinc-400 mb-4">
                Transaksi di booth vendor dilakukan dengan melakukan tap gelang NFC atau scan QR Wallet tanpa memerlukan uang tunai.
              </p>

              {/* Sample QR */}
              <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-md">
                <QrCode className="w-28 h-28 text-zinc-950" />
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                PAY-QR-98812-BROMO
              </div>
            </div>

            {/* Interactive simulation of buying F&B */}
            <div>
              <div className="text-xs font-semibold text-zinc-300 mb-2">
                Simulasi Tap Bayar di Booth Tenant (1-Click Test):
              </div>
              <div className="space-y-2">
                {merchants.map((merch) => (
                  <div
                    key={merch.id}
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        {merch.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{merch.name}</div>
                        <div className="text-[10px] text-zinc-400">{merch.item}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePayMerchant(merch)}
                      className="btn-primary btn-sm px-3 py-1.5"
                    >
                      <span>Rp {merch.price.toLocaleString('id-ID')}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Refund & Payout */}
        {activeTab === 'refund' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div className="text-xs font-bold text-zinc-200 mb-2">
                Refund & Payout Otomatis
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                Sisa saldo wallet pengguna dapat ditarik kembali (refund) secara otomatis setelah event selesai. Dana dikirim langsung ke rekening bank atau e-Wallet tanpa potongan administrasi.
              </p>

              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 block">Sisa Saldo Dapat Di-refund</span>
                  <span className="text-lg font-bold text-emerald-400 font-['Outfit']">
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-zinc-300 bg-zinc-800 px-2 py-1 rounded border border-zinc-700">
                  Zero Fee (Rp 0)
                </span>
              </div>

              <button
                type="button"
                onClick={handleInstantRefund}
                className="w-full btn-primary justify-center py-2.5 text-xs font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cairkan Semua Sisa Saldo (Instant Refund)</span>
              </button>
            </div>

            {/* Info Bank Payout */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
              <div className="font-semibold text-zinc-300">Rekening Tujuan Refund Terdaftar:</div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-200 font-medium">Bank BCA •••• 8821 (Deryl Fabiensyah)</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">UTAMA</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Top-Up Saldo */}
        {activeTab === 'topup' && (
          <form onSubmit={handleTopUpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">Pilih Nominal Top-Up</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                      amount === val
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              <input
                id="topup-amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Nominal lainnya"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              id="submit-topup-btn"
              type="submit"
              className="w-full btn-primary py-3 justify-center text-sm font-semibold rounded-xl"
            >
              <span>Konfirmasi Top-Up Rp {amount.toLocaleString('id-ID')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Recent Transaction Log (Always visible at bottom) */}
        <div className="mt-6 pt-5 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-zinc-500" />
              <span>Riwayat Transaksi Cashless</span>
            </span>
            <span className="text-[10px] text-zinc-500">{transactions.length} Transaksi</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs"
              >
                <div>
                  <div className="font-semibold text-zinc-200">{tx.title}</div>
                  <div className="text-[10px] text-zinc-500">{tx.time}</div>
                </div>
                <div className={`font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {tx.amount > 0 ? '+' : ''} Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

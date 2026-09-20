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
  ShieldCheck,
  CreditCard,
  Lock,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import ModalWrapper from '../common/ModalWrapper';

export default function WalletModal({ walletBalance: propBalance, onTopUp, onClose }) {
  const [activeTab, setActiveTab] = useState('nfc'); // 'nfc' | 'qr' | 'refund' | 'topup'
  const [amount, setAmount] = useState(100000);
  const [isSuccessMsg, setIsSuccessMsg] = useState('');
  const [nfcLinked, setNfcLinked] = useState(true);
  const [nfcUid] = useState('CLIENT-NFC-88219');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [topupError, setTopupError] = useState('');
  const [showSnapFallbackModal, setShowSnapFallbackModal] = useState(false);
  const [snapTopUpData, setSnapTopUpData] = useState(null);

  const [localBalance, setLocalBalance] = useState(() => {
    const saved = localStorage.getItem('passify_wallet_balance');
    return saved !== null ? Number(saved) : 150000;
  });

  const walletBalance = propBalance !== undefined ? propBalance : localBalance;

  // Simulated transaction history state with localStorage fallback
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('passify_wallet_txs');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [
      { id: 'TX-101', title: 'Top Up Dompet Digital', amount: 250000, type: 'topup', time: 'Hari ini, 07:15' },
      { id: 'TX-102', title: 'Merchant Kopi & Kuliner Klien', amount: -25000, type: 'fnb', time: 'Hari ini, 08:30' }
    ];
  });

  const updateTransactions = (newTx) => {
    setTransactions((prev) => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem('passify_wallet_txs', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const applyDelta = (delta) => {
    const nextBal = Math.max(0, walletBalance + delta);
    setLocalBalance(nextBal);
    try {
      localStorage.setItem('passify_wallet_balance', String(nextBal));
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}
    if (onTopUp) {
      onTopUp(delta);
    }
  };

  const presets = [50000, 100000, 250000, 500000];

  const merchants = [
    { id: 'm1', name: 'Merchant Kuliner & F&B Klien', item: 'Paket Kopi + Roti Bakar', price: 25000, icon: <Coffee className="w-4 h-4 text-amber-500" /> },
    { id: 'm2', name: 'Sewa Alat & Perlengkapan Outdoor', item: 'Tenda & Matras Camping', price: 35000, icon: <Utensils className="w-4 h-4 text-emerald-600" /> },
    { id: 'm3', name: 'Souvenir Resmi Kawasan Wisata', item: 'Topi & Suvenir Alam', price: 75000, icon: <Shirt className="w-4 h-4 text-blue-500" /> }
  ];

  // Helper to trigger official Midtrans Snap Popup for Top-Up
  const openSnapPopup = (token, redirectUrl, ordNumber, topUpAmt) => {
    if (window.snap && typeof window.snap.pay === 'function' && token && !token.startsWith('SNAP-SIMULATOR')) {
      try {
        window.snap.pay(token, {
          onSuccess: async (result) => {
            await finalizeTopUpSuccess(
              ordNumber,
              topUpAmt,
              result?.transaction_id || token,
              result?.payment_type || 'MIDTRANS_SNAP'
            );
          },
          onPending: (result) => {
            console.log('Midtrans Snap Top-Up pending:', result);
            setIsProcessingTopUp(false);
            setShowSnapFallbackModal(false);
            setIsSuccessMsg('⏳ Transaksi top-up tercatat. Menunggu penyelesaian transfer Anda.');
            setTimeout(() => setIsSuccessMsg(''), 5000);
          },
          onError: (result) => {
            console.warn('Midtrans Snap Top-Up error:', result);
            setIsProcessingTopUp(false);
            setShowSnapFallbackModal(false);
            setTopupError('Pembayaran melalui Midtrans tidak berhasil. Silakan coba kembali.');
          },
          onClose: () => {
            console.log('Midtrans Snap Top-Up closed by user');
            setIsProcessingTopUp(false);
            setShowSnapFallbackModal(false);
          },
        });
        return true;
      } catch (e) {
        console.warn('Gagal memanggil window.snap.pay:', e);
      }
    }
    return false;
  };

  const finalizeTopUpSuccess = async (ordNumber, topUpAmt, payRef, payType) => {
    try {
      await fetch('http://localhost:8084/api/v1/payments/snap/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: ordNumber }),
      });
    } catch (e) {
      console.warn('Gagal mengonfirmasi status finish ke payment-service:', e);
    }

    applyDelta(topUpAmt);
    updateTransactions({
      id: `TX-${Date.now()}`,
      title: `Top Up Saldo (${payType ? `Midtrans ${payType.toUpperCase()}` : 'Midtrans Snap'})`,
      amount: topUpAmt,
      type: 'topup',
      time: 'Baru saja',
    });

    setShowSnapFallbackModal(false);
    setIsProcessingTopUp(false);
    setTopupError('');
    setIsSuccessMsg(`✓ Top-Up Rp ${topUpAmt.toLocaleString('id-ID')} via Midtrans berhasil! Saldo telah ditambahkan.`);
    setTimeout(() => setIsSuccessMsg(''), 4500);
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0) {
      setTopupError('Nominal top-up harus lebih dari Rp 0.');
      return;
    }

    setIsProcessingTopUp(true);
    setTopupError('');
    setIsSuccessMsg('');

    const orderNumber = `TOPUP-WAL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem('passify_user') || 'null');
    } catch (_) {}

    const customerName = savedUser?.full_name || savedUser?.name || 'Pengguna Passify';
    const customerEmail = savedUser?.email || 'visitor@passify.id';
    const customerPhone = savedUser?.phone || '08123456789';
    const userId = savedUser?.id || undefined;

    let realSnapToken = '';
    let realRedirectUrl = '';

    try {
      const snapPayload = {
        order_number: orderNumber,
        gross_amount: amount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        user_id: userId,
        items: [
          {
            id: 'WALLET-TOPUP',
            name: 'Top Up Saldo Passify Cashless Wallet',
            price: amount,
            quantity: 1,
          },
        ],
      };

      const res = await fetch('http://localhost:8084/api/v1/payments/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapPayload),
      });

      if (res.ok) {
        const snapJson = await res.json();
        realSnapToken = snapJson.data?.snap_token;
        realRedirectUrl = snapJson.data?.redirect_url;
      } else {
        const errJson = await res.json().catch(() => null);
        console.warn('Gagal mendapatkan token Snap dari backend:', errJson?.message || res.statusText);
      }
    } catch (err) {
      console.warn('Gagal menghubungi payment-service backend:', err);
    }

    const activeToken = realSnapToken || `SNAP-SIMULATOR-${orderNumber}`;
    const activeRedirectUrl = realRedirectUrl || `https://app.sandbox.midtrans.com/snap/v2/vtweb/${activeToken}`;

    const snapInfo = {
      orderNumber,
      token: activeToken,
      redirectUrl: activeRedirectUrl,
      amount,
    };
    setSnapTopUpData(snapInfo);

    const popupOpened = openSnapPopup(activeToken, activeRedirectUrl, orderNumber, amount);
    if (!popupOpened) {
      setShowSnapFallbackModal(true);
      setIsProcessingTopUp(false);
    }
  };

  const handlePayMerchant = (merch) => {
    if (walletBalance < merch.price) {
      setIsSuccessMsg('❌ Saldo dompet Anda tidak mencukupi untuk transaksi ini.');
      setTimeout(() => setIsSuccessMsg(''), 3000);
      return;
    }

    applyDelta(-merch.price);
    updateTransactions({
      id: `TX-${Date.now()}`,
      title: `${merch.name} (${merch.item})`,
      amount: -merch.price,
      type: 'fnb',
      time: 'Baru saja'
    });

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
    applyDelta(-currentBal);
    updateTransactions({
      id: `TX-${Date.now()}`,
      title: 'Instant Refund & Payout ke Bank/E-Wallet',
      amount: -currentBal,
      type: 'refund',
      time: 'Baru saja'
    });

    setIsSuccessMsg(`✓ Refund Rp ${currentBal.toLocaleString('id-ID')} telah dikirim tanpa potongan biaya!`);
    setTimeout(() => setIsSuccessMsg(''), 4000);
  };

  const handleSyncWristband = () => {
    setNfcLinked(true);
    setIsSuccessMsg(`✓ Gelang NFC ${nfcUid} tersinkron ke dompet & e-Ticket Anda.`);
    setTimeout(() => setIsSuccessMsg(''), 3000);
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      className="p-6 sm:p-8 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-2xl"
      ariaLabel="Dompet Non-Tunai Passify"
    >
      <div className="relative">
        {/* Close Button */}
        <button
          id="close-wallet-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 min-h-[44px] min-w-[44px] rounded-xl bg-gray-100 dark:bg-neutral-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          aria-label="Tutup dompet"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pr-10">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#14281a] dark:text-white font-heading">
              Passify Cashless Tenant Wallet
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Modul Transaksi Non-Tunai Kawasan (NFC & QR)
            </p>
          </div>
        </div>

        {/* Balance Card - Modern Glassmorphism Accent */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1f15] via-[#14281a] to-[#1e3d29] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shadow-lg border border-emerald-800/30 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[11px] text-emerald-200/80 font-medium block mb-1 uppercase tracking-wider">Saldo Tersedia Sekarang</span>
            <span className="text-3xl font-extrabold text-white font-heading tracking-tight">
              Rp {walletBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="relative z-10 flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-400/30 shadow-xs">
              <span className={`w-2 h-2 rounded-full ${nfcLinked ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{nfcLinked ? 'Gelang NFC Aktif' : 'NFC Belum Taut'}</span>
            </span>
            <span className="text-[10px] text-emerald-200/60 font-mono">UID: {nfcUid}</span>
          </div>
        </div>

        {/* Tabs Grid */}
        <div role="tablist" aria-label="Kategori Menu Dompet Non-Tunai" className="grid grid-cols-4 gap-1.5 p-1.5 bg-gray-100/80 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-white/10 mb-6">
          <button
            id="tab-nfc-wristband"
            role="tab"
            aria-selected={activeTab === 'nfc'}
            aria-controls="panel-nfc"
            type="button"
            onClick={() => { setActiveTab('nfc'); setIsSuccessMsg(''); }}
            className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'nfc'
                ? 'bg-white dark:bg-neutral-800 text-[#14281a] dark:text-emerald-300 shadow-sm border border-black/5 dark:border-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Gelang NFC</span>
          </button>

          <button
            id="tab-fnb-pay"
            role="tab"
            aria-selected={activeTab === 'qr'}
            aria-controls="panel-qr"
            type="button"
            onClick={() => { setActiveTab('qr'); setIsSuccessMsg(''); }}
            className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-neutral-800 text-[#14281a] dark:text-emerald-300 shadow-sm border border-black/5 dark:border-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Merchant</span>
          </button>

          <button
            id="tab-refund-payout"
            role="tab"
            aria-selected={activeTab === 'refund'}
            aria-controls="panel-refund"
            type="button"
            onClick={() => { setActiveTab('refund'); setIsSuccessMsg(''); }}
            className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'refund'
                ? 'bg-white dark:bg-neutral-800 text-[#14281a] dark:text-emerald-300 shadow-sm border border-black/5 dark:border-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refund</span>
          </button>

          <button
            id="tab-topup-action"
            role="tab"
            aria-selected={activeTab === 'topup'}
            aria-controls="panel-topup"
            type="button"
            onClick={() => { setActiveTab('topup'); setIsSuccessMsg(''); }}
            className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'topup'
                ? 'bg-white dark:bg-neutral-800 text-[#14281a] dark:text-emerald-300 shadow-sm border border-black/5 dark:border-white/10'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Top Up</span>
          </button>
        </div>

        {/* Alert Msg */}
        {isSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--leaf-pale)] border border-[var(--border)] text-[var(--forest-deep)] text-xs flex items-center justify-between">
            <span>{isSuccessMsg}</span>
            <button onClick={() => setIsSuccessMsg('')} className="text-[var(--forest-deep)] hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: NFC Wristband Sync */}
        {activeTab === 'nfc' && (
          <div id="panel-nfc" role="tabpanel" aria-labelledby="tab-nfc-wristband" className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--leaf-pale)] border border-[var(--border)] flex items-center justify-center">
                    <Radio className="w-4 h-4 text-[var(--forest)]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--forest-deep)]">NFC Wristband Sync</div>
                    <div className="text-[11px] text-[var(--ink-soft)]">UID: {nfcUid}</div>
                  </div>
                </div>
                <span className="text-[11px] text-[var(--forest-deep)] font-bold bg-[var(--leaf-pale)] px-2 py-0.5 rounded border border-[var(--border)]">
                  {nfcLinked ? 'TERTAUT' : 'LEPAS'}
                </span>
              </div>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed mb-4">
                Setiap pengunjung ditautkan dengan gelang NFC di gerbang masuk. Gelang digunakan untuk akses gerbang &amp; belanja tenant tanpa perlu uang tunai atau sinyal internet.
              </p>
              <button
                type="button"
                onClick={handleSyncWristband}
                className="w-full btn-secondary btn-sm justify-center shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5 text-[var(--forest)]" />
                <span>Uji Ulang Sinkronisasi Gelang NFC</span>
              </button>
            </div>

            {/* Security feature card */}
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--ink-soft)] space-y-2">
              <div className="flex items-center gap-2 text-[var(--forest-deep)] font-semibold">
                <ShieldCheck className="w-4 h-4 text-[var(--forest)]" />
                <span>Proteksi Sesi &amp; Enkripsi Gelang</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Gelang NFC menggunakan enkripsi dinamis HMAC dan otomatis kedaluwarsa setelah sesi kunjungan hari ini selesai untuk mencegah kloning kartu.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: F&B / Merch Payment */}
        {activeTab === 'qr' && (
          <div id="panel-qr" role="tabpanel" aria-labelledby="tab-fnb-pay" className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-center shadow-2xs">
              <div className="text-xs font-bold text-[var(--forest-deep)] mb-2">
                Merchant Payment (Tap NFC atau QR)
              </div>
              <p className="text-[11px] text-[var(--ink-soft)] mb-4">
                Transaksi di booth vendor dilakukan dengan melakukan tap gelang NFC atau scan QR Wallet tanpa memerlukan uang tunai.
              </p>

              {/* Sample QR */}
              <div className="w-36 h-36 bg-[var(--surface)] p-2 rounded-xl mx-auto mb-3 flex items-center justify-center border border-[var(--border)] shadow-xs">
                <QrCode className="w-28 h-28 text-[var(--forest-deep)]" />
              </div>
              <div className="text-[11px] text-[var(--ink-soft)] font-mono">
                PAY-QR-98812-TENANT
              </div>
            </div>

            {/* Interactive simulation of buying F&B */}
            <div>
              <div className="text-xs font-semibold text-[var(--forest-deep)] mb-2">
                Simulasi Tap Bayar di Booth Merchant Tenant:
              </div>
              <div className="space-y-2">
                {merchants.map((merch) => (
                  <div
                    key={merch.id}
                    className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-xs">
                        {merch.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--forest-deep)]">{merch.name}</div>
                        <div className="text-[10px] text-[var(--ink-soft)]">{merch.item}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePayMerchant(merch)}
                      className="btn-primary btn-sm px-3 py-1.5 shadow-2xs"
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
          <div id="panel-refund" role="tabpanel" aria-labelledby="tab-refund-payout" className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] shadow-2xs">
              <div className="text-xs font-bold text-[var(--forest-deep)] mb-2">
                Refund &amp; Payout Otomatis
              </div>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed mb-4">
                Sisa saldo wallet pengguna dapat ditarik kembali (refund) secara otomatis setelah event selesai. Dana dikirim langsung ke rekening bank atau e-Wallet tanpa potongan administrasi.
              </p>

              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] mb-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] text-[var(--ink-soft)] block">Sisa Saldo Dapat Di-refund</span>
                  <span className="text-lg font-bold text-[var(--forest)] font-heading">
                    Rp {walletBalance.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[var(--ink)] bg-[var(--leaf-pale)] px-2 py-1 rounded border border-[var(--border)]">
                  Zero Fee (Rp 0)
                </span>
              </div>

              <button
                type="button"
                onClick={handleInstantRefund}
                className="w-full btn-primary justify-center py-2.5 text-xs font-semibold shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cairkan Semua Sisa Saldo (Instant Refund)</span>
              </button>
            </div>

            {/* Info Bank Payout */}
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-[var(--ink-soft)] space-y-2 shadow-2xs">
              <div className="font-semibold text-[var(--forest-deep)]">Rekening Tujuan Refund Terdaftar:</div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[var(--forest-deep)] font-medium">Bank BCA •••• 8821 (Akun Klien)</span>
                <span className="text-[10px] text-[var(--forest-deep)] font-bold bg-[var(--leaf-pale)] px-2 py-0.5 rounded border border-[var(--border)]">UTAMA</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Top-Up Saldo via Midtrans Snap */}
        {activeTab === 'topup' && (
          <form id="panel-topup" role="tabpanel" aria-labelledby="tab-topup-action" onSubmit={handleTopUpSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-[var(--forest-deep)]">Pilih Nominal Top-Up</label>
                <span className="text-[10px] text-[var(--forest)] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Midtrans Secured
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                      amount === val
                        ? 'bg-[var(--forest)] border-[var(--forest)] text-white shadow-2xs'
                        : 'bg-[var(--surface)] border-[var(--border)] text-[var(--forest-deep)] hover:bg-[var(--canvas)]'
                    }`}
                  >
                    Rp {val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rp</span>
                <input
                  id="topup-amount-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Nominal lainnya"
                  min="10000"
                  step="5000"
                  className="w-full bg-[var(--canvas)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm font-semibold text-[var(--ink)] focus:border-[var(--forest)] focus:bg-[var(--surface)] focus:outline-none"
                />
              </div>
            </div>

            {/* Midtrans Channel Showcase */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-neutral-800/80 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--forest-deep)] dark:text-emerald-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Metode Pembayaran Resmi Midtrans
                </span>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full tracking-wider">
                  SNAP V2
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="p-1.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                  ⚡ QRIS &amp; E-Wallet
                </div>
                <div className="p-1.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                  🏦 Virtual Account
                </div>
                <div className="p-1.5 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-black/5 dark:border-white/5 text-center text-[10px] font-semibold text-gray-700 dark:text-gray-300">
                  💳 Kartu Debit/Kredit
                </div>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed pt-0.5">
                Saldo otomatis bertambah dan tersinkronisasi ke gelang NFC segera setelah pembayaran diverifikasi oleh Midtrans.
              </p>
            </div>

            {/* Error Alert */}
            {topupError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{topupError}</span>
              </div>
            )}

            <button
              id="submit-topup-btn"
              type="submit"
              disabled={isProcessingTopUp || amount <= 0}
              className="w-full btn-primary py-3 justify-center text-sm font-semibold rounded-xl shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center gap-2"
            >
              {isProcessingTopUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Menyiapkan Midtrans Snap...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-200" />
                  <span>Bayar &amp; Top-Up Rp {amount.toLocaleString('id-ID')} via Midtrans</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-emerald-200" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Midtrans Snap Fallback / Simulation Modal */}
        {showSnapFallbackModal && snapTopUpData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-emerald-500/30 p-5 shadow-2xl space-y-4 text-[var(--ink)] text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="inline-block rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  Midtrans Snap Gateway
                </span>
                <h3 className="text-base font-bold text-[var(--forest-deep)] dark:text-white">
                  Selesaikan Pembayaran Top-Up
                </h3>
                <p className="text-xs text-[var(--ink-soft)]">
                  Nomor Order: <span className="font-mono font-semibold">{snapTopUpData.orderNumber}</span>
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 dark:bg-neutral-800 p-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Tagihan Top-Up:</span>
                <span className="text-base font-extrabold text-[var(--forest)] dark:text-emerald-400 font-heading">
                  Rp {snapTopUpData.amount.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {/* 1. Official Snap Popup Button */}
                <button
                  type="button"
                  onClick={() => {
                    const opened = openSnapPopup(
                      snapTopUpData.token,
                      snapTopUpData.redirectUrl,
                      snapTopUpData.orderNumber,
                      snapTopUpData.amount
                    );
                    if (opened) setShowSnapFallbackModal(false);
                  }}
                  className="w-full btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-sm cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Buka Pop-up Midtrans Snap</span>
                </button>

                {/* 2. Direct Web Redirect in New Tab */}
                {snapTopUpData.redirectUrl && (
                  <a
                    href={snapTopUpData.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold no-underline text-[var(--forest-deep)] dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Halaman Midtrans (Tab Baru)</span>
                  </a>
                )}

                {/* 3. Sandbox Instant Simulator */}
                <button
                  type="button"
                  onClick={() =>
                    finalizeTopUpSuccess(
                      snapTopUpData.orderNumber,
                      snapTopUpData.amount,
                      `SIM-${snapTopUpData.orderNumber}`,
                      'SANDBOX_SIMULATOR'
                    )
                  }
                  className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/50 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Simulasi Bayar Sukses (Midtrans Sandbox)</span>
                </button>

                {/* 4. Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSnapFallbackModal(false);
                    setIsProcessingTopUp(false);
                  }}
                  className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 font-medium cursor-pointer"
                >
                  Batal / Ganti Nominal
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>Terhubung ke Payment Gateway Sandbox</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Transaction Log (Always visible at bottom) */}
        <div className="mt-6 pt-5 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--forest-deep)] flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[var(--forest)]" />
              <span>Riwayat Transaksi Dompet Tanpa Tunai</span>
            </span>
            <span className="text-[10px] text-[var(--ink-soft)] font-medium">{transactions.length} Transaksi</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--canvas)] border border-[var(--border)] text-xs shadow-2xs"
              >
                <div>
                  <div className="font-semibold text-[var(--forest-deep)]">{tx.title}</div>
                  <div className="text-[10px] text-[var(--ink-soft)]">{tx.time}</div>
                </div>
                <div className={`font-bold ${tx.amount > 0 ? 'text-[var(--forest)]' : 'text-[var(--forest-deep)]'}`}>
                  {tx.amount > 0 ? '+' : ''} Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

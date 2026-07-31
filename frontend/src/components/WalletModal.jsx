import React, { useState } from 'react';
import { X, Wallet, PlusCircle, QrCode, ArrowUpRight, CheckCircle2, Shield } from 'lucide-react';

export default function WalletModal({ walletBalance, onTopUp, onClose }) {
  const [amount, setAmount] = useState(100000);
  const [activeTab, setActiveTab] = useState('topup'); // 'topup' | 'qr'
  const [isSuccess, setIsSuccess] = useState(false);

  const presets = [50000, 100000, 250000, 500000];

  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    if (amount <= 0) return;

    onTopUp(amount);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card relative p-6 sm:p-8 max-w-md">
        {/* Close Button */}
        <button
          id="close-wallet-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-zinc-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-zinc-800 text-slate-300 flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Passify Cashless Wallet</h2>
          <p className="text-sm text-slate-400">Dompet digital non-tunai di lokasi wisata alam</p>
        </div>

        {/* Current Balance Card */}
        <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-center mb-6">
          <span className="text-sm text-slate-400 font-medium block mb-1">
            Saldo Tersedia
          </span>
          <span className="text-3xl font-bold text-white">
            Rp {walletBalance.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900 p-1 rounded-lg mb-6 border border-zinc-800">
          <button
            id="tab-topup"
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'topup' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Up Saldo
          </button>
          <button
            id="tab-qr"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeTab === 'qr' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QR Bayar Merchant
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'topup' ? (
          <form onSubmit={handleTopUpSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Pilih Nominal Top-Up</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-colors ${
                      amount === val
                        ? 'bg-zinc-800 border-zinc-700 text-slate-200'
                        : 'bg-zinc-900 border-zinc-800 text-slate-400 hover:border-zinc-700'
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {isSuccess && (
              <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-slate-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Top-Up berhasil ditambahkan!</span>
              </div>
            )}

            <button id="submit-topup-btn" type="submit" className="w-full btn-primary py-3 justify-center text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-400">
              Konfirmasi Top-Up Rp {amount.toLocaleString('id-ID')}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-4">
            <div className="w-44 h-44 bg-zinc-800 rounded-lg mx-auto flex items-center justify-center">
               <span className="text-slate-400 text-sm">QR Code Placeholder</span>
            </div>
            <p className="text-sm text-slate-400">
              Tunjukkan QR Code ini kepada kasir/vendor booth di lokasi wisata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

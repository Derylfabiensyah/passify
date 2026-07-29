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
      <div className="modal-content relative p-6 sm:p-8 max-w-md">
        {/* Close Button */}
        <button
          id="close-wallet-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-900/40">
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit']">Passify Cashless Wallet</h2>
          <p className="text-xs text-slate-400">Dompet digital non-tunai di lokasi wisata alam</p>
        </div>

        {/* Current Balance Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 text-center mb-6 shadow-inner">
          <span className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider block mb-1">
            Saldo Tersedia
          </span>
          <span className="text-3xl font-extrabold text-white font-['Outfit']">
            Rp {walletBalance.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            id="tab-topup"
            onClick={() => setActiveTab('topup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'topup' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Top Up Saldo
          </button>
          <button
            id="tab-qr"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'qr' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QR Bayar Merchant
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'topup' ? (
          <form onSubmit={handleTopUpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Pilih Nominal Top-Up</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      amount === val
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
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
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {isSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Top-Up berhasil ditambahkan!</span>
              </div>
            )}

            <button id="submit-topup-btn" type="submit" className="w-full btn-primary py-3 justify-center text-sm font-bold">
              Konfirmasi Top-Up Rp {amount.toLocaleString('id-ID')}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="p-4 bg-white rounded-xl inline-block shadow-lg">
              {/* Mock QR Code visual */}
              <div className="w-44 h-44 bg-slate-950 p-2 rounded flex flex-col items-center justify-center relative overflow-hidden">
                <div className="grid grid-cols-6 gap-1 w-full h-full opacity-90">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${(i * 7) % 3 === 0 ? 'bg-emerald-500' : (i * 3) % 2 === 0 ? 'bg-white' : 'bg-slate-900'} rounded-sm`}
                    />
                  ))}
                </div>
                <div className="absolute bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                  PASSIFY QR
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Tunjukkan QR Code ini kepada kasir/vendor booth (F&B, sewa alat, cenderamata) di lokasi wisata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

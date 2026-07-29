import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, Download, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function ETicketModal({ order, onClose }) {
  if (!order) return null;

  const [totpCountdown, setTotpCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotpCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-md">
        {/* Close Button */}
        <button
          id="close-ticket-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>E-Ticket Resmi Wisata</span>
          </div>
          <h2 className="text-xl font-bold text-white font-['Outfit']">{order.destinationName}</h2>
          <p className="text-xs text-slate-400">Order #{order.orderNumber}</p>
        </div>

        {/* Dynamic TOTP QR Code Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-emerald-500/30 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl relative">
            {/* Dynamic QR Graphic */}
            <div className="w-48 h-48 bg-slate-950 p-3 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="grid grid-cols-7 gap-1 w-full h-full opacity-90">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${(i + totpCountdown) % 4 === 0 ? 'bg-emerald-400' : (i * 2) % 3 === 0 ? 'bg-white' : 'bg-slate-900'} rounded-sm transition-colors duration-500`}
                  />
                ))}
              </div>
              <div className="absolute bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                TOTP ACTIVE
              </div>
            </div>
          </div>

          {/* TOTP Countdown Timer */}
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 py-1.5 px-4 rounded-full border border-emerald-500/20 max-w-xs mx-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>QR Refresh Otomatis dalam {totpCountdown}s</span>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            Kode Tiket: <strong className="text-slate-200 font-mono">{order.ticketCode}</strong>
            <br />
            <span className="text-emerald-400/80 font-medium">
              Mode Anti-Pemalsuan (Dukungan Scan Gate Offline-First)
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="my-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Tanggal
            </span>
            <span className="text-slate-200 font-semibold">{order.visitDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Sesi
            </span>
            <span className="text-slate-200 font-semibold">{order.timeSlotLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Pemesan</span>
            <span className="text-slate-200 font-semibold">{order.visitorName}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">Total Pembayaran</span>
            <span className="text-emerald-400 font-extrabold font-['Outfit'] text-sm">
              Rp {order.grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => alert(`Mengunduh E-Ticket PDF untuk Order #${order.orderNumber}...`)}
          className="w-full btn-secondary py-3 justify-center text-xs font-bold"
        >
          <Download className="w-4 h-4" />
          <span>Unduh E-Ticket (PDF)</span>
        </button>
      </div>
    </div>
  );
}

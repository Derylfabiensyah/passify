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
      <div className="modal-content card relative p-6 sm:p-8 max-w-md">
        {/* Close Button */}
        <button
          id="close-ticket-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-zinc-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-slate-300 text-sm font-medium mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>E-Ticket Resmi Wisata</span>
          </div>
          <h2 className="text-xl font-bold text-white">{order.destinationName}</h2>
          <p className="text-sm text-slate-400">Order #{order.orderNumber}</p>
        </div>

        {/* Dynamic TOTP QR Code Card */}
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 text-center space-y-4">
          <div className="w-48 h-48 bg-zinc-800 rounded-lg mx-auto flex items-center justify-center relative">
            <span className="text-slate-400 text-sm">QR Code Placeholder</span>
            <div className="absolute bottom-2 bg-zinc-900 border border-zinc-700 text-slate-300 text-xs px-2 py-1 rounded font-semibold">
              TOTP ACTIVE
            </div>
          </div>

          {/* TOTP Countdown Timer */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>QR Refresh Otomatis dalam {totpCountdown}s</span>
          </div>

          <div className="text-sm text-slate-400">
            Kode Tiket: <strong className="text-slate-200 font-mono">{order.ticketCode}</strong>
            <br />
            <span className="text-slate-400">
              Mode Anti-Pemalsuan (Dukungan Scan Gate Offline-First)
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="my-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Tanggal
            </span>
            <span className="text-slate-300 font-semibold">{order.visitDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Sesi
            </span>
            <span className="text-slate-300 font-semibold">{order.timeSlotLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Pemesan</span>
            <span className="text-slate-300 font-semibold">{order.visitorName}</span>
          </div>
          <div className="flex justify-between pt-3 mt-3 border-t border-zinc-800">
            <span className="text-slate-400">Total Pembayaran</span>
            <span className="text-slate-200 font-bold text-base">
              Rp {order.grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => alert(`Mengunduh E-Ticket PDF untuk Order #${order.orderNumber}...`)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg bg-zinc-800 border border-zinc-700 text-slate-300 hover:bg-zinc-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Unduh E-Ticket (PDF)</span>
        </button>
      </div>
    </div>
  );
}

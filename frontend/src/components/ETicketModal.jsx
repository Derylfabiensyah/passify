import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, Download, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function ETicketModal({ order, onClose }) {
  const [totpCountdown, setTotpCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotpCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content card relative p-6 sm:p-8 max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl w-full">
        {/* Close Button */}
        <button
          id="close-ticket-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>E-Ticket Resmi White-Label Passify</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 font-['Outfit']">{order.destinationName}</h2>
          <p className="text-sm text-gray-500">No. Reservasi #{order.orderNumber}</p>
        </div>

        {/* Dynamic TOTP QR Code Card */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center space-y-4 shadow-2xs">
          <div className="w-48 h-48 bg-white border border-gray-200 rounded-xl mx-auto flex items-center justify-center relative shadow-xs">
            <QrCode className="w-36 h-36 text-gray-900" />
            <div className="absolute bottom-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              TOTP SECURED
            </div>
          </div>

          {/* TOTP Countdown Timer */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>QR Refresh Otomatis dalam <span className="text-emerald-700 font-bold">{totpCountdown}s</span></span>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed">
            Kode Tiket: <strong className="text-gray-900 font-mono">{order.ticketCode}</strong>
            <br />
            <span>
              Enkripsi HMAC Anti-Duplikasi (Validasi Gerbang Offline)
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="my-6 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5 text-sm shadow-2xs">
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1 font-medium">
              <Calendar className="w-4 h-4 text-emerald-600" /> Tanggal Kunjungan
            </span>
            <span className="text-gray-900 font-semibold">{order.visitDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-1 font-medium">
              <Clock className="w-4 h-4 text-emerald-600" /> Sesi Kunjungan
            </span>
            <span className="text-gray-900 font-semibold">{order.timeSlotLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Nama Pemesan</span>
            <span className="text-gray-900 font-semibold">{order.visitorName}</span>
          </div>
          <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
            <span className="text-gray-700 font-semibold">Total Pembayaran</span>
            <span className="text-gray-900 font-bold text-base font-['Outfit']">
              Rp {order.grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => alert(`Mengunduh E-Ticket PDF untuk Order #${order.orderNumber}...`)}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Unduh Dokumen E-Ticket (PDF)</span>
        </button>
      </div>
    </div>
  );
}

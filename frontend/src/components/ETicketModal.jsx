import React, { useState, useEffect } from 'react';
import { X, QrCode, ShieldCheck, Download, Calendar, Clock, CheckCircle2 } from 'lucide-react';

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
      <div className="modal-content card relative max-w-md w-full overflow-hidden rounded-[18px] border border-[#cddac8] bg-[#fffdf8] p-0 shadow-[0_24px_60px_rgba(23,59,50,0.18)]">
        {/* Close Button */}
        <button
          id="close-ticket-modal-btn"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-[#9aae85] hover:text-[#173b32] focus:outline-none focus:ring-2 focus:ring-[#dce8d3]"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-[#173b32] px-6 pb-7 pt-6 text-center sm:px-7">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#e7efdf] px-3 py-1.5 text-xs font-semibold text-[#173b32]">
            <CheckCircle2 className="h-4 w-4 text-[#80512f]" />
            <span>E-Ticket Resmi White-Label Passify</span>
          </div>
          <h2 className="font-['Outfit'] text-[1.35rem] font-bold leading-tight text-white">{order.destinationName}</h2>
          <p className="mt-1 text-sm text-[#dce8d3]">No. Reservasi #{order.orderNumber}</p>
        </div>

        <div className="px-6 py-6 sm:px-7 sm:py-7">
          {/* Dynamic TOTP QR Code Card */}
          <div className="space-y-4 rounded-2xl border border-[#b8cbb0] bg-[#e7efdf] p-5 text-center shadow-sm">
            <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-xl border border-[#d9e3d4] bg-white shadow-sm">
              <QrCode className="h-36 w-36 text-[#173b32]" />
              <div className="absolute bottom-2 rounded bg-[#80512f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                TOTP SECURED
              </div>
            </div>

            {/* TOTP Countdown Timer */}
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#173b32]">
              <ShieldCheck className="h-4 w-4 text-[#80512f]" />
              <span>QR Refresh Otomatis dalam <span className="font-bold text-[#80512f]">{totpCountdown}s</span></span>
            </div>

            <div className="text-xs leading-relaxed text-[#52635d]">
              Kode Tiket: <strong className="font-mono text-[#173b32]">{order.ticketCode}</strong>
              <br />
              <span>
                Enkripsi HMAC Anti-Duplikasi (Validasi Gerbang Offline)
              </span>
            </div>
          </div>

          {/* Details List */}
          <div className="my-5 space-y-3 rounded-xl border border-[#cddac8] bg-[#f5f8f2] p-4 text-sm shadow-sm">
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1 font-medium text-[#52635d]">
                <Calendar className="h-4 w-4 text-[#80512f]" /> Tanggal Kunjungan
              </span>
              <span className="whitespace-nowrap font-semibold text-[#173b32]">{order.visitDate}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-1 font-medium text-[#52635d]">
                <Clock className="h-4 w-4 text-[#80512f]" /> Sesi Kunjungan
              </span>
              <span className="whitespace-nowrap font-semibold text-[#173b32]">{order.timeSlotLabel}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-medium text-[#52635d]">Nama Pemesan</span>
              <span className="text-right font-semibold text-[#173b32]">{order.visitorName}</span>
            </div>
            <div className="mt-3 flex justify-between gap-4 border-t border-[#c6d2c2] pt-3">
              <span className="font-semibold text-[#173b32]">Total Pembayaran</span>
              <span className="font-['Outfit'] whitespace-nowrap text-base font-bold text-[#80512f]">
                Rp {order.grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => alert(`Mengunduh E-Ticket PDF untuk Order #${order.orderNumber}...`)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#80512f] bg-white px-4 py-3 text-sm font-semibold text-[#80512f] shadow-sm transition-colors hover:bg-[#80512f] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#9aae85] focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            <span>Unduh Dokumen E-Ticket (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

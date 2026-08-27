import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldCheck, Download, Calendar, Clock, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * ETicketModal - displays a dynamic TOTP-secured e-ticket with a self-refreshing QR code.
 * The QR payload changes every 30 seconds to prevent screenshot/calo abuse.
 */
export default function ETicketModal({ order, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch live QR payload from backend
  const fetchLiveQR = useCallback(async () => {
    if (!order?.ticketId) {
      // Fallback: construct a static QR from ticketCode (demo mode)
      setQrData(`PASSIFY:${order?.ticketCode || 'DEMO-TICKET'}:000000`);
      return;
    }
    setIsRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('passify_token');
      const res = await fetch(`${API_BASE}/api/v1/tickets/${order.ticketId}/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch QR');
      const json = await res.json();
      setQrData(json.data?.qr_payload || `PASSIFY:${order.ticketCode}:000000`);
      setSecondsLeft(json.data?.seconds_until_refresh || 30);
    } catch {
      setError('Gagal memuat QR. Coba lagi.');
      // Fallback to static display
      setQrData(`PASSIFY:${order?.ticketCode || 'DEMO'}:OFFLINE`);
    } finally {
      setIsRefreshing(false);
    }
  }, [order]);

  // On mount: fetch QR immediately
  useEffect(() => {
    fetchLiveQR();
  }, [fetchLiveQR]);

  // Countdown timer + auto-refresh when it hits 0
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          fetchLiveQR(); // auto-refresh the QR payload
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchLiveQR]);

  if (!order) return null;

  const countdownPercent = Math.round((secondsLeft / 30) * 100);
  const isExpiringSoon = secondsLeft <= 8;

  return (
    <div className="modal-overlay">
      <div className="modal-content card relative max-w-md w-full rounded-[18px] border border-[#cddac8] bg-[#fffdf8] p-0 shadow-[0_24px_60px_rgba(23,59,50,0.18)]">
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
          {/* Dynamic TOTP QR Code */}
          <div className="space-y-4 rounded-2xl border border-[#b8cbb0] bg-[#e7efdf] p-5 text-center shadow-sm">

            {/* QR Code display */}
            <div className="relative mx-auto flex h-52 w-52 items-center justify-center rounded-xl border border-[#d9e3d4] bg-white shadow-sm overflow-hidden">
              {error ? (
                <div className="flex flex-col items-center gap-2 text-[#80512f] p-4">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-xs text-center">{error}</p>
                </div>
              ) : qrData ? (
                <QRCodeSVG
                  value={qrData}
                  size={192}
                  bgColor="#ffffff"
                  fgColor="#173b32"
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-[#173b32] animate-spin" />
                </div>
              )}

              {/* Overlay saat refreshing */}
              {isRefreshing && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                  <RefreshCw className="h-8 w-8 text-[#173b32] animate-spin" />
                </div>
              )}

              {/* TOTP badge */}
              <div className="absolute bottom-2 rounded bg-[#80512f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                TOTP SECURED
              </div>
            </div>

            {/* Countdown ring + text */}
            <div className="flex items-center justify-center gap-3">
              {/* SVG countdown ring */}
              <div className="relative h-9 w-9">
                <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#cddac8" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={isExpiringSoon ? '#c0392b' : '#80512f'}
                    strokeWidth="3"
                    strokeDasharray={`${countdownPercent} 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${isExpiringSoon ? 'text-[#c0392b]' : 'text-[#173b32]'}`}>
                  {secondsLeft}s
                </span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#173b32]">
                  <ShieldCheck className="h-4 w-4 text-[#80512f]" />
                  <span>QR Refresh Otomatis</span>
                </div>
                <p className="text-[11px] text-[#52635d]">Anti-screenshot &amp; anti-calo aktif</p>
              </div>
            </div>

            <div className="text-xs leading-relaxed text-[#52635d]">
              Kode Tiket: <strong className="font-mono text-[#173b32]">{order.ticketCode}</strong>
              <br />
              <span>Enkripsi HMAC Anti-Duplikasi (Validasi Gerbang Offline)</span>
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

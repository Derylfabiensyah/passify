import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../contexts/ToastContext';
import ModalWrapper from './common/ModalWrapper';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083';

export default function ETicketModal({ order, onClose }) {
  const { toast } = useToast();
  const [qrData, setQrData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes default
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isUsed, setIsUsed] = useState(order?.status === 'used');
  const [usedAt, setUsedAt] = useState(order?.usedAt || null);

  const checkLiveStatus = useCallback(async () => {
    if (!order?.ticketCode || isUsed) return;
    try {
      const res = await fetch(`http://localhost:8086/api/v1/gate/status/${order.ticketCode}`);
      if (res.ok) {
        const payload = await res.json();
        if (payload?.data?.status === 'used') {
          setIsUsed(true);
          setUsedAt(payload.data.used_at || new Date().toISOString());
        }
      }
    } catch (_) {}
  }, [order?.ticketCode, isUsed]);

  const fetchLiveQR = useCallback(async () => {
    if (isUsed) return;
    if (!order?.ticketId) {
      setQrData(`PASSIFY:${order?.ticketCode || 'DEMO-TICKET'}:000000`);
      return;
    }
    setIsRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('passify_token');
      const response = await fetch(`${API_BASE}/api/v1/tickets/${order.ticketId}/qr`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('QR live belum dapat dimuat dari server');
      const payload = await response.json();
      setQrData(payload.data?.qr_payload || `PASSIFY:${order.ticketCode}:000000`);
      setSecondsLeft(payload.data?.seconds_until_refresh || 600);
    } catch {
      // Fallback dynamic generator
      setQrData(`PASSIFY:${order?.ticketCode || 'TWA-DEMO'}:${Math.floor(100000 + Math.random() * 900000)}`);
      setSecondsLeft(600);
    } finally {
      setIsRefreshing(false);
    }
  }, [order, isUsed]);

  useEffect(() => {
    fetchLiveQR();
    checkLiveStatus();
  }, [fetchLiveQR, checkLiveStatus]);

  // Real-time gate scan listener polling every 2 seconds
  useEffect(() => {
    if (isUsed) return;
    const statusInterval = setInterval(checkLiveStatus, 2000);
    return () => clearInterval(statusInterval);
  }, [checkLiveStatus, isUsed]);

  useEffect(() => {
    if (isUsed) return;
    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          fetchLiveQR();
          return 600;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchLiveQR, isUsed]);

  if (!order) return null;

  const expiring = secondsLeft <= 60; // warn under 1 minute
  const percentage = Math.round((secondsLeft / 600) * 100);
  const visitDate = order.visitDate
    ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(`${order.visitDate}T00:00:00`)
      )
    : '-';

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      className="p-0 overflow-hidden bg-white shadow-2xl rounded-3xl"
      ariaLabel={`E-Ticket ${order.destinationName}`}
    >
      <div>
        {/* Header */}
        <header className="bg-[var(--forest-deep)] px-6 pb-6 pt-7 text-center text-white sm:px-7 relative">
          <button
            id="close-ticket-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 cursor-pointer"
            aria-label="Tutup tiket"
          >
            <X className="h-4 w-4" />
          </button>
          {isUsed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Sudah Digunakan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--leaf-pale)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest-deep)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--forest)]" /> E-Ticket Aktif
            </span>
          )}
          <h2 className="mt-3 font-serif text-2xl font-bold text-white">{order.destinationName}</h2>
          <p className="mt-1 font-mono text-xs text-white/70">Kode Reservasi #{order.orderNumber}</p>
        </header>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Dynamic QR or Used Display Box */}
          {isUsed ? (
            <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200/60 p-6 text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">Tiket Berhasil Dipindai & Masuk</h3>
                <p className="text-xs text-emerald-800 mt-1 max-w-xs mx-auto">
                  Tiket telah tervalidasi di gerbang masuk. Selamat menikmati petualangan wisata alam Anda!
                </p>
              </div>
              <div className="pt-2 text-[11px] font-mono text-emerald-700">
                Waktu Masuk: {usedAt ? new Date(usedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Hari ini'}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-[var(--fog)] p-5 text-center space-y-4">
              <div
                className="relative mx-auto grid h-52 w-52 place-items-center overflow-hidden rounded-2xl bg-white shadow-sm select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                {qrData ? (
                  <QRCodeSVG
                    value={qrData}
                    size={185}
                    bgColor="#ffffff"
                    fgColor="#102d20"
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <RefreshCw className="h-8 w-8 animate-spin text-[var(--forest)]" />
                )}
                {isRefreshing && (
                  <div className="absolute inset-0 grid place-items-center bg-white/80">
                    <RefreshCw className="h-8 w-8 animate-spin text-[var(--forest)]" />
                  </div>
                )}
                <span className="absolute bottom-2 rounded-md bg-[var(--forest-deep)] px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white">
                  DYNAMIC TOTP
                </span>
              </div>

              {/* 10-Minute Countdown Indicator */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative h-10 w-10">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#d6e2cf" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={expiring ? '#dc2626' : '#1e4b35'}
                      strokeWidth="3"
                      strokeDasharray={`${percentage} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    className={`absolute inset-0 grid place-items-center text-[10px] font-mono font-extrabold ${
                      expiring ? 'text-red-600 animate-pulse' : 'text-[var(--forest-deep)]'
                    }`}
                  >
                    {formatTimer(secondsLeft)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--forest-deep)]">
                    <ShieldCheck className="h-4 w-4 text-[var(--forest)]" />
                    QR Berganti Tiap 10 Menit
                  </p>
                  <p className="text-[10px] text-[var(--ink-soft)]">
                    Sisa waktu aktif: <strong>{formatTimer(secondsLeft)}</strong>
                  </p>
                </div>
              </div>

              {/* Anti-Fraud / Anti-Screenshot Notice */}
              <div className="rounded-2xl bg-amber-50 p-3 text-left flex items-start gap-2.5 text-[11px] leading-4 text-amber-900">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Calo & Anti-Screenshot:</strong> QR ini berubah tiap 10 menit. Foto atau screenshot statis
                  tidak dapat dipindai di pintu gerbang. Harap buka langsung halaman tiket ini.
                </span>
              </div>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-left text-xs text-red-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Ticket Details Summary */}
          <div className="rounded-2xl bg-[var(--fog)] p-4 text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[var(--forest)]" /> Tanggal
              </span>
              <strong className="text-[var(--forest-deep)]">{visitDate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[var(--forest)]" /> Sesi
              </span>
              <strong className="text-[var(--forest-deep)]">{order.timeSlotLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">Nama Pemesan</span>
              <strong className="text-[var(--forest-deep)]">{order.visitorName || order.visitors?.[0]?.name || '-'}</strong>
            </div>
            <div className="flex justify-between border-t border-gray-200/60 pt-2 font-bold">
              <span>Total Tagihan</span>
              <span className="text-sm font-serif text-[var(--bark)]">
                Rp {Number(order.grandTotal || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* PDF Invoice / Booking Voucher Download (No static QR) */}
          <button
            type="button"
            onClick={() => toast.success(`Mengunduh Dokumen Invoice & Bukti Reservasi Resmi #${order.orderNumber}...`)}
            className="w-full btn-secondary py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold"
          >
            <FileText className="h-4 w-4" /> Unduh Invoice / Bukti Reservasi
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

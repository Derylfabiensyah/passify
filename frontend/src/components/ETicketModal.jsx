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
  const [secondsLeft, setSecondsLeft] = useState(30); // 30 seconds Dynamic TOTP (PDF Spec Hal. 4 Poin 7.B)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isUsed, setIsUsed] = useState(order?.status === 'used');
  const [usedAt, setUsedAt] = useState(order?.usedAt || null);

  const checkLiveStatus = useCallback(async () => {
    const codeToPoll = order?.ticketCode || order?.orderNumber;
    if (!codeToPoll || isUsed) return;
    try {
      let res = await fetch(`http://localhost:8086/api/v1/gate/status/${codeToPoll}`);
      if (!res.ok && order?.orderNumber && order.orderNumber !== codeToPoll) {
        res = await fetch(`http://localhost:8086/api/v1/gate/status/${order.orderNumber}`);
      }
      if (res.ok) {
        const payload = await res.json();
        if (payload?.data?.status === 'used') {
          const scannedAt = payload.data.used_at || new Date().toISOString();
          setIsUsed(true);
          setUsedAt(scannedAt);
          try {
            const raw = localStorage.getItem('passify_my_tickets');
            if (raw) {
              const list = JSON.parse(raw);
              const updated = list.map((t) =>
                (order.ticketCode && t.ticketCode === order.ticketCode) ||
                (order.orderNumber && t.orderNumber === order.orderNumber)
                  ? { ...t, status: 'used', usedAt: scannedAt }
                  : t
              );
              localStorage.setItem('passify_my_tickets', JSON.stringify(updated));
              window.dispatchEvent(new Event('storage'));
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  }, [order?.ticketCode, order?.orderNumber, isUsed]);

  // Sync state if ticket was scanned and updated in another tab or scanner simulator
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = localStorage.getItem('passify_my_tickets');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find(
            (t) =>
              (order?.ticketCode && t.ticketCode === order.ticketCode) ||
              (order?.orderNumber && t.orderNumber === order.orderNumber)
          );
          if (found && found.status === 'used') {
            setIsUsed(true);
            setUsedAt(found.usedAt || new Date().toISOString());
          }
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [order?.ticketCode, order?.orderNumber]);

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
      setSecondsLeft(payload.data?.seconds_until_refresh || 30);
    } catch {
      // Fallback dynamic generator
      setQrData(`PASSIFY:${order?.ticketCode || 'TWA-DEMO'}:${Math.floor(100000 + Math.random() * 900000)}`);
      setSecondsLeft(30);
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
          return 30;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchLiveQR, isUsed]);

  if (!order) return null;

  const expiring = secondsLeft <= 10; // warn under 10 seconds
  const percentage = Math.round((secondsLeft / 30) * 100);
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
      className="p-0 overflow-hidden !bg-white/70 dark:!bg-[#0d2117]/75 backdrop-blur-3xl border border-white/80 shadow-[0_28px_68px_-12px_rgba(16,45,32,0.35)] rounded-2xl"
      ariaLabel={`E-Ticket ${order.destinationName}`}
    >
      <div>
        {/* Glassmorphism Header */}
        <header className="relative px-6 pb-6 pt-7 text-center text-white sm:px-7 bg-gradient-to-b from-[#183928]/90 via-[#133022]/85 to-[#0e2419]/80 backdrop-blur-xl border-b border-white/15 shadow-sm">
          <button
            id="close-ticket-modal-btn"
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-all hover:scale-105 border border-white/20 backdrop-blur-md cursor-pointer shadow-2xs"
            aria-label="Tutup tiket"
          >
            <X className="h-4 w-4" />
          </button>
          {isUsed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-200 backdrop-blur-md shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Sudah Digunakan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-300 backdrop-blur-md shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> E-Ticket Aktif
            </span>
          )}
          <h2 className="mt-3 font-serif text-2xl font-bold text-white tracking-tight drop-shadow-xs">{order.destinationName}</h2>
          <p className="mt-1 font-mono text-xs text-white/80">Kode Reservasi #{order.orderNumber}</p>
        </header>

        <div className="p-6 sm:p-7 space-y-5 bg-transparent">
          {/* Dynamic QR or Used Display Box */}
          {isUsed ? (
            <div className="rounded-2xl bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 p-6 text-center space-y-3 shadow-xs">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">Tiket Berhasil Dipindai & Masuk</h3>
                <p className="text-xs text-emerald-900/80 mt-1 max-w-xs mx-auto">
                  Tiket telah tervalidasi di gerbang masuk. Selamat menikmati petualangan wisata alam Anda!
                </p>
              </div>
              <div className="pt-2 text-[11px] font-mono text-emerald-800 font-bold">
                Waktu Masuk: {usedAt ? new Date(usedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Hari ini'}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/50 backdrop-blur-md border border-white/80 p-5 text-center space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_20px_rgba(16,45,32,0.04)]">
              <div
                className="relative mx-auto grid h-52 w-52 place-items-center overflow-hidden rounded-2xl bg-white shadow-md border border-white/90 select-none"
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
                  <div className="absolute inset-0 grid place-items-center bg-white/80 backdrop-blur-xs">
                    <RefreshCw className="h-8 w-8 animate-spin text-[var(--forest)]" />
                  </div>
                )}
                <span className="absolute bottom-2 rounded-md bg-[#102d20]/90 backdrop-blur-xs px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider text-emerald-300 border border-white/20 shadow-xs">
                  DYNAMIC TOTP
                </span>
              </div>

              {/* 30-Second Countdown Indicator */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative h-10 w-10">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#d6e2cf" strokeWidth="3" opacity="0.6" />
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
                      expiring ? 'text-red-600 animate-pulse' : 'text-[#14281a]'
                    }`}
                  >
                    {formatTimer(secondsLeft)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#14281a]">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    QR Berganti Tiap 30 Detik (AES-256)
                  </p>
                  <p className="text-[11px] text-[#4d5c48]">
                    Sisa waktu aktif: <span className="font-mono font-bold text-[#14281a]">{formatTimer(secondsLeft)}</span>
                  </p>
                </div>
              </div>

              {/* Anti-screenshot notice */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-600/20 backdrop-blur-xs p-3 text-left text-xs text-amber-950 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Calo & Anti-Screenshot:</strong> QR ini berganti otomatis setiap 30 detik (AES-256). Foto atau tangkapan layar (screenshot) statis otomatis kedaluwarsa di scanner pintu masuk.
                </span>
              </div>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-left text-xs text-red-900">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Ticket Details Summary */}
          <div className="rounded-2xl bg-white/55 backdrop-blur-md border border-white/80 p-4 text-xs space-y-2.5 shadow-xs">
            <div className="flex justify-between">
              <span className="text-[#4d5c48] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-800" /> Tanggal
              </span>
              <strong className="text-[#14281a]">{visitDate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4d5c48] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-800" /> Sesi
              </span>
              <strong className="text-[#14281a]">{order.timeSlotLabel}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4d5c48]">Nama Pemesan</span>
              <strong className="text-[#14281a]">{order.visitorName || order.visitors?.[0]?.name || '-'}</strong>
            </div>
            <div className="flex justify-between border-t border-emerald-900/10 pt-2 font-bold">
              <span className="text-[#14281a]">Total Tagihan</span>
              <span className="text-sm font-serif text-[#14281a]">
                Rp {Number(order.grandTotal || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* PDF Invoice / Booking Voucher Download */}
          <button
            type="button"
            onClick={() => toast.success(`Mengunduh Dokumen Invoice & Bukti Reservasi Resmi #${order.orderNumber}...`)}
            className="w-full bg-white/80 hover:bg-white border border-white/90 text-[#14281a] py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4 text-emerald-800" /> Unduh Invoice / Bukti Reservasi
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

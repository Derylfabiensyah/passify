import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, Download, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function ETicketModal({ order, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveQR = useCallback(async () => {
    if (!order?.ticketId) {
      setQrData(`PASSIFY:${order?.ticketCode || 'DEMO-TICKET'}:000000`);
      return;
    }
    setIsRefreshing(true);
    setError(null);
    try {
      const token = localStorage.getItem('passify_token');
      const response = await fetch(`${API_BASE}/api/v1/tickets/${order.ticketId}/qr`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('QR tidak tersedia');
      const payload = await response.json();
      setQrData(payload.data?.qr_payload || `PASSIFY:${order.ticketCode}:000000`);
      setSecondsLeft(payload.data?.seconds_until_refresh || 30);
    } catch {
      setError('QR live belum dapat dimuat. Gunakan kode tiket ini saat membutuhkan bantuan petugas.');
      setQrData(`PASSIFY:${order?.ticketCode || 'DEMO'}:OFFLINE`);
    } finally {
      setIsRefreshing(false);
    }
  }, [order]);

  useEffect(() => { fetchLiveQR(); }, [fetchLiveQR]);
  useEffect(() => {
    const interval = setInterval(() => setSecondsLeft((previous) => {
      if (previous <= 1) { fetchLiveQR(); return 30; }
      return previous - 1;
    }), 1000);
    return () => clearInterval(interval);
  }, [fetchLiveQR]);

  if (!order) return null;
  const expiring = secondsLeft <= 8;
  const percentage = Math.round((secondsLeft / 30) * 100);
  const visitDate = order.visitDate ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${order.visitDate}T00:00:00`)) : '-';

  return (
    <div className="modal-overlay">
      <div className="modal-content card relative max-w-md overflow-hidden bg-[var(--sand)]">
        <header className="bg-[var(--forest-deep)] px-6 pb-7 pt-7 text-center text-white sm:px-7">
          <button id="close-ticket-modal-btn" type="button" onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 hover:bg-white/20" aria-label="Tutup tiket"><X className="h-4 w-4" /></button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--leaf-pale)] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest-deep)]"><CheckCircle2 className="h-3.5 w-3.5 text-[var(--bark)]" />E-ticket siap digunakan</span>
          <h2 className="mt-4 pr-8 font-serif text-2xl font-bold text-white">{order.destinationName}</h2>
          <p className="mt-2 text-xs font-medium text-white/70">Reservasi #{order.orderNumber}</p>
        </header>
        <div className="p-5 sm:p-7">
          <div className="rounded-2xl border border-[var(--border-hover)] bg-[var(--leaf-pale)] p-5 text-center">
            <div className="relative mx-auto grid h-52 w-52 place-items-center overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm">
              {qrData ? <QRCodeSVG value={qrData} size={190} bgColor="#ffffff" fgColor="#102d20" level="M" includeMargin={false} /> : <RefreshCw className="h-8 w-8 animate-spin text-[var(--forest)]" />}
              {isRefreshing && <div className="absolute inset-0 grid place-items-center bg-white/80"><RefreshCw className="h-8 w-8 animate-spin text-[var(--forest)]" /></div>}
              <span className="absolute bottom-2 rounded bg-[var(--bark)] px-2 py-0.5 text-[9px] font-extrabold tracking-wide text-white">QR AMAN</span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3"><div className="relative h-9 w-9"><svg viewBox="0 0 36 36" className="h-full w-full -rotate-90"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#d6e2cf" strokeWidth="3" /><circle cx="18" cy="18" r="15.9" fill="none" stroke={expiring ? '#8a5638' : '#1e4b35'} strokeWidth="3" strokeDasharray={`${percentage} 100`} strokeLinecap="round" /></svg><span className={`absolute inset-0 grid place-items-center text-[10px] font-extrabold ${expiring ? 'text-[var(--bark)]' : 'text-[var(--forest)]'}`}>{secondsLeft}s</span></div><div className="text-left"><p className="flex items-center gap-1.5 text-sm font-bold text-[var(--forest-deep)]"><ShieldCheck className="h-4 w-4 text-[var(--bark)]" />QR diperbarui otomatis</p><p className="text-[11px] text-[var(--ink-soft)]">Gunakan kode yang tampil saat masuk.</p></div></div>
            {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--bark)]/25 bg-white/75 p-3 text-left text-xs leading-5 text-[var(--bark)]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
          </div>
          <dl className="my-5 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-4 text-sm"><div className="flex justify-between gap-4"><dt className="flex items-center gap-1.5 text-[var(--ink-soft)]"><Calendar className="h-4 w-4 text-[var(--bark)]" />Tanggal kunjungan</dt><dd className="text-right font-bold text-[var(--forest-deep)]">{visitDate}</dd></div><div className="flex justify-between gap-4"><dt className="flex items-center gap-1.5 text-[var(--ink-soft)]"><Clock className="h-4 w-4 text-[var(--bark)]" />Sesi kunjungan</dt><dd className="text-right font-bold text-[var(--forest-deep)]">{order.timeSlotLabel}</dd></div><div className="flex justify-between gap-4"><dt className="text-[var(--ink-soft)]">Pemesan</dt><dd className="text-right font-bold text-[var(--forest-deep)]">{order.visitorName || order.visitors?.[0]?.name || '-'}</dd></div><div className="flex justify-between gap-4 border-t border-[var(--border)] pt-3"><dt className="font-bold text-[var(--forest-deep)]">Total pembayaran</dt><dd className="font-serif text-lg font-bold text-[var(--bark)]">Rp {Number(order.grandTotal || 0).toLocaleString('id-ID')}</dd></div></dl>
          <button type="button" onClick={() => alert(`Mengunduh E-Ticket PDF untuk Order #${order.orderNumber}...`)} className="btn-secondary w-full border-[var(--bark)] text-[var(--bark)] hover:bg-[var(--bark)] hover:text-white"><Download className="h-4 w-4" />Unduh dokumen e-ticket</button>
        </div>
      </div>
    </div>
  );
}

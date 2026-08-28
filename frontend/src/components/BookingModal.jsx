import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Ticket, User, Users, X } from 'lucide-react';

const steps = [
  { number: '01', label: 'Jadwal' },
  { number: '02', label: 'Tiket & tamu' },
  { number: '03', label: 'Tinjau' },
];

function formatRupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

export default function BookingModal({ isOpen = true, destination, onClose, onBookingSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeStep, setActiveStep] = useState(1);
  const [visitDate, setVisitDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState(destination?.time_slots?.[0]?.id || '');
  const [quantities, setQuantities] = useState({ [destination?.ticket_categories?.[0]?.id || 'cat-1']: 1 });
  const [visitors, setVisitors] = useState([{ name: '', nik: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const total = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    setVisitors((previous) => Array.from({ length: total }, (_, index) => previous[index] || { name: '', nik: '' }));
  }, [quantities]);

  const totals = useMemo(() => {
    const ticketCategories = destination?.ticket_categories || [];
    return ticketCategories.reduce((result, category) => {
      const qty = quantities[category.id] || 0;
      result.ticket += Number(category.price || 0) * qty;
      result.insurance += Number(category.insurance || 0) * qty;
      result.retribution += Number(category.retribusi || 0) * qty;
      result.quantity += qty;
      return result;
    }, { ticket: 0, insurance: 0, retribution: 0, quantity: 0 });
  }, [destination, quantities]);
  const platformFee = totals.quantity > 0 ? 2500 : 0;
  const grandTotal = totals.ticket + totals.insurance + totals.retribution + platformFee;
  const selectedSlot = (destination?.time_slots || []).find((slot) => slot.id === selectedSlotId);

  if (!isOpen || !destination) return null;

  const changeQuantity = (categoryId, delta) => {
    setValidationMessage('');
    setQuantities((previous) => ({ ...previous, [categoryId]: Math.max(0, (previous[categoryId] || 0) + delta) }));
  };

  const changeVisitor = (index, field, value) => {
    setValidationMessage('');
    setVisitors((previous) => previous.map((visitor, visitorIndex) => visitorIndex === index ? { ...visitor, [field]: value } : visitor));
  };

  const moveForward = () => {
    if (activeStep === 2 && totals.quantity === 0) {
      setValidationMessage('Pilih minimal satu tiket untuk melanjutkan.');
      return;
    }
    if (activeStep === 2 && visitors.some((visitor) => !visitor.name.trim())) {
      setValidationMessage('Isi nama lengkap untuk setiap pengunjung.');
      return;
    }
    setValidationMessage('');
    setActiveStep((step) => Math.min(3, step + 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (activeStep < 3) {
      moveForward();
      return;
    }
    if (!totals.quantity || visitors.some((visitor) => !visitor.name.trim())) {
      setActiveStep(2);
      setValidationMessage('Lengkapi pilihan tiket dan nama pengunjung terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onBookingSuccess({
        orderNumber: `TWA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        destinationName: destination.name,
        visitDate,
        timeSlotLabel: selectedSlot?.label || 'Full Day',
        totalQty: totals.quantity,
        grandTotal,
        visitors,
        visitorName: visitors[0]?.name || '-',
        ticketCode: `TWA-QR-${Math.floor(10000 + Math.random() * 90000)}`,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      setValidationMessage(`Pemesanan belum dapat diproses: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="modal-content card relative max-w-2xl overflow-hidden bg-[var(--sand)]">
        <div className="border-b border-[var(--border)] bg-[var(--forest-deep)] px-5 pb-5 pt-6 text-white sm:px-7 sm:pt-7">
          <button id="close-booking-modal-btn" type="button" onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20" aria-label="Tutup pemesanan"><X className="h-4 w-4" /></button>
          <p className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[var(--leaf)]">Reservasi kunjungan</p>
          <h2 className="mt-2 max-w-md pr-10 font-serif text-2xl font-bold text-white sm:text-3xl">{destination.name}</h2>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
            {steps.map((step) => {
              const current = step.number === String(activeStep).padStart(2, '0');
              const completed = Number(step.number) < activeStep;
              return <div key={step.number} className="flex min-w-0 items-center gap-2"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${current || completed ? 'bg-[var(--leaf)] text-[var(--forest-deep)]' : 'border border-white/30 text-white/65'}`}>{completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.number}</span><span className={`truncate text-[10px] font-bold uppercase tracking-wide ${current ? 'text-white' : 'text-white/55'}`}>{step.label}</span></div>;
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="min-h-[340px] space-y-5 p-5 sm:p-7">
            {activeStep === 1 && <section aria-labelledby="booking-step-title">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]"><Calendar className="h-5 w-5" /></span><div><p className="eyebrow">Langkah 1 dari 3</p><h3 id="booking-step-title" className="mt-1 text-2xl font-bold">Pilih waktu kunjungan</h3><p className="mt-1 text-sm text-[var(--ink-soft)]">Ketersediaan akan mengikuti sesi yang Anda pilih.</p></div></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Tanggal kunjungan</span><input id="booking-date-input" type="date" min={todayStr} value={visitDate} onChange={(event) => setVisitDate(event.target.value)} className="field-control" required /></label><label className="block text-xs font-bold text-[var(--ink)]"><span className="mb-2 block uppercase tracking-wide text-[var(--ink-soft)]">Sesi kunjungan</span><select id="booking-timeslot-select" value={selectedSlotId} onChange={(event) => setSelectedSlotId(event.target.value)} className="field-control">{(destination.time_slots || []).map((slot) => <option key={slot.id} value={slot.id}>{slot.label} · sisa {Math.max(0, slot.max_capacity - slot.booked)} orang</option>)}</select></label></div>
              {selectedSlot && <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--fog)] px-4 py-3 text-xs text-[var(--ink-soft)]"><strong className="text-[var(--forest-deep)]">{selectedSlot.label}</strong><span className="ml-2">tersisa {Math.max(0, selectedSlot.max_capacity - selectedSlot.booked).toLocaleString('id-ID')} dari {Number(selectedSlot.max_capacity || 0).toLocaleString('id-ID')} pengunjung.</span></div>}
            </section>}

            {activeStep === 2 && <section aria-labelledby="booking-step-title">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]"><Users className="h-5 w-5" /></span><div><p className="eyebrow">Langkah 2 dari 3</p><h3 id="booking-step-title" className="mt-1 text-2xl font-bold">Tiket dan pengunjung</h3><p className="mt-1 text-sm text-[var(--ink-soft)]">Tambahkan tiket, lalu isi data minimum setiap orang.</p></div></div>
              <div className="mt-6 space-y-3">{(destination.ticket_categories || []).map((category) => { const qty = quantities[category.id] || 0; return <div key={category.id} className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-4"><div className="flex items-center justify-between gap-4"><div><h4 className="text-sm font-bold text-[var(--forest-deep)]">{category.name}</h4><p className="mt-1 text-xs text-[var(--ink-soft)]">{formatRupiah(category.price)} + biaya sesuai ketentuan</p></div><div className="flex shrink-0 items-center gap-2"><button type="button" id={`btn-dec-${category.id}`} onClick={() => changeQuantity(category.id, -1)} className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] bg-white font-bold text-[var(--forest)] hover:bg-[var(--leaf-pale)]" aria-label={`Kurangi ${category.name}`}>−</button><strong className="w-5 text-center text-sm">{qty}</strong><button type="button" id={`btn-inc-${category.id}`} onClick={() => changeQuantity(category.id, 1)} className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--forest)] font-bold text-white hover:bg-[var(--forest-deep)]" aria-label={`Tambah ${category.name}`}>+</button></div></div></div>; })}</div>
              <div className="mt-6 border-t border-[var(--border)] pt-5"><div className="flex items-center gap-2"><User className="h-4 w-4 text-[var(--bark)]" /><h4 className="text-sm font-bold">Data pengunjung</h4></div>{totals.quantity === 0 ? <p className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--fog)] p-4 text-center text-xs text-[var(--ink-soft)]">Pilih tiket terlebih dahulu untuk mengisi data pengunjung.</p> : <div className="mt-3 space-y-3">{visitors.map((visitor, index) => <div key={index} className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-3.5"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--bark)]">Pengunjung {index + 1}</span><div className="mt-2.5 grid gap-2 sm:grid-cols-2"><input id={`visitor-name-input-${index}`} value={visitor.name} onChange={(event) => changeVisitor(index, 'name', event.target.value)} className="field-control" placeholder="Nama lengkap sesuai identitas" required /><input id={`visitor-nik-input-${index}`} value={visitor.nik} onChange={(event) => changeVisitor(index, 'nik', event.target.value)} className="field-control" placeholder="NIK / nomor identitas (opsional)" /></div></div>)}</div>}</div>
            </section>}

            {activeStep === 3 && <section aria-labelledby="booking-step-title">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--bark-pale)] text-[var(--bark)]"><Ticket className="h-5 w-5" /></span><div><p className="eyebrow !text-[var(--bark)]">Langkah 3 dari 3</p><h3 id="booking-step-title" className="mt-1 text-2xl font-bold">Tinjau pesanan</h3><p className="mt-1 text-sm text-[var(--ink-soft)]">Pastikan jadwal dan data pengunjung sudah benar sebelum menerbitkan tiket.</p></div></div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="surface-muted p-4"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Jadwal kunjungan</span><strong className="mt-2 block text-sm text-[var(--forest-deep)]">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${visitDate}T00:00:00`))}</strong><span className="mt-1 block text-xs text-[var(--ink-soft)]">{selectedSlot?.label || 'Sesi belum dipilih'}</span></div><div className="surface-muted p-4"><span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Pengunjung</span><strong className="mt-2 block text-sm text-[var(--forest-deep)]">{totals.quantity} tiket</strong><span className="mt-1 block truncate text-xs text-[var(--ink-soft)]">{visitors.map((visitor) => visitor.name).join(', ')}</span></div></div>
              <div className="mt-5 rounded-2xl border border-[var(--border-hover)] bg-[var(--leaf-pale)] p-5"><div className="space-y-2 text-xs text-[var(--ink-soft)]"><div className="flex justify-between gap-4"><span>Subtotal tiket ({totals.quantity})</span><strong className="text-[var(--ink)]">{formatRupiah(totals.ticket)}</strong></div><div className="flex justify-between gap-4"><span>Asuransi & retribusi</span><strong className="text-[var(--ink)]">{formatRupiah(totals.insurance + totals.retribution)}</strong></div><div className="flex justify-between gap-4"><span>Biaya sistem</span><strong className="text-[var(--ink)]">{formatRupiah(platformFee)}</strong></div></div><div className="mt-4 flex items-end justify-between border-t border-[var(--forest-soft)]/30 pt-4"><span className="font-bold text-[var(--forest-deep)]">Total pembayaran</span><strong className="font-serif text-2xl text-[var(--bark)]">{formatRupiah(grandTotal)}</strong></div></div>
            </section>}
            {validationMessage && <p role="alert" className="rounded-xl border border-[var(--bark)]/25 bg-[var(--bark-pale)] px-3 py-2.5 text-xs font-semibold text-[var(--bark)]">{validationMessage}</p>}
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[rgba(255,254,250,.96)] px-5 py-4 backdrop-blur-sm sm:px-7">
            {activeStep > 1 ? <button type="button" onClick={() => { setValidationMessage(''); setActiveStep((step) => step - 1); }} className="btn-secondary btn-sm"><ArrowLeft className="h-3.5 w-3.5" />Kembali</button> : <span className="text-xs font-semibold text-[var(--ink-soft)]">Aman &amp; transparan</span>}
            {activeStep < 3 ? <button type="submit" className="btn-primary">Lanjutkan<ArrowRight className="h-4 w-4" /></button> : <button id="submit-booking-btn" type="submit" disabled={isSubmitting} className="btn-clay disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? 'Memproses pesanan…' : 'Konfirmasi & bayar'}<ArrowRight className="h-4 w-4" /></button>}
          </div>
        </form>
      </div>
    </div>
  );
}

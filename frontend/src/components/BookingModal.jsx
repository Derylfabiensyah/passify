import React, { useState } from 'react';
import { X, Calendar, Clock, User, ShieldCheck, CreditCard, Ticket, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BookingModal({ destination, onClose, onBookingSuccess }) {
  if (!destination) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState(destination.time_slots[0]?.id || '');
  const [quantities, setQuantities] = useState({
    [destination.ticket_categories[0]?.id || 'cat-1']: 1
  });

  const [visitorName, setVisitorName] = useState('');
  const [visitorNik, setVisitorNik] = useState('');
  const [nationality, setNationality] = useState('WNI');
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQtyChange = (catId, delta) => {
    setQuantities((prev) => {
      const current = prev[catId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [catId]: next };
    });
  };

  // Calculate fees
  let totalTicketPrice = 0;
  let totalInsurance = 0;
  let totalRetribusi = 0;
  let totalQty = 0;

  destination.ticket_categories.forEach((cat) => {
    const qty = quantities[cat.id] || 0;
    totalQty += qty;
    totalTicketPrice += cat.price * qty;
    totalInsurance += cat.insurance * qty;
    totalRetribusi += cat.retribusi * qty;
  });

  const platformFee = totalQty > 0 ? 2500 : 0;
  const grandTotal = totalTicketPrice + totalInsurance + totalRetribusi + platformFee;

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (totalQty === 0) {
      alert('Pilih minimal 1 tiket untuk melanjutkan.');
      return;
    }
    if (!visitorName.trim()) {
      alert('Mohon isi Nama Pemesan.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newOrder = {
        orderNumber: `TWA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        destinationName: destination.name,
        visitDate,
        timeSlotLabel: destination.time_slots.find((ts) => ts.id === selectedSlotId)?.label || 'Full Day',
        totalQty,
        grandTotal,
        visitorName,
        visitorNik,
        ticketCode: `TWA-QR-${Math.floor(10000 + Math.random() * 90000)}`,
        totpSecret: 'JBSWY3DPEHPK3PXP',
        createdAt: new Date().toISOString()
      };
      onBookingSuccess(newOrder);
    }, 1000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card relative p-6 sm:p-8">
        {/* Close Button */}
        <button
          id="close-booking-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-zinc-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-lg border border-zinc-800 bg-zinc-900 text-slate-300 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">Pemesanan Tiket Wisata</h2>
            <p className="text-sm text-slate-400">{destination.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* Step 1: Date & Time Slot */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              1. Pilih Tanggal Kunjungan & Sesi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-sm text-slate-400 block mb-1">Tanggal Kunjungan</span>
                <input
                  id="booking-date-input"
                  type="date"
                  min={todayStr}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <span className="text-sm text-slate-400 block mb-1">Sesi Kunjungan (Time Slot)</span>
                <select
                  id="booking-timeslot-select"
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  {destination.time_slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} (Sisa: {slot.max_capacity - slot.booked})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Select Ticket Categories */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Ticket className="w-4 h-4" />
              2. Pilih Kategori Tiket
            </label>
            <div className="space-y-2.5">
              {destination.ticket_categories.map((cat) => {
                const qty = quantities[cat.id] || 0;
                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-200">{cat.name}</div>
                      <div className="text-sm text-slate-300 font-semibold">
                        Rp {cat.price.toLocaleString('id-ID')}
                        <span className="text-xs text-slate-400 font-normal ml-2">
                          (+Asuransi Rp {cat.insurance.toLocaleString('id-ID')} & Retribusi Rp {cat.retribusi.toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`btn-dec-${cat.id}`}
                        onClick={() => handleQtyChange(cat.id, -1)}
                        className="w-8 h-8 rounded-lg bg-zinc-800 text-slate-200 hover:bg-zinc-700 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-white">{qty}</span>
                      <button
                        type="button"
                        id={`btn-inc-${cat.id}`}
                        onClick={() => handleQtyChange(cat.id, 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Visitor Info */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              3. Data Utama Pemesan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  id="visitor-name-input"
                  type="text"
                  placeholder="Nama Lengkap Sesuai KTP"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <input
                  id="visitor-nik-input"
                  type="text"
                  placeholder="NIK / No KTP / Paspor"
                  value={visitorNik}
                  onChange={(e) => setVisitorNik(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Price Summary */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal Tiket ({totalQty} tiket)</span>
              <span className="text-slate-300 font-semibold">Rp {totalTicketPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Asuransi Jiwa & Retribusi Pemda</span>
              <span className="text-slate-300 font-semibold">Rp {(totalInsurance + totalRetribusi).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Biaya Layanan SaaS Passify</span>
              <span className="text-slate-300 font-semibold">Rp {platformFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-zinc-800 flex justify-between items-center">
              <span className="font-semibold text-slate-300">Total Pembayaran</span>
              <span className="font-bold text-white text-lg">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-booking-btn"
            disabled={isSubmitting || totalQty === 0}
            className="w-full btn-primary py-3 justify-center text-sm font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span>Memproses...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Konfirmasi & Bayar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

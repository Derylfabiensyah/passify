import React, { useState } from 'react';
import { X, Calendar, User, Ticket, ArrowRight } from 'lucide-react';

export default function BookingModal({ destination, onClose, onBookingSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState(destination?.time_slots?.[0]?.id || '');
  const [quantities, setQuantities] = useState({
    [destination?.ticket_categories?.[0]?.id || 'cat-1']: 1
  });

  const [visitorName, setVisitorName] = useState('');
  const [visitorNik, setVisitorNik] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!destination) return null;

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
      <div className="modal-content card relative max-w-xl w-full rounded-[18px] border border-[#cddac8] bg-[#fffdf8] p-5 shadow-[0_24px_60px_rgba(23,59,50,0.18)] sm:p-7">
        {/* Close Button */}
        <button
          id="close-booking-modal-btn"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#c6d2c2] bg-white text-[#80512f] transition-colors hover:border-[#80512f] hover:bg-[#fff3e8] hover:text-[#5f3622] focus:outline-none focus:ring-2 focus:ring-[#9aae85] sm:right-7 sm:top-7"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 flex items-center gap-3 border-b border-[#cddac8] pb-5 pr-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#b8cbb0] bg-[#e7efdf] text-[#173b32] shadow-sm">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-['Outfit'] text-[1.35rem] font-bold leading-tight text-[#173b32]">Pemesanan Tiket Wisata Alam</h2>
            <p className="mt-1 text-sm leading-snug text-[#52635d]">{destination.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-5">
          {/* Step 1: Date & Time Slot */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#173b32]">
              <Calendar className="w-4 h-4 text-[#80512f]" />
              1. Pilih Tanggal Kunjungan & Sesi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <span className="mb-1 block text-xs font-semibold text-[#52635d]">Tanggal Kunjungan</span>
                <input
                  id="booking-date-input"
                  type="date"
                  min={todayStr}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] px-3 py-2.5 text-sm text-[#173b32] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  required
                />
              </div>

              <div>
                <span className="mb-1 block text-xs font-semibold text-[#52635d]">Sesi Kunjungan (Time Slot)</span>
                <select
                  id="booking-timeslot-select"
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] px-3 py-2.5 text-sm text-[#173b32] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                >
                  {destination.time_slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label} (Sisa Kuota: {slot.max_capacity - slot.booked})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Select Ticket Categories */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#173b32]">
              <Ticket className="w-4 h-4 text-[#80512f]" />
              2. Pilih Kategori Tiket
            </label>
            <div className="space-y-2.5">
              {destination.ticket_categories.map((cat) => {
                const qty = quantities[cat.id] || 0;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#cddac8] bg-[#f5f8f2] p-3.5 shadow-sm sm:p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#173b32]">{cat.name}</div>
                      <div className="mt-0.5 text-sm font-bold text-[#80512f]">
                        Rp {cat.price.toLocaleString('id-ID')}
                        <span className="ml-2 text-xs font-normal leading-snug text-[#52635d]">
                          (+Asuransi Rp {cat.insurance.toLocaleString('id-ID')} & Retribusi Rp {cat.retribusi.toLocaleString('id-ID')})
                        </span>
                      </div>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        id={`btn-dec-${cat.id}`}
                        onClick={() => handleQtyChange(cat.id, -1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#b8cbb0] bg-white text-base font-bold text-[#173b32] transition-colors hover:bg-[#e7efdf] focus:outline-none focus:ring-2 focus:ring-[#9aae85]"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-[#173b32]">{qty}</span>
                      <button
                        type="button"
                        id={`btn-inc-${cat.id}`}
                        onClick={() => handleQtyChange(cat.id, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#173b32] text-base font-bold text-white shadow-sm transition-colors hover:bg-[#28594e] focus:outline-none focus:ring-2 focus:ring-[#9aae85]"
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
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#173b32]">
              <User className="w-4 h-4 text-[#80512f]" />
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
                  className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] px-3 py-2.5 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                  required
                />
              </div>
              <div>
                <input
                  id="visitor-nik-input"
                  type="text"
                  placeholder="NIK / No Identitas"
                  value={visitorNik}
                  onChange={(e) => setVisitorNik(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-[#c6d2c2] bg-[#f5f8f2] px-3 py-2.5 text-sm text-[#173b32] placeholder:text-[#77857d] transition-colors focus:border-[#173b32] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9aae85]/40"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Price Summary */}
          <div className="space-y-2 rounded-xl border border-[#b8cbb0] bg-[#e7efdf] p-4 text-sm shadow-sm">
            <div className="flex justify-between gap-4 text-[#52635d]">
              <span>Subtotal Tiket ({totalQty} tiket)</span>
              <span className="whitespace-nowrap font-semibold text-[#173b32]">Rp {totalTicketPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#52635d]">
              <span>Asuransi Jiwa & Retribusi Pemda</span>
              <span className="whitespace-nowrap font-semibold text-[#173b32]">Rp {(totalInsurance + totalRetribusi).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between gap-4 text-[#52635d]">
              <span>Biaya Sistem Cloud Passify</span>
              <span className="whitespace-nowrap font-semibold text-[#173b32]">Rp {platformFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#9aae85] pt-3">
              <span className="font-semibold text-[#173b32]">Total Pembayaran</span>
              <span className="text-lg font-bold text-[#80512f]">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-booking-btn"
            disabled={isSubmitting || totalQty === 0}
            className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#173b32] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#28594e] focus:outline-none focus:ring-2 focus:ring-[#9aae85] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#7b9680]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span>Memproses Pesanan...</span>
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

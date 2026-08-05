import React, { useState } from 'react';
import { X, Calendar, Clock, User, ShieldCheck, CreditCard, Ticket, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BookingModal({ destination, onClose, onBookingSuccess }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [visitDate, setVisitDate] = useState(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState(destination?.time_slots?.[0]?.id || '');
  const [quantities, setQuantities] = useState({
    [destination?.ticket_categories?.[0]?.id || 'cat-1']: 1
  });

  const [visitorName, setVisitorName] = useState('');
  const [visitorNik, setVisitorNik] = useState('');
  const [nationality, setNationality] = useState('WNI');
  const [paymentMethod, setPaymentMethod] = useState('qris');
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
      <div className="modal-content card relative p-6 sm:p-8 bg-white border border-gray-200 shadow-xl max-w-xl w-full">
        {/* Close Button */}
        <button
          id="close-booking-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 text-emerald-600 flex items-center justify-center shadow-2xs">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-['Outfit']">Pemesanan Tiket Wisata Alam</h2>
            <p className="text-sm text-gray-500">{destination.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-6">
          {/* Step 1: Date & Time Slot */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              1. Pilih Tanggal Kunjungan & Sesi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <span className="text-xs font-medium text-gray-500 block mb-1">Tanggal Kunjungan</span>
                <input
                  id="booking-date-input"
                  type="date"
                  min={todayStr}
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 block mb-1">Sesi Kunjungan (Time Slot)</span>
                <select
                  id="booking-timeslot-select"
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
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
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-emerald-600" />
              2. Pilih Kategori Tiket
            </label>
            <div className="space-y-2.5">
              {destination.ticket_categories.map((cat) => {
                const qty = quantities[cat.id] || 0;
                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{cat.name}</div>
                      <div className="text-sm text-emerald-700 font-bold">
                        Rp {cat.price.toLocaleString('id-ID')}
                        <span className="text-xs text-gray-500 font-normal ml-2">
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
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-gray-900">{qty}</span>
                      <button
                        type="button"
                        id={`btn-inc-${cat.id}`}
                        onClick={() => handleQtyChange(cat.id, 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold shadow-2xs"
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
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Price Summary */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2 text-sm shadow-2xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal Tiket ({totalQty} tiket)</span>
              <span className="text-gray-900 font-semibold">Rp {totalTicketPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Asuransi Jiwa & Retribusi Pemda</span>
              <span className="text-gray-900 font-semibold">Rp {(totalInsurance + totalRetribusi).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Biaya Sistem Cloud Passify</span>
              <span className="text-gray-900 font-semibold">Rp {platformFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Pembayaran</span>
              <span className="font-bold text-gray-900 text-lg">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit-booking-btn"
            disabled={isSubmitting || totalQty === 0}
            className="w-full btn-primary py-3 justify-center text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
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

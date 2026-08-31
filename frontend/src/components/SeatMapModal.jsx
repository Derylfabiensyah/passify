import React, { useState, useEffect } from 'react';
import { X, Check, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ModalWrapper from './common/ModalWrapper';

/**
 * SeatMapModal - Interactive seat selection component with live seat lock timer.
 * Supports VIP, Tribune, and General Admission seating tiers.
 */
export default function SeatMapModal({ isOpen, onClose, destinationId, onSeatsSelected }) {
  const { toast } = useToast();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeZone, setActiveZone] = useState('VIP Area');
  const [countdown, setCountdown] = useState(300); // 5 min lock timer
  const [isLocked, setIsLocked] = useState(false);

  // Mock seat layout grid for interactive display
  const zones = [
    { id: 'z1', name: 'VIP Amphitheater (Depan)', price: 150000, color: 'border-amber-400 bg-amber-50 text-amber-900', badge: 'VIP' },
    { id: 'z2', name: 'Tribune Utama (Tengah)', price: 75000, color: 'border-emerald-500 bg-emerald-50 text-emerald-900', badge: 'Tribune' },
    { id: 'z3', name: 'Tribun Atas & Panorama (Belakang)', price: 50000, color: 'border-blue-400 bg-blue-50 text-blue-900', badge: 'Reguler' },
  ];

  // Generate 4 rows x 10 seats per row
  const rows = ['A', 'B', 'C', 'D'];
  const cols = Array.from({ length: 10 }, (_, i) => i + 1);

  // Pre-booked seats simulation
  const bookedSeats = ['A-3', 'A-4', 'B-7', 'C-1', 'C-2', 'D-9', 'D-10'];

  useEffect(() => {
    let timer;
    if (isLocked && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, countdown]);

  if (!isOpen) return null;

  const currentZone = zones.find(z => z.name.includes(activeZone.split(' ')[0])) || zones[0];

  const handleSeatClick = (seatCode) => {
    if (bookedSeats.includes(seatCode)) return;

    setSelectedSeats(prev => {
      if (prev.some(s => s.code === seatCode)) {
        return prev.filter(s => s.code !== seatCode);
      }
      if (prev.length >= 6) {
        toast.warning('Maksimal 6 kursi per reservasi.');
        return prev;
      }
      return [...prev, { code: seatCode, zone: currentZone.badge, price: currentZone.price }];
    });
  };

  const handleLockSeats = () => {
    if (selectedSeats.length === 0) return;
    setIsLocked(true);
    setCountdown(300); // 5 mins
  };

  const handleConfirm = () => {
    if (onSeatsSelected) {
      onSeatsSelected(selectedSeats);
    }
    onClose();
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      className="p-0 overflow-hidden bg-[var(--surface)] border-[var(--border)]"
      ariaLabel="Seat Map Interaktif Passify"
    >
      <div>
        {/* Header */}
        <div className="bg-[var(--forest-deep)] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--leaf-pale)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--forest-deep)] mb-1">
              <Sparkles className="w-3 h-3 text-[var(--bark)]" />
              <span>Seat Map Interaktif Passify</span>
            </div>
            <h2 className="font-heading text-xl font-bold">Pilih Kursi &amp; Zona Amfiteater</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            aria-label="Tutup pemilihan kursi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Zone Selector */}
          <div className="grid grid-cols-3 gap-2">
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setActiveZone(zone.name)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  activeZone === zone.name
                    ? 'border-[var(--forest-deep)] bg-[var(--forest-deep)] text-white shadow-sm'
                    : 'border-[var(--border)] bg-[var(--canvas)] text-[var(--forest-deep)] hover:border-[var(--bark)]'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{zone.badge}</div>
                <div className="text-xs font-bold mt-0.5 truncate">{zone.name.split(' ')[0]}</div>
                <div className="text-xs font-semibold mt-1">Rp {zone.price.toLocaleString('id-ID')}</div>
              </button>
            ))}
          </div>

          {/* Stage / Panggung Alam Banner */}
          <div className="relative py-2 text-center">
            <div className="h-2 w-3/4 mx-auto rounded-full bg-gradient-to-r from-transparent via-[var(--bark)] to-transparent mb-1.5" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              PANGGUNG UTAMA / VIEW PANORAMA
            </span>
          </div>

          {/* Seat Grid with min 44x44px touch targets */}
          <div className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] space-y-3 shadow-inner">
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px] space-y-2.5">
                {rows.map((row) => (
                  <div key={row} className="flex items-center justify-center gap-3">
                    <span className="w-5 text-center text-xs font-bold text-[var(--ink-soft)]">{row}</span>
                    <div className="flex gap-2">
                      {cols.map((col) => {
                        const seatCode = `${row}-${col}`;
                        const isBooked = bookedSeats.includes(seatCode);
                        const isSelected = selectedSeats.some(s => s.code === seatCode);

                        return (
                          <button
                            key={seatCode}
                            type="button"
                            disabled={isBooked}
                            onClick={() => handleSeatClick(seatCode)}
                            title={`Kursi ${seatCode} - ${isBooked ? 'Sudah Terisi' : 'Tersedia'}`}
                            aria-label={`Kursi ${seatCode}, ${isBooked ? 'Sudah Terisi' : isSelected ? 'Dipilih' : 'Tersedia'}`}
                            className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                              isBooked
                                ? 'bg-[var(--canvas)] text-[var(--ink-soft)]/40 border border-[var(--border)] cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-[var(--bark)] text-white ring-2 ring-[var(--bark)] ring-offset-2 scale-105 shadow-xs'
                                : 'bg-[var(--leaf-pale)] text-[var(--forest-deep)] border border-[var(--border)] hover:bg-[var(--border)] hover:scale-105 shadow-2xs'
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-5 text-center text-xs font-bold text-[var(--ink-soft)]">{row}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-center gap-5 text-xs text-[var(--ink-soft)]">
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-md bg-[var(--leaf-pale)] border border-[var(--border)]" /> Tersedia
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-md bg-[var(--bark)]" /> Terpilih
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-md bg-[var(--canvas)] border border-[var(--border)] opacity-60" /> Terisi (Booked)
              </span>
            </div>
          </div>

          {/* Lock status banner */}
          {isLocked && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="font-medium">Kursi terkunci untuk Anda (Redis Distributed Lock)</span>
              </div>
              <span className="font-mono font-bold text-sm text-amber-700">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Summary & Actions */}
          <div className="bg-[var(--canvas)] p-4 rounded-xl border border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--ink-soft)]">
                {selectedSeats.length > 0
                  ? `Kursi Terpilih: ${selectedSeats.map(s => s.code).join(', ')}`
                  : 'Belum ada kursi yang dipilih'}
              </div>
              <div className="text-lg font-bold text-[var(--forest-deep)] font-heading">
                Total: Rp {totalPrice.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="flex gap-2">
              {!isLocked ? (
                <button
                  type="button"
                  disabled={selectedSeats.length === 0}
                  onClick={handleLockSeats}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bark)] text-white text-xs font-bold hover:bg-[var(--forest-deep)] transition-colors disabled:opacity-50"
                >
                  Kunci Kursi (5 Mnt)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2.5 rounded-xl bg-[var(--forest-deep)] text-white text-xs font-bold hover:bg-[var(--bark)] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Konfirmasi Pilihan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

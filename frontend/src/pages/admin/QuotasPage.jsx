import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  AlertTriangle,
  X,
  Save,
  Clock,
  Users,
  Ban,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  CalendarOff,
  CalendarCheck,
  CheckCircle2
} from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { fetchAdminDestinations, fetchAdminQuotas } from '../../api/admin';
import { apiRequest } from '../../api/client';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { ADMIN_DESTINATIONS, QUOTA_CALENDAR } from '../../data/adminData';

function QuotaDayCard({ day, onEditQuota, onToggleClose }) {
  const remaining = day.max_capacity - day.booked;
  const usedPct = day.is_closed ? 0 : Math.round((day.booked / day.max_capacity) * 100);
  const isToday = day.date === new Date().toISOString().split('T')[0];

  return (
    <div
      className={`p-3.5 rounded-2xl transition-all shadow-2xs ${
        day.is_closed
          ? 'bg-red-50'
          : 'bg-white hover:shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-gray-900">{day.dayLabel}</span>
          {isToday && (
            <span className="ml-1.5 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
              HARI INI
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onToggleClose(day)}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
            title={day.is_closed ? 'Buka Kembali' : 'Tutup Sementara'}
          >
            {day.is_closed ? (
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <CalendarOff className="w-3.5 h-3.5 text-red-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onEditQuota(day)}
            className="w-6 h-6 rounded text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors"
            title="Ubah Kuota"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      {day.is_closed ? (
        <div className="text-center py-2.5">
          <Ban className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <span className="text-[10px] text-red-700 font-bold block tracking-wider">
            DITUTUP SEMENTARA
          </span>
        </div>
      ) : (
        <>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>
              Terisi:{' '}
              <strong className="text-gray-900 font-semibold">
                {day.booked.toLocaleString('id-ID')}
              </strong>
            </span>
            <span>
              Sisa:{' '}
              <strong className="text-emerald-700 font-semibold">
                {remaining.toLocaleString('id-ID')}
              </strong>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function TimeSlotCard({ slot, onEdit, onDelete }) {
  const usedPct = slot.max_capacity > 0 ? Math.round((slot.booked / slot.max_capacity) * 100) : 0;
  return (
    <div className={`card p-4 bg-white rounded-2xl shadow-sm ${!slot.is_active ? 'opacity-70 bg-gray-50' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center shadow-2xs">
            <Clock className={`w-4 h-4 ${slot.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <span>{slot.label}</span>
              {!slot.is_active && (
                <span className="text-[9px] bg-gray-100 text-gray-600 font-semibold px-1.5 py-0.5 rounded shadow-2xs">
                  Nonaktif
                </span>
              )}
            </div>
            {slot.time_range && (
              <div className="text-[10px] text-gray-500">{slot.time_range}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(slot)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 bg-gray-50 shadow-2xs transition-colors"
            title="Ubah Sesi"
          >
            <Pencil className="w-3 h-3" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(slot.id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 bg-gray-50 shadow-2xs transition-colors"
              title="Hapus Sesi"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden my-2.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            usedPct >= 90 ? 'bg-amber-500' : 'bg-emerald-600'
          }`}
          style={{ width: `${Math.min(usedPct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>
          Terisi: <strong className="text-gray-900 font-semibold">{slot.booked || 0} pax</strong>
        </span>
        <span>
          Kapasitas: <strong className="text-gray-900 font-semibold">{slot.max_capacity} pax</strong>
        </span>
      </div>
    </div>
  );
}

function EditQuotaModal({ day, onClose, onSave }) {
  const [capacity, setCapacity] = useState(day.max_capacity);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (capacity < day.booked) {
      setError(`Kapasitas (${capacity}) tidak boleh lebih kecil dari jumlah tiket yang sudah terpesan (${day.booked}).`);
      return;
    }
    onSave(day.date, capacity);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card p-6 max-w-sm w-full bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 font-['Outfit']">Ubah Kuota {day.dayLabel}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kapasitas Maksimal Hari Ini
            </label>
            <input
              type="number"
              min={day.booked}
              value={capacity}
              onChange={(e) => {
                setCapacity(Number(e.target.value));
                setError('');
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
            <span className="text-[11px] text-gray-500 mt-1 block">
              Saat ini terpesan: {day.booked.toLocaleString('id-ID')} pax
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full btn-primary py-2.5 justify-center text-xs font-semibold shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTimeSlotModal({ slot, onClose, onSave }) {
  const isNew = !slot?.id;
  const [formData, setFormData] = useState({
    label: slot?.label || '',
    time_range: slot?.time_range || '',
    max_capacity: slot?.max_capacity !== undefined ? slot.max_capacity : 500,
    is_active: slot?.is_active !== undefined ? slot.is_active : true
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      setError('Nama sesi wajib diisi.');
      return;
    }
    if (formData.max_capacity <= 0) {
      setError('Kapasitas harus lebih besar dari 0.');
      return;
    }
    onSave({
      ...slot,
      ...formData,
      id: slot?.id || `ts-${Date.now()}`,
      booked: slot?.booked || 0
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card p-6 max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 font-['Outfit']">
            {isNew ? 'Tambah Sesi Kunjungan Baru' : 'Ubah Sesi Kunjungan'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Sesi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Sesi Pagi (08:00 - 12:00)"
              value={formData.label}
              onChange={(e) => {
                setFormData({ ...formData, label: e.target.value });
                setError('');
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Rentang Waktu (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: 08:00 - 12:00 WIB"
              value={formData.time_range}
              onChange={(e) => setFormData({ ...formData, time_range: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kapasitas Maksimal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.max_capacity}
                onChange={(e) => {
                  setFormData({ ...formData, max_capacity: Number(e.target.value) });
                  setError('');
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Status Operasional
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.value === 'active' })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2.5 justify-center text-xs font-semibold shadow-2xs mt-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isNew ? 'Tambah Sesi Kunjungan' : 'Simpan Perubahan Sesi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function QuotasPage() {
  const { slug } = useTenant();
  const [destinations, setDestinations] = useState(ADMIN_DESTINATIONS);
  const [selectedDestId, setSelectedDestId] = useState(ADMIN_DESTINATIONS[0]?.id || 'dest-1');
  const [quotaCalendar, setQuotaCalendar] = useState(QUOTA_CALENDAR);
  const [editingQuota, setEditingQuota] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load real destinations
  useEffect(() => {
    async function loadData() {
      try {
        const dests = await fetchAdminDestinations(slug);
        if (dests && dests.length > 0) {
          setDestinations(dests);
          setSelectedDestId(dests[0].id);

          // Fetch quota calendar and time slots
          const { quotas, timeSlots } = await fetchAdminQuotas(dests[0].id);
          if (timeSlots && timeSlots.length > 0) {
            setDestinations((prev) =>
              prev.map((d, idx) => (idx === 0 ? { ...d, time_slots: timeSlots } : d))
            );
          }
        }
      } catch (err) {
        console.warn('Quota load error:', err);
      }
    }
    loadData();
  }, [slug]);

  const selectedDest = destinations.find((d) => d.id === selectedDestId) || destinations[0] || {};

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleClose = (day) => {
    setQuotaCalendar((prev) =>
      prev.map((d) => (d.date === day.date ? { ...d, is_closed: !d.is_closed } : d))
    );
    showToast(
      day.is_closed
        ? `Kuota ${day.dayLabel} berhasil dibuka kembali.`
        : `Kuota ${day.dayLabel} ditutup sementara.`
    );
  };

  const handleSaveQuota = (date, newCapacity) => {
    setQuotaCalendar((prev) =>
      prev.map((d) => (d.date === date ? { ...d, max_capacity: newCapacity } : d))
    );
    showToast(`Kapasitas harian berhasil diperbarui menjadi ${newCapacity.toLocaleString('id-ID')} pax.`);
  };

  const handleSaveTimeSlot = async (updatedSlot) => {
    setDestinations((prevDests) =>
      prevDests.map((dest) => {
        if (dest.id !== selectedDest.id) return dest;
        const currentSlots = dest.time_slots || [];
        const exists = currentSlots.some((s) => s.id === updatedSlot.id);
        const newSlots = exists
          ? currentSlots.map((s) => (s.id === updatedSlot.id ? { ...s, ...updatedSlot } : s))
          : [...currentSlots, { ...updatedSlot, id: updatedSlot.id || `ts-${Date.now()}`, booked: updatedSlot.booked || 0 }];
        return {
          ...dest,
          time_slots: newSlots
        };
      })
    );
    showToast(`Sesi "${updatedSlot.label}" berhasil disimpan!`);
    setEditingSlot(null);

    // Sync with ticket service
    try {
      await apiRequest('/api/v1/tickets/time-slots', {
        method: 'POST',
        body: {
          destination_id: selectedDest.id,
          ...updatedSlot,
        },
      }).catch(() => null);
    } catch (_) {}
  };

  const handleDeleteTimeSlot = (slotId) => {
    setDestinations((prevDests) =>
      prevDests.map((dest) => {
        if (dest.id !== selectedDest.id) return dest;
        return {
          ...dest,
          time_slots: (dest.time_slots || []).filter((s) => s.id !== slotId)
        };
      })
    );
    showToast('Sesi kunjungan berhasil dihapus.');
  };

  const totalWeeklyCapacity = quotaCalendar.reduce((sum, d) => sum + d.max_capacity, 0);
  const totalWeeklyBooked = quotaCalendar.reduce((sum, d) => sum + d.booked, 0);
  const weeklyOccupancyPct = totalWeeklyCapacity > 0 ? Math.round((totalWeeklyBooked / totalWeeklyCapacity) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit']">
            Manajemen Kuota & Kapasitas Kunjungan
          </h1>
        </div>
      </div>

      {/* KPI Cards (Minimalist style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Users}
          label="Total Kapasitas Minggu Ini"
          value={`${totalWeeklyCapacity.toLocaleString('id-ID')} pax`}
          subValue="Batas maksimal daya dukung kawasan"
          badgeText="CAPACITY"
        />
        <AdminStatCard
          icon={CalendarClock}
          label="Total Terisi Minggu Ini"
          value={`${totalWeeklyBooked.toLocaleString('id-ID')} pax`}
          subValue="Reservasi terkonfirmasi via aplikasi"
          progress={weeklyOccupancyPct}
          badgeText="BOOKED"
        />
        <AdminStatCard
          icon={CheckCircle2}
          label="Sisa Kuota Tersedia"
          value={`${Math.max(0, totalWeeklyCapacity - totalWeeklyBooked).toLocaleString('id-ID')} pax`}
          subValue="Dapat dipesan secara daring"
          badgeText="AVAILABLE"
        />
        <AdminStatCard
          icon={ShieldCheck}
          label="Status Daya Dukung Kawasan"
          value={`${weeklyOccupancyPct < 75 ? 'Aman' : weeklyOccupancyPct < 90 ? 'Waspada' : 'Kritis'} (${weeklyOccupancyPct}%)`}
          subValue="Sesuai rekomendasi regulasi kenyamanan tenant"
          badgeText="ECOLOGY"
        />
      </div>

      {/* Destination Select */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {destinations.map((dest) => (
          <button
            key={dest.id}
            type="button"
            onClick={() => setSelectedDestId(dest.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedDest.id === dest.id
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs'
            }`}
          >
            {dest.name}
          </button>
        ))}
      </div>

      {/* Quota Calendar Grid */}
      <div className="card p-5 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Outfit']">
            <CalendarClock className="w-4 h-4 text-emerald-600" />
            <span>Kalender Kuota Harian (7 Hari Ke Depan)</span>
          </h3>
          <span className="text-xs text-gray-500">Klik ikon pensil untuk ubah kuota</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {quotaCalendar.map((day) => (
            <QuotaDayCard
              key={day.date}
              day={day}
              onEditQuota={setEditingQuota}
              onToggleClose={handleToggleClose}
            />
          ))}
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="card p-5 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Outfit']">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Sesi Waktu Kunjungan ({selectedDest.name})</span>
          </h3>
          <button
            type="button"
            onClick={() => setEditingSlot({ label: '', time_range: '', max_capacity: 500, is_active: true })}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Tambah Sesi Waktu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedDest.time_slots && selectedDest.time_slots.length > 0 ? (
            selectedDest.time_slots.map((slot) => (
              <TimeSlotCard
                key={slot.id}
                slot={slot}
                onEdit={setEditingSlot}
                onDelete={handleDeleteTimeSlot}
              />
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-xl">
              Belum ada sesi waktu kunjungan untuk destinasi ini.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingQuota && (
        <EditQuotaModal
          day={editingQuota}
          onClose={() => setEditingQuota(null)}
          onSave={handleSaveQuota}
        />
      )}
      {editingSlot && (
        <EditTimeSlotModal
          slot={editingSlot}
          onClose={() => setEditingSlot(null)}
          onSave={handleSaveTimeSlot}
        />
      )}
    </div>
  );
}

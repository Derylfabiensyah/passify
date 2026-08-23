import React, { useState } from 'react';
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
import { useApiClient } from '../../api/client';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { ADMIN_DESTINATIONS, QUOTA_CALENDAR } from '../../data/adminData';

function QuotaDayCard({ day, onEditQuota, onToggleClose }) {
  const remaining = day.max_capacity - day.booked;
  const usedPct = day.is_closed ? 0 : Math.round((day.booked / day.max_capacity) * 100);
  const isToday = day.date === new Date().toISOString().split('T')[0];

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        day.is_closed
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-gray-900">{day.dayLabel}</span>
          {isToday && (
            <span className="ml-1.5 text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
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

function TimeSlotCard({ slot, onEdit }) {
  const usedPct = Math.round((slot.booked / slot.max_capacity) * 100);
  return (
    <div className="card p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900">{slot.label}</div>
            <div className="text-[10px] text-gray-500">{slot.time_range}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(slot)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 bg-gray-50 border border-gray-200 shadow-xs"
        >
          <Pencil className="w-3 h-3" />
        </button>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden my-2.5">
        <div
          className="h-full rounded-full bg-emerald-600 transition-all duration-500"
          style={{ width: `${usedPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>
          Terisi: <strong className="text-gray-900 font-semibold">{slot.booked} pax</strong>
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
  return (
    <div className="modal-overlay">
      <div className="modal-content card p-6 max-w-sm w-full bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 font-['Outfit']">Ubah Kuota {day.dayLabel}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Kapasitas Maksimal Hari Ini
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              onSave(day.date, capacity);
              onClose();
            }}
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
  const [formData, setFormData] = useState({
    label: slot.label,
    max_capacity: slot.max_capacity,
    is_active: slot.is_active
  });
  return (
    <div className="modal-overlay">
      <div className="modal-content card p-6 max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 font-['Outfit']">Ubah Sesi Kunjungan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Sesi
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kapasitas
              </label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) =>
                  setFormData({ ...formData, max_capacity: Number(e.target.value) })
                }
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Status
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
            type="button"
            onClick={() => {
              onSave({ ...slot, ...formData });
              onClose();
            }}
            className="w-full btn-primary py-2.5 justify-center text-xs font-semibold shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Sesi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuotasPage() {
  const apiClient = useApiClient(); // API client with automatic tenant header injection
  // TODO: Fetch quotas from API: const quotas = await apiClient.get('/api/admin/quotas');
  // TODO: Update quota: await apiClient.put(`/api/admin/quotas/${date}`, { max_capacity: newCapacity });
  
  const [selectedDest, setSelectedDest] = useState(ADMIN_DESTINATIONS[0]);
  const [quotaCalendar, setQuotaCalendar] = useState(QUOTA_CALENDAR);
  const [editingQuota, setEditingQuota] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);

  const handleToggleClose = (day) => {
    setQuotaCalendar((prev) =>
      prev.map((d) => (d.date === day.date ? { ...d, is_closed: !d.is_closed } : d))
    );
  };

  const handleSaveQuota = (date, newCapacity) => {
    setQuotaCalendar((prev) =>
      prev.map((d) => (d.date === date ? { ...d, max_capacity: newCapacity } : d))
    );
  };

  const totalWeeklyCapacity = quotaCalendar.reduce((sum, d) => sum + d.max_capacity, 0);
  const totalWeeklyBooked = quotaCalendar.reduce((sum, d) => sum + d.booked, 0);
  const weeklyOccupancyPct = Math.round((totalWeeklyBooked / totalWeeklyCapacity) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="text-xs text-emerald-700 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Quota Control • White-Label Cloud Engine</span>
          </div>
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
          value={`${(totalWeeklyCapacity - totalWeeklyBooked).toLocaleString('id-ID')} pax`}
          subValue="Dapat dipesan secara daring"
          badgeText="AVAILABLE"
        />
        <AdminStatCard
          icon={ShieldCheck}
          label="Status Daya Dukung Kawasan"
          value="Aman (62%)"
          subValue="Sesuai rekomendasi regulasi kenyamanan tenant"
          badgeText="ECOLOGY"
        />
      </div>

      {/* Destination Select */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ADMIN_DESTINATIONS.map((dest) => (
          <button
            key={dest.id}
            type="button"
            onClick={() => setSelectedDest(dest)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              selectedDest.id === dest.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {dest.name}
          </button>
        ))}
      </div>

      {/* Quota Calendar Grid */}
      <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-2xs">
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
      <div className="card p-5 bg-white border border-gray-200 rounded-xl shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Outfit']">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Sesi Waktu Kunjungan ({selectedDest.name})</span>
          </h3>
          <button className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> <span>Tambah Sesi Waktu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedDest.time_slots.map((slot) => (
            <TimeSlotCard key={slot.id} slot={slot} onEdit={setEditingSlot} />
          ))}
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
          onSave={(updatedSlot) => {
            setEditingSlot(null);
          }}
        />
      )}
    </div>
  );
}

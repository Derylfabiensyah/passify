import React, { useState } from 'react';
import {
  CalendarClock, AlertTriangle, X, Save, Clock, Users, Ban,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, ShieldCheck,
  CalendarOff, CalendarCheck
} from 'lucide-react';
import { ADMIN_DESTINATIONS, QUOTA_CALENDAR } from '../../data/adminData';

function QuotaDayCard({ day, onEditQuota, onToggleClose }) {
  const remaining = day.max_capacity - day.booked;
  const usedPct = day.is_closed ? 0 : Math.round((day.booked / day.max_capacity) * 100);
  const isToday = day.date === new Date().toISOString().split('T')[0];

  return (
    <div className={`p-3 rounded-lg border transition-all ${
      day.is_closed
        ? 'bg-red-950/20 border-red-900/50'
        : 'bg-zinc-900 border-zinc-800'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-zinc-100">
            {day.dayLabel}
          </span>
          {isToday && (
            <span className="ml-1.5 text-[9px] text-zinc-400 font-semibold">
              Hari Ini
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleClose(day)}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
            title={day.is_closed ? 'Buka Kembali' : 'Tutup Sementara'}
          >
            {day.is_closed ? <CalendarCheck className="w-3 h-3" /> : <CalendarOff className="w-3 h-3" />}
          </button>
          <button
            onClick={() => onEditQuota(day)}
            className="w-6 h-6 rounded text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      {day.is_closed ? (
        <div className="text-center py-2">
          <Ban className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <span className="text-[10px] text-red-400 font-semibold block">DITUTUP</span>
        </div>
      ) : (
        <>
          {/* Capacity Bar */}
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400">
            <span>Terisi: <strong className="text-zinc-100">{day.booked.toLocaleString('id-ID')}</strong></span>
            <span>Sisa: <strong className="text-zinc-100">{remaining.toLocaleString('id-ID')}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

function TimeSlotCard({ slot, onEdit }) {
  const usedPct = Math.round((slot.booked / slot.max_capacity) * 100);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-bold text-zinc-100">{slot.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-400">
            {slot.is_active ? '• Aktif' : '• Nonaktif'}
          </span>
          <button
            onClick={() => onEdit(slot)}
            className="w-7 h-7 rounded text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${usedPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-400">
        <span>Kapasitas: <strong className="text-zinc-100">{slot.max_capacity.toLocaleString('id-ID')}</strong></span>
        <span>Terisi: <strong className="text-zinc-100">{slot.booked.toLocaleString('id-ID')}</strong></span>
        <span>Sisa: <strong className="text-zinc-100">{(slot.max_capacity - slot.booked).toLocaleString('id-ID')}</strong></span>
      </div>
    </div>
  );
}

function EditQuotaModal({ day, onClose, onSave }) {
  const [maxCapacity, setMaxCapacity] = useState(day?.max_capacity || 2752);

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-md">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Users className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Edit Kuota Harian</h2>
            <p className="text-[11px] text-zinc-400">{day?.dayLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Kapasitas Maksimal Hari Ini</label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
            />
          </div>
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Sudah dipesan</span>
              <span className="text-zinc-100 font-semibold">{day?.booked?.toLocaleString('id-ID') || 0}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Sisa kuota setelah diubah</span>
              <span className="text-zinc-100 font-semibold">{Math.max(0, maxCapacity - (day?.booked || 0)).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Batal</button>
          <button onClick={() => { onSave({ ...day, max_capacity: maxCapacity }); onClose(); }} className="flex-1 py-2.5 text-sm bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTimeSlotModal({ slot, onClose, onSave }) {
  const [formData, setFormData] = useState({
    label: slot?.label || '',
    max_capacity: slot?.max_capacity || 500,
    is_active: slot?.is_active ?? true,
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-md">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Clock className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Edit Sesi Waktu</h2>
            <p className="text-[11px] text-zinc-400">Pengaturan jam kunjungan & kapasitas per sesi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Label Sesi</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              placeholder="e.g. Sunrise Session (03:00 - 09:00)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Kapasitas Per Sesi</label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Status</label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Batal</button>
          <button onClick={() => { onSave({ ...slot, ...formData }); onClose(); }} className="flex-1 py-2.5 text-sm bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuotasPage() {
  const [selectedDest, setSelectedDest] = useState(ADMIN_DESTINATIONS[0]);
  const [quotaCalendar, setQuotaCalendar] = useState(QUOTA_CALENDAR);
  const [editingQuota, setEditingQuota] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);

  const handleToggleClose = (day) => {
    setQuotaCalendar((prev) =>
      prev.map((d) =>
        d.date === day.date ? { ...d, is_closed: !d.is_closed, close_reason: d.is_closed ? null : 'Ditutup oleh Admin' } : d
      )
    );
  };

  const handleSaveQuota = (updatedDay) => {
    setQuotaCalendar((prev) =>
      prev.map((d) => (d.date === updatedDay.date ? updatedDay : d))
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Kuota & Sesi Kunjungan</h2>
          <p className="text-sm text-zinc-400 mt-1">Atur kuota harian dan sesi waktu kunjungan wisatawan</p>
        </div>

        {/* Destination Selector */}
        <select
          value={selectedDest.id}
          onChange={(e) => setSelectedDest(ADMIN_DESTINATIONS.find((d) => d.id === e.target.value) || ADMIN_DESTINATIONS[0])}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none min-w-[250px]"
        >
          {ADMIN_DESTINATIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Quota Calendar Grid */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <CalendarClock className="w-4 h-4" />
            Kalender Kuota Harian
          </h3>
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

      {/* Time Slots */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Sesi Waktu Kunjungan
          </h3>
          <button className="text-[10px] text-zinc-400 hover:text-zinc-100 font-semibold flex items-center gap-1">
            <Plus className="w-3 h-3" /> Tambah Sesi
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
        <EditQuotaModal day={editingQuota} onClose={() => setEditingQuota(null)} onSave={handleSaveQuota} />
      )}
      {editingSlot && (
        <EditTimeSlotModal slot={editingSlot} onClose={() => setEditingSlot(null)} onSave={(updatedSlot) => { setEditingSlot(null); }} />
      )}
    </div>
  );
}

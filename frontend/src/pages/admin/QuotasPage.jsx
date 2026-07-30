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
    <div className={`p-3 rounded-xl border transition-all ${
      day.is_closed
        ? 'bg-rose-950/30 border-rose-500/30'
        : isToday
        ? 'bg-emerald-950/30 border-emerald-500/30'
        : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className={`text-xs font-bold ${isToday ? 'text-emerald-400' : 'text-slate-200'}`}>
            {day.dayLabel}
          </span>
          {isToday && (
            <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              HARI INI
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleClose(day)}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
              day.is_closed
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
            title={day.is_closed ? 'Buka Kembali' : 'Tutup Sementara'}
          >
            {day.is_closed ? <CalendarCheck className="w-3 h-3" /> : <CalendarOff className="w-3 h-3" />}
          </button>
          <button
            onClick={() => onEditQuota(day)}
            className="w-6 h-6 rounded-md bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      {day.is_closed ? (
        <div className="text-center py-2">
          <Ban className="w-5 h-5 text-rose-400 mx-auto mb-1" />
          <span className="text-[10px] text-rose-400 font-semibold block">DITUTUP</span>
          <span className="text-[9px] text-slate-500">{day.close_reason}</span>
        </div>
      ) : (
        <>
          {/* Capacity Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${usedPct}%`,
                background: usedPct > 85 ? 'linear-gradient(90deg, #f43f5e, #fb7185)' :
                  usedPct > 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                  'linear-gradient(90deg, #10b981, #34d399)'
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Terisi: <strong className="text-slate-200">{day.booked.toLocaleString('id-ID')}</strong></span>
            <span>Sisa: <strong className={remaining < 200 ? 'text-rose-400' : 'text-emerald-400'}>{remaining.toLocaleString('id-ID')}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

function TimeSlotCard({ slot, onEdit }) {
  const usedPct = Math.round((slot.booked / slot.max_capacity) * 100);

  return (
    <div className="glass-panel p-4 hover:border-emerald-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span className="text-sm font-bold text-white">{slot.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            slot.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
          }`}>
            {slot.is_active ? '● Aktif' : '○ Nonaktif'}
          </span>
          <button
            onClick={() => onEdit(slot)}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${usedPct}%`,
            background: usedPct > 85 ? 'linear-gradient(90deg, #f43f5e, #fb7185)' :
              usedPct > 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
              'linear-gradient(90deg, #10b981, #34d399)'
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Kapasitas: <strong className="text-white">{slot.max_capacity.toLocaleString('id-ID')}</strong></span>
        <span>Terisi: <strong className="text-emerald-400">{slot.booked.toLocaleString('id-ID')}</strong></span>
        <span>Sisa: <strong className="text-sky-400">{(slot.max_capacity - slot.booked).toLocaleString('id-ID')}</strong></span>
      </div>
    </div>
  );
}

function EditQuotaModal({ day, onClose, onSave }) {
  const [maxCapacity, setMaxCapacity] = useState(day?.max_capacity || 2752);

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-md">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">Edit Kuota Harian</h2>
            <p className="text-[11px] text-slate-400">{day?.dayLabel}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kapasitas Maksimal Hari Ini</label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Sudah dipesan</span>
              <span className="text-white font-semibold">{day?.booked?.toLocaleString('id-ID') || 0}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Sisa kuota setelah diubah</span>
              <span className="text-emerald-400 font-semibold">{Math.max(0, maxCapacity - (day?.booked || 0)).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5 text-sm">Batal</button>
          <button onClick={() => { onSave({ ...day, max_capacity: maxCapacity }); onClose(); }} className="flex-1 btn-primary justify-center py-2.5 text-sm">
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
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">Edit Sesi Waktu</h2>
            <p className="text-[11px] text-slate-400">Pengaturan jam kunjungan & kapasitas per sesi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Label Sesi</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Sunrise Session (03:00 - 09:00)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kapasitas Per Sesi</label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={(e) => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5 text-sm">Batal</button>
          <button onClick={() => { onSave({ ...slot, ...formData }); onClose(); }} className="flex-1 btn-primary justify-center py-2.5 text-sm">
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
          <h2 className="text-2xl font-extrabold text-white font-['Outfit']">Kuota & Sesi Kunjungan</h2>
          <p className="text-xs text-slate-400 mt-1">Atur kuota harian (carrying capacity) dan sesi waktu kunjungan wisatawan</p>
        </div>

        {/* Destination Selector */}
        <select
          value={selectedDest.id}
          onChange={(e) => setSelectedDest(ADMIN_DESTINATIONS.find((d) => d.id === e.target.value) || ADMIN_DESTINATIONS[0])}
          className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none min-w-[250px]"
        >
          {ADMIN_DESTINATIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Quota Occupancy Bar */}
      <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs text-emerald-400">
        <span className="font-semibold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Perlindungan Carrying Capacity Aktif — Mencegah over-tourism & menjaga ekosistem wisata alam
        </span>
        <span className="text-slate-300 font-medium">Batas Maksimal Harian: <strong className="text-white">{selectedDest.max_daily_capacity.toLocaleString('id-ID')}</strong> pengunjung</span>
      </div>

      {/* Quota Calendar Grid */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-emerald-400" />
            Kalender Kuota Harian — {selectedDest.name}
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Tersedia</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Hampir Penuh</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Ditutup</span>
          </div>
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
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            Sesi Waktu Kunjungan (Time Slots)
          </h3>
          <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            <Plus className="w-3 h-3" /> Tambah Sesi
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedDest.time_slots.map((slot) => (
            <TimeSlotCard key={slot.id} slot={slot} onEdit={setEditingSlot} />
          ))}
        </div>
      </div>

      {/* Blackout Info */}
      <div className="glass-panel p-4 border-amber-500/20 bg-amber-950/10">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-400 mb-1">Fitur Blackout Date (Penutupan Sementara)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Klik ikon <CalendarOff className="w-3 h-3 inline text-rose-400" /> pada kalender untuk menutup sementara penerimaan pengunjung pada tanggal tertentu.
              Destinasi dapat ditutup untuk alasan seperti kondisi cuaca buruk, kebakaran hutan, atau perawatan infrastruktur.
              Klik <CalendarCheck className="w-3 h-3 inline text-emerald-400" /> untuk membuka kembali.
            </p>
          </div>
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

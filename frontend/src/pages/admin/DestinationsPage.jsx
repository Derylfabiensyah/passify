import React, { useState } from 'react';
import {
  MapPin, Plus, Pencil, Trash2, Search, Eye, EyeOff, Star,
  ChevronDown, ChevronUp, X, Save, DollarSign, Ticket, Image, AlertTriangle
} from 'lucide-react';
import { ADMIN_DESTINATIONS } from '../../data/adminData';

function TicketCategoryRow({ cat, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-900/50 border border-slate-800/60">
      <div className="flex-1">
        <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
          <span>Tiket: <strong className="text-emerald-400">Rp {cat.price.toLocaleString('id-ID')}</strong></span>
          <span>Asuransi: Rp {cat.insurance.toLocaleString('id-ID')}</span>
          <span>Retribusi: Rp {cat.retribusi.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
          cat.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
        }`}>
          {cat.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
        <button onClick={() => onEdit(cat)} className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function DestinationCard({ dest, onToggleExpand, isExpanded, onEditDest, onEditCategory }) {
  const quotaPct = Math.round((dest.booked_today / dest.max_daily_capacity) * 100);

  return (
    <div className="glass-panel overflow-hidden hover:border-emerald-500/30">
      {/* Card Header */}
      <div className="flex gap-4 p-4">
        <img
          src={dest.cover_image_url}
          alt={dest.name}
          className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white truncate">{dest.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                  {dest.typeLabel}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {dest.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                dest.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
              }`}>
                {dest.is_active ? '● Aktif' : '○ Nonaktif'}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
            <span>Kapasitas: <strong className="text-white">{dest.max_daily_capacity.toLocaleString('id-ID')}</strong>/hari</span>
            <span>Terisi: <strong className="text-emerald-400">{dest.booked_today.toLocaleString('id-ID')}</strong></span>
            <span>Kategori Tiket: <strong className="text-sky-400">{dest.ticket_categories.length}</strong></span>
          </div>

          {/* Capacity Bar */}
          <div className="mt-2">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${quotaPct}%`,
                  background: quotaPct > 85 ? 'linear-gradient(90deg, #f43f5e, #fb7185)' :
                    quotaPct > 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                    'linear-gradient(90deg, #10b981, #34d399)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/60 bg-slate-900/30">
        <button
          id={`expand-${dest.id}`}
          onClick={() => onToggleExpand(dest.id)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-medium"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {isExpanded ? 'Sembunyikan Detail' : 'Lihat Kategori Tiket & Harga'}
        </button>
        <div className="flex items-center gap-2">
          <button
            id={`edit-dest-${dest.id}`}
            onClick={() => onEditDest(dest)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-all flex items-center gap-1.5"
          >
            <Pencil className="w-3 h-3" /> Edit Destinasi
          </button>
        </div>
      </div>

      {/* Expandable Ticket Categories */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-800/40 pt-3 space-y-2 animate-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-emerald-400" />
              Kategori Tiket ({dest.ticket_categories.length})
            </span>
            <button className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              <Plus className="w-3 h-3" /> Tambah Kategori
            </button>
          </div>
          {dest.ticket_categories.map((cat) => (
            <TicketCategoryRow key={cat.id} cat={cat} onEdit={onEditCategory} />
          ))}
        </div>
      )}
    </div>
  );
}

function EditDestinationModal({ dest, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: dest?.name || '',
    location: dest?.location || '',
    typeLabel: dest?.typeLabel || '',
    max_daily_capacity: dest?.max_daily_capacity || 1000,
    is_active: dest?.is_active ?? true,
  });

  const handleSave = () => {
    onSave({ ...dest, ...formData });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-lg">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">{dest ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}</h2>
            <p className="text-[11px] text-slate-400">Kelola informasi destinasi wisata alam</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Destinasi</label>
            <input
              id="dest-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lokasi</label>
              <input
                id="dest-location-input"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipe Wisata</label>
              <select
                value={formData.typeLabel}
                onChange={(e) => setFormData({ ...formData, typeLabel: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Gunung & Kawah">🌋 Gunung & Kawah</option>
                <option value="Air Terjun">🌊 Air Terjun</option>
                <option value="Taman Nasional">🌲 Taman Nasional</option>
                <option value="Danau & Pantai">🏝️ Danau & Pantai</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kapasitas Harian Maksimal</label>
              <input
                id="dest-capacity-input"
                type="number"
                value={formData.max_daily_capacity}
                onChange={(e) => setFormData({ ...formData, max_daily_capacity: Number(e.target.value) })}
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
          <button onClick={handleSave} id="save-dest-btn" className="flex-1 btn-primary justify-center py-2.5 text-sm">
            <Save className="w-4 h-4" /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCategoryModal({ category, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    price: category?.price || 0,
    insurance: category?.insurance || 0,
    retribusi: category?.retribusi || 0,
    is_active: category?.is_active ?? true,
  });

  const handleSave = () => {
    onSave({ ...category, ...formData });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-lg">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">Edit Kategori Tiket</h2>
            <p className="text-[11px] text-slate-400">Atur harga tiket, asuransi, dan retribusi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Kategori</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Harga Tiket (Rp)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asuransi (Rp)</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Retribusi (Rp)</label>
              <input
                type="number"
                value={formData.retribusi}
                onChange={(e) => setFormData({ ...formData, retribusi: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Price Preview */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Total per Tiket (wisatawan bayar)</span>
              <span className="text-emerald-400 font-bold text-sm">
                Rp {(formData.price + formData.insurance + formData.retribusi).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5 text-sm">Batal</button>
          <button onClick={handleSave} className="flex-1 btn-primary justify-center py-2.5 text-sm">
            <Save className="w-4 h-4" /> Simpan Harga
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState(ADMIN_DESTINATIONS);
  const [expandedIds, setExpandedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDest, setEditingDest] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddDest, setShowAddDest] = useState(false);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredDestinations = destinations.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveDest = (updatedDest) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === updatedDest.id ? updatedDest : d))
    );
  };

  const handleSaveCategory = (updatedCat) => {
    setDestinations((prev) =>
      prev.map((d) => ({
        ...d,
        ticket_categories: d.ticket_categories.map((c) =>
          c.id === updatedCat.id ? updatedCat : c
        ),
      }))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-['Outfit']">Destinasi & Tiket</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola destinasi wisata alam beserta kategori tiket dan harga</p>
        </div>
        <button
          id="add-dest-btn"
          onClick={() => setShowAddDest(true)}
          className="btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Destinasi</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="search-destinations-input"
          type="text"
          placeholder="Cari destinasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
        />
      </div>

      {/* Destination Cards */}
      <div className="space-y-4">
        {filteredDestinations.length === 0 ? (
          <div className="glass-panel p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-slate-300">Tidak ada destinasi ditemukan.</p>
          </div>
        ) : (
          filteredDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              isExpanded={expandedIds.includes(dest.id)}
              onToggleExpand={toggleExpand}
              onEditDest={setEditingDest}
              onEditCategory={setEditingCategory}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {editingDest && (
        <EditDestinationModal
          dest={editingDest}
          onClose={() => setEditingDest(null)}
          onSave={handleSaveDest}
        />
      )}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleSaveCategory}
        />
      )}
      {showAddDest && (
        <EditDestinationModal
          dest={{ id: `dest-new-${Date.now()}`, name: '', location: '', typeLabel: 'Gunung & Kawah', max_daily_capacity: 1000, is_active: true, ticket_categories: [] }}
          onClose={() => setShowAddDest(false)}
          onSave={(newDest) => {
            setDestinations((prev) => [...prev, { ...newDest, booked_today: 0, cover_image_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80', ticket_categories: [], time_slots: [] }]);
          }}
        />
      )}
    </div>
  );
}

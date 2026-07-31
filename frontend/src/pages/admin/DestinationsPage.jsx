import React, { useState } from 'react';
import {
  MapPin, Plus, Pencil, Trash2, Search, Eye, EyeOff, Star,
  ChevronDown, ChevronUp, X, Save, DollarSign, Ticket, Image, AlertTriangle
} from 'lucide-react';
import { ADMIN_DESTINATIONS } from '../../data/adminData';

function TicketCategoryRow({ cat, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800">
      <div className="flex-1">
        <span className="text-xs font-semibold text-zinc-100">{cat.name}</span>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-400">
          <span>Tiket: <strong className="text-zinc-100">Rp {cat.price.toLocaleString('id-ID')}</strong></span>
          <span>Asuransi: Rp {cat.insurance.toLocaleString('id-ID')}</span>
          <span>Retribusi: Rp {cat.retribusi.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-zinc-400">
          {cat.is_active ? '• Aktif' : '• Nonaktif'}
        </span>
        <button onClick={() => onEdit(cat)} className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors">
          <Pencil className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function DestinationCard({ dest, onToggleExpand, isExpanded, onEditDest, onEditCategory }) {
  const quotaPct = Math.round((dest.booked_today / dest.max_daily_capacity) * 100);

  return (
    <div className="card overflow-hidden">
      {/* Card Header */}
      <div className="flex gap-4 p-4">
        <img
          src={dest.cover_image_url}
          alt={dest.name}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-zinc-100 truncate">{dest.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {dest.typeLabel}
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {dest.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-400">
                {dest.is_active ? '• Aktif' : '• Nonaktif'}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-400">
            <span>Kapasitas: <strong className="text-zinc-100">{dest.max_daily_capacity.toLocaleString('id-ID')}</strong>/hari</span>
            <span>Terisi: <strong className="text-zinc-100">{dest.booked_today.toLocaleString('id-ID')}</strong></span>
            <span>Kategori Tiket: <strong className="text-zinc-100">{dest.ticket_categories.length}</strong></span>
          </div>

          {/* Capacity Bar */}
          <div className="mt-2">
            <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/50">
        <button
          id={`expand-${dest.id}`}
          onClick={() => onToggleExpand(dest.id)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition-colors font-medium"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {isExpanded ? 'Sembunyikan Detail' : 'Lihat Kategori Tiket & Harga'}
        </button>
        <div className="flex items-center gap-2">
          <button
            id={`edit-dest-${dest.id}`}
            onClick={() => onEditDest(dest)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-300 hover:text-zinc-100 transition-colors flex items-center gap-1.5"
          >
            <Pencil className="w-3 h-3" /> Edit Destinasi
          </button>
        </div>
      </div>

      {/* Expandable Ticket Categories */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Kategori Tiket ({dest.ticket_categories.length})
            </span>
            <button className="text-[10px] text-zinc-400 hover:text-zinc-100 font-semibold flex items-center gap-1">
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
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{dest ? 'Edit Destinasi' : 'Tambah Destinasi Baru'}</h2>
            <p className="text-[11px] text-zinc-400">Kelola informasi destinasi wisata alam</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nama Destinasi</label>
            <input
              id="dest-name-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Lokasi</label>
              <input
                id="dest-location-input"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tipe Wisata</label>
              <select
                value={formData.typeLabel}
                onChange={(e) => setFormData({ ...formData, typeLabel: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              >
                <option value="Gunung & Kawah">Gunung & Kawah</option>
                <option value="Air Terjun">Air Terjun</option>
                <option value="Taman Nasional">Taman Nasional</option>
                <option value="Danau & Pantai">Danau & Pantai</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Kapasitas Harian Maksimal</label>
              <input
                id="dest-capacity-input"
                type="number"
                value={formData.max_daily_capacity}
                onChange={(e) => setFormData({ ...formData, max_daily_capacity: Number(e.target.value) })}
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
          <button onClick={handleSave} id="save-dest-btn" className="flex-1 py-2.5 text-sm bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
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
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Edit Kategori Tiket</h2>
            <p className="text-[11px] text-zinc-400">Atur harga tiket, asuransi, dan retribusi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nama Kategori</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Harga Tiket (Rp)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Asuransi (Rp)</label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Retribusi (Rp)</label>
              <input
                type="number"
                value={formData.retribusi}
                onChange={(e) => setFormData({ ...formData, retribusi: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Price Preview */}
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Total per Tiket (wisatawan bayar)</span>
              <span className="text-zinc-100 font-bold text-sm">
                Rp {(formData.price + formData.insurance + formData.retribusi).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Batal</button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Destinasi & Tiket</h2>
          <p className="text-sm text-zinc-400 mt-1">Kelola destinasi wisata alam beserta kategori tiket dan harga</p>
        </div>
        <button
          id="add-dest-btn"
          onClick={() => setShowAddDest(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-100 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Destinasi</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="search-destinations-input"
          type="text"
          placeholder="Cari destinasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
        />
      </div>

      {/* Destination Cards */}
      <div className="space-y-4">
        {filteredDestinations.length === 0 ? (
          <div className="card p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">Tidak ada destinasi ditemukan.</p>
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

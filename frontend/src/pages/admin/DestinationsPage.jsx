import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  DollarSign,
  Ticket,
  Image as ImageIcon,
  Compass,
  CheckCircle2,
  Users,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Palette,
  Layers,
  Leaf,
  FileText
} from 'lucide-react';
import AdminStatCard from '../../components/admin/AdminStatCard';
import ModalWrapper from '../../components/common/ModalWrapper';
import { useToast } from '../../contexts/ToastContext';
import { ADMIN_DESTINATIONS } from '../../data/adminData';
import { useTenant } from '../../contexts/TenantContext';
import { fetchAdminDestinations } from '../../api/admin';
import { apiRequest } from '../../api/client';

function FacilityTagInput({ value = [], onChange }) {
  const [inputVal, setInputVal] = useState('');

  const suggestions = [
    'Area Parkir',
    'Toilet Bersih',
    'Musholla',
    'Pos Pemandu',
    'Pos P3K',
    'Gazebo',
    'Kantin Alam',
    'Sewa Tenda & Camping',
    'Spot Foto Panorama',
    'Jalur Tracking'
  ];

  const handleAdd = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputVal('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAdd(inputVal);
    }
  };

  const handleRemove = (tagToRemove) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2 bg-[var(--canvas)] rounded-xl border border-[var(--border)]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-[var(--surface)] text-[var(--forest-deep)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="text-[var(--ink-soft)] hover:text-red-600 transition-colors"
              aria-label={`Hapus fasilitas ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputVal && handleAdd(inputVal)}
          placeholder={value.length === 0 ? 'Ketik fasilitas lalu tekan Enter...' : 'Tambah fasilitas...'}
          className="flex-1 min-w-[140px] bg-transparent text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] focus:outline-none px-1 py-0.5"
        />
      </div>

      {/* Suggested Quick Add Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] mr-1">
          Rekomendasi Cepat:
        </span>
        {suggestions
          .filter((s) => !value.includes(s))
          .slice(0, 5)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAdd(s)}
              className="inline-flex items-center gap-1 text-[11px] font-medium bg-[var(--surface)] hover:bg-[var(--leaf-pale)] text-[var(--ink-soft)] hover:text-[var(--forest-deep)] border border-[var(--border)] rounded-md px-2 py-0.5 transition-colors cursor-pointer"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{s}</span>
            </button>
          ))}
      </div>
    </div>
  );
}

function DeleteCategoryConfirmationModal({ isOpen, onClose, onConfirm, categoryName }) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      ariaLabel="Konfirmasi Hapus Kategori Tiket"
    >
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-200 mx-auto flex items-center justify-center">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--forest-deep)] font-heading">Hapus Kategori Tiket</h3>
          <p className="text-xs text-[var(--ink-soft)] mt-1.5 leading-relaxed">
            Apakah Anda yakin ingin menghapus kategori tiket{' '}
            <strong className="text-[var(--ink)]">{categoryName}</strong>? Wisatawan tidak akan dapat lagi memilih tiket ini di website portal.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors"
          >
            Ya, Hapus Kategori
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function TicketCategoryRow({ cat, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white shadow-2xs">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">{cat.name}</span>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full ${cat.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {cat.is_active !== false ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-500">
          <span>
            Harga Masuk: <strong className="text-gray-900">Rp {Number(cat.price || 0).toLocaleString('id-ID')}</strong>
          </span>
          <span>• Asuransi: Rp {Number(cat.insurance || 0).toLocaleString('id-ID')}</span>
          <span>• Retribusi: Rp {Number(cat.retribusi || 0).toLocaleString('id-ID')}</span>
          <span className="text-[var(--bark)] font-bold">
            Total: Rp {(Number(cat.price || 0) + Number(cat.insurance || 0) + Number(cat.retribusi || 0)).toLocaleString('id-ID')}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onEdit(cat)}
          className="p-2 rounded-lg text-gray-500 hover:text-[var(--forest-deep)] hover:bg-gray-100 transition-colors"
          title="Edit Kategori"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(cat.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Kategori"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function DestinationCard({ dest, onToggleExpand, isExpanded, onEditDest, onAddCategory, onEditCategory, onDeleteCategory }) {
  const quotaPct = Math.round(((dest.booked_today || 0) / (dest.max_daily_capacity || 1000)) * 100);

  return (
    <div className="card bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
        <div className="relative w-full sm:w-36 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={dest.cover_image_url || 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=400&q=80'}
            alt={dest.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
              {dest.typeLabel || 'Wisata Alam'}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--forest-deep)] truncate font-serif">
                  {dest.name}
                </h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {dest.location || 'Indonesia'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/?tenant=${dest.slug}`}
                  target="_blank"
                  className="btn-secondary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-decoration-none"
                  title="Buka Website Resmi"
                >
                  <Eye className="w-3.5 h-3.5" /> Pratinjau Website <ExternalLink className="w-3 h-3" />
                </Link>
                <button
                  type="button"
                  onClick={() => onEditDest(dest)}
                  className="btn-primary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Halaman
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
              {dest.description || 'Destinasi wisata alam resmi.'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Kapasitas Harian</span>
              <strong className="text-sm font-bold text-gray-900">
                {Number(dest.max_daily_capacity || 0).toLocaleString('id-ID')} pax
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Terisi Hari Ini</span>
              <strong className="text-sm font-bold text-emerald-700">
                {Number(dest.booked_today || 0).toLocaleString('id-ID')} ({quotaPct}%)
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Kategori Tiket</span>
              <strong className="text-sm font-bold text-gray-900">
                {(dest.ticket_categories || []).length} Tipe Tarif
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Expand Bar */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onToggleExpand(dest.id)}
          className="flex items-center gap-1.5 text-gray-700 hover:text-[var(--forest-deep)] font-bold transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--forest)]" /> : <ChevronDown className="w-4 h-4 text-[var(--forest)]" />}
          <span>{isExpanded ? 'Tutup Pengaturan Tiket & Tarif' : 'Kelola Kategori & Struktur Harga Tiket'}</span>
        </button>

        <span className="text-[11px] text-gray-500">
          {(dest.facilities || []).length} Fasilitas • {(dest.rules ? 'Ada Aturan Kawasan' : 'Belum ada aturan')}
        </span>
      </div>

      {/* Expanded Content: Ticket Categories Management */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-100 bg-gray-50/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--forest-deep)]">
                Struktur Harga & Komponen Tiket Resmi
              </h4>
              <p className="text-[11px] text-gray-500">
                Harga tiket otomatis memisahkan komponen retribusi PEMDA dan asuransi Jasa Raharja.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddCategory(dest.id)}
              className="btn-primary text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Kategori Tiket
            </button>
          </div>

          <div className="space-y-2.5">
            {(dest.ticket_categories || []).map((cat) => (
              <TicketCategoryRow
                key={cat.id}
                cat={cat}
                onEdit={(c) => onEditCategory(dest.id, c)}
                onDelete={(catId) => onDeleteCategory(dest.id, catId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// MODAL: EDIT DESTINASI & TAMPILAN HALAMAN WEBSITE
// =========================================================================
function EditDestinationModal({ dest, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    province: '',
    cover_image_url: '',
    max_daily_capacity: 1000,
    facilities: [],
    rules: '',
    primary_color: '#102d20',
  });

  useEffect(() => {
    if (dest) {
      const facilityArr = Array.isArray(dest.facilities)
        ? dest.facilities
        : typeof dest.facilities === 'string'
        ? dest.facilities.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      setFormData({
        name: dest.name || '',
        description: dest.description || '',
        location: dest.location || '',
        province: dest.province || 'Indonesia',
        cover_image_url: dest.cover_image_url || '',
        max_daily_capacity: dest.max_daily_capacity || 1000,
        facilities: facilityArr,
        rules: dest.rules || '',
        primary_color: dest.primary_color || '#102d20',
      });
    }
  }, [dest]);

  if (!isOpen || !dest) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...dest,
      ...formData,
      max_daily_capacity: Number(formData.max_daily_capacity),
      facilities: formData.facilities.length
        ? formData.facilities
        : ['Area Parkir', 'Pusat Informasi', 'Toilet Bersih', 'Pos P3K'],
    });
  };

  return (
    <div className="modal-overlay z-50 flex items-center justify-center p-4">
      <div className="modal-content bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[var(--forest-deep)] text-white p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--leaf)]">
              Kustomisasi Halaman Website Wisata
            </span>
            <h2 className="text-xl font-bold font-serif mt-0.5">Edit Informasi {dest.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Nama Destinasi Wisata
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="field-control font-semibold"
                placeholder="Contoh: Curug Bidadari Eco Park"
                required
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Kapasitas Pengunjung Harian (Pax)
              </label>
              <input
                type="number"
                value={formData.max_daily_capacity}
                onChange={(e) => setFormData({ ...formData, max_daily_capacity: e.target.value })}
                className="field-control font-semibold"
                placeholder="1000"
                min="10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Lokasi &amp; Alamat Lengkap
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="field-control font-medium"
              placeholder="Contoh: Sentul Paradise Park, Babakan Madang, Bogor, Jawa Barat"
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              URL Foto Sampul (Cover Image Landscape)
            </label>
            <input
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              className="field-control font-mono text-xs"
              placeholder="https://images.unsplash.com/photo-..."
            />
            {formData.cover_image_url && (
              <div className="mt-2 h-28 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={formData.cover_image_url}
                  alt="Pratinjau Foto Sampul"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Deskripsi Wisata &amp; Cerita Kawasan
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="field-control leading-relaxed"
              placeholder="Jelaskan keindahan alam, daya tarik utama, dan informasi penting bagi wisatawan..."
              required
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Fasilitas Kawasan Wisata
            </label>
            <FacilityTagInput
              value={formData.facilities}
              onChange={(tags) => setFormData({ ...formData, facilities: tags })}
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Aturan &amp; Etika Kawasan Wisata Alam
            </label>
            <textarea
              rows={2}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="field-control leading-relaxed"
              placeholder="Patuhi batas daya dukung lingkungan, dilarang merusak flora & fauna, buang sampah pada tempatnya."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5 py-2.5 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" /> Simpan Perubahan Halaman
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// MODAL: TAMBAH / EDIT KATEGORI TIKET
// =========================================================================
function EditCategoryModal({ cat, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    price: 35000,
    insurance: 3000,
    retribusi: 2000,
    is_active: true,
  });

  useEffect(() => {
    if (cat) {
      setFormData({
        name: cat.name || '',
        price: cat.price || 0,
        insurance: cat.insurance || 3000,
        retribusi: cat.retribusi || 2000,
        is_active: cat.is_active !== false,
      });
    }
  }, [cat]);

  if (!isOpen) return null;

  const total = Number(formData.price || 0) + Number(formData.insurance || 0) + Number(formData.retribusi || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: cat?.id || `cat-${Date.now()}`,
      ...formData,
      price: Number(formData.price),
      insurance: Number(formData.insurance),
      retribusi: Number(formData.retribusi),
    });
  };

  return (
    <div className="modal-overlay z-50 flex items-center justify-center p-4">
      <div className="modal-content bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-[var(--forest-deep)] text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold font-serif">
            {cat?.id ? 'Edit Kategori Tiket' : 'Tambah Kategori Tiket Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Nama Kategori Tiket
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="field-control font-bold"
              placeholder="Contoh: Tiket Masuk Dewasa (WNI)"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">
                Tarif Masuk (Rp)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="field-control"
                min="0"
                step="500"
                required
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">
                Asuransi (Rp)
              </label>
              <input
                type="number"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                className="field-control"
                min="0"
                step="500"
                required
              />
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-gray-500 mb-1">
                Retribusi (Rp)
              </label>
              <input
                type="number"
                value={formData.retribusi}
                onChange={(e) => setFormData({ ...formData, retribusi: e.target.value })}
                className="field-control"
                min="0"
                step="500"
                required
              />
            </div>
          </div>

          {/* Grand Total Preview */}
          <div className="p-4 rounded-2xl bg-[var(--fog)] flex items-baseline justify-between">
            <span className="font-bold text-gray-700">Total Harga Tiket per Orang:</span>
            <span className="text-base font-extrabold text-[var(--bark)]">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-xl font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl font-bold shadow-xs"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN DESTINATIONS PAGE COMPONENT
// =========================================================================
export default function DestinationsPage() {
  const { toast } = useToast();
  const { slug, refetch } = useTenant();
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDest, setEditingDest] = useState(null);
  const [editingCatContext, setEditingCatContext] = useState(null); // { destId, cat }
  const [deleteConfirmContext, setDeleteConfirmContext] = useState(null); // { destId, catId, catName }

  // Fetch real destinations from microservices
  useEffect(() => {
    async function loadRealDestinations() {
      try {
        setIsLoading(true);
        const realList = await fetchAdminDestinations(slug);
        if (realList && realList.length > 0) {
          setDestinations(realList);
          setExpandedId(realList[0].id);
        }
      } catch (err) {
        console.warn('Real destinations load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRealDestinations();
  }, [slug]);

  const saveDestinationsList = (updated) => {
    setDestinations(updated);
    localStorage.setItem('passify_admin_destinations', JSON.stringify(updated));
    refetch?.();
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSaveDestination = async (updatedDest) => {
    const updated = destinations.map((d) => (d.id === updatedDest.id ? updatedDest : d));
    saveDestinationsList(updated);
    setEditingDest(null);
    toast.success(`Halaman "${updatedDest.name}" berhasil diperbarui!`);

    // Sync to backend destination endpoint if available
    try {
      await apiRequest(`/api/v1/destinations/${updatedDest.id}`, {
        method: 'PUT',
        body: updatedDest,
      }).catch(() => null);
    } catch (_) {}
  };

  const handleSaveCategory = async (categoryData) => {
    if (!editingCatContext?.destId) return;
    const destId = editingCatContext.destId;

    const updated = destinations.map((d) => {
      if (d.id !== destId) return d;
      const categories = [...(d.ticket_categories || [])];
      const existingIdx = categories.findIndex((c) => c.id === categoryData.id);
      if (existingIdx >= 0) {
        categories[existingIdx] = categoryData;
      } else {
        categories.push(categoryData);
      }
      return { ...d, ticket_categories: categories };
    });

    saveDestinationsList(updated);
    setEditingCatContext(null);
    toast.success('Kategori tiket berhasil disimpan!');

    // Sync to ticket microservice
    try {
      await apiRequest('/api/v1/tickets/categories', {
        method: 'POST',
        body: {
          destination_id: destId,
          name: categoryData.name,
          ticket_type: 'visitor_domestic',
          base_price: Number(categoryData.price || 0),
          insurance_fee: Number(categoryData.insurance || 0),
          retribusi_fee: Number(categoryData.retribusi || 0),
          is_mandatory: true,
          is_per_person: true,
          max_qty_per_order: 10,
        },
      }).catch(() => null);
    } catch (_) {}
  };

  const handleDeleteCategory = (destId, catId) => {
    const dest = destinations.find((d) => d.id === destId);
    const cat = (dest?.ticket_categories || []).find((c) => c.id === catId);
    setDeleteConfirmContext({
      destId,
      catId,
      catName: cat?.name || 'Kategori Tiket'
    });
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteConfirmContext) return;
    const { destId, catId } = deleteConfirmContext;

    const updated = destinations.map((d) => {
      if (d.id !== destId) return d;
      return {
        ...d,
        ticket_categories: (d.ticket_categories || []).filter((c) => c.id !== catId),
      };
    });

    saveDestinationsList(updated);
    setDeleteConfirmContext(null);
    toast.success('Kategori tiket telah dihapus.');

    // Sync deletion to backend
    try {
      await apiRequest(`/api/v1/tickets/categories/${catId}`, {
        method: 'DELETE',
      }).catch(() => null);
    } catch (_) {}
  };

  const filteredDests = destinations.filter(
    (d) =>
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCapacity = destinations.reduce((s, d) => s + (Number(d.max_daily_capacity) || 0), 0);
  const totalBooked = destinations.reduce((s, d) => s + (Number(d.booked_today) || 0), 0);
  const overallPct = totalCapacity ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-serif">
            Manajemen Destinasi & Kustomisasi Halaman Website
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ubah nama wisata, foto pemandangan, deskripsi, fasilitas, dan harga tiket yang tampil di website resmi Anda.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Compass}
          label="Total Kawasan Wisata"
          value={`${destinations.length} Kawasan`}
          subValue="Dikelola oleh akun tenant Anda"
          badgeText="VENUES"
        />
        <AdminStatCard
          icon={CheckCircle2}
          label="Status Website"
          value="Online & Aktif"
          subValue="Menerima reservasi e-ticket"
          badgeText="PORTAL"
        />
        <AdminStatCard
          icon={Users}
          label="Total Daya Dukung Alam"
          value={`${totalCapacity.toLocaleString('id-ID')} pax`}
          subValue={`Terisi: ${totalBooked.toLocaleString('id-ID')} pax hari ini`}
          progress={overallPct}
          badgeText="KUOTA"
        />
        <AdminStatCard
          icon={Ticket}
          label="Kategori Tarif Tiket"
          value={`${destinations.reduce((s, d) => s + (d.ticket_categories || []).length, 0)} Tipe`}
          subValue="WNI, WNA, Asuransi & Retribusi"
          badgeText="TARIF"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama destinasi atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Destination Cards List */}
      <div className="space-y-5">
        {filteredDests.map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            isExpanded={expandedId === dest.id}
            onToggleExpand={toggleExpand}
            onEditDest={(d) => setEditingDest(d)}
            onAddCategory={(destId) => setEditingCatContext({ destId, cat: null })}
            onEditCategory={(destId, cat) => setEditingCatContext({ destId, cat })}
            onDeleteCategory={handleDeleteCategory}
          />
        ))}
      </div>

      {/* Modal Edit Destination */}
      <EditDestinationModal
        dest={editingDest}
        isOpen={Boolean(editingDest)}
        onClose={() => setEditingDest(null)}
        onSave={handleSaveDestination}
      />

      {/* Modal Edit Ticket Category */}
      <EditCategoryModal
        cat={editingCatContext?.cat}
        isOpen={Boolean(editingCatContext)}
        onClose={() => setEditingCatContext(null)}
        onSave={handleSaveCategory}
      />

      {/* Branded Delete Category Confirmation Modal */}
      <DeleteCategoryConfirmationModal
        isOpen={Boolean(deleteConfirmContext)}
        onClose={() => setDeleteConfirmContext(null)}
        onConfirm={handleConfirmDeleteCategory}
        categoryName={deleteConfirmContext?.catName || ''}
      />
    </div>
  );
}

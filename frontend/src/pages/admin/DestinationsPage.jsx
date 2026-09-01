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
  Ticket,
  Compass,
  CheckCircle2,
  Users,
  ExternalLink,
  Palette,
  FileText
} from 'lucide-react';
import AdminStatCard from '../../components/admin/AdminStatCard';
import ModalWrapper from '../../components/common/ModalWrapper';
import { useToast } from '../../contexts/ToastContext';
import { useTenant } from '../../contexts/TenantContext';
import { fetchAdminDestinations, getAdminUser } from '../../api/admin';
import { apiRequest } from '../../api/client';

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
          <h3 className="text-base font-bold text-[var(--forest-deep)] font-serif">Hapus Kategori Tiket</h3>
          <p className="text-xs text-[var(--ink-soft)] mt-1.5 leading-relaxed">
            Apakah Anda yakin ingin menghapus kategori tiket{' '}
            <strong className="text-[var(--ink)]">{categoryName}</strong>? Wisatawan tidak akan dapat lagi memilih tiket ini di website portal.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            Ya, Hapus Kategori
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function TicketCategoryRow({ cat, onEdit, onDelete }) {
  const total = Number(cat.price || 0) + Number(cat.insurance || 0) + Number(cat.retribusi || 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] hover:border-[var(--forest)]/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--forest-deep)]">{cat.name}</span>
          <span
            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              cat.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {cat.is_active !== false ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-[var(--ink-soft)]">
          <span>
            Tarif Pokok: <strong className="text-[var(--ink)] font-semibold">Rp {Number(cat.price || 0).toLocaleString('id-ID')}</strong>
          </span>
          <span>• Asuransi: Rp {Number(cat.insurance || 0).toLocaleString('id-ID')}</span>
          <span>• Retribusi: Rp {Number(cat.retribusi || 0).toLocaleString('id-ID')}</span>
          <span className="text-[var(--bark)] font-extrabold">
            Total: Rp {total.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={() => onEdit(cat)}
          className="p-2 rounded-lg text-[var(--ink-soft)] hover:text-[var(--forest-deep)] hover:bg-[var(--leaf-pale)] transition-colors cursor-pointer"
          title="Edit Kategori Tiket"
          aria-label="Edit Kategori Tiket"
        >
          <Pencil className="w-4 h-4" />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(cat.id)}
            className="p-2 rounded-lg text-[var(--ink-soft)] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Hapus Kategori Tiket"
            aria-label="Hapus Kategori Tiket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function DestinationCard({
  dest,
  onToggleExpand,
  isExpanded,
  onAddCategory,
  onEditCategory,
  onDeleteCategory
}) {
  const quotaPct = Math.round(((dest.booked_today || 0) / (dest.max_daily_capacity || 1000)) * 100);

  return (
    <div className="card bg-white rounded-2xl overflow-hidden shadow-xs border border-[var(--border)]">
      <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
        <div className="relative w-full sm:w-36 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={dest.cover_image_url || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=400&q=80'}
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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--forest-deep)] truncate font-serif">
                  {dest.name}
                </h3>
                <p className="text-xs text-[var(--ink-soft)] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {dest.location || [dest.address, dest.city].filter(Boolean).join(', ') || 'Indonesia'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/?tenant=${dest.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 no-underline font-bold"
                  title="Lihat Halaman Website Resmi"
                >
                  <Eye className="w-3.5 h-3.5" /> Pratinjau Website <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <p className="text-xs text-[var(--ink-soft)] line-clamp-2 mt-2 leading-relaxed">
              {dest.description || 'Kawasan wisata alam resmi dengan pengelolaan tiket elektronik.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[var(--border)] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--ink-muted)] block">Kapasitas Harian</span>
              <strong className="text-sm font-bold text-[var(--forest-deep)]">
                {Number(dest.max_daily_capacity || 0).toLocaleString('id-ID')} pax
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--ink-muted)] block">Terisi Hari Ini</span>
              <strong className="text-sm font-bold text-emerald-700">
                {Number(dest.booked_today || 0).toLocaleString('id-ID')} ({quotaPct}%)
              </strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--ink-muted)] block">Kategori Tiket</span>
              <strong className="text-sm font-bold text-[var(--forest-deep)]">
                {(dest.ticket_categories || []).length} Tipe Tarif
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-[var(--sand)] border-t border-[var(--border)] flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onToggleExpand(dest.id)}
          className="flex items-center gap-1.5 text-[var(--forest-deep)] hover:text-[var(--forest)] font-bold transition-colors cursor-pointer"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--forest)]" /> : <ChevronDown className="w-4 h-4 text-[var(--forest)]" />}
          <span>{isExpanded ? 'Tutup Pengaturan Tiket & Tarif' : 'Kelola Kategori & Struktur Tarif Tiket'}</span>
        </button>

        <span className="text-[11px] text-[var(--ink-soft)]">
          {(dest.facilities || []).length} Fasilitas Aktif
        </span>
      </div>

      {isExpanded && (
        <div className="p-6 border-t border-[var(--border)] bg-[var(--sand)]/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--forest-deep)]">
                Daftar Kategori Tiket Masuk Resmi
              </h4>
              <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                Atur tarif tiket masuk, asuransi pengunjung, dan retribusi PEMDA yang dapat dipilih wisatawan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAddCategory(dest.id)}
              className="btn-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs font-bold cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Kategori Tiket
            </button>
          </div>

          <div className="space-y-2.5">
            {(dest.ticket_categories || []).length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[var(--border)] text-center text-xs text-[var(--ink-soft)]">
                Belum ada kategori tiket. Klik "Tambah Kategori Tiket" untuk menambahkan tiket pertama.
              </div>
            ) : (
              (dest.ticket_categories || []).map((cat) => (
                <TicketCategoryRow
                  key={cat.id}
                  cat={cat}
                  onEdit={(c) => onEditCategory(dest.id, c)}
                  onDelete={(catId) => onDeleteCategory(dest.id, catId)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
    } else {
      setFormData({
        name: '',
        price: 35000,
        insurance: 3000,
        retribusi: 2000,
        is_active: true,
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
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[var(--forest-deep)] mb-1.5">
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
              <label className="block font-bold uppercase tracking-wider text-[var(--forest-deep)] mb-1">
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
              <label className="block font-bold uppercase tracking-wider text-[var(--forest-deep)] mb-1">
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
              <label className="block font-bold uppercase tracking-wider text-[var(--forest-deep)] mb-1">
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
          <div className="p-4 rounded-2xl bg-[var(--fog)] flex items-baseline justify-between border border-[var(--border)]">
            <span className="font-bold text-[var(--forest-deep)]">Total per Pengunjung:</span>
            <span className="text-base font-extrabold text-[var(--bark)]">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-xl font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 rounded-xl font-bold shadow-xs cursor-pointer"
            >
              Simpan Kategori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DestinationsPage() {
  const { toast } = useToast();
  const { slug, refetch } = useTenant();
  const [destinations, setDestinations] = useState(() => {
    try {
      const raw = localStorage.getItem('passify_admin_destinations');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingCatContext, setEditingCatContext] = useState(null);
  const [deleteConfirmContext, setDeleteConfirmContext] = useState(null);

  // Fetch destination from microservices
  useEffect(() => {
    async function loadRealDestinations() {
      try {
        const realList = await fetchAdminDestinations(slug);
        if (realList && realList.length > 0) {
          setDestinations(realList);
          if (realList[0].slug) {
            localStorage.setItem('passify_current_tenant', realList[0].slug);
          }
        }
      } catch (err) {
        console.warn('Real destinations load error:', err);
      }
    }
    loadRealDestinations();
  }, [slug]);

  const saveDestinationsList = (updated) => {
    setDestinations(updated);
    localStorage.setItem('passify_admin_destinations', JSON.stringify(updated));
    if (updated.length > 0 && updated[0].slug) {
      localStorage.setItem('passify_current_tenant', updated[0].slug);
    }
    refetch?.();
  };

  const dest = destinations[0] || null;
  const destId = dest?.id || 'dest-main';

  const handleSaveCategory = async (categoryData) => {
    if (!dest) return;

    const categories = [...(dest.ticket_categories || [])];
    const existingIdx = categories.findIndex((c) => c.id === categoryData.id);
    if (existingIdx >= 0) {
      categories[existingIdx] = categoryData;
    } else {
      categories.push(categoryData);
    }

    const updatedDest = { ...dest, ticket_categories: categories };
    saveDestinationsList([updatedDest]);
    setEditingCatContext(null);
    toast.success('Kategori tarif tiket berhasil disimpan!');

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

  const handleDeleteCategory = (catId) => {
    const cat = (dest?.ticket_categories || []).find((c) => c.id === catId);
    setDeleteConfirmContext({
      catId,
      catName: cat?.name || 'Kategori Tiket',
    });
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteConfirmContext || !dest) return;
    const { catId } = deleteConfirmContext;

    const updatedCategories = (dest.ticket_categories || []).filter((c) => c.id !== catId);
    const updatedDest = { ...dest, ticket_categories: updatedCategories };

    saveDestinationsList([updatedDest]);
    setDeleteConfirmContext(null);
    toast.success('Kategori tiket telah dihapus.');

    try {
      await apiRequest(`/api/v1/tickets/categories/${catId}`, {
        method: 'DELETE',
      }).catch(() => null);
    } catch (_) {}
  };

  const capacity = Number(dest?.max_daily_capacity || 1000);
  const booked = Number(dest?.booked_today || 0);
  const quotaPct = capacity ? Math.round((booked / capacity) * 100) : 0;
  const ticketCategories = dest?.ticket_categories || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--forest-deep)] font-serif">
          Destinasi &amp; Manajemen Tiket
        </h1>
        <p className="text-xs text-[var(--ink-soft)] mt-1">
          Kelola kategori tarif tiket resmi, komponen asuransi &amp; retribusi, serta kuota harian pengunjung kawasan.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Compass}
          label="Destinasi Wisata"
          value={dest?.name || 'Kawasan Wisata'}
          subValue={dest?.location || 'Kawasan Konservasi Alam'}
          badgeText="DESTINASI"
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
          value={`${capacity.toLocaleString('id-ID')} pax`}
          subValue={`Terisi: ${booked.toLocaleString('id-ID')} pax hari ini`}
          progress={quotaPct}
          badgeText="KUOTA"
        />
        <AdminStatCard
          icon={Ticket}
          label="Kategori Tarif Tiket"
          value={`${ticketCategories.length} Tipe Tarif`}
          subValue="WNI, WNA, Asuransi & Retribusi"
          badgeText="TARIF"
        />
      </div>

      {/* Destination Card & Ticket Management */}
      {dest && (
        <DestinationCard
          dest={dest}
          isExpanded={isExpanded}
          onToggleExpand={() => setIsExpanded((prev) => !prev)}
          onAddCategory={() => setEditingCatContext({ cat: null })}
          onEditCategory={(_, cat) => setEditingCatContext({ cat })}
          onDeleteCategory={(_, catId) => handleDeleteCategory(catId)}
        />
      )}

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

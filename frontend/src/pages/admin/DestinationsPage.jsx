import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  DollarSign,
  Ticket,
  Image,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useApiClient } from '../../api/client';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { ADMIN_DESTINATIONS } from '../../data/adminData';

function TicketCategoryRow({ cat, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white border border-gray-200 shadow-2xs">
      <div className="flex-1">
        <span className="text-xs font-bold text-gray-900">{cat.name}</span>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500">
          <span>
            Tiket: <strong className="text-gray-900">Rp {cat.price.toLocaleString('id-ID')}</strong>
          </span>
          <span>Asuransi: Rp {cat.insurance.toLocaleString('id-ID')}</span>
          <span>Retribusi: Rp {cat.retribusi.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-emerald-700">
          {cat.is_active ? '• Aktif' : '• Nonaktif'}
        </span>
        <button
          type="button"
          onClick={() => onEdit(cat)}
          className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-900 flex items-center justify-center transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function DestinationCard({ dest, onToggleExpand, isExpanded, onEditDest, onEditCategory }) {
  const quotaPct = Math.round((dest.booked_today / dest.max_daily_capacity) * 100);

  return (
    <div className="card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
      {/* Card Header */}
      <div className="flex gap-4 p-5">
        <img
          src={dest.cover_image_url}
          alt={dest.name}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-gray-200"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900 truncate font-['Outfit']">
                {dest.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                  {dest.typeLabel}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {dest.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  dest.is_active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {dest.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
            <div>
              <span className="text-[11px] text-gray-500 block">Kapasitas Harian</span>
              <span className="font-bold text-gray-900">
                {dest.max_daily_capacity.toLocaleString('id-ID')} pax
              </span>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block">Terisi Hari Ini</span>
              <span className="font-bold text-emerald-700">
                {dest.booked_today.toLocaleString('id-ID')} ({quotaPct}%)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-gray-500 block">Kategori Tiket</span>
              <span className="font-bold text-gray-900">
                {dest.ticket_categories.length} tipe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand Bar */}
      <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onToggleExpand(dest.id)}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>
            {isExpanded ? 'Sembunyikan Tarif & Kuota' : 'Kelola Tarif & Kategori Tiket'}
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEditDest(dest)}
            className="text-gray-400 hover:text-gray-900 p-1 transition-colors"
            title="Edit Destinasi"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Daftar Kategori & Struktur Harga Tiket
            </span>
            <button
              type="button"
              onClick={() => onEditCategory({ destId: dest.id })}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Kategori
            </button>
          </div>
          <div className="space-y-2">
            {dest.ticket_categories.map((cat) => (
              <TicketCategoryRow
                key={cat.id}
                cat={cat}
                onEdit={(c) => onEditCategory({ ...c, destId: dest.id })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DestinationsPage() {
  const apiClient = useApiClient(); // API client with automatic tenant header injection
  // TODO: Fetch destinations from API: const destinations = await apiClient.get('/api/admin/destinations');
  // TODO: Create: await apiClient.post('/api/admin/destinations', newDestinationData);
  // TODO: Update: await apiClient.put(`/api/admin/destinations/${id}`, updatedData);
  // TODO: Delete: await apiClient.delete(`/api/admin/destinations/${id}`);
  
  const [destinations, setDestinations] = useState(ADMIN_DESTINATIONS);
  const [expandedId, setExpandedId] = useState(ADMIN_DESTINATIONS[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredDests = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCapacity = destinations.reduce((s, d) => s + d.max_daily_capacity, 0);
  const totalBooked = destinations.reduce((s, d) => s + d.booked_today, 0);
  const overallPct = Math.round((totalBooked / totalCapacity) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="text-xs text-emerald-700 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Destination Engine • White-Label SaaS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit']">
            Manajemen Destinasi & Tarif Tiket Klien
          </h1>
        </div>

        <button className="btn-primary btn-sm shadow-2xs">
          <Plus className="w-4 h-4" />
          <span>Tambah Destinasi Tenant</span>
        </button>
      </div>

      {/* KPI Cards (Minimalist style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Compass}
          label="Total Kawasan Terdaftar"
          value={`${destinations.length} Kawasan`}
          subValue="Dikelola oleh pengelola tenant"
          badgeText="VENUES"
        />
        <AdminStatCard
          icon={CheckCircle2}
          label="Destinasi Aktif & Buka"
          value={`${destinations.filter((d) => d.is_active).length} Kawasan`}
          subValue="Menerima pemesanan tiket daring"
          badgeText="ACTIVE"
        />
        <AdminStatCard
          icon={Users}
          label="Total Kuota Harian Gabungan"
          value={`${totalCapacity.toLocaleString('id-ID')} pax`}
          subValue={`Terisi: ${totalBooked.toLocaleString('id-ID')} pax hari ini`}
          progress={overallPct}
          badgeText="CAPACITY"
        />
        <AdminStatCard
          icon={Ticket}
          label="Total Kategori Tiket"
          value={`${destinations.reduce((s, d) => s + d.ticket_categories.length, 0)} Tipe`}
          subValue="Reguler, VIP, Rombongan & Khusus"
          badgeText="PRICING"
        />
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari destinasi atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Destination Cards Grid */}
      <div className="space-y-4">
        {filteredDests.map((dest) => (
          <DestinationCard
            key={dest.id}
            dest={dest}
            isExpanded={expandedId === dest.id}
            onToggleExpand={toggleExpand}
            onEditDest={() => {}}
            onEditCategory={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

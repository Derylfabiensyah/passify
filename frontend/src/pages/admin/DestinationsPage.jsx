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
import AdminStatCard from '../../components/admin/AdminStatCard';
import { ADMIN_DESTINATIONS } from '../../data/adminData';

function TicketCategoryRow({ cat, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-zinc-900 border border-zinc-800">
      <div className="flex-1">
        <span className="text-xs font-semibold text-zinc-100">{cat.name}</span>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-400">
          <span>
            Tiket: <strong className="text-zinc-100">Rp {cat.price.toLocaleString('id-ID')}</strong>
          </span>
          <span>Asuransi: Rp {cat.insurance.toLocaleString('id-ID')}</span>
          <span>Retribusi: Rp {cat.retribusi.toLocaleString('id-ID')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-emerald-400">
          {cat.is_active ? '• Aktif' : '• Nonaktif'}
        </span>
        <button
          type="button"
          onClick={() => onEdit(cat)}
          className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-colors"
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
    <div className="card bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="flex gap-4 p-5">
        <img
          src={dest.cover_image_url}
          alt={dest.name}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-zinc-100 truncate font-['Outfit']">
                {dest.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800">
                  {dest.typeLabel}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                  {dest.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                  dest.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {dest.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-900 text-xs">
            <div>
              <span className="text-[11px] text-zinc-500 block">Kapasitas Harian</span>
              <span className="font-bold text-zinc-200">
                {dest.max_daily_capacity.toLocaleString('id-ID')} pax
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block">Terisi Hari Ini</span>
              <span className="font-bold text-emerald-400">
                {dest.booked_today.toLocaleString('id-ID')} ({quotaPct}%)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 block">Kategori Tiket</span>
              <span className="font-bold text-zinc-200">
                {dest.ticket_categories.length} tipe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand Bar */}
      <div className="px-5 py-2.5 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onToggleExpand(dest.id)}
          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 font-semibold transition-colors"
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
            className="text-zinc-400 hover:text-zinc-100 p-1 transition-colors"
            title="Edit Destinasi"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-5 border-t border-zinc-800/80 bg-zinc-950 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Daftar Kategori & Struktur Harga Tiket
            </span>
            <button
              type="button"
              onClick={() => onEditCategory({ destId: dest.id })}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="text-xs text-emerald-500 uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Destination Engine • Tremor UI Powered</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 font-['Outfit']">
            Manajemen Destinasi & Tarif Tiket
          </h1>
        </div>

        <button className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          <span>Tambah Destinasi Baru</span>
        </button>
      </div>

      {/* KPI Cards (Tremor UI style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Compass}
          label="Total Destinasi Alam"
          value={`${destinations.length} Kawasan`}
          subValue="Dikelola di bawah pengawasan BKSDA/TN"
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
          subValue="WNI, WNA, Rombongan & Kemah"
          badgeText="PRICING"
        />
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari destinasi atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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

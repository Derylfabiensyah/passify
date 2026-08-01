import React, { useState, useMemo } from 'react';
import {
  ScanLine,
  Plus,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  Key,
  Wifi,
  WifiOff,
  X,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy
} from 'lucide-react';
import AdminStatCard from '../../components/admin/AdminStatCard';
import DataTable from '../../components/admin/DataTable';
import { GATE_DEVICES, ADMIN_DESTINATIONS } from '../../data/adminData';

function DeviceCard({ device, onEdit, onToggle, onDownloadManifest, onRevealKey }) {
  const [keyVisible, setKeyVisible] = useState(false);
  const isOnline = device.is_active;

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`card p-5 bg-zinc-950 border border-zinc-800 rounded-xl ${!isOnline ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">{device.device_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-zinc-500 font-mono">{device.device_code}</span>
              <span className="text-[10px] font-semibold text-zinc-400">
                {device.gate_type === 'entrance' ? '• Masuk' : '• Keluar'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-400">
            {isOnline ? '• Online' : '• Offline'}
          </span>
        </div>
      </div>

      <div className="text-xs text-zinc-400 space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span>Destinasi</span>
          <span className="text-zinc-100 font-medium">{device.destination}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Scan Hari Ini</span>
          <span className="text-zinc-100 font-bold">{device.total_scans_today}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Manifest Sync Terakhir</span>
          <span className="text-zinc-100">{formatDateTime(device.last_manifest_sync)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Log Sync Terakhir</span>
          <span className="text-zinc-100">{formatDateTime(device.last_log_sync)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-900 gap-2">
        <button
          type="button"
          onClick={() => onDownloadManifest(device)}
          className="btn-secondary btn-sm flex-1 justify-center"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Sync Manifest</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(device)}
          className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function GatesPage() {
  const [devices, setDevices] = useState(GATE_DEVICES);
  const [filterDest, setFilterDest] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const uniqueDestinations = useMemo(() => {
    const dests = devices.map((d) => d.destination);
    return Array.from(new Set(dests));
  }, [devices]);

  const filteredDevices = useMemo(() => {
    if (filterDest === 'all') return devices;
    return devices.filter((d) => d.destination === filterDest);
  }, [devices, filterDest]);

  // TanStack React Table columns for Gate Devices table
  const deviceTableColumns = useMemo(
    () => [
      {
        accessorKey: 'device_code',
        header: 'Kode Device',
        cell: (info) => (
          <span className="font-mono font-bold text-emerald-400">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'device_name',
        header: 'Nama Perangkat',
        cell: (info) => <span className="font-bold text-zinc-100">{info.getValue()}</span>
      },
      {
        accessorKey: 'destination',
        header: 'Destinasi Wisata',
        cell: (info) => <span className="text-zinc-300">{info.getValue()}</span>
      },
      {
        accessorKey: 'gate_type',
        header: 'Tipe Gerbang',
        cell: (info) => (
          <span className="uppercase text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {info.getValue() === 'entrance' ? 'Pintu Masuk' : 'Pintu Keluar'}
          </span>
        )
      },
      {
        accessorKey: 'total_scans_today',
        header: 'Scan Hari Ini',
        cell: (info) => (
          <span className="font-bold text-zinc-100">{info.getValue()} pax</span>
        )
      },
      {
        accessorKey: 'is_active',
        header: 'Status Perangkat',
        cell: (info) => {
          const active = info.getValue();
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              <span className="status-dot" />
              <span>{active ? 'ONLINE' : 'OFFLINE'}</span>
            </span>
          );
        }
      }
    ],
    []
  );

  const totalScans = devices.reduce((sum, d) => sum + d.total_scans_today, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="text-xs text-emerald-500 uppercase tracking-widest font-semibold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Hardware & Gate Telemetry • Tremor UI Powered</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 font-['Outfit']">
            Perangkat & Terminal Pemindai (Gate Scanners)
          </h1>
        </div>

        <button
          id="add-gate-device-btn"
          onClick={() => setShowAddModal(true)}
          className="btn-primary btn-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Registrasi Device Baru</span>
        </button>
      </div>

      {/* KPI Cards (Tremor UI style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          icon={Smartphone}
          label="Total Perangkat Gate"
          value={devices.length.toString()}
          subValue="Pemindai e-Ticket & gelang NFC"
          badgeText="DEVICES"
        />
        <AdminStatCard
          icon={Wifi}
          label="Perangkat Online / Aktif"
          value={devices.filter((d) => d.is_active).length.toString()}
          subValue="Terhubung server telemetri real-time"
          badgeText="ONLINE"
        />
        <AdminStatCard
          icon={WifiOff}
          label="Perangkat Offline"
          value={devices.filter((d) => !d.is_active).length.toString()}
          subValue="Sinkronisasi offline batch mode"
          badgeText="OFFLINE"
        />
        <AdminStatCard
          icon={ScanLine}
          label="Total Pemindaian Hari Ini"
          value={`${totalScans.toLocaleString('id-ID')} pax`}
          subValue="Validasi tiket & akses gate wisatawan"
          badgeText="SCANS"
        />
      </div>

      {/* Destination Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterDest('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterDest === 'all'
              ? 'bg-zinc-100 text-zinc-900'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Semua Destinasi
        </button>
        {uniqueDestinations.map((dest) => (
          <button
            key={dest}
            type="button"
            onClick={() => setFilterDest(dest)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterDest === dest
                ? 'bg-zinc-100 text-zinc-900'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {dest}
          </button>
        ))}
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onEdit={() => {}}
            onToggle={() => {}}
            onDownloadManifest={() => {}}
            onRevealKey={() => {}}
          />
        ))}
      </div>

      {/* TanStack React Table: All Gate Scanner Devices */}
      <DataTable
        data={filteredDevices}
        columns={deviceTableColumns}
        title="Daftar Perangkat & Terminal Gerbang"
        subtitle="Dukungan sorting, pencarian cepat, dan pagination oleh TanStack React Table v8"
        defaultPageSize={5}
        searchPlaceholder="Cari kode device, nama gerbang, atau lokasi..."
      />
    </div>
  );
}

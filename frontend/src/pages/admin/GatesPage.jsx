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
    <div className={`card p-5 bg-white border border-gray-200 rounded-xl shadow-2xs ${!isOnline ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{device.device_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-gray-500 font-mono">{device.device_code}</span>
              <span className="text-[10px] font-semibold text-gray-500">
                {device.gate_type === 'entrance' ? '• Masuk' : '• Keluar'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-500">
            {isOnline ? '• Online' : '• Offline'}
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span>Destinasi</span>
          <span className="text-gray-900 font-medium">{device.destination}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Scan Hari Ini</span>
          <span className="text-gray-900 font-bold">{device.total_scans_today}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Manifest Sync Terakhir</span>
          <span className="text-gray-900">{formatDateTime(device.last_manifest_sync)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Log Sync Terakhir</span>
          <span className="text-gray-900">{formatDateTime(device.last_log_sync)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
        <button
          type="button"
          onClick={() => onDownloadManifest(device)}
          className="btn-secondary btn-sm flex-1 justify-center shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Sync Manifest</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(device)}
          className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors shadow-xs"
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
          <span className="font-mono font-bold text-emerald-700">{info.getValue()}</span>
        )
      },
      {
        accessorKey: 'device_name',
        header: 'Nama Perangkat',
        cell: (info) => <span className="font-bold text-gray-900">{info.getValue()}</span>
      },
      {
        accessorKey: 'destination',
        header: 'Kawasan Wisata',
        cell: (info) => <span className="text-gray-700 font-medium">{info.getValue()}</span>
      },
      {
        accessorKey: 'gate_type',
        header: 'Tipe Gerbang',
        cell: (info) => (
          <span className="uppercase text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
            {info.getValue() === 'entrance' ? 'Pintu Masuk' : 'Pintu Keluar'}
          </span>
        )
      },
      {
        accessorKey: 'total_scans_today',
        header: 'Scan Hari Ini',
        cell: (info) => (
          <span className="font-bold text-gray-900">{info.getValue()} pax</span>
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
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="text-xs text-emerald-700 uppercase tracking-widest font-bold flex items-center gap-2 mb-1">
            <span className="status-dot" />
            <span>Passify Hardware & Gate Telemetry • White-Label Cloud Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit']">
            Perangkat & Terminal Pemindai (Gate Scanners)
          </h1>
        </div>

        <button
          id="add-gate-device-btn"
          onClick={() => setShowAddModal(true)}
          className="btn-primary btn-sm shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrasi Device Tenant</span>
        </button>
      </div>

      {/* KPI Cards (Minimalist style) */}
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
          subValue="Validasi tiket & akses gate pengunjung"
          badgeText="SCANS"
        />
      </div>

      {/* Destination Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterDest('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
            filterDest === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
              : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Semua Kawasan
        </button>
        {uniqueDestinations.map((dest) => (
          <button
            key={dest}
            type="button"
            onClick={() => setFilterDest(dest)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
              filterDest === dest
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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

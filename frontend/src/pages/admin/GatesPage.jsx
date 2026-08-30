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
import { useTenant } from '../../contexts/TenantContext';
import { fetchAdminDestinations, fetchAdminGateTelemetry } from '../../api/admin';
import { apiRequest } from '../../api/client';
import AdminStatCard from '../../components/admin/AdminStatCard';
import DataTable from '../../components/admin/DataTable';
import { GATE_DEVICES, ADMIN_DESTINATIONS } from '../../data/adminData';

function DeviceCard({ device, onEdit, onToggle, onDownloadManifest, onDelete }) {
  const [keyVisible, setKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const isOnline = device.is_active;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(device.hmac_key || 'PASSIFY-SECRET-HMAC-KEY');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div className={`card p-5 bg-white rounded-2xl shadow-sm ${!isOnline ? 'opacity-75 bg-gray-50/60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{device.device_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-gray-500 font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded-lg shadow-2xs">
                {device.device_code}
              </span>
              <span className="text-[10px] font-semibold text-gray-600">
                {device.gate_type === 'entrance' ? '• Pintu Masuk' : '• Pintu Keluar'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(device)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-colors ${
            isOnline
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
          }`}
          title="Klik untuk mengubah status online/offline"
        >
          <span className="status-dot" />
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </button>
      </div>

      <div className="text-xs text-gray-600 space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span>Destinasi</span>
          <span className="text-gray-900 font-medium text-right truncate max-w-[180px]">{device.destination}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Scan Hari Ini</span>
          <span className="text-gray-900 font-bold">{device.total_scans_today} pax</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Manifest Sync Terakhir</span>
          <span className="text-gray-900">{formatDateTime(device.last_manifest_sync)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Log Sync Terakhir</span>
          <span className="text-gray-900">{formatDateTime(device.last_log_sync)}</span>
        </div>
        <div className="pt-1.5 mt-1.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <Key className="w-3 h-3 text-emerald-600" />
            <span>HMAC Secret Key</span>
          </span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-gray-600">
              {keyVisible ? (device.hmac_key || 'a3f8c2d1e6b9') : '••••••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setKeyVisible(!keyVisible)}
              className="p-1 text-gray-400 hover:text-gray-700"
              title={keyVisible ? 'Sembunyikan Key' : 'Tampilkan Key'}
            >
              {keyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={handleCopyKey}
              className="p-1 text-gray-400 hover:text-emerald-700"
              title={copied ? 'Tersalin!' : 'Salin Key'}
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
        <button
          type="button"
          onClick={() => onDownloadManifest(device)}
          className="btn-secondary btn-sm flex-1 justify-center shadow-2xs text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Manifest Offline</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(device)}
          className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors shadow-xs"
          title="Ubah Konfigurasi"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(device.id)}
            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:text-red-600 border border-gray-200 transition-colors shadow-xs"
            title="Hapus Perangkat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function AddEditGateModal({ device, destinations, onClose, onSave }) {
  const isNew = !device?.id;
  const [formData, setFormData] = useState({
    device_name: device?.device_name || '',
    device_code: device?.device_code || `GATE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-01`,
    destination: device?.destination || destinations[0] || 'Taman Nasional Bromo Tengger Semeru',
    gate_type: device?.gate_type || 'entrance',
    hmac_key: device?.hmac_key || Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    is_active: device?.is_active !== undefined ? device.is_active : true
  });
  const [error, setError] = useState('');

  const generateNewKey = () => {
    const key = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setFormData((prev) => ({ ...prev, hmac_key: key }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.device_name.trim()) {
      setError('Nama perangkat gerbang wajib diisi.');
      return;
    }
    if (!formData.device_code.trim()) {
      setError('Kode perangkat wajib diisi.');
      return;
    }
    onSave({
      ...device,
      ...formData,
      id: device?.id || `gd-${Date.now()}`,
      total_scans_today: device?.total_scans_today || 0,
      last_manifest_sync: device?.last_manifest_sync || new Date().toISOString(),
      last_log_sync: device?.last_log_sync || new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card p-6 max-w-lg w-full bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 font-['Outfit'] flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>{isNew ? 'Registrasi Perangkat Gate Baru' : 'Ubah Konfigurasi Perangkat'}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Nama Perangkat / Pos Gerbang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gate A - Pintu Utama Masuk"
              value={formData.device_name}
              onChange={(e) => {
                setFormData({ ...formData, device_name: e.target.value });
                setError('');
              }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kode Device <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="GATE-A-001"
                value={formData.device_code}
                onChange={(e) => setFormData({ ...formData, device_code: e.target.value.toUpperCase() })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Tipe Gerbang
              </label>
              <select
                value={formData.gate_type}
                onChange={(e) => setFormData({ ...formData, gate_type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="entrance">Pintu Masuk (Entrance)</option>
                <option value="exit">Pintu Keluar (Exit)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Destinasi Kawasan Wisata
            </label>
            <select
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            >
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                HMAC SHA-256 Secret Key (Enkripsi Offline)
              </label>
              <button
                type="button"
                onClick={generateNewKey}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate Key Baru</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={formData.hmac_key}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-700 focus:outline-none"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Kunci rahasia ini dienkripsi pada perangkat scanner gate untuk validasi Dynamic TOTP QR offline.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Status Operasional Perangkat
            </label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            >
              <option value="active">Online / Aktif</option>
              <option value="inactive">Offline / Nonaktif</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-2.5 justify-center text-xs font-semibold shadow-2xs mt-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isNew ? 'Registrasikan Perangkat' : 'Simpan Konfigurasi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GatesPage() {
  const { slug } = useTenant();
  const [destinations, setDestinations] = useState(ADMIN_DESTINATIONS);
  const [devices, setDevices] = useState(GATE_DEVICES);
  const [filterDest, setFilterDest] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load real gate telemetry from backend
  useEffect(() => {
    async function loadData() {
      try {
        const dests = await fetchAdminDestinations(slug);
        if (dests && dests.length > 0) {
          setDestinations(dests);
          const { devices: realDevices } = await fetchAdminGateTelemetry(dests[0].id);
          if (realDevices && realDevices.length > 0) {
            setDevices(realDevices);
          }
        }
      } catch (err) {
        console.warn('Gate telemetry load fallback:', err);
      }
    }
    loadData();
  }, [slug]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const uniqueDestinations = useMemo(() => {
    const dests = destinations.map((d) => d.name);
    devices.forEach((dev) => {
      if (dev.destination && !dests.includes(dev.destination)) {
        dests.push(dev.destination);
      }
    });
    return Array.from(new Set(dests));
  }, [destinations, devices]);

  const filteredDevices = useMemo(() => {
    if (filterDest === 'all') return devices;
    return devices.filter((d) => d.destination === filterDest);
  }, [devices, filterDest]);

  const handleSaveDevice = async (savedDevice) => {
    setDevices((prev) => {
      const exists = prev.some((d) => d.id === savedDevice.id);
      if (exists) {
        return prev.map((d) => (d.id === savedDevice.id ? { ...d, ...savedDevice } : d));
      }
      return [savedDevice, ...prev];
    });
    showToast(`Perangkat "${savedDevice.device_name}" berhasil disimpan!`);
    setShowAddModal(false);
    setEditingDevice(null);

    // Sync to gate service
    try {
      await apiRequest('/api/v1/gate/devices', {
        method: 'POST',
        body: {
          destination_id: destinations[0]?.id,
          device_code: savedDevice.device_code,
          device_name: savedDevice.device_name,
          gate_type: savedDevice.gate_type,
          hmac_key: savedDevice.hmac_key,
        },
      }).catch(() => null);
    } catch (_) {}
  };

  const handleToggleDevice = (device) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, is_active: !d.is_active } : d))
    );
    showToast(
      device.is_active
        ? `Perangkat ${device.device_code} diubah menjadi OFFLINE.`
        : `Perangkat ${device.device_code} sekarang ONLINE.`
    );
  };

  const handleDeleteDevice = (deviceId) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    showToast('Perangkat gerbang berhasil dihapus.');
  };

  const handleDownloadManifest = (device) => {
    const manifestData = {
      device_code: device.device_code,
      destination: device.destination,
      gate_type: device.gate_type,
      generated_at: new Date().toISOString(),
      active_tickets_count: 148,
      algorithm: "HMAC-SHA256",
      tickets_sample: [
        { code: "TWA-20260730-001", hash: "a3f8c2d1e6b90123", time_slot: "Pagi", valid_until: "2026-07-30T18:00:00Z" },
        { code: "TWA-20260730-002", hash: "b7d4e1f2a3c84567", time_slot: "Pagi", valid_until: "2026-07-30T18:00:00Z" },
        { code: "TWA-20260730-003", hash: "c5e2f3a4b1d78901", time_slot: "Siang", valid_until: "2026-07-30T18:00:00Z" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manifest-${device.device_code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Manifest offline untuk ${device.device_code} berhasil diunduh.`);
  };

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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 font-['Outfit']">
            Perangkat & Terminal Pemindai (Gate Scanners)
          </h1>
        </div>

        <button
          id="add-gate-device-btn"
          type="button"
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
            onEdit={setEditingDevice}
            onToggle={handleToggleDevice}
            onDownloadManifest={handleDownloadManifest}
            onDelete={handleDeleteDevice}
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

      {/* Modals */}
      {showAddModal && (
        <AddEditGateModal
          destinations={uniqueDestinations}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveDevice}
        />
      )}
      {editingDevice && (
        <AddEditGateModal
          device={editingDevice}
          destinations={uniqueDestinations}
          onClose={() => setEditingDevice(null)}
          onSave={handleSaveDevice}
        />
      )}
    </div>
  );
}

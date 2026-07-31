import React, { useState } from 'react';
import {
  ScanLine, Plus, Pencil, Trash2, Download, RefreshCw, Key, Wifi, WifiOff,
  X, Save, Eye, EyeOff, Smartphone, Shield, Clock, CheckCircle2, AlertCircle, Copy
} from 'lucide-react';
import { GATE_DEVICES, ADMIN_DESTINATIONS } from '../../data/adminData';

function DeviceCard({ device, onEdit, onToggle, onDownloadManifest, onRevealKey }) {
  const [keyVisible, setKeyVisible] = useState(false);
  const isOnline = device.is_active;

  const formatDateTime = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`card p-5 ${!isOnline ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
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

      {/* Destination & Stats */}
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

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDownloadManifest(device)}
          className="flex-1 px-3 py-2 rounded-lg text-[11px] font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Manifest
        </button>
        <button
          onClick={() => onEdit(device)}
          className="px-3 py-2 rounded-lg text-[11px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onToggle(device)}
          className="px-3 py-2 rounded-lg text-[11px] font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
        >
          {isOnline ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>
    </div>
  );
}

function AddDeviceModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    device_name: '',
    device_code: '',
    gate_type: 'entrance',
    destination_id: ADMIN_DESTINATIONS[0]?.id || '',
  });

  const handleSave = () => {
    if (!formData.device_name || !formData.device_code) {
      alert('Mohon isi Nama Device dan Kode Device.');
      return;
    }
    const newDevice = {
      id: `gd-${Date.now()}`,
      ...formData,
      destination: ADMIN_DESTINATIONS.find(d => d.id === formData.destination_id)?.name || '',
      is_active: true,
      hmac_key: Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...generated',
      last_manifest_sync: null,
      last_log_sync: null,
      total_scans_today: 0,
    };
    onSave(newDevice);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content relative p-6 sm:p-8 max-w-lg">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-100 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Registrasi Device Baru</h2>
            <p className="text-[11px] text-zinc-400">Daftarkan unit Gate Scanner / HP Petugas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nama Device</label>
            <input
              type="text"
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
              placeholder="e.g. Gate A - Pintu Utama"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Kode Device</label>
              <input
                type="text"
                value={formData.device_code}
                onChange={(e) => setFormData({ ...formData, device_code: e.target.value })}
                placeholder="e.g. GATE-A-001"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tipe Gate</label>
              <select
                value={formData.gate_type}
                onChange={(e) => setFormData({ ...formData, gate_type: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
              >
                <option value="entrance">Gerbang Masuk</option>
                <option value="exit">Gerbang Keluar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Destinasi Wisata</label>
            <select
              value={formData.destination_id}
              onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
            >
              {ADMIN_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Batal</button>
          <button onClick={handleSave} className="flex-1 py-2.5 text-sm bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Registrasi
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GatesPage() {
  const [devices, setDevices] = useState(GATE_DEVICES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterDest, setFilterDest] = useState('all');

  const filteredDevices = filterDest === 'all'
    ? devices
    : devices.filter(d => d.destination === filterDest);

  const handleToggleDevice = (device) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === device.id ? { ...d, is_active: !d.is_active } : d))
    );
  };

  const handleDownloadManifest = (device) => {
    alert(`📥 Mengunduh Manifest Tiket Harian untuk ${device.device_name}...\n\nFile: manifest_${device.device_code}_${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleAddDevice = (newDevice) => {
    setDevices((prev) => [...prev, newDevice]);
  };

  const uniqueDestinations = [...new Set(devices.map(d => d.destination))];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Device Gate Scanner</h2>
          <p className="text-sm text-zinc-400 mt-1">Kelola perangkat pemindai gerbang</p>
        </div>
        <button
          id="add-gate-device-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-100 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrasi Device</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100">{devices.length}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Total Device</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100">{devices.filter(d => d.is_active).length}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Online/Aktif</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100">{devices.filter(d => !d.is_active).length}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Offline/Nonaktif</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-zinc-100">{devices.reduce((sum, d) => sum + d.total_scans_today, 0)}</div>
          <div className="text-[10px] text-zinc-400 mt-1">Total Scan Hari Ini</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterDest('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterDest === 'all' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Semua
        </button>
        {uniqueDestinations.map((dest) => (
          <button
            key={dest}
            onClick={() => setFilterDest(dest)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterDest === dest ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {dest}
          </button>
        ))}
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDevices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            onEdit={() => {}}
            onToggle={handleToggleDevice}
            onDownloadManifest={handleDownloadManifest}
            onRevealKey={() => {}}
          />
        ))}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <AddDeviceModal onClose={() => setShowAddModal(false)} onSave={handleAddDevice} />
      )}
    </div>
  );
}

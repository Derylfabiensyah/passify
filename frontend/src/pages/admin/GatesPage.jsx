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
    <div className={`glass-panel p-5 hover:border-emerald-500/30 transition-all ${!isOnline ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            isOnline ? 'bg-emerald-500/15' : 'bg-slate-800'
          }`}>
            <Smartphone className={`w-5 h-5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{device.device_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">{device.device_code}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                device.gate_type === 'entrance'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-sky-500/15 text-sky-400'
              }`}>
                {device.gate_type === 'entrance' ? '↙ Masuk' : '↗ Keluar'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            isOnline
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-slate-700/50 text-slate-500 border border-slate-700'
          }`}>
            {isOnline ? <><Wifi className="w-3 h-3" /> Online</> : <><WifiOff className="w-3 h-3" /> Offline</>}
          </span>
        </div>
      </div>

      {/* Destination & Stats */}
      <div className="text-xs text-slate-400 space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <span>Destinasi</span>
          <span className="text-slate-200 font-medium">{device.destination}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Scan Hari Ini</span>
          <span className="text-emerald-400 font-bold">{device.total_scans_today}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Manifest Sync Terakhir</span>
          <span className="text-slate-200">{formatDateTime(device.last_manifest_sync)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Log Sync Terakhir</span>
          <span className="text-slate-200">{formatDateTime(device.last_log_sync)}</span>
        </div>
      </div>

      {/* HMAC Key */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Key className="w-3 h-3 text-amber-400" /> HMAC Shared Key
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setKeyVisible(!keyVisible)}
              className="w-5 h-5 rounded bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center"
            >
              {keyVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(device.hmac_key)}
              className="w-5 h-5 rounded bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center"
              title="Copy key"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
        <code className="text-[11px] text-emerald-400 font-mono break-all">
          {keyVisible ? device.hmac_key : '••••••••••••••••••••'}
        </code>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDownloadManifest(device)}
          className="flex-1 px-3 py-2 rounded-xl text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Download Manifest
        </button>
        <button
          onClick={() => onEdit(device)}
          className="px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-all flex items-center gap-1.5"
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={() => onToggle(device)}
          className={`px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center gap-1.5 ${
            isOnline
              ? 'text-rose-400 bg-rose-500/10 border-rose-500/25 hover:bg-rose-500/20'
              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'
          }`}
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
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-['Outfit']">Registrasi Device Baru</h2>
            <p className="text-[11px] text-slate-400">Daftarkan unit Gate Scanner / HP Petugas</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nama Device</label>
            <input
              type="text"
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
              placeholder="e.g. Gate A - Pintu Utama"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Kode Device</label>
              <input
                type="text"
                value={formData.device_code}
                onChange={(e) => setFormData({ ...formData, device_code: e.target.value })}
                placeholder="e.g. GATE-A-001"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tipe Gate</label>
              <select
                value={formData.gate_type}
                onChange={(e) => setFormData({ ...formData, gate_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="entrance">↙ Gerbang Masuk</option>
                <option value="exit">↗ Gerbang Keluar</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destinasi Wisata</label>
            <select
              value={formData.destination_id}
              onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              {ADMIN_DESTINATIONS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-400">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <Shield className="w-3.5 h-3.5" /> HMAC Shared Key Otomatis
            </div>
            <p className="text-[11px] text-slate-400">
              Kunci enkripsi HMAC untuk validasi tiket offline akan di-generate otomatis setelah device terdaftar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-2.5 text-sm">Batal</button>
          <button onClick={handleSave} className="flex-1 btn-primary justify-center py-2.5 text-sm">
            <Save className="w-4 h-4" /> Registrasi Device
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white font-['Outfit']">Device Gate Scanner</h2>
          <p className="text-xs text-slate-400 mt-1">Kelola perangkat pemindai gerbang untuk validasi tiket QR Code (online & offline)</p>
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

      {/* Security Info Banner */}
      <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs text-emerald-400">
        <span className="font-semibold flex items-center gap-1.5">
          <Shield className="w-4 h-4" /> Offline-First Security Ready — Validasi tiket di gunung tanpa sinyal internet menggunakan HMAC SHA-256
        </span>
        <span className="text-slate-300 font-medium">Validasi Gate: <strong className="text-white">&lt; 0.5 detik</strong></span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-extrabold text-white font-['Outfit']">{devices.length}</div>
          <div className="text-[10px] text-slate-400">Total Device</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-extrabold text-emerald-400 font-['Outfit']">{devices.filter(d => d.is_active).length}</div>
          <div className="text-[10px] text-slate-400">Online/Aktif</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-500 font-['Outfit']">{devices.filter(d => !d.is_active).length}</div>
          <div className="text-[10px] text-slate-400">Offline/Nonaktif</div>
        </div>
        <div className="glass-panel p-4 text-center">
          <div className="text-2xl font-extrabold text-sky-400 font-['Outfit']">{devices.reduce((sum, d) => sum + d.total_scans_today, 0)}</div>
          <div className="text-[10px] text-slate-400">Total Scan Hari Ini</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterDest('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterDest === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
          }`}
        >
          Semua Destinasi
        </button>
        {uniqueDestinations.map((dest) => (
          <button
            key={dest}
            onClick={() => setFilterDest(dest)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterDest === dest ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
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

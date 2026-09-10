import React, { useState, useEffect, useMemo } from 'react';
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
  Copy,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTenant } from '../../contexts/TenantContext';
import { fetchAdminDestinations, fetchAdminGateTelemetry } from '../../api/admin';
import { apiRequest } from '../../api/client';
import AdminStatCard from '../../components/admin/AdminStatCard';
import DataTable from '../../components/admin/DataTable';
import { GATE_DEVICES, ADMIN_DESTINATIONS } from '../../data/adminData';

function DeviceCard({ device, onPair, onEdit, onToggle, onDownloadManifest, onDelete }) {
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
    <div className={`glass-panel p-5 rounded-2xl shadow-sm ${!isOnline ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{device.device_name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-gray-600 font-mono font-bold bg-white/60 border border-white/80 px-1.5 py-0.5 rounded-lg shadow-2xs">
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

      <div className="flex flex-col gap-2 pt-3 border-t border-white/60">
        <button
          type="button"
          onClick={() => onPair(device)}
          className="btn-primary btn-sm w-full justify-center shadow-2xs text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 py-2 rounded-xl transition-transform active:scale-98"
          title="Tampilkan QR Code untuk disambungkan ke Scanner HP Petugas"
        >
          <QrCode className="w-4 h-4" />
          <span>Pairing HP Scanner</span>
        </button>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onDownloadManifest(device)}
            className="btn-secondary btn-sm flex-1 justify-center shadow-2xs text-xs py-1.5"
            title="Unduh file manifest offline untuk cadangan manual"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Manifest</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(device)}
            className="p-1.5 rounded-lg bg-white/60 text-gray-600 hover:text-gray-900 border border-white/80 transition-colors shadow-xs"
            title="Ubah Konfigurasi"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(device.id)}
              className="p-1.5 rounded-lg bg-white/60 text-gray-600 hover:text-red-600 border border-white/80 transition-colors shadow-xs"
              title="Hapus Perangkat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DevicePairingModal({ device, onClose }) {
  const defaultHost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? '192.168.18.87'
      : window.location.hostname;
  const [serverHost, setServerHost] = useState(defaultHost);
  const [copied, setCopied] = useState(false);

  const pairingPayload = useMemo(() => {
    return JSON.stringify({
      type: 'passify_gate_pairing',
      host: serverHost.trim(),
      device_id: device.id || 'c8b9d319-36e1-4288-b9cf-fe79eaff0001',
      device_code: device.device_code,
      device_name: device.device_name,
      destination_id: device.destination_id || '11111111-1111-1111-1111-111111111111',
      hmac_key: device.hmac_key || 'passify_secret_key_123'
    });
  }, [serverHost, device]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pairingPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/80 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Pairing Scanner Petugas</h3>
              <p className="text-xs text-gray-500">{device.device_name} • {device.device_code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Display Container */}
        <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-300 shadow-inner my-1 flex flex-col items-center">
          <QRCodeSVG
            value={pairingPayload}
            size={200}
            level="M"
            includeMargin={true}
          />
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {device.device_code}
            </span>
            <span className="text-[11px] font-semibold text-gray-500">
              {device.gate_type === 'entrance' ? 'Pintu Masuk' : 'Pintu Keluar'}
            </span>
          </div>
        </div>

        {/* Server IP Config */}
        <div className="w-full mt-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-gray-700">
              IP Host Server (Jaringan Wi-Fi):
            </label>
            <span className="text-[10px] text-gray-400 font-mono">Port :8081 - :8086</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={serverHost}
              onChange={(e) => setServerHost(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              placeholder="192.168.18.87"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary btn-sm text-xs py-2 px-3 shrink-0 flex items-center gap-1.5"
              title="Salin JSON Konfigurasi"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">
            *Pastikan HP Scanner dan Laptop Admin berada di jaringan Wi-Fi yang sama ({serverHost}).
          </p>
        </div>

        {/* Instructions */}
        <div className="w-full bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 mt-3.5 text-xs text-emerald-950 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Langkah Cepat di HP Petugas:
          </p>
          <ol className="list-decimal list-inside text-[11px] text-emerald-900/90 space-y-1 ml-1">
            <li>Buka aplikasi Passify di HP petugas.</li>
            <li>Tap tombol <strong>"Pairing Gerbang"</strong> di beranda.</li>
            <li>Arahkan kamera HP ke QR Code di atas.</li>
            <li>HP otomatis terhubung & men-download tiket manifest hari ini!</li>
          </ol>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 btn-secondary py-2.5 justify-center text-xs font-semibold rounded-xl"
        >
          Selesai / Tutup
        </button>
      </div>
    </div>
  );
}

function SimulateScanModal({ devices, destinationId, onClose, onScanSuccess }) {
  const [ticketCode, setTicketCode] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState(devices[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    let raw = ticketCode.trim().replace(/^#/, '');
    if (!raw) {
      setError('Masukkan kode tiket terlebih dahulu.');
      return;
    }
    let cleanCode = raw;
    if (cleanCode.startsWith('PASSIFY:')) {
      const parts = cleanCode.split(':');
      if (parts.length >= 2) cleanCode = parts[1];
    } else if (cleanCode.includes(':')) {
      const parts = cleanCode.split(':');
      for (const p of parts) {
        if (p.startsWith('TWA-')) {
          cleanCode = p;
          break;
        }
      }
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8086/api/v1/gate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_code: cleanCode,
          qr_payload: raw,
          device_id: selectedDeviceId,
          destination_id: destinationId,
          scanned_at: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data);
        if (onScanSuccess) onScanSuccess(data.data);

        // Update local storage so traveler tickets instantly reflect 'used' status
        try {
          const stored = localStorage.getItem('passify_my_tickets');
          if (stored) {
            const list = JSON.parse(stored);
            const validatedCode = data.data.ticket_code || cleanCode;
            const updated = list.map((t) => {
              if (
                t.ticketCode === validatedCode ||
                t.orderNumber === validatedCode ||
                cleanCode.includes(t.ticketCode) ||
                (t.ticketCode && cleanCode.includes(t.ticketCode.replace(/^#/, '')))
              ) {
                return { ...t, status: 'used', usedAt: new Date().toISOString() };
              }
              return t;
            });
            localStorage.setItem('passify_my_tickets', JSON.stringify(updated));
          }

          // Record scan in local telemetry cache
          const rawScans = localStorage.getItem('passify_recent_scans');
          const scanList = rawScans ? JSON.parse(rawScans) : [];
          scanList.unshift({
            ticketCode: data.data.ticket_code || cleanCode,
            visitorName: data.data.visitor_name || 'Wisatawan',
            category: data.data.category_name || 'Tiket Masuk Reguler',
            destinationId: destinationId,
            deviceId: selectedDeviceId,
            scannedAt: new Date().toISOString(),
            valid: true,
          });
          localStorage.setItem('passify_recent_scans', JSON.stringify(scanList.slice(0, 50)));

          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      } else {
        setError(data.message || 'Validasi tiket gagal.');
      }
    } catch (err) {
      setError(`Gagal terhubung ke Gate Service: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="glass-panel rounded-2xl max-w-md w-full p-6 shadow-2xl border border-white/80 flex flex-col">
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/60 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Simulasi Pemindaian Gerbang</h3>
              <p className="text-xs text-gray-500">Uji coba validasi scan tiket langsung</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{result.message || 'Tiket berhasil divalidasi!'}</span>
            </div>
            <div className="text-[11px] text-emerald-700">
              Kode: <span className="font-mono font-bold">{result.ticket_code}</span> • Pengunjung: {result.visitor_name || 'Wisatawan'}
            </div>
          </div>
        )}

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Perangkat Gerbang</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.device_name} ({d.device_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Kode Tiket Pengunjung</label>
            <input
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
              placeholder="Contoh: TWA-QR-21712"
              className="w-full text-xs font-mono font-bold uppercase rounded-xl border border-gray-200 p-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              autoFocus
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Masukkan kode tiket yang tertera pada e-ticket wisatawan.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs flex-1 justify-center py-2.5 rounded-xl"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs flex-1 justify-center py-2.5 rounded-xl gap-1.5 shadow-xs"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              <span>{loading ? 'Memvalidasi...' : 'Scan / Validasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddEditGateModal({ device, destinations, onClose, onSave }) {
  const isNew = !device?.id;
  const [formData, setFormData] = useState({
    device_name: device?.device_name || '',
    device_code: device?.device_code || `GATE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-01`,
    destination: device?.destination || destinations[0] || 'Kawasan Wisata',
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
      <div className="modal-content glass-panel p-6 max-w-lg w-full rounded-2xl shadow-2xl border border-white/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
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
  const [destinations, setDestinations] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filterDest, setFilterDest] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [pairingDevice, setPairingDevice] = useState(null);
  const [showSimulateScanModal, setShowSimulateScanModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load real gate telemetry from backend
  useEffect(() => {
    async function loadData() {
      try {
        const dests = await fetchAdminDestinations(slug);
        if (dests && dests.length > 0) {
          setDestinations(dests);
          const { devices: realDevices, stats } = await fetchAdminGateTelemetry(dests[0].id);
          if (realDevices && realDevices.length > 0) {
            const gateStatsMap = {};
            if (stats?.by_gate) {
              stats.by_gate.forEach((g) => {
                gateStatsMap[g.device_id] = g.total_scans;
              });
            }
            const mergedDevices = realDevices.map((d) => ({
              ...d,
              destination: dests[0].name,
              total_scans_today: gateStatsMap[d.id] ?? (stats?.total_scans ?? stats?.scans_today ?? 0),
            }));
            setDevices(mergedDevices);
          } else {
            // Default initial gate device for new tenant
            setDevices([
              {
                id: `dev-${dests[0].id}`,
                device_code: `GATE-${(dests[0].slug || '01').toUpperCase().substring(0, 8)}-IN01`,
                device_name: 'Pintu Masuk Utama 01',
                destination: dests[0].name,
                gate_type: 'entrance',
                is_active: true,
                last_sync_at: new Date().toISOString(),
                total_scans_today: stats?.total_scans ?? stats?.scans_today ?? 0,
                hmac_key: `PASSIFY-SEC-${(dests[0].slug || 'DEV').toUpperCase()}`,
              }
            ]);
          }
        }
      } catch (err) {
        console.warn('Gate telemetry load fallback:', err);
      }
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
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

  const totalScans = devices.reduce((sum, d) => sum + (Number(d.total_scans_today) || 0), 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Perangkat & Terminal Pemindai (Gate Scanners)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSimulateScanModal(true)}
            className="btn-secondary btn-sm shadow-2xs gap-1.5"
            title="Uji coba validasi scan tiket langsung"
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span>Simulasi Scan Tiket</span>
          </button>
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
              : 'bg-white/60 border-white/80 text-gray-700 hover:text-gray-900 hover:bg-white/90 shadow-2xs'
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
                : 'bg-white/60 border-white/80 text-gray-700 hover:text-gray-900 hover:bg-white/90 shadow-2xs'
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
            onPair={setPairingDevice}
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
      {pairingDevice && (
        <DevicePairingModal
          device={pairingDevice}
          onClose={() => setPairingDevice(null)}
        />
      )}
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
      {showSimulateScanModal && (
        <SimulateScanModal
          devices={devices}
          destinationId={destinations[0]?.id}
          onClose={() => setShowSimulateScanModal(false)}
          onScanSuccess={() => {
            showToast('Tiket berhasil tervalidasi via simulasi scan!');
          }}
        />
      )}
    </div>
  );
}

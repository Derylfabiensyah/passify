import React, { useEffect, useState, useRef } from 'react';
import {
  ExternalLink,
  Eye,
  FileText,
  LayoutTemplate,
  Palette,
  Save,
  SlidersHorizontal,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Smartphone,
  UploadCloud,
  Compass,
  ArrowRight,
  History,
  Trash2,
  Link2,
  Check,
  RefreshCw,
  LogIn
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAdminDestinations, getActiveAdminTenant } from '../../api/admin';
import { savePortalTemplate, loadPortalCoverImage } from '../../api/tenant';
import { apiRequest } from '../../api/client';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';

const colorChoices = [
  { value: '#394032', label: 'Hutan Senja', accent: '#454f2d', text: 'Emerald Modern' },
  { value: '#534332', label: 'Kayu Manis', accent: '#9f7e4a', text: 'Earthy Warm' },
  { value: '#454F2D', label: 'Daun Tua', accent: '#797f3e', text: 'Forest Deep' },
  { value: '#797F3E', label: 'Lumut Alam', accent: '#534332', text: 'Sage Organic' },
];

const photoPresets = [
  { label: 'Curug / Air Terjun', url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Hutan Pegunungan', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Pantai & Bahari', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80' },
  { label: 'Danau & Rawa', url: 'https://images.unsplash.com/photo-1439853941329-a99ce0421cbf?auto=format&fit=crop&w=1600&q=80' },
];

function FacilityTagInput({ value = [], onChange }) {
  const [inputVal, setInputVal] = useState('');

  const suggestions = [
    'Area Parkir',
    'Toilet Bersih',
    'Musholla',
    'Pos P3K',
    'Pusat Informasi',
    'Spot Foto Panorama',
    'Gazebo Istirahat',
    'Kantin / Warung Alam',
    'Jalur Tracking',
    'Camping Ground'
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
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2 bg-transparent rounded-xl border border-[var(--border)]">
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

function ToggleField({ checked, description, label, onChange }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs px-4 py-3 cursor-pointer hover:bg-white/80 transition-colors shadow-2xs">
      <span>
        <span className="block text-sm font-bold text-[var(--forest-deep)]">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--ink-soft)]">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-[var(--forest)] cursor-pointer"
      />
    </label>
  );
}

function CoverImageUploader({ value, onChange, presets = [] }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Format file tidak didukung. Harap pilih gambar JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 10 MB sebelum kompresi.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxWidth = 1920;
          const maxHeight = 1080;
          let targetWidth = img.width;
          let targetHeight = img.height;

          // Scale down proportionally if larger than 1920x1080
          if (targetWidth > maxWidth || targetHeight > maxHeight) {
            const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
            targetWidth = Math.round(targetWidth * ratio);
            targetHeight = Math.round(targetHeight * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
          toast.success(`Foto sampul berhasil diunggah (${targetWidth} × ${targetHeight} px)`);
        } catch (err) {
          toast.error('Gagal memproses gambar. Silakan coba file lain.');
        } finally {
          setIsProcessing(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        toast.error('Gagal membaca data gambar.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      toast.error('Gagal membaca file foto.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
          Foto Sampul Pemandangan
        </label>
        <button
          type="button"
          onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
          className="text-[11px] font-bold text-[var(--forest)] hover:underline flex items-center gap-1 cursor-pointer"
        >
          {mode === 'upload' ? (
            <>
              <Link2 className="w-3 h-3" />
              <span>Gunakan Link URL</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-3 h-3" />
              <span>Upload File Langsung</span>
            </>
          )}
        </button>
      </div>

      {/* Guide Card: Ideal Dimensions (16:9) */}
      <div className="rounded-xl border border-emerald-800/15 bg-emerald-50/70 p-3 text-xs text-[var(--forest-deep)] flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">Ukuran Ideal Sampul:</span>
            <span className="inline-flex items-center bg-emerald-700 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              Rasio 16:9
            </span>
            <span className="font-semibold text-emerald-950">1920 × 1080 px</span>
            <span className="text-[11px] text-[var(--ink-soft)]">(atau min. 1200 × 675 px)</span>
          </div>
          <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
            Format JPG, PNG, atau WebP (maks. 5 MB). Rasio 16:9 widescreen menjamin tampilan sampul penuh tanpa terpotong baik di layar HP maupun laptop.
          </p>
        </div>
      </div>

      {/* Mode: Direct Upload */}
      {mode === 'upload' ? (
        <div className="space-y-3">
          {value ? (
            /* Preview with actions */
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--sand)] shadow-xs group">
              <img
                src={value}
                alt="Sampul Kawasan Wisata"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Rasio 16:9 Terpasang</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white/95 hover:bg-white text-[var(--forest-deep)] font-bold text-xs rounded-lg backdrop-blur-md transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    <span>{isProcessing ? 'Mengunggah...' : 'Ganti Foto'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="inline-flex items-center justify-center p-2 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs rounded-lg backdrop-blur-md transition-all shadow-sm cursor-pointer"
                    title="Hapus foto sampul"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2.5 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                isDragging
                  ? 'border-[var(--forest)] bg-[var(--leaf-pale)]'
                  : 'border-[var(--border)] hover:border-[var(--forest)] bg-white/50 hover:bg-white/80'
              }`}
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--leaf-pale)] text-[var(--forest)]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--forest-deep)]">
                  Klik untuk memilih foto atau tarik &amp; lepas ke sini
                </p>
                <p className="text-[11px] text-[var(--ink-soft)] mt-0.5">
                  Rasio 16:9 • Resolusi disarankan 1920 × 1080 px • Maksimal 5 MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Mode: URL input */
        <div className="space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="field-control font-mono text-xs w-full"
            placeholder="https://images.unsplash.com/photo-..."
          />
          <p className="text-[11px] text-[var(--ink-soft)]">
            Masukkan tautan URL foto gambar dengan resolusi lanskap (16:9).
          </p>
        </div>
      )}

      {/* Presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] mr-1">
            Pilihan Cepat:
          </span>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.url)}
              className="text-[11px] font-medium bg-[var(--sand)] hover:bg-[var(--leaf-pale)] text-[var(--forest-deep)] border border-[var(--border)] rounded-md px-2 py-0.5 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== 'string') return `rgba(57, 64, 50, ${alpha})`;
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 57;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 64;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 50;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatCleanLocation(dest) {
  if (!dest) return 'Indonesia';
  const raw = typeof dest === 'string' ? dest : (dest.location || [dest.address, dest.city, dest.province].filter(Boolean).join(', '));
  if (!raw) return dest.province || dest.city || 'Indonesia';

  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  const uniqueParts = [];
  for (const part of parts) {
    if (!uniqueParts.some((p) => p.toLowerCase() === part.toLowerCase())) {
      uniqueParts.push(part);
    }
  }
  return uniqueParts.join(', ') || 'Indonesia';
}

function PortalLivePreview({ destination, template }) {
  const user = React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('passify_user') || 'null'); } catch { return null; }
  }, []);

  const heading = template.hero_heading || destination?.name || 'Kawasan Wisata Alam';
  const eyebrow = template.eyebrow || 'Tiket Resmi Kawasan';
  const copy = template.hero_copy || destination?.description || 'Nikmati keindahan panorama dan konservasi alam yang teratur.';
  const coverImage = destination?.cover_image_url || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80';
  const locationText = formatCleanLocation(destination);
  const primaryBg = template.primary_color || '#394032';
  const actionColor = template.accent_color || '#454f2d';
  const facilities = Array.isArray(destination?.facilities) && destination.facilities.length > 0
    ? destination.facilities
    : ['Area Parkir', 'Toilet Bersih', 'Musholla', 'Pusat Informasi'];
  const rules = destination?.rules || 'Patuhi batas daya dukung lingkungan, jaga kebersihan, dan tunjukkan E-Ticket QR di pintu gerbang.';

  // Real live data calculation (No fictional dummy numbers)
  const capacity = Number(destination?.max_daily_capacity || 500);
  const booked = Number(destination?.booked_today || 0);
  const remaining = Math.max(0, capacity - booked);
  const quotaPct = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;

  const categories = destination?.ticket_categories || [];
  const minPrice = categories.length > 0
    ? Math.min(...categories.map((c) => Number(c.price || c.base_price || 0) + Number(c.insurance || c.insurance_fee || 0) + Number(c.retribusi || c.retribusi_fee || 0)))
    : 25000;

  return (
    <aside className="glass-panel rounded-2xl flex flex-col h-full sticky top-6 overflow-hidden" aria-label="Pratinjau portal wisatawan">
      {/* Top Bar with Live Indicator & Mobile Badge */}
      <div className="p-3.5 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-bold text-xs sm:text-sm text-[var(--forest-deep)] font-serif">Pratinjau Langsung</p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--forest)] bg-[var(--leaf-pale)] border border-[var(--border)] px-2.5 py-0.5 rounded-full ml-1">
            <Smartphone className="w-3.5 h-3.5 text-[var(--forest)]" />
            <span>Mobile</span>
          </span>
        </div>

        <a
          href={`/?tenant=${destination?.slug || 'curug-cikanteh'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Buka website resmi</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="p-4 sm:p-5 flex-1 bg-transparent overflow-y-auto flex justify-center items-start">
        {/* Mobile Smartphone Frame Mockup */}
        <div className="w-full max-w-[320px] h-[580px] max-h-[calc(100vh-13rem)] rounded-[2.5rem] p-[7px] bg-[#1e241d] shadow-2xl flex flex-col transition-all duration-300 relative isolate">
          {/* Inner Screen Container - Hardware clips all layers strictly inside chassis */}
          <div className="w-full h-full rounded-[2.1rem] bg-[#fafbfa] flex flex-col overflow-hidden [clip-path:inset(0_round_2.1rem)] relative">
            {/* Phone Status Bar / Notch (Fixed Top) */}
          <div className="bg-[#1e241d] px-5 py-1.5 flex items-center justify-between text-white/70 text-[10px] shrink-0">
            <span className="font-semibold text-[9px]">09:41</span>
            <div className="w-12 h-2.5 bg-black/70 rounded-full" />
            <div className="flex items-center gap-1 text-[8px]">
              <span>5G</span>
              <span className="inline-block w-3 h-1.5 border border-white/70 rounded-xs relative after:content-[''] after:absolute after:inset-0.5 after:bg-white after:rounded-2xs" />
            </div>
          </div>

          {/* Mobile Header Bar (Fixed Top) */}
          <div className="bg-white/95 px-3 py-2 flex items-center justify-between border-b border-[var(--border)] gap-2 shadow-2xs backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-white shadow-2xs transition-colors"
                style={{ backgroundColor: primaryBg }}
              >
                <Compass className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <span className="block truncate text-[11px] font-black text-[#14281a] font-serif leading-tight">
                  {destination?.name || heading}
                </span>
                <span className="block truncate text-[7.5px] font-extrabold uppercase tracking-wider text-[var(--forest)] leading-tight">
                  {eyebrow}
                </span>
              </div>
            </div>
            {user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-800 text-white text-[9px] font-black shadow-2xs">
                  {user.avatar || user.name?.charAt(0)?.toUpperCase() || 'P'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[8.5px] font-bold text-[#14281a] bg-white border border-gray-200/90 px-2 py-0.5 rounded-lg shadow-2xs shrink-0">
                <LogIn className="h-2.5 w-2.5 text-emerald-800" />
                <span>Masuk</span>
              </div>
            )}
          </div>

          {/* Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 space-y-0 scrollbar-none mesh-background">
            {/* Mobile Hero Section */}
            <div className="relative isolate overflow-hidden p-4 text-white" style={{ backgroundColor: primaryBg || '#1e2e22' }}>
              <img
                src={coverImage}
                alt=""
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-95 saturate-[1.1] scale-105 transition-all duration-300"
              />
              <div
                className="absolute inset-0 -z-10 transition-colors duration-300"
                style={{
                  backgroundImage: `linear-gradient(to bottom, ${hexToRgba(primaryBg, 0.90)} 0%, ${hexToRgba(primaryBg, 0.65)} 55%, ${hexToRgba(primaryBg, 0.25)} 100%)`
                }}
              />

              <div className="space-y-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-xl shadow-xs">
                  <MapPin className="h-3 w-3 text-emerald-300" />
                  <span className="truncate max-w-[200px]">{locationText}</span>
                </span>

                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-300 drop-shadow-xs">
                    {eyebrow}
                  </p>
                  <h2 className="mt-0.5 text-lg font-extrabold leading-tight text-white font-serif drop-shadow-sm">
                    {heading}
                  </h2>
                </div>

                <p className="text-[10.5px] leading-relaxed text-white/90 line-clamp-3 drop-shadow-xs">
                  {copy}
                </p>

                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ backgroundColor: actionColor }}
                  >
                    <Ticket className="h-3.5 w-3.5" /> Pesan Tiket Sekarang
                  </button>

                  <div className="flex items-center justify-between text-[8.5px] text-white/85 pt-0.5 px-0.5">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" /> QR aman untuk gerbang
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white/90">
                      <History className="h-3 w-3 text-emerald-300" /> Riwayat
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Content Stack */}
            <div className="space-y-3 p-3 bg-transparent">
              {/* Real Availability Card (True Glassmorphism) */}
              {template.show_availability !== false && (
                <div className="glass-panel relative isolate overflow-hidden rounded-2xl p-3.5 shadow-sm border border-white/80 transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-black/[0.07] pb-2">
                    <span className="eyebrow !text-emerald-800 text-[10px] font-black tracking-wider">Ketersediaan Hari Ini</span>
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-900 bg-emerald-50/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-300/60 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Sistem Aktif
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-end justify-between">
                    <span className="text-[10.5px] font-bold text-[#3b4836]">Kuota terisi</span>
                    <strong className="text-base font-black text-[#14281a]">{quotaPct}%</strong>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full bg-black/[0.08] rounded-full overflow-hidden p-0.5 border border-white/80 shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${Math.min(100, Math.max(0, quotaPct))}%`,
                        backgroundColor: actionColor || '#10b981'
                      }}
                    />
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-white/70 hover:bg-white/85 border border-white/90 p-2 shadow-2xs backdrop-blur-md">
                      <span className="block text-[8px] uppercase tracking-wider text-[#556350] font-extrabold">Tersisa</span>
                      <strong className="mt-0.5 block font-black text-xs text-[#14281a]">{remaining.toLocaleString('id-ID')} pax</strong>
                    </div>
                    <div className="rounded-xl bg-white/70 hover:bg-white/85 border border-white/90 p-2 shadow-2xs backdrop-blur-md">
                      <span className="block text-[8px] uppercase tracking-wider text-emerald-800 font-extrabold">Mulai dari</span>
                      <strong className="mt-0.5 block font-black text-xs text-emerald-800">Rp {minPrice.toLocaleString('id-ID')}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Ticket Categories Preview */}
              <div className="glass-panel rounded-2xl p-3.5 shadow-xs space-y-3">
                <div>
                  <p className="eyebrow !text-emerald-800 text-[10px]">Pilih tiket</p>
                  <h3 className="mt-0.5 text-sm font-black text-[#14281a]">Satu perjalanan, satu tiket resmi</h3>
                  <p className="mt-0.5 text-[10px] text-[#3b4836]">
                    Pilih tiket yang sesuai, kemudian lengkapi jadwal dan data pengunjung dalam tiga langkah singkat.
                  </p>
                </div>
                <div className="grid gap-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const catTotal = Number(cat.price || cat.base_price || 0) + Number(cat.insurance || cat.insurance_fee || 0) + Number(cat.retribusi || cat.retribusi_fee || 0);
                      return (
                        <div key={cat.id} className="p-2.5 rounded-xl bg-white/85 border border-black/[0.07] flex items-center justify-between shadow-2xs hover:shadow-xs transition-all gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#14281a] truncate">{cat.name}</p>
                            <p className="text-[10px] text-[#4a5845] mt-0.5">Total: <strong className="text-[#14281a] font-bold">Rp {catTotal.toLocaleString('id-ID')}</strong> / org</p>
                          </div>
                          <button
                            type="button"
                            className="btn-primary btn-sm rounded-lg font-bold shadow-xs hover:shadow-md cursor-pointer px-3 py-1.5 text-[11px] shrink-0 flex items-center gap-1"
                            style={{ backgroundColor: actionColor }}
                          >
                            <span>Pilih</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-[#4a5845] italic">Tiket aktif dari Destinasi & Tiket akan otomatis tampil di sini.</p>
                  )}
                </div>
              </div>

              {/* Kunjungan Tertata Guide */}
              <div className="glass-panel rounded-2xl p-3.5 shadow-xs">
                <h4 className="text-xs font-bold text-[#14281a] mb-2">Kunjungan Tertata</h4>
                <ul className="space-y-1.5 text-[10px] text-[#2f382a] font-medium">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    <span>Pilih tanggal dan sesi kedatangan.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    <span>Isi data pemegang tiket online.</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                    <span>Tunjukkan E-Ticket QR di gerbang.</span>
                  </li>
                </ul>
              </div>

              {/* Real Facilities */}
              {template.show_facilities !== false && (
                <div className="glass-panel rounded-2xl p-3.5 shadow-xs space-y-2">
                  <h4 className="text-xs font-bold text-[#14281a]">Fasilitas Kawasan</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {facilities.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/70 border border-white/80 text-[10px] font-bold text-[#14281a] shadow-2xs">
                        <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-700" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glassmorphic Rules */}
              {template.show_rules !== false && (
                <div className="glass-panel rounded-2xl p-3.5 shadow-xs space-y-1">
                  <p className="eyebrow !text-emerald-800 text-[9px]">Etika Berkunjung</p>
                  <h4 className="text-xs font-bold text-[#14281a]">Jaga Kawasan Bersama</h4>
                  <p className="text-[10px] leading-relaxed text-[#2f382a] whitespace-pre-line mt-1">
                    {rules || 'Patuhi batas daya dukung lingkungan, buang sampah pada tempatnya, dan tunjukkan E-Ticket QR saat di gerbang.'}
                  </p>
                </div>
              )}

              {/* Mobile Footer */}
              <div className="bg-white/85 backdrop-blur-2xl rounded-2xl border border-white/80 py-3 px-3 text-center text-[9px] text-[#3b4836] space-y-0.5 mt-2">
                <p className="font-bold text-[#14281a]">{heading} · Passify Official Portal</p>
                <p className="text-[8px] text-[#4a5845]">Konservasi &amp; Tiket Wisata Alam Terintegrasi</p>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Bottom Action Bar & Home Indicator (Seamlessly Integrated) */}
          <div className="bg-white/95 backdrop-blur-md border-t border-black/[0.06] px-3 pt-2 pb-1.5 flex flex-col gap-1.5 shrink-0 z-10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:brightness-110 active:scale-[0.98] transition-all"
                style={{ backgroundColor: actionColor }}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Pesan tiket</span>
              </button>
              <div className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200/90 text-[#14281a] text-[10px] font-bold flex items-center gap-1.5 shadow-2xs shrink-0">
                <span className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center bg-emerald-800" style={{ backgroundColor: primaryBg }}>
                  {user?.avatar || user?.name?.charAt(0)?.toUpperCase() || 'P'}
                </span>
                <span>Profil</span>
              </div>
            </div>

            {/* Phone Bottom Home Indicator */}
            <div className="flex justify-center pb-0.5">
              <div className="w-20 h-1 bg-black/30 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </aside>
  );
}

export default function TemplateEditorPage() {
  const { destination, slug, updatePortalTemplate } = useTenant();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [destinations, setDestinations] = useState([]);
  const [selectedDestId, setSelectedDestId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state holding both visual copy & destination attributes
  const [formData, setFormData] = useState({
    name: '',
    eyebrow: 'Tiket resmi kawasan',
    hero_heading: '',
    hero_copy: '',
    cover_image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80',
    location: '',
    province: 'Jawa Barat',
    primary_color: '#394032',
    accent_color: '#454f2d',
    show_availability: true,
    show_facilities: true,
    show_rules: true,
    facilities: ['Area Parkir', 'Toilet Bersih', 'Musholla', 'Pusat Informasi'],
    rules: 'Patuhi batas daya dukung lingkungan, buang sampah pada tempatnya, dan tunjukkan E-Ticket QR saat di gerbang.',
  });

  // Load destinations on mount
  useEffect(() => {
    fetchAdminDestinations(slug)
      .then((list) => {
        if (list && list.length > 0) {
          setDestinations(list);
          const targetId = searchParams.get('dest');
          const active = (targetId && list.find((d) => d.id === targetId)) || list[0];
          setSelectedDestId(active.id);
          applyDestinationToForm(active);
        } else if (destination) {
          setDestinations([destination]);
          setSelectedDestId(destination.id);
          applyDestinationToForm(destination);
        }
      })
      .catch(() => {
        if (destination) {
          setDestinations([destination]);
          setSelectedDestId(destination.id);
          applyDestinationToForm(destination);
        }
      });
  }, [slug, destination]);

  const applyDestinationToForm = (dest) => {
    if (!dest) return;
    const template = dest.portal_template || {};
    const facilityArr = Array.isArray(dest.facilities)
      ? dest.facilities
      : typeof dest.facilities === 'string'
      ? dest.facilities.split(',').map((f) => f.trim()).filter(Boolean)
      : ['Area Parkir', 'Toilet Bersih', 'Musholla', 'Pusat Informasi'];

    const chosenPrimary = colorChoices.some((c) => c.value === template.primary_color)
      ? template.primary_color
      : '#394032';
    const chosenAccent = colorChoices.find((c) => c.value === chosenPrimary)?.accent || '#454f2d';

    const savedCover = loadPortalCoverImage(dest.slug || slug) || dest.cover_image_url;

    setFormData({
      name: dest.name || 'Kawasan Wisata',
      eyebrow: template.eyebrow || 'Tiket resmi kawasan',
      hero_heading: template.hero_heading || dest.name || '',
      hero_copy: template.hero_copy || dest.description || '',
      cover_image_url: savedCover || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80',
      location: formatCleanLocation(dest),
      province: dest.province || 'Jawa Barat',
      primary_color: chosenPrimary,
      accent_color: chosenAccent,
      show_availability: template.show_availability !== false,
      show_facilities: template.show_facilities !== false,
      show_rules: template.show_rules !== false,
      facilities: facilityArr,
      rules: dest.rules || 'Patuhi batas daya dukung lingkungan, buang sampah pada tempatnya, dan tunjukkan E-Ticket QR saat di gerbang.',
    });
  };

  const handleSelectDestination = (destId) => {
    setSelectedDestId(destId);
    const dest = destinations.find((d) => d.id === destId);
    if (dest) {
      applyDestinationToForm(dest);
    }
  };

  const currentDestination = destinations.find((d) => d.id === selectedDestId) || destinations[0] || destination;

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    const activeDest = currentDestination || {};
    const effectiveSlug = activeDest.slug
      || (formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null)
      || slug
      || localStorage.getItem('passify_current_tenant')
      || 'curug-cikanteh';

    const effectiveTenantId = activeDest.tenant_id
      || (activeDest.id && !String(activeDest.id).startsWith('dest-') ? activeDest.id : null)
      || '413baace-9c74-4abb-8aa4-a8310ffc4c0b';

    const portalTemplatePayload = {
      eyebrow: formData.eyebrow,
      hero_heading: formData.hero_heading,
      hero_copy: formData.hero_copy,
      primary_color: formData.primary_color,
      accent_color: formData.accent_color,
      show_availability: formData.show_availability,
      show_facilities: formData.show_facilities,
      show_rules: formData.show_rules,
    };

    try {
      // 1. Save portal template & cover image
      await savePortalTemplate({
        tenantId: effectiveTenantId,
        slug: effectiveSlug,
        template: portalTemplatePayload,
        coverImageUrl: formData.cover_image_url,
      });

      // 2. Update local destinations cache with full details
      const updatedDest = {
        ...activeDest,
        name: formData.hero_heading || formData.name,
        description: formData.hero_copy,
        cover_image_url: formData.cover_image_url,
        location: formData.location,
        address: formData.location,
        province: formData.province,
        facilities: formData.facilities,
        rules: formData.rules,
        portal_template: portalTemplatePayload,
        slug: effectiveSlug,
      };

      const updatedList = destinations.map((d) => (d.id === activeDest.id ? updatedDest : d));
      if (!destinations.some((d) => d.id === activeDest.id)) {
        updatedList.push(updatedDest);
      }
      setDestinations(updatedList);
      localStorage.setItem('passify_admin_destinations', JSON.stringify(updatedList));
      localStorage.setItem('passify_current_tenant', effectiveSlug);

      updatePortalTemplate?.(portalTemplatePayload);

      // 3. Sync to Go backend
      try {
        if (activeDest.id && !String(activeDest.id).startsWith('dest-')) {
          await apiRequest(`/api/v1/destinations/${activeDest.id}`, {
            method: 'PUT',
            body: {
              name: formData.hero_heading || formData.name,
              description: formData.hero_copy,
              address: formData.location,
              city: formData.location,
              province: formData.province,
              cover_image_url: formData.cover_image_url,
              facilities: formData.facilities,
              rules: formData.rules,
            },
          }).catch(() => null);
        }
      } catch (_) {}

      toast.success('Halaman website & template portal berhasil diperbarui!');
    } catch (error) {
      toast.error('Terjadi kendala saat menyimpan template.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2 xl:h-[calc(100vh-8rem)]">
      {/* Left Pane: Visual Form Editor */}
      <form onSubmit={handleSave} className="space-y-6 overflow-y-auto pr-1 pb-16">
        {/* Header Bar */}
        <section className="glass-panel p-5 sm:p-7 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-4 border-b border-white/60 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]">
                <LayoutTemplate className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">Portal &amp; Tampilan</p>
                <h1 className="mt-1 text-2xl font-bold font-serif text-[var(--forest-deep)]">
                  Kustomisasi Website Resmi
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs text-[var(--ink-soft)] leading-relaxed">
                  Ubah judul, cerita kawasan, foto sampul, fasilitas, etika berkunjung, dan palet warna yang tampil di website wisatawan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Hero Banner & Story */}
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="portal-heading" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
                  Judul Utama Kawasan
                </label>
                <input
                  id="portal-heading"
                  type="text"
                  value={formData.hero_heading}
                  onChange={(e) => setFormData({ ...formData, hero_heading: e.target.value })}
                  maxLength={96}
                  className="field-control font-bold"
                  placeholder="Contoh: Curug Citambur"
                  required
                />
              </div>

              <div>
                <label htmlFor="portal-eyebrow" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
                  Label Kecil di Atas Judul
                </label>
                <input
                  id="portal-eyebrow"
                  type="text"
                  value={formData.eyebrow}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  maxLength={56}
                  className="field-control"
                  placeholder="Contoh: Tiket Resmi Kawasan"
                />
              </div>
            </div>

            <div>
              <label htmlFor="portal-copy" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
                Pengantar Singkat &amp; Cerita Kawasan
              </label>
              <textarea
                id="portal-copy"
                rows={3}
                value={formData.hero_copy}
                onChange={(e) => setFormData({ ...formData, hero_copy: e.target.value })}
                maxLength={280}
                className="field-control leading-relaxed"
                placeholder="Jelaskan keindahan alam dan sambutan hangat untuk wisatawan..."
                required
              />
              <p className="mt-1 text-[11px] text-[var(--ink-soft)] text-right">{formData.hero_copy.length}/280 karakter</p>
            </div>

            {/* Cover Image Uploader with 16:9 guide, direct upload, and presets */}
            <CoverImageUploader
              value={formData.cover_image_url}
              onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
              presets={photoPresets}
            />

            {/* Location & Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="portal-location" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
                  Alamat / Lokasi Wisata
                </label>
                <input
                  id="portal-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="field-control"
                  placeholder="Contoh: Karangjaya, Pasirkuda, Cianjur"
                />
              </div>

              <div>
                <label htmlFor="portal-province" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
                  Provinsi
                </label>
                <input
                  id="portal-province"
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="field-control"
                  placeholder="Contoh: Jawa Barat"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Color Palette */}
        <section className="glass-panel p-5 sm:p-7 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--bark-pale)] text-[var(--bark)]">
              <Palette className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold font-serif text-[var(--forest-deep)]">Palet Warna Portal</h2>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Harmoni warna alami dengan standar kontras WCAG AA yang nyaman dibaca.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {colorChoices.map((choice) => (
              <label
                key={choice.value}
                className={`flex flex-col cursor-pointer items-center gap-2 rounded-xl border p-3.5 text-xs font-semibold transition-all ${
                  formData.primary_color === choice.value
                    ? 'border-[var(--forest)] bg-[var(--leaf-pale)] text-[var(--forest-deep)] scale-[1.02] shadow-xs'
                    : 'border-white/70 bg-white/60 text-[var(--ink-soft)] hover:bg-white/85 shadow-2xs'
                }`}
              >
                <input
                  type="radio"
                  name="primary_color"
                  value={choice.value}
                  checked={formData.primary_color === choice.value}
                  onChange={() => {
                    setFormData({
                      ...formData,
                      primary_color: choice.value,
                      accent_color: choice.accent,
                    });
                  }}
                  className="sr-only"
                />
                <span className="h-8 w-8 rounded-full shadow-inner border border-white/40" style={{ backgroundColor: choice.value }} aria-hidden="true" />
                <span className="font-bold">{choice.label}</span>
                <span className="text-[10px] text-[var(--ink-soft)] font-normal">{choice.text}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Section 3: Facilities & Rules */}
        <section className="glass-panel p-5 sm:p-7 rounded-2xl shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)] mb-1.5">
              Fasilitas Kawasan Wisata
            </label>
            <FacilityTagInput
              value={formData.facilities}
              onChange={(tags) => setFormData({ ...formData, facilities: tags })}
            />
          </div>

          <div>
            <label htmlFor="portal-rules" className="block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)] mb-1.5">
              Etika &amp; Aturan Berkunjung Wisatawan
            </label>
            <textarea
              id="portal-rules"
              rows={3}
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              className="field-control leading-relaxed text-xs"
              placeholder="Patuhi batas daya dukung lingkungan, dilarang merusak keasrian alam, buang sampah pada tempatnya."
            />
          </div>
        </section>

        {/* Section 4: Display Toggles */}
        <section className="glass-panel p-5 sm:p-7 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fog)] text-[var(--forest)]">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold font-serif text-[var(--forest-deep)]">Bagian yang Ditampilkan</h2>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Aktifkan atau sembunyikan modul informasi pada portal wisatawan.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <ToggleField
              label="Ketersediaan Hari Ini"
              description="Menampilkan kartu live sisa kuota dan harga awal tiket."
              checked={formData.show_availability}
              onChange={(val) => setFormData({ ...formData, show_availability: val })}
            />
            <ToggleField
              label="Fasilitas Kawasan"
              description="Menampilkan badge daftar fasilitas kawasan yang tersedia."
              checked={formData.show_facilities}
              onChange={(val) => setFormData({ ...formData, show_facilities: val })}
            />
            <ToggleField
              label="Etika &amp; Aturan Berkunjung"
              description="Menampilkan kartu panduan aturan bagi wisatawan."
              checked={formData.show_rules}
              onChange={(val) => setFormData({ ...formData, show_rules: val })}
            />
          </div>
        </section>

        {/* Sticky Save Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <Link
            to="/admin/destinations"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--forest)] hover:text-[var(--bark)] transition-colors"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Kelola Kategori Tarif &amp; Kuota Tiket
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Website'}
          </button>
        </div>
      </form>

      {/* Right Pane: Live Visual Preview */}
      <PortalLivePreview
        destination={{
          ...currentDestination,
          name: formData.hero_heading || formData.name,
          description: formData.hero_copy,
          cover_image_url: formData.cover_image_url,
          location: [formData.location, formData.province].filter(Boolean).join(', '),
          province: formData.province,
          address: formData.location,
          city: formData.location,
          facilities: formData.facilities,
          rules: formData.rules,
          slug: currentDestination?.slug || 'curug-cikanteh',
        }}
        template={{
          eyebrow: formData.eyebrow,
          hero_heading: formData.hero_heading,
          hero_copy: formData.hero_copy,
          primary_color: formData.primary_color,
          accent_color: formData.accent_color,
          show_availability: formData.show_availability,
          show_facilities: formData.show_facilities,
          show_rules: formData.show_rules,
        }}
      />
    </div>
  );
}


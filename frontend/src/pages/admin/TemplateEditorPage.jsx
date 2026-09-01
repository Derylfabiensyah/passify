import React, { useEffect, useState } from 'react';
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
  Ticket
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchAdminDestinations, getActiveAdminTenant } from '../../api/admin';
import { savePortalTemplate } from '../../api/tenant';
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
      <div className="flex flex-wrap gap-1.5 min-h-[42px] p-2 bg-[var(--canvas)] rounded-xl border border-[var(--border)]">
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
    <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--sand)] px-4 py-3 cursor-pointer hover:bg-[var(--canvas)] transition-colors">
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

function PortalLivePreview({ destination, template }) {
  const heading = template.hero_heading || destination?.name || 'Kawasan Wisata Alam';
  const eyebrow = template.eyebrow || 'Tiket Resmi Kawasan';
  const copy = template.hero_copy || destination?.description || 'Nikmati keindahan panorama dan konservasi alam yang teratur.';
  const coverImage = destination?.cover_image_url || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80';
  const locationText = destination?.location || [destination?.address, destination?.city, destination?.province].filter(Boolean).join(', ') || destination?.province || 'Indonesia';
  const primaryBg = template.primary_color || '#394032';
  const actionColor = template.accent_color || '#454f2d';
  const facilities = destination?.facilities && destination.facilities.length > 0
    ? destination.facilities
    : ['Area Parkir', 'Toilet Bersih', 'Musholla', 'Pusat Informasi'];
  const rules = destination?.rules || 'Patuhi batas daya dukung lingkungan, jaga kebersihan, dan tunjukkan E-Ticket QR di pintu gerbang.';

  return (
    <aside className="glass-panel rounded-2xl flex flex-col h-full sticky top-6 overflow-hidden" aria-label="Pratinjau portal wisatawan">
      <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="font-bold text-sm text-[var(--forest-deep)]">Pratinjau Langsung Website</p>
        </div>
        <a
          href={`/?tenant=${destination?.slug || 'curug-citambur'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[var(--forest)] hover:underline flex items-center gap-1"
        >
          <span>Buka di tab baru</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="p-5 flex-1 bg-[var(--canvas)] overflow-y-auto flex justify-center">
        {/* Mobile Viewport Simulation */}
        <div className="w-full max-w-[360px] h-fit overflow-hidden rounded-[2.5rem] border-[6px] border-white shadow-2xl bg-[var(--sand)]">
          {/* Hero Section */}
          <div className="relative isolate overflow-hidden p-5 text-white" style={{ backgroundColor: primaryBg }}>
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 -z-20 h-full w-full object-cover object-center brightness-75 scale-105 transition-all duration-300"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/55 to-black/85" />

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                <MapPin className="h-3 w-3 text-emerald-300" />
                <span className="truncate max-w-[200px]">{locationText}</span>
              </span>

              <p className="mt-3 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                {eyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold leading-tight text-white font-serif">
                {heading}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-white/90 line-clamp-3">
                {copy}
              </p>

              <button
                type="button"
                className="mt-4 w-full min-h-10 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2"
                style={{ backgroundColor: actionColor }}
              >
                <Ticket className="h-3.5 w-3.5" /> Pesan Tiket Sekarang
              </button>
            </div>
          </div>

          {/* Body Sections */}
          <div className="space-y-3.5 p-4 bg-[var(--canvas)]">
            {/* Availability Card */}
            {template.show_availability !== false && (
              <div className="rounded-2xl bg-[var(--forest-deep)]/95 border border-white/15 p-3.5 text-white shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Ketersediaan Hari Ini</span>
                  <span className="text-[8px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">Sistem Aktif</span>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-[10px] text-white/70">Kuota terisi</span>
                  <strong className="text-lg font-extrabold text-white">42%</strong>
                </div>
                <div className="mt-1 h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full w-[42%]" />
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-white/10 p-1.5 border border-white/10">
                    <span className="block text-[8px] uppercase tracking-wider text-white/60">Tersisa</span>
                    <span className="font-extrabold text-xs text-white">580 pax</span>
                  </div>
                  <div className="rounded-lg bg-white/10 p-1.5 border border-white/10">
                    <span className="block text-[8px] uppercase tracking-wider text-white/60">Mulai dari</span>
                    <span className="font-extrabold text-xs text-[#E8C58C]">Rp 35.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Facilities Preview */}
            {template.show_facilities !== false && (
              <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--forest-deep)] mb-2">Fasilitas Kawasan</p>
                <div className="flex flex-wrap gap-1">
                  {facilities.slice(0, 4).map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--canvas)] text-[var(--ink-soft)] px-2 py-1 rounded-md">
                      <CheckCircle2 className="h-3 w-3 text-[var(--forest)]" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rules Preview */}
            {template.show_rules !== false && (
              <div className="rounded-2xl bg-[var(--bark-pale)]/50 p-3.5 border border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--bark)] mb-1">Etika Berkunjung</p>
                <p className="text-[11px] leading-relaxed text-[var(--ink-soft)] italic">
                  "{rules}"
                </p>
              </div>
            )}
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

    setFormData({
      name: dest.name || 'Kawasan Wisata',
      eyebrow: template.eyebrow || 'Tiket resmi kawasan',
      hero_heading: template.hero_heading || dest.name || '',
      hero_copy: template.hero_copy || dest.description || '',
      cover_image_url: dest.cover_image_url || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80',
      location: dest.location || [dest.address, dest.city].filter(Boolean).join(', ') || 'Cianjur, Jawa Barat',
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
      || 'curug-citambur';

    const effectiveTenantId = activeDest.tenant_id
      || (activeDest.id && !String(activeDest.id).startsWith('dest-') ? activeDest.id : null)
      || '002bdabd-c79d-40b4-b624-4fbcdc31d390';

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
      // 1. Save portal template
      await savePortalTemplate({
        tenantId: effectiveTenantId,
        slug: effectiveSlug,
        template: portalTemplatePayload,
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
        <section className="card p-5 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
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

            {/* Cover Image & Presets */}
            <div>
              <label htmlFor="portal-cover-url" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--forest-deep)]">
                Foto Sampul Pemandangan (URL Gambar)
              </label>
              <div className="flex gap-2">
                <input
                  id="portal-cover-url"
                  type="url"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  className="field-control font-mono text-xs flex-1"
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                />
              </div>

              {/* Quick Presets */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] mr-1">
                  Pilihan Cepat:
                </span>
                {photoPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, cover_image_url: preset.url })}
                    className="text-[11px] font-medium bg-[var(--sand)] hover:bg-[var(--leaf-pale)] text-[var(--forest-deep)] border border-[var(--border)] rounded-md px-2 py-0.5 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

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
        <section className="card p-5 sm:p-7">
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
                    : 'border-[var(--border)] bg-[var(--sand)] text-[var(--ink-soft)] hover:bg-[var(--canvas)]'
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
        <section className="card p-5 sm:p-7 space-y-5">
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
        <section className="card p-5 sm:p-7">
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
          location: formData.location,
          province: formData.province,
          facilities: formData.facilities,
          rules: formData.rules,
          slug: currentDestination?.slug || 'curug-citambur',
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

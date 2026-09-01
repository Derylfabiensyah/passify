import React, { useEffect, useState } from 'react';
import { ExternalLink, Eye, FileText, LayoutTemplate, Palette, Save, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAdminDestinations } from '../../api/admin';
import { savePortalTemplate } from '../../api/tenant';
import { useTenant } from '../../contexts/TenantContext';
import { useToast } from '../../contexts/ToastContext';

const colorChoices = [
  { value: '#394032', label: 'Hutan senja', accent: '#454f2d' },
  { value: '#534332', label: 'Kayu manis', accent: '#9f7e4a' },
  { value: '#454F2D', label: 'Daun tua', accent: '#797f3e' },
  { value: '#797F3E', label: 'Lumut', accent: '#534332' },
];

function createTemplate(destination) {
  const template = destination?.portal_template || {};
  return {
    eyebrow: template.eyebrow || 'Tiket resmi kawasan',
    hero_heading: template.hero_heading || destination?.name || '',
    hero_copy: template.hero_copy || destination?.description || '',
    primary_color: colorChoices.some((color) => color.value === template.primary_color)
      ? template.primary_color
      : '#394032',
    accent_color: colorChoices.some((color) => color.value === template.primary_color)
      ? colorChoices.find(c => c.value === template.primary_color)?.accent
      : '#454f2d',
    show_availability: template.show_availability !== false,
    show_facilities: template.show_facilities !== false,
    show_rules: template.show_rules !== false,
  };
}

function ToggleField({ checked, description, label, onChange }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--sand)] px-4 py-3">
      <span>
        <span className="block text-sm font-bold text-[var(--forest-deep)]">{label}</span>
        <span className="mt-0.5 block text-xs text-[var(--ink-soft)]">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-[var(--forest)]"
      />
    </label>
  );
}

function PortalPreview({ destination, template }) {
  const fallbackName = destination?.name || 'Portal wisata Anda';
  const actionColor = template.accent_color || '#454f2d';

  return (
    <aside className="glass-panel rounded-2xl flex flex-col h-full sticky top-6" aria-label="Pratinjau portal wisatawan">
      <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-t-2xl">
        <div>
          <p className="font-bold text-sm text-[var(--forest-deep)]">Pratinjau Langsung</p>
          <p className="text-xs text-[var(--ink-soft)] mt-0.5">Tampilan portal wisatawan</p>
        </div>
        <Eye className="h-5 w-5 text-[var(--forest)]" aria-hidden="true" />
      </div>

      <div className="p-6 flex-1 bg-[var(--canvas)] overflow-y-auto rounded-b-2xl flex justify-center">
        {/* Mobile Frame Simulation */}
        <div className="w-full max-w-[375px] h-fit overflow-hidden rounded-[2.5rem] border-[8px] border-white shadow-2xl bg-[var(--sand)]">
          <div className="px-5 py-8 text-white text-center transition-colors duration-300" style={{ backgroundColor: template.primary_color }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80 mb-2">{template.eyebrow}</p>
            <h2 className="text-3xl font-extrabold leading-tight text-white mb-3">{template.hero_heading || fallbackName}</h2>
            <p className="text-sm leading-relaxed text-white/90 mb-6">{template.hero_copy || 'Tambahkan pengantar singkat untuk portal ini.'}</p>
            <button type="button" className="w-full min-h-12 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: actionColor }}>
              Pesan tiket sekarang
            </button>
          </div>

          <div className="space-y-4 p-5 bg-[var(--sand)] min-h-[300px]">
            {template.show_availability && (
              <div className="rounded-2xl bg-white shadow-sm border border-[var(--border)] p-4">
                <div className="h-4 w-1/2 bg-[var(--fog)] rounded-full mb-2"></div>
                <div className="h-3 w-3/4 bg-[var(--fog)] rounded-full"></div>
              </div>
            )}
            {template.show_facilities && (
              <div className="rounded-2xl bg-white shadow-sm border border-[var(--border)] p-4">
                <div className="h-4 w-1/3 bg-[var(--fog)] rounded-full mb-2"></div>
                <div className="h-3 w-full bg-[var(--fog)] rounded-full mb-1"></div>
                <div className="h-3 w-5/6 bg-[var(--fog)] rounded-full"></div>
              </div>
            )}
            {template.show_rules && (
              <div className="rounded-2xl bg-white shadow-sm border border-[var(--border)] p-4">
                <div className="h-4 w-1/4 bg-[var(--fog)] rounded-full mb-2"></div>
                <div className="h-3 w-full bg-[var(--fog)] rounded-full"></div>
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
  const [portal, setPortal] = useState(destination);
  const [template, setTemplate] = useState(() => createTemplate(destination));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (destination) {
      setPortal(destination);
      setTemplate(createTemplate(destination));
      return;
    }

    fetchAdminDestinations(slug)
      .then((destinations) => {
        const firstDestination = destinations[0] || null;
        setPortal(firstDestination);
        setTemplate(createTemplate(firstDestination));
      })
      .catch(() => setPortal(null));
  }, [destination, slug]);

  const updateTemplate = (field, value) => {
    setTemplate((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!portal?.slug) {
      toast.error('Destinasi tenant belum tersedia untuk disimpan.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await savePortalTemplate({
        tenantId: portal.tenant_id,
        slug: slug || portal.slug,
        template,
      });
      setPortal((current) => ({ ...current, portal_template: result.template }));
      updatePortalTemplate?.(result.template);
      toast.success(result.isSynced ? 'Template portal sudah diperbarui.' : 'Template tersimpan di perangkat ini.');
    } catch (error) {
      setPortal((current) => ({ ...current, portal_template: template }));
      updatePortalTemplate?.(template);
      toast.info(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!portal) {
    return (
      <div className="card p-6">
        <h1 className="text-xl font-bold">Template portal belum tersedia</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">Tambahkan destinasi terlebih dahulu agar portal dapat dikustomisasi.</p>
        <Link to="/admin/destinations" className="btn-primary mt-5">Kelola destinasi</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2 xl:h-[calc(100vh-8rem)]">
      <form onSubmit={handleSave} className="space-y-6 overflow-y-auto pr-2">
        <section className="card p-5 sm:p-7">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--leaf-pale)] text-[var(--forest)]"><LayoutTemplate className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <p className="eyebrow">Template portal</p>
                <h1 className="mt-1 text-2xl font-bold">Atur wajah website wisatawan</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--ink-soft)]">Ubah pesan utama, palet, dan bagian informasi tanpa menyentuh data tiket atau kuota.</p>
              </div>
            </div>
            <a href={`/?tenant=${slug || portal.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary shrink-0">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Buka portal
            </a>
          </div>

          <div className="mt-6 grid gap-5">
            <div>
              <label htmlFor="portal-eyebrow" className="mb-1.5 block text-xs font-bold text-[var(--forest-deep)]">Label kecil di atas judul</label>
              <input id="portal-eyebrow" value={template.eyebrow} onChange={(event) => updateTemplate('eyebrow', event.target.value)} maxLength={56} className="field-control" />
            </div>
            <div>
              <label htmlFor="portal-heading" className="mb-1.5 block text-xs font-bold text-[var(--forest-deep)]">Judul utama portal</label>
              <input id="portal-heading" value={template.hero_heading} onChange={(event) => updateTemplate('hero_heading', event.target.value)} maxLength={96} className="field-control" />
            </div>
            <div>
              <label htmlFor="portal-copy" className="mb-1.5 block text-xs font-bold text-[var(--forest-deep)]">Pengantar singkat</label>
              <textarea id="portal-copy" rows={4} value={template.hero_copy} onChange={(event) => updateTemplate('hero_copy', event.target.value)} maxLength={280} className="field-control leading-6" />
              <p className="mt-1.5 text-xs text-[var(--ink-muted)]">{template.hero_copy.length}/280 karakter</p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--bark-pale)] text-[var(--bark)]"><Palette className="h-5 w-5" aria-hidden="true" /></span>
            <div><h2 className="text-xl font-bold">Palet portal</h2><p className="mt-1 text-sm text-[var(--ink-soft)]">Pilihan dibatasi agar teks dan aksi tetap mudah dibaca.</p></div>
          </div>
          <div className="mt-5">
            <fieldset>
              <legend className="text-xs font-bold text-[var(--forest-deep)] mb-2">Pilih tema warna</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {colorChoices.map((choice) => (
                  <label key={choice.value} className={`flex flex-col cursor-pointer items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${template.primary_color === choice.value ? 'border-[var(--forest)] bg-[var(--leaf-pale)] text-[var(--forest-deep)] scale-[1.02] shadow-sm' : 'border-[var(--border)] bg-[var(--sand)] text-[var(--ink-soft)] hover:bg-[var(--canvas)]'}`}>
                    <input type="radio" name="primary_color" value={choice.value} checked={template.primary_color === choice.value} onChange={() => { updateTemplate('primary_color', choice.value); updateTemplate('accent_color', choice.accent); }} className="sr-only" />
                    <span className="h-8 w-8 rounded-full shadow-inner" style={{ backgroundColor: choice.value }} aria-hidden="true" />
                    {choice.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <section className="card p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--fog)] text-[var(--forest)]"><SlidersHorizontal className="h-5 w-5" aria-hidden="true" /></span>
            <div><h2 className="text-xl font-bold">Bagian yang ditampilkan</h2><p className="mt-1 text-sm text-[var(--ink-soft)]">Sembunyikan informasi yang belum relevan tanpa menghapus data operasional.</p></div>
          </div>
          <div className="mt-5 space-y-3">
            <ToggleField label="Ketersediaan hari ini" description="Menampilkan sisa kuota dan harga awal." checked={template.show_availability} onChange={(value) => updateTemplate('show_availability', value)} />
            <ToggleField label="Fasilitas kawasan" description="Menampilkan daftar fasilitas dari data destinasi." checked={template.show_facilities} onChange={(value) => updateTemplate('show_facilities', value)} />
            <ToggleField label="Etika berkunjung" description="Menampilkan aturan dan pengingat untuk wisatawan." checked={template.show_rules} onChange={(value) => updateTemplate('show_rules', value)} />
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/admin/destinations" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--forest)] hover:text-[var(--bark)]"><FileText className="h-4 w-4" aria-hidden="true" /> Edit data destinasi dan tiket</Link>
          <button type="submit" disabled={isSaving} className="btn-primary px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" aria-hidden="true" />{isSaving ? 'Menyimpan...' : 'Simpan template'}</button>
        </div>
      </form>

      <PortalPreview destination={portal} template={template} />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trees, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Globe, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function RegisterTenantPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    tenant_name: '',
    subdomain: ''
  });

  const [errors, setErrors] = useState({});
  const [subdomainStatus, setSubdomainStatus] = useState({
    checking: false,
    available: null,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registeredData, setRegisteredData] = useState(null);

  // Auto-generate subdomain suggestion from tenant name if not manually modified
  const handleTenantNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => {
      const autoSubdomain = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return {
        ...prev,
        tenant_name: name,
        subdomain: prev.subdomain === '' || prev._autoSubdomain ? autoSubdomain : prev.subdomain,
        _autoSubdomain: true
      };
    });
  };

  // Real-time check for subdomain availability with debounce
  useEffect(() => {
    const cleanSubdomain = formData.subdomain.trim().toLowerCase();
    if (!cleanSubdomain || cleanSubdomain.length < 3) {
      setSubdomainStatus({
        checking: false,
        available: null,
        message: cleanSubdomain ? 'Minimal 3 karakter' : ''
      });
      return;
    }

    setSubdomainStatus({ checking: true, available: null, message: 'Memeriksa ketersediaan...' });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/v1/auth/check-subdomain?subdomain=${encodeURIComponent(cleanSubdomain)}`);
        const json = await res.json();
        if (json.data && json.data.available) {
          setSubdomainStatus({
            checking: false,
            available: true,
            message: `${cleanSubdomain}.passify.id tersedia!`
          });
        } else {
          setSubdomainStatus({
            checking: false,
            available: false,
            message: 'Subdomain sudah digunakan atau tidak valid'
          });
        }
      } catch (err) {
        setSubdomainStatus({
          checking: false,
          available: null,
          message: 'Gagal mengecek subdomain'
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const validateStep1 = () => {
    const errs = {};
    if (!formData.full_name.trim()) errs.full_name = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) {
      errs.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Format email tidak valid';
    }
    if (!formData.password) {
      errs.password = 'Kata sandi wajib diisi';
    } else if (formData.password.length < 6) {
      errs.password = 'Kata sandi minimal 6 karakter';
    }
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Konfirmasi kata sandi tidak cocok';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.tenant_name.trim()) errs.tenant_name = 'Nama destinasi wisata wajib diisi';
    if (!formData.subdomain.trim()) {
      errs.subdomain = 'Subdomain wajib diisi';
    } else if (subdomainStatus.available === false) {
      errs.subdomain = 'Subdomain sudah digunakan';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setSubmitError('');
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('http://localhost:8081/api/v1/auth/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          tenant_name: formData.tenant_name,
          subdomain: formData.subdomain.trim().toLowerCase()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error?.details || 'Gagal mendaftarkan wisata');
      }

      setRegisteredData(data.data || {});
      setStep(3); // Move to success step
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--moss)] selection:text-white">
      {/* Header */}
      <header className="border-b border-[rgba(23,59,50,0.1)] bg-[var(--canvas)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-xl font-extrabold tracking-tight text-[var(--forest-deep)]">passify</span>
          </Link>
          <div className="text-xs font-semibold text-[var(--ink-soft)]">
            Sudah punya akun?{' '}
            <Link to="/masuk" className="text-[var(--forest)] font-bold hover:underline">
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12 flex-1">
        <div className="mb-8 rounded-2xl bg-[var(--leaf-pale)]/60 p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Pendaftaran Wisata</p>
              <p className="mt-1 text-sm font-bold text-[var(--forest-deep)]">Siapkan portal wisata Anda dalam tiga langkah.</p>
            </div>
            <span className="hidden rounded-lg bg-white/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)] shadow-xs sm:inline">Langkah {step} dari 3</span>
          </div>
          <ol className="mt-5 grid grid-cols-3 gap-2">
            {[
              ['01', 'Akun'],
              ['02', 'Destinasi'],
              ['03', 'Aktivasi'],
            ].map(([number, label]) => {
              const numberValue = Number(number);
              const isCurrent = numberValue === step;
              const isDone = numberValue < step;
              return (
                <li key={number} className="min-w-0">
                  <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-[var(--forest-deep)]' : isDone ? 'text-[var(--forest)]' : 'text-[var(--ink-muted)]'}`}>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${isCurrent || isDone ? 'bg-[var(--forest)] text-white' : 'border border-[var(--border)] bg-white'}`}>{isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : number}</span>
                    <span className="truncate">{label}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Step 1: Data Akun */}
        {step === 1 && (
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_16px_40px_rgba(16,45,32,.08)]">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                Daftarkan Wisata Alam Anda
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Langkah 1: Masukkan data diri Anda sebagai pengelola utama kawasan wisata.
              </p>
            </div>

            <form onSubmit={handleNextStep} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                  Nama Lengkap Pengelola <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--ink-soft)]" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bambang Hermanto"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] outline-none"
                  />
                </div>
                {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    Email Pengelola <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--ink-soft)]" />
                    <input
                      type="email"
                      required
                      placeholder="pengelola@wisata.com"
                      value={formData.email}
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value });
                        setSubmitError('');
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className="w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] outline-none"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[var(--ink-soft)]" />
                    <input
                      type="tel"
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--ink-soft)]" />
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] outline-none"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                    Konfirmasi Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--ink-soft)]" />
                    <input
                      type="password"
                      required
                      placeholder="Ulangi kata sandi"
                      value={formData.confirm_password}
                      onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] outline-none"
                    />
                  </div>
                  {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--forest)] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--forest-deep)] transition-all cursor-pointer"
                >
                  Lanjut ke Data Wisata <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Data Wisata */}
        {step === 2 && (
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_16px_40px_rgba(16,45,32,.08)]">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
                Identitas Destinasi & Domain
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Langkah 2: Tentukan nama wisata alam dan alamat URL subdomain mandiri Anda.
              </p>
            </div>

            {submitError && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-2xs">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                  Nama Tempat Wisata Alam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Trees className="absolute left-3.5 top-3 h-4 w-4 text-[var(--forest)]" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Curug Bidadari Asri"
                    value={formData.tenant_name}
                    onChange={handleTenantNameChange}
                    className="w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white pl-10 pr-4 py-2.5 text-sm focus:border-[var(--forest)] focus:ring-1 focus:ring-[var(--forest)] outline-none font-medium"
                  />
                </div>
                {errors.tenant_name && <p className="mt-1 text-xs text-red-500">{errors.tenant_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)] mb-1.5">
                  Subdomain Website Anda <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-[rgba(23,59,50,0.18)] focus-within:border-[var(--forest)] focus-within:ring-1 focus-within:ring-[var(--forest)] overflow-hidden bg-white">
                  <div className="flex items-center pl-3.5 pr-2 bg-gray-50/50 text-[var(--ink-soft)]">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="curugbidadari"
                    value={formData.subdomain}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setFormData({ ...formData, subdomain: val, _autoSubdomain: false });
                    }}
                    className="w-full py-2.5 px-2 text-sm outline-none font-mono font-medium"
                  />
                  <div className="flex items-center pr-3.5 pl-2 bg-gray-50 font-mono text-xs font-bold text-[var(--ink-soft)]">
                    .passify.id
                  </div>
                </div>

                {/* Subdomain Status Feedback */}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {subdomainStatus.checking && (
                    <span className="flex items-center gap-1.5 text-[var(--ink-soft)] font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--forest)]" />
                      Memeriksa ketersediaan...
                    </span>
                  )}
                  {!subdomainStatus.checking && subdomainStatus.available === true && (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {subdomainStatus.message}
                    </span>
                  )}
                  {!subdomainStatus.checking && subdomainStatus.available === false && (
                    <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      {subdomainStatus.message}
                    </span>
                  )}
                </div>
                {errors.subdomain && <p className="mt-1 text-xs text-red-500">{errors.subdomain}</p>}
              </div>

              {/* Preview Card */}
              {formData.subdomain && (
                <div className="rounded-2xl bg-[var(--leaf-pale)]/60 p-4 shadow-2xs">
                  <div className="text-[11px] font-extrabold text-[var(--forest-deep)] uppercase tracking-wider mb-1.5">
                    Pratinjau Alamat Website
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--forest-deep)] font-mono">
                    <span>https://{formData.subdomain.trim() || 'nama-wisata'}.passify.id</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--ink-soft)]">
                    Wisatawan Anda akan membeli tiket langsung di alamat web ini tanpa melihat wisata milik pihak lain.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitError('');
                    setStep(1);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 btn-secondary rounded-xl px-5 py-3 text-sm font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || subdomainStatus.available === false}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[var(--forest)] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--forest-deep)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Mendaftarkan...
                    </>
                  ) : (
                    <>
                      Daftarkan Wisata Saya <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && (
          <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_16px_40px_rgba(16,45,32,.08)] text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <Mail className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              Periksa Email Anda
            </h1>
            
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)] max-w-md mx-auto">
              Kami telah mengirimkan tautan verifikasi ke email{' '}
              <strong className="text-[var(--ink)]">{formData.email}</strong>. 
              Silakan klik tautan di email tersebut untuk mengaktifkan akun dan mulai menggunakan dashboard Passify.
            </p>

            {/* Direct Verification Action */}
            {registeredData?.verify_token_dev && (
              <div className="mt-6 rounded-2xl bg-[var(--leaf-pale)]/60 p-5 shadow-2xs text-center max-w-md mx-auto">
                <p className="text-xs text-[var(--forest-deep)] font-semibold mb-3">
                  Klik tombol di bawah untuk langsung memverifikasi email dan mengaktifkan portal wisata Anda:
                </p>
                <Link
                  to={`/verifikasi-email?token=${registeredData.verify_token_dev}`}
                  className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm text-decoration-none"
                >
                  Verifikasi Email Sekarang <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            <div className="mt-8 flex items-center justify-center">
              <Link
                to="/"
                className="btn-secondary rounded-xl px-6 py-2.5 text-xs font-bold shadow-xs text-decoration-none"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(23,59,50,0.1)] px-4 py-6 text-center text-xs text-[var(--ink-soft)]">
        © 2026 Passify. Platform SaaS Tiket Wisata Alam White-Label.
      </footer>
    </div>
  );
}

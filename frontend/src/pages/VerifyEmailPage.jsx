import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Trees, ExternalLink } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token verifikasi tidak ditemukan dalam URL.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setStatus('success');
          setMessage(json.message || 'Email Anda telah berhasil diverifikasi! Akun pengelola wisata Anda telah aktif.');
        } else {
          setStatus('error');
          setMessage(json.message || json.error?.details || 'Tautan verifikasi tidak valid atau telah kedaluwarsa.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Gagal menghubungi server verifikasi. Pastikan backend aktif.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--moss)] selection:text-white">
      {/* Header */}
      <header className="border-b border-[rgba(23,59,50,0.1)] bg-[var(--canvas)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="text-xl font-extrabold tracking-tight text-[var(--forest-deep)]">passify</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]">
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-lg px-4 py-12 flex-1 flex items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 sm:p-10 shadow-[0_16px_40px_rgba(16,45,32,.08)] text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <div>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fog)] text-[var(--forest)]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--ink)]">
                Memverifikasi Email...
              </h1>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                Mohon tunggu sebentar selagi kami mengaktifkan akun pengelola dan portal wisata Anda.
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--ink)]">
                Verifikasi Berhasil! 🎉
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                {message}
              </p>
              <div className="mt-8 space-y-3">
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--forest)] px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--forest-deep)] transition-all text-decoration-none"
                >
                  Buka Dashboard Pengelola <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white px-5 py-2.5 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-gray-50 text-decoration-none"
                >
                  Ke Halaman Utama
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--ink)]">
                Verifikasi Gagal
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-red-600 font-medium">
                {message}
              </p>
              <div className="mt-8 space-y-3">
                <Link
                  to="/daftar-wisata"
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--forest)] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[var(--forest-deep)] transition-all text-decoration-none"
                >
                  Daftar Ulang <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[rgba(23,59,50,0.18)] bg-white px-5 py-2.5 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-gray-50 text-decoration-none"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[rgba(23,59,50,0.1)] px-4 py-6 text-center text-xs text-[var(--ink-soft)]">
        © 2026 Passify. Platform SaaS Tiket Wisata Alam White-Label.
      </footer>
    </div>
  );
}

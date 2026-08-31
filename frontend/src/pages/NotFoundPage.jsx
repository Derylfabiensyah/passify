import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, Search, ArrowLeft, Ticket, ShieldAlert } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between font-sans text-[var(--ink)] antialiased selection:bg-[var(--leaf-pale)] selection:text-[var(--forest-deep)]">
      {/* Top Simple Nav */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[var(--forest-deep)] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-[var(--leaf)]" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-[var(--forest-deep)] tracking-tight">
                {tenant?.name || 'Passify'}
              </span>
              {tenant?.tagline && (
                <span className="hidden sm:inline text-xs text-[var(--ink-soft)] ml-2 pl-2 border-l border-[var(--border)]">
                  {tenant.tagline}
                </span>
              )}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--forest-deep)] transition-colors px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--canvas)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full text-center">
          {/* Animated Themed Badge */}
          <div className="inline-flex items-center justify-center p-4 bg-[var(--leaf-pale)] rounded-3xl mb-6 shadow-sm border border-[var(--leaf)]/20 animate-bounce duration-1000">
            <div className="w-16 h-16 rounded-2xl bg-[var(--forest-deep)] text-[var(--leaf)] flex items-center justify-center shadow-md">
              <Compass className="w-8 h-8 animate-spin duration-3000" />
            </div>
          </div>

          {/* 404 Code & Heading */}
          <div className="space-y-3">
            <span className="font-mono text-sm font-bold tracking-widest uppercase text-[var(--bark)] bg-[var(--bark-pale)]/50 px-3 py-1 rounded-full">
              Error 404 • Halaman Tidak Ditemukan
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[var(--forest-deep)] tracking-tight">
              Tersesat di Jalur Wisata?
            </h1>
            <p className="text-sm sm:text-base text-[var(--ink-soft)] leading-relaxed max-w-md mx-auto">
              Halaman atau jalur yang Anda tuju sepertinya tidak ada, telah dipindahkan, atau alamat URL salah diketik.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--forest-deep)] text-white font-semibold text-sm shadow-md hover:bg-[var(--forest)] transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              to="/jelajah"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--surface)] text-[var(--forest-deep)] border border-[var(--border)] font-semibold text-sm hover:bg-[var(--canvas)] hover:border-[var(--leaf)] transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-[var(--forest-soft)]" />
              <span>Jelajah Destinasi</span>
            </Link>
          </div>

          {/* Quick Helpful Links Card */}
          <div className="mt-12 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)] mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--bark)]" />
              <span>Tautan Cepat yang Mungkin Anda Cari</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Link
                to="/tiket-saya"
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-[var(--canvas)] text-[var(--ink)] font-medium transition-colors border border-transparent hover:border-[var(--border)]"
              >
                <Ticket className="w-4 h-4 text-[var(--forest)]" />
                <span>Riwayat Tiket &amp; E-Ticket</span>
              </Link>
              <Link
                to="/daftar-wisata"
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-[var(--canvas)] text-[var(--ink)] font-medium transition-colors border border-transparent hover:border-[var(--border)]"
              >
                <Compass className="w-4 h-4 text-[var(--bark)]" />
                <span>Daftarkan Destinasi Wisata</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 text-center text-xs text-[var(--ink-soft)]">
        <p>&copy; {new Date().getFullYear()} {tenant?.name || 'Passify Ecosystem'}. Platform Tiket &amp; Akses Wisata Alam Terpadu.</p>
      </footer>
    </div>
  );
}

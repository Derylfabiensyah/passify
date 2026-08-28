import React from 'react';
import { AlertCircle, ArrowRight, Home } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

export default function ErrorScreen({ error }) {
  const { refetch } = useTenant();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
      <div className="card w-full max-w-md p-8 text-center shadow-[var(--shadow-soft)] sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--bark-pale)] text-[var(--bark)]">
          <AlertCircle className="h-8 w-8" />
        </div>
        <p className="eyebrow mt-6 !text-[var(--bark)]">Butuh perhatian</p>
        <h1 className="mt-2 text-3xl font-bold">Halaman belum siap dibuka</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={refetch} className="btn-primary">
            Coba lagi <ArrowRight className="h-4 w-4" />
          </button>
          <a href="https://passify.com" className="btn-secondary">
            <Home className="h-4 w-4" />
            Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

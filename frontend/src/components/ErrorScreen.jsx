import React from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

export default function ErrorScreen({ error }) {
  const { refetch } = useTenant();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 font-serif text-2xl font-semibold text-[var(--forest-deep)]">
          Terjadi Kesalahan
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--forest)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--forest-deep)]"
          >
            Coba Lagi
          </button>
          <a
            href="https://passify.com"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--forest)] transition-colors hover:bg-[var(--leaf-pale)]"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

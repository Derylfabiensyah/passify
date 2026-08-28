import React from 'react';
import { Compass, Leaf } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
      <div className="card w-full max-w-sm p-8 text-center shadow-[var(--shadow-soft)]">
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[var(--forest-deep)] text-white shadow-[0_10px_24px_rgba(16,45,32,.16)]">
          <Compass className="h-7 w-7 animate-pulse" />
          <Leaf className="absolute -right-2 -top-2 h-5 w-5 text-[var(--leaf)]" />
        </div>
        <p className="eyebrow mt-6">Menyiapkan perjalanan</p>
        <h1 className="mt-2 text-2xl font-bold">Memuat destinasi</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">Kami sedang menyiapkan informasi tiket dan kunjungan untuk Anda.</p>
      </div>
    </div>
  );
}

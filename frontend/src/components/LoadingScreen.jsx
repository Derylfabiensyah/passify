import React from 'react';
import { Compass } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)]">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 animate-pulse place-items-center rounded-full bg-[var(--forest)] text-white">
          <Compass className="h-8 w-8" />
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--ink-soft)]">Memuat destinasi...</p>
      </div>
    </div>
  );
}

import React from 'react';
import { MapPin } from 'lucide-react';

export default function DestinationsPage() {
  return (
    <div className="glass-panel p-8 text-center">
      <MapPin className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
      <h2 className="text-xl font-bold text-white font-['Outfit'] mb-2">Manajemen Destinasi & Tiket</h2>
      <p className="text-sm text-slate-400">Segera hadir...</p>
    </div>
  );
}

import React from 'react';
import { Mountain, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
            <Mountain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-white font-extrabold text-lg font-['Outfit']">Passify</span>
            <p className="text-[11px] text-slate-500">SaaS E-Tiketing & Cashless Wisata Alam Indonesia</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
          <a href="#catalog-section" className="hover:text-emerald-400 transition-colors">Destinasi</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Fitur Platform</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Dokumentasi API</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Privasi & Ketentuan</a>
        </div>

        <div className="text-center md:text-right text-[11px] text-slate-500">
          © {new Date().getFullYear()} Passify. All rights reserved. <br />
          Built with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> for Indonesia Nature Tourism.
        </div>
      </div>
    </footer>
  );
}

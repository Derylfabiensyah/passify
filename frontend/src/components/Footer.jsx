import React from 'react';
import { Mountain, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-14 px-4 lg:px-8 text-gray-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
            <Mountain className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-gray-900 font-bold text-base font-['Outfit'] tracking-tight">Passify</span>
            <p className="text-[11px] text-gray-400">White-Label Cloud E-Ticketing & Cashless Engine</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 font-medium">
          <a href="#catalog-section" className="hover:text-gray-900 transition-colors">Demo Venue</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Arsitektur Cloud</a>
          <a href="#" className="hover:text-gray-900 transition-colors">API & SDK Docs</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Keamanan Offline</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Kebijakan Privasi</a>
        </div>

        <div className="text-center md:text-right text-[11px] text-gray-400">
          © {new Date().getFullYear()} Passify Cloud OS. All rights reserved. <br />
          Engineered for White-Label Ecotourism & Conservation.
        </div>
      </div>
    </footer>
  );
}

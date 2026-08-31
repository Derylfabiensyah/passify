import React, { useState } from 'react';
import { Mountain } from 'lucide-react';
import LegalModal from './common/LegalModal';

export default function Footer() {
  const [legalModal, setLegalModal] = useState({ open: false, type: 'privacy' });

  const openModal = (type) => {
    setLegalModal({ open: true, type });
  };

  return (
    <>
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-12 px-4 lg:px-8 text-[var(--ink-soft)] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--forest-deep)] flex items-center justify-center text-[var(--leaf)] font-bold shadow-xs">
              <Mountain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[var(--forest-deep)] font-bold text-base font-heading tracking-tight">Passify</span>
              <p className="text-[11px] text-[var(--ink-soft)]">White-Label Cloud E-Ticketing &amp; Reservation Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[var(--ink-soft)] font-medium">
            <a href="#katalog" className="hover:text-[var(--forest-deep)] transition-colors">Demo Destinasi</a>
            <button
              type="button"
              onClick={() => openModal('privacy')}
              className="hover:text-[var(--forest-deep)] transition-colors cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <button
              type="button"
              onClick={() => openModal('terms')}
              className="hover:text-[var(--forest-deep)] transition-colors cursor-pointer"
            >
              Syarat &amp; Ketentuan
            </button>
            <button
              type="button"
              onClick={() => openModal('help')}
              className="hover:text-[var(--forest-deep)] transition-colors cursor-pointer"
            >
              Pusat Bantuan
            </button>
          </div>

          <div className="text-center md:text-right text-[11px] text-[var(--ink-soft)]">
            &copy; {new Date().getFullYear()} Passify Ecosystem. All rights reserved. <br />
            Engineered for White-Label Ecotourism &amp; Conservation.
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModal.open}
        onClose={() => setLegalModal({ ...legalModal, open: false })}
        type={legalModal.type}
      />
    </>
  );
}

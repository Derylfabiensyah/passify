import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Portal Components (B2B/B2G SaaS + Tourist Demo)
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import OfflineInfrastructureSection from './components/OfflineInfrastructureSection';
import HardwareIntegrationSection from './components/HardwareIntegrationSection';
import PricingSection from './components/PricingSection';
import SecurityLegalSection from './components/SecurityLegalSection';
import TestimonialsSection from './components/TestimonialsSection';
import Catalog from './components/Catalog';
import BookingModal from './components/BookingModal';
import ETicketModal from './components/ETicketModal';
import AuthModal from './components/AuthModal';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import { DESTINATIONS } from './data/destinations';

// Admin Dashboard Components
import AdminLayout from './components/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import DestinationsPage from './pages/admin/DestinationsPage';
import QuotasPage from './pages/admin/QuotasPage';
import GatesPage from './pages/admin/GatesPage';
import FinancePage from './pages/admin/FinancePage';

// ─── Public Portal (Landing Page) ────────────────────────────────
function PublicPortal() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('passify_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState({
    orderNumber: 'TWA-20260729-8832',
    destinationName: 'Kawasan Konservasi & Wisata Alam Pegunungan',
    visitDate: '2026-08-01',
    timeSlotLabel: 'Sunrise Session (03:00 - 09:00)',
    totalQty: 2,
    grandTotal: 84000,
    visitorName: 'Deryl Fabiensyah',
    visitorNik: '3515082409980002',
    ticketCode: 'TWA-QR-98214',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    createdAt: new Date().toISOString()
  });
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const handleBookingSuccess = (newOrder) => {
    setActiveOrder(newOrder);
    setSelectedDestination(null);
    setIsTicketModalOpen(true);
  };

  const handleScrollToCatalog = () => {
    const catalog = document.getElementById('catalog-section');
    if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('passify_user');
    localStorage.removeItem('passify_token');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navbar Murni SaaS B2B (Tanpa Search/Wallet/E-Ticket B2C) */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {/* 1. Hero Section: Warna Hidup, Lencana Logo KLHK/Kemenparekraf, & Kontras Tinggi WCAG */}
        <Hero onExploreClick={handleScrollToCatalog} />

        {/* 2. Arsitektur Lapangan: Alternating Zig-Zag Layout (Offline Gate, Kuota, Rentals) */}
        <OfflineInfrastructureSection />

        {/* 3. Visualisasi Hardware: Alternating Zig-Zag dengan Foto Produk AI Real Mockups */}
        <HardwareIntegrationSection />

        {/* 4. Paket Harga Khusus & Kalkulator Bagi Hasil Interaktif Slider */}
        <PricingSection />

        {/* 6. Keamanan, Kepatuhan Regulasi, & Legalitas B2G */}
        <SecurityLegalSection />

        {/* 7. Human Touch: Testimoni Ketua Pokdarwis & Kepala Balai Taman Nasional */}
        <TestimonialsSection />

        {/* 8. LIVE DEMO: Portal Wisatawan (Batas Visual Tegas untuk Pemisahan Audiens) */}
        <div id="tourist-demo-banner" className="bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-900 border-y border-gray-800 py-16 px-4 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-gray-950 text-xs font-bold uppercase tracking-wider mb-4 shadow-md">
              <span className="w-2 h-2 rounded-full bg-gray-950 animate-ping" />
              <span>LIVE INTERACTIVE DEMO — PORTAL WISATAWAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] mb-3">
              Pengalaman Portal Pemesanan Tiket Wisatawan (B2C Interface)
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Di bawah ini adalah contoh langsung tampilan pemesanan e-Ticket, pemilihan sesi kuota konservasi, dan sistem penyewaan alat yang akan dinikmati pengunjung kawasan wisata Anda.
            </p>
          </div>
        </div>

        <Catalog
          destinations={DESTINATIONS}
          searchQuery={searchQuery}
          onSelectDestination={(dest) => setSelectedDestination(dest)}
        />

        {/* 9. Fitur Lengkap SaaS */}
        <FeaturesSection />
      </main>
      <Footer />

      {selectedDestination && (
        <BookingModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      {isTicketModalOpen && (
        <ETicketModal
          order={activeOrder}
          onClose={() => setIsTicketModalOpen(false)}
        />
      )}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

// ─── Main App Router ─────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<PublicPortal />} />
      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="destinations" element={<DestinationsPage />} />
              <Route path="quotas" element={<QuotasPage />} />
              <Route path="gates" element={<GatesPage />} />
              <Route path="finance" element={<FinancePage />} />
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

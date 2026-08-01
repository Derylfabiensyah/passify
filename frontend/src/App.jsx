import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Portal Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import CashlessEcosystemSection from './components/CashlessEcosystemSection';
import BookingModal from './components/BookingModal';
import WalletModal from './components/WalletModal';
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

  const [walletBalance, setWalletBalance] = useState(250000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState({
    orderNumber: 'TWA-20260729-8832',
    destinationName: 'Taman Nasional Gunung Bromo',
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

  const handleTopUpWallet = (amount) => {
    setWalletBalance((prev) => prev + amount);
  };

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <Navbar
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenTicketModal={() => setIsTicketModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        <Hero onExploreClick={handleScrollToCatalog} />
        <Catalog
          destinations={DESTINATIONS}
          searchQuery={searchQuery}
          onSelectDestination={(dest) => setSelectedDestination(dest)}
        />
        <CashlessEcosystemSection
          onOpenWallet={() => setIsWalletOpen(true)}
        />
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
      {isWalletOpen && (
        <WalletModal
          walletBalance={walletBalance}
          onTopUp={handleTopUpWallet}
          onClose={() => setIsWalletOpen(false)}
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
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

// ─── Main App with Routing ───────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* Public Portal */}
      <Route path="/" element={<PublicPortal />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<AdminLayout><DashboardOverview /></AdminLayout>} />
      <Route path="/admin/destinations" element={<AdminLayout><DestinationsPage /></AdminLayout>} />
      <Route path="/admin/quotas" element={<AdminLayout><QuotasPage /></AdminLayout>} />
      <Route path="/admin/gates" element={<AdminLayout><GatesPage /></AdminLayout>} />
      <Route path="/admin/finance" element={<AdminLayout><FinancePage /></AdminLayout>} />
    </Routes>
  );
}

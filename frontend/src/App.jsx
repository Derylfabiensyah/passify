import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Catalog from './components/Catalog';
import BookingModal from './components/BookingModal';
import WalletModal from './components/WalletModal';
import ETicketModal from './components/ETicketModal';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import { DESTINATIONS } from './data/destinations';

export default function App() {
  const [walletBalance, setWalletBalance] = useState(250000);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
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
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        walletBalance={walletBalance}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenTicketModal={() => setIsTicketModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero onExploreClick={handleScrollToCatalog} />
        <Catalog
          destinations={DESTINATIONS}
          searchQuery={searchQuery}
          onSelectDestination={(dest) => setSelectedDestination(dest)}
        />
        <FeaturesSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
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
    </div>
  );
}

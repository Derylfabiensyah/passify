import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import LandingPage from './components/LandingPage';
import TravelerPortal from './components/TravelerPortal';
import TenantPortal from './components/TenantPortal';
import AdminLayout from './components/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import DestinationsPage from './pages/admin/DestinationsPage';
import QuotasPage from './pages/admin/QuotasPage';
import GatesPage from './pages/admin/GatesPage';
import FinancePage from './pages/admin/FinancePage';
import LoadingScreen from './components/LoadingScreen';
import ErrorScreen from './components/ErrorScreen';
import ErrorBoundary from './components/ErrorBoundary';
import RegisterTenantPage from './pages/RegisterTenantPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import TravelerAuthPage from './pages/TravelerAuthPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingHistoryPage from './pages/BookingHistoryPage';

function AppRoutes() {
  const { slug, isLoading, error } = useTenant();

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error) {
    return <ErrorScreen error={error} />;
  }

  // Root domain - show landing page & traveler showcase
  if (!slug) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/daftar-wisata" element={<RegisterTenantPage />} />
        <Route path="/verifikasi-email" element={<VerifyEmailPage />} />
        <Route path="/masuk" element={<TravelerAuthPage mode="login" />} />
        <Route path="/daftar" element={<TravelerAuthPage mode="register" />} />
        <Route path="/jelajah" element={<TravelerPortal />} />
        <Route path="/riwayat-pesanan" element={<BookingHistoryPage />} />
        <Route path="/tiket-saya" element={<BookingHistoryPage />} />
        <Route path="/riwayat" element={<BookingHistoryPage />} />
        <Route path="/pesan" element={<CheckoutPage />} />
        <Route path="/pesan/:tenantSlug" element={<CheckoutPage />} />
        <Route path="/pesan/:tenantSlug/:destinationId" element={<CheckoutPage />} />
        <Route path="/admin/*" element={<ErrorScreen error="Akses admin memerlukan subdomain pengelola wisata (tenant)." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Tenant domain - show tenant-specific portal and admin
  return (
    <Routes>
      <Route path="/" element={<TenantPortal />} />
      <Route path="/jelajah" element={<TravelerPortal />} />
      <Route path="/riwayat-pesanan" element={<BookingHistoryPage />} />
      <Route path="/tiket-saya" element={<BookingHistoryPage />} />
      <Route path="/riwayat" element={<BookingHistoryPage />} />
      <Route path="/pesan" element={<CheckoutPage />} />
      <Route path="/pesan/:tenantSlug" element={<CheckoutPage />} />
      <Route path="/pesan/:tenantSlug/:destinationId" element={<CheckoutPage />} />
      <Route path="/masuk" element={<TravelerAuthPage mode="login" />} />
      <Route path="/daftar" element={<TravelerAuthPage mode="register" />} />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <TenantProvider>
        <AppRoutes />
      </TenantProvider>
    </ErrorBoundary>
  );
}

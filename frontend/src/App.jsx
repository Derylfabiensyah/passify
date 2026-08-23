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

function AppRoutes() {
  const { slug, destination, isLoading, error } = useTenant();

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error) {
    return <ErrorScreen error={error} />;
  }

  // Root domain - show landing page
  if (!slug) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jelajah" element={<TravelerPortal />} />
        <Route path="/admin/*" element={<ErrorScreen error="Admin access requires a tenant domain" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Tenant domain - show tenant-specific portal and admin
  return (
    <Routes>
      <Route path="/" element={<TenantPortal />} />
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
    <TenantProvider>
      <AppRoutes />
    </TenantProvider>
  );
}

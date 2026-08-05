import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TravelerPortal from './components/TravelerPortal';
import AdminLayout from './components/admin/AdminLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import DestinationsPage from './pages/admin/DestinationsPage';
import QuotasPage from './pages/admin/QuotasPage';
import GatesPage from './pages/admin/GatesPage';
import FinancePage from './pages/admin/FinancePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/jelajah" element={<TravelerPortal />} />
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
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

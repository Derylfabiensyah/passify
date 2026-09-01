import React, { createContext, useContext, useState, useEffect } from 'react';
import { resolveTenantFromHostname, fetchDestinationBySlug } from '../api/tenant';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState({
    slug: null,
    destination: null,
    isLoading: true,
    error: null,
  });

  const refetch = async () => {
    setTenant(prev => ({ ...prev, isLoading: true, error: null }));
    const hostname = window.location.hostname;
    
    try {
      // Step 1: Resolve tenant slug strictly from hostname or ?tenant= query param
      const slug = await resolveTenantFromHostname(hostname);
      
      if (!slug) {
        // Root domain (http://localhost:5173 or passify.com) - show main Passify Landing Page
        setTenant({ slug: null, destination: null, isLoading: false, error: null });
        return;
      }

      // Step 2: Fetch destination data for the tenant subdomain / custom domain
      const destination = await fetchDestinationBySlug(slug);
      setTenant({ slug, destination, isLoading: false, error: null });
    } catch (error) {
      setTenant({ slug: null, destination: null, isLoading: false, error: error.message });
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  const updatePortalTemplate = (template) => {
    setTenant((current) => current.destination
      ? { ...current, destination: { ...current.destination, portal_template: template } }
      : current);
  };

  return (
    <TenantContext.Provider value={{ ...tenant, refetch, updatePortalTemplate }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

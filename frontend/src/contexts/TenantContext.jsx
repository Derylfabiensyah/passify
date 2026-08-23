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
      // Step 1: Resolve tenant slug from hostname
      const slug = await resolveTenantFromHostname(hostname);
      
      if (!slug) {
        // Root domain - no tenant context needed
        setTenant({ slug: null, destination: null, isLoading: false, error: null });
        return;
      }

      // Step 2: Fetch destination data for the tenant
      const destination = await fetchDestinationBySlug(slug);
      setTenant({ slug, destination, isLoading: false, error: null });
    } catch (error) {
      setTenant({ slug: null, destination: null, isLoading: false, error: error.message });
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return (
    <TenantContext.Provider value={{ ...tenant, refetch }}>
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

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
      // Step 1: Resolve tenant slug from hostname or query param
      let slug = await resolveTenantFromHostname(hostname);

      if (!slug) {
        // Check if user is logged in as a tenant admin or has active tenant selected
        try {
          const currentTenant = localStorage.getItem('passify_current_tenant');
          const savedUser = JSON.parse(localStorage.getItem('passify_user') || 'null');
          if (currentTenant) {
            slug = currentTenant;
          } else if (savedUser && (savedUser.role === 'tenant_admin' || savedUser.role === 'pengelola' || savedUser.role === 'super_admin')) {
            slug = savedUser.tenant?.slug || savedUser.tenant?.subdomain || savedUser.tenant_slug;
          }
        } catch (_) {}
      }
      
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

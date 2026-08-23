# Passify Frontend - Multi-Tenant Architecture

This is the frontend application for Passify, a white-label ticketing platform for nature destinations. The application supports multi-tenant architecture where each destination operates on its own subdomain or custom domain.

## Features

- **Multi-Tenant Routing**: Each destination has its own subdomain (e.g., `curug-cibereum.passify.com`)
- **Custom Domain Support**: Destinations can use their own custom domains
- **Tenant-Scoped Portal**: Each tenant sees only their destination's information
- **Tenant-Scoped Admin**: Admin panel automatically scopes to the current tenant
- **Automatic API Header Injection**: All API calls include tenant context automatically
- **Loading & Error States**: Graceful handling of tenant resolution

## Tech Stack

- **React 19** with React Router for navigation
- **Vite** for build tooling and development server
- **Tailwind CSS 4** for styling
- **Chart.js** for analytics dashboards
- **TanStack React Table** for data tables
- **Lucide React** for icons

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Request                         │
│  (curug-cibereum.passify.com or tickets.curugcibereum.com)  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    TenantProvider                            │
│  - Reads window.location.hostname                            │
│  - Resolves tenant slug from subdomain or custom domain      │
│  - Fetches destination data from API                         │
│  - Provides TenantContext to entire app                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
┌──────────────────────┐  ┌──────────────────────┐
│   Portal_App         │  │   Admin_App          │
│  - Single dest view  │  │  - Tenant-scoped     │
│  - No catalog        │  │  - CRUD operations   │
│  - Auto-booking      │  │  - Only tenant data  │
└──────────────────────┘  └──────────────────────┘
```

## Environment Setup

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_ROOT_DOMAIN=passify.com
```

### Development with Subdomain Testing

To test subdomain routing locally, you need to configure your hosts file to map subdomains to localhost.

#### Windows

1. Open Notepad as Administrator
2. Open `C:\Windows\System32\drivers\etc\hosts`
3. Add the following lines:

```
127.0.0.1 passify.com
127.0.0.1 curug-cibereum.passify.com
127.0.0.1 pantai-sawarna.passify.com
```

#### macOS / Linux

1. Open Terminal
2. Edit hosts file: `sudo nano /etc/hosts`
3. Add the following lines:

```
127.0.0.1 passify.com
127.0.0.1 curug-cibereum.passify.com
127.0.0.1 pantai-sawarna.passify.com
```

4. Save and exit (Ctrl+X, then Y, then Enter)

### Vite Configuration for Subdomains

Update `vite.config.js` to allow subdomain access:

```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 3000,
  },
  // ... other config
});
```

## Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Tenant Resolution Flow

1. **Root Domain (`passify.com`)**: Shows the landing page with catalog of all destinations
2. **Subdomain (`{slug}.passify.com`)**: Resolves tenant slug from subdomain, fetches destination data, shows TenantPortal
3. **Custom Domain (`tickets.example.com`)**: Queries API to resolve tenant slug, then proceeds like subdomain
4. **Admin Access (`/admin`)**: Only accessible on tenant domains, automatically scoped to current tenant

## Testing Tenant Routing

1. Start the dev server: `npm run dev`
2. Access different URLs to test:
   - `http://passify.com:3000` - Landing page (catalog)
   - `http://curug-cibereum.passify.com:3000` - Curug Cibereum portal
   - `http://curug-cibereum.passify.com:3000/admin` - Admin for Curug Cibereum
   - `http://passify.com:3000/admin` - Shows error (admin requires tenant domain)

## API Integration

All API calls automatically include the `X-Tenant-Slug` header when accessing from a tenant domain. This is handled by the `useApiClient` hook:

```javascript
import { useApiClient } from './api/client';

function MyComponent() {
  const apiClient = useApiClient();
  
  // This call automatically includes X-Tenant-Slug header
  const data = await apiClient.get('/api/tickets');
}
```

## Component Structure

### Core Components

- **TenantProvider**: Context provider that resolves and manages tenant state
- **TenantPortal**: Single-destination portal for tenant domains
- **TravelerPortal**: Multi-destination catalog (kept for `/jelajah` route on root domain)
- **LoadingScreen**: Shown during tenant resolution
- **ErrorScreen**: Shown when tenant resolution fails
- **BookingModal**: Booking interface with automatic tenant context
- **AuthModal**: Authentication modal (works on both root and tenant domains)

### Admin Components

- **AdminLayout**: Main admin layout with navigation
- **DashboardOverview**: Analytics dashboard with Chart.js
- **DestinationsPage**: Manage destinations and ticket categories
- **QuotasPage**: Manage daily quotas and time slots
- **GatesPage**: Manage gate devices and offline scanners
- **FinancePage**: Revenue analytics and payout history

## Deployment

### DNS Configuration

For production deployment with subdomains:

1. **Wildcard DNS**: Add a wildcard A record pointing to your server:
   ```
   *.passify.com A 123.456.789.0
   ```

2. **Specific Subdomains**: Or add individual A records:
   ```
   curug-cibereum.passify.com A 123.456.789.0
   pantai-sawarna.passify.com A 123.456.789.0
   ```

### Custom Domain Setup

For custom domains (e.g., `tickets.curugcibereum.com`):

1. Customer adds CNAME record pointing to your platform:
   ```
   tickets CNAME passify.com.
   ```

2. Register the custom domain in the backend API
3. The frontend will automatically query the API to resolve the tenant

### Nginx Configuration

Example Nginx configuration for multi-tenant frontend:

```nginx
server {
    listen 80;
    server_name passify.com *.passify.com;
    
    root /var/www/passify/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Subdomain Not Working Locally

- Check hosts file configuration
- Ensure Vite server is running with `host: '0.0.0.0'`
- Clear browser cache and DNS cache
- Use `http://` not `https://` for local development

### Tenant Resolution Errors

- Verify API is running and accessible
- Check environment variables in `.env`
- Check browser console for error messages
- Verify backend API returns correct data for tenant resolution

### Authentication Issues

- Check localStorage for `passify_user` and `passify_token`
- Note that localStorage is per-domain (root domain tokens won't work on subdomains)
- Users need to log in separately on root domain and each tenant domain

## License

Proprietary - Passify Platform

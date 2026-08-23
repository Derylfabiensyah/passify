# Multi-Tenant Deployment & Migration Guide

This guide provides step-by-step instructions for deploying the Passify multi-tenant frontend architecture to production.

## Overview

The Passify frontend supports multi-tenant architecture where:
- Each destination operates on its own subdomain (e.g., `curug-cibereum.passify.com`)
- Destinations can optionally use custom domains (e.g., `tickets.curugcibereum.com`)
- The root domain (`passify.com`) serves as a landing page with catalog
- All tenant-specific functionality is automatically scoped based on hostname

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] Backend API is deployed and accessible
- [ ] Backend supports tenant resolution endpoint (`/api/tenants/resolve`)
- [ ] Backend supports destination fetch endpoint (`/api/destinations/{slug}`)
- [ ] Backend validates `X-Tenant-Slug` header for tenant-scoped operations
- [ ] Environment variables are configured
- [ ] DNS records are prepared
- [ ] SSL certificates are obtained (for wildcard subdomain support)
- [ ] Testing plan is prepared

## Step 1: Environment Configuration

### 1.1 Configure Environment Variables

Create or update `.env` file in the `frontend/` directory:

```env
# Production API URL
VITE_API_BASE_URL=https://api.passify.com

# Root domain for subdomain detection
VITE_ROOT_DOMAIN=passify.com
```

### 1.2 Build Production Bundle

```bash
cd frontend
npm install
npm run build
```

This creates an optimized production build in `frontend/dist/`.

## Step 2: DNS Configuration

### 2.1 Wildcard Subdomain Setup (Recommended)

For automatic subdomain support, add a wildcard DNS A record:

```
Type: A
Name: *
Value: <your-server-ip>
TTL: 3600
```

This allows any subdomain (e.g., `curug-cibereum.passify.com`, `pantai-sawarna.passify.com`) to resolve to your server.

### 2.2 Root Domain Setup

Add an A record for the root domain:

```
Type: A
Name: @
Value: <your-server-ip>
TTL: 3600
```

### 2.3 WWW Redirect (Optional)

Add a CNAME record for www subdomain:

```
Type: CNAME
Name: www
Value: passify.com
TTL: 3600
```

### 2.4 Verify DNS Propagation

```bash
# Check root domain
dig passify.com

# Check wildcard subdomain
dig curug-cibereum.passify.com

# Check from external DNS
nslookup passify.com 8.8.8.8
```

DNS propagation can take 24-48 hours. Use a DNS checker tool to monitor progress.

## Step 3: SSL Certificate Setup

### 3.1 Obtain Wildcard SSL Certificate

For wildcard subdomain support, you need a wildcard SSL certificate:

**Using Let's Encrypt (Certbot):**

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain wildcard certificate (requires DNS challenge)
sudo certbot certonly \
  --manual \
  --preferred-challenges dns \
  -d passify.com \
  -d *.passify.com
```

Follow the prompts to add TXT records to your DNS for verification.

**Certificate Files:**
- Certificate: `/etc/letsencrypt/live/passify.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/passify.com/privkey.pem`

### 3.2 Auto-Renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line (runs twice daily)
0 0,12 * * * certbot renew --quiet
```

## Step 4: Web Server Configuration

### 4.1 Nginx Configuration

Create `/etc/nginx/sites-available/passify`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name passify.com *.passify.com;
    return 301 https://$host$request_uri;
}

# Main HTTPS server for all subdomains
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name passify.com *.passify.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/passify.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/passify.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend static files
    root /var/www/passify/frontend/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/passify /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.2 Apache Configuration (Alternative)

Create `/etc/apache2/sites-available/passify.conf`:

```apache
<VirtualHost *:80>
    ServerName passify.com
    ServerAlias *.passify.com
    Redirect permanent / https://passify.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName passify.com
    ServerAlias *.passify.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/passify.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/passify.com/privkey.pem

    DocumentRoot /var/www/passify/frontend/dist
    
    <Directory /var/www/passify/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle client-side routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API requests
    ProxyPass /api http://localhost:8080/api
    ProxyPassReverse /api http://localhost:8080/api
</VirtualHost>
```

Enable required modules and site:

```bash
sudo a2enmod ssl rewrite proxy proxy_http
sudo a2ensite passify
sudo systemctl reload apache2
```

## Step 5: Custom Domain Setup

### 5.1 Customer DNS Configuration

Instruct customers to add a CNAME record for their custom domain:

```
Type: CNAME
Name: tickets (or any subdomain)
Value: passify.com.
TTL: 3600
```

Or an A record pointing directly to your server:

```
Type: A
Name: tickets
Value: <your-server-ip>
TTL: 3600
```

### 5.2 Backend Configuration

Register the custom domain in your backend API. The backend should store a mapping:

```json
{
  "domain": "tickets.curugcibereum.com",
  "tenant_slug": "curug-cibereum"
}
```

### 5.3 SSL for Custom Domains

For custom domains, you have two options:

**Option 1: Manual Certificate per Domain**

```bash
sudo certbot certonly \
  --webroot \
  -w /var/www/passify/frontend/dist \
  -d tickets.curugcibereum.com
```

Update Nginx to include the new domain.

**Option 2: Automated Certificate Management**

Consider using a service like Cloudflare for SSL termination, which automatically handles SSL for custom domains.

## Step 6: Deployment

### 6.1 Deploy Frontend Files

```bash
# Copy built files to server
rsync -avz --delete frontend/dist/ user@server:/var/www/passify/frontend/dist/

# Or using SCP
scp -r frontend/dist/* user@server:/var/www/passify/frontend/dist/
```

### 6.2 Set Proper Permissions

```bash
sudo chown -R www-data:www-data /var/www/passify/frontend/dist
sudo chmod -R 755 /var/www/passify/frontend/dist
```

### 6.3 Restart Web Server

```bash
# Nginx
sudo systemctl reload nginx

# Apache
sudo systemctl reload apache2
```

## Step 7: Testing Checklist

### 7.1 Root Domain Tests

- [ ] Visit `https://passify.com` - Should show landing page with catalog
- [ ] Click on a destination card - Should navigate to tenant subdomain
- [ ] Try accessing `https://passify.com/admin` - Should show error message

### 7.2 Tenant Subdomain Tests

For each tenant subdomain (e.g., `https://curug-cibereum.passify.com`):

- [ ] Homepage loads and displays single destination
- [ ] Destination branding (name, image, description) is correct
- [ ] "Book Now" button opens booking modal
- [ ] Booking modal is pre-populated with tenant destination
- [ ] Authentication works (login/register)
- [ ] Authenticated booking flow works end-to-end

### 7.3 Admin Tests

For each tenant admin panel (e.g., `https://curug-cibereum.passify.com/admin`):

- [ ] Dashboard loads with tenant-specific data
- [ ] All API calls include `X-Tenant-Slug` header (check network tab)
- [ ] Cannot see or modify other tenants' data
- [ ] CRUD operations work correctly
- [ ] Charts and tables render properly

### 7.4 Error Handling Tests

- [ ] Non-existent subdomain shows "Destination not found" error
- [ ] API unreachable shows "Unable to connect to server" error
- [ ] Error screen has retry button
- [ ] Error screen has home link to root domain

### 7.5 Custom Domain Tests (if applicable)

- [ ] Custom domain resolves correctly
- [ ] Tenant context is properly resolved from custom domain
- [ ] SSL works on custom domain
- [ ] All functionality works the same as subdomain

## Step 8: Monitoring & Maintenance

### 8.1 Set Up Monitoring

Monitor key metrics:
- **Uptime**: Ensure all subdomains are accessible
- **Response Time**: Track API and page load times
- **Error Rate**: Monitor JavaScript errors and API failures
- **SSL Expiry**: Track certificate expiration dates

Recommended tools:
- **UptimeRobot** or **Pingdom** for uptime monitoring
- **Sentry** for error tracking
- **Google Analytics** or **Plausible** for usage analytics

### 8.2 Log Monitoring

Monitor web server logs:

```bash
# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log

# Filter for specific subdomain
grep "curug-cibereum.passify.com" /var/log/nginx/access.log
```

### 8.3 Regular Maintenance Tasks

- [ ] Check SSL certificate expiry (monthly)
- [ ] Update dependencies (monthly)
- [ ] Review error logs (weekly)
- [ ] Test critical user flows (weekly)
- [ ] Backup configuration files (weekly)

## Rollback Plan

If issues arise after deployment:

### Quick Rollback

1. Keep previous build in `/var/www/passify/frontend/dist.backup/`
2. Swap directories:
   ```bash
   sudo mv /var/www/passify/frontend/dist /var/www/passify/frontend/dist.failed
   sudo mv /var/www/passify/frontend/dist.backup /var/www/passify/frontend/dist
   sudo systemctl reload nginx
   ```

### Full Rollback

1. Revert to previous Git commit
2. Rebuild and redeploy
3. Restore database if schema changes were made

## Troubleshooting

### Issue: Subdomain Shows 404

**Cause**: DNS not configured or not propagated

**Solution**:
- Verify wildcard DNS record exists
- Check DNS propagation: `dig curug-cibereum.passify.com`
- Wait for DNS propagation (up to 48 hours)
- Clear browser DNS cache

### Issue: SSL Certificate Not Working

**Cause**: Wildcard certificate not installed or misconfigured

**Solution**:
- Verify certificate includes `*.passify.com`: `openssl x509 -in /etc/letsencrypt/live/passify.com/fullchain.pem -text -noout | grep DNS`
- Check Nginx SSL configuration
- Test SSL: `openssl s_client -connect curug-cibereum.passify.com:443`

### Issue: Tenant Context Not Resolved

**Cause**: Backend API not returning correct data

**Solution**:
- Check backend API is accessible
- Verify `/api/destinations/{slug}` endpoint works
- Check backend logs for errors
- Verify environment variable `VITE_API_BASE_URL` is correct

### Issue: Admin Shows Other Tenants' Data

**Cause**: Backend not enforcing tenant isolation

**Solution**:
- Verify backend validates `X-Tenant-Slug` header
- Check all admin API endpoints respect tenant header
- Review backend middleware for tenant scoping

### Issue: Authentication Not Working Across Subdomains

**Cause**: Cookies/localStorage are domain-specific

**Expected Behavior**: Users must log in separately on each subdomain. This is by design for security.

**Alternative Solution**: Implement SSO (Single Sign-On) if cross-subdomain authentication is required.

## Performance Optimization

### 8.1 Enable CDN

Consider using a CDN for static assets:
- Cloudflare
- AWS CloudFront
- Fastly

### 8.2 Enable Brotli Compression

In addition to Gzip, enable Brotli for better compression:

```nginx
# Install nginx brotli module first
# Then add to nginx config:
brotli on;
brotli_types text/plain text/css application/javascript application/json;
```

### 8.3 Optimize Images

- Use WebP format for images
- Implement lazy loading
- Use appropriate image sizes

## Security Hardening

### 9.1 Add Security Headers

Already included in nginx config above:
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

### 9.2 Implement Rate Limiting

```nginx
# Add to nginx config
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api {
    limit_req zone=api_limit burst=20 nodelay;
    # ... rest of proxy config
}
```

### 9.3 Enable HSTS

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 9.4 Regular Security Audits

- Run `npm audit` regularly
- Update dependencies with security patches
- Monitor security advisories for dependencies

## Support & Contact

For deployment issues or questions:
- Email: devops@passify.com
- Slack: #passify-deployment

## Appendix: Quick Reference

### Common Commands

```bash
# Build production
npm run build

# Deploy to server
rsync -avz --delete frontend/dist/ user@server:/var/www/passify/frontend/dist/

# Reload nginx
sudo systemctl reload nginx

# Check nginx config
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/error.log

# Renew SSL certificate
sudo certbot renew

# Check DNS
dig curug-cibereum.passify.com
```

### Environment Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://api.passify.com` | Backend API base URL |
| `VITE_ROOT_DOMAIN` | `passify.com` | Root domain for subdomain detection |

### Port Reference

| Service | Port | Purpose |
|---------|------|---------|
| Frontend (dev) | 3000 | Vite dev server |
| Frontend (prod) | 80, 443 | Nginx/Apache |
| Backend API | 8080 | Go API server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Maintained By**: Passify DevOps Team

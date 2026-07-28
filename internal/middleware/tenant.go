package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"github.com/tiket-wisata-alam/backend/internal/response"
	"gorm.io/gorm"
)

// TenantResolverMiddleware resolves the tenant from the request
// It supports resolution via:
// 1. X-Tenant-ID header (for API clients)
// 2. Subdomain extraction from Host header (for white-label sites)
// 3. Custom domain lookup (for custom-domain white-label)
func TenantResolverMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tenantID uuid.UUID
		var resolved bool

		// Strategy 1: X-Tenant-ID header (highest priority, for internal/API calls)
		if headerTenantID := c.GetHeader("X-Tenant-ID"); headerTenantID != "" {
			parsed, err := uuid.Parse(headerTenantID)
			if err == nil {
				// Verify tenant exists and is active
				var tenant models.Tenant
				if err := db.Where("id = ? AND is_active = true", parsed).First(&tenant).Error; err == nil {
					tenantID = parsed
					resolved = true
					c.Set("tenant", &tenant)
				}
			}
		}

		// Strategy 2: Subdomain resolution from Host header
		if !resolved {
			host := c.Request.Host
			tenant, err := resolveTenantByHost(db, host)
			if err == nil && tenant != nil {
				tenantID = tenant.ID
				resolved = true
				c.Set("tenant", tenant)
			}
		}

		if !resolved {
			response.BadRequest(c, "Tenant tidak dapat diidentifikasi. Sertakan header X-Tenant-ID atau gunakan subdomain yang valid.", nil)
			c.Abort()
			return
		}

		// Set tenant context for RLS
		database.SetTenantContext(db, tenantID.String())

		c.Set("tenant_id", tenantID)
		c.Next()
	}
}

// TenantOptionalMiddleware tries to resolve tenant but doesn't require it
// Useful for endpoints that work across tenants (e.g., super admin)
func TenantOptionalMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if headerTenantID := c.GetHeader("X-Tenant-ID"); headerTenantID != "" {
			parsed, err := uuid.Parse(headerTenantID)
			if err == nil {
				var tenant models.Tenant
				if err := db.Where("id = ? AND is_active = true", parsed).First(&tenant).Error; err == nil {
					database.SetTenantContext(db, parsed.String())
					c.Set("tenant_id", parsed)
					c.Set("tenant", &tenant)
				}
			}
		}
		c.Next()
	}
}

// resolveTenantByHost resolves a tenant from the request host
// First tries subdomain match, then custom domain match
func resolveTenantByHost(db *gorm.DB, host string) (*models.Tenant, error) {
	var tenant models.Tenant

	// Try custom domain first (exact match)
	err := db.Where("custom_domain = ? AND is_active = true", host).First(&tenant).Error
	if err == nil {
		return &tenant, nil
	}

	// Try subdomain extraction
	// Assumes format: {subdomain}.ticketwisata.id or {subdomain}.localhost:port
	subdomain := extractSubdomain(host)
	if subdomain != "" {
		err = db.Where("subdomain = ? AND is_active = true", subdomain).First(&tenant).Error
		if err == nil {
			return &tenant, nil
		}
	}

	return nil, gorm.ErrRecordNotFound
}

// extractSubdomain extracts the subdomain from a host string
func extractSubdomain(host string) string {
	// Remove port if present
	parts := splitHost(host)
	hostname := parts[0]

	// Split by dots
	segments := splitDots(hostname)

	// If we have more than 2 segments (e.g., subdomain.domain.tld), the first is the subdomain
	// For localhost-based: subdomain.localhost
	if len(segments) >= 2 {
		// Don't treat "www" as a tenant subdomain
		if segments[0] != "www" {
			return segments[0]
		}
	}

	return ""
}

func splitHost(host string) []string {
	result := make([]string, 0, 2)
	idx := len(host) - 1
	for idx >= 0 && host[idx] != ':' {
		idx--
	}
	if idx < 0 {
		return []string{host}
	}
	result = append(result, host[:idx])
	result = append(result, host[idx+1:])
	return result
}

func splitDots(s string) []string {
	result := make([]string, 0)
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '.' {
			if i > start {
				result = append(result, s[start:i])
			}
			start = i + 1
		}
	}
	if start < len(s) {
		result = append(result, s[start:])
	}
	return result
}

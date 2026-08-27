package tenant

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// RegisterRoutes registers tenant service endpoints with authentication and authorization middleware
func RegisterRoutes(router *gin.RouterGroup, handler *TenantHandler, jwtSecret string) {
	// Public routes (no auth) - used by tenant portals & custom domain resolution
	public := router.Group("/public")
	{
		public.POST("/tenants/resolve", handler.HandleResolveTenant)
		public.GET("/tenants/:slug/destination", handler.HandleGetPublicDestination)
	}

	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	protected.Use(middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin))

	// Tenants CRUD routes under /tenants
	tenants := protected.Group("/tenants")
	{
		tenants.POST("", handler.HandleCreateTenant)
		tenants.GET("", handler.HandleListTenants)
		tenants.GET("/:id", handler.HandleGetTenant)
		tenants.PUT("/:id", handler.HandleUpdateTenant)
		tenants.DELETE("/:id", handler.HandleDeleteTenant)

		// Settings routes under /tenants/:id/settings
		tenants.PUT("/:id/settings", handler.HandleUpsertSetting)
		tenants.GET("/:id/settings", handler.HandleGetSettings)

		// Nested Destinations routes under /tenants
		tenants.POST("/:id/destinations", handler.HandleCreateDestination)
		tenants.GET("/:id/destinations", handler.HandleListDestinations)
	}

	// Destinations direct by ID routes under /destinations
	destinations := protected.Group("/destinations")
	{
		destinations.GET("/:id", handler.HandleGetDestination)
		destinations.PUT("/:id", handler.HandleUpdateDestination)
		destinations.DELETE("/:id", handler.HandleDeleteDestination)
	}
}

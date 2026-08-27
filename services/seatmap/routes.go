package seatmap

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

func RegisterRoutes(router *gin.RouterGroup, handler *SeatMapHandler, jwtSecret string) {
	// Public routes (browse layout)
	router.GET("/destinations/:destination_id/zones", handler.HandleListZones)
	router.GET("/zones/:id/layout", handler.HandleGetZoneLayout)
	router.POST("/release", handler.HandleReleaseSeats)

	// Protected routes (reserve seats)
	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	{
		protected.POST("/reserve", handler.HandleReserveSeats)

		// Admin only
		admin := protected.Group("")
		admin.Use(middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin))
		{
			admin.POST("/zones", handler.HandleCreateZone)
		}
	}
}

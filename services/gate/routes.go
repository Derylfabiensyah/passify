package gate

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// RegisterRoutes registers HTTP routes for the Gate Access Control Service
func RegisterRoutes(router *gin.RouterGroup, handler *GateHandler, jwtSecret string) {
	// Public / Device Scanner routes: ValidateTicket, GetManifest, SyncLogs
	router.POST("/validate", handler.HandleValidateTicket)
	router.GET("/devices/:device_id/manifest", handler.HandleGetManifest)
	router.POST("/devices/:device_id/sync-logs", handler.HandleSyncLogs)

	// Protected Admin & Gate Officer routes
	authGroup := router.Group("")
	authGroup.Use(middleware.AuthMiddleware(jwtSecret))

	adminOrGate := authGroup.Group("")
	adminOrGate.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
		models.RoleGateOfficer,
	))
	adminOrGate.POST("/devices", handler.HandleRegisterDevice)
	adminOrGate.GET("/destinations/:destination_id/stats", handler.HandleGetScanStats)

	// Admin only routes: ListDevices
	adminOnly := authGroup.Group("")
	adminOnly.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
	))
	adminOnly.GET("/destinations/:destination_id/devices", handler.HandleListDevices)
}

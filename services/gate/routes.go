package gate

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// RegisterRoutes registers HTTP routes for the Gate Access Control Service
func RegisterRoutes(router *gin.RouterGroup, handler *GateHandler, jwtSecret string) {
	// All routes require authentication
	authGroup := router.Group("")
	authGroup.Use(middleware.AuthMiddleware(jwtSecret))

	// Admin / Gate Officer routes: RegisterDevice, GetScanStats
	adminOrGate := authGroup.Group("")
	adminOrGate.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
		models.RoleGateOfficer,
	))
	adminOrGate.POST("/devices", handler.HandleRegisterDevice)
	adminOrGate.GET("/destinations/:destination_id/stats", handler.HandleGetScanStats)

	// Gate Officer routes: GetManifest, ValidateTicket, SyncLogs
	gateOfficer := authGroup.Group("")
	gateOfficer.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
		models.RoleGateOfficer,
	))
	gateOfficer.GET("/devices/:device_id/manifest", handler.HandleGetManifest)
	gateOfficer.POST("/validate", handler.HandleValidateTicket)
	gateOfficer.POST("/devices/:device_id/sync-logs", handler.HandleSyncLogs)

	// Admin only routes: ListDevices
	adminOnly := authGroup.Group("")
	adminOnly.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
	))
	adminOnly.GET("/destinations/:destination_id/devices", handler.HandleListDevices)
}

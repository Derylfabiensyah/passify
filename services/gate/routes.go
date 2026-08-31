package gate

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// RegisterRoutes registers HTTP routes for the Gate Access Control Service
func RegisterRoutes(router *gin.RouterGroup, handler *GateHandler, jwtSecret string) {
	// Public / Device Scanner routes: ValidateTicket, GetManifest, SyncLogs, Status
	router.POST("/validate", handler.HandleValidateTicket)
	router.GET("/status/:code", handler.HandleGetTicketStatus)
	router.GET("/devices/:device_id/manifest", handler.HandleGetManifest)
	router.POST("/devices/:device_id/sync-logs", handler.HandleSyncLogs)

	// Protected Admin & Gate Officer routes
	auth := router.Group("", middleware.AuthMiddleware(jwtSecret))
	auth.POST("/devices", middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin, models.RoleGateOfficer), handler.HandleRegisterDevice)
	auth.GET("/destinations/:destination_id/stats", middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin, models.RoleGateOfficer), handler.HandleGetScanStats)
	auth.GET("/destinations/:destination_id/devices", middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin), handler.HandleListDevices)
}

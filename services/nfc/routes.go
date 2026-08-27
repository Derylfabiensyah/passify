package nfc

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

func RegisterRoutes(router *gin.RouterGroup, handler *NFCHandler, jwtSecret string) {
	// Hardware/device endpoints (called by gate scanner & vendor POS hardware)
	router.POST("/tap-gate", handler.HandleTapGate)
	router.POST("/tap-pay", handler.HandleTapPay)
	router.GET("/:uid", handler.HandleGetWristband)

	// Officer/Staff protected endpoints
	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	protected.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
		models.RoleTenantStaff,
		models.RoleGateOfficer,
	))
	{
		protected.POST("/link", handler.HandleLinkWristband)
		protected.POST("/unlink", handler.HandleUnlinkWristband)
	}
}

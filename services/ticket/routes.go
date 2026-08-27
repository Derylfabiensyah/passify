package ticket

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

func RegisterRoutes(router *gin.RouterGroup, handler *TicketHandler, jwtSecret string) {
	// Public routes
	router.GET("/availability", handler.HandleCheckAvailability)
	router.GET("/destinations/:destination_id/categories", handler.HandleListCategories)
	router.GET("/destinations/:destination_id/time-slots", handler.HandleListTimeSlots)

	// Protected routes
	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	{
		protected.POST("/book", handler.HandleBookTickets)
		protected.POST("/queue/join", handler.HandleJoinQueue)
		protected.GET("/queue/status", handler.HandleCheckQueueStatus)
		protected.GET("/tickets/:id", handler.HandleGetTicket)
		protected.GET("/tickets/code/:code", handler.HandleGetTicketByCode)
		protected.POST("/tickets/:id/cancel", handler.HandleCancelTicket)
		
		// Admin only
		admin := protected.Group("")
		admin.Use(middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin))
		{
			admin.POST("/categories", handler.HandleCreateCategory)
			admin.PUT("/categories/:id", handler.HandleUpdateCategory)
			admin.DELETE("/categories/:id", handler.HandleDeleteCategory)
			admin.POST("/time-slots", handler.HandleCreateTimeSlot)
			admin.GET("/destinations/:destination_id/quotas", handler.HandleListQuotas)
		}
	}
}

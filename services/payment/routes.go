package payment

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// RegisterRoutes registers all payment service endpoints
func RegisterRoutes(router *gin.RouterGroup, handler *PaymentHandler, jwtSecret string) {
	// Public routes (validated via webhook token, not JWT)
	webhooks := router.Group("/webhooks")
	{
		webhooks.POST("/payment", handler.HandlePaymentWebhook)
		webhooks.POST("/payout", handler.HandlePayoutWebhook)
	}

	// Auth required routes
	authGroup := router.Group("")
	authGroup.Use(middleware.AuthMiddleware(jwtSecret))
	{
		authGroup.POST("/invoices", handler.HandleCreateInvoice)
		authGroup.GET("/transactions/:id", handler.HandleGetTransaction)
		authGroup.GET("/transactions/order/:order_number", handler.HandleGetTransactionByOrder)
		authGroup.GET("/my-transactions", handler.HandleListUserTransactions)

		// Admin only routes (SuperAdmin & TenantAdmin)
		adminGroup := authGroup.Group("")
		adminGroup.Use(middleware.RoleMiddleware(models.RoleSuperAdmin, models.RoleTenantAdmin))
		{
			adminGroup.GET("/tenants/:tenant_id/transactions", handler.HandleListTenantTransactions)
			adminGroup.POST("/payouts", handler.HandleInitiatePayout)
			adminGroup.GET("/tenants/:tenant_id/payouts", handler.HandleListPayouts)
		}
	}
}

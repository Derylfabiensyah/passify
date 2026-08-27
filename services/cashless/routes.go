package cashless

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// RegisterRoutes registers all endpoints for the Cashless service
func RegisterRoutes(router *gin.RouterGroup, handler *CashlessHandler, jwtSecret string) {
	// Public routes (for visitor browsing)
	router.GET("/destinations/:destination_id/booths", handler.HandleListBooths)
	router.GET("/booths/:booth_id/products", handler.HandleListProducts)

	// Auth required (visitors and above)
	authenticated := router.Group("")
	authenticated.Use(middleware.AuthMiddleware(jwtSecret))
	{
		authenticated.GET("/wallet", handler.HandleGetWallet)
		authenticated.POST("/wallet/topup", handler.HandleTopUp)
		authenticated.POST("/wallet/pay", handler.HandlePay)
		authenticated.POST("/wallet/auto-refund", handler.HandleAutoRefund)
		authenticated.GET("/wallet/transactions", handler.HandleTransactionHistory)
	}

	// Admin and Vendor routes
	adminVendor := router.Group("")
	adminVendor.Use(middleware.AuthMiddleware(jwtSecret))
	adminVendor.Use(middleware.RoleMiddleware(
		models.RoleSuperAdmin,
		models.RoleTenantAdmin,
		models.RoleTenantStaff,
		models.RoleVendor,
	))
	{
		adminVendor.POST("/booths", handler.HandleCreateBooth)
		adminVendor.PUT("/booths/:id", handler.HandleUpdateBooth)
		adminVendor.POST("/products", handler.HandleCreateProduct)
		adminVendor.GET("/booths/:booth_id/sales", handler.HandleListBoothSales)
		adminVendor.POST("/wallet/refund", handler.HandleRefund)
	}
}

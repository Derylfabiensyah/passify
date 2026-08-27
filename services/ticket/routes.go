package ticket

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

func RegisterRoutes(router *gin.RouterGroup, handler *TicketHandler, jwtSecret string, redisClient ...*redis.Client) {
	// Public routes
	router.GET("/availability", handler.HandleCheckAvailability)
	router.GET("/destinations/:destination_id/categories", handler.HandleListCategories)
	router.GET("/destinations/:destination_id/time-slots", handler.HandleListTimeSlots)

	// Protected routes
	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Apply rate limiting + device fingerprint on booking-critical routes
		var rdb *redis.Client
		if len(redisClient) > 0 {
			rdb = redisClient[0]
		}

		if rdb != nil {
			// Strict rate limit for booking: 10 requests / minute per user+IP
			bookRateLimit := middleware.RateLimitMiddleware(rdb, middleware.RateLimitConfig{
				MaxRequests: 10,
				Window:      1 * time.Minute,
				KeyFunc:     middleware.BookingKeyFunc,
			})
			// Queue join: 5 requests / minute
			queueRateLimit := middleware.RateLimitMiddleware(rdb, middleware.RateLimitConfig{
				MaxRequests: 5,
				Window:      1 * time.Minute,
				KeyFunc:     middleware.BookingKeyFunc,
			})
			fingerprintCheck := middleware.DeviceFingerprintMiddleware(rdb)

			protected.POST("/book", fingerprintCheck, bookRateLimit, handler.HandleBookTickets)
			protected.POST("/queue/join", fingerprintCheck, queueRateLimit, handler.HandleJoinQueue)
		} else {
			protected.POST("/book", handler.HandleBookTickets)
			protected.POST("/queue/join", handler.HandleJoinQueue)
		}

		protected.GET("/queue/status", handler.HandleCheckQueueStatus)
		protected.GET("/tickets/:id", handler.HandleGetTicket)
		protected.GET("/tickets/:id/qr", handler.HandleGetLiveQR)
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

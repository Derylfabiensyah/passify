package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
)

// RegisterRoutes registers authentication endpoints on the given router group
func RegisterRoutes(router *gin.RouterGroup, handler *AuthHandler, jwtSecret string) {
	// Public routes
	router.POST("/register", handler.HandleRegister)
	router.POST("/register-tenant", handler.HandleRegisterTenant)
	router.GET("/check-subdomain", handler.HandleCheckSubdomain)
	router.GET("/verify-email", handler.HandleVerifyEmail)
	router.POST("/login", handler.HandleLogin)
	router.POST("/refresh-token", handler.HandleRefreshToken)

	// Protected routes
	protected := router.Group("")
	protected.Use(middleware.AuthMiddleware(jwtSecret))
	{
		protected.GET("/profile", handler.HandleGetProfile)
		protected.PUT("/profile", handler.HandleUpdateProfile)
		protected.POST("/logout", handler.HandleLogout)
	}
}

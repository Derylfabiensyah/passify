package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"github.com/tiket-wisata-alam/backend/internal/response"
	"github.com/tiket-wisata-alam/backend/services/tenant"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	db, err := database.NewPostgresConnection(&cfg.DB, cfg.AppEnv)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate models relevant to tenant service
	err = db.AutoMigrate(
		&models.Tenant{},
		&models.TenantSetting{},
		&models.Destination{},
	)
	if err != nil {
		log.Printf("Warning: Database auto-migration issue: %v", err)
	}

	// Set Gin mode according to environment
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Gin router
	router := gin.Default()

	// Global middlewares
	router.Use(middleware.CORSMiddleware(cfg.CORSAllowedOrigins))

	// API v1 group
	v1 := router.Group("/api/v1")

	// Health check endpoint
	v1.GET("/health", func(c *gin.Context) {
		response.OK(c, "Tenant service is healthy", gin.H{
			"service": "tenant-service",
			"status":  "UP",
		})
	})

	// Instantiate layers
	repo := tenant.NewRepository(db)
	svc := tenant.NewService(repo)
	handler := tenant.NewHandler(svc)

	// Register tenant service routes
	tenant.RegisterRoutes(v1, handler, cfg.JWT.Secret)

	// Start server on TenantServicePort
	port := cfg.TenantServicePort
	if port == "" {
		port = "8082"
	}
	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 tenant-service running on port %s", port)
	if err := router.Run(addr); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start tenant-service: %v", err)
	}
}

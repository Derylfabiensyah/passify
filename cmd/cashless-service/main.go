package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
	"github.com/tiket-wisata-alam/backend/services/cashless"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to PostgreSQL database
	db, err := database.NewPostgresConnection(&cfg.DB, cfg.AppEnv)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize repository, service, handler
	repo := cashless.NewCashlessRepository(db)
	service := cashless.NewCashlessService(db, repo)
	handler := cashless.NewCashlessHandler(service)

	// Set Gin mode based on environment
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware(cfg.CORSAllowedOrigins))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		response.OK(c, "Cashless Service is healthy", gin.H{
			"status":  "UP",
			"service": "cashless-service",
		})
	})

	// API Group
	api := router.Group("/api/v1/cashless")
	cashless.RegisterRoutes(api, handler, cfg.JWT.Secret)

	port := cfg.CashlessServicePort
	if port == "" {
		port = "8085"
	}
	addr := fmt.Sprintf(":%s", port)

	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("🚀 Cashless Service listening on port %s", port)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}

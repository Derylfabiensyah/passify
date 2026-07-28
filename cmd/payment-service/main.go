package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
	"github.com/tiket-wisata-alam/backend/services/payment"
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

	// Set Gin mode
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Repository, Service, and Handler
	paymentRepo := payment.NewPaymentRepository(db)
	paymentService := payment.NewPaymentService(paymentRepo, cfg, db)
	paymentHandler := payment.NewPaymentHandler(paymentService, cfg)

	// Setup Gin router
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware(cfg.CORSAllowedOrigins))

	// Health check route
	router.GET("/health", func(c *gin.Context) {
		response.OK(c, "Payment service is healthy", gin.H{
			"service": "payment-service",
			"status":  "UP",
		})
	})

	// Register payment service routes under /api/v1/payments
	apiGroup := router.Group("/api/v1/payments")
	payment.RegisterRoutes(apiGroup, paymentHandler, cfg.JWT.Secret)

	// Start server on cfg.PaymentServicePort
	port := cfg.PaymentServicePort
	if port == "" {
		port = "8084"
	}
	serverAddr := fmt.Sprintf(":%s", port)

	log.Printf("🚀 Payment service starting on port %s...", port)
	if err := router.Run(serverAddr); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to run payment service: %v", err)
	}
}

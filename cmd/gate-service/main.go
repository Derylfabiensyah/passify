package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
	"github.com/tiket-wisata-alam/backend/services/gate"
)

func main() {
	// Load application configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to PostgreSQL database
	db, err := database.NewPostgresConnection(&cfg.DB, cfg.AppEnv)
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}

	// Initialize Repository, Service, and Handler
	gateRepo := gate.NewGateRepository(db)
	gateService := gate.NewGateService(db, gateRepo)
	gateHandler := gate.NewGateHandler(gateService)

	// Setup Gin router
	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(middleware.CORSMiddleware(cfg.CORSAllowedOrigins))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		response.OK(c, "Gate Access Control Service is healthy", gin.H{
			"status":    "up",
			"timestamp": time.Now(),
		})
	})

	// Register API v1 Gate routes
	api := router.Group("/api/v1/gate")
	gate.RegisterRoutes(api, gateHandler, cfg.JWT.Secret)

	port := cfg.GateServicePort
	if port == "" {
		port = "8086"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	// Start server in goroutine
	go func() {
		log.Printf("🚀 Gate Access Control Service running on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start Gate Access Control Service: %v", err)
		}
	}()

	// Graceful shutdown listener
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down Gate Access Control Service...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Gate Access Control Service forced to shutdown: %v", err)
	}

	log.Println("Gate Access Control Service stopped gracefully")
}

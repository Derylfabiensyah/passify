package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/services/auth"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db, err := database.NewPostgresConnection(&cfg.DB, cfg.AppEnv)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	rdb, err := database.NewRedisClient(&cfg.Redis)
	if err != nil {
		log.Printf("⚠️ Redis connection warning: %v (running with limited caching)", err)
	}

	repo := auth.NewAuthRepository(db)
	service := auth.NewAuthService(repo, cfg, rdb)
	handler := auth.NewAuthHandler(service)

	router := gin.Default()
	router.Use(middleware.CORSMiddleware(cfg.CORSAllowedOrigins))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "auth-service",
		})
	})

	// Register auth service routes
	authGroup := router.Group("/api/v1/auth")
	auth.RegisterRoutes(authGroup, handler, cfg.JWT.Secret)

	port := cfg.AuthServicePort
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	log.Printf("🚀 Auth Service running on port %s", port)
	if err := router.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

package main

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/database"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/services/nfc"
	"github.com/tiket-wisata-alam/backend/services/seatmap"
	"github.com/tiket-wisata-alam/backend/services/ticket"
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

	redisClient, err := database.NewRedisClient(&cfg.Redis)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}

	repo := ticket.NewTicketRepository(db)
	svc := ticket.NewTicketService(repo, redisClient, cfg)
	handler := ticket.NewTicketHandler(svc)

	router := gin.Default()
	router.Use(middleware.CORSMiddleware(cfg.CORSAllowedOrigins))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "ticket-service",
		})
	})

	// Register ticket service routes
	ticketGroup := router.Group("/api/v1/tickets")
	ticket.RegisterRoutes(ticketGroup, handler, cfg.JWT.Secret, redisClient)

	// Register interactive seatmap routes
	seatMapSvc := seatmap.NewSeatMapService(db, redisClient)
	seatMapHandler := seatmap.NewSeatMapHandler(seatMapSvc)
	seatMapGroup := router.Group("/api/v1/seatmap")
	seatmap.RegisterRoutes(seatMapGroup, seatMapHandler, cfg.JWT.Secret)

	// Register NFC wristband sync & tap routes
	nfcSvc := nfc.NewNFCService(db)
	nfcHandler := nfc.NewNFCHandler(nfcSvc)
	nfcGroup := router.Group("/api/v1/nfc")
	nfc.RegisterRoutes(nfcGroup, nfcHandler, cfg.JWT.Secret)

	port := cfg.TicketServicePort
	if !strings.HasPrefix(port, ":") {
		port = ":" + port
	}

	log.Printf("🚀 Ticket Service running on port %s", port)
	if err := router.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

package seatmap

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

type SeatMapHandler struct {
	service SeatMapService
}

func NewSeatMapHandler(service SeatMapService) *SeatMapHandler {
	return &SeatMapHandler{service: service}
}

// HandleListZones handles GET /seatmap/destinations/:destination_id/zones
func (h *SeatMapHandler) HandleListZones(c *gin.Context) {
	destID, err := uuid.Parse(c.Param("destination_id"))
	if err != nil {
		response.BadRequest(c, "Invalid destination ID", err.Error())
		return
	}

	zones, err := h.service.ListZones(destID)
	if err != nil {
		response.InternalServerError(c, "Failed to list zones")
		return
	}

	response.OK(c, "Zones retrieved", zones)
}

// HandleGetZoneLayout handles GET /seatmap/zones/:id/layout
func (h *SeatMapHandler) HandleGetZoneLayout(c *gin.Context) {
	zoneID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid zone ID", err.Error())
		return
	}

	layout, err := h.service.GetZoneLayout(zoneID)
	if err != nil {
		response.NotFound(c, "Zone layout not found")
		return
	}

	response.OK(c, "Zone layout retrieved", layout)
}

// HandleCreateZone handles POST /seatmap/zones (admin only)
func (h *SeatMapHandler) HandleCreateZone(c *gin.Context) {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		response.BadRequest(c, "Tenant ID missing from context", nil)
		return
	}

	var req CreateZoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	zone, err := h.service.CreateZoneWithSeats(tenantID, req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Seat zone and matrix created", zone)
}

// HandleReserveSeats handles POST /seatmap/reserve (visitor checkout)
func (h *SeatMapHandler) HandleReserveSeats(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req ReserveSeatsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}

	res, err := h.service.ReserveSeats(userID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Seats locked successfully for checkout", res)
}

// HandleReleaseSeats handles POST /seatmap/release
func (h *SeatMapHandler) HandleReleaseSeats(c *gin.Context) {
	var body struct {
		SessionID string `json:"session_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "session_id is required", err.Error())
		return
	}

	if err := h.service.ReleaseSeats(body.SessionID); err != nil {
		response.InternalServerError(c, "Failed to release seats")
		return
	}

	response.OK(c, "Seats released successfully", nil)
}

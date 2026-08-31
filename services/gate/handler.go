package gate

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

// GateHandler handles HTTP requests for Gate Access Control Service
type GateHandler struct {
	service GateService
}

// NewGateHandler creates a new instance of GateHandler
func NewGateHandler(service GateService) *GateHandler {
	return &GateHandler{service: service}
}

// HandleRegisterDevice registers a new gate scanner device
// POST /devices
func (h *GateHandler) HandleRegisterDevice(c *gin.Context) {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		response.Unauthorized(c, "Tenant context required")
		return
	}

	var req RegisterDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	device, err := h.service.RegisterDevice(tenantID, req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Created(c, "Gate device registered successfully", device)
}

// HandleListDevices lists all gate scanner devices for a destination
// GET /destinations/:destination_id/devices
func (h *GateHandler) HandleListDevices(c *gin.Context) {
	destIDStr := c.Param("destination_id")
	destID, err := uuid.Parse(destIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid destination ID format", nil)
		return
	}

	devices, err := h.service.ListDevices(destID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Gate devices retrieved successfully", devices)
}

// HandleGetManifest generates a ticket manifest for offline cache
// GET /devices/:device_id/manifest (query: date=YYYY-MM-DD)
func (h *GateHandler) HandleGetManifest(c *gin.Context) {
	deviceIDStr := c.Param("device_id")
	deviceID, err := uuid.Parse(deviceIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid device ID format", nil)
		return
	}

	date := parseDateQuery(c, "date")

	manifest, err := h.service.GenerateManifest(deviceID, date)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Manifest generated successfully", manifest)
}

// HandleValidateTicket validates a ticket online in real-time
// POST /validate
func (h *GateHandler) HandleValidateTicket(c *gin.Context) {
	var req OnlineValidateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	if req.ScannedAt.IsZero() {
		req.ScannedAt = time.Now()
	}

	res, err := h.service.ValidateTicketOnline(req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Validation completed", res)
}

// HandleSyncLogs syncs offline scan logs from a gate device
// POST /devices/:device_id/sync-logs
func (h *GateHandler) HandleSyncLogs(c *gin.Context) {
	deviceIDStr := c.Param("device_id")

	var req SyncLogsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	if req.DeviceID == uuid.Nil && deviceIDStr != "" {
		if devID, err := uuid.Parse(deviceIDStr); err == nil {
			req.DeviceID = devID
		}
	}

	if req.DeviceID == uuid.Nil {
		response.BadRequest(c, "Device ID is required", nil)
		return
	}

	res, err := h.service.SyncOfflineLogs(req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Offline logs synced successfully", res)
}

// HandleGetScanStats returns scan statistics for a destination
// GET /destinations/:destination_id/stats (query: date=YYYY-MM-DD)
func (h *GateHandler) HandleGetScanStats(c *gin.Context) {
	destIDStr := c.Param("destination_id")
	destID, err := uuid.Parse(destIDStr)
	if err != nil {
		response.BadRequest(c, "Invalid destination ID format", nil)
		return
	}

	date := parseDateQuery(c, "date")

	stats, err := h.service.GetScanStats(destID, date)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Scan stats retrieved successfully", stats)
}

// HandleGetTicketStatus returns the live usage status of a ticket
// GET /status/:code
func (h *GateHandler) HandleGetTicketStatus(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		response.BadRequest(c, "Ticket code is required", nil)
		return
	}

	status, err := h.service.GetTicketStatus(code)
	if err != nil {
		response.NotFound(c, "Ticket not found")
		return
	}

	response.OK(c, "Ticket status retrieved", status)
}

// parseDateQuery extracts date parameter from query, default today
func parseDateQuery(c *gin.Context, paramName string) time.Time {
	dateStr := c.Query(paramName)
	if dateStr == "" {
		return time.Now()
	}
	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Now()
	}
	return parsedDate
}

package ticket

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

type TicketHandler struct {
	service TicketService
}

func NewTicketHandler(service TicketService) *TicketHandler {
	return &TicketHandler{service: service}
}

func (h *TicketHandler) HandleCreateCategory(c *gin.Context) {
	tenantID, _ := middleware.GetTenantID(c)
	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}
	cat, err := h.service.CreateCategory(tenantID, req)
	if err != nil {
		response.InternalServerError(c, "Failed to create category")
		return
	}
	response.Success(c, http.StatusCreated, "Category created successfully", cat)
}

func (h *TicketHandler) HandleListCategories(c *gin.Context) {
	destID, err := uuid.Parse(c.Param("destination_id"))
	if err != nil {
		response.BadRequest(c, "Invalid destination ID", err.Error())
		return
	}
	cats, err := h.service.ListCategories(destID)
	if err != nil {
		response.InternalServerError(c, "Failed to list categories")
		return
	}
	response.Success(c, http.StatusOK, "Categories retrieved", cats)
}

func (h *TicketHandler) HandleUpdateCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid category ID", err.Error())
		return
	}
	var req UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}
	cat, err := h.service.UpdateCategory(id, req)
	if err != nil {
		response.InternalServerError(c, "Failed to update category")
		return
	}
	response.Success(c, http.StatusOK, "Category updated successfully", cat)
}

func (h *TicketHandler) HandleDeleteCategory(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid category ID", err.Error())
		return
	}
	if err := h.service.DeleteCategory(id); err != nil {
		response.InternalServerError(c, "Failed to delete category")
		return
	}
	response.Success(c, http.StatusOK, "Category deleted successfully", nil)
}

func (h *TicketHandler) HandleCreateTimeSlot(c *gin.Context) {
	tenantID, _ := middleware.GetTenantID(c)
	var req CreateTimeSlotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}
	slot, err := h.service.CreateTimeSlot(tenantID, req)
	if err != nil {
		response.InternalServerError(c, "Failed to create time slot")
		return
	}
	response.Success(c, http.StatusCreated, "Time slot created successfully", slot)
}

func (h *TicketHandler) HandleListTimeSlots(c *gin.Context) {
	destID, err := uuid.Parse(c.Param("destination_id"))
	if err != nil {
		response.BadRequest(c, "Invalid destination ID", err.Error())
		return
	}
	slots, err := h.service.ListTimeSlots(destID)
	if err != nil {
		response.InternalServerError(c, "Failed to list time slots")
		return
	}
	response.Success(c, http.StatusOK, "Time slots retrieved", slots)
}

func (h *TicketHandler) HandleCheckAvailability(c *gin.Context) {
	destID, err := uuid.Parse(c.Query("destination_id"))
	if err != nil {
		response.BadRequest(c, "Invalid destination ID", err.Error())
		return
	}
	visitDate, err := time.Parse("2006-01-02", c.Query("visit_date"))
	if err != nil {
		response.BadRequest(c, "Invalid visit date format (YYYY-MM-DD)", err.Error())
		return
	}
	
	req := CheckAvailabilityRequest{
		DestinationID: destID,
		VisitDate:     visitDate,
	}
	
	if tsID := c.Query("time_slot_id"); tsID != "" {
		id, _ := uuid.Parse(tsID)
		req.TimeSlotID = &id
	}

	avail, err := h.service.CheckAvailability(req)
	if err != nil {
		response.InternalServerError(c, "Failed to check availability")
		return
	}
	response.Success(c, http.StatusOK, "Availability retrieved", avail)
}

func (h *TicketHandler) HandleBookTickets(c *gin.Context) {
	tenantID, _ := middleware.GetTenantID(c)
	userID, _ := middleware.GetUserID(c)
	
	var req BookTicketsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}
	
	resp, err := h.service.BookTickets(tenantID, userID, req)
	if err != nil {
		response.InternalServerError(c, "Failed to book tickets")
		return
	}
	response.Success(c, http.StatusOK, "Tickets booked successfully", resp)
}

func (h *TicketHandler) HandleGetTicket(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ticket ID", err.Error())
		return
	}
	ticket, err := h.service.GetTicket(id)
	if err != nil {
		response.NotFound(c, "Ticket not found")
		return
	}
	response.Success(c, http.StatusOK, "Ticket retrieved", ticket)
}

func (h *TicketHandler) HandleGetTicketByCode(c *gin.Context) {
	code := c.Param("code")
	ticket, err := h.service.GetTicketByCode(code)
	if err != nil {
		response.NotFound(c, "Ticket not found")
		return
	}
	response.Success(c, http.StatusOK, "Ticket retrieved", ticket)
}

func (h *TicketHandler) HandleListQuotas(c *gin.Context) {
	destID, err := uuid.Parse(c.Param("destination_id"))
	if err != nil {
		response.BadRequest(c, "Invalid destination ID", err.Error())
		return
	}
	startDate, _ := time.Parse("2006-01-02", c.Query("start_date"))
	endDate, _ := time.Parse("2006-01-02", c.Query("end_date"))
	
	quotas, err := h.service.ListQuotas(destID, startDate, endDate)
	if err != nil {
		response.InternalServerError(c, "Failed to list quotas")
		return
	}
	response.Success(c, http.StatusOK, "Quotas retrieved", quotas)
}

func (h *TicketHandler) HandleCancelTicket(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "Invalid ticket ID", err.Error())
		return
	}
	if err := h.service.CancelTicket(id); err != nil {
		response.InternalServerError(c, "Failed to cancel ticket")
		return
	}
	response.Success(c, http.StatusOK, "Ticket cancelled successfully", nil)
}

func (h *TicketHandler) HandleJoinQueue(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	var req JoinQueueRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body", err.Error())
		return
	}
	
	resp, err := h.service.JoinQueue(userID, req)
	if err != nil {
		response.InternalServerError(c, "Failed to join queue")
		return
	}
	response.Success(c, http.StatusOK, "Joined queue", resp)
}

func (h *TicketHandler) HandleCheckQueueStatus(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)
	destID, err := uuid.Parse(c.Query("destination_id"))
	if err != nil {
		response.BadRequest(c, "Invalid destination ID", err.Error())
		return
	}
	visitDate := c.Query("visit_date")
	if visitDate == "" {
		response.BadRequest(c, "Visit date is required", "Missing visit_date")
		return
	}
	
	resp, err := h.service.CheckQueueStatus(userID, destID, visitDate)
	if err != nil {
		response.NotFound(c, "Not in queue")
		return
	}
	response.Success(c, http.StatusOK, "Queue status retrieved", resp)
}

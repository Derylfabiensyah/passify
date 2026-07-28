package payment

import (
	"errors"
	"math"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

// PaymentHandler handles HTTP requests for payment management
type PaymentHandler struct {
	service *PaymentService
	cfg     *config.Config
}

// NewPaymentHandler creates a new PaymentHandler instance
func NewPaymentHandler(service *PaymentService, cfg *config.Config) *PaymentHandler {
	return &PaymentHandler{
		service: service,
		cfg:     cfg,
	}
}

// CreateInvoiceRequest request body struct for invoice creation
type CreateInvoiceRequest struct {
	TransactionID uuid.UUID `json:"transaction_id" binding:"required"`
}

// InitiatePayoutBody request body struct for payout initiation
type InitiatePayoutBody struct {
	TenantID    uuid.UUID `json:"tenant_id" binding:"required"`
	PeriodStart time.Time `json:"period_start" binding:"required"`
	PeriodEnd   time.Time `json:"period_end" binding:"required"`
}

// HandleCreateInvoice handles POST /invoices
func (h *PaymentHandler) HandleCreateInvoice(c *gin.Context) {
	var req CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	res, err := h.service.CreatePaymentInvoice(req.TransactionID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Invoice payment berhasil dibuat", res)
}

// HandlePaymentWebhook handles POST /webhooks/payment
func (h *PaymentHandler) HandlePaymentWebhook(c *gin.Context) {
	if h.cfg.XenditWebhookToken != "" {
		token := c.GetHeader("X-Webhook-Token")
		if token != h.cfg.XenditWebhookToken {
			response.Unauthorized(c, "Token webhook tidak valid")
			return
		}
	}

	var req WebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format data webhook tidak valid", err.Error())
		return
	}

	if err := h.service.HandlePaymentWebhook(req); err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Webhook pembayaran berhasil diproses", nil)
}

// HandleGetTransaction handles GET /transactions/:id
func (h *PaymentHandler) HandleGetTransaction(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID transaksi tidak valid", nil)
		return
	}

	tx, err := h.service.GetTransaction(id)
	if err != nil {
		response.NotFound(c, "Transaksi tidak ditemukan")
		return
	}

	if err := authorizeTransactionAccess(c, tx); err != nil {
		response.Forbidden(c, err.Error())
		return
	}

	response.OK(c, "Detail transaksi", tx)
}

// HandleGetTransactionByOrder handles GET /transactions/order/:order_number
func (h *PaymentHandler) HandleGetTransactionByOrder(c *gin.Context) {
	orderNumber := c.Param("order_number")
	if orderNumber == "" {
		response.BadRequest(c, "Nomor order diperlukan", nil)
		return
	}

	tx, err := h.service.GetTransactionByOrderNumber(orderNumber)
	if err != nil {
		response.NotFound(c, "Transaksi tidak ditemukan")
		return
	}

	if err := authorizeTransactionAccess(c, tx); err != nil {
		response.Forbidden(c, err.Error())
		return
	}

	response.OK(c, "Detail transaksi", tx)
}

// HandleListTenantTransactions handles GET /tenants/:tenant_id/transactions
func (h *PaymentHandler) HandleListTenantTransactions(c *gin.Context) {
	tenantIDStr := c.Param("tenant_id")
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		response.BadRequest(c, "Tenant ID tidak valid", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	status := c.Query("status")

	txs, total, err := h.service.ListTenantTransactions(tenantID, page, perPage, status)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	totalPages := 0
	if perPage > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(perPage)))
	}

	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}

	response.SuccessWithMeta(c, "Daftar transaksi tenant", txs, meta)
}

// HandleListUserTransactions handles GET /my-transactions
func (h *PaymentHandler) HandleListUserTransactions(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "User ID tidak ditemukan")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

	txs, total, err := h.service.ListUserTransactions(userID, page, perPage)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	totalPages := 0
	if perPage > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(perPage)))
	}

	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}

	response.SuccessWithMeta(c, "Daftar transaksi saya", txs, meta)
}

// HandleInitiatePayout handles POST /payouts
func (h *PaymentHandler) HandleInitiatePayout(c *gin.Context) {
	var body InitiatePayoutBody
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	req := InitiatePayoutRequest{
		PeriodStart: body.PeriodStart,
		PeriodEnd:   body.PeriodEnd,
	}

	payout, err := h.service.InitiatePayout(body.TenantID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Payout berhasil diinisiasi", payout)
}

// HandleListPayouts handles GET /tenants/:tenant_id/payouts
func (h *PaymentHandler) HandleListPayouts(c *gin.Context) {
	tenantIDStr := c.Param("tenant_id")
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		response.BadRequest(c, "Tenant ID tidak valid", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))

	payouts, total, err := h.service.ListPayouts(tenantID, page, perPage)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	totalPages := 0
	if perPage > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(perPage)))
	}

	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}

	response.SuccessWithMeta(c, "Daftar payout tenant", payouts, meta)
}

// HandlePayoutWebhook handles POST /webhooks/payout
func (h *PaymentHandler) HandlePayoutWebhook(c *gin.Context) {
	if h.cfg.XenditWebhookToken != "" {
		token := c.GetHeader("X-Webhook-Token")
		if token != h.cfg.XenditWebhookToken {
			response.Unauthorized(c, "Token webhook tidak valid")
			return
		}
	}

	var req PayoutWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format data webhook payout tidak valid", err.Error())
		return
	}

	if err := h.service.HandlePayoutWebhook(req); err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Webhook payout berhasil diproses", nil)
}

// authorizeTransactionAccess checks whether the requesting user is allowed to access the transaction
func authorizeTransactionAccess(c *gin.Context, tx *models.Transaction) error {
	role := middleware.GetUserRole(c)
	if role == models.RoleSuperAdmin {
		return nil
	}

	userID, err := middleware.GetUserID(c)
	if err == nil && tx.UserID == userID {
		return nil
	}

	tenantID, err := middleware.GetTenantID(c)
	if err == nil && (role == models.RoleTenantAdmin || role == models.RoleTenantStaff || role == models.RoleGateOfficer) {
		if tx.TenantID == tenantID {
			return nil
		}
	}

	return errors.New("Anda tidak memiliki akses ke transaksi ini")
}

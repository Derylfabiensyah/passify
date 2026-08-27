package cashless

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

// RefundRequest DTO for admin refund handler
type RefundRequest struct {
	UserID      uuid.UUID `json:"user_id" binding:"required"`
	Amount      float64   `json:"amount" binding:"required"`
	ReferenceID string    `json:"reference_id"`
}

// CashlessHandler handles HTTP requests for cashless wallet operations
type CashlessHandler struct {
	service *CashlessService
}

// NewCashlessHandler creates a new CashlessHandler instance
func NewCashlessHandler(service *CashlessService) *CashlessHandler {
	return &CashlessHandler{service: service}
}

// HandleGetWallet handles GET /wallet
func (h *CashlessHandler) HandleGetWallet(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "Autentikasi diperlukan")
		return
	}

	wallet, err := h.service.GetWalletBalance(userID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Informasi wallet berhasil diambil", wallet)
}

// HandleTopUp handles POST /wallet/topup
func (h *CashlessHandler) HandleTopUp(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "Autentikasi diperlukan")
		return
	}

	var req TopUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	wallet, tx, err := h.service.TopUp(userID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Top-up saldo berhasil", gin.H{
		"wallet":      wallet,
		"transaction": tx,
	})
}

// HandlePay handles POST /wallet/pay
func (h *CashlessHandler) HandlePay(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "Autentikasi diperlukan")
		return
	}

	var req PayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	wallet, tx, err := h.service.Pay(userID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Pembayaran berhasil", gin.H{
		"wallet":      wallet,
		"transaction": tx,
	})
}

// HandleRefund handles POST /wallet/refund (admin only)
func (h *CashlessHandler) HandleRefund(c *gin.Context) {
	var req RefundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	wallet, tx, err := h.service.RefundWallet(req.UserID, req.Amount, req.ReferenceID)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Refund wallet berhasil", gin.H{
		"wallet":      wallet,
		"transaction": tx,
	})
}

// AutoRefundRequest payload for visitor self auto-refund
type AutoRefundRequest struct {
	PayoutChannel string `json:"payout_channel"` // 'BCA', 'GoPay', 'OVO', 'ShopeePay'
	AccountNumber string `json:"account_number"` // Bank account number or e-wallet phone number
}

// HandleAutoRefund handles POST /wallet/auto-refund (visitor self-service)
func (h *CashlessHandler) HandleAutoRefund(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "Autentikasi diperlukan")
		return
	}

	var req AutoRefundRequest
	// optional body: can be empty to use default
	_ = c.ShouldBindJSON(&req)

	channel := req.PayoutChannel
	if channel == "" {
		channel = "Rekening Utama"
	}
	account := req.AccountNumber
	if account == "" {
		account = "Terdaftar"
	}

	wallet, tx, refundAmount, err := h.service.AutoRefundRemainingBalance(userID, channel, account)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Auto-refund sisa saldo berhasil diproses", gin.H{
		"refunded_amount": refundAmount,
		"payout_channel":  channel,
		"account_number":  account,
		"wallet":          wallet,
		"transaction":     tx,
	})
}

// HandleTransactionHistory handles GET /wallet/transactions
func (h *CashlessHandler) HandleTransactionHistory(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "Autentikasi diperlukan")
		return
	}

	page, perPage := parsePagination(c)

	txs, total, err := h.service.GetTransactionHistory(userID, page, perPage)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(perPage)))
	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}

	response.SuccessWithMeta(c, "Riwayat transaksi berhasil diambil", txs, meta)
}

// HandleCreateBooth handles POST /booths
func (h *CashlessHandler) HandleCreateBooth(c *gin.Context) {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		response.BadRequest(c, "Tenant ID tidak ditemukan pada konteks", nil)
		return
	}

	var req CreateBoothRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	booth, err := h.service.CreateBooth(tenantID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Vendor booth berhasil dibuat", booth)
}

// HandleListBooths handles GET /destinations/:destination_id/booths
func (h *CashlessHandler) HandleListBooths(c *gin.Context) {
	destIDStr := c.Param("destination_id")
	destID, err := uuid.Parse(destIDStr)
	if err != nil {
		response.BadRequest(c, "ID destinasi tidak valid", nil)
		return
	}

	booths, err := h.service.ListBooths(destID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Daftar vendor booth berhasil diambil", booths)
}

// HandleUpdateBooth handles PUT /booths/:id
func (h *CashlessHandler) HandleUpdateBooth(c *gin.Context) {
	boothIDStr := c.Param("id")
	boothID, err := uuid.Parse(boothIDStr)
	if err != nil {
		response.BadRequest(c, "ID vendor booth tidak valid", nil)
		return
	}

	var req UpdateBoothRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	booth, err := h.service.UpdateBooth(boothID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Vendor booth berhasil diperbarui", booth)
}

// HandleCreateProduct handles POST /products
func (h *CashlessHandler) HandleCreateProduct(c *gin.Context) {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		response.BadRequest(c, "Tenant ID tidak ditemukan pada konteks", nil)
		return
	}

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	product, err := h.service.CreateProduct(tenantID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Produk vendor berhasil dibuat", product)
}

// HandleListProducts handles GET /booths/:booth_id/products
func (h *CashlessHandler) HandleListProducts(c *gin.Context) {
	boothIDStr := c.Param("booth_id")
	boothID, err := uuid.Parse(boothIDStr)
	if err != nil {
		response.BadRequest(c, "ID vendor booth tidak valid", nil)
		return
	}

	products, err := h.service.ListProducts(boothID)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Daftar produk vendor berhasil diambil", products)
}

// HandleListBoothSales handles GET /booths/:booth_id/sales
func (h *CashlessHandler) HandleListBoothSales(c *gin.Context) {
	boothIDStr := c.Param("booth_id")
	boothID, err := uuid.Parse(boothIDStr)
	if err != nil {
		response.BadRequest(c, "ID vendor booth tidak valid", nil)
		return
	}

	page, perPage := parsePagination(c)

	sales, total, err := h.service.ListBoothSales(boothID, page, perPage)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(perPage)))
	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}

	response.SuccessWithMeta(c, "Daftar penjualan vendor berhasil diambil", sales, meta)
}

func parsePagination(c *gin.Context) (int, int) {
	pageStr := c.Query("page")
	perPageStr := c.Query("per_page")

	page := 1
	perPage := 10

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 {
			perPage = pp
		}
	}

	return page, perPage
}

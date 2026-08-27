package nfc

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

type NFCHandler struct {
	service NFCService
}

func NewNFCHandler(service NFCService) *NFCHandler {
	return &NFCHandler{service: service}
}

// HandleLinkWristband handles POST /nfc/link (Gate officer / Admin links wristband)
func (h *NFCHandler) HandleLinkWristband(c *gin.Context) {
	tenantID, err := middleware.GetTenantID(c)
	if err != nil {
		response.BadRequest(c, "Tenant ID missing from context", nil)
		return
	}

	var req LinkWristbandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	wb, err := h.service.LinkWristband(tenantID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Gelang NFC berhasil ditautkan ke tiket & dompet digital", wb)
}

// HandleTapGate handles POST /nfc/tap-gate (Gate scanner device tap)
func (h *NFCHandler) HandleTapGate(c *gin.Context) {
	var req TapGateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	res, err := h.service.TapGate(req)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	if !res.Valid {
		response.Error(c, http.StatusForbidden, "GATE_REJECTED", res.Message, res)
		return
	}

	response.OK(c, res.Message, res)
}

// HandleTapPay handles POST /nfc/tap-pay (Vendor POS booth tap)
func (h *NFCHandler) HandleTapPay(c *gin.Context) {
	var req TapPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Format request tidak valid", err.Error())
		return
	}

	res, err := h.service.TapPay(req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	if !res.Success {
		response.Error(c, http.StatusPaymentRequired, "PAYMENT_FAILED", res.Message, res)
		return
	}

	response.OK(c, res.Message, res)
}

// HandleGetWristband handles GET /nfc/:uid
func (h *NFCHandler) HandleGetWristband(c *gin.Context) {
	uid := c.Param("uid")
	if uid == "" {
		response.BadRequest(c, "Wristband UID is required", nil)
		return
	}

	info, err := h.service.GetWristbandInfo(uid)
	if err != nil {
		response.NotFound(c, "Data gelang NFC tidak ditemukan")
		return
	}

	response.OK(c, "Informasi gelang NFC berhasil diambil", info)
}

// HandleUnlinkWristband handles POST /nfc/unlink
func (h *NFCHandler) HandleUnlinkWristband(c *gin.Context) {
	var body struct {
		WristbandUID string `json:"wristband_uid" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "wristband_uid is required", err.Error())
		return
	}

	if err := h.service.UnlinkWristband(body.WristbandUID); err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.OK(c, "Gelang NFC berhasil di-unlink", nil)
}

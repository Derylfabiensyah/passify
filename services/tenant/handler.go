package tenant

import (
	"errors"
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/response"
	"gorm.io/gorm"
)

// TenantHandler handles HTTP requests for tenant and destination resources
type TenantHandler struct {
	service TenantService
}

// NewHandler creates a new instance of TenantHandler
func NewHandler(service TenantService) *TenantHandler {
	return &TenantHandler{service: service}
}

func parsePagination(c *gin.Context) (int, int) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	perPage, err := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	if err != nil || perPage < 1 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}
	return page, perPage
}

func calculateTotalPages(total int64, perPage int) int {
	if total == 0 {
		return 0
	}
	return int(math.Ceil(float64(total) / float64(perPage)))
}

// HandleResolveTenant handles POST /public/tenants/resolve
// Resolves a tenant slug from a custom domain or subdomain hostname.
func (h *TenantHandler) HandleResolveTenant(c *gin.Context) {
	var req ResolveTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Hostname == "" {
		response.BadRequest(c, "Hostname wajib diisi", nil)
		return
	}

	tenant, err := h.service.ResolveTenantByHostname(req.Hostname)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.NotFound(c, "Domain tidak terdaftar")
			return
		}
		response.InternalServerError(c, "Gagal me-resolve domain: "+err.Error())
		return
	}

	response.OK(c, "Tenant ditemukan", gin.H{
		"slug": tenant.Slug,
		"name": tenant.Name,
	})
}

// HandleGetPublicDestination handles GET /public/tenants/:slug/destination
// Returns the first active destination for a tenant slug (public portal data).
func (h *TenantHandler) HandleGetPublicDestination(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "Slug tenant tidak valid", nil)
		return
	}

	dest, err := h.service.GetPublicDestinationByTenantSlug(slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.NotFound(c, "Destinasi tidak ditemukan")
			return
		}
		response.InternalServerError(c, "Gagal mengambil data destinasi: "+err.Error())
		return
	}

	response.OK(c, "Data destinasi berhasil diambil", dest)
}

// HandleCreateTenant handles POST /tenants
func (h *TenantHandler) HandleCreateTenant(c *gin.Context) {
	var req CreateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data permintaan tidak valid", err.Error())
		return
	}

	tenant, err := h.service.CreateTenant(req)
	if err != nil {
		response.InternalServerError(c, "Gagal membuat tenant: "+err.Error())
		return
	}

	response.Created(c, "Tenant berhasil dibuat", tenant)
}

// HandleGetTenant handles GET /tenants/:id
func (h *TenantHandler) HandleGetTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	tenant, err := h.service.GetTenant(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.NotFound(c, "Tenant tidak ditemukan")
			return
		}
		response.InternalServerError(c, "Gagal mengambil data tenant: "+err.Error())
		return
	}

	response.OK(c, "Data tenant berhasil diambil", tenant)
}

// HandleListTenants handles GET /tenants
func (h *TenantHandler) HandleListTenants(c *gin.Context) {
	page, perPage := parsePagination(c)

	tenants, total, err := h.service.ListTenants(page, perPage)
	if err != nil {
		response.InternalServerError(c, "Gagal mengambil daftar tenant: "+err.Error())
		return
	}

	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: calculateTotalPages(total, perPage),
	}

	response.SuccessWithMeta(c, "Daftar tenant berhasil diambil", tenants, meta)
}

// HandleUpdateTenant handles PUT /tenants/:id
func (h *TenantHandler) HandleUpdateTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	var req UpdateTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data permintaan tidak valid", err.Error())
		return
	}

	tenant, err := h.service.UpdateTenant(id, req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.NotFound(c, "Tenant tidak ditemukan")
			return
		}
		response.InternalServerError(c, "Gagal memperbarui tenant: "+err.Error())
		return
	}

	response.OK(c, "Tenant berhasil diperbarui", tenant)
}

// HandleDeleteTenant handles DELETE /tenants/:id
func (h *TenantHandler) HandleDeleteTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	if err := h.service.DeleteTenant(id); err != nil {
		response.InternalServerError(c, "Gagal menghapus tenant: "+err.Error())
		return
	}

	response.OK(c, "Tenant berhasil dihapus", nil)
}

// HandleCreateDestination handles POST /tenants/:id/destinations
func (h *TenantHandler) HandleCreateDestination(c *gin.Context) {
	tenantIDStr := c.Param("id")
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	var req CreateDestinationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data permintaan tidak valid", err.Error())
		return
	}

	dest, err := h.service.CreateDestination(tenantID, req)
	if err != nil {
		response.InternalServerError(c, "Gagal membuat destinasi: "+err.Error())
		return
	}

	response.Created(c, "Destinasi berhasil dibuat", dest)
}

// HandleGetDestination handles GET /destinations/:id
func (h *TenantHandler) HandleGetDestination(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID destinasi tidak valid", nil)
		return
	}

	dest, err := h.service.GetDestination(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.NotFound(c, "Destinasi tidak ditemukan")
			return
		}
		response.InternalServerError(c, "Gagal mengambil data destinasi: "+err.Error())
		return
	}

	response.OK(c, "Data destinasi berhasil diambil", dest)
}

// HandleListDestinations handles GET /tenants/:id/destinations
func (h *TenantHandler) HandleListDestinations(c *gin.Context) {
	tenantIDStr := c.Param("id")
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	page, perPage := parsePagination(c)

	dests, total, err := h.service.ListDestinations(tenantID, page, perPage)
	if err != nil {
		response.InternalServerError(c, "Gagal mengambil daftar destinasi: "+err.Error())
		return
	}

	meta := &response.Meta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: calculateTotalPages(total, perPage),
	}

	response.SuccessWithMeta(c, "Daftar destinasi berhasil diambil", dests, meta)
}

// HandleUpdateDestination handles PUT /destinations/:id
func (h *TenantHandler) HandleUpdateDestination(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID destinasi tidak valid", nil)
		return
	}

	var req UpdateDestinationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data permintaan tidak valid", err.Error())
		return
	}

	dest, err := h.service.UpdateDestination(id, req)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			response.NotFound(c, "Destinasi tidak ditemukan")
			return
		}
		response.InternalServerError(c, "Gagal memperbarui destinasi: "+err.Error())
		return
	}

	response.OK(c, "Destinasi berhasil diperbarui", dest)
}

// HandleDeleteDestination handles DELETE /destinations/:id
func (h *TenantHandler) HandleDeleteDestination(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "ID destinasi tidak valid", nil)
		return
	}

	if err := h.service.DeleteDestination(id); err != nil {
		response.InternalServerError(c, "Gagal menghapus destinasi: "+err.Error())
		return
	}

	response.OK(c, "Destinasi berhasil dihapus", nil)
}

// UpsertSettingRequest defines request body for saving tenant setting
type UpsertSettingRequest struct {
	Key   string `json:"key" binding:"required"`
	Value string `json:"value" binding:"required"`
}

// HandleUpsertSetting handles PUT /tenants/:id/settings
func (h *TenantHandler) HandleUpsertSetting(c *gin.Context) {
	tenantIDStr := c.Param("id")
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	var req UpsertSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data permintaan tidak valid", err.Error())
		return
	}

	if err := h.service.UpsertSetting(tenantID, req.Key, req.Value); err != nil {
		response.InternalServerError(c, "Gagal menyimpan pengaturan tenant: "+err.Error())
		return
	}

	response.OK(c, "Pengaturan tenant berhasil disimpan", nil)
}

// HandleGetSettings handles GET /tenants/:id/settings
func (h *TenantHandler) HandleGetSettings(c *gin.Context) {
	tenantIDStr := c.Param("id")
	tenantID, err := uuid.Parse(tenantIDStr)
	if err != nil {
		response.BadRequest(c, "ID tenant tidak valid", nil)
		return
	}

	settings, err := h.service.GetSettings(tenantID)
	if err != nil {
		response.InternalServerError(c, "Gagal mengambil pengaturan tenant: "+err.Error())
		return
	}

	response.OK(c, "Pengaturan tenant berhasil diambil", settings)
}

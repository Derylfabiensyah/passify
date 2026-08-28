package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

// AuthHandler handles HTTP requests for authentication
type AuthHandler struct {
	service AuthService
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(service AuthService) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

// HandleRegister handles POST /register
func (h *AuthHandler) HandleRegister(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data pendaftaran tidak valid", err.Error())
		return
	}

	user, err := h.service.Register(req)
	if err != nil {
		if err.Error() == "email sudah terdaftar" {
			response.Conflict(c, err.Error())
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Registrasi berhasil", user)
}

// HandleRegisterTenant handles POST /register-tenant
func (h *AuthHandler) HandleRegisterTenant(c *gin.Context) {
	var req RegisterTenantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data pendaftaran tenant tidak valid", err.Error())
		return
	}

	tenant, user, verifyToken, err := h.service.RegisterTenant(req)
	if err != nil {
		if err.Error() == "email sudah terdaftar" || err.Error() == "subdomain sudah digunakan oleh pengelola lain" {
			response.Conflict(c, err.Error())
			return
		}
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun.", gin.H{
		"tenant":           tenant,
		"user":             user,
		"verify_token_dev": verifyToken, // Provided for easy dev testing
	})
}

// HandleCheckSubdomain handles GET /check-subdomain?subdomain=xxx
func (h *AuthHandler) HandleCheckSubdomain(c *gin.Context) {
	subdomain := c.Query("subdomain")
	if subdomain == "" {
		response.BadRequest(c, "Parameter subdomain diperlukan", nil)
		return
	}

	available, err := h.service.CheckSubdomain(subdomain)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Pengecekan subdomain", gin.H{
		"subdomain": subdomain,
		"available": available,
	})
}

// HandleVerifyEmail handles GET /verify-email?token=xxx
func (h *AuthHandler) HandleVerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		response.BadRequest(c, "Token verifikasi diperlukan", nil)
		return
	}

	if err := h.service.VerifyEmail(token); err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Email berhasil diverifikasi! Akun pengelola Anda sekarang aktif. Silakan login.", gin.H{
		"verified": true,
	})
}

// HandleLogin handles POST /login
func (h *AuthHandler) HandleLogin(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data login tidak valid", err.Error())
		return
	}

	res, err := h.service.Login(req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.OK(c, "Login berhasil", res)
}

// HandleRefreshToken handles POST /refresh-token
func (h *AuthHandler) HandleRefreshToken(c *gin.Context) {
	var req RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data refresh token tidak valid", err.Error())
		return
	}

	res, err := h.service.RefreshToken(req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.OK(c, "Token berhasil diperbarui", res)
}

// HandleGetProfile handles GET /profile
func (h *AuthHandler) HandleGetProfile(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "User ID tidak ditemukan dalam konteks")
		return
	}

	user, err := h.service.GetProfile(userID)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}

	response.OK(c, "Profil pengguna", user)
}

// HandleUpdateProfile handles PUT /profile
func (h *AuthHandler) HandleUpdateProfile(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "User ID tidak ditemukan dalam konteks")
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Data profil tidak valid", err.Error())
		return
	}

	user, err := h.service.UpdateProfile(userID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Profil berhasil diperbarui", user)
}

// HandleLogout handles POST /logout
func (h *AuthHandler) HandleLogout(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		response.Unauthorized(c, "User ID tidak ditemukan dalam konteks")
		return
	}

	if err := h.service.Logout(userID); err != nil {
		response.InternalServerError(c, "Gagal melakukan logout")
		return
	}

	response.OK(c, "Logout berhasil", nil)
}

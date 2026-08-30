package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/middleware"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

// DTOs
type RegisterRequest struct {
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"required,min=6"`
	FullName     string  `json:"full_name" binding:"required"`
	Phone        *string `json:"phone,omitempty"`
	Role         string  `json:"role,omitempty"`
	Nationality  string  `json:"nationality,omitempty"`
	IDCardType   *string `json:"id_card_type,omitempty"`
	IDCardNumber *string `json:"id_card_number,omitempty"`
}

type RegisterTenantRequest struct {
	FullName   string  `json:"full_name" binding:"required"`
	Email      string  `json:"email" binding:"required,email"`
	Password   string  `json:"password" binding:"required,min=6"`
	Phone      *string `json:"phone,omitempty"`
	TenantName string  `json:"tenant_name" binding:"required"`
	Subdomain  string  `json:"subdomain" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	ExpiresAt    time.Time    `json:"expires_at"`
	User         *models.User `json:"user"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type UpdateProfileRequest struct {
	FullName     string  `json:"full_name,omitempty"`
	Phone        *string `json:"phone,omitempty"`
	IDCardType   *string `json:"id_card_type,omitempty"`
	IDCardNumber *string `json:"id_card_number,omitempty"`
	Nationality  string  `json:"nationality,omitempty"`
}

// AuthService defines authentication business logic interface
type AuthService interface {
	Register(req RegisterRequest) (*models.User, error)
	RegisterTenant(req RegisterTenantRequest) (*models.Tenant, *models.User, string, error)
	CheckSubdomain(subdomain string) (bool, error)
	VerifyEmail(token string) error
	Login(req LoginRequest) (*LoginResponse, error)
	RefreshToken(req RefreshTokenRequest) (*LoginResponse, error)
	GetProfile(userID uuid.UUID) (*models.User, error)
	UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*models.User, error)
	Logout(userID uuid.UUID) error
}

type authService struct {
	repo  AuthRepository
	cfg   *config.Config
	redis *redis.Client
}

// NewAuthService creates a new AuthService instance
func NewAuthService(repo AuthRepository, cfg *config.Config, rdb *redis.Client) AuthService {
	return &authService{
		repo:  repo,
		cfg:   cfg,
		redis: rdb,
	}
}

func (s *authService) Register(req RegisterRequest) (*models.User, error) {
	existing, err := s.repo.GetUserByEmail(req.Email)
	if err == nil && existing != nil {
		return nil, errors.New("email sudah terdaftar")
	}

	if req.Role == "" {
		req.Role = models.RoleVisitor
	}
	if req.Nationality == "" {
		req.Nationality = "WNI"
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("gagal memproses kata sandi: %w", err)
	}

	user := &models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Phone:        req.Phone,
		Role:         req.Role,
		IDCardType:   req.IDCardType,
		IDCardNumber: req.IDCardNumber,
		Nationality:  req.Nationality,
		IsActive:     true,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, fmt.Errorf("gagal mendaftarkan pengguna: %w", err)
	}

	return user, nil
}

func (s *authService) Login(req LoginRequest) (*LoginResponse, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("email atau kata sandi tidak valid")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("email atau kata sandi tidak valid")
	}

	if !user.IsActive {
		return nil, errors.New("akun pengguna tidak aktif")
	}

	now := time.Now()
	user.LastLoginAt = &now
	_ = s.repo.UpdateUser(user)

	accessToken, err := middleware.GenerateToken(
		user.ID,
		user.Email,
		user.Role,
		user.TenantID,
		s.cfg.JWT.Secret,
		s.cfg.JWT.ExpiryHours,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat token akses: %w", err)
	}

	refreshTokenStr := middleware.GenerateRefreshToken()
	tokenHash := hashToken(refreshTokenStr)

	expiresAt := time.Now().Add(time.Duration(s.cfg.JWT.ExpiryHours) * time.Hour)
	refreshExpiresAt := time.Now().Add(time.Duration(s.cfg.JWT.RefreshExpiryHours) * time.Hour)

	refreshTokenModel := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: refreshExpiresAt,
		Revoked:   false,
	}

	if err := s.repo.SaveRefreshToken(refreshTokenModel); err != nil {
		return nil, fmt.Errorf("gagal menyimpan token refresh: %w", err)
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenStr,
		ExpiresAt:    expiresAt,
		User:         user,
	}, nil
}

func (s *authService) RefreshToken(req RefreshTokenRequest) (*LoginResponse, error) {
	tokenHash := hashToken(req.RefreshToken)
	tokenModel, err := s.repo.GetRefreshToken(tokenHash)
	if err != nil || tokenModel.Revoked || tokenModel.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("token refresh tidak valid atau telah kedaluwarsa")
	}

	_ = s.repo.RevokeRefreshToken(tokenModel.ID)

	user, err := s.repo.GetUserByID(tokenModel.UserID)
	if err != nil || !user.IsActive {
		return nil, errors.New("pengguna tidak ditemukan atau tidak aktif")
	}

	accessToken, err := middleware.GenerateToken(
		user.ID,
		user.Email,
		user.Role,
		user.TenantID,
		s.cfg.JWT.Secret,
		s.cfg.JWT.ExpiryHours,
	)
	if err != nil {
		return nil, fmt.Errorf("gagal membuat token akses baru: %w", err)
	}

	newRefreshTokenStr := middleware.GenerateRefreshToken()
	newTokenHash := hashToken(newRefreshTokenStr)

	expiresAt := time.Now().Add(time.Duration(s.cfg.JWT.ExpiryHours) * time.Hour)
	refreshExpiresAt := time.Now().Add(time.Duration(s.cfg.JWT.RefreshExpiryHours) * time.Hour)

	newRefreshTokenModel := &models.RefreshToken{
		UserID:    user.ID,
		TokenHash: newTokenHash,
		ExpiresAt: refreshExpiresAt,
		Revoked:   false,
	}

	if err := s.repo.SaveRefreshToken(newRefreshTokenModel); err != nil {
		return nil, fmt.Errorf("gagal menyimpan token refresh baru: %w", err)
	}

	return &LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshTokenStr,
		ExpiresAt:    expiresAt,
		User:         user,
	}, nil
}

func (s *authService) GetProfile(userID uuid.UUID) (*models.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("pengguna tidak ditemukan")
	}
	return user, nil
}

func (s *authService) UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*models.User, error) {
	user, err := s.repo.GetUserByID(userID)
	if err != nil {
		return nil, errors.New("pengguna tidak ditemukan")
	}

	if req.FullName != "" {
		user.FullName = req.FullName
	}
	if req.Phone != nil {
		user.Phone = req.Phone
	}
	if req.IDCardType != nil {
		user.IDCardType = req.IDCardType
	}
	if req.IDCardNumber != nil {
		user.IDCardNumber = req.IDCardNumber
	}
	if req.Nationality != "" {
		user.Nationality = req.Nationality
	}

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, fmt.Errorf("gagal memperbarui profil: %w", err)
	}

	return user, nil
}

func (s *authService) Logout(userID uuid.UUID) error {
	if err := s.repo.RevokeAllUserTokens(userID); err != nil {
		return fmt.Errorf("gagal mencabut token refresh: %w", err)
	}
	return nil
}

func (s *authService) RegisterTenant(req RegisterTenantRequest) (*models.Tenant, *models.User, string, error) {
	// 1. Check if email already registered
	existing, err := s.repo.GetUserByEmail(req.Email)
	if err == nil && existing != nil {
		return nil, nil, "", errors.New("email sudah terdaftar")
	}

	// 2. Validate and clean subdomain
	cleanSubdomain := strings.ToLower(strings.TrimSpace(req.Subdomain))
	re := regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	if len(cleanSubdomain) < 3 || len(cleanSubdomain) > 50 || !re.MatchString(cleanSubdomain) {
		return nil, nil, "", errors.New("subdomain hanya boleh berisi huruf kecil, angka, dan tanda hubung (-) minimal 3 karakter")
	}

	// Check reserved subdomains
	reserved := map[string]bool{
		"admin": true, "api": true, "app": true, "auth": true,
		"dashboard": true, "mail": true, "root": true, "superadmin": true,
		"test": true, "www": true, "gate": true, "payment": true,
	}
	if reserved[cleanSubdomain] {
		return nil, nil, "", errors.New("subdomain ini tidak tersedia (reserved)")
	}

	// Check if subdomain already exists
	existingTenant, err := s.repo.GetTenantBySubdomain(cleanSubdomain)
	if err == nil && existingTenant != nil {
		return nil, nil, "", errors.New("subdomain sudah digunakan oleh pengelola lain")
	}

	// 3. Create Tenant (initially inactive until email verified)
	tenant := &models.Tenant{
		Name:           req.TenantName,
		Slug:           cleanSubdomain,
		Subdomain:      cleanSubdomain,
		PrimaryColor:   "#059669",
		SecondaryColor: "#047857",
		ContactEmail:   &req.Email,
		ContactPhone:   req.Phone,
		IsActive:       false,
	}
	if err := s.repo.CreateTenant(tenant); err != nil {
		return nil, nil, "", fmt.Errorf("gagal membuat data tenant: %w", err)
	}

	// 4. Hash password and create Tenant Admin User (inactive until email verified)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, "", fmt.Errorf("gagal memproses kata sandi: %w", err)
	}

	user := &models.User{
		TenantID:     &tenant.ID,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Phone:        req.Phone,
		Role:         models.RoleTenantAdmin,
		Nationality:  "WNI",
		IsActive:     false,
	}
	if err := s.repo.CreateUser(user); err != nil {
		return nil, nil, "", fmt.Errorf("gagal membuat akun pengguna: %w", err)
	}

	// 5. Generate verification token
	verifyToken := uuid.New().String()
	if s.redis != nil {
		ctx := context.Background()
		tokenValue := fmt.Sprintf("%s:%s", user.ID.String(), tenant.ID.String())
		if err := s.redis.Set(ctx, "verify_email:"+verifyToken, tokenValue, 24*time.Hour).Err(); err != nil {
			log.Printf("⚠️ Gagal menyimpan token verifikasi ke Redis: %v", err)
		}
	}

	// Simulation log for development
	log.Printf("📧 [SIMULASI EMAIL VERIFIKASI] Pengelola: %s (%s) | Token: %s | Link: http://localhost:5173/verifikasi-email?token=%s", req.FullName, req.Email, verifyToken, verifyToken)

	return tenant, user, verifyToken, nil
}

func (s *authService) CheckSubdomain(subdomain string) (bool, error) {
	clean := strings.ToLower(strings.TrimSpace(subdomain))
	re := regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	if len(clean) < 3 || len(clean) > 50 || !re.MatchString(clean) {
		return false, nil
	}

	reserved := map[string]bool{
		"admin": true, "api": true, "app": true, "auth": true,
		"dashboard": true, "mail": true, "root": true, "superadmin": true,
		"test": true, "www": true, "gate": true, "payment": true,
	}
	if reserved[clean] {
		return false, nil
	}

	existing, err := s.repo.GetTenantBySubdomain(clean)
	if err == nil && existing != nil {
		return false, nil
	}

	return true, nil
}

func (s *authService) VerifyEmail(token string) error {
	cleanToken := strings.TrimSpace(token)
	if cleanToken == "" {
		return errors.New("token verifikasi tidak boleh kosong")
	}

	if s.redis == nil {
		return errors.New("layanan verifikasi sedang tidak tersedia (Redis offline)")
	}

	ctx := context.Background()

	// Check if this token was already verified recently (idempotent for React StrictMode / refreshes)
	doneKey := "verify_email_done:" + cleanToken
	if alreadyDone, _ := s.redis.Get(ctx, doneKey).Result(); alreadyDone != "" {
		return nil
	}

	val, err := s.redis.Get(ctx, "verify_email:"+cleanToken).Result()
	if err != nil || val == "" {
		return errors.New("link verifikasi tidak valid atau telah kedaluwarsa")
	}

	parts := strings.Split(val, ":")
	if len(parts) != 2 {
		return errors.New("format token verifikasi tidak valid")
	}

	userID, err := uuid.Parse(parts[0])
	if err != nil {
		return errors.New("user ID tidak valid")
	}

	tenantID, err := uuid.Parse(parts[1])
	if err != nil {
		return errors.New("tenant ID tidak valid")
	}

	// Activate user and tenant
	if err := s.repo.ActivateUser(userID); err != nil {
		return fmt.Errorf("gagal mengaktifkan akun user: %w", err)
	}

	if err := s.repo.ActivateTenant(tenantID); err != nil {
		return fmt.Errorf("gagal mengaktifkan tenant: %w", err)
	}

	// Delete verification token and keep idempotent marker for 24h
	_ = s.redis.Del(ctx, "verify_email:"+cleanToken).Err()
	_ = s.redis.Set(ctx, doneKey, "verified", 24*time.Hour).Err()

	return nil
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

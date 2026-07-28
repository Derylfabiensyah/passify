package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
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
	Login(req LoginRequest) (*LoginResponse, error)
	RefreshToken(req RefreshTokenRequest) (*LoginResponse, error)
	GetProfile(userID uuid.UUID) (*models.User, error)
	UpdateProfile(userID uuid.UUID, req UpdateProfileRequest) (*models.User, error)
	Logout(userID uuid.UUID) error
}

type authService struct {
	repo AuthRepository
	cfg  *config.Config
}

// NewAuthService creates a new AuthService instance
func NewAuthService(repo AuthRepository, cfg *config.Config) AuthService {
	return &authService{
		repo: repo,
		cfg:  cfg,
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

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

package auth

import (
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// AuthRepository defines the database operations for authentication
type AuthRepository interface {
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByID(id uuid.UUID) (*models.User, error)
	UpdateUser(user *models.User) error
	SaveRefreshToken(token *models.RefreshToken) error
	GetRefreshToken(tokenHash string) (*models.RefreshToken, error)
	RevokeRefreshToken(id uuid.UUID) error
	RevokeAllUserTokens(userID uuid.UUID) error

	// Tenant operations for self-registration
	CreateTenant(tenant *models.Tenant) error
	GetTenantBySubdomain(subdomain string) (*models.Tenant, error)
	ActivateTenant(tenantID uuid.UUID) error
	ActivateUser(userID uuid.UUID) error
}

type authRepository struct {
	db *gorm.DB
}

// NewAuthRepository creates a new AuthRepository instance
func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *authRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.Where("id = ?", id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *authRepository) SaveRefreshToken(token *models.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *authRepository) GetRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	if err := r.db.Where("token_hash = ?", tokenHash).First(&token).Error; err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *authRepository) RevokeRefreshToken(id uuid.UUID) error {
	return r.db.Model(&models.RefreshToken{}).Where("id = ?", id).Update("revoked", true).Error
}

func (r *authRepository) RevokeAllUserTokens(userID uuid.UUID) error {
	return r.db.Model(&models.RefreshToken{}).Where("user_id = ?", userID).Update("revoked", true).Error
}

func (r *authRepository) CreateTenant(tenant *models.Tenant) error {
	return r.db.Create(tenant).Error
}

func (r *authRepository) GetTenantBySubdomain(subdomain string) (*models.Tenant, error) {
	var tenant models.Tenant
	if err := r.db.Where("subdomain = ? OR slug = ?", subdomain, subdomain).First(&tenant).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *authRepository) ActivateTenant(tenantID uuid.UUID) error {
	return r.db.Model(&models.Tenant{}).Where("id = ?", tenantID).Update("is_active", true).Error
}

func (r *authRepository) ActivateUser(userID uuid.UUID) error {
	now := time.Now()
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_active":          true,
		"email_verified_at": &now,
	}).Error
}

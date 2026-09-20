package auth

import (
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// AuthRepository handles database operations for authentication
type AuthRepository struct {
	db *gorm.DB
}

// NewAuthRepository creates a new AuthRepository instance
func NewAuthRepository(db *gorm.DB) *AuthRepository {
	return &AuthRepository{db: db}
}

func (r *AuthRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *AuthRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Tenant").Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Tenant").Where("id = ?", id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *AuthRepository) SaveRefreshToken(token *models.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *AuthRepository) GetRefreshToken(tokenHash string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	if err := r.db.Where("token_hash = ?", tokenHash).First(&token).Error; err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *AuthRepository) RevokeRefreshToken(id uuid.UUID) error {
	return r.db.Model(&models.RefreshToken{}).Where("id = ?", id).Update("revoked", true).Error
}

func (r *AuthRepository) RevokeAllUserTokens(userID uuid.UUID) error {
	return r.db.Model(&models.RefreshToken{}).Where("user_id = ?", userID).Update("revoked", true).Error
}

func (r *AuthRepository) CreateTenant(tenant *models.Tenant) error {
	return r.db.Create(tenant).Error
}

func (r *AuthRepository) GetTenantBySubdomain(subdomain string) (*models.Tenant, error) {
	var tenant models.Tenant
	if err := r.db.Where("subdomain = ? OR slug = ?", subdomain, subdomain).First(&tenant).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *AuthRepository) ActivateTenant(tenantID uuid.UUID) error {
	return r.db.Model(&models.Tenant{}).Where("id = ?", tenantID).Update("is_active", true).Error
}

func (r *AuthRepository) ActivateUser(userID uuid.UUID) error {
	now := time.Now()
	return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_active":          true,
		"email_verified_at": &now,
	}).Error
}

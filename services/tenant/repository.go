package tenant

import (
	"errors"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// TenantRepository defines database operations for tenant and destination entities
type TenantRepository interface {
	CreateTenant(tenant *models.Tenant) error
	GetTenantByID(id uuid.UUID) (*models.Tenant, error)
	GetTenantBySubdomain(subdomain string) (*models.Tenant, error)
	GetTenantBySlug(slug string) (*models.Tenant, error)
	ListTenants(page, perPage int) ([]models.Tenant, int64, error)
	UpdateTenant(tenant *models.Tenant) error
	DeleteTenant(id uuid.UUID) error
	CreateDestination(dest *models.Destination) error
	GetDestinationByID(id uuid.UUID) (*models.Destination, error)
	GetDestinationBySlug(tenantID uuid.UUID, slug string) (*models.Destination, error)
	ListDestinations(tenantID uuid.UUID, page, perPage int) ([]models.Destination, int64, error)
	UpdateDestination(dest *models.Destination) error
	DeleteDestination(id uuid.UUID) error
	SaveTenantSetting(setting *models.TenantSetting) error
	GetTenantSettings(tenantID uuid.UUID) ([]models.TenantSetting, error)
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new instance of TenantRepository
func NewRepository(db *gorm.DB) TenantRepository {
	return &repository{db: db}
}

func (r *repository) CreateTenant(tenant *models.Tenant) error {
	if tenant.ID == uuid.Nil {
		tenant.ID = uuid.New()
	}
	return r.db.Create(tenant).Error
}

func (r *repository) GetTenantByID(id uuid.UUID) (*models.Tenant, error) {
	var tenant models.Tenant
	if err := r.db.First(&tenant, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *repository) GetTenantBySubdomain(subdomain string) (*models.Tenant, error) {
	var tenant models.Tenant
	if err := r.db.First(&tenant, "subdomain = ?", subdomain).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *repository) GetTenantBySlug(slug string) (*models.Tenant, error) {
	var tenant models.Tenant
	if err := r.db.First(&tenant, "slug = ?", slug).Error; err != nil {
		return nil, err
	}
	return &tenant, nil
}

func (r *repository) ListTenants(page, perPage int) ([]models.Tenant, int64, error) {
	var tenants []models.Tenant
	var total int64

	if err := r.db.Model(&models.Tenant{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	err := r.db.Limit(perPage).Offset(offset).Order("created_at DESC").Find(&tenants).Error
	if err != nil {
		return nil, 0, err
	}

	return tenants, total, nil
}

func (r *repository) UpdateTenant(tenant *models.Tenant) error {
	return r.db.Save(tenant).Error
}

func (r *repository) DeleteTenant(id uuid.UUID) error {
	return r.db.Delete(&models.Tenant{}, "id = ?", id).Error
}

func (r *repository) CreateDestination(dest *models.Destination) error {
	if dest.ID == uuid.Nil {
		dest.ID = uuid.New()
	}
	return r.db.Create(dest).Error
}

func (r *repository) GetDestinationByID(id uuid.UUID) (*models.Destination, error) {
	var dest models.Destination
	if err := r.db.First(&dest, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &dest, nil
}

func (r *repository) GetDestinationBySlug(tenantID uuid.UUID, slug string) (*models.Destination, error) {
	var dest models.Destination
	err := r.db.Where("tenant_id = ? AND slug = ?", tenantID, slug).First(&dest).Error
	if err != nil {
		return nil, err
	}
	return &dest, nil
}

func (r *repository) ListDestinations(tenantID uuid.UUID, page, perPage int) ([]models.Destination, int64, error) {
	var dests []models.Destination
	var total int64

	query := r.db.Model(&models.Destination{}).Where("tenant_id = ?", tenantID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	err := query.Limit(perPage).Offset(offset).Order("created_at DESC").Find(&dests).Error
	if err != nil {
		return nil, 0, err
	}

	return dests, total, nil
}

func (r *repository) UpdateDestination(dest *models.Destination) error {
	return r.db.Save(dest).Error
}

func (r *repository) DeleteDestination(id uuid.UUID) error {
	return r.db.Delete(&models.Destination{}, "id = ?", id).Error
}

func (r *repository) SaveTenantSetting(setting *models.TenantSetting) error {
	var existing models.TenantSetting
	err := r.db.Where("tenant_id = ? AND setting_key = ?", setting.TenantID, setting.SettingKey).First(&existing).Error
	if err == nil {
		existing.SettingValue = setting.SettingValue
		return r.db.Save(&existing).Error
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		if setting.ID == uuid.Nil {
			setting.ID = uuid.New()
		}
		return r.db.Create(setting).Error
	}
	return err
}

func (r *repository) GetTenantSettings(tenantID uuid.UUID) ([]models.TenantSetting, error) {
	var settings []models.TenantSetting
	err := r.db.Where("tenant_id = ?", tenantID).Find(&settings).Error
	if err != nil {
		return nil, err
	}
	return settings, nil
}

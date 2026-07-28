package tenant

import (
	"strings"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
)

// DTO Requests for Tenant operations
type CreateTenantRequest struct {
	Name              string `json:"name" binding:"required"`
	Subdomain         string `json:"subdomain" binding:"required"`
	Description       string `json:"description"`
	ContactEmail      string `json:"contact_email"`
	ContactPhone      string `json:"contact_phone"`
	Address           string `json:"address"`
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
	BankAccountHolder string `json:"bank_account_holder"`
	PrimaryColor      string `json:"primary_color"`
	SecondaryColor    string `json:"secondary_color"`
}

type UpdateTenantRequest struct {
	Name              *string `json:"name"`
	Subdomain         *string `json:"subdomain"`
	Description       *string `json:"description"`
	ContactEmail      *string `json:"contact_email"`
	ContactPhone      *string `json:"contact_phone"`
	Address           *string `json:"address"`
	BankName          *string `json:"bank_name"`
	BankAccountNumber *string `json:"bank_account_number"`
	BankAccountHolder *string `json:"bank_account_holder"`
	PrimaryColor      *string `json:"primary_color"`
	SecondaryColor    *string `json:"secondary_color"`
	IsActive          *bool   `json:"is_active"`
}

// DTO Requests for Destination operations
type CreateDestinationRequest struct {
	Name             string              `json:"name" binding:"required"`
	Description      string              `json:"description"`
	DestinationType  string              `json:"destination_type"`
	Address          string              `json:"address"`
	City             string              `json:"city"`
	Province         string              `json:"province"`
	Latitude         *float64            `json:"latitude"`
	Longitude        *float64            `json:"longitude"`
	MaxDailyCapacity int                 `json:"max_daily_capacity" binding:"required"`
	OpeningTime      string              `json:"opening_time"`
	ClosingTime      string              `json:"closing_time"`
	Facilities       models.StringArray  `json:"facilities"`
	Rules            string              `json:"rules"`
}

type UpdateDestinationRequest struct {
	Name             *string             `json:"name"`
	Description      *string             `json:"description"`
	DestinationType  *string             `json:"destination_type"`
	Address          *string             `json:"address"`
	City             *string             `json:"city"`
	Province         *string             `json:"province"`
	Latitude         *float64            `json:"latitude"`
	Longitude        *float64            `json:"longitude"`
	MaxDailyCapacity *int                `json:"max_daily_capacity"`
	OpeningTime      *string             `json:"opening_time"`
	ClosingTime      *string             `json:"closing_time"`
	Facilities       *models.StringArray `json:"facilities"`
	Rules            *string             `json:"rules"`
	IsActive         *bool               `json:"is_active"`
}

// TenantService interface defines business logic operations
type TenantService interface {
	CreateTenant(req CreateTenantRequest) (*models.Tenant, error)
	GetTenant(id uuid.UUID) (*models.Tenant, error)
	ListTenants(page, perPage int) ([]models.Tenant, int64, error)
	UpdateTenant(id uuid.UUID, req UpdateTenantRequest) (*models.Tenant, error)
	DeleteTenant(id uuid.UUID) error
	CreateDestination(tenantID uuid.UUID, req CreateDestinationRequest) (*models.Destination, error)
	GetDestination(id uuid.UUID) (*models.Destination, error)
	ListDestinations(tenantID uuid.UUID, page, perPage int) ([]models.Destination, int64, error)
	UpdateDestination(id uuid.UUID, req UpdateDestinationRequest) (*models.Destination, error)
	DeleteDestination(id uuid.UUID) error
	UpsertSetting(tenantID uuid.UUID, key, value string) error
	GetSettings(tenantID uuid.UUID) ([]models.TenantSetting, error)
}

type service struct {
	repo TenantRepository
}

// NewService creates a new instance of TenantService
func NewService(repo TenantRepository) TenantService {
	return &service{repo: repo}
}

// GenerateSlug generates a URL-friendly slug from a string (lowercase, replace spaces with hyphens, remove special characters)
func GenerateSlug(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	var sb strings.Builder
	lastDash := false
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			sb.WriteRune(r)
			lastDash = false
		} else if r == ' ' || r == '-' || r == '_' {
			if !lastDash && sb.Len() > 0 {
				sb.WriteRune('-')
				lastDash = true
			}
		}
	}
	return strings.Trim(sb.String(), "-")
}

func stringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func (s *service) CreateTenant(req CreateTenantRequest) (*models.Tenant, error) {
	primaryColor := req.PrimaryColor
	if primaryColor == "" {
		primaryColor = "#059669"
	}
	secondaryColor := req.SecondaryColor
	if secondaryColor == "" {
		secondaryColor = "#047857"
	}

	tenant := &models.Tenant{
		Name:              req.Name,
		Slug:              GenerateSlug(req.Name),
		Subdomain:         req.Subdomain,
		PrimaryColor:      primaryColor,
		SecondaryColor:    secondaryColor,
		Description:       stringPtr(req.Description),
		ContactEmail:      stringPtr(req.ContactEmail),
		ContactPhone:      stringPtr(req.ContactPhone),
		Address:           stringPtr(req.Address),
		BankName:          stringPtr(req.BankName),
		BankAccountNumber: stringPtr(req.BankAccountNumber),
		BankAccountHolder: stringPtr(req.BankAccountHolder),
		IsActive:          true,
	}

	if err := s.repo.CreateTenant(tenant); err != nil {
		return nil, err
	}

	return tenant, nil
}

func (s *service) GetTenant(id uuid.UUID) (*models.Tenant, error) {
	return s.repo.GetTenantByID(id)
}

func (s *service) ListTenants(page, perPage int) ([]models.Tenant, int64, error) {
	return s.repo.ListTenants(page, perPage)
}

func (s *service) UpdateTenant(id uuid.UUID, req UpdateTenantRequest) (*models.Tenant, error) {
	tenant, err := s.repo.GetTenantByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil && *req.Name != "" {
		tenant.Name = *req.Name
		tenant.Slug = GenerateSlug(*req.Name)
	}
	if req.Subdomain != nil && *req.Subdomain != "" {
		tenant.Subdomain = *req.Subdomain
	}
	if req.Description != nil {
		tenant.Description = req.Description
	}
	if req.ContactEmail != nil {
		tenant.ContactEmail = req.ContactEmail
	}
	if req.ContactPhone != nil {
		tenant.ContactPhone = req.ContactPhone
	}
	if req.Address != nil {
		tenant.Address = req.Address
	}
	if req.BankName != nil {
		tenant.BankName = req.BankName
	}
	if req.BankAccountNumber != nil {
		tenant.BankAccountNumber = req.BankAccountNumber
	}
	if req.BankAccountHolder != nil {
		tenant.BankAccountHolder = req.BankAccountHolder
	}
	if req.PrimaryColor != nil && *req.PrimaryColor != "" {
		tenant.PrimaryColor = *req.PrimaryColor
	}
	if req.SecondaryColor != nil && *req.SecondaryColor != "" {
		tenant.SecondaryColor = *req.SecondaryColor
	}
	if req.IsActive != nil {
		tenant.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateTenant(tenant); err != nil {
		return nil, err
	}

	return tenant, nil
}

func (s *service) DeleteTenant(id uuid.UUID) error {
	return s.repo.DeleteTenant(id)
}

func (s *service) CreateDestination(tenantID uuid.UUID, req CreateDestinationRequest) (*models.Destination, error) {
	destType := req.DestinationType
	if destType == "" {
		destType = "lainnya"
	}
	openTime := req.OpeningTime
	if openTime == "" {
		openTime = "06:00:00"
	}
	closeTime := req.ClosingTime
	if closeTime == "" {
		closeTime = "17:00:00"
	}

	dest := &models.Destination{
		TenantID:         tenantID,
		Name:             req.Name,
		Slug:             GenerateSlug(req.Name),
		Description:      stringPtr(req.Description),
		DestinationType:  destType,
		Address:          stringPtr(req.Address),
		City:             stringPtr(req.City),
		Province:         stringPtr(req.Province),
		Latitude:         req.Latitude,
		Longitude:        req.Longitude,
		MaxDailyCapacity: req.MaxDailyCapacity,
		OpeningTime:      openTime,
		ClosingTime:      closeTime,
		Facilities:       req.Facilities,
		Rules:            stringPtr(req.Rules),
		IsActive:         true,
	}

	if err := s.repo.CreateDestination(dest); err != nil {
		return nil, err
	}

	return dest, nil
}

func (s *service) GetDestination(id uuid.UUID) (*models.Destination, error) {
	return s.repo.GetDestinationByID(id)
}

func (s *service) ListDestinations(tenantID uuid.UUID, page, perPage int) ([]models.Destination, int64, error) {
	return s.repo.ListDestinations(tenantID, page, perPage)
}

func (s *service) UpdateDestination(id uuid.UUID, req UpdateDestinationRequest) (*models.Destination, error) {
	dest, err := s.repo.GetDestinationByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil && *req.Name != "" {
		dest.Name = *req.Name
		dest.Slug = GenerateSlug(*req.Name)
	}
	if req.Description != nil {
		dest.Description = req.Description
	}
	if req.DestinationType != nil && *req.DestinationType != "" {
		dest.DestinationType = *req.DestinationType
	}
	if req.Address != nil {
		dest.Address = req.Address
	}
	if req.City != nil {
		dest.City = req.City
	}
	if req.Province != nil {
		dest.Province = req.Province
	}
	if req.Latitude != nil {
		dest.Latitude = req.Latitude
	}
	if req.Longitude != nil {
		dest.Longitude = req.Longitude
	}
	if req.MaxDailyCapacity != nil {
		dest.MaxDailyCapacity = *req.MaxDailyCapacity
	}
	if req.OpeningTime != nil && *req.OpeningTime != "" {
		dest.OpeningTime = *req.OpeningTime
	}
	if req.ClosingTime != nil && *req.ClosingTime != "" {
		dest.ClosingTime = *req.ClosingTime
	}
	if req.Facilities != nil {
		dest.Facilities = *req.Facilities
	}
	if req.Rules != nil {
		dest.Rules = req.Rules
	}
	if req.IsActive != nil {
		dest.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateDestination(dest); err != nil {
		return nil, err
	}

	return dest, nil
}

func (s *service) DeleteDestination(id uuid.UUID) error {
	return s.repo.DeleteDestination(id)
}

func (s *service) UpsertSetting(tenantID uuid.UUID, key, value string) error {
	setting := &models.TenantSetting{
		TenantID:     tenantID,
		SettingKey:   key,
		SettingValue: value,
	}
	return s.repo.SaveTenantSetting(setting)
}

func (s *service) GetSettings(tenantID uuid.UUID) ([]models.TenantSetting, error) {
	return s.repo.GetTenantSettings(tenantID)
}

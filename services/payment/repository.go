package payment

import (
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// PaymentRepository handles database operations for transactions and payouts
type PaymentRepository struct {
	db *gorm.DB
}

// NewPaymentRepository creates a new PaymentRepository instance
func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

// GetTransactionByID retrieves a transaction by its UUID with preloaded relations
func (r *PaymentRepository) GetTransactionByID(id uuid.UUID) (*models.Transaction, error) {
	var tx models.Transaction
	err := r.db.Preload("User").Preload("Destination").Preload("Tickets").
		First(&tx, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

// GetTransactionByOrderNumber retrieves a transaction by order number with preloaded relations
func (r *PaymentRepository) GetTransactionByOrderNumber(orderNumber string) (*models.Transaction, error) {
	var tx models.Transaction
	err := r.db.Preload("User").Preload("Destination").Preload("Tickets").
		First(&tx, "order_number = ?", orderNumber).Error
	if err != nil {
		return nil, err
	}
	return &tx, nil
}

// UpdateTransactionPayment updates payment details for a transaction
func (r *PaymentRepository) UpdateTransactionPayment(id uuid.UUID, status string, method *string, gatewayRef *string, paymentURL *string, paidAt *time.Time) error {
	updates := map[string]interface{}{
		"payment_status": status,
		"updated_at":     time.Now(),
	}
	if method != nil {
		updates["payment_method"] = *method
	}
	if gatewayRef != nil {
		updates["payment_gateway_ref"] = *gatewayRef
	}
	if paymentURL != nil {
		updates["payment_url"] = *paymentURL
	}
	if paidAt != nil {
		updates["paid_at"] = *paidAt
	}

	return r.db.Model(&models.Transaction{}).Where("id = ?", id).Updates(updates).Error
}

// ListTransactionsByTenant lists paginated transactions for a specific tenant with an optional status filter
func (r *PaymentRepository) ListTransactionsByTenant(tenantID uuid.UUID, page, perPage int, status string) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	query := r.db.Model(&models.Transaction{}).Where("tenant_id = ?", tenantID)
	if status != "" {
		query = query.Where("payment_status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	err := query.Preload("User").Preload("Destination").Preload("Tickets").
		Order("created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&transactions).Error
	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// ListTransactionsByUser lists paginated transactions for a specific user
func (r *PaymentRepository) ListTransactionsByUser(userID uuid.UUID, page, perPage int) ([]models.Transaction, int64, error) {
	var transactions []models.Transaction
	var total int64

	query := r.db.Model(&models.Transaction{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	err := query.Preload("User").Preload("Destination").Preload("Tickets").
		Order("created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&transactions).Error
	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// GetPaidTransactionsForPayout retrieves paid transactions for a tenant within a specified date range
func (r *PaymentRepository) GetPaidTransactionsForPayout(tenantID uuid.UUID, startDate, endDate time.Time) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("tenant_id = ? AND payment_status = ? AND created_at >= ? AND created_at <= ?",
		tenantID, "paid", startDate, endDate).
		Order("created_at ASC").
		Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// CreatePayout inserts a new payout record
func (r *PaymentRepository) CreatePayout(payout *models.Payout) error {
	return r.db.Create(payout).Error
}

// CreatePayoutItems inserts a list of payout items
func (r *PaymentRepository) CreatePayoutItems(items []models.PayoutItem) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

// GetPayoutByID retrieves a payout by its UUID with preloaded relations
func (r *PaymentRepository) GetPayoutByID(id uuid.UUID) (*models.Payout, error) {
	var payout models.Payout
	err := r.db.Preload("Tenant").Preload("Items").
		First(&payout, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &payout, nil
}

// ListPayouts lists paginated payouts for a tenant
func (r *PaymentRepository) ListPayouts(tenantID uuid.UUID, page, perPage int) ([]models.Payout, int64, error) {
	var payouts []models.Payout
	var total int64

	query := r.db.Model(&models.Payout{}).Where("tenant_id = ?", tenantID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * perPage
	err := query.Preload("Tenant").Preload("Items").
		Order("created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&payouts).Error
	if err != nil {
		return nil, 0, err
	}

	return payouts, total, nil
}

// UpdatePayoutStatus updates status, gateway reference, and transfer timestamp of a payout
func (r *PaymentRepository) UpdatePayoutStatus(id uuid.UUID, status string, gatewayRef *string, transferredAt *time.Time) error {
	updates := map[string]interface{}{
		"payout_status": status,
		"updated_at":    time.Now(),
	}
	if gatewayRef != nil {
		updates["gateway_payout_ref"] = *gatewayRef
	}
	if transferredAt != nil {
		updates["transferred_at"] = *transferredAt
	}

	return r.db.Model(&models.Payout{}).Where("id = ?", id).Updates(updates).Error
}

package payment

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// DTO Structs

// PaymentInvoiceResponse contains invoice creation response details
type PaymentInvoiceResponse struct {
	TransactionID uuid.UUID  `json:"transaction_id"`
	OrderNumber   string     `json:"order_number"`
	InvoiceURL    string     `json:"invoice_url"`
	PaymentMethod string     `json:"payment_method,omitempty"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
}

// WebhookRequest contains payment gateway callback payload
type WebhookRequest struct {
	ExternalID    string     `json:"external_id"`
	Status        string     `json:"status"`
	PaymentMethod string     `json:"payment_method"`
	PaidAt        *time.Time `json:"paid_at,omitempty"`
	Amount        float64    `json:"amount"`
}

// InitiatePayoutRequest contains parameters for creating a payout
type InitiatePayoutRequest struct {
	PeriodStart time.Time `json:"period_start"`
	PeriodEnd   time.Time `json:"period_end"`
}

// PayoutWebhookRequest contains payout gateway callback payload
type PayoutWebhookRequest struct {
	PayoutID      uuid.UUID  `json:"payout_id"`
	Status        string     `json:"status"`
	TransferredAt *time.Time `json:"transferred_at,omitempty"`
}

// PaymentService handles payment processing and payouts business logic
type PaymentService struct {
	repo *PaymentRepository
	cfg  *config.Config
	db   *gorm.DB
}

// NewPaymentService creates a new PaymentService instance
func NewPaymentService(repo *PaymentRepository, cfg *config.Config, db *gorm.DB) *PaymentService {
	return &PaymentService{
		repo: repo,
		cfg:  cfg,
		db:   db,
	}
}

// CreatePaymentInvoice simulates creating a payment invoice URL
func (s *PaymentService) CreatePaymentInvoice(transactionID uuid.UUID) (*PaymentInvoiceResponse, error) {
	tx, err := s.repo.GetTransactionByID(transactionID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	if tx.PaymentStatus == "paid" {
		return nil, errors.New("transaction is already paid")
	}

	invoiceURL := fmt.Sprintf("https://checkout.xendit.co/web/%s", tx.OrderNumber)
	paymentMethod := "QRIS"
	if tx.PaymentMethod != nil && *tx.PaymentMethod != "" {
		paymentMethod = *tx.PaymentMethod
	}

	gatewayRef := fmt.Sprintf("INV-%s", tx.OrderNumber)

	var expiresAt *time.Time
	if tx.ExpiredAt != nil {
		expiresAt = tx.ExpiredAt
	} else {
		exp := time.Now().Add(24 * time.Hour)
		expiresAt = &exp
	}

	err = s.repo.UpdateTransactionPayment(tx.ID, "pending", &paymentMethod, &gatewayRef, &invoiceURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to update transaction payment info: %w", err)
	}

	return &PaymentInvoiceResponse{
		TransactionID: tx.ID,
		OrderNumber:   tx.OrderNumber,
		InvoiceURL:    invoiceURL,
		PaymentMethod: paymentMethod,
		ExpiresAt:     expiresAt,
	}, nil
}

// HandlePaymentWebhook processes payment callback and updates transaction and ticket statuses atomically
func (s *PaymentService) HandlePaymentWebhook(req WebhookRequest) error {
	tx, err := s.repo.GetTransactionByOrderNumber(req.ExternalID)
	if err != nil {
		return fmt.Errorf("transaction not found for order number %s: %w", req.ExternalID, err)
	}

	statusUpper := strings.ToUpper(req.Status)
	var targetStatus string
	switch statusUpper {
	case "PAID", "SETTLED", "SUCCESS", "COMPLETED":
		targetStatus = "paid"
	case "EXPIRED":
		targetStatus = "expired"
	case "FAILED", "CANCELLED":
		targetStatus = "failed"
	default:
		targetStatus = strings.ToLower(req.Status)
	}

	return s.db.Transaction(func(txDB *gorm.DB) error {
		paidAt := req.PaidAt
		if paidAt == nil && targetStatus == "paid" {
			now := time.Now()
			paidAt = &now
		}

		updates := map[string]interface{}{
			"payment_status": targetStatus,
			"updated_at":     time.Now(),
		}

		if req.PaymentMethod != "" {
			updates["payment_method"] = req.PaymentMethod
		}

		if paidAt != nil {
			updates["paid_at"] = *paidAt
		}

		if err := txDB.Model(&models.Transaction{}).Where("id = ?", tx.ID).Updates(updates).Error; err != nil {
			return fmt.Errorf("failed to update transaction status: %w", err)
		}

		if targetStatus == "paid" {
			if err := txDB.Model(&models.Ticket{}).Where("transaction_id = ?", tx.ID).Update("status", "active").Error; err != nil {
				return fmt.Errorf("failed to update ticket status to active: %w", err)
			}
		} else if targetStatus == "expired" || targetStatus == "failed" {
			if err := txDB.Model(&models.Ticket{}).Where("transaction_id = ?", tx.ID).Update("status", "cancelled").Error; err != nil {
				return fmt.Errorf("failed to update ticket status to cancelled: %w", err)
			}
		}

		return nil
	})
}

// GetTransaction retrieves transaction details by ID
func (s *PaymentService) GetTransaction(id uuid.UUID) (*models.Transaction, error) {
	return s.repo.GetTransactionByID(id)
}

// GetTransactionByOrderNumber retrieves transaction details by order number
func (s *PaymentService) GetTransactionByOrderNumber(orderNumber string) (*models.Transaction, error) {
	return s.repo.GetTransactionByOrderNumber(orderNumber)
}

// ListTenantTransactions retrieves paginated transactions for a tenant
func (s *PaymentService) ListTenantTransactions(tenantID uuid.UUID, page, perPage int, status string) ([]models.Transaction, int64, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	return s.repo.ListTransactionsByTenant(tenantID, page, perPage, status)
}

// ListUserTransactions retrieves paginated transactions for a user
func (s *PaymentService) ListUserTransactions(userID uuid.UUID, page, perPage int) ([]models.Transaction, int64, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	return s.repo.ListTransactionsByUser(userID, page, perPage)
}

// InitiatePayout creates a payout for paid transactions within a given period
func (s *PaymentService) InitiatePayout(tenantID uuid.UUID, req InitiatePayoutRequest) (*models.Payout, error) {
	transactions, err := s.repo.GetPaidTransactionsForPayout(tenantID, req.PeriodStart, req.PeriodEnd)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve paid transactions: %w", err)
	}

	if len(transactions) == 0 {
		return nil, errors.New("no paid transactions found for the specified period")
	}

	var grossAmount, totalPlatformFee, netPayoutAmount float64
	for _, tx := range transactions {
		grossAmount += tx.GrandTotal
		totalPlatformFee += tx.TotalPlatformFee
		netPayoutAmount += tx.NetPayoutAmount
	}

	var tenant models.Tenant
	var bankName, bankAccNum, bankAccHolder *string
	if err := s.db.Where("id = ?", tenantID).First(&tenant).Error; err == nil {
		bankName = tenant.BankName
		bankAccNum = tenant.BankAccountNumber
		bankAccHolder = tenant.BankAccountHolder
	}

	payout := &models.Payout{
		TenantID:          tenantID,
		PayoutPeriodStart: req.PeriodStart,
		PayoutPeriodEnd:   req.PeriodEnd,
		TotalTransactions: len(transactions),
		GrossAmount:       grossAmount,
		TotalPlatformFee:  totalPlatformFee,
		NetPayoutAmount:   netPayoutAmount,
		PayoutStatus:      "pending",
		BankName:          bankName,
		BankAccountNumber: bankAccNum,
		BankAccountHolder: bankAccHolder,
	}

	if err := s.repo.CreatePayout(payout); err != nil {
		return nil, fmt.Errorf("failed to create payout record: %w", err)
	}

	items := make([]models.PayoutItem, len(transactions))
	for i, tx := range transactions {
		items[i] = models.PayoutItem{
			PayoutID:      payout.ID,
			TransactionID: tx.ID,
			Amount:        tx.NetPayoutAmount,
		}
	}

	if err := s.repo.CreatePayoutItems(items); err != nil {
		return nil, fmt.Errorf("failed to create payout items: %w", err)
	}

	payout.Items = items
	return payout, nil
}

// ListPayouts retrieves paginated payouts for a tenant
func (s *PaymentService) ListPayouts(tenantID uuid.UUID, page, perPage int) ([]models.Payout, int64, error) {
	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	return s.repo.ListPayouts(tenantID, page, perPage)
}

// HandlePayoutWebhook updates payout status from gateway callback
func (s *PaymentService) HandlePayoutWebhook(req PayoutWebhookRequest) error {
	status := strings.ToLower(req.Status)
	gatewayRef := fmt.Sprintf("PO-%s", req.PayoutID.String()[:8])
	transferredAt := req.TransferredAt
	if transferredAt == nil && status == "completed" {
		now := time.Now()
		transferredAt = &now
	}

	if err := s.repo.UpdatePayoutStatus(req.PayoutID, status, &gatewayRef, transferredAt); err != nil {
		return fmt.Errorf("failed to update payout status: %w", err)
	}

	return nil
}

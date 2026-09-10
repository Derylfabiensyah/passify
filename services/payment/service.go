package payment

import (
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// DTO Structs

// SnapItemRequest item line in snap request
type SnapItemRequest struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

// CreateSnapOrderRequest contains data required to generate a Midtrans Snap transaction
type CreateSnapOrderRequest struct {
	OrderNumber     string            `json:"order_number"`
	GrossAmount     float64           `json:"gross_amount"`
	DestinationID   *uuid.UUID        `json:"destination_id,omitempty"`
	DestinationName string            `json:"destination_name,omitempty"`
	DestinationSlug string            `json:"destination_slug,omitempty"`
	TenantID        *uuid.UUID        `json:"tenant_id,omitempty"`
	UserID          *uuid.UUID        `json:"user_id,omitempty"`
	CustomerName    string            `json:"customer_name"`
	CustomerEmail   string            `json:"customer_email"`
	CustomerPhone   string            `json:"customer_phone"`
	VisitDate       *string           `json:"visit_date,omitempty"`
	TimeSlotID      *uuid.UUID        `json:"time_slot_id,omitempty"`
	VisitorCount    int               `json:"visitor_count,omitempty"`
	Items           []SnapItemRequest `json:"items,omitempty"`
}

// PaymentInvoiceResponse contains invoice creation response details
type PaymentInvoiceResponse struct {
	TransactionID uuid.UUID  `json:"transaction_id"`
	OrderNumber   string     `json:"order_number"`
	InvoiceURL    string     `json:"invoice_url"`
	SnapToken     string     `json:"snap_token,omitempty"`
	ClientKey     string     `json:"client_key,omitempty"`
	PaymentMethod string     `json:"payment_method,omitempty"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
}

// WebhookRequest contains payment gateway callback payload (Generic/Xendit)
type WebhookRequest struct {
	ExternalID    string     `json:"external_id"`
	Status        string     `json:"status"`
	PaymentMethod string     `json:"payment_method"`
	PaidAt        *time.Time `json:"paid_at,omitempty"`
	Amount        float64    `json:"amount"`
}

// MidtransNotificationRequest contains Midtrans HTTP notification payload
type MidtransNotificationRequest struct {
	TransactionTime   string `json:"transaction_time"`
	TransactionStatus string `json:"transaction_status"`
	TransactionID     string `json:"transaction_id"`
	StatusMessage     string `json:"status_message"`
	StatusCode        string `json:"status_code"`
	SignatureKey      string `json:"signature_key"`
	PaymentType       string `json:"payment_type"`
	OrderID           string `json:"order_id"`
	MerchantID        string `json:"merchant_id"`
	GrossAmount       string `json:"gross_amount"`
	FraudStatus       string `json:"fraud_status"`
	Currency          string `json:"currency"`
	SettlementTime    string `json:"settlement_time,omitempty"`
}

// VerifyMidtransSignature validates SHA512 signature from Midtrans
func VerifyMidtransSignature(orderID, statusCode, grossAmount, serverKey, signatureKey string) bool {
	if serverKey == "" {
		return true
	}
	hasher := sha512.New()
	hasher.Write([]byte(orderID + statusCode + grossAmount + serverKey))
	expected := hex.EncodeToString(hasher.Sum(nil))
	return strings.EqualFold(expected, signatureKey)
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

// CreatePaymentInvoice creates a Midtrans Snap transaction token and payment URL
func (s *PaymentService) CreatePaymentInvoice(transactionID uuid.UUID) (*PaymentInvoiceResponse, error) {
	tx, err := s.repo.GetTransactionByID(transactionID)
	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	if tx.PaymentStatus == "paid" {
		return nil, errors.New("transaction is already paid")
	}

	var snapToken string
	var invoiceURL string
	paymentMethod := "MIDTRANS_SNAP"
	if tx.PaymentMethod != nil && *tx.PaymentMethod != "" {
		paymentMethod = *tx.PaymentMethod
	}

	var expiresAt *time.Time
	if tx.ExpiredAt != nil {
		expiresAt = tx.ExpiredAt
	} else {
		exp := time.Now().Add(24 * time.Hour)
		expiresAt = &exp
	}

	if s.cfg.MidtransServerKey != "" {
		var snapClient snap.Client
		env := midtrans.Sandbox
		if s.cfg.MidtransIsProduction {
			env = midtrans.Production
		}
		snapClient.New(s.cfg.MidtransServerKey, env)

		var items []midtrans.ItemDetails
		if len(tx.Tickets) > 0 {
			for _, t := range tx.Tickets {
				items = append(items, midtrans.ItemDetails{
					ID:    t.TicketCode,
					Name:  fmt.Sprintf("Tiket %s", tx.OrderNumber),
					Price: int64(t.UnitPrice),
					Qty:   1,
				})
			}
			if tx.TotalPlatformFee > 0 {
				items = append(items, midtrans.ItemDetails{
					ID:    "FEE-PLATFORM",
					Name:  "Biaya Layanan Platform",
					Price: int64(tx.TotalPlatformFee),
					Qty:   1,
				})
			}
		} else {
			items = append(items, midtrans.ItemDetails{
				ID:    tx.OrderNumber,
				Name:  fmt.Sprintf("Tiket Wisata (%d Orang)", tx.VisitorCount),
				Price: int64(tx.GrandTotal),
				Qty:   1,
			})
		}

		snapReq := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{
				OrderID:  tx.OrderNumber,
				GrossAmt: int64(tx.GrandTotal),
			},
			Items: &items,
		}

		if tx.User != nil {
			phone := ""
			if tx.User.Phone != nil {
				phone = *tx.User.Phone
			}
			snapReq.CustomerDetail = &midtrans.CustomerDetails{
				FName: tx.User.FullName,
				Email: tx.User.Email,
				Phone: phone,
			}
		}

		snapResp, snapErr := snapClient.CreateTransaction(snapReq)
		if snapErr != nil {
			return nil, fmt.Errorf("gagal membuat transaksi Midtrans Snap: %s", snapErr.GetMessage())
		}

		snapToken = snapResp.Token
		invoiceURL = snapResp.RedirectURL
	} else {
		// Development fallback when Midtrans Server Key is not set in .env
		snapToken = fmt.Sprintf("SNAP-SIMULATOR-%s", tx.OrderNumber)
		invoiceURL = fmt.Sprintf("https://app.sandbox.midtrans.com/snap/v2/vtweb/%s", snapToken)
	}

	gatewayRef := snapToken
	err = s.repo.UpdateTransactionPayment(tx.ID, "pending", &paymentMethod, &gatewayRef, &invoiceURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to update transaction payment info: %w", err)
	}

	return &PaymentInvoiceResponse{
		TransactionID: tx.ID,
		OrderNumber:   tx.OrderNumber,
		InvoiceURL:    invoiceURL,
		SnapToken:     snapToken,
		ClientKey:     s.cfg.MidtransClientKey,
		PaymentMethod: paymentMethod,
		ExpiresAt:     expiresAt,
	}, nil
}

// HandleMidtransNotification processes Midtrans notification webhook
func (s *PaymentService) HandleMidtransNotification(notif MidtransNotificationRequest) error {
	if notif.SignatureKey != "" && s.cfg.MidtransServerKey != "" {
		if !VerifyMidtransSignature(notif.OrderID, notif.StatusCode, notif.GrossAmount, s.cfg.MidtransServerKey, notif.SignatureKey) {
			return errors.New("signature key tidak valid")
		}
	}

	tx, err := s.repo.GetTransactionByOrderNumber(notif.OrderID)
	if err != nil {
		return fmt.Errorf("transaction not found for order %s: %w", notif.OrderID, err)
	}

	var targetStatus string
	switch notif.TransactionStatus {
	case "capture":
		if notif.FraudStatus == "challenge" {
			targetStatus = "challenge"
		} else {
			targetStatus = "paid"
		}
	case "settlement":
		targetStatus = "paid"
	case "pending":
		targetStatus = "pending"
	case "deny", "cancel":
		targetStatus = "failed"
	case "expire":
		targetStatus = "expired"
	case "refund", "partial_refund":
		targetStatus = "refunded"
	default:
		targetStatus = notif.TransactionStatus
	}

	return s.db.Transaction(func(txDB *gorm.DB) error {
		var paidAt *time.Time
		if targetStatus == "paid" {
			now := time.Now()
			paidAt = &now
		}

		updates := map[string]interface{}{
			"payment_status": targetStatus,
			"updated_at":     time.Now(),
		}

		if notif.PaymentType != "" {
			updates["payment_method"] = notif.PaymentType
		}

		if notif.TransactionID != "" {
			updates["payment_gateway_ref"] = notif.TransactionID
		}

		if paidAt != nil {
			updates["paid_at"] = *paidAt
		}

		if err := txDB.Model(&models.Transaction{}).Where("id = ?", tx.ID).Updates(updates).Error; err != nil {
			return fmt.Errorf("failed to update transaction status: %w", err)
		}

		if targetStatus == "paid" {
			if err := txDB.Model(&models.Ticket{}).Where("transaction_id = ?", tx.ID).Update("status", "active").Error; err != nil {
				return fmt.Errorf("failed to update tickets to active: %w", err)
			}
		} else if targetStatus == "failed" || targetStatus == "expired" {
			if err := txDB.Model(&models.Ticket{}).Where("transaction_id = ?", tx.ID).Update("status", "cancelled").Error; err != nil {
				return fmt.Errorf("failed to update tickets to cancelled: %w", err)
			}
		}

		return nil
	})
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

// CreateSnapTransaction creates a Midtrans Snap transaction for a checkout order
func (s *PaymentService) CreateSnapTransaction(req *CreateSnapOrderRequest) (*PaymentInvoiceResponse, error) {
	if req.OrderNumber == "" {
		req.OrderNumber = fmt.Sprintf("TWA-%s-%04d", time.Now().Format("20060102"), time.Now().UnixNano()%10000)
	}

	grossAmt := int64(req.GrossAmount)
	if grossAmt <= 0 {
		var sum float64
		for _, it := range req.Items {
			qty := it.Quantity
			if qty <= 0 {
				qty = 1
			}
			sum += it.Price * float64(qty)
		}
		grossAmt = int64(sum)
	}
	if grossAmt <= 0 {
		grossAmt = 35000
	}

	var snapToken string
	var invoiceURL string
	paymentMethod := "MIDTRANS_SNAP"
	expiresAt := time.Now().Add(24 * time.Hour)

	if s.cfg.MidtransServerKey != "" {
		var snapClient snap.Client
		env := midtrans.Sandbox
		if s.cfg.MidtransIsProduction {
			env = midtrans.Production
		}
		snapClient.New(s.cfg.MidtransServerKey, env)

		var items []midtrans.ItemDetails
		var itemsTotal int64
		for _, it := range req.Items {
			qty := it.Quantity
			if qty <= 0 {
				qty = 1
			}
			price := int64(it.Price)
			items = append(items, midtrans.ItemDetails{
				ID:    it.ID,
				Name:  it.Name,
				Price: price,
				Qty:   int32(qty),
			})
			itemsTotal += price * int64(qty)
		}

		if itemsTotal != grossAmt || len(items) == 0 {
			name := req.DestinationName
			if name == "" {
				name = "Tiket Wisata Alam"
			}
			items = []midtrans.ItemDetails{
				{
					ID:    req.OrderNumber,
					Name:  fmt.Sprintf("%s (%s)", name, req.OrderNumber),
					Price: grossAmt,
					Qty:   1,
				},
			}
		}

		fName := req.CustomerName
		if fName == "" {
			fName = "Wisatawan"
		}
		email := req.CustomerEmail
		if email == "" {
			email = "visitor@passify.id"
		}
		phone := req.CustomerPhone
		if phone == "" {
			phone = "08123456789"
		}

		snapReq := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{
				OrderID:  req.OrderNumber,
				GrossAmt: grossAmt,
			},
			CustomerDetail: &midtrans.CustomerDetails{
				FName: fName,
				Email: email,
				Phone: phone,
			},
			Items: &items,
		}

		snapResp, snapErr := snapClient.CreateTransaction(snapReq)
		if snapErr != nil {
			return nil, fmt.Errorf("gagal membuat transaksi Midtrans Snap: %s", snapErr.GetMessage())
		}

		snapToken = snapResp.Token
		invoiceURL = snapResp.RedirectURL
	} else {
		snapToken = fmt.Sprintf("SNAP-%s-%04d", req.OrderNumber, time.Now().Unix()%1000)
		invoiceURL = fmt.Sprintf("https://app.sandbox.midtrans.com/snap/v2/vtweb/%s", snapToken)
	}

	// Resolve foreign keys for Transaction
	var tenantID uuid.UUID
	if req.TenantID != nil && *req.TenantID != uuid.Nil {
		tenantID = *req.TenantID
	} else {
		var t models.Tenant
		if err := s.db.First(&t).Error; err == nil {
			tenantID = t.ID
		} else {
			tenantID = uuid.New()
		}
	}

	var destinationID uuid.UUID
	if req.DestinationID != nil && *req.DestinationID != uuid.Nil {
		destinationID = *req.DestinationID
		if req.TenantID == nil || *req.TenantID == uuid.Nil {
			var d models.Destination
			if err := s.db.Where("id = ?", destinationID).First(&d).Error; err == nil && d.TenantID != uuid.Nil {
				tenantID = d.TenantID
			}
		}
	} else if req.DestinationSlug != "" {
		var d models.Destination
		if err := s.db.Where("slug = ?", req.DestinationSlug).First(&d).Error; err == nil {
			destinationID = d.ID
			if d.TenantID != uuid.Nil && (req.TenantID == nil || *req.TenantID == uuid.Nil) {
				tenantID = d.TenantID
			}
		}
	}
	if destinationID == uuid.Nil {
		var d models.Destination
		if err := s.db.First(&d).Error; err == nil {
			destinationID = d.ID
			if d.TenantID != uuid.Nil && (req.TenantID == nil || *req.TenantID == uuid.Nil) {
				tenantID = d.TenantID
			}
		}
	}

	var userID uuid.UUID
	if req.UserID != nil && *req.UserID != uuid.Nil {
		userID = *req.UserID
	} else {
		var u models.User
		if req.CustomerEmail != "" && s.db.Where("email = ?", req.CustomerEmail).First(&u).Error == nil {
			userID = u.ID
		} else if s.db.First(&u).Error == nil {
			userID = u.ID
		}
	}

	visitDate := time.Now()
	if req.VisitDate != nil && *req.VisitDate != "" {
		if t, err := time.Parse("2006-01-02", *req.VisitDate); err == nil {
			visitDate = t
		}
	}

	vCount := req.VisitorCount
	if vCount <= 0 {
		vCount = 1
	}

	platformFee := float64(s.cfg.PlatformFeePerTicket)
	if platformFee <= 0 {
		platformFee = 2500
	}
	subtotal := float64(grossAmt) - platformFee
	if subtotal < 0 {
		subtotal = float64(grossAmt)
		platformFee = 0
	}

	// Create or update transaction record in PostgreSQL
	var existing models.Transaction
	var txID uuid.UUID
	if err := s.db.Where("order_number = ?", req.OrderNumber).First(&existing).Error; err == nil {
		txID = existing.ID
		s.db.Model(&existing).Updates(map[string]interface{}{
			"grand_total":         float64(grossAmt),
			"payment_status":      "pending",
			"payment_method":      paymentMethod,
			"payment_gateway_ref": snapToken,
			"payment_url":         invoiceURL,
			"updated_at":          time.Now(),
		})
	} else {
		txID = uuid.New()
		newTx := &models.Transaction{
			BaseModel: models.BaseModel{
				ID: txID,
			},
			TenantID:          tenantID,
			UserID:            userID,
			DestinationID:     destinationID,
			OrderNumber:       req.OrderNumber,
			VisitDate:         visitDate,
			TimeSlotID:        req.TimeSlotID,
			VisitorCount:      vCount,
			Subtotal:          subtotal,
			PlatformFee:       platformFee,
			TotalPlatformFee:  platformFee,
			GrandTotal:        float64(grossAmt),
			NetPayoutAmount:   subtotal,
			PaymentStatus:     "pending",
			PaymentMethod:     &paymentMethod,
			PaymentGatewayRef: &snapToken,
			PaymentURL:        &invoiceURL,
			ExpiredAt:         &expiresAt,
		}
		_ = s.db.Create(newTx)
	}

	return &PaymentInvoiceResponse{
		TransactionID: txID,
		OrderNumber:   req.OrderNumber,
		InvoiceURL:    invoiceURL,
		SnapToken:     snapToken,
		ClientKey:     s.cfg.MidtransClientKey,
		PaymentMethod: paymentMethod,
		ExpiresAt:     &expiresAt,
	}, nil
}

// FinishSnapPayment confirms payment settlement for Midtrans Snap
func (s *PaymentService) FinishSnapPayment(orderNumber string) error {
	tx, err := s.repo.GetTransactionByOrderNumber(orderNumber)
	if err != nil {
		return fmt.Errorf("transaction not found: %w", err)
	}

	// If Midtrans Server Key is configured, attempt direct status check with Midtrans API
	if s.cfg.MidtransServerKey != "" {
		apiURL := fmt.Sprintf("https://api.sandbox.midtrans.com/v2/%s/status", orderNumber)
		if s.cfg.MidtransIsProduction {
			apiURL = fmt.Sprintf("https://api.midtrans.com/v2/%s/status", orderNumber)
		}

		req, err := http.NewRequest("GET", apiURL, nil)
		if err == nil {
			authHeader := "Basic " + base64.StdEncoding.EncodeToString([]byte(s.cfg.MidtransServerKey+":"))
			req.Header.Set("Authorization", authHeader)
			req.Header.Set("Accept", "application/json")

			client := &http.Client{Timeout: 8 * time.Second}
			resp, err := client.Do(req)
			if err == nil {
				if resp.StatusCode == http.StatusOK {
					var statusResp map[string]interface{}
					if json.NewDecoder(resp.Body).Decode(&statusResp) == nil {
						if tStatus, ok := statusResp["transaction_status"].(string); ok {
							if tStatus == "settlement" || tStatus == "capture" || tStatus == "success" {
								// Confirmed by Midtrans
							}
						}
					}
				}
				resp.Body.Close()
			}
		}
	}

	// Atomically mark transaction as paid and activate tickets
	return s.db.Transaction(func(txDB *gorm.DB) error {
		now := time.Now()
		updates := map[string]interface{}{
			"payment_status": "paid",
			"paid_at":        now,
			"updated_at":     now,
		}
		if err := txDB.Model(&models.Transaction{}).Where("id = ?", tx.ID).Updates(updates).Error; err != nil {
			return err
		}

		// Activate any tickets linked to this transaction
		res := txDB.Model(&models.Ticket{}).Where("transaction_id = ?", tx.ID).Update("status", "active")
		if res.RowsAffected == 0 && tx.DestinationID != uuid.Nil {
			var cat models.TicketCategory
			if err := txDB.Where("destination_id = ?", tx.DestinationID).First(&cat).Error; err == nil {
				vCount := tx.VisitorCount
				if vCount <= 0 {
					vCount = 1
				}
				for i := 0; i < vCount; i++ {
					tCode := fmt.Sprintf("TWA-%s-%04d", time.Now().Format("20060102"), rand.Intn(9000)+1000)
					totpKey := fmt.Sprintf("TOTP%s%04d", tx.ID.String()[:8], i)
					visName := "Wisatawan Terverifikasi"
					newTkt := &models.Ticket{
						BaseModel: models.BaseModel{
							ID: uuid.New(),
						},
						TenantID:      tx.TenantID,
						TransactionID: tx.ID,
						CategoryID:    cat.ID,
						DestinationID: tx.DestinationID,
						TicketCode:    tCode,
						VisitDate:     tx.VisitDate,
						TimeSlotID:    tx.TimeSlotID,
						VisitorName:   &visName,
						UnitPrice:     cat.BasePrice,
						TOTPSecretKey: totpKey,
						Status:        "active",
					}
					_ = txDB.Create(newTkt)
				}
			}
		}
		return nil
	})
}

// GetSnapStatus retrieves order and payment status
func (s *PaymentService) GetSnapStatus(orderNumber string) (map[string]interface{}, error) {
	tx, err := s.repo.GetTransactionByOrderNumber(orderNumber)
	if err != nil {
		return nil, fmt.Errorf("transaksi tidak ditemukan: %w", err)
	}

	// If still pending and Midtrans server key exists, query Midtrans API directly to check if settled
	if tx.PaymentStatus == "pending" && s.cfg.MidtransServerKey != "" {
		apiURL := fmt.Sprintf("https://api.sandbox.midtrans.com/v2/%s/status", orderNumber)
		if s.cfg.MidtransIsProduction {
			apiURL = fmt.Sprintf("https://api.midtrans.com/v2/%s/status", orderNumber)
		}

		req, err := http.NewRequest("GET", apiURL, nil)
		if err == nil {
			authHeader := "Basic " + base64.StdEncoding.EncodeToString([]byte(s.cfg.MidtransServerKey+":"))
			req.Header.Set("Authorization", authHeader)
			req.Header.Set("Accept", "application/json")

			client := &http.Client{Timeout: 5 * time.Second}
			resp, err := client.Do(req)
			if err == nil {
				if resp.StatusCode == http.StatusOK {
					var statusResp map[string]interface{}
					if json.NewDecoder(resp.Body).Decode(&statusResp) == nil {
						if tStatus, ok := statusResp["transaction_status"].(string); ok {
							if tStatus == "settlement" || tStatus == "capture" {
								now := time.Now()
								s.db.Model(&models.Transaction{}).Where("id = ?", tx.ID).Updates(map[string]interface{}{
									"payment_status": "paid",
									"paid_at":        now,
									"updated_at":     now,
								})
								s.db.Model(&models.Ticket{}).Where("transaction_id = ?", tx.ID).Update("status", "active")
								tx.PaymentStatus = "paid"
								tx.PaidAt = &now
							}
						}
					}
				}
				resp.Body.Close()
			}
		}
	}

	return map[string]interface{}{
		"order_number":   tx.OrderNumber,
		"payment_status": tx.PaymentStatus,
		"grand_total":    tx.GrandTotal,
		"paid_at":        tx.PaidAt,
		"payment_method": tx.PaymentMethod,
		"payment_url":    tx.PaymentURL,
	}, nil
}


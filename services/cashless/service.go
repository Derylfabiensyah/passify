package cashless

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// DTO Requests
type TopUpRequest struct {
	Amount        float64 `json:"amount" binding:"required"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
}

type PayRequest struct {
	BoothID        uuid.UUID  `json:"booth_id" binding:"required"`
	ProductID      *uuid.UUID `json:"product_id,omitempty"`
	Quantity       int        `json:"quantity"`
	Amount         float64    `json:"amount" binding:"required"`
	QRScanRef      string     `json:"qr_scan_ref,omitempty"`
	CustomerUserID *uuid.UUID `json:"customer_user_id,omitempty"`
}

type CreateBoothRequest struct {
	DestinationID uuid.UUID  `json:"destination_id" binding:"required"`
	Name          string     `json:"name" binding:"required"`
	Category      string     `json:"category" binding:"required"`
	Description   *string    `json:"description,omitempty"`
	UserID        *uuid.UUID `json:"user_id,omitempty"`
}

type UpdateBoothRequest struct {
	Name        *string `json:"name,omitempty"`
	Category    *string `json:"category,omitempty"`
	Description *string `json:"description,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

type CreateProductRequest struct {
	BoothID  uuid.UUID `json:"booth_id" binding:"required"`
	Name     string    `json:"name" binding:"required"`
	Price    float64   `json:"price" binding:"required"`
	ImageURL *string   `json:"image_url,omitempty"`
}

// CashlessService defines business logic operations for cashless QR wallet and vendor management
type CashlessService struct {
	db   *gorm.DB
	repo *CashlessRepository
}

// NewCashlessService creates a new CashlessService instance
func NewCashlessService(db *gorm.DB, repo *CashlessRepository) *CashlessService {
	return &CashlessService{
		db:   db,
		repo: repo,
	}
}

// GetOrCreateWallet retrieves existing user wallet or creates a new one if not found
func (s *CashlessService) GetOrCreateWallet(userID uuid.UUID, tenantID *uuid.UUID) (*models.Wallet, error) {
	wallet, err := s.repo.GetWalletByUserID(userID)
	if err == nil {
		return wallet, nil
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		newWallet := &models.Wallet{
			BaseModel: models.BaseModel{
				ID: uuid.New(),
			},
			UserID:   userID,
			TenantID: tenantID,
			Balance:  0,
			IsActive: true,
		}
		if err := s.repo.CreateWallet(newWallet); err != nil {
			return nil, fmt.Errorf("failed to create wallet: %w", err)
		}
		return newWallet, nil
	}

	return nil, err
}

// GetWalletBalance gets the balance for a user's wallet
func (s *CashlessService) GetWalletBalance(userID uuid.UUID) (*models.Wallet, error) {
	return s.GetOrCreateWallet(userID, nil)
}

// TopUp handles adding funds to a user's wallet
func (s *CashlessService) TopUp(userID uuid.UUID, req TopUpRequest) (*models.Wallet, *models.WalletTransaction, error) {
	if req.Amount <= 0 {
		return nil, nil, errors.New("jumlah top up harus lebih dari 0")
	}

	wallet, err := s.GetOrCreateWallet(userID, nil)
	if err != nil {
		return nil, nil, err
	}

	var updatedWallet *models.Wallet
	var walletTx *models.WalletTransaction

	err = s.db.Transaction(func(tx *gorm.DB) error {
		repoTx := s.repo.WithTx(tx)

		w, err := repoTx.GetWalletByID(wallet.ID)
		if err != nil {
			return err
		}

		balanceBefore := w.Balance
		balanceAfter := balanceBefore + req.Amount

		if err := repoTx.UpdateWalletBalance(w.ID, balanceAfter); err != nil {
			return fmt.Errorf("failed to update wallet balance: %w", err)
		}

		refStr := req.PaymentMethod
		descStr := fmt.Sprintf("Top up via %s", req.PaymentMethod)

		txRecord := &models.WalletTransaction{
			ID:            uuid.New(),
			WalletID:      w.ID,
			TenantID:      w.TenantID,
			TxType:        "topup",
			Amount:        req.Amount,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			ReferenceID:   &refStr,
			Description:   &descStr,
			CreatedAt:     time.Now(),
		}

		if err := repoTx.CreateWalletTransaction(txRecord); err != nil {
			return fmt.Errorf("failed to create wallet transaction: %w", err)
		}

		w.Balance = balanceAfter
		updatedWallet = w
		walletTx = txRecord
		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return updatedWallet, walletTx, nil
}

// Pay deducts wallet balance, creates wallet transaction, and records vendor sale atomically
func (s *CashlessService) Pay(userID uuid.UUID, req PayRequest) (*models.Wallet, *models.WalletTransaction, error) {
	if req.Amount <= 0 {
		return nil, nil, errors.New("jumlah pembayaran harus lebih dari 0")
	}

	booth, err := s.repo.GetVendorBoothByID(req.BoothID)
	if err != nil {
		return nil, nil, errors.New("vendor booth tidak ditemukan")
	}

	wallet, err := s.GetOrCreateWallet(userID, &booth.TenantID)
	if err != nil {
		return nil, nil, err
	}

	if wallet.Balance < req.Amount {
		return nil, nil, errors.New("saldo wallet tidak mencukupi")
	}

	quantity := req.Quantity
	if quantity <= 0 {
		quantity = 1
	}

	var updatedWallet *models.Wallet
	var walletTx *models.WalletTransaction

	err = s.db.Transaction(func(tx *gorm.DB) error {
		repoTx := s.repo.WithTx(tx)

		w, err := repoTx.GetWalletByID(wallet.ID)
		if err != nil {
			return err
		}

		if w.Balance < req.Amount {
			return errors.New("saldo wallet tidak mencukupi")
		}

		balanceBefore := w.Balance
		balanceAfter := balanceBefore - req.Amount

		if err := repoTx.UpdateWalletBalance(w.ID, balanceAfter); err != nil {
			return fmt.Errorf("failed to update wallet balance: %w", err)
		}

		boothIDStr := req.BoothID.String()
		descStr := fmt.Sprintf("Pembayaran ke booth %s", booth.Name)

		txRecord := &models.WalletTransaction{
			ID:            uuid.New(),
			WalletID:      w.ID,
			TenantID:      &booth.TenantID,
			TxType:        "payment",
			Amount:        req.Amount,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			ReferenceID:   &boothIDStr,
			Description:   &descStr,
			CreatedAt:     time.Now(),
		}

		if err := repoTx.CreateWalletTransaction(txRecord); err != nil {
			return fmt.Errorf("failed to create wallet transaction: %w", err)
		}

		var qrRef *string
		if req.QRScanRef != "" {
			qrRef = &req.QRScanRef
		}

		saleRecord := &models.VendorSale{
			ID:          uuid.New(),
			TenantID:    booth.TenantID,
			BoothID:     req.BoothID,
			WalletID:    w.ID,
			ProductID:   req.ProductID,
			Quantity:    quantity,
			TotalAmount: req.Amount,
			QRScanRef:   qrRef,
			CreatedAt:   time.Now(),
		}

		if err := repoTx.CreateVendorSale(saleRecord); err != nil {
			return fmt.Errorf("failed to create vendor sale: %w", err)
		}

		w.Balance = balanceAfter
		updatedWallet = w
		walletTx = txRecord
		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return updatedWallet, walletTx, nil
}

// RefundWallet refunds an amount to a user's wallet
func (s *CashlessService) RefundWallet(userID uuid.UUID, amount float64, referenceID string) (*models.Wallet, *models.WalletTransaction, error) {
	if amount <= 0 {
		return nil, nil, errors.New("jumlah refund harus lebih dari 0")
	}

	wallet, err := s.GetOrCreateWallet(userID, nil)
	if err != nil {
		return nil, nil, err
	}

	var updatedWallet *models.Wallet
	var walletTx *models.WalletTransaction

	err = s.db.Transaction(func(tx *gorm.DB) error {
		repoTx := s.repo.WithTx(tx)

		w, err := repoTx.GetWalletByID(wallet.ID)
		if err != nil {
			return err
		}

		balanceBefore := w.Balance
		balanceAfter := balanceBefore + amount

		if err := repoTx.UpdateWalletBalance(w.ID, balanceAfter); err != nil {
			return fmt.Errorf("failed to update wallet balance: %w", err)
		}

		var refPtr *string
		if referenceID != "" {
			refPtr = &referenceID
		}
		descStr := fmt.Sprintf("Refund %s", referenceID)

		txRecord := &models.WalletTransaction{
			ID:            uuid.New(),
			WalletID:      w.ID,
			TenantID:      w.TenantID,
			TxType:        "refund",
			Amount:        amount,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			ReferenceID:   refPtr,
			Description:   &descStr,
			CreatedAt:     time.Now(),
		}

		if err := repoTx.CreateWalletTransaction(txRecord); err != nil {
			return fmt.Errorf("failed to create wallet transaction: %w", err)
		}

		w.Balance = balanceAfter
		updatedWallet = w
		walletTx = txRecord
		return nil
	})

	if err != nil {
		return nil, nil, err
	}

	return updatedWallet, walletTx, nil
}

// AutoRefundRemainingBalance automatically transfers all remaining wallet balance back to the visitor's bank/e-wallet account upon leaving the venue or upon request
func (s *CashlessService) AutoRefundRemainingBalance(userID uuid.UUID, payoutChannel, accountNumber string) (*models.Wallet, *models.WalletTransaction, float64, error) {
	wallet, err := s.GetOrCreateWallet(userID, nil)
	if err != nil {
		return nil, nil, 0, err
	}

	if wallet.Balance <= 0 {
		return nil, nil, 0, errors.New("tidak ada sisa saldo wallet untuk di-refund")
	}

	refundAmount := wallet.Balance
	var updatedWallet *models.Wallet
	var walletTx *models.WalletTransaction

	err = s.db.Transaction(func(tx *gorm.DB) error {
		repoTx := s.repo.WithTx(tx)

		w, err := repoTx.GetWalletByID(wallet.ID)
		if err != nil {
			return err
		}

		if w.Balance <= 0 {
			return errors.New("saldo sudah ditarik atau kosong")
		}

		balanceBefore := w.Balance
		balanceAfter := 0.0

		if err := repoTx.UpdateWalletBalance(w.ID, balanceAfter); err != nil {
			return fmt.Errorf("gagal mengupdate saldo wallet: %w", err)
		}

		channelDesc := payoutChannel
		if channelDesc == "" {
			channelDesc = "Metode Pembayaran Awal"
		}
		refStr := fmt.Sprintf("REFUND-AUTO-%s-%s", userID.String()[:8], time.Now().Format("20060102150405"))
		descStr := fmt.Sprintf("Auto-refund otomatis sisa deposit ke %s (%s)", channelDesc, accountNumber)

		txRecord := &models.WalletTransaction{
			ID:            uuid.New(),
			WalletID:      w.ID,
			TenantID:      w.TenantID,
			TxType:        "refund",
			Amount:        refundAmount,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			ReferenceID:   &refStr,
			Description:   &descStr,
			CreatedAt:     time.Now(),
		}

		if err := repoTx.CreateWalletTransaction(txRecord); err != nil {
			return fmt.Errorf("gagal mencatat transaksi refund: %w", err)
		}

		w.Balance = balanceAfter
		updatedWallet = w
		walletTx = txRecord
		return nil
	})

	if err != nil {
		return nil, nil, 0, err
	}

	return updatedWallet, walletTx, refundAmount, nil
}

// GetTransactionHistory retrieves paginated wallet transactions for a user
func (s *CashlessService) GetTransactionHistory(userID uuid.UUID, page, perPage int) ([]models.WalletTransaction, int64, error) {
	wallet, err := s.GetOrCreateWallet(userID, nil)
	if err != nil {
		return nil, 0, err
	}
	return s.repo.ListWalletTransactions(wallet.ID, page, perPage)
}

// CreateBooth creates a new vendor booth
func (s *CashlessService) CreateBooth(tenantID uuid.UUID, req CreateBoothRequest) (*models.VendorBooth, error) {
	booth := &models.VendorBooth{
		BaseModel: models.BaseModel{
			ID: uuid.New(),
		},
		TenantID:      tenantID,
		DestinationID: req.DestinationID,
		UserID:        req.UserID,
		Name:          req.Name,
		Category:      req.Category,
		Description:   req.Description,
		IsActive:      true,
	}

	if err := s.repo.CreateVendorBooth(booth); err != nil {
		return nil, fmt.Errorf("failed to create vendor booth: %w", err)
	}

	return booth, nil
}

// ListBooths lists all vendor booths for a given destination ID
func (s *CashlessService) ListBooths(destinationID uuid.UUID) ([]models.VendorBooth, error) {
	return s.repo.ListVendorBooths(destinationID)
}

// UpdateBooth updates vendor booth fields
func (s *CashlessService) UpdateBooth(id uuid.UUID, req UpdateBoothRequest) (*models.VendorBooth, error) {
	booth, err := s.repo.GetVendorBoothByID(id)
	if err != nil {
		return nil, errors.New("vendor booth tidak ditemukan")
	}

	if req.Name != nil {
		booth.Name = *req.Name
	}
	if req.Category != nil {
		booth.Category = *req.Category
	}
	if req.Description != nil {
		booth.Description = req.Description
	}
	if req.IsActive != nil {
		booth.IsActive = *req.IsActive
	}

	if err := s.repo.UpdateVendorBooth(booth); err != nil {
		return nil, fmt.Errorf("failed to update vendor booth: %w", err)
	}

	return booth, nil
}

// CreateProduct creates a new product for a vendor booth
func (s *CashlessService) CreateProduct(tenantID uuid.UUID, req CreateProductRequest) (*models.VendorProduct, error) {
	product := &models.VendorProduct{
		ID:          uuid.New(),
		BoothID:     req.BoothID,
		TenantID:    tenantID,
		Name:        req.Name,
		Price:       req.Price,
		ImageURL:    req.ImageURL,
		IsAvailable: true,
		CreatedAt:   time.Now(),
	}

	if err := s.repo.CreateVendorProduct(product); err != nil {
		return nil, fmt.Errorf("failed to create vendor product: %w", err)
	}

	return product, nil
}

// ListProducts lists products for a vendor booth
func (s *CashlessService) ListProducts(boothID uuid.UUID) ([]models.VendorProduct, error) {
	return s.repo.ListVendorProducts(boothID)
}

// ListBoothSales lists paginated sales for a vendor booth
func (s *CashlessService) ListBoothSales(boothID uuid.UUID, page, perPage int) ([]models.VendorSale, int64, error) {
	return s.repo.ListVendorSales(boothID, page, perPage)
}

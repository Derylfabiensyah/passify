package cashless

import (
	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// CashlessRepository handles data access operations for cashless wallet and vendor management
type CashlessRepository struct {
	db *gorm.DB
}

// NewCashlessRepository creates a new instance of CashlessRepository
func NewCashlessRepository(db *gorm.DB) *CashlessRepository {
	return &CashlessRepository{db: db}
}

// WithTx creates a new repository instance using the provided transaction session
func (r *CashlessRepository) WithTx(tx *gorm.DB) *CashlessRepository {
	if tx == nil {
		return r
	}
	return &CashlessRepository{db: tx}
}

// CreateWallet creates a new user wallet
func (r *CashlessRepository) CreateWallet(wallet *models.Wallet) error {
	return r.db.Create(wallet).Error
}

// GetWalletByUserID retrieves a wallet by user ID
func (r *CashlessRepository) GetWalletByUserID(userID uuid.UUID) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.db.Where("user_id = ?", userID).First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

// GetWalletByID retrieves a wallet by wallet ID
func (r *CashlessRepository) GetWalletByID(id uuid.UUID) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.db.Where("id = ?", id).First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

// UpdateWalletBalance updates the balance of a wallet
func (r *CashlessRepository) UpdateWalletBalance(id uuid.UUID, newBalance float64) error {
	return r.db.Model(&models.Wallet{}).Where("id = ?", id).Update("balance", newBalance).Error
}

// CreateWalletTransaction records a wallet transaction
func (r *CashlessRepository) CreateWalletTransaction(tx *models.WalletTransaction) error {
	return r.db.Create(tx).Error
}

// ListWalletTransactions retrieves paginated wallet transactions for a given wallet ID
func (r *CashlessRepository) ListWalletTransactions(walletID uuid.UUID, page, perPage int) ([]models.WalletTransaction, int64, error) {
	var txs []models.WalletTransaction
	var total int64

	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	offset := (page - 1) * perPage

	err := r.db.Model(&models.WalletTransaction{}).Where("wallet_id = ?", walletID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Where("wallet_id = ?", walletID).
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&txs).Error
	if err != nil {
		return nil, 0, err
	}

	return txs, total, nil
}

// CreateVendorBooth creates a new vendor booth
func (r *CashlessRepository) CreateVendorBooth(booth *models.VendorBooth) error {
	return r.db.Create(booth).Error
}

// GetVendorBoothByID retrieves a vendor booth by ID
func (r *CashlessRepository) GetVendorBoothByID(id uuid.UUID) (*models.VendorBooth, error) {
	var booth models.VendorBooth
	err := r.db.Where("id = ?", id).First(&booth).Error
	if err != nil {
		return nil, err
	}
	return &booth, nil
}

// ListVendorBooths retrieves all vendor booths for a given destination ID
func (r *CashlessRepository) ListVendorBooths(destinationID uuid.UUID) ([]models.VendorBooth, error) {
	var booths []models.VendorBooth
	err := r.db.Where("destination_id = ?", destinationID).Find(&booths).Error
	if err != nil {
		return nil, err
	}
	return booths, nil
}

// UpdateVendorBooth updates an existing vendor booth
func (r *CashlessRepository) UpdateVendorBooth(booth *models.VendorBooth) error {
	return r.db.Save(booth).Error
}

// CreateVendorProduct creates a new vendor product
func (r *CashlessRepository) CreateVendorProduct(product *models.VendorProduct) error {
	return r.db.Create(product).Error
}

// ListVendorProducts retrieves all products for a vendor booth
func (r *CashlessRepository) ListVendorProducts(boothID uuid.UUID) ([]models.VendorProduct, error) {
	var products []models.VendorProduct
	err := r.db.Where("booth_id = ?", boothID).Find(&products).Error
	if err != nil {
		return nil, err
	}
	return products, nil
}

// UpdateVendorProduct updates an existing vendor product
func (r *CashlessRepository) UpdateVendorProduct(product *models.VendorProduct) error {
	return r.db.Save(product).Error
}

// CreateVendorSale records a new vendor sale
func (r *CashlessRepository) CreateVendorSale(sale *models.VendorSale) error {
	return r.db.Create(sale).Error
}

// ListVendorSales retrieves paginated sales for a given vendor booth ID
func (r *CashlessRepository) ListVendorSales(boothID uuid.UUID, page, perPage int) ([]models.VendorSale, int64, error) {
	var sales []models.VendorSale
	var total int64

	if page <= 0 {
		page = 1
	}
	if perPage <= 0 {
		perPage = 10
	}
	offset := (page - 1) * perPage

	err := r.db.Model(&models.VendorSale{}).Where("booth_id = ?", boothID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Where("booth_id = ?", boothID).
		Order("created_at DESC").
		Offset(offset).
		Limit(perPage).
		Find(&sales).Error
	if err != nil {
		return nil, 0, err
	}

	return sales, total, nil
}

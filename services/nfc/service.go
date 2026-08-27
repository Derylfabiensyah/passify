package nfc

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// DTOs
type LinkWristbandRequest struct {
	DestinationID uuid.UUID `json:"destination_id" binding:"required"`
	WristbandUID  string    `json:"wristband_uid" binding:"required"`
	TicketCode    string    `json:"ticket_code" binding:"required"`
}

type TapGateRequest struct {
	GateDeviceID uuid.UUID `json:"gate_device_id" binding:"required"`
	WristbandUID string    `json:"wristband_uid" binding:"required"`
}

type TapGateResponse struct {
	Valid       bool   `json:"valid"`
	VisitorName string `json:"visitor_name"`
	TicketCode  string `json:"ticket_code"`
	Category    string `json:"category"`
	Message     string `json:"message"`
}

type TapPayRequest struct {
	BoothID      uuid.UUID  `json:"booth_id" binding:"required"`
	WristbandUID string     `json:"wristband_uid" binding:"required"`
	ProductID    *uuid.UUID `json:"product_id,omitempty"`
	Quantity     int        `json:"quantity"`
	Amount       float64    `json:"amount" binding:"required"`
}

type TapPayResponse struct {
	Success       bool    `json:"success"`
	BoothName     string  `json:"booth_name"`
	AmountPaid    float64 `json:"amount_paid"`
	BalanceBefore float64 `json:"balance_before"`
	BalanceAfter  float64 `json:"balance_after"`
	Message       string  `json:"message"`
}

type WristbandInfoResponse struct {
	WristbandUID  string           `json:"wristband_uid"`
	Status        string           `json:"status"`
	VisitorName   string           `json:"visitor_name"`
	TicketCode    string           `json:"ticket_code"`
	WalletBalance float64          `json:"wallet_balance"`
	AssignedAt    *time.Time       `json:"assigned_at"`
	LastTappedAt  *time.Time       `json:"last_tapped_at"`
	Ticket        *models.Ticket   `json:"ticket,omitempty"`
	Wallet        *models.Wallet   `json:"wallet,omitempty"`
}

type NFCService interface {
	LinkWristband(tenantID uuid.UUID, req LinkWristbandRequest) (*models.NFCWristband, error)
	TapGate(req TapGateRequest) (*TapGateResponse, error)
	TapPay(req TapPayRequest) (*TapPayResponse, error)
	GetWristbandInfo(wristbandUID string) (*WristbandInfoResponse, error)
	UnlinkWristband(wristbandUID string) error
}

type nfcService struct {
	db *gorm.DB
}

func NewNFCService(db *gorm.DB) NFCService {
	return &nfcService{db: db}
}

// LinkWristband binds a physical NFC wristband UID to an active ticket and user wallet
func (s *nfcService) LinkWristband(tenantID uuid.UUID, req LinkWristbandRequest) (*models.NFCWristband, error) {
	// Find ticket
	var ticket models.Ticket
	if err := s.db.Where("ticket_code = ? AND tenant_id = ?", req.TicketCode, tenantID).First(&ticket).Error; err != nil {
		return nil, errors.New("tiket tidak ditemukan")
	}

	if ticket.Status != "active" {
		return nil, fmt.Errorf("tiket tidak aktif (status: %s)", ticket.Status)
	}

	// Check if wristband already linked to another active ticket
	var existing models.NFCWristband
	if err := s.db.Where("wristband_uid = ? AND status = 'active'", req.WristbandUID).First(&existing).Error; err == nil {
		return nil, errors.New("gelang NFC ini sudah tertaut pada tiket lain yang masih aktif")
	}

	// Find or create wallet for ticket's transaction user
	var transaction models.Transaction
	var wallet models.Wallet
	if err := s.db.First(&transaction, "id = ?", ticket.TransactionID).Error; err == nil {
		if err := s.db.FirstOrCreate(&wallet, models.Wallet{
			UserID:   transaction.UserID,
			TenantID: &tenantID,
			IsActive: true,
		}).Error; err != nil {
			_ = err
		}
	}

	now := time.Now()
	var userIDPtr *uuid.UUID
	if transaction.UserID != uuid.Nil {
		userIDPtr = &transaction.UserID
	}
	var walletIDPtr *uuid.UUID
	if wallet.ID != uuid.Nil {
		walletIDPtr = &wallet.ID
	}

	wristband := &models.NFCWristband{
		BaseModel: models.BaseModel{
			ID: uuid.New(),
		},
		TenantID:      tenantID,
		DestinationID: req.DestinationID,
		WristbandUID:  req.WristbandUID,
		UserID:        userIDPtr,
		TicketID:      &ticket.ID,
		WalletID:      walletIDPtr,
		Status:        "active",
		AssignedAt:    &now,
	}

	if err := s.db.Create(wristband).Error; err != nil {
		return nil, fmt.Errorf("gagal menautkan gelang NFC: %w", err)
	}

	return wristband, nil
}

// TapGate validates entrance using physical NFC wristband tap
func (s *nfcService) TapGate(req TapGateRequest) (*TapGateResponse, error) {
	var wristband models.NFCWristband
	if err := s.db.Preload("Ticket").Preload("Ticket.Category").First(&wristband, "wristband_uid = ? AND status = 'active'", req.WristbandUID).Error; err != nil {
		return &TapGateResponse{
			Valid:   false,
			Message: "Gelang NFC belum terdaftar atau tidak aktif",
		}, nil
	}

	if wristband.Ticket == nil {
		return &TapGateResponse{
			Valid:   false,
			Message: "Tidak ada tiket tertaut pada gelang ini",
		}, nil
	}

	ticket := wristband.Ticket
	today := time.Now().Format("2006-01-02")
	if ticket.VisitDate.Format("2006-01-02") != today {
		return &TapGateResponse{
			Valid:      false,
			TicketCode: ticket.TicketCode,
			Message:    fmt.Sprintf("Tiket berlaku untuk tanggal %s, bukan hari ini", ticket.VisitDate.Format("2006-01-02")),
		}, nil
	}

	if ticket.Status == "used" {
		return &TapGateResponse{
			Valid:      false,
			TicketCode: ticket.TicketCode,
			Message:    "Tiket pada gelang ini sudah pernah digunakan",
		}, nil
	}

	// Update ticket status to used and record gate tap
	now := time.Now()
	s.db.Model(ticket).Updates(map[string]interface{}{
		"status":                 "used",
		"used_at":                now,
		"used_by_gate_device_id": req.GateDeviceID,
	})

	s.db.Model(&wristband).Updates(map[string]interface{}{
		"last_tapped_at":    now,
		"last_tap_gate_id":  req.GateDeviceID,
	})

	visitorName := "Pengunjung"
	if ticket.VisitorName != nil && *ticket.VisitorName != "" {
		visitorName = *ticket.VisitorName
	}
	categoryName := "Reguler"
	if ticket.Category != nil {
		categoryName = ticket.Category.Name
	}

	return &TapGateResponse{
		Valid:       true,
		VisitorName: visitorName,
		TicketCode:  ticket.TicketCode,
		Category:    categoryName,
		Message:     "Tap Masuk Berhasil! Selamat berwisata.",
	}, nil
}

// TapPay processes cashless payment by tapping NFC wristband at vendor booth
func (s *nfcService) TapPay(req TapPayRequest) (*TapPayResponse, error) {
	if req.Amount <= 0 {
		return nil, errors.New("jumlah pembayaran harus lebih dari 0")
	}

	var wristband models.NFCWristband
	if err := s.db.Preload("Wallet").First(&wristband, "wristband_uid = ? AND status = 'active'", req.WristbandUID).Error; err != nil {
		return nil, errors.New("gelang NFC tidak ditemukan atau tidak aktif")
	}

	if wristband.Wallet == nil {
		return nil, errors.New("gelang NFC belum memiliki saldo dompet digital")
	}

	var booth models.VendorBooth
	if err := s.db.First(&booth, "id = ?", req.BoothID).Error; err != nil {
		return nil, errors.New("booth merchant tidak ditemukan")
	}

	wallet := wristband.Wallet
	if wallet.Balance < req.Amount {
		return &TapPayResponse{
			Success:       false,
			BoothName:     booth.Name,
			AmountPaid:    req.Amount,
			BalanceBefore: wallet.Balance,
			BalanceAfter:  wallet.Balance,
			Message:       fmt.Sprintf("Saldo tidak mencukupi (Sisa: Rp %.0f)", wallet.Balance),
		}, nil
	}

	var balanceBefore, balanceAfter float64
	qty := req.Quantity
	if qty <= 0 {
		qty = 1
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		balanceBefore = wallet.Balance
		balanceAfter = balanceBefore - req.Amount

		// Deduct wallet
		if err := tx.Model(wallet).Update("balance", balanceAfter).Error; err != nil {
			return err
		}

		// Create wallet tx
		boothIDStr := booth.ID.String()
		desc := fmt.Sprintf("Tap Bayar NFC di %s", booth.Name)
		walletTx := &models.WalletTransaction{
			ID:            uuid.New(),
			WalletID:      wallet.ID,
			TenantID:      &booth.TenantID,
			TxType:        "payment",
			Amount:        req.Amount,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			ReferenceID:   &boothIDStr,
			Description:   &desc,
			CreatedAt:     time.Now(),
		}
		if err := tx.Create(walletTx).Error; err != nil {
			return err
		}

		// Create vendor sale record
		nfcRef := fmt.Sprintf("NFC-TAP:%s", req.WristbandUID)
		sale := &models.VendorSale{
			ID:          uuid.New(),
			TenantID:    booth.TenantID,
			BoothID:     booth.ID,
			WalletID:    wallet.ID,
			ProductID:   req.ProductID,
			Quantity:    qty,
			TotalAmount: req.Amount,
			QRScanRef:   &nfcRef,
			CreatedAt:   time.Now(),
		}
		return tx.Create(sale).Error
	})

	if err != nil {
		return nil, fmt.Errorf("transaksi gagal: %w", err)
	}

	return &TapPayResponse{
		Success:       true,
		BoothName:     booth.Name,
		AmountPaid:    req.Amount,
		BalanceBefore: balanceBefore,
		BalanceAfter:  balanceAfter,
		Message:       "Pembayaran Tap NFC Berhasil!",
	}, nil
}

// GetWristbandInfo returns details of a wristband UID
func (s *nfcService) GetWristbandInfo(wristbandUID string) (*WristbandInfoResponse, error) {
	var wristband models.NFCWristband
	if err := s.db.Preload("Ticket").Preload("Ticket.Category").Preload("Wallet").First(&wristband, "wristband_uid = ?", wristbandUID).Error; err != nil {
		return nil, errors.New("wristband not found")
	}

	visitorName := "Tidak Diketahui"
	ticketCode := "-"
	var balance float64

	if wristband.Ticket != nil {
		ticketCode = wristband.Ticket.TicketCode
		if wristband.Ticket.VisitorName != nil {
			visitorName = *wristband.Ticket.VisitorName
		}
	}
	if wristband.Wallet != nil {
		balance = wristband.Wallet.Balance
	}

	return &WristbandInfoResponse{
		WristbandUID:  wristband.WristbandUID,
		Status:        wristband.Status,
		VisitorName:   visitorName,
		TicketCode:    ticketCode,
		WalletBalance: balance,
		AssignedAt:    wristband.AssignedAt,
		LastTappedAt:  wristband.LastTappedAt,
		Ticket:        wristband.Ticket,
		Wallet:        wristband.Wallet,
	}, nil
}

// UnlinkWristband frees a wristband for reuse upon visitor checkout
func (s *nfcService) UnlinkWristband(wristbandUID string) error {
	return s.db.Model(&models.NFCWristband{}).Where("wristband_uid = ?", wristbandUID).Updates(map[string]interface{}{
		"status": "unlinked",
	}).Error
}

package gate

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	internaltotp "github.com/tiket-wisata-alam/backend/internal/totp"
	"gorm.io/gorm"
)

// DTO Structs

// RegisterDeviceRequest payload for registering a new gate device
type RegisterDeviceRequest struct {
	DestinationID uuid.UUID `json:"destination_id" binding:"required"`
	DeviceName    string    `json:"device_name" binding:"required"`
	DeviceCode    string    `json:"device_code" binding:"required"`
	GateType      string    `json:"gate_type"` // 'entrance', 'exit'
}

// ManifestEntry item in today's ticket manifest for offline cache
type ManifestEntry struct {
	TicketCode   string    `json:"ticket_code"`
	TicketID     uuid.UUID `json:"ticket_id"`
	TOTPSecret   string    `json:"totp_secret"`
	VisitorName  string    `json:"visitor_name"`
	CategoryName string    `json:"category_name"`
	TimeSlot     string    `json:"time_slot"`
	Status       string    `json:"status"`
}

// ManifestResponse container for offline ticket manifest
type ManifestResponse struct {
	DeviceID       uuid.UUID       `json:"device_id"`
	Date           time.Time       `json:"date"`
	TotalTickets   int             `json:"total_tickets"`
	TicketManifest []ManifestEntry `json:"ticket_manifest"`
	HMACKey        string          `json:"hmac_key"`
	GeneratedAt    time.Time       `json:"generated_at"`
}

// OnlineValidateRequest payload for real-time online validation
type OnlineValidateRequest struct {
	DeviceID   uuid.UUID `json:"device_id" binding:"required"`
	TicketCode string    `json:"ticket_code" binding:"required"`
	QRPayload  string    `json:"qr_payload,omitempty"` // full TOTP QR payload e.g. "PASSIFY:TWA-XXXXX:123456"
	ScannedAt  time.Time `json:"scanned_at"`
}

// ValidateResponse result of online ticket validation
type ValidateResponse struct {
	Valid        bool   `json:"valid"`
	ScanResult   string `json:"scan_result"`
	TicketCode   string `json:"ticket_code"`
	VisitorName  string `json:"visitor_name"`
	CategoryName string `json:"category_name"`
	Message      string `json:"message"`
}

// OfflineScanEntry single log item from offline scanner
type OfflineScanEntry struct {
	TicketCode   string    `json:"ticket_code"`
	ScannedAt    time.Time `json:"scanned_at"`
	ScanResult   string    `json:"scan_result"`
	RawQRPayload string    `json:"raw_qr_payload"`
}

// SyncLogsRequest payload for batch syncing offline logs
type SyncLogsRequest struct {
	DeviceID uuid.UUID          `json:"device_id" binding:"required"`
	Logs     []OfflineScanEntry `json:"logs" binding:"required"`
}

// SyncResponse summary of synced offline logs
type SyncResponse struct {
	Received  int      `json:"received"`
	Processed int      `json:"processed"`
	Failed    int      `json:"failed"`
	Errors    []string `json:"errors,omitempty"`
}

// GateScanStat aggregate statistics per gate device
type GateScanStat struct {
	DeviceID   uuid.UUID `json:"device_id"`
	DeviceName string    `json:"device_name"`
	TotalScans int       `json:"total_scans"`
	ValidScans int       `json:"valid_scans"`
}

// ScanStatsResponse overall scan statistics for a destination on a specific date
type ScanStatsResponse struct {
	Date         time.Time      `json:"date"`
	TotalScans   int            `json:"total_scans"`
	ValidScans   int            `json:"valid_scans"`
	InvalidScans int            `json:"invalid_scans"`
	OfflineScans int            `json:"offline_scans"`
	ByGate       []GateScanStat `json:"by_gate"`
}

// GateService interface definition
type GateService interface {
	RegisterDevice(tenantID uuid.UUID, req RegisterDeviceRequest) (*models.GateDevice, error)
	ListDevices(destinationID uuid.UUID) ([]models.GateDevice, error)
	GenerateManifest(deviceID uuid.UUID, date time.Time) (*ManifestResponse, error)
	ValidateTicketOnline(req OnlineValidateRequest) (*ValidateResponse, error)
	SyncOfflineLogs(req SyncLogsRequest) (*SyncResponse, error)
	GetScanStats(destinationID uuid.UUID, date time.Time) (*ScanStatsResponse, error)
}

type gateService struct {
	db   *gorm.DB
	repo GateRepository
}

// NewGateService creates a new instance of GateService
func NewGateService(db *gorm.DB, repo GateRepository) GateService {
	return &gateService{
		db:   db,
		repo: repo,
	}
}

// RegisterDevice registers a new physical gate device and generates an HMAC shared key
func (s *gateService) RegisterDevice(tenantID uuid.UUID, req RegisterDeviceRequest) (*models.GateDevice, error) {
	hmacKey, err := generateHMACKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate HMAC shared key: %w", err)
	}

	gateType := req.GateType
	if gateType == "" {
		gateType = "entrance"
	}

	device := &models.GateDevice{
		BaseModel: models.BaseModel{
			ID: uuid.New(),
		},
		TenantID:      tenantID,
		DestinationID: req.DestinationID,
		DeviceName:    req.DeviceName,
		DeviceCode:    req.DeviceCode,
		GateType:      gateType,
		HMACSharedKey: hmacKey,
		IsActive:      true,
	}

	if err := s.repo.CreateGateDevice(device); err != nil {
		return nil, fmt.Errorf("failed to save gate device: %w", err)
	}

	return device, nil
}

// ListDevices returns all devices for a given destination
func (s *gateService) ListDevices(destinationID uuid.UUID) ([]models.GateDevice, error) {
	return s.repo.ListGateDevices(destinationID)
}

// GenerateManifest generates a ticket manifest for offline gate scanning
func (s *gateService) GenerateManifest(deviceID uuid.UUID, date time.Time) (*ManifestResponse, error) {
	device, err := s.repo.GetGateDeviceByID(deviceID)
	if err != nil {
		return nil, fmt.Errorf("gate device not found: %w", err)
	}
	if !device.IsActive {
		return nil, fmt.Errorf("gate device is inactive")
	}

	tickets, err := s.repo.GetActiveTicketsForDestinationDate(device.DestinationID, date)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch active tickets: %w", err)
	}

	entries := make([]ManifestEntry, 0, len(tickets))
	for _, t := range tickets {
		visitorName := ""
		if t.VisitorName != nil {
			visitorName = *t.VisitorName
		}
		categoryName := ""
		if t.Category != nil {
			categoryName = t.Category.Name
		}
		timeSlotLabel := ""
		if t.TimeSlot != nil {
			timeSlotLabel = t.TimeSlot.SlotLabel
		}

		entries = append(entries, ManifestEntry{
			TicketCode:   t.TicketCode,
			TicketID:     t.ID,
			TOTPSecret:   t.TOTPSecretKey,
			VisitorName:  visitorName,
			CategoryName: categoryName,
			TimeSlot:     timeSlotLabel,
			Status:       t.Status,
		})
	}

	now := time.Now()
	if err := s.repo.UpdateManifestSyncTime(deviceID, now); err != nil {
		// Log error, but proceed returning manifest
		_ = err
	}

	return &ManifestResponse{
		DeviceID:       deviceID,
		Date:           date,
		TotalTickets:   len(entries),
		TicketManifest: entries,
		HMACKey:        device.HMACSharedKey,
		GeneratedAt:    now,
	}, nil
}

// ValidateTicketOnline performs real-time online validation of a scanned ticket
func (s *gateService) ValidateTicketOnline(req OnlineValidateRequest) (*ValidateResponse, error) {
	device, err := s.repo.GetGateDeviceByID(req.DeviceID)
	if err != nil {
		return nil, fmt.Errorf("gate device not found: %w", err)
	}
	if !device.IsActive {
		return nil, fmt.Errorf("gate device is inactive")
	}

	scannedAt := req.ScannedAt
	if scannedAt.IsZero() {
		scannedAt = time.Now()
	}

	// If a full QR payload is provided, validate TOTP first
	ticketCodeToLookup := req.TicketCode
	if req.QRPayload != "" {
		extractedCode, valid, err := internaltotp.ValidateQRPayload(req.QRPayload, "")
		// We need the TOTP secret from the ticket - fetch ticket first for secret
		tempTicket, tErr := s.repo.GetTicketByCode(req.TicketCode)
		if tErr == nil && tempTicket != nil {
			extractedCode, valid, err = internaltotp.ValidateQRPayload(req.QRPayload, tempTicket.TOTPSecretKey)
			if err != nil || !valid {
				now := time.Now()
				ticketCode := req.TicketCode
				log := &models.ScanLog{
					ID:            uuid.New(),
					TenantID:      device.TenantID,
					GateDeviceID:  device.ID,
					TicketID:      &tempTicket.ID,
					TicketCode:    &ticketCode,
					ScannedAt:     scannedAt,
					ScanResult:    "invalid",
					IsOfflineScan: false,
					SyncedAt:      &now,
					RawQRPayload:  &req.QRPayload,
					CreatedAt:     now,
				}
				_ = s.repo.CreateScanLog(log)
				return &ValidateResponse{
					Valid:      false,
					ScanResult: "invalid_totp",
					TicketCode: req.TicketCode,
					Message:    "QR Code tidak valid atau sudah kadaluarsa. Minta pengunjung refresh e-ticket.",
				}, nil
			}
			ticketCodeToLookup = extractedCode
			_ = extractedCode
		}
		_ = valid
		_ = err
	}

	ticket, err := s.repo.GetTicketForValidation(ticketCodeToLookup, scannedAt)
	if err == nil && ticket != nil {
		// Ticket is active and valid for today
		if err := s.repo.UpdateTicketStatus(ticket.ID, "used", &scannedAt, &device.ID); err != nil {
			return nil, fmt.Errorf("failed to update ticket status: %w", err)
		}

		now := time.Now()
		log := &models.ScanLog{
			ID:            uuid.New(),
			TenantID:      device.TenantID,
			GateDeviceID:  device.ID,
			TicketID:      &ticket.ID,
			TicketCode:    &ticket.TicketCode,
			ScannedAt:     scannedAt,
			ScanResult:    "valid",
			IsOfflineScan: false,
			SyncedAt:      &now,
			CreatedAt:     now,
		}
		_ = s.repo.CreateScanLog(log)

		visitorName := ""
		if ticket.VisitorName != nil {
			visitorName = *ticket.VisitorName
		}
		categoryName := ""
		if ticket.Category != nil {
			categoryName = ticket.Category.Name
		}

		return &ValidateResponse{
			Valid:        true,
			ScanResult:   "valid",
			TicketCode:   ticket.TicketCode,
			VisitorName:  visitorName,
			CategoryName: categoryName,
			Message:      "Tiket valid, silakan masuk",
		}, nil
	}

	// Determine why validation failed
	tExist, tErr := s.repo.GetTicketByCode(req.TicketCode)
	scanResult := "invalid"
	msg := "Tiket tidak ditemukan"
	var ticketID *uuid.UUID

	if tErr == nil && tExist != nil {
		ticketID = &tExist.ID
		if tExist.Status == "used" {
			scanResult = "already_used"
			msg = "Tiket sudah pernah digunakan"
		} else if tExist.Status == "cancelled" || tExist.Status == "expired" {
			scanResult = "expired"
			msg = fmt.Sprintf("Tiket tidak aktif (status: %s)", tExist.Status)
		} else if tExist.VisitDate.Format("2006-01-02") != scannedAt.Format("2006-01-02") {
			scanResult = "wrong_date"
			msg = fmt.Sprintf("Tiket tidak berlaku untuk tanggal %s", scannedAt.Format("2006-01-02"))
		}
	}

	now := time.Now()
	ticketCodeStr := req.TicketCode
	log := &models.ScanLog{
		ID:            uuid.New(),
		TenantID:      device.TenantID,
		GateDeviceID:  device.ID,
		TicketID:      ticketID,
		TicketCode:    &ticketCodeStr,
		ScannedAt:     scannedAt,
		ScanResult:    scanResult,
		IsOfflineScan: false,
		SyncedAt:      &now,
		CreatedAt:     now,
	}
	_ = s.repo.CreateScanLog(log)

	return &ValidateResponse{
		Valid:      false,
		ScanResult: scanResult,
		TicketCode: req.TicketCode,
		Message:    msg,
	}, nil
}

// SyncOfflineLogs receives batch scan logs from an offline gate scanner device
func (s *gateService) SyncOfflineLogs(req SyncLogsRequest) (*SyncResponse, error) {
	device, err := s.repo.GetGateDeviceByID(req.DeviceID)
	if err != nil {
		return nil, fmt.Errorf("gate device not found: %w", err)
	}

	now := time.Now()
	scanLogs := make([]models.ScanLog, 0, len(req.Logs))
	var errorsList []string
	processed := 0
	failed := 0

	for _, entry := range req.Logs {
		ticketCode := entry.TicketCode
		rawQR := entry.RawQRPayload
		scanResult := entry.ScanResult
		if scanResult == "" {
			scanResult = "valid"
		}

		scannedAt := entry.ScannedAt
		if scannedAt.IsZero() {
			scannedAt = now
		}

		var ticketID *uuid.UUID
		if ticketCode != "" {
			ticket, tErr := s.repo.GetTicketByCode(ticketCode)
			if tErr == nil && ticket != nil {
				ticketID = &ticket.ID
				if scanResult == "valid" && ticket.Status == "active" {
					if err := s.repo.UpdateTicketStatus(ticket.ID, "used", &scannedAt, &device.ID); err != nil {
						errorsList = append(errorsList, fmt.Sprintf("failed to update ticket status %s: %v", ticketCode, err))
						failed++
						continue
					}
				}
			}
		}

		log := models.ScanLog{
			ID:            uuid.New(),
			TenantID:      device.TenantID,
			GateDeviceID:  device.ID,
			TicketID:      ticketID,
			TicketCode:    &ticketCode,
			ScannedAt:     scannedAt,
			ScanResult:    scanResult,
			IsOfflineScan: true,
			SyncedAt:      &now,
			RawQRPayload:  &rawQR,
			CreatedAt:     now,
		}
		scanLogs = append(scanLogs, log)
		processed++
	}

	if len(scanLogs) > 0 {
		if err := s.repo.CreateScanLogs(scanLogs); err != nil {
			return nil, fmt.Errorf("failed to insert batch scan logs: %w", err)
		}
	}

	_ = s.repo.UpdateLogSyncTime(device.ID, now)

	return &SyncResponse{
		Received:  len(req.Logs),
		Processed: processed,
		Failed:    failed,
		Errors:    errorsList,
	}, nil
}

// GetScanStats calculates scan statistics for a destination on a specific date
func (s *gateService) GetScanStats(destinationID uuid.UUID, date time.Time) (*ScanStatsResponse, error) {
	devices, err := s.repo.ListGateDevices(destinationID)
	if err != nil {
		return nil, fmt.Errorf("failed to list gate devices: %w", err)
	}

	logs, err := s.repo.GetScanLogsForDestinationDate(destinationID, date)
	if err != nil {
		return nil, fmt.Errorf("failed to get scan logs: %w", err)
	}

	totalScans := len(logs)
	validScans := 0
	invalidScans := 0
	offlineScans := 0

	gateStatsMap := make(map[uuid.UUID]*GateScanStat)
	for _, dev := range devices {
		gateStatsMap[dev.ID] = &GateScanStat{
			DeviceID:   dev.ID,
			DeviceName: dev.DeviceName,
			TotalScans: 0,
			ValidScans: 0,
		}
	}

	for _, l := range logs {
		if l.ScanResult == "valid" {
			validScans++
		} else {
			invalidScans++
		}
		if l.IsOfflineScan {
			offlineScans++
		}

		if stat, ok := gateStatsMap[l.GateDeviceID]; ok {
			stat.TotalScans++
			if l.ScanResult == "valid" {
				stat.ValidScans++
			}
		}
	}

	byGate := make([]GateScanStat, 0, len(devices))
	for _, dev := range devices {
		if stat, ok := gateStatsMap[dev.ID]; ok {
			byGate = append(byGate, *stat)
		}
	}

	return &ScanStatsResponse{
		Date:         date,
		TotalScans:   totalScans,
		ValidScans:   validScans,
		InvalidScans: invalidScans,
		OfflineScans: offlineScans,
		ByGate:       byGate,
	}, nil
}

// Helper to generate 32 random bytes hex encoded (64 hex characters)
func generateHMACKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

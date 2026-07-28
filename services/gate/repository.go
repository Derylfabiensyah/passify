package gate

import (
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// GateRepository defines interface for gate access control database operations
type GateRepository interface {
	CreateGateDevice(device *models.GateDevice) error
	GetGateDeviceByID(id uuid.UUID) (*models.GateDevice, error)
	GetGateDeviceByCode(code string) (*models.GateDevice, error)
	ListGateDevices(destinationID uuid.UUID) ([]models.GateDevice, error)
	UpdateGateDevice(device *models.GateDevice) error
	UpdateManifestSyncTime(deviceID uuid.UUID, syncTime time.Time) error
	UpdateLogSyncTime(deviceID uuid.UUID, syncTime time.Time) error
	CreateScanLog(log *models.ScanLog) error
	CreateScanLogs(logs []models.ScanLog) error
	ListScanLogs(gateDeviceID uuid.UUID, date time.Time, page, perPage int) ([]models.ScanLog, int64, error)
	GetUnsyncedScanLogs(gateDeviceID uuid.UUID) ([]models.ScanLog, error)
	MarkScanLogsSynced(ids []uuid.UUID, syncedAt time.Time) error
	GetTicketForValidation(ticketCode string, visitDate time.Time) (*models.Ticket, error)
	GetActiveTicketsForDestinationDate(destinationID uuid.UUID, visitDate time.Time) ([]models.Ticket, error)
	GetTicketByCode(ticketCode string) (*models.Ticket, error)
	UpdateTicketStatus(ticketID uuid.UUID, status string, usedAt *time.Time, gateDeviceID *uuid.UUID) error
	GetScanLogsForDestinationDate(destinationID uuid.UUID, date time.Time) ([]models.ScanLog, error)
}

type gateRepository struct {
	db *gorm.DB
}

// NewGateRepository creates a new instance of GateRepository
func NewGateRepository(db *gorm.DB) GateRepository {
	return &gateRepository{db: db}
}

func (r *gateRepository) CreateGateDevice(device *models.GateDevice) error {
	return r.db.Create(device).Error
}

func (r *gateRepository) GetGateDeviceByID(id uuid.UUID) (*models.GateDevice, error) {
	var device models.GateDevice
	err := r.db.Preload("Destination").First(&device, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &device, nil
}

func (r *gateRepository) GetGateDeviceByCode(code string) (*models.GateDevice, error) {
	var device models.GateDevice
	err := r.db.Preload("Destination").First(&device, "device_code = ?", code).Error
	if err != nil {
		return nil, err
	}
	return &device, nil
}

func (r *gateRepository) ListGateDevices(destinationID uuid.UUID) ([]models.GateDevice, error) {
	var devices []models.GateDevice
	err := r.db.Where("destination_id = ?", destinationID).Order("created_at DESC").Find(&devices).Error
	return devices, err
}

func (r *gateRepository) UpdateGateDevice(device *models.GateDevice) error {
	return r.db.Save(device).Error
}

func (r *gateRepository) UpdateManifestSyncTime(deviceID uuid.UUID, syncTime time.Time) error {
	return r.db.Model(&models.GateDevice{}).
		Where("id = ?", deviceID).
		Update("last_manifest_sync_at", syncTime).Error
}

func (r *gateRepository) UpdateLogSyncTime(deviceID uuid.UUID, syncTime time.Time) error {
	return r.db.Model(&models.GateDevice{}).
		Where("id = ?", deviceID).
		Update("last_log_sync_at", syncTime).Error
}

func (r *gateRepository) CreateScanLog(log *models.ScanLog) error {
	return r.db.Create(log).Error
}

func (r *gateRepository) CreateScanLogs(logs []models.ScanLog) error {
	if len(logs) == 0 {
		return nil
	}
	return r.db.Create(&logs).Error
}

func (r *gateRepository) ListScanLogs(gateDeviceID uuid.UUID, date time.Time, page, perPage int) ([]models.ScanLog, int64, error) {
	var logs []models.ScanLog
	var total int64

	query := r.db.Model(&models.ScanLog{}).Where("gate_device_id = ?", gateDeviceID)
	if !date.IsZero() {
		startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
		endOfDay := startOfDay.Add(24 * time.Hour)
		query = query.Where("scanned_at >= ? AND scanned_at < ?", startOfDay, endOfDay)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page < 1 {
		page = 1
	}
	if perPage < 1 {
		perPage = 10
	}
	offset := (page - 1) * perPage

	err := query.Order("scanned_at DESC").Offset(offset).Limit(perPage).Find(&logs).Error
	if err != nil {
		return nil, 0, err
	}

	return logs, total, nil
}

func (r *gateRepository) GetUnsyncedScanLogs(gateDeviceID uuid.UUID) ([]models.ScanLog, error) {
	var logs []models.ScanLog
	err := r.db.Where("gate_device_id = ? AND synced_at IS NULL", gateDeviceID).
		Order("scanned_at ASC").
		Find(&logs).Error
	return logs, err
}

func (r *gateRepository) MarkScanLogsSynced(ids []uuid.UUID, syncedAt time.Time) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Model(&models.ScanLog{}).
		Where("id IN ?", ids).
		Update("synced_at", syncedAt).Error
}

func (r *gateRepository) GetTicketForValidation(ticketCode string, visitDate time.Time) (*models.Ticket, error) {
	var ticket models.Ticket
	dateStr := visitDate.Format("2006-01-02")
	err := r.db.Preload("Category").
		Preload("Destination").
		Preload("TimeSlot").
		Where("ticket_code = ? AND visit_date = ? AND status = ?", ticketCode, dateStr, "active").
		First(&ticket).Error
	if err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *gateRepository) GetActiveTicketsForDestinationDate(destinationID uuid.UUID, visitDate time.Time) ([]models.Ticket, error) {
	var tickets []models.Ticket
	dateStr := visitDate.Format("2006-01-02")
	err := r.db.Preload("Category").
		Preload("TimeSlot").
		Where("destination_id = ? AND visit_date = ? AND status = ?", destinationID, dateStr, "active").
		Find(&tickets).Error
	return tickets, err
}

func (r *gateRepository) GetTicketByCode(ticketCode string) (*models.Ticket, error) {
	var ticket models.Ticket
	err := r.db.Preload("Category").
		Preload("Destination").
		Preload("TimeSlot").
		Where("ticket_code = ?", ticketCode).
		First(&ticket).Error
	if err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *gateRepository) UpdateTicketStatus(ticketID uuid.UUID, status string, usedAt *time.Time, gateDeviceID *uuid.UUID) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	if usedAt != nil {
		updates["used_at"] = usedAt
	}
	if gateDeviceID != nil {
		updates["used_by_gate_device_id"] = gateDeviceID
	}
	return r.db.Model(&models.Ticket{}).Where("id = ?", ticketID).Updates(updates).Error
}

func (r *gateRepository) GetScanLogsForDestinationDate(destinationID uuid.UUID, date time.Time) ([]models.ScanLog, error) {
	var logs []models.ScanLog
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	err := r.db.Joins("JOIN gate_devices ON scan_logs.gate_device_id = gate_devices.id").
		Where("gate_devices.destination_id = ? AND scan_logs.scanned_at >= ? AND scan_logs.scanned_at < ?", destinationID, startOfDay, endOfDay).
		Find(&logs).Error
	return logs, err
}

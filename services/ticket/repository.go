package ticket

import (
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

type TicketRepository interface {
	CreateTicketCategory(cat *models.TicketCategory) error
	GetTicketCategoryByID(id uuid.UUID) (*models.TicketCategory, error)
	ListTicketCategories(destinationID uuid.UUID) ([]models.TicketCategory, error)
	UpdateTicketCategory(cat *models.TicketCategory) error
	DeleteTicketCategory(id uuid.UUID) error
	GetOrCreateDailyQuota(destinationID, tenantID uuid.UUID, visitDate time.Time, totalQuota int) (*models.DailyQuota, error)
	GetDailyQuota(destinationID uuid.UUID, visitDate time.Time) (*models.DailyQuota, error)
	IncrementBookedQuota(quotaID uuid.UUID, count int) error
	DecrementBookedQuota(quotaID uuid.UUID, count int) error
	ListDailyQuotas(destinationID uuid.UUID, startDate, endDate time.Time) ([]models.DailyQuota, error)
	CreateTimeSlot(slot *models.TimeSlot) error
	ListTimeSlots(destinationID uuid.UUID) ([]models.TimeSlot, error)
	GetOrCreateSlotQuota(dailyQuotaID, timeSlotID, tenantID uuid.UUID) (*models.SlotQuota, error)
	IncrementSlotBookedQuota(slotQuotaID uuid.UUID, count int) error
	CreateTransaction(tx *models.Transaction) error
	GetTransactionByID(id uuid.UUID) (*models.Transaction, error)
	CreateTicket(ticket *models.Ticket) error
	CreateTickets(tickets []models.Ticket) error
	GetTicketByID(id uuid.UUID) (*models.Ticket, error)
	GetTicketByCode(code string) (*models.Ticket, error)
	ListTicketsByTransaction(transactionID uuid.UUID) ([]models.Ticket, error)
	UpdateTicketStatus(id uuid.UUID, status string, usedAt *time.Time, gateDeviceID *uuid.UUID) error
	ListTicketsByVisitDate(destinationID uuid.UUID, visitDate time.Time) ([]models.Ticket, error)
}

type ticketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) TicketRepository {
	return &ticketRepository{db: db}
}

func (r *ticketRepository) CreateTicketCategory(cat *models.TicketCategory) error {
	if cat.TenantID == uuid.Nil {
		var dest models.Destination
		if err := r.db.First(&dest, "id = ?", cat.DestinationID).Error; err == nil {
			cat.TenantID = dest.TenantID
		}
	}
	return r.db.Create(cat).Error
}

func (r *ticketRepository) GetTicketCategoryByID(id uuid.UUID) (*models.TicketCategory, error) {
	var cat models.TicketCategory
	if err := r.db.First(&cat, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *ticketRepository) ListTicketCategories(destinationID uuid.UUID) ([]models.TicketCategory, error) {
	var cats []models.TicketCategory
	if err := r.db.Where("destination_id = ?", destinationID).Find(&cats).Error; err != nil {
		return nil, err
	}
	return cats, nil
}

func (r *ticketRepository) UpdateTicketCategory(cat *models.TicketCategory) error {
	return r.db.Save(cat).Error
}

func (r *ticketRepository) DeleteTicketCategory(id uuid.UUID) error {
	return r.db.Delete(&models.TicketCategory{}, "id = ?", id).Error
}

func (r *ticketRepository) GetOrCreateDailyQuota(destinationID, tenantID uuid.UUID, visitDate time.Time, totalQuota int) (*models.DailyQuota, error) {
	var quota models.DailyQuota
	err := r.db.Where(models.DailyQuota{DestinationID: destinationID, VisitDate: visitDate}).
		Assign(models.DailyQuota{TotalQuota: totalQuota, TenantID: tenantID}).
		FirstOrCreate(&quota).Error
	return &quota, err
}

func (r *ticketRepository) GetDailyQuota(destinationID uuid.UUID, visitDate time.Time) (*models.DailyQuota, error) {
	var quota models.DailyQuota
	if err := r.db.First(&quota, "destination_id = ? AND visit_date = ?", destinationID, visitDate).Error; err != nil {
		return nil, err
	}
	return &quota, nil
}

func (r *ticketRepository) IncrementBookedQuota(quotaID uuid.UUID, count int) error {
	return r.db.Model(&models.DailyQuota{}).Where("id = ?", quotaID).
		UpdateColumn("booked_quota", gorm.Expr("booked_quota + ?", count)).Error
}

func (r *ticketRepository) DecrementBookedQuota(quotaID uuid.UUID, count int) error {
	return r.db.Model(&models.DailyQuota{}).Where("id = ?", quotaID).
		UpdateColumn("booked_quota", gorm.Expr("booked_quota - ?", count)).Error
}

func (r *ticketRepository) ListDailyQuotas(destinationID uuid.UUID, startDate, endDate time.Time) ([]models.DailyQuota, error) {
	var quotas []models.DailyQuota
	if err := r.db.Where("destination_id = ? AND visit_date >= ? AND visit_date <= ?", destinationID, startDate, endDate).Find(&quotas).Error; err != nil {
		return nil, err
	}
	return quotas, nil
}

func (r *ticketRepository) CreateTimeSlot(slot *models.TimeSlot) error {
	return r.db.Create(slot).Error
}

func (r *ticketRepository) ListTimeSlots(destinationID uuid.UUID) ([]models.TimeSlot, error) {
	var slots []models.TimeSlot
	if err := r.db.Where("destination_id = ?", destinationID).Find(&slots).Error; err != nil {
		return nil, err
	}
	return slots, nil
}

func (r *ticketRepository) GetOrCreateSlotQuota(dailyQuotaID, timeSlotID, tenantID uuid.UUID) (*models.SlotQuota, error) {
	var sq models.SlotQuota
	err := r.db.Where(models.SlotQuota{DailyQuotaID: dailyQuotaID, TimeSlotID: timeSlotID}).
		Assign(models.SlotQuota{TenantID: tenantID}).
		FirstOrCreate(&sq).Error
	return &sq, err
}

func (r *ticketRepository) IncrementSlotBookedQuota(slotQuotaID uuid.UUID, count int) error {
	return r.db.Model(&models.SlotQuota{}).Where("id = ?", slotQuotaID).
		UpdateColumn("booked_quota", gorm.Expr("booked_quota + ?", count)).Error
}

func (r *ticketRepository) CreateTransaction(tx *models.Transaction) error {
	return r.db.Create(tx).Error
}

func (r *ticketRepository) GetTransactionByID(id uuid.UUID) (*models.Transaction, error) {
	var tx models.Transaction
	if err := r.db.Preload("User").Preload("Destination").Preload("Tickets").First(&tx, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *ticketRepository) CreateTicket(ticket *models.Ticket) error {
	return r.db.Create(ticket).Error
}

func (r *ticketRepository) CreateTickets(tickets []models.Ticket) error {
	return r.db.CreateInBatches(tickets, 100).Error
}

func (r *ticketRepository) GetTicketByID(id uuid.UUID) (*models.Ticket, error) {
	var ticket models.Ticket
	if err := r.db.First(&ticket, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *ticketRepository) GetTicketByCode(code string) (*models.Ticket, error) {
	var ticket models.Ticket
	if err := r.db.First(&ticket, "ticket_code = ?", code).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *ticketRepository) ListTicketsByTransaction(transactionID uuid.UUID) ([]models.Ticket, error) {
	var tickets []models.Ticket
	if err := r.db.Where("transaction_id = ?", transactionID).Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

func (r *ticketRepository) UpdateTicketStatus(id uuid.UUID, status string, usedAt *time.Time, gateDeviceID *uuid.UUID) error {
	updates := map[string]interface{}{"status": status}
	if usedAt != nil {
		updates["used_at"] = usedAt
	}
	if gateDeviceID != nil {
		updates["gate_device_id"] = gateDeviceID
	}
	return r.db.Model(&models.Ticket{}).Where("id = ?", id).Updates(updates).Error
}

func (r *ticketRepository) ListTicketsByVisitDate(destinationID uuid.UUID, visitDate time.Time) ([]models.Ticket, error) {
	var tickets []models.Ticket
	if err := r.db.Where("destination_id = ? AND visit_date = ?", destinationID, visitDate).Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

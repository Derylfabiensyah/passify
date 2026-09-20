package ticket

import (
	"time"

	"github.com/google/uuid"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

type TicketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) *TicketRepository {
	return &TicketRepository{db: db}
}

func (r *TicketRepository) CreateTicketCategory(cat *models.TicketCategory) error {
	if cat.TenantID == uuid.Nil {
		var dest models.Destination
		if err := r.db.First(&dest, "id = ?", cat.DestinationID).Error; err == nil {
			cat.TenantID = dest.TenantID
		}
	}
	return r.db.Create(cat).Error
}

func (r *TicketRepository) GetTicketCategoryByID(id uuid.UUID) (*models.TicketCategory, error) {
	var cat models.TicketCategory
	if err := r.db.First(&cat, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *TicketRepository) ListTicketCategories(destinationID uuid.UUID) ([]models.TicketCategory, error) {
	var cats []models.TicketCategory
	if err := r.db.Where("destination_id = ?", destinationID).Find(&cats).Error; err != nil {
		return nil, err
	}
	return cats, nil
}

func (r *TicketRepository) UpdateTicketCategory(cat *models.TicketCategory) error {
	return r.db.Save(cat).Error
}

func (r *TicketRepository) DeleteTicketCategory(id uuid.UUID) error {
	return r.db.Delete(&models.TicketCategory{}, "id = ?", id).Error
}

func (r *TicketRepository) GetOrCreateDailyQuota(destinationID, tenantID uuid.UUID, visitDate time.Time, totalQuota int) (*models.DailyQuota, error) {
	var quota models.DailyQuota
	err := r.db.Where(models.DailyQuota{DestinationID: destinationID, VisitDate: visitDate}).
		Assign(models.DailyQuota{TotalQuota: totalQuota, TenantID: tenantID}).
		FirstOrCreate(&quota).Error
	return &quota, err
}

func (r *TicketRepository) GetDailyQuota(destinationID uuid.UUID, visitDate time.Time) (*models.DailyQuota, error) {
	var quota models.DailyQuota
	if err := r.db.First(&quota, "destination_id = ? AND visit_date = ?", destinationID, visitDate).Error; err != nil {
		return nil, err
	}
	return &quota, nil
}

func (r *TicketRepository) IncrementBookedQuota(quotaID uuid.UUID, count int) error {
	return r.db.Model(&models.DailyQuota{}).Where("id = ?", quotaID).
		UpdateColumn("booked_quota", gorm.Expr("booked_quota + ?", count)).Error
}

func (r *TicketRepository) DecrementBookedQuota(quotaID uuid.UUID, count int) error {
	return r.db.Model(&models.DailyQuota{}).Where("id = ?", quotaID).
		UpdateColumn("booked_quota", gorm.Expr("booked_quota - ?", count)).Error
}

func (r *TicketRepository) ListDailyQuotas(destinationID uuid.UUID, startDate, endDate time.Time) ([]models.DailyQuota, error) {
	var quotas []models.DailyQuota
	if err := r.db.Where("destination_id = ? AND visit_date >= ? AND visit_date <= ?", destinationID, startDate, endDate).Find(&quotas).Error; err != nil {
		return nil, err
	}
	return quotas, nil
}

func (r *TicketRepository) CreateTimeSlot(slot *models.TimeSlot) error {
	if slot.TenantID == uuid.Nil {
		var dest models.Destination
		if err := r.db.First(&dest, "id = ?", slot.DestinationID).Error; err == nil {
			slot.TenantID = dest.TenantID
		}
	}
	return r.db.Create(slot).Error
}

func (r *TicketRepository) GetTimeSlotByID(id uuid.UUID) (*models.TimeSlot, error) {
	var slot models.TimeSlot
	if err := r.db.First(&slot, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &slot, nil
}

func (r *TicketRepository) UpdateTimeSlot(slot *models.TimeSlot) error {
	return r.db.Save(slot).Error
}

func (r *TicketRepository) DeleteTimeSlot(id uuid.UUID) error {
	return r.db.Delete(&models.TimeSlot{}, "id = ?", id).Error
}

func (r *TicketRepository) ListTimeSlots(destinationID uuid.UUID) ([]models.TimeSlot, error) {
	var slots []models.TimeSlot
	if err := r.db.Where("destination_id = ?", destinationID).Find(&slots).Error; err != nil {
		return nil, err
	}
	return slots, nil
}

func (r *TicketRepository) GetOrCreateSlotQuota(dailyQuotaID, timeSlotID, tenantID uuid.UUID) (*models.SlotQuota, error) {
	var sq models.SlotQuota
	err := r.db.Where(models.SlotQuota{DailyQuotaID: dailyQuotaID, TimeSlotID: timeSlotID}).
		Assign(models.SlotQuota{TenantID: tenantID}).
		FirstOrCreate(&sq).Error
	return &sq, err
}

func (r *TicketRepository) IncrementSlotBookedQuota(slotQuotaID uuid.UUID, count int) error {
	return r.db.Model(&models.SlotQuota{}).Where("id = ?", slotQuotaID).
		UpdateColumn("booked_quota", gorm.Expr("booked_quota + ?", count)).Error
}

func (r *TicketRepository) CreateTransaction(tx *models.Transaction) error {
	return r.db.Create(tx).Error
}

func (r *TicketRepository) GetTransactionByID(id uuid.UUID) (*models.Transaction, error) {
	var tx models.Transaction
	if err := r.db.Preload("User").Preload("Destination").Preload("Tickets").First(&tx, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &tx, nil
}

func (r *TicketRepository) CreateTicket(ticket *models.Ticket) error {
	return r.db.Create(ticket).Error
}

func (r *TicketRepository) CreateTickets(tickets []models.Ticket) error {
	return r.db.CreateInBatches(tickets, 100).Error
}

func (r *TicketRepository) GetTicketByID(id uuid.UUID) (*models.Ticket, error) {
	var ticket models.Ticket
	if err := r.db.First(&ticket, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *TicketRepository) GetTicketByCode(code string) (*models.Ticket, error) {
	var ticket models.Ticket
	if err := r.db.First(&ticket, "ticket_code = ?", code).Error; err != nil {
		return nil, err
	}
	return &ticket, nil
}

func (r *TicketRepository) ListTicketsByTransaction(transactionID uuid.UUID) ([]models.Ticket, error) {
	var tickets []models.Ticket
	if err := r.db.Where("transaction_id = ?", transactionID).Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

func (r *TicketRepository) UpdateTicketStatus(id uuid.UUID, status string, usedAt *time.Time, gateDeviceID *uuid.UUID) error {
	updates := map[string]interface{}{"status": status}
	if usedAt != nil {
		updates["used_at"] = usedAt
	}
	if gateDeviceID != nil {
		updates["gate_device_id"] = gateDeviceID
	}
	return r.db.Model(&models.Ticket{}).Where("id = ?", id).Updates(updates).Error
}

func (r *TicketRepository) ListTicketsByVisitDate(destinationID uuid.UUID, visitDate time.Time) ([]models.Ticket, error) {
	var tickets []models.Ticket
	if err := r.db.Where("destination_id = ? AND visit_date = ?", destinationID, visitDate).Find(&tickets).Error; err != nil {
		return nil, err
	}
	return tickets, nil
}

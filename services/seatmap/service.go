package seatmap

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/tiket-wisata-alam/backend/internal/models"
	"gorm.io/gorm"
)

// DTOs
type CreateZoneRequest struct {
	DestinationID   uuid.UUID `json:"destination_id" binding:"required"`
	Name            string    `json:"name" binding:"required"`
	CategoryType    string    `json:"category_type"` // 'vip', 'tribune', 'festival'
	PriceMultiplier float64   `json:"price_multiplier"`
	TotalRows       int       `json:"total_rows" binding:"required"`
	SeatsPerRow     int       `json:"seats_per_row" binding:"required"`
	BasePrice       float64   `json:"base_price" binding:"required"`
}

type ReserveSeatsRequest struct {
	ZoneID   uuid.UUID   `json:"zone_id" binding:"required"`
	SeatIDs  []uuid.UUID `json:"seat_ids" binding:"required"`
	Duration int         `json:"duration_minutes"` // Lock duration, defaults to 5 mins
}

type SeatLayoutResponse struct {
	Zone  models.SeatZone `json:"zone"`
	Seats []models.Seat   `json:"seats"`
}

type SeatReservationResponse struct {
	SessionID    string      `json:"session_id"`
	ReservedSeats []models.Seat `json:"reserved_seats"`
	ExpiresAt    time.Time   `json:"expires_at"`
	TotalAmount  float64     `json:"total_amount"`
}

type SeatMapService interface {
	CreateZoneWithSeats(tenantID uuid.UUID, req CreateZoneRequest) (*models.SeatZone, error)
	ListZones(destinationID uuid.UUID) ([]models.SeatZone, error)
	GetZoneLayout(zoneID uuid.UUID) (*SeatLayoutResponse, error)
	ReserveSeats(userID uuid.UUID, req ReserveSeatsRequest) (*SeatReservationResponse, error)
	ReleaseSeats(sessionID string) error
	ConfirmSeatsBooked(seatIDs []uuid.UUID) error
}

type seatMapService struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewSeatMapService(db *gorm.DB, redisClient *redis.Client) SeatMapService {
	return &seatMapService{
		db:    db,
		redis: redisClient,
	}
}

// CreateZoneWithSeats creates a new zone and automatically populates its seat matrix
func (s *seatMapService) CreateZoneWithSeats(tenantID uuid.UUID, req CreateZoneRequest) (*models.SeatZone, error) {
	multiplier := req.PriceMultiplier
	if multiplier <= 0 {
		multiplier = 1.0
	}
	catType := req.CategoryType
	if catType == "" {
		catType = "tribune"
	}

	zone := &models.SeatZone{
		BaseModel: models.BaseModel{
			ID: uuid.New(),
		},
		DestinationID:   req.DestinationID,
		TenantID:        tenantID,
		Name:            req.Name,
		CategoryType:    catType,
		PriceMultiplier: multiplier,
		TotalRows:       req.TotalRows,
		SeatsPerRow:     req.SeatsPerRow,
		IsActive:        true,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(zone).Error; err != nil {
			return err
		}

		// Generate seat grid
		seats := make([]models.Seat, 0, req.TotalRows*req.SeatsPerRow)
		for r := 0; r < req.TotalRows; r++ {
			rowChar := string(rune('A' + r))
			for c := 1; c <= req.SeatsPerRow; c++ {
				seatPrice := req.BasePrice * multiplier
				seat := models.Seat{
					ID:         uuid.New(),
					ZoneID:     zone.ID,
					RowLabel:   rowChar,
					SeatNumber: c,
					SeatCode:   fmt.Sprintf("%s-%s%02d", zone.Name, rowChar, c),
					Status:     "available",
					Price:      seatPrice,
				}
				seats = append(seats, seat)
			}
		}

		if len(seats) > 0 {
			if err := tx.Create(&seats).Error; err != nil {
				return err
			}
		}
		zone.Seats = seats
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create seat zone: %w", err)
	}

	return zone, nil
}

// ListZones lists all seating zones for a destination
func (s *seatMapService) ListZones(destinationID uuid.UUID) ([]models.SeatZone, error) {
	var zones []models.SeatZone
	if err := s.db.Where("destination_id = ? AND is_active = ?", destinationID, true).Find(&zones).Error; err != nil {
		return nil, err
	}
	return zones, nil
}

// GetZoneLayout retrieves all seats for a specific zone
func (s *seatMapService) GetZoneLayout(zoneID uuid.UUID) (*SeatLayoutResponse, error) {
	var zone models.SeatZone
	if err := s.db.First(&zone, "id = ?", zoneID).Error; err != nil {
		return nil, errors.New("zone not found")
	}

	var seats []models.Seat
	if err := s.db.Where("zone_id = ?", zoneID).Order("row_label ASC, seat_number ASC").Find(&seats).Error; err != nil {
		return nil, err
	}

	return &SeatLayoutResponse{
		Zone:  zone,
		Seats: seats,
	}, nil
}

// ReserveSeats locks selected seats temporarily using Redis and DB reservation
func (s *seatMapService) ReserveSeats(userID uuid.UUID, req ReserveSeatsRequest) (*SeatReservationResponse, error) {
	if len(req.SeatIDs) == 0 {
		return nil, errors.New("no seats selected")
	}
	if len(req.SeatIDs) > 8 {
		return nil, errors.New("maximum 8 seats allowed per reservation")
	}

	duration := req.Duration
	if duration <= 0 {
		duration = 5 // default 5 minutes lock
	}
	lockDuration := time.Duration(duration) * time.Minute
	expiresAt := time.Now().Add(lockDuration)
	sessionID := fmt.Sprintf("SEAT-LOCK-%s-%s", userID.String()[:8], uuid.New().String()[:8])

	ctx := context.Background()

	// 1. Acquire Redis distributed lock on each seat
	var lockedKeys []string
	defer func() {
		// Clean up Redis locks if error occurs before commit
	}()

	for _, seatID := range req.SeatIDs {
		key := fmt.Sprintf("seat_lock:%s", seatID.String())
		ok, err := s.redis.SetNX(ctx, key, sessionID, lockDuration).Result()
		if err != nil || !ok {
			// Rollback previously acquired locks
			for _, k := range lockedKeys {
				s.redis.Del(ctx, k)
			}
			return nil, errors.New("one or more selected seats are currently being booked by another visitor")
		}
		lockedKeys = append(lockedKeys, key)
	}

	// 2. Fetch seats and mark as locked in DB
	var seats []models.Seat
	var totalAmount float64

	err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("id IN ? AND status = 'available'", req.SeatIDs).Find(&seats).Error; err != nil {
			return err
		}

		if len(seats) != len(req.SeatIDs) {
			return errors.New("one or more seats are no longer available")
		}

		// Update status to 'locked'
		if err := tx.Model(&models.Seat{}).Where("id IN ?", req.SeatIDs).Update("status", "locked").Error; err != nil {
			return err
		}

		// Create reservation records
		for _, seat := range seats {
			res := models.SeatReservation{
				ID:         uuid.New(),
				SeatID:     seat.ID,
				UserID:     userID,
				SessionID:  sessionID,
				ExpiresAt:  expiresAt,
				IsReleased: false,
				CreatedAt:  time.Now(),
			}
			if err := tx.Create(&res).Error; err != nil {
				return err
			}
			totalAmount += seat.Price
		}

		return nil
	})

	if err != nil {
		for _, k := range lockedKeys {
			s.redis.Del(ctx, k)
		}
		return nil, err
	}

	return &SeatReservationResponse{
		SessionID:     sessionID,
		ReservedSeats: seats,
		ExpiresAt:     expiresAt,
		TotalAmount:   totalAmount,
	}, nil
}

// ReleaseSeats unlocks previously reserved seats (e.g. user cancelled or timer expired)
func (s *seatMapService) ReleaseSeats(sessionID string) error {
	ctx := context.Background()

	return s.db.Transaction(func(tx *gorm.DB) error {
		var reservations []models.SeatReservation
		if err := tx.Where("session_id = ? AND is_released = false", sessionID).Find(&reservations).Error; err != nil {
			return err
		}

		for _, r := range reservations {
			tx.Model(&models.Seat{}).Where("id = ? AND status = 'locked'", r.SeatID).Update("status", "available")
			s.redis.Del(ctx, fmt.Sprintf("seat_lock:%s", r.SeatID.String()))
		}

		return tx.Model(&models.SeatReservation{}).Where("session_id = ?", sessionID).Update("is_released", true).Error
	})
}

// ConfirmSeatsBooked marks seats permanently as booked after payment completes
func (s *seatMapService) ConfirmSeatsBooked(seatIDs []uuid.UUID) error {
	ctx := context.Background()
	for _, seatID := range seatIDs {
		s.redis.Del(ctx, fmt.Sprintf("seat_lock:%s", seatID.String()))
	}
	return s.db.Model(&models.Seat{}).Where("id IN ?", seatIDs).Update("status", "booked").Error
}

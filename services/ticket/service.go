package ticket

import (
	"context"
	"errors"
	"fmt"
	"math/big"
	"crypto/rand"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/tiket-wisata-alam/backend/internal/config"
	"github.com/tiket-wisata-alam/backend/internal/models"
	internaltotp "github.com/tiket-wisata-alam/backend/internal/totp"
)

// DTOs
type CreateCategoryRequest struct {
	DestinationID  uuid.UUID `json:"destination_id" binding:"required"`
	Name           string    `json:"name" binding:"required"`
	Description    *string   `json:"description,omitempty"`
	TicketType     string    `json:"ticket_type" binding:"required"`
	BasePrice      float64   `json:"base_price" binding:"required"`
	WeekendPrice   *float64  `json:"weekend_price,omitempty"`
	HolidayPrice   *float64  `json:"holiday_price,omitempty"`
	InsuranceFee   float64   `json:"insurance_fee"`
	RetribusiFee   float64   `json:"retribusi_fee"`
	IsMandatory    bool      `json:"is_mandatory"`
	IsPerPerson    bool      `json:"is_per_person"`
	MaxQtyPerOrder int       `json:"max_qty_per_order"`
}

type UpdateCategoryRequest struct {
	Name           *string
	Description    *string
	TicketType     *string
	BasePrice      *float64
	WeekendPrice   *float64
	HolidayPrice   *float64
	InsuranceFee   *float64
	RetribusiFee   *float64
	IsMandatory    *bool
	IsPerPerson    *bool
	MaxQtyPerOrder *int
}

type CreateTimeSlotRequest struct {
	DestinationID uuid.UUID `json:"destination_id" binding:"required"`
	SlotLabel     string    `json:"slot_label" binding:"required"`
	StartTime     string    `json:"start_time" binding:"required"`
	EndTime       string    `json:"end_time" binding:"required"`
	MaxCapacity   int       `json:"max_capacity" binding:"required"`
}

type CheckAvailabilityRequest struct {
	DestinationID uuid.UUID
	VisitDate     time.Time
	TimeSlotID    *uuid.UUID
}

type JoinQueueRequest struct {
	DestinationID uuid.UUID `json:"destination_id" binding:"required"`
	VisitDate     string    `json:"visit_date" binding:"required"` // YYYY-MM-DD
}

type QueueResponse struct {
	Position             int    `json:"position"`
	EstimatedWaitMinutes int    `json:"estimated_wait_minutes"`
	QueueToken           string `json:"queue_token"`
	Status               string `json:"status"` // "waiting" or "ready"
}

type SlotAvailability struct {
	SlotID         uuid.UUID
	SlotLabel      string
	MaxCapacity    int
	BookedQuota    int
	RemainingQuota int
	IsClosed       bool
}

type AvailabilityResponse struct {
	DestinationID  uuid.UUID
	VisitDate      time.Time
	TotalQuota     int
	BookedQuota    int
	RemainingQuota int
	IsClosed       bool
	Slots          []SlotAvailability
}

type BookingItem struct {
	CategoryID uuid.UUID
	Quantity   int
}

type VisitorDetail struct {
	Name        string
	IDType      string
	IDNumber    string
	Nationality string
}

type BookTicketsRequest struct {
	DestinationID  uuid.UUID
	VisitDate      time.Time
	TimeSlotID     *uuid.UUID
	Items          []BookingItem
	VisitorDetails []VisitorDetail
	IdempotencyKey string `json:"idempotency_key"`
	QueueToken     string `json:"queue_token,omitempty"`
}

type BookingResponse struct {
	TransactionID uuid.UUID
	OrderNumber   string
	Tickets       []models.Ticket
	TotalAmount   float64
	PlatformFee   float64
	GrandTotal    float64
}

// LiveQRResponse holds the current TOTP QR payload for an e-ticket
type LiveQRResponse struct {
	TicketCode      string `json:"ticket_code"`
	QRPayload       string `json:"qr_payload"`         // PASSIFY:{code}:{totp}
	SecondsLeft     int    `json:"seconds_until_refresh"` // time until QR changes
	VisitDate       string `json:"visit_date"`
}

type TicketService interface {
	CreateCategory(tenantID uuid.UUID, req CreateCategoryRequest) (*models.TicketCategory, error)
	ListCategories(destinationID uuid.UUID) ([]models.TicketCategory, error)
	UpdateCategory(id uuid.UUID, req UpdateCategoryRequest) (*models.TicketCategory, error)
	DeleteCategory(id uuid.UUID) error
	CreateTimeSlot(tenantID uuid.UUID, req CreateTimeSlotRequest) (*models.TimeSlot, error)
	ListTimeSlots(destinationID uuid.UUID) ([]models.TimeSlot, error)
	CheckAvailability(req CheckAvailabilityRequest) (*AvailabilityResponse, error)
	BookTickets(tenantID, userID uuid.UUID, req BookTicketsRequest) (*BookingResponse, error)
	JoinQueue(userID uuid.UUID, req JoinQueueRequest) (*QueueResponse, error)
	CheckQueueStatus(userID uuid.UUID, destinationID uuid.UUID, visitDate string) (*QueueResponse, error)
	GetTicket(id uuid.UUID) (*models.Ticket, error)
	GetTicketByCode(code string) (*models.Ticket, error)
	GetLiveQRPayload(id uuid.UUID) (*LiveQRResponse, error)
	ListQuotas(destinationID uuid.UUID, startDate, endDate time.Time) ([]models.DailyQuota, error)
	CancelTicket(id uuid.UUID) error
}

type ticketService struct {
	repo  TicketRepository
	redis *redis.Client
	cfg   *config.Config
}

func NewTicketService(repo TicketRepository, redisClient *redis.Client, cfg *config.Config) TicketService {
	return &ticketService{
		repo:  repo,
		redis: redisClient,
		cfg:   cfg,
	}
}

func (s *ticketService) CreateCategory(tenantID uuid.UUID, req CreateCategoryRequest) (*models.TicketCategory, error) {
	cat := &models.TicketCategory{
		DestinationID:  req.DestinationID,
		TenantID:       tenantID,
		Name:           req.Name,
		Description:    req.Description,
		TicketType:     req.TicketType,
		BasePrice:      req.BasePrice,
		WeekendPrice:   req.WeekendPrice,
		HolidayPrice:   req.HolidayPrice,
		InsuranceFee:   req.InsuranceFee,
		RetribusiFee:   req.RetribusiFee,
		IsMandatory:    req.IsMandatory,
		IsPerPerson:    req.IsPerPerson,
		MaxQtyPerOrder: req.MaxQtyPerOrder,
	}
	if err := s.repo.CreateTicketCategory(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *ticketService) ListCategories(destinationID uuid.UUID) ([]models.TicketCategory, error) {
	return s.repo.ListTicketCategories(destinationID)
}

func (s *ticketService) UpdateCategory(id uuid.UUID, req UpdateCategoryRequest) (*models.TicketCategory, error) {
	cat, err := s.repo.GetTicketCategoryByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		cat.Name = *req.Name
	}
	if req.Description != nil {
		cat.Description = req.Description
	}
	if req.TicketType != nil {
		cat.TicketType = *req.TicketType
	}
	if req.BasePrice != nil {
		cat.BasePrice = *req.BasePrice
	}
	if req.WeekendPrice != nil {
		cat.WeekendPrice = req.WeekendPrice
	}
	if req.HolidayPrice != nil {
		cat.HolidayPrice = req.HolidayPrice
	}
	if req.InsuranceFee != nil {
		cat.InsuranceFee = *req.InsuranceFee
	}
	if req.RetribusiFee != nil {
		cat.RetribusiFee = *req.RetribusiFee
	}
	if req.IsMandatory != nil {
		cat.IsMandatory = *req.IsMandatory
	}
	if req.IsPerPerson != nil {
		cat.IsPerPerson = *req.IsPerPerson
	}
	if req.MaxQtyPerOrder != nil {
		cat.MaxQtyPerOrder = *req.MaxQtyPerOrder
	}

	if err := s.repo.UpdateTicketCategory(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *ticketService) DeleteCategory(id uuid.UUID) error {
	return s.repo.DeleteTicketCategory(id)
}

func (s *ticketService) CreateTimeSlot(tenantID uuid.UUID, req CreateTimeSlotRequest) (*models.TimeSlot, error) {
	slot := &models.TimeSlot{
		TenantID:      tenantID,
		DestinationID: req.DestinationID,
		SlotLabel:     req.SlotLabel,
		StartTime:     req.StartTime,
		EndTime:       req.EndTime,
		MaxCapacity:   req.MaxCapacity,
	}
	if err := s.repo.CreateTimeSlot(slot); err != nil {
		return nil, err
	}
	return slot, nil
}

func (s *ticketService) ListTimeSlots(destinationID uuid.UUID) ([]models.TimeSlot, error) {
	return s.repo.ListTimeSlots(destinationID)
}

func (s *ticketService) CheckAvailability(req CheckAvailabilityRequest) (*AvailabilityResponse, error) {
	// Simple implementation
	dq, err := s.repo.GetDailyQuota(req.DestinationID, req.VisitDate)
	if err != nil {
		return nil, err
	}
	
	resp := &AvailabilityResponse{
		DestinationID:  req.DestinationID,
		VisitDate:      req.VisitDate,
		TotalQuota:     dq.TotalQuota,
		BookedQuota:    dq.BookedQuota,
		RemainingQuota: dq.TotalQuota - dq.BookedQuota,
		IsClosed:       dq.IsClosed,
	}
	
	slots, _ := s.repo.ListTimeSlots(req.DestinationID)
	for _, slot := range slots {
		resp.Slots = append(resp.Slots, SlotAvailability{
			SlotID:         slot.ID,
			SlotLabel:      slot.SlotLabel,
			MaxCapacity:    slot.MaxCapacity,
			BookedQuota:    0, // mock
			RemainingQuota: slot.MaxCapacity,
			IsClosed:       false,
		})
	}
	return resp, nil
}

func generateRandomString(n int) string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	ret := make([]byte, n)
	for i := 0; i < n; i++ {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		ret[i] = letters[num.Int64()]
	}
	return string(ret)
}

func (s *ticketService) BookTickets(tenantID, userID uuid.UUID, req BookTicketsRequest) (*BookingResponse, error) {
	ctx := context.Background()

	// 1. Idempotency Check
	if req.IdempotencyKey != "" {
		idemKey := fmt.Sprintf("idempotency:%s", req.IdempotencyKey)
		val, err := s.redis.Get(ctx, idemKey).Result()
		if err == nil && val != "" {
			return nil, errors.New("request already processed or processing")
		}
		// Set processing state
		s.redis.SetNX(ctx, idemKey, "processing", 10*time.Minute)
		// Mark as completed when done
		defer s.redis.Set(ctx, idemKey, "completed", 24*time.Hour)
	}

	// 2. Queue Token Verification
	if req.QueueToken != "" {
		tokenKey := fmt.Sprintf("queue_token:%s", userID.String())
		validToken, err := s.redis.Get(ctx, tokenKey).Result()
		if err != nil || validToken != req.QueueToken {
			return nil, errors.New("invalid or expired queue token")
		}
	}

	lockKey := fmt.Sprintf("quota_lock:%s:%s", req.DestinationID.String(), req.VisitDate.Format("2006-01-02"))
	
	// Redis lock
	ok, err := s.redis.SetNX(ctx, lockKey, "locked", 10*time.Second).Result()
	if err != nil || !ok {
		return nil, errors.New("system busy, please try again")
	}
	defer s.redis.Del(ctx, lockKey)

	// Check availability mock
	dq, err := s.repo.GetOrCreateDailyQuota(req.DestinationID, tenantID, req.VisitDate, 1000)
	if err != nil {
		return nil, err
	}
	
	totalQty := 0
	for _, item := range req.Items {
		totalQty += item.Quantity
	}
	
	if dq.TotalQuota-dq.BookedQuota < totalQty {
		return nil, errors.New("insufficient quota")
	}

	orderNum := fmt.Sprintf("TWA-%s-%s", time.Now().Format("20060102"), generateRandomString(4))
	
	// Dummy platform fee and total
	var totalAmount float64
	platformFee := float64(totalQty) * s.cfg.PlatformFeePerTicket
	
	var tickets []models.Ticket
	for _, item := range req.Items {
		cat, _ := s.repo.GetTicketCategoryByID(item.CategoryID)
		for i := 0; i < item.Quantity; i++ {
			// Use TOTP package for cryptographically secure secret
			secret, secretErr := internaltotp.GenerateSecret()
			if secretErr != nil {
				return nil, fmt.Errorf("failed to generate ticket secret: %w", secretErr)
			}

			ticketCode := fmt.Sprintf("TWA-%s", generateRandomString(5))

			// Pre-generate QR payload for the ticket (changes at runtime via TOTP)
			qrPayload, _ := internaltotp.GenerateQRPayload(ticketCode, secret)

			ticket := models.Ticket{
				TenantID:      tenantID,
				TransactionID: uuid.New(),
				DestinationID: req.DestinationID,
				CategoryID:    item.CategoryID,
				TimeSlotID:    req.TimeSlotID,
				TicketCode:    ticketCode,
				VisitDate:     req.VisitDate,
				UnitPrice:     cat.BasePrice,
				Status:        "active",
				TOTPSecretKey: secret,
				QRPayload:     &qrPayload,
			}
			tickets = append(tickets, ticket)
			if cat != nil {
				totalAmount += cat.BasePrice
			}
		}
	}
	
	if err := s.repo.CreateTickets(tickets); err != nil {
		return nil, err
	}
	
	s.repo.IncrementBookedQuota(dq.ID, totalQty)
	
	return &BookingResponse{
		TransactionID: uuid.New(),
		OrderNumber:   orderNum,
		Tickets:       tickets,
		TotalAmount:   totalAmount,
		PlatformFee:   platformFee,
		GrandTotal:    totalAmount + platformFee,
	}, nil
}

func (s *ticketService) GetTicket(id uuid.UUID) (*models.Ticket, error) {
	return s.repo.GetTicketByID(id)
}

func (s *ticketService) GetTicketByCode(code string) (*models.Ticket, error) {
	return s.repo.GetTicketByCode(code)
}

func (s *ticketService) ListQuotas(destinationID uuid.UUID, startDate, endDate time.Time) ([]models.DailyQuota, error) {
	return s.repo.ListDailyQuotas(destinationID, startDate, endDate)
}

func (s *ticketService) CancelTicket(id uuid.UUID) error {
	return s.repo.UpdateTicketStatus(id, "cancelled", nil, nil)
}

func (s *ticketService) JoinQueue(userID uuid.UUID, req JoinQueueRequest) (*QueueResponse, error) {
	ctx := context.Background()
	queueKey := fmt.Sprintf("queue:%s:%s", req.DestinationID.String(), req.VisitDate)
	
	score := float64(time.Now().UnixNano())
	s.redis.ZAddNX(ctx, queueKey, redis.Z{Score: score, Member: userID.String()})
	
	rank, err := s.redis.ZRank(ctx, queueKey, userID.String()).Result()
	if err != nil {
		return nil, err
	}
	
	position := int(rank) + 1
	status := "waiting"
	token := ""
	
	if position <= 1000 {
		status = "ready"
		token = generateRandomString(16)
		s.redis.Set(ctx, fmt.Sprintf("queue_token:%s", userID.String()), token, 1*time.Hour)
	}
	
	return &QueueResponse{
		Position:             position,
		EstimatedWaitMinutes: position / 50,
		QueueToken:           token,
		Status:               status,
	}, nil
}

func (s *ticketService) CheckQueueStatus(userID uuid.UUID, destinationID uuid.UUID, visitDate string) (*QueueResponse, error) {
	ctx := context.Background()
	queueKey := fmt.Sprintf("queue:%s:%s", destinationID.String(), visitDate)
	
	rank, err := s.redis.ZRank(ctx, queueKey, userID.String()).Result()
	if err != nil {
		return nil, errors.New("not in queue")
	}
	
	position := int(rank) + 1
	status := "waiting"
	token := ""
	
	if position <= 1000 {
		status = "ready"
		tokenKey := fmt.Sprintf("queue_token:%s", userID.String())
		token, err = s.redis.Get(ctx, tokenKey).Result()
		if err != nil || token == "" {
			token = generateRandomString(16)
			s.redis.Set(ctx, tokenKey, token, 1*time.Hour)
		}
	}
	
	return &QueueResponse{
		Position:             position,
		EstimatedWaitMinutes: position / 50,
		QueueToken:           token,
		Status:               status,
	}, nil
}

// GetLiveQRPayload generates a fresh TOTP QR code payload for the given ticket ID.
// The payload changes every 30 seconds and includes the seconds until next refresh.
func (s *ticketService) GetLiveQRPayload(id uuid.UUID) (*LiveQRResponse, error) {
	ticket, err := s.repo.GetTicketByID(id)
	if err != nil || ticket == nil {
		return nil, fmt.Errorf("ticket not found")
	}

	payload, err := internaltotp.GenerateQRPayload(ticket.TicketCode, ticket.TOTPSecretKey)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR payload: %w", err)
	}

	return &LiveQRResponse{
		TicketCode:  ticket.TicketCode,
		QRPayload:   payload,
		SecondsLeft: internaltotp.SecondsUntilRefresh(),
		VisitDate:   ticket.VisitDate.Format("2006-01-02"),
	}, nil
}

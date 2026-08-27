package models

import (
	"time"

	"github.com/google/uuid"
)

// ========================================================================
// Base Model
// ========================================================================

// BaseModel provides common fields for all models
type BaseModel struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// ========================================================================
// Tenant & Organization
// ========================================================================

// Tenant represents a white-label organization (pengelola wisata)
type Tenant struct {
	BaseModel
	Name              string  `json:"name" gorm:"size:255;not null"`
	Slug              string  `json:"slug" gorm:"size:100;uniqueIndex;not null"`
	Subdomain         string  `json:"subdomain" gorm:"size:100;uniqueIndex;not null"`
	CustomDomain      *string `json:"custom_domain,omitempty" gorm:"size:255;uniqueIndex"`
	LogoURL           *string `json:"logo_url,omitempty"`
	FaviconURL        *string `json:"favicon_url,omitempty"`
	PrimaryColor      string  `json:"primary_color" gorm:"size:20;default:'#059669'"`
	SecondaryColor    string  `json:"secondary_color" gorm:"size:20;default:'#047857'"`
	Description       *string `json:"description,omitempty"`
	ContactEmail      *string `json:"contact_email,omitempty" gorm:"size:255"`
	ContactPhone      *string `json:"contact_phone,omitempty" gorm:"size:50"`
	Address           *string `json:"address,omitempty"`
	BankName          *string `json:"bank_name,omitempty" gorm:"size:100"`
	BankAccountNumber *string `json:"bank_account_number,omitempty" gorm:"size:50"`
	BankAccountHolder *string `json:"bank_account_holder,omitempty" gorm:"size:255"`
	IsActive          bool    `json:"is_active" gorm:"default:true"`

	// Relations
	Destinations []Destination `json:"destinations,omitempty" gorm:"foreignKey:TenantID"`
}

func (Tenant) TableName() string { return "tenants" }

// TenantSetting stores key-value configuration for a tenant
type TenantSetting struct {
	BaseModel
	TenantID    uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	SettingKey   string   `json:"setting_key" gorm:"size:100;not null"`
	SettingValue string   `json:"setting_value" gorm:"not null"`
}

func (TenantSetting) TableName() string { return "tenant_settings" }

// ========================================================================
// User & Authentication
// ========================================================================

// UserRole enum values
const (
	RoleSuperAdmin  = "super_admin"
	RoleTenantAdmin = "tenant_admin"
	RoleTenantStaff = "tenant_staff"
	RoleGateOfficer = "gate_officer"
	RoleVendor      = "vendor"
	RoleVisitor     = "visitor"
)

// User represents a platform user
type User struct {
	BaseModel
	TenantID        *uuid.UUID `json:"tenant_id,omitempty" gorm:"type:uuid"`
	Email           string     `json:"email" gorm:"size:255;uniqueIndex;not null"`
	Phone           *string    `json:"phone,omitempty" gorm:"size:50"`
	PasswordHash    string     `json:"-" gorm:"size:255;not null"`
	FullName        string     `json:"full_name" gorm:"size:255;not null"`
	Role            string     `json:"role" gorm:"type:user_role;not null;default:'visitor'"`
	IDCardType      *string    `json:"id_card_type,omitempty" gorm:"size:20"`
	IDCardNumber    *string    `json:"id_card_number,omitempty" gorm:"size:100"`
	Nationality     string     `json:"nationality" gorm:"size:10;default:'WNI'"`
	AvatarURL       *string    `json:"avatar_url,omitempty"`
	IsActive        bool       `json:"is_active" gorm:"default:true"`
	EmailVerifiedAt *time.Time `json:"email_verified_at,omitempty"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`

	// Relations
	Tenant *Tenant `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
}

func (User) TableName() string { return "users" }

// RefreshToken stores JWT refresh tokens
type RefreshToken struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	TokenHash string    `json:"-" gorm:"size:255;not null"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	Revoked   bool      `json:"revoked" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}

func (RefreshToken) TableName() string { return "refresh_tokens" }

// ========================================================================
// Destination (Wisata Alam)
// ========================================================================

// Destination represents a nature tourism site
type Destination struct {
	BaseModel
	TenantID        uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	Name            string     `json:"name" gorm:"size:255;not null"`
	Slug            string     `json:"slug" gorm:"size:255;not null"`
	Description     *string    `json:"description,omitempty"`
	DestinationType string     `json:"destination_type" gorm:"type:destination_type;default:'lainnya'"`
	Address         *string    `json:"address,omitempty"`
	City            *string    `json:"city,omitempty" gorm:"size:100"`
	Province        *string    `json:"province,omitempty" gorm:"size:100"`
	Latitude        *float64   `json:"latitude,omitempty"`
	Longitude       *float64   `json:"longitude,omitempty"`
	MaxDailyCapacity int       `json:"max_daily_capacity" gorm:"not null"`
	OpeningTime     string     `json:"opening_time" gorm:"type:time;default:'06:00:00'"`
	ClosingTime     string     `json:"closing_time" gorm:"type:time;default:'17:00:00'"`
	CoverImageURL   *string    `json:"cover_image_url,omitempty"`
	GalleryURLs     StringArray `json:"gallery_urls,omitempty" gorm:"type:text[]"`
	Facilities      StringArray `json:"facilities,omitempty" gorm:"type:text[]"`
	Rules           *string    `json:"rules,omitempty"`
	IsActive        bool       `json:"is_active" gorm:"default:true"`

	// Relations
	Tenant          *Tenant          `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
	TicketCategories []TicketCategory `json:"ticket_categories,omitempty" gorm:"foreignKey:DestinationID"`
	TimeSlots       []TimeSlot       `json:"time_slots,omitempty" gorm:"foreignKey:DestinationID"`
}

func (Destination) TableName() string { return "destinations" }

// ========================================================================
// Ticket Categories & Pricing
// ========================================================================

// TicketCategory represents a type of ticket with pricing
type TicketCategory struct {
	BaseModel
	DestinationID uuid.UUID `json:"destination_id" gorm:"type:uuid;not null"`
	TenantID      uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	Name          string    `json:"name" gorm:"size:150;not null"`
	Description   *string   `json:"description,omitempty"`
	TicketType    string    `json:"ticket_type" gorm:"type:ticket_type;not null"`
	BasePrice     float64   `json:"base_price" gorm:"type:decimal(12,2);not null;default:0"`
	WeekendPrice  *float64  `json:"weekend_price,omitempty" gorm:"type:decimal(12,2)"`
	HolidayPrice  *float64  `json:"holiday_price,omitempty" gorm:"type:decimal(12,2)"`
	InsuranceFee  float64   `json:"insurance_fee" gorm:"type:decimal(12,2);default:0"`
	RetribusiFee  float64   `json:"retribusi_fee" gorm:"type:decimal(12,2);default:0"`
	IsMandatory   bool      `json:"is_mandatory" gorm:"default:false"`
	IsPerPerson   bool      `json:"is_per_person" gorm:"default:true"`
	MaxQtyPerOrder int      `json:"max_qty_per_order" gorm:"default:10"`
	SortOrder     int       `json:"sort_order" gorm:"default:0"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
}

func (TicketCategory) TableName() string { return "ticket_categories" }

// ========================================================================
// Daily Quotas & Time Slots (Carrying Capacity)
// ========================================================================

// DailyQuota tracks the booking capacity for a destination on a specific date
type DailyQuota struct {
	BaseModel
	DestinationID uuid.UUID `json:"destination_id" gorm:"type:uuid;not null"`
	TenantID      uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	VisitDate     time.Time `json:"visit_date" gorm:"type:date;not null"`
	TotalQuota    int       `json:"total_quota" gorm:"not null"`
	BookedQuota   int       `json:"booked_quota" gorm:"default:0"`
	IsClosed      bool      `json:"is_closed" gorm:"default:false"`
	CloseReason   *string   `json:"close_reason,omitempty"`
}

func (DailyQuota) TableName() string { return "daily_quotas" }

// TimeSlot represents a time session within a destination's operating hours
type TimeSlot struct {
	BaseModel
	DestinationID uuid.UUID `json:"destination_id" gorm:"type:uuid;not null"`
	TenantID      uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	SlotLabel     string    `json:"slot_label" gorm:"size:50;not null"`
	StartTime     string    `json:"start_time" gorm:"type:time;not null"`
	EndTime       string    `json:"end_time" gorm:"type:time;not null"`
	MaxCapacity   int       `json:"max_capacity" gorm:"not null"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
}

func (TimeSlot) TableName() string { return "time_slots" }

// SlotQuota tracks the booking capacity for a specific time slot on a specific date
type SlotQuota struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DailyQuotaID uuid.UUID `json:"daily_quota_id" gorm:"type:uuid;not null"`
	TimeSlotID  uuid.UUID `json:"time_slot_id" gorm:"type:uuid;not null"`
	TenantID    uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	BookedQuota int       `json:"booked_quota" gorm:"default:0"`
	IsClosed    bool      `json:"is_closed" gorm:"default:false"`
}

func (SlotQuota) TableName() string { return "slot_quotas" }

// ========================================================================
// Transactions & Orders
// ========================================================================

// Transaction represents a complete ticket purchase order
type Transaction struct {
	BaseModel
	TenantID         uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	UserID           uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	OrderNumber      string     `json:"order_number" gorm:"size:50;uniqueIndex;not null"`
	VisitDate        time.Time  `json:"visit_date" gorm:"type:date;not null"`
	TimeSlotID       *uuid.UUID `json:"time_slot_id,omitempty" gorm:"type:uuid"`
	DestinationID    uuid.UUID  `json:"destination_id" gorm:"type:uuid;not null"`
	VisitorCount     int        `json:"visitor_count" gorm:"not null;default:1"`
	Subtotal         float64    `json:"subtotal" gorm:"type:decimal(12,2);not null"`
	PlatformFee      float64    `json:"platform_fee" gorm:"type:decimal(12,2);not null;default:2500"`
	TotalPlatformFee float64    `json:"total_platform_fee" gorm:"type:decimal(12,2);not null"`
	GrandTotal       float64    `json:"grand_total" gorm:"type:decimal(12,2);not null"`
	NetPayoutAmount  float64    `json:"net_payout_amount" gorm:"type:decimal(12,2);not null"`
	PaymentStatus    string     `json:"payment_status" gorm:"type:payment_status;default:'pending'"`
	PaymentMethod    *string    `json:"payment_method,omitempty" gorm:"size:50"`
	PaymentGatewayRef *string   `json:"payment_gateway_ref,omitempty" gorm:"size:255"`
	PaymentURL       *string    `json:"payment_url,omitempty"`
	PaidAt           *time.Time `json:"paid_at,omitempty"`
	ExpiredAt        *time.Time `json:"expired_at,omitempty"`
	Notes            *string    `json:"notes,omitempty"`

	// Relations
	User        *User        `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Destination *Destination `json:"destination,omitempty" gorm:"foreignKey:DestinationID"`
	TimeSlot    *TimeSlot    `json:"time_slot,omitempty" gorm:"foreignKey:TimeSlotID"`
	Tickets     []Ticket     `json:"tickets,omitempty" gorm:"foreignKey:TransactionID"`
}

func (Transaction) TableName() string { return "transactions" }

// ========================================================================
// Tickets (Individual E-Tickets)
// ========================================================================

// Ticket represents an individual e-ticket linked to a transaction
type Ticket struct {
	BaseModel
	TenantID           uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	TransactionID      uuid.UUID  `json:"transaction_id" gorm:"type:uuid;not null"`
	CategoryID         uuid.UUID  `json:"category_id" gorm:"type:uuid;not null"`
	DestinationID      uuid.UUID  `json:"destination_id" gorm:"type:uuid;not null"`
	TicketCode         string     `json:"ticket_code" gorm:"size:20;uniqueIndex;not null"`
	VisitDate          time.Time  `json:"visit_date" gorm:"type:date;not null"`
	TimeSlotID         *uuid.UUID `json:"time_slot_id,omitempty" gorm:"type:uuid"`
	VisitorName        *string    `json:"visitor_name,omitempty" gorm:"size:255"`
	VisitorIDType      *string    `json:"visitor_id_type,omitempty" gorm:"size:20"`
	VisitorIDNumber    *string    `json:"visitor_id_number,omitempty" gorm:"size:100"`
	VisitorNationality string     `json:"visitor_nationality" gorm:"size:10;default:'WNI'"`
	UnitPrice          float64    `json:"unit_price" gorm:"type:decimal(12,2);not null"`
	TOTPSecretKey      string     `json:"-" gorm:"size:64;not null"`
	QRPayload          *string    `json:"qr_payload,omitempty"`
	Status             string     `json:"status" gorm:"type:ticket_status;default:'active'"`
	UsedAt             *time.Time `json:"used_at,omitempty"`
	UsedByGateDeviceID *uuid.UUID `json:"used_by_gate_device_id,omitempty" gorm:"type:uuid"`

	// Relations
	Category    *TicketCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Destination *Destination    `json:"destination,omitempty" gorm:"foreignKey:DestinationID"`
	TimeSlot    *TimeSlot       `json:"time_slot,omitempty" gorm:"foreignKey:TimeSlotID"`
}

func (Ticket) TableName() string { return "tickets" }

// ========================================================================
// Payouts (Disbursements)
// ========================================================================

// Payout represents a scheduled disbursement to a tenant
type Payout struct {
	BaseModel
	TenantID          uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	PayoutPeriodStart time.Time  `json:"payout_period_start" gorm:"type:date;not null"`
	PayoutPeriodEnd   time.Time  `json:"payout_period_end" gorm:"type:date;not null"`
	TotalTransactions int        `json:"total_transactions" gorm:"not null"`
	GrossAmount       float64    `json:"gross_amount" gorm:"type:decimal(12,2);not null"`
	TotalPlatformFee  float64    `json:"total_platform_fee" gorm:"type:decimal(12,2);not null"`
	NetPayoutAmount   float64    `json:"net_payout_amount" gorm:"type:decimal(12,2);not null"`
	PayoutStatus      string     `json:"payout_status" gorm:"type:payout_status;default:'pending'"`
	GatewayPayoutRef  *string    `json:"gateway_payout_ref,omitempty" gorm:"size:255"`
	BankName          *string    `json:"bank_name,omitempty" gorm:"size:100"`
	BankAccountNumber *string    `json:"bank_account_number,omitempty" gorm:"size:50"`
	BankAccountHolder *string    `json:"bank_account_holder,omitempty" gorm:"size:255"`
	TransferredAt     *time.Time `json:"transferred_at,omitempty"`
	Notes             *string    `json:"notes,omitempty"`

	// Relations
	Tenant *Tenant      `json:"tenant,omitempty" gorm:"foreignKey:TenantID"`
	Items  []PayoutItem `json:"items,omitempty" gorm:"foreignKey:PayoutID"`
}

func (Payout) TableName() string { return "payouts" }

// PayoutItem links individual transactions to a payout batch
type PayoutItem struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	PayoutID      uuid.UUID `json:"payout_id" gorm:"type:uuid;not null"`
	TransactionID uuid.UUID `json:"transaction_id" gorm:"type:uuid;not null"`
	Amount        float64   `json:"amount" gorm:"type:decimal(12,2);not null"`
}

func (PayoutItem) TableName() string { return "payout_items" }

// ========================================================================
// Cashless QR Wallet
// ========================================================================

// Wallet represents a visitor's digital wallet for cashless venue transactions
type Wallet struct {
	BaseModel
	UserID   uuid.UUID  `json:"user_id" gorm:"type:uuid;uniqueIndex;not null"`
	TenantID *uuid.UUID `json:"tenant_id,omitempty" gorm:"type:uuid"`
	Balance  float64    `json:"balance" gorm:"type:decimal(12,2);default:0"`
	IsActive bool       `json:"is_active" gorm:"default:true"`

	// Relations
	User         *User               `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Transactions []WalletTransaction `json:"transactions,omitempty" gorm:"foreignKey:WalletID"`
}

func (Wallet) TableName() string { return "wallets" }

// WalletTransaction records wallet balance changes (top-up, payment, refund)
type WalletTransaction struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	WalletID      uuid.UUID  `json:"wallet_id" gorm:"type:uuid;not null"`
	TenantID      *uuid.UUID `json:"tenant_id,omitempty" gorm:"type:uuid"`
	TxType        string     `json:"tx_type" gorm:"type:wallet_tx_type;not null"`
	Amount        float64    `json:"amount" gorm:"type:decimal(12,2);not null"`
	BalanceBefore float64    `json:"balance_before" gorm:"type:decimal(12,2);not null"`
	BalanceAfter  float64    `json:"balance_after" gorm:"type:decimal(12,2);not null"`
	ReferenceID   *string    `json:"reference_id,omitempty" gorm:"size:255"`
	Description   *string    `json:"description,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (WalletTransaction) TableName() string { return "wallet_transactions" }

// ========================================================================
// Vendor Booths
// ========================================================================

// VendorBooth represents a vendor booth in a destination (F&B, rental, souvenir, guide)
type VendorBooth struct {
	BaseModel
	TenantID      uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	DestinationID uuid.UUID  `json:"destination_id" gorm:"type:uuid;not null"`
	UserID        *uuid.UUID `json:"user_id,omitempty" gorm:"type:uuid"`
	Name          string     `json:"name" gorm:"size:255;not null"`
	Category      string     `json:"category" gorm:"size:50;not null"`
	Description   *string    `json:"description,omitempty"`
	IsActive      bool       `json:"is_active" gorm:"default:true"`

	// Relations
	Products []VendorProduct `json:"products,omitempty" gorm:"foreignKey:BoothID"`
}

func (VendorBooth) TableName() string { return "vendor_booths" }

// VendorProduct represents a product sold at a vendor booth
type VendorProduct struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BoothID     uuid.UUID `json:"booth_id" gorm:"type:uuid;not null"`
	TenantID    uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	Name        string    `json:"name" gorm:"size:255;not null"`
	Price       float64   `json:"price" gorm:"type:decimal(12,2);not null"`
	ImageURL    *string   `json:"image_url,omitempty"`
	IsAvailable bool      `json:"is_available" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
}

func (VendorProduct) TableName() string { return "vendor_products" }

// VendorSale represents a cashless sale at a vendor booth
type VendorSale struct {
	ID          uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	TenantID    uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	BoothID     uuid.UUID  `json:"booth_id" gorm:"type:uuid;not null"`
	WalletID    uuid.UUID  `json:"wallet_id" gorm:"type:uuid;not null"`
	ProductID   *uuid.UUID `json:"product_id,omitempty" gorm:"type:uuid"`
	Quantity    int        `json:"quantity" gorm:"default:1"`
	TotalAmount float64    `json:"total_amount" gorm:"type:decimal(12,2);not null"`
	QRScanRef   *string    `json:"qr_scan_ref,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (VendorSale) TableName() string { return "vendor_sales" }

// ========================================================================
// Gate Devices & Scan Logs
// ========================================================================

// GateDevice represents a physical gate scanner device
type GateDevice struct {
	BaseModel
	TenantID           uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	DestinationID      uuid.UUID  `json:"destination_id" gorm:"type:uuid;not null"`
	DeviceName         string     `json:"device_name" gorm:"size:100;not null"`
	DeviceCode         string     `json:"device_code" gorm:"size:50;uniqueIndex;not null"`
	GateType           string     `json:"gate_type" gorm:"size:20;default:'entrance'"`
	HMACSharedKey      string     `json:"-" gorm:"size:128;not null"`
	LastManifestSyncAt *time.Time `json:"last_manifest_sync_at,omitempty"`
	LastLogSyncAt      *time.Time `json:"last_log_sync_at,omitempty"`
	IsActive           bool       `json:"is_active" gorm:"default:true"`

	// Relations
	Destination *Destination `json:"destination,omitempty" gorm:"foreignKey:DestinationID"`
}

func (GateDevice) TableName() string { return "gate_devices" }

// ScanLog records each QR code scan at a gate
type ScanLog struct {
	ID           uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	TenantID     uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	GateDeviceID uuid.UUID  `json:"gate_device_id" gorm:"type:uuid;not null"`
	TicketID     *uuid.UUID `json:"ticket_id,omitempty" gorm:"type:uuid"`
	TicketCode   *string    `json:"ticket_code,omitempty" gorm:"size:20"`
	ScannedAt    time.Time  `json:"scanned_at" gorm:"not null"`
	ScanResult   string     `json:"scan_result" gorm:"type:scan_result;not null"`
	IsOfflineScan bool      `json:"is_offline_scan" gorm:"default:false"`
	SyncedAt     *time.Time `json:"synced_at,omitempty"`
	RawQRPayload *string    `json:"raw_qr_payload,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
}

func (ScanLog) TableName() string { return "scan_logs" }

// ========================================================================
// Seat Map & Tiered Seating (Amphitheater / Concert / Event)
// ========================================================================

// SeatZone represents a section/zone in a venue (e.g. VIP Front, Tribune A, Festival Area)
type SeatZone struct {
	BaseModel
	DestinationID uuid.UUID `json:"destination_id" gorm:"type:uuid;not null"`
	TenantID      uuid.UUID `json:"tenant_id" gorm:"type:uuid;not null"`
	Name          string    `json:"name" gorm:"size:100;not null"`
	CategoryType  string    `json:"category_type" gorm:"size:50;default:'tribune'"` // 'vip', 'tribune', 'festival', 'camping'
	PriceMultiplier float64 `json:"price_multiplier" gorm:"type:decimal(5,2);default:1.0"`
	TotalRows     int       `json:"total_rows" gorm:"default:10"`
	SeatsPerRow   int       `json:"seats_per_row" gorm:"default:20"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`

	// Relations
	Seats []Seat `json:"seats,omitempty" gorm:"foreignKey:ZoneID"`
}

func (SeatZone) TableName() string { return "seat_zones" }

// Seat represents an individual numbered seat within a zone
type Seat struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ZoneID    uuid.UUID `json:"zone_id" gorm:"type:uuid;not null"`
	RowLabel  string    `json:"row_label" gorm:"size:10;not null"`
	SeatNumber int      `json:"seat_number" gorm:"not null"`
	SeatCode  string    `json:"seat_code" gorm:"size:50;not null"` // e.g. "VIP-A-12"
	Status    string    `json:"status" gorm:"size:20;default:'available'"` // 'available', 'locked', 'booked', 'maintenance'
	Price     float64   `json:"price" gorm:"type:decimal(12,2);not null;default:0"`
}

func (Seat) TableName() string { return "seats" }

// SeatReservation tracks temporary Redis/DB lock on seats during checkout (e.g. 5-10 minutes lock)
type SeatReservation struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SeatID     uuid.UUID `json:"seat_id" gorm:"type:uuid;not null"`
	UserID     uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	SessionID  string    `json:"session_id" gorm:"size:100;not null"`
	ExpiresAt  time.Time `json:"expires_at" gorm:"not null"`
	IsReleased bool      `json:"is_released" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at"`
}

func (SeatReservation) TableName() string { return "seat_reservations" }

// ========================================================================
// NFC Wristband (RFID Sync & Gate Tap)
// ========================================================================

// NFCWristband links a physical RFID/NFC wristband to a visitor, ticket, and cashless wallet
type NFCWristband struct {
	BaseModel
	TenantID      uuid.UUID  `json:"tenant_id" gorm:"type:uuid;not null"`
	DestinationID uuid.UUID  `json:"destination_id" gorm:"type:uuid;not null"`
	WristbandUID  string     `json:"wristband_uid" gorm:"size:64;uniqueIndex;not null"` // NFC chip hardware UID (e.g. 04:A2:3B:4C)
	UserID        *uuid.UUID `json:"user_id,omitempty" gorm:"type:uuid"`
	TicketID      *uuid.UUID `json:"ticket_id,omitempty" gorm:"type:uuid"`
	WalletID      *uuid.UUID `json:"wallet_id,omitempty" gorm:"type:uuid"`
	Status        string     `json:"status" gorm:"size:20;default:'active'"` // 'active', 'unlinked', 'lost', 'revoked'
	AssignedAt    *time.Time `json:"assigned_at,omitempty"`
	LastTappedAt  *time.Time `json:"last_tapped_at,omitempty"`
	LastTapGateID *uuid.UUID `json:"last_tap_gate_id,omitempty" gorm:"type:uuid"`

	// Relations
	Ticket *Ticket `json:"ticket,omitempty" gorm:"foreignKey:TicketID"`
	Wallet *Wallet `json:"wallet,omitempty" gorm:"foreignKey:WalletID"`
	User   *User   `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (NFCWristband) TableName() string { return "nfc_wristbands" }

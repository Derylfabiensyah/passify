package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	AppEnv string

	// Database
	DB DatabaseConfig

	// Redis
	Redis RedisConfig

	// JWT
	JWT JWTConfig

	// Service Ports
	AuthServicePort    string
	TenantServicePort  string
	TicketServicePort  string
	PaymentServicePort string
	CashlessServicePort string
	GateServicePort    string

	// Payment Gateway
	PaymentGateway      string
	XenditSecretKey     string
	XenditWebhookToken  string
	MidtransServerKey   string
	MidtransClientKey   string
	MidtransIsProduction bool

	// Platform Fee
	PlatformFeePerTicket float64

	// QR / TOTP
	QRTOTPIssuer  string
	QRTOTPPeriod  int
	QRHMACSecret  string

	// CORS
	CORSAllowedOrigins []string
}

// DatabaseConfig holds PostgreSQL configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	Timezone string
}

// RedisConfig holds Redis configuration
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

// JWTConfig holds JWT configuration
type JWTConfig struct {
	Secret            string
	ExpiryHours       int
	RefreshExpiryHours int
}

// DSN returns the PostgreSQL connection string
func (d *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode, d.Timezone,
	)
}

// RedisAddr returns the Redis address string
func (r *RedisConfig) RedisAddr() string {
	return fmt.Sprintf("%s:%s", r.Host, r.Port)
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if exists (ignore error in production)
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv: getEnv("APP_ENV", "development"),

		DB: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "tikwisata"),
			Password: getEnv("DB_PASSWORD", "tikwisata_secret_2024"),
			Name:     getEnv("DB_NAME", "tikwisata_db"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
			Timezone: getEnv("DB_TIMEZONE", "Asia/Jakarta"),
		},

		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},

		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", "change-me-in-production"),
			ExpiryHours:       getEnvInt("JWT_EXPIRY_HOURS", 24),
			RefreshExpiryHours: getEnvInt("JWT_REFRESH_EXPIRY_HOURS", 168),
		},

		AuthServicePort:    getEnv("AUTH_SERVICE_PORT", "8081"),
		TenantServicePort:  getEnv("TENANT_SERVICE_PORT", "8082"),
		TicketServicePort:  getEnv("TICKET_SERVICE_PORT", "8083"),
		PaymentServicePort: getEnv("PAYMENT_SERVICE_PORT", "8084"),
		CashlessServicePort: getEnv("CASHLESS_SERVICE_PORT", "8085"),
		GateServicePort:    getEnv("GATE_SERVICE_PORT", "8086"),

		PaymentGateway:     getEnv("PAYMENT_GATEWAY", "xendit"),
		XenditSecretKey:    getEnv("XENDIT_SECRET_KEY", ""),
		XenditWebhookToken: getEnv("XENDIT_WEBHOOK_TOKEN", ""),
		MidtransServerKey:    getEnv("MIDTRANS_SERVER_KEY", ""),
		MidtransClientKey:    getEnv("MIDTRANS_CLIENT_KEY", ""),
		MidtransIsProduction: getEnvBool("MIDTRANS_IS_PRODUCTION", false),

		PlatformFeePerTicket: getEnvFloat("PLATFORM_FEE_PER_TICKET", 2500),

		QRTOTPIssuer: getEnv("QR_TOTP_ISSUER", "TiketWisataAlam"),
		QRTOTPPeriod: getEnvInt("QR_TOTP_PERIOD", 30),
		QRHMACSecret: getEnv("QR_HMAC_SECRET", "change-me-hmac-secret"),

		CORSAllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"), ","),
	}

	return cfg, nil
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val, ok := os.LookupEnv(key); ok {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return defaultVal
}

func getEnvFloat(key string, defaultVal float64) float64 {
	if val, ok := os.LookupEnv(key); ok {
		if floatVal, err := strconv.ParseFloat(val, 64); err == nil {
			return floatVal
		}
	}
	return defaultVal
}

func getEnvBool(key string, defaultVal bool) bool {
	if val, ok := os.LookupEnv(key); ok {
		if boolVal, err := strconv.ParseBool(val); err == nil {
			return boolVal
		}
	}
	return defaultVal
}

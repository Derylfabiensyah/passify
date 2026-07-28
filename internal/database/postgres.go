package database

import (
	"fmt"
	"log"
	"time"

	"github.com/tiket-wisata-alam/backend/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewPostgresConnection creates a new PostgreSQL database connection using GORM
func NewPostgresConnection(cfg *config.DatabaseConfig, appEnv string) (*gorm.DB, error) {
	logLevel := logger.Info
	if appEnv == "production" {
		logLevel = logger.Warn
	}

	db, err := gorm.Open(postgres.Open(cfg.DSN()), &gorm.Config{
		Logger:                 logger.Default.LogMode(logLevel),
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB from GORM: %w", err)
	}

	// Connection pool settings
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping PostgreSQL: %w", err)
	}

	log.Println("✅ PostgreSQL connected successfully")
	return db, nil
}

// SetTenantContext sets the current tenant ID for Row-Level Security (RLS)
// This must be called at the beginning of each request that needs tenant isolation
func SetTenantContext(db *gorm.DB, tenantID string) *gorm.DB {
	return db.Exec(fmt.Sprintf("SET app.current_tenant_id = '%s'", tenantID))
}

// WithTenantScope returns a GORM session scoped to a specific tenant
// This is used as an alternative to RLS when RLS policies are bypassed (e.g., superadmin)
func WithTenantScope(db *gorm.DB, tenantID string) *gorm.DB {
	return db.Where("tenant_id = ?", tenantID)
}

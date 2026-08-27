package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/tiket-wisata-alam/backend/internal/response"
)

// RateLimitConfig defines per-route rate limiting settings
type RateLimitConfig struct {
	// MaxRequests allowed within the Window
	MaxRequests int
	// Window is the time window for rate limiting
	Window time.Duration
	// KeyFunc extracts the rate limit key from context (defaults to IP + path)
	KeyFunc func(c *gin.Context) string
}

// DefaultIPKeyFunc returns a key based on client IP and URL path
func DefaultIPKeyFunc(c *gin.Context) string {
	ip := c.ClientIP()
	path := c.FullPath()
	return fmt.Sprintf("ratelimit:%s:%s", ip, path)
}

// BookingKeyFunc returns a stricter key for booking endpoints (IP + user if authed)
func BookingKeyFunc(c *gin.Context) string {
	ip := c.ClientIP()
	userID, exists := c.Get("user_id")
	if exists {
		return fmt.Sprintf("ratelimit:book:%s:%v", ip, userID)
	}
	return fmt.Sprintf("ratelimit:book:%s", ip)
}

// RateLimitMiddleware returns a Gin middleware that enforces rate limiting using Redis sliding window.
func RateLimitMiddleware(redisClient *redis.Client, cfg RateLimitConfig) gin.HandlerFunc {
	if cfg.KeyFunc == nil {
		cfg.KeyFunc = DefaultIPKeyFunc
	}
	return func(c *gin.Context) {
		ctx := context.Background()
		key := cfg.KeyFunc(c)

		// Sliding window: increment hit count, set TTL on first hit
		pipe := redisClient.Pipeline()
		incr := pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, cfg.Window)
		_, err := pipe.Exec(ctx)
		if err != nil {
			// On Redis error, allow the request (fail open)
			c.Next()
			return
		}

		count := incr.Val()
		if count > int64(cfg.MaxRequests) {
			retryAfter := int(cfg.Window.Seconds())
			c.Header("Retry-After", fmt.Sprintf("%d", retryAfter))
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", cfg.MaxRequests))
			c.Header("X-RateLimit-Remaining", "0")
			response.Error(c, http.StatusTooManyRequests, "RATE_LIMIT_EXCEEDED", "Terlalu banyak permintaan. Coba lagi sebentar.", nil)
			c.Abort()
			return
		}

		remaining := int64(cfg.MaxRequests) - count
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", cfg.MaxRequests))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Next()
	}
}

// DeviceFingerprintMiddleware checks for a device fingerprint header and blocks
// suspicious requests that appear to be automated bots.
// Fingerprint is expected in the X-Device-Fingerprint header.
// If missing or too short, the request is flagged; if flagged too many times, blocked.
func DeviceFingerprintMiddleware(redisClient *redis.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		fingerprint := c.GetHeader("X-Device-Fingerprint")
		ip := c.ClientIP()

		// If no fingerprint provided, log suspicious activity
		if fingerprint == "" || len(strings.TrimSpace(fingerprint)) < 8 {
			ctx := context.Background()
			suspectKey := fmt.Sprintf("suspect:%s", ip)
			pipe := redisClient.Pipeline()
			incr := pipe.Incr(ctx, suspectKey)
			pipe.Expire(ctx, suspectKey, 1*time.Hour)
			pipe.Exec(ctx)

			// After 10 suspicious requests from same IP, block for 1 hour
			if incr.Val() > 10 {
				response.Error(c, http.StatusForbidden, "ACCESS_BLOCKED", "Akses diblokir sementara karena aktivitas mencurigakan.", nil)
				c.Abort()
				return
			}

			// Allow but tag request as suspicious
			c.Set("suspicious_request", true)
			c.Next()
			return
		}

		// Check if fingerprint is in blocklist
		ctx := context.Background()
		blockKey := fmt.Sprintf("fingerprint:block:%s", fingerprint)
		blocked, _ := redisClient.Get(ctx, blockKey).Result()
		if blocked == "1" {
			response.Error(c, http.StatusForbidden, "DEVICE_BLOCKED", "Perangkat ini diblokir dari pemesanan tiket.", nil)
			c.Abort()
			return
		}

		// Store fingerprint in context for downstream use
		c.Set("device_fingerprint", fingerprint)
		c.Next()
	}
}

// BlockFingerprint manually blocks a device fingerprint for a given duration (admin use)
func BlockFingerprint(redisClient *redis.Client, fingerprint string, duration time.Duration) error {
	ctx := context.Background()
	return redisClient.Set(ctx, fmt.Sprintf("fingerprint:block:%s", fingerprint), "1", duration).Err()
}

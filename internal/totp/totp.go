package totp

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
)

const (
	// TOTPPeriod is the number of seconds each TOTP code is valid for
	TOTPPeriod = 30
	// TOTPDigits is the number of digits in the TOTP code
	TOTPDigits = otp.DigitsSix
	// TOTPAlgorithm is the hash algorithm used for TOTP
	TOTPAlgorithm = otp.AlgorithmSHA1
)

// GenerateSecret generates a new random TOTP secret key (hex encoded, 20 bytes)
func GenerateSecret() (string, error) {
	bytes := make([]byte, 20)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate TOTP secret: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// GenerateTOTPCode generates the current TOTP code for a given hex secret at a given time
func GenerateTOTPCode(hexSecret string, t time.Time) (string, error) {
	// Decode hex to bytes, re-encode as base32 for OTP library
	secretBytes, err := hex.DecodeString(hexSecret)
	if err != nil {
		return "", fmt.Errorf("invalid TOTP secret: %w", err)
	}
	// Use base32 encoding as expected by the otp library
	base32Secret := base32Encode(secretBytes)

	code, err := totp.GenerateCodeCustom(base32Secret, t, totp.ValidateOpts{
		Period:    TOTPPeriod,
		Skew:      1,
		Digits:    TOTPDigits,
		Algorithm: TOTPAlgorithm,
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate TOTP code: %w", err)
	}
	return code, nil
}

// ValidateTOTPCode validates a given TOTP code against a hex secret
// It allows 1 period of skew (30 seconds tolerance) for clock drift
func ValidateTOTPCode(code, hexSecret string, t time.Time) (bool, error) {
	secretBytes, err := hex.DecodeString(hexSecret)
	if err != nil {
		return false, fmt.Errorf("invalid TOTP secret: %w", err)
	}
	base32Secret := base32Encode(secretBytes)

	valid, err := totp.ValidateCustom(code, base32Secret, t, totp.ValidateOpts{
		Period:    TOTPPeriod,
		Skew:      1, // allow 1 period tolerance
		Digits:    TOTPDigits,
		Algorithm: TOTPAlgorithm,
	})
	if err != nil {
		return false, fmt.Errorf("TOTP validation error: %w", err)
	}
	return valid, nil
}

// GenerateQRPayload returns the full content that should be embedded in the QR code.
// Format: "PASSIFY:{ticketCode}:{currentTOTPCode}"
// This changes every 30 seconds, preventing screenshot abuse.
func GenerateQRPayload(ticketCode, hexSecret string) (string, error) {
	code, err := GenerateTOTPCode(hexSecret, time.Now())
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("PASSIFY:%s:%s", ticketCode, code), nil
}

// ValidateQRPayload validates a QR payload string at scan time
// It returns the embedded ticketCode if validation succeeds
func ValidateQRPayload(payload, hexSecret string) (string, bool, error) {
	var ticketCode, totpCode string
	_, err := fmt.Sscanf(payload, "PASSIFY:%s", &ticketCode)
	if err != nil {
		return "", false, fmt.Errorf("invalid QR payload format")
	}

	// Parse: "PASSIFY:{ticketCode}:{totpCode}"
	// Scan the last part manually
	if len(payload) < 10 {
		return "", false, fmt.Errorf("QR payload too short")
	}

	// Find the last colon separator
	lastColon := -1
	for i := len(payload) - 1; i >= 0; i-- {
		if payload[i] == ':' {
			lastColon = i
			break
		}
	}
	if lastColon <= 8 { // "PASSIFY:" is 8 chars
		return "", false, fmt.Errorf("invalid QR payload structure")
	}

	ticketCode = payload[8:lastColon]
	totpCode = payload[lastColon+1:]

	valid, err := ValidateTOTPCode(totpCode, hexSecret, time.Now())
	if err != nil {
		return ticketCode, false, err
	}
	return ticketCode, valid, nil
}

// SecondsUntilRefresh returns the number of seconds until the current TOTP code expires
func SecondsUntilRefresh() int {
	return TOTPPeriod - (int(time.Now().Unix()) % TOTPPeriod)
}

// base32Encode encodes bytes to uppercase base32 without padding
func base32Encode(src []byte) string {
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
	var encoded []byte
	for i := 0; i < len(src); i += 5 {
		chunk := make([]byte, 5)
		copy(chunk, src[i:])
		encoded = append(encoded,
			alphabet[chunk[0]>>3],
			alphabet[(chunk[0]&0x07)<<2|(chunk[1]>>6)],
			alphabet[(chunk[1]&0x3f)>>1],
			alphabet[(chunk[1]&0x01)<<4|(chunk[2]>>4)],
			alphabet[(chunk[2]&0x0f)<<1|(chunk[3]>>7)],
			alphabet[(chunk[3]&0x7f)>>2],
			alphabet[(chunk[3]&0x03)<<3|(chunk[4]>>5)],
			alphabet[chunk[4]&0x1f],
		)
	}
	// Trim to exact length
	exactLen := (len(src)*8 + 4) / 5
	if exactLen > len(encoded) {
		exactLen = len(encoded)
	}
	return string(encoded[:exactLen])
}

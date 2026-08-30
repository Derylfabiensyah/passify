package payment_test

import (
	"crypto/sha512"
	"encoding/hex"
	"strings"
	"testing"

	"github.com/tiket-wisata-alam/backend/services/payment"
)

func TestVerifyMidtransSignature(t *testing.T) {
	orderID := "TWA-20260830-1001"
	statusCode := "200"
	grossAmount := "50000.00"
	serverKey := "SB-Mid-server-TESTKEY123"

	// Compute expected SHA512 signature
	hasher := sha512.New()
	hasher.Write([]byte(orderID + statusCode + grossAmount + serverKey))
	expectedSignature := hex.EncodeToString(hasher.Sum(nil))

	// Test with valid signature
	isValid := payment.VerifyMidtransSignature(orderID, statusCode, grossAmount, serverKey, expectedSignature)
	if !isValid {
		t.Errorf("Expected signature to be valid, but got false")
	}

	// Test with case insensitivity
	isValidUpper := payment.VerifyMidtransSignature(orderID, statusCode, grossAmount, serverKey, strings.ToUpper(expectedSignature))
	if !isValidUpper {
		t.Errorf("Expected uppercase signature to be valid, but got false")
	}

	// Test with invalid signature
	isInvalid := payment.VerifyMidtransSignature(orderID, statusCode, grossAmount, serverKey, "invalid_signature_hash")
	if isInvalid {
		t.Errorf("Expected signature to be invalid, but got true")
	}

	// Test with empty server key (bypass for dev/local)
	isBypass := payment.VerifyMidtransSignature(orderID, statusCode, grossAmount, "", "any_signature")
	if !isBypass {
		t.Errorf("Expected empty server key to return true (bypass mode), but got false")
	}
}

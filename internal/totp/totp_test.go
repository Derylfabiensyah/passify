package totp

import (
	"testing"
	"time"
)

func TestTOTP600Seconds(t *testing.T) {
	secret, err := GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	ticketCode := "TWA-20260828-999"
	payload, err := GenerateQRPayload(ticketCode, secret)
	if err != nil {
		t.Fatalf("failed to generate QR payload: %v", err)
	}

	extractedCode, valid, err := ValidateQRPayload(payload, secret)
	if err != nil {
		t.Fatalf("validation error: %v", err)
	}
	if !valid {
		t.Fatalf("expected payload to be valid, got false")
	}
	if extractedCode != ticketCode {
		t.Fatalf("expected ticket code %s, got %s", ticketCode, extractedCode)
	}

	secs := SecondsUntilRefresh()
	if secs <= 0 || secs > 600 {
		t.Fatalf("expected SecondsUntilRefresh between 1 and 600, got %d", secs)
	}

	// Verify skew tolerance works
	future := time.Now().Add(500 * time.Second)
	code, _ := GenerateTOTPCode(secret, future)
	validInFuture, _ := ValidateTOTPCode(code, secret, future)
	if !validInFuture {
		t.Fatalf("expected future code within window to be valid")
	}
}

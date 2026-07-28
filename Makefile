.PHONY: help dev infra migrate build run-all test clean

# ==============================================================================
# Help
# ==============================================================================
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ==============================================================================
# Infrastructure
# ==============================================================================
infra-up: ## Start PostgreSQL, Redis, RabbitMQ via Docker Compose
	docker compose up -d

infra-down: ## Stop all infrastructure containers
	docker compose down

infra-reset: ## Reset all infrastructure (destroy volumes)
	docker compose down -v

# ==============================================================================
# Build
# ==============================================================================
build: ## Build all services
	go build -o bin/auth-service ./cmd/auth-service
	go build -o bin/tenant-service ./cmd/tenant-service
	go build -o bin/ticket-service ./cmd/ticket-service
	go build -o bin/payment-service ./cmd/payment-service
	go build -o bin/cashless-service ./cmd/cashless-service
	go build -o bin/gate-service ./cmd/gate-service

build-auth: ## Build auth service
	go build -o bin/auth-service ./cmd/auth-service

build-tenant: ## Build tenant service
	go build -o bin/tenant-service ./cmd/tenant-service

build-ticket: ## Build ticket service
	go build -o bin/ticket-service ./cmd/ticket-service

build-payment: ## Build payment service
	go build -o bin/payment-service ./cmd/payment-service

build-cashless: ## Build cashless service
	go build -o bin/cashless-service ./cmd/cashless-service

build-gate: ## Build gate service
	go build -o bin/gate-service ./cmd/gate-service

# ==============================================================================
# Run
# ==============================================================================
run-auth: ## Run auth service
	go run ./cmd/auth-service

run-tenant: ## Run tenant service
	go run ./cmd/tenant-service

run-ticket: ## Run ticket service
	go run ./cmd/ticket-service

run-payment: ## Run payment service
	go run ./cmd/payment-service

run-cashless: ## Run cashless service
	go run ./cmd/cashless-service

run-gate: ## Run gate service
	go run ./cmd/gate-service

# ==============================================================================
# Test
# ==============================================================================
test: ## Run all tests
	go test -v -race ./...

test-cover: ## Run tests with coverage
	go test -v -race -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# ==============================================================================
# Tools
# ==============================================================================
tidy: ## Run go mod tidy
	go mod tidy

lint: ## Run linter
	golangci-lint run ./...

clean: ## Clean build artifacts
	rm -rf bin/ coverage.out coverage.html

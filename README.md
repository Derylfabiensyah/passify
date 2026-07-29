# 🌲 Passify - White-Label Nature Tourism E-Ticketing & Cashless Platform

![Passify Banner](https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80)

**Passify** adalah platform SaaS *white-label* e-ticketing dan ekosistem non-tunai (*cashless venue wallet*) khusus destinasi wisata alam di Indonesia. Dirancang dengan keandalan tinggi, *carrying capacity control* (pembatasan kuota harian & sesi waktu), validasi gerbang *offline-first* dengan enkripsi HMAC Dynamic TOTP, serta pencairan dana otomatis (*automatic payout*) ke rekening pengelola.

---

## 🌟 Fitur Utama Platform

### 1. 🎟️ E-Ticketing & Carrying Capacity Control
- **Kuota Harian & Sesi Jam (Time Slot)**: Mencegah penumpukan wisatawan di area konservasi / destinasi alam.
- **Dynamic TOTP QR Code**: QR Code tiket diperbarui otomatis setiap 30 detik untuk mencegah pemalsuan *screenshot*.
- **Rincian Biaya Transparan**: Tiket masuk, retribusi Pemda, asuransi jiwa, dan biaya platform SaaS Passify.

### 2. 🚧 Offline-First Gate Scanner
- **Validasi Gerbang Kilat (< 0.5 detik)**: Gerbang scanner fisik / HP petugas dapat melakukan validasi tiket tanpa perlu koneksi internet di lokasi pegunungan/hutan.
- **Auto-Sync Logs**: Sinkronisasi otomatis *scan log* ke server pusat begitu koneksi internet terhubung.

### 3. 💳 Passify Cashless Venue Wallet & Vendor POS
- **Dompet Digital Wisatawan**: Isi saldo cepat untuk transaksi belanja di area wisata.
- **Kasir Vendor (POS)**: Pedagang/stand F&B, cenderamata, dan sewa peralatan cukup melakukan scan QR dompet pengunjung.

### 4. 🏦 Automatic Multi-Bank Payout
- Settlement pendapatan tiket kotor (*gross*) minus biaya platform SaaS (*net payout*) otomatis dikirim ke rekening bank pengelola wisata.

---

## 🏗️ Arsitektur Backend Mikroservis (Go & GORM)

```text
passify/
├── cmd/                      # Entry points 6 Mikroservis Go
│   ├── auth-service/         # Port 8081 - Otentikasi User & JWT Token
│   ├── tenant-service/       # Port 8082 - Manajemen Pengelola Wisata (White-label)
│   ├── ticket-service/       # Port 8083 - Kuota, Sesi, & Pemesanan Tiket
│   ├── payment-service/      # Port 8084 - Payment Gateway Integrasi (Xendit/Midtrans)
│   ├── cashless-service/     # Port 8085 - Dompet Non-Tunai & Vendor POS
│   └── gate-service/         # Port 8086 - Validasi Gate & Sinkronisasi Offline
├── internal/                 # Shared Library
│   ├── config/               # Load environment config
│   ├── database/             # PostgreSQL GORM & Redis Clients
│   ├── middleware/           # Auth JWT & Multi-Tenant RLS Scope
│   ├── models/               # Struct Data Model GORM
│   └── response/             # Standard API Response Helper
├── database/migrations/      # DDL SQL Script 20 Tabel & 8 Custom Enum Types
├── docker-compose.yml        # PostgreSQL 16, Redis 7, RabbitMQ 3
└── frontend/                 # Application React + Vite + Custom Glassmorphism CSS
```

---

## 🚀 Panduan Memulai (Quick Start)

### Prasyarat
- **Docker & Docker Compose**
- **Go 1.23+**
- **Node.js 18+**

### 1. Menjalankan Infrastruktur Database
```bash
# Jalankan PostgreSQL, Redis, dan RabbitMQ
docker compose up -d
```

### 2. Menjalankan Backend Mikroservis
```bash
# Copy file environment
cp .env.example .env

# Jalankan salah satu service, contoh: Auth Service
go run ./cmd/auth-service
```

### 3. Menjalankan Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
Akses frontend melalui browser di `http://localhost:5173`.

---

## 📝 Lisensi
Hak Cipta © 2026 Passify Indonesia. Seluruh hak dilindungi undang-undang.

# UML & Architecture Diagrams — Passify (White-label Ticketing Wisata Alam)

Dokumen ini berisi dokumentasi **UML (Unified Modeling Language)** dan alur sistem lengkap untuk proyek **Passify**, sebuah platform SaaS Ticketing Wisata Alam dengan dukungan *Multi-Tenant*, *Carrying Capacity Management*, dan *Offline Dynamic QR Gate Validation*.

---

## 1. Use Case Diagram
Diagram berikut menggambarkan aktor-aktor yang terlibat dalam sistem Passify serta interaksi mereka dengan fitur-fitur utama platform.

```mermaid
flowchart LR
    %% Actors
    Visitor["👤 Wisatawan (Visitor)"]
    GateOfficer["👮 Petugas Gate / Loket"]
    TenantAdmin["🏢 Admin Wisata (Tenant Admin)"]
    SuperAdmin["👑 Super Admin SaaS"]

    %% System Boundary
    subgraph System["Sistem Passify (SaaS Ticketing Wisata Alam)"]
        direction TB
        UC1["1. Lihat Katalog Destinasi & Kuota Harian"]
        UC2["2. Pilih Sesi Waktu (Time Slot) & Kategori Tiket"]
        UC3["3. Checkout & Bayar (VA / QRIS / E-Wallet)"]
        UC4["4. Terima E-Ticket & Dynamic QR Code"]
        UC5["5. Top-up & Transaksi Cashless Wallet di Vendor"]
        
        UC6["6. Scan QR Tiket di Gerbang (Offline/Online)"]
        UC7["7. Validasi Kedatangan & Buka Palang Pintu"]
        UC8["8. Sync Offline Scan Log ke Cloud Server"]
        
        UC9["9. Kelola Destinasi & Kategori Tiket"]
        UC10["10. Atur Batas Kuota Harian (Carrying Capacity)"]
        UC11["11. Pantau Dashboard Analitik & Pencairan Dana (Payouts)"]
        
        UC12["12. Kelola Tenant, Subdomain & Custom Domain"]
        UC13["13. Audit Global Transaction & Settlement"]
    end

    %% Relationships
    Visitor --> UC1
    Visitor --> UC2
    Visitor --> UC3
    Visitor --> UC4
    Visitor --> UC5

    GateOfficer --> UC6
    GateOfficer --> UC7
    GateOfficer --> UC8

    TenantAdmin --> UC9
    TenantAdmin --> UC10
    TenantAdmin --> UC11

    SuperAdmin --> UC12
    SuperAdmin --> UC13
```

> [!NOTE]
> **Aktor Utama:**
> 1. **Wisatawan (`visitor`):** Pengguna akhir yang memesan tiket, membayar secara online, dan menggunakan QR Code di gerbang masuk.
> 2. **Petugas Gate (`gate_officer`):** Mengoperasikan perangkat scanner (loket/turnstile) yang mendukung pemindai QR offline via HMAC.
> 3. **Admin Wisata (`tenant_admin`):** Pengelola tempat wisata yang mengatur kapasitas kuota, harga tiket liburan/weekend, serta memantau laporan pendapatan.
> 4. **Super Admin (`super_admin`):** Pengelola platform SaaS Passify yang mengatur isolasi tenant dan settlement pencairan dana.

---

## 2. Activity Diagram (Pemesanan & Check-in Tiket Wisata)
Diagram aktivitas (*Activity Diagram*) berikut menjelaskan alur logis dari proses pemilihan destinasi, pengecekan kuota konservasi (*carrying capacity*), pembayaran, hingga pemindai tiket di pintu masuk.

```mermaid
flowchart TD
    Start((Mulai)) --> A["Wisatawan Membuka Halaman Destinasi Wisata"]
    A --> B["Pilih Tanggal Kunjungan & Sesi Waktu (Time Slot)"]
    B --> C{"Cek Ketersediaan Kuota (Daily & Slot Quota)"}
    
    C -- "Kuota Habis / Ditutup" --> D["Tampilkan Peringatan Kuota Penuh"]
    D --> B
    
    C -- "Kuota Tersedia" --> E["Pilih Kategori Tiket & Jumlah (Domestik/WNA/Kendaraan)"]
    E --> F["Input Identitas Pengunjung (KTP / Passport / SIM)"]
    F --> G["Proses Checkout & Pilih Metode Pembayaran (VA/QRIS)"]
    G --> H["Sistem Create Transaction (Status: Pending) & Lock Kuota Sementara"]
    H --> I["Wisatawan Melakukan Pembayaran di Payment Gateway"]
    
    I --> J{"Status Pembayaran?"}
    J -- "Expired / Gagal" --> K["Release / Kembalikan Kuota"]
    K --> L(("Selesai (Gagal)"))
    
    J -- "Sukses (Paid)" --> M["Sistem Terbitkan E-Ticket & Key HMAC TOTP"]
    M --> N["Kirim E-Ticket & Dynamic QR ke Email/WhatsApp Wisatawan"]
    
    N --> O["Hari H: Wisatawan Tiba di Gerbang Wisata"]
    O --> P["Petugas / Turnstile Scan Dynamic QR Code"]
    P --> Q{"Validasi QR (HMAC SHA-256 Offline / Online)"}
    
    Q -- "Tidak Valid / Expired / Sudah Dipakai" --> R["Akses Ditolak & Tampilkan Alasan Error"]
    R --> S(("Selesai (Ditolak)"))
    
    Q -- "Valid & Sesuai Sesi" --> T["Pintu Gate Terbuka & Update Status Tiket = 'Used'"]
    T --> U["Catat Log Kedatangan (Scan Log)"]
    U --> V(("Selesai (Masuk Wisata)"))
```

---

## 3. Entity-Relationship Diagram (ERD)
Berdasarkan skema migrasi database resmi (`000001_initial_schema.up.sql`), database Passify menggunakan **PostgreSQL 16** dengan arsitektur **Multi-Tenant (Row-Level Security / RLS)**. Berikut adalah pemetaan 17 tabel entitas beserta relasinya:

```mermaid
erDiagram
    TENANTS ||--o{ TENANT_SETTINGS : "has"
    TENANTS ||--o{ USERS : "owns"
    TENANTS ||--o{ DESTINATIONS : "manages"
    TENANTS ||--o{ PAYOUTS : "receives"

    USERS ||--o{ TRANSACTIONS : "places"
    USERS ||--|| WALLETS : "owns"
    USERS ||--o{ REFRESH_TOKENS : "has"

    DESTINATIONS ||--o{ TICKET_CATEGORIES : "provides"
    DESTINATIONS ||--o{ DAILY_QUOTAS : "schedules"
    DESTINATIONS ||--o{ TIME_SLOTS : "divides"
    DESTINATIONS ||--o{ VENDOR_BOOTHS : "hosts"
    DESTINATIONS ||--o{ GATE_DEVICES : "installed_at"

    DAILY_QUOTAS ||--o{ SLOT_QUOTAS : "contains"
    TIME_SLOTS ||--o{ SLOT_QUOTAS : "allocates"

    TRANSACTIONS ||--o{ TICKETS : "generates"
    TICKET_CATEGORIES ||--o{ TICKETS : "categorized_by"
    TIME_SLOTS ||--o{ TRANSACTIONS : "selected_in"
    DESTINATIONS ||--o{ TRANSACTIONS : "booked_for"

    PAYOUTS ||--o{ PAYOUT_ITEMS : "consists_of"
    TRANSACTIONS ||--o{ PAYOUT_ITEMS : "settled_in"

    WALLETS ||--o{ WALLET_TRANSACTIONS : "logs"
    WALLETS ||--o{ VENDOR_SALES : "pays"

    VENDOR_BOOTHS ||--o{ VENDOR_PRODUCTS : "sells"
    VENDOR_BOOTHS ||--o{ VENDOR_SALES : "records"
    VENDOR_PRODUCTS ||--o{ VENDOR_SALES : "included_in"

    GATE_DEVICES ||--o{ SCAN_LOGS : "records"
    TICKETS ||--o{ SCAN_LOGS : "logged_in"

    TENANTS {
        UUID id PK
        VARCHAR name
        VARCHAR slug
        VARCHAR subdomain
        VARCHAR primary_color
        BOOLEAN is_active
    }

    USERS {
        UUID id PK
        UUID tenant_id FK
        VARCHAR email
        VARCHAR full_name
        USER_ROLE role
        VARCHAR id_card_number
    }

    DESTINATIONS {
        UUID id PK
        UUID tenant_id FK
        VARCHAR name
        DESTINATION_TYPE destination_type
        INT max_daily_capacity
    }

    TICKET_CATEGORIES {
        UUID id PK
        UUID destination_id FK
        VARCHAR name
        TICKET_TYPE ticket_type
        DECIMAL base_price
        DECIMAL weekend_price
    }

    DAILY_QUOTAS {
        UUID id PK
        UUID destination_id FK
        DATE visit_date
        INT total_quota
        INT booked_quota
        BOOLEAN is_closed
    }

    TIME_SLOTS {
        UUID id PK
        UUID destination_id FK
        VARCHAR slot_label
        TIME start_time
        TIME end_time
        INT max_capacity
    }

    TRANSACTIONS {
        UUID id PK
        UUID user_id FK
        VARCHAR order_number
        DATE visit_date
        DECIMAL grand_total
        PAYMENT_STATUS payment_status
    }

    TICKETS {
        UUID id PK
        UUID transaction_id FK
        VARCHAR ticket_code
        VARCHAR totp_secret_key
        TICKET_STATUS status
        TIMESTAMP used_at
    }

    GATE_DEVICES {
        UUID id PK
        UUID destination_id FK
        VARCHAR device_name
        VARCHAR hmac_shared_key
        TIMESTAMP last_manifest_sync_at
    }

    SCAN_LOGS {
        UUID id PK
        UUID gate_device_id FK
        UUID ticket_id FK
        TIMESTAMP scanned_at
        SCAN_RESULT scan_result
        BOOLEAN is_offline_scan
    }
```

> [!IMPORTANT]
> **Keamanan Multi-Tenant (RLS):**
> Setiap tabel operasional memiliki kolom `tenant_id` dan dilindungi oleh kebijakan PostgreSQL Row-Level Security (`current_setting('app.current_tenant_id')`), menjamin data antar pengelola wisata tidak dapat saling bocor.

---

## 4. Sequence Diagram
Berikut adalah dua *Sequence Diagram* utama yang menunjukkan komunikasi antar mikroservis (Golang/Gin, PostgreSQL, Redis, RabbitMQ, dan Hardware Gate):

### A. Sequence Pembelian & Penerbitan Tiket (Online Booking)
```mermaid
sequenceDiagram
    autonumber
    actor W as 👤 Wisatawan
    participant FE as 🖥️ Frontend (React)
    participant TS as 🎟️ Ticket Service
    participant DB as 🗄️ PostgreSQL / Redis
    participant PS as 💳 Payment Service
    participant PG as 🌐 Xendit / Midtrans
    participant MQ as 🐇 RabbitMQ Event Bus

    W->>FE: Pilih Destinasi, Tanggal, & Sesi Kunjungan
    FE->>TS: GET /api/v1/destinations/{id}/quotas?date=YYYY-MM-DD
    TS->>DB: Check Available Quota (Redis / DB Daily Quota)
    DB-->>TS: Quota Available (e.g., 150 slots left)
    TS-->>FE: Return Ketersediaan Kuota

    W->>FE: Input Identitas & Klik Checkout
    FE->>TS: POST /api/v1/bookings (Create Reservation)
    TS->>DB: Atomic Decrement Quota & Create Pending Transaction
    TS->>PS: Request Payment Gateway Link
    PS->>PG: Create Invoice / QRIS / VA
    PG-->>PS: Return Payment URL & Ref ID
    PS-->>TS: Return Transaction Detail
    TS-->>FE: Tampilkan Halaman Pembayaran (VA / QRIS)

    W->>PG: Bayar via Bank / E-Wallet
    PG->>PS: Webhook Callback (Payment SUCCESS)
    PS->>DB: Update Transaction Status = PAID
    PS->>MQ: Publish Event: "payment.completed"
    MQ->>TS: Consume "payment.completed"
    TS->>DB: Generate E-Ticket + HMAC TOTP Secret Key
    TS-->>W: Kirim Email & WhatsApp E-Ticket + Dynamic QR
```

### B. Sequence Offline Gate Validation (Tanpa Internet di Area Gunung / Hutan)
```mermaid
sequenceDiagram
    autonumber
    actor W as 👤 Wisatawan (HP)
    participant GS as 📟 Gate Scanner Device (Offline)
    participant DB_LOCAL as 💾 SQLite / Local Storage Gate
    participant CLOUD as ☁️ Gate Microservice (Cloud)
    participant MQ as 🐇 RabbitMQ Event Bus

    Note over GS,CLOUD: [H-1 Malam] Sinkronisasi Daftar Key HMAC & Kuota ke Perangkat Gerbang
    GS->>CLOUD: GET /api/v1/gate/manifest (Sync Daily Active Tickets)
    CLOUD-->>GS: Return Encrypted Manifest (HMAC Secret Keys for Today)
    GS->>DB_LOCAL: Simpan Manifest di Local Storage

    Note over W,GS: [Hari H di Gerbang Wisata - Posisi Tanpa Sinyal Internet]
    W->>GS: Scan Dynamic QR Code di Scanner Turnstile
    GS->>GS: Hitung HMAC-SHA256 (TicketCode + TOTP Timestamp + Local Secret)
    
    alt HMAC Cocok & Belum Dipakai di DB Local
        GS->>DB_LOCAL: Mark Ticket as "USED" & Simpan Offline Scan Log
        GS-->>W: 🟢 Relay Pintu Terbuka (Welcome!)
    else HMAC Tidak Cocok / Expired / Sudah Dipakai
        GS-->>W: 🔴 Buzzer Error / Akses Ditolak
    end

    Note over GS,CLOUD: [Setelah Koneksi Internet Pulih]
    GS->>CLOUD: POST /api/v1/gate/sync-logs (Batch Upload Scan Logs)
    CLOUD->>MQ: Publish "ticket.scanned.offline"
    CLOUD-->>GS: ACK (Sync Completed)
```

---

## 5. User Flow Diagram (End-to-End User Journey)
Diagram alur pengguna (*User Flow*) ini menunjukkan seluruh perjalanan pengguna dari awal mengeksplorasi destinasi alam hingga selesai menikmati fasilitas di dalam area wisata.

```mermaid
flowchart TD
    %% Tahap 1: Discovery
    subgraph S1 ["1️⃣ Discovery & Eksplorasi"]
        direction TB
        F1("Buka Landing Page / Web Rimba") --> F2["Filter Destinasi (Gunung/Pantai/Air Terjun)"]
        F2 --> F3["Lihat Detail Destinasi, Jam Buka, & Fasilitas"]
    end

    %% Tahap 2: Booking & Capacity Check
    subgraph S2 ["2️⃣ Pemesanan & Kuota Konservasi"]
        direction TB
        F3 --> F4["Pilih Tanggal Kunjungan"]
        F4 --> F5["Pilih Sesi (Pagi 06:00-11:00 / Siang 12:00-17:00)"]
        F5 --> F6{"Cek Kuota Harian?"}
        F6 -- "Penuh" --> F7["Pilih Tanggal / Sesi Lain"]
        F7 --> F4
        F6 -- "Tersedia" --> F8["Pilih Kategori (WNI/WNA/Kendaraan) & Isi KTP"]
    end

    %% Tahap 3: Checkout & Pembayaran
    subgraph S3 ["3️⃣ Pembayaran & Tiket Elektronik"]
        direction TB
        F8 --> F9["Review Pesanan & Klik Checkout"]
        F9 --> F10["Bayar via QRIS / Virtual Account BCA/Mandiri"]
        F10 --> F11{"Konfirmasi Gateway?"}
        F11 -- "Gagal/Expired" --> F12["Pesanan Dibatalkan"]
        F11 -- "Sukses" --> F13["E-Ticket & Dynamic QR Code Diterbitkan"]
    end

    %% Tahap 4: Kedatangan & Check-in
    subgraph S4 ["4️⃣ Check-in Gerbang Wisata (Gate)"]
        direction TB
        F13 --> F14["Hari H: Tunjukkan QR Code ke Turnstile Gate"]
        F14 --> F15{"Scan QR HMAC Offline?"}
        F15 -- "Invalid / Sudah Scan" --> F16["Akses Ditolak"]
        F15 -- "Valid" --> F17["Palang Pintu Terbuka (Welcome)"]
    end

    %% Tahap 5: Aktivitas & Cashless di Area
    subgraph S5 ["5️⃣ Aktivitas & Cashless Wallet"]
        direction TB
        F17 --> F18["Top-up Saldo Cashless Wallet (Opsional)"]
        F18 --> F19["Jajan di Vendor F&B / Sewa Alat via QR Wallet"]
        F19 --> F20(("Selesai Kunjungan Wisata Alam 🌲"))
    end
```

---

## 6. Ringkasan Fitur yang Pemetaannya Ada dalam UML
1. **White-label Multi-Tenant:** Terlihat di ERD melalui isolasi `tenant_id` pada seluruh tabel dengan kebijakan *Row-Level Security (RLS)*.
2. **Carrying Capacity / Quota:** Terkontrol pada tabel `daily_quotas` & `time_slots`, dilindungi dari *overbooking* saat Activity & Sequence Booking.
3. **Dynamic QR & Offline Gate:** Tergambarkan pada Sequence Diagram B di mana validasi HMAC-SHA256 dilakukan lokal oleh perangkat gate tanpa ketergantungan sinyal internet.
4. **Cashless Wallet:** Terhubung pada ERD (`wallets`, `wallet_transactions`, dan `vendor_sales`) untuk transaksi dalam kawasan wisata.
5. **Settlement & Payouts:** Terintegrasi pada tabel `payouts` & `payout_items` untuk pembagian pendapatan transparan bagi pengelola wisata.

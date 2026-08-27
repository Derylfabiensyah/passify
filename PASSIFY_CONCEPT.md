# 🌲 PASSIFY - Konsep & Spesifikasi Sistem (White-Label Wisata Alam)

Dokumen ini adalah acuan utama (Single Source of Truth) untuk pengembangan platform Passify agar arah pengembangan tidak melenceng dari konsep **SaaS White-Label khusus untuk wisata alam** (dengan fleksibilitas untuk event umum di masa depan).

---

## 🎯 1. Identitas & Visi Produk
- **Fokus Utama**: Destinasi wisata alam (gunung, kawah, danau, taman nasional).
- **Visi Arsitektur**: Dirancang secara generik sehingga di masa depan dapat diekspansi untuk melayani jenis event lain (konser, festival, eksibisi, seminar, olahraga) sesuai kebutuhan PDF spesifikasi, tanpa perlu perombakan core system.

## 🏢 2. Model Multi-Tenant & Domain
- **1 Tenant = 1 Wisata/Event**: Setiap subdomain (misal: `bromo.passify.com`) **hanya** menampilkan satu destinasi wisata tersebut. Pengunjung yang masuk ke subdomain ini langsung disajikan informasi dan flow pemesanan khusus untuk destinasi tersebut (tanpa melihat destinasi lain).
- **Root Domain (`passify.com`)**: Berfungsi murni sebagai **Landing Page Marketing (B2B)** untuk menawarkan SaaS Passify kepada calon klien/pengelola wisata.
- **Halaman Showcase / Katalog (`/jelajah`)**: 
  - Berfungsi murni sebagai **Galeri / Showcase** untuk mendemonstrasikan klien Passify.
  - **TIDAK ADA** transaksi atau form booking secara langsung di halaman ini.
  - Alur User: Ketika pengunjung melihat-lihat dan mengklik salah satu wisata di `/jelajah`, sistem akan **me-redirect** pengunjung ke URL subdomain tenant wisata tersebut untuk memulai proses booking yang sebenarnya.

---

## 🚀 3. Fitur Utama & Target Pengembangan
Mengacu pada spesifikasi PDF dan kebutuhan industri, berikut adalah prioritas fitur yang menjadi fokus:

### ✅ Fitur Inti (Core) yang dipertahankan
1. **E-Ticketing & Carrying Capacity**: Kuota per slot waktu untuk menjaga daya dukung lingkungan.
2. **Offline-First Gate Scanner**: Validasi tiket dengan respon < 0.5 detik di gerbang masuk (meski tanpa internet), dengan *background sync* saat internet kembali online.
3. **Cashless Wallet & Vendor POS**: Ekosistem transaksi non-tunai di area wisata.
4. **Auto Payout**: Penyelesaian dana otomatis (*settlement*) ke pengelola dikurangi platform fee.

### 🔄 Ekstensi Fitur Baru (Merujuk PDF Spec)
1. **Virtual Waiting Room & Flash Sale Handler**: Menggunakan antrean virtual, *Redis Distributed Lock*, dan *Idempotency* untuk mencegah *overselling* saat traffic tinggi.
2. **Dynamic QR Code (TOTP)**: QR code berganti setiap 30 detik untuk mencegah kecurangan *screenshot* calo.
3. **Seat Map Interaktif**: Pemilihan kursi/area spesifik (disiapkan arsitekturnya untuk konser/event khusus).
4. **NFC Wristband Sync**: Integrasi RFID/NFC pada gelang wisatawan untuk mempercepat transaksi di gate dan vendor.
5. **Refund Otomatis**: Pengembalian sisa saldo *wallet* pengunjung secara otomatis saat event selesai.
6. **Device Fingerprinting & CAPTCHA**: Sistem anti-bot dan anti-calo tingkat lanjut.
7. **Mobile App Flutter**: Aplikasi mobile multi-role untuk petugas gate scanner, vendor booth, organizer, dan pengunjung.

---

## 🏗️ 4. Arsitektur Teknis
Platform menggunakan arsitektur **Microservices (Go)** yang dikomunikasikan secara asinkron (*Event-Driven*) untuk skalabilitas tinggi.

- **Frontend Website**: React (Vite) + Tailwind CSS + Glassmorphism UI (Aesthetic & Dinamis).
- **Mobile App**: Flutter (Android/iOS).
- **Backend Services (Go / Gin)**:
  - `auth-service`: Autentikasi, JWT, Session.
  - `tenant-service`: Manajemen white-label (domain, logo, warna).
  - `ticket-service`: Reservasi, Kuota Sesi, Seat Locking.
  - `payment-service`: Integrasi Payment Gateway (Xendit/Midtrans).
  - `cashless-service`: Dompet digital dan sistem Vendor POS.
  - `gate-service`: Sinkronisasi QR & offline logging.
- **Database**: PostgreSQL (Relational) + Redis (Cache, Lock, Waiting Queue).
- **Message Broker**: RabbitMQ (Background processing, Notifikasi).

---

## 📌 Kesimpulan Aturan UI/UX
1. **Dilarang** menampilkan sistem pemesanan atau booking form yang bersifat *marketplace* di aplikasi Passify. Sistem harus sepenuhnya terasa seperti aplikasi milik pengelola itu sendiri (*White-label*).
2. Setiap kali user ingin bertransaksi, pastikan dia berada di lingkup *Tenant* (URL subdomain).
3. Estetika dan kemudahan (*Premium Design*) harus selalu dipertahankan dan ditonjolkan sesuai konsep alam yang indah (animasi yang mulus, responsif, warna harmonis).

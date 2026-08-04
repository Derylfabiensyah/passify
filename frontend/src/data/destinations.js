export const DESTINATIONS = [
  {
    id: "dest-bromo",
    name: "Kawasan Konservasi & Wisata Alam Pegunungan",
    slug: "konservasi-pegunungan-alpha",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Kawasan Sektor Alpha • White-Label Tenant",
    province: "Jawa Timur",
    rating: 4.9,
    reviewsCount: 3420,
    max_daily_capacity: 2752,
    booked_today: 1840,
    starting_price: 35000,
    cover_image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
    description: "Contoh implementasi Passify Cloud untuk kawasan wisata pegunungan dan konservasi alam. Dilengkapi kuota harian otomatis dan enkripsi tiket QR offline.",
    facilities: ["Area Parkir Kendaraan", "Sewa Aksesori", "Toilet Bermutu", "F&B Area UMKM", "Pos Kesehatan", "Gate Terminal QR"],
    rules: "Mematuhi batas daya dukung lingkungan dan menjaga kebersihan kawasan konservasi.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (03:00 - 09:00)", max_capacity: 1000, booked: 780 },
      { id: "ts-2", label: "Sesi Siang (09:00 - 16:00)", max_capacity: 1752, booked: 1060 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Reguler WNI (Hari Kerja)", price: 35000, insurance: 3000, retribusi: 5000 },
      { id: "cat-2", name: "Tiket Reguler WNI (Akhir Pekan)", price: 45000, insurance: 3000, retribusi: 5000 },
      { id: "cat-3", name: "Tiket Wisatawan Mancanegara (WNA)", price: 310000, insurance: 10000, retribusi: 15000 },
      { id: "cat-4", name: "Izin Kendaraan Roda 4 / Shuttle", price: 15000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-ijen",
    name: "Taman Wisata Kawah & Panorama Alam",
    slug: "taman-wisata-kawah-beta",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Kawasan Sektor Beta • White-Label Tenant",
    province: "Jawa Timur",
    rating: 4.8,
    reviewsCount: 2890,
    max_daily_capacity: 1500,
    booked_today: 920,
    starting_price: 25000,
    cover_image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    description: "Penerapan sistem tiket elektronik white-label untuk kawasan kawah vulkanik dan jalur pendakian malam. Telemetri real-time terhubung ke server pengelola.",
    facilities: ["Posko Utama", "Sewa Alat Keamanan", "Toilet Basecamp", "Posko Darurat", "Gate Scanner QR Code"],
    rules: "Wajib mematuhi SOP keselamatan dan mengenakan perlengkapan standar saat berada di area kawah.",
    time_slots: [
      { id: "ts-1", label: "Sesi Dini Hari (02:00 - 07:00)", max_capacity: 800, booked: 610 },
      { id: "ts-2", label: "Sesi Pagi (07:00 - 12:00)", max_capacity: 700, booked: 310 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Wisatawan WNI", price: 25000, insurance: 3000, retribusi: 5000 },
      { id: "cat-2", name: "Tiket Wisatawan WNA", price: 150000, insurance: 10000, retribusi: 15000 },
      { id: "cat-3", name: "Izin Kamera Komersial / Drone", price: 50000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-dieng",
    name: "Kawasan Budaya Candi & Telaga Alami",
    slug: "kawasan-budaya-candi-gamma",
    type: "hutan",
    typeLabel: "Hutan & Air Terjun",
    location: "Kawasan Sektor Gamma • White-Label Tenant",
    province: "Jawa Tengah",
    rating: 4.7,
    reviewsCount: 1940,
    max_daily_capacity: 1000,
    booked_today: 640,
    starting_price: 20000,
    cover_image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    description: "Digitalisasi akses tiket terpadu untuk candi bersejarah dan telaga alami. Mempercepat validasi rombongan wisata di pintu masuk.",
    facilities: ["Area Parkir Luas", "Kios Cenderamata", "Pusat Informasi", "Toilet Bersih", "Gate Kertas QR"],
    rules: "Wajib menjaga ketertiban umum serta melestarikan cagar budaya dan alam sekitar.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (07:00 - 12:00)", max_capacity: 500, booked: 380 },
      { id: "ts-2", label: "Sesi Siang (12:00 - 16:00)", max_capacity: 500, booked: 260 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Panorama & Lembah", price: 20000, insurance: 2000, retribusi: 3000 },
      { id: "cat-2", name: "Jasa Pemandu Resmi Kawasan", price: 50000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-komodo",
    name: "Taman Nasional Bahari & Konservasi Pulau",
    slug: "taman-nasional-bahari-delta",
    type: "taman_nasional",
    typeLabel: "Taman Nasional",
    location: "Kawasan Sektor Delta • White-Label Tenant",
    province: "Nusa Tenggara Timur",
    rating: 5.0,
    reviewsCount: 4210,
    max_daily_capacity: 800,
    booked_today: 510,
    starting_price: 150000,
    cover_image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    description: "Sistem reservasi white-label untuk taman nasional kepulauan dan konservasi satwa dilindungi. Terintegrasi dengan e-Ticket QR Code untuk akses dermaga.",
    facilities: ["Ranger Pendamping Resmi", "Dermaga Smart Gate", "Pusat Edukasi", "Tim Penyelamatan", "Gate Terminal QR"],
    rules: "Wajib didampingi Ranger resmi dan menjaga ekosistem satwa alam dilindungi.",
    time_slots: [
      { id: "ts-1", label: "Full Day Pass (06:00 - 17:00)", max_capacity: 800, booked: 510 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Kawasan (WNI)", price: 150000, insurance: 15000, retribusi: 25000 },
      { id: "cat-2", name: "Tiket Masuk Kawasan (WNA)", price: 500000, insurance: 25000, retribusi: 50000 },
      { id: "cat-3", name: "Retribusi Aktivitas Air / Konservasi", price: 100000, insurance: 10000, retribusi: 15000 }
    ]
  },
  {
    id: "dest-toba",
    name: "Kawasan Danau Alami & Perbukitan Hijau",
    slug: "danau-alami-perbukitan-epsilon",
    type: "danau",
    typeLabel: "Danau & Pantai",
    location: "Kawasan Sektor Epsilon • White-Label Tenant",
    province: "Sumatera Utara",
    rating: 4.8,
    reviewsCount: 1670,
    max_daily_capacity: 2000,
    booked_today: 1100,
    starting_price: 15000,
    cover_image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description: "Solusi e-Ticket untuk kawasan wisata danau, perbukitan hijau, dan area perkemahan alami dengan dukungan pemantauan kapasitas pengelola.",
    facilities: ["Spot Foto Panorama", "Area Glamping & Kemah", "Toilet Bermutu", "Kafe & Lounge Wisata", "Dermaga Ferry"],
    rules: "Menjaga kelestarian perbukitan hijau dan mematuhi aturan jam kunjung kawasan.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (06:00 - 12:00)", max_capacity: 1000, booked: 620 },
      { id: "ts-2", label: "Sesi Sore (12:00 - 18:00)", max_capacity: 1000, booked: 480 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Panorama (WNI)", price: 15000, insurance: 2000, retribusi: 2000 },
      { id: "cat-2", name: "Izin Area Kemah / Camping Ground", price: 35000, insurance: 2000, retribusi: 3000 }
    ]
  }
];

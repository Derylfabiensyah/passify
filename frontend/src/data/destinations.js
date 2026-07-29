export const DESTINATIONS = [
  {
    id: "dest-bromo",
    name: "Taman Nasional Gunung Bromo",
    slug: "gunung-bromo",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Probolinggo / Pasuruan / Malang",
    province: "Jawa Timur",
    rating: 4.9,
    reviewsCount: 3420,
    max_daily_capacity: 2752,
    booked_today: 1840,
    starting_price: 34000,
    cover_image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
    description: "Keindahan lautan pasir, kawah aktif Bromo, dan matahari terbit spektakuler dari Penanjakan 1. Pengalaman wisata alam tak terlupakan di Jawa Timur.",
    facilities: ["Area Parkir Jeep", "Sewa Kuda", "Toilet", "Warung Konsumsi", "Pos Kesehatan", "Petugas Gate QR"],
    rules: "Dilarang membuang sampah sembarangan, menjaga jarak aman dari bibir kawah 1 km saat status waspada.",
    time_slots: [
      { id: "ts-1", label: "Sunrise Session (03:00 - 09:00)", max_capacity: 1000, booked: 780 },
      { id: "ts-2", label: "Day Session (09:00 - 16:00)", max_capacity: 1752, booked: 1060 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Wisatawan WNI (Hari Kerja)", price: 34000, insurance: 3000, retribusi: 5000 },
      { id: "cat-2", name: "Tiket Masuk Wisatawan WNI (Weekend/Libur)", price: 44000, insurance: 3000, retribusi: 5000 },
      { id: "cat-3", name: "Tiket Masuk Wisatawan WNA (Foreign Tourist)", price: 310000, insurance: 10000, retribusi: 15000 },
      { id: "cat-4", name: "Izin Kendaraan Kendaraan Roda 4 (Jeep)", price: 10000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-ijen",
    name: "Kawah Ijen & Blue Fire",
    slug: "kawah-ijen",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Banyuwangi / Bondowoso",
    province: "Jawa Timur",
    rating: 4.8,
    reviewsCount: 2890,
    max_daily_capacity: 1500,
    booked_today: 920,
    starting_price: 20000,
    cover_image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    description: "Fenomena langka Api Biru (Blue Fire) di kawah asam terbesar di dunia. Terkenal dengan pemandangan danau kawah berwarna pirus serta aktivitas penambang belerang.",
    facilities: ["Pos Paltuding", "Sewa Masker Gas", "Troli Dorong", "Toilet Basecamp", "Petugas Gate QR"],
    rules: "Wajib memakai masker gas respirator saat mendekati kawah, mematuhi instruksi jalur pendakian.",
    time_slots: [
      { id: "ts-1", label: "Midnight Blue Fire (02:00 - 07:00)", max_capacity: 800, booked: 610 },
      { id: "ts-2", label: "Morning Trekking (07:00 - 12:00)", max_capacity: 700, booked: 310 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk WNI (Weekdays)", price: 20000, insurance: 2500, retribusi: 2500 },
      { id: "cat-2", name: "Tiket Masuk WNI (Weekend)", price: 30000, insurance: 2500, retribusi: 2500 },
      { id: "cat-3", name: "Tiket Masuk WNA (International)", price: 150000, insurance: 5000, retribusi: 10000 }
    ]
  },
  {
    id: "dest-tumpaksewu",
    name: "Air Terjun Tumpak Sewu",
    slug: "tumpak-sewu",
    type: "air_terjun",
    typeLabel: "Air Terjun",
    location: "Lumajang",
    province: "Jawa Timur",
    rating: 4.9,
    reviewsCount: 1950,
    max_daily_capacity: 1000,
    booked_today: 640,
    starting_price: 15000,
    cover_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    description: "Air terjun TIRAI megah setinggi 120 meter dengan latar belakang kegagahan Gunung Semeru. Julukan Niagaranya Indonesia.",
    facilities: ["Viewpoint Panorama", "Jalur Tangga Bambu", "Pemandu Lokal", "Toilet", "Warung F&B Cashless"],
    rules: "Gunakan alas kaki anti selip saat turun ke dasar lembah, ikuti rambu bahaya banjir bandang.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (07:00 - 12:00)", max_capacity: 500, booked: 380 },
      { id: "ts-2", label: "Sesi Siang (12:00 - 16:00)", max_capacity: 500, booked: 260 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Panorama & Bottom Trek", price: 15000, insurance: 2000, retribusi: 3000 },
      { id: "cat-2", name: "Jasa Pemandu Trekking Dasar Lembah", price: 50000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-komodo",
    name: "Taman Nasional Komodo",
    slug: "taman-nasional-komodo",
    type: "taman_nasional",
    typeLabel: "Taman Nasional",
    location: "Labuan Bajo",
    province: "Nusa Tenggara Timur",
    rating: 5.0,
    reviewsCount: 4210,
    max_daily_capacity: 800,
    booked_today: 510,
    starting_price: 150000,
    cover_image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    description: "Habitat asli kadal purba Komodo dragon, pulau Padar berbukit eksotis, dan pantai berpasir merah muda (Pink Beach).",
    facilities: ["Ranger Companion", "Dermaga Kapal", "Pusat Informasi", "Penyelamatan Laut", "Gate Terminal QR"],
    rules: "Wajib berada di dekat Ranger pendamping, dilarang memberi makan satwa liar.",
    time_slots: [
      { id: "ts-1", label: "Full Day Pass (06:00 - 17:00)", max_capacity: 800, booked: 510 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Kawasan WNI", price: 150000, insurance: 15000, retribusi: 25000 },
      { id: "cat-2", name: "Tiket Masuk Kawasan WNA", price: 500000, insurance: 25000, retribusi: 50000 },
      { id: "cat-3", name: "Retribusi Snorkeling & Diving", price: 100000, insurance: 10000, retribusi: 15000 }
    ]
  },
  {
    id: "dest-toba",
    name: "Danau Toba & Bukit Holbung",
    slug: "danau-toba-holbung",
    type: "danau",
    typeLabel: "Danau & Pantai",
    location: "Samosir",
    province: "Sumatera Utara",
    rating: 4.8,
    reviewsCount: 1670,
    max_daily_capacity: 2000,
    booked_today: 1100,
    starting_price: 10000,
    cover_image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description: "Danau vulkanik terbesar di Asia Tenggara dengan pemandangan perbukitan hijau Teletubbies Holbung dan lanskap Samosir.",
    facilities: ["Spot Foto Panorama", "Area Camping", "Toilet", "Warung Kopi", "Dermaga Ferry"],
    rules: "Menjaga kebersihan area perbukitan dan menghormati adat lokal setempat.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (06:00 - 12:00)", max_capacity: 1000, booked: 620 },
      { id: "ts-2", label: "Sesi Sore & Sunset (12:00 - 18:00)", max_capacity: 1000, booked: 480 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Bukit Holbung WNI", price: 10000, insurance: 2000, retribusi: 2000 },
      { id: "cat-2", name: "Izin Kemah / Camping Ground (per tenda)", price: 25000, insurance: 2000, retribusi: 3000 }
    ]
  }
];

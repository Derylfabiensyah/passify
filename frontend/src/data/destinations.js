export const DESTINATIONS = [
  {
    id: "dest-bromo",
    name: "Taman Nasional Bromo Tengger Semeru",
    slug: "bromo-tengger-semeru",
    type: "gunung",
    typeLabel: "Gunung & Kaldera",
    location: "Tengger, Pasuruan & Probolinggo",
    province: "Jawa Timur",
    rating: 4.9,
    reviewsCount: 3420,
    max_daily_capacity: 2752,
    booked_today: 1840,
    starting_price: 35000,
    cover_image_url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80",
    description: "Kawasan kaldera tengger alami dengan pemandangan kawah aktif, lautan pasir berbisik, dan panorama matahari terbit Penanjakan yang memukau.",
    facilities: ["Area Parkir Jeep", "Pusat Informasi Konservasi", "Toilet Bersih", "Kios Kuliner Lokal", "Pos Medis & P3K", "Gate Scanner Tiket"],
    rules: "Wajib mematuhi batas aman kawah aktif, membawa sampah kembali turun, dan menjaga ketertiban kawasan.",
    time_slots: [
      { id: "ts-1", label: "Sesi Sunrise (03:00 - 09:00)", max_capacity: 1000, booked: 780 },
      { id: "ts-2", label: "Sesi Siang (09:00 - 16:00)", max_capacity: 1752, booked: 1060 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Domestik (Hari Kerja)", price: 35000, insurance: 3000, retribusi: 5000 },
      { id: "cat-2", name: "Tiket Masuk Domestik (Akhir Pekan)", price: 45000, insurance: 3000, retribusi: 5000 },
      { id: "cat-3", name: "Tiket Wisatawan Mancanegara (WNA)", price: 310000, insurance: 10000, retribusi: 15000 },
      { id: "cat-4", name: "Izin Kendaraan Roda 4 / Shuttle Jeep", price: 15000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-ijen",
    name: "Taman Wisata Alam Kawah Ijen",
    slug: "kawah-ijen",
    type: "gunung",
    typeLabel: "Gunung & Kawah",
    location: "Licin, Banyuwangi & Bondowoso",
    province: "Jawa Timur",
    rating: 4.8,
    reviewsCount: 2890,
    max_daily_capacity: 1500,
    booked_today: 920,
    starting_price: 25000,
    cover_image_url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    description: "Danau kawah asam terbesar di dunia dengan fenomena langka api biru (blue fire), penambangan belerang tradisional, dan panorama fajar di bibir kawah.",
    facilities: ["Posko Basecamp Paltuding", "Sewa Masker Gas Respirator", "Toilet Bersih", "Posko Medis & SAR", "Gate Scanner QR Code"],
    rules: "Wajib mengenakan masker gas standar di area kawah dan mematuhi instruksi pemandu lapangan.",
    time_slots: [
      { id: "ts-1", label: "Sesi Blue Fire (02:00 - 07:00)", max_capacity: 800, booked: 610 },
      { id: "ts-2", label: "Sesi Pagi (07:00 - 12:00)", max_capacity: 700, booked: 310 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Wisatawan Domestik (WNI)", price: 25000, insurance: 3000, retribusi: 5000 },
      { id: "cat-2", name: "Tiket Wisatawan Mancanegara (WNA)", price: 150000, insurance: 10000, retribusi: 15000 },
      { id: "cat-3", name: "Izin Dokumentasi / Kamera Drone", price: 50000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-dieng",
    name: "Wisata Alam Dataran Tinggi Dieng",
    slug: "dataran-tinggi-dieng",
    type: "hutan",
    typeLabel: "Pegunungan & Telaga",
    location: "Kejajar, Wonosobo & Banjarnegara",
    province: "Jawa Tengah",
    rating: 4.7,
    reviewsCount: 1940,
    max_daily_capacity: 1000,
    booked_today: 640,
    starting_price: 20000,
    cover_image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80",
    description: "Kawasan vulkanik sejuk dengan panorama Telaga Warna yang berubah warna, kawah geotermal Sikidang, dan candi purba peninggalan sejarah.",
    facilities: ["Area Parkir Terpadu", "Pusat Oleh-oleh Carica", "Pusat Edukasi Geologi", "Toilet & Musholla", "Gate Scanner QR"],
    rules: "Dilarang mendekati zona asap belerang tanpa batas pengaman dan jaga kebersihan telaga.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (07:00 - 12:00)", max_capacity: 500, booked: 380 },
      { id: "ts-2", label: "Sesi Siang (12:00 - 16:00)", max_capacity: 500, booked: 260 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Terusan Telaga Warna & Kawah", price: 20000, insurance: 2000, retribusi: 3000 },
      { id: "cat-2", name: "Jasa Pemandu Himpunan Pramuwisata", price: 50000, insurance: 0, retribusi: 0 }
    ]
  },
  {
    id: "dest-komodo",
    name: "Taman Nasional Komodo & Pulau Padar",
    slug: "taman-nasional-komodo",
    type: "taman_nasional",
    typeLabel: "Taman Nasional Bahari",
    location: "Labuan Bajo, Manggarai Barat",
    province: "Nusa Tenggara Timur",
    rating: 5.0,
    reviewsCount: 4210,
    max_daily_capacity: 800,
    booked_today: 510,
    starting_price: 150000,
    cover_image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
    description: "Situs Warisan Dunia UNESCO dengan habitat asli komodo purba, pemandangan bukit Padar tiga teluk, serta kekayaan terumbu karang kelas dunia.",
    facilities: ["Ranger Pendamping Ahli", "Dermaga Smart Turnstile", "Pusat Konservasi Satwa", "Tim Penyelamat Bahari", "Gate Scanner QR"],
    rules: "Wajib selalu didampingi Naturalist Guide/Ranger resmi dan mematuhi batas aman interaksi satwa.",
    time_slots: [
      { id: "ts-1", label: "Tiket Masuk Harian (06:00 - 17:00)", max_capacity: 800, booked: 510 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Konservasi (WNI)", price: 150000, insurance: 15000, retribusi: 25000 },
      { id: "cat-2", name: "Tiket Masuk Konservasi (WNA)", price: 500000, insurance: 25000, retribusi: 50000 },
      { id: "cat-3", name: "Retribusi Snorkeling / Diving Bahari", price: 100000, insurance: 10000, retribusi: 15000 }
    ]
  },
  {
    id: "dest-toba",
    name: "Geopark Danau Toba & Samosir",
    slug: "geopark-danau-toba",
    type: "danau",
    typeLabel: "Danau & Perbukitan",
    location: "Parapat & Pulau Samosir",
    province: "Sumatera Utara",
    rating: 4.8,
    reviewsCount: 1670,
    max_daily_capacity: 2000,
    booked_today: 1100,
    starting_price: 15000,
    cover_image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description: "Danau vulkanik terbesar di Asia Tenggara yang dikelilingi perbukitan pinus hijau, budaya Batak yang kaya, dan udara segar pegunungan.",
    facilities: ["Spot Foto Panorama Danau", "Area Kemah & Glamping", "Toilet Bersih", "Dermaga Kapal Wisata", "Gate Scanner QR"],
    rules: "Menjaga kelestarian lingkungan danau dan menghormati adat istiadat kearifan lokal.",
    time_slots: [
      { id: "ts-1", label: "Sesi Pagi (06:00 - 12:00)", max_capacity: 1000, booked: 620 },
      { id: "ts-2", label: "Sesi Sore (12:00 - 18:00)", max_capacity: 1000, booked: 480 }
    ],
    ticket_categories: [
      { id: "cat-1", name: "Tiket Masuk Panorama Geopark (WNI)", price: 15000, insurance: 2000, retribusi: 2000 },
      { id: "cat-2", name: "Izin Area Berkemah / Glamping Ground", price: 35000, insurance: 2000, retribusi: 3000 }
    ]
  }
];

import React from 'react';
import { Quote, Star, Award, CheckCircle2, Trees, Landmark } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Bapak H. Solehuddin',
      role: 'Ketua Pokdarwis Lereng Arjuno & Air Terjun',
      location: 'Jawa Timur',
      quote: 'Dulu sebelum pakai Passify, kami sering rugi karena tiket gelang kertas mudah dipalsukan dan antrean loket mengular sampai jalan raya. Setelah menerapkan sistem E-Ticket QR Code dari Passify, kebocoran kas turun dari 35% menjadi nol dalam dua bulan pertama.',
      metric: '0% Kebocoran Tiket',
      avatar: 'H.S.'
    },
    {
      name: 'Ibu Ir. Larasati Wibowo, M.Sc.',
      role: 'Kepala Seksi Konservasi Wilayah BKSDA',
      location: 'Kawasan Taman Nasional',
      quote: 'Fitur kuota konservasi dan kemampuan offline-first sangat krusial bagi kami. Petugas gerbang di posko ketinggian 1.800 mdpl tetap bisa scan QR e-Ticket pendaki dengan sangat cepat walau sama sekali tidak ada sinyal operator seluler.',
      metric: '0.28 Detik Kecepatan Scan Offline',
      avatar: 'L.W.'
    },
    {
      name: 'Bayan Ridwan Santoso',
      role: 'Pengelola BUMDes Wisata Hutan Pinus',
      location: 'Yogyakarta',
      quote: 'Model bagi hasil Rp 1.500 per tiket benar-benar menyelamatkan keuangan BUMDes kami saat low season. Tidak ada biaya abonemen bulanan yang membebani kas desa, tapi fitur sistemnya setara bandara.',
      metric: 'Rp 0 Beban Server saat Low Season',
      avatar: 'R.S.'
    }
  ];

  return (
    <section id="testimonials-section" className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>Suara Nyata Pengelola & Pengambil Keputusan</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 font-['Outfit'] tracking-tight mb-4">
          Dipercaya oleh Ketua Pokdarwis & Kepala Balai
        </h2>
        <p className="text-[#212529] text-base sm:text-lg leading-relaxed font-medium">
          Dengarkan pengalaman nyata para pimpinan kawasan wisata alam di Indonesia dalam mentransformasi operasional e-ticketing dan meningkatkan akuntabilitas pendapatan desa.
        </p>
      </div>

      {/* Testimonials Cards Grid - Tanpa Outline/Border */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testi, idx) => (
          <div
            key={idx}
            className="p-8 rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full shadow-xs">
                  {testi.metric}
                </span>
                <Quote className="w-6 h-6 text-emerald-600 opacity-40" />
              </div>

              <p className="text-[#212529] text-sm sm:text-base leading-relaxed font-medium italic mb-6">
                "{testi.quote}"
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                {testi.avatar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-['Outfit']">
                  {testi.name}
                </h4>
                <p className="text-xs text-[#212529] font-semibold mt-0.5">
                  {testi.role}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1">
                  <Trees className="w-3 h-3" />
                  <span>{testi.location}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

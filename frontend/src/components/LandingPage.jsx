import React from 'react';
import { ArrowRight, ArrowUpRight, Check, ChevronRight, CloudOff, Compass, Mountain, ScanLine, TicketCheck, Trees, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

const heroImage = 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1800&q=88';
const trailImage = 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=85';



function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[var(--river)]">
      {children}
    </div>
  );
}

export default function LandingPage() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--canvas)] text-[var(--ink)]">
      <header className="relative z-20 border-b border-[rgba(23,59,50,0.13)] bg-[var(--canvas)]">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center text-decoration-none" aria-label="Passify beranda">
            <span className="text-[17px] font-extrabold tracking-[-0.04em]">passify</span>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[var(--ink-soft)] md:flex">
            <button onClick={() => scrollTo('platform')} className="transition-colors hover:text-[var(--ink)]">Platform</button>
            <button onClick={() => scrollTo('field-work')} className="transition-colors hover:text-[var(--ink)]">Di lapangan</button>
            <button onClick={() => scrollTo('white-label')} className="transition-colors hover:text-[var(--ink)]">White-label</button>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/jelajah" className="hidden text-[13px] font-bold text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] sm:inline">
              Coba portal wisatawan
            </Link>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-[12px] font-bold text-white transition-transform hover:-translate-y-0.5">
              Jadwalkan demo <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative border-b border-[rgba(23,59,50,0.13)]">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 pb-14 pt-12 sm:px-8 md:pb-20 md:pt-16 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-16 lg:px-10 lg:py-20">
            <div className="relative z-10 max-w-[610px]">
              <Eyebrow>Ticketing untuk kawasan yang dijaga</Eyebrow>
              <h1 className="mt-6 max-w-[590px] font-serif text-[clamp(3.25rem,7vw,6.35rem)] leading-[0.91] tracking-[-0.065em] text-[var(--ink)]">
                Tiket yang memberi alam ruang bernapas.
              </h1>
              <p className="mt-7 max-w-[510px] text-[16px] leading-7 text-[var(--ink-soft)] sm:text-[17px]">
                Passify menyatukan reservasi, batas kunjungan, dan validasi gerbang dalam satu sistem white-label yang tetap siap saat koneksi tidak ada.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--clay)] px-6 py-3.5 text-[13px] font-extrabold text-white transition-transform hover:-translate-y-0.5">
                  Mulai percakapan <ArrowRight className="h-4 w-4" />
                </a>
                <Link to="/jelajah" className="inline-flex items-center justify-center gap-2 px-4 py-3 text-[13px] font-bold text-[var(--ink)]">
                  Lihat contoh pemesanan <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-12 grid max-w-[520px] grid-cols-3 border-t border-[rgba(23,59,50,0.18)] pt-5">
                {[
                  ['Reservasi', 'berdasar sesi'],
                  ['Gerbang', 'siap offline'],
                  ['Keuangan', 'mudah ditelusuri'],
                ].map(([title, text]) => (
                  <div key={title} className="pr-3">
                    <p className="text-[12px] font-extrabold text-[var(--ink)]">{title}</p>
                    <p className="mt-1 text-[11px] leading-4 text-[var(--ink-soft)]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[410px] sm:min-h-[510px] lg:min-h-[640px]">
              <div className="absolute inset-y-0 right-0 w-[92%] overflow-hidden rounded-tl-[140px] rounded-br-[140px] bg-[var(--fog)] sm:w-[89%]">
                <img src={heroImage} alt="Lanskap pegunungan Indonesia saat pagi hari" className="h-full w-full object-cover contrast-[.92] saturate-[.75]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(16,42,35,0.64)] via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-5 left-0 max-w-[290px] border border-white/40 bg-[rgba(244,240,232,0.94)] p-5 backdrop-blur-md sm:bottom-9 sm:p-6">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--river)]">
                  <span>Contoh dashboard</span>
                  <span>06 Agu 2026</span>
                </div>
                <p className="mt-4 font-serif text-2xl leading-6 tracking-[-0.04em]">Jalur sunrise menjaga ritmenya.</p>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Sisa kapasitas</p>
                    <p className="mt-1 text-xl font-extrabold tracking-[-0.04em]">58 <span className="text-[12px] font-bold">orang</span></p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(23,59,50,0.14)]"><div className="h-full w-[71%] bg-[var(--clay)]" /></div>
                    <p className="mt-1.5 text-right text-[10px] font-bold text-[var(--river)]">71% terisi</p>
                  </div>
                </div>
              </div>
              <p className="absolute bottom-5 right-5 max-w-[190px] text-right text-[10px] leading-4 text-white/90 sm:bottom-8 sm:right-8">Sistem merespons batas yang Anda tetapkan—bukan sebaliknya.</p>
            </div>
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.77fr_1.23fr] lg:gap-20">
            <div>
              <Eyebrow>Rapi di depan, tangguh di belakang</Eyebrow>
              <h2 className="mt-5 max-w-[365px] font-serif text-5xl leading-[0.98] tracking-[-0.055em] sm:text-6xl">Satu alur, dari rencana sampai pintu masuk.</h2>
            </div>
            <div className="grid gap-0 border-t border-[rgba(23,59,50,0.18)] lg:grid-cols-3">
              {[
                { number: '01', icon: TicketCheck, title: 'Reservasi yang terukur', text: 'Atur kunjungan per tanggal, sesi, jalur, atau aktivitas. Pengunjung tahu apa yang tersedia sebelum berangkat.' },
                { number: '02', icon: ScanLine, title: 'Gerbang tetap bergerak', text: 'Validasi tiket disiapkan untuk kondisi lapangan yang tidak selalu punya sinyal stabil.' },
                { number: '03', icon: WalletCards, title: 'Arus dana lebih jelas', text: 'Pisahkan komponen tiket dan lihat jejak transaksi yang dibutuhkan tim operasional.' },
              ].map(({ number, icon: Icon, title, text }) => (
                <article key={number} className="border-b border-[rgba(23,59,50,0.18)] py-7 lg:border-b-0 lg:border-r lg:px-7 lg:py-0 first:lg:pl-0 last:lg:border-r-0 last:lg:pr-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold tracking-[0.1em] text-[var(--clay)]">{number}</span>
                    <Icon className="h-5 w-5 text-[var(--river)] stroke-[1.5]" />
                  </div>
                  <h3 className="mt-10 text-[16px] font-extrabold tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--ink-soft)]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="field-work" className="border-y border-[rgba(23,59,50,0.13)] bg-[var(--fog)]">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.07fr_.93fr] lg:items-center lg:gap-20 lg:px-10">
            <div className="order-2 lg:order-1">
              <Eyebrow>Untuk hari yang sebenarnya</Eyebrow>
              <h2 className="mt-5 max-w-[545px] font-serif text-5xl leading-[0.97] tracking-[-0.055em] sm:text-6xl">Di lapangan, koneksi bukan satu-satunya yang harus dijaga.</h2>
              <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-[var(--ink-soft)]">
                Petugas perlu bergerak cepat, pengunjung perlu masuk dengan tenang, dan pengelola perlu tetap punya catatan yang dapat dipercaya. Karena itu, setiap bagian Passify dibangun untuk memperjelas keputusan—bukan menambah layar.
              </p>
              <ul className="mt-8 grid gap-3 text-[13px] font-semibold text-[var(--ink-soft)] sm:grid-cols-2">
                {['Mode validasi yang tetap siap saat offline', 'Kuota disesuaikan dengan aturan kawasan', 'Riwayat transaksi untuk tim pengelola', 'Portal yang membawa identitas destinasi Anda'].map((item) => (
                  <li className="flex gap-2.5" key={item}><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--clay)]" />{item}</li>
                ))}
              </ul>
            </div>
            <div className="relative order-1 overflow-hidden bg-[var(--ink)] p-6 text-white sm:p-8 lg:order-2">
              <div className="flex items-center justify-between border-b border-white/15 pb-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">
                <span>Gerbang selatan — contoh data</span>
                <CloudOff className="h-4 w-4 text-[var(--moss)]" />
              </div>
              <div className="py-10 sm:py-14">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--moss)]">Status pemindaian</p>
                <p className="mt-3 font-serif text-5xl leading-none tracking-[-0.055em]">Siap menerima</p>
                <div className="mt-10 grid grid-cols-2 gap-px bg-white/15">
                  <div className="bg-[var(--ink)] p-4"><p className="text-[10px] uppercase tracking-[0.1em] text-white/50">Terakhir dipindai</p><p className="mt-2 text-xl font-bold">08:42</p></div>
                  <div className="bg-[var(--ink)] p-4"><p className="text-[10px] uppercase tracking-[0.1em] text-white/50">Sesi pagi</p><p className="mt-2 text-xl font-bold">142 / 200</p></div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-white/15 pt-5 text-[11px] text-white/65"><span className="h-2 w-2 rounded-full bg-[var(--moss)]" />Data akan diselaraskan saat koneksi tersedia.</div>
            </div>
          </div>
        </section>

        <section id="white-label" className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <Eyebrow>Bermerek Anda, dengan fondasi yang sama</Eyebrow>
              <h2 className="mt-5 max-w-[520px] font-serif text-5xl leading-[0.97] tracking-[-0.055em] sm:text-6xl">Pengunjung datang ke destinasi Anda. Bukan ke platform kami.</h2>
              <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-[var(--ink-soft)]">Setiap portal dapat menampilkan nama, warna, konten, dan alur kunjungan yang terasa milik kawasan sendiri—sementara tim Anda tetap memakai operasi yang konsisten di belakangnya.</p>
              <Link to="/jelajah" className="mt-8 inline-flex items-center gap-2 border-b border-[var(--ink)] pb-1 text-[13px] font-extrabold text-[var(--ink)]">Buka contoh portal wisatawan <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="relative overflow-hidden border border-[rgba(23,59,50,0.17)] bg-white p-6 sm:p-9">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#915532] text-white"><Trees className="h-4 w-4" /></span><span><span className="block text-sm font-extrabold">Rimba Senja</span><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Taman wisata alam</span></span></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--river)]">Portal contoh</span>
              </div>
              <div className="mt-12 grid grid-cols-[1.1fr_.9fr] gap-5 border-y border-[rgba(23,59,50,0.13)] py-5">
                <div><p className="font-serif text-3xl tracking-[-0.04em]">Kunjungan minggu ini</p><p className="mt-2 text-[11px] leading-5 text-[var(--ink-soft)]">Pilih tanggal dan sesi yang sesuai dengan rencana perjalanan Anda.</p></div>
                <div className="self-end bg-[#e8ddd0] p-4"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6f4b32]">Sesi tersisa</p><p className="mt-1 text-2xl font-extrabold text-[#3b2c21]">58</p></div>
              </div>
              <div className="mt-5 flex items-center justify-between text-[11px] font-bold"><span className="text-[var(--ink-soft)]">Rp35.000 / orang</span><span className="rounded-full bg-[#915532] px-4 py-2 text-white">Pilih tanggal</span></div>
              <div className="absolute -bottom-10 -right-7 h-28 w-28 rounded-full border-[18px] border-[var(--fog)]" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
          <div className="grid overflow-hidden bg-[var(--ink)] text-white lg:grid-cols-[.8fr_1.2fr]">
            <div className="p-8 sm:p-12 lg:p-14">
              <Compass className="h-7 w-7 text-[var(--moss)] stroke-[1.35]" />
              <h2 className="mt-10 max-w-[390px] font-serif text-5xl leading-[0.96] tracking-[-0.055em]">Mulai dari kebutuhan kawasan Anda.</h2>
              <p className="mt-5 max-w-[380px] text-[14px] leading-6 text-white/70">Ceritakan cara tiket, kuota, dan gerbang Anda bekerja hari ini. Kami bantu memetakan langkah awal yang relevan.</p>
              <a id="contact" href="mailto:hello@passify.id" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--sand)] px-5 py-3 text-[13px] font-extrabold text-[var(--ink)] transition-transform hover:-translate-y-0.5">Bicarakan kebutuhan Anda <ArrowUpRight className="h-4 w-4" /></a>
            </div>
            <div className="min-h-[310px] lg:min-h-full"><img src={trailImage} alt="Jalur hutan yang tenang" className="h-full w-full object-cover opacity-80 saturate-[.58]" /></div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(23,59,50,0.13)] px-5 py-7 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 text-[11px] font-semibold text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Passify. Ticketing untuk kawasan yang dijaga.</span>
          <div className="flex gap-5"><a href="#platform">Platform</a><Link to="/jelajah">Portal demo</Link><a href="mailto:hello@passify.id">Kontak</a></div>
        </div>
      </footer>
    </div>
  );
}

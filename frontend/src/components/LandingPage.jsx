import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CloudOff,
  Landmark,
  Trees,
} from 'lucide-react';

const heroImage = 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1800&q=88';
const trailImage = 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=85';

function Eyebrow({ children, className = '' }) {
  return <p className={`eyebrow ${className}`}>{children}</p>;
}

function SectionHeading({ eyebrow, title, children, className = '' }) {
  return (
    <div className={className}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 max-w-3xl font-sans text-4xl font-bold leading-[1.02] tracking-[-.045em] sm:text-5xl">{title}</h2>
      {children && <p className="mt-5 max-w-2xl text-sm leading-6 text-[var(--ink-soft)] sm:text-[15px] sm:leading-7">{children}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[var(--canvas)] text-[var(--ink)]">
      <header className="nav-bar sticky top-0 z-40">
        <div className="mx-auto flex min-h-[68px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold tracking-[-.05em] text-[var(--forest-deep)] no-underline" aria-label="Passify beranda">
            passify
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-bold text-[var(--ink-soft)] lg:flex" aria-label="Navigasi utama">
            <a href="#masalah" className="transition-colors hover:text-[var(--forest-deep)]">Kawasan</a>
            <a href="#alur" className="transition-colors hover:text-[var(--forest-deep)]">Cara kerja</a>
            <a href="#white-label" className="transition-colors hover:text-[var(--forest-deep)]">White-label</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/jelajah" className="hidden text-xs font-bold text-[var(--forest)] transition-colors hover:text-[var(--bark)] sm:inline">Lihat demo</Link>
            <Link to="/daftar-wisata" className="btn-primary whitespace-nowrap rounded-full px-3 text-[11px] sm:px-4 sm:text-[13px]">Daftarkan wisata <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[var(--forest-deep)] text-white">
          <img src={heroImage} alt="Lanskap pegunungan saat pagi hari" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55 saturate-[.64]" />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{ backgroundImage: 'linear-gradient(105deg, rgba(16,45,32,.98) 4%, rgba(16,45,32,.88) 46%, rgba(16,45,32,.46))' }}
          />
          <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1240px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,_1fr)_22rem] lg:items-end lg:gap-14 lg:px-8 lg:py-20">
            <div className="max-w-[780px]">
              <Eyebrow className="!text-[var(--leaf)]">Untuk pengelola kawasan yang ingin menjaga ritme</Eyebrow>
              <h1 className="mt-5 max-w-[760px] font-sans text-[clamp(2.7rem,6.4vw,5.9rem)] font-bold leading-[.93] tracking-[-.06em] text-white">Alam memberi batas.<br />Operasi memberi kepastian.</h1>
              <p className="mt-7 max-w-[590px] text-[15px] leading-7 text-white/80 sm:text-[17px] sm:leading-8">Passify menyatukan tiket, daya dukung, gerbang, dan arus dana dalam satu sistem yang tetap bekerja saat hari di lapangan tidak berjalan sempurna.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to="/daftar-wisata" className="btn-clay px-6 py-3.5 text-sm">Daftarkan wisata Anda <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/jelajah" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white/90 transition-colors hover:bg-white/10 hover:text-white">Jelajahi portal wisatawan <ChevronRight className="h-4 w-4" /></Link>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/20 pt-5 text-xs font-semibold text-white/75"><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--leaf)]" />Kuota per sesi</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--leaf)]" />Gerbang siap offline</span><span className="flex items-center gap-2"><Check className="h-4 w-4 text-[var(--leaf)]" />Payout terlacak</span></div>
            </div>

            <aside className="rounded-3xl bg-[rgba(255,254,250,.96)] p-5 text-[var(--ink)] shadow-[0_20px_46px_rgba(0,0,0,.24)] backdrop-blur-md sm:p-6 lg:mb-3">
              <div className="flex items-start justify-between gap-4 pb-4"><div><Eyebrow>Contoh operasional</Eyebrow><p className="mt-1 text-sm font-bold text-[var(--forest-deep)]">Kawasan Lereng Arunika</p></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--leaf-pale)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)]"><span className="status-dot" />Normal</span></div>
              <div className="mt-5"><div className="flex items-end justify-between"><span className="text-xs font-semibold text-[var(--ink-soft)]">Kuota sesi pagi</span><strong className="text-2xl font-bold tracking-[-.04em] text-[var(--forest-deep)]">71%</strong></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--leaf-pale)]"><div className="h-full w-[71%] rounded-full bg-[var(--leaf)]" /></div></div>
              <dl className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[var(--canvas)] p-3"><dt className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Sisa kunjungan</dt><dd className="mt-1 text-xl font-bold tracking-[-.04em] text-[var(--forest-deep)]">58 orang</dd></div><div className="rounded-2xl bg-[var(--canvas)] p-3"><dt className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--ink-muted)]">Gate utara</dt><dd className="mt-1 text-sm font-bold text-[var(--forest)]">Siap menerima</dd></div></dl>
              <p className="mt-4 text-[11px] leading-5 text-[var(--ink-soft)]">Simulasi status yang membantu tim memutuskan sebelum kawasan menjadi terlalu penuh.</p>
            </aside>
          </div>
        </section>

        <section id="masalah" className="scroll-mt-24 bg-[var(--sand)]">
          <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <SectionHeading eyebrow="Kawasan punya ritmenya sendiri" title="Ketika kunjungan bertambah, keputusan harus semakin jernih.">Bukan sekadar menjual tiket. Pengelola perlu menjaga ruang, menggerakkan petugas, dan tetap memahami uang yang mengalir setiap hari.</SectionHeading>
            <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-5">
              {[
                { index: '01', icon: Trees, title: 'Ruang yang tidak bisa ditambah', text: 'Daya dukung menentukan berapa banyak orang yang dapat hadir tanpa mengubah pengalaman atau ekosistem kawasan.' },
                { index: '02', icon: CloudOff, title: 'Hari lapangan tidak selalu tersambung', text: 'Gerbang tetap harus bergerak ketika sinyal hilang, antrean datang, dan petugas membutuhkan jawaban yang cepat.' },
                { index: '03', icon: Landmark, title: 'Kepercayaan perlu jejak yang jelas', text: 'Komponen tiket, transaksi, dan pencairan perlu mudah dibaca tanpa menambah pekerjaan administratif.' },
              ].map(({ index, icon: Icon, title, text }) => <article key={index} className="rounded-3xl bg-[var(--canvas)] p-6 shadow-[0_18px_42px_rgba(16,45,32,.10)] sm:p-7"><div className="flex items-center justify-between"><span className="text-[11px] font-extrabold tracking-[.12em] text-[var(--bark)]">{index}</span><Icon className="h-5 w-5 text-[var(--forest-soft)]" strokeWidth={1.5} /></div><h3 className="mt-9 text-2xl font-bold leading-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section id="alur" className="scroll-mt-24 bg-[var(--fog)]">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-start lg:gap-20 lg:px-8 lg:py-24">
            <SectionHeading eyebrow="Satu alur, bukan banyak alat" title="Dari rencana pengunjung sampai rekonsiliasi hari ini.">Passify membantu kawasan merespons dengan satu sumber informasi yang sama—di portal, di gerbang, dan pada laporan pengelola.</SectionHeading>
            <div>
              {[
                { number: '01', title: 'Pengunjung memilih waktu yang masih masuk akal', text: 'Reservasi mengikuti tanggal, sesi, jalur, atau aktivitas yang Anda atur untuk kawasan.' },
                { number: '02', title: 'Gerbang memvalidasi tanpa menunggu kondisi ideal', text: 'Tiket dinamis tetap dapat diperiksa di lapangan dan diselaraskan ketika koneksi tersedia kembali.' },
                { number: '03', title: 'Pendapatan kembali dalam gambaran yang bisa ditindak', text: 'Komponen penjualan dan settlement disusun agar tim memahami apa yang terjadi, bukan sekadar melihat angka.' },
              ].map(({ number, title, text }) => <article key={number} className="grid gap-4 py-7 sm:grid-cols-[46px_1fr] sm:items-start sm:gap-5"><span className="text-2xl font-bold tracking-[-.04em] text-[var(--bark)]">{number}</span><div><h3 className="font-sans text-xl font-bold leading-snug tracking-[-.035em]">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">{text}</p></div></article>)}
              <div className="mt-7 rounded-3xl bg-[var(--forest-deep)] p-5 text-white sm:p-6"><div className="flex items-center justify-between gap-4 pb-4"><div><Eyebrow className="!text-[var(--leaf)]">Simulasi operasional</Eyebrow><p className="mt-1 text-2xl font-bold tracking-[-.045em] text-white">Gerbang selatan siap menerima</p></div><CloudOff className="h-5 w-5 shrink-0 text-[var(--leaf)]" /></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><span className="text-[10px] font-extrabold uppercase tracking-wide text-white/55">Scan terakhir</span><strong className="mt-2 block text-xl">08:42</strong></div><div className="rounded-2xl bg-white/10 p-4"><span className="text-[10px] font-extrabold uppercase tracking-wide text-white/55">Sesi pagi</span><strong className="mt-2 block text-xl">142 / 200</strong></div></div><p className="mt-4 text-xs leading-5 text-white/65">Contoh tampilan status; data akan diselaraskan saat koneksi tersedia.</p></div>
            </div>
          </div>
        </section>

        <section id="white-label" className="scroll-mt-24 bg-[var(--canvas)]">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-8 lg:py-24">
            <div>
              <SectionHeading
                eyebrow="Wajah yang tetap milik kawasan"
                title="Pengunjung datang ke destinasi Anda, bukan ke marketplace kami."
              >
                Setiap pengelola memiliki portal dengan nama, domain, identitas, dan alur kunjungannya sendiri. Di belakangnya, tim Anda tetap menggunakan fondasi operasi yang sama.
              </SectionHeading>
              <Link
                to="/jelajah"
                className="mt-7 inline-flex items-center gap-2 pb-1 text-sm font-extrabold text-[var(--forest)] transition-colors hover:text-[var(--bark)]"
              >
                Buka contoh portal wisatawan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
              {/* Header Card */}
              <div className="flex items-start justify-between gap-4 pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--bark)] text-white shadow-xs">
                    <Trees className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-[var(--forest-deep)]">Rimba Senja</span>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[.13em] text-[var(--ink-soft)]">Taman wisata alam</span>
                  </span>
                </div>
                <span className="inline-flex items-center rounded-full bg-[var(--leaf-pale)] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--forest)]">
                  Portal contoh
                </span>
              </div>

              {/* Body Content */}
              <div className="grid gap-6 py-8 sm:grid-cols-2 sm:items-end">
                <div>
                  <Eyebrow>Rencana kunjungan</Eyebrow>
                  <p className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-.045em] text-[var(--forest-deep)] sm:text-4xl">
                    Hari yang baik dimulai dari kuota yang jelas.
                  </p>
                  <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
                    Pilih tanggal dan sesi yang sesuai dengan rencana perjalanan Anda.
                  </p>
                </div>
                
                {/* Sesi Box */}
                <div className="rounded-2xl bg-[var(--bark-pale)] p-5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--bark)]">
                    Contoh sesi tersisa
                  </span>
                  <strong className="mt-2 block text-4xl font-bold tracking-[-.05em] text-[var(--forest-deep)]">
                    58
                  </strong>
                  <span className="text-xs font-semibold text-[var(--ink-soft)]">
                    pengunjung
                  </span>
                </div>
              </div>

              {/* Footer Card */}
              <div className="flex items-center justify-between pt-5 text-xs font-bold">
                <span className="text-[var(--ink-soft)] font-semibold">Mulai Rp35.000 / orang</span>
                <span className="inline-flex items-center rounded-xl bg-[var(--forest)] px-4 py-2.5 text-white transition-colors hover:bg-[var(--forest-deep)] shadow-xs">
                  Pilih tanggal
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-[1240px] px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--forest-deep)] text-white shadow-[var(--shadow-lift)]"><img src={trailImage} alt="Jalur hutan yang tenang" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-42 saturate-[.55]" /><div aria-hidden="true" className="absolute inset-0 -z-10" style={{ backgroundImage: 'linear-gradient(90deg, rgba(16,45,32,.97), rgba(16,45,32,.74), rgba(16,45,32,.40))' }} /><div className="grid min-h-[390px] items-end px-7 py-9 sm:px-10 sm:py-12 lg:min-h-[440px] lg:px-14 lg:py-14"><div className="max-w-xl"><Eyebrow className="!text-[var(--leaf)]">Mulai dari kebutuhan kawasan Anda</Eyebrow><h2 className="mt-4 text-4xl font-bold leading-[.96] text-white sm:text-5xl">Biarkan alam tetap menjadi alasan orang datang.</h2><p className="mt-5 text-sm leading-6 text-white/75 sm:text-[15px] sm:leading-7">Ceritakan cara tiket, kuota, dan gerbang bekerja hari ini. Mulai dari portal yang terasa milik kawasan Anda sendiri.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/daftar-wisata" className="btn-clay px-5 py-3.5 text-sm">Daftarkan wisata <ArrowRight className="h-4 w-4" /></Link><a href="mailto:hello@passify.id" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/25">Bicarakan kebutuhan <ArrowUpRight className="h-4 w-4" /></a></div></div></div></div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--sand)] px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1240px] flex-col gap-3 text-xs text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 Passify. Ticketing untuk kawasan yang dijaga.</span><div className="flex gap-5 font-semibold"><a href="#alur" className="hover:text-[var(--forest)]">Cara kerja</a><Link to="/jelajah" className="hover:text-[var(--forest)]">Portal demo</Link><a href="mailto:hello@passify.id" className="hover:text-[var(--forest)]">Kontak</a></div></div></footer>
    </div>
  );
}

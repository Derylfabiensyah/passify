import React from 'react';
import { ShieldCheck, FileText, HelpCircle, CheckCircle2, Lock } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function LegalModal({ isOpen, onClose, type = 'privacy' }) {
  const content = {
    privacy: {
      title: 'Kebijakan Privasi Passify',
      subtitle: 'Perlindungan Data Pengunjung & Pengelola Kawasan',
      icon: ShieldCheck,
      sections: [
        {
          heading: '1. Pengumpulan Data Pengunjung',
          text: 'Passify hanya mengumpulkan data yang diperlukan untuk verifikasi tiket masuk, asuransi keselamatan pengunjung, dan pelaporan kuota daya dukung kawasan (nama, email, nomor kontak, serta data manifest bila dipersyaratkan oleh pengelola kawasan konservasi).'
        },
        {
          heading: '2. Keamanan QR Code & Pembayaran',
          text: 'Seluruh kode QR e-tiket menggunakan dynamic cryptographic token dengan waktu kedaluwarsa berkala untuk mencegah duplikasi dan penipuan. Data pembayaran diproses secara terenkripsi melalui gateway resmi berlisensi Bank Indonesia.'
        },
        {
          heading: '3. Kerahasiaan Data & Non-Eksploitasi',
          text: 'Data pribadi pengunjung dan catatan finansial pengelola tidak akan pernah dijual atau dibagikan ke pihak ketiga untuk keperluan periklanan tanpa persetujuan eksplisit.'
        }
      ]
    },
    terms: {
      title: 'Syarat & Ketentuan Penggunaan',
      subtitle: 'Ketentuan Layanan Platform E-Ticketing Passify',
      icon: FileText,
      sections: [
        {
          heading: '1. Penerbitan & Validitas Tiket',
          text: 'E-tiket yang diterbitkan melalui platform Passify merupakan bukti akses resmi untuk memasuki kawasan wisata alam pada tanggal dan sesi waktu yang telah dipilih oleh pengunjung.'
        },
        {
          heading: '2. Kebijakan Kuota & Daya Dukung Kawasan',
          text: 'Pengelola kawasan berhak membatasi atau menutup sementara sesi masuk demi keselamatan ekosistem, cuaca ekstrem, atau instruksi otoritas konservasi terkait.'
        },
        {
          heading: '3. Validasi Gerbang & Operasional Offline',
          text: 'Petugas gerbang berhak memeriksa keaslian kode QR melalui scanner offline resmi. Tiket yang telah divalidasi tidak dapat digunakan kembali pada sesi berikutnya.'
        }
      ]
    },
    help: {
      title: 'Pusat Bantuan & Dukungan Teknis',
      subtitle: 'Bantuan Operasional Sistem & Pemesanan Tiket',
      icon: HelpCircle,
      sections: [
        {
          heading: '1. Kendala Pembayaran atau E-Tiket',
          text: 'Jika e-tiket belum diterima setelah pembayaran berhasil, Anda dapat memeriksa status pada menu "Tiket Saya" atau memasukkan email yang sama pada halaman Riwayat Pesanan.'
        },
        {
          heading: '2. Bantuan Operasional Gerbang & Petugas',
          text: 'Untuk kendala sinkronisasi data offline manifest atau setup device Android POS lapangan, hubungi PIC teknis pengelola atau email ke support@passify.id.'
        },
        {
          heading: '3. Kontak Resmi Layanan Pelanggan',
          text: 'Email: hello@passify.id / support@passify.id • Jam Operasional: Senin - Minggu (06.00 - 18.00 WIB).'
        }
      ]
    }
  };

  const active = content[type] || content.privacy;
  const Icon = active.icon;

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-start gap-3.5 pb-5 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--leaf-pale)] text-[var(--forest-deep)] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--forest-deep)] font-heading">
              {active.title}
            </h3>
            <p className="text-xs text-[var(--ink-soft)] mt-0.5">
              {active.subtitle}
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="py-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {active.sections.map((sec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--forest-deep)] flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--forest)]" />
                {sec.heading}
              </h4>
              <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
                {sec.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)]">
            <Lock className="w-3.5 h-3.5 text-[var(--forest)]" />
            <span>Passify Trust &amp; Security Shield</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--forest-deep)] text-white text-xs font-bold hover:bg-[var(--forest)] transition-all cursor-pointer"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

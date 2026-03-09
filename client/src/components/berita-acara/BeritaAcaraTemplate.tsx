/**
 * Template Berita Acara resmi (format Pemerintah Provinsi Sumatera Barat).
 * Layout: kop surat, judul, isi (paragraf + poin), penutup, blok tanda tangan.
 */
import { TTESignatureBlock } from '@/components/tte/TTESignatureBlock'
import { formatTempatTanggal } from '@/utils/format-date'
import type { TTESignaturePayload } from '@/lib/types/tte'

export interface BeritaAcaraTemplateProps {
  /** Nama OPD (e.g. "Dinas Koperasi dan UKM") */
  opd: string
  /** Nomor Berita Acara */
  nomorBA?: string
  /** Tanggal verifikasi (untuk "Padang, Bulan Tahun") */
  tanggalVerifikasi?: string
  /** Daftar SOP */
  sopList: Array<{ nomor: string; nama: string }>
  /** Nama Tim Evaluator */
  evaluator?: string
  /** Nama pejabat Biro Organisasi */
  namaBiro?: string
  /** TTE Biro (jika sudah TTD) */
  tteSignaturePayload?: TTESignaturePayload
  /** Nama OPD / pejabat OPD (kolom kiri TTD, opsional) */
  namaKepalaOPD?: string
  /** Tampilkan dalam mode cetak (margin, font) */
  forPrint?: boolean
}

export function BeritaAcaraTemplate({
  opd,
  nomorBA,
  tanggalVerifikasi,
  sopList: _sopList,
  evaluator: _evaluator,
  namaBiro,
  tteSignaturePayload,
  namaKepalaOPD,
  forPrint = false,
}: BeritaAcaraTemplateProps) {
  const dateLine = formatTempatTanggal(tanggalVerifikasi ?? new Date().toISOString().slice(0, 10))
  const wrapperClass = forPrint ? 'bg-white text-black p-8 max-w-[210mm] mx-auto font-serif text-[11pt]' : 'bg-white text-gray-900 p-6 rounded-lg border border-gray-200 font-serif text-sm'

  return (
    <article className={wrapperClass}>
      {/* Kop */}
      <header className="border-b-2 border-black pb-3 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 flex-shrink-0 border-2 border-gray-700 flex items-center justify-center text-[8px] font-bold text-center leading-tight px-0.5">
            SUMATERA BARAT
          </div>
          <div className="flex-1 text-center">
            <p className="text-base font-bold uppercase leading-tight">Pemerintah Provinsi Sumatera Barat</p>
            <p className="text-sm font-bold uppercase leading-tight mt-0.5">Sekretariat Daerah</p>
            <p className="text-[10pt] mt-1 text-gray-700">
              Jalan Jenderal Sudirman No. 51 Telp. 31401-31402-34425 Padang
            </p>
            <p className="text-[10pt] text-gray-600">http://www.sumbarprov.go.id</p>
          </div>
        </div>
      </header>

      {/* Judul */}
      <div className="text-center mb-6">
        <h1 className="text-base font-bold uppercase mb-2">Berita Acara</h1>
        <h2 className="text-sm font-bold uppercase leading-snug mb-1">
          Pelaksanaan Verifikasi dan Evaluasi Standar Operasional Prosedur (SOP) pada {opd} Provinsi Sumatera Barat
        </h2>
        {nomorBA && <p className="text-xs mt-1">Nomor: {nomorBA}</p>}
        <p className="text-xs mt-2">Bertempat di Ruang Rapat Biro Organisasi Lt. III Escape Building</p>
      </div>

      {/* Isi */}
      <div className="text-justify leading-relaxed space-y-3 mb-6">
        <p>
          Dalam rangka pelaksanaan kegiatan Evaluasi Standar Operasional Prosedur (SOP) pada Perangkat Daerah, UPTD, dan Unit Layanan di lingkungan Pemerintah Provinsi Sumatera Barat, Biro Organisasi telah melaksanakan verifikasi dan evaluasi SOP pada sejumlah perangkat daerah.
        </p>
        <p>
          Pelaksanaan evaluasi ini dilakukan oleh Tim Verifikasi dan Evaluasi berdasarkan Keputusan Gubernur Sumatera Barat Nomor 065-277-2025 tentang Pembentukan Tim Evaluasi Penyusunan dan Penerapan Standar Operasional Prosedur pada Organisasi Perangkat Daerah di Lingkungan Pemerintah Provinsi Sumatera Barat.
        </p>
        <p>
          Proses verifikasi dan pemberian saran perbaikan dilaksanakan mengacu pada Pedoman Evaluasi Dokumen SOP sebagaimana diatur dalam Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 35 Tahun 2012 tentang Pedoman Penyusunan Standar Operasional Prosedur Administrasi Pemerintahan, dengan ketentuan sebagai berikut:
        </p>
        <ol className="list-decimal list-inside pl-2 space-y-1 text-justify">
          <li>Mampu mendorong peningkatan kinerja Organisasi dan ASN;</li>
          <li>Mudah dipahami oleh ASN selaku pelaksana;</li>
          <li>Mudah untuk dilaksanakan dalam pekerjaan;</li>
          <li>Semua orang dapat menjalankan perannya masing-masing sesuai uraian tugas;</li>
          <li>Mampu mengatasi masalah permasalahan yang berkaitan dengan proses;</li>
          <li>Mampu menjawab peningkatan kinerja organisasi;</li>
          <li>Sinergi yang maksimal antara semua pelaksana sehingga tidak ada uraian tugas yang tumpang tindih antara satu dengan yang lainnya.</li>
        </ol>
        <p>
          Demikian Berita Acara Pelaksanaan Verifikasi dan Evaluasi Standar Operasional Prosedur (SOP) di Lingkup Pemerintah Provinsi Sumatera Barat ini dibuat, untuk dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* Tempat, tanggal */}
      <div className="text-right mb-12">
        <p className="text-sm">{dateLine}</p>
      </div>

      {/* Blok tanda tangan */}
      <div className="grid grid-cols-2 gap-8">
        <div className="border border-gray-800 p-4 text-center">
          <p className="text-xs font-bold uppercase mb-8">{opd}</p>
          <div className="h-16 mb-2" />
          <p className="text-sm font-bold">{namaKepalaOPD ?? '—'}</p>
        </div>
        <div className="border border-gray-800 p-4 text-center">
          <p className="text-xs font-bold uppercase mb-8">Biro Organisasi</p>
          {tteSignaturePayload ? (
            <TTESignatureBlock
              payload={tteSignaturePayload}
              roleLabel="Biro Organisasi"
              qrSize={64}
            />
          ) : (
            <>
              <div className="h-16 mb-2" />
              <p className="text-sm font-bold">{namaBiro ?? '—'}</p>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

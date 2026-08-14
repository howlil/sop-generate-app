import { Archive, History, ShieldCheck } from 'lucide-react'

const items = [
  {
    title: 'Riwayat perubahan',
    description: 'Aktivitas perubahan dan pengeditan SOP dapat ditelusuri sehingga konteks revisi tidak hilang ketika dokumen berpindah tahap.',
    icon: History,
  },
  {
    title: 'Versi dan status dokumen',
    description: 'Dokumen disimpan dengan konteks versi dan status agar SOP yang berlaku, digantikan, atau dicabut dapat dibedakan dengan jelas.',
    icon: Archive,
  },
  {
    title: 'Validasi publik',
    description: 'Pengunjung dapat membuka arsip SOP berlaku dan menggunakan pemeriksaan PDF yang disediakan sistem tanpa akun internal.',
    icon: ShieldCheck,
  },
]

export function DocumentIntegrity() {
  return (
    <section className="bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">Dokumen yang dapat ditelusuri</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-white sm:text-4xl">Konteks proses tetap melekat pada dokumen.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">Sistem memusatkan riwayat, status, evaluasi, dan arsip. Pengesahan elektronik pada aplikasi merupakan mekanisme internal sesuai implementasi sistem dan tidak diposisikan sebagai layanan sertifikasi eksternal.</p>
          </div>

          <div className="border-y border-white/20 lg:border-l lg:border-y-0">
            {items.map(({ title, description, icon: Icon }) => (
              <div key={title} className="grid gap-4 border-b border-white/15 px-0 py-5 last:border-b-0 lg:grid-cols-[40px_1fr] lg:px-6">
                <Icon className="h-5 w-5 text-blue-300" aria-hidden />
                <div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

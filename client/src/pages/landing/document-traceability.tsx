import { CheckCircle2, FileSearch, ShieldCheck } from 'lucide-react'

const validationRows = [
  ['Nomor dokumen', 'SOP-OPD-2026-014'],
  ['Status arsip', 'Berlaku'],
  ['Validasi PDF', 'Valid'],
]

export function DocumentTraceability() {
  return (
    <section className="border-y border-border bg-surface py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.42fr_0.58fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Arsip publik dan validasi</p>
          <h2 className="mt-4 text-[clamp(2.25rem,4vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-slate-950">
            Arsip dan validasi dokumen dalam satu tempat.
          </h2>
          <p className="mt-5 text-base leading-7 text-secondary-foreground">
            Publik dapat menelusuri SOP yang sudah berlaku, sementara dokumen pengesahan dapat diperiksa melalui halaman validasi PDF tanpa membuka ruang kerja internal.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="border border-border bg-surface-subtle p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <FileSearch className="h-4 w-4" aria-hidden />
              Pencarian arsip
            </div>
            <div className="mt-5 border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-foreground">SOP Pelayanan Administrasi</p>
              <p className="mt-1 text-xs text-muted-foreground">Dinas Kesehatan Provinsi</p>
              <div className="mt-4 flex items-center justify-between border-t border-row-border pt-3">
                <span className="text-xs text-muted-foreground">Status</span>
                <span className="bg-success-subtle px-2.5 py-1 text-[10px] font-semibold text-success">Berlaku</span>
              </div>
            </div>
          </div>

          <div className="border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Hasil validasi
            </div>
            <div className="mt-5 divide-y divide-row-border border-y border-row-border">
              {validationRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-secondary-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
              Satu dokumen. Satu riwayat yang dapat ditelusuri.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

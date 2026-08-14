import { CheckCircle2, FileText, MessageSquareText } from 'lucide-react'

export interface WorkflowStage {
  step: string
  title: string
  description: string
}

interface WorkflowOverviewProps {
  stages: WorkflowStage[]
}

export function WorkflowOverview({ stages }: WorkflowOverviewProps) {
  return (
    <section id="alur" className="scroll-mt-20 bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Alur pengelolaan</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">Satu proses, dari draft hingga SOP berlaku.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-secondary-foreground md:justify-self-end">
            Tahapan mengikuti pekerjaan nyata antarperan. Sistem menyimpan status, catatan, dan riwayat proses sehingga dokumen tidak berpindah sebagai berkas terpisah tanpa konteks.
          </p>
        </div>

        <ol className="mt-10 grid border-y border-border md:grid-cols-4 xl:grid-cols-7">
          {stages.map((stage, index) => (
            <li key={stage.step} className="relative border-b border-border px-4 py-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <div className="flex items-start gap-3 md:block">
                <span className="font-mono text-[10px] font-semibold text-primary">{stage.step}</span>
                <div className="md:mt-4">
                  <h3 className="text-sm font-semibold text-foreground">{stage.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground xl:hidden">{stage.description}</p>
                </div>
              </div>
              {index < stages.length - 1 ? <span className="absolute -right-1 top-8 hidden h-2 w-2 bg-primary xl:block" aria-hidden /> : null}
            </li>
          ))}
        </ol>

        <div className="mt-8 grid overflow-hidden rounded-surface border border-border lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-border p-5 lg:border-b-0 lg:border-r sm:p-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Contoh workspace evaluasi</p>
                <h3 className="mt-2 text-base font-semibold text-foreground">SOP Pelayanan Administrasi</h3>
                <p className="mt-1 text-xs text-muted-foreground">Ilustrasi struktur informasi, bukan data produksi.</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
            </div>

            <div className="mt-6 divide-y divide-row-border border-y border-row-border">
              {[
                ['Kelengkapan dokumen', 'Sesuai'],
                ['Urutan prosedur', 'Perlu perbaikan'],
                ['Kejelasan pelaksana', 'Sesuai'],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm text-secondary-foreground">{label}</span>
                  <span className={status === 'Sesuai' ? 'text-xs font-medium text-success' : 'text-xs font-medium text-warning'}>{status}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 border-l-2 border-warning bg-warning-subtle px-4 py-3">
              <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="text-xs font-medium text-warning-foreground">Catatan evaluator</p>
                <p className="mt-1 text-xs leading-5 text-secondary-foreground">Perbaiki keterkaitan langkah persetujuan dengan pelaksana yang bertanggung jawab.</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Jejak proses</p>
            <div className="mt-5 space-y-5">
              {[
                ['Draft diselesaikan', 'Penyusun'],
                ['Pengajuan dikirim', 'PJ Penyusun'],
                ['Evaluasi dilakukan', 'Evaluator'],
                ['Perbaikan diminta', 'Evaluator'],
              ].map(([event, actor], index) => (
                <div key={event} className="grid grid-cols-[20px_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className={index < 3 ? 'h-4 w-4 text-primary' : 'h-4 w-4 text-warning'} aria-hidden />
                    {index < 3 ? <span className="mt-1 h-full w-px bg-border" aria-hidden /> : null}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium text-foreground">{event}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{actor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

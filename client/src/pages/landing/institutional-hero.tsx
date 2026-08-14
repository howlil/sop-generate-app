import { Link } from '@tanstack/react-router'
import { ArrowRight, Building2, FileCheck2 } from 'lucide-react'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import { APP_DISPLAY_NAME } from '@/config/env'
import { ROUTES } from '@/utils/constants'
import type { WorkflowStage } from './workflow-overview'

interface InstitutionalHeroProps {
  governmentName: string
  officeName: string
  previewStages: WorkflowStage[]
}

export function InstitutionalHero({ governmentName, officeName, previewStages }: InstitutionalHeroProps) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <div className="mb-6 flex items-center gap-3 text-xs text-secondary-foreground">
            <Building2 className="h-4 w-4 text-primary" aria-hidden />
            <span>{governmentName}</span>
            <span className="text-border-strong">/</span>
            <span>{officeName}</span>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sistem Pengelolaan SOP AP</p>
          <h1 className="mt-4 max-w-2xl text-[clamp(2.5rem,5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-foreground">
            Kelola proses SOP dari penyusunan hingga arsip berlaku.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-secondary-foreground">
            {APP_DISPLAY_NAME} menghubungkan penyusunan di OPD, evaluasi oleh Biro Organisasi, tindak lanjut, berita acara, pengesahan, dan arsip dalam satu alur kerja yang terdokumentasi.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Masuk ke sistem
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to={ROUTES.ARSIP.PREFIX}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-control border border-border-strong bg-surface px-5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Lihat arsip SOP
            </Link>
          </div>
        </div>

        <div className="relative min-h-[470px] overflow-hidden rounded-overlay border border-border bg-slate-950 lg:min-h-[520px]">
          <img
            src={heroBg}
            alt="Kantor Gubernur Sumatera Barat"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-slate-950/55" aria-hidden />

          <div className="relative flex h-full min-h-[470px] flex-col justify-end p-4 sm:p-6 lg:min-h-[520px] lg:p-8">
            <div className="mb-4 flex items-center justify-between text-[11px] text-slate-200">
              <span>Pratinjau alur dokumen</span>
              <span className="flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5" /> SOP AP</span>
            </div>

            <div className="border border-white/20 bg-surface p-5 sm:p-6">
              <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Contoh alur pengajuan</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">SOP Pelayanan Administrasi</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Dokumen ilustratif · bukan data langsung</p>
                </div>
                <span className="w-fit rounded-control border border-blue-200 bg-primary-subtle px-2.5 py-1 text-[11px] font-medium text-info-foreground">
                  Dalam evaluasi
                </span>
              </div>

              <div className="mt-5 space-y-0">
                {previewStages.map((stage, index) => (
                  <div key={stage.step} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 border-b border-row-border py-3 last:border-b-0">
                    <span className="font-mono text-[10px] text-muted-foreground">{stage.step}</span>
                    <span className="text-sm font-medium text-secondary-foreground">{stage.title}</span>
                    <span className={index < 2 ? 'text-xs font-medium text-success' : index === 2 ? 'text-xs font-medium text-info' : 'text-xs text-muted-foreground'}>
                      {index < 2 ? 'Selesai' : index === 2 ? 'Aktif' : 'Berikutnya'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Catatan evaluasi</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Terdokumentasi per SOP</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Riwayat proses</p>
                  <p className="mt-1 text-sm font-medium text-foreground">Tersimpan per pengajuan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

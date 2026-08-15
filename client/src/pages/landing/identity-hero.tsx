import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import { LandingProductPreview } from './landing-product-preview'

export interface HeroLifecycleStage {
  step: string
  title: string
}

interface IdentityHeroProps {
  governmentName: string
  officeName: string
  stages: HeroLifecycleStage[]
}

const trustCues = ['Berbasis peran', 'Evaluasi terdokumentasi', 'Arsip dan validasi terpusat']

export function IdentityHero({ governmentName, officeName, stages }: IdentityHeroProps) {
  return (
    <section className="overflow-hidden border-b border-border bg-[#f7f9fc] text-foreground">
      <div className="mx-auto grid min-h-[720px] max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.48fr_0.52fr] lg:items-center lg:px-8 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sistem Pengelolaan SOP Berbasis Web</p>
          <h1 className="mt-5 max-w-3xl text-[clamp(3.1rem,6vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950">
            Kelola SOP dari draft hingga berlaku dalam satu alur kerja.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-foreground sm:text-lg sm:leading-8">
            SOPFlow membantu OPD, penyusun, evaluator, PJ evaluator, dan kepala OPD bekerja dalam satu proses terdokumentasi — dari penyusunan, evaluasi, perbaikan, berita acara, pengesahan, hingga arsip final.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Masuk ke Sistem
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to={ROUTES.ARSIP.PREFIX}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:border-border-strong hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Lihat Arsip SOP
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-secondary-foreground" aria-label="Keunggulan SOPFlow">
            {trustCues.map((cue) => (
              <li key={cue} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                {cue}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-semibold text-foreground">{governmentName}</span>
              <br />
              {officeName}
            </p>
            <p>
              Ruang kerja terstruktur untuk siklus dokumen SOP Administrasi Pemerintahan.
            </p>
          </div>
        </div>

        <LandingProductPreview />
      </div>

      <div className="border-y border-border bg-surface" aria-label="Tahapan pengelolaan SOP">
        <div className="overflow-x-auto">
          <ol className="mx-auto grid min-w-[760px] max-w-7xl grid-cols-7 px-4 sm:px-6 lg:px-8">
            {stages.map((stage, index) => (
              <li key={stage.step} className="relative border-r border-border px-3 py-5 last:border-r-0 sm:px-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-semibold text-primary">{stage.step}</span>
                  <span className={index === 2 ? 'text-xs font-semibold text-foreground' : 'text-xs font-medium text-muted-foreground'}>
                    {stage.title}
                  </span>
                </div>
                {index === 2 ? <span className="absolute inset-x-3 bottom-0 h-0.5 bg-primary sm:inset-x-4" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

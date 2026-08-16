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
    <section
      aria-label={`SOPFlow memandu ${stages.length} tahapan pengelolaan SOP`}
      className="relative overflow-hidden border-b border-border bg-[#f8fbff] text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_62%)]"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
        <div data-testid="landing-hero-copy" className="flex max-w-4xl flex-col items-center text-center">
          <p className="rounded-full border border-blue-100 bg-white/90 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-primary shadow-[0_10px_30px_-24px_rgba(37,99,235,0.65)]">
            Sistem Pengelolaan SOP Berbasis Web
          </p>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-slate-950">
            Kelola SOP dari draft hingga berlaku dalam satu alur kerja.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-secondary-foreground sm:text-lg sm:leading-8">
            SOPFlow membantu OPD, penyusun, evaluator, PJ evaluator, dan kepala OPD bekerja dalam satu proses terdokumentasi — dari penyusunan, evaluasi, perbaikan, berita acara, pengesahan, hingga arsip final.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(29,78,216,0.85)] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Masuk ke Sistem
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to={ROUTES.ARSIP.PREFIX}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white/90 px-5 text-sm font-semibold text-foreground shadow-[0_12px_28px_-24px_rgba(15,23,42,0.45)] transition-colors hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Lihat Arsip SOP
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm text-secondary-foreground" aria-label="Keunggulan SOPFlow">
            {trustCues.map((cue) => (
              <li key={cue} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                {cue}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-xs leading-5 text-muted-foreground">
            <span className="font-semibold text-foreground">{governmentName}</span>
            {' · '}
            {officeName}
          </p>
        </div>

        <div className="mt-14 w-full sm:mt-16">
          <LandingProductPreview />
        </div>
      </div>
    </section>
  )
}

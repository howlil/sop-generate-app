import { Link } from '@tanstack/react-router'
import { ArrowRight, Building2 } from 'lucide-react'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import { ROUTES } from '@/utils/constants'

export interface HeroLifecycleStage {
  step: string
  title: string
}

interface IdentityHeroProps {
  governmentName: string
  officeName: string
  stages: HeroLifecycleStage[]
}

export function IdentityHero({ governmentName, officeName, stages }: IdentityHeroProps) {
  return (
    <section className="overflow-hidden bg-slate-950 text-white">
      <div className="grid min-h-[720px] lg:grid-cols-[0.43fr_0.57fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:py-20">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <Building2 className="h-4 w-4 text-blue-300" aria-hidden />
            <span>{governmentName}</span>
          </div>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            Sistem Pengelolaan SOP AP
          </p>
          <h1 className="mt-5 max-w-xl text-[clamp(3rem,5.8vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            Pengelolaan SOP AP, dari penyusunan hingga berlaku.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Satu alur terdokumentasi untuk penyusunan di OPD, evaluasi {officeName}, perbaikan, berita acara,
            pengesahan internal, dan arsip.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Masuk ke Sistem
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to={ROUTES.ARSIP.PREFIX}
              className="text-sm font-medium text-slate-200 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Lihat Arsip SOP →
            </Link>
          </div>

          <div className="mt-14 border-l border-slate-700 pl-4 text-xs leading-5 text-slate-400">
            <p className="font-medium text-slate-200">Sekretariat Daerah · {officeName}</p>
            <p className="mt-1">Ruang kerja terstruktur untuk siklus dokumen SOP Administrasi Pemerintahan.</p>
          </div>
        </div>

        <figure className="relative min-h-[430px] border-t border-slate-800 lg:min-h-[720px] lg:border-l lg:border-t-0">
          <img
            src={heroBg}
            alt="Kantor Gubernur Sumatera Barat"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-y-0 left-0 hidden w-24 bg-slate-950/35 lg:block" aria-hidden />
          <figcaption className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-6 border-t border-white/20 bg-slate-950/80 px-5 py-4 text-xs text-slate-200 sm:px-7">
            <span>Kantor Gubernur Sumatera Barat</span>
            <span className="hidden uppercase tracking-[0.14em] text-slate-400 sm:block">Identitas institusi</span>
          </figcaption>
        </figure>
      </div>

      <div className="border-y border-slate-800 bg-slate-900" aria-label="Tahapan pengelolaan SOP">
        <div className="overflow-x-auto">
          <ol className="mx-auto grid min-w-[760px] max-w-7xl grid-cols-7 px-4 sm:px-6 lg:px-8">
            {stages.map((stage, index) => (
              <li key={stage.step} className="relative border-r border-slate-800 px-3 py-5 last:border-r-0 sm:px-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-semibold text-blue-300">{stage.step}</span>
                  <span className={index === 2 ? 'text-xs font-semibold text-white' : 'text-xs font-medium text-slate-400'}>
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

import { Link } from '@tanstack/react-router'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import { ROUTES } from '@/utils/constants'

interface InstitutionalClosingProps {
  governmentName: string
  officeName: string
}

export function InstitutionalClosing({ governmentName, officeName }: InstitutionalClosingProps) {
  return (
    <section className="relative min-h-[560px] overflow-hidden bg-slate-950 text-white">
      <img
        src={heroBg}
        alt="Kantor Gubernur Sumatera Barat"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-slate-950/65" aria-hidden />
      <div className="absolute inset-y-0 left-0 w-full bg-slate-950/25 lg:w-1/2" aria-hidden />

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">{governmentName} · {officeName}</p>
        <h2 className="mt-5 max-w-4xl text-[clamp(3rem,5.5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
          Dokumen SOP tidak berhenti di folder.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200">
          Ia disusun, dievaluasi, diperbaiki, disahkan, dan dapat ditelusuri kembali dalam satu alur kerja yang terdokumentasi.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="inline-flex h-11 items-center rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Masuk ke Sistem
          </Link>
          <Link
            to={ROUTES.ARSIP.PREFIX}
            className="text-sm font-medium text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Jelajahi Arsip SOP →
          </Link>
        </div>
      </div>
    </section>
  )
}

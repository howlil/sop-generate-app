import { Archive, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

const trustBullets = ['Akses berbasis peran', 'Evaluasi terdokumentasi', 'Arsip SOP terpusat']
const lifecycle = ['Draft', 'Evaluasi', 'BA', 'Pengesahan', 'Arsip']

export function LoginHero() {
  return (
    <aside className="relative flex h-full min-h-screen overflow-hidden border-r border-border bg-[#f7f9fc] text-foreground">
      <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-control border border-border bg-surface">
            <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-9 w-9" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Pemerintah Provinsi Sumatera Barat · Biro Organisasi</p>
          </div>
        </div>

        <div className="my-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Akses internal SOPFlow</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 xl:text-5xl">
            Masuk ke ruang kerja SOP yang aman dan berbasis peran.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-secondary-foreground">
            Penyusunan, evaluasi, berita acara, pengesahan, dan arsip dikelola dalam satu alur kerja yang terdokumentasi untuk setiap organisasi pengguna.
          </p>

          <div className="mt-8 grid gap-3">
            {trustBullets.map((item) => (
              <div key={item} className="flex items-center gap-3 border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 border border-border bg-surface p-4">
            <div className="flex items-center justify-between border-b border-row-border pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" aria-hidden />
                Alur pengelolaan
              </div>
              <span className="bg-primary-subtle px-2 py-1 text-[10px] font-semibold text-primary">Internal</span>
            </div>
            <ol className="mt-4 grid grid-cols-5 gap-2">
              {lifecycle.map((item, index) => (
                <li key={item} className="border-t border-border pt-2">
                  <span className="font-mono text-[9px] text-primary">0{index + 1}</span>
                  <p className="mt-1 text-[11px] font-medium text-secondary-foreground">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="grid gap-4 border-t border-border pt-5 text-[11px] text-muted-foreground xl:grid-cols-[0.56fr_0.44fr]">
          <figure className="overflow-hidden border border-border bg-surface">
            <img src={heroBg} alt="Kantor Gubernur Sumatera Barat" className="h-24 w-full object-cover opacity-85" />
            <figcaption className="px-3 py-2 text-[10px] font-medium text-muted-foreground">Identitas institusi</figcaption>
          </figure>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
              Akses sesuai peran
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Archive className="h-3.5 w-3.5 text-primary" aria-hidden />
              Arsip terdokumentasi
            </div>
            <p className="leading-5">Gunakan akun yang sudah didaftarkan administrator instansi.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

export function LoginHero() {
  return (
    <aside className="relative flex h-full min-h-screen overflow-hidden border-r border-border bg-[#eef4fb] text-foreground">
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
          <div className="overflow-hidden border border-border bg-surface shadow-sm">
            <div className="relative h-[360px] xl:h-[420px]">
              <img
                src={heroBg}
                alt="Kantor Gubernur Sumatera Barat"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-slate-950/72 p-6 text-white backdrop-blur-[2px]">
                <span className="inline-flex border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85">
                  Akses internal
                </span>
                <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em] xl:text-5xl">
                  Pengelolaan SOP AP dalam satu alur kerja.
                </h1>
              </div>
            </div>
          </div>
        </div>

        <p className="max-w-sm border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
          Masuk dengan akun resmi yang sudah disiapkan oleh administrator instansi.
        </p>
      </div>
    </aside>
  )
}

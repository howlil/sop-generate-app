import { FileText } from 'lucide-react'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

const lifecycle = ['Penyusunan', 'Pengajuan', 'Evaluasi', 'Perbaikan', 'Berita Acara', 'Pengesahan', 'Arsip']

export function LoginHero() {
  return (
    <aside className="relative flex h-full min-h-screen overflow-hidden bg-slate-950 text-white">
      <img
        src={heroBg}
        alt="Kantor Gubernur Sumatera Barat"
        className="absolute inset-x-0 bottom-0 h-[46%] w-full object-cover opacity-20"
      />
      <div className="absolute inset-x-0 bottom-0 h-[46%] bg-slate-950/45" aria-hidden />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
        <div className="flex items-center gap-3">
          <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-white">{APP_DISPLAY_NAME}</p>
            <p className="mt-0.5 text-[11px] text-slate-300">Pemerintah Provinsi Sumatera Barat · Biro Organisasi</p>
          </div>
        </div>

        <div className="my-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Sistem Pengelolaan SOP AP</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] text-white xl:text-5xl">Ruang kerja untuk proses SOP yang terdokumentasi dari awal hingga akhir.</h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">Penyusunan di OPD, evaluasi oleh Biro Organisasi, tindak lanjut, berita acara, pengesahan, dan arsip berada dalam satu alur kerja.</p>

          <div className="mt-9 border-y border-white/20 py-5">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
              <FileText className="h-3.5 w-3.5 text-blue-300" aria-hidden />
              Alur pengelolaan
            </div>
            <div className="grid grid-cols-2 gap-x-7 gap-y-3 xl:grid-cols-3">
              {lifecycle.map((item, index) => (
                <div key={item} className="flex items-center gap-2 border-l border-white/20 pl-3">
                  <span className="font-mono text-[9px] text-blue-300">0{index + 1}</span>
                  <span className="text-xs text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-5 border-t border-white/20 pt-5 text-[11px] text-slate-300">
          <div>
            <p className="font-medium text-white">Sekretariat Daerah</p>
            <p className="mt-1">Pemerintah Provinsi Sumatera Barat</p>
          </div>
          <p className="text-right">Akses internal sesuai peran<br />dan organisasi pengguna.</p>
        </div>
      </div>
    </aside>
  )
}

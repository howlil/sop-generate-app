const TRACE_STAGES = [
  ['Draft', 'Penyusun'],
  ['Revisi', 'OPD'],
  ['Evaluasi', 'Evaluator'],
  ['Berita Acara', 'PJ terkait'],
  ['Pengesahan', 'Kepala OPD'],
  ['Arsip Berlaku', 'Publik / sesuai akses'],
] as const

export function DocumentTraceability() {
  return (
    <section className="bg-slate-950 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_0.28fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Jejak dokumen</p>
            <h2 className="mt-4 max-w-4xl text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1] tracking-[-0.045em]">
              Satu dokumen. Satu riwayat yang dapat ditelusuri.
            </h2>
          </div>
          <p className="text-sm leading-6 text-slate-400 lg:text-right">
            Perubahan, aktor, dan status tetap berada dalam satu konteks lifecycle—bukan tersebar sebagai berkas terpisah tanpa jejak.
          </p>
        </div>

        <div className="mt-16 overflow-x-auto border-y border-slate-700">
          <ol className="grid min-w-[820px] lg:min-w-0 lg:grid-cols-6">
            {TRACE_STAGES.map(([label, actor], index) => (
              <li key={label} className="relative border-r border-slate-800 px-5 py-7 last:border-r-0">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-mono text-[10px] font-semibold text-blue-300">0{index + 1}</span>
                  <span className={index < 3 ? 'h-1.5 w-1.5 bg-blue-400' : 'h-1.5 w-1.5 border border-slate-500'} aria-hidden />
                </div>
                <p className="mt-8 text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-xs text-slate-400">{actor}</p>
                {index < TRACE_STAGES.length - 1 ? <span className="absolute right-0 top-[31px] h-px w-full translate-x-full bg-slate-700" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-9 grid gap-5 border-t border-slate-800 pt-7 sm:grid-cols-5">
          {['Versi dokumen', 'Aktor', 'Status', 'Perubahan', 'Riwayat proses'].map((label, index) => (
            <div key={label} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-blue-300">0{index + 1}</span>
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

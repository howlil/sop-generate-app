import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'

const workflowSteps = ['Draft', 'Evaluasi', 'Berita Acara', 'Arsip']

export function LoginHero() {
  return (
    <aside className="border border-border bg-surface p-5 shadow-sm sm:p-6 lg:min-h-[540px] lg:p-7">
      <div className="flex h-full flex-col justify-between gap-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Akses Internal SOPFlow
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-foreground lg:text-5xl">
            Pengelolaan SOP AP dari evaluasi hingga arsip.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-secondary-foreground">
            Pemerintah Provinsi Sumatera Barat · Biro Organisasi
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="border border-border bg-surface-subtle p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Alur layanan
            </p>
            <div className="mt-4 grid gap-2">
              {workflowSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-3 border border-border bg-surface px-3 py-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center border border-border bg-surface-subtle text-[11px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <figure className="overflow-hidden border border-border bg-surface">
            <img
              src={heroBg}
              alt="Kantor Gubernur Sumatera Barat"
              className="h-52 w-full object-cover lg:h-64"
            />
            <figcaption className="border-t border-border bg-surface px-4 py-3 text-[11px] leading-5 text-muted-foreground">
              Portal kerja internal untuk pengelolaan dokumen SOP AP.
            </figcaption>
          </figure>
        </div>
      </div>
    </aside>
  )
}

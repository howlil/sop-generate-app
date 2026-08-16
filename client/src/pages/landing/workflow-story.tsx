import { WorkflowPreview } from './workflow-previews'

export interface WorkflowChapter {
  number: string
  title: string
  description: string
  preview: 'authoring' | 'evaluation' | 'approval'
}

interface WorkflowStoryProps {
  stages: Array<{ step: string; title: string }>
  chapters: WorkflowChapter[]
}

export function WorkflowStory({ stages, chapters }: WorkflowStoryProps) {
  return (
    <section id="alur" className="scroll-mt-20 bg-[#f8fbff] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Alur kerja SOP</p>
          <h2 className="mt-4 text-[clamp(2.5rem,4.8vw,3.9rem)] font-semibold leading-[1] tracking-[-0.045em] text-slate-950">
            Dari penyusunan sampai arsip final.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-secondary-foreground sm:text-base sm:leading-7">
            Setiap tahap memiliki konteks, status, dan tanggung jawab yang jelas agar proses SOP tidak berhenti di komunikasi manual.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto pb-2">
          <ol className="mx-auto flex min-w-[860px] max-w-6xl items-center" aria-label="Tahapan pengelolaan SOP">
            {stages.map((stage, index) => (
              <li key={stage.step} className="flex flex-1 items-center last:flex-none">
                <div className="flex min-w-[94px] flex-col items-center text-center">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-blue-200 bg-white font-mono text-[10px] font-semibold text-primary shadow-[0_10px_24px_-20px_rgba(37,99,235,0.6)]">
                    {stage.step}
                  </span>
                  <span className="mt-2 text-xs font-medium text-secondary-foreground">{stage.title}</span>
                </div>
                {index < stages.length - 1 ? <span className="mx-2 h-px flex-1 bg-blue-200" aria-hidden /> : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 space-y-20 sm:mt-24 sm:space-y-28">
          {chapters.map((chapter, index) => {
            const reverse = index % 2 === 1
            return (
              <article key={chapter.number} className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className={reverse ? 'lg:order-2' : ''}>
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary-subtle px-3 font-mono text-xs font-semibold text-primary">
                    {chapter.number}
                  </span>
                  <h3 className="mt-5 max-w-xl text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-foreground">
                    {chapter.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-secondary-foreground">{chapter.description}</p>
                </div>
                <div className={reverse ? 'lg:order-1' : ''}>
                  <WorkflowPreview preview={chapter.preview} />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

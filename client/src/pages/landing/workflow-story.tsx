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
    <section id="alur" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.52fr_0.48fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Alur kerja SOP</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2.4rem,4.3vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950">
              Dari penyusunan sampai arsip final.
            </h2>
          </div>
          <p className="text-sm leading-6 text-secondary-foreground lg:text-right">
            Setiap tahap memiliki konteks, status, dan tanggung jawab yang jelas agar proses SOP tidak berhenti di komunikasi manual.
          </p>
        </div>

        <ol className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-6" aria-label="Ringkasan tahapan SOP">
          {stages.slice(0, 6).map((stage) => (
            <li key={stage.step} className="border border-border bg-surface-subtle p-4">
              <span className="font-mono text-[10px] font-semibold text-primary">{stage.step}</span>
              <p className="mt-3 text-sm font-semibold text-foreground">{stage.title}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <article key={chapter.number} className="border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-row-border pb-4">
                <div>
                  <span className="font-mono text-[10px] font-semibold text-primary">{chapter.number}</span>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">{chapter.title}</h3>
                </div>
              </div>
              <p className="mt-4 min-h-24 text-sm leading-6 text-secondary-foreground">{chapter.description}</p>
              <div className="mt-5">
                <WorkflowPreview preview={chapter.preview} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

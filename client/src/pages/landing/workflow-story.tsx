import { cn } from '@/utils/cn'
import { ApprovalArchivePreview, AuthoringPreview, EvaluationPreview } from './workflow-previews'

export interface WorkflowChapter {
  number: '01' | '02' | '03'
  title: 'Penyusunan' | 'Evaluasi & Perbaikan' | 'Pengesahan & Arsip'
  description: string
  preview: 'authoring' | 'evaluation' | 'approval'
}

interface WorkflowStoryProps {
  stages: Array<{ step: string; title: string }>
  chapters: WorkflowChapter[]
}

function LifecycleRail({ stages }: { stages: WorkflowStoryProps['stages'] }) {
  return (
    <div className="mt-12 overflow-x-auto border-y border-border" aria-label="Siklus lengkap SOP">
      <ol className="grid min-w-[760px] grid-cols-7">
        {stages.map((stage) => (
          <li key={stage.step} className="border-r border-border px-4 py-4 last:border-r-0">
            <span className="font-mono text-[10px] font-semibold text-primary">{stage.step}</span>
            <p className="mt-2 text-xs font-medium text-secondary-foreground">{stage.title}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ChapterPreview({ preview }: { preview: WorkflowChapter['preview'] }) {
  if (preview === 'authoring') return <AuthoringPreview />
  if (preview === 'evaluation') return <EvaluationPreview />
  return <ApprovalArchivePreview />
}

function WorkflowChapterBlock({ chapter, reverse }: { chapter: WorkflowChapter; reverse: boolean }) {
  return (
    <article className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className={cn('max-w-xl', reverse && 'lg:order-2 lg:justify-self-end')}>
        <p className="font-mono text-7xl font-semibold tracking-[-0.06em] text-slate-200 sm:text-8xl" aria-hidden>
          {chapter.number}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Tahap utama</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl">{chapter.title}</h3>
        <p className="mt-5 text-base leading-7 text-secondary-foreground">{chapter.description}</p>
      </div>
      <div className={cn(reverse && 'lg:order-1')}>
        <ChapterPreview preview={chapter.preview} />
      </div>
    </article>
  )
}

export function WorkflowStory({ stages, chapters }: WorkflowStoryProps) {
  return (
    <section id="alur" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Alur pengelolaan</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2.5rem,4.6vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
              Satu alur kerja, dari draft hingga arsip berlaku.
            </h2>
          </div>
          <p className="text-sm leading-6 text-secondary-foreground lg:text-right">
            Tujuh status tetap terlihat sebagai satu lifecycle, sementara tiga chapter besar menjelaskan pekerjaan yang benar-benar dilakukan pengguna.
          </p>
        </header>

        <LifecycleRail stages={stages} />

        <div className="mt-20 space-y-24 lg:space-y-32">
          {chapters.map((chapter, index) => (
            <WorkflowChapterBlock key={chapter.number} chapter={chapter} reverse={index === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface PublicRoleProfile {
  name: string
  responsibility: string
  access: string[]
  output: string
}

interface RoleOverviewProps {
  roles: PublicRoleProfile[]
}

export function RoleOverview({ roles }: RoleOverviewProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeRole = roles[activeIndex]

  return (
    <section id="peran" className="scroll-mt-20 border-y border-border bg-surface-subtle py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Peran dan tanggung jawab</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">Satu sistem, konteks kerja berbeda untuk setiap peran.</h2>
          <p className="mt-4 text-sm leading-6 text-secondary-foreground">Akses mengikuti tugas dan OPD pengguna. Landing hanya memperlihatkan struktur kerja; hak akses tetap ditentukan oleh sistem setelah login.</p>
        </div>

        <div className="mt-9 grid overflow-hidden rounded-surface border border-border bg-surface lg:grid-cols-[260px_1fr]">
          <div className="border-b border-border bg-surface-subtle p-2 lg:border-b-0 lg:border-r">
            <div className="flex gap-1 overflow-x-auto lg:flex-col" role="tablist" aria-label="Peran pengguna">
              {roles.map((role, index) => (
                <button
                  key={role.name}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'flex min-h-10 shrink-0 items-center justify-between gap-3 rounded-control border-l-2 px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:w-full',
                    activeIndex === index
                      ? 'border-primary bg-primary-subtle text-info-foreground'
                      : 'border-transparent text-secondary-foreground hover:bg-surface-muted hover:text-foreground',
                  )}
                >
                  <span>{role.name}</span>
                  <ChevronRight className="hidden h-3.5 w-3.5 lg:block" aria-hidden />
                </button>
              ))}
            </div>
          </div>

          <div role="tabpanel" className="p-5 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">{activeRole.name}</p>
                <h3 className="mt-3 text-xl font-semibold text-foreground">Tanggung jawab</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-secondary-foreground">{activeRole.responsibility}</p>

                <div className="mt-7">
                  <p className="text-xs font-semibold text-foreground">Akses utama</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {activeRole.access.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-secondary-foreground">
                        <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Hasil kerja</p>
                <p className="mt-3 text-sm leading-6 text-secondary-foreground">{activeRole.output}</p>

                <div className="mt-6 border border-border">
                  <div className="border-b border-border bg-table-header-bg px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-table-header-text">Workspace</div>
                  <div className="divide-y divide-row-border">
                    {activeRole.access.slice(0, 3).map((item, index) => (
                      <div key={item} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 px-4 py-3">
                        <span className="font-mono text-[10px] text-muted-foreground">0{index + 1}</span>
                        <span className="text-xs font-medium text-secondary-foreground">{item}</span>
                        <span className="h-1.5 w-1.5 bg-primary" aria-hidden />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { cn } from '@/utils/cn'
import { RoleWorkspacePreview } from './role-workspace-previews'

export type LandingRoleId = 'penyusun' | 'pj-penyusun' | 'evaluator' | 'pj-evaluator' | 'kepala-opd'

export interface LandingRoleProfile {
  id: LandingRoleId
  label: string
  responsibility: string
  output: string
}

interface RoleWorkspaceShowcaseProps {
  roles: LandingRoleProfile[]
}

export function RoleWorkspaceShowcase({ roles }: RoleWorkspaceShowcaseProps) {
  const [activeRoleId, setActiveRoleId] = useState<LandingRoleId>(roles[0].id)
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0]

  return (
    <section id="peran" className="scroll-mt-20 border-y border-border bg-[#f7f9fc] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.68fr_0.32fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Ruang kerja berbasis peran</p>
            <h2 className="mt-4 max-w-3xl text-[clamp(2.5rem,4.6vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950">
              Satu sistem. Lima konteks kerja.
            </h2>
          </div>
          <p className="text-sm leading-6 text-secondary-foreground lg:text-right">
            Setiap pengguna melihat pekerjaan yang relevan dengan kewenangannya tanpa memecah lifecycle SOP menjadi aplikasi yang berbeda.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto border-b border-border" role="tablist" aria-label="Peran pengguna">
          <div className="flex min-w-max">
            {roles.map((role) => (
              <button
                key={role.id}
                id={`role-tab-${role.id}`}
                type="button"
                role="tab"
                aria-selected={activeRoleId === role.id}
                aria-controls="role-workspace-panel"
                onClick={() => setActiveRoleId(role.id)}
                className={cn(
                  'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                  activeRoleId === role.id
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div
          id="role-workspace-panel"
          role="tabpanel"
          aria-labelledby={`role-tab-${activeRoleId}`}
          className="mt-8 grid gap-8 border border-border bg-surface p-5 shadow-sm sm:p-8 lg:grid-cols-[0.32fr_0.68fr] lg:gap-10"
        >
          <div className="lg:py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{activeRole.label}</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em] text-foreground">Konteks kerja</h3>
            <p className="mt-4 text-base leading-7 text-secondary-foreground">{activeRole.responsibility}</p>
            <div className="mt-7 border-t border-border pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Hasil utama</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{activeRole.output}</p>
            </div>
          </div>
          <div key={activeRoleId} className="transition-opacity duration-200 motion-reduce:transition-none">
            <RoleWorkspacePreview roleId={activeRoleId} />
          </div>
        </div>
      </div>
    </section>
  )
}

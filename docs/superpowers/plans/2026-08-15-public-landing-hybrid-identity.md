# Public Landing Hybrid Identity-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public SOPFlow landing page into an identity-first civic-tech experience with dominant institutional photography, editorial workflow storytelling, role-based product previews, and a memorable traceability section without changing auth, routes, backend behavior, or SOP business rules.

**Architecture:** Keep `LandingPage.tsx` as the composition/data owner and replace the current dashboard-like landing sections with focused presentation components under `client/src/pages/landing/`. Product previews remain static illustrative React markup grounded in real SOPFlow roles and lifecycle terms; no API calls or backend changes are introduced. The existing semantic design tokens remain the source of truth, while the public page is allowed a larger display scale and larger solid navy/blue fields than the internal dashboard.

**Tech Stack:** React 19, TypeScript 5.7, TanStack Router, Tailwind CSS 4, Vitest 3, Testing Library, Lucide React, existing SOPFlow design tokens/assets.

## Global Constraints

- Scope is the public landing page only.
- Do not change authentication behavior, backend APIs, role permissions, public archive route, PDF validation route, login route, SOP workflow business rules, or internal approval semantics.
- Preserve the exact seven-stage lifecycle: `Penyusunan → Pengajuan → Evaluasi → Perbaikan → Berita Acara → Pengesahan → Arsip`.
- Preserve the five authenticated role concepts: `Penyusun`, `PJ Penyusun`, `Evaluator`, `PJ Evaluator Organisasi`, `Kepala OPD`.
- The hero is identity-first: approximately 40–45% deep navy editorial content and 55–60% dominant Kantor Gubernur photography on large desktop.
- Public landing palette: roughly 55–60% white/warm-neutral, 25–30% deep navy, 10–15% primary blue/blue-tinted surfaces; semantic green/orange/red only for meaningful states.
- No glassmorphism, blur blobs, glow orbs, decorative gradient meshes, rainbow role colors, large soft shadows as hierarchy, `rounded-3xl`, fake statistics, fictional certifications, decorative floating cards, looping float/bounce animation, or giant traditional-pattern wallpaper.
- Do not claim BSrE or Komdigi certification and do not imply that internal approval is an externally certified signature service.
- Use at most two practical radius levels consistent with the existing design system.
- Keep institutional photography visible on mobile; do not remove it entirely.
- Respect `prefers-reduced-motion`; no content may depend solely on animation or color.
- Optimize below-the-fold media and avoid video backgrounds or new heavy animation dependencies.
- Do not add a new dependency unless a concrete implementation blocker exists; the planned implementation needs none.

---

## File Structure

### Create

- `client/src/pages/__tests__/public-landing-hybrid-design-contract.test.ts` — source-level regression contract for the approved landing direction.
- `client/src/pages/landing/identity-hero.tsx` — institutional identity-first hero and lifecycle proof strip.
- `client/src/pages/landing/public-service-gateway.tsx` — asymmetric Arsip SOP / Validasi PDF public entry section.
- `client/src/pages/landing/workflow-story.tsx` — three-chapter editorial workflow layout.
- `client/src/pages/landing/workflow-previews.tsx` — small domain-specific preview components for authoring, evaluation, approval/archive.
- `client/src/pages/landing/role-workspace-showcase.tsx` — five-role selector and large role-aware workspace canvas.
- `client/src/pages/landing/role-workspace-previews.tsx` — grounded role preview surfaces used by the showcase.
- `client/src/pages/landing/document-traceability.tsx` — full-dark lifecycle/traceability signature section.
- `client/src/pages/landing/institutional-closing.tsx` — large closing photograph, statement, and CTAs.

### Modify

- `client/src/pages/LandingPage.tsx` — keep domain copy/data, group workflow chapters, compose the new section sequence.
- `client/src/pages/landing/public-header.tsx` — visually integrate with the new identity-first hero while keeping formal public navigation.
- `client/src/pages/landing/public-footer.tsx` — reduce to a formal low-noise footer after the new closing section.
- `client/src/pages/__tests__/public-auth-design-contract.test.ts` — retain login contracts and remove landing assertions superseded by the new dedicated landing contract.

### Delete after replacements are wired and tests are green

- `client/src/pages/landing/institutional-hero.tsx`
- `client/src/pages/landing/public-utilities.tsx`
- `client/src/pages/landing/workflow-overview.tsx`
- `client/src/pages/landing/role-overview.tsx`
- `client/src/pages/landing/document-integrity.tsx`

---

### Task 1: Lock the New Landing Contract Before Visual Changes

**Files:**
- Create: `client/src/pages/__tests__/public-landing-hybrid-design-contract.test.ts`
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes: current `LandingPage.tsx` and current landing component source files.
- Produces: a failing RED contract that names the new component boundaries and approved copy/visual constraints.

- [ ] **Step 1: Write the failing hybrid landing contract**

Create the new test with explicit source reads:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const landingSource = readSource('../LandingPage.tsx')
const heroSource = readSource('../landing/identity-hero.tsx')
const gatewaySource = readSource('../landing/public-service-gateway.tsx')
const workflowSource = readSource('../landing/workflow-story.tsx')
const roleSource = readSource('../landing/role-workspace-showcase.tsx')
const traceabilitySource = readSource('../landing/document-traceability.tsx')
const closingSource = readSource('../landing/institutional-closing.tsx')

const allSources = [
  landingSource,
  heroSource,
  gatewaySource,
  workflowSource,
  roleSource,
  traceabilitySource,
  closingSource,
].join('\n')

describe('hybrid identity-first public landing contract', () => {
  it('keeps the official identity and complete SOP lifecycle', () => {
    expect(landingSource).toContain('Pemerintah Provinsi Sumatera Barat')
    expect(landingSource).toContain('Biro Organisasi')

    for (const stage of [
      'Penyusunan',
      'Pengajuan',
      'Evaluasi',
      'Perbaikan',
      'Berita Acara',
      'Pengesahan',
      'Arsip',
    ]) {
      expect(landingSource).toContain(stage)
    }
  })

  it('uses the approved identity-first composition', () => {
    expect(heroSource).toContain('Kantor_Gubernur_Sumbar_belakang.jpg')
    expect(heroSource).toContain('Pengelolaan SOP AP, dari penyusunan hingga berlaku.')
    expect(heroSource).toContain('bg-slate-950')
    expect(heroSource).not.toContain('opacity-30')
    expect(gatewaySource).toContain('Arsip SOP')
    expect(gatewaySource).toContain('Validasi PDF')
    expect(workflowSource).toContain('Evaluasi & Perbaikan')
    expect(workflowSource).toContain('Pengesahan & Arsip')
    expect(roleSource).toContain('Satu sistem. Lima konteks kerja.')
    expect(traceabilitySource).toContain('Satu dokumen. Satu riwayat yang dapat ditelusuri.')
    expect(closingSource).toContain('Dokumen SOP tidak berhenti di folder.')
  })

  it('does not regress to decorative AI-SaaS styling or inaccurate signing claims', () => {
    for (const banned of [
      'bg-gradient',
      'blur-3xl',
      'shadow-xl',
      'rounded-3xl',
      'TTE BSRE',
      'TTE BSrE',
      'Komdigi certified',
    ]) {
      expect(allSources).not.toContain(banned)
    }
  })
})
```

- [ ] **Step 2: Narrow the old public/auth contract to login-only responsibilities**

Keep the existing `readSource` helper and login assertions, but delete the two landing-specific `it(...)` blocks so the new file is the single owner of landing visual contracts. The remaining test file must still assert institutional login copy, no gradient/blur, no BSrE claim, and functional-only form icons.

- [ ] **Step 3: Run the new test and verify RED**

Run:

```bash
cd client
pnpm test -- src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: FAIL because the new component files do not exist yet. This is the deliberate RED state.

- [ ] **Step 4: Commit the RED contract**

```bash
git add client/src/pages/__tests__/public-landing-hybrid-design-contract.test.ts client/src/pages/__tests__/public-auth-design-contract.test.ts
git commit -m "test(client): define hybrid landing design contract"
```

---

### Task 2: Build the Identity-First Hero and Integrate the Header

**Files:**
- Create: `client/src/pages/landing/identity-hero.tsx`
- Modify: `client/src/pages/landing/public-header.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: `governmentName: string`, `officeName: string`, and compact lifecycle data from `LandingPage.tsx`.
- Produces: `IdentityHero` with props below, while routes remain sourced from existing `ROUTES` constants.

```ts
export interface HeroLifecycleStage {
  step: string
  title: string
}

interface IdentityHeroProps {
  governmentName: string
  officeName: string
  stages: HeroLifecycleStage[]
}
```

- [ ] **Step 1: Add the new hero implementation**

Implement `IdentityHero` with an outer `bg-slate-950`, a desktop grid close to `lg:grid-cols-[0.43fr_0.57fr]`, an editorial text field, dominant real building image, and a structural lifecycle strip. Core markup must contain:

```tsx
<section className="overflow-hidden bg-slate-950 text-white">
  <div className="grid min-h-[720px] lg:grid-cols-[0.43fr_0.57fr]">
    <div className="relative z-10 flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
        Sistem Pengelolaan SOP AP
      </p>
      <h1 className="mt-5 max-w-xl text-[clamp(3rem,5.8vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
        Pengelolaan SOP AP, dari penyusunan hingga berlaku.
      </h1>
      <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
        Satu alur terdokumentasi untuk penyusunan di OPD, evaluasi Biro Organisasi, perbaikan, berita acara, pengesahan internal, dan arsip.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-4">
        <Link to={ROUTES.AUTH.LOGIN} className="inline-flex h-11 items-center bg-primary px-5 text-sm font-semibold text-white">
          Masuk ke Sistem
        </Link>
        <Link to={ROUTES.ARSIP.PREFIX} className="text-sm font-medium text-slate-200 hover:text-white">
          Lihat Arsip SOP →
        </Link>
      </div>
    </div>

    <figure className="relative min-h-[420px] lg:min-h-[720px]">
      <img
        src={heroBg}
        alt="Kantor Gubernur Sumatera Barat"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-y-0 left-0 hidden w-24 bg-slate-950/35 lg:block" aria-hidden />
    </figure>
  </div>
</section>
```

Add the lifecycle strip directly at the hero boundary using all seven `stages`; do not render it as a floating shadow card. Use a solid surface, border lines, mono step numbers, and one illustrative active state.

- [ ] **Step 2: Integrate the formal header with the hero**

Keep existing logo/routes but make the header visually compatible with the dark opening composition. Use a compact white header or a dark header with explicit solid background; do not use blur/backdrop-filter. Preserve `Arsip SOP`, `Validasi PDF`, and `Masuk` links.

- [ ] **Step 3: Wire `IdentityHero` in `LandingPage.tsx`**

Replace the `InstitutionalHero` import/render with:

```tsx
<IdentityHero
  governmentName={GOVERNMENT_NAME}
  officeName={OFFICE_NAME}
  stages={WORKFLOW_STAGES.map(({ step, title }) => ({ step, title }))}
/>
```

Keep the existing complete lifecycle data unchanged at this stage.

- [ ] **Step 4: Run targeted checks**

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test -- src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: the contract remains FAIL because later section files are not created; typecheck/lint must PASS for the hero work.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/pages/landing/identity-hero.tsx client/src/pages/landing/public-header.tsx
git commit -m "feat(client): add identity-first public hero"
```

---

### Task 3: Replace Symmetric Utility Cards With an Asymmetric Public Service Gateway

**Files:**
- Create: `client/src/pages/landing/public-service-gateway.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**
- Consumes: existing `ROUTES.ARSIP.PREFIX` and `ROUTES.VALIDASI.PDF`.
- Produces: `PublicServiceGateway` with no props; copy stays inside the component because both routes and public labels are fixed product language.

- [ ] **Step 1: Implement the asymmetric gateway**

Use one editorial archive side and one document-oriented validation side:

```tsx
export function PublicServiceGateway() {
  return (
    <section aria-labelledby="public-services-title" className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden border border-border lg:grid-cols-[0.42fr_0.58fr]">
          <Link to={ROUTES.ARSIP.PREFIX} className="group flex min-h-[360px] flex-col justify-between bg-surface-subtle p-7 sm:p-9">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Layanan publik</p>
              <h2 id="public-services-title" className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-foreground">Arsip SOP</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-secondary-foreground">Cari SOP yang telah tersedia pada arsip publik berdasarkan OPD dan informasi dokumen.</p>
            </div>
            <span className="text-sm font-semibold text-primary">Buka Arsip →</span>
          </Link>

          <Link to={ROUTES.VALIDASI.PDF} className="group relative min-h-[360px] overflow-hidden bg-primary-subtle p-7 sm:p-9">
            <div className="relative z-10 max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Validasi dokumen</p>
              <h3 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-foreground">Validasi PDF</h3>
              <p className="mt-4 text-base leading-7 text-secondary-foreground">Periksa informasi validasi dokumen PDF yang dihasilkan sistem tanpa masuk ke area kerja internal.</p>
            </div>
            <div className="absolute bottom-[-3rem] right-8 h-56 w-44 rotate-[-4deg] border border-blue-200 bg-white" aria-hidden />
            <div className="absolute bottom-[-1rem] right-20 h-56 w-44 rotate-[3deg] border border-blue-300 bg-white" aria-hidden />
            <span className="relative z-10 mt-16 inline-block text-sm font-semibold text-primary">Validasi PDF →</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

The document sheets are geometry, not floating shadow cards: no shadow utilities.

- [ ] **Step 2: Replace `PublicUtilities` in `LandingPage.tsx`**

Use:

```tsx
<PublicServiceGateway />
```

Remove the old `archiveLabel` / `validationLabel` props and import.

- [ ] **Step 3: Verify the public routes remain static**

Run:

```bash
cd client
pnpm typecheck
pnpm test -- src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: test still FAILS only on not-yet-created later sections; gateway assertions PASS.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/pages/landing/public-service-gateway.tsx
git commit -m "feat(client): redesign public service gateway"
```

---

### Task 4: Turn the Seven-Step Grid Into Three Editorial Workflow Chapters

**Files:**
- Create: `client/src/pages/landing/workflow-story.tsx`
- Create: `client/src/pages/landing/workflow-previews.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**

```ts
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
```

- [ ] **Step 1: Build focused workflow preview components**

Create `workflow-previews.tsx` exporting:

```tsx
export function AuthoringPreview() {
  const rows = [['Identitas SOP', 'Lengkap'], ['Pelaksana', '5 peran'], ['Prosedur', '12 langkah'], ['Peraturan', '4 referensi']]
  return <PreviewFrame eyebrow="Workspace penyusunan" title="SOP Pelayanan Administrasi" rows={rows} />
}

export function EvaluationPreview() {
  return (
    <div className="border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Evaluasi</p>
      <div className="mt-5 divide-y divide-row-border border-y border-row-border">
        <EvaluationRow label="Kelengkapan dokumen" status="Sesuai" />
        <EvaluationRow label="Urutan prosedur" status="Perlu perbaikan" />
        <EvaluationRow label="Kejelasan pelaksana" status="Sesuai" />
      </div>
      <div className="mt-5 border-l-2 border-warning bg-warning-subtle px-4 py-3 text-sm text-secondary-foreground">
        Perbaiki keterkaitan langkah persetujuan dengan pelaksana yang bertanggung jawab.
      </div>
    </div>
  )
}

export function ApprovalArchivePreview() {
  const events = ['Evaluasi selesai', 'Berita acara siap', 'Pengesahan internal', 'Arsip berlaku']
  return (
    <div className="border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Penyelesaian dokumen</p>
      <ol className="mt-5 divide-y divide-row-border">
        {events.map((event, index) => (
          <li key={event} className="flex items-center justify-between py-3 text-sm">
            <span>{event}</span>
            <span className={index < 2 ? 'text-success' : 'text-muted-foreground'}>{index < 2 ? 'Selesai' : 'Berikutnya'}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

Implement small local `PreviewFrame` / `EvaluationRow` helpers in the same file; do not export them.

- [ ] **Step 2: Build the alternating `WorkflowStory`**

Use the complete seven-stage compact timeline at the top, then render three chapters with alternating desktop order:

```tsx
<section id="alur" className="scroll-mt-20 bg-surface py-20 sm:py-24">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <header className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Alur pengelolaan</p>
      <h2 className="mt-4 text-[clamp(2.5rem,4.6vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
        Satu alur kerja, dari draft hingga arsip berlaku.
      </h2>
    </header>
    <LifecycleRail stages={stages} />
    <div className="mt-20 space-y-24 lg:space-y-32">
      {chapters.map((chapter, index) => (
        <WorkflowChapterBlock key={chapter.number} chapter={chapter} reverse={index === 1} />
      ))}
    </div>
  </div>
</section>
```

Chapter numbers must be visually large (`text-6xl` through `text-8xl`) but muted enough not to reduce text contrast.

- [ ] **Step 3: Define workflow chapters in `LandingPage.tsx`**

```ts
const WORKFLOW_CHAPTERS: WorkflowChapter[] = [
  {
    number: '01',
    title: 'Penyusunan',
    description: 'OPD menyusun identitas, pelaksana, prosedur, peraturan, dan kelengkapan SOP dalam struktur yang konsisten.',
    preview: 'authoring',
  },
  {
    number: '02',
    title: 'Evaluasi & Perbaikan',
    description: 'Evaluator memberi penilaian dan catatan yang dapat ditindaklanjuti; OPD memperbaiki dokumen tanpa kehilangan konteks revisi.',
    preview: 'evaluation',
  },
  {
    number: '03',
    title: 'Pengesahan & Arsip',
    description: 'Setelah evaluasi dan berita acara selesai, pengesahan internal menutup proses sebelum SOP tersedia sebagai arsip yang berlaku.',
    preview: 'approval',
  },
]
```

Render `<WorkflowStory stages={...} chapters={WORKFLOW_CHAPTERS} />`.

- [ ] **Step 4: Verify**

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test -- src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: workflow assertions PASS; later section assertions may still FAIL.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/pages/landing/workflow-story.tsx client/src/pages/landing/workflow-previews.tsx
git commit -m "feat(client): add editorial SOP workflow story"
```

---

### Task 5: Replace the Settings-Like Role Panel With a Large Workspace Showcase

**Files:**
- Create: `client/src/pages/landing/role-workspace-showcase.tsx`
- Create: `client/src/pages/landing/role-workspace-previews.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**

```ts
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
```

- [ ] **Step 1: Implement grounded role preview surfaces**

Export `RoleWorkspacePreview({ roleId }: { roleId: LandingRoleId })`. Use a local `switch` to choose one of five focused preview compositions. Each composition must use real domain language:

```tsx
switch (roleId) {
  case 'penyusun':
    return <AuthoringWorkspace />
  case 'pj-penyusun':
    return <SubmissionWorkspace />
  case 'evaluator':
    return <EvaluatorWorkspace />
  case 'pj-evaluator':
    return <CoordinationWorkspace />
  case 'kepala-opd':
    return <ApprovalWorkspace />
}
```

Required visible concepts by role:

```ts
const ROLE_PREVIEW_COPY = {
  penyusun: ['Draft SOP', 'Pelaksana', 'Prosedur', 'Riwayat revisi'],
  'pj-penyusun': ['Pengajuan evaluasi', 'SOP dalam paket', 'Tindak lanjut'],
  evaluator: ['Rubrik penilaian', 'Catatan evaluator', 'Perlu perbaikan'],
  'pj-evaluator': ['Pengajuan lintas OPD', 'Tim evaluator', 'Berita acara'],
  'kepala-opd': ['Evaluasi selesai', 'Pengesahan internal', 'Arsip OPD'],
} as const
```

Do not render fake counts such as `128 SOP`, completion percentages, or fabricated timestamps.

- [ ] **Step 2: Implement the role selector and accessible panel**

```tsx
export function RoleWorkspaceShowcase({ roles }: RoleWorkspaceShowcaseProps) {
  const [activeRoleId, setActiveRoleId] = useState<LandingRoleId>(roles[0].id)
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0]

  return (
    <section id="peran" className="scroll-mt-20 border-y border-border bg-surface-subtle py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="max-w-3xl text-[clamp(2.5rem,4.6vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground">
          Satu sistem. Lima konteks kerja.
        </h2>
        <div className="mt-10 flex overflow-x-auto border-b border-border" role="tablist" aria-label="Peran pengguna">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={activeRoleId === role.id}
              aria-controls="role-workspace-panel"
              onClick={() => setActiveRoleId(role.id)}
              className={cn(
                'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                activeRoleId === role.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {role.label}
            </button>
          ))}
        </div>
        <div id="role-workspace-panel" role="tabpanel" className="mt-8 grid gap-8 border border-border bg-surface p-5 sm:p-8 lg:grid-cols-[0.32fr_0.68fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{activeRole.label}</p>
            <p className="mt-4 text-base leading-7 text-secondary-foreground">{activeRole.responsibility}</p>
            <p className="mt-6 text-sm font-medium text-foreground">{activeRole.output}</p>
          </div>
          <div className="transition-opacity duration-200 motion-reduce:transition-none">
            <RoleWorkspacePreview roleId={activeRoleId} />
          </div>
        </div>
      </div>
    </section>
  )
}
```

Do not use role-specific colors; only primary/neutral/semantic status colors.

- [ ] **Step 3: Replace current role data in `LandingPage.tsx`**

Convert the five role entries to `LandingRoleProfile` objects with stable IDs and the existing grounded responsibilities/outputs. Render:

```tsx
<RoleWorkspaceShowcase roles={ROLE_PROFILES} />
```

- [ ] **Step 4: Verify interaction semantics and types**

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test -- src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: role showcase contract PASS; remaining traceability/closing contract may still FAIL.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/pages/landing/role-workspace-showcase.tsx client/src/pages/landing/role-workspace-previews.tsx
git commit -m "feat(client): showcase role-based SOP workspaces"
```

---

### Task 6: Add the Dark Traceability Signature Section and Institutional Closing

**Files:**
- Create: `client/src/pages/landing/document-traceability.tsx`
- Create: `client/src/pages/landing/institutional-closing.tsx`
- Modify: `client/src/pages/landing/public-footer.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Interfaces:**
- `DocumentTraceability` takes no props; its illustrative lifecycle is fixed product language.
- `InstitutionalClosing` consumes `governmentName` and `officeName` for accessible image/copy context.

- [ ] **Step 1: Implement the full-dark traceability section**

Use a full-width solid navy field and a real lifecycle line:

```tsx
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
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">Jejak dokumen</p>
        <h2 className="mt-4 max-w-4xl text-[clamp(2.75rem,5vw,4.5rem)] font-semibold leading-[1] tracking-[-0.045em]">
          Satu dokumen. Satu riwayat yang dapat ditelusuri.
        </h2>
        <ol className="mt-14 grid border-y border-slate-700 lg:grid-cols-6">
          {TRACE_STAGES.map(([label, actor], index) => (
            <li key={label} className="relative border-b border-slate-800 px-4 py-6 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
              <span className="font-mono text-[10px] text-blue-300">0{index + 1}</span>
              <p className="mt-5 text-sm font-semibold text-white">{label}</p>
              <p className="mt-1 text-xs text-slate-400">{actor}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs text-slate-400">
          <span>Versi dokumen</span><span>Aktor</span><span>Status</span><span>Perubahan</span><span>Riwayat proses</span>
        </div>
      </div>
    </section>
  )
}
```

Do not include fake timestamps, percentages, or external certification language.

- [ ] **Step 2: Implement the closing image section**

Use the same controlled building asset at full visual strength with a local dark overlay for contrast:

```tsx
export function InstitutionalClosing({ governmentName, officeName }: InstitutionalClosingProps) {
  return (
    <section className="relative min-h-[560px] overflow-hidden bg-slate-950 text-white">
      <img src={heroBg} alt="Kantor Gubernur Sumatera Barat" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-slate-950/65" aria-hidden />
      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">{governmentName} · {officeName}</p>
        <h2 className="mt-5 max-w-4xl text-[clamp(3rem,5.5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.05em]">
          Dokumen SOP tidak berhenti di folder.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200">Ia disusun, dievaluasi, diperbaiki, disahkan, dan dapat ditelusuri kembali.</p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link to={ROUTES.AUTH.LOGIN} className="inline-flex h-11 items-center bg-primary px-5 text-sm font-semibold text-white">Masuk ke Sistem</Link>
          <Link to={ROUTES.ARSIP.PREFIX} className="text-sm font-medium text-white">Jelajahi Arsip SOP →</Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Simplify the footer and wire final section order**

`LandingPage.tsx` main sequence must become exactly:

```tsx
<IdentityHero ... />
<PublicServiceGateway />
<WorkflowStory ... />
<RoleWorkspaceShowcase roles={ROLE_PROFILES} />
<DocumentTraceability />
<InstitutionalClosing governmentName={GOVERNMENT_NAME} officeName={OFFICE_NAME} />
```

Then render `<PublicFooter ... />` outside `main`. Remove the old institutional identity strip because identity is now strongly expressed in hero/closing and the strip would restore repetitive rhythm.

The footer should contain only formal identity plus public navigation; no large CTA band because the closing section now owns that job.

- [ ] **Step 4: Run the contract to reach GREEN**

```bash
cd client
pnpm test -- src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
pnpm test -- src/pages/__tests__/public-auth-design-contract.test.ts
```

Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/pages/landing/document-traceability.tsx client/src/pages/landing/institutional-closing.tsx client/src/pages/landing/public-footer.tsx
git commit -m "feat(client): add traceability and institutional closing"
```

---

### Task 7: Remove Superseded Landing Components and Harden Responsive/Accessibility Behavior

**Files:**
- Delete: `client/src/pages/landing/institutional-hero.tsx`
- Delete: `client/src/pages/landing/public-utilities.tsx`
- Delete: `client/src/pages/landing/workflow-overview.tsx`
- Delete: `client/src/pages/landing/role-overview.tsx`
- Delete: `client/src/pages/landing/document-integrity.tsx`
- Modify as needed: all new landing components from Tasks 2–6

**Interfaces:**
- Consumes: completed new landing composition.
- Produces: no stale imports, no horizontal page overflow, keyboard-operable tabs, reduced-motion-safe transitions, and responsive photo/product layouts.

- [ ] **Step 1: Delete superseded component files**

```bash
git rm client/src/pages/landing/institutional-hero.tsx \
  client/src/pages/landing/public-utilities.tsx \
  client/src/pages/landing/workflow-overview.tsx \
  client/src/pages/landing/role-overview.tsx \
  client/src/pages/landing/document-integrity.tsx
```

- [ ] **Step 2: Search for stale imports and banned visual patterns**

Run:

```bash
rg "InstitutionalHero|PublicUtilities|WorkflowOverview|RoleOverview|DocumentIntegrity|bg-gradient|blur-3xl|rounded-3xl|shadow-xl|TTE BSRE|TTE BSrE" client/src/pages/LandingPage.tsx client/src/pages/landing client/src/pages/__tests__
```

Expected: no stale component references and no banned style/certification strings in landing sources. Test files may contain banned strings only inside `not.toContain(...)` assertions.

- [ ] **Step 3: Apply explicit responsive rules**

Ensure the implementation contains these concrete behaviors:

```tsx
// Hero: stacked on small screens, identity text first, photo retained.
<div className="grid min-h-[720px] lg:grid-cols-[0.43fr_0.57fr]">...</div>

// Lifecycle/role navigation: no page overflow; local horizontal scrolling is allowed.
<div className="overflow-x-auto">...</div>

// Workflow chapters: single-column mobile, alternating only at lg.
<div className="grid gap-10 lg:grid-cols-2 lg:items-center">...</div>

// Motion: disable transition for reduced motion.
<div className="transition-opacity duration-200 motion-reduce:transition-none">...</div>
```

Do not set `overflow-x-hidden` as a band-aid for a broken child layout; fix child sizing and use local `overflow-x-auto` only where the spec permits.

- [ ] **Step 4: Verify keyboard and semantic structure in source/tests**

The role selector must retain `role="tablist"`, each selector `role="tab"`, `aria-selected`, `aria-controls`, and the canvas `role="tabpanel"`. Institutional photos use meaningful alt text; decorative sheet/line geometry uses `aria-hidden`.

Add these assertions to the dedicated landing contract:

```ts
expect(roleSource).toContain('role="tablist"')
expect(roleSource).toContain('role="tab"')
expect(roleSource).toContain('aria-selected')
expect(roleSource).toContain('role="tabpanel"')
expect(roleSource).toContain('motion-reduce:transition-none')
expect(heroSource).toContain('alt="Kantor Gubernur Sumatera Barat"')
expect(closingSource).toContain('loading="lazy"')
```

- [ ] **Step 5: Run client quality gates**

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e:audit
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 6: Commit cleanup/hardening**

```bash
git add -A client/src/pages client/src/pages/landing
git commit -m "refactor(client): harden responsive public landing"
```

---

### Task 8: Final Verification, PR, and Merge Gate

**Files:**
- Verify all files changed in Tasks 1–7.
- No implementation changes unless a verification failure identifies a concrete defect.

**Interfaces:**
- Produces: a reviewable PR with clean CI evidence and no behavior regression.

- [ ] **Step 1: Review the final diff for scope**

```bash
git diff main...HEAD -- client/src/pages client/src/pages/landing docs/superpowers
```

Expected: public landing presentation/tests/docs only. `client/src/pages/login/**`, server code, Prisma, route definitions, auth services, and backend APIs must be unchanged.

- [ ] **Step 2: Run the complete local client verification again from a clean state**

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e:audit
pnpm build
```

Expected: PASS with fresh output.

- [ ] **Step 3: Open one PR from the same working branch**

Use one branch for the entire redesign; do not create follow-up branches for test fixes or formatting. Suggested PR title:

```text
refactor(client): elevate public landing visual identity
```

Suggested PR summary:

```markdown
## Summary
- make Kantor Gubernur photography the primary institutional hero identity
- replace repetitive card/grid sections with asymmetric public services and editorial workflow storytelling
- show role-specific SOP workspaces and document traceability without fake metrics or certification claims
- preserve routes, auth behavior, backend behavior, and SOP business rules

## Verification
- client typecheck
- client lint
- client unit tests
- E2E journey audit
- client production build
```

- [ ] **Step 4: Require full repository CI before merge**

Do not merge while any required job is running, skipped unexpectedly, cancelled, or failed. Confirm the PR head SHA has not moved, then require the repository CI run for that exact head to finish with `conclusion: success`, including critical E2E and any container/build gates configured by the repository.

- [ ] **Step 5: Squash merge only after the green gate**

Use squash merge so `main` receives one clean commit for this redesign. Expected final commit title:

```text
refactor(client): elevate public landing visual identity
```

After merge, verify the PR reports `merged: true` and that the returned merge commit SHA exists on `main`.

---

## Plan Self-Review

### Spec coverage

- Identity-first 40–45 / 55–60 hero: Task 2.
- Dominant Kantor Gubernur photography: Tasks 2 and 6.
- Asymmetric public services: Task 3.
- Full seven-stage lifecycle plus three editorial workflow chapters: Task 4.
- Five role contexts with product-oriented canvases: Task 5.
- Full-dark traceability signature section: Task 6.
- Institutional closing image + two CTAs: Task 6.
- Formal low-noise footer: Task 6.
- Regional identity without decorative wallpaper: hero/photography/structural geometry in Tasks 2 and 6; no extra motif dependency.
- Anti-AI-slop / no false certification / no fake metrics: Global Constraints plus Tasks 1, 5, 6, 7.
- Responsive/mobile retention of photography: Task 7.
- Accessibility and reduced motion: Tasks 5 and 7.
- Performance/no heavy animation library: Global Constraints and lazy loading in Task 6.
- No login/backend/auth/business-rule changes: Global Constraints and Task 8 scope review.

### Placeholder scan

The plan contains no `TBD`, `TODO`, “implement later”, or unspecified error-handling steps. All component interfaces, copy requirements, commands, and quality gates required for implementation are named explicitly.

### Type consistency

- `HeroLifecycleStage` is produced by `LandingPage.tsx` and consumed only by `IdentityHero`.
- `WorkflowChapter` is defined by `workflow-story.tsx` and used by `LandingPage.tsx` with the exact `preview` union.
- `LandingRoleId` / `LandingRoleProfile` are owned by the role showcase and reused by the role preview module and `LandingPage.tsx`.
- No task introduces a new backend/API type or route.

# Landing + Login Institutional SaaS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign SOPFlow public landing and login into a clean institutional SaaS surface that is product-first, government-credible, and free of overdecorated AI-template styling.

**Architecture:** Keep the current React/Tailwind route structure and replace only presentational landing/login components. The landing hero becomes a light product-first composition with a local product preview component; login keeps existing auth behavior while changing the surrounding trust panel and form-card presentation.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Router, Tailwind CSS utility classes, Vitest source-contract tests, existing local image and logo assets.

## Global Constraints

- Frontend/UI-only.
- No backend/API/DTO/Prisma changes.
- No authentication behavior changes.
- No route or permission changes.
- No new external assets or libraries.
- No change to actual PDF validation, archive fetching, or SOP workflow logic.
- No broad design-system refactor beyond what the touched landing/login components need.
- Preserve existing login submit payload: `{ email, kataSandi: password }`.
- Preserve existing show/hide password control and field validation behavior.
- Avoid `bg-gradient`, `blur-3xl`, `shadow-xl`, and `rounded-3xl` in touched landing/login components.
- Do not add claims about BSrE/Komdigi certification.

---

## File Structure

- Modify: `client/src/pages/__tests__/public-landing-hybrid-design-contract.test.ts`
  - Update the landing design contract away from the previous dark identity-first hero and toward product-first institutional SaaS.
- Modify: `client/src/pages/landing/identity-hero.tsx`
  - Replace the dark full-photo hero with a light hero and embedded product preview.
- Create: `client/src/pages/landing/landing-product-preview.tsx`
  - Owns the product-workbench mockup in the hero. No data fetching; static presentational markup only.
- Modify: `client/src/pages/landing/role-workspace-showcase.tsx`
  - Polish the role section container, tab rhythm, and left/right hierarchy without changing role state behavior.
- Modify: `client/src/pages/landing/role-workspace-previews.tsx`
  - Make role previews feel like real product states instead of wireframe cards.
- Modify: `client/src/pages/landing/workflow-story.tsx`
  - Tighten workflow presentation into a clean timeline/card grid that supports the new SaaS landing rhythm.
- Modify: `client/src/pages/landing/document-traceability.tsx`
  - Reframe archive + validation as a public credibility section.
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`
  - Update login contract for enterprise two-column login with trust bullets and clean card.
- Modify: `client/src/pages/login/LoginPage.tsx`
  - Keep route/auth hook behavior but tune page background and form-card wrapper.
- Modify: `client/src/pages/login/components/LoginHero.tsx`
  - Convert the dark poster panel into a light trust/product panel.
- Modify: `client/src/pages/login/components/LoginForm.tsx`
  - Preserve behavior; adjust copy and card/frame styling only.

---

### Task 1: Update landing design contract

**Files:**
- Modify: `client/src/pages/__tests__/public-landing-hybrid-design-contract.test.ts`

**Interfaces:**
- Consumes: existing file-source contract pattern using `readFileSync` and Vitest.
- Produces: failing contract that later tasks satisfy.

- [ ] **Step 1: Replace the identity-first hero contract with product-first landing expectations**

Replace the current test body with a contract that checks for the new headline, CTAs, product preview labels, restrained visual rules, and public archive/validation presence:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const landingSource = readSource('../LandingPage.tsx')
const heroSource = readSource('../landing/identity-hero.tsx')
const productPreviewSource = readSource('../landing/landing-product-preview.tsx')
const workflowSource = readSource('../landing/workflow-story.tsx')
const roleSource = readSource('../landing/role-workspace-showcase.tsx')
const rolePreviewSource = readSource('../landing/role-workspace-previews.tsx')
const traceabilitySource = readSource('../landing/document-traceability.tsx')

const allSources = [
  landingSource,
  heroSource,
  productPreviewSource,
  workflowSource,
  roleSource,
  rolePreviewSource,
  traceabilitySource,
].join('\n')

describe('institutional SaaS public landing contract', () => {
  it('uses a product-first hero with clear workflow value', () => {
    expect(heroSource).toContain('Kelola SOP dari draft hingga berlaku dalam satu alur kerja.')
    expect(heroSource).toContain('SOPFlow membantu OPD, penyusun, evaluator, PJ evaluator, dan kepala OPD')
    expect(heroSource).toContain('Masuk ke Sistem')
    expect(heroSource).toContain('Lihat Arsip SOP')
    expect(heroSource).toContain('Berbasis peran')
    expect(heroSource).toContain('Evaluasi terdokumentasi')
    expect(heroSource).toContain('Arsip dan validasi terpusat')
  })

  it('keeps government identity as an accent instead of the only hero visual', () => {
    expect(heroSource).toContain('Kantor_Gubernur_Sumbar_belakang.jpg')
    expect(heroSource).toContain('LandingProductPreview')
    expect(productPreviewSource).toContain('Pengajuan Evaluasi')
    expect(productPreviewSource).toContain('Draft')
    expect(productPreviewSource).toContain('Evaluasi')
    expect(productPreviewSource).toContain('Berita Acara')
    expect(productPreviewSource).toContain('Pengesahan')
    expect(productPreviewSource).toContain('Arsip')
    expect(productPreviewSource).toContain('Menunggu TTD PJ Evaluator')
  })

  it('keeps the complete SOP lifecycle and role workspaces visible', () => {
    for (const stage of ['Penyusunan', 'Pengajuan', 'Evaluasi', 'Perbaikan', 'Berita Acara', 'Pengesahan', 'Arsip']) {
      expect(landingSource).toContain(stage)
    }

    for (const role of ['Penyusun', 'PJ Penyusun', 'Evaluator', 'PJ Evaluator Organisasi', 'Kepala OPD']) {
      expect(landingSource).toContain(role)
    }

    expect(roleSource).toContain('role="tablist"')
    expect(roleSource).toContain('role="tab"')
    expect(roleSource).toContain('role="tabpanel"')
    expect(rolePreviewSource).toContain('Catatan evaluasi')
    expect(rolePreviewSource).toContain('Berita Acara')
  })

  it('shows public archive and PDF validation value before login', () => {
    expect(traceabilitySource).toContain('Arsip dan validasi dokumen dalam satu tempat')
    expect(traceabilitySource).toContain('Pencarian arsip')
    expect(traceabilitySource).toContain('Validasi PDF')
    expect(traceabilitySource).toContain('Dokumen valid')
  })

  it('does not regress to dark poster or AI-template decoration', () => {
    expect(heroSource).not.toContain('min-h-[720px] lg:grid-cols-[0.43fr_0.57fr]')
    expect(heroSource).not.toContain('bg-slate-950 text-white')

    for (const banned of ['bg-gradient', 'blur-3xl', 'shadow-xl', 'rounded-3xl', 'TTE BSRE', 'TTE BSrE', 'Komdigi certified']) {
      expect(allSources).not.toContain(banned)
    }
  })
})
```

- [ ] **Step 2: Run the focused landing test and verify it fails**

Run:

```bash
pnpm --dir client test src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: FAIL because `landing-product-preview.tsx` does not exist yet and current hero still contains the old headline/dark layout.

- [ ] **Step 3: Commit the failing test**

```bash
git add client/src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
git commit -m "test(client): require institutional SaaS landing contract"
```

---

### Task 2: Build product-first landing hero

**Files:**
- Create: `client/src/pages/landing/landing-product-preview.tsx`
- Modify: `client/src/pages/landing/identity-hero.tsx`

**Interfaces:**
- Consumes: `HeroLifecycleStage`, `governmentName`, `officeName`, `ROUTES`, existing `heroBg` image.
- Produces: `LandingProductPreview` React component and a light product-first `IdentityHero`.

- [ ] **Step 1: Create `LandingProductPreview`**

Create `client/src/pages/landing/landing-product-preview.tsx`:

```tsx
import { CheckCircle2, FileCheck2, SearchCheck } from 'lucide-react'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'

const lifecycle = ['Draft', 'Evaluasi', 'Berita Acara', 'Pengesahan', 'Arsip']

export function LandingProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Pengajuan Evaluasi</p>
            <h2 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-foreground">Dinas Kesehatan Provinsi</h2>
            <p className="mt-1 text-xs text-muted-foreground">4 SOP · BA siap diproses</p>
          </div>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Dalam evaluasi
          </span>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-2" aria-label="Lifecycle SOP">
          {lifecycle.map((item, index) => (
            <div key={item} className="rounded-lg border border-border bg-surface-subtle px-2 py-2 text-center">
              <p className="font-mono text-[10px] text-muted-foreground">0{index + 1}</p>
              <p className="mt-1 text-[11px] font-medium text-foreground">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <FileCheck2 className="h-4 w-4 text-primary" aria-hidden />
              SOP Pelayanan Administrasi
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Status dokumen</span>
                <span className="font-medium text-blue-700">Menunggu TTD PJ Evaluator</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Penilaian</span>
                <span className="font-medium text-emerald-700">Sesuai</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Arsip</span>
                <span className="font-medium text-slate-700">Siap setelah pengesahan</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Berita Acara
              </div>
              <p className="mt-2 text-xs leading-5 text-blue-800">Catatan evaluasi dan ringkasan hasil tersimpan dalam alur yang sama.</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <SearchCheck className="h-4 w-4 text-primary" aria-hidden />
                Validasi PDF
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Dokumen final dapat dicek melalui halaman validasi.</p>
            </div>
          </div>
        </div>
      </div>

      <figure className="absolute -bottom-8 -right-4 hidden w-44 overflow-hidden rounded-2xl border border-white bg-slate-900 shadow-sm lg:block">
        <img src={heroBg} alt="Kantor Gubernur Sumatera Barat" className="h-28 w-full object-cover" />
        <figcaption className="px-3 py-2 text-[10px] font-medium text-white">Identitas institusi daerah</figcaption>
      </figure>
    </div>
  )
}
```

- [ ] **Step 2: Refactor `IdentityHero` to light product-first layout**

Replace the old dark section with a light surface that imports and renders `LandingProductPreview`:

```tsx
import { Link } from '@tanstack/react-router'
import { ArrowRight, Building2, CheckCircle2 } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import { LandingProductPreview } from './landing-product-preview'

export interface HeroLifecycleStage {
  step: string
  title: string
}

interface IdentityHeroProps {
  governmentName: string
  officeName: string
  stages: HeroLifecycleStage[]
}

const trustCues = ['Berbasis peran', 'Evaluasi terdokumentasi', 'Arsip dan validasi terpusat']

export function IdentityHero({ governmentName, officeName, stages }: IdentityHeroProps) {
  return (
    <section className="overflow-hidden border-b border-border bg-[#f8fafc] text-foreground">
      <div className="mx-auto grid min-h-[680px] max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.52fr_0.48fr] lg:items-center lg:px-8 lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-secondary-foreground">
            <Building2 className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span>{governmentName} · {officeName}</span>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sistem Pengelolaan SOP Berbasis Web</p>
          <h1 className="mt-5 max-w-3xl text-[clamp(3rem,6vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950">
            Kelola SOP dari draft hingga berlaku dalam satu alur kerja.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-secondary-foreground sm:text-lg sm:leading-8">
            SOPFlow membantu OPD, penyusun, evaluator, PJ evaluator, dan kepala OPD bekerja dalam satu proses terdokumentasi — dari penyusunan, evaluasi, perbaikan, berita acara, pengesahan, hingga arsip final.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to={ROUTES.AUTH.LOGIN} className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              Masuk ke Sistem
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to={ROUTES.ARSIP.PREFIX} className="inline-flex h-12 items-center justify-center gap-2 rounded-control px-2 text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Lihat Arsip SOP
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-3 text-xs text-secondary-foreground">
            {trustCues.map((cue) => (
              <li key={cue} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden />
                {cue}
              </li>
            ))}
          </ul>
        </div>

        <LandingProductPreview />
      </div>

      <div className="border-t border-border bg-surface" aria-label="Tahapan pengelolaan SOP">
        <div className="overflow-x-auto">
          <ol className="mx-auto grid min-w-[760px] max-w-7xl grid-cols-7 px-4 sm:px-6 lg:px-8">
            {stages.map((stage) => (
              <li key={stage.step} className="border-r border-border px-3 py-4 last:border-r-0 sm:px-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] font-semibold text-primary">{stage.step}</span>
                  <span className="text-xs font-medium text-secondary-foreground">{stage.title}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Run focused landing test**

```bash
pnpm --dir client test src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: PASS for hero/product-preview assertions, with possible failures remaining in role/traceability sections that later tasks fix.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/landing/identity-hero.tsx client/src/pages/landing/landing-product-preview.tsx
git commit -m "refactor(client): make landing hero product first"
```

---

### Task 3: Polish role workbench section

**Files:**
- Modify: `client/src/pages/landing/role-workspace-showcase.tsx`
- Modify: `client/src/pages/landing/role-workspace-previews.tsx`

**Interfaces:**
- Consumes: `LandingRoleId`, `LandingRoleProfile`, `RoleWorkspacePreview({ roleId })`.
- Produces: same public interface; cleaner section and realistic role previews.

- [ ] **Step 1: Keep tab behavior but polish section shell**

In `role-workspace-showcase.tsx`, retain state and ARIA behavior. Adjust the section container to feel less wireframe:

```tsx
<section id="peran" className="scroll-mt-20 border-y border-border bg-[#f8fafc] py-20 sm:py-24">
```

Use a stronger content card:

```tsx
className="mt-8 grid gap-8 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-8 lg:grid-cols-[0.34fr_0.66fr] lg:gap-10"
```

Keep the existing `role="tablist"`, `role="tab"`, `aria-selected`, and `role="tabpanel"` attributes.

- [ ] **Step 2: Make role preview content product-like**

In `role-workspace-previews.tsx`, ensure every role preview contains realistic SOPFlow labels. Minimum required strings:

```ts
'Catatan evaluasi'
'Berita Acara'
'Menunggu tindak lanjut'
'Siap diajukan'
'Siap arsip'
```

Avoid large fake decorative cards. Use thin borders, small status chips, compact tables, and subdued blue/emerald/yellow tokens.

- [ ] **Step 3: Run focused landing test**

```bash
pnpm --dir client test src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: PASS for role accessibility and role preview assertions.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/landing/role-workspace-showcase.tsx client/src/pages/landing/role-workspace-previews.tsx
git commit -m "refactor(client): polish public role workbench"
```

---

### Task 4: Refine workflow and archive/validation sections

**Files:**
- Modify: `client/src/pages/landing/workflow-story.tsx`
- Modify: `client/src/pages/landing/document-traceability.tsx`

**Interfaces:**
- Consumes: existing `WorkflowStory({ stages, chapters })` props from `LandingPage.tsx`.
- Produces: same component APIs with cleaner static presentation.

- [ ] **Step 1: Make workflow section a concise timeline/card grid**

In `workflow-story.tsx`, keep existing props and chapter data. Ensure the rendered copy includes:

```ts
'Dari penyusunan sampai arsip final'
'OPD menyusun draft SOP'
'Pengajuan masuk ke Biro Organisasi'
'Evaluator memberi catatan dan penilaian'
'Berita acara ditandatangani'
'Kepala OPD mengesahkan'
'SOP masuk arsip publik'
```

Use a 3x2 card grid on desktop or a vertical list on mobile. Use `border border-border`, `bg-surface`, and restrained accent numbers.

- [ ] **Step 2: Reframe document traceability as archive + validation credibility**

In `document-traceability.tsx`, ensure the section includes:

```ts
'Arsip dan validasi dokumen dalam satu tempat'
'Pencarian arsip'
'Validasi PDF'
'Dokumen valid'
```

Create two side-by-side preview cards:

1. Archive search preview with rows such as `SOP Pelayanan Administrasi` and `Berlaku`.
2. Validation preview with status `Dokumen valid` and metadata such as `Nomor SOP` and `Tanggal pengesahan`.

- [ ] **Step 3: Run focused landing test**

```bash
pnpm --dir client test src/pages/__tests__/public-landing-hybrid-design-contract.test.ts
```

Expected: PASS for all landing contract tests.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/landing/workflow-story.tsx client/src/pages/landing/document-traceability.tsx
git commit -m "refactor(client): clarify public workflow archive validation"
```

---

### Task 5: Update login design contract

**Files:**
- Modify: `client/src/pages/__tests__/public-auth-design-contract.test.ts`

**Interfaces:**
- Consumes: existing source-contract testing style.
- Produces: failing auth design contract for the new login implementation.

- [ ] **Step 1: Replace auth test expectations**

Replace the current test body with:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8')
}

const loginPageSource = readSource('../login/LoginPage.tsx')
const loginHeroSource = readSource('../login/components/LoginHero.tsx')
const loginFormSource = readSource('../login/components/LoginForm.tsx')
const allSources = [loginPageSource, loginHeroSource, loginFormSource].join('\n')

describe('public auth institutional SaaS contract', () => {
  it('frames login as an enterprise access surface with trust cues', () => {
    expect(loginFormSource).toContain('Masuk ke SOPFlow')
    expect(loginFormSource).toContain('Gunakan akun yang telah didaftarkan administrator instansi')
    expect(loginHeroSource).toContain('Akses berbasis peran')
    expect(loginHeroSource).toContain('Evaluasi terdokumentasi')
    expect(loginHeroSource).toContain('Arsip SOP terpusat')
    expect(loginHeroSource).toContain('Pengajuan Evaluasi')
  })

  it('preserves accessible login controls and auth behavior', () => {
    expect(loginFormSource).toContain('onSubmitLogin({ email, kataSandi: password })')
    expect(loginFormSource).toContain('Email')
    expect(loginFormSource).toContain('Kata sandi')
    expect(loginFormSource).toContain('Tampilkan kata sandi')
    expect(loginFormSource).toContain('Sembunyikan kata sandi')
    expect(loginFormSource).toMatch(/\bEye\b/)
    expect(loginFormSource).toMatch(/\bEyeOff\b/)
  })

  it('does not use dark poster or decorative AI styling', () => {
    expect(loginHeroSource).not.toContain('bg-slate-950 text-white')
    expect(loginHeroSource).not.toContain('opacity-20')

    for (const banned of ['bg-gradient', 'blur-3xl', 'shadow-xl', 'rounded-3xl', 'TTE BSRE', 'TTE BSrE', 'Komdigi certified']) {
      expect(allSources).not.toContain(banned)
    }
  })
})
```

- [ ] **Step 2: Run focused auth test and verify it fails**

```bash
pnpm --dir client test src/pages/__tests__/public-auth-design-contract.test.ts
```

Expected: FAIL because current `LoginHero` still uses dark poster styling and the form title is still `Masuk ke sistem`.

- [ ] **Step 3: Commit failing test**

```bash
git add client/src/pages/__tests__/public-auth-design-contract.test.ts
git commit -m "test(client): require institutional SaaS login contract"
```

---

### Task 6: Refactor login trust panel and form card

**Files:**
- Modify: `client/src/pages/login/LoginPage.tsx`
- Modify: `client/src/pages/login/components/LoginHero.tsx`
- Modify: `client/src/pages/login/components/LoginForm.tsx`

**Interfaces:**
- Consumes: `useAuth`, `LoginForm({ isSubmitting, onSubmitLogin })`, existing `LoginRequestDto`.
- Produces: same login behavior with cleaner two-column enterprise layout.

- [ ] **Step 1: Update `LoginPage` outer frame**

Keep `useAuth` and `LoginForm` wiring unchanged. Make the right side a card area:

```tsx
<div className="min-h-screen bg-[#f8fafc] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
  <div className="hidden min-h-screen lg:block">
    <LoginHero />
  </div>

  <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
    <div className="w-full max-w-md">
      ...mobile brand header...
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Replace `LoginHero` dark poster with trust panel**

Use light panel copy and static product preview:

```tsx
import { CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import heroBg from '@/assets/Kantor_Gubernur_Sumbar_belakang.jpg'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

const trustItems = ['Akses berbasis peran', 'Evaluasi terdokumentasi', 'Arsip SOP terpusat']

export function LoginHero() {
  return (
    <aside className="flex h-full min-h-screen bg-[#eef4fb] p-10 text-foreground xl:p-14">
      <div className="flex w-full flex-col justify-between rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Pemerintah Provinsi Sumatera Barat · Biro Organisasi</p>
          </div>
        </div>

        <div className="my-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Akses internal SOPFlow</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-slate-950">Masuk ke ruang kerja SOP sesuai peran dan kewenangan.</h1>
          <p className="mt-5 text-sm leading-6 text-secondary-foreground">Satu akun mengarahkan pengguna ke pekerjaan yang relevan: penyusunan, evaluasi, berita acara, pengesahan, arsip, dan validasi.</p>

          <div className="mt-8 grid gap-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-[#f8fafc] px-4 py-3 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" aria-hidden />
                Pengajuan Evaluasi
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">Aktif</span>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Dokumen</span><span className="font-medium text-foreground">4 SOP</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-blue-700">Menunggu evaluasi</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Validasi</span><span className="font-medium text-emerald-700">Tersedia</span></div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-border pt-5 lg:grid-cols-[0.7fr_0.3fr] lg:items-end">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
            Akses internal sesuai peran dan organisasi pengguna.
          </div>
          <img src={heroBg} alt="Kantor Gubernur Sumatera Barat" className="hidden h-16 w-full rounded-xl object-cover lg:block" />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Update `LoginForm` copy and remove outer border dependency**

Keep state, validation, submit, and password visibility unchanged. Update header copy:

```tsx
<h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-foreground">Masuk ke SOPFlow</h1>
<p className="mt-2 text-sm leading-6 text-secondary-foreground">Gunakan akun yang telah didaftarkan administrator instansi.</p>
```

Keep this exact submit call:

```tsx
await onSubmitLogin({ email, kataSandi: password })
```

- [ ] **Step 4: Run focused auth test**

```bash
pnpm --dir client test src/pages/__tests__/public-auth-design-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/login/LoginPage.tsx client/src/pages/login/components/LoginHero.tsx client/src/pages/login/components/LoginForm.tsx
git commit -m "refactor(client): redesign login as institutional SaaS access"
```

---

### Task 7: Full frontend verification and PR preparation

**Files:**
- No source file changes required unless verification reveals a defect.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: draft PR ready for CI.

- [ ] **Step 1: Run focused tests**

```bash
pnpm --dir client test src/pages/__tests__/public-landing-hybrid-design-contract.test.ts src/pages/__tests__/public-auth-design-contract.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run frontend quality gates**

```bash
pnpm --dir client typecheck
pnpm --dir client lint
pnpm --dir client build
```

Expected: all PASS.

- [ ] **Step 3: Open draft PR**

PR title:

```text
refactor(client): redesign landing and login as institutional SaaS
```

PR body:

```markdown
Redesigns SOPFlow public landing and login surfaces into a clean institutional SaaS direction.

Changes:
- Replaces dark poster hero with a light product-first hero.
- Adds a static product workbench preview to the landing hero.
- Keeps government building imagery as a supporting identity accent.
- Polishes role workspace, workflow, archive, and validation landing sections.
- Redesigns login as an enterprise two-column access surface with trust cues.
- Adds/updates design contract tests for landing and login.

Guardrails:
- Frontend/UI-only.
- No backend/API/DTO/Prisma changes.
- No auth behavior changes.
- No route/permission/workflow/PDF logic changes.
```

- [ ] **Step 4: Wait for CI**

Check PR CI until these pass:

- Minimal production config
- Server quality
- Database migration invariants
- Client quality
- Critical E2E business journeys
- Container build, if triggered

- [ ] **Step 5: Mark ready and merge only after green CI**

After all checks are green:

```bash
# Use GitHub connector equivalent:
# mark_pull_request_ready_for_review
# get_pr_info
# merge_pull_request with merge_method=squash and expected_head_sha=<fresh head sha>
```

Expected: PR is merged to `main`, then fetch `main` branch and confirm its commit SHA matches merge result.

---

## Self-Review

- Spec coverage: hero, product preview, role section, workflow, archive/validation, login panel, login form, tests, and CI are all covered by tasks.
- Placeholder scan: no TODO/TBD/fill-in-later text remains.
- Type consistency: `LandingProductPreview` is defined in Task 2 and consumed by `IdentityHero`; login submit payload remains `{ email, kataSandi: password }`; `RoleWorkspacePreview({ roleId })` interface remains unchanged.
- Scope check: plan is frontend/UI-only and does not include backend, auth behavior, route, permission, PDF validation logic, or workflow changes.

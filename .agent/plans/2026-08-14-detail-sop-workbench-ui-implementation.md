# Detail SOP Workbench UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove redundant detail-page back controls and redesign the Penyusun/PJ Penyusun SOP workbench into a compact, intentional document editor while preserving the existing inline procedure-table workflow and all domain behavior.

**Architecture:** `DetailPageLayout` becomes a workspace-only layout that receives breadcrumb metadata but no longer owns standalone back/actions rows. The Penyusun SOP workbench keeps its current state/hooks and is refactored only at presentation boundaries: a compact document command bar, a flat property inspector, a consistent inline spreadsheet editor, and a quieter preview toolbar. Existing APIs, autosave, workflow transitions, versioning, diagrams, print logic, permission checks, and validation remain the source of truth.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, Vitest, Testing Library, Playwright, pnpm.

## Global Constraints

- Frontend/UI refactor only; do not change backend endpoints, DTOs, Prisma schema, API contracts, route permissions, role checks, or workflow transitions.
- Preserve `useDetailSopPenyusun`, header/procedure autosave hooks, `useProsedurEditor`, version-domain helpers, print helpers, and diagram configuration behavior.
- Preserve the procedure editor as an inline table/spreadsheet on desktop. Do not replace it with modal, drawer, master-detail, or per-step navigation.
- Preserve existing mobile procedure-editing architecture; only inherit safe control-style improvements.
- Breadcrumb ancestors are the visible back-navigation mechanism. Do not introduce browser-history back buttons.
- Exactly one primary workflow action may be visually dominant in the SOP command bar.
- Secondary actions such as print/version creation remain reachable without competing visually with the primary workflow action.
- Property metadata keeps the existing data model and add/remove/change handlers.
- Multiline procedure fields start compact and auto-grow only when content requires more lines.
- Wide procedure data uses intentional minimum column widths plus horizontal scrolling rather than crushing controls.
- Accessibility, keyboard focus, live-region autosave announcements, and existing dialog semantics must be preserved.
- Use the single branch `refactor/detail-sop-workbench-ui` for the whole task.
- Follow TDD for behavior/contract changes and require the repository CI gate to pass before squash merge.

---

## File map

### Shared detail shell

- Modify: `client/src/components/layout/DetailPageLayout.tsx`
- Modify: `client/src/components/layout/__tests__/DetailPageLayout.test.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/DetailSOPPenyusun.tsx`
- Modify: `client/src/pages/kepala-opd/sop/DetailSOP.tsx`
- Modify: `client/src/pages/kepala-opd/pengajuan/DetailPengajuanSOPPage.tsx`
- Modify: `client/src/pages/evaluator/evaluasi/evaluasi-workspace-page.tsx`
- Modify: `client/src/pages/pj-evaluator/evaluasi/DetailPengajuanEvaluasi.tsx`
- Modify: `client/src/pages/penyusun/koordinator/berita-acara/DetailBeritaAcaraPage.tsx`

### SOP command bar and workbench composition

- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunHeader.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunMain.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunHeader.test.tsx`

### Property inspector

- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunSidePanel.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopMetadataPanel.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/components/SOPHeaderSection.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunSidePanel.test.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/SOPHeaderSection.test.tsx`

### Procedure spreadsheet editor

- Modify: `client/src/pages/penyusun/sop/detail/components/ProsedurEditorCells.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopProsedurEditor.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/ProsedurEditorCells.test.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopProsedurEditor.test.tsx`

### E2E / regression

- Modify: the existing Playwright SOP-detail/editor journey if present after repository search; otherwise create `client/e2e/detail-sop-workbench-ui.spec.ts`.

---

## Task 1: Remove standalone detail back controls and make breadcrumb the only visible back navigation

**Files:**
- Modify: `client/src/components/layout/DetailPageLayout.tsx`
- Modify: `client/src/components/layout/__tests__/DetailPageLayout.test.tsx`
- Modify all six production consumers listed in the File map.

**Interfaces:**

Final `DetailPageLayoutProps`:

```ts
export interface DetailPageLayoutProps {
  breadcrumb?: BreadcrumbItem[] | null
  title: string
  description?: string
  header?: React.ReactNode
  main?: React.ReactNode
  children?: React.ReactNode
  leftPanel?: React.ReactNode
  rightPanel?: React.ReactNode
  className?: string
  workspaceClassName?: string
}
```

`backTo`, `backSize`, and generic page-level `actions` are removed from this component contract.

- [ ] **Step 1: Replace the old layout test with a failing breadcrumb-only contract test**

Use `client/src/components/layout/__tests__/DetailPageLayout.test.tsx`:

```tsx
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}))

import { DetailPageLayout } from '@/components/layout/DetailPageLayout'
import { HeaderBar } from '@/components/layout/HeaderBar'
import { PageHeaderProvider } from '@/components/layout/PageHeaderProvider'

describe('DetailPageLayout', () => {
  it('menggunakan breadcrumb sebagai navigasi balik tanpa standalone back row', async () => {
    render(
      <PageHeaderProvider>
        <HeaderBar />
        <DetailPageLayout
          breadcrumb={[
            { label: 'Manajemen SOP', to: '/penyusun/sop' },
            { label: 'Edit SOP' },
          ]}
          title="Edit Dokumen SOP"
          main={<div>Dokumen</div>}
        />
      </PageHeaderProvider>,
    )

    expect(await screen.findByRole('link', { name: 'Manajemen SOP' })).toHaveAttribute(
      'href',
      '/penyusun/sop',
    )
    expect(screen.getByText('Edit SOP')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByTitle('Kembali')).not.toBeInTheDocument()
    expect(screen.queryByText('Kembali')).not.toBeInTheDocument()
    expect(screen.getByText('Dokumen')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/components/layout/__tests__/DetailPageLayout.test.tsx
```

Expected: FAIL because the current layout still renders `BackButton` and still requires `backTo`.

- [ ] **Step 3: Simplify `DetailPageLayout`**

Remove the `BackButton` import and delete the local toolbar row entirely. The component body becomes structurally:

```tsx
export function DetailPageLayout({
  breadcrumb,
  title,
  header,
  main,
  children,
  leftPanel,
  rightPanel,
  className,
  workspaceClassName,
}: DetailPageLayoutProps) {
  const mainContent = main ?? children

  return (
    <div
      suppressHydrationWarning
      className={className ?? 'flex h-[calc(100vh-5rem)] min-h-0 flex-col gap-3 sm:gap-4'}
    >
      <SetPageHeader breadcrumb={breadcrumb ?? []} title={title} />
      <DetailWorkspace
        className={workspaceClassName}
        header={header}
        leftPanel={leftPanel}
        main={mainContent}
        rightPanel={rightPanel}
      />
    </div>
  )
}
```

Do not alter `DetailWorkspace` column/layout behavior in this task.

- [ ] **Step 4: Migrate `DetailSOPPenyusun`**

Keep the already-correct linked ancestor:

```tsx
breadcrumb={[
  { label: 'Manajemen SOP', to: ROUTES.PENYUSUN.SOP },
  { label: isReadOnly ? 'Lihat SOP' : 'Edit SOP' },
]}
```

Remove:

```tsx
description={metadata.nama ?? metadata.judul ?? ''}
backTo={ROUTES.PENYUSUN.SOP}
backSize="icon"
```

The document identity will move into the workbench command bar in Task 2.

- [ ] **Step 5: Migrate Kepala OPD SOP detail**

In `client/src/pages/kepala-opd/sop/DetailSOP.tsx`, keep:

```tsx
const effectiveBreadcrumb = breadcrumb ?? [
  { label: 'SOP', to: ROUTES.KEPALA_OPD.SOP },
  { label: 'Detail SOP' },
]
```

Delete the public `backTo?: string` prop and `effectiveBackTo`; remove `backTo`, `backSize`, `actions={null}`, and `description` from `DetailPageLayout` usage. Preserve the existing workspace header including `Cabut SOP` logic.

- [ ] **Step 6: Migrate Kepala OPD pengajuan detail**

Keep this breadcrumb exactly:

```tsx
breadcrumb={[
  { label: 'Pengajuan SOP', to: ROUTES.KEPALA_OPD.PENGAJUAN },
  { label: 'Detail Pengajuan' },
]}
```

Remove only `description`, `backTo`, and `backSize` from the layout call. The existing print/sign controls remain in the page's workspace `header`.

- [ ] **Step 7: Migrate PJ Evaluator evaluation detail**

Keep:

```tsx
breadcrumb={[
  {
    label: IA.NAV_BIRO_EVALUASI_REQUEST_EVALUATOR,
    to: ROUTES.PJ_EVALUATOR.EVALUASI,
  },
  { label: pengajuan.opdNama ?? '' },
]}
```

Remove only `description`, `backTo`, and `backSize` from the layout call. Keep TTE/print actions in the existing local workspace header.

- [ ] **Step 8: Migrate PJ Penyusun Berita Acara detail**

Use a current crumb after the linked collection crumb so the final breadcrumb item is not an ancestor link:

```tsx
breadcrumb={[
  { label: 'PJ Penyusun', to: ROUTES.PENYUSUN.SOP },
  { label: 'Berita Acara', to: ROUTES.PENYUSUN.PJ_PENYUSUN_BERITA_ACARA },
  { label: 'Detail Berita Acara' },
]}
```

Remove `description`, `backTo`, and `backSize`. Preserve all current BA/TTE actions in the local workspace header.

- [ ] **Step 9: Migrate Evaluator workspace**

At its `DetailPageLayout` call, use the existing `listHref` as the linked parent breadcrumb target:

```tsx
breadcrumb={[
  { label: 'Evaluasi SOP', to: listHref },
  { label: workspace?.opd.nama ?? 'Detail Evaluasi' },
]}
```

Remove `backTo`/`backSize` from the call. Keep submit/reject evaluation controls in their existing local workspace header/panels; do not change evaluator state logic.

- [ ] **Step 10: Run the detail-layout test plus typecheck**

```bash
pnpm test -- src/components/layout/__tests__/DetailPageLayout.test.tsx
pnpm typecheck
```

Expected: PASS and no `DetailPageLayout` consumer requires removed props.

- [ ] **Step 11: Stale contract scan**

```bash
rg "backTo=|backSize=" client/src/pages client/src/components/layout
rg "<DetailPageLayout" client/src/pages
```

Expected: `backTo`/`backSize` no longer appear on `DetailPageLayout` calls. `BackButton` may still legitimately exist in not-found/error states; do not remove those.

- [ ] **Step 12: Commit**

```bash
git add client/src/components/layout/DetailPageLayout.tsx client/src/components/layout/__tests__/DetailPageLayout.test.tsx client/src/pages/penyusun/sop/detail/DetailSOPPenyusun.tsx client/src/pages/kepala-opd/sop/DetailSOP.tsx client/src/pages/kepala-opd/pengajuan/DetailPengajuanSOPPage.tsx client/src/pages/evaluator/evaluasi/evaluasi-workspace-page.tsx client/src/pages/pj-evaluator/evaluasi/DetailPengajuanEvaluasi.tsx client/src/pages/penyusun/koordinator/berita-acara/DetailBeritaAcaraPage.tsx
git commit -m "refactor(client): use breadcrumb for detail navigation"
```

---

## Task 2: Redesign the SOP document command bar without changing workflow logic

**Files:**
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunHeader.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunHeader.test.tsx`

**Interfaces:**
- Keep the existing `DetailSOPPenyusunHeaderProps` fields and callbacks.
- `metadata`, `currentSopStatus`, `currentSopStatusLabel`, autosave status, print state, version creation state, primary action visibility, blocking reasons, and confirmation behavior remain unchanged.
- Presentation adds one quiet secondary-action menu when secondary actions exist.

- [ ] **Step 1: Write failing command-bar tests**

Mock `usePenyusunWorkbench`, `useSopEditor`, print mapping/helper, and toast. Cover these behaviors:

```tsx
renderHeader({
  metadata: { nama: 'SOP Pelayanan Administrasi', version: 2 },
  currentSopStatus: 'DRAFT',
  currentSopStatusLabel: 'Draft',
  primaryActionLabel: 'Selesai',
  autosaveStatus: 'saved',
})

expect(screen.getByText('SOP Pelayanan Administrasi')).toBeInTheDocument()
expect(screen.getByText('v2')).toBeInTheDocument()
expect(screen.getByText('Draft')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Selesai' })).toBeVisible()
expect(screen.getByRole('status')).toHaveTextContent('Tersimpan')
expect(screen.queryByText('Dokumen SOP')).not.toBeInTheDocument()
```

Add an error case:

```tsx
renderHeader({ autosaveStatus: 'error', onRetryAutosave: retry })
fireEvent.click(screen.getByRole('button', { name: 'Coba lagi' }))
expect(retry).toHaveBeenCalledTimes(1)
```

Add a secondary-actions case with `currentSopStatus="BERLAKU"` and `canBuatVersiBaru={true}` and assert both `Cetak PDF` and `Buat versi baru` are reachable from the menu while the primary workflow button is not duplicated.

- [ ] **Step 2: Run RED**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunHeader.test.tsx
```

Expected: FAIL because the current header uses generic `Dokumen SOP`, colored autosave badges, equally weighted secondary buttons, and horizontal-scroll behavior.

- [ ] **Step 3: Replace colored autosave badge mapping with semantic appearance**

Keep `autosaveAppearance`, but make it return semantic tone classes:

```ts
interface AutosaveAppearance {
  Icon: typeof Save
  label: string
  className: string
}
```

Use:

```ts
saved   -> 'text-muted-foreground'
saving  -> 'text-secondary-foreground'
pending -> 'text-secondary-foreground'
error   -> 'text-danger'
idle    -> null
```

Render the status as compact inline text with `role="status" aria-live="polite"`, not a bordered color badge. Preserve retry only for `error`.

- [ ] **Step 4: Build the command hierarchy**

Replace the horizontal-scroll wrapper and wheel handler with:

```tsx
<div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
  <div className="min-w-0">
    <h2 className="truncate text-sm font-semibold text-foreground">
      {metadata.nama ?? metadata.judul ?? 'SOP'}
    </h2>
    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>v{metadata.version || 1}</span>
      {metadata.revisiDariVersi != null ? <span>Revisi dari v{metadata.revisiDariVersi}</span> : null}
      <SopStatusBadge ... />
    </div>
  </div>

  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
    {autosaveIndicator}
    {retryButton}
    {primaryWorkflowButton}
    {secondaryActionsMenu}
  </div>
</div>
```

Do not reintroduce `overflow-x-auto` or an `onWheel` handler.

- [ ] **Step 5: Move print/version actions into one quiet menu**

Use the existing dropdown primitives already used elsewhere in the project. Trigger:

```tsx
<Button
  type="button"
  variant="ghost"
  size="icon"
  className="h-8 w-8"
  aria-label="Aksi dokumen lainnya"
>
  <MoreHorizontal className="h-4 w-4" aria-hidden />
</Button>
```

Menu items:

```text
Cetak PDF
Buat versi baru
```

Rules:
- render `Cetak PDF` only under the same `currentSopStatus === 'BERLAKU'` condition;
- preserve `isWorkbenchLoading || isPrinting` disabling behavior;
- preserve `canBuatVersiBaru`, `isBuatVersiBaruPending`, and `buatVersiBaruBlockingReason` behavior;
- call the same existing `handlePrintSop` and `onBuatVersiBaru` handlers.

If no secondary action is available, omit the menu trigger.

- [ ] **Step 6: Keep the primary workflow button unchanged behaviorally**

Retain:

```tsx
!isReadOnly && (!isRevisionFlow || canShowKirimUlangAction)
```

and the existing blocking/pending/confirm-dialog behavior. Only use the normal primary button token styling; do not hard-code new workflow colors.

- [ ] **Step 7: Flatten revision guidance**

Keep the same role-dependent text, but use a compact contextual notice:

```tsx
<div className="mt-2 flex gap-2 border-t border-border pt-2 text-xs text-secondary-foreground">
  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden />
  <p>{/* existing branch text as real JSX, unchanged */}</p>
</div>
```

Use the project's available semantic warning token; if the theme has no `text-warning`, retain the current amber text token rather than inventing a new token in this task.

- [ ] **Step 8: Run GREEN and typecheck**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunHeader.test.tsx
pnpm typecheck
```

- [ ] **Step 9: Commit**

```bash
git add client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunHeader.tsx client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunHeader.test.tsx
git commit -m "refactor(client): simplify SOP document command bar"
```

---

## Task 3: Convert the right metadata area from card stack into a property inspector

**Files:**
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunSidePanel.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopMetadataPanel.tsx`
- Modify: `client/src/pages/penyusun/sop/detail/components/SOPHeaderSection.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunSidePanel.test.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/SOPHeaderSection.test.tsx`

**Interfaces:**
- Keep internal tab id `edit`; change its visible editable-mode label to `Properti`.
- Read-only mode may keep `Informasi`.
- Keep all current metadata keys, `handleMetadataChange` calls, add/remove dialogs, implementer handling, and read-only restrictions.

- [ ] **Step 1: Write the side-panel label test**

Render `DetailSOPPenyusunSidePanel` with `rightPanelTab="edit"`, `collapsed={false}`, and mocked child panels. Assert:

```tsx
expect(screen.getByText('Properti')).toBeInTheDocument()
expect(screen.getByText('Komentar evaluasi')).toBeInTheDocument()
expect(screen.getByText('Versi')).toBeInTheDocument()
expect(screen.getByText('Aktivitas')).toBeInTheDocument()
```

Render with `isReadOnly={true}` and assert the first label is `Informasi`.

- [ ] **Step 2: Run RED for side-panel label**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunSidePanel.test.tsx
```

- [ ] **Step 3: Make side-panel labeling domain-neutral**

Remove `editTabLabel` from `DetailSOPPenyusunSidePanelProps`. Derive:

```ts
const propertyTabLabel = isReadOnly ? 'Informasi' : 'Properti'
```

Keep tab ids unchanged:

```ts
'edit' | 'komentar' | 'versi' | 'aktivitas'
```

Update `DetailSOPPenyusun.tsx` to stop passing `editTabLabel`.

- [ ] **Step 4: Write failing property-inspector behavior tests**

Mock `useSopEditor` with metadata containing at least:

```ts
{
  nama: 'SOP Uji',
  nomorSOP: '001/SOP/2026',
  institutionLines: ['Pemprov Sumbar', 'Sekretariat Daerah'],
  lawBasis: ['PermenPANRB 35/2012'],
  lawBasisIds: ['law-1'],
  relatedSop: ['SOP Surat Masuk'],
  relatedSopDetailIds: ['sop-2'],
  warning: ['Periksa kelengkapan'],
  implementQualification: ['Memahami administrasi'],
  equipment: ['Komputer'],
  recordData: ['Buku agenda'],
}
```

Assert visible section headings and critical fields:

```tsx
expect(screen.getByText('Identitas lembaga')).toBeInTheDocument()
expect(screen.getByText('Identitas SOP')).toBeInTheDocument()
expect(screen.getByText('Dasar hukum')).toBeInTheDocument()
expect(screen.getByText('Keterkaitan dengan SOP')).toBeInTheDocument()
expect(screen.getByText('Peringatan')).toBeInTheDocument()
expect(screen.getByDisplayValue('SOP Uji')).toBeInTheDocument()
expect(screen.getByDisplayValue('001/SOP/2026')).toBeInTheDocument()
expect(screen.getByText('PermenPANRB 35/2012')).toBeInTheDocument()
```

Also assert add buttons still exist in editable mode and are absent in read-only mode.

- [ ] **Step 5: Replace `MetadataFieldCard` with a flat local `InspectorSection`**

In `SOPHeaderSection.tsx`, remove decorative icon imports that are no longer used and define:

```tsx
function InspectorSection({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="border-b border-border py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}
```

Use sections for every existing metadata group; do not remove any field. Keep current metadata mutation code verbatim inside each section.

- [ ] **Step 6: Flatten panel/background ownership**

Change `DetailSOPMetadataPanel` from:

```tsx
<div className="space-y-3 bg-surface-subtle/80 p-2">
```

to a single inspector content area:

```tsx
<div className="px-3 pb-3">
```

Keep dialogs outside the inspector content and preserve their existing callbacks.

- [ ] **Step 7: Simplify read-only values**

Change `ReadOnlyTextBlock` so it reads like content, not a disabled input:

```tsx
<div
  className={cn(
    'text-xs text-secondary-foreground',
    multiline ? 'whitespace-pre-wrap leading-relaxed' : 'leading-5',
  )}
>
  {hasValue ? value : <span className="text-muted-foreground">{placeholder}</span>}
</div>
```

Do not change editable control behavior.

- [ ] **Step 8: Run GREEN**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunSidePanel.test.tsx src/pages/penyusun/sop/detail/components/__tests__/SOPHeaderSection.test.tsx
pnpm typecheck
```

- [ ] **Step 9: Commit**

```bash
git add client/src/pages/penyusun/sop/detail/DetailSOPPenyusun.tsx client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunSidePanel.tsx client/src/pages/penyusun/sop/detail/components/DetailSopMetadataPanel.tsx client/src/pages/penyusun/sop/detail/components/SOPHeaderSection.tsx client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunSidePanel.test.tsx client/src/pages/penyusun/sop/detail/components/__tests__/SOPHeaderSection.test.tsx
git commit -m "refactor(client): flatten SOP property inspector"
```

---

## Task 4: Standardize procedure editor fields while preserving inline editing

**Files:**
- Modify: `client/src/pages/penyusun/sop/detail/components/ProsedurEditorCells.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/ProsedurEditorCells.test.tsx`

**Interfaces:**
- Keep every existing cell component name and prop signature.
- Reuse `AutoResizeTextarea` for multiline text cells.
- Keep `MutuWaktuCell` output contract `onChange(amount, unit)` and current encoded value parsing.

- [ ] **Step 1: Write failing compact-field tests**

Render the four multiline cells and assert they are textareas with one-row compact behavior:

```tsx
render(<KegiatanCell value="Kegiatan pendek" onChange={vi.fn()} />)
const kegiatan = screen.getByRole('textbox', { name: 'Kegiatan' })
expect(kegiatan).toHaveAttribute('rows', '1')
expect(kegiatan).toHaveClass('min-h-9')
```

Repeat for `Kelengkapan`, `Output`, and `Keterangan`.

Add interaction:

```tsx
fireEvent.change(kegiatan, { target: { value: 'Baris 1\nBaris 2' } })
expect(onChange).toHaveBeenCalledWith('Baris 1\nBaris 2')
```

- [ ] **Step 2: Write compound-time behavior test**

```tsx
const onChange = vi.fn()
render(<MutuWaktuCell value="10 menit" onChange={onChange} />)

expect(screen.getByRole('spinbutton', { name: 'Jumlah waktu' })).toHaveValue(10)
expect(screen.getByRole('combobox', { name: 'Satuan waktu' })).toHaveValue('m')

fireEvent.change(screen.getByRole('spinbutton', { name: 'Jumlah waktu' }), {
  target: { value: '15' },
})
expect(onChange).toHaveBeenCalledWith('15', 'm')
```

Assert both controls share one wrapper using `data-testid="procedure-time-control"` and that inner controls do not introduce independent outer borders.

- [ ] **Step 3: Run RED**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/ProsedurEditorCells.test.tsx
```

Expected: FAIL because multiline cells still use the general `Textarea` and the time wrapper has no explicit structural test hook.

- [ ] **Step 4: Introduce one procedure control class contract**

At module scope:

```ts
const procedureControlClass =
  'min-h-9 rounded-control border border-border-strong bg-surface px-2 py-1.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
```

Use equivalent sizing/padding for native selects. Do not globally modify application `Input`/`Textarea` primitives in this task.

- [ ] **Step 5: Replace multiline `Textarea` cells with `AutoResizeTextarea`**

Example:

```tsx
<AutoResizeTextarea
  aria-label="Kegiatan"
  minRows={1}
  maxRows={5}
  className="min-h-9 px-2 py-1.5 text-[13px] leading-5"
  value={value}
  onChange={(event) => onChange(event.target.value)}
/>
```

Apply the same contract to Kelengkapan, Output, and Keterangan. Use `maxRows={5}` to keep a single row from expanding without bound inside the spreadsheet.

- [ ] **Step 6: Align Type/Pelaksana selects**

Keep all existing option/normalization logic. Change only classes to the same 36px resting height, padding, radius, border, and focus treatment used by procedure text controls.

Decision helper text remains under `TypeCell` and may expand only that row.

- [ ] **Step 7: Make `MutuWaktuCell` visually one field**

Use:

```tsx
<div
  data-testid="procedure-time-control"
  className="flex min-w-[11rem] items-stretch overflow-hidden rounded-control border border-border-strong bg-surface focus-within:ring-2 focus-within:ring-primary"
>
```

Keep the amount input and unit select independently focusable. Remove their individual outer borders/rings; preserve an internal `border-r border-border` divider. Keep their existing aria-labels and parsing logic.

- [ ] **Step 8: Run GREEN**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/ProsedurEditorCells.test.tsx
pnpm typecheck
```

- [ ] **Step 9: Commit**

```bash
git add client/src/pages/penyusun/sop/detail/components/ProsedurEditorCells.tsx client/src/pages/penyusun/sop/detail/components/__tests__/ProsedurEditorCells.test.tsx
git commit -m "refactor(client): compact SOP procedure fields"
```

---

## Task 5: Make the procedure table an intentional spreadsheet surface

**Files:**
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopProsedurEditor.tsx`
- Create: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopProsedurEditor.test.tsx`

**Interfaces:**
- Preserve `DetailSOPProsedurEditorProps` and all `useProsedurEditor` handlers.
- Preserve validation via `validateProsedurRows` + `formatProsedurValidationMessage` before `onDone`.
- Preserve row menu behaviors and `DecisionStepDialog` data updates.

- [ ] **Step 1: Write failing editor-structure test**

Mock `useProsedurEditor` with real no-op handlers or render with one deterministic procedure row. Assert all columns remain:

```tsx
for (const heading of [
  'No',
  'Kegiatan',
  'Tipe',
  'Pelaksana',
  'Kelengkapan',
  'Waktu',
  'Output',
  'Keterangan',
  'Aksi',
]) {
  expect(screen.getByRole('columnheader', { name: heading })).toBeInTheDocument()
}
```

Assert desktop scroll region:

```tsx
expect(screen.getByTestId('procedure-editor-scroll')).toHaveClass('overflow-x-auto')
```

Assert `Tambah langkah`, `Selesai edit`, and row action trigger remain reachable.

- [ ] **Step 2: Run RED**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopProsedurEditor.test.tsx
```

- [ ] **Step 3: Set intentional intrinsic width and column sizing**

Use a desktop scroll wrapper:

```tsx
<div
  data-testid="procedure-editor-scroll"
  className="hidden overflow-x-auto overscroll-x-contain rounded-surface border border-border bg-surface [scrollbar-width:thin] md:block"
>
  <Table.Table className="min-w-[1460px] table-fixed">
```

Use these starting widths:

```text
No          48px
Kegiatan    260px
Tipe        140px
Pelaksana   190px
Kelengkapan 190px
Waktu       190px
Output      190px
Keterangan  220px
Aksi        48px
```

Implement via `w-[...] min-w-[...]` on the relevant headers. Minor 8–16px tuning is allowed during implementation only if necessary to avoid clipping; do not reduce the table below the specified conceptual widths by compressing all fields.

- [ ] **Step 4: Make the table header sticky to its real scroll container**

Use:

```tsx
<thead className="sticky top-0 z-10 border-b border-border bg-surface-subtle">
```

Keep row cells vertically aligned at the top for multiline rows; keep No and action cells aligned centrally where appropriate.

- [ ] **Step 5: Reduce spreadsheet cell chrome**

Use consistent cell padding such as `px-1.5 py-1.5`. Keep the table's subtle row divider from `Table.BodyRow`; do not add a heavy border around every cell.

Keep action trigger as the existing one `...` menu. Preserve exact menu actions:
- `Atur cabang decision` for decision rows;
- `Tambah langkah setelah ini`;
- `Hapus langkah` when more than one row exists.

- [ ] **Step 6: Preserve mobile architecture but remove unnecessary shadow emphasis**

Keep the current card-per-step mobile structure. Change only styling to the existing neutral surface vocabulary:

```tsx
<section className="rounded-surface border border-border bg-surface p-3">
```

Do not change mobile navigation or field order.

- [ ] **Step 7: Keep editor footer simple**

Retain the two existing actions and callbacks. Use compact control sizing consistent with the workbench:

```tsx
<Button variant="outline" size="sm" className="h-9" ...>
  Tambah langkah
</Button>
<Button size="sm" className="h-9" ...>
  Selesai edit
</Button>
```

Do not add sticky footer behavior in this task.

- [ ] **Step 8: Verify validation behavior remains unchanged**

Add a test with an invalid procedure model. Click `Selesai edit`; assert `showToast` receives `formatProsedurValidationMessage(...)` and `onDone` is not called. Then render valid data and assert `onDone` is called once.

- [ ] **Step 9: Run GREEN**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopProsedurEditor.test.tsx src/pages/penyusun/sop/detail/components/__tests__/ProsedurEditorCells.test.tsx
pnpm typecheck
```

- [ ] **Step 10: Commit**

```bash
git add client/src/pages/penyusun/sop/detail/components/DetailSopProsedurEditor.tsx client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopProsedurEditor.test.tsx
git commit -m "refactor(client): refine SOP procedure spreadsheet"
```

---

## Task 6: Quiet the preview/edit-mode toolbar without changing diagram behavior

**Files:**
- Modify: `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunMain.tsx`
- Create or extend: `client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunMain.test.tsx`

**Interfaces:**
- Keep `activeTab`, `onActiveTabChange`, `isEditingSteps`, `setIsEditingSteps` props unchanged.
- Keep `usePenyusunDiagramConfig`, idle diagram mounting, manual path state, reset handlers, and `SOPPreviewTemplate` props unchanged.

- [ ] **Step 1: Write failing toolbar-state test**

Mock diagram/workbench dependencies and assert:

```tsx
expect(screen.getByRole('group', { name: 'Kontrol dokumen SOP' })).toBeInTheDocument()
expect(screen.getByRole('button', { name: /Langkah|Diagram/ })).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Edit Manual' })).toBeInTheDocument()
```

When manual edit is active, assert `Reset semua path` appears. When read-only, assert editing controls are absent.

- [ ] **Step 2: Run RED only if the test encodes the new active-state contract**

The current behavior may already satisfy presence tests. Add a stable structural contract by asserting the toolbar does not use `shadow-surface` for active modes and instead uses one `aria-pressed` state on mode buttons.

- [ ] **Step 3: Add explicit pressed-state semantics**

For the steps button:

```tsx
aria-pressed={isEditingSteps}
```

For manual path button:

```tsx
aria-pressed={diagramConfig.isEditingDiagramPaths}
```

Keep existing click handlers.

- [ ] **Step 4: Flatten visual treatment**

Change the toolbar wrapper to:

```tsx
<div
  className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-control border border-border bg-surface p-1"
  role="group"
  aria-label="Kontrol dokumen SOP"
>
```

Active buttons use `bg-surface-muted text-foreground`; inactive buttons remain ghost. Remove the active `shadow-surface`/nested ring treatment.

- [ ] **Step 5: Run focused tests**

```bash
pnpm test -- src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunMain.test.tsx
pnpm typecheck
```

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunMain.tsx client/src/pages/penyusun/sop/detail/components/__tests__/DetailSopPenyusunMain.test.tsx
git commit -m "refactor(client): simplify SOP preview controls"
```

---

## Task 7: End-to-end regression, code review, and merge gate

**Files:**
- Modify existing SOP detail/editor Playwright spec if repository search finds one.
- Otherwise create: `client/e2e/detail-sop-workbench-ui.spec.ts`

**Interfaces:**
- E2E asserts user-visible behavior only; do not assert Tailwind class names.

- [ ] **Step 1: Locate the current SOP detail editor journey**

Run:

```bash
rg "penyusun/sop|Edit SOP|Selesai edit|Tambah langkah" client/e2e
```

If an existing spec already covers the editor, extend that exact file. If none exists, create `client/e2e/detail-sop-workbench-ui.spec.ts` using the repository's existing login/fixture helpers.

- [ ] **Step 2: Add breadcrumb/back regression**

After opening the Penyusun SOP detail page:

```ts
await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
await expect(page.getByRole('link', { name: 'Manajemen SOP' })).toBeVisible()
await expect(page.getByTitle('Kembali')).toHaveCount(0)
```

- [ ] **Step 3: Add workbench hierarchy regression**

Assert the SOP name is visible in the workspace command bar and the primary workflow action remains available according to the fixture's status/role. Open `Aksi dokumen lainnya` when present and assert permitted print/version actions remain reachable.

- [ ] **Step 4: Add property inspector regression**

Open/select the first panel tab and assert `Properti` is visible in editable mode. Assert `Nama SOP`, `Nomor SOP`, and at least one add action such as `Tambah dasar hukum` remain reachable.

- [ ] **Step 5: Add procedure spreadsheet regression**

Enter `Langkah` editing mode. Assert:

```ts
await expect(page.getByRole('columnheader', { name: 'Kegiatan' })).toBeVisible()
await expect(page.getByRole('textbox', { name: 'Kegiatan' }).first()).toBeVisible()
await expect(page.getByRole('button', { name: 'Tambah langkah' })).toBeVisible()
await expect(page.getByRole('button', { name: 'Selesai edit' })).toBeVisible()
```

Update one existing row field and verify the field remains in-place; do not change fixture business status merely to test styling.

- [ ] **Step 6: Run focused client verification**

From `client/`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All four commands must exit successfully.

- [ ] **Step 7: Run relevant Playwright coverage when local prerequisites are available**

Run the existing extended spec or:

```bash
pnpm exec playwright test e2e/detail-sop-workbench-ui.spec.ts
```

If local infrastructure is unavailable, record the exact blocker in the PR body and rely on mandatory repository CI for the E2E gate; do not claim local E2E success.

- [ ] **Step 8: Final stale-pattern scans**

```bash
rg "backTo=|backSize=" client/src/pages client/src/components/layout
rg "MetadataFieldCard" client/src
rg "Dokumen SOP" client/src/pages/penyusun/sop/detail
rg "onWheel" client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunHeader.tsx
rg "overflow-x-auto" client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunHeader.tsx
```

Expected:
- no `DetailPageLayout` back props;
- no `MetadataFieldCard` helper;
- no generic dominant `Dokumen SOP` label in the SOP command bar;
- no wheel-remapped/horizontal-scroll command bar.

`overflow-x-auto` remains expected in the procedure editor itself.

- [ ] **Step 9: Request code review against the spec**

Review the branch for:
- accidental business/API changes;
- lost metadata fields or handlers;
- permission/role regressions;
- autosave/live-region regressions;
- procedure validation regressions;
- mobile editor behavior changes beyond styling;
- unnecessary new abstractions/dependencies.

Fix critical/important findings before PR completion.

- [ ] **Step 10: Open PR**

Title:

```text
refactor(client): redesign detail SOP workbench
```

Body summary:

```text
- use clickable breadcrumbs as the only visible back navigation on authenticated detail workspaces;
- simplify the Penyusun SOP command bar around document identity, autosave, one primary workflow action, and secondary document actions;
- convert the SOP metadata panel from nested cards into a compact property inspector;
- preserve inline procedure editing while standardizing compact auto-growing fields, column sizing, time controls, scrolling, and table hierarchy;
- simplify preview/edit controls without changing diagram state or business workflow.
```

Mention the approved design and implementation-plan paths.

- [ ] **Step 11: Require full repository CI success**

Fetch the PR workflow run for the exact head SHA. Require overall success for the repository's mandatory jobs, including client quality, server quality, database migration invariants, minimal production config, critical E2E business journeys, and container builds when those jobs are part of the normal PR workflow.

- [ ] **Step 12: Squash merge only after CI success and no unresolved blocker**

Use squash merge. Verify the PR afterward and require:

```text
state = closed
merged = true
base = main
```

Then fetch `main` and report the resulting squash commit SHA.

---

## Acceptance checklist

- Authenticated detail pages do not render a standalone back button above the workspace.
- Every migrated detail page has a deterministic clickable ancestor breadcrumb.
- `DetailPageLayout` no longer exposes `backTo`, `backSize`, or generic local `actions` ownership.
- Penyusun SOP command bar uses the SOP identity rather than a dominant generic `Dokumen SOP` label.
- Command bar has no horizontal scrolling or vertical-wheel-to-horizontal remapping.
- Autosave remains announced via live-region semantics; saved is subtle, error exposes retry.
- Exactly one permitted workflow action is visually primary.
- Print/version actions retain existing conditions/blocking behavior and remain reachable as secondary actions.
- Revision guidance remains visible with the same domain branching.
- Editable right-panel tab is labeled `Properti`; read-only mode remains `Informasi`.
- All metadata groups/fields, add/remove dialogs, implementer behavior, and autosave handlers remain present.
- Metadata presentation no longer uses card-per-section `MetadataFieldCard` wrappers.
- Procedure editor remains an inline desktop table and preserves the existing mobile structure.
- Kegiatan, Kelengkapan, Output, and Keterangan start compact and auto-grow.
- Tipe/Pelaksana/select controls share the same resting height and focus treatment.
- Waktu remains two independently focusable inputs but reads visually as one compound control.
- Procedure columns use intentional widths and the desktop editor has discoverable horizontal scrolling.
- Procedure table header remains visible while scrolling through long data.
- Row menu, decision configuration, add/delete row behavior, and validation-before-done remain unchanged.
- Preview/manual-path controls expose clear pressed-state semantics and retain all existing diagram behavior.
- Client typecheck, lint, unit tests, production build, relevant Playwright coverage, and mandatory repository CI pass before squash merge.

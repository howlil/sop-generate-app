# Admin Surface Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the admin pages visible in the user's screenshots so they are more readable, restrained, compact, and task-oriented without changing domain behavior.

**Architecture:** Keep the existing `DataSurface`, table, dialog, route, API, and mutation patterns. Add only small reusable presentation primitives where they remove repeated visual debt, then migrate the scoped pages one by one: Pantau SOP, rating helper, Manajemen OPD shell, OPD/Kepala OPD rows, and Kepala OPD detail pengajuan summary. All changes are frontend presentation changes.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, Radix UI wrappers, Vitest, Testing Library, Playwright, pnpm.

## Global Constraints

- Frontend/UI refactor only; do not change backend endpoints, DTOs, Prisma schema, API contracts, route permissions, role checks, or workflow transitions.
- Scope is limited to screenshot pages: Kepala OPD SOP list, Kepala OPD detail pengajuan, evaluator/PJ Evaluator penilaian SOP, PJ Evaluator Manajemen OPD, and Kepala OPD list rows.
- Do not redesign public archive, login, landing, dashboard, or the SOP workbench again.
- Do not replace `DataSurface`, `Table`, Radix Tabs, or existing dialog primitives.
- Do not add gradients, glows, large shadows, marketing cards, decorative banners, or icon-heavy fake SaaS treatment.
- Search inputs keep descriptive `aria-label` values.
- Tabs keep keyboard behavior through the existing Tabs primitives.
- Row actions keep accessible names and do not rely on icons alone for high-value actions.
- Rating picker keeps radiogroup semantics, roving focus, `aria-checked`, and disabled behavior.
- Existing data fetching, mutation hooks, route params, permission checks, revocation rules, print/TTE behavior, evaluation submit behavior, create/edit/delete/pindah behavior, and workflow status behavior remain the source of truth.
- Use branch `refactor/admin-surface-polish` for the full iteration.
- Follow TDD for changed contracts and require full CI before merge.

---

## File map

### New/reused small presentation primitives

- Create: `client/src/components/ui/inline-helper-note.tsx`
- Create: `client/src/components/ui/__tests__/inline-helper-note.test.tsx`
- Modify: `client/src/components/ui/tabs.tsx` only if a compact line variant can be added without breaking existing variants. Prefer page-level class composition if the primitive does not currently support variants.

### Pantau SOP

- Modify: `client/src/pages/kepala-opd/sop/PantauSOP.tsx`
- Create: `client/src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx`

### Penilaian SOP helper

- Modify: `client/src/pages/evaluator/evaluasi/components/SkorRatingPicker.tsx`
- Create or modify: `client/src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx`

### Manajemen OPD shell and tabs

- Modify: `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- Create: `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx`

### OPD and Kepala OPD rows

- Modify: `client/src/pages/pj-evaluator/opd/components/OPDTab.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx`
- Create: `client/src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx`
- Create: `client/src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx`

### Kepala OPD detail pengajuan

- Modify: `client/src/pages/kepala-opd/pengajuan/DetailPengajuanSOPPage.tsx`
- Create or modify: `client/src/pages/kepala-opd/pengajuan/__tests__/DetailPengajuanSOPPage.test.tsx`
- Modify E2E helper only if current critical journeys depend on labels moved by the redesign.

---

## Task 1: Add compact helper note primitive

**Files:**
- Create: `client/src/components/ui/inline-helper-note.tsx`
- Create: `client/src/components/ui/__tests__/inline-helper-note.test.tsx`

**Interfaces:**
- Produces: `InlineHelperNote({ label?: string; children: React.ReactNode; tone?: 'neutral' | 'warning' | 'danger'; className?: string })`.
- Consumers: `SkorRatingPicker` and optionally summary/helper areas in later tasks.

- [ ] **Step 1: Write failing tests**

Create `client/src/components/ui/__tests__/inline-helper-note.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InlineHelperNote } from '../inline-helper-note'

describe('InlineHelperNote', () => {
  it('renders quiet neutral helper copy without alert semantics by default', () => {
    render(<InlineHelperNote label="Skala nilai">1 sangat rendah, 5 sangat tinggi.</InlineHelperNote>)

    expect(screen.getByText('Skala nilai')).toBeInTheDocument()
    expect(screen.getByText('1 sangat rendah, 5 sangat tinggi.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('uses alert semantics only for warning or danger tone', () => {
    render(<InlineHelperNote tone="warning">Data belum lengkap.</InlineHelperNote>)

    expect(screen.getByRole('alert')).toHaveTextContent('Data belum lengkap.')
  })
})
```

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/components/ui/__tests__/inline-helper-note.test.tsx
```

Expected: FAIL because `inline-helper-note.tsx` does not exist.

- [ ] **Step 3: Implement primitive**

Create `client/src/components/ui/inline-helper-note.tsx`:

```tsx
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface InlineHelperNoteProps {
  label?: string
  children: ReactNode
  tone?: 'neutral' | 'warning' | 'danger'
  className?: string
}

const toneClassName: Record<NonNullable<InlineHelperNoteProps['tone']>, string> = {
  neutral: 'text-muted-foreground',
  warning: 'text-warning',
  danger: 'text-danger',
}

export function InlineHelperNote({
  label,
  children,
  tone = 'neutral',
  className,
}: InlineHelperNoteProps) {
  const isAlert = tone === 'warning' || tone === 'danger'

  return (
    <p
      role={isAlert ? 'alert' : undefined}
      className={cn('text-xs leading-relaxed', toneClassName[tone], className)}
    >
      {label ? <span className="font-medium text-secondary-foreground">{label}: </span> : null}
      <span>{children}</span>
    </p>
  )
}
```

- [ ] **Step 4: Run GREEN**

```bash
pnpm test -- src/components/ui/__tests__/inline-helper-note.test.tsx
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ui/inline-helper-note.tsx client/src/components/ui/__tests__/inline-helper-note.test.tsx
git commit -m "feat(client): add inline helper note primitive"
```

---

## Task 2: Polish Pantau SOP list actions and context

**Files:**
- Modify: `client/src/pages/kepala-opd/sop/PantauSOP.tsx`
- Create: `client/src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx`

**Interfaces:**
- Consumes existing `useSop`, `useCabutSop`, `SOPStatusFilterSelect`, `Table`, and `CabutSopDialog`.
- Produces visible title `Pantau SOP`, subtitle, result count text, labeled row action `Lihat`, and labeled destructive action `Cabut` only when `canShowCabutSopAction` allows it.

- [ ] **Step 1: Write failing tests**

Create `client/src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx`:

```tsx
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PantauSOP } from '../PantauSOP'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}))

vi.mock('@/components/layout/ListPageLayout', () => ({
  ListPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}))

vi.mock('@/components/sop/sop-status-filter-select', () => ({
  SOPStatusFilterSelect: ({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) => (
    <select aria-label="Filter status SOP" value={value} onChange={(event) => onValueChange(event.target.value)}>
      <option value="all">Semua Status</option>
      <option value="BERLAKU">Berlaku</option>
    </select>
  ),
}))

vi.mock('@/api/sop', () => ({
  useCabutSop: () => ({ cabutSopAsync: vi.fn(), isCabutPending: false }),
  useSop: () => ({
    list: [
      {
        id: 'sop-1',
        judul: 'sop lama',
        nomorSop: '123456',
        terakhirDiperbarui: '2026-08-14T00:00:00.000Z',
        status: 'BERLAKU',
        statusLabel: 'Berlaku',
        canCabutSop: true,
        versiBerlaku: { status: 'BERLAKU', nomorSop: '123456' },
      },
      {
        id: 'sop-2',
        judul: 'contoh sop',
        nomorSop: '123',
        terakhirDiperbarui: '2026-08-14T00:00:00.000Z',
        status: 'DRAFT',
        statusLabel: 'Draft',
        canCabutSop: false,
        versiBerlaku: { status: 'DRAFT', nomorSop: '123' },
      },
    ],
  }),
}))

describe('PantauSOP', () => {
  it('shows task-oriented title, subtitle, and result count', () => {
    render(<PantauSOP />)

    expect(screen.getByRole('heading', { name: 'Pantau SOP' })).toBeInTheDocument()
    expect(screen.getByText('Lihat status SOP yang sedang dinilai, berlaku, draft, atau perlu tindakan.')).toBeInTheDocument()
    expect(screen.getByText('2 dokumen')).toBeInTheDocument()
  })

  it('uses readable row actions instead of icon-only view action', () => {
    render(<PantauSOP />)

    expect(screen.getAllByRole('link', { name: /^Lihat/ })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Cabut sop lama' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cabut contoh sop' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx
```

Expected: FAIL because current page title is `SOP`, no subtitle/count, and row view action is icon-only.

- [ ] **Step 3: Implement Pantau SOP polish**

Modify `PantauSOP.tsx`:

- Change `ListPageLayout` title to `Pantau SOP`.
- Add a subtitle paragraph inside `DataSurface.Header` before toolbar:

```tsx
<div className="space-y-1">
  <p className="text-sm text-muted-foreground">
    Lihat status SOP yang sedang dinilai, berlaku, draft, atau perlu tindakan.
  </p>
</div>
```

- Add result count after toolbar or before table:

```tsx
<p className="px-card pb-2 text-xs text-muted-foreground">
  {filteredList.length} {filteredList.length === 1 ? 'dokumen' : 'dokumen'}
</p>
```

- Replace `RowActions` for the view action with explicit text buttons in `Table.ActionTd`:

```tsx
<div className="flex items-center justify-end gap-2">
  <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
    <Link to={ROUTES.KEPALA_OPD.DETAIL_SOP} params={{ id: sop.id }} aria-label={`Lihat ${sop.judul}`}>
      Lihat
    </Link>
  </Button>
  {showCabut ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 px-2 text-xs text-danger hover:bg-danger-subtle hover:text-danger"
      disabled={isCabutPending || cabutBlockReason != null}
      title={cabutBlockReason ?? undefined}
      aria-label={`Cabut ${sop.judul}`}
      onClick={() => setCabutTarget(sop)}
    >
      Cabut
    </Button>
  ) : null}
</div>
```

Keep existing `cabutBlockReason` and `CabutSopDialog` behavior.

- [ ] **Step 4: Run GREEN**

```bash
pnpm test -- src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/kepala-opd/sop/PantauSOP.tsx client/src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx
git commit -m "refactor(client): clarify Kepala OPD SOP list actions"
```

---

## Task 3: Replace blue rating explanation with compact helper note

**Files:**
- Modify: `client/src/pages/evaluator/evaluasi/components/SkorRatingPicker.tsx`
- Create or modify: `client/src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx`

**Interfaces:**
- Consumes: `InlineHelperNote` from Task 1.
- Preserves: `SkorRatingPickerProps`, `SKOR_OPTIONS`, keyboard navigation, radiogroup, `aria-checked`, disabled behavior, and `onChange`.

- [ ] **Step 1: Write failing tests**

Create `client/src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx` if it does not exist:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SkorRatingPicker } from '../SkorRatingPicker'

describe('SkorRatingPicker', () => {
  it('renders compact neutral score guidance instead of a blue instruction card', () => {
    render(<SkorRatingPicker value={3} onChange={vi.fn()} />)

    expect(screen.getByText('Skala nilai')).toBeInTheDocument()
    expect(screen.getByText('1 Sangat rendah · 2 Rendah · 3 Sedang · 4 Tinggi · 5 Sangat tinggi')).toBeInTheDocument()
    expect(screen.queryByText('Arti nilai: 1 adalah nilai terendah dan 5 adalah nilai tertinggi.')).not.toBeInTheDocument()
  })

  it('preserves radiogroup click and checked semantics', () => {
    const onChange = vi.fn()
    render(<SkorRatingPicker value={2} onChange={onChange} />)

    expect(screen.getByRole('radio', { name: '2 - Rendah' })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: '5 - Sangat tinggi' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })
})
```

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx
```

Expected: FAIL because the large blue instruction copy still exists and compact helper note is absent.

- [ ] **Step 3: Implement compact helper**

Modify `SkorRatingPicker.tsx`:

- Import `InlineHelperNote`.
- Keep existing `FormField`, label, button rendering, keyboard handler.
- Replace the blue instruction block with:

```tsx
<InlineHelperNote label="Skala nilai" className="mt-2">
  1 Sangat rendah · 2 Rendah · 3 Sedang · 4 Tinggi · 5 Sangat tinggi
</InlineHelperNote>
```

- Keep optional `hint` but render it as quiet text:

```tsx
{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
```

- [ ] **Step 4: Run GREEN**

```bash
pnpm test -- src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx
pnpm test -- src/components/ui/__tests__/inline-helper-note.test.tsx
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/evaluator/evaluasi/components/SkorRatingPicker.tsx client/src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx
git commit -m "refactor(client): quiet evaluation score guidance"
```

---

## Task 4: Compact Manajemen OPD shell and move create actions into toolbar

**Files:**
- Modify: `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/components/OPDTab.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx`
- Create: `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx`

**Interfaces:**
- `OPDTab` receives a new `onCreateClick: () => void` prop only if the create dialog state is lifted to `ManajemenOPD`. Preferred approach: lift create dialog opening state only enough to render the active create button in `DataSurface.Toolbar` while keeping create confirm logic in `OPDTab` if low-risk.
- `KepalaOPDTab` receives a new optional `hideCreateButton?: boolean` or the create button is lifted similarly. Preferred approach: move visible trigger into parent, but keep dialog and form state in the tab through a passed `createTrigger` render prop only if needed.

Because the existing tabs own dialog state, use the simpler safe contract:

```ts
export interface OPDTabProps {
  filteredOPD: OPD[]
  hasRelasiData: (opd: OPD) => boolean
  onDelete: (id: string) => void
  onCreate: (name: string) => void | Promise<void>
  onUpdate: (payload: { id: string; name: string }) => void | Promise<void>
  renderCreateAction?: (openCreateDialog: () => void) => React.ReactNode
}

export interface KepalaOPDTabProps {
  // existing props unchanged
  renderCreateAction?: (openCreateDialog: () => void) => React.ReactNode
}
```

Each tab registers its create action with the parent through `renderCreateAction` rendering location. If that is too awkward, create a small `TabActionContext` local to `ManajemenOPD`; do not introduce global state.

- [ ] **Step 1: Write failing shell tests**

Create `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx` with API mocks returning empty lists:

```tsx
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ManajemenOPD } from '../ManajemenOPD'

vi.mock('@/components/layout/ListPageLayout', () => ({
  ListPageLayout: ({ title, children }: { title: string; children: ReactNode }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}))

vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ showToast: vi.fn() }) }))
vi.mock('@/hooks/use-debounced-value', () => ({ useDebouncedValue: (value: string) => value }))
vi.mock('@/api/opd', () => ({ useOpd: () => ({ list: [], create: vi.fn(), update: vi.fn(), delete: vi.fn() }) }))
vi.mock('@/api/kepala-opd', () => ({
  useKepalaOpdList: () => ({ data: [], isLoading: false }),
  useCreateKepalaOpd: () => ({ mutateAsync: vi.fn() }),
  useUpdateKepalaOpd: () => ({ mutateAsync: vi.fn() }),
  useDeleteKepalaOpd: () => ({ mutateAsync: vi.fn() }),
}))

describe('ManajemenOPD', () => {
  it('uses compact tabs and places OPD create action in the toolbar', () => {
    render(<ManajemenOPD />)

    expect(screen.getByRole('heading', { name: 'Manajemen Organisasi' })).toBeInTheDocument()
    expect(screen.getByText('Kelola OPD dan akun Kepala OPD.')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'OPD' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Kepala OPD' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah OPD' })).toBeInTheDocument()
  })

  it('switches toolbar create action with the active tab', async () => {
    const user = userEvent.setup()
    render(<ManajemenOPD />)

    await user.click(screen.getByRole('tab', { name: 'Kepala OPD' }))

    expect(screen.getByPlaceholderText('Cari nama, NIP, atau email...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah Kepala OPD' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah OPD' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
```

Expected: FAIL because current title is `Manajemen OPD`, tabs are labeled `Manajemen OPD`, and create actions live in detached child strips.

- [ ] **Step 3: Implement compact shell**

Modify `ManajemenOPD.tsx`:

- Change visible title to `Manajemen Organisasi`.
- Add subtitle in `DataSurface.Header`:

```tsx
<p className="text-sm text-muted-foreground">Kelola OPD dan akun Kepala OPD.</p>
```

- Replace full-width segmented `TabsList` classes with compact line classes:

```tsx
<TabsList className="inline-flex h-9 w-auto gap-4 rounded-none border-0 bg-transparent p-0">
  <TabsTrigger value="opd" className="rounded-none border-b-2 border-transparent px-0 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
    OPD
  </TabsTrigger>
  <TabsTrigger value="kepala" className="rounded-none border-b-2 border-transparent px-0 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none">
    Kepala OPD
  </TabsTrigger>
</TabsList>
```

- Move active create button into `DataSurface.Toolbar` right side:

```tsx
<div className="ml-auto flex shrink-0 items-center">
  {activeTab === 'opd' ? <Button size="sm" onClick={openOpdCreate}>Tambah OPD</Button> : <Button size="sm" onClick={openKepalaCreate}>Tambah Kepala OPD</Button>}
</div>
```

If keeping dialog state inside child components, implement callback registration with `useState<(() => void) | null>` and child-provided `registerCreateAction`. Prefer lifting only the open state if simpler after reading current code.

- Remove detached `border-b` create strips from `OPDTab` and `KepalaOPDTab`.

- [ ] **Step 4: Run GREEN**

```bash
pnpm test -- src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx client/src/pages/pj-evaluator/opd/components/OPDTab.tsx client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
git commit -m "refactor(client): compact organization management shell"
```

---

## Task 5: Clarify OPD and Kepala OPD row actions

**Files:**
- Modify: `client/src/pages/pj-evaluator/opd/components/OPDTab.tsx`
- Modify: `client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx`
- Create: `client/src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx`
- Create: `client/src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx`

**Interfaces:**
- Preserve `onDelete`, `onCreate`, `onUpdate`, `onPindah`, `onDeleteRequest`, `canDeleteKepala`, `onCreate`, and all dialog behavior.
- Produce row actions that are horizontal and readable: OPD row has `Ubah` visible and destructive delete in menu or clearly separated; Kepala OPD row uses one visible `Ubah` plus overflow for `Riwayat penugasan`, `Pindah OPD`, and `Hapus Kepala OPD`, or a single `Kelola` menu if space is tight.

- [ ] **Step 1: Write OPD row test**

Create `client/src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OPDTab } from '../OPDTab'

describe('OPDTab', () => {
  it('renders readable horizontal actions for OPD rows', () => {
    render(
      <OPDTab
        filteredOPD={[{ id: 'opd-1', name: 'Dinas Kesehatan Provinsi' }]}
        hasRelasiData={() => false}
        onDelete={vi.fn()}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
      />,
    )

    expect(screen.getByText('Dinas Kesehatan Provinsi')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ubah Dinas Kesehatan Provinsi' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aksi Dinas Kesehatan Provinsi' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Write Kepala OPD row test**

Create `client/src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { KepalaOPDTab } from '../KepalaOPDTab'

describe('KepalaOPDTab', () => {
  it('keeps row actions horizontal and exposes secondary actions in a menu', async () => {
    const user = userEvent.setup()
    render(
      <KepalaOPDTab
        opdList={[{ id: 'opd-1', name: 'Dinas Kesehatan' }]}
        kepalaRows={[
          {
            id: 'kepala-1',
            nama: 'Budi Santoso, A.Md.Kep',
            nip: '198501012009011004',
            email: 'penyusun.dinkes@gmail.com',
            nohp: '6281234567894',
            opdId: 'opd-1',
            namaOpd: 'Dinas Kesehatan',
            jabatan: 'Analis SOP Dinkes',
            pangkat: null,
            isActive: true,
            dapatDihapus: true,
          },
        ]}
        isLoading={false}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onPindah={vi.fn()}
        onDeleteRequest={vi.fn()}
        canDeleteKepala={() => true}
      />,
    )

    expect(screen.getByRole('button', { name: 'Ubah Budi Santoso, A.Md.Kep' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Aksi Budi Santoso, A.Md.Kep' }))
    expect(screen.getByRole('menuitem', { name: /Riwayat penugasan/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Pindah OPD/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Hapus Kepala OPD/ })).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run RED**

```bash
cd client
pnpm test -- src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx
```

Expected: FAIL because OPD actions are icon-only and Kepala OPD does not expose a visible `Ubah` button.

- [ ] **Step 4: Implement row actions**

- OPD row: replace icon-only `RowActions` with a visible `Ubah` ghost button and overflow menu for delete:

```tsx
<div className="flex items-center justify-end gap-2">
  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" aria-label={`Ubah ${opd.name}`} onClick={() => openEditDialog(opd)}>
    Ubah
  </Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Aksi ${opd.name}`}>
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem disabled={hasRelasiData(opd)} onClick={() => onDelete(opd.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Hapus OPD
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

- Kepala OPD row: keep current menu behavior but add visible `Ubah` button that opens manage dialog on edit tab. Change menu label to `Aksi {nama}` and include `Riwayat penugasan`, `Pindah OPD`, `Hapus Kepala OPD`. The `Pindah OPD` item should set `manageTab` to `pindah` before opening.

- [ ] **Step 5: Run GREEN**

```bash
pnpm test -- src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/pj-evaluator/opd/components/OPDTab.tsx client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx client/src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx client/src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx
git commit -m "refactor(client): clarify organization row actions"
```

---

## Task 6: Compact Kepala OPD detail pengajuan summary

**Files:**
- Modify: `client/src/pages/kepala-opd/pengajuan/DetailPengajuanSOPPage.tsx`
- Create or modify: `client/src/pages/kepala-opd/pengajuan/__tests__/DetailPengajuanSOPPage.test.tsx`

**Interfaces:**
- Preserve: existing print/sign controls, `PengajuanCetakArsipButtons`, `PengajuanEvaluasiStatusHeader`, `SOPListCard`, `DocumentPreviewTabs`, selected SOP state, pin dialog, and all existing mutation handlers.
- Produces: compact summary header with `Pengajuan Evaluasi`, OPD summary, document count, BA number, status pill, quieter `Alur pengajuan evaluasi` disclosure, and reduced preview spacing.

- [ ] **Step 1: Write failing summary test**

Create a focused component test with mocks for data-heavy children. If the page currently has many hook dependencies, mock them at the module boundary and assert only the summary area:

```tsx
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DetailPengajuanSOPPage } from '../DetailPengajuanSOPPage'

vi.mock('@/components/layout/DetailPageLayout', () => ({
  DetailPageLayout: ({ header, leftPanel, children }: { header?: ReactNode; leftPanel?: ReactNode; children?: ReactNode }) => (
    <main>
      <section aria-label="summary">{header}</section>
      <aside>{leftPanel}</aside>
      <section>{children}</section>
    </main>
  ),
}))

// Mock API hooks used by the page to return one completed pengajuan and one SOP.
// Keep mocks local to this test file and return only fields read during render.

describe('DetailPengajuanSOPPage summary header', () => {
  it('renders compact pengajuan summary and keeps actions near the header', () => {
    render(<DetailPengajuanSOPPage />)

    expect(screen.getByRole('heading', { name: 'Pengajuan Evaluasi' })).toBeInTheDocument()
    expect(screen.getByText(/Dinas Kesehatan Provinsi/)).toBeInTheDocument()
    expect(screen.getByText(/1 dokumen/)).toBeInTheDocument()
    expect(screen.getByText(/BA:/)).toBeInTheDocument()
    expect(screen.getByText('Pengajuan evaluasi selesai')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Alur pengajuan evaluasi/ })).toHaveClass('text-secondary-foreground')
  })
})
```

If the test setup becomes too brittle, move the summary block into a local exported component `PengajuanSummaryHeader` inside `components/PengajuanSummaryHeader.tsx` and test that component directly. That split is preferred over mocking a large route page.

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/pages/kepala-opd/pengajuan/__tests__/DetailPengajuanSOPPage.test.tsx
```

Expected: FAIL because current header uses `Informasi Pengajuan` and spread-out metadata.

- [ ] **Step 3: Implement summary header**

In `DetailPengajuanSOPPage.tsx`, replace the large header grid with:

```tsx
<div className="space-y-4">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="min-w-0 space-y-1">
      <h2 className="text-base font-semibold text-foreground">Pengajuan Evaluasi</h2>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{pengajuan.opdNama ?? pengajuan.opd?.nama ?? '—'}</span>
        <span> · {allSopList.length} dokumen</span>
        <span> · BA: {pengajuan.nomorBA ?? '—'}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        Tanggal BA ditandatangani PJ Penyusun: {formatDateIdFull(pengajuan.tanggalTTDBaPjPenyusun)}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <PengajuanCetakArsipButtons ...existingProps />
      {canShowSignAll ? <Button ...existingProps /> : null}
    </div>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-2">
    <PengajuanEvaluasiStatusHeader ...existingProps />
    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-secondary-foreground">
      Alur pengajuan evaluasi
    </Button>
  </div>
  {existingWarningBlocks}
</div>
```

Keep existing warnings and eligibility blocks after the summary/status section.

For left panel compactness, reduce `SOPListCard` wrapper padding only if its component is local to this page or has a safe compact prop. Do not globally shrink every SOP list unless tests cover it.

- [ ] **Step 4: Run GREEN**

```bash
pnpm test -- src/pages/kepala-opd/pengajuan/__tests__/DetailPengajuanSOPPage.test.tsx
pnpm typecheck
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/kepala-opd/pengajuan/DetailPengajuanSOPPage.tsx client/src/pages/kepala-opd/pengajuan/__tests__/DetailPengajuanSOPPage.test.tsx
git commit -m "refactor(client): compact Kepala OPD pengajuan detail summary"
```

---

## Task 7: E2E selectors and final verification

**Files:**
- Modify E2E files only if the changed labels/actions break existing executed journeys.
- Candidate files: `client/e2e/master-data.spec.ts`, `client/e2e/journeys/*.spec.ts`, `client/e2e/support/business-actions.ts`.

**Interfaces:**
- Preserve current tested business journeys.
- Add assertions to existing executed tests when possible; do not add a standalone E2E spec that CI never runs.

- [ ] **Step 1: Run targeted client tests**

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test -- src/components/ui/__tests__/inline-helper-note.test.tsx src/pages/kepala-opd/sop/__tests__/PantauSOP.test.tsx src/pages/evaluator/evaluasi/components/__tests__/SkorRatingPicker.test.tsx src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx src/pages/pj-evaluator/opd/components/__tests__/OPDTab.test.tsx src/pages/pj-evaluator/opd/components/__tests__/KepalaOPDTab.test.tsx src/pages/kepala-opd/pengajuan/__tests__/DetailPengajuanSOPPage.test.tsx
pnpm build
```

Expected: PASS.

- [ ] **Step 2: Run E2E audit**

```bash
cd client
pnpm e2e:audit
```

Expected: PASS. If it fails only on selectors renamed from `SOP` to `Pantau SOP`, `Manajemen OPD` to `Manajemen Organisasi`, or icon-only row actions to text/menu actions, update the relevant executed E2E helper to the new user-facing contract.

- [ ] **Step 3: Open PR**

Use GitHub PR title:

```text
refactor(client): polish admin surfaces from screenshots
```

PR body must include:

```markdown
## What changed
- Clarified Kepala OPD SOP list title/context and row actions.
- Replaced the blue evaluation-score helper with compact neutral guidance.
- Compact Manajemen OPD tabs and moved create actions near search.
- Clarified OPD/Kepala OPD row actions without changing dialogs/mutations.
- Compact Kepala OPD detail pengajuan summary header.

## Preserved behavior
No backend/API/DTO/Prisma changes. Existing SOP workflow, revocation, print/TTE, evaluation submit, OPD/Kepala OPD create/edit/delete/pindah, route permissions, and data fetching behavior are preserved.

## Verification
- client typecheck
- client lint
- client unit tests
- client build
- E2E audit / critical journeys if touched
- full repository CI
```

- [ ] **Step 4: Wait for full CI**

Fetch workflow runs for the PR head. Required jobs:

- Minimal production config
- Server quality
- Client quality
- Database migration invariants
- Critical E2E business journeys if triggered
- Container build

- [ ] **Step 5: Final review before merge**

Review diff against spec:

```bash
git diff main...refactor/admin-surface-polish -- client/src/pages/kepala-opd/sop client/src/pages/kepala-opd/pengajuan client/src/pages/evaluator/evaluasi/components client/src/pages/pj-evaluator/opd client/src/components/ui
```

Confirm:

- no backend/server files changed;
- no DTO/API mutations changed;
- screenshots pages are covered;
- no decorative gradients/glows/shadows were added;
- destructive actions remain available under existing permission rules;
- tests document the new visual/semantic contracts.

- [ ] **Step 6: Squash merge after green CI and explicit user instruction**

Use squash merge with commit title:

```text
refactor(client): polish admin surfaces from screenshots
```

After merge, fetch PR info and main branch head before reporting completion.

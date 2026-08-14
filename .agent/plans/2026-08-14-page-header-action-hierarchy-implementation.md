# Page Header & Action Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make authenticated list pages expose a consistent breadcrumb → title → description → page-action hierarchy while keeping search/filter controls in the list toolbar.

**Architecture:** Extend the existing `PageHeaderProvider` contract rather than introducing a second header system. `HeaderBar` remains the single visible page heading surface; `ListPageLayout` forwards page metadata into that shared contract; list pages move create/submit actions into the existing `actions` slot while `SearchToolbar` remains result-set tooling only.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Frontend-only change: no backend, API contract, permission, route, or workflow changes.
- Keep exactly one visible page `h1`, rendered by `HeaderBar`.
- Reuse the existing `Breadcrumb` primitive.
- Preserve existing action handlers and permission checks exactly.
- Do not add filter chips or redesign filter behavior in this task.
- Do not redesign the SOP workbench/editor in this task.
- Preserve mobile navigation and responsive wrapping; do not introduce horizontal overflow.
- Required CI must be green before squash merge.

---

## File map

- `client/src/components/layout/PageHeaderProvider.tsx`: shared page-header data contract and state synchronization.
- `client/src/components/layout/HeaderBar.tsx`: renders breadcrumb, title, optional description, page actions, and global controls.
- `client/src/components/layout/ListPageLayout.tsx`: forwards list-page metadata into the page-header contract.
- `client/src/components/layout/__tests__/HeaderBar.test.tsx`: regression coverage for visible breadcrumb/title/description hierarchy.
- `client/src/components/layout/__tests__/ListPageLayout.test.tsx`: focused contract test for description/action forwarding and toolbar separation.
- `client/src/pages/penyusun/sop/ManajemenSOP.tsx`: move `Ajukan evaluasi SOP` and `Buat SOP Baru` out of `SearchToolbar` into page actions.
- `client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx`: move `Tambah Pelaksana` into page actions.
- `client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx`: move `Tambah Peraturan` into page actions.
- `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx`: move `Tambah Penyusun` into page actions.
- `client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx`: move `Tambah Anggota` into page actions.

---

### Task 1: Extend and render the shared page-header contract

**Files:**
- Modify: `client/src/components/layout/PageHeaderProvider.tsx`
- Modify: `client/src/components/layout/HeaderBar.tsx`
- Modify: `client/src/components/layout/__tests__/HeaderBar.test.tsx`

**Interfaces:**
- Consumes: existing `BreadcrumbItem[]`, `title`, `leading`, `actions` page-header fields.
- Produces: `description?: string` on both `PageHeaderContent` and `SetPageHeaderProps`; `HeaderBar` renders `Breadcrumb` and optional description.

- [ ] **Step 1: Replace the obsolete breadcrumb-hidden test with a failing hierarchy test**

Update `HeaderBar.test.tsx` so the main regression test renders:

```tsx
<SetPageHeader
  breadcrumb={[{ label: 'PJ Penyusun' }, { label: 'Berita Acara' }]}
  title="Berita Acara Evaluasi"
  description="Kelola berita acara hasil evaluasi SOP."
/>
```

and asserts:

```tsx
expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
expect(screen.getByText('PJ Penyusun')).toBeInTheDocument()
expect(screen.getByText('Berita Acara')).toHaveAttribute('aria-current', 'page')
expect(screen.getByRole('heading', { name: 'Berita Acara Evaluasi' })).toHaveClass('text-ui-title')
expect(screen.getByText('Kelola berita acara hasil evaluasi SOP.')).toHaveClass('text-muted-foreground')
```

Add a second test that omits `description` and asserts no empty description node is introduced.

- [ ] **Step 2: Run the focused test and verify RED**

Run from `client/`:

```bash
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: FAIL because breadcrumb is not rendered and `SetPageHeader` does not accept/render `description` yet.

- [ ] **Step 3: Extend `PageHeaderProvider` with `description`**

Make the contract explicit:

```tsx
export interface PageHeaderContent {
  breadcrumb: BreadcrumbItem[]
  title: string
  description?: string
  leading?: ReactNode
  actions?: ReactNode
}

export interface SetPageHeaderProps {
  breadcrumb: BreadcrumbItem[]
  title: string
  description?: string
  leading?: ReactNode
  actions?: ReactNode
  className?: string
}
```

Include `description` in the destructuring, `propsRef`, and the synchronization dependency so changing description under a stable title updates header state:

```tsx
const propsRef = useRef({ breadcrumb, title, description, leading, actions })
propsRef.current = { breadcrumb, title, description, leading, actions }

useEffect(() => {
  if (!setHeaderRef.current) return
  setHeaderRef.current(propsRef.current)
  return () => setHeaderRef.current?.(null)
}, [breadcrumbKey, title, description])
```

Do not move fetching or role logic into this provider.

- [ ] **Step 4: Render the hierarchy in `HeaderBar`**

Import the existing primitive:

```tsx
import { Breadcrumb } from '@/components/ui/breadcrumb'
```

Restructure the left header content as a compact stack while keeping `leading` aligned with title/context:

```tsx
<div suppressHydrationWarning className="order-1 flex min-w-0 flex-1 items-start gap-2">
  {headerContent ? (
    <>
      {headerContent.leading ? (
        <div className="mt-5 flex-shrink-0">{headerContent.leading}</div>
      ) : null}
      <div className="min-w-0 flex-1">
        {headerContent.breadcrumb.length > 0 ? (
          <Breadcrumb
            items={headerContent.breadcrumb}
            className="mb-0.5 min-w-0 overflow-hidden whitespace-nowrap text-muted-foreground"
          />
        ) : null}
        <h1 className="min-w-0 truncate text-ui-title font-semibold text-foreground">
          {headerContent.title}
        </h1>
        {headerContent.description ? (
          <p className="mt-0.5 max-w-3xl text-[13px]/[18px] text-muted-foreground">
            {headerContent.description}
          </p>
        ) : null}
      </div>
    </>
  ) : null}
</div>
```

Keep the right-side page actions, notification bell, profile menu, focus handling, and logout behavior intact. Allow the header to grow vertically only when breadcrumb/description are present; retain border/background tokens from the neutral shell.

- [ ] **Step 5: Run the focused test and verify GREEN**

```bash
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the shared-header behavior**

```bash
git add client/src/components/layout/PageHeaderProvider.tsx client/src/components/layout/HeaderBar.tsx client/src/components/layout/__tests__/HeaderBar.test.tsx
git commit -m "refactor(client): expose page header hierarchy"
```

---

### Task 2: Forward list-page description and actions through the shared contract

**Files:**
- Create: `client/src/components/layout/__tests__/ListPageLayout.test.tsx`
- Modify: `client/src/components/layout/ListPageLayout.tsx`

**Interfaces:**
- Consumes: `ListPageLayoutProps.description`, `actions`, `toolbar`.
- Produces: `description` passed to `SetPageHeader`; `toolbar` remains rendered in page content, not in header state.

- [ ] **Step 1: Write a failing forwarding test**

Mock `SetPageHeader` and capture the props while rendering the layout:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const setPageHeaderSpy = vi.fn()

vi.mock('@/components/layout/PageHeaderProvider', () => ({
  SetPageHeader: (props: unknown) => {
    setPageHeaderSpy(props)
    return null
  },
}))

import { ListPageLayout } from '@/components/layout/ListPageLayout'

describe('ListPageLayout', () => {
  it('forwards page metadata while keeping toolbar in page content', () => {
    render(
      <ListPageLayout
        breadcrumb={[{ label: 'SOP' }]}
        title="Manajemen SOP"
        description="Daftar SOP yang Anda kelola."
        actions={<button type="button">Buat SOP</button>}
        toolbar={<div data-testid="search-toolbar">Cari SOP</div>}
      >
        <div>Daftar</div>
      </ListPageLayout>,
    )

    expect(setPageHeaderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        breadcrumb: [{ label: 'SOP' }],
        title: 'Manajemen SOP',
        description: 'Daftar SOP yang Anda kelola.',
      }),
    )
    expect(screen.getByTestId('search-toolbar')).toBeInTheDocument()
    expect(screen.getByText('Daftar')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

```bash
pnpm test -- src/components/layout/__tests__/ListPageLayout.test.tsx
```

Expected: FAIL because `description` is currently destructured away and never forwarded.

- [ ] **Step 3: Forward `description` into `SetPageHeader`**

Update the function destructuring and call:

```tsx
export function ListPageLayout({
  breadcrumb,
  title,
  description,
  leading,
  actions,
  toolbar,
  children,
  className,
}: ListPageLayoutProps) {
  return (
    <div className={className ?? 'space-y-4 sm:space-y-section'}>
      <SetPageHeader
        breadcrumb={breadcrumb ?? []}
        title={title}
        description={description}
        leading={leading}
        actions={actions}
      />
      {toolbar}
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

```bash
pnpm test -- src/components/layout/__tests__/ListPageLayout.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the list-layout contract**

```bash
git add client/src/components/layout/ListPageLayout.tsx client/src/components/layout/__tests__/ListPageLayout.test.tsx
git commit -m "refactor(client): forward list page context"
```

---

### Task 3: Move page-wide actions out of search toolbars

**Files:**
- Modify: `client/src/pages/penyusun/sop/ManajemenSOP.tsx`
- Modify: `client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx`
- Modify: `client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx`
- Modify: `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx`
- Modify: `client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx`

**Interfaces:**
- Consumes: existing `ListPageLayout.actions` and existing button handlers/state.
- Produces: page-wide create/submit buttons in header actions; search/filter controls remain in `SearchToolbar`.

- [ ] **Step 1: Establish the green baseline before JSX movement**

```bash
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx src/components/layout/__tests__/ListPageLayout.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Move Manajemen SOP workflow actions into `actions`**

Add an `actions` prop immediately after `description`:

```tsx
actions={
  <div className="flex flex-wrap items-center justify-end gap-2">
    {canPjPenyusunRunCoordinatorActions(role ?? '') ? (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => setIsBukaPengajuanEvaluasiDialogOpen(true)}
      >
        <Send className="h-3.5 w-3.5" />
        Ajukan evaluasi SOP
      </Button>
    ) : null}
    <Button
      size="sm"
      className="h-8 gap-1.5 text-xs"
      onClick={() => setIsBuatSOPDialogOpen(true)}
    >
      <Plus className="h-3.5 w-3.5" />
      Buat SOP Baru
    </Button>
  </div>
}
```

Remove those two buttons from `SearchToolbar`; leave only `FilterDropdownButton` as its child. Preserve the exact permission predicate and dialog state handlers.

- [ ] **Step 3: Move the four master-data create actions into `actions`**

For each page, use the existing button JSX and handler unchanged, but pass it through `ListPageLayout.actions`:

`PelaksanaSOP.tsx`:

```tsx
actions={
  <Button
    size="sm"
    className="h-8 gap-1.5 text-xs"
    onClick={() => {
      resetForm()
      setIsCreateDialogOpen(true)
    }}
  >
    <Plus className="h-3.5 w-3.5" />
    Tambah Pelaksana
  </Button>
}
```

`ManajemenPeraturan.tsx`:

```tsx
actions={
  <Button
    size="sm"
    className="h-8 gap-1.5 text-xs"
    onClick={() => openPeraturanDialog()}
  >
    <Plus className="h-3.5 w-3.5" />
    Tambah Peraturan
  </Button>
}
```

`ManajemenPenyusun.tsx`:

```tsx
actions={
  <Button
    size="sm"
    className="h-8 gap-1.5 text-xs"
    onClick={() => {
      setFormData(emptyForm())
      setCreateOpdId(undefined)
      setIsCreateOpen(true)
    }}
  >
    <Plus className="h-3.5 w-3.5" />
    Tambah Penyusun
  </Button>
}
```

`ManajemenEvaluator.tsx`:

```tsx
actions={
  <Button
    size="sm"
    className="h-8 gap-1.5 text-xs"
    onClick={() => {
      resetForm()
      setIsCreateDialogOpen(true)
    }}
  >
    <Plus className="h-3.5 w-3.5" />
    Tambah Anggota
  </Button>
}
```

For all four pages, make the `SearchToolbar` search-only by removing the action child; do not change search state or API calls.

- [ ] **Step 4: Run client typecheck and the focused tests**

```bash
pnpm typecheck
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx src/components/layout/__tests__/ListPageLayout.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run lint on the client**

```bash
pnpm lint
```

Expected: PASS with no new lint errors.

- [ ] **Step 6: Commit page action migration**

```bash
git add client/src/pages/penyusun/sop/ManajemenSOP.tsx client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx
git commit -m "refactor(client): separate page and search actions"
```

---

### Task 4: Full regression verification and merge gate

**Files:**
- No new production files expected.
- Review all files changed by Tasks 1–3.

**Interfaces:**
- Consumes: completed page-header hierarchy.
- Produces: a merge-ready PR with evidence that functionality and build remain intact.

- [ ] **Step 1: Run full client verification**

From `client/`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 2: Review the diff for scope and hierarchy**

Confirm:

- only frontend layout/tests/list-page JSX plus `.agent` docs changed;
- no API hooks, permission predicates, routes, or backend code changed;
- `HeaderBar` still contains the only visible page `h1`;
- create/submit actions are passed through `ListPageLayout.actions`;
- search/filter controls remain in `SearchToolbar`;
- no filter-chip or workbench changes leaked into this task.

- [ ] **Step 3: Open one PR from `refactor/page-header-hierarchy` to `main`**

Use title:

```text
refactor(client): improve page header hierarchy
```

PR body must summarize breadcrumb/description rendering, action separation, responsive/accessibility intent, and frontend-only scope.

- [ ] **Step 4: Wait for mandatory GitHub Actions**

Required result: repository CI completes successfully, including client/server quality, database invariants, critical E2E business journeys, production config validation, and container builds where configured.

- [ ] **Step 5: Squash merge only after CI is green**

Use squash commit title:

```text
refactor(client): improve page header hierarchy
```

Delete the task branch if the connector supports branch deletion; otherwise leave the merged branch untouched rather than creating cleanup commits.

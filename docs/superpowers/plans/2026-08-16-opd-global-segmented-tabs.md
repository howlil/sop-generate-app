# OPD Global Segmented Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `OPD` / `Kepala OPD` line tabs in Manajemen Organisasi with the same shared full-width segmented tab treatment used by Evaluasi SOP `Pengajuan` / `Riwayat`.

**Architecture:** Reuse the existing `Tabs`, `TabsList`, and `TabsTrigger` primitives. `ManajemenOPD` keeps ownership of active-tab state and all existing data/query behavior; only the visual variant and sizing classes change. No new tab abstraction is introduced.

**Tech Stack:** React 19, TypeScript, Radix UI Tabs, Tailwind CSS v4, Vitest, Testing Library, GitHub Actions CI.

## Global Constraints

- Frontend UI only.
- Reuse the shared segmented tabs from `client/src/components/ui/tabs.tsx`.
- Match `client/src/components/evaluasi/evaluasi-filter-tabs.tsx`: `TabsList` uses `h-8 p-0.5 w-full grid grid-cols-2`; triggers use `h-7 text-xs`.
- Keep labels `OPD` and `Kepala OPD` unchanged.
- Preserve active-tab state, search state, API enable/disable behavior, CRUD handlers, toolbar layout, and dialogs.
- No new component and no new dependency.

---

## File Structure

- Modify `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx`: replace the old line-tab assertions with the shared segmented-tab contract.
- Modify `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`: remove the `line` variants and apply the existing global Evaluasi SOP sizing/layout classes.
- No changes to `client/src/components/ui/tabs.tsx` or `client/src/components/evaluasi/evaluasi-filter-tabs.tsx`; they are the source of truth/reference.

---

### Task 1: Define the segmented-tab regression contract

**Files:**
- Modify: `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx`

**Interfaces:**
- Consumes: rendered `ManajemenOPD` tabs through ARIA roles.
- Produces: a failing test that distinguishes the requested global segmented treatment from the current line variant.

- [ ] **Step 1: Replace the old line-tab test assertions**

Use the existing test setup and change the visual assertions to:

```tsx
it('uses the shared full-width segmented tabs used by evaluation filters', () => {
  render(<ManajemenOPD />)

  expect(screen.getByText('Kelola OPD dan akun Kepala OPD.')).toBeInTheDocument()

  const opdTab = screen.getByRole('tab', { name: 'OPD' })
  const kepalaTab = screen.getByRole('tab', { name: 'Kepala OPD' })
  const tabList = opdTab.closest('[role="tablist"]')

  expect(tabList).not.toBeNull()
  expect(tabList).toHaveClass('w-full')
  expect(tabList).toHaveClass('grid')
  expect(tabList).toHaveClass('grid-cols-2')
  expect(tabList).toHaveClass('h-8')
  expect(tabList).toHaveClass('p-0.5')
  expect(tabList).toHaveClass('bg-surface-muted')
  expect(tabList).not.toHaveClass('rounded-none')
  expect(tabList).not.toHaveClass('border-b')
  expect(tabList).not.toHaveClass('bg-transparent')

  expect(opdTab).toHaveClass('h-7')
  expect(opdTab).toHaveClass('text-xs')
  expect(opdTab.className).toContain('data-[state=active]:bg-surface')
  expect(opdTab.className).toContain('data-[state=active]:text-primary')
  expect(kepalaTab).toHaveClass('h-7')
  expect(kepalaTab).toHaveClass('text-xs')

  expect(screen.getByRole('textbox', { name: 'Cari nama OPD...' })).toBeInTheDocument()
  const createButton = screen.getByRole('button', { name: 'Tambah OPD' })
  expect(createButton).toBeInTheDocument()
  expect(createButton.parentElement?.className).toContain('sm:ml-auto')
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd client && pnpm vitest run src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
```

Expected: FAIL because the current implementation explicitly uses `variant="line"`, so the tab list has line-navigation classes instead of segmented `bg-surface-muted`, `grid-cols-2`, `h-8`, and `p-0.5`.

- [ ] **Step 3: Commit the failing contract**

```bash
git add client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
git commit -m "test(client): define OPD segmented tab contract"
```

---

### Task 2: Reuse the global segmented tab treatment

**Files:**
- Modify: `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- Test: `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx`

**Interfaces:**
- Consumes: existing shared default segmented styling from `TabsList` and `TabsTrigger`.
- Produces: the same visual grammar as `EvaluasiFilterTabs`, while keeping `activeTab` state and all management behavior unchanged.

- [ ] **Step 1: Replace the line variant markup**

Replace:

```tsx
<DataSurface.Tabs className="w-full">
  <TabsList variant="line">
    <TabsTrigger variant="line" value="opd">OPD</TabsTrigger>
    <TabsTrigger variant="line" value="kepala">Kepala OPD</TabsTrigger>
  </TabsList>
</DataSurface.Tabs>
```

with:

```tsx
<DataSurface.Tabs className="w-full">
  <TabsList className="h-8 w-full grid grid-cols-2 p-0.5">
    <TabsTrigger value="opd" className="h-7 text-xs">OPD</TabsTrigger>
    <TabsTrigger value="kepala" className="h-7 text-xs">Kepala OPD</TabsTrigger>
  </TabsList>
</DataSurface.Tabs>
```

Do not modify any state, handlers, data hooks, toolbar, content panels, or dialogs.

- [ ] **Step 2: Run the focused test and verify GREEN**

Run:

```bash
cd client && pnpm vitest run src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run client typecheck and build**

Run:

```bash
cd client && pnpm typecheck && pnpm build
```

Expected: both commands exit 0.

- [ ] **Step 4: Commit the production change**

```bash
git add client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx
git commit -m "refactor(client): align OPD tabs with global segmented style"
```

---

### Task 3: Review and integrate

**Files:**
- No production changes unless verification exposes a concrete defect.

**Interfaces:**
- Validates the branch against the repository-wide quality gates before integration.

- [ ] **Step 1: Review the diff**

Confirm production changes are limited to `ManajemenOPD.tsx`; test/doc changes may accompany it. Confirm there are no API, DTO, server, Prisma, route, permission, CRUD, or query changes.

- [ ] **Step 2: Verify GitHub Actions on the latest head**

Required CI evidence:

- Client typecheck: success
- E2E journey audit: success
- Client lint: success
- Client unit tests: success
- Client build: success
- Server quality: success
- Database migration invariants: success
- Minimal production config: success
- Critical E2E J01-J07: success
- Backend/frontend container build: success

- [ ] **Step 3: Squash merge the PR to `main`**

Use PR title:

```text
refactor(client): align OPD tabs with global segmented style
```

Merge only when the latest head CI is green. Use squash merge and verify the resulting `main` file contains the segmented tab markup.
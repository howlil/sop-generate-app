# Global Admin UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a global compact neutral admin UI to the SOP dashboard without changing business behavior.

**Architecture:** Work from shared tokens outward. `styles.css` defines visual roles; shared UI primitives define tables, pagination, cards, inputs, buttons, and badges; layout components define sidebar/header/content shell. Table-heavy pages should inherit these defaults and only lose local classes that conflict with the global system.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, TanStack Router, Vitest, Testing Library, Vite, pnpm 10.28.2.

## Global Constraints

- Scope: `client/` only.
- No backend/database/API/workflow/authorization/routing/state-management changes.
- Inter remains the UI font.
- Typography: 18px page title, 16px section title, 14px body/control, 13px table body, 12px table header/metadata.
- Control radius 6px; card/table radius 8px.
- No decorative default shadow on tables/cards/inputs/buttons; overlays may retain elevation.
- Expanded desktop sidebar: 248px; collapsed rail: 56px.
- Desktop page gutter: 20–24px.
- Blue is an accent, not a dominant table/card surface.
- Preserve semantic status colors, keyboard focus, horizontal table scroll, mobile drawer, reduced motion, and current public component APIs.
- Work only on `refactor/global-admin-ui`.

---

### Task 1: Lock global visual tokens

**Files:**
- Modify: `client/src/styles.css`
- Modify: `client/src/components/ui/__tests__/accessibility-regressions.test.tsx`

**Interfaces:**
- Produces semantic tokens used by all later tasks.

- [ ] **Step 1: Write the failing token test**

Add:

```tsx
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

it('mengunci token admin global', () => {
  const path = fileURLToPath(new URL('../../../styles.css', import.meta.url))
  const css = readFileSync(path, 'utf8')
  expect(css).toContain('--sidebar-width-expanded: 248px;')
  expect(css).toContain('--radius-control: 6px;')
  expect(css).toContain('--radius-surface: 8px;')
  expect(css).toContain('--shadow-surface: none;')
  expect(css).toContain('--text-ui-table: 0.8125rem;')
  expect(css).toContain('--text-ui-label: 0.75rem;')
})
```

- [ ] **Step 2: Verify RED**

```bash
cd client && pnpm test -- src/components/ui/__tests__/accessibility-regressions.test.tsx
```

Expected: FAIL because expanded sidebar is still 196px.

- [ ] **Step 3: Implement the token contract**

Set these values in `styles.css` while retaining existing semantic success/warning/danger/info roles and print/PDF styles:

```css
--sidebar-width: 56px;
--sidebar-width-expanded: 248px;
--header-height: 56px;
--content-padding: 24px;
--spacing-page: 1.5rem;
--spacing-section: 1.25rem;
--spacing-card: 1rem;
--radius-control: 6px;
--radius-surface: 8px;
--radius-overlay: 12px;
--shadow-surface: none;
--color-background: #f8fafc;
--color-surface: #ffffff;
--color-surface-subtle: #f8fafc;
--color-surface-muted: #f1f5f9;
--color-foreground: #0f172a;
--color-secondary-foreground: #475569;
--color-muted-foreground: #64748b;
--color-border: #e2e8f0;
--color-primary: #1d4ed8;
--color-primary-hover: #1e40af;
--color-primary-subtle: #eff6ff;
--text-ui-title: 1.125rem;
--text-ui-section: 1rem;
--text-ui-body: 0.875rem;
--text-ui-table: 0.8125rem;
--text-ui-label: 0.75rem;
```

- [ ] **Step 4: Verify GREEN**

Run the same focused test; expected PASS.

---

### Task 2: Standardize global data tables

**Files:**
- Modify: `client/src/components/ui/data-table.tsx`
- Modify: `client/src/components/ui/__tests__/accessibility-regressions.test.tsx`

**Interfaces:**
- Keeps all existing `Table.*` exports and props unchanged.

- [ ] **Step 1: Change table assertions to the target design**

Require `bg-surface-subtle` on the header, `text-ui-table` on the table, `px-3 py-2.5 text-ui-label font-medium text-secondary-foreground` on headers, and `border border-border bg-surface rounded-surface` with no `shadow-surface` on the shell.

- [ ] **Step 2: Verify RED**

```bash
cd client && pnpm test -- src/components/ui/__tests__/accessibility-regressions.test.tsx
```

Expected: FAIL on the old blue-subtle header/raw table text/padding.

- [ ] **Step 3: Implement minimal table defaults**

```tsx
const tableSurfaceClassName =
  'relative isolate overflow-clip rounded-surface border border-border bg-surface'
```

Use these roles:

```tsx
// table
'w-full border-collapse text-ui-table text-foreground'
// header row
'sticky top-0 z-10 border-b border-border bg-surface-subtle'
// body row
'border-b border-border transition-colors last:border-b-0 hover:bg-surface-subtle focus-within:bg-primary-subtle/40'
// th
'whitespace-nowrap px-3 py-2.5 text-ui-label font-medium text-secondary-foreground'
// td
'px-3 py-2.5 align-middle'
```

Keep horizontal overflow, keyboard focus, action-column sizing, and semantic table markup.

- [ ] **Step 4: Verify GREEN**

Run the same focused test; expected PASS.

---

### Task 3: Simplify pagination

**Files:**
- Modify: `client/src/components/ui/pagination.tsx`
- Modify: `client/src/components/ui/__tests__/accessibility-regressions.test.tsx`

**Interfaces:**
- Keeps `PaginationProps` and `onPageChange(page)` semantics unchanged.

- [ ] **Step 1: Write failing pagination behavior test**

```tsx
const onPageChange = vi.fn()
render(<Pagination totalItems={40} currentPage={2} pageSize={10} onPageChange={onPageChange} label="SOP" />)
expect(screen.getByText('11–20 dari 40 SOP')).toBeInTheDocument()
expect(screen.getByText('Halaman 2 dari 4')).toHaveAttribute('aria-current', 'page')
fireEvent.click(screen.getByRole('button', { name: 'Sebelumnya' }))
expect(onPageChange).toHaveBeenCalledWith(1)
fireEvent.click(screen.getByRole('button', { name: 'Selanjutnya' }))
expect(onPageChange).toHaveBeenCalledWith(3)
```

- [ ] **Step 2: Verify RED**

Expected: FAIL because `Halaman N dari M` is currently mobile-only and desktop uses numbered page buttons.

- [ ] **Step 3: Implement `Previous | Page N | Next` presentation**

Keep item range on the left. On the right render outline buttons around a persistent `Halaman {safePage} dari {totalPages}` label. Use 36px desktop controls (`h-9`), neutral outline styling, text labels on desktop, icons retained for mobile clarity. Remove `getPageNumbers()` after it has no consumer. Preserve the single-page early-return behavior.

- [ ] **Step 4: Verify GREEN**

Run the focused accessibility regression test; expected PASS.

---

### Task 4: Align sidebar, header, and content shell

**Files:**
- Modify: `client/src/components/layout/AppSidebar.tsx`
- Modify: `client/src/components/layout/DashboardLayout.tsx`
- Modify: `client/src/components/layout/HeaderBar.tsx`
- Modify: `client/src/components/layout/NotificationBell.tsx`
- Modify: `client/src/components/layout/__tests__/DashboardLayout.test.tsx`

**Interfaces:**
- Keeps routing, mobile drawer, local-storage sidebar preference, and component props unchanged.

- [ ] **Step 1: Add failing shell assertions**

Require the desktop sidebar to include `border-r border-border bg-surface`, retain `p-4 md:p-5 lg:p-6` on the scroll content, and not use decorative surface shadow.

- [ ] **Step 2: Verify RED**

```bash
cd client && pnpm test -- src/components/layout/__tests__/DashboardLayout.test.tsx
```

Expected: FAIL because the sidebar currently has no explicit right border.

- [ ] **Step 3: Implement shell classes**

Use:

```tsx
'relative hidden flex-shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 motion-reduce:transition-none lg:flex'
```

Keep `w-[var(--sidebar-width)]` collapsed and `w-[var(--sidebar-width-expanded)]` expanded. Update the comment to 248px. Keep 18px icons, 40px navigation rows, subtle active primary state, neutral hover, and collapsed tooltips.

Keep `DashboardLayout` content at `p-4 md:p-5 lg:p-6`, no global max-width wrapper, and mobile drawer below `lg`. Keep `HeaderBar` white with bottom border and `px-4 md:px-5 lg:px-6`. Keep profile/notification buttons square with `rounded-control`.

- [ ] **Step 4: Verify GREEN**

Run the focused layout test; expected PASS.

---

### Task 5: Normalize shared controls and surfaces

**Files:**
- Modify: `client/src/components/ui/card.tsx`
- Modify: `client/src/components/ui/input.tsx`
- Modify: `client/src/components/ui/button.tsx`
- Modify: `client/src/components/ui/badge.tsx`
- Modify: `client/src/components/ui/__tests__/accessibility-regressions.test.tsx`

**Interfaces:**
- Keep all public props/variants unchanged.

- [ ] **Step 1: Add/adjust failing primitive assertions**

Require `Card` to be `rounded-surface border border-border bg-surface` without `shadow-surface`. Require `Input` to use `rounded-control bg-surface text-ui-body focus:ring-primary` and no decorative `shadow-sm`. Keep existing button contrast and semantic status-badge tests.

- [ ] **Step 2: Verify RED where current defaults conflict**

```bash
cd client && pnpm test -- src/components/ui/__tests__/accessibility-regressions.test.tsx
```

- [ ] **Step 3: Implement minimal normalization**

Card root:

```tsx
'rounded-surface border border-border bg-surface text-foreground'
```

Input baseline:

```tsx
'rounded-control border border-border bg-surface text-ui-body text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
```

Buttons keep solid primary/destructive contrast, neutral outline/ghost variants, `rounded-control`, compact shared heights, and no decorative shadow. Badges keep semantic variants and true status-pill behavior but use compact label typography.

- [ ] **Step 4: Verify GREEN**

Run focused regressions; expected PASS.

---

### Task 6: Remove local table-page classes that override the global system

**Files to inspect and modify only when conflicting classes exist:**
- `client/src/pages/pj-evaluator/opd/components/OPDTab.tsx`
- `client/src/pages/pj-evaluator/opd/components/KepalaOPDTab.tsx`
- `client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx`
- `client/src/components/pengajuan/pengajuan-tabbed-table.tsx`
- `client/src/pages/kepala-opd/sop/PantauSOP.tsx`
- `client/src/pages/penyusun/sop/ManajemenSOP.tsx`
- `client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx`
- `client/src/pages/penyusun/peraturan/components/PeraturanTableTab.tsx`

**Interfaces:**
- Business markup, callbacks, API calls, filters, table columns, and workflow colors remain unchanged.

- [ ] **Step 1: Find overrides**

```bash
rg -n "bg-(blue|primary)|shadow-(sm|md|lg|surface)|rounded-(xl|2xl)|text-\[[0-9]+px\]" client/src/pages client/src/components/pengajuan
```

- [ ] **Step 2: Remove only table/card/search/toolbar visual overrides that duplicate or fight shared primitives**

Do not touch domain-specific diagram styles, workflow status semantics, or functional layout needed for business behavior.

- [ ] **Step 3: Verify targeted tests and types**

```bash
cd client
pnpm test -- src/components/ui/__tests__/accessibility-regressions.test.tsx src/components/layout/__tests__/DashboardLayout.test.tsx
pnpm typecheck
```

Expected: PASS.

---

### Task 7: Full verification and merge readiness

**Files:** all changes in Tasks 1–6 plus this plan/spec.

- [ ] **Step 1: Run all client tests**

```bash
cd client && pnpm test
```

Expected: zero failing tests.

- [ ] **Step 2: Run typecheck**

```bash
cd client && pnpm typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run lint**

```bash
cd client && pnpm lint
```

Expected: exit 0.

- [ ] **Step 4: Run production build**

```bash
cd client && pnpm build
```

Expected: successful Vite build.

- [ ] **Step 5: Review scope**

Compare `main...refactor/global-admin-ui`; expected changes are frontend visual-system files, tests, `.agent/specs/2026-08-14-global-admin-ui-design.md`, and this plan only. No server/domain/API changes.

- [ ] **Step 6: Open/update one PR to `main`, wait for mandatory CI, then squash merge**

Final squash commit message: `refactor(client): apply global neutral admin UI`.

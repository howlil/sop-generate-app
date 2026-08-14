# Unified Data Surface & App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the authenticated admin UI so the shell owns only navigation/global controls, the profile lives in the sidebar footer, and every list/table page can render tabs, search, filters, active filters, page actions, table content, and pagination as one coherent data surface.

**Architecture:** Keep page/domain logic in existing pages and introduce only small composition primitives. `PageHeaderProvider` remains metadata transport for breadcrumb + semantic page title; `HeaderBar` becomes breadcrumb + notification only; `SidebarUserMenu` owns profile/logout presentation in desktop and mobile navigation; `DataSurface` owns the single collection surface while existing table primitives retain table behavior. No TanStack Table migration is introduced.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, Vitest, Testing Library, Playwright, pnpm.

## Global Constraints

- Frontend/UI-system refactor only; do not change backend endpoints, DTOs, API contracts, route permissions, role checks, or business workflows.
- Keep exactly one semantic page `h1`; it must remain in the DOM but be visually `sr-only` in the authenticated shell.
- The visible authenticated header contains breadcrumb/navigation context and notification only.
- Move profile, role identity, `Profil Saya`, NIP detail, and logout into the sidebar footer; use the same user-menu concept in the mobile drawer.
- Do not place create/submit/workflow buttons in the global header.
- One collection should have one visible outer surface: one border, one radius, one background; avoid nested toolbar/table cards.
- Prefer composition primitives over a boolean-heavy `DataTable` mega-component.
- Preserve existing tab state, filter state ownership, handlers, dialogs, row actions, query behavior, and pagination behavior unless a task explicitly narrows a UX bug.
- Search and advanced filters are independent; resetting filters must not clear the search query.
- Do not introduce TanStack Table in this iteration.
- Responsive layout is part of the implementation: desktop, tablet, and mobile must not create page-level horizontal overflow.
- Use TDD for new shared behavior and regression-prone state changes.
- Keep this entire refactor on `refactor/unified-data-surface-shell`; do not create follow-up branches for failures within this task.
- Required repository CI must be green before squash merge.

---

## File map

### New shared components

- `client/src/components/layout/SidebarUserMenu.tsx`: reusable user/profile dropdown for expanded sidebar, collapsed rail, and mobile drawer.
- `client/src/components/layout/__tests__/SidebarUserMenu.test.tsx`: profile/footer behavior, navigation, logout, collapsed accessibility.
- `client/src/components/data/data-surface.tsx`: composition-only outer collection surface, header/tabs/toolbar/actions/filter-row layout.
- `client/src/components/data/active-filter-chips.tsx`: visible removable filter chips + clear-all action.
- `client/src/components/data/__tests__/data-surface.test.tsx`: surface/toolbar/responsive composition regression coverage.
- `client/src/components/data/__tests__/active-filter-chips.test.tsx`: individual removal and clear-all behavior.

### Shared components to modify

- `client/src/components/layout/HeaderBar.tsx`: breadcrumb + notification only, single `sr-only` page heading.
- `client/src/components/layout/PageHeaderProvider.tsx`: transitional metadata contract, then final breadcrumb/title/leading-only contract.
- `client/src/components/layout/ListPageLayout.tsx`: transitional consumer, then final page metadata wrapper without visible description/actions/toolbar ownership.
- `client/src/components/layout/AppSidebar.tsx`: append desktop `SidebarUserMenu` below scrollable navigation.
- `client/src/components/layout/DashboardLayout.tsx`: render `SidebarUserMenu` in the mobile drawer footer.
- `client/src/components/layout/__tests__/HeaderBar.test.tsx`: assert breadcrumb visible, title semantic-only, profile/actions/description absent.
- `client/src/components/layout/__tests__/DashboardLayout.test.tsx`: desktop footer + mobile drawer placement and preserved collapse behavior.
- `client/src/components/ui/data-table.tsx`: add explicit embedded surface mode to `Table.Paginated` while preserving standalone default.
- `client/src/components/ui/__tests__/p3-polish-regressions.test.tsx`: preserve table typography/border regression expectations and add embedded-surface expectation if this file is still the closest table-style test owner.
- `client/src/components/ui/search-toolbar.tsx`: keep temporarily while pages migrate, then delete after the last consumer is removed.

### SOP reference implementation

- `client/src/pages/penyusun/sop/hooks/use-daftar-sop-filters.ts`: separate search from advanced filter reset semantics.
- `client/src/pages/penyusun/sop/ManajemenSOP.tsx`: reference `DataSurface`, active filter chips, page actions in data toolbar, contextual empty states.
- Add or update focused SOP filter tests in the nearest existing SOP hook/page test file; if no focused hook test exists, create `client/src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx`.

### Simple list-page migrations

- `client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx`
- `client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx`
- `client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx`
- `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx`
- `client/src/pages/kepala-opd/sop/PantauSOP.tsx`

### Complex/tabbed list-page migrations

- `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- `client/src/pages/evaluator/evaluasi/DaftarSOPEvaluasi.tsx`
- `client/src/pages/pj-evaluator/evaluasi/ManajemenEvaluasiSop.tsx`
- `client/src/components/pengajuan/pengajuan-tabbed-table.tsx`
- `client/src/pages/kepala-opd/pengajuan/PengajuanSOPPage.tsx`
- `client/src/pages/penyusun/koordinator/berita-acara/BeritaAcaraKoordinatorPage.tsx`

### Final contract cleanup consumers

- Every remaining `ListPageLayout` consumer, including `client/src/pages/pj-evaluator/grafik-evaluasi/GrafikEvaluasiTahunan.tsx`, must compile against the final metadata-only `ListPageLayout` contract.

---

## Task 1: Simplify the visible header without breaking page metadata consumers

**Files:**
- Modify: `client/src/components/layout/HeaderBar.tsx`
- Modify: `client/src/components/layout/__tests__/HeaderBar.test.tsx`

**Interfaces:**
- Consumes: current `PageHeaderContent` including `breadcrumb`, `title`, temporary `description`, temporary `actions`.
- Produces: a header that visibly renders breadcrumb + `NotificationBell`, renders exactly one `h1.sr-only`, and ignores temporary description/actions while migration is in progress.

- [ ] **Step 1: Replace the current visible-title test with a failing shell-semantics test**

Use the existing provider setup but assert the new contract:

```tsx
render(
  <PageHeaderProvider>
    <HeaderBar />
    <SetPageHeader
      breadcrumb={[{ label: 'Penyusun' }, { label: 'Manajemen SOP' }]}
      title="Manajemen SOP"
      description="Deskripsi yang tidak boleh tampil di header."
      actions={<button type="button">Buat SOP</button>}
    />
  </PageHeaderProvider>,
)

expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
expect(screen.getByText('Penyusun')).toBeInTheDocument()
expect(screen.getByText('Manajemen SOP')).toHaveAttribute('aria-current', 'page')
expect(screen.getByRole('heading', { name: 'Manajemen SOP' })).toHaveClass('sr-only')
expect(screen.queryByText('Deskripsi yang tidak boleh tampil di header.')).not.toBeInTheDocument()
expect(screen.queryByRole('button', { name: 'Buat SOP' })).not.toBeInTheDocument()
expect(screen.queryByRole('button', { name: 'Profil' })).not.toBeInTheDocument()
```

Keep the existing empty-breadcrumb regression but change its title assertion to `sr-only`.

- [ ] **Step 2: Run the focused test and verify RED**

Run from `client/`:

```bash
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: FAIL because title/description/actions/profile are currently visible.

- [ ] **Step 3: Reduce `HeaderBar` to breadcrumb + notification + semantic title**

Remove the role/auth/profile/logout imports and code from `HeaderBar.tsx`. Keep `usePageHeaderContext` and `NotificationBell`.

Target structure:

```tsx
export function HeaderBar() {
  const pageHeader = usePageHeaderContext()
  const headerContent = pageHeader?.headerContent

  return (
    <header
      data-print-hide
      className="flex min-h-[var(--header-height)] flex-shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-2 md:px-5 lg:px-6"
    >
      <div suppressHydrationWarning className="min-w-0 flex-1">
        {headerContent?.breadcrumb.length ? (
          <Breadcrumb
            items={headerContent.breadcrumb}
            className="min-w-0 overflow-hidden whitespace-nowrap"
          />
        ) : null}
        {headerContent ? <h1 className="sr-only">{headerContent.title}</h1> : null}
      </div>
      <NotificationBell />
    </header>
  )
}
```

Do not delete `description`/`actions` from `PageHeaderProvider` yet; Task 8 removes them after all pages migrate.

- [ ] **Step 4: Strengthen the current breadcrumb item visually in the breadcrumb primitive only if required by existing markup**

If the breadcrumb primitive already differentiates the current item, keep it. Otherwise update its final/current item class to foreground + medium weight without changing routing behavior:

```tsx
className="font-medium text-foreground"
```

Add/update the closest breadcrumb unit test only if this class change is required.

- [ ] **Step 5: Run the focused test and verify GREEN**

```bash
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the shell-header behavior**

```bash
git add client/src/components/layout/HeaderBar.tsx client/src/components/layout/__tests__/HeaderBar.test.tsx client/src/components/ui/breadcrumb.tsx
git commit -m "refactor(client): simplify authenticated header"
```

Only add `breadcrumb.tsx` if Step 4 changed it.

---

## Task 2: Move profile/logout into a reusable sidebar footer on desktop and mobile

**Files:**
- Create: `client/src/components/layout/SidebarUserMenu.tsx`
- Create: `client/src/components/layout/__tests__/SidebarUserMenu.test.tsx`
- Modify: `client/src/components/layout/AppSidebar.tsx`
- Modify: `client/src/components/layout/DashboardLayout.tsx`
- Modify: `client/src/components/layout/__tests__/DashboardLayout.test.tsx`

**Interfaces:**
- Produces:

```ts
export interface SidebarUserMenuProps {
  collapsed?: boolean
  onNavigate?: () => void
  className?: string
}
```

- `SidebarUserMenu` owns use of `useAppRole()`, `useAuth()`, `useNavigate()`, `getMeRoute()`, and logout navigation to `ROUTES.HOME`.
- `AppSidebar` renders it with `collapsed={collapsed}`.
- Mobile drawer renders it with `collapsed={false}` and closes the drawer through `onNavigate` after profile navigation/logout selection.

- [ ] **Step 1: Write failing `SidebarUserMenu` tests**

Mock the existing hooks/router and cover expanded identity, collapsed accessible trigger, profile route, and logout:

```tsx
render(<SidebarUserMenu />)

expect(screen.getByText('Pengguna Uji')).toBeInTheDocument()
expect(screen.getByText('PJ Penyusun')).toBeInTheDocument()
fireEvent.click(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' }))
expect(screen.getByText('NIP. 123456789')).toBeInTheDocument()
expect(screen.getByText('Profil Saya')).toBeInTheDocument()
expect(screen.getByText('Logout')).toBeInTheDocument()
```

Collapsed case:

```tsx
render(<SidebarUserMenu collapsed />)
expect(screen.queryByText('Pengguna Uji')).not.toBeVisible()
expect(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' })).toBeInTheDocument()
```

Logout case must assert the mocked `logout` is called and router navigation targets `ROUTES.HOME`.

- [ ] **Step 2: Run the focused test and verify RED**

```bash
pnpm test -- src/components/layout/__tests__/SidebarUserMenu.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement `SidebarUserMenu` by extracting the existing header profile behavior**

Use the existing dropdown primitives and a compact footer trigger:

```tsx
export function SidebarUserMenu({
  collapsed = false,
  onNavigate,
  className,
}: SidebarUserMenuProps) {
  const navigate = useNavigate()
  const { role, getRoleLabel, getRoleNip, getRoleDisplayName } = useAppRole()
  const { logout } = useAuth()
  const displayName = getRoleDisplayName()
  const roleLabel = role ? getRoleLabel(role) : ''
  const nip = getRoleNip()

  const handleLogout = async () => {
    await logout()
    onNavigate?.()
    navigate({
      to: ROUTES.HOME,
      search: { denied: undefined, redirect: undefined },
    })
  }

  return (
    <div className={cn('shrink-0 border-t border-border p-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Menu profil ${displayName}`}
            className={cn(
              'group flex min-h-11 w-full items-center rounded-control text-left hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              collapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5',
            )}
          >
            <CircleUserRound className="h-8 w-8 shrink-0 text-secondary-foreground" aria-hidden />
            <span className={cn('min-w-0 flex-1', collapsed && 'sr-only')}>
              <span className="block truncate text-ui-body font-medium text-foreground">{displayName}</span>
              <span className="block truncate text-xs text-muted-foreground">{roleLabel}</span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={collapsed ? 'right' : 'top'} align="start" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground">{roleLabel}</p>
              {nip ? <p className="text-xs text-muted-foreground">NIP. {nip}</p> : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {getMeRoute(role) ? (
            <DropdownMenuItem
              onSelect={() => {
                const mePath = getMeRoute(role)
                if (!mePath) return
                onNavigate?.()
                navigate({ to: mePath })
              }}
            >
              Profil Saya
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="text-danger focus:bg-danger-subtle focus:text-danger-foreground"
            onSelect={() => void handleLogout()}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

Use the existing rail tooltip pattern or native title for collapsed hover/focus context; do not duplicate identity text visually in the collapsed rail.

- [ ] **Step 4: Mount the user menu in desktop and mobile navigation**

At the end of `AppSidebar`, after the scrollable `<nav>`:

```tsx
<SidebarUserMenu collapsed={collapsed} />
```

At the end of the mobile drawer, after its scrollable navigation container:

```tsx
<SidebarUserMenu
  collapsed={false}
  onNavigate={() => setIsMobileNavOpen(false)}
/>
```

The footer must be outside the scrollable nav region so it remains pinned to the bottom when menu items overflow.

- [ ] **Step 5: Extend `DashboardLayout.test.tsx`**

Keep all current collapse/localStorage tests. Add assertions that expanded desktop sidebar has the profile menu after navigation, collapsed state still exposes its accessible trigger, and mobile drawer renders the same menu after clicking `Buka navigasi`.

```tsx
expect(screen.getByRole('button', { name: /Menu profil/i })).toBeInTheDocument()
fireEvent.click(screen.getByRole('button', { name: 'Buka navigasi' }))
expect(document.querySelector('#mobile-main-navigation')).toBeInTheDocument()
expect(document.querySelector('#mobile-main-navigation')?.querySelector('[aria-label^="Menu profil"]')).not.toBeNull()
```

- [ ] **Step 6: Run focused tests and verify GREEN**

```bash
pnpm test -- src/components/layout/__tests__/SidebarUserMenu.test.tsx src/components/layout/__tests__/DashboardLayout.test.tsx src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit sidebar profile ownership**

```bash
git add client/src/components/layout/SidebarUserMenu.tsx client/src/components/layout/AppSidebar.tsx client/src/components/layout/DashboardLayout.tsx client/src/components/layout/__tests__/SidebarUserMenu.test.tsx client/src/components/layout/__tests__/DashboardLayout.test.tsx
git commit -m "refactor(client): move profile into sidebar"
```

---

## Task 3: Introduce composition-based `DataSurface` and active-filter primitives

**Files:**
- Create: `client/src/components/data/data-surface.tsx`
- Create: `client/src/components/data/active-filter-chips.tsx`
- Create: `client/src/components/data/__tests__/data-surface.test.tsx`
- Create: `client/src/components/data/__tests__/active-filter-chips.test.tsx`

**Interfaces:**

`data-surface.tsx` exports:

```ts
export const DataSurface: {
  Root: typeof DataSurfaceRoot
  Header: typeof DataSurfaceHeader
  Tabs: typeof DataSurfaceTabs
  Toolbar: typeof DataSurfaceToolbar
  Actions: typeof DataSurfaceActions
  FilterRow: typeof DataSurfaceFilterRow
}
```

Each component accepts normal `React.HTMLAttributes<HTMLDivElement>` so domain pages can compose arbitrary controls without adding feature booleans.

`active-filter-chips.tsx` exports:

```ts
export interface ActiveFilterChipItem {
  id: string
  label: string
  onRemove: () => void
}

export interface ActiveFilterChipsProps {
  items: ActiveFilterChipItem[]
  onClearAll?: () => void
  clearAllLabel?: string
}
```

- [ ] **Step 1: Write failing `DataSurface` composition tests**

```tsx
render(
  <DataSurface.Root>
    <DataSurface.Header>
      <DataSurface.Tabs><button type="button">Semua</button></DataSurface.Tabs>
      <DataSurface.Toolbar>
        <input aria-label="Cari SOP" />
        <button type="button">Filter</button>
        <DataSurface.Actions><button type="button">Buat SOP</button></DataSurface.Actions>
      </DataSurface.Toolbar>
    </DataSurface.Header>
    <div>Table content</div>
  </DataSurface.Root>,
)

const surface = screen.getByTestId('data-surface')
expect(surface).toHaveClass('rounded-surface', 'border', 'border-border', 'bg-surface')
expect(screen.getByLabelText('Cari SOP')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Buat SOP' })).toBeInTheDocument()
```

Also assert toolbar classes support `flex-col` and `sm:flex-row`, actions wrap, and tabs have horizontal overflow safety.

- [ ] **Step 2: Write failing active-filter behavior tests**

```tsx
const removeStatus = vi.fn()
const clearAll = vi.fn()
render(
  <ActiveFilterChips
    items={[{ id: 'status', label: 'Status: Draft', onRemove: removeStatus }]}
    onClearAll={clearAll}
  />,
)

fireEvent.click(screen.getByRole('button', { name: 'Hapus filter Status: Draft' }))
expect(removeStatus).toHaveBeenCalledTimes(1)
fireEvent.click(screen.getByRole('button', { name: 'Hapus semua filter' }))
expect(clearAll).toHaveBeenCalledTimes(1)
```

Add an empty-items test that renders nothing.

- [ ] **Step 3: Run focused tests and verify RED**

```bash
pnpm test -- src/components/data/__tests__/data-surface.test.tsx src/components/data/__tests__/active-filter-chips.test.tsx
```

Expected: FAIL because both shared components do not exist.

- [ ] **Step 4: Implement `DataSurface` as pure layout composition**

Use a single outer surface and no domain logic:

```tsx
const DataSurfaceRoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-testid="data-surface"
      className={cn('overflow-hidden rounded-surface border border-border bg-surface', className)}
      {...props}
    />
  ),
)

const DataSurfaceHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-3 border-b border-border p-card', className)} {...props} />
  ),
)

const DataSurfaceTabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('min-w-0 overflow-x-auto overscroll-x-contain', className)} {...props} />
  ),
)

const DataSurfaceToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', className)} {...props} />
  ),
)

const DataSurfaceActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-wrap gap-2 sm:ml-auto sm:justify-end', className)} {...props} />
  ),
)

const DataSurfaceFilterRow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-wrap items-center gap-2', className)} {...props} />
  ),
)
```

Use display names and export the `DataSurface` object.

- [ ] **Step 5: Implement `ActiveFilterChips`**

Use removable button-like chips with accessible labels and a neutral clear-all action. Do not use status-semantic colors for generic filters.

```tsx
export function ActiveFilterChips({
  items,
  onClearAll,
  clearAllLabel = 'Hapus semua filter',
}: ActiveFilterChipsProps) {
  if (items.length === 0) return null

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      {items.map((item) => (
        <span key={item.id} className="inline-flex h-7 items-center gap-1 rounded-control border border-border bg-surface-subtle px-2 text-xs text-secondary-foreground">
          <span>{item.label}</span>
          <button
            type="button"
            aria-label={`Hapus filter ${item.label}`}
            className="inline-flex h-5 w-5 items-center justify-center rounded-control hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={item.onRemove}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
      {onClearAll ? (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onClearAll}>
          {clearAllLabel}
        </Button>
      ) : null}
    </div>
  )
}
```

- [ ] **Step 6: Run focused tests and verify GREEN**

```bash
pnpm test -- src/components/data/__tests__/data-surface.test.tsx src/components/data/__tests__/active-filter-chips.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the collection primitives**

```bash
git add client/src/components/data/data-surface.tsx client/src/components/data/active-filter-chips.tsx client/src/components/data/__tests__/data-surface.test.tsx client/src/components/data/__tests__/active-filter-chips.test.tsx
git commit -m "feat(client): add unified data surface primitives"
```

---

## Task 4: Make paginated tables embed cleanly inside one data surface

**Files:**
- Modify: `client/src/components/ui/data-table.tsx`
- Modify: nearest existing table test, preferably `client/src/components/ui/__tests__/p3-polish-regressions.test.tsx`

**Interfaces:**

Extend `PaginatedTableProps<T>` with an explicit visual mode:

```ts
surfaceMode?: 'standalone' | 'embedded'
```

Default remains `standalone` for backward compatibility. `embedded` removes the outer border/radius/background because `DataSurface.Root` owns them.

- [ ] **Step 1: Write a failing embedded-surface regression test**

Render a paginated table in embedded mode and assert no second card styling:

```tsx
render(
  <Table.Paginated data={[1]} label="Item" surfaceMode="embedded">
    {(items) => <div>{items[0]}</div>}
  </Table.Paginated>,
)

const container = screen.getByText('1').parentElement
expect(container).not.toHaveClass('rounded-surface', 'border', 'bg-surface')
```

Keep or add a companion assertion that default mode still has the standalone table surface classes.

- [ ] **Step 2: Run the focused test and verify RED**

```bash
pnpm test -- src/components/ui/__tests__/p3-polish-regressions.test.tsx
```

Expected: FAIL because `surfaceMode` is not supported.

- [ ] **Step 3: Implement the explicit mode without changing pagination logic**

```tsx
interface PaginatedTableProps<T> {
  data: T[]
  pageSize?: number
  label?: string
  children: (pageData: T[], startIndex: number) => React.ReactNode
  className?: string
  surfaceMode?: 'standalone' | 'embedded'
}

function PaginatedTable<T>({
  data,
  pageSize = 10,
  label,
  children,
  className,
  surfaceMode = 'standalone',
}: PaginatedTableProps<T>) {
  // keep existing page state/slicing logic unchanged
  return (
    <div
      className={cn(
        surfaceMode === 'standalone' ? tableSurfaceClassName : 'min-w-0',
        className,
      )}
    >
      {children(pageData, startIndex)}
      {data.length > pageSize ? (
        <Pagination
          totalItems={data.length}
          currentPage={safePage}
          onPageChange={setPage}
          pageSize={pageSize}
          label={label}
        />
      ) : null}
    </div>
  )
}
```

Do not move sorting/filtering logic into this component.

- [ ] **Step 4: Run focused table tests and verify GREEN**

```bash
pnpm test -- src/components/ui/__tests__/p3-polish-regressions.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit embedded table support**

```bash
git add client/src/components/ui/data-table.tsx client/src/components/ui/__tests__/p3-polish-regressions.test.tsx
git commit -m "refactor(client): support embedded paginated tables"
```

---

## Task 5: Use Manajemen SOP as the reference implementation for filters, actions, empty states, and one-surface layout

**Files:**
- Modify: `client/src/pages/penyusun/sop/hooks/use-daftar-sop-filters.ts`
- Create or modify: `client/src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx`
- Modify: `client/src/pages/penyusun/sop/ManajemenSOP.tsx`

**Interfaces:**

Final filter hook shape:

```ts
export interface DaftarSOPAdvancedFilters {
  statusFilter: string | null
  filterTanggalDari: string | null
  filterTanggalSampai: string | null
}

return {
  searchQuery,
  filterStatus,
  filterTanggalDari,
  filterTanggalSampai,
  isFilterOpen,
  activeFilterCount,
  setSearchQuery,
  clearSearch,
  setStatusFilter,
  setFilterTanggalDari,
  setFilterTanggalSampai,
  clearFilters,
}
```

`clearFilters()` resets only advanced filters. `clearSearch()` resets only `searchQuery`.

- [ ] **Step 1: Write a failing filter-reset regression test**

Use `renderHook`:

```tsx
const { result } = renderHook(() => useDaftarSopFilters())

act(() => {
  result.current.setSearchQuery('pengadaan')
  result.current.setStatusFilter('DRAFT')
  result.current.setFilterTanggalDari('2026-08-01')
})

act(() => result.current.clearFilters())

expect(result.current.searchQuery).toBe('pengadaan')
expect(result.current.filterStatus).toBeNull()
expect(result.current.filterTanggalDari).toBeNull()

act(() => result.current.clearSearch())
expect(result.current.searchQuery).toBe('')
```

- [ ] **Step 2: Run the hook test and verify RED**

```bash
pnpm test -- src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx
```

Expected: FAIL because current `clearFilters()` clears the search query and `clearSearch()` does not exist.

- [ ] **Step 3: Separate search state from advanced filters in the hook**

Use one state for search and one for advanced filters:

```tsx
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState<DaftarSOPAdvancedFilters>({
  statusFilter: null,
  filterTanggalDari: null,
  filterTanggalSampai: null,
})

const clearSearch = useCallback(() => setSearchQuery(''), [])
const clearFilters = useCallback(() => {
  setFilters({
    statusFilter: null,
    filterTanggalDari: null,
    filterTanggalSampai: null,
  })
}, [])
```

Keep `activeFilterCount` based only on advanced filters.

- [ ] **Step 4: Run the hook test and verify GREEN**

```bash
pnpm test -- src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Replace `ListPageLayout` header actions + `SearchToolbar` with one `DataSurface` in `ManajemenSOP.tsx`**

Keep page metadata only:

```tsx
<ListPageLayout
  breadcrumb={[{ label: 'Manajemen SOP' }]}
  title="Manajemen SOP"
>
  <DataSurface.Root>
    <DataSurface.Header>
      <DataSurface.Toolbar>
        <SearchInput
          placeholder="Cari judul atau nomor SOP..."
          aria-label="Cari judul atau nomor SOP..."
          value={filters.searchQuery}
          onChange={(event) => filters.setSearchQuery(event.target.value)}
        />
        <FilterDropdownButton
          open={filters.isFilterOpen}
          onOpenChange={filters.setIsFilterOpen}
          activeCount={filters.activeFilterCount}
        >
          {/* keep existing status/date FormField content and Reset -> filters.clearFilters */}
        </FilterDropdownButton>
        <DataSurface.Actions>
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
        </DataSurface.Actions>
      </DataSurface.Toolbar>
      <DataSurface.FilterRow>
        <ActiveFilterChips items={activeFilterItems} onClearAll={filters.clearFilters} />
      </DataSurface.FilterRow>
    </DataSurface.Header>

    <Table.Paginated data={filteredList} label="SOP" surfaceMode="embedded">
      {/* keep the current table/row action mapping */}
    </Table.Paginated>
  </DataSurface.Root>

  {/* keep dialogs and confirm dialog outside DataSurface.Root */}
</ListPageLayout>
```

- [ ] **Step 6: Build the explicit active-filter item model in `ManajemenSOP`**

Add a local date formatter that avoids UTC date shifting:

```tsx
const formatFilterDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
```

Build items with individual reset callbacks:

```tsx
const activeFilterItems = [
  ...(filters.filterStatus && filters.filterStatus !== 'all'
    ? [{
        id: 'status',
        label: `Status: ${filters.filterStatus}`,
        onRemove: () => filters.setStatusFilter(null),
      }]
    : []),
  ...(filters.filterTanggalDari
    ? [{
        id: 'tanggal-dari',
        label: `Dari: ${formatFilterDate(filters.filterTanggalDari)}`,
        onRemove: () => filters.setFilterTanggalDari(null),
      }]
    : []),
  ...(filters.filterTanggalSampai
    ? [{
        id: 'tanggal-sampai',
        label: `Sampai: ${formatFilterDate(filters.filterTanggalSampai)}`,
        onRemove: () => filters.setFilterTanggalSampai(null),
      }]
    : []),
]
```

If the status filter component already exposes a human-readable status-label helper, use that existing label instead of the raw enum value; do not add a second status mapping table.

- [ ] **Step 7: Make the empty row contextual**

Derive:

```tsx
const hasSearch = filters.searchQuery.trim().length > 0
const hasAdvancedFilters = filters.activeFilterCount > 0
```

Render copy based on context:

```tsx
<EmptyState
  asTableRow
  colSpan={7}
  icon={<FileText />}
  title={
    hasSearch
      ? `Tidak ada SOP yang cocok dengan “${filters.searchQuery.trim()}”`
      : hasAdvancedFilters
        ? 'Tidak ada SOP dengan filter yang dipilih'
        : 'Belum ada SOP'
  }
  description={
    hasSearch
      ? 'Ubah atau hapus kata kunci pencarian.'
      : hasAdvancedFilters
        ? 'Hapus atau ubah filter untuk memperluas hasil.'
        : 'Buat SOP baru untuk mulai menyusun dokumen.'
  }
/>
```

Keep recovery buttons in the toolbar/chips rather than nesting another action inside a table row unless the existing `EmptyState` API already supports a safe action slot.

- [ ] **Step 8: Run focused + page-adjacent tests**

```bash
pnpm test -- src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx src/components/data/__tests__/data-surface.test.tsx src/components/data/__tests__/active-filter-chips.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit the reference implementation**

```bash
git add client/src/pages/penyusun/sop/hooks/use-daftar-sop-filters.ts client/src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx client/src/pages/penyusun/sop/ManajemenSOP.tsx
git commit -m "refactor(client): unify SOP collection controls"
```

---

## Task 6: Migrate simple search/action list pages to the unified surface

**Files:**
- Modify: `client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx`
- Modify: `client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx`
- Modify: `client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx`
- Modify: `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx`
- Modify: `client/src/pages/kepala-opd/sop/PantauSOP.tsx`

**Interfaces:**
- Consumes: `DataSurface`, `SearchInput`, existing page buttons/handlers, `Table.Paginated surfaceMode="embedded"`.
- Produces: no `SearchToolbar` use in these five pages and no page actions passed to `ListPageLayout`.

- [ ] **Step 1: Establish a green baseline before migration**

```bash
pnpm test -- src/components/data/__tests__/data-surface.test.tsx src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Migrate `PelaksanaSOP.tsx`**

Keep its existing create handler/dialog exactly, but move search + create action into one surface:

```tsx
<ListPageLayout breadcrumb={[{ label: 'Pelaksana SOP' }]} title="Pelaksana SOP">
  <DataSurface.Root>
    <DataSurface.Header>
      <DataSurface.Toolbar>
        <SearchInput
          placeholder="Cari pelaksana..."
          aria-label="Cari pelaksana..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <DataSurface.Actions>
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
        </DataSurface.Actions>
      </DataSurface.Toolbar>
    </DataSurface.Header>
    <Table.Paginated data={filteredData} label="Pelaksana" surfaceMode="embedded">
      {renderExistingTable}
    </Table.Paginated>
  </DataSurface.Root>
  {renderExistingDialogs}
</ListPageLayout>
```

During implementation, replace `renderExistingTable`/`renderExistingDialogs` with the file's existing JSX blocks verbatim; these names are not new runtime helpers.

- [ ] **Step 3: Migrate `ManajemenPeraturan.tsx`**

Use the same `DataSurface` structure, preserving the existing `openPeraturanDialog()` handler:

```tsx
<DataSurface.Toolbar>
  <SearchInput
    placeholder="Cari peraturan..."
    aria-label="Cari peraturan..."
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
  />
  <DataSurface.Actions>
    <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openPeraturanDialog()}>
      <Plus className="h-3.5 w-3.5" />
      Tambah Peraturan
    </Button>
  </DataSurface.Actions>
</DataSurface.Toolbar>
```

Keep existing tabs/table-tab domain components inside `DataSurface` rather than rewriting their state.

- [ ] **Step 4: Migrate `ManajemenEvaluator.tsx`**

Move its existing search control and `Tambah Anggota` button into `DataSurface.Toolbar` + `DataSurface.Actions`; keep role/OPD assignment logic unchanged. Use `surfaceMode="embedded"` on the paginated table.

Target action node:

```tsx
<DataSurface.Actions>
  <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openCreateDialog}>
    <Plus className="h-3.5 w-3.5" />
    Tambah Anggota
  </Button>
</DataSurface.Actions>
```

If the current file uses an inline state-reset block rather than `openCreateDialog`, preserve that exact existing callback instead of introducing a new helper merely for this refactor.

- [ ] **Step 5: Migrate `ManajemenPenyusun.tsx`**

Move search + existing `Tambah Penyusun` action into the surface. Preserve the current create reset behavior:

```tsx
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
```

- [ ] **Step 6: Migrate read-only `PantauSOP.tsx`**

Use only the controls that page already has. Do not create an empty actions slot:

```tsx
<DataSurface.Root>
  <DataSurface.Header>
    <DataSurface.Toolbar>
      <SearchInput
        placeholder="Cari SOP..."
        aria-label="Cari SOP..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
    </DataSurface.Toolbar>
  </DataSurface.Header>
  <Table.Paginated data={filteredList} label="SOP" surfaceMode="embedded">
    {tableRenderer}
  </Table.Paginated>
</DataSurface.Root>
```

Replace `tableRenderer` with the existing table child function; do not introduce it as a new helper unless the page already has one.

- [ ] **Step 7: Run typecheck and focused UI tests**

```bash
pnpm typecheck
pnpm test -- src/components/data/__tests__/data-surface.test.tsx src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: both commands succeed.

- [ ] **Step 8: Commit simple list-page migrations**

```bash
git add client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx client/src/pages/kepala-opd/sop/PantauSOP.tsx
git commit -m "refactor(client): unify simple list surfaces"
```

---

## Task 7: Migrate complex and tabbed collection pages without rewriting domain state

**Files:**
- Modify: `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- Modify: `client/src/pages/evaluator/evaluasi/DaftarSOPEvaluasi.tsx`
- Modify: `client/src/pages/pj-evaluator/evaluasi/ManajemenEvaluasiSop.tsx`
- Modify: `client/src/components/pengajuan/pengajuan-tabbed-table.tsx`
- Modify: `client/src/pages/kepala-opd/pengajuan/PengajuanSOPPage.tsx`
- Modify: `client/src/pages/penyusun/koordinator/berita-acara/BeritaAcaraKoordinatorPage.tsx`

**Interfaces:**
- Existing tabs remain the source of tab value/state and callbacks.
- `DataSurface.Tabs` provides only horizontal-safe placement.
- Existing grouped lists or tab-specific tables remain domain components; wrap rather than reimplement them.

- [ ] **Step 1: Migrate `ManajemenOPD.tsx`**

Place existing OPD tabs in `DataSurface.Tabs` and search/controls in `DataSurface.Toolbar`:

```tsx
<DataSurface.Root>
  <DataSurface.Header>
    <DataSurface.Tabs>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {existingTabsList}
      </Tabs>
    </DataSurface.Tabs>
    <DataSurface.Toolbar>
      <SearchInput
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
      {existingPageActions ? <DataSurface.Actions>{existingPageActions}</DataSurface.Actions> : null}
    </DataSurface.Toolbar>
  </DataSurface.Header>
  {existingActiveTabContent}
</DataSurface.Root>
```

During implementation inline the file's current tab list/content/action JSX instead of creating the pseudo variables shown above. Do not change OPD/Kepala OPD tab switching behavior.

- [ ] **Step 2: Migrate `DaftarSOPEvaluasi.tsx`**

Place the existing evaluation filter tabs (if present) in `DataSurface.Tabs`, search/filter controls in `DataSurface.Toolbar`, and the existing table/grouped list below the header. Preserve evaluator workflow actions and query/filter logic.

```tsx
<DataSurface.Header>
  <DataSurface.Tabs>
    <EvaluasiFilterTabs value={filter} onValueChange={setFilter} />
  </DataSurface.Tabs>
  <DataSurface.Toolbar>
    <SearchInput
      placeholder="Cari SOP..."
      aria-label="Cari SOP..."
      value={searchQuery}
      onChange={(event) => setSearchQuery(event.target.value)}
    />
  </DataSurface.Toolbar>
</DataSurface.Header>
```

Adapt prop names to the existing `EvaluasiFilterTabs` API exactly; do not change that component's public API unless typecheck proves the current API cannot compose directly.

- [ ] **Step 3: Migrate `ManajemenEvaluasiSop.tsx`**

Use the same ownership boundary: existing evaluation status tabs → `DataSurface.Tabs`; search/filter → toolbar; any page-wide workflow controls → actions; existing grouped/table content unchanged below the header.

- [ ] **Step 4: Refactor `pengajuan-tabbed-table.tsx` to own one surface instead of nested tab/table cards**

Make the component render:

```tsx
<DataSurface.Root>
  <DataSurface.Header>
    <DataSurface.Tabs>{tabs}</DataSurface.Tabs>
    {toolbar ? <DataSurface.Toolbar>{toolbar}</DataSurface.Toolbar> : null}
  </DataSurface.Header>
  {content}
</DataSurface.Root>
```

Preserve the existing tab labels, counts, empty states, and table/group content. Do not introduce new data fetching.

- [ ] **Step 5: Update `PengajuanSOPPage.tsx` to stop wrapping the tabbed table in another collection card/toolbar**

The page should provide metadata and domain props to the tabbed component, not another outer bordered collection surface.

- [ ] **Step 6: Migrate `BeritaAcaraKoordinatorPage.tsx` if it renders a list/table collection**

Use one `DataSurface` around its existing controls/table. If the page is not a collection after inspecting the current branch, leave its body unchanged and only rely on Task 8's `ListPageLayout` metadata cleanup; do not force a data-surface abstraction onto non-tabular content.

- [ ] **Step 7: Run typecheck and the existing list/filter E2E spec locally when available**

```bash
pnpm typecheck
pnpm test
pnpm exec playwright test e2e/list-filter-pagination.spec.ts
```

Expected: typecheck/unit tests pass; Playwright spec passes when its documented local prerequisites are available. If the E2E environment is not available locally, do not weaken assertions; rely on repository CI in Task 9.

- [ ] **Step 8: Commit complex collection migrations**

```bash
git add client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx client/src/pages/evaluator/evaluasi/DaftarSOPEvaluasi.tsx client/src/pages/pj-evaluator/evaluasi/ManajemenEvaluasiSop.tsx client/src/components/pengajuan/pengajuan-tabbed-table.tsx client/src/pages/kepala-opd/pengajuan/PengajuanSOPPage.tsx client/src/pages/penyusun/koordinator/berita-acara/BeritaAcaraKoordinatorPage.tsx
git commit -m "refactor(client): unify tabbed collection surfaces"
```

---

## Task 8: Remove legacy header/list-toolbar contracts after every page has migrated

**Files:**
- Modify: `client/src/components/layout/PageHeaderProvider.tsx`
- Modify: `client/src/components/layout/ListPageLayout.tsx`
- Modify: `client/src/components/layout/__tests__/ListPageLayout.test.tsx`
- Delete: `client/src/components/ui/search-toolbar.tsx`
- Modify: all remaining `ListPageLayout` consumers that still pass `description`, `actions`, or `toolbar`, including `client/src/pages/pj-evaluator/grafik-evaluasi/GrafikEvaluasiTahunan.tsx` when applicable.

**Interfaces:**

Final page metadata contract:

```ts
export interface PageHeaderContent {
  breadcrumb: BreadcrumbItem[]
  title: string
  leading?: ReactNode
}

export interface SetPageHeaderProps {
  breadcrumb: BreadcrumbItem[]
  title: string
  leading?: ReactNode
}

export interface ListPageLayoutProps {
  breadcrumb?: BreadcrumbItem[] | null
  title: string
  leading?: React.ReactNode
  children: React.ReactNode
  className?: string
}
```

- [ ] **Step 1: Update `ListPageLayout.test.tsx` first and verify RED**

The test should assert metadata-only forwarding and ordinary child rendering:

```tsx
render(
  <ListPageLayout breadcrumb={[{ label: 'SOP' }]} title="Manajemen SOP">
    <div data-testid="page-content">Daftar</div>
  </ListPageLayout>,
)

expect(setPageHeaderSpy).toHaveBeenCalledWith(
  expect.objectContaining({
    breadcrumb: [{ label: 'SOP' }],
    title: 'Manajemen SOP',
  }),
)
expect(setPageHeaderSpy.mock.calls[0][0]).not.toHaveProperty('description')
expect(setPageHeaderSpy.mock.calls[0][0]).not.toHaveProperty('actions')
expect(screen.getByTestId('page-content')).toBeInTheDocument()
```

- [ ] **Step 2: Remove `description` and `actions` from `PageHeaderProvider`**

Update `PageHeaderContent`, `SetPageHeaderProps`, refs, and effect dependencies:

```tsx
const propsRef = useRef({ breadcrumb, title, leading })
propsRef.current = { breadcrumb, title, leading }

useEffect(() => {
  if (!setHeaderRef.current) return
  setHeaderRef.current(propsRef.current)
  return () => setHeaderRef.current?.(null)
}, [breadcrumbKey, title])
```

Update comments/examples so they no longer advertise page actions/descriptions in the shell.

- [ ] **Step 3: Remove `description`, `actions`, and `toolbar` from `ListPageLayout`**

Final implementation:

```tsx
export function ListPageLayout({
  breadcrumb,
  title,
  leading,
  children,
  className,
}: ListPageLayoutProps) {
  return (
    <div className={className ?? 'space-y-4 sm:space-y-section'}>
      <SetPageHeader
        breadcrumb={breadcrumb ?? []}
        title={title}
        leading={leading}
      />
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Search for legacy consumers and remove every remaining use**

Run:

```bash
rg "SearchToolbar|description=|actions=|toolbar=" client/src/pages client/src/components
```

Interpret results carefully: `description=`, `actions=`, and `toolbar=` may be valid props on unrelated components. Only remove matches where the receiver is `ListPageLayout`/`SetPageHeader` or the deleted `SearchToolbar`.

Update non-table `ListPageLayout` pages such as annual evaluation charts by simply dropping obsolete description/action props; do not wrap chart content in `DataSurface` unless it is actually a data collection.

- [ ] **Step 5: Delete `search-toolbar.tsx` only after `rg "SearchToolbar" client/src` returns no consumers**

```bash
rm client/src/components/ui/search-toolbar.tsx
```

Do not leave a deprecated dead wrapper once migration is complete.

- [ ] **Step 6: Run typecheck + layout tests and verify GREEN**

```bash
pnpm typecheck
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx src/components/layout/__tests__/ListPageLayout.test.tsx src/components/layout/__tests__/DashboardLayout.test.tsx src/components/layout/__tests__/SidebarUserMenu.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit final contract cleanup**

```bash
git add -A client/src/components/layout client/src/components/ui/search-toolbar.tsx client/src/pages client/src/components
git commit -m "refactor(client): finalize collection ownership contracts"
```

Before committing, inspect `git diff --cached --stat` and ensure unrelated application/editor code was not accidentally staged.

---

## Task 9: Add end-to-end regression coverage and run the full quality gate

**Files:**
- Modify: `client/e2e/list-filter-pagination.spec.ts`
- Modify only if needed for stable selectors: shared components from Tasks 1-8.

**Interfaces:**
- E2E verifies user-observable behavior, not implementation classes.
- Existing J01-J07 business journeys must continue to pass unchanged.

- [ ] **Step 1: Extend the list/filter E2E spec for the new SOP reference UX**

Add assertions covering:

```ts
await expect(page.getByRole('heading', { name: 'Manajemen SOP' })).toBeAttached()
await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
await expect(page.getByText('Daftar SOP yang Anda kelola.')).toHaveCount(0)
await expect(page.getByRole('button', { name: 'Buat SOP Baru' })).toBeVisible()
await expect(page.getByRole('button', { name: 'Ajukan evaluasi SOP' })).toBeVisible()
```

Because the heading is `sr-only`, assert attachment/semantic presence rather than visual visibility.

After setting a filter, assert the visible filter chip appears and can be removed without clearing search:

```ts
await search.fill('pengadaan')
// select one advanced filter using the page's existing stable filter controls
await expect(page.getByText(/Status:/)).toBeVisible()
await page.getByRole('button', { name: /Hapus filter Status:/ }).click()
await expect(search).toHaveValue('pengadaan')
```

Use the existing status option and selector names from the current test fixture; do not add test-only production behavior.

- [ ] **Step 2: Add shell placement assertions where the authenticated fixture already opens the dashboard**

Verify profile is not in header and remains reachable in navigation:

```ts
await expect(page.locator('header').getByRole('button', { name: 'Profil' })).toHaveCount(0)
await expect(page.locator('#desktop-sidebar').getByRole('button', { name: /Menu profil/ })).toBeVisible()
```

- [ ] **Step 3: Run the full client quality suite locally**

From `client/`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Expected: every command exits successfully with zero test failures and zero lint/typecheck errors.

- [ ] **Step 4: Run available local E2E**

```bash
pnpm exec playwright test e2e/list-filter-pagination.spec.ts
```

If documented local prerequisites are available, expected: PASS. If not, record the exact environment blocker in the PR body and rely on mandatory CI; do not claim E2E success without evidence.

- [ ] **Step 5: Search for stale UI ownership patterns**

```bash
rg "SearchToolbar" client/src
rg "<ListPageLayout[\\s\\S]*?(description=|actions=|toolbar=)" client/src/pages
```

The first command must return no production consumers/file. For the second, if ripgrep multiline syntax is not supported in the current shell, search each prop separately and inspect only `ListPageLayout` call sites.

- [ ] **Step 6: Create the PR only after local verification**

Use a PR title such as:

```text
refactor(client): unify data surfaces and app shell
```

PR body must summarize:

```text
- profile moved from header to desktop/mobile sidebar footer;
- authenticated header reduced to breadcrumb + notification with semantic sr-only h1;
- list actions moved into collection toolbars;
- search/filter/table/pagination unified into one DataSurface;
- active SOP filters are visible/removable and filter reset no longer clears search;
- simple + tabbed list pages migrated without backend/workflow changes;
- SearchToolbar legacy wrapper removed.
```

- [ ] **Step 7: Wait for and inspect mandatory repository CI**

Required green jobs include the repository's current client quality, server quality, database migration invariants, minimal production config, critical E2E business journeys, and container build jobs.

Do not infer success from partial jobs. Fetch the final workflow run and require overall `conclusion: success` before merge.

- [ ] **Step 8: Squash merge only after final CI success and no unresolved review blocker**

Use the branch head SHA as the expected merge head so a moved PR cannot be merged accidentally.

- [ ] **Step 9: Verify the merged PR state**

Fetch PR metadata after merge and confirm:

```text
state = closed
merged = true
base = main
```

Record the resulting main/squash commit SHA in the completion message.

---

## Acceptance checklist

The implementation is complete only when all of the following are true:

- The authenticated header visibly contains breadcrumb + notification only.
- A single semantic `h1` remains present and is visually `sr-only`.
- Profile/user identity is reachable from the bottom of the expanded desktop sidebar, collapsed sidebar rail, and mobile drawer.
- Header contains no profile trigger, no description, and no page business action.
- Page create/workflow actions live with their relevant data collection controls.
- `DataSurface` is composition-based and does not know domain filter/action/table schemas.
- Collection toolbar + table + pagination read as one outer surface with no nested card border/radius.
- Existing table pagination behavior is preserved.
- Existing tabs retain their domain state/callback behavior and are only repositioned visually.
- SOP advanced filters render visible removable chips.
- Removing one SOP filter leaves other filters and search intact.
- `clearFilters()` does not clear search; `clearSearch()` only clears search.
- SOP empty state distinguishes source-empty, search-empty, and filter-empty contexts.
- `SearchToolbar` has no production consumer and is deleted.
- `ListPageLayout` no longer owns visible description, page actions, or toolbar.
- No backend/API/route/permission/business-workflow code changes are required for the refactor.
- Client typecheck, lint, unit tests, and build pass.
- Mandatory repository CI concludes successfully before squash merge.

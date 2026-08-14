# Unified Data Surface & App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the authenticated admin UI so the shell owns navigation/global controls only, profile lives in the sidebar footer, and list/table pages render tabs, search, filters, page actions, table content, and pagination as one coherent data surface.

**Architecture:** Keep domain state and workflows inside existing pages. `PageHeaderProvider` transports breadcrumb + semantic title, `HeaderBar` renders breadcrumb + notification and an `sr-only` page heading, `SidebarUserMenu` owns profile/logout in desktop and mobile navigation, and small composition primitives (`DataSurface`, `ActiveFilterChips`) own collection layout without becoming domain-aware. Existing table pagination logic remains intact with an explicit embedded visual mode.

**Tech Stack:** React 19, TypeScript, TanStack Router, Tailwind CSS, Vitest, Testing Library, Playwright, pnpm.

## Global Constraints

- Frontend/UI-system refactor only; do not change backend endpoints, DTOs, API contracts, permissions, role checks, routes, or business workflows.
- Keep exactly one semantic page `h1`; in the authenticated shell it is visually `sr-only`.
- Visible `HeaderBar` content is breadcrumb/navigation context + notification only.
- Profile identity, `Profil Saya`, NIP detail, and logout live in the sidebar footer on desktop and mobile drawer.
- Page create/submit/workflow actions live with their data collection, never in the global header.
- One collection has one outer surface: one border, one radius, one background.
- Use composition instead of feature booleans on a mega `DataTable` component.
- Preserve existing data fetching, handlers, dialogs, row actions, tab state, and pagination behavior.
- Search and advanced filters are independent; resetting filters must not clear search.
- Do not introduce TanStack Table in this iteration.
- Responsive behavior is required on desktop/tablet/mobile; collection controls may wrap, but the page must not gain horizontal overflow.
- New shared behavior and state-reset changes follow TDD.
- Use the existing branch `refactor/unified-data-surface-shell` for the whole task.
- Required repository CI must be green before squash merge.

---

## File map

### Create

- `client/src/components/layout/SidebarUserMenu.tsx` — reusable profile/footer menu for expanded sidebar, collapsed rail, and mobile drawer.
- `client/src/components/layout/__tests__/SidebarUserMenu.test.tsx` — identity, profile navigation, logout, collapsed accessibility.
- `client/src/components/data/data-surface.tsx` — outer collection surface + header/tabs/toolbar/actions/filter-row composition primitives.
- `client/src/components/data/active-filter-chips.tsx` — removable active-filter chips + clear-all action.
- `client/src/components/data/__tests__/data-surface.test.tsx` — surface ownership and responsive layout contract.
- `client/src/components/data/__tests__/active-filter-chips.test.tsx` — individual removal, clear-all, empty-items behavior.
- `client/src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx` — search/filter reset independence.

### Modify shared shell/data primitives

- `client/src/components/layout/HeaderBar.tsx`
- `client/src/components/layout/PageHeaderProvider.tsx`
- `client/src/components/layout/ListPageLayout.tsx`
- `client/src/components/layout/AppSidebar.tsx`
- `client/src/components/layout/DashboardLayout.tsx`
- `client/src/components/layout/__tests__/HeaderBar.test.tsx`
- `client/src/components/layout/__tests__/DashboardLayout.test.tsx`
- `client/src/components/layout/__tests__/ListPageLayout.test.tsx`
- `client/src/components/ui/breadcrumb.tsx`
- `client/src/components/ui/data-table.tsx`
- `client/src/components/ui/__tests__/p3-polish-regressions.test.tsx`
- `client/src/components/ui/search-toolbar.tsx` — delete after all production consumers are migrated.

### Modify reference + list pages

- `client/src/pages/penyusun/sop/hooks/use-daftar-sop-filters.ts`
- `client/src/pages/penyusun/sop/ManajemenSOP.tsx`
- `client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx`
- `client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx`
- `client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx`
- `client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx`
- `client/src/pages/kepala-opd/sop/PantauSOP.tsx`
- `client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx`
- `client/src/pages/evaluator/evaluasi/DaftarSOPEvaluasi.tsx`
- `client/src/pages/pj-evaluator/evaluasi/ManajemenEvaluasiSop.tsx`
- `client/src/components/pengajuan/pengajuan-tabbed-table.tsx`
- `client/src/pages/kepala-opd/pengajuan/PengajuanSOPPage.tsx`
- `client/src/pages/penyusun/koordinator/berita-acara/BeritaAcaraKoordinatorPage.tsx`
- `client/src/pages/pj-evaluator/grafik-evaluasi/GrafikEvaluasiTahunan.tsx` — metadata-contract cleanup only unless it actually owns a tabular collection.

### E2E

- `client/e2e/list-filter-pagination.spec.ts`

---

## Task 1: Simplify `HeaderBar` and breadcrumb hierarchy

**Files:**
- Modify: `client/src/components/layout/HeaderBar.tsx`
- Modify: `client/src/components/layout/__tests__/HeaderBar.test.tsx`
- Modify: `client/src/components/ui/breadcrumb.tsx`

**Interfaces:**
- Temporarily consumes the current `PageHeaderContent` shape so list pages keep compiling during migration.
- Produces visible breadcrumb + `NotificationBell`; title remains exactly one `h1.sr-only`; description/actions/profile are not rendered.

- [ ] **Step 1: Write the failing header-semantics test**

Replace the current visible-title expectation with:

```tsx
render(
  <PageHeaderProvider>
    <HeaderBar />
    <SetPageHeader
      breadcrumb={[{ label: 'Penyusun' }, { label: 'Manajemen SOP' }]}
      title="Manajemen SOP"
      description="Tidak boleh terlihat di header."
      actions={<button type="button">Buat SOP</button>}
    />
  </PageHeaderProvider>,
)

expect(await screen.findByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
expect(screen.getByText('Manajemen SOP')).toHaveAttribute('aria-current', 'page')
expect(screen.getByRole('heading', { name: 'Manajemen SOP' })).toHaveClass('sr-only')
expect(screen.queryByText('Tidak boleh terlihat di header.')).not.toBeInTheDocument()
expect(screen.queryByRole('button', { name: 'Buat SOP' })).not.toBeInTheDocument()
expect(screen.queryByRole('button', { name: 'Profil' })).not.toBeInTheDocument()
```

Keep the empty-breadcrumb test and require its heading to have `sr-only`.

- [ ] **Step 2: Run RED**

```bash
cd client
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx
```

Expected: FAIL because title, description, actions, and profile are currently rendered.

- [ ] **Step 3: Implement the minimal shell header**

`HeaderBar.tsx` becomes:

```tsx
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { NotificationBell } from './NotificationBell'
import { usePageHeaderContext } from '@/components/layout/PageHeaderProvider'

export function HeaderBar() {
  const headerContent = usePageHeaderContext()?.headerContent

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

Do not delete provider props yet; final contract cleanup happens after all page migrations.

- [ ] **Step 4: Strengthen the current breadcrumb item**

Change the non-link/current breadcrumb class from:

```tsx
className="font-medium text-secondary-foreground"
```

to:

```tsx
className="font-medium text-foreground"
```

Do not change link routing or `aria-current` behavior.

- [ ] **Step 5: Run GREEN**

```bash
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add client/src/components/layout/HeaderBar.tsx client/src/components/layout/__tests__/HeaderBar.test.tsx client/src/components/ui/breadcrumb.tsx
git commit -m "refactor(client): simplify authenticated header"
```

---

## Task 2: Move profile/logout to the sidebar footer on desktop and mobile

**Files:**
- Create: `client/src/components/layout/SidebarUserMenu.tsx`
- Create: `client/src/components/layout/__tests__/SidebarUserMenu.test.tsx`
- Modify: `client/src/components/layout/AppSidebar.tsx`
- Modify: `client/src/components/layout/DashboardLayout.tsx`
- Modify: `client/src/components/layout/__tests__/DashboardLayout.test.tsx`

**Interfaces:**

```ts
export interface SidebarUserMenuProps {
  collapsed?: boolean
  onNavigate?: () => void
  className?: string
}
```

The component owns `useAppRole()`, `useAuth()`, `useNavigate()`, `getMeRoute()`, and logout navigation to `ROUTES.HOME`.

- [ ] **Step 1: Write failing profile-footer tests**

Mock the same role/auth/router behavior that the old header test used:

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
expect(screen.getByRole('button', { name: 'Menu profil Pengguna Uji' })).toBeInTheDocument()
expect(screen.queryByText('PJ Penyusun')).not.toBeVisible()
```

Logout case must assert mocked logout and navigation to `ROUTES.HOME`.

- [ ] **Step 2: Run RED**

```bash
pnpm test -- src/components/layout/__tests__/SidebarUserMenu.test.tsx
```

- [ ] **Step 3: Implement `SidebarUserMenu`**

Use the existing dropdown primitives and identity helpers:

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
            title={collapsed ? displayName : undefined}
            className={cn(
              'flex min-h-11 w-full items-center rounded-control text-left hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
                const route = getMeRoute(role)
                if (!route) return
                onNavigate?.()
                navigate({ to: route })
              }}
            >
              Profil Saya
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            className="text-danger focus:bg-danger-subtle focus:text-danger-foreground"
            onSelect={() => void handleLogout()}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" aria-hidden />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

- [ ] **Step 4: Mount it below the scrollable navigation**

At the end of `AppSidebar`, after `<nav>`:

```tsx
<SidebarUserMenu collapsed={collapsed} />
```

At the end of the mobile drawer, after the scrollable menu container:

```tsx
<SidebarUserMenu
  collapsed={false}
  onNavigate={() => setIsMobileNavOpen(false)}
/>
```

The footer must stay outside the scrollable nav container.

- [ ] **Step 5: Extend `DashboardLayout.test.tsx`**

Keep all existing sidebar-collapse/localStorage tests and add:

```tsx
expect(document.querySelector('#desktop-sidebar')?.querySelector('[aria-label^="Menu profil"]')).not.toBeNull()
fireEvent.click(screen.getByRole('button', { name: 'Buka navigasi' }))
expect(document.querySelector('#mobile-main-navigation')?.querySelector('[aria-label^="Menu profil"]')).not.toBeNull()
```

- [ ] **Step 6: Run GREEN**

```bash
pnpm test -- src/components/layout/__tests__/SidebarUserMenu.test.tsx src/components/layout/__tests__/DashboardLayout.test.tsx src/components/layout/__tests__/HeaderBar.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add client/src/components/layout/SidebarUserMenu.tsx client/src/components/layout/AppSidebar.tsx client/src/components/layout/DashboardLayout.tsx client/src/components/layout/__tests__/SidebarUserMenu.test.tsx client/src/components/layout/__tests__/DashboardLayout.test.tsx
git commit -m "refactor(client): move profile into sidebar"
```

---

## Task 3: Add composition-based `DataSurface` and active filter chips

**Files:**
- Create: `client/src/components/data/data-surface.tsx`
- Create: `client/src/components/data/active-filter-chips.tsx`
- Create: `client/src/components/data/__tests__/data-surface.test.tsx`
- Create: `client/src/components/data/__tests__/active-filter-chips.test.tsx`

**Interfaces:**

```ts
export const DataSurface = {
  Root: DataSurfaceRoot,
  Header: DataSurfaceHeader,
  Tabs: DataSurfaceTabs,
  Toolbar: DataSurfaceToolbar,
  Actions: DataSurfaceActions,
  FilterRow: DataSurfaceFilterRow,
}

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

- [ ] **Step 1: Write failing composition tests**

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
    <div>Isi tabel</div>
  </DataSurface.Root>,
)

expect(screen.getByTestId('data-surface')).toHaveClass('rounded-surface', 'border', 'border-border', 'bg-surface')
expect(screen.getByLabelText('Cari SOP')).toBeInTheDocument()
expect(screen.getByRole('button', { name: 'Buat SOP' })).toBeInTheDocument()
```

Also assert the toolbar includes `flex-col sm:flex-row`, actions wrap, and tabs are horizontally scroll-safe.

- [ ] **Step 2: Write failing filter-chip tests**

```tsx
const remove = vi.fn()
const clearAll = vi.fn()
render(
  <ActiveFilterChips
    items={[{ id: 'status', label: 'Status: Draft', onRemove: remove }]}
    onClearAll={clearAll}
  />,
)

fireEvent.click(screen.getByRole('button', { name: 'Hapus filter Status: Draft' }))
expect(remove).toHaveBeenCalledTimes(1)
fireEvent.click(screen.getByRole('button', { name: 'Hapus semua filter' }))
expect(clearAll).toHaveBeenCalledTimes(1)
```

Add a second test with `items={[]}` and assert neither chip nor clear-all button renders.

- [ ] **Step 3: Run RED**

```bash
pnpm test -- src/components/data/__tests__/data-surface.test.tsx src/components/data/__tests__/active-filter-chips.test.tsx
```

- [ ] **Step 4: Implement `DataSurface`**

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

Set display names and export the object shown in Interfaces.

- [ ] **Step 5: Implement `ActiveFilterChips`**

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

- [ ] **Step 6: Run GREEN**

```bash
pnpm test -- src/components/data/__tests__/data-surface.test.tsx src/components/data/__tests__/active-filter-chips.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add client/src/components/data/data-surface.tsx client/src/components/data/active-filter-chips.tsx client/src/components/data/__tests__/data-surface.test.tsx client/src/components/data/__tests__/active-filter-chips.test.tsx
git commit -m "feat(client): add unified data surface primitives"
```

---

## Task 4: Add explicit embedded mode to paginated tables

**Files:**
- Modify: `client/src/components/ui/data-table.tsx`
- Modify: `client/src/components/ui/__tests__/p3-polish-regressions.test.tsx`

**Interfaces:**

```ts
surfaceMode?: 'standalone' | 'embedded'
```

Default is `standalone`. `embedded` removes only the outer table card styling; page state, slicing, and pagination behavior do not change.

- [ ] **Step 1: Write failing standalone/embedded tests**

```tsx
render(
  <Table.Paginated data={[1]} label="Item" surfaceMode="embedded">
    {(items) => <div data-testid="embedded-content">{items[0]}</div>}
  </Table.Paginated>,
)

const embedded = screen.getByTestId('embedded-content').parentElement
expect(embedded).not.toHaveClass('rounded-surface', 'border', 'bg-surface')
```

Render a second instance without `surfaceMode` and assert the current standalone surface classes remain.

- [ ] **Step 2: Run RED**

```bash
pnpm test -- src/components/ui/__tests__/p3-polish-regressions.test.tsx
```

- [ ] **Step 3: Implement the mode**

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
  const [page, setPage] = useState(1)
  const totalPages = data.length === 0 ? 1 : Math.ceil(data.length / pageSize)
  const safePage = Math.min(Math.max(1, page), totalPages)
  useEffect(() => { if (page > totalPages) setPage(1) }, [page, totalPages])
  const startIndex = (safePage - 1) * pageSize
  const pageData = useMemo(() => data.slice(startIndex, startIndex + pageSize), [data, startIndex, pageSize])

  return (
    <div className={cn(surfaceMode === 'standalone' ? tableSurfaceClassName : 'min-w-0', className)}>
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

- [ ] **Step 4: Run GREEN**

```bash
pnpm test -- src/components/ui/__tests__/p3-polish-regressions.test.tsx
```

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ui/data-table.tsx client/src/components/ui/__tests__/p3-polish-regressions.test.tsx
git commit -m "refactor(client): support embedded paginated tables"
```

---

## Task 5: Make Manajemen SOP the reference implementation

**Files:**
- Modify: `client/src/pages/penyusun/sop/hooks/use-daftar-sop-filters.ts`
- Create: `client/src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx`
- Modify: `client/src/pages/penyusun/sop/ManajemenSOP.tsx`

**Interfaces:**

```ts
export interface DaftarSOPAdvancedFilters {
  statusFilter: string | null
  filterTanggalDari: string | null
  filterTanggalSampai: string | null
}
```

Hook return includes `searchQuery`, `filterStatus`, both date values, `isFilterOpen`, `activeFilterCount`, setters, `clearSearch()`, and `clearFilters()`.

- [ ] **Step 1: Write failing reset-independence test**

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

- [ ] **Step 2: Run RED**

```bash
pnpm test -- src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx
```

- [ ] **Step 3: Separate search state from advanced filters**

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

`activeFilterCount` counts only advanced filters.

- [ ] **Step 4: Run GREEN for the hook**

```bash
pnpm test -- src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx
```

- [ ] **Step 5: Replace header action + `SearchToolbar` ownership in `ManajemenSOP.tsx`**

The page metadata becomes:

```tsx
<ListPageLayout
  breadcrumb={[{ label: 'Manajemen SOP' }]}
  title="Manajemen SOP"
>
```

Inside it, add one `DataSurface.Root` containing:

```tsx
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
      <div className="space-y-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground">Filter SOP</p>
          {filters.activeFilterCount > 0 ? (
            <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={filters.clearFilters}>
              Reset
            </Button>
          ) : null}
        </div>
        <FormField label="Status" htmlFor={filterStatusId}>
          <SOPStatusFilterSelect
            id={filterStatusId}
            value={filters.filterStatus ?? 'all'}
            onValueChange={filters.setStatusFilter}
          />
        </FormField>
        <FormField label="Terakhir diperbarui">
          <DateRangeFilterFields
            fromId={filterTanggalDariId}
            toId={filterTanggalSampaiId}
            fromValue={filters.filterTanggalDari ?? ''}
            toValue={filters.filterTanggalSampai ?? ''}
            onFromChange={filters.setFilterTanggalDari}
            onToChange={filters.setFilterTanggalSampai}
          />
        </FormField>
      </div>
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
      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setIsBuatSOPDialogOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Buat SOP Baru
      </Button>
    </DataSurface.Actions>
  </DataSurface.Toolbar>
  <DataSurface.FilterRow>
    <ActiveFilterChips items={activeFilterItems} onClearAll={filters.clearFilters} />
  </DataSurface.FilterRow>
</DataSurface.Header>
```

Move the page's existing `Table.Paginated` block directly below this header, unchanged except for:

```tsx
<Table.Paginated data={filteredList} label="SOP" surfaceMode="embedded">
```

Keep `BukaPengajuanEvaluasiDialog`, `BuatSOPDialog`, and `ConfirmDialog` outside `DataSurface.Root` so dialogs are not part of the visual collection surface.

- [ ] **Step 6: Build visible filter chips**

Use a local safe date formatter:

```tsx
const formatFilterDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
```

Build:

```tsx
const activeFilterItems = [
  ...(filters.filterStatus && filters.filterStatus !== 'all'
    ? [{ id: 'status', label: `Status: ${filters.filterStatus}`, onRemove: () => filters.setStatusFilter(null) }]
    : []),
  ...(filters.filterTanggalDari
    ? [{ id: 'tanggal-dari', label: `Dari: ${formatFilterDate(filters.filterTanggalDari)}`, onRemove: () => filters.setFilterTanggalDari(null) }]
    : []),
  ...(filters.filterTanggalSampai
    ? [{ id: 'tanggal-sampai', label: `Sampai: ${formatFilterDate(filters.filterTanggalSampai)}`, onRemove: () => filters.setFilterTanggalSampai(null) }]
    : []),
]
```

If the existing status config already exports the human-readable label for the selected status, use that label instead of displaying the enum value; do not create a duplicate status mapping.

- [ ] **Step 7: Make the empty row contextual**

```tsx
const hasSearch = filters.searchQuery.trim().length > 0
const hasAdvancedFilters = filters.activeFilterCount > 0
```

Replace the generic empty copy with:

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

- [ ] **Step 8: Run focused tests + typecheck**

```bash
pnpm test -- src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx src/components/data/__tests__/data-surface.test.tsx src/components/data/__tests__/active-filter-chips.test.tsx
pnpm typecheck
```

- [ ] **Step 9: Commit**

```bash
git add client/src/pages/penyusun/sop/hooks/use-daftar-sop-filters.ts client/src/pages/penyusun/sop/hooks/__tests__/use-daftar-sop-filters.test.tsx client/src/pages/penyusun/sop/ManajemenSOP.tsx
git commit -m "refactor(client): unify SOP collection controls"
```

---

## Task 6: Migrate all remaining collection pages to the same surface pattern

**Files:**
- Modify all list/collection files listed in the File map.

**Interfaces:**
- Search uses existing `SearchInput` values/handlers.
- Existing tabs are placed inside `DataSurface.Tabs`; their state and callbacks are unchanged.
- Existing page action buttons move into `DataSurface.Actions` unchanged.
- Existing `Table.Paginated` instances inside `DataSurface.Root` use `surfaceMode="embedded"`.
- Read-only pages omit `DataSurface.Actions` entirely.

- [ ] **Step 1: Migrate simple create/search pages**

For `PelaksanaSOP.tsx`, `ManajemenPeraturan.tsx`, `ManajemenEvaluator.tsx`, and `ManajemenPenyusun.tsx`, remove `SearchToolbar` and `ListPageLayout.actions`/`toolbar`. Use this structure:

```tsx
<ListPageLayout breadcrumb={breadcrumb} title={title}>
  <DataSurface.Root>
    <DataSurface.Header>
      <DataSurface.Toolbar>
        <SearchInput
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          value={searchValue}
          onChange={searchChangeHandler}
        />
        <DataSurface.Actions>
          {createButton}
        </DataSurface.Actions>
      </DataSurface.Toolbar>
    </DataSurface.Header>
    {tableContent}
  </DataSurface.Root>
  {dialogContent}
</ListPageLayout>
```

In implementation, `breadcrumb`, `title`, `searchPlaceholder`, `searchValue`, `searchChangeHandler`, `createButton`, `tableContent`, and `dialogContent` are not new runtime variables: substitute the page's current literal props/JSX in place. Do not introduce helper variables solely to satisfy this structure.

Preserve these existing create callbacks exactly:

`PelaksanaSOP.tsx`:

```tsx
onClick={() => {
  resetForm()
  setIsCreateDialogOpen(true)
}}
```

`ManajemenPeraturan.tsx`:

```tsx
onClick={() => openPeraturanDialog()}
```

`ManajemenPenyusun.tsx`:

```tsx
onClick={() => {
  setFormData(emptyForm())
  setCreateOpdId(undefined)
  setIsCreateOpen(true)
}}
```

For `ManajemenEvaluator.tsx`, preserve its current create/reset callback verbatim rather than changing evaluator assignment behavior.

- [ ] **Step 2: Migrate read-only `PantauSOP.tsx`**

Use:

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
    {pageData => /* keep the file's current table renderer unchanged */ null}
  </Table.Paginated>
</DataSurface.Root>
```

During implementation, keep the current table child renderer; do not replace it with `null` or change row behavior. The snippet defines only ownership/layout.

- [ ] **Step 3: Migrate `ManajemenOPD.tsx`**

Place the current OPD/Kepala OPD tab control inside:

```tsx
<DataSurface.Tabs>
  {/* current tabs JSX, unchanged */}
</DataSurface.Tabs>
```

Place the current search control and page actions inside `DataSurface.Toolbar`; render the current active tab content below `DataSurface.Header`. Do not move tab state into `DataSurface`.

- [ ] **Step 4: Migrate evaluation collections**

For `DaftarSOPEvaluasi.tsx` and `ManajemenEvaluasiSop.tsx`:

```tsx
<DataSurface.Root>
  <DataSurface.Header>
    <DataSurface.Tabs>
      {/* existing evaluation filter tabs */}
    </DataSurface.Tabs>
    <DataSurface.Toolbar>
      {/* existing search/filter controls */}
      <DataSurface.Actions>
        {/* only existing page-wide workflow actions */}
      </DataSurface.Actions>
    </DataSurface.Toolbar>
  </DataSurface.Header>
  {/* existing grouped list or table content */}
</DataSurface.Root>
```

Keep evaluation status values, queries, and workflow handlers unchanged.

- [ ] **Step 5: Make `pengajuan-tabbed-table.tsx` own the single collection surface**

Its visible structure becomes:

```tsx
<DataSurface.Root>
  <DataSurface.Header>
    <DataSurface.Tabs>
      {/* current tab list and counts */}
    </DataSurface.Tabs>
    {/* render a DataSurface.Toolbar here only when the current component has actual controls */}
  </DataSurface.Header>
  {/* current tab content / empty states / tables */}
</DataSurface.Root>
```

Then remove any second bordered collection wrapper around it in `PengajuanSOPPage.tsx`.

- [ ] **Step 6: Migrate `BeritaAcaraKoordinatorPage.tsx` only where it owns a collection**

Keep non-tabular/detail sections untouched. Any table/list section with its own search/actions uses one `DataSurface`; no chart/detail card is converted just to enforce uniformity.

- [ ] **Step 7: Run typecheck after all migrations**

```bash
pnpm typecheck
```

Expected: PASS with no stale page-action/header type errors.

- [ ] **Step 8: Commit collection migrations**

```bash
git add client/src/pages/penyusun/pelaksana/PelaksanaSOP.tsx client/src/pages/penyusun/peraturan/ManajemenPeraturan.tsx client/src/pages/pj-evaluator/evaluator/ManajemenEvaluator.tsx client/src/pages/pj-evaluator/penyusun/ManajemenPenyusun.tsx client/src/pages/kepala-opd/sop/PantauSOP.tsx client/src/pages/pj-evaluator/opd/ManajemenOPD.tsx client/src/pages/evaluator/evaluasi/DaftarSOPEvaluasi.tsx client/src/pages/pj-evaluator/evaluasi/ManajemenEvaluasiSop.tsx client/src/components/pengajuan/pengajuan-tabbed-table.tsx client/src/pages/kepala-opd/pengajuan/PengajuanSOPPage.tsx client/src/pages/penyusun/koordinator/berita-acara/BeritaAcaraKoordinatorPage.tsx
git commit -m "refactor(client): unify list collection surfaces"
```

---

## Task 7: Remove legacy page-header/list-toolbar ownership contracts

**Files:**
- Modify: `client/src/components/layout/PageHeaderProvider.tsx`
- Modify: `client/src/components/layout/ListPageLayout.tsx`
- Modify: `client/src/components/layout/__tests__/ListPageLayout.test.tsx`
- Delete: `client/src/components/ui/search-toolbar.tsx`
- Modify any remaining `ListPageLayout` consumer that still passes `description`, `actions`, or `toolbar`.

**Interfaces:**

Final contracts:

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

- [ ] **Step 1: Write failing `ListPageLayout` contract test**

```tsx
render(
  <ListPageLayout breadcrumb={[{ label: 'SOP' }]} title="Manajemen SOP">
    <div data-testid="page-content">Daftar</div>
  </ListPageLayout>,
)

expect(setPageHeaderSpy).toHaveBeenCalledWith(
  expect.objectContaining({ breadcrumb: [{ label: 'SOP' }], title: 'Manajemen SOP' }),
)
expect(setPageHeaderSpy.mock.calls[0][0]).not.toHaveProperty('description')
expect(setPageHeaderSpy.mock.calls[0][0]).not.toHaveProperty('actions')
expect(screen.getByTestId('page-content')).toBeInTheDocument()
```

- [ ] **Step 2: Run RED**

```bash
pnpm test -- src/components/layout/__tests__/ListPageLayout.test.tsx
```

- [ ] **Step 3: Simplify `PageHeaderProvider`**

```tsx
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

export function SetPageHeader({ breadcrumb, title, leading }: SetPageHeaderProps) {
  const ctx = usePageHeaderContext()
  const propsRef = useRef({ breadcrumb, title, leading })
  propsRef.current = { breadcrumb, title, leading }
  const breadcrumbKey = JSON.stringify(breadcrumb)
  const setHeaderRef = useRef(ctx?.setHeaderContent)
  setHeaderRef.current = ctx?.setHeaderContent

  useEffect(() => {
    if (!setHeaderRef.current) return
    setHeaderRef.current(propsRef.current)
    return () => setHeaderRef.current?.(null)
  }, [breadcrumbKey, title])

  return null
}
```

Update comments/examples so they no longer advertise visible header descriptions/actions.

- [ ] **Step 4: Simplify `ListPageLayout`**

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

- [ ] **Step 5: Remove obsolete props from every remaining consumer**

Run:

```bash
rg "<ListPageLayout" client/src/pages
rg "SearchToolbar" client/src
```

For each `ListPageLayout`, remove only its obsolete `description`, `actions`, and `toolbar` props. Do not remove unrelated `description`/`actions` props from dialogs, empty states, menus, or other components.

For `GrafikEvaluasiTahunan.tsx`, keep chart content as chart content; only clean the page metadata contract.

- [ ] **Step 6: Delete `search-toolbar.tsx` after the second search returns only the component file itself**

```bash
rm client/src/components/ui/search-toolbar.tsx
```

Then run:

```bash
rg "SearchToolbar" client/src
```

Expected: no result.

- [ ] **Step 7: Run GREEN**

```bash
pnpm typecheck
pnpm test -- src/components/layout/__tests__/HeaderBar.test.tsx src/components/layout/__tests__/ListPageLayout.test.tsx src/components/layout/__tests__/DashboardLayout.test.tsx src/components/layout/__tests__/SidebarUserMenu.test.tsx
```

- [ ] **Step 8: Commit**

```bash
git add -A client/src/components/layout client/src/components/ui/search-toolbar.tsx client/src/pages client/src/components
git commit -m "refactor(client): finalize shell and collection ownership"
```

Inspect staged files before committing and exclude unrelated editor/business logic.

---

## Task 8: E2E regression and full quality gate

**Files:**
- Modify: `client/e2e/list-filter-pagination.spec.ts`

**Interfaces:**
- E2E asserts user-visible behavior, not internal component classes.
- Existing critical business journeys remain unchanged.

- [ ] **Step 1: Extend SOP list E2E for semantic header + collection actions**

Add:

```ts
await expect(page.getByRole('heading', { name: 'Manajemen SOP' })).toBeAttached()
await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
await expect(page.getByText('Daftar SOP yang Anda kelola.')).toHaveCount(0)
await expect(page.getByRole('button', { name: 'Buat SOP Baru' })).toBeVisible()
```

For a PJ Penyusun fixture, also require:

```ts
await expect(page.getByRole('button', { name: 'Ajukan evaluasi SOP' })).toBeVisible()
```

- [ ] **Step 2: Verify filter reset does not erase search**

Use the existing filter controls/fixture values in this spec. After entering search text and selecting one advanced filter:

```ts
await search.fill('pengadaan')
await expect(page.getByText(/Status:/)).toBeVisible()
await page.getByRole('button', { name: /Hapus filter Status:/ }).click()
await expect(search).toHaveValue('pengadaan')
```

Do not add test-only production behavior.

- [ ] **Step 3: Verify profile placement**

```ts
await expect(page.locator('header').getByRole('button', { name: 'Profil' })).toHaveCount(0)
await expect(page.locator('#desktop-sidebar').getByRole('button', { name: /Menu profil/ })).toBeVisible()
```

- [ ] **Step 4: Run the complete client verification**

From `client/`:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Every command must exit successfully before PR creation.

- [ ] **Step 5: Run the list/filter Playwright spec when local E2E prerequisites are available**

```bash
pnpm exec playwright test e2e/list-filter-pagination.spec.ts
```

If local infrastructure is unavailable, record the exact blocker in the PR body; do not claim local E2E success.

- [ ] **Step 6: Final stale-pattern scan**

```bash
rg "SearchToolbar" client/src
rg "description=" client/src/pages
rg "actions=" client/src/pages
rg "toolbar=" client/src/pages
```

The first command must be empty. For the other three, inspect results and confirm no `ListPageLayout`/`SetPageHeader` call still uses obsolete props; unrelated components may legitimately keep those prop names.

- [ ] **Step 7: Open PR**

Title:

```text
refactor(client): unify data surfaces and app shell
```

PR summary:

```text
- move profile/logout from header to desktop/mobile sidebar footer;
- reduce authenticated header to breadcrumb + notification with semantic sr-only h1;
- move page actions into collection toolbars;
- unify tabs/search/filter/actions/table/pagination under one DataSurface;
- expose removable SOP filter chips and keep search independent from filter reset;
- migrate simple and tabbed list pages without backend/workflow changes;
- remove the legacy SearchToolbar wrapper.
```

- [ ] **Step 8: Require full repository CI success before merge**

Fetch the final PR workflow run. Require overall `conclusion: success`, including the repository's client quality, server quality, database migration invariants, minimal production config, critical E2E business journeys, and container build jobs.

- [ ] **Step 9: Squash merge only after CI success and no unresolved blocker**

Merge using the PR head SHA as `expected_head_sha`.

- [ ] **Step 10: Verify merged state**

Fetch PR metadata and require:

```text
state = closed
merged = true
base = main
```

Report the resulting squash/main commit SHA.

---

## Acceptance checklist

- Header visibly shows breadcrumb + notification only.
- Exactly one semantic page heading remains, as `h1.sr-only`.
- Current breadcrumb item is visually stronger than ancestors.
- Profile/menu is pinned to the bottom of expanded desktop sidebar, remains reachable in collapsed rail, and appears at the bottom of the mobile drawer.
- Header contains no profile trigger, page description, or business action.
- Page actions live in the related collection toolbar.
- `DataSurface` is composition-only and domain-agnostic.
- Collection controls + table + pagination use one outer surface with no nested card border/radius.
- Existing pagination logic remains unchanged.
- Existing tab state/callbacks remain domain-owned.
- SOP active filters are visible and individually removable.
- `clearFilters()` does not clear search; `clearSearch()` only clears search.
- SOP empty state distinguishes no-source-data, no-search-result, and no-filter-result conditions.
- `SearchToolbar` has no production consumer and is deleted.
- `ListPageLayout`/`PageHeaderProvider` no longer expose description/actions/toolbar ownership.
- No backend/API/route/permission/business-workflow change is introduced.
- Client typecheck, lint, unit tests, and build pass.
- Mandatory repository CI is fully successful before squash merge.

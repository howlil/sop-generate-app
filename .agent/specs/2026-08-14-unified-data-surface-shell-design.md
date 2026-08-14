# Unified Data Surface & App Shell Design

Date: 2026-08-14
Status: Approved design, pending implementation plan
Branch: `refactor/unified-data-surface-shell`

## Goal

Refactor the authenticated admin UI into one coherent interaction model:

- the app shell owns navigation and global controls only;
- the sidebar owns the user/profile entry;
- the header shows navigation context only;
- list-page controls, business actions, filters, table content, and pagination live in one unified data surface;
- search and filters remain logically independent;
- list/table pages share visual primitives without becoming a mega-component.

This is a frontend/UI-system refactor. Existing API contracts, route permissions, business workflows, data fetching, and backend behavior remain unchanged.

## Problems to solve

### Header overload

The current header renders breadcrumb, visible title, description, page business actions, notification, and profile. This mixes global shell responsibilities with page-specific data actions.

The desired shell is simpler:

- visible breadcrumb/navigation context;
- notification control;
- semantic page heading remains available to assistive technology;
- no visible page title duplication;
- no long page description;
- no create/submit/workflow buttons;
- no profile menu in the header.

### Profile placement

The profile belongs to the navigation shell, not the page header. It should be a fixed footer area at the bottom of the desktop sidebar and mobile navigation drawer.

### Fragmented list-page surfaces

Search/filter controls and tables currently render as separate bordered cards. This creates unnecessary visual fragmentation and gives the UI a generic dashboard-template appearance.

Search, filter, optional tabs, active filter state, page actions, table, and pagination should instead read as one data-management unit.

### Hidden active filter state

The current filter button can expose only a numeric active-filter count. Users cannot see which filters are active without opening the dropdown.

### Search/filter reset coupling

Search and advanced filters are separate concepts. Resetting advanced filters must not silently clear the search query.

### Generic empty-state behavior

A collection with no source data, no search matches, and no filtered matches are different states and should communicate different next actions.

## Design principles

1. **Global shell is global.** Sidebar/header do not host business actions for the current dataset.
2. **One collection, one surface.** Related controls and table content share one visual container.
3. **Composition over configuration.** Avoid a `DataTable` component with many boolean props.
4. **Preserve domain ownership.** Pages keep their own filtering, permissions, dialogs, handlers, data fetching, and workflows.
5. **No nested cards.** A unified collection should have one border, one radius, and one background surface.
6. **No unnecessary dependency migration.** Do not introduce TanStack Table unless future requirements actually need complex table-state capabilities.
7. **Accessible semantics remain intact.** Visual simplification must not remove the page heading or accessible labels.
8. **Responsive behavior is part of the component contract, not a later polish pass.**

## Target application shell

```text
┌──────── Sidebar ────────┐  ┌──────────── Header ───────────────────┐
│ Logo + App Name         │  │ Penyusun / Manajemen SOP          🔔 │
│                         │  └───────────────────────────────────────┘
│ Dashboard               │
│ Manajemen SOP           │          Page content
│ Pelaksana               │
│ Peraturan               │   ┌─────────────────────────────────────┐
│ ...                     │   │ Search  Filter       Page actions  │
│                         │   │ active filter chips                 │
│                         │   ├─────────────────────────────────────┤
│                         │   │ table                               │
│                         │   ├─────────────────────────────────────┤
│                         │   │ pagination                          │
│─────────────────────────│   └─────────────────────────────────────┘
│ ◯ User Name         ⋯   │
│   Role                  │
└─────────────────────────┘
```

## 1. Sidebar user profile footer

Create a reusable `SidebarUserMenu`/`SidebarProfileFooter` primitive and render it after the scrollable navigation region.

### Expanded desktop sidebar

Visible footer content:

- compact avatar/user icon;
- display name, truncated safely;
- role label;
- menu affordance if needed.

NIP should not remain permanently visible because it adds visual noise. It may remain available inside the dropdown menu.

The dropdown keeps the existing actions:

- user identity details;
- `Profil Saya` when the role has a valid self-profile route;
- `Logout` as a destructive menu action.

### Collapsed desktop sidebar

Only the avatar/icon remains visible. The footer must still be keyboard reachable. Hover/focus may show a tooltip with the user display name. Clicking opens the same profile dropdown.

### Mobile navigation

The mobile drawer should use the same profile-footer concept at its bottom rather than putting profile back into the top header. Desktop and mobile navigation should follow the same mental model.

## 2. Header simplification

The authenticated header becomes a global navigation/context bar.

Visible content:

- breadcrumb;
- notification bell.

Removed from visible header:

- large page title;
- page description;
- page business actions;
- profile menu.

The page title remains in the DOM as a single screen-reader-only `h1`:

```tsx
<h1 className="sr-only">Manajemen SOP</h1>
```

This preserves document structure and assistive-technology semantics while removing redundant visual repetition.

### Breadcrumb hierarchy

Ancestor items use muted foreground. The final/current item should be visually stronger (`font-medium`, foreground) so the breadcrumb itself becomes the visible page identity.

The breadcrumb must remain horizontally safe on narrow layouts through truncation or controlled overflow rather than wrapping into a large pseudo-title block.

## 3. Page-header contract simplification

`PageHeaderProvider` remains useful as declarative page metadata transport, but its role changes.

Required shell metadata:

- `breadcrumb`;
- `title` for semantic `h1`/document accessibility;
- optional `leading` only if a real shell-level navigation context requires it.

Fields that should no longer drive visible shell layout:

- `description`;
- `actions`.

`ListPageLayout` should stop treating `description` and page actions as header concerns.

Backward compatibility may be used temporarily during migration, but the final component API should make ownership explicit rather than leaving obsolete fields indefinitely.

## 4. Unified `DataSurface`

Introduce a composition-based collection surface for list/table pages.

Conceptual API:

```tsx
<DataSurface>
  <DataSurface.Header>
    <DataSurface.Tabs>{/* optional */}</DataSurface.Tabs>

    <DataSurface.Toolbar>
      <SearchInput />
      <FilterDropdownButton />
      <DataSurface.Actions>{/* optional */}</DataSurface.Actions>
    </DataSurface.Toolbar>

    <ActiveFilterChips>{/* optional */}</ActiveFilterChips>
  </DataSurface.Header>

  <Table.Paginated>{/* domain table */}</Table.Paginated>
</DataSurface>
```

The exact component names may be adjusted to fit existing conventions, but the responsibility split is fixed:

- `DataSurface` owns outer border/radius/background and vertical layout;
- `DataSurface.Header` owns collection-level controls;
- tabs remain owned by their domain components;
- toolbar owns responsive control placement only;
- page/domain actions remain real buttons supplied by the page;
- table remains table primitives, not domain-aware configuration;
- pagination remains existing behavior but visually belongs to the same surface.

## 5. Search and filter controls

The existing standalone `SearchToolbar` card pattern should be migrated away from collection pages because it creates a second surface above the table.

Search remains a primitive control, not a responsibility of the table implementation.

### Desktop hierarchy

```text
[Search........................] [Filter]       [Secondary] [+ Primary]
```

### Button hierarchy

Primary resource creation actions use the primary button style:

- `Buat SOP Baru`;
- `Tambah Pelaksana`;
- `Tambah Peraturan`;
- similar resource-create actions.

Workflow actions use secondary/outline styling when they are not the main resource creation action:

- `Ajukan evaluasi SOP`.

Read-only pages simply omit the actions slot.

## 6. Optional tabs inside the data surface

Existing tab behavior and domain logic remain intact. Do not rewrite tab state merely to fit the new visual system.

Examples such as evaluation filters, OPD tabs, and pengajuan tabbed tables should be composable into the `DataSurface.Tabs` area.

The result is one consistent collection surface regardless of whether a page has:

- no tabs;
- status tabs;
- role/domain tabs;
- search only;
- search + filters;
- actions;
- read-only content.

Tabs should support horizontal overflow/scroll on small screens rather than forcing the entire page wider.

## 7. Active filter chips

Add a reusable active-filter presentation primitive.

Example:

```text
[Status: Draft ×] [Dari: 01 Agu 2026 ×] [Sampai: 14 Agu 2026 ×]
                                             Hapus semua filter
```

Requirements:

- each active filter is visible without reopening the filter dropdown;
- each chip can remove only its own filter;
- `Hapus semua filter` clears advanced filters only;
- the filter trigger still displays active count because the count is useful at a glance;
- chip text must use human-readable labels, not raw enum values where a domain label exists;
- chips wrap naturally on narrow viewports.

The first concrete implementation should use Manajemen SOP because its status/date filter model already exposes multiple independent advanced filters.

## 8. Filter state semantics

Refactor the SOP filter hook contract so search is independent from advanced filters.

Desired behavior:

- `clearFilters()` clears status/date/advanced filters only;
- `clearSearch()` clears search only;
- `clearAll()` may exist only if a real UI action needs to clear both;
- `activeFilterCount` counts advanced filters, not the search query.

The underlying filtering output should remain behaviorally equivalent apart from reset semantics.

## 9. Context-aware result/empty states

Collection pages should distinguish at least three states when practical:

### Source dataset empty

Example:

- `Belum ada SOP.`
- If the user has permission, offer the relevant creation action/context.

### Search has no matches

Example:

- `Tidak ada SOP yang cocok dengan "pengadaan".`
- Preserve the search query and provide a clear-search affordance when useful.

### Advanced filters have no matches

Example:

- `Tidak ada SOP dengan filter yang dipilih.`
- Provide `Hapus filter` without clearing search.

If search and advanced filters are both active, the page may expose both relevant clear controls rather than collapsing everything into one ambiguous reset action.

## 10. Table surface ownership

Current table primitives and pagination logic should be retained where possible.

The main refactor is visual ownership:

Current:

```text
SearchToolbar card

Table.Paginated card
```

Target:

```text
DataSurface
├── toolbar / tabs / active filters
├── table
└── pagination
```

`Table.Paginated` therefore needs a way to render without creating a second outer bordered/rounded surface when already inside `DataSurface`.

Avoid duplicating pagination logic in `DataSurface`; existing table pagination state remains the source of truth.

## 11. No TanStack Table migration in this iteration

Do not add TanStack Table merely to achieve the layout refactor.

The current table primitives are sufficient for the present requirements.

Reconsider a headless table engine later only if product requirements include substantial table state such as:

- multi-column sorting;
- server-side sorting contracts;
- column visibility management;
- column resizing;
- pinning;
- reordering;
- complex row selection/bulk operations.

This iteration should not pay that migration cost without a corresponding user requirement.

## 12. Responsive behavior

### Desktop

One-line toolbar when space permits:

```text
Search | Filter                         Secondary | Primary
```

### Tablet

Controls may wrap into two logical rows without breaking ownership:

```text
Search........................ | Filter
Secondary                         Primary
```

### Mobile

Controls become full-width/stacked as necessary:

```text
Search.................................
Filter
Secondary
Primary
```

Requirements:

- no horizontal page overflow from the toolbar;
- filter chips wrap;
- tabs may horizontally scroll;
- table keeps its existing horizontal-scroll region;
- destructive/secondary actions do not visually overpower the primary action;
- no floating action button is introduced.

## 13. Migration scope

The primitives are global, but migration should be controlled and testable.

### Shell migration

- `HeaderBar`;
- `PageHeaderProvider`;
- `ListPageLayout`;
- `AppSidebar`;
- mobile navigation inside `DashboardLayout` or extracted shared navigation structure;
- header/sidebar tests.

### Data-surface primitive migration

- standalone `SearchToolbar` usage on collection pages;
- `data-table` outer-surface ownership;
- new `DataSurface`/toolbar/filter-chip primitives;
- shared unit tests.

### Reference page

`ManajemenSOP` is the reference implementation because it combines:

- search;
- advanced filters;
- filter dropdown;
- multiple page actions with different priorities;
- paginated table;
- role-dependent action visibility;
- multiple empty-result conditions.

### Follow-through pages

After the reference page establishes the pattern, migrate list/table pages that use the same primitives, including relevant:

- Pelaksana;
- Peraturan;
- Evaluator;
- Penyusun;
- OPD/Kepala OPD management;
- Pantau SOP;
- Evaluasi lists;
- pengajuan/tabbed collection tables.

Do not rewrite unrelated detail/editor pages in this task.

## 14. Testing strategy

Use TDD for new behavioral contracts and regression tests for migrations.

Required coverage:

### Header/shell

- visible breadcrumb renders current navigation context;
- only one page `h1` exists and it is screen-reader-only;
- visible description is absent;
- business page actions are absent from the header;
- profile menu is absent from the header;
- notification remains accessible.

### Sidebar profile

- expanded footer renders display name and role;
- collapsed footer remains operable and accessible;
- profile route action preserves existing role-route behavior;
- logout preserves existing session behavior;
- mobile drawer exposes the same profile actions.

### DataSurface

- optional tabs render without requiring them;
- toolbar accepts search/filter/actions composition;
- no nested outer surface is introduced with the table;
- pagination behavior remains unchanged;
- responsive classes do not force horizontal overflow.

### Filters

- active chips reflect status/date state;
- removing one chip only removes that filter;
- reset filters does not clear search;
- filter count stays correct;
- filtered/no-result state exposes the correct recovery action.

### Regression

Run existing client unit tests, typecheck, lint, build, critical E2E business journeys, production config checks, and container builds before merge.

## 15. Non-goals

This iteration does not:

- change backend endpoints or DTOs;
- change authorization rules;
- change the SOP evaluation workflow;
- redesign dialogs/forms globally;
- redesign the SOP workbench/editor;
- introduce saved filter presets;
- add table sorting/column customization features;
- migrate to TanStack Table;
- introduce global search;
- add new notification behavior.

## Acceptance criteria

The refactor is successful when:

1. The header visually contains breadcrumb context and notification only.
2. The semantic page `h1` remains present but is visually hidden.
3. The user/profile menu is anchored at the bottom of desktop and mobile navigation.
4. Collection pages can render tabs, search, filters, active filters, actions, table, and pagination as one coherent surface.
5. Manajemen SOP visibly exposes its active filters and clearing advanced filters does not erase search.
6. Primary/secondary page actions sit with the dataset rather than the app header.
7. The unified surface has one border/radius/background with no nested card effect.
8. Existing table pagination behavior and business handlers remain intact.
9. Representative list/table pages adopt the same pattern without a page-specific styling fork.
10. Required CI is green before squash merge.

# Page Header & Action Hierarchy Design

Date: 2026-08-14
Status: Approved direction, implementation pending
Branch: `refactor/page-header-hierarchy`

## Context

The global neutral admin UI refresh is already merged. The next UI improvement should focus on information hierarchy and workflow clarity rather than another broad visual restyle.

The current code already has the right structural pieces, but they are not fully used:

- `ListPageLayout` accepts `description`, but does not render or forward it.
- `PageHeaderContent` stores `breadcrumb`, but `HeaderBar` does not render the breadcrumb.
- `HeaderBar` already supports page-level `actions`, but several list pages keep primary actions inside `SearchToolbar`, mixing navigation/workflow actions with search and filter controls.
- `SearchToolbar` is therefore doing too much visually on some pages.

## Goal

Create a consistent page hierarchy across authenticated dashboard pages:

1. breadcrumb as low-emphasis context;
2. page title as the strongest heading;
3. optional short description for page purpose/status context;
4. page-level workflow actions separated from search/filter controls;
5. responsive behavior that remains usable on narrow and tablet layouts.

The result should feel like a mature internal enterprise product: clear scanning order, restrained spacing, no duplicated headings, and obvious action priority.

## Non-goals

This task does not:

- change business logic, permissions, routes, API contracts, or backend code;
- redesign filters or add filter chips yet;
- redesign SOP workbench/editor controls yet;
- add new actions or workflows;
- change semantic status colors or the recently merged global visual tokens;
- introduce page-specific visual themes.

## Approaches considered

### A. Centralized header contract + migrate page actions — recommended

Extend the existing `PageHeaderProvider` contract so `HeaderBar` owns breadcrumb, title, description, and page-level actions. Keep `SearchToolbar` responsible only for search/filter/table controls.

Advantages:

- one global hierarchy;
- minimal duplication;
- existing pages can migrate incrementally without new architecture;
- easiest to test and maintain.

Trade-off: a set of list pages must be reviewed so primary/secondary actions are moved to the correct slot.

### B. Render description inside each list page body

Keep `HeaderBar` mostly unchanged and render descriptions below the header in `ListPageLayout`.

Advantages: smaller central change.

Disadvantages: breadcrumb remains unused, action hierarchy remains inconsistent, and pages can drift visually.

### C. Page-specific header compositions

Allow each page to build its own breadcrumb/title/description/action block.

Advantages: maximum local flexibility.

Disadvantages: duplication, inconsistent responsive behavior, and long-term maintenance cost.

Decision: use Approach A.

## Design

### 1. Page header data contract

`PageHeaderContent` will contain:

- `breadcrumb`
- `title`
- optional `description`
- optional `leading`
- optional `actions`

`SetPageHeader` will accept and forward the same contract.

`ListPageLayout` will forward its existing `description` prop into `SetPageHeader` instead of silently discarding it.

No page data fetching will move into the header layer. The header remains presentation state only.

### 2. Header visual hierarchy

Desktop/tablet structure:

- left/context stack:
  - breadcrumb, small and muted;
  - title row;
  - optional description below title;
- right/action area:
  - page-level actions aligned with the title region;
  - notification and profile controls remain global shell controls.

Visual intent:

- breadcrumb: 12px-ish, muted foreground, compact line height;
- title: existing `text-ui-title`, semibold;
- description: 13–14px, muted foreground, maximum readable width rather than stretching across the whole viewport;
- no extra card/shadow around the header;
- retain the thin bottom border from the global neutral shell.

Description copy should be short. Long operational explanations belong in page content, helper text, or contextual panels instead of making the shell header excessively tall.

### 3. Breadcrumb behavior

Use the existing breadcrumb primitive rather than creating a second implementation.

Rules:

- render only when one or more breadcrumb items exist;
- current page item is non-interactive unless an existing breadcrumb contract explicitly supports navigation;
- avoid redundant `Dashboard / Current Page` breadcrumbs when the parent context adds no value;
- hide or truncate gracefully on narrow screens instead of forcing horizontal overflow.

### 4. Action hierarchy

Actions are classified by intent, not by button color alone.

Page-level actions belong in header `actions`:

- create/add resource;
- submit/advance workflow;
- page-wide export/import if present;
- other actions whose scope is the whole page.

Toolbar actions remain in `SearchToolbar` when they manipulate the current result set:

- search;
- filters;
- filter reset;
- sorting/view controls if present later.

For `ManajemenSOP` specifically:

- `Buat SOP Baru` becomes the primary page action in the header;
- `Ajukan evaluasi SOP` becomes a secondary page-level action when the current role permits it;
- search and filter remain in `SearchToolbar`.

The same rule will be applied to other `ListPageLayout` consumers where a create/add/workflow action is currently mixed into the search/filter toolbar.

### 5. Responsive behavior

Desktop:

- title/context on the left;
- actions on the right;
- global notification/profile controls stay visually separated from page actions.

Tablet/narrow desktop:

- page actions may wrap to a second row inside the header without overlapping the title;
- description remains readable and does not force controls off-screen.

Mobile:

- mobile top navigation remains intact;
- authenticated page header content may stack below the mobile nav;
- page actions use full-width or wrapped controls only when necessary;
- no horizontal overflow is introduced by breadcrumb or action groups.

### 6. List page migration scope

This task will update the shared header contract and review current `ListPageLayout` consumers, including SOP, evaluation, OPD, evaluator, penyusun, peraturan, pelaksana, pengajuan, berita acara, and annual evaluation pages.

Only pages that actually have misplaced page-level actions need JSX movement. Pages with search/filter-only toolbars should remain unchanged except for receiving the improved global header rendering.

This avoids unrelated refactoring.

## Accessibility

- Keep a single visible page `h1` produced by `HeaderBar`.
- Breadcrumb must retain its navigation semantics from the existing primitive.
- Action order in DOM should match the visual reading order as closely as practical.
- Existing focus-visible behavior and minimum control target sizes must be preserved.
- Wrapping must not create keyboard-order surprises.

## Testing

Add/update frontend tests to cover:

1. `ListPageLayout` forwards description to page header state.
2. `HeaderBar` renders breadcrumb when present.
3. `HeaderBar` renders description when present and omits it when absent.
4. Existing title and action rendering remains functional.
5. `ManajemenSOP` places page-level actions outside the search/filter toolbar.
6. Existing accessibility regression tests remain green.
7. Client typecheck, lint, unit tests, build, and mandatory repository CI remain green before merge.

No backend tests are added specifically for this UI-only change, although repository CI may still run backend/integration jobs as mandatory gates.

## Acceptance criteria

- Breadcrumb supplied by `SetPageHeader` is visible in `HeaderBar`.
- `description` passed to `ListPageLayout` is no longer discarded.
- Header hierarchy is visually consistent across list pages.
- Primary page actions are visually separated from search/filter controls on pages that currently mix them.
- `ManajemenSOP` follows the new hierarchy without changing permission checks or action behavior.
- No duplicated page title is introduced.
- Mobile/tablet layouts do not gain horizontal overflow from the new header content.
- No business logic/API/route changes are included.
- Required CI is green before squash merge.

## Follow-up boundary

After this task is merged, the next independent UI enhancement is **Filter UX**: active-filter visibility, removable chips where useful, and clearer reset behavior. That work should be a separate spec/task rather than expanding this branch.
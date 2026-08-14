# Detail SOP Workbench UI Redesign

Date: 2026-08-14
Status: Approved design, pending implementation plan
Branch: `refactor/detail-sop-workbench-ui`

## Goal

Refactor authenticated detail-page navigation and the Penyusun/PJ Penyusun SOP workbench so the page is denser, clearer, and faster to use without changing the existing workflow model.

This iteration is a frontend/UI refactor. It must preserve existing APIs, routes, role permissions, SOP workflow transitions, autosave behavior, versioning, validation, diagram generation/editing, print/export behavior, and backend contracts.

The approved interaction constraint is important: the SOP procedure editor remains an inline table/spreadsheet editor. This iteration must not replace it with modal, drawer, master-detail, or per-step navigation.

## Problems to solve

### Redundant detail navigation

`DetailPageLayout` currently renders a standalone back button in page content while the authenticated shell already displays a breadcrumb. This duplicates navigation and creates an empty row above the real workspace.

The breadcrumb should become the only visible back-navigation mechanism on detail pages. Ancestor crumbs must be real links; the current page remains non-interactive.

### SOP command bar overload

The current SOP document header mixes document identity, autosave, retry, print, version creation, primary workflow action, version/status badges, and revision guidance. When space is limited it relies on horizontal scrolling, including remapping vertical mouse-wheel input into horizontal movement.

The workbench needs a clear command hierarchy rather than more scrolling.

### Right-side metadata is card-heavy

The current property/edit panel wraps nearly every metadata group in its own bordered card with icon, title, subtitle, and body. Since these cards already live inside a side panel, the result is visually heavy and inefficient.

The metadata area should behave like a compact property inspector: sections, labels, controls, and dividers.

### Procedure editor controls look inconsistent and waste vertical space

The procedure editor's interaction model is efficient, but its fields do not read as a coherent spreadsheet editor. Text fields start too tall, select/input sizes vary, column widths are cramped, and the time field reads as two unrelated controls.

The table should remain inline and fast while receiving deliberate column sizing and a consistent control contract.

## Design principles

1. **Preserve speed of editing.** Inline procedure editing remains the default.
2. **Breadcrumb is navigation.** Do not duplicate it with a standalone back button.
3. **One obvious primary workflow action.** Secondary document actions should not compete with it.
4. **Inspector, not nested cards.** Metadata sections use typography/dividers instead of card-per-section.
5. **Compact by default, expand only when content requires it.** Multiline cells auto-grow rather than starting large.
6. **Horizontal overflow is preferable to crushed fields.** Wide procedure data gets a proper scroll region with predictable columns.
7. **No business-logic refactor.** Layout and presentation are the scope; domain behavior stays in the existing hooks/components.
8. **Accessibility and keyboard operation are requirements, not polish.**

## Scope boundary

### Global detail-page scope

`DetailPageLayout` is shared by multiple authenticated detail/workspace pages. The standalone back-row removal applies to all production consumers that currently depend on `backTo`/`backSize`, including relevant:

- Penyusun SOP detail/editor;
- Kepala OPD SOP detail;
- Kepala OPD pengajuan detail;
- Evaluator evaluation workspace;
- PJ Evaluator evaluation detail;
- PJ Penyusun Berita Acara detail.

Each consumer must already supply a breadcrumb ancestor with a valid route before its standalone back button is removed. If a consumer does not, its breadcrumb must be corrected in the same migration.

This global change does not redesign the content of those other detail pages.

### SOP-specific scope

The rest of the iteration applies only to the Penyusun/PJ Penyusun SOP workbench:

- workbench document header/command bar;
- right-side property inspector/navigation presentation;
- preview/editor mode toolbar presentation;
- procedure editor table field layout and density.

## 1. Detail navigation

### Target behavior

Current conceptual structure:

```text
Manajemen SOP / Edit SOP

[←]

[workspace]
```

Target:

```text
Manajemen SOP / Edit SOP

[workspace]
```

The ancestor breadcrumb item is clickable and is the way back to the collection.

### `DetailPageLayout` contract

The final shared layout should no longer own a standalone back control.

Remove from the final public contract:

```ts
backTo: string
backSize?: 'default' | 'icon'
```

Remove the extra page row that exists only to render the back button.

`actions` should not remain as an empty replacement row. Detail-specific actions belong in the detail workspace header or a page-local command region supplied by that page. If an existing non-SOP detail consumer currently relies on `DetailPageLayout.actions`, migrate that action to its existing local header/content rather than retaining a generic blank toolbar row.

### Breadcrumb requirements

- ancestors use their existing `to` route;
- the final/current crumb is non-interactive and uses `aria-current="page"`;
- breadcrumb must remain keyboard accessible;
- no click handler should emulate browser history when a deterministic parent route already exists.

## 2. SOP workbench command bar

### Target hierarchy

Conceptually:

```text
SOP Pelayanan Administrasi
v2 · Draft                         Tersimpan        [Selesai] [⋯]
```

The exact wrapping may change responsively, but the information hierarchy is fixed.

### Left group: document identity

Show:

- SOP title/name when available;
- version;
- current SOP status.

Do not use a generic `Dokumen SOP` heading as the dominant identity if the actual SOP name is available.

### Right group: persistence + actions

Show:

- compact autosave status;
- one primary workflow action when allowed;
- overflow/secondary action menu.

### Autosave presentation

- `idle`: render nothing;
- `saved`: subtle confirmation text/icon; do not render a large colored badge;
- `pending` / `saving`: visible but neutral/informational;
- `error`: explicit danger state with a reachable retry action.

Do not remove the existing live-region semantics used to announce autosave state.

### Primary workflow action

The existing role/status logic remains the source of truth. Examples include the current complete/send-again action.

The command bar must not invent a new workflow state or permission check.

### Secondary actions

Actions such as the existing:

- `Cetak PDF`;
- `Buat versi baru`;

should be secondary to the primary workflow action. They may render as quiet secondary buttons when room is ample or live under one overflow menu, but they must not appear as several equally weighted colorful buttons.

`Buat versi baru` keeps its existing disabled/blocking-reason behavior.

Print keeps its existing loading/error/print implementation.

### Revision guidance

The revision warning remains because it communicates domain state. Restyle it as a compact contextual notice below the command row rather than a decorative card. Existing wording/role branching should be preserved unless a wording change is required for clarity and covered by tests.

### Responsive behavior

The command bar must wrap intentionally; it must not solve overflow by horizontally scrolling the whole header. Remove the wheel-to-horizontal-scroll behavior from the SOP header.

## 3. Right-side property inspector

### Navigation

The four existing logical destinations remain:

- `Properti` (renamed from `Edit` for presentation);
- `Komentar` / `Komentar evaluasi`;
- `Versi`;
- `Aktivitas`.

The underlying tab state identifier may remain `edit` to avoid needless domain/state changes. This is a display-label change, not a state migration.

Expanded mode should make the active destination clear. Inactive destinations must remain understandable through labels where space permits; if the shared panel collapses to icon-only presentation, each item must have a useful accessible name/tooltip.

Collapsed mode remains a compact rail. No new drawer architecture is introduced.

### Property inspector structure

Remove the card-per-metadata-section visual pattern from the property panel.

Target structure:

```text
PROPERTI SOP

IDENTITAS
Nama SOP
[field]

Nomor SOP
[field]

Lembaga
[field]

------------------------

DASAR HUKUM                    [+]
item                            ×
item                            ×

------------------------

KETERKAITAN SOP                [+]
...

------------------------

PERINGATAN                     [+]
...
```

### Metadata behavior to preserve

Keep the existing fields and behaviors, including relevant:

- institution identity/lines;
- SOP name/title synchronization;
- SOP number synchronization;
- legal basis selection/removal;
- related SOP selection/removal;
- implementers;
- warnings;
- implementer qualifications;
- equipment;
- recording/data fields;
- any other current metadata sections;
- read-only rendering;
- autosave-triggering change handlers.

Do not collapse multiple existing domain values into a new data model.

### Visual rules

- section heading via small typography, not a card header;
- thin divider between major sections;
- labels remain visible;
- helper text only where it materially helps the user;
- remove most decorative section icons;
- `+`/add actions remain adjacent to the section they affect;
- removable list items use compact rows/fields, not nested mini-cards;
- read-only values should not look like disabled editable inputs if a simple text block communicates the state more clearly.

## 4. Procedure editor stays inline

### Interaction model

Keep the current table-based editing model on desktop:

```text
No | Kegiatan | Tipe | Pelaksana | Kelengkapan | Waktu | Output | Keterangan | Aksi
```

Keep the current per-row operations and decision configuration behavior.

Do not introduce:

- modal-per-step editing;
- drawer-per-step editing;
- master-detail editing;
- a separate save API per row;
- drag/drop reordering unless it already exists (it does not belong to this scope).

### Compact default row

Empty/short text cells should start as approximately one control line, aligned with the rest of the row.

Multiline-capable values such as:

- `Kegiatan`;
- `Kelengkapan`;
- `Output`;
- `Keterangan`;

must use compact auto-growing text controls rather than a large textarea at rest.

A row grows only when its content requires additional lines.

### Shared editor control contract

Within the procedure table, editable controls should present a coherent contract:

- approximately 36–40 px minimum resting height;
- consistent radius;
- consistent border color/weight;
- consistent focus-visible treatment;
- consistent text size and horizontal padding;
- consistent disabled/read-only behavior;
- top/center alignment chosen consistently when a row grows.

This may reuse existing UI primitives or add a small procedure-editor-specific field primitive when the general-purpose controls cannot express compact auto-growth cleanly. Do not globally redesign every application form in this task.

### Column sizing

Use intentional minimum widths rather than compressing every field to fit the viewport.

Initial design targets (implementation may tune slightly after rendering):

```text
No             ~48px
Kegiatan       ~240–280px
Tipe           ~120–140px
Pelaksana      ~170–190px
Kelengkapan    ~170–190px
Waktu          ~180–200px
Output         ~170–190px
Keterangan     ~200–240px
Aksi           ~48px
```

The table remains horizontally scrollable when its intrinsic width exceeds the editor viewport.

### Horizontal scroll

The procedure editor's desktop table must expose discoverable horizontal scrolling rather than depending on globally hidden scrollbars.

The editor may use a local thin scrollbar treatment, but the scrollbar must not be forcibly hidden.

### Sticky header

The column header should remain visible while scrolling through a long set of steps, provided this does not conflict with the actual nested scroll container. Implement sticky behavior against the real procedure-editor scroll container, not the document viewport by assumption.

### Time field

The numeric duration and unit selector remain separate form values/handlers but should visually read as one compound field:

```text
| 10 | Menit v |
```

Use one outer border with an internal divider when practical. Keyboard focus must remain clear for both controls.

No DTO or domain representation changes.

### Row action menu

Keep the existing `...` menu with existing behaviors such as:

- configure decision branch when applicable;
- add a step after the current row;
- delete step when allowed.

Do not add multiple always-visible row action icons.

### Editor footer

Keep the existing overall actions:

- `Tambah langkah`;
- `Selesai edit`.

A sticky footer is not required in this iteration. Only introduce sticky positioning if actual rendered height/scroll testing demonstrates a clear usability benefit without obscuring rows.

### Mobile

Do not redesign mobile procedure editing architecture in this iteration. Preserve the existing mobile adaptation and apply the same control consistency where straightforward. A future mobile-specific editor redesign can be a separate task if needed.

## 5. Preview / diagram toolbar

Keep the existing functionality for:

- switching procedure-list/diagram editing presentation;
- manual path editing;
- reset-all-paths when manual path mode is active;
- Flowchart/BPMN selection and diagram state.

Only improve presentation:

- consistent control height/density;
- clearer active mode;
- less floating-pill/card appearance;
- no new diagram state.

The diagram render scheduling/hydration behavior remains untouched unless a UI change exposes an existing bug separately.

## 6. Shared-detail consumer migration

Before removing `backTo`/`backSize` from `DetailPageLayout`, inspect every production consumer.

For each consumer:

1. confirm the breadcrumb has a deterministic clickable parent route;
2. add/fix that route if missing;
3. move any `DetailPageLayout.actions` into an existing local header/command area;
4. remove `backTo` and `backSize`;
5. keep page-specific data/actions/workflow unchanged.

Do not redesign those pages merely because they consume the shared layout.

## 7. Testing strategy

Implementation follows TDD for changed behavior and regression tests for visual contracts that are stable enough to encode.

### Shared detail layout tests

Update/add tests to assert:

- `DetailPageLayout` does not render a standalone `Kembali`/back control;
- page metadata still reaches `SetPageHeader`;
- main workspace still renders;
- representative ancestor breadcrumb is a link at the page/header integration level;
- no empty local toolbar row is left behind.

### SOP command bar tests

Cover:

- document identity/version/status remains visible;
- exactly the permitted primary workflow action renders;
- secondary print/version action remains reachable;
- autosave `saved` is subtle but announced;
- autosave `error` exposes retry;
- header does not use the old horizontal wheel-scroll contract;
- read-only mode hides editing/workflow controls as before.

### Property inspector tests

Cover behavioral invariants rather than brittle class snapshots:

- `Properti` label is visible for the existing `edit` tab;
- metadata fields and add/remove actions still render;
- read-only mode retains current restrictions;
- legal-basis/related-SOP/pelaksana dialogs still open through the same handlers;
- no metadata section is lost in the refactor.

A small structural test may assert that the old reusable `MetadataFieldCard` wrapper pattern is removed if that helper is deleted as part of the implementation.

### Procedure editor tests

Cover:

- all existing columns still render;
- existing row-action menu behavior remains;
- decision configuration remains reachable;
- add/delete/done callbacks preserve existing behavior;
- text cells use compact auto-growing controls;
- time input and unit selector remain separately focusable while sharing compound presentation;
- desktop table retains an overflow scroll region;
- validation before `Selesai edit` remains unchanged.

### Regression gate

Before merge, require the repository's relevant existing checks, including:

- client typecheck;
- client lint;
- client unit tests;
- client production build;
- relevant Playwright business journeys/detail/editor journeys;
- mandatory repository CI jobs, including backend/database/container checks even though this task is frontend-only, if they are part of the PR gate.

## 8. File map (expected, not exhaustive)

### Shared detail shell

- `client/src/components/layout/DetailPageLayout.tsx`
- `client/src/components/layout/__tests__/DetailPageLayout.test.tsx`
- all production `DetailPageLayout` consumers discovered on current `main`

### SOP workbench

- `client/src/pages/penyusun/sop/detail/DetailSOPPenyusun.tsx`
- `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunHeader.tsx`
- `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunMain.tsx`
- `client/src/pages/penyusun/sop/detail/components/DetailSopPenyusunSidePanel.tsx`
- `client/src/pages/penyusun/sop/detail/components/DetailSopMetadataPanel.tsx`
- `client/src/pages/penyusun/sop/detail/components/SOPHeaderSection.tsx`
- `client/src/pages/penyusun/sop/detail/components/DetailSopProsedurEditor.tsx`
- `client/src/pages/penyusun/sop/detail/components/ProsedurEditorCells.tsx`
- `client/src/components/ui/collapsible-side-panel.tsx` only if a small shared presentation change is required by the approved inspector navigation

### Tests

Prefer focused tests colocated with the affected layout/workbench components. Extend existing accessibility/polish tests only when the contract is genuinely shared.

## 9. Non-goals

This iteration does not:

- change SOP backend endpoints or DTOs;
- change autosave scheduling, flush semantics, or mutation logic;
- change SOP workflow/status transitions;
- change role/permission decisions;
- change versioning rules;
- change evaluation/revision domain rules;
- change procedure validation rules;
- change Flowchart/BPMN generation logic;
- change manual diagram path state/algorithms;
- change print/PDF generation logic;
- migrate the procedure editor to a different interaction architecture;
- globally redesign every application form/control;
- redesign login, analytics, profile/TTE settings, or public pages;
- introduce a new table/form framework.

## Acceptance criteria

The redesign is successful when all of the following are true:

1. Authenticated detail pages using `DetailPageLayout` no longer show a standalone back button or an empty back/action row.
2. Each migrated detail page has a usable clickable ancestor breadcrumb for deterministic navigation back.
3. The Penyusun SOP command bar does not require horizontal scrolling and no longer remaps vertical wheel input to horizontal movement.
4. SOP name/identity, version, status, autosave, primary workflow action, print/version actions, and revision guidance remain available according to existing domain rules.
5. Only one workflow action is visually primary in the SOP command bar.
6. The right-side `Edit` destination is presented to users as `Properti` without changing its underlying state semantics unnecessarily.
7. The property panel no longer renders a bordered card for every metadata section.
8. All existing editable/read-only metadata capabilities remain available.
9. The procedure editor remains an inline table on desktop.
10. Empty/short procedure text fields rest at compact one-line height and grow when content becomes multiline.
11. Procedure input/select/textarea controls have consistent visual density and focus behavior.
12. Procedure columns have deliberate minimum widths and the desktop editor exposes usable horizontal scrolling instead of crushing controls.
13. The duration amount/unit pair visually reads as one compound control while preserving separate focus/value handlers.
14. Existing row actions, decision configuration, add/delete operations, validation, and `Selesai edit` behavior are unchanged.
15. Preview/manual-path/Flowchart/BPMN behavior is unchanged apart from toolbar presentation.
16. Client verification and mandatory repository CI pass before squash merge.

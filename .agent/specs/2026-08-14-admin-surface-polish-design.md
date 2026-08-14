# Admin Surface Polish Design

## Status

Approved for written-spec phase from the screenshot review on 2026-08-14. This spec intentionally scopes the polish to the pages visible in the submitted screenshots and creates reusable UI patterns only where they directly reduce repeated visual debt.

## Problem

Several authenticated admin surfaces are functionally correct but still feel inconsistent and hard to scan. The screenshots show the same root issues across different pages:

- page titles are too generic or disconnected from the task;
- controls are spread across large empty regions;
- action buttons are far from the data they affect;
- some helpers look like large blue AI-template banners instead of quiet guidance;
- two-option tabs use oversized segmented cards;
- table/list rows either feel too sparse or bury actions in icon-only affordances;
- detail summary headers show important data, but the data is too spread out to scan quickly.

The goal is not to add decoration. The goal is to make the UI more intentional, restrained, compact, and easier to understand.

## Scope

### In scope

1. Kepala OPD SOP list / Pantau SOP.
2. Kepala OPD detail pengajuan view.
3. Evaluator/PJ Evaluator penilaian SOP header and rating helper treatment.
4. PJ Evaluator Manajemen OPD page.
5. PJ Evaluator Kepala OPD tab/list row action treatment as it appears in the screenshots.
6. Small reusable presentation primitives needed by these pages.
7. Tests for the visual/semantic contracts changed by this iteration.

### Out of scope

- Backend/API/DTO/Prisma changes.
- SOP workflow transitions.
- TTE, print/PDF, revocation, evaluation-submit, and permission logic.
- Reworking public archive, login, landing, dashboard, or SOP workbench again.
- Full app-wide visual migration beyond the screenshot pages.
- Replacing `DataSurface` or the table system.

## Design principles

1. **No decorative density.** Remove visual weight that does not explain state or action.
2. **One obvious primary action.** Primary buttons must sit near the related search/header context, not in a detached bottom strip.
3. **Actions must be readable.** Sparse critical tables can use text actions like `Lihat` and `Cabut`; dense rows can use a single overflow menu.
4. **Status is metadata, not decoration.** Status pills stay useful but should not dominate the page.
5. **Helper text is quiet.** Instructional copy should be inline and compact unless it is an error, warning, or blocking state.
6. **Tabs should match the job.** Two top-level categories need compact line tabs, not a large segmented control occupying the width of a card.
7. **Keep logic intact.** UI hierarchy changes must not change the data source, mutation hooks, route params, permission checks, or workflow behavior.

## Target page designs

### 1. Kepala OPD SOP list / Pantau SOP

Current screenshot issue: the table is clean but sparse; the page title `SOP` is too generic; the search/filter area lacks result context; actions are icon-only and therefore not friendly for high-value operations.

Target structure:

```text
Pantau SOP
Lihat status SOP yang sedang dinilai, berlaku, draft, atau perlu tindakan.

[ Cari judul atau nomor SOP...        ] [Status: Semua]
4 dokumen

Judul SOP      Nomor      Terakhir diperbarui      Status             Aksi
sop lama       123456     14 Agu 2026              Berlaku            [Lihat] [Cabut]
```

Required changes:

- Use a clearer page title and subtitle: `Pantau SOP` plus one short explanatory line.
- Add a compact result count below or beside filters.
- Keep search and status filter in the same toolbar.
- Replace the primary view icon with a compact text action `Lihat` where row width allows.
- Keep destructive `Cabut` visible only when the existing rule allows revocation; it must stay visually secondary/destructive and keep the existing blocking reason.
- Empty states must keep the current search/filter-specific copy, but use the same compact table surface.

Behavior preserved:

- Existing `useSop`, status filtering, search filtering, route navigation, and `useCabutSop` behavior.
- Existing `canShowCabutSopAction` and `getCabutSopBlockingReason` rules.

### 2. Kepala OPD detail pengajuan

Current screenshot issue: `Informasi Pengajuan` spreads OPD, jenis, nomor BA, date, count, status, and actions across a broad empty card. The right menu is visually detached. The SOP left panel works but can be more compact, and the preview starts too low.

Target structure:

```text
Pengajuan Evaluasi
Dinas Kesehatan Provinsi · 1 dokumen · BA: seaksja
Pengajuan evaluasi selesai                         [Cetak] [⋯]

Daftar SOP                 Pratinjau
sop lama                   [Pratinjau SOP] [Berita Acara]
Berlaku · Sesuai           document preview...
```

Required changes:

- Convert the large information block into a compact summary header.
- Keep OPD, status, number of SOP, BA number, and BA date, but group them in readable summary lines.
- Place print/sign/menu actions in the same summary header area.
- Make `Alur pengajuan evaluasi` a quiet secondary disclosure, not a strong competing header action.
- Left SOP list should be compact: title, document status, evaluation result; no oversized card treatment for a single item.
- Preview tabs should stay, but spacing above preview should be reduced.

Behavior preserved:

- Existing print buttons, sign buttons, SOP selection, preview tabs, and status handling.

### 3. Penilaian SOP / rating helper

Current screenshot issue: the scoring helper appears as a large blue block with heavy copy. It draws more attention than the scoring control itself.

Target structure:

```text
Penilaian SOP
Pengajuan evaluasi selesai · Evaluator: Siti Rahmawati · 14/8/2026

Skala nilai: 1 sangat rendah, 5 sangat tinggi.
```

Required changes:

- Keep rating options 1–5 and keyboard/radiogroup behavior.
- Replace the large blue explanation box with one compact neutral helper row.
- The expanded mapping may still exist as subdued text: `1 Sangat rendah · 2 Rendah · 3 Sedang · 4 Tinggi · 5 Sangat tinggi`.
- Do not use blue alert surfaces unless there is a real blocking/warning state.

Behavior preserved:

- Existing `value`, `onChange`, disabled state, keyboard navigation, and aria semantics.

### 4. Manajemen OPD / Kepala OPD shell

Current screenshot issue: two tabs are rendered as a full-width bordered segmented control. Search is separated from the primary add action, creating a large empty strip.

Target structure:

```text
Manajemen Organisasi
Kelola OPD dan akun Kepala OPD.

[OPD] [Kepala OPD]

[ Cari nama OPD... ]                                  [Tambah OPD]
```

For the Kepala OPD tab:

```text
[ Cari nama, NIP, atau email... ]                     [Tambah Kepala OPD]
```

Required changes:

- Page title becomes `Manajemen Organisasi` or remains `Manajemen OPD` only if route/sidebar copy must stay unchanged; visible subtitle should explain the two data sets.
- Use compact line tabs or plain tab buttons instead of a large bordered segmented control.
- Remove decorative tab icons unless they improve scannability at the final size; text labels are enough.
- Move `Tambah OPD` and `Tambah Kepala OPD` into the same toolbar row as search.
- The current active-tab-specific search placeholders are preserved.
- The tab-specific create action must be owned by the active tab but rendered in the shared toolbar slot.

Behavior preserved:

- Existing `activeTab`, debounced search, OPD loading, Kepala OPD loading, create/edit/delete/update/pindah behavior.

### 5. OPD and Kepala OPD list rows

Current screenshot issue: row actions can appear as a vertical stack and person metadata is spread too far apart. The user should be able to scan identity, assignment, contact, status, and available actions quickly.

Target OPD row:

```text
Nama OPD                                      Aksi
Dinas Kesehatan Provinsi                      [Ubah] [⋯]
```

Target Kepala OPD row:

```text
Nama                         Jabatan / OPD           Kontak              Status     Aksi
Budi Santoso, A.Md.Kep       Analis SOP Dinkes       email · phone       Aktif      [Ubah] [⋯]
```

Required changes:

- Do not stack action icons vertically.
- Dense rows use one primary text action (`Ubah`) and an overflow menu for secondary/destructive actions, or one overflow menu if space is tight.
- `Riwayat penugasan`, `Pindah OPD`, and `Hapus` remain reachable.
- Destructive actions stay visually separated inside the menu.
- Person identity should be the first scannable group: avatar/initial, name, role or OPD metadata.
- Contact values should truncate gracefully and keep accessible labels/titles.

Behavior preserved:

- Existing create, edit, move, history, delete, loading, empty states, and delete eligibility checks.

## Reusable presentation patterns

Introduce or refine only if they reduce duplication in the scoped pages:

### `SurfaceToolbarActionSlot`

A small composition pattern, not necessarily a new component, that keeps search/filter controls and the active primary action in the same `DataSurface.Toolbar` row.

Contract:

- left side: search/filter controls;
- right side: one active primary action;
- wraps cleanly on mobile;
- no detached bottom action strip.

### `CompactLineTabs`

A compact visual variant around existing Tabs primitives.

Contract:

- no full-width bordered segmented container;
- active tab uses text color and bottom border/underline;
- inactive tab is neutral;
- keyboard and Radix/Tabs behavior unchanged.

### `InlineHelperNote`

A neutral helper text block for instructional copy.

Contract:

- small text, neutral color;
- optional short label;
- no blue filled background by default;
- warning/error variants must use semantic warning/error colors only for actual warning/error states.

### `ReadableRowActions`

A presentation pattern for row actions.

Contract:

- sparse operational lists may show labeled `Lihat`/`Cabut` buttons;
- dense data rows use a single overflow menu or one primary plus overflow;
- destructive menu item must be separated and colored semantically;
- all icon-only controls need accessible names.

## Accessibility requirements

- Search inputs keep descriptive `aria-label` values.
- Tabs keep native/radix keyboard behavior.
- Row actions keep accessible names and do not rely on icons alone.
- Status pills do not replace text content needed for screen readers.
- Rating picker keeps radiogroup semantics, roving focus, `aria-checked`, and disabled behavior.
- Overflow menus must be keyboard reachable.

## Testing strategy

Use TDD for each changed visual contract.

### Unit/component tests

- `PantauSOP`: title/subtitle/result count; visible labeled `Lihat`; `Cabut` only when allowed.
- `ManajemenOPD`: compact tab labels; active-tab search placeholder; active-tab create action appears in toolbar.
- `OPDTab`: no detached action strip; create action can be passed/rendered by parent or rendered in toolbar contract.
- `KepalaOPDTab`: row actions are not vertical stacked; history/edit/delete remain reachable through the intended menu/action pattern.
- `SkorRatingPicker`: compact helper text replaces blue instruction card while preserving radiogroup behavior.

### E2E

Update existing relevant journeys instead of adding unexecuted specs when possible:

- Kepala OPD can still view SOP from the SOP list.
- Kepala OPD can still use detail pengajuan actions in the new summary header.
- Evaluator can still choose evaluation score.
- PJ Evaluator can still search OPD/Kepala OPD and open create dialogs.

### Verification gate

- client typecheck;
- client lint;
- client unit tests;
- client build;
- E2E audit or critical journey if touched;
- full repository CI before merge.

## Non-goals and guardrails

- Do not introduce a new table library.
- Do not add gradients, glows, large shadows, or marketing-style cards.
- Do not increase page height with decorative headers.
- Do not change status names or domain copy beyond short UI labels/helper text.
- Do not change data fetching or mutation behavior.
- Do not hide destructive actions if the current user is supposed to have access; only move them into clearer hierarchy.

## Acceptance criteria

The iteration is complete when:

- screenshot pages use compact, readable headers and toolbars;
- two-option tabs no longer appear as a large full-width segmented card;
- primary create actions sit near search/filter controls;
- SOP list row actions are understandable without guessing icons;
- rating helper is compact and neutral;
- detail pengajuan summary is easier to scan and does not waste vertical space;
- OPD/Kepala OPD rows avoid vertical action stacks;
- all existing domain behaviors are preserved by tests;
- CI is green.

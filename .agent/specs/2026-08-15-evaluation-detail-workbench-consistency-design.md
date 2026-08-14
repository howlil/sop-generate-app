# Evaluation Detail Workbench Consistency Design

## Status

Written-spec phase for the screenshot review on 2026-08-15. This spec intentionally focuses on the authenticated evaluation/detail pages and the remaining visual inconsistencies visible in the submitted screenshots after the previous Admin Surface Polish and left-panel card fixes.

## Problem

The app is functionally coherent, but the authenticated evaluation surfaces still look like several separate UI systems stitched together. The screenshots show the same concepts rendered differently across routes:

- SOP side-panel cards use different selected states, label structures, chip sizes, and color intensity.
- Detail headers alternate between wide sparse data grids and compact summary cards.
- Workflow progress areas combine status pills, steppers, banners, helper links, and disclosure buttons with too much competing emphasis.
- Preview areas look like raw document iframes dropped into the page instead of a consistent workbench.
- Status colors are not disciplined enough: green is used for final state, good evaluation, selected emphasis, and sometimes pending-process states.
- List pages such as Manajemen OPD and Pantau SOP improved, but their heading, table action, and toolbar hierarchy still need final alignment.

The goal is not a new visual theme. The goal is a single restrained workbench system for evaluation detail pages, with small list-page polish where the screenshots still show rough edges.

## Scope

### In scope

1. Detail pengajuan / berita acara page used by Kepala OPD.
2. PJ Evaluator evaluation detail page with workflow progress, action button, preview, and right evaluation history panel.
3. Shared SOP side-panel card treatment across detail routes.
4. Shared detail summary header treatment for evaluation/pengajuan pages.
5. Workflow progress strip and status banner hierarchy.
6. Preview workbench toolbar and tab/control placement.
7. Status color usage for SOP/evaluation states shown in the screenshots.
8. Minor final polish for Pantau SOP and Manajemen OPD only where the same visual debt remains visible.
9. Unit/E2E selector updates needed to protect the new visual contracts.

### Out of scope

- Backend/API/DTO/Prisma changes.
- SOP workflow transition rules.
- TTE/signing behavior.
- Print/PDF generation behavior.
- Permission checks.
- Data fetching and mutation hooks.
- Public landing/login/public archive redesign.
- Full global table replacement.
- Rewriting the SOP document renderer or generated document content.

## Design principles

1. **One workbench language.** Evaluation detail pages should share the same shell pattern: summary header, optional progress strip, SOP side panel, preview workbench, optional right panel.
2. **Status is information, not decoration.** Chips should communicate state with restrained color and predictable semantics.
3. **Selected is not an alert.** Selected cards use a neutral surface plus a small primary accent, not full blue fill or heavy border.
4. **Progress is secondary unless action is required.** The stepper should explain process state without competing with the current action.
5. **Preview controls live with preview.** Document tabs and document-specific controls must be in a toolbar above the preview, not floating below the document.
6. **Keep technical fields subordinate.** Internal enum values such as `EVALUASI_REQUEST_EVALUATOR` should not dominate the page header.
7. **No business behavior changes.** The UI hierarchy can change; the underlying domain workflow cannot.

## Target system

### `EvaluationDetailWorkbench` pattern

The page-level detail pattern should be implemented as a composition of existing components or small new components. It does not need to be one large exported component if that would overfit the current routes, but the visual contract must be shared.

Target structure:

```text
DetailSummaryHeader
EvaluationProgressStrip?  // only when workflow context is useful
────────────────────────────────────────────────────────────
SopSidePanel | PreviewWorkbench | OptionalRightPanel?
```

Required properties:

- Header stays inside the content card, but has compact vertical rhythm.
- The SOP side panel has fixed/detail-friendly width and uses the same selected card style everywhere.
- The preview area owns document tabs, view controls, and preview spacing.
- Optional right panel, such as evaluation history, aligns with the preview top and does not force the center preview to feel cramped.
- Mobile behavior may keep the existing page-specific stacking if the current behavior is stable; no mobile workflow redesign is required in this iteration.

## Detailed designs

### 1. Shared SOP side panel

Current issue: the same SOP item appears as a blue filled selected card in some routes and a calmer compact card in others. Labels like `Dokumen` and `Penilaian` consume space and make the narrow panel noisy.

Target:

```text
Daftar SOP
1 dokumen

sop lama
Berlaku   Sesuai
```

Required changes:

- Use one compact selected style across all detail routes: white/neutral surface, subtle divider, small left accent bar for the active item.
- Remove heavy selected fill and full-width blue background from side-panel cards.
- In compact side panels, remove row labels such as `Dokumen` and `Penilaian`; use chip text only.
- Keep status chips small and quiet.
- Use consistent spacing: card padding 12px-ish, row gap 8px-ish, no oversized vertical whitespace.
- Preserve click/selection behavior and selected SOP state.

Status chip guidance:

- `Berlaku`, `Sesuai`, `Selesai`: green, but soft and small.
- `Draft`: neutral gray.
- `Menunggu TTD ...`, `Dalam penilaian`, `Menunggu tanda tangan BA`: process color, not final green. Prefer blue-soft for in-progress owned by the system/team; yellow-soft for waiting/blocking action.
- Destructive/revoked states use red-soft and must not be confused with validation errors.

### 2. Detail summary header

Current issue: detail headers are too wide and sparse. They spread OPD, date, evaluator, BA number, type, status, and actions far apart. Some technical fields visually compete with human-readable summary.

Target for completed pengajuan:

```text
Pengajuan Evaluasi  [Pengajuan evaluasi selesai]
Dinas Kesehatan Provinsi · 1 dokumen · BA seaksja
Evaluator: Siti Rahmawati, S.STP · 14 Agustus 2026

Jenis: Evaluasi request evaluator      Jumlah SOP: 1 dokumen
```

Target for PJ Evaluator detail:

```text
Evaluasi SOP  [Menunggu tanda tangan BA]
Dinas Kesehatan Provinsi · Nilai OPD 3 · 14/8/2026
Evaluator: Siti Rahmawati, S.STP
                                                [Tanda Tangan BA] [⋯]
```

Required changes:

- The first line must be the page task plus status pill.
- The second line must summarize the human-readable entity and count/state.
- Technical enum values must be visually secondary; if shown, convert to readable label where a mapping already exists. If no mapping exists, keep the existing value but make it small and subordinate.
- Primary action, such as `Tanda Tangan BA`, stays in the header action area.
- Kebab/menu remains available for secondary actions.
- Avoid a three-column sparse grid unless the viewport is wide and the content density justifies it.

Behavior preserved:

- All actions continue to call the current handlers.
- Existing menu items stay reachable.
- Existing dates/status values are not recalculated.

### 3. Workflow progress strip

Current issue: workflow area contains too many strong elements: status pill, stepper, success/warning banner, `Sembunyikan alur`, and `Apa arti status?` all competing in one zone.

Target:

```text
Alur pengajuan evaluasi                         [Sembunyikan]
✓ Penilaian tim → 2 Tanda Tangan BA → 3 Tanda Tangan BA OPD → 4 Pengesahan SOP → 5 Selesai

Menunggu tanda tangan BA
Tim evaluator menyelesaikan penilaian. Tanda tangani Berita Acara.
```

Required changes:

- `Sembunyikan alur` becomes a small secondary text/ghost button, not a strong outlined blue button.
- `Apa arti status?` becomes a quiet helper link aligned to the strip, not a competing control.
- The stepper should remain scannable but smaller than the page header.
- Status banner appears only when it explains the current action or final state.
- Warning/waiting state uses yellow-soft; final state uses green-soft; informational state uses blue-soft.
- Keep existing collapse/expand behavior.

### 4. Preview workbench

Current issue: document preview and controls are inconsistent. In some screenshots the document starts too low, in some the preview appears like a raw iframe, and `Flowchart/BPMN` floats below the SOP document.

Target:

```text
PreviewWorkbench toolbar
[Pratinjau SOP] [Berita Acara]                       [Flowchart] [BPMN]
──────────────────────────────────────────────────────────────────────
Neutral document canvas
```

Required changes:

- Document tabs stay above the preview, but use one consistent toolbar style.
- `Flowchart/BPMN` belongs in the preview toolbar for SOP preview only.
- Do not show `Flowchart/BPMN` on the Berita Acara tab.
- Preview canvas gets a neutral background and consistent padding.
- Document preview should align visually under the toolbar without excessive top gap.
- Preserve current rendering, scrolling, iframe, PDF, print, and generated document behavior.

### 5. Optional right panel / evaluation history

Current issue: the PJ Evaluator detail page right panel is useful but visually feels like a separate card system. It should align with the workbench.

Required changes:

- Keep the history panel, but align its header and card spacing with the SOP side panel.
- Keep evaluator name, date, and change summary.
- Use quiet card border and surface; no extra decorative accents unless indicating selected/active item.
- Preserve collapse behavior if it already exists.

### 6. Pantau SOP final polish

Current issue: this page is mostly improved, but title/subtitle hierarchy and row actions still feel slightly small and scattered.

Required changes:

- Ensure the visible content header includes `Pantau SOP` and a short subtitle inside the content surface or as a page section title.
- Keep result count close to filters, not stranded at the far right without context.
- Keep row action grouping stable: `Lihat` as primary text action; `Cabut` destructive and secondary.
- Long process status chips should truncate gracefully or use a shorter display label if a safe mapping exists.
- Do not change filtering, navigation, or revocation rules.

### 7. Manajemen OPD final polish

Current issue: the page is clean but too empty and the content title is weak. The segmented tab still feels more like a generic control than a page IA element.

Required changes:

- Add a clear content title such as `Manajemen OPD` or `Manajemen Organisasi`, depending on existing route copy.
- Keep subtitle: `Kelola OPD dan akun Kepala OPD.`
- Use line tabs or a low-contrast tab strip; avoid large pill/segmented control if still present in code.
- Keep search and create action in one toolbar row.
- Use `Edit` or `Ubah` consistently; avoid mixing labels in the same table family.
- Do not change OPD CRUD behavior.

## Reusable pieces

### `SOPListCard` compact contract

`SOPListCard` should support the side-panel compact contract rather than each page manually styling selected cards.

Contract:

- `variant="compact"` means side-panel density.
- Compact active item uses neutral card and accent bar.
- Compact chip row is label-free.
- Default variant can keep richer labels if needed elsewhere.

### `DetailSummaryHeader` contract

A reusable presentational component or composition pattern.

Inputs:

- title;
- status label + status tone;
- summary line(s);
- secondary metadata items;
- action slot;
- overflow/menu slot.

Output:

- compact card header;
- predictable title/status/action placement;
- no business logic inside the component.

### `EvaluationProgressStrip` contract

A reusable presentation wrapper around existing workflow state data.

Inputs:

- steps;
- active/completed state;
- current status explanation;
- collapsed state and toggle handler;
- optional help trigger.

Output:

- compact stepper;
- quiet toggle/help controls;
- optional status banner with tone.

### `PreviewWorkbench` contract

A reusable presentation pattern for document preview.

Inputs:

- active document tab;
- tab controls;
- optional SOP diagram mode controls;
- preview content.

Output:

- consistent toolbar;
- neutral preview canvas;
- controls visible only when relevant.

## Testing strategy

### Unit tests

- `SOPListCard` compact variant: active card uses neutral/accent treatment and quiet chip row.
- `DetailSummaryHeader`: renders title, status, summary metadata, primary action, and overflow slot without reordering accessible text.
- `EvaluationProgressStrip`: renders compact current state, preserves collapse action, and applies correct tone for waiting/final states.
- `PreviewWorkbench`: hides Flowchart/BPMN controls when Berita Acara tab is active.

### E2E tests

- Existing J01-J07 critical journeys must still pass.
- Update selectors only when the visible labels change intentionally.
- Detail pages must still allow selecting SOP, switching SOP/BA preview tabs, signing BA where allowed, and reaching existing menu actions.
- Pantau SOP must still navigate via `Lihat` and keep Cabut behavior available only when allowed.

### Visual regression by review

No automated screenshot tool is required in this iteration, but manual screenshot review should compare these pages after implementation:

1. Kepala OPD detail pengajuan / Berita Acara.
2. PJ Evaluator detail evaluation.
3. Kepala OPD Pantau SOP.
4. PJ Evaluator Manajemen OPD.

## Rollout plan

Implement in a single branch, but keep commits grouped:

1. Shared component contracts and tests.
2. SOP side-panel migration.
3. Detail summary header migration.
4. Progress strip and status tone cleanup.
5. Preview workbench toolbar cleanup.
6. Pantau SOP and Manajemen OPD final polish.
7. E2E selector stabilization and CI verification.

## Non-goals and risks

- Do not redesign the generated SOP/BA document content. The preview frame may improve, but the document body is domain output and stays as-is.
- Do not create a large generic layout abstraction that hides business conditions. Prefer small presentational components with explicit slots.
- Be careful with status label mapping. If a shortened display label could change business meaning, keep the original label and only adjust tone/spacing.
- Do not remove workflow help/collapse affordances; reduce their emphasis only.

## Acceptance criteria

- SOP side-panel cards look the same across evaluated detail routes.
- No selected SOP card uses a full blue filled background in narrow panels.
- Detail headers are compact and prioritize task/entity/status over technical metadata.
- Workflow strip is present but visually secondary to the current action.
- Status color usage follows final/process/waiting/draft/destructive semantics.
- Preview tabs and Flowchart/BPMN controls live in the preview toolbar.
- Pantau SOP and Manajemen OPD no longer feel like sparse cards with disconnected controls.
- CI passes before PR is marked ready.
- No backend/API/DTO/Prisma/workflow/permission/TTE/print behavior changes are introduced.

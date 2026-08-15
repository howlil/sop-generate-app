# Workspace SOP Row Design

## Goal

Make the SOP item in the left signing/evaluation workbench read as part of the workspace navigation surface instead of a nested mini-card.

## Scope

Applies to the shared compact `SOPListCard` used by the PJ Evaluator, PJ Penyusun, and Kepala OPD workbench side panels. Do not change workflow logic, status semantics, data fetching, signing behavior, or document preview behavior.

## Visual Contract

- The outer workbench panel is the container; an SOP item must not look like another standalone card inside it.
- Compact rows span the panel width and use the same restrained surface treatment as other workspace navigation rows.
- Default row: transparent surface, no full perimeter card border, no standalone radius, subtle bottom divider.
- Hover row: low-contrast surface hover only.
- Selected row: quiet neutral selected surface plus a 2px primary left indicator. No blue filled card and no primary outline.
- Row content keeps the existing hierarchy: SOP name first, status chips second.
- Status chip meaning and copy stay unchanged in this pass.
- Use existing design tokens only; no new arbitrary colors, shadows, gradients, or decorative effects.

## Acceptance Criteria

1. PJ Evaluator, PJ Penyusun, and Kepala OPD inherit the same row treatment through the shared component.
2. A compact SOP item no longer has a full card perimeter or standalone rounded-card silhouette.
3. Selected state remains obvious through the left indicator and a subtle workspace surface.
4. Existing status chips remain functional and semantically colored.
5. No business logic or API changes.

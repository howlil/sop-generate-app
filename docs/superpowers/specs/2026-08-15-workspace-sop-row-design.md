# Workspace SOP Card Design

## Goal

Make the SOP item in the left signing/evaluation workbench use the same restrained card language already used by other workspace panels, instead of the current flat gray selected block with a blue rail.

## Scope

Applies to the shared compact `SOPListCard` used by the PJ Evaluator, PJ Penyusun, and Kepala OPD workbench side panels. Do not change workflow logic, status semantics, data fetching, signing behavior, or document preview behavior.

## Existing Workspace Reference

Use the same visual grammar already present in workspace list cards such as `RiwayatVersiPanel`: `rounded-control`, a normal `border`, `bg-surface` for inactive items, and `border-primary bg-primary-subtle` for the active item.

## Visual Contract

- Each compact SOP item is a restrained workspace card, not a large flat gray row.
- Cards sit inside the workbench panel with small horizontal gutters and compact vertical spacing.
- Default card: `rounded-control border border-border bg-surface`.
- Hover: low-contrast `bg-surface-subtle` without shadow, scale, gradient, or elevated decoration.
- Selected card: `border-primary bg-primary-subtle`; remove the separate blue left rail because the active border already communicates selection.
- Keep the current content hierarchy: SOP name first, status chips second.
- Keep status copy and semantic status colors unchanged in this pass.
- Use existing design tokens only; no new arbitrary colors.

## Acceptance Criteria

1. PJ Evaluator, PJ Penyusun, and Kepala OPD inherit the same compact card treatment through the shared component.
2. The selected SOP no longer appears as a full-width gray block with a detached blue rail.
3. Compact SOP cards match the card grammar used elsewhere in the workspace: small radius, normal border, white/surface background, and restrained active border/fill.
4. Existing status chips remain functional and semantically colored.
5. No business logic or API changes.

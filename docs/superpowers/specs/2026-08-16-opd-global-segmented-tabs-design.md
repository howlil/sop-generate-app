# OPD Global Segmented Tabs Design

## Intent

Align the `Manajemen Organisasi` page tabs (`OPD` / `Kepala OPD`) with the shared segmented tab treatment already used by the Evaluasi SOP `Pengajuan` / `Riwayat` control.

The current OPD management tabs use the `line` visual variant, which renders a bottom-border navigation row. The requested direction is the global segmented treatment: muted container, two equal-width segments, and a white active segment with primary text.

## Existing reference

The established reference is `client/src/components/evaluasi/evaluasi-filter-tabs.tsx`, which uses the shared `TabsList` / `TabsTrigger` defaults from `client/src/components/ui/tabs.tsx`:

- `TabsList`: segmented default, `bg-surface-muted`, rounded container, compact padding.
- `TabsTrigger`: segmented default, rounded trigger, active `bg-surface`, active `text-primary`.
- Evaluasi-specific sizing: `h-8 p-0.5 w-full grid grid-cols-2` on the list and `h-7 text-xs` on each trigger.

## Approaches considered

1. **Reuse the shared segmented `TabsList` / `TabsTrigger` styling directly in `ManajemenOPD` — selected.** This exactly matches the existing Evaluasi SOP pattern with no new abstraction.
2. Keep the line variant and restyle it locally. Rejected because it duplicates global tab semantics and would preserve two competing tab styles.
3. Create a new generic `TwoOptionTabs` component. Rejected as unnecessary abstraction for a change already covered by the existing shared primitive.

## Design

In `ManajemenOPD.tsx`:

- Keep the existing Radix `Tabs` state and `TabsContent` behavior.
- Keep the tab control inside `DataSurface.Tabs` so it remains part of the management surface header.
- Remove `variant="line"` from `TabsList` and both `TabsTrigger` elements.
- Apply the same sizing/layout classes as `EvaluasiFilterTabs`: `h-8 p-0.5 w-full grid grid-cols-2` and `h-7 text-xs`.
- Preserve labels exactly: `OPD` and `Kepala OPD`.
- Preserve search state, API enable/disable behavior, create/edit/delete flows, and toolbar layout.

## Testing

Update `client/src/pages/pj-evaluator/opd/__tests__/ManajemenOPD.test.tsx` so the contract proves the segmented pattern rather than the old line pattern.

The test must verify:

- tab list is full width and two equal columns;
- tab list uses the shared muted segmented surface and rounded treatment;
- tabs no longer use `rounded-none`, bottom-border navigation, or transparent line styling;
- active segmented styling is inherited from the global `TabsTrigger` primitive;
- search input and right-aligned create action still render unchanged.

## Scope guardrails

Frontend UI only. No API, DTO, server, Prisma, routing, permissions, organization CRUD behavior, or query semantics change. No new dependency and no new tab component.
---
phase: quick
plan: 260325-cns
subsystem: diagram-routing
tags: [bpmn, flowchart, routing, performance, fix]
key-files:
  modified:
    - client/src/components/sop/diagram/logic/bpmnRouter.ts
    - client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx
    - client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx
decisions:
  - "Cross-lane connections to BPMN gateway must be allowed from top/bottom sides"
  - "Diamond shapes get 2px inset (vs 10px) in pathHitsObstacle to avoid false vertex-hit detection"
  - "usedSides removed from FlowchartArrowConnector dependency array — read via ref to eliminate cascade"
  - "corridorGraph added to FlowchartArrowConnector dependency so routes update when graph is ready"
metrics:
  duration: "~15 minutes"
  completed: "2026-03-25T02:46:40Z"
  tasks_completed: 2
  tasks_skipped: 1
---

# Quick Task 260325-cns: Fix BPMN dan Flowchart Path Routing

**One-liner:** Fixed cross-lane BPMN gateway routing, diamond hit detection inset, stale ref cleanup, and cascade re-render from usedSides dependency.

## Changes Per File

### client/src/components/sop/diagram/logic/bpmnRouter.ts

**Commit:** `43c3992`

1. **selectBpmnSidePairs — cross-lane decision target fix**
   - Previously: all `top` and `bottom` entry sides to a decision (gateway) target were blocked unconditionally.
   - Fix: only block `top`/`bottom` entry when the connection is `sameLane`. Cross-lane connections (from a gateway or task in a different swim lane) need to enter via top/bottom.
   - Condition changed from `if (isDecDst && (e === 'top' || e === 'bottom'))` to `if (isDecDst && sameLane && (e === 'top' || e === 'bottom'))`.

2. **pathHitsObstacle — diamond inset size fix**
   - Added `isDiamond` helper: `(r: Rect) => Math.abs(r.width - r.height) < 20`.
   - Diamond shapes (roughly square) now use `fromInsetSize = 2` instead of `SEGMENT_BOUNDARY_INSET = 10`.
   - This prevents vertex connection points on diamond shapes from being incorrectly flagged as interior hits, allowing paths that correctly terminate at diamond vertices.

### client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx

**Commit:** `656f111`

1. **Captured ref cleanup fix**
   - Added `const capturedRoutedSegs = routedSegmentsRefRef.current` at the start of `useLayoutEffect`.
   - All uses of `curRoutedSegs` inside the effect body now use `capturedRoutedSegs`.
   - The cleanup return value `() => { capturedRoutedSegs?.current.delete(connection.id) }` uses the captured value — not `routedSegmentsRefRef.current` which could be stale if the prop changes before cleanup runs.

### client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx

**Commit:** `656f111`

1. **corridorGraph destructured from props**
   - Added `corridorGraph` to the function parameter destructuring (was already in the props interface but not destructured).

2. **useLayoutEffect dependency array — removed usedSides, added corridorGraph**
   - Removed `usedSides` from the dependency array. It is already read via `usedSidesRef.current` inside the effect, so it is always fresh without needing to be a dependency. Including it caused cascade re-renders: one connector updating usedSides triggered all connectors to re-run their routing effects.
   - Added `corridorGraph` to the dependency array. Without this, if `corridorGraph` became available after initial render (post `graphReady`), the routing effect would not re-run and paths would remain on the old (no-graph) route.

## Task 3: Visual Verification (Skipped — Checkpoint)

Task 3 is `type="checkpoint:human-verify"` and is intentionally skipped per task constraints.

**Manual verification required:**
1. Run dev server: `cd client && npm run dev`
2. Open a SOP page with a multi-lane BPMN diagram
3. Verify: all BPMN arrows render (including cross-lane connections to/from gateways), no arrow passes through shape interiors
4. Open a SOP page with a multi-executor Flowchart diagram
5. Verify: no visible flickering on load, decision branches (Ya/Tidak) do not overlap excessively, "Perbaiki diagram" responds without lag

## Deviations from Plan

None — plan executed exactly as written for the two auto tasks.

## Self-Check

- [x] `client/src/components/sop/diagram/logic/bpmnRouter.ts` — modified
- [x] `client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx` — modified
- [x] `client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx` — modified
- [x] Commit `43c3992` exists (Task 1)
- [x] Commit `656f111` exists (Task 2)
- [x] `npx tsc --noEmit` passed with no errors after both tasks

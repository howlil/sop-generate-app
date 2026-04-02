# SOP Diagram Components

**Location:** `features/sop/components/SOPDiagram/`

## Components

- `SOPDiagramFlowchart.tsx` - Flowchart diagram renderer
- `SOPDiagramBpmn.tsx` - BPMN diagram renderer
- `SOPHeaderInfo.tsx` - SOP header information display

## Logic

- `logic/sopDiagramTypes.ts` - Type definitions for diagram
- `logic/flowchartPagination.ts` - Flowchart pagination logic
- `logic/bpmnRouter.ts` - BPMN edge routing
- `logic/orthogonalRouter.ts` - Orthogonal edge routing
- `logic/selectSidePairs.ts` - Side selection pairs

## Shapes

### BPMN Shapes
- `shapes/bpmn/Activity.tsx`
- `shapes/bpmn/BpmnBasicShapes.tsx`
- `shapes/bpmn/DecisionText.tsx`

### Flowchart Shapes
- `shapes/flowchart/OffPageConnector.tsx`

### Connectors
- `shapes/BpmnArrowConnector.tsx`
- `shapes/FlowchartArrowConnector.tsx`

## Usage

```typescript
import { 
  SOPDiagramFlowchart,
  SOPDiagramBpmn,
  SOPHeaderInfo
} from '@/features/sop'
```

## Note

These are **SOP-specific** diagram components, not generic diagram components.
They live in the feature directory for better cohesion and maintainability.

**Moved from:** `components/sop/diagram/` → `features/sop/components/SOPDiagram/`  
**Date:** 2026-04-03  
**Reason:** High cohesion, single source of truth for SOP feature

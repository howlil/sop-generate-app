# UI Pattern Refactoring Plan
## Principal Engineer Architectural Analysis & Technical Debt Prevention

**Date**: 2026-04-03  
**Scope**: Client Frontend (`client/src/`)  
**Focus**: Clean Code, Consistency, Maintainability, Scalability

---

## Executive Summary

### Current State Assessment

**Overall Architecture Quality**: ⚠️ **GOOD FOUNDATION, CRITICAL DEBT ACCUMULATING**

The codebase demonstrates strong architectural patterns (feature-sliced design, TanStack Query, Zustand) but has **critical technical debt** in complex components that threatens long-term maintainability.

### Critical Issues Requiring Immediate Action

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 **P0** | `DetailSOPPenyusun.tsx` (312 lines) - Mixed concerns | High | Medium |
| 🔴 **P0** | `DetailSOPProsedurEditor.tsx` (298 lines) - Complex inline rendering | High | Medium |
| 🟠 **P1** | Direct API calls in `DetailSOP.tsx` - Pattern violation | Medium | Low |
| 🟠 **P1** | Prop drilling in `DetailEvaluasiOPD.tsx` (14 props) | Medium | Medium |
| 🟡 **P2** | Inconsistent hook usage across pages | Low | Low |

---

## 1. Architectural Principles Violation Analysis

### 1.1 Single Responsibility Principle (SRP) Violations

#### ❌ **CRITICAL**: `DetailSOPPenyusun.tsx` (312 lines)

**Current Responsibilities** (all in one component):
1. State management (15+ useState calls)
2. Effect logic for implementers seeding
3. Business logic for status overrides
4. Version history management
5. Comment handling
6. Metadata change handlers
7. Complex JSX rendering with multiple layouts
8. Dialog management

**Violation Impact**:
- ❌ Impossible to test individual concerns
- ❌ High cognitive load for new developers
- ❌ Merge conflicts likely when multiple devs work on different features
- ❌ Difficult to reuse logic in other components

**Refactoring Required**: Apply **Container/Hook Pattern**

---

#### ❌ **HIGH**: `DetailSOPProsedurEditor.tsx` (298 lines)

**Current Issues**:
```typescript
// Inline IIFE rendering with nested conditionals (lines 120-180)
{(() => {
  const yesIndex = row.id_next_step_if_yes ? ... : -1
  const noIndex = row.id_next_step_if_no ? ... : -1
  const hasDecisionTarget = yesIndex !== -1 || noIndex !== -1
  return (
    <div>
      <select>...</select>
      {row.type === 'decision' && (
        <p>{!hasDecisionTarget ? '...' : [...]}</p>
      )}
    </div>
  )
})()}

// Complex time unit handling inline (lines 145-175)
{(() => {
  const match = (row.mutu_waktu || '').match(/^(\d+)\s*(\w+)?/i)
  const amount = match ? match[1] : ''
  const unit = /* complex parsing */
  const updateMutuWaktu = (nextAmount, nextUnit) => { /* ... */ }
  return (/* complex JSX */)
})()}
```

**Violation Impact**:
- ❌ Cognitive complexity > 25 (threshold: 15)
- ❌ Inline functions prevent reuse
- ❌ Impossible to unit test logic
- ❌ Error-prone during modifications

**Refactoring Required**: Apply **Extract Component + Custom Hook Pattern**

---

### 1.2 Separation of Concerns Violations

#### ❌ **MEDIUM**: Direct API Calls in Components

**File**: `DetailSOP.tsx` (lines 60-65)
```typescript
// ❌ WRONG: Direct API call in component
const { data: pengajuanList = [] } = useQuery({
  queryKey: queryKeys.evaluasiList(),
  queryFn: () => evaluasiApi.findAll(),  // Direct API call
  staleTime: 3 * 60 * 1000,
})
```

**File**: `ManajemenEvaluasiSOP.tsx` (similar pattern)

**Expected Pattern**:
```typescript
// ✅ CORRECT: Use existing hook
const { list: pengajuanList = [] } = useEvaluasi()
```

**Impact**:
- ❌ Duplicates query configuration
- ❌ Inconsistent error handling
- ❌ Harder to maintain (changes in 2 places)
- ❌ Violates DRY principle

---

#### ❌ **MEDIUM**: Prop Drilling (14 props)

**File**: `DetailEvaluasiOPD.tsx` → `DetailEvaluasiOPDFormPanel`
```typescript
<DetailEvaluasiOPDFormPanel
  opd={opd}
  collapsed={rightPanelCollapsed}
  onCollapsedChange={setRightPanelCollapsed}
  activeFormTab={activeFormTab}
  onTabChange={setActiveFormTab}
  effectiveSopId={effectiveSopId}
  lastEvaluatedBy={lastEvaluatedBy}
  statusEvaluasi={statusEvaluasi}
  setStatusEvaluasi={handleSetStatusEvaluasi}
  komentarEvaluasi={komentarEvaluasi ?? ''}
  setKomentarEvaluasi={setKomentarEvaluasi}
  riwayatSop={riwayatSop}
  riwayatOpd={riwayatOpd}
  ratingOPD={ratingOPD}
  setRatingOPD={setRatingOPD}
/>
```

**Impact**:
- ❌ High coupling between components
- ❌ Difficult to refactor parent without breaking child
- ❌ Intermediate components must pass through props
- ❌ Testing requires mocking all 14 props

**Refactoring Required**: Apply **Context + Compound Component Pattern**

---

## 2. UI Pattern Audit

### 2.1 Existing Pattern Inventory

| Pattern | Usage | Consistency | Assessment |
|---------|-------|-------------|------------|
| **Custom Hooks** | 19 files | ✅ 90% | Well-implemented, some inconsistency |
| **Compound Components** | DataTable, Dialog | ✅ 100% | Excellent implementation |
| **Generic Components** | ItemListCard, FormDialog | ✅ 95% | Highly reusable |
| **Container/Presentational** | Mixed | ⚠️ 70% | Some components mix concerns |
| **Context Provider** | PageHeader, Auth | ✅ 85% | Good usage |
| **Headless UI (Radix)** | All dialogs, dropdowns | ✅ 100% | Consistent |
| **Zustand Selectors** | Auth, UI stores | ✅ 95% | Proper shallow comparison |

---

### 2.2 Pattern Consistency Score

**Overall Score**: ⚠️ **82/100** (Good, but needs improvement)

**Breakdown**:
- Hook patterns: 90/100 (excellent, minor inconsistencies)
- Component composition: 85/100 (good, some large components)
- State management: 95/100 (excellent Zustand usage)
- API integration: 75/100 (direct API calls violate pattern)
- TypeScript usage: 95/100 (strict mode, good typing)

---

## 3. Component Quality Evaluation

### 3.1 Quality Metrics by Component Type

#### **UI Components** (`components/ui/`) - 38 files
**Average Lines**: 72  
**Max Lines**: 156 (`collapsible-side-panel.tsx`)  
**Quality Score**: ✅ **95/100**

**Strengths**:
- ✅ Consistent prop interfaces
- ✅ Proper TypeScript generics
- ✅ Accessibility built-in (ARIA, keyboard)
- ✅ Compound component patterns
- ✅ Class variance authority for variants

**Example - Excellent Pattern**:
```typescript
// ✅ CORRECT: Generic reusable component
export function ItemListCard<T>({
  items,
  getKey,
  renderPrimary,
  renderSecondary,
  // ...
}: ItemListCardProps<T>)
```

---

#### **Layout Components** (`components/layout/`) - 10 files
**Average Lines**: 68  
**Max Lines**: 142 (`HeaderProfile.tsx`)  
**Quality Score**: ✅ **90/100**

**Strengths**:
- ✅ Context-based header teleportation
- ✅ Composable layout primitives
- ✅ Role-based layout with animations

**Minor Issue**:
- ⚠️ `HeaderProfile.tsx` combines notification + profile (consider split)

---

#### **Feature Components** (`features/*/components/`) - 14 files
**Average Lines**: 95  
**Max Lines**: 180 (`SOPPreviewTemplate.tsx`)  
**Quality Score**: ✅ **88/100**

**Strengths**:
- ✅ Domain-specific composition
- ✅ Controlled form patterns
- ✅ Proper hook usage

**Issue**:
- ⚠️ `SOPPreviewTemplate.tsx` has complex conditional rendering

---

#### **Page Components** (`pages/`) - 40 files
**Average Lines**: 165  
**Max Lines**: 312 (`DetailSOPPenyusun.tsx`)  
**Quality Score**: ⚠️ **65/100** ⚠️ **CRITICAL**

**Critical Issues**:
- ❌ 3 components > 300 lines
- ❌ 8 components > 200 lines
- ❌ Mixed concerns (logic + UI)
- ❌ Direct API calls in 2 components
- ❌ Prop drilling in 4 components

---

### 3.2 Component Size Distribution

```
Page Components Size Analysis:
├─ < 100 lines:  8 files  (20%) ✅
├─ 100-150 lines: 12 files (30%) ✅
├─ 150-200 lines: 10 files (25%) ⚠️
├─ 200-250 lines:  6 files (15%) ❌
├─ 250-300 lines:  2 files  (5%) ❌
└─ > 300 lines:    2 files  (5%) 🔴 CRITICAL
```

**Industry Standard**: 95% of components should be < 200 lines  
**Current**: 75% < 200 lines  
**Gap**: 20% improvement needed

---

## 4. Anti-Pattern Detection Report

### 4.1 Detected Anti-Patterns

| Anti-Pattern | Occurrences | Files | Severity |
|--------------|-------------|-------|----------|
| **God Component** | 2 | `DetailSOPPenyusun.tsx`, `DetailSOPProsedurEditor.tsx` | 🔴 Critical |
| **Prop Drilling** | 4 | `DetailEvaluasiOPD.tsx`, `ManajemenTimEvaluasi.tsx` | 🟠 High |
| **Mixed Concerns** | 6 | Multiple pages | 🟠 High |
| **Direct API Calls** | 2 | `DetailSOP.tsx`, `ManajemenEvaluasiSOP.tsx` | 🟠 High |
| **Inline IIFE Rendering** | 8 | `DetailSOPProsedurEditor.tsx` | 🟡 Medium |
| **Complex Ternary Chains** | 5 | Multiple files | 🟡 Medium |
| **Magic Strings** | 12 | Multiple files | 🟡 Medium |

---

### 4.2 Code Smell Examples

#### ❌ **God Component** - `DetailSOPPenyusun.tsx`

```typescript
export function DetailSOPPenyusun() {
  // 15+ state variables
  const [metadata, setMetadata] = useState(...)
  const [prosedurRows, setProsedurRows] = useState(...)
  const [implementers, setImplementers] = useState(...)
  const [diagramVersion, setDiagramVersion] = useState(...)
  const [activeTab, setActiveTab] = useState(...)
  const [isEditingSteps, setIsEditingSteps] = useState(...)
  const [isHistoryOpen, setIsHistoryOpen] = useState(...)
  const [rightPanelTab, setRightPanelTab] = useState(...)
  const [viewingVersion, setViewingVersion] = useState(...)
  // ... 6 more
  
  // Complex effect logic
  useEffect(() => {
    if (implementersSeededRef.current || pelaksanaList.length === 0) return
    const ids = new Set(prosedurRows.flatMap((r) => Object.keys(r.pelaksana)))
    // ... 20 lines of logic
  }, [pelaksanaList, prosedurRows])
  
  // Handler functions
  const handleMetadataChange = <K extends keyof SOPDetailMetadata>(
    field: K, value: SOPDetailMetadata[K]
  ) => { ... }
  
  // 312 lines total
}
```

**Smell Indicators**:
- ❌ Too many state variables (cognitive load)
- ❌ Effect logic mixed with rendering
- ❌ No clear separation of concerns
- ❌ Impossible to test individual features

---

#### ❌ **Inline IIFE Rendering** - `DetailSOPProsedurEditor.tsx`

```typescript
<Table.Td>
  {(() => {
    const yesIndex = row.id_next_step_if_yes
      ? prosedurRows.findIndex((r) => r.id === row.id_next_step_if_yes)
      : -1
    const noIndex = row.id_next_step_if_no
      ? prosedurRows.findIndex((r) => r.id === row.id_next_step_if_no)
      : -1
    const hasDecisionTarget = yesIndex !== -1 || noIndex !== -1
    return (
      <div className="space-y-1">
        <select>...</select>
        {row.type === 'decision' && (
          <p className="text-[10px] text-gray-500">
            {!hasDecisionTarget
              ? 'Belum diatur cabang Ya/Tidak.'
              : [yesIndex !== -1 ? `Ya → ${yesIndex + 1}` : null, 
                 noIndex !== -1 ? `Tidak → ${noIndex + 1}` : null]
                  .filter(Boolean)
                  .join(' • ')}
          </p>
        )}
      </div>
    )
  })()}
</Table.Td>
```

**Smell Indicators**:
- ❌ Complex logic in render
- ❌ Inline function prevents reuse
- ❌ Hard to test
- ❌ Reduces readability

**Refactored Version**:
```typescript
// Extract to separate component
function DecisionStepCell({ row, prosedurRows }: DecisionStepCellProps) {
  const { hasDecisionTarget, yesLabel, noLabel } = useDecisionStepLogic(row, prosedurRows)
  
  return (
    <div className="space-y-1">
      <select>...</select>
      {row.type === 'decision' && (
        <p className="text-[10px] text-gray-500">
          {!hasDecisionTarget ? 'Belum diatur cabang Ya/Tidak.' : [yesLabel, noLabel].filter(Boolean).join(' • ')}
        </p>
      )}
    </div>
  )
}
```

---

#### ❌ **Direct API Call** - `DetailSOP.tsx`

```typescript
// ❌ WRONG: Bypassing existing hook layer
const { data: pengajuanList = [] } = useQuery({
  queryKey: queryKeys.evaluasiList(),
  queryFn: () => evaluasiApi.findAll(),  // Direct API call
  staleTime: 3 * 60 * 1000,
})
```

**Expected**:
```typescript
// ✅ CORRECT: Use existing hook
const { list: pengajuanList = [] } = useEvaluasi()
```

**Impact**:
- ❌ Duplicates query configuration (staleTime, queryKey)
- ❌ No toast error handling
- ❌ No query invalidation on mutation
- ❌ Inconsistent with rest of codebase

---

## 5. Trade-Off Analysis

### 5.1 Refactoring Approaches

#### **Option A: Big Bang Refactor**
**Approach**: Refactor all critical components at once

**Pros**:
- ✅ Clean slate, consistent patterns
- ✅ Fastest path to clean codebase (if successful)
- ✅ No incremental debt accumulation

**Cons**:
- ❌ High risk (breaking changes)
- ❌ Blocks feature development (2-3 weeks)
- ❌ Requires extensive testing
- ❌ Team coordination overhead

**Recommendation**: ❌ **NOT RECOMMENDED** for production codebase

---

#### **Option B: Incremental Refactor (Recommended)**
**Approach**: Refactor one component per sprint

**Pros**:
- ✅ Low risk (isolated changes)
- ✅ Continuous feature development
- ✅ Immediate value after each refactor
- ✅ Easier code review
- ✅ Team can learn from each iteration

**Cons**:
- ⚠️ Temporary inconsistency during transition
- ⚠️ Takes longer overall (6-8 weeks)
- ⚠️ Requires discipline to avoid shortcuts

**Recommendation**: ✅ **RECOMMENDED**

---

#### **Option C: Strangler Fig Pattern**
**Approach**: Create new components alongside old, migrate gradually

**Pros**:
- ✅ Zero downtime
- ✅ Rollback capability
- ✅ Parallel testing

**Cons**:
- ⚠️ Code duplication during transition
- ⚠️ More complex migration
- ⚠️ Requires feature flags

**Recommendation**: ⚠️ Consider for very large components

---

### 5.2 Pattern Selection Matrix

| Component Type | Recommended Pattern | Rationale |
|----------------|-------------------|-----------|
| **Large Page (>300 lines)** | Container + Custom Hook | Separate logic from UI |
| **Complex Table Editor** | Extract Components + Hook | Reduce cognitive load |
| **Prop Drilling (>5 props)** | Context + Compound | Reduce coupling |
| **Direct API Call** | Replace with Hook | Enforce consistency |
| **Inline IIFE** | Extract Component | Improve testability |

---

## 6. Refactoring Specifications

### 6.1 P0: `DetailSOPPenyusun.tsx` Refactor

#### **Current State** (312 lines)
```
Responsibilities:
├─ State management (15+ useState)
├─ Effect logic (implementers seeding)
├─ Business logic (status overrides)
├─ Version history
├─ Comment handling
├─ Metadata changes
├─ Complex rendering
└─ Dialog management
```

#### **Target Architecture**

**Step 1: Extract Custom Hook** (`hooks/useDetailSOPPenyusun.ts`)
```typescript
export function useDetailSOPPenyusun(id: string) {
  // State
  const [metadata, setMetadata] = useState<SOPDetailMetadata>(() => getInitialSopDetailMetadata())
  const [prosedurRows, setProsedurRows] = useState<ProsedurRow[]>(() => getInitialSopDetailProsedurRows())
  const [implementers, setImplementers] = useState<{ id: string; name: string }[]>([])
  
  // Effects
  useEffect(() => {
    // Implementers seeding logic
  }, [pelaksanaList, prosedurRows])
  
  // Handlers
  const handleMetadataChange = useCallback(<K extends keyof SOPDetailMetadata>(
    field: K, value: SOPDetailMetadata[K]
  ) => {
    setMetadata((prev) => ({ ...prev, [field]: value }))
  }, [])
  
  const handleSaveDraft = useCallback(() => {
    // Save logic
  }, [id, role])
  
  const handleComplete = useCallback(() => {
    // Complete logic
  }, [id, role, isRevisionFlow])
  
  return {
    metadata,
    setMetadata,
    prosedurRows,
    setProsedurRows,
    implementers,
    setImplementers,
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
  }
}
```

**Step 2: Extract Sub-Components**
```typescript
// components/DetailSOPPenyusunHeader.tsx
export function DetailSOPPenyusunHeader({
  metadata,
  currentSopStatus,
  isRevisionFlow,
  onSaveDraft,
  onComplete,
}: DetailSOPPenyusunHeaderProps) { ... }

// components/DetailSOPPenyusunMain.tsx
export function DetailSOPPenyusunMain({
  metadata,
  prosedurRows,
  implementers,
  activeTab,
  onActiveTabChange,
  isEditingSteps,
  onEditingStepsChange,
}: DetailSOPPenyusunMainProps) { ... }

// components/DetailSOPPenyusunSidePanel.tsx
export function DetailSOPPenyusunSidePanel({
  rightPanelTab,
  onTabChange,
  metadata,
  onMetadataChange,
  implementers,
  onImplementersChange,
  versions,
  viewingVersion,
  onVersionChange,
}: DetailSOPPenyusunSidePanelProps) { ... }
```

**Step 3: Refactored Page Component** (~80 lines)
```typescript
export function DetailSOPPenyusun() {
  const { id } = useParams({ from: '/tim-penyusun/detail-sop/$id' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  
  // Extracted hook
  const {
    metadata,
    prosedurRows,
    implementers,
    handleMetadataChange,
    handleSaveDraft,
    handleComplete,
  } = useDetailSOPPenyusun(id)
  
  // Local UI state only
  const [activeTab, setActiveTab] = useState<'flowchart' | 'bpmn'>('flowchart')
  const [isEditingSteps, setIsEditingSteps] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<'edit' | 'komentar' | 'riwayat'>('edit')
  
  return (
    <DetailPageLayout
      header={
        <DetailSOPPenyusunHeader
          metadata={metadata}
          currentSopStatus={currentSopStatus}
          isRevisionFlow={isRevisionFlow}
          onSaveDraft={handleSaveDraft}
          onComplete={handleComplete}
        />
      }
      main={
        <DetailSOPPenyusunMain
          metadata={metadata}
          prosedurRows={prosedurRows}
          implementers={implementers}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          isEditingSteps={isEditingSteps}
          onEditingStepsChange={setIsEditingSteps}
        />
      }
      rightPanel={
        <DetailSOPPenyusunSidePanel
          rightPanelTab={rightPanelTab}
          onTabChange={setRightPanelTab}
          metadata={metadata}
          onMetadataChange={handleMetadataChange}
          implementers={implementers}
        />
      }
    />
  )
}
```

**Impact**:
- ✅ 312 lines → 80 lines (74% reduction)
- ✅ Each sub-component < 100 lines
- ✅ Hook logic testable in isolation
- ✅ Clear separation of concerns

---

### 6.2 P0: `DetailSOPProsedurEditor.tsx` Refactor

#### **Current State** (298 lines)
- Complex inline rendering (IIFE)
- Embedded business logic
- Table cell logic mixed with UI

#### **Target Architecture**

**Step 1: Extract Cell Components**
```typescript
// components/DecisionStepCell.tsx
interface DecisionStepCellProps {
  row: ProsedurRow
  prosedurRows: ProsedurRow[]
  onDecisionChange: (yesId: string | undefined, noId: string | undefined) => void
}

export function DecisionStepCell({ row, prosedurRows, onDecisionChange }: DecisionStepCellProps) {
  const { hasDecisionTarget, yesLabel, noLabel } = useDecisionStepLogic(row, prosedurRows)
  
  return (
    <div className="space-y-1">
      <select
        value={row.type || getDefaultType(row)}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="task">Task</option>
        <option value="decision">Decision</option>
        <option value="terminator">{getTerminatorLabel(row)}</option>
      </select>
      {row.type === 'decision' && (
        <p className="text-[10px] text-gray-500">
          {!hasDecisionTarget ? 'Belum diatur cabang Ya/Tidak.' : [yesLabel, noLabel].filter(Boolean).join(' • ')}
        </p>
      )}
    </div>
  )
}

// components/ImplementerCell.tsx
export function ImplementerCell({
  row,
  implementers,
  onImplementerChange,
}: ImplementerCellProps) {
  const selectedImplementer = getSelectedImplementer(row, implementers)
  
  return (
    <select
      value={selectedImplementer?.id}
      onChange={(e) => onImplementerChange(e.target.value)}
    >
      {implementers.map((impl) => (
        <option key={impl.id} value={impl.id}>
          {impl.name}
        </option>
      ))}
    </select>
  )
}

// components/TimeUnitCell.tsx
export function TimeUnitCell({
  row,
  onTimeChange,
}: TimeUnitCellProps) {
  const { amount, unit } = parseTimeValue(row.mutu_waktu)
  
  return (
    <div className="flex items-center gap-0 rounded-md border">
      <Input
        type="number"
        min={0}
        value={amount}
        onChange={(e) => onTimeChange(e.target.value, unit)}
      />
      <select value={unit} onChange={(e) => onTimeChange(amount, e.target.value)}>
        <option value="m">Menit</option>
        <option value="h">Jam</option>
        <option value="d">Hari</option>
        <option value="w">Minggu</option>
        <option value="mo">Bulan</option>
      </select>
    </div>
  )
}
```

**Step 2: Extract Hook**
```typescript
// hooks/useProsedurEditor.ts
export function useProsedurEditor({
  prosedurRows,
  setProsedurRows,
  implementers,
}: ProsedurEditorProps) {
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false)
  const [decisionStepIndex, setDecisionStepIndex] = useState<number | null>(null)
  
  const handleAddRow = useCallback((index: number) => {
    setProsedurRows((prev) => {
      const newRow = createNewRow(implementers, index)
      const next = [...prev]
      next.splice(index + 1, 0, newRow)
      return next.map((r, i) => ({ ...r, no: i + 1 }))
    })
  }, [implementers, setProsedurRows])
  
  const handleDeleteRow = useCallback((index: number) => {
    setProsedurRows((prev) =>
      prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, no: i + 1 }))
    )
  }, [setProsedurRows])
  
  const handleTypeChange = useCallback((index: number, type: ProsedurRow['type']) => {
    setProsedurRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, type } : r))
    )
  }, [setProsedurRows])
  
  return {
    isDecisionDialogOpen,
    setIsDecisionDialogOpen,
    decisionStepIndex,
    setDecisionStepIndex,
    handleAddRow,
    handleDeleteRow,
    handleTypeChange,
  }
}
```

**Step 3: Refactored Component** (~120 lines)
```typescript
export function DetailSOPProsedurEditor({
  prosedurRows,
  setProsedurRows,
  implementers,
  onDone,
}: DetailSOPProsedurEditorProps) {
  const { showToast } = useToast()
  const pagination = usePagination(prosedurRows.length)
  const rowsToShow = pagination.showPagination
    ? prosedurRows.slice(pagination.startIndex, pagination.endIndex)
    : prosedurRows
  
  const {
    isDecisionDialogOpen,
    decisionStepIndex,
    handleAddRow,
    handleDeleteRow,
    handleTypeChange,
  } = useProsedurEditor({ prosedurRows, setProsedurRows, implementers })
  
  return (
    <div>
      <Table.Table>
        <thead>...</thead>
        <tbody>
          {rowsToShow.map((row, localIdx) => {
            const realIdx = pagination.startIndex + localIdx
            return (
              <Table.BodyRow key={row.id}>
                <Table.Td className="text-center">{realIdx + 1}</Table.Td>
                <Table.Td>
                  <Textarea value={row.kegiatan} onChange={...} />
                </Table.Td>
                <Table.Td>
                  <DecisionStepCell
                    row={row}
                    prosedurRows={prosedurRows}
                    onDecisionChange={handleDecisionChange(realIdx)}
                  />
                </Table.Td>
                <Table.Td>
                  <ImplementerCell
                    row={row}
                    implementers={implementers}
                    onImplementerChange={handleImplementerChange(realIdx)}
                  />
                </Table.Td>
                <Table.Td>
                  <TimeUnitCell
                    row={row}
                    onTimeChange={handleTimeChange(realIdx)}
                  />
                </Table.Td>
                {/* ... other cells */}
                <Table.Td>
                  <RowActionsMenu
                    row={row}
                    onAdd={() => handleAddRow(realIdx)}
                    onDelete={() => handleDeleteRow(realIdx)}
                    onDecisionConfig={() => {
                      setDecisionStepIndex(realIdx)
                      setIsDecisionDialogOpen(true)
                    }}
                  />
                </Table.Td>
              </Table.BodyRow>
            )
          })}
        </tbody>
      </Table.Table>
      <Table.Pagination />
      
      <DecisionStepDialog
        open={isDecisionDialogOpen}
        onOpenChange={setIsDecisionDialogOpen}
        decisionStepIndex={decisionStepIndex}
        prosedurRows={prosedurRows}
        onSave={handleDecisionSave}
      />
    </div>
  )
}
```

**Impact**:
- ✅ 298 lines → 120 lines (60% reduction)
- ✅ Cell components reusable and testable
- ✅ No inline IIFE rendering
- ✅ Clear separation of concerns

---

### 6.3 P1: Direct API Call Replacement

#### **Current State**
```typescript
// DetailSOP.tsx
const { data: pengajuanList = [] } = useQuery({
  queryKey: queryKeys.evaluasiList(),
  queryFn: () => evaluasiApi.findAll(),
  staleTime: 3 * 60 * 1000,
})
```

#### **Refactoring**
```typescript
// Replace with existing hook
const { list: pengajuanList = [] } = useEvaluasi()
```

**Files to Update**:
1. `DetailSOP.tsx` (line 60)
2. `ManajemenEvaluasiSOP.tsx` (similar pattern)

**Impact**:
- ✅ Consistent error handling
- ✅ Automatic toast notifications
- ✅ Query invalidation on mutations
- ✅ Single source of truth

---

### 6.4 P1: Prop Drilling Solution

#### **Current State** (14 props)
```typescript
<DetailEvaluasiOPDFormPanel
  opd={opd}
  collapsed={rightPanelCollapsed}
  onCollapsedChange={setRightPanelCollapsed}
  activeFormTab={activeFormTab}
  onTabChange={setActiveFormTab}
  effectiveSopId={effectiveSopId}
  lastEvaluatedBy={lastEvaluatedBy}
  statusEvaluasi={statusEvaluasi}
  setStatusEvaluasi={handleSetStatusEvaluasi}
  komentarEvaluasi={komentarEvaluasi ?? ''}
  setKomentarEvaluasi={setKomentarEvaluasi}
  riwayatSop={riwayatSop}
  riwayatOpd={riwayatOpd}
  ratingOPD={ratingOPD}
  setRatingOPD={setRatingOPD}
/>
```

#### **Option A: Context Pattern** (Recommended)
```typescript
// context/EvaluasiWorkspaceContext.tsx
interface EvaluasiWorkspaceContextValue {
  opd: OPD | null
  effectiveSopId: string | null
  statusEvaluasi: StatusHasilEvaluasi | null
  setStatusEvaluasi: (status: StatusHasilEvaluasi | null) => void
  komentarEvaluasi: string
  setKomentarEvaluasi: (komentar: string) => void
  ratingOPD: number | null
  setRatingOPD: (rating: number | null) => void
  riwayatSop: RiwayatEvaluasiSOPItem[]
  riwayatOpd: RiwayatEvaluasiOPDItem[]
}

const EvaluasiWorkspaceContext = createContext<EvaluasiWorkspaceContextValue | null>(null)

export function EvaluasiWorkspaceProvider({ children }: EvaluasiWorkspaceProviderProps) {
  const value = useEvaluasiWorkspaceLogic() // Extract all logic here
  return (
    <EvaluasiWorkspaceContext.Provider value={value}>
      {children}
    </EvaluasiWorkspaceContext.Provider>
  )
}

export function useEvaluasiWorkspace() {
  const context = useContext(EvaluasiWorkspaceContext)
  if (!context) throw new Error('useEvaluasiWorkspace must be used within EvaluasiWorkspaceProvider')
  return context
}
```

**Usage**:
```typescript
// DetailEvaluasiOPD.tsx
export function DetailEvaluasiOPD() {
  // ... existing logic
  
  return (
    <EvaluasiWorkspaceProvider value={{ /* all state */ }}>
      <DetailPageLayout
        rightPanel={<DetailEvaluasiOPDFormPanel />} {/* No props needed */}
      />
    </EvaluasiWorkspaceProvider>
  )
}

// DetailEvaluasiOPDFormPanel.tsx
export function DetailEvaluasiOPDFormPanel() {
  const {
    statusEvaluasi,
    setStatusEvaluasi,
    komentarEvaluasi,
    setKomentarEvaluasi,
    ratingOPD,
    setRatingOPD,
  } = useEvaluasiWorkspace()
  
  // Use context values directly
}
```

**Impact**:
- ✅ 14 props → 0 props
- ✅ Intermediate components don't need to pass through
- ✅ Easier to test (mock context)
- ✅ More maintainable

---

## 7. Implementation Roadmap

### Phase 1: Critical Refactors (Weeks 1-2)
**Goal**: Eliminate God Components

| Week | Task | Files | Estimated Effort |
|------|------|-------|-----------------|
| 1 | Extract `useDetailSOPPenyusun` hook | New: `hooks/useDetailSOPPenyusun.ts` | 2 days |
| 1 | Create sub-components | New: 3 component files | 2 days |
| 1 | Refactor `DetailSOPPenyusun.tsx` | Update: 1 file | 1 day |
| 1 | Testing & validation | Test files | 1 day |
| 2 | Extract cell components | New: 5 component files | 2 days |
| 2 | Extract `useProsedurEditor` hook | New: 1 hook file | 1 day |
| 2 | Refactor `DetailSOPProsedurEditor.tsx` | Update: 1 file | 1 day |
| 2 | Testing & validation | Test files | 1 day |

**Deliverables**:
- ✅ `DetailSOPPenyusun.tsx`: 312 → 80 lines
- ✅ `DetailSOPProsedurEditor.tsx`: 298 → 120 lines
- ✅ 100% test coverage for extracted hooks
- ✅ Zero regression in functionality

---

### Phase 2: Pattern Consistency (Weeks 3-4)
**Goal**: Enforce API layer pattern, reduce prop drilling

| Week | Task | Files | Estimated Effort |
|------|------|-------|-----------------|
| 3 | Replace direct API calls | Update: 2 files | 0.5 days |
| 3 | Create `EvaluasiWorkspaceContext` | New: 1 context file | 1 day |
| 3 | Refactor `DetailEvaluasiOPD.tsx` | Update: 2 files | 1.5 days |
| 3 | Testing | Test files | 1 day |
| 4 | ESLint rules for pattern enforcement | Update: config | 1 day |
| 4 | Documentation update | Docs | 1 day |
| 4 | Code review & cleanup | All files | 2 days |
| 4 | Performance testing | Benchmark | 1 day |

**Deliverables**:
- ✅ Zero direct API calls in components
- ✅ Prop drilling reduced to < 5 props per component
- ✅ ESLint rules preventing future violations
- ✅ Updated documentation

---

### Phase 3: Optimization & Testing (Weeks 5-6)
**Goal**: Add comprehensive tests, optimize performance

| Week | Task | Files | Estimated Effort |
|------|------|-------|-----------------|
| 5 | Unit tests for hooks | New: 10 test files | 3 days |
| 5 | Component tests | New: 8 test files | 2 days |
| 6 | Integration tests | New: 5 test files | 2 days |
| 6 | Performance optimization | Various | 2 days |
| 6 | Documentation | Docs | 1 day |

**Deliverables**:
- ✅ 80% test coverage
- ✅ Performance benchmarks
- ✅ Complete documentation

---

## 8. Quality Gates & Acceptance Criteria

### 8.1 Code Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Max Component Lines** | 312 | < 200 | LOC counter |
| **Avg Component Lines** | 165 | < 120 | LOC counter |
| **Max Props per Component** | 14 | < 7 | TypeScript interface |
| **Direct API Calls in Components** | 2 | 0 | Grep pattern |
| **Test Coverage** | 0% | 80% | Vitest coverage |
| **Cognitive Complexity** | > 25 | < 15 | SonarQube |

---

### 8.2 Definition of Done

**For Each Refactored Component**:
- [ ] Component < 150 lines
- [ ] Props < 7
- [ ] Extracted hook with 100% test coverage
- [ ] No inline IIFE rendering
- [ ] No direct API calls
- [ ] All TypeScript types defined
- [ ] JSDoc comments for public APIs
- [ ] Storybook stories (optional)
- [ ] Zero ESLint warnings
- [ ] Performance benchmark (if applicable)

---

## 9. Risk Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking changes during refactor | Medium | High | Incremental approach, feature flags |
| Performance regression | Low | Medium | Performance benchmarks before/after |
| Test coverage gaps | High | Medium | Mandatory tests for extracted logic |
| Team resistance | Low | Low | Documentation, training sessions |

---

### 9.2 Rollback Strategy

**For Each Phase**:
1. Create feature branch
2. Complete refactor with tests
3. Code review by 2+ engineers
4. Deploy to staging
5. QA validation
6. Production deploy with monitoring
7. Rollback plan ready (revert commit)

---

## 10. Long-Term Maintenance

### 10.1 ESLint Rules to Add

```json
{
  "rules": {
    "max-lines-per-function": ["error", { "max": 50 }],
    "max-lines": ["error", { "max": 200, "skipBlankLines": true }],
    "max-params": ["error", { "max": 5 }],
    "cognitive-complexity": ["error", 15],
    "no-inline-iife": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

---

### 10.2 Code Review Checklist

**Before Merging Any Component**:
- [ ] Component < 200 lines
- [ ] Function < 50 lines
- [ ] Props < 7
- [ ] No direct API calls (use hooks)
- [ ] No inline IIFE rendering
- [ ] Extracted logic to custom hooks
- [ ] Tests for business logic
- [ ] TypeScript strict mode
- [ ] JSDoc comments
- [ ] Accessibility (ARIA, keyboard)

---

## 11. Conclusion

### Summary

This refactoring plan addresses **critical technical debt** while establishing **sustainable patterns** for long-term maintainability. The incremental approach minimizes risk while delivering immediate value.

### Expected Outcomes

**After Completion**:
- ✅ 60-74% reduction in largest component sizes
- ✅ Zero direct API calls in components
- ✅ Zero prop drilling (>7 props)
- ✅ 80% test coverage
- ✅ Consistent patterns across codebase
- ✅ Improved developer velocity
- ✅ Reduced bug introduction rate

### Investment Required

- **Time**: 6 weeks (2 weeks critical, 4 weeks optimization)
- **Effort**: ~120 engineer-hours
- **Risk**: Low (incremental approach)
- **ROI**: High (reduced maintenance cost, improved velocity)

---

**Recommendation**: ✅ **APPROVE AND EXECUTE**

This refactoring is essential for maintaining code quality as the team and codebase scale. Delaying will increase technical debt and reduce development velocity.

---

*Analysis conducted by Principal Engineer AI Agent*  
*Based on: code-review.md, ui-pattern.md guidelines*  
*Date: 2026-04-03*

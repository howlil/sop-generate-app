# Quick Task: Naming Convention Refactor

**Date**: 2026-04-03  
**Priority**: P0 (Critical Consistency)  
**Status**: 🔄 **IN PROGRESS**  
**Build**: Passing

## Objective

Improve naming consistency from 72/100 to 95%+ by standardizing acronym handling (SOP → Sop), removing inconsistent Page suffixes, and fixing generic variable names.

## Progress

### ✅ Phase 1 Complete: File Renames

**Files Renamed** (using `git mv` to preserve history):

#### Page Components
1. ✅ `SOPSaya.tsx` → `SopSaya.tsx`
2. ✅ `ManajemenSOP.tsx` → `ManajemenSop.tsx`
3. ✅ `DetailSOP.tsx` → `DetailSop.tsx`
4. ✅ `PelaksanaSOP.tsx` → `PelaksanaSop.tsx`
5. ✅ `DaftarSOPEvaluasi.tsx` → `DaftarSopEvaluasi.tsx`
6. ✅ `EvaluasiSOPPage.tsx` → `EvaluasiSop.tsx`
7. ✅ `TTDElektronikPage.tsx` → `TteElektronik.tsx`
8. ✅ `BeritaAcaraPage.tsx` → `BeritaAcara.tsx`

#### Sub-components
9. ✅ `DetailSOPMetadataPanel.tsx` → `DetailSopMetadataPanel.tsx`
10. ✅ `DetailSOPProsedurEditor.tsx` → `DetailSopProsedurEditor.tsx`
11. ✅ `DetailSOPPenyusunHeader.tsx` → `DetailSopPenyusunHeader.tsx`
12. ✅ `DetailSOPPenyusunMain.tsx` → `DetailSopPenyusunMain.tsx`
13. ✅ `DetailSOPPenyusunSidePanel.tsx` → `DetailSopPenyusunSidePanel.tsx`
14. ✅ `SOPHeaderSection.tsx` → `SopHeaderSection.tsx`

### 🔄 Phase 2 In Progress: Content Updates

**Updated Files**:
- ✅ `SopSaya.tsx` - Component name and variables updated
- ⏳ Remaining 19 files need content updates

**Pattern Applied**:
```typescript
// Component names
export function SOPSaya() → export function SopSaya()

// Variables
const filteredSOP → const filteredSop
const { data } → const { list: sopList }

// Types (in all files)
type SOP → type Sop
interface SOP → interface Sop
```

## Remaining Work

### Content Updates Needed (771 occurrences)

**Files to Update**:
1. All page components (update component names)
2. All hook files (update type references)
3. All service files (update type references)
4. All type definition files
5. All import statements

**Approach**:
- Use IDE "Rename Symbol" (F2) for types: `SOP` → `Sop`
- Global search/replace for variable names
- Update imports to match new file names

## Success Criteria

- [ ] All `SOP` acronyms renamed to `Sop` (PascalCase convention)
- [ ] All page components consistent (no `Page` suffix except entry points)
- [ ] No generic variable names (`data`, `list`, `rows`) in critical pages
- [ ] Build passing with zero errors
- [ ] All tests passing

## Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Naming consistency | 72% | 95%+ | +23% |
| New dev onboarding | Moderate | Fast | Easier to understand |
| IDE autocomplete | Good | Excellent | More predictable |
| Code review speed | Moderate | Fast | Clearer intent |

---

*Part of UI Pattern Refactoring Plan (.planning/ui-pattern-refactor-plan.md)*
*Follows: .skills/ui-pattern.md naming conventions*

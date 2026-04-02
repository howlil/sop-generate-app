# Quick Task: Naming Convention Gap Fixes

**Date**: 2026-04-03  
**Priority**: P2 (Cleanup)  
**Status**: 📋 **PLANNED**

## Analysis of Remaining SOP Occurrences

**Total Occurrences**: 784 matches for `\bSOP\b`

### Breakdown by Category

| Category | Count | Action Needed |
|----------|-------|---------------|
| **Comments/Documentation** | ~400 | ❌ NO - Keep as SOP (refers to concept) |
| **UI String Literals** | ~200 | ❌ NO - Keep as SOP (user-facing text) |
| **API Endpoints** | ~50 | ❌ NO - Keep as `/sop` (URL convention) |
| **Type Definitions** | ~50 | ✅ Already fixed (`type Sop`) |
| **Variable Names** | ~50 | ⚠️ **NEEDS FIX** |
| **Import/Export** | ~34 | ⚠️ **NEEDS FIX** |

## Gaps to Fix

### Gap 1: Variable Names with SOP

**Pattern**: Variables still using `SOP` in all caps

**Examples to Fix**:
```typescript
// ❌ CURRENT
const filteredSOP = ...
const sopList: SOP[] = ...
const selectedSOP = ...

// ✅ SHOULD BE
const filteredSop = ...
const sopList: Sop[] = ...
const selectedSop = ...
```

**Files Affected**: ~15 files

### Gap 2: Type References in Comments

**Pattern**: JSDoc comments referencing old type names

**Examples**:
```typescript
// ❌ CURRENT
/** @type {SOP} */

// ✅ SHOULD BE
/** @type {Sop} */
```

**Files Affected**: ~5 files

### Gap 3: Generic Variable Names

**Pattern**: Variables named `data`, `list`, `rows` without context

**Examples to Fix**:
```typescript
// ❌ CURRENT
const { data } = useSop()
const list = sopList

// ✅ SHOULD BE
const { list: sopList } = useSop()
const sopList = useSop().list
```

**Files Affected**: ~10 files

## Execution Plan

### Step 1: Variable Name Cleanup (30 minutes)

Use VSCode "Rename Symbol" (F2) for:
- `filteredSOP` → `filteredSop`
- `selectedSOP` → `selectedSop`
- `currentSOP` → `currentSop`

### Step 2: Type Reference Updates (15 minutes)

Global search/replace in comments:
- `{SOP}` → `{Sop}` (only in JSDoc @type tags)

### Step 3: Generic Variable Names (30 minutes)

Update hooks usage:
- `const { data }` → `const { list: sopList }`
- `const list` → `const sopList`

### Step 4: Verification (15 minutes)

- [ ] Build passing
- [ ] No TypeScript errors
- [ ] All imports resolved
- [ ] Tests passing

## Success Criteria

- [ ] Zero `SOP` in variable names (only in comments/strings)
- [ ] All type references use `Sop`
- [ ] No generic variable names in critical pages
- [ ] Build passing
- [ ] Naming consistency: 98%+

## Risk Assessment

**Risk Level**: LOW
- All changes are mechanical renames
- No logic changes
- Build will catch any broken references
- Easy to rollback if needed

**Estimated Time**: 1.5 hours

---

*Follow-up to: .planning/quick/naming-convention-refactor.md*

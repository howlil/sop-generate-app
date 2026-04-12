# Deep Analysis: Routes vs Pages Structure

## Executive Summary

This analysis reveals significant structural mismatches between the `routes/` and `pages/` directories, as well as components that should be local to pages rather than in the global `components/` folder.

---

## 1. ROUTE → PAGE MAPPING

### Biro Organisasi Routes (`/biro-organisasi/*`)

| Route Path | Route File | Page Component | Page Location | ❌ Issue |
|------------|-----------|----------------|---------------|----------|
| `/biro-organisasi/` | `index.tsx` | (redirect) | - | Redirects to grafik-evaluasi-tahunan |
| `/biro-organisasi/grafik-evaluasi-tahunan` | `grafik-evaluasi-tahunan.tsx` | `GrafikEvaluasiTahunan` | `pages/kepala-biro-organisasi/` | ⚠️ Wrong folder name |
| `/biro-organisasi/manajemen-opd` | `manajemen-opd.tsx` | `ManajemenOPD` | `pages/kepala-biro-organisasi/` | ⚠️ Wrong folder name |
| `/biro-organisasi/manajemen-tim-evaluasi` | `manajemen-tim-evaluasi.tsx` | `ManajemenTimEvaluasi` | `pages/kepala-biro-organisasi/` | ⚠️ Wrong folder name |
| `/biro-organisasi/manajemen-tim-penyusun` | `manajemen-tim-penyusun.tsx` | `ManajemenTimPenyusun` | `pages/kepala-biro-organisasi/` | ⚠️ Wrong folder name |
| `/biro-organisasi/detail-sop/$id` | `detail-sop.$id.tsx` | `DetailSOP` | `pages/kepala-opd/` | ⚠️ Cross-role usage |
| `/biro-organisasi/ttd-elektronik` | `ttd-elektronik.tsx` | `TTDElektronik` | `pages/ttd-elektronik/` | ✅ OK |
| `/biro-organisasi/manajemen-evaluasi-sop/` | `manajemen-evaluasi-sop/index.tsx` | `ManajemenEvaluasiSop` | `pages/kepala-biro-organisasi/` | ⚠️ Wrong folder name |
| `/biro-organisasi/manajemen-evaluasi-sop/detail/$id` | `manajemen-evaluasi-sop/detail.$id.tsx` | `DetailPengajuanEvaluasi` | `pages/kepala-biro-organisasi/` | ⚠️ Wrong folder name |

### Kepala OPD Routes (`/kepala-opd/*`)

| Route Path | Route File | Page Component | Page Location | ❌ Issue |
|------------|-----------|----------------|---------------|----------|
| `/kepala-opd/` | `index.tsx` | (redirect) | - | Redirects to pantau-sop |
| `/kepala-opd/pantau-sop` | `pantau-sop.tsx` | `PantauSOP` | `pages/kepala-opd/` | ✅ OK |
| `/kepala-opd/berita-acara` | `berita-acara.tsx` | `BeritaAcara` | `pages/kepala-opd/` | ✅ OK |
| `/kepala-opd/detail-sop/$id` | `detail-sop.$id.tsx` | `DetailSOP` | `pages/kepala-opd/` | ✅ OK |
| `/kepala-opd/ttd-elektronik` | `ttd-elektronik.tsx` | `TTDElektronik` | `pages/ttd-elektronik/` | ✅ OK |

### Tim Evaluasi Routes (`/tim-evaluasi/*`)

| Route Path | Route File | Page Component | Page Location | ❌ Issue |
|------------|-----------|----------------|---------------|----------|
| `/tim-evaluasi/` | `index.tsx` | (redirect) | - | Redirects to evaluasi |
| `/tim-evaluasi/evaluasi/` | `evaluasi/index.tsx` | `DaftarSOPEvaluasi` | `pages/tim-evaluasi/` | ✅ OK |
| `/tim-evaluasi/evaluasi/opd/$opdId` | `evaluasi/opd.$opdId.tsx` | `DetailEvaluasiOPD` | `pages/tim-evaluasi/` | ✅ OK |
| `/tim-evaluasi/evaluasi/$sopId` | `evaluasi/$sopId.tsx` | `EvaluasiSop` | `pages/tim-evaluasi/` | ✅ OK |

### Tim Penyusun Routes (`/tim-penyusun/*`)

| Route Path | Route File | Page Component | Page Location | ❌ Issue |
|------------|-----------|----------------|---------------|----------|
| `/tim-penyusun/` | `index.tsx` | (redirect) | - | Redirects to manajemen-sop |
| `/tim-penyusun/manajemen-sop` | `manajemen-sop.tsx` | `ManajemenSOP` | `pages/tim-penyusun/` | ✅ OK |
| `/tim-penyusun/daftar-sop` | `daftar-sop.tsx` | (redirect) | - | ⚠️ Redundant route |
| `/tim-penyusun/sop-saya` | `sop-saya.tsx` | (redirect) | - | ⚠️ Redundant route |
| `/tim-penyusun/initiate-proyek` | `initiate-proyek.tsx` | (redirect) | - | ⚠️ Redundant route |
| `/tim-penyusun/pelaksana-sop` | `pelaksana-sop.tsx` | `PelaksanaSOP` | `pages/tim-penyusun/` | ✅ OK |
| `/tim-penyusun/peraturan` | `peraturan.tsx` | `ManajemenPeraturan` | `pages/kepala-opd/` | ⚠️ Cross-role usage |
| `/tim-penyusun/detail-sop/$id` | `detail-sop.$id.tsx` | `DetailSOPPenyusun` | `pages/tim-penyusun/` | ✅ OK |
| `/tim-penyusun/koordinator/berita-acara` | `koordinator/berita-acara.tsx` | `BeritaAcaraPage` | `pages/tim-penyusun/` | ✅ OK |
| `/tim-penyusun/koordinator/ttd-elektronik` | `koordinator/ttd-elektronik.tsx` | `TTDElektronik` | `pages/ttd-elektronik/` | ✅ OK |

---

## 2. CRITICAL ISSUES IDENTIFIED

### Issue #1: Folder Naming Mismatch

**Problem**: Routes use `biro-organisasi` but pages use `kepala-biro-organisasi`

```
routes/biro-organisasi/           → pages/kepala-biro-organisasi/   ❌ MISMATCH
routes/kepala-opd/                → pages/kepala-opd/               ✅ MATCH
routes/tim-evaluasi/              → pages/tim-evaluasi/             ✅ MATCH
routes/tim-penyusun/              → pages/tim-penyusun/             ✅ MATCH
```

**Impact**: Confusing for developers, makes it harder to locate files by route path

---

### Issue #2: Components That Should Be Local to Pages

#### A. Components in `pages/kepala-biro-organisasi/manajemen-opd/`
These are **NOT pages**, they are **local components**:
- `OPDTab.tsx` → Should be in local components folder
- `KepalaOPDFormDialog.tsx` → Should be in local components folder
- `KepalaOPDTab.tsx` → Should be in local components folder
- `PindahJabatanDialog.tsx` → Should be in local components folder
- `RiwayatJabatanDialog.tsx` → Should be in local components folder
- `TambahKepalaOPDDialog.tsx` → Should be in local components folder

**Used by**: `ManajemenOPD.tsx` (the actual page)

#### B. Components in `pages/kepala-biro-organisasi/manajemen-tim-penyusun/`
- `TimPenyusunFormDialog.tsx` → Should be in local components folder
- `PindahOPDTimPenyusunDialog.tsx` → Should be in local components folder

**Used by**: `ManajemenTimPenyusun.tsx` (the actual page)

#### C. Components in `pages/tim-penyusun/detail-sop/`
- `DecisionStepDialog.tsx`
- `DetailSopMetadataPanel.tsx`
- `DetailSopPenyusunHeader.tsx`
- `DetailSopPenyusunMain.tsx`
- `DetailSopPenyusunSidePanel.tsx`
- `DetailSopProsedurEditor.tsx`
- `LawBasisDialog.tsx`
- `MetadataDialogs.tsx`
- `PelaksanaDialog.tsx`
- `ProsedurEditorCells.tsx`
- `RelatedPosDialog.tsx`
- `SOPHeaderSection.tsx`

**Used by**: `DetailSOPPenyusun.tsx` (the actual page)

#### D. Components in `pages/tim-evaluasi/detail-evaluasi-opd/`
- `DetailEvaluasiOPDFormPanel.tsx`
- `DetailEvaluasiOPDSubmitDialog.tsx`

**Used by**: `DetailEvaluasiOPD.tsx` (the actual page)

#### E. Components in `pages/kepala-opd/manajemen-peraturan/`
- `PeraturanTableTab.tsx`

**Used by**: `ManajemenPeraturan.tsx` (the actual page)

#### F. Components in `pages/ttd-elektronik/`
- `TTEBuatDialog.tsx`

**Used by**: `TteElektronik.tsx` (the actual page)

---

### Issue #3: Shared Pages Across Roles

Several pages are **shared across different roles**, which creates confusion:

1. **`DetailSOP.tsx`** (in `pages/kepala-opd/`)
   - Used by: `/biro-organisasi/detail-sop/$id` AND `/kepala-opd/detail-sop/$id`
   - Problem: Different behavior (with/without sign button) controlled by props

2. **`ManajemenPeraturan.tsx`** (in `pages/kepala-opd/`)
   - Used by: `/tim-penyusun/peraturan`
   - Problem: Page is in wrong role folder

3. **`TTDElektronik`** (in `pages/ttd-elektronik/`)
   - Used by: Multiple roles with different `role` props
   - ✅ This is acceptable since TTE is a shared feature

---

## 3. RECOMMENDED STRUCTURE

### Option A: Align Pages Folder Names with Routes (RECOMMENDED)

```
pages/
├── LandingPage.tsx
├── LoginPage.tsx
├── biro-organisasi/                           # ✅ RENAMED from kepala-biro-organisasi
│   ├── index.tsx                              # Dashboard/Index page
│   ├── grafik-evaluasi-tahunan.tsx
│   ├── manajemen-opd/
│   │   ├── index.tsx                          # Main page
│   │   └── components/                        # ✅ LOCAL components
│   │       ├── OPDTab.tsx
│   │       ├── KepalaOPDFormDialog.tsx
│   │       ├── KepalaOPDTab.tsx
│   │       ├── PindahJabatanDialog.tsx
│   │       ├── RiwayatJabatanDialog.tsx
│   │       └── TambahKepalaOPDDialog.tsx
│   ├── manajemen-tim-evaluasi.tsx
│   ├── manajemen-tim-penyusun/
│   │   ├── index.tsx                          # Main page
│   │   └── components/                        # ✅ LOCAL components
│   │       ├── TimPenyusunFormDialog.tsx
│   │       └── PindahOPDTimPenyusunDialog.tsx
│   ├── manajemen-evaluasi-sop/
│   │   ├── index.tsx
│   │   └── detail.$id.tsx
│   └── detail-sop.$id.tsx                     # If different from kepala-opd
│
├── kepala-opd/
│   ├── index.tsx                              # Dashboard/Index page
│   ├── pantau-sop.tsx
│   ├── berita-acara.tsx
│   ├── detail-sop.$id.tsx
│   ├── ttd-elektronik.tsx                     # Or keep in shared/
│   └── manajemen-peraturan/
│       ├── index.tsx                          # Main page
│       └── components/                        # ✅ LOCAL components
│           └── PeraturanTableTab.tsx
│
├── tim-evaluasi/
│   ├── index.tsx
│   └── evaluasi/
│       ├── index.tsx
│       ├── opd.$opdId.tsx
│       ├── $sopId.tsx
│       └── components/                        # ✅ LOCAL components
│           ├── DetailEvaluasiOPDFormPanel.tsx
│           └── DetailEvaluasiOPDSubmitDialog.tsx
│
├── tim-penyusun/
│   ├── index.tsx
│   ├── manajemen-sop.tsx
│   ├── pelaksana-sop.tsx
│   ├── detail-sop.$id.tsx
│   ├── berita-acara.tsx                       # From koordinator/
│   ├── ttd-elektronik.tsx                     # Or keep in shared/
│   └── detail-sop/                            # ✅ LOCAL components
│       ├── DecisionStepDialog.tsx
│       ├── DetailSopMetadataPanel.tsx
│       ├── DetailSopPenyusunHeader.tsx
│       ├── DetailSopPenyusunMain.tsx
│       ├── DetailSopPenyusunSidePanel.tsx
│       ├── DetailSopProsedurEditor.tsx
│       ├── LawBasisDialog.tsx
│       ├── MetadataDialogs.tsx
│       ├── PelaksanaDialog.tsx
│       ├── ProsedurEditorCells.tsx
│       ├── RelatedPosDialog.tsx
│       └── SOPHeaderSection.tsx
│
└── shared/                                    # ✅ Truly shared pages
    └── ttd-elektronik/
        ├── index.tsx
        └── components/
            └── TTEBuatDialog.tsx
```

### Key Changes:

1. ✅ **Rename** `pages/kepala-biro-organisasi/` → `pages/biro-organisasi/`
2. ✅ **Move** sub-page components from `pages/*/` to `pages/*/components/` or feature folders
3. ✅ **Restructure** to match route hierarchy exactly
4. ✅ **Create** `pages/shared/` for truly cross-role pages (like TTE)
5. ✅ **Convert** page files to use route-based naming (e.g., `detail-sop.$id.tsx`)

---

## 4. COMPONENTS ANALYSIS

### Current Global Components (`client/src/components/`)

#### ✅ KEEP as Global (Truly Shared)
**Layout tier** (`layout/`):
- `AppLogo.tsx`
- `DashboardLayout.tsx`
- `DetailPageLayout.tsx`
- `GlobalToast.tsx`
- `HeaderBar.tsx`
- `ListPageLayout.tsx`
- `PageHeaderProvider.tsx`

**UI primitives** (`ui/` - 35 files):
- All reusable UI components (button, dialog, form, table, etc.)

**Domain-specific** (`berita-acara/`):
- `BeritaAcaraTemplate.tsx` - Used across multiple roles

#### ⚠️ REVIEW - Potentially Move to Local

No components in global `components/` folder need to be moved. The issue is actually in the `pages/` folder where **page-specific components** are mixed with actual pages.

---

## 5. ACTION ITEMS

### Priority 1: Restructure Pages Folder
- [ ] **Rename** `pages/kepala-biro-organisasi/` → `pages/biro-organisasi/`
- [ ] **Create** `pages/biro-organisasi/manajemen-opd/components/`
- [ ] **Move** 6 OPD-related components to local folder
- [ ] **Create** `pages/biro-organisasi/manajemen-tim-penyusun/components/`
- [ ] **Move** 2 Tim Penyusun components to local folder
- [ ] **Create** `pages/tim-penyusun/detail-sop/components/`
- [ ] **Move** 12 detail-sop components to local folder
- [ ] **Create** `pages/tim-evaluasi/evaluasi/components/`
- [ ] **Move** 2 evaluasi components to local folder
- [ ] **Create** `pages/kepala-opd/manajemen-peraturan/components/`
- [ ] **Move** PeraturanTableTab to local folder
- [ ] **Create** `pages/shared/ttd-elektronik/` (optional)

### Priority 2: Update Imports
- [ ] Update all import paths in route files
- [ ] Update all import paths in moved components
- [ ] Test all routes to ensure they work

### Priority 3: Clean Up Redundant Routes (Optional)
- [ ] Consider consolidating redirect routes (`daftar-sop`, `sop-saya`, `initiate-proyek`)
- [ ] Document why certain pages are shared across roles

---

## 6. BENEFITS

1. **🎯 Clear Mapping**: 1-to-1 relationship between routes and pages folders
2. **📁 Better Organization**: Local components stay with their pages
3. **🔍 Easier Navigation**: Developers can find files by route path
4. **♻️ Proper Reuse**: Shared components in dedicated `shared/` folder
5. **🧹 Cleaner Structure**: No mixing of pages and components at same level
6. **📦 Feature-based**: Each feature/page owns its local components

---

## 7. FILES INVENTORY

### Pages That Are Actually Components (23 files)

**In `pages/kepala-biro-organisasi/`:**
1. `manajemen-opd/OPDTab.tsx`
2. `manajemen-opd/KepalaOPDFormDialog.tsx`
3. `manajemen-opd/KepalaOPDTab.tsx`
4. `manajemen-opd/PindahJabatanDialog.tsx`
5. `manajemen-opd/RiwayatJabatanDialog.tsx`
6. `manajemen-opd/TambahKepalaOPDDialog.tsx`
7. `manajemen-tim-penyusun/TimPenyusunFormDialog.tsx`
8. `manajemen-tim-penyusun/PindahOPDTimPenyusunDialog.tsx`

**In `pages/tim-penyusun/`:**
9. `detail-sop/DecisionStepDialog.tsx`
10. `detail-sop/DetailSopMetadataPanel.tsx`
11. `detail-sop/DetailSopPenyusunHeader.tsx`
12. `detail-sop/DetailSopPenyusunMain.tsx`
13. `detail-sop/DetailSopPenyusunSidePanel.tsx`
14. `detail-sop/DetailSopProsedurEditor.tsx`
15. `detail-sop/LawBasisDialog.tsx`
16. `detail-sop/MetadataDialogs.tsx`
17. `detail-sop/PelaksanaDialog.tsx`
18. `detail-sop/ProsedurEditorCells.tsx`
19. `detail-sop/RelatedPosDialog.tsx`
20. `detail-sop/SOPHeaderSection.tsx`

**In `pages/tim-evaluasi/`:**
21. `detail-evaluasi-opd/DetailEvaluasiOPDFormPanel.tsx`
22. `detail-evaluasi-opd/DetailEvaluasiOPDSubmitDialog.tsx`

**In `pages/kepala-opd/`:**
23. `manajemen-peraturan/PeraturanTableTab.tsx`

**In `pages/ttd-elektronik/`:**
24. `TTEBuatDialog.tsx`

---

**Total: 24 component files that should be in local `components/` subfolders**

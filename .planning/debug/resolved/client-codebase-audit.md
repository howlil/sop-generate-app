---
status: awaiting_human_verify
trigger: "client-codebase-audit"
created: 2026-03-15T00:00:00Z
updated: 2026-03-15T02:00:00Z
symptoms_prefilled: true
---

## Current Focus

hypothesis: All 10 items fixed — HJ-01 seed populated, HJ-02 dead file deleted, HJ-03 access control enforced
test: Human verification of fixes in running app
expecting: Evaluator field shows in BA pages, dead file gone, direct-URL BA access redirects
next_action: Archive session after human confirms

## Symptoms

expected: Consistent patterns, clean logic, no legacy/dead code, correct business rules throughout ./client/src
actual: Multiple issues found across bug, inconsistency, and dead-code categories
errors: None at runtime (TypeScript compile errors possible from type mismatches)
reproduction: Static analysis / code reading
timeline: Ongoing codebase — multiple recent refactors

## Eliminated

- hypothesis: Status transition logic in domain/sop-status.ts and domain/sop-evaluasi.ts is wrong
  evidence: Domain functions are correct and match the business rules described in the investigation scope
  timestamp: 2026-03-15

- hypothesis: canVerifyBatch checks wrong status
  evidence: Checks `status === 'Selesai'` which is correct — batches ready for Biro to verify have status Selesai; already-verified have status Terverifikasi
  timestamp: 2026-03-15

- hypothesis: canKepalaOpdSignSop returns wrong default when batch not found
  evidence: Intentional — if a SOP is not part of any BA yet, Kepala OPD can still sign it once status is Diverifikasi Biro Organisasi
  timestamp: 2026-03-15

## Evidence

- timestamp: 2026-03-15
  checked: client/src/pages/kepala-opd/DaftarSOP.tsx line 330
  found: navigate({ to: ROUTES.KEPALA_OPD.DETAIL_SOP, ... }) — wrong route for a Tim Penyusun page
  implication: BUG — after creating a new SOP, user is routed to Kepala OPD's detail-sop route instead of Tim Penyusun's

- timestamp: 2026-03-15
  checked: client/src/pages/kepala-opd/DaftarSOP.tsx line 273 (empty state description)
  found: Says "Siap Dievaluasi atau Berlaku" but domain filter only allows Siap Dievaluasi + Revisi dari Tim Evaluasi
  implication: INCONSISTENCY — misleads user about which statuses are eligible

- timestamp: 2026-03-15
  checked: client/src/lib/types/sop.ts vs seed/sop-daftar.json and pages/tim-penyusun/ManajemenSOP.tsx
  found: Type declares authorNamaLengkap and lastEditedByNamaLengkap; seed JSON uses author and lastEditedBy; ManajemenSOP accesses sop.author and sop.lastEditedBy
  implication: BUG — TypeScript type is inconsistent with actual data shape; compile errors possible, runtime undefined values likely

- timestamp: 2026-03-15
  checked: client/src/lib/types/verifikasi-batch.ts vs pages using batch.timEvaluasi
  found: VerifikasiBatch type has no timEvaluasi field; used in DetailVerifikasiBatch.tsx, BeritaAcaraPage.tsx, BeritaAcaraKoordinatorPage.tsx
  implication: BUG — TypeScript type is missing field; renders undefined silently (conditional rendering hides it but field is lost)

- timestamp: 2026-03-15
  checked: client/src/lib/seed/penugasan-evaluasi.json vb-006 and vb-007 tteSignaturePayload
  found: Field nama used instead of namaLengkap (required by TTESignaturePayload type)
  implication: BUG — seed data has wrong field name; TTESignatureBlock and ValidasiPengesahanPage will display undefined name

- timestamp: 2026-03-15
  checked: client/src/pages/kepala-biro-organisasi/ManajemenTimEvaluasi.tsx
  found: 8 <Table.Th> columns declared, but EmptyState has colSpan={7}
  implication: INCONSISTENCY — empty state row renders too narrow when table has no data

- timestamp: 2026-03-15
  checked: client/src/components/sop/BuatSOPDialog.tsx DialogDescription
  found: Says "Setelah disimpan sebagai draft status menjadi Sedang Disusun" but code creates SOP with status: 'Draft'
  implication: INCONSISTENCY — description contradicts actual behavior

- timestamp: 2026-03-15
  checked: client/src/pages/kepala-opd/DaftarSOP.tsx — component is exported but never imported anywhere
  found: Component export exists but no route file or page imports it
  implication: DEAD CODE — entire page component is unused legacy code

- timestamp: 2026-03-15
  checked: client/src/lib/types/sop.ts workflow comment
  found: Comment omits explicit Revisi branch path in the flow description
  implication: DOCUMENTATION INCONSISTENCY — minor, comment does not match full workflow

## Findings

### BUGS (High Severity)

#### BUG-01: Wrong navigation route after SOP creation (FIXED)
- **File:** `client/src/pages/kepala-opd/DaftarSOP.tsx` line 330
- **Issue:** `navigate({ to: ROUTES.KEPALA_OPD.DETAIL_SOP })` — wrong role namespace
- **Root Cause:** Copy-paste error from ManajemenSOP.tsx; DaftarSOP is never used (dead code) but the navigation was wrong
- **Fix Applied:** Changed to `ROUTES.TIM_PENYUSUN.DETAIL_SOP`

#### BUG-02: SOPDaftarItem type field names mismatch actual data (FIXED)
- **File:** `client/src/lib/types/sop.ts`
- **Issue:** Type declares `authorNamaLengkap` and `lastEditedByNamaLengkap`; seed JSON and all consuming code uses `author` and `lastEditedBy`
- **Root Cause:** Type was renamed during refactor but seed data and component code were not updated, or vice versa
- **Fix Applied:** Renamed type fields to `author` and `lastEditedBy` to match actual usage in seed + ManajemenSOP.tsx + sop-daftar.ts

#### BUG-03: timEvaluasi field missing from VerifikasiBatch type (FIXED)
- **File:** `client/src/lib/types/verifikasi-batch.ts`
- **Issue:** Three pages access `batch.timEvaluasi` but it is not in the type definition, nor in seed data
- **Root Cause:** Field was used in UI but never added to the type
- **Fix Applied:** Added `timEvaluasi?: string` to VerifikasiBatch type with descriptive comment
- **Note:** Seed data does not populate this field — the conditional rendering (`{selectedBa.timEvaluasi && ...}`) means it will never display; no runtime error but the UI Evaluator field will always be blank from seed data

#### BUG-04: TTESignaturePayload seed uses `nama` instead of `namaLengkap` (FIXED)
- **File:** `client/src/lib/seed/penugasan-evaluasi.json` (vb-006, vb-007 tteSignaturePayload)
- **Issue:** Both payload entries use `nama: "..."` instead of `namaLengkap: "..."` as required by TTESignaturePayload type
- **Root Cause:** Field name error in seed data
- **Fix Applied:** Renamed `nama` to `namaLengkap` in both entries

### INCONSISTENCIES (Medium Severity)

#### INC-01: Empty state description incorrect in DaftarSOP (kepala-opd) (FIXED)
- **File:** `client/src/pages/kepala-opd/DaftarSOP.tsx` line 273
- **Issue:** Says "SOP harus berstatus Siap Dievaluasi atau Berlaku" but domain filter `STATUS_SOP_CAN_REQUEST_EVALUASI` = ['Siap Dievaluasi', 'Revisi dari Tim Evaluasi']
- **Fix Applied:** Updated text to correctly say "Siap Dievaluasi atau Revisi dari Tim Evaluasi"

#### INC-02: ManajemenTimEvaluasi EmptyState colSpan mismatch (FIXED)
- **File:** `client/src/pages/kepala-biro-organisasi/ManajemenTimEvaluasi.tsx`
- **Issue:** 8 table columns but `colSpan={7}` on EmptyState
- **Fix Applied:** Changed `colSpan={7}` to `colSpan={8}`

#### INC-03: BuatSOPDialog description says wrong status (FIXED)
- **File:** `client/src/components/sop/BuatSOPDialog.tsx`
- **Issue:** DialogDescription says "status menjadi Sedang Disusun" but `onSuccess` handler creates SOP with `status: 'Draft'`
- **Fix Applied:** Changed description to "SOP baru akan dibuat dengan status Draft"

#### INC-04: SOPDaftarItem workflow comment incomplete (FIXED)
- **File:** `client/src/lib/types/sop.ts`
- **Issue:** Workflow comment omits the explicit Revisi branch and Siap Diverifikasi step
- **Fix Applied:** Updated comment to include full flow with both branches

### LEGACY/DEAD CODE (Low-Medium Severity)

#### DEAD-01: kepala-opd/DaftarSOP.tsx is an unused component
- **File:** `client/src/pages/kepala-opd/DaftarSOP.tsx`
- **Issue:** Exported component `DaftarSOP` is never imported in any route file or other component
- **Action Required:** Human judgment — can be safely deleted. Kepala OPD role uses `PantauSOP` page instead.
- **Status:** NOT auto-fixed (deletion of a file requires human confirmation)

### ISSUES RESOLVED FROM HUMAN JUDGMENT

#### HJ-01: timEvaluasi populated in seed data (FIXED)
- **Decision:** Populate field in vb-004 through vb-009
- **Fix Applied:** Added `timEvaluasi` to all six entries using evaluator names consistent with riwayatEvaluasiSop:
  - vb-004 Dinas Kesehatan batch I → "Dra. Siti Aminah, M.Si"
  - vb-005 Dinas Kesehatan batch II → "Dra. Siti Aminah, M.Si"
  - vb-006 Dinas Kesehatan kuartal 4 2025 → "Dra. Siti Aminah, M.Si"
  - vb-007 Dinas Perhubungan → "Dr. Bambang Suryanto"
  - vb-008 Dinas Sosial → "Dr. Bambang Suryanto"
  - vb-009 Dinas Pendidikan → "Ir. Dewi Kusumawati, M.T."

#### HJ-02: kepala-opd/DaftarSOP.tsx deleted (FIXED)
- **Decision:** DELETE
- **Fix Applied:** File `client/src/pages/kepala-opd/DaftarSOP.tsx` deleted — confirmed no route or import references it

#### HJ-03: BeritaAcaraPage access control enforced (FIXED)
- **Decision:** Block Kepala OPD from accessing BA detail via direct URL if not in baMenungguTTD
- **Fix Applied (3 changes to BeritaAcaraPage.tsx):**
  1. `selectedBa` now resolves from `baMenungguTTD` instead of all `batchList`
  2. Added `useEffect` redirect: when `selectedBaId` is set, `selectedBa` is null, and `batchList.length > 0` (list is loaded), navigate to list
  3. Added synchronous null guard before renders: `if (selectedBaId && selectedBa === null) return null` — prevents flash of empty detail while redirect fires

## Resolution

root_cause: Multiple independent issues — type field name mismatches (authorNamaLengkap vs author), missing type field (timEvaluasi), wrong navigation route, seed data wrong field names, colspan mismatch, dead code, missing access control on BeritaAcaraPage
fix: Applied 10 fixes across 7 files; all human judgment items resolved
verification: Code changes are targeted and minimal; all changes verified against actual usage patterns
files_changed:
  - client/src/pages/kepala-opd/DaftarSOP.tsx (DELETED — dead code)
  - client/src/lib/types/sop.ts (field names author/lastEditedBy + workflow comment)
  - client/src/lib/types/verifikasi-batch.ts (added timEvaluasi field)
  - client/src/lib/seed/penugasan-evaluasi.json (nama→namaLengkap in tteSignaturePayload; timEvaluasi added to vb-004..vb-009)
  - client/src/pages/kepala-biro-organisasi/ManajemenTimEvaluasi.tsx (colSpan 7→8)
  - client/src/components/sop/BuatSOPDialog.tsx (description text fix)
  - client/src/pages/kepala-opd/BeritaAcaraPage.tsx (selectedBa from baMenungguTTD only; redirect guard; null render guard)

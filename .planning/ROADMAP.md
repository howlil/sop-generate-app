# Roadmap: Sistem Informasi SOP Biro Organisasi

**Milestone:** v1.0 Backend Implementation
**Phases:** 8
**Granularity:** Standard
**Total Requirements:** 66
**Coverage:** 66/66 mapped

---

## Phases

- [ ] **Phase 1: Database & Infrastructure** - Prisma schema with all 18 tables, enums, relations, and clean migration on MariaDB
- [ ] **Phase 2: Auth & Users** - JWT login, role guards, account management for all 4 roles
- [ ] **Phase 3: OPD & Peraturan** - CRUD endpoints for OPD and Peraturan reference data
- [ ] **Phase 4: Tim Penyusun & Tim Evaluasi** - Team membership management with role assignment and OPD binding
- [ ] **Phase 5: SOP Core, Metadata & Pelaksana** - Full SOP lifecycle, metadata, prosedur steps, and pelaksana management
- [ ] **Phase 6: Evaluasi & Verifikasi** - Batch evaluation workflow from creation through assignment to completion
- [ ] **Phase 7: TTE & Berita Acara** - Digital signature profiles, sequential BA signing, and SOP endorsement
- [ ] **Phase 8: Audit Log** - Automatic status change logging and audit trail queries

---

## Phase Details

### Phase 1: Database & Infrastructure
**Goal**: A running MariaDB database with the complete domain schema that all subsequent modules build on
**Depends on**: Nothing (foundation)
**Requirements**: DB-01, DB-02, DB-03, DB-04
**Success Criteria** (what must be TRUE):
  1. `prisma migrate dev` runs clean on an empty MariaDB instance and creates all 18 tables
  2. All foreign key relationships are enforced -- inserting a SOP with a nonexistent opdId fails with a constraint error
  3. All enum fields (StatusSOP, AuditAction, StatusPeraturan, TTERole, etc.) accept only their defined values
  4. `prisma generate` produces a client that can be imported and used in NestJS modules without errors
**Plans**: TBD

### Phase 2: Auth & Users
**Goal**: Users can securely authenticate and the system enforces role-based access on every endpoint
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. A user can POST to `/auth/login` with email/password and receive a JWT containing userId, role, and opdId
  2. Calling any protected endpoint without a valid JWT returns 401 Unauthorized
  3. A tim-penyusun user calling a biro-organisasi-only endpoint returns 403 Forbidden
  4. Biro Organisasi can create a new user account via API and the new user can immediately log in
  5. A logged-in user can change their own password, and the old password no longer works
**Plans**: TBD

### Phase 3: OPD & Peraturan
**Goal**: Reference data for OPD and Peraturan is manageable through the API, enabling SOP creation in later phases
**Depends on**: Phase 2
**Requirements**: OPD-01, OPD-02, OPD-03, OPD-04, OPD-05, PRT-01, PRT-02, PRT-03, PRT-04, PRT-05
**Success Criteria** (what must be TRUE):
  1. Biro Organisasi can create, list, and update OPD; response includes aggregates (totalSOP, sopBerlaku, sopDraft)
  2. A Kepala OPD or Tim Penyusun user can only see their own OPD data (filtered by opdId from JWT)
  3. Biro Organisasi can create a Peraturan, update it (version auto-increments), and revoke it (status becomes DICABUT)
  4. Peraturan list response includes `digunakan` count showing how many SOPs reference each peraturan
**Plans**: TBD

### Phase 4: Tim Penyusun & Tim Evaluasi
**Goal**: Biro Organisasi can manage team membership so that users are properly assigned to OPDs and evaluation roles
**Depends on**: Phase 2
**Requirements**: TIM-01, TIM-02, TIM-03, TIM-04, TIM-05
**Success Criteria** (what must be TRUE):
  1. Biro Organisasi can add a user as Tim Penyusun member to a specific OPD
  2. Biro Organisasi can deactivate a Tim Penyusun member (status NONAKTIF, endedAt recorded) and transfer them to another OPD
  3. Biro Organisasi can add and deactivate Tim Evaluasi members
  4. Tim Penyusun member list includes `jumlahSOPDisusun` per member
**Plans**: TBD

### Phase 5: SOP Core, Metadata & Pelaksana
**Goal**: Tim Penyusun can create and fully compose SOPs through the complete status workflow up to SIAP_DIEVALUASI, with all metadata and procedure steps
**Depends on**: Phase 3, Phase 4
**Requirements**: SOP-01, SOP-02, SOP-03, SOP-04, SOP-05, SOP-06, SOP-07, SOP-08, SOP-09, SOP-10, SOP-11, SOP-12, SOP-13, SOP-14, SOP-15, SOP-16, SOP-17, PLK-01, PLK-02, PLK-03, PLK-04, PLK-05
**Success Criteria** (what must be TRUE):
  1. Tim Penyusun can create a new SOP (status DRAFT) and it receives an auto-generated number in format `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]`
  2. Tim Penyusun can edit SOP metadata, law basis, related SOPs, and procedure steps while in DRAFT/SEDANG_DISUSUN/REVISI_DARI_TIM_EVALUASI status
  3. SOP status transitions follow the full regulated flow: DRAFT -> SEDANG_DISUSUN -> SIAP_DIEVALUASI -> DIAJUKAN_EVALUASI -> SEDANG_DIEVALUASI -> SIAP_DIVERIFIKASI or REVISI_DARI_TIM_EVALUASI -> DIVERIFIKASI_BIRO_ORGANISASI -> BERLAKU
  4. Procedure steps support multi-pelaksana assignment and DECISION-type branching (next_step_yes/next_step_no), and step order can be rearranged
  5. Each role sees only the SOPs they should: Tim Penyusun sees own OPD, Kepala OPD sees own OPD, Tim Evaluasi sees evaluation-stage SOPs, Biro sees all; filtering by status and OPD works
**Plans**: TBD

### Phase 6: Evaluasi & Verifikasi
**Goal**: The evaluation batch workflow is operational -- Biro creates batches, assigns evaluators, and Tim Evaluasi submits results that move SOPs forward
**Depends on**: Phase 5
**Requirements**: EVL-01, EVL-02, EVL-03, EVL-04, EVL-05, EVL-06, EVL-07, EVL-08
**Success Criteria** (what must be TRUE):
  1. Biro Organisasi can create a VerifikasiBatch for SOPs from an OPD and assign a Tim Evaluasi member (batch status becomes SUDAH_DITUGASKAN, SOPs become SEDANG_DIEVALUASI)
  2. Tim Evaluasi can see their assigned batches and fill in evaluation results (SESUAI or REVISI_BIRO) per SOP
  3. When Tim Evaluasi submits batch results: batch status becomes SELESAI; SESUAI SOPs move to SIAP_DIVERIFIKASI; REVISI_BIRO SOPs move to REVISI_DARI_TIM_EVALUASI
  4. Biro Organisasi can view completed batches ready for verification, with each SOP's evaluation result
  5. Biro Organisasi can view annual evaluation summary/recap per OPD
**Plans**: TBD

### Phase 7: TTE & Berita Acara
**Goal**: The sequential digital signing workflow is complete -- Biro signs BA, then Koordinator signs BA, then Kepala OPD endorses individual SOPs to BERLAKU
**Depends on**: Phase 6
**Requirements**: TTE-01, TTE-02, TTE-03, TTE-04, TTE-05, TTE-06, TTE-07, TTE-08
**Success Criteria** (what must be TRUE):
  1. A user can register their TTE profile (NIP, jabatan, pangkat, PIN) and verify their email before signing
  2. Biro Organisasi can sign a Berita Acara using PIN verification, and all SOPs in the batch automatically become DIVERIFIKASI_BIRO_ORGANISASI
  3. Koordinator Tim Penyusun can sign the BA only after Biro has signed; Kepala OPD can then endorse individual SOPs (status becomes BERLAKU) -- signing order is enforced
  4. Every signature is persisted as a TTESignature record with a document hash
  5. A user can view their own TTE signing history (audit trail)
**Plans**: TBD

### Phase 8: Audit Log
**Goal**: Every SOP status change is automatically tracked and queryable for accountability
**Depends on**: Phase 5 (SOP status transitions must exist)
**Requirements**: AUD-01, AUD-02, AUD-03
**Success Criteria** (what must be TRUE):
  1. When a SOP changes status (via any endpoint), an audit log entry is automatically created with actor, action, previous status, and new status
  2. Any user can view the complete status history of a specific SOP
  3. Biro Organisasi can query audit logs across all SOPs (with filtering)
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database & Infrastructure | 0/? | Not started | - |
| 2. Auth & Users | 0/? | Not started | - |
| 3. OPD & Peraturan | 0/? | Not started | - |
| 4. Tim Penyusun & Tim Evaluasi | 0/? | Not started | - |
| 5. SOP Core, Metadata & Pelaksana | 0/? | Not started | - |
| 6. Evaluasi & Verifikasi | 0/? | Not started | - |
| 7. TTE & Berita Acara | 0/? | Not started | - |
| 8. Audit Log | 0/? | Not started | - |

---
*Roadmap created: 2026-03-25*

# Phase 1 Context: Database & Infrastructure

**Created:** 2026-04-01
**Phase Goal:** Database MariaDB berjalan dengan skema domain lengkap (20 model, 12+ enum) yang menjadi fondasi semua modul berikutnya

---

## Decisions

### 1. Prisma Schema Structure

**Decision:** Single `schema.prisma` file dengan 20 model + 12+ enum, organized by domain

**Rationale:**
- Schema sudah ada di `server/prisma/schema.prisma` dengan 20 model lengkap
- Model sudah ter-grouping by domain (Master Data, SOP Domain, Workflow, TTE, Audit)
- Semua enum sudah didefinisikan (PeranPengguna, StatusSOP, StatusPeraturan, dll.)
- Menggunakan MySQL provider (kompatibel MariaDB)

**Code Context:**
```prisma
datasource db {
  provider = "mysql"  // Compatible with MariaDB
}

generator client {
  provider       = "prisma-client-js"
  output         = "../src/generated/prisma"
  jsModuleFormat = "cjs"
}
```

**Locked Choices:**
- Output Prisma client ke `src/generated/prisma` (bukan default `node_modules`)
- Format CJS untuk kompatibilitas NestJS
- 20 model: OPD, Pengguna, SOP, DetailSOP, Peraturan, LangkahSOP, DiagramLayout, DiagramNodePosition, DiagramEdge, DiagramEdgePoint, Pelaksana, DetailSOPPelaksana, AnggotaTimPenyusun, AnggotaTimEvaluasi, PengajuanEvaluasi, NilaiEvaluasi, LogNilaiEvaluasi, KredensialTTE, RiwayatTandaTangan, LogEditSOP
- 12+ enum: PeranPengguna, StatusSOP, JenisLangkahProsedur, SatuanWaktu, JenisDiagramSOP, CabangDiagramEdge, GayaPanah, StatusPeraturan, PeranTTE, BagianSOP, StatusTim, JenisPengajuanEvaluasi, StatusPengajuanEvaluasi, HasilEvaluasi, StatusKomentar, JenisLampiran

---

### 2. Delete Behavior Strategy

**Decision:** Cascade/Restrict/SetNull sesuai ERD-DESKRIPSI.md dengan explicit service layer cleanup untuk DiagramEdge + DiagramNodePosition

**Rationale:**
- ERD sudah specify delete behavior untuk setiap relasi
- DiagramNodePosition dan DiagramEdge pakai `Restrict` untuk avoid multi-path cascade deadlock
- Service layer wajib cleanup sebelum delete parent

**Code Context:**
```prisma
// DiagramNodePosition - Restrict untuk avoid deadlock
model DiagramNodePosition {
  diagramLayoutId String
  langkahSopId    String
  diagramLayout DiagramLayout @relation(fields: [diagramLayoutId], references: [id], onDelete: Cascade)
  langkahSOP    LangkahSOP    @relation(fields: [langkahSopId], references: [id], onDelete: Restrict)
  @@id([diagramLayoutId, langkahSopId])
}

// DiagramEdge - Restrict untuk both FK
model DiagramEdge {
  diagramLayoutId String
  dariLangkahId   String
  keLangkahId     String
  diagramLayout DiagramLayout @relation(fields: [diagramLayoutId], references: [id], onDelete: Cascade)
  dariLangkah   LangkahSOP    @relation("DiagramEdgeDari", fields: [dariLangkahId], references: [id], onDelete: Restrict)
  keLangkah     LangkahSOP    @relation("DiagramEdgeKe", fields: [keLangkahId], references: [id], onDelete: Restrict)
}
```

**Locked Choices:**
- Primary delete path untuk DiagramNodePosition/DiagramEdge adalah via DiagramLayout (Cascade)
- Service layer MUST delete DiagramEdge + DiagramNodePosition via DiagramLayout sebelum delete LangkahSOP
- Constraint [P0-A] di SCHEMA-CONSTRAINTS.md wajib di-enforce di service layer
- OPD, SOP, Peraturan pakai Restrict untuk prevent orphan data
- Soft-delete support via `deletedAt` field (OPD, Pengguna)

---

### 3. Index Strategy

**Decision:** Index semua FK + query pattern umum (opdId, status, userId, composite indexes)

**Rationale:**
- Performance optimization untuk query pattern yang sudah diidentifikasi di ERD
- Index pada FK untuk join performance
- Composite index untuk common filter combinations

**Code Context:**
```prisma
model Pengguna {
  // ... fields
  @@index([opdId])
  @@index([deletedAt])
  @@index([opdId, deletedAt])
}

model DetailSOP {
  // ... fields
  @@index([sopId, status])
  @@index([status])
  @@index([salinDariDetailSopId])
  @@index([dibuatOlehId])
  @@index([terakhirDieditOlehId])
}

model PengajuanEvaluasi {
  // ... fields
  @@index([opdId])
  @@index([status])
  @@index([jenis])
  @@index([diverifikasiOlehUserId])
  @@index([ditandatanganiOlehKoordinatorUserId])
  @@index([diselesaikanOlehId])
  @@index([opdId, status])
}
```

**Locked Choices:**
- Single column indexes: opdId, status, userId, deletedAt
- Composite indexes: [opdId, deletedAt], [sopId, status], [opdId, status]
- Index pada semua FK fields untuk join optimization
- Index pada status fields untuk filtering workflow

---

### 4. Unique Constraints

**Decision:** Enforce uniqueness via Prisma @@unique decorator untuk business constraints

**Rationale:**
- Prevent duplicate data di database level
- Beberapa constraint butuh composite unique keys
- Beberapa constraint lain butuh service layer enforcement (SELECT FOR UPDATE)

**Code Context:**
```prisma
// Peraturan - nomor + tahun unik per OPD
model Peraturan {
  // ... fields
  @@unique([opdId, nomor, tahun])
}

// DetailSOP - 1 SOP hanya 1 versi per nomor versi
model DetailSOP {
  // ... fields
  @@unique([sopId, versi])
  @@unique([nomorSOP])  // Global unique
}

// AnggotaTimPenyusun - 1 user hanya 1x per OPD
model AnggotaTimPenyusun {
  // ... fields
  @@unique([userId, opdId])
}

// AnggotaTimEvaluasi - 1 user hanya 1x global
model AnggotaTimEvaluasi {
  userId String @unique
}

// NilaiEvaluasi - 1 SOP hanya 1 nilai per pengajuan
model NilaiEvaluasi {
  // ... fields
  @@unique([pengajuanEvaluasiId, sopDetailId])
}

// DiagramLayout - 1 snapshot per SOP + jenis + versi
model DiagramLayout {
  // ... fields
  @@unique([sopDetailId, jenis, versiLayout])
}

// SopTerkait - M:N junction
model SopTerkait {
  // ... fields
  @@id([sopDetailId, sopTerkaitDetailId])
}

// DasarHukum - M:N junction
model DasarHukum {
  // ... fields
  @@id([sopDetailId, peraturanId])
}

// DetailSOPPelaksana - M:N junction
model DetailSOPPelaksana {
  // ... fields
  @@id([sopDetailId, pelaksanaId])
}

// DiagramNodePosition - 1 posisi per layout per langkah
model DiagramNodePosition {
  // ... fields
  @@id([diagramLayoutId, langkahSopId])
}

// DiagramEdgePoint - ordered points
model DiagramEdgePoint {
  // ... fields
  @@id([diagramEdgeId, urutan])
}
```

**Locked Choices:**
- Composite unique untuk junction tables (M:N relations)
- Global unique untuk nomorSOP (tidak per OPD)
- Unique per OPD untuk Peraturan [opdId, nomor, tahun]
- Unique userId untuk AnggotaTimEvaluasi (global, tidak terikat OPD)

---

### 5. Enum Values

**Decision:** Semua status fields menggunakan enum Prisma dengan values sesuai ERD

**Rationale:**
- Type safety di database dan Prisma client level
- Prevent invalid status values
- Self-documenting schema

**Code Context:**
```prisma
enum PeranPengguna {
  BIRO_ORGANISASI
  TIM_EVALUASI
  TIM_PENYUSUN
  KOORDINATOR_TIM_PENYUSUN
  KEPALA_OPD
}

enum StatusSOP {
  DRAFT
  SEDANG_DISUSUN
  SIAP_DIEVALUASI
  DIAJUKAN_EVALUASI
  SEDANG_DIEVALUASI
  REVISI_DARI_TIM_EVALUASI
  SIAP_DIVERIFIKASI
  DIVERIFIKASI_BIRO_ORGANISASI
  BERLAKU
  DIGANTIKAN
  DICABUT
}

enum StatusPengajuanEvaluasi {
  MENUNGGU_EVALUASI
  SEDANG_DIEVALUASI
  SELESAI_DIEVALUASI
  DIVERIFIKASI_BIRO
  DITANDATANGANI_KOORDINATOR
  SELESAI
}

enum HasilEvaluasi {
  SESUAI
  TIDAK_SESUAI
}

enum BagianSOP {
  METADATA
  LANGKAH_SOP
  LAMPIRAN_TEKS
  DASAR_HUKUM
  PELAKSANA
  DIAGRAM
  SOP_TERKAIT
}
```

**Locked Choices:**
- StatusSOP lifecycle lengkap (11 values) sesuai regulasi
- StatusPengajuanEvaluasi eksplisit (6 values) - bukan inferensi dari nullable fields
- HasilEvaluasi: SESUAI / TIDAK_SESUAI (bukan "Sesuai/Perlu Perbaikan")
- BagianSOP untuk LogEditSOP discriminator (7 values)
- Semua enum uppercase untuk consistency

---

### 6. Self-Referential Relations

**Decision:** Named relations dengan @relation decorator untuk self-referential FK

**Rationale:**
- Prisma requires named relations untuk multiple FK ke model yang sama
- Prevent ambiguity saat query
- Support untuk flowchart branching (DECISION type)

**Code Context:**
```prisma
model LangkahSOP {
  // ... fields
  langkahSelanjutnyaYaId    String?
  langkahSelanjutnyaTidakId String?

  langkahYa    LangkahSOP? @relation("LangkahYa", fields: [langkahSelanjutnyaYaId], references: [id], onDelete: SetNull)
  langkahTidak LangkahSOP? @relation("LangkahTidak", fields: [langkahSelanjutnyaTidakId], references: [id], onDelete: SetNull)
  langkahSebelumYa    LangkahSOP[] @relation("LangkahYa")
  langkahSebelumTidak LangkahSOP[] @relation("LangkahTidak")
}

model DetailSOP {
  // ... fields
  salinDariDetailSopId   String?
  salinDariDetailSop     DetailSOP?  @relation("DetailSOPSalinan", fields: [salinDariDetailSopId], references: [id], onDelete: SetNull)
  disalinKeDariSumberIni DetailSOP[] @relation("DetailSOPSalinan")

  relasiSopKeluar  SopTerkait[] @relation("RelasiSOP")
  relasiSopMasuk   SopTerkait[] @relation("RelasiSOPTerkait")
}

model SopTerkait {
  sopDetailId        String
  sopTerkaitDetailId String
  sop        DetailSOP @relation("RelasiSOP", fields: [sopDetailId], references: [id], onDelete: Cascade)
  sopTerkait DetailSOP @relation("RelasiSOPTerkait", fields: [sopTerkaitDetailId], references: [id], onDelete: Cascade)
}
```

**Locked Choices:**
- Named relations: "LangkahYa", "LangkahTidak", "DetailSOPSalinan", "RelasiSOP", "RelasiSOPTerkait"
- SetNull untuk self-referential FK (allow deletion without breaking chain)
- Support DECISION type dengan 2 cabang (Ya/Tidak)

---

### 7. Optimistic Locking

**Decision:** Field `version` Int untuk optimistic locking pada PengajuanEvaluasi dan NilaiEvaluasi

**Rationale:**
- Prevent lost update pada concurrent modification
- Required untuk constraint [P0-C] (maks 1 pengajuan aktif) dan [P0-E] (NilaiEvaluasi)
- Lightweight alternative to row-level locking

**Code Context:**
```prisma
model PengajuanEvaluasi {
  // ... fields
  /// Versi untuk optimistic locking — increment di setiap update status
  version Int @default(0)
}

model NilaiEvaluasi {
  // ... fields
  version Int @default(0)
}
```

**Locked Choices:**
- Version field type: Int (default 0)
- Service layer MUST increment version pada setiap UPDATE
- Update query MUST include version check: `WHERE id = ? AND version = ?`
- Version mismatch = conflict error (409 Conflict)

---

### 8. XOR Constraint for RiwayatTandaTangan

**Decision:** XOR constraint via service layer + CHECK constraint raw migration

**Rationale:**
- Database enforce untuk "tepat satu dari sopDetailId atau pengajuanEvaluasiId"
- Prisma tidak support XOR constraint native
- MySQL 8.0.16+ support CHECK constraint via raw SQL

**Code Context:**
```prisma
model RiwayatTandaTangan {
  // ... fields
  sopDetailId         String?
  pengajuanEvaluasiId String?
  // XOR: tepat satu harus diisi
}
```

**Locked Choices:**
- CHECK constraint via raw SQL migration:
  ```sql
  ALTER TABLE RiwayatTandaTangan ADD CONSTRAINT chk_tte_xor
    CHECK ((sopDetailId IS NULL) != (pengajuanEvaluasiId IS NULL));
  ```
- Service layer MUST validate before insert
- Unique constraint: [sopDetailId, peran] (aktif jika sopDetailId IS NOT NULL)
- Unique constraint: [pengajuanEvaluasiId, peran] (aktif jika pengajuanEvaluasiId IS NOT NULL)

---

### 9. Soft-Delete Support

**Decision:** `deletedAt` DateTime? field untuk OPD dan Pengguna dengan cascade validation

**Rationale:**
- Audit trail requirement - data tidak benar-benar hilang
- Support untuk constraint [P1-G] (validasi tidak ada pengajuan aktif)
- Prisma soft-delete pattern: filter `deletedAt: null` di queries

**Code Context:**
```prisma
model OPD {
  // ... fields
  deletedAt DateTime?
}

model Pengguna {
  // ... fields
  deletedAt DateTime?
}
```

**Locked Choices:**
- Only OPD and Pengguna have soft-delete
- deletedAt field type: DateTime? (nullable)
- Service layer MUST check for active pengajuan evaluasi before soft-delete
- Default queries MUST filter `deletedAt: null` (Prisma middleware atau explicit filter)
- Index on [deletedAt] dan [opdId, deletedAt] untuk performance

---

### 10. Audit Trail Tables

**Decision:** Immutable audit tables (LogEditSOP, LogNilaiEvaluasi) dengan createdAt-only timestamp

**Rationale:**
- Audit requirement - setiap perubahan harus tercatat
- Immutable = no updatedAt, only createdAt
- Append-only: setiap perubahan = baris baru

**Code Context:**
```prisma
model LogEditSOP {
  id        String   @id @default(uuid())
  sopDetailId String
  aktorId   String
  bagian    BagianSOP
  entityId  String?
  keterangan String? @db.Text
  createdAt DateTime @default(now())
  // NO updatedAt
}

model LogNilaiEvaluasi {
  id                  String         @id @default(uuid())
  pengajuanEvaluasiId String
  sopDetailId         String
  evaluatorId         String
  hasilSebelum        HasilEvaluasi?
  hasilSesudah        HasilEvaluasi?
  catatanSebelum      String?
  catatanSesudah      String?
  createdAt           DateTime       @default(now())
  // NO updatedAt
}
```

**Locked Choices:**
- No updatedAt field pada audit tables
- createdAt only (auto-set via @default(now()))
- Append-only: INSERT only, never UPDATE/DELETE
- LogEditSOP Cascade delete dengan DetailSOP (riwayat kolaborasi)
- LogNilaiEvaluasi Restrict delete (independent audit trail)

---

### 11. Diagram Hybrid Storage

**Decision:** Hybrid auto-layout + manual delta storage untuk DiagramLayout

**Rationale:**
- Auto-layout sebagai default (konsisten, cepat)
- Manual override disimpan sebagai delta (efisien)
- Support untuk A4 landscape pagination

**Code Context:**
```prisma
model DiagramLayout {
  id          String          @id @default(uuid())
  sopDetailId String
  jenis       JenisDiagramSOP
  versiLayout Int             @default(1)
  layoutSeed  Int             @default(0)  // Seed untuk auto-layout engine

  // Rendering config (bukan JSON - kolom terpisah)
  gayaPanah         GayaPanah?
  langkahPerHalaman Int?       @default(10)
  lebarAreaKegiatan Int?

  nodeOverrides DiagramNodePosition[]  // Delta posisi manual
  edgeOverrides DiagramEdge[]          // Delta routing manual
}

model DiagramNodePosition {
  diagramLayoutId String
  langkahSopId    String
  page      Int      @default(1)  // Untuk pagination
  x         Int
  y         Int
  @@id([diagramLayoutId, langkahSopId])
}
```

**Locked Choices:**
- layoutSeed Int untuk trigger re-layout (increment saat "Perbaiki Diagram")
- gayaPanah enum (STRAIGHT / ORTHOGONAL) - bukan JSON config
- langkahPerHalaman Int? (default 10) untuk pagination A4
- lebarAreaKegiatan Int? (px) untuk diagram rendering
- DiagramNodePosition hanya menyimpan manual override (baris kosong = auto-layout)
- Page field untuk pagination support

---

### 12. Migration Strategy

**Decision:** Clean baseline migration dengan squash untuk Phase 1

**Rationale:**
- Phase 1 = foundation, belum ada production data
- Squash migration = single clean baseline
- Avoid migration complexity di early stage

**Locked Choices:**
- Command: `prisma migrate dev --name init` untuk create baseline
- Generate Prisma client: `prisma generate`
- Target: MariaDB empty database
- Seed script via FakerJS untuk development data
- Migration file naming: `YYYYMMDDHHMMSS_init`
- No migration history to preserve (safe to squash)

---

## Code Context

### Existing Infrastructure

**Server Stack:**
- NestJS 11 + Prisma 7 + MariaDB
- JWT auth (passport-jwt, bcrypt)
- Swagger documentation (@nestjs/swagger)
- Winston logging
- ValidationPipe + ResponseInterceptor + ExceptionFilter

**Prisma Schema Status:**
- 20 models implemented di `server/prisma/schema.prisma`
- 12+ enums defined
- All FK relationships with @relation decorators
- Index strategy implemented
- Delete behavior specified (Cascade/Restrict/SetNull)

**Swagger Auto-Generation:**
- Already configured in `server/src/main.ts`
- Endpoint: `/docs` for Swagger UI
- OpenAPI JSON: `/docs-json`
- Decorators used: @ApiTags, @ApiOperation, @ApiResponse, @ApiProperty

### Modules to Build

**Phase 1 does NOT build modules** - hanya database infrastructure:
- Prisma schema finalization
- Migration execution
- Prisma client generation
- Seed script development

**Modules akan dibangun di phases berikutnya:**
- Phase 2: Auth & Users module
- Phase 3: OPD & Peraturan modules
- Phase 4: Tim Penyusun & Tim Evaluasi modules
- Phase 5: SOP Core module
- Phase 6: Evaluasi module
- Phase 7: TTE module
- Phase 8: Audit Log module

### Prisma Client Usage Pattern

**Import:**
```typescript
import { PrismaClient } from './generated/prisma';
// NOT: import { PrismaClient } from '@prisma/client';
```

**Transaction Pattern:**
```typescript
await prisma.$transaction(async (tx) => {
  // SELECT FOR UPDATE for constraints
  const lock = await tx.$executeRaw`
    SELECT * FROM Pengguna WHERE opdId = ${opdId} AND peran = 'KEPALA_OPD' FOR UPDATE
  `;
  // ... operations
});
```

**Soft-Delete Filter:**
```typescript
await prisma.opd.findMany({
  where: { deletedAt: null }
});
```

---

## Deferred Ideas

**Not in Phase 1 scope:**
- Module implementation (Phase 2-8)
- API endpoint design (Phase 2-8)
- Authentication wiring (Phase 2)
- Business logic validation (Phase 2-8)
- Testing strategy implementation (Phase 2-8)
- CI/CD pipeline (v2.0)
- PDF/Excel export (v2.0)
- Real-time notifications (v2.0)

**Noted for Later:**
- Multi-tenant support (v2.0)
- Mobile app (v2.0)
- Custom workflow approval (v2.0)
- SLA/deadline tracking (v2.0)

---

## Success Criteria Validation

**Phase 1 Success Criteria (from ROADMAP.md):**

| # | Criteria | Status |
|---|----------|--------|
| 1 | `prisma migrate dev` runs clean pada empty MariaDB | ✅ Schema ready |
| 2 | Semua FK relationships enforced | ✅ @relation decorators |
| 3 | Semua enum fields only accept defined values | ✅ 12+ enums defined |
| 4 | `prisma generate` produces usable client | ✅ Output path configured |
| 5 | Delete behavior sesuai ERD | ✅ Cascade/Restrict/SetNull |
| 6 | Index strategy terpasang | ✅ All FK + query pattern indexes |

---

## Next Steps

**Ready for:**
1. **Research** - Validate MariaDB compatibility dengan Prisma 7, test CHECK constraint syntax
2. **Planning** - Create 01-02-PLAN.md untuk migration execution + seed script

**Not yet:**
- Module implementation (Phase 2+)
- API design (Phase 2+)
- Testing (Phase 2+)

---

*Context created: 2026-04-01*
*Decisions locked for Phase 1 implementation*

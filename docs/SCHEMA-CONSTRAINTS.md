# Schema Constraints — Di Luar Prisma

Dokumen ini mencatat semua constraint bisnis yang tidak bisa atau tidak di-enforce langsung
di Prisma schema, beserta cara enforcement yang benar.

---

## [P0] Status Transition Guard

### DetailSOP.status
Transisi yang VALID:
```
DRAFT → SEDANG_DISUSUN
SEDANG_DISUSUN → SIAP_DIEVALUASI
SIAP_DIEVALUASI → DIAJUKAN_EVALUASI
DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI
SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI | SIAP_DIVERIFIKASI
REVISI_DARI_TIM_EVALUASI → SEDANG_DISUSUN
SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI
DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU
BERLAKU → DICABUT
```
`BERLAKU` dan `DICABUT` adalah **terminal** — tidak bisa diubah.

Enforcement di service layer:
```typescript
const VALID_TRANSITIONS: Record<StatusSOP, StatusSOP[]> = {
  DRAFT: ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN: ['SIAP_DIEVALUASI'],
  SIAP_DIEVALUASI: ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI: ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI: ['REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI'],
  REVISI_DARI_TIM_EVALUASI: ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI: ['DIVERIFIKASI_BIRO_ORGANISASI'],
  DIVERIFIKASI_BIRO_ORGANISASI: ['BERLAKU'],
  BERLAKU: ['DICABUT'],
  DICABUT: [],
}

function assertValidTransition(current: StatusSOP, next: StatusSOP) {
  if (!VALID_TRANSITIONS[current].includes(next)) {
    throw new Error(`Transisi status tidak valid: ${current} → ${next}`)
  }
}
```

Enforcement di DB (tambahkan via raw migration untuk defense-in-depth):
```sql
DELIMITER $$
CREATE TRIGGER trg_detailsop_status_transition
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF OLD.status IN ('BERLAKU', 'DICABUT') AND NEW.status != OLD.status THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'SOP terminal tidak bisa diubah statusnya';
  END IF;
END$$
DELIMITER ;
```

### PengajuanEvaluasi.status
Transisi yang VALID:
```
MENUNGGU_EVALUASI → SEDANG_DIEVALUASI
SEDANG_DIEVALUASI → SELESAI_DIEVALUASI
SELESAI_DIEVALUASI → DIVERIFIKASI_BIRO
DIVERIFIKASI_BIRO → DITANDATANGANI_KOORDINATOR
DITANDATANGANI_KOORDINATOR → SELESAI
```
`SELESAI` adalah **terminal**.

---

## [P0] LogAudit Immutability

`LogAudit` menggunakan `onDelete: Restrict` — DetailSOP yang punya LogAudit **tidak bisa di-hard delete**.
Gunakan soft-delete pada DetailSOP (tambahkan `deletedAt DateTime?`) jika perlu "menghapus" dokumen.

---

## [P1] TTE XOR Constraint

`RiwayatTandaTangan` harus memiliki tepat satu dari `sopDetailId` atau `pengajuanEvaluasiId` (bukan keduanya, bukan keduanya null).

Tambahkan via raw migration:
```sql
ALTER TABLE TandaTanganTTE ADD CONSTRAINT chk_tte_xor
  CHECK (
    (sopDetailId IS NOT NULL AND pengajuanEvaluasiId IS NULL)
    OR
    (sopDetailId IS NULL AND pengajuanEvaluasiId IS NOT NULL)
  );
```

Enforcement di service layer:
```typescript
function assertTTETarget(sopDetailId?: string, pengajuanEvaluasiId?: string) {
  const filled = [sopDetailId, pengajuanEvaluasiId].filter(Boolean).length
  if (filled !== 1) throw new Error('TTE harus merujuk tepat satu dokumen')
}
```

---

## [P1] Double Submit PengajuanEvaluasi

Maks 1 pengajuan aktif per OPD per jenis. Enforcement di service layer:

```typescript
async function ajukanEvaluasi(opdId: string, jenis: JenisPengajuanEvaluasi) {
  return prisma.$transaction(async (tx) => {
    // Lock + check existing active submission
    const existing = await tx.$queryRaw`
      SELECT id FROM PengajuanEvaluasi
      WHERE opdId = ${opdId}
        AND jenis = ${jenis}
        AND status NOT IN ('SELESAI')
      FOR UPDATE
    `
    if (existing.length > 0) {
      throw new Error('Sudah ada pengajuan evaluasi aktif untuk OPD ini')
    }
    return tx.pengajuanEvaluasi.create({ data: { opdId, jenis, ... } })
  })
}
```

---

## [P2] Constraint 1 KEPALA_OPD dan 1 KOORDINATOR per OPD

MySQL tidak mendukung partial unique index dengan WHERE clause via Prisma.
Enforcement di service layer dengan SELECT FOR UPDATE:

```typescript
async function createOrUpdatePengguna(data: CreatePenggunaDto) {
  if (['KEPALA_OPD', 'KOORDINATOR_TIM_PENYUSUN'].includes(data.peran)) {
    if (!data.opdId) throw new Error('Peran ini membutuhkan opdId')

    return prisma.$transaction(async (tx) => {
      // Lock semua pengguna aktif di OPD ini dengan peran yang sama
      const existing = await tx.$queryRaw`
        SELECT id FROM Pengguna
        WHERE opdId = ${data.opdId}
          AND peran = ${data.peran}
          AND deletedAt IS NULL
        FOR UPDATE
      `
      if (existing.length > 0) {
        throw new Error(`OPD sudah memiliki ${data.peran}`)
      }
      return tx.pengguna.create({ data })
    })
  }
}
```

---

## [P2] Soft Delete Filter

Prisma tidak otomatis filter `deletedAt IS NULL`. Tambahkan middleware:

```typescript
// prisma.service.ts atau prisma.extension.ts
prisma.$use(async (params, next) => {
  const softDeleteModels = ['Pengguna', 'OPD']
  if (softDeleteModels.includes(params.model ?? '')) {
    if (['findMany', 'findFirst', 'count', 'aggregate'].includes(params.action)) {
      params.args ??= {}
      params.args.where = { deletedAt: null, ...params.args.where }
    }
  }
  return next(params)
})
```

Untuk `findUnique` dan `update`, filter harus ditambahkan manual di service:
```typescript
prisma.pengguna.findUnique({ where: { id, deletedAt: null } })
```

---

## [P2] Tenant Isolation (OPD sebagai tenant)

Tidak ada RLS di MySQL. Setiap query yang menyajikan data ke user harus menyertakan filter `opdId`.

Tabel yang TIDAK punya `opdId` langsung dan perlu JOIN:
- `NilaiEvaluasi` → via `PengajuanEvaluasi.opdId`
- `LogNilaiEvaluasi` → via `PengajuanEvaluasi.opdId`
- `LangkahSOP` → via `DetailSOP → SOP → OPD`
- `RiwayatTandaTangan` → via `sopDetail.sop.opdId` atau `pengajuanEvaluasi.opdId`

Rekomendasi: Buat helper di repository layer:
```typescript
// Selalu pass opdId dari JWT, bukan dari request body
function withOpdFilter<T>(query: T, opdId: string): T & { where: { opdId: string } } {
  return { ...query, where: { ...query.where, opdId } }
}
```

---

## [P1] nilaiOPD Hanya Berlaku untuk Evaluasi TERJADWAL

`PengajuanEvaluasi.nilaiOPD` adalah nilai agregat OPD yang **hanya ada pada evaluasi TERJADWAL**.
Evaluasi MANDIRI tidak memiliki nilai OPD — field ini harus selalu `null` untuk MANDIRI.

### Aturan

| `jenis`     | `nilaiOPD`                   |
|-------------|------------------------------|
| TERJADWAL   | Wajib diisi saat SELESAI     |
| MANDIRI     | Harus selalu `null`          |

### MySQL CHECK Constraint (jalankan saat migration)

```sql
ALTER TABLE PengajuanEvaluasi
  ADD CONSTRAINT chk_nilai_opd_only_terjadwal
  CHECK (
    jenis = 'MANDIRI' AND nilaiOPD IS NULL
    OR
    jenis = 'TERJADWAL'
  );
```

> Constraint ini memastikan MANDIRI tidak bisa punya nilaiOPD.
> TERJADWAL boleh NULL dulu (saat masih berjalan), wajib diisi hanya saat status → SELESAI.

### Service Layer Guard

```typescript
// Saat mengisi/update nilaiOPD
function validateNilaiOPD(jenis: JenisPengajuanEvaluasi, nilaiOPD: number | null) {
  if (jenis === 'MANDIRI' && nilaiOPD !== null) {
    throw new BadRequestException('Evaluasi MANDIRI tidak memiliki nilai OPD')
  }
}

// Saat menyelesaikan evaluasi (status → SELESAI)
function validateSelesaiEvaluasi(jenis: JenisPengajuanEvaluasi, nilaiOPD: number | null) {
  if (jenis === 'TERJADWAL' && nilaiOPD === null) {
    throw new BadRequestException('Evaluasi TERJADWAL wajib mengisi nilai OPD sebelum diselesaikan')
  }
}
```

---

## [P0] NilaiEvaluasi Optimistic Locking

`NilaiEvaluasi` kini punya field `version`. Setiap UPDATE nilai **wajib** menyertakan version check:

```typescript
async function isiNilaiEvaluasi(id: string, version: number, data: UpdateNilaiDto) {
  try {
    return await prisma.nilaiEvaluasi.update({
      where: { id, version },   // version mismatch → throw NotFoundError
      data: {
        ...data,
        version: { increment: 1 },
        dinilaiOlehId: currentUserId,
      }
    })
  } catch (e) {
    if (e.code === 'P2025') throw new ConflictException('Nilai sudah diubah evaluator lain, refresh dan coba lagi')
    throw e
  }
}
```

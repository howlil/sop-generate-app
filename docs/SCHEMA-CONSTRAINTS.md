# Schema Constraints — Di Luar Prisma

Dokumen ini mencatat semua constraint bisnis yang tidak bisa atau tidak di-enforce langsung
di Prisma schema, beserta cara enforcement yang benar (service layer, trigger MySQL, atau raw SQL).

Setiap item diberi label severity: **[P0]** kritis, **[P1]** tinggi, **[P2]** sedang, **[P3]** rendah.

---

## Daftar Isi

- [P0-A] Multi-path Cascade — DiagramEdge & DiagramNodePosition
- [P0-B] Satu Versi BERLAKU per SOP
- [P0-C] Double Submit PengajuanEvaluasi (Race Condition)
- [P0-D] Status Transition Guard
- [P0-E] NilaiEvaluasi Optimistic Locking
- [P0-F] LogEditSOP Immutability
- [P1-A] TTE XOR Constraint
- [P1-B] nilaiOPD Hanya untuk Evaluasi TERJADWAL
- [P1-C] Cross-SOP Contamination (Diagram & Pelaksana)
- [P1-D] PeranTTE vs PeranPengguna — Validasi Kompatibilitas
- [P1-E] NilaiEvaluasi Lintas OPD
- [P1-F] berakhirPada vs status — Konsistensi Tim
- [P1-G] Soft Delete — Deaktivasi Relasi
- [P2-A] TERMINATOR/TASK/DECISION — Node Flow Constraint
- [P2-B] Superseded Version — Transisi BERLAKU → DIGANTIKAN
- [P2-C] Field Temporal vs Status — Temporal Ordering
- [P2-D] Constraint 1 KEPALA_OPD dan 1 KOORDINATOR per OPD
- [P2-E] SopTerkait — Self-Reference & Duplikat Dua Arah
- [P2-F] Peraturan DICABUT Tidak Boleh Dijadikan DasarHukum
- [P2-G] Soft Delete Filter (Prisma Middleware)
- [P2-H] Tenant Isolation (OPD sebagai Tenant)
- [P3-A] Circular Reference LangkahSOP
- [P3-B] nomorSOP dan Operasi Salin
- [P3-C] Audit Coverage — LogEditSOP dan LogNilaiEvaluasi

---

## [P0-A] Multi-path Cascade — DiagramEdge & DiagramNodePosition

### Masalah

`DiagramNodePosition` dan `DiagramEdge` memiliki FK ke dua parent berbeda yang keduanya berakar
ke `DetailSOP` yang sama. Ini menciptakan multi-path cascade:

```
DetailSOP ─Cascade→ LangkahSOP ─(Cascade LAMA)→ DiagramNodePosition
DetailSOP ─Cascade→ DiagramLayout ─Cascade→      DiagramNodePosition  ← path ke-2
```

Jika kedua path aktif, MySQL InnoDB bisa deadlock saat mencoba mengunci baris
`DiagramNodePosition` dari dua arah dalam satu transaksi.

### Fix di Schema

`DiagramNodePosition.langkahSOP`, `DiagramEdge.dariLangkah`, dan `DiagramEdge.keLangkah`
sekarang menggunakan `onDelete: Restrict`. Primary delete path hanya via `DiagramLayout`.

### Urutan Delete yang WAJIB di Service Layer

Setiap kali menghapus `DetailSOP`, gunakan transaksi dengan urutan:

```typescript
async function hapusDetailSOP(sopDetailId: string) {
  await prisma.$transaction(async (tx) => {
    // 1. Hapus titik edge dulu (anak dari DiagramEdge)
    await tx.diagramEdgePoint.deleteMany({
      where: { diagramEdge: { diagramLayout: { sopDetailId } } },
    })

    // 2. Hapus semua edge diagram (anak dari DiagramLayout)
    await tx.diagramEdge.deleteMany({
      where: { diagramLayout: { sopDetailId } },
    })

    // 3. Hapus posisi node (anak dari DiagramLayout)
    await tx.diagramNodePosition.deleteMany({
      where: { diagramLayout: { sopDetailId } },
    })

    // 4. Sekarang aman hapus DetailSOP — cascade ke:
    //    LangkahSOP, DiagramLayout, LampiranTeks, DasarHukum, DetailSOPPelaksana, SopTerkait
    //    (DiagramEdge/NodePosition sudah kosong, tidak ada Restrict yang terpicu)
    await tx.detailSOP.delete({ where: { id: sopDetailId } })
  })
}
```

Hal yang sama berlaku saat menghapus `LangkahSOP` individual:
```typescript
async function hapusLangkahSOP(langkahId: string) {
  await prisma.$transaction(async (tx) => {
    // Hapus edge yang merujuk langkah ini (sebagai sumber atau tujuan)
    await tx.diagramEdgePoint.deleteMany({
      where: { diagramEdge: { OR: [{ dariLangkahId: langkahId }, { keLangkahId: langkahId }] } },
    })
    await tx.diagramEdge.deleteMany({
      where: { OR: [{ dariLangkahId: langkahId }, { keLangkahId: langkahId }] },
    })
    await tx.diagramNodePosition.deleteMany({ where: { langkahSopId: langkahId } })
    await tx.langkahSOP.delete({ where: { id: langkahId } })
  })
}
```

---

## [P0-B] Satu Versi BERLAKU per SOP

### Masalah

`DetailSOP` memiliki status `BERLAKU` dan `@@unique([sopId, versi])`, tapi tidak ada constraint
yang mencegah dua `DetailSOP` dengan `sopId` sama memiliki `status = BERLAKU` bersamaan.
MySQL tidak mendukung partial unique index (`WHERE status = 'BERLAKU'`) via Prisma.

### Fix — MySQL Trigger

Jalankan via raw migration setelah `prisma migrate`:

```sql
DELIMITER $$
CREATE TRIGGER trg_satu_berlaku_per_sop
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status = 'BERLAKU' AND OLD.status != 'BERLAKU' THEN
    IF EXISTS (
      SELECT 1 FROM DetailSOP
      WHERE sopId = NEW.sopId
        AND status = 'BERLAKU'
        AND id != NEW.id
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'SOP sudah memiliki versi BERLAKU. Tetapkan versi lama ke DIGANTIKAN dulu.';
    END IF;
  END IF;
END$$
DELIMITER ;
```

### Fix — Service Layer (wajib bersamaan dengan trigger)

Saat meng-approve versi baru ke BERLAKU, lakukan dalam satu transaksi:

```typescript
async function berlakukanVersi(detailSopId: string, aktorId: string) {
  await prisma.$transaction(async (tx) => {
    const detail = await tx.detailSOP.findUniqueOrThrow({ where: { id: detailSopId } })

    // Ubah versi lama BERLAKU → DIGANTIKAN
    await tx.detailSOP.updateMany({
      where: { sopId: detail.sopId, status: 'BERLAKU', id: { not: detailSopId } },
      data: { status: 'DIGANTIKAN' },
    })

    // Berlakukan versi ini
    await tx.detailSOP.update({
      where: { id: detailSopId },
      data: { status: 'BERLAKU', tanggalEfektif: new Date() },
    })

    // Catat di log audit
    await tx.logAudit.create({
      data: {
        sopDetailId: detailSopId,
        aksi: 'SAHKAN_SOP',
        aktorId,
        peranAktor: 'BIRO_ORGANISASI',
        statusSebelum: detail.status,
        statusSesudah: 'BERLAKU',
      },
    })
  })
}
```

---

## [P0-C] Double Submit PengajuanEvaluasi (Race Condition)

### Masalah

Maks 1 pengajuan aktif per OPD per jenis. `SELECT FOR UPDATE` biasa tidak cukup karena
gap lock tidak mencegah concurrent INSERT ke baris yang belum ada.

### Fix — Tabel Sentinel

Buat tabel sentinel via raw migration:

```sql
CREATE TABLE KunciPengajuanEvaluasi (
  opdId VARCHAR(36) NOT NULL,
  jenis ENUM('TERJADWAL', 'MANDIRI') NOT NULL,
  pengajuanEvaluasiId VARCHAR(36) NOT NULL,
  PRIMARY KEY (opdId, jenis),
  CONSTRAINT fk_kunci_pengajuan
    FOREIGN KEY (pengajuanEvaluasiId) REFERENCES PengajuanEvaluasi(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
```

> Catatan: Tabel ini tidak perlu ada di Prisma schema karena hanya diakses via `$queryRaw`.
> `ON DELETE CASCADE` memastikan kunci otomatis terhapus saat PengajuanEvaluasi selesai (SELESAI)
> atau dihapus.

```typescript
async function buatPengajuanEvaluasi(opdId: string, jenis: string, data: CreatePengajuanDto) {
  return prisma.$transaction(async (tx) => {
    // INSERT sentinel — akan gagal dengan unique violation jika sudah ada
    try {
      const pengajuan = await tx.pengajuanEvaluasi.create({ data: { opdId, jenis, ...data } })
      await tx.$executeRaw`
        INSERT INTO KunciPengajuanEvaluasi (opdId, jenis, pengajuanEvaluasiId)
        VALUES (${opdId}, ${jenis}, ${pengajuan.id})
      `
      return pengajuan
    } catch (e) {
      if (e.code === 'P2002' || (e.message as string).includes('Duplicate entry')) {
        throw new ConflictException('Sudah ada pengajuan evaluasi aktif untuk OPD ini')
      }
      throw e
    }
  })
}

// Hapus sentinel saat pengajuan selesai (atau gunakan FK CASCADE dari hapus pengajuan)
async function selesaikanPengajuan(pengajuanId: string) {
  await prisma.$transaction(async (tx) => {
    const pe = await tx.pengajuanEvaluasi.findUniqueOrThrow({ where: { id: pengajuanId } })
    await tx.$executeRaw`
      DELETE FROM KunciPengajuanEvaluasi WHERE opdId = ${pe.opdId} AND jenis = ${pe.jenis}
    `
    await tx.pengajuanEvaluasi.update({
      where: { id: pengajuanId, version: pe.version },
      data: { status: 'SELESAI', version: { increment: 1 } },
    })
  })
}
```

---

## [P0-D] Status Transition Guard

### DetailSOP.status

Transisi yang VALID (termasuk `DIGANTIKAN`):
```
DRAFT → SEDANG_DISUSUN
SEDANG_DISUSUN → SIAP_DIEVALUASI
SIAP_DIEVALUASI → DIAJUKAN_EVALUASI
DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI
SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI | SIAP_DIVERIFIKASI
REVISI_DARI_TIM_EVALUASI → SEDANG_DISUSUN
SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI
DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU
BERLAKU → DIGANTIKAN | DICABUT   ← DIGANTIKAN diset otomatis, DICABUT oleh aktor
DIGANTIKAN → (terminal)
DICABUT → (terminal)
```

`DIGANTIKAN`, dan `DICABUT` adalah terminal — tidak bisa diubah ke status lain.

Service layer:
```typescript
const VALID_TRANSITIONS: Record<StatusSOP, StatusSOP[]> = {
  DRAFT:                        ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN:               ['SIAP_DIEVALUASI'],
  SIAP_DIEVALUASI:              ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI:            ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI:            ['REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI'],
  REVISI_DARI_TIM_EVALUASI:     ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI:            ['DIVERIFIKASI_BIRO_ORGANISASI'],
  DIVERIFIKASI_BIRO_ORGANISASI: ['BERLAKU'],
  BERLAKU:                      ['DIGANTIKAN', 'DICABUT'],
  DIGANTIKAN:                   [],
  DICABUT:                      [],
}

function assertValidTransition(current: StatusSOP, next: StatusSOP) {
  if (!VALID_TRANSITIONS[current].includes(next)) {
    throw new BadRequestException(`Transisi status tidak valid: ${current} → ${next}`)
  }
}
```

MySQL trigger untuk defense-in-depth:
```sql
DELIMITER $$
CREATE TRIGGER trg_detailsop_status_transition
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status != OLD.status AND OLD.status IN ('DIGANTIKAN', 'DICABUT') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Status terminal SOP tidak bisa diubah';
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
`SELESAI` adalah terminal. Gunakan optimistic locking via `version` di setiap UPDATE status.

---

## [P0-E] NilaiEvaluasi Optimistic Locking

`NilaiEvaluasi` punya field `version`. Setiap UPDATE nilai **wajib** menyertakan version check:

```typescript
async function isiNilaiEvaluasi(id: string, version: number, data: UpdateNilaiDto, currentUserId: string) {
  try {
    return await prisma.nilaiEvaluasi.update({
      where: { id, version },
      data: {
        ...data,
        version: { increment: 1 },
        dinilaiOlehId: currentUserId,
      },
    })
  } catch (e) {
    if (e.code === 'P2025') {
      throw new ConflictException('Nilai sudah diubah evaluator lain, refresh dan coba lagi')
    }
    throw e
  }
}
```

Sama untuk `PengajuanEvaluasi.version` — setiap update status wajib sertakan version check:
```typescript
await prisma.pengajuanEvaluasi.update({
  where: { id, version },
  data: { status: nextStatus, version: { increment: 1 } },
})
```

---

## [P0-F] LogEditSOP Immutability

`LogEditSOP` adalah append-only — jangan pernah UPDATE atau DELETE baris log secara individual.
`DetailSOP` yang dihapus akan men-Cascade hapus semua log-nya (ini disengaja — log kolaborasi
bukan dokumen legal). Yang wajib dijaga: **service layer tidak boleh mengekspos endpoint
DELETE/UPDATE pada LogEditSOP**. Log hanya bisa dibuat, tidak bisa diedit.

---

## [P1-A] TTE XOR Constraint

`RiwayatTandaTangan` harus memiliki tepat satu dari `sopDetailId` atau `pengajuanEvaluasiId`.

Raw migration:
```sql
ALTER TABLE TandaTanganTTE ADD CONSTRAINT chk_tte_xor
  CHECK (
    (sopDetailId IS NOT NULL AND pengajuanEvaluasiId IS NULL)
    OR
    (sopDetailId IS NULL AND pengajuanEvaluasiId IS NOT NULL)
  );
```

Service layer:
```typescript
function assertTTETarget(sopDetailId?: string, pengajuanEvaluasiId?: string) {
  const filled = [sopDetailId, pengajuanEvaluasiId].filter(Boolean).length
  if (filled !== 1) throw new BadRequestException('TTE harus merujuk tepat satu dokumen')
}
```

**Catatan unique constraint & NULL:** `@@unique([sopDetailId, peran])` hanya efektif
ketika `sopDetailId IS NOT NULL` (TTE SOP). Saat `pengajuanEvaluasiId IS NOT NULL`,
`@@unique([pengajuanEvaluasiId, peran])` yang aktif. Kombinasi keduanya bersama XOR
constraint memastikan tidak ada duplikat tanda tangan.

---

## [P1-B] nilaiOPD Hanya untuk Evaluasi TERJADWAL

| `jenis`   | `nilaiOPD`              |
|-----------|-------------------------|
| TERJADWAL | Wajib diisi saat SELESAI|
| MANDIRI   | Harus selalu `null`     |

Raw migration CHECK constraint:
```sql
ALTER TABLE PengajuanEvaluasi
  ADD CONSTRAINT chk_nilai_opd_only_terjadwal
  CHECK (
    (jenis = 'MANDIRI' AND nilaiOPD IS NULL)
    OR jenis = 'TERJADWAL'
  );
```

Service layer:
```typescript
function validateNilaiOPD(jenis: JenisPengajuanEvaluasi, nilaiOPD: number | null) {
  if (jenis === 'MANDIRI' && nilaiOPD !== null) {
    throw new BadRequestException('Evaluasi MANDIRI tidak memiliki nilai OPD')
  }
}

function validateSelesaiEvaluasi(jenis: JenisPengajuanEvaluasi, nilaiOPD: number | null) {
  if (jenis === 'TERJADWAL' && nilaiOPD === null) {
    throw new BadRequestException('Evaluasi TERJADWAL wajib mengisi nilai OPD sebelum diselesaikan')
  }
}
```

---

## [P1-C] Cross-SOP Contamination (Diagram & Pelaksana)

### Masalah A — DiagramEdge/NodePosition lintas SOP

Tidak ada FK yang memastikan `DiagramEdge.dariLangkahId` / `keLangkahId` dan
`DiagramNodePosition.langkahSopId` berasal dari `DetailSOP` yang sama dengan `DiagramLayout`.

Service layer — validasi saat INSERT/UPDATE diagram:
```typescript
async function validateDiagramIntegrity(diagramLayoutId: string, langkahSopId: string) {
  const [layout, langkah] = await Promise.all([
    prisma.diagramLayout.findUniqueOrThrow({ where: { id: diagramLayoutId } }),
    prisma.langkahSOP.findUniqueOrThrow({ where: { id: langkahSopId } }),
  ])
  if (layout.sopDetailId !== langkah.sopDetailId) {
    throw new BadRequestException('LangkahSOP tidak berasal dari DetailSOP yang sama dengan DiagramLayout')
  }
}
```

### Masalah B — LangkahSOP.pelaksanaId tidak ada di swimlane

`LangkahSOP.pelaksanaId` bisa merujuk `Pelaksana` yang tidak terdaftar di `DetailSOPPelaksana`
untuk `DetailSOP` yang sama — diagram akan punya kolom pelaksana yang tidak ada di header.

Service layer — validasi saat INSERT/UPDATE LangkahSOP:
```typescript
async function validatePelaksanaInSwimlane(sopDetailId: string, pelaksanaId: string) {
  const ada = await prisma.detailSOPPelaksana.findUnique({
    where: { sopDetailId_pelaksanaId: { sopDetailId, pelaksanaId } },
  })
  if (!ada) {
    throw new BadRequestException('Pelaksana belum terdaftar di swimlane SOP ini. Tambahkan ke DetailSOPPelaksana dulu.')
  }
}
```

---

## [P1-D] PeranTTE vs PeranPengguna — Validasi Kompatibilitas

`KredensialTTE.peran` (enum `PeranTTE`) tidak secara otomatis divalidasi terhadap
`Pengguna.peran` (enum `PeranPengguna`). Seorang `TIM_EVALUASI` bisa mendapat
`KredensialTTE.peran = KEPALA_OPD` jika tidak divalidasi.

Mapping yang VALID:
```typescript
const VALID_TTE_PERAN: Record<PeranPengguna, PeranTTE | null> = {
  KEPALA_OPD:                 'KEPALA_OPD',
  KOORDINATOR_TIM_PENYUSUN:   'KOORDINATOR_TIM_PENYUSUN',
  BIRO_ORGANISASI:            'BIRO_ORGANISASI',
  TIM_EVALUASI:               null,  // tidak boleh punya KredensialTTE
  TIM_PENYUSUN:               null,  // tidak boleh punya KredensialTTE
}

async function buatKredensialTTE(userId: string, peranTTE: PeranTTE, ...) {
  const pengguna = await prisma.pengguna.findUniqueOrThrow({ where: { id: userId } })
  const allowed = VALID_TTE_PERAN[pengguna.peran]
  if (!allowed || allowed !== peranTTE) {
    throw new ForbiddenException(`Pengguna dengan peran ${pengguna.peran} tidak bisa memiliki kredensial TTE ${peranTTE}`)
  }
  // ... lanjut buat KredensialTTE
}
```

Validasi yang sama saat membuat `RiwayatTandaTangan`:
```typescript
async function validateTTEAktor(userId: string, peranTTE: PeranTTE) {
  const pengguna = await prisma.pengguna.findUniqueOrThrow({
    where: { id: userId },
    include: { kredensialTTE: true },
  })
  if (!pengguna.kredensialTTE || pengguna.kredensialTTE.peran !== peranTTE) {
    throw new ForbiddenException('Pengguna tidak berwenang TTE dengan peran ini')
  }
}
```

---

## [P1-E] NilaiEvaluasi Lintas OPD

`NilaiEvaluasi` referensi `PengajuanEvaluasi` (yang punya `opdId`) dan `DetailSOP`
(yang punya `SOP.opdId`). Tidak ada constraint yang memastikan keduanya OPD yang sama.

Service layer — wajib validasi saat INSERT NilaiEvaluasi:
```typescript
async function validateNilaiEvaluasiScope(pengajuanEvaluasiId: string, sopDetailId: string) {
  const [pe, detail] = await Promise.all([
    prisma.pengajuanEvaluasi.findUniqueOrThrow({ where: { id: pengajuanEvaluasiId } }),
    prisma.detailSOP.findUniqueOrThrow({ where: { id: sopDetailId }, include: { sop: true } }),
  ])
  if (pe.opdId !== detail.sop.opdId) {
    throw new BadRequestException('DetailSOP tidak berasal dari OPD yang sama dengan PengajuanEvaluasi')
  }
}
```

---

## [P1-F] berakhirPada vs status — Konsistensi Tim

`AnggotaTimPenyusun` dan `AnggotaTimEvaluasi` punya dua field yang merepresentasikan
status keanggotaan: `status StatusTim` dan `berakhirPada DateTime?`.

**Invariant:** `(status = AKTIF) ↔ (berakhirPada IS NULL)`

Jika `berakhirPada` diisi, `status` harus NONAKTIF, dan sebaliknya.

Enforcement di service layer — selalu update keduanya bersamaan:
```typescript
// Nonaktifkan anggota
async function nonaktifkanAnggotaTimPenyusun(id: string) {
  await prisma.anggotaTimPenyusun.update({
    where: { id },
    data: { status: 'NONAKTIF', berakhirPada: new Date() },
  })
}

// Aktifkan kembali
async function aktifkanKembaliAnggota(id: string) {
  await prisma.anggotaTimPenyusun.update({
    where: { id },
    data: { status: 'AKTIF', berakhirPada: null },
  })
}

// Query anggota aktif — selalu gunakan status, bukan berakhirPada
const aktif = await prisma.anggotaTimPenyusun.findMany({
  where: { opdId, status: 'AKTIF' },
})
```

**Jangan** query `WHERE berakhirPada IS NULL` sebagai pengganti `WHERE status = 'AKTIF'` —
gunakan `status` sebagai source of truth, `berakhirPada` hanya untuk kebutuhan historis/audit.

---

## [P1-G] Soft Delete — Deaktivasi Relasi

Saat `Pengguna` atau `OPD` di-soft-delete (`deletedAt` diisi), relasi aktif mereka
(keanggotaan tim, pengajuan evaluasi aktif, dll.) TIDAK otomatis dinonaktifkan.

Enforcement via service layer — saat soft-delete Pengguna:
```typescript
async function softDeletePengguna(userId: string) {
  await prisma.$transaction(async (tx) => {
    // Nonaktifkan semua keanggotaan tim penyusun
    await tx.anggotaTimPenyusun.updateMany({
      where: { userId, status: 'AKTIF' },
      data: { status: 'NONAKTIF', berakhirPada: new Date() },
    })
    // Nonaktifkan keanggotaan tim evaluasi
    await tx.anggotaTimEvaluasi.updateMany({
      where: { userId, status: 'AKTIF' },
      data: { status: 'NONAKTIF', berakhirPada: new Date() },
    })
    // Soft-delete pengguna
    await tx.pengguna.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    })
  })
}
```

Saat soft-delete OPD — pastikan tidak ada data aktif sebelum melanjutkan:
```typescript
async function softDeleteOPD(opdId: string) {
  // Cek pengajuan evaluasi aktif
  const pengajuanAktif = await prisma.pengajuanEvaluasi.count({
    where: { opdId, status: { not: 'SELESAI' } },
  })
  if (pengajuanAktif > 0) {
    throw new ConflictException('Masih ada pengajuan evaluasi aktif untuk OPD ini')
  }
  await prisma.opd.update({ where: { id: opdId }, data: { deletedAt: new Date() } })
}
```

---

## [P2-A] TERMINATOR/TASK/DECISION — Node Flow Constraint

`LangkahSOP` punya field `langkahSelanjutnyaYaId` dan `langkahSelanjutnyaTidakId` dengan aturan:
- `TERMINATOR`: keduanya harus NULL (node akhir)
- `TASK`: hanya `langkahSelanjutnyaYaId` boleh diisi (satu jalur)
- `DECISION`: keduanya boleh diisi (dua jalur)

Raw migration — CHECK constraint:
```sql
ALTER TABLE LangkahSOP
  ADD CONSTRAINT chk_langkah_cabang
  CHECK (
    (jenis = 'TERMINATOR' AND langkahSelanjutnyaYaId IS NULL AND langkahSelanjutnyaTidakId IS NULL)
    OR (jenis = 'TASK' AND langkahSelanjutnyaTidakId IS NULL)
    OR (jenis = 'DECISION')
  );
```

Service layer:
```typescript
function validateLangkahCabang(
  jenis: JenisLangkahProsedur,
  yaId: string | null,
  tidakId: string | null,
) {
  if (jenis === 'TERMINATOR' && (yaId || tidakId)) {
    throw new BadRequestException('TERMINATOR tidak boleh punya langkah selanjutnya')
  }
  if (jenis === 'TASK' && tidakId) {
    throw new BadRequestException('TASK hanya boleh punya satu langkah selanjutnya (Ya)')
  }
}
```

---

## [P2-B] Superseded Version — Transisi BERLAKU → DIGANTIKAN

Status `DIGANTIKAN` ditambahkan ke enum `StatusSOP`. Ini adalah status terminal yang
diberikan secara **otomatis** oleh sistem saat versi baru dari SOP yang sama menjadi `BERLAKU`.

- `DIGANTIKAN` **tidak boleh** diset manual oleh user
- Set via service layer di fungsi `berlakukanVersi()` — lihat [P0-B]
- SOP dengan status `DIGANTIKAN` tetap bisa diakses untuk referensi historis
- `DICABUT` berbeda dari `DIGANTIKAN`: dicabut adalah keputusan eksplisit (administratif),
  digantikan adalah konsekuensi otomatis dari versi baru yang berlaku

Transisi yang melibatkan DIGANTIKAN:
```
BERLAKU → DIGANTIKAN  (otomatis, dipicu saat versi lain menjadi BERLAKU)
BERLAKU → DICABUT     (manual, keputusan administratif)
DIGANTIKAN → (terminal, tidak bisa diubah)
```

---

## [P2-C] Field Temporal vs Status — Temporal Ordering

Beberapa field di `PengajuanEvaluasi` hanya boleh diisi pada status tertentu.
Tidak ada CHECK constraint di DB — enforce di service layer:

```typescript
function validateTemporalFields(pe: PengajuanEvaluasi) {
  // tanggalEvaluasi >= tanggalPermintaan
  if (pe.tanggalEvaluasi && pe.tanggalPermintaan) {
    if (pe.tanggalEvaluasi < pe.tanggalPermintaan) {
      throw new BadRequestException('Tanggal evaluasi tidak boleh sebelum tanggal permintaan')
    }
  }

  // diselesaikanOlehId + tanggalDiselesaikan hanya boleh ada jika status >= SELESAI_DIEVALUASI
  const statusYangBolehDiselesaikan: StatusPengajuanEvaluasi[] = [
    'SELESAI_DIEVALUASI', 'DIVERIFIKASI_BIRO', 'DITANDATANGANI_KOORDINATOR', 'SELESAI',
  ]
  if (pe.diselesaikanOlehId && !statusYangBolehDiselesaikan.includes(pe.status)) {
    throw new BadRequestException('Tidak bisa mengisi diselesaikanOleh pada status ini')
  }

  // diverifikasiOlehUserId hanya boleh ada jika status >= DIVERIFIKASI_BIRO
  const statusYangBolehDiverifikasi: StatusPengajuanEvaluasi[] = [
    'DIVERIFIKASI_BIRO', 'DITANDATANGANI_KOORDINATOR', 'SELESAI',
  ]
  if (pe.diverifikasiOlehUserId && !statusYangBolehDiverifikasi.includes(pe.status)) {
    throw new BadRequestException('Tidak bisa mengisi diverifikasiOleh pada status ini')
  }
}
```

---

## [P2-D] Constraint 1 KEPALA_OPD dan 1 KOORDINATOR per OPD

MySQL tidak mendukung partial unique index dengan WHERE clause via Prisma.
Enforcement di service layer dengan SELECT FOR UPDATE:

```typescript
async function createOrUpdatePengguna(data: CreatePenggunaDto) {
  if (['KEPALA_OPD', 'KOORDINATOR_TIM_PENYUSUN'].includes(data.peran)) {
    if (!data.opdId) throw new BadRequestException('Peran ini membutuhkan opdId')

    return prisma.$transaction(async (tx) => {
      const existing = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM Pengguna
        WHERE opdId = ${data.opdId}
          AND peran = ${data.peran}
          AND deletedAt IS NULL
        FOR UPDATE
      `
      if (existing.length > 0) {
        throw new ConflictException(`OPD sudah memiliki ${data.peran}`)
      }
      return tx.pengguna.create({ data })
    })
  }
}
```

---

## [P2-E] SopTerkait — Self-Reference & Duplikat Dua Arah

Dua aturan yang harus di-enforce di service layer saat INSERT `SopTerkait`:

```typescript
async function tambahSopTerkait(sopDetailId: string, sopTerkaitDetailId: string) {
  // [1] Tidak boleh self-reference
  if (sopDetailId === sopTerkaitDetailId) {
    throw new BadRequestException('SOP tidak bisa terkait dengan dirinya sendiri')
  }

  // [2] Cek duplikat dua arah — (A→B) jika (B→A) sudah ada
  const balikAda = await prisma.sopTerkait.findUnique({
    where: {
      sopDetailId_sopTerkaitDetailId: {
        sopDetailId: sopTerkaitDetailId,
        sopTerkaitDetailId: sopDetailId,
      },
    },
  })
  if (balikAda) {
    throw new ConflictException('Relasi terkait sudah ada di arah sebaliknya')
  }

  return prisma.sopTerkait.create({ data: { sopDetailId, sopTerkaitDetailId } })
}
```

---

## [P2-F] Peraturan — Dua Constraint saat Tambah DasarHukum

`DasarHukum` FK ke `Peraturan` tanpa cek status atau OPD. Service layer wajib validasi
dua hal sekaligus saat menambah DasarHukum:

```typescript
async function tambahDasarHukum(sopDetailId: string, peraturanId: string) {
  const [detail, peraturan] = await Promise.all([
    prisma.detailSOP.findUniqueOrThrow({ where: { id: sopDetailId }, include: { sop: true } }),
    prisma.peraturan.findUniqueOrThrow({ where: { id: peraturanId } }),
  ])

  // [1] Peraturan harus dari OPD yang sama dengan SOP
  if (peraturan.opdId !== detail.sop.opdId) {
    throw new BadRequestException('Peraturan tidak berasal dari OPD yang sama dengan SOP ini')
  }

  // [2] Peraturan tidak boleh sudah dicabut
  if (peraturan.status === 'DICABUT') {
    throw new BadRequestException(
      `Peraturan "${peraturan.namaPeraturan}" sudah dicabut dan tidak bisa dijadikan dasar hukum`
    )
  }

  return prisma.dasarHukum.create({ data: { sopDetailId, peraturanId } })
}
```

---

## [P2-G] Soft Delete Filter (Prisma Middleware)

Prisma tidak otomatis filter `deletedAt IS NULL`. Tambahkan middleware:

```typescript
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

Untuk `findUnique` dan `update`, filter harus ditambahkan manual:
```typescript
prisma.pengguna.findUnique({ where: { id, deletedAt: null } })
```

---

## [P2-H] Tenant Isolation (OPD sebagai Tenant)

Tidak ada RLS di MySQL. Setiap query yang menyajikan data ke user harus menyertakan
filter `opdId` yang diambil dari JWT — **tidak boleh dari request body**.

Tabel yang TIDAK punya `opdId` langsung dan perlu JOIN:
- `NilaiEvaluasi` → via `PengajuanEvaluasi.opdId`
- `LogNilaiEvaluasi` → via `PengajuanEvaluasi.opdId`
- `LangkahSOP` → via `DetailSOP → SOP → OPD`
- `RiwayatTandaTangan` → via `sopDetail.sop.opdId` atau `pengajuanEvaluasi.opdId`

Helper di repository layer:
```typescript
// Selalu pass opdId dari JWT, bukan dari request body
function withOpdFilter<T extends { where?: Record<string, unknown> }>(
  query: T,
  opdId: string,
): T {
  return { ...query, where: { ...query.where, opdId } }
}
```

---

## [P3-A] Circular Reference LangkahSOP

`LangkahSOP` punya self-referential FK `langkahSelanjutnyaYaId` dan
`langkahSelanjutnyaTidakId`. MySQL tidak memvalidasi siklus: A→B→C→A bisa diinsert
tanpa error FK, tapi traversal di aplikasi akan infinite loop.

Deteksi siklus saat menyimpan langkah:
```typescript
async function detectCycleInFlow(langkahId: string, nextId: string): Promise<boolean> {
  // DFS iteratif untuk deteksi siklus
  const visited = new Set<string>()
  let current: string | null = nextId

  while (current && !visited.has(current)) {
    if (current === langkahId) return true  // siklus ditemukan
    visited.add(current)
    const langkah = await prisma.langkahSOP.findUnique({
      where: { id: current },
      select: { langkahSelanjutnyaYaId: true, langkahSelanjutnyaTidakId: true },
    })
    // Untuk simplisitas cek jalur Ya; untuk DECISION perlu cek keduanya
    current = langkah?.langkahSelanjutnyaYaId ?? null
  }
  return false
}
```

---

## [P3-B] nomorSOP dan Operasi Salin

`DetailSOP.nomorSOP` adalah `@unique` global. Saat operasi salin (`salinDariDetailSopId`
diisi), service layer **wajib** menghasilkan `nomorSOP` baru yang unik — tidak boleh
menyalin nilai `nomorSOP` dari sumber.

```typescript
async function salinDetailSOP(sumberDetailSopId: string, nomorSOPBaru: string) {
  // Validasi nomorSOPBaru belum dipakai
  const existing = await prisma.detailSOP.findUnique({ where: { nomorSOP: nomorSOPBaru } })
  if (existing) {
    throw new ConflictException(`Nomor SOP "${nomorSOPBaru}" sudah digunakan`)
  }
  // ... lanjutkan operasi salin dengan nomorSOPBaru
}
```

---

## [P3-C] Audit Coverage — LogEditSOP dan LogNilaiEvaluasi

Sistem hanya melacak dua jenis kolaborasi:

| Kolaborasi | Tabel | Siapa | Kapan |
|-----------|-------|-------|-------|
| Edit konten SOP | `LogEditSOP` | Tim Penyusun | Setiap tulis/ubah/hapus pada konten DetailSOP |
| Ubah nilai evaluasi | `LogNilaiEvaluasi` | Tim Evaluasi | Setiap UPDATE pada `NilaiEvaluasi` |

**Yang tidak diaudit (disengaja):**
- Transisi status SOP/PengajuanEvaluasi — cukup lihat `status` + `updatedAt` di masing-masing tabel
- Komentar — `Komentar` tabel sendiri adalah audit trail (append + `createdAt`)
- TTE — `RiwayatTandaTangan` sudah append-only

**Cara menulis LogEditSOP di service layer:**
```typescript
// Contoh: setelah mengubah LangkahSOP
await prisma.logEditSOP.create({
  data: {
    sopDetailId,
    userId: currentUser.id,
    bagian: 'LANGKAH_SOP',
    entityId: langkahId,         // ID LangkahSOP yang diubah (opsional)
    keterangan: 'Ubah pelaksana', // catatan bebas (opsional)
  },
})
```

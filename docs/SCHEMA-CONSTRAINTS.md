# Schema Constraints — Di Luar Prisma (Sinkron Schema Terbaru)

Dokumen ini memuat constraint bisnis yang **tidak sepenuhnya** bisa dijamin oleh Prisma schema saat ini, beserta rekomendasi enforcement.

---

## Daftar Constraint

1. [P0] Satu versi `BERLAKU` per `SOP`
2. [P0] Guard transisi status `DetailSOP` dan `PengajuanEvaluasi`
3. [P0] Optimistic locking (`version`) wajib dipakai
4. [P0] Nilai evaluasi harus konsisten dengan ruang lingkup pengajuan
5. [P1] Mutasi OPD pengguna harus menutup riwayat lama
6. [P1] Validasi role untuk aksi TTE
7. [P1] Integritas artefak kripto TTE
8. [P1] Validasi angka `nilaiOPD`
9. [P2] Tenant isolation berbasis `opdId`
10. [P2] Immutability audit log

---

## [P0] Satu versi `BERLAKU` per `SOP`

### Masalah
Schema punya `@@unique([sopId, versi])`, tapi tidak membatasi agar hanya satu baris berstatus `BERLAKU` untuk satu `sopId`.

### Enforce
- Trigger MySQL (recommended) + transaksi di service layer.

```sql
DELIMITER $$
CREATE TRIGGER trg_satu_berlaku_per_sop
BEFORE UPDATE ON DetailSOP
FOR EACH ROW
BEGIN
  IF NEW.status = 'BERLAKU' AND OLD.status <> 'BERLAKU' THEN
    IF EXISTS (
      SELECT 1 FROM DetailSOP
      WHERE sopId = NEW.sopId
        AND status = 'BERLAKU'
        AND detailSopId <> NEW.detailSopId
    ) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Satu SOP hanya boleh memiliki satu versi BERLAKU';
    END IF;
  END IF;
END$$
DELIMITER ;
```

---

## [P0] Guard transisi status

### DetailSOP.status (state machine)
Validasi transisi di service:

```text
DRAFT -> SEDANG_DISUSUN
SEDANG_DISUSUN -> SIAP_DIEVALUASI
SIAP_DIEVALUASI -> DIAJUKAN_EVALUASI
DIAJUKAN_EVALUASI -> SEDANG_DIEVALUASI
SEDANG_DIEVALUASI -> REVISI_DARI_TIM_EVALUASI | SIAP_DIVERIFIKASI
REVISI_DARI_TIM_EVALUASI -> SEDANG_DISUSUN
SIAP_DIVERIFIKASI -> DIVERIFIKASI_BIRO_ORGANISASI
DIVERIFIKASI_BIRO_ORGANISASI -> BERLAKU
BERLAKU -> DIGANTIKAN | DICABUT
```

### PengajuanEvaluasi.status
Minimal guard:

```text
MENUNGGU_EVALUASI -> SEDANG_DIEVALUASI
SEDANG_DIEVALUASI -> SELESAI_DIEVALUASI
SELESAI_DIEVALUASI -> DIVERIFIKASI_BIRO
DIVERIFIKASI_BIRO -> DITANDATANGANI_KOORDINATOR
DITANDATANGANI_KOORDINATOR -> SELESAI
```

---

## [P0] Optimistic locking wajib (`version`)

Dipakai di:
- `PengajuanEvaluasi.version`
- `NilaiEvaluasi.version`

Pattern update:

```sql
UPDATE PengajuanEvaluasi
SET status = ?, version = version + 1
WHERE pengajuanEvaluasiId = ? AND version = ?;
```

Jika affected rows = 0 -> konflik update paralel.

---

## [P0] Konsistensi NilaiEvaluasi

### Rule wajib
1. `NilaiEvaluasi.pengajuanEvaluasiId` dan `NilaiEvaluasi.detailSopId` harus berada dalam konteks OPD yang sama.
2. Saat `PengajuanEvaluasi` dipindah ke `SELESAI_DIEVALUASI`, semua `NilaiEvaluasi` terkait harus sudah punya `hasil`.

### Enforce
- Service layer sebelum insert/update nilai dan sebelum transisi status pengajuan.

---

## [P1] Mutasi OPD pengguna & histori

Karena `Pengguna.opdId` menyimpan OPD aktif, mutasi harus menjaga histori di `RiwayatOpdPengguna`.

### Prosedur wajib (dalam transaksi)
1. Tutup baris riwayat aktif lama generator client {
  provider       = "prisma-client-js"
  output         = "../src/generated/prisma"
  jsModuleFormat = "cjs"
}

datasource db {
  provider = "mysql"
}

/// =========================
/// MODUL PENGGUNA & ORGANISASI
/// =========================
model Pengguna {
  penggunaId                      String               @id @default(uuid())
  email                           String               @unique
  opdId                           String
  nama                            String
  kataSandi                       String
  peran                           PeranPengguna
  nip                             String               @unique
  jabatan                         String
  pangkat                         String
  nohp                            String
  deletedAt                       DateTime?
  createdAt                       DateTime             @default(now())
  updatedAt                       DateTime             @updatedAt
  detailSopDibuat                 DetailSOP[]          @relation("SOPDibuatOleh")
  detailSopDiedit                 DetailSOP[]          @relation("SOPDieditOleh")
  komentar                        Komentar[]
  logEditSop                      LogEditSOP[]
  pengajuanEvaluasiDiselesaikan   PengajuanEvaluasi[]  @relation("PengajuanDiselesaikanOleh")
  pengajuanEvaluasiDitandatangani PengajuanEvaluasi[]  @relation("PengajuanDitandatanganiOlehKoordinator")
  pengajuanEvaluasiDiverifikasi   PengajuanEvaluasi[]  @relation("PengajuanDiverifikasiOleh")
  opd                             OPD                  @relation(fields: [opdId], references: [opdId], onDelete: Restrict)
  kredensialTTE                   KredensialTTE?
  riwayatOpd                      RiwayatOpdPengguna[]
  tandaTangan                     RiwayatTandaTangan[]
}

model OPD {
  opdId              String               @id @default(uuid())
  nama               String
  deletedAt          DateTime?
  createdAt          DateTime             @default(now())
  updatedAt          DateTime             @updatedAt
  pelaksana          Pelaksana[]
  pengajuanEvaluasi  PengajuanEvaluasi[]
  pengguna           Pengguna[]
  riwayatOpdPengguna RiwayatOpdPengguna[]
  opdPeraturan       OPDPeraturan[]
  sop                SOP[]
}

model RiwayatOpdPengguna {
  riwayatOpdPenggunaId String   @id @default(uuid())
  penggunaId           String
  opdId                String
  mulaiPada            DateTime @default(now())
  berakhirPada         DateTime?
  alasan               String?
  createdAt            DateTime @default(now())
  opd                  OPD      @relation(fields: [opdId], references: [opdId], onDelete: Restrict)
  pengguna             Pengguna @relation(fields: [penggunaId], references: [penggunaId], onDelete: Cascade)

  @@unique([penggunaId, mulaiPada])
}

/// =========================
/// MODUL REGULASI & SOP
/// =========================
model Peraturan {
  peraturanId String         @id @default(uuid())
  nama        String
  nomor       String
  tahun       Int
  tentang     String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  dasarHukum  DasarHukum[]
  opdPemakai  OPDPeraturan[]

  @@unique([nomor, tahun])
}

model OPDPeraturan {
  opdId       String
  peraturanId String
  createdAt   DateTime  @default(now())
  opd         OPD       @relation(fields: [opdId], references: [opdId], onDelete: Cascade)
  peraturan   Peraturan @relation(fields: [peraturanId], references: [peraturanId], onDelete: Cascade)

  @@id([opdId, peraturanId])
}

model SOP {
  sopId      String      @id @default(uuid())
  opdId      String
  judul      String
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  detailSops DetailSOP[]
  opd        OPD         @relation(fields: [opdId], references: [opdId])
}

model DetailSOP {
  detailSopId String @id @default(uuid())
  sopId       String

  salinDariDetailSopId   String?
  status                 StatusSOP            @default(DRAFT)
  versi                  Int                  @default(1)
  nomorSOP               String               @unique
  tanggalPembuatan       DateTime             @default(now())
  tanggalRevisi          DateTime?
  tanggalEfektif         DateTime?
  namaLembaga            String               @db.Text
  lebarKolomKegiatan     Int?
  lebarKolomPelaksana    Int?
  lebarKolomKelengkapan  Int?
  lebarKolomWaktu        Int?
  lebarKolomOutput       Int?
  lebarKolomKeterangan   Int?
  dibuatOlehId           String?
  terakhirDieditOlehId   String?
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt
  dasarHukum             DasarHukum[]
  dibuatOleh             Pengguna?            @relation("SOPDibuatOleh", fields: [dibuatOlehId], references: [penggunaId], onDelete: Restrict)
  salinDariDetailSop     DetailSOP?           @relation("DetailSOPSalinan", fields: [salinDariDetailSopId], references: [detailSopId])
  disalinKeDariSumberIni DetailSOP[]          @relation("DetailSOPSalinan")
  sop                    SOP                  @relation(fields: [sopId], references: [sopId], onDelete: Cascade)
  terakhirDieditOleh     Pengguna?            @relation("SOPDieditOleh", fields: [terakhirDieditOlehId], references: [penggunaId], onDelete: Restrict)
  swimlanes              DetailSOPPelaksana[]
  diagramLayout          TataLetakDiagram[]
  komentar               Komentar[]
  lampiran               LampiranTeks[]
  langkahSOP             LangkahSOP[]
  logEditSop             LogEditSOP[]
  relasiSopKeluar        SopTerkait[]         @relation("RelasiSOP")
  relasiSopMasuk         SopTerkait[]         @relation("RelasiSOPTerkait")
  dokumenTte             DokumenTte[]

  @@unique([sopId, versi])
}

model LampiranTeks {
  lampiranTeksId String        @id @default(uuid())
  detailSopId    String
  jenis          JenisLampiran
  teks           String        @db.Text
  detailSop      DetailSOP     @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)
}

model DasarHukum {
  detailSopId String
  peraturanId String
  peraturan   Peraturan @relation(fields: [peraturanId], references: [peraturanId])
  detailSop   DetailSOP @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)

  @@id([detailSopId, peraturanId])
}

model SopTerkait {
  detailSopId        String
  detailSopTerkaitId String
  sop                DetailSOP @relation("RelasiSOP", fields: [detailSopId], references: [detailSopId], onDelete: Cascade)
  sopTerkait         DetailSOP @relation("RelasiSOPTerkait", fields: [detailSopTerkaitId], references: [detailSopId], onDelete: Cascade)

  @@id([detailSopId, detailSopTerkaitId])
}

model LangkahSOP {
  langkahSopId              String               @id @default(uuid())
  detailSopId               String
  kegiatan                  String               @db.Text
  jenis                     JenisLangkahProsedur @default(KEGIATAN)
  urutan                    Int
  kelengkapan               String
  keluaran                  String
  waktu                     Int
  satuanWaktu               SatuanWaktu
  keterangan                String               @db.Text
  pelaksanaId               String
  langkahSelanjutnyaYaId    String?
  langkahSelanjutnyaTidakId String?
  createdAt                 DateTime             @default(now())
  updatedAt                 DateTime             @updatedAt
  diagramEdgeKeluar         SisiDiagram[]        @relation("DiagramEdgeDari")
  diagramEdgeMasuk          SisiDiagram[]        @relation("DiagramEdgeKe")
  diagramNodePosition       PosisiNodeDiagram[]
  langkahTidak              LangkahSOP?          @relation("LangkahTidak", fields: [langkahSelanjutnyaTidakId], references: [langkahSopId])
  langkahSebelumTidak       LangkahSOP[]         @relation("LangkahTidak")
  langkahYa                 LangkahSOP?          @relation("LangkahYa", fields: [langkahSelanjutnyaYaId], references: [langkahSopId])
  langkahSebelumYa          LangkahSOP[]         @relation("LangkahYa")
  pelaksana                 Pelaksana            @relation(fields: [pelaksanaId], references: [pelaksanaId])
  detailSop                 DetailSOP            @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)

  @@unique([detailSopId, urutan])
}

model Pelaksana {
  pelaksanaId   String               @id @default(uuid())
  opdId         String
  nama String
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
  sopDetails    DetailSOPPelaksana[]
  langkahSOP    LangkahSOP[]
  opd           OPD                  @relation(fields: [opdId], references: [opdId])
}

model DetailSOPPelaksana {
  detailSopId String
  pelaksanaId String
  urutan      Int       @default(0)
  pelaksana   Pelaksana @relation(fields: [pelaksanaId], references: [pelaksanaId])
  detailSop   DetailSOP @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)

  @@id([detailSopId, pelaksanaId])
}


/// =========================
/// MODUL DIAGRAM SOP
/// =========================
model TataLetakDiagram {
  tataLetakDiagramId String              @id @default(uuid())
  detailSopId        String
  jenis              JenisDiagramSOP
  versiLayout        Int                 @default(1)
  layoutSeed         Int                 @default(0)
  gayaPanah          GayaPanah?
  langkahPerHalaman  Int?                @default(10)
  lebarAreaKegiatan  Int?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  edgeOverrides      SisiDiagram[]
  detailSop          DetailSOP           @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)
  nodeOverrides      PosisiNodeDiagram[]

  @@unique([detailSopId, jenis, versiLayout])
}

model PosisiNodeDiagram {
  tataLetakDiagramId String
  langkahSopId       String
  page               Int              @default(1)
  x                  Int
  y                  Int
  updatedAt          DateTime         @updatedAt
  tataLetakDiagram   TataLetakDiagram @relation(fields: [tataLetakDiagramId], references: [tataLetakDiagramId], onDelete: Cascade)
  langkahSOP         LangkahSOP       @relation(fields: [langkahSopId], references: [langkahSopId])

  @@id([tataLetakDiagramId, langkahSopId])
}

model SisiDiagram {
  sisiDiagramId      String             @id @default(uuid())
  tataLetakDiagramId String
  dariLangkahId      String
  keLangkahId        String
  /// Membedakan edge ganda (mis. keputusan Ya vs Tidak) tanpa mengandalkan NULL di unique.
  cabang          CabangDiagramEdge  @default(UTAMA)
  labelTeks       String?
  dariLangkah     LangkahSOP         @relation("DiagramEdgeDari", fields: [dariLangkahId], references: [langkahSopId])
  tataLetakDiagram TataLetakDiagram   @relation(fields: [tataLetakDiagramId], references: [tataLetakDiagramId], onDelete: Cascade)
  keLangkah       LangkahSOP         @relation("DiagramEdgeKe", fields: [keLangkahId], references: [langkahSopId])
  points          TitikSisiDiagram[]

  @@unique([tataLetakDiagramId, dariLangkahId, keLangkahId, cabang])
}

model TitikSisiDiagram {
  sisiDiagramId String
  urutan        Int
  x             Int
  y             Int
  sisiDiagram   SisiDiagram @relation(fields: [sisiDiagramId], references: [sisiDiagramId], onDelete: Cascade)

  @@id([sisiDiagramId, urutan])
}


/// =========================
/// MODUL EVALUASI SOP
/// =========================
model PengajuanEvaluasi {
  pengajuanEvaluasiId                 String                  @id @default(uuid())
  opdId                               String
  jenis                               JenisPengajuanEvaluasi
  status                              StatusPengajuanEvaluasi @default(MENUNGGU_EVALUASI)
  catatan                             String?                 @db.Text
  nomorBA                             String?
  tanggalPermintaan                   DateTime?
  tanggalEvaluasi                     DateTime?
  nilaiOPD                            Int?
  diverifikasiOlehUserId              String?
  ditandatanganiOlehKoordinatorUserId String?
  tanggalTTDBaKoordinator             DateTime?
  /// Evaluator yang men-trigger "selesai evaluasi" → kirim ke Biro Organisasi.
  /// Catatan evaluasi disimpan langsung di field `catatan` pada pengajuan.
  diselesaikanOlehId                  String?
  tanggalDiselesaikan                 DateTime?
  /// Versi untuk optimistic locking — increment di setiap update status.
  /// Service: UPDATE ... SET status = ?, version = version + 1 WHERE id = ? AND version = ?
  version                             Int                     @default(0)
  createdAt                           DateTime                @default(now())
  updatedAt                           DateTime                @updatedAt
  diselesaikanOleh                    Pengguna?               @relation("PengajuanDiselesaikanOleh", fields: [diselesaikanOlehId], references: [penggunaId])
  ditandatanganiOlehKoordinatorUser   Pengguna?               @relation("PengajuanDitandatanganiOlehKoordinator", fields: [ditandatanganiOlehKoordinatorUserId], references: [penggunaId], onDelete: Restrict)
  diverifikasiOlehUser                Pengguna?               @relation("PengajuanDiverifikasiOleh", fields: [diverifikasiOlehUserId], references: [penggunaId], onDelete: Restrict)
  dokumenTte                          DokumenTte[]
  opd                                 OPD                     @relation(fields: [opdId], references: [opdId])
}

/// =========================
/// MODUL TANDA TANGAN ELEKTRONIK (TTE)
/// =========================
model KredensialTTE {
  kredensialTteId    String    @id @default(uuid())
  userId             String    @unique
  hashPin            String
  emailTerverifikasi Boolean   @default(false)
  tokenVerifikasi    String?
  tokenExpiry        DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  user               Pengguna  @relation(fields: [userId], references: [penggunaId])
}

model DokumenTte {
  dokumenTteId         String             @id @default(uuid())
  nomorDokumen         String
  jenisDokumen         String
  judulDokumen         String
  hashDokumen          String
  versiDokumen         Int                @default(1)
  metodeKanonikalisasi String?
  detailSopId          String?
  pengajuanEvaluasiId  String?
  createdAt            DateTime           @default(now())
  detailSop            DetailSOP?         @relation(fields: [detailSopId], references: [detailSopId], onDelete: Restrict)
  pengajuanEvaluasi    PengajuanEvaluasi? @relation(fields: [pengajuanEvaluasiId], references: [pengajuanEvaluasiId], onDelete: Restrict)
  riwayatTandaTangan   RiwayatTandaTangan[]

  @@unique([detailSopId])
  @@unique([pengajuanEvaluasiId])
}

model RiwayatTandaTangan {
  riwayatTandaTanganId String             @id @default(uuid())
  userId               String
  dokumenTteId         String
  peran                PeranPengguna
  signatureValue       String?            @db.LongText
  signatureAlgorithm   String?
  signatureFormat      String?
  keyId                String?
  certSerialNumber     String?
  certIssuer           String?
  certSubject          String?
  certFingerprint      String?
  certValidFrom        DateTime?
  certValidTo          DateTime?
  ditandatanganiPada   DateTime           @default(now())
  dokumenTte           DokumenTte         @relation(fields: [dokumenTteId], references: [dokumenTteId], onDelete: Restrict)
  user                 Pengguna           @relation(fields: [userId], references: [penggunaId])

  @@unique([dokumenTteId, peran])
}

/// =========================
/// MODUL KOLABORASI SOP
/// =========================

model LogEditSOP {
  logEditSopId String    @id @default(uuid())
  detailSopId  String
  userId       String
  keterangan   String?   @db.Text
  createdAt    DateTime  @default(now())
  detailSop    DetailSOP @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)
  user         Pengguna  @relation(fields: [userId], references: [penggunaId])
}

model Komentar {
  komentarId  String         @id @default(uuid())
  detailSopId String
  userId      String
  isi         String         @db.Text
  status      StatusKomentar @default(TERBUKA)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  detailSop   DetailSOP      @relation(fields: [detailSopId], references: [detailSopId], onDelete: Cascade)
  user        Pengguna       @relation(fields: [userId], references: [penggunaId])
}

/// =========================
/// ENUMS
/// =========================
enum PeranPengguna {
  PJ_EVALUATOR
  EVALUATOR
  KEPALA_OPD
  PJ_PENYUSUN
  PENYUSUN
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
  /// Versi aktif yang sah — hanya 1 versi BERLAKU per SOP (enforce via trigger, lihat SCHEMA-CONSTRAINTS.md)
  BERLAKU
  /// Versi lama yang digantikan versi baru. Set otomatis saat versi baru menjadi BERLAKU.
  DIGANTIKAN
  DICABUT
}

enum JenisLangkahProsedur {
  AWAL_AKHIR
  KEGIATAN
  KEPUTUSAN
}

enum SatuanWaktu {
  m
  h
  d
  w
  mo
  y
}

enum JenisDiagramSOP {
  FLOWCHART
  BPMN
}

/// Membedakan beberapa edge dari node yang sama ke node lain (mis. cabang Ya/Tidak).
enum CabangDiagramEdge {
  UTAMA
  YA
  TIDAK
}

enum GayaPanah {
  LURUS
  SIKU
}

enum JenisPengajuanEvaluasi {
  TERJADWAL
  MANDIRI
}

enum StatusPengajuanEvaluasi {
  MENUNGGU_EVALUASI
  SEDANG_DIEVALUASI
  SELESAI_DIEVALUASI
  DIVERIFIKASI_BIRO
  DITANDATANGANI_KOORDINATOR
  SELESAI
}

enum StatusKomentar {
  TERBUKA
  SELESAI
}

enum JenisLampiran {
  PERINGATAN
  KUALIFIKASI_PELAKSANAAN
  PERALATAN
  PENCATATAN_PENDATAAN
}
(`berakhirPada = now()`).
2. Insert baris riwayat baru (`mulaiPada = now()`, `opdId` baru).
3. Update `Pengguna.opdId`.

### Guard
- Tidak boleh ada >1 baris aktif (`berakhirPada IS NULL`) per `penggunaId`.

---

## [P1] Validasi role untuk aksi TTE

Schema sudah menyimpan `RiwayatTandaTangan.peran` sebagai snapshot `PeranPengguna`, tapi eligibility signer tetap harus dicek di service.

Contoh kebijakan:
- SOP final: signer harus `KEPALA_OPD` (dan/atau `PJ_PENYUSUN` jika diizinkan kebijakan).
- Berita acara evaluasi: signer harus role evaluator/otoritas yang ditetapkan.

---

## [P1] Integritas artefak kripto TTE

Field artefak ada di `RiwayatTandaTangan`:
- `signatureValue`, `signatureAlgorithm`, `signatureFormat`, `keyId`
- `certSerialNumber`, `certIssuer`, `certSubject`, `certFingerprint`
- `certValidFrom`, `certValidTo`

`DokumenTte` menyimpan metadata dokumen:
- `hashDokumen`, `versiDokumen`, `metodeKanonikalisasi`

### Rule enforcement
1. Jika event dianggap "signed", `signatureValue` dan metadata cert minimal harus terisi.
2. Hash dokumen final saat sign harus sama dengan hash yang diverifikasi ulang.
3. `certValidFrom <= ditandatanganiPada <= certValidTo`.

---

## [P1] Validasi `nilaiOPD`

Schema belum memberi range nilai.

Rekomendasi:
- `0 <= nilaiOPD <= 100`
- `nilaiOPD` hanya boleh diisi ketika status sudah minimal `SELESAI_DIEVALUASI`.

---

## [P2] Tenant isolation (`opdId`)

Akses data harus dibatasi berdasarkan OPD aktor:
- Data SOP: melalui `SOP.opdId`.
- Data evaluasi: melalui `PengajuanEvaluasi.opdId`.
- Data nilai/log nilai: join melalui `PengajuanEvaluasi.opdId`.

Semua query list/detail/update wajib menyertakan filter tenant.

---

## [P2] Immutability audit log

`LogEditSOP` dan `LogNilaiEvaluasi` adalah audit trail.

Rule:
1. Tidak boleh UPDATE/DELETE baris log.
2. Koreksi dilakukan dengan menambah log baru.

Enforce:
- Batasi endpoint write log menjadi create-only.
- Optional trigger DB untuk menolak UPDATE/DELETE.

---

## Hal yang sudah tidak berlaku pada schema terbaru

Constraint lama berikut tidak dipakai lagi karena entitasnya sudah dihapus/diubah:

1. `AnggotaTimPenyusun` / `AnggotaTimEvaluasi` (model sudah tidak ada).
2. `PeranTTE` terpisah (sudah digabung ke `PeranPengguna` pada snapshot tanda tangan).
3. Aturan berbasis "OPD khusus Biro Organisasi" sebagai tipe tabel OPD (tidak ada field jenis OPD di schema).


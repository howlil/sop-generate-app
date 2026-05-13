# Business Specification — SOP Management System

> Dokumen ini adalah **sumber kebenaran tunggal** (single source of truth) untuk:
> 1. Alur bisnis per domain
> 2. State-machine status
> 3. Konstanta & invariant yang wajib di-enforce
> 4. Acceptance criteria bergaya **Given–When–Then** (TDD / Spec-Driven)

@schema.prisma (14-82) 

normalisasikan ini  , pindahkan fieldnya
dengan logic yang masih sama, tapi saya raya ini salah si tabel databasenya

harusnya opd ini tabel masiher dan atomik, gada meruk ke pengguna , mengenai 1 opd wajib 1 kepala opd, 1 opd wajib 1 pjpneyusun, dan pj evluator/evluator harus dari BiroOrganisasi, itu harunya di handle di table junction riwayatOpdPengguna

atau nanti mngkin pengguna.peran itu harusnya ad di riwayat?

juga diisin dibuatkan isAktifnya juga, namun ga pelru mulai pada dan berakhir padanya

tolong deseignkan best practinya secara komprehensif baik client maupun server 

---


## usecase
- detailkan lagi flownya di bagian status 
  - status apa aja yang adi di penyusun
  - status apa aja yang ad di evalutor
  - satus apa aja yang adi pj evaluator
  - status apa aja yang ada di pj penyusun evaluasi
  - statsu apa aja yang ada di kepala opd
- optimasi lagi field" yang ada di database
- gimana flow dan busines logic kalau sop ini suda disahkan kemudian mau di evaluasi lagi
- perbaiki diagram sop
- perbaiki erd pada bagain pengguna opd dan peran, handler yang best practice giman
- fix dan perbaiki workflow dari evluator kalau direvisi
  - misal ada 5 pengajuan 1 revisi, gimana proses workflow dari revisi ini?
    - evaluator emngisi catatn revisi -> sop di edit di evaluasi -> kirim kan kembali evaluator
- fix : tengok mana komponent yang di deadkan ketika lagi ngedit atau cuman lihat aja, 
- perjelas lebih detail constraint dari aplikasi

## Daftar Isi

1. [Domain Map](#1-domain-map)
2. [Aktor & Peran](#2-aktor--peran)
3. [Alur Bisnis — Master & Akses](#3-alur-bisnis--master--akses)
4. [Alur Bisnis — Regulasi](#4-alur-bisnis--regulasi)
5. [Alur Bisnis — Authoring SOP](#5-alur-bisnis--authoring-sop)
6. [State Machine — StatusSOP](#6-state-machine--statussop)
7. [Alur Bisnis — Evaluasi SOP](#7-alur-bisnis--evaluasi-sop)
8. [State Machine — StatusPengajuanEvaluasi](#8-state-machine--statuspengajuanevaluasi)
9. [Alur Bisnis — TTE (Tanda Tangan Elektronik)](#9-alur-bisnis--tte-tanda-tangan-elektronik)
10. [Konstanta & Business Rules Wajib](#10-konstanta--business-rules-wajib)
11. [Acceptance Criteria (Given–When–Then)](#11-acceptance-criteria-givenwhenhen)

---

## 1. Domain Map

```
┌─────────────────────────────────────────────────────────────────┐
│                       SISTEM SOP                                │
│                                                                 │
│  ┌────────────┐   ┌────────────┐   ┌────────────────────────┐  │
│  │  MODUL 1   │   │  MODUL 2   │   │       MODUL 3          │  │
│  │ Master &   │──▶│ Authoring  │──▶│  Kolaborasi SOP        │  │
│  │  Akses     │   │    SOP     │   │ (Komentar, Log Edit)   │  │
│  └────────────┘   └─────┬──────┘   └────────────────────────┘  │
│       │                 │                                       │
│  ┌────┴───────┐         ▼                                       │
│  │ Regulasi   │   ┌────────────┐   ┌────────────────────────┐  │
│  │(Peraturan) │   │  MODUL 5   │──▶│       MODUL 6          │  │
│  └────────────┘   │  Evaluasi  │   │  Legalisasi & TTE      │  │
│                   └────────────┘   └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Aktor & Peran

| Peran | Kode | Tanggung Jawab Utama |
|---|---|---|
| PJ Evaluator Organisasi | `PJ_EVALUATOR` | Memverifikasi hasil evaluasi, tanda tangan BA final. Satu instansi (OPD `isPjEvaluatorOrganisasi = true`). |
| Evaluator | `EVALUATOR` | Mengisi nilai evaluasi per SOP, menyelesaikan sesi evaluasi. |
| Kepala OPD | `KEPALA_OPD` | menandatangain sop OPD-nya. |
| PJ Penyusun | `PJ_PENYUSUN` | Mengkoordinasi penyusunan, tanda tangan Berita Acara Penyusun. |
| Penyusun | `PENYUSUN` | Membuat & mengedit dokumen SOP. |

**Constraint OPD:**
- Satu OPD hanya boleh punya **1 Kepala OPD** (`OPD.kepalaPenggunaId @unique`)
- Satu OPD hanya boleh punya **1 PJ Penyusun** (`OPD.pjPenyusunPenggunaId @unique`)
- Hanya **1 OPD** yang boleh menjadi PJ Evaluator Organisasi (`isPjEvaluatorOrganisasi`, enforce via MySQL trigger)

---

## 3. Alur Bisnis — Master & Akses

### 3.1 Pendaftaran & Penugasan Pengguna

```
[Admin/System] ──▶ Buat Pengguna (email, nip, peran, opdId)
                        │
                        ├── Validasi: NIP unik secara global
                        ├── Validasi: Email unik secara global
                        ├── Pengguna hanya bisa di-assign ke 1 OPD aktif (current)
                        │   (OPD lama dicatat di RiwayatOpdPengguna)
                        └── Jika peran = KEPALA_OPD → set OPD.kepalaPenggunaId
                            Jika peran = PJ_PENYUSUN → set OPD.pjPenyusunPenggunaId
```

### 3.2 Perpindahan OPD

```
[Admin] ──▶ Pindahkan Pengguna ke OPD baru
                │
                ├── Catat entri baru di RiwayatOpdPengguna (opdId lama)
                ├── Update Pengguna.opdId ke OPD baru
                └── Jika peran slot (KEPALA/PJ), clear pointer di OPD lama
```

### 3.3 Soft Delete Pengguna

```
[Admin] ──▶ Nonaktifkan Pengguna
                │
                ├── Set Pengguna.deletedAt = now()
                ├── SOP yang dibuat tetap ada (onDelete: Restrict → jangan hapus data SOP)
                └── Slot Kepala/PJ di OPD menjadi null (onDelete: SetNull)
```

---

## 4. Alur Bisnis — Regulasi

### 4.1 Manajemen Peraturan

```
[Penyusun / PJ Penyusun] ──▶ Tambah Peraturan
        │
        ├── Validasi: kombinasi (nomor, tahun) harus unik
        ├── Field wajib: nama, nomor, tahun, tentang
        └── Catat lastEditedById = userId

[Penyusun] ──▶ Attach Peraturan ke DetailSOP
        │
        └── Insert DasarHukum (detailSopId, peraturanId)
            Satu detailSop bisa punya banyak DasarHukum

[Admin OPD] ──▶ Daftarkan OPD sebagai pemakai Peraturan
        └── Insert OPDPeraturan (opdId, peraturanId)
```

---

## 5. Alur Bisnis — Authoring SOP

### 5.1 Pembuatan SOP Baru

```
[Penyusun] ──▶ Buat SOP (judul, opdId)
        │
        └── Sistem auto-buat DetailSOP versi 1
                status = DRAFT
                nomorSOP = generate (unik global)
                dibuatOlehId = userId penyusun
```

### 5.2 Penyusunan Dokumen SOP

```
Selama status ∈ {DRAFT, SEDANG_DISUSUN, REVISI_DARI_EVALUATOR}:

[Penyusun] ──▶ Edit Header SOP
        │        (namaLembaga, tanggalEfektif, dsb)
        │        → Log ke LogEditSOP (bagian = HEADER)
        │
[Penyusun] ──▶ Tambah/Edit LangkahSOP
        │        → Log ke LogEditSOP (bagian = LANGKAH)
        │        → Validasi urutan langkah tidak duplikat per DetailSOP
        │        → Langkah KEPUTUSAN harus punya langkahYa & langkahTidak
        │
[Penyusun] ──▶ Attach Lampiran (Peringatan, Kualifikasi, Peralatan, Pencatatan)
        │
[Penyusun] ──▶ Attach DasarHukum (link ke Peraturan)
        │
[Penyusun] ──▶ Attach SopTerkait (relasi ke DetailSOP lain)
        │
[Evaluator/PJ] ──▶ Tulis Komentar
        │            → Komentar.status = TERBUKA
        │
[Penyusun] ──▶ Selesaikan Komentar
                → Komentar.status = SELESAI
```

### 5.3 Log Edit dengan Merge Window

```
Saat Penyusun edit field:
    ├── Cari LogEditSOP terbuka (closedAt IS NULL) untuk
    │   (detailSopId, userId, bagian) dalam 5 menit terakhir
    ├── Jika ada → merge: update meta.fields, meta.count, keterangan
    └── Jika tidak ada → buat LogEditSOP baru (closedAt = NULL)

Background job (atau lazy-close):
    └── Set closedAt = now() untuk log idle > MERGE_WINDOW_MINUTES
```

### 5.4 Pengajuan ke Evaluasi

```
[PJ Penyusun] ──▶ Ajukan SOP ke Evaluasi
        │
        ├── GUARD: status harus SIAP_DIEVALUASI
        ├── GUARD: tidak boleh ada Komentar.status = TERBUKA
        ├── GUARD: minimal 3 LangkahSOP harus ada
        └── Transisi: status → DIAJUKAN_EVALUASI
```

### 5.5 Revisi Pasca Evaluasi

```
[Evaluator] ──▶ Tandai SOP perlu perbaikan
        │
        └── Transisi StatusSOP: SEDANG_DIEVALUASI → REVISI_DARI_EVALUATOR

[Penyusun] ──▶ Edit SOP (kembali ke alur 5.2)
        │
[PJ Penyusun] ──▶ Ajukan ulang → DIAJUKAN_EVALUASI
```

### 5.6 Versioning SOP

```
Saat DetailSOP lama menjadi BERLAKU:
    ├── DetailSOP versi sebelumnya yang BERLAKU → DIGANTIKAN (otomatis trigger)
    └── Maksimal 1 versi BERLAKU per SOP (enforce via trigger MySQL)

Pembuatan versi baru:
    ├── Clone DetailSOP (versi + 1, status = DRAFT)
    └── Copy LangkahSOP, Lampiran, DasarHukum dari versi sebelumnya
```

---

## 6. State Machine — StatusSOP

```
                    ┌─────────────────────────────────────────┐
                    │              BERLAKU ◀──────────────┐   │
                    │                 │                   │   │
                    │            DIGANTIKAN           (versi  │
                    │                                   baru) │
                    └─────────────────────────────────────────┘

DRAFT
  │ (penyusun mulai edit)
  ▼
SEDANG_DISUSUN
  │ (PJ Penyusun submit)
  ▼
SIAP_DIEVALUASI
  │ (PJ Penyusun ajukan evaluasi)
  ▼
DIAJUKAN_EVALUASI
  │ (Evaluator mulai proses)
  ▼
SEDANG_DIEVALUASI
  │                    │
  │ (semua SESUAI)     │ (ada PERLU_PERBAIKAN)
  ▼                    ▼
SIAP_DIVERIFIKASI   REVISI_DARI_EVALUATOR
  │                    │
  │               (penyusun revisi + ajukan ulang)
  │                    └────────────────────────▶ DIAJUKAN_EVALUASI
  │ (PJ Evaluator verifikasi)
  ▼
DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI
  │ (TTE ditandatangani semua pihak)
  ▼
BERLAKU
  │ (dicabut)
  ▼
DICABUT
```

**Transisi yang valid (enforce di service layer):**

| Dari | Ke | Aktor | Guard |
|---|---|---|---|
| DRAFT | SEDANG_DISUSUN | PENYUSUN | Ada minimal 1 LangkahSOP |
| SEDANG_DISUSUN | SIAP_DIEVALUASI | PJ_PENYUSUN | Tidak ada komentar TERBUKA |
| SIAP_DIEVALUASI | DIAJUKAN_EVALUASI | PJ_PENYUSUN | — |
| DIAJUKAN_EVALUASI | SEDANG_DIEVALUASI | EVALUATOR | SOP masuk dalam PengajuanEvaluasi |
| SEDANG_DIEVALUASI | SIAP_DIVERIFIKASI | EVALUATOR | Semua NilaiEvaluasi = SESUAI |
| SEDANG_DIEVALUASI | REVISI_DARI_EVALUATOR | EVALUATOR | Ada NilaiEvaluasi = PERLU_PERBAIKAN |
| REVISI_DARI_EVALUATOR | SEDANG_DISUSUN | PENYUSUN | — |
| SIAP_DIVERIFIKASI | DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI | PJ_EVALUATOR | — |
| DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI | BERLAKU | SYSTEM | TTE dokumen lengkap |
| BERLAKU | DICABUT | PJ_EVALUATOR | — |

---

## 7. Alur Bisnis — Evaluasi SOP

### 7.1 Pembuatan Pengajuan Evaluasi

```
[PJ Evaluator] ──▶ Buat PengajuanEvaluasi
        │
        ├── jenis: TERJADWAL (terjadwal reguler) atau MANDIRI (ad-hoc)
        ├── status = SEDANG_DIEVALUASI (awal siklus sama untuk terjadwal/mandiri)
        ├── Assign SOP-SOP OPD ke NilaiEvaluasi (hasil = NULL awalnya)
        └── Kirim notifikasi ke Evaluator yang ditugaskan
```

### 7.2 Proses Evaluasi

```
[Evaluator] ──▶ Isi NilaiEvaluasi per DetailSOP
        │
        ├── hasil: SESUAI | PERLU_PERBAIKAN
        ├── catatan (opsional, wajib jika PERLU_PERBAIKAN)
        ├── Catat LogNilaiEvaluasi (hasilSebelum → hasilSesudah)
        └── Optimistic locking: update WHERE version = ? AND version = version + 1

[Evaluator] ──▶ Selesaikan Evaluasi (trigger kirim ke PJ)
        │
        ├── GUARD: status pengajuan = SEDANG_DIEVALUASI
        ├── GUARD: semua NilaiEvaluasi sudah terisi (hasil IS NOT NULL)
        ├── Set diselesaikanOlehId, tanggalDiselesaikan
        └── Transisi status → SELESAI_DIEVALUASI
```

### 7.3 Verifikasi & Penandatanganan

```
[PJ Evaluator] ──▶ Verifikasi hasil evaluasi
        │
        ├── GUARD: status = SELESAI_DIEVALUASI
        ├── Set diverifikasiOlehUserId
        └── Transisi → DIVERIFIKASI_PJ_EVALUATOR

[PJ Penyusun] ──▶ Tanda tangan Berita Acara (TTE)
        │
        ├── GUARD: status = DIVERIFIKASI_PJ_EVALUATOR
        ├── Set ditandatanganiOlehPjPenyusunUserId, tanggalTTDBaPjPenyusun
        └── Transisi → DITANDATANGANI_PJ_PENYUSUN

[PJ Evaluator] ──▶ Finalisasi (TTE final)
        │
        └── Transisi → SELESAI
            Trigger: SOP terkait yang SESUAI → BERLAKU
```

### 7.4 Kalkulasi Nilai OPD

```
nilaiOPD = round(
    (jumlah NilaiEvaluasi.hasil = SESUAI / total NilaiEvaluasi) * 100
)
Dihitung saat status transisi ke SELESAI_DIEVALUASI
```

---

## 8. State Machine — StatusPengajuanEvaluasi

```
SEDANG_DIEVALUASI
  │ (semua nilai terisi, Evaluator selesaikan)
  ▼
SELESAI_DIEVALUASI
  │ (PJ Evaluator verifikasi)
  ▼
DIVERIFIKASI_PJ_EVALUATOR
  │ (PJ Penyusun tanda tangan BA)
  ▼
DITANDATANGANI_PJ_PENYUSUN
  │ (PJ Evaluator finalisasi + TTE)
  ▼
SELESAI
```

**Transisi valid:**

| Dari | Ke | Aktor | Guard |
|---|---|---|---|
| SEDANG_DIEVALUASI | SELESAI_DIEVALUASI | EVALUATOR | Semua hasil IS NOT NULL |
| SELESAI_DIEVALUASI | DIVERIFIKASI_PJ_EVALUATOR | PJ_EVALUATOR | — |
| DIVERIFIKASI_PJ_EVALUATOR | DITANDATANGANI_PJ_PENYUSUN | PJ_PENYUSUN | KredensialTTE aktif |
| DITANDATANGANI_PJ_PENYUSUN | SELESAI | PJ_EVALUATOR | DokumenTte lengkap |

---

## 9. Alur Bisnis — TTE (Tanda Tangan Elektronik)

### 9.1 Pendaftaran Kredensial TTE

```
[Pengguna] ──▶ Daftar TTE
        │
        ├── Buat KredensialTTE (hashPin)
        ├── emailTerverifikasi = false
        ├── Generate tokenVerifikasi + tokenExpiry = now() + TOKEN_EXPIRY_HOURS
        ├── Kirim email verifikasi
        └── Pengguna klik link → emailTerverifikasi = true, hapus token
```

### 9.2 Penandatanganan Dokumen

```
[Pengguna bereran KEPALA_OPD / PJ_PENYUSUN / PJ_EVALUATOR]
        │
        ├── GUARD: KredensialTTE.emailTerverifikasi = true
        ├── GUARD: DokumenTte belum ditandatangani peran ini
        │         (UNIQUE constraint: dokumenTteId + peran)
        ├── Verifikasi PIN (bandingkan hashPin)
        ├── Generate tanda tangan digital (RSA/ECDSA)
        ├── Simpan RiwayatTandaTangan:
        │     signatureValue, signatureAlgorithm, signatureFormat
        │     certSerialNumber, certIssuer, certSubject, certFingerprint
        │     certValidFrom, certValidTo
        └── Update hashDokumen (hash dokumen + semua signature sebelumnya)
```

### 9.3 Jenis Dokumen TTE

| Jenis | Trigger Pembuatan | Penandatangan |
|---|---|---|
| `SOP_BERLAKU` | SOP lolos evaluasi penuh | KEPALA_OPD → PJ_PENYUSUN → PJ_EVALUATOR |
| `BERITA_ACARA_EVALUASI` | Pengajuan evaluasi selesai diverifikasi | PJ_PENYUSUN → PJ_EVALUATOR |
| `LAINNYA` | Ad-hoc | Sesuai kebutuhan |

---

## 10. Konstanta & Business Rules Wajib

### 10.1 Konstanta Aplikasi

```typescript
// server/src/common/constants/business.constants.ts

/** Jendela merge untuk LogEditSOP (menit) */
export const MERGE_WINDOW_MINUTES = 5;

/** Masa berlaku token verifikasi TTE (jam) */
export const TTE_TOKEN_EXPIRY_HOURS = 24;

/** Panjang minimum PIN TTE */
export const TTE_PIN_MIN_LENGTH = 6;

/** Panjang maksimum PIN TTE */
export const TTE_PIN_MAX_LENGTH = 20;

/** Algoritma hash default untuk dokumen TTE */
export const TTE_HASH_ALGORITHM = 'SHA-256';

/** Algoritma signature default */
export const TTE_SIGNATURE_ALGORITHM = 'RSA-PSS';

/** Format signature */
export const TTE_SIGNATURE_FORMAT = 'PKCS#7';

/** Batas versi SOP aktif per SOP (enforce via trigger) */
export const MAX_BERLAKU_PER_SOP = 1;

/** Batas PJ Evaluator Organisasi (enforce via trigger) */
export const MAX_PJ_EVALUATOR_ORGANISASI = 1;

/** Pagination default */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

/** Satuan waktu langkah SOP (pemetaan ke label Indonesia) */
export const SATUAN_WAKTU_LABEL: Record<string, string> = {
  m: 'Menit',
  h: 'Jam',
  d: 'Hari',
  w: 'Minggu',
  mo: 'Bulan',
  y: 'Tahun',
};
```

### 10.2 Transisi Status yang Diizinkan

```typescript
// server/src/common/constants/status-transitions.constants.ts

import { StatusSOP, StatusPengajuanEvaluasi, PeranPengguna } from '...';

export const TRANSISI_STATUS_SOP: Record<StatusSOP, StatusSOP[]> = {
  DRAFT:                                    ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN:                           ['SIAP_DIEVALUASI'],
  SIAP_DIEVALUASI:                          ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI:                        ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI:                        ['SIAP_DIVERIFIKASI', 'REVISI_DARI_EVALUATOR'],
  REVISI_DARI_EVALUATOR:                    ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI:                        ['DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI'],
  DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI:     ['BERLAKU'],
  BERLAKU:                                  ['DICABUT', 'DIGANTIKAN'],
  DIGANTIKAN:                               [],
  DICABUT:                                  [],
};

export const TRANSISI_STATUS_PENGAJUAN: Record<StatusPengajuanEvaluasi, StatusPengajuanEvaluasi[]> = {
  SEDANG_DIEVALUASI:          ['SELESAI_DIEVALUASI'],
  SELESAI_DIEVALUASI:         ['DIVERIFIKASI_PJ_EVALUATOR'],
  DIVERIFIKASI_PJ_EVALUATOR:  ['DITANDATANGANI_PJ_PENYUSUN'],
  DITANDATANGANI_PJ_PENYUSUN: ['SELESAI'],
  SELESAI:                    [],
};
```

### 10.3 Invariant Database (MySQL Trigger)

```sql
-- WAJIB ada di migration / seed trigger:

-- 1. Hanya 1 OPD boleh isPjEvaluatorOrganisasi = TRUE
-- BEFORE INSERT/UPDATE pada OPD:
--   IF NEW.isPjEvaluatorOrganisasi = TRUE
--     AND (SELECT COUNT(*) FROM OPD WHERE isPjEvaluatorOrganisasi = TRUE AND opdId != NEW.opdId) > 0
--   THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Hanya satu OPD PJ Evaluator Organisasi diizinkan';

-- 2. Hanya 1 DetailSOP status BERLAKU per SOP
-- BEFORE UPDATE pada DetailSOP:
--   IF NEW.status = 'BERLAKU'
--   THEN UPDATE DetailSOP SET status = 'DIGANTIKAN'
--        WHERE sopId = NEW.sopId AND status = 'BERLAKU' AND detailSopId != NEW.detailSopId;
```

### 10.4 Guard Bisnis (Service Layer)

```typescript
// Guards wajib di setiap service sebelum transisi status

// SOP: SEDANG_DISUSUN → SIAP_DIEVALUASI
// GUARD: tidak ada Komentar status = TERBUKA pada detailSopId
// GUARD: ada minimal 1 LangkahSOP

// SOP: DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI
// GUARD: SOP masuk dalam PengajuanEvaluasi yang aktif

// Evaluasi: SEDANG_DIEVALUASI → SELESAI_DIEVALUASI
// GUARD: COUNT(NilaiEvaluasi WHERE hasil IS NULL) = 0

// TTE: Sign dokumen
// GUARD: KredensialTTE.emailTerverifikasi = true
// GUARD: RiwayatTandaTangan (dokumenTteId, peran) belum ada
// GUARD: Optimistic locking — version match

// LangkahSOP KEPUTUSAN:
// GUARD: langkahSelanjutnyaYaId IS NOT NULL
// GUARD: langkahSelanjutnyaTidakId IS NOT NULL
```

---

## 11. Acceptance Criteria (Given–When–Then)

### 11.1 Manajemen Pengguna

---

**AC-USR-01: Pendaftaran pengguna berhasil**
```
Given: Admin terotentikasi
  And: NIP "198001012010011001" belum digunakan
  And: Email "budi@opd.go.id" belum digunakan
When: Admin POST /pengguna dengan payload valid
Then: Response 201 Created
  And: { success: true, data.peran = "PENYUSUN" }
  And: Pengguna tersimpan di DB dengan deletedAt = NULL
```

**AC-USR-02: NIP duplikat ditolak**
```
Given: Pengguna dengan NIP "198001012010011001" sudah ada
When: Admin POST /pengguna dengan NIP yang sama
Then: Response 409 Conflict
  And: { success: false, message: "NIP sudah digunakan" }
```

**AC-USR-03: Kepala OPD hanya 1 per OPD**
```
Given: OPD "A" sudah punya Kepala OPD (userId = "X")
When: Admin assign pengguna "Y" sebagai KEPALA_OPD di OPD "A"
Then: Response 409 Conflict
  And: { success: false, message: "OPD sudah memiliki Kepala OPD" }
```

---

### 11.2 Authoring SOP

---

**AC-SOP-01: Buat SOP baru**
```
Given: Penyusun terotentikasi di OPD "A"
When: POST /sop dengan { judul: "SOP Pengadaan Barang" }
Then: Response 201
  And: DetailSOP versi 1 dibuat dengan status = DRAFT
  And: nomorSOP ter-generate dan unik global
  And: dibuatOlehId = userId penyusun
```

**AC-SOP-02: Tambah langkah KEPUTUSAN tanpa cabang ditolak**
```
Given: DetailSOP dalam status SEDANG_DISUSUN
When: POST /sop/:id/langkah dengan jenis = KEPUTUSAN
  And: langkahSelanjutnyaYaId = NULL atau langkahSelanjutnyaTidakId = NULL
Then: Response 422 Unprocessable Entity
  And: { success: false, message: "Langkah keputusan wajib memiliki cabang Ya dan Tidak" }
```

**AC-SOP-03: Urutan langkah duplikat ditolak**
```
Given: DetailSOP sudah punya langkah urutan 1
When: POST /sop/:id/langkah dengan urutan = 1
Then: Response 409 Conflict
  And: { success: false, message: "Urutan langkah sudah digunakan" }
```

**AC-SOP-04: Submit SOP dengan komentar terbuka ditolak**
```
Given: DetailSOP status SEDANG_DISUSUN
  And: Ada 1 Komentar status TERBUKA
When: PJ Penyusun PATCH /sop/:id/status { status: "SIAP_DIEVALUASI" }
Then: Response 422
  And: { success: false, message: "Selesaikan semua komentar sebelum mengajukan SOP" }
```

**AC-SOP-05: Transisi status tidak valid ditolak**
```
Given: DetailSOP status BERLAKU
When: PATCH /sop/:id/status { status: "DRAFT" }
Then: Response 422
  And: { success: false, message: "Transisi status tidak diizinkan" }
```

**AC-SOP-06: Hanya 1 versi BERLAKU per SOP**
```
Given: DetailSOP versi 1 status BERLAKU
When: DetailSOP versi 2 transisi ke BERLAKU
Then: DetailSOP versi 1 otomatis berubah ke DIGANTIKAN
  And: Hanya versi 2 yang berstatus BERLAKU
```

**AC-SOP-07: Log edit di-merge dalam merge window**
```
Given: Pengguna "X" edit header DetailSOP pada T+0 (log terbuka)
When: Pengguna "X" edit header yang sama pada T+3 menit
Then: LogEditSOP yang ada di-update (meta.count bertambah)
  And: Tidak ada LogEditSOP baru dibuat
```

**AC-SOP-08: Log edit baru setelah merge window**
```
Given: Pengguna "X" punya LogEditSOP terbuka yang dibuat T-10 menit
When: Pengguna "X" edit header lagi sekarang
Then: LogEditSOP lama di-close (closedAt = now())
  And: LogEditSOP baru dibuat
```

---

### 11.3 Evaluasi SOP

---

**AC-EVL-01: Selesaikan evaluasi gagal jika ada nilai belum diisi**
```
Given: PengajuanEvaluasi status SEDANG_DIEVALUASI
  And: 3 dari 5 NilaiEvaluasi sudah terisi, 2 masih NULL
When: Evaluator POST /evaluasi/:id/selesai
Then: Response 422
  And: { success: false, message: "Semua SOP harus sudah dinilai sebelum menyelesaikan evaluasi" }
```

**AC-EVL-02: Nilai OPD dihitung otomatis**
```
Given: PengajuanEvaluasi dengan 5 NilaiEvaluasi
  And: 4 hasil = SESUAI, 1 hasil = PERLU_PERBAIKAN
When: Evaluator selesaikan evaluasi
Then: PengajuanEvaluasi.nilaiOPD = 80
```

**AC-EVL-03: Log nilai evaluasi tercatat**
```
Given: NilaiEvaluasi.hasil = NULL, catatan = NULL
When: Evaluator PATCH /nilai-evaluasi/:id dengan { hasil: "SESUAI", catatan: "Baik" }
Then: LogNilaiEvaluasi dibuat:
  hasilSebelum = NULL, hasilSesudah = SESUAI
  catatanSebelum = NULL, catatanSesudah = "Baik"
```

**AC-EVL-04: Optimistic locking mencegah race condition**
```
Given: NilaiEvaluasi.version = 3
When: Evaluator A PATCH /nilai-evaluasi/:id dengan version = 2 (stale)
Then: Response 409 Conflict
  And: { success: false, message: "Data telah diperbarui oleh pengguna lain" }
```

**AC-EVL-05: Evaluasi terjadwal hanya bisa dibuat oleh PJ Evaluator**
```
Given: Pengguna dengan peran EVALUATOR
When: POST /pengajuan-evaluasi dengan jenis = TERJADWAL
Then: Response 403 Forbidden
```

---

### 11.4 TTE (Tanda Tangan Elektronik)

---

**AC-TTE-01: Daftar TTE — kirim email verifikasi**
```
Given: Pengguna belum punya KredensialTTE
When: POST /tte/kredensial dengan { pin: "123456" }
Then: Response 201
  And: KredensialTTE dibuat dengan emailTerverifikasi = false
  And: Email verifikasi dikirim ke pengguna.email
  And: tokenExpiry = now() + 24 jam
```

**AC-TTE-02: Token verifikasi kedaluwarsa ditolak**
```
Given: KredensialTTE dengan tokenExpiry = kemarin
When: GET /tte/verifikasi?token=...
Then: Response 400 Bad Request
  And: { success: false, message: "Token verifikasi sudah kedaluwarsa" }
```

**AC-TTE-03: Sign dokumen — email belum terverifikasi ditolak**
```
Given: KredensialTTE.emailTerverifikasi = false
When: POST /tte/sign dengan { dokumenTteId, pin }
Then: Response 403 Forbidden
  And: { success: false, message: "Email TTE belum diverifikasi" }
```

**AC-TTE-04: Sign dokumen — PIN salah ditolak**
```
Given: KredensialTTE.emailTerverifikasi = true
  And: hashPin tersimpan = bcrypt("benar123")
When: POST /tte/sign dengan pin = "salah999"
Then: Response 401 Unauthorized
  And: { success: false, message: "PIN tidak valid" }
```

**AC-TTE-05: Peran yang sama tidak bisa tanda tangan dua kali**
```
Given: RiwayatTandaTangan (dokumenTteId = "X", peran = PJ_PENYUSUN) sudah ada
When: PJ Penyusun yang sama POST /tte/sign untuk dokumen "X"
Then: Response 409 Conflict
  And: { success: false, message: "Dokumen sudah ditandatangani oleh peran ini" }
```

---

### 11.5 Regulasi

---

**AC-REG-01: Kombinasi nomor + tahun unik**
```
Given: Peraturan nomor = "01/2023" tahun = 2023 sudah ada
When: POST /peraturan dengan nomor = "01/2023", tahun = 2023
Then: Response 409 Conflict
  And: { success: false, message: "Peraturan dengan nomor dan tahun ini sudah ada" }
```

**AC-REG-02: Dasar hukum SOP dari peraturan yang tersedia**
```
Given: Peraturan "X" ada di sistem
  And: DetailSOP "Y" dalam status DRAFT atau SEDANG_DISUSUN
When: POST /sop/:id/dasar-hukum dengan peraturanId = "X"
Then: Response 201
  And: DasarHukum (detailSopId = "Y", peraturanId = "X") tersimpan
```

---

## Lampiran: Error Code Matrix

| Kode HTTP | Kondisi Bisnis |
|---|---|
| 400 | Input tidak valid, token kedaluwarsa |
| 401 | PIN salah, token tidak valid |
| 403 | Peran tidak diizinkan, email belum diverifikasi |
| 404 | Resource tidak ditemukan |
| 409 | Duplikat data, race condition (optimistic lock), constraint unik |
| 422 | Guard bisnis gagal (transisi tidak valid, komentar terbuka, dll) |
| 500 | Kesalahan sistem tidak terduga |

---

*Dokumen ini harus diperbarui setiap kali ada perubahan skema atau aturan bisnis baru.*

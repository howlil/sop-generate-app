# Sistem Informasi SOP Biro Organisasi

## What This Is

Sistem informasi berbasis web untuk mengelola siklus hidup Standard Operating Procedure (SOP) di lingkungan instansi pemerintah. Sistem ini memfasilitasi alur kerja berjenjang mulai dari penyusunan SOP oleh Tim Penyusun, evaluasi oleh Tim Evaluasi, verifikasi oleh Biro Organisasi, hingga pengesahan oleh Kepala OPD. Tujuan utama sistem adalah digitalisasi proses pengelolaan SOP yang sebelumnya manual menjadi terstruktur, teraudit, dan dapat dipantau secara real-time oleh seluruh pemangku kepentingan.

Sistem ini digunakan oleh empat aktor utama:
- **Tim Penyusun** — berada di bawah OPD masing-masing, menyusun SOP
- **Kepala OPD** — pimpinan unit kerja, mengesahkan SOP menjadi berlaku
- **Tim Evaluasi** — dibentuk Biro Organisasi, mengevaluasi kualitas SOP
- **Biro Organisasi** — administrator sistem, mengelola data master dan proses evaluasi

## Core Value

Tim Penyusun dapat menyusun SOP sesuai prosedur baku dengan diagram flowchart/BPMN, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap melalui Tanda Tangan Elektronik (TTE).

## Single Source of Truth

**Dokumen referensi utama:**
- `docs/ERD-DESKRIPSI.md` — Deskripsi entitas dan relasi database (legenda delete behavior, constraint FK)
- `docs/SCHEMA-CONSTRAINTS.md` — Constraint bisnis di luar Prisma (optimistic locking, unique constraint, invariant)
- `docs/PRD-ANALISIS-SISTEM.md` — Spesifikasi use case dan requirements fungsional/non-fungsional

**Prinsip:** Semua planning, implementasi, dan dokumentasi harus selaras dengan ketiga dokumen di atas.

## Requirements Status

### Validated (Client Prototype)

- ✓ UI prototype lengkap untuk semua 4 role (Tim Penyusun, Kepala OPD, Tim Evaluasi, Biro Organisasi)
- ✓ Alur navigasi role-based dengan route guard berbasis Zustand
- ✓ Komponen BPMN/flowchart diagram untuk visualisasi prosedur SOP
- ✓ Komponen TTE setup, PIN verification, dan signature block
- ✓ Komponen Berita Acara dan riwayat status/komentar
- ✓ Domain types: SOP, DetailSOP, Peraturan, OPD, TTE, PengajuanEvaluasi, NilaiEvaluasi, Pelaksana
- ✓ Seed data JSON untuk semua entitas utama

### ✅ Complete (Backend v1.0 — All 89 Requirements Implemented)

**Database & Infrastruktur** ✅
- [x] DB-01: Skema Prisma mengimplementasikan seluruh 20 tabel ERD
- [x] DB-02: Relasi antar tabel (FK, constraints) benar dengan delete behavior yang tepat
- [x] DB-03: Enum Prisma untuk semua status field
- [x] DB-04: Migration berjalan clean pada MariaDB kosong
- [x] DB-05: Indexing strategy untuk FK dan query pattern umum

**Auth & Users** ✅
- [x] AUTH-01–06: Login JWT, role guard, manajemen akun
- [x] AUTH-07–08: Constraint 1 KEPALA_OPD + 1 KOORDINATOR_TIM_PENYUSUN per OPD

**OPD & Peraturan** ✅
- [x] OPD-01–07: CRUD OPD dengan agregat, soft-delete support
- [x] PRT-01–09: CRUD Peraturan dengan versioning, status BERLAKU/DICABUT

**SOP Core & Metadata** ✅
- [x] SOP-01–17: CRUD SOP + DetailSOP, alur status lengkap
- [x] SOP-18–24: Metadata, dasar hukum, SOP terkait, lampiran teks

**Pelaksana & Prosedur** ✅
- [x] PLK-01–08: Master pelaksana, CRUD prosedur steps, flowchart branching

**Tim & Evaluasi** ✅
- [x] TIM-01–09: Manajemen AnggotaTimPenyusun & AnggotaTimEvaluasi
- [x] EVL-01–13: PengajuanEvaluasi, hasil evaluasi, optimistic locking

**TTE & Berita Acara** ✅
- [x] TTE-01–08: KredensialTTE, RiwayatTandaTangan, urutan TTE
- [x] TTE-09–13: Constraint BA, signing history

**Audit Log** ✅
- [x] AUD-01–06: LogEditSOP otomatis per perubahan SOP

### Out of Scope

- Real-time chat/komentar — belum dibutuhkan, tambah kompleksitas
- Mobile app — web-first, mobile phase berikutnya
- Multi-tenant (multi-kota) — v1.0 fokus satu instansi pemerintah
- Versioning SOP (branching) — cukup versi integer untuk v1
- Workflow approval multi-step custom — alur sudah fix sesuai regulasi
- Export PDF/Excel — deferred ke v2.0

## Context

**Codebase state:** Client UI prototype 100% lengkap dengan data seed JSON. Server adalah NestJS scaffold dengan Users + Posts module sebagai pattern reference — belum ada domain module (SOP, TTE, Evaluasi, dll).

**Tech stack established:**
- Server: NestJS + Prisma + MariaDB, JWT auth (deps installed, not wired), Winston logging, Swagger
- Client: React + TanStack Router (file-based) + Zustand + Tailwind + shadcn/ui

**Key domain concepts:**
- **DetailSOP** adalah entitas versi dokumen, bukan SOP (1 SOP → n DetailSOP)
- **PengajuanEvaluasi** menggantikan konsep "batch" atau "VerifikasiBatch"
- **RiwayatTandaTangan** menyimpan TTE (bukan field isVerified/isSignedByKoordinator)
- **LogEditSOP** adalah audit trail kolaborasi Tim Penyusun (bukan LogAudit)
- **Hasil evaluasi**: SESUAI / TIDAK_SESUAI (bukan "Sesuai/Perlu Perbaikan")

**Berita Acara — verifikasi vs pengesahan (wajib membedakan istilah):**
- **Verifikasi Berita Acara** hanya dilakukan oleh **Biro Organisasi** dan **Koordinator Tim Penyusun** (berurutan: Biro dulu, lalu Koordinator pada BA OPD yang sama)
- **Pengesahan SOP** (menjadi BERLAKU) hanya **Kepala OPD** — dilakukan per SOP setelah BA lengkap

**Urutan teknis setelah evaluasi selesai:**
1. Verifikasi BA oleh Biro Organisasi → status pengajuan: DIVERIFIKASI_BIRO, SOP: DIVERIFIKASI_BIRO_ORGANISASI
2. Verifikasi BA oleh Koordinator Tim Penyusun → status pengajuan: DITANDATANGANI_KOORDINATOR
3. Pengesahan SOP oleh Kepala OPD (per SOP) → status SOP: BERLAKU

**Constraint kritis dari ERD:**
- 1 OPD hanya boleh punya 1 KEPALA_OPD + 1 KOORDINATOR_TIM_PENYUSUN aktif (enforce via SELECT FOR UPDATE)
- Maks 1 pengajuan aktif per OPD per jenis (TERJADWAL/MANDIRI)
- Optimistic locking pada NilaiEvaluasi via field version
- XOR constraint: RiwayatTandaTangan harus tepat satu dari sopDetailId atau pengajuanEvaluasiId
- Invariant: (status = AKTIF) ↔ (berakhirPada IS NULL) untuk keanggotaan tim

## Constraints

- **Tech Stack**: NestJS + Prisma + MariaDB (server), React + TanStack Router (client) — tidak berubah
- **Scope**: v1.0 = backend implementation only; client UI sudah ada, tinggal integration
- **Database**: MariaDB — bukan PostgreSQL; Prisma schema harus kompatibel
- **Auth**: JWT stateless, tidak ada session store — token mengandung userId, role, opdId
- **SOP numbering**: Format otomatis `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]` untuk setiap DetailSOP baru
- **Status flow**: Alur status SOP fix sesuai regulasi — tidak boleh diubah
- **Skills Reference**: Semua development menggunakan skill dari `.skills/` sebagai guidance:
  - `.skills/backend.md` — Spec-driven NestJS development
  - `.skills/database.md` — Database audit dan invariant enforcement
  - `.skills/system-arch.md` — System diagram generation (BPMN, Use Case, Sequence, Class)
  - `.skills/sytem-analyst.md` — PRD generation dan use case analysis
  - `.skills/system-fe-prd.md` — Frontend to PRD reverse engineering
  - `.skills/fullstack-audit.md` — Fullstack codebase audit
  - `.skills/qa.md` — Quality assurance dan testing strategy
  - `.skills/db-audit.md` — Database-specific audit
  - `.skills/frontend-codereview.md` — Frontend code review

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Client-first, server-follows | UI prototype sudah lengkap sebagai spec backend | — Pending |
| NestJS Clean Architecture | Pola Controller→Service→Repository sudah ada di scaffold | — Pending |
| MariaDB (bukan PostgreSQL) | Infrastruktur existing instansi | — Pending |
| JWT stateless (opdId in token) | Filtering per OPD tanpa DB lookup per request | — Pending |
| TTE: PIN hash client-side (demo) → server-side | Migrasi dari demo mode (PIN 12345) ke verifikasi server | — Pending |
| ERD sebagai SSOT | Hindari inkonsistensi terminologi dan constraint | Implemented in docs/ |
| DetailSOP sebagai versi dokumen | Mendukung historisasi dan versioning sederhana | — Pending |
| PengajuanEvaluasi (bukan VerifikasiBatch) | Terminologi konsisten dengan ERD | — Pending |

## Database normalization (3NF)

Skema Prisma mengikuti normalisasi hingga 3NF: nilai berulang dipisah ke tabel anak/join; kunci komposit hanya pada tabel M:N murni. Bagian berikut mendokumentasikan **denormalisasi disengaja** atau pola yang disengaja agar perilaku bisnis/audit jelas.

| Area | Keputusan | Alasan |
|------|-----------|--------|
| **LogEditSOP.aktorRole**, **RiwayatTandaTangan.peran** | Disimpan di baris log/signature | Snapshot peran pada saat kejadian; tidak bergantung pada mutasi `Pengguna` kemudian. |
| **DetailSOP PIC** | `picUserId` (FK opsional ke `Pengguna`) + `picName` / `picNumber` / `picRole` opsional | Bila PIC adalah pengguna sistem, gunakan FK (3NF terhadap `Pengguna`). Bila PIC eksternal atau snapshot teks saja, isi kolom teks; tidak wajib mengisi keduanya. |
| **KredensialTTE** | Hanya field khusus TTE (`pinHash`, `peran`, token verifikasi, dll.) | `nip`, `jabatan`, `pangkat`, `nohp` tidak diduplikasi; single source of truth di `Pengguna` (join lewat `userId`). |
| **institutionLines** (Text) | Satu kolom multi-baris | Tetap 1NF pada level penyimpanan; pemecahan ke tabel baris hanya jika domain memerlukan entitas terpisah per baris. |
| **BA: verifikasi vs pengesahan** | Verifikasi = Biro + Koordinator; pengesahan = Kepala OPD saja | Memenuhi pemisahan peran; UI/API memakai istilah konsisten. |
| **DiagramLayout** | Menyimpan delta posisi/routing manual (bukan full layout) | Auto-layout sebagai default; user override disimpan sebagai delta efisien. |

---
*Last updated: 2026-04-01 — Aligned with ERD-DESKRIPSI.md dan PRD-ANALISIS-SISTEM.md v1.3*

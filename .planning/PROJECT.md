# Sistem Informasi SOP Biro Organisasi

## What This Is

Sistem informasi berbasis web untuk pengelolaan Standard Operating Procedure (SOP) instansi pemerintah. Tim Penyusun menyusun SOP melalui alur kerja berjenjang, Tim Evaluasi mengevaluasinya, dan Biro Organisasi memverifikasi serta mengesahkannya secara digital menggunakan Tanda Tangan Elektronik (TTE). Sistem ini digunakan oleh empat peran: Tim Penyusun, Kepala OPD, Tim Evaluasi, dan Biro Organisasi.

## Core Value

Tim Penyusun dapat menyusun SOP sesuai prosedur baku, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap.

## Requirements

### Validated

<!-- Existing client prototype — UI fully implemented for all roles -->

- ✓ UI prototype lengkap untuk semua 4 role (Tim Penyusun, Kepala OPD, Tim Evaluasi, Biro Organisasi) — existing client
- ✓ Alur navigasi role-based dengan route guard berbasis Zustand — existing client
- ✓ Komponen BPMN/flowchart diagram untuk visualisasi prosedur SOP — existing client
- ✓ Komponen TTE setup, PIN verification, dan signature block — existing client (demo mode)
- ✓ Komponen Berita Acara dan riwayat status/komentar — existing client
- ✓ Domain types: SOP, Peraturan, OPD, TTE, Evaluasi, VerifikasiBatch, Pelaksana — existing client
- ✓ Seed data JSON untuk semua entitas utama — existing client

### Active

<!-- Backend v1.0 — building the server layer that the client will consume -->

**Database & Infrastruktur**
- [ ] DB-01: Skema Prisma mengimplementasikan seluruh 18 tabel ERD
- [ ] DB-02: Relasi antar tabel (FK, constraints) benar di schema
- [ ] DB-03: Enum Prisma untuk semua status field
- [ ] DB-04: Migration berjalan clean pada MariaDB kosong

**Auth & Users**
- [ ] AUTH-01–06: Login JWT, role guard, manajemen akun

**OPD & Peraturan**
- [ ] OPD-01–05: CRUD OPD dengan agregat (totalSOP, sopBerlaku, sopDraft)
- [ ] PRT-01–05: CRUD Peraturan dengan versioning dan status DICABUT

**SOP Core & Metadata**
- [ ] SOP-01–17: CRUD SOP, alur status lengkap, nomor otomatis, filter

**Pelaksana & Prosedur**
- [ ] PLK-01–05: Master pelaksana, CRUD prosedur steps, flowchart branching

**Tim & Evaluasi**
- [ ] TIM-01–05: Manajemen anggota Tim Penyusun & Tim Evaluasi
- [ ] EVL-01–08: Batch evaluasi, penugasan, hasil evaluasi, rekap tahunan

**TTE & Berita Acara**
- [ ] TTE-01–08: Pendaftaran profil TTE, penandatanganan BA, TTD per SOP, audit TTE

**Audit Log**
- [ ] AUD-01–03: Audit log otomatis per perubahan status SOP

### Out of Scope

- Real-time chat/komentar — belum dibutuhkan, tambah kompleksitas
- Mobile app — web-first, mobile phase berikutnya
- Multi-tenant (multi-kota) — v1.0 fokus satu instansi pemerintah
- Versioning SOP (branching) — cukup versi integer untuk v1
- Workflow approval multi-step custom — alur sudah fix sesuai regulasi
- Export PDF/Excel — deferred ke v2.0

## Context

**Codebase state:** Client UI prototype 100% lengkap dengan data seed JSON. Server adalah NestJS scaffold dengan Users + Posts module sebagai pattern reference — belum ada domain module (SOP, TTE, Evaluasi, dll). Database schema belum didefinisikan untuk domain SOP.

**Tech stack established:**
- Server: NestJS + Prisma + MariaDB, JWT auth (deps installed, not wired), Winston logging, Swagger
- Client: React + TanStack Router (file-based) + Zustand + Tailwind + shadcn/ui

**Key concern:** Client menggunakan localStorage + seed JSON saat ini. Backend integration belum ada — client perlu dikoneksikan ke API setelah backend selesai.

**Domain:** Sistem pemerintahan Indonesia. UI dan komentar dalam Bahasa Indonesia. Roles: `biro-organisasi`, `tim-evaluasi`, `tim-penyusun`, `kepala-opd`.

**TTE workflow sequence (wajib berurutan):**
1. Biro Organisasi TTD Berita Acara → semua SOP dalam batch → `DIVERIFIKASI_BIRO_ORGANISASI`
2. Koordinator Tim Penyusun TTD Berita Acara (hanya setelah Biro TTD)
3. Kepala OPD TTD per SOP → SOP → `BERLAKU`

## Constraints

- **Tech Stack**: NestJS + Prisma + MariaDB (server), React + TanStack Router (client) — tidak berubah
- **Scope**: v1.0 = backend implementation only; client UI sudah ada, tinggal integration
- **Database**: MariaDB — bukan PostgreSQL; Prisma schema harus kompatibel
- **Auth**: JWT stateless, tidak ada session store — token mengandung userId + role + opdId
- **SOP numbering**: Format otomatis `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]`
- **Status flow**: Alur status SOP fix sesuai regulasi — tidak boleh diubah

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Client-first, server-follows | UI prototype sudah lengkap sebagai spec backend | — Pending |
| NestJS Clean Architecture | Pola Controller→Service→Repository sudah ada di scaffold | — Pending |
| MariaDB (bukan PostgreSQL) | Infrastruktur existing instansi | — Pending |
| JWT stateless (opdId in token) | Filtering per OPD tanpa DB lookup per request | — Pending |
| TTE: PIN hash client-side (demo) → server-side | Migrasi dari demo mode (PIN 12345) ke verifikasi server | — Pending |

---
*Last updated: 2026-03-25 after initialization*

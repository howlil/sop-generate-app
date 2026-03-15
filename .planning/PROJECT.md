# Sistem Informasi SOP Biro Organisasi

## What This Is

Aplikasi web untuk manajemen Standard Operating Procedure (SOP) lingkup pemerintah daerah. Digunakan oleh Biro Organisasi untuk mengawasi, mengevaluasi, dan mengesahkan SOP dari seluruh OPD (Organisasi Perangkat Daerah) di bawahnya. Sistem mendukung alur kerja lengkap dari penyusunan SOP oleh Tim Penyusun OPD hingga pengesahan elektronik (TTE) oleh Kepala OPD dan Biro Organisasi.

## Core Value

Tim Penyusun dapat menyusun SOP sesuai prosedur baku, dan Biro Organisasi dapat mengevaluasi serta mengesahkan SOP secara digital dengan jejak audit yang lengkap.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — milestone v1.0 in progress)

### Active

<!-- Current scope: v1.0 Backend Implementation -->

- [ ] Database schema penuh (18 tabel) sesuai ERD yang disetujui
- [ ] Autentikasi & otorisasi berbasis role (JWT + 4 role)
- [ ] CRUD OPD
- [ ] CRUD Peraturan (dasar hukum SOP)
- [ ] CRUD SOP dengan transisi status
- [ ] Manajemen Tim Penyusun & Tim Evaluasi
- [ ] Manajemen Pelaksana SOP & Prosedur (flowchart)
- [ ] Evaluasi & Verifikasi Batch SOP
- [ ] TTE (Tanda Tangan Elektronik)
- [ ] Audit Log SOP

### Out of Scope

- Real-time notifications — kompleksitas tinggi, belum dibutuhkan
- Mobile app — web-first
- PDF export server-side — bisa dilakukan client-side di phase berikutnya
- Multi-tenant (multi-kota) — v1 fokus satu instansi

## Context

- **Client prototype** selesai: seluruh UI dan alur kerja sudah diimplementasi di `client/src/` dengan mock data (seed JSON)
- **ERD didesain** berdasarkan analisis types, seed data, dan domain logic dari client: 18 tabel, 8 domain
- **Server scaffold** ada di `server/` (NestJS + Prisma + MariaDB) tapi belum ada domain endpoint
- Stack server: NestJS 11, Prisma 7, MariaDB, JWT, Winston logging, Swagger docs
- Stack client: React 19, TanStack Router, Zustand, Tailwind 4, Radix UI

## Constraints

- **Tech stack**: NestJS + Prisma + MariaDB — sudah dikonfigurasi, tidak boleh diganti
- **API contract**: Response shape wajib pakai `ResponseInterceptor` (`{ statusCode, message, data }`)
- **Auth**: JWT Bearer token, secret dari env `JWT_SECRET`
- **Versioning**: API prefix `/api/v1/`
- **Client parity**: Endpoint harus cover semua data yang saat ini di-mock di `client/src/lib/seed/`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full ERD upfront (18 tabel) | Mencegah schema migration pain saat modul baru ditambah | — Pending |
| Sprint per modul | Memisahkan concern per domain, mudah di-review & test | — Pending |
| Client sebagai sumber kebenaran requirement | UI prototype sudah selesai, tidak perlu redefinisi kebutuhan | ✓ Good |
| Skip penelitian domain | Client sudah merepresentasikan semua requirement | ✓ Good |

---
*Last updated: 2026-03-15 — Milestone v1.0 started*

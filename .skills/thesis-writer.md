---
name: thesis-writer
description: >
  Thesis documentation specialist for Bab 4 (Implementation) and Bab 5 (Testing).
  Use this skill when: documenting implementation results, writing testing chapter,
  creating screenshots for thesis, or translating code to academic documentation.
  Triggers on: "Bab 4", "Bab 5", "thesis documentation", "implementation results",
  "testing chapter", "screenshot thesis".
---

# Thesis Writer — Bab 4 & Bab 5 Specialist

**Mission:** Translate implementation into academic documentation for thesis.

**Time Budget:** 8-12 hours per chapter

---

## Chapter Structure

### BAB 4 — IMPLEMENTASI DAN PEMBAHASAN

**4.1 Implementasi Sistem**

**4.1.1 Lingkungan Implementasi**

Table format:

| Komponen | Spesifikasi | Keterangan |
|----------|-------------|------------|
| **Perangkat Keras** | | |
| Processor | [e.g., Intel Core i5-1135G7] | Minimum yang direkomendasikan |
| RAM | [e.g., 8 GB] | Untuk development |
| Storage | [e.g., SSD 256 GB] | Untuk database dan aplikasi |
| **Perangkat Lunak** | | |
| Sistem Operasi | Windows 10/11 | Development environment |
| Database | MariaDB 10.6 | Production database |
| Backend | Node.js 20.x, NestJS 10.x | REST API server |
| Frontend | React 18, Vite 5.x | Client application |
| Bahasa Pemrograman | TypeScript 5.x | Type-safe development |

**4.1.2 Struktur Database**

Include:
- ERD diagram (from `docs/ERD-DESKRIPSI.md`)
- 20 tabel yang diimplementasikan
- Relasi antar tabel

```
Gambar 4.1: Entity Relationship Diagram (ERD)
[Sertakan gambar ERD dari draw.io]
```

Table format for key tables:

| Tabel | Fungsi | Relasi |
|-------|--------|--------|
| SOP | Menyimpan induk dokumen SOP | 1:N dengan DetailSOP |
| DetailSOP | Menyimpan versi dokumen SOP | N:M dengan Peraturan (DasarHukum) |
| PengajuanEvaluasi | Menyimpan batch evaluasi | 1:N dengan NilaiEvaluasi |
| RiwayatTandaTangan | Menyimpan TTE signatures | FK ke Pengguna, SOP, PengajuanEvaluasi |

**4.1.3 Implementasi Backend**

**Arsitektur Backend:**

```
Gambar 4.2: Arsitektur Backend NestJS
[Diagram: Controller → Service → Repository → Prisma → Database]
```

**Tabel 4.1: Endpoint API Utama**

| Endpoint | Method | Role | Fungsi |
|----------|--------|------|--------|
| `/api/v1/auth/login` | POST | Public | Autentikasi user |
| `/api/v1/sop` | POST | tim-penyusun | Create SOP baru |
| `/api/v1/sop/:id` | GET | All roles | Detail SOP |
| `/api/v1/sop/:id/status` | PATCH | tim-penyusun, biro | Update status SOP |
| `/api/v1/pengajuan-evaluasi` | POST | biro-organisasi | Buat pengajuan evaluasi |
| `/api/v1/nilai-evaluasi` | POST | tim-evaluasi | Kirim hasil evaluasi |
| `/api/v1/tte/sign` | POST | All TTE roles | TTE sign dokumen |

**Implementasi Invariant [P0-B]:**

```typescript
// Kode 4.1: Enforce 1 DetailSOP BERLAKU per SOP
async function sahkanSop(sopDetailId: string) {
  return this.prisma.$transaction(async (tx) => {
    // Check existing BERLAKU
    const existingBerlaku = await tx.detailSOP.findFirst({
      where: { sopId: sop.sopId, status: 'BERLAKU' },
    });

    if (existingBerlaku) {
      throw new ConflictException('SOP sudah memiliki versi BERLAKU');
    }

    // Update to BERLAKU
    return tx.detailSOP.update({
      where: { id: sopDetailId },
      data: { status: 'BERLAKU' },
    });
  });
}
```

**4.1.4 Implementasi Frontend**

**Arsitektur Frontend:**

```
Gambar 4.3: Struktur Frontend React
[Diagram: Routes → Pages → Components → Store]
```

**Tabel 4.2: Halaman Utama per Role**

| Role | Halaman | Fungsi |
|------|---------|--------|
| Tim Penyusun | `/tim-penyusun/daftar-sop` | List SOP OPD |
| Tim Penyusun | `/tim-penyusun/sop/baru` | Form create SOP |
| Tim Penyusun | `/tim-penyusun/sop/:id/edit` | Edit SOP metadata |
| Biro Organisasi | `/biro-organisasi/evaluasi` | Kelola evaluasi |
| Tim Evaluasi | `/tim-evaluasi/evaluasi-saya` | Evaluasi ditugaskan |
| Kepala OPD | `/kepala-opd/sahkan-sop` | Sahkan SOP |

**4.2 Pembahasan**

**4.2.1 Pencapaian Fungsional**

Table format mapping requirements to implementation:

| ID | Kebutuhan | Status | Implementasi |
|----|-----------|--------|--------------|
| SOP-01 | Tim Penyusun dapat membuat SOP baru | ✅ Terimplementasi | Endpoint POST /api/v1/sop |
| SOP-02 | Tim Penyusun dapat update DetailSOP | ✅ Terimplementasi | Endpoint PATCH /api/v1/sop/:id |
| SOP-13 | Constraint 1 DetailSOP BERLAKU | ✅ Terimplementasi | Transaction + check di service |
| EVL-02 | Maks 1 pengajuan aktif per OPD | ✅ Terimplementasi | SELECT FOR UPDATE + tabel sentinel |

**4.2.2 Kendala dan Solusi**

| Kendala | Solusi | Hasil |
|---------|--------|-------|
| Race condition saat create KEPALA_OPD | SELECT FOR UPDATE dengan isolation Serializable | Mencegah double KEPALA_OPD |
| Optimistic locking pada NilaiEvaluasi | Field version + check di update | Mencegah lost update |
| Multi-path cascade pada delete SOP | Manual cleanup DiagramEdge sebelum delete | Mencegah orphan edges |

---

### BAB 5 — PENGUJIAN DAN ANALISIS

**5.1 Strategi Pengujian**

**5.1.1 Jenis Pengujian**

Tabel 5.1: Cakupan Pengujian

| Jenis Test | Target | Tools | Coverage |
|------------|--------|-------|----------|
| Unit Test | Service layer | Jest 30.x | 90% service logic |
| Integration Test | API endpoints | supertest + Jest | 80% endpoints |
| E2E Test | Critical flows | Playwright | 5 critical flows |

**5.1.2 Skenario Pengujian**

Tabel 5.2: Critical Flows untuk E2E Testing

| # | Skenario | Aktor | Status Expected |
|---|----------|-------|-----------------|
| 1 | Login → Create SOP → Submit Evaluation | Tim Penyusun | SOP status: DIAJUKAN_EVALUASI |
| 2 | Create Evaluation → Assign Evaluator | Biro Organisasi | Pengajuan status: SEDANG_DIEVALUASI |
| 3 | Evaluate SOP → Submit Results | Tim Evaluasi | NilaiEvaluasi created |
| 4 | TTE Sign BA | Biro Organisasi | RiwayatTandaTangan created |
| 5 | Sahkan SOP | Kepala OPD | SOP status: BERLAKU |

**5.2 Hasil Pengujian**

**5.2.1 Unit Testing**

Tabel 5.3: Hasil Unit Test Service Layer

| Module | Total Tests | Pass | Fail | Coverage |
|--------|-------------|------|------|----------|
| SopService | 15 | 15 | 0 | 92% |
| EvaluasiService | 12 | 12 | 0 | 90% |
| TteService | 10 | 10 | 0 | 94% |
| AuthService | 8 | 8 | 0 | 88% |
| **Total** | **45** | **45** | **0** | **91%** |

```
Gambar 5.1: Laporan Coverage Unit Test
[Screenshot dari jest coverage report]
```

**5.2.2 Integration Testing**

Tabel 5.4: Hasil Integration Test API Endpoints

| Endpoint | Test Cases | Pass | Fail | Response Time (avg) |
|----------|------------|------|------|---------------------|
| POST /api/v1/sop | 5 | 5 | 0 | 120ms |
| GET /api/v1/sop/:id | 3 | 3 | 0 | 80ms |
| PATCH /api/v1/sop/:id/status | 4 | 4 | 0 | 150ms |
| POST /api/v1/pengajuan-evaluasi | 4 | 4 | 0 | 200ms |
| POST /api/v1/tte/sign | 3 | 3 | 0 | 180ms |

**5.2.3 E2E Testing**

Tabel 5.5: Hasil E2E Test Critical Flows

| # | Critical Flow | Status | Waktu Eksekusi |
|---|---------------|--------|----------------|
| 1 | SOP Creation Flow | ✅ Pass | 3.2s |
| 2 | Evaluation Creation Flow | ✅ Pass | 2.8s |
| 3 | Evaluation Submission Flow | ✅ Pass | 4.1s |
| 4 | TTE Signing Flow | ✅ Pass | 2.5s |
| 5 | SOP Pengesahan Flow | ✅ Pass | 2.9s |

```
Gambar 5.2: Screenshot E2E Test Execution
[Screenshot dari Playwright test runner]
```

**5.3 Analisis Hasil Pengujian**

**5.3.1 Analisis Performa**

Tabel 5.6: Response Time API

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Average Response Time | < 200ms | 146ms | ✅ Memenuhi |
| P95 Response Time | < 500ms | 320ms | ✅ Memenuhi |
| P99 Response Time | < 1000ms | 580ms | ✅ Memenuhi |

**5.3.2 Analisis Keamanan**

Tabel 5.7: Security Testing

| Aspek | Test | Hasil | Status |
|-------|------|-------|--------|
| Autentikasi | Login dengan invalid credentials | 401 Unauthorized | ✅ Pass |
| Otorisasi | Akses endpoint tanpa role yang sesuai | 403 Forbidden | ✅ Pass |
| Input Validation | SQL injection attempt | 422 Validation Error | ✅ Pass |
| TTE Security | Brute-force PIN (10 attempts) | Account locked | ✅ Pass |

**5.4 Kendala Pengujian**

| Kendala | Dampak | Solusi yang Diterapkan |
|---------|--------|------------------------|
| Test database cleanup | Test lambat karena data menumpuk | Transaction per test + rollback |
| E2E test flaky | Test gagal intermittent | Retry logic + wait for selector |
| Mock external dependencies | TTE email verification tidak bisa di-mock | Skip email verification di test environment |

**5.5 Kesimpulan Pengujian**

Berdasarkan hasil pengujian yang telah dilakukan:

1. **Unit Testing:** Semua 45 unit test pass dengan coverage 91%, menunjukkan business logic terimplementasi dengan benar.

2. **Integration Testing:** Semua API endpoint utama (19 endpoints) pass integration test dengan response time rata-rata 146ms, memenuhi target < 200ms.

3. **E2E Testing:** Kelima critical flow pass dengan total waktu eksekusi 15.5s, menunjukkan alur kerja end-to-end berfungsi dengan baik.

4. **Security Testing:** Autentikasi, otorisasi, input validation, dan TTE security pass semua pengujian, menunjukkan sistem aman dari vulnerability umum.

**Sistem siap untuk demonstrasi thesis.**

---

## Screenshot Guidelines

**For Thesis Documentation:**

| Screenshot | Resolution | Format | Annotation |
|------------|------------|--------|------------|
| Login page | 1920x1080 | PNG | Red box on form fields |
| Dashboard per role | 1920x1080 | PNG | Highlight key metrics |
| SOP creation flow | 1920x1080 | PNG | Step numbers (1, 2, 3) |
| Diagram BPMN | 1920x1080 | PNG | Zoom on complex sections |
| TTE signing | 1920x1080 | PNG | Arrow on PIN input |
| Test results | 1920x1080 | PNG | Highlight pass/fail counts |

**Caption Format:**

```
Gambar 4.X: [Deskripsi singkat dalam Bahasa Indonesia]
[Sumber: Tangkapan layar dari aplikasi, 2026]
```

---

## Output Contract

Generate thesis chapter in this format:

```markdown
===========================================
BAB [4/5] — [CHAPTER TITLE]
===========================================

---
[Main content following structure above]
---

===========================================
CHAPTER QUALITY: HIGH / MEDIUM / LOW
Ready for Thesis: YES / NO / NEEDS REVIEW
===========================================
```

---

*Created: 2026-04-01 — FYP-specific skill for thesis documentation*

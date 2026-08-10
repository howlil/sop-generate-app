# Database-Aligned Testing Remediation Plan

> **Tracking document.** Semua perubahan implementasi berikut harus dicatat di file ini dengan checkbox dan catatan hasil verifikasi.
>
> **Prinsip utama:** ukuran `VARCHAR` / `CHAR` pada database saat ini adalah **kontrak domain final** dan **tidak boleh diubah hanya untuk membuat test hijau**.

## Goal

Membuat seluruh quality gate repository hijau dengan cara menyesuaikan fixture test, generator data, locator Playwright, k6, dan validasi API terhadap kontrak database yang sudah ada, tanpa memperbesar kolom database dan tanpa menghilangkan invariant/migration production.

## Architecture / Testing Strategy

Database menjadi source of truth untuk batas data. Integration test dan E2E harus berjalan terhadap MariaDB yang dibuat dari migration history, sehingga trigger dan invariant database tetap ikut diuji. Data test harus valid terhadap kontrak database sebelum masuk ke API/Prisma. Assertion UI harus mencari entity yang benar, bukan teks global yang kebetulan memiliki value sama.

## Tech Stack

- NestJS 11 + TypeScript
- Prisma 7 + MariaDB/MySQL
- Jest + Supertest integration tests
- React 19 + Vite
- Playwright E2E
- k6 concurrency/load verification
- Docker Compose test environment
- GitHub Actions CI

---

# 0. Global Constraints — WAJIB DIPATUHI

- [x] `server/prisma/schema.prisma` diperlakukan sebagai source of truth untuk batas field database.
- [x] **Jangan memperbesar `VARCHAR`, `CHAR`, atau column capacity untuk memperbaiki test.**
- [x] **Jangan membuat migration pelebaran kolom sebagai solusi test.**
- [x] Jangan mengganti migration-backed test menjadi `prisma db push` hanya agar CI hijau.
- [x] Test database harus semirip mungkin dengan production, termasuk MariaDB table-name policy dan migration history.
- [x] Trigger/invariant database harus tetap aktif saat integration/E2E berjalan.
- [x] Fixture test harus tunduk pada kontrak database.
- [x] Generated test identifiers harus compact dan deterministic-enough; hindari raw `Date.now()` / `Math.random()` pada field berkapasitas kecil.
- [x] Jangan menggunakan blind truncation pada value yang harus unik bila truncation dapat membuat collision.
- [x] Perubahan production behavior seperti DTO validation dipisahkan secara logis dari perbaikan test fixture.
- [x] Satu quality gate harus dibuat hijau sebelum pindah ke gate berikutnya.
- [x] Jangan merge PR testing bertumpuk sebelum PR P1 utama stabil.

## Database Constraints yang Relevan untuk Test

Gunakan nilai berikut sebagai kontrak saat membuat data test:

| Field | Kapasitas DB | Catatan |
|---|---:|---|
| `Pengguna.email` | 31 | unique |
| `Pengguna.nama` | 31 | |
| `Pengguna.nip` | 18 | `CHAR(18)`, unique |
| `Pengguna.jabatan` | 28 | |
| `Pengguna.pangkat` | 25 | |
| `Pengguna.nohp` | 13 | nomor hasil normalisasi harus muat |
| `OPD.nama` | 28 | |
| `Peraturan.nama` | 31 | |
| `Peraturan.nomor` | 28 | bagian dari unique `(nomor,tahun)` |
| `Peraturan.tentang` | 73 | |
| `SOP.judul` | 42 | |
| `DetailSOP.nomorSOP` | 24 | unique |
| `DetailSOP.namaLembaga` | 28 | |
| `Pelaksana.nama` | 15 | unique per OPD |
| `LangkahSOP.kegiatan` | 55 | |
| `LangkahSOP.kelengkapan` | 34 | |
| `LangkahSOP.keluaran` | 23 | |
| `LangkahSOP.keterangan` | 37 | |

> Jika nanti ditemukan field lain yang digunakan fixture test dan mempunyai capacity khusus, tambahkan ke tabel ini sebelum mengubah test terkait.

---

# 1. Audit Findings — SUDAH DIIDENTIFIKASI

Bagian ini mencatat root cause yang sudah ditemukan sebelum implementasi.

- [x] Main/PR quality gate gagal pada backend integration dan critical E2E.
- [x] Test database seharusnya dibuat dari migration history, bukan hanya `prisma db push`, karena repo mempunyai raw SQL trigger/invariant.
- [x] J06 critical E2E bukan bukti business logic pencabutan gagal: public archive API mengembalikan daftar kosong setelah SOP dicabut.
- [x] J06 gagal karena `expectPublicArchiveExcludes()` memakai `page.getByText(title)` secara global; title juga muncul pada UI search keyword dan duplicate responsive DOM.
- [x] Arsip UI sudah menyediakan stable selector `data-arsip-sop-id`, sehingga assertion dapat diarahkan ke row/entity SOP.
- [x] Beberapa backend integration fixture memakai email > 31 karakter.
- [x] Beberapa integration fixture memakai nama pelaksana > 15 karakter.
- [x] Beberapa integration fixture memakai OPD/nama lembaga > 28 karakter.
- [x] `evaluasi-grafik.integration-spec.ts` menghasilkan NIP dari `Math.random()`, sehingga panjang tidak sesuai kontrak `CHAR(18)` dan tidak deterministic.
- [x] WhatsApp E2E menggunakan truncation NIP sampai 32 karakter walaupun DB hanya 18.
- [x] Functional Playwright masih membuat field terbatas dari raw timestamp, misalnya nama lembaga dan pelaksana concurrency.
- [x] k6 sebelumnya menghasilkan nama/nomor yang terlalu panjang; pendekatan compact suffix adalah solusi yang sesuai.
- [x] Beberapa DTO API mempunyai `@MaxLength` lebih besar daripada kapasitas DB. Ini bukan alasan mengubah DB; validation layer yang harus mengikuti kontrak domain.

---

# 2. Work Order / Dependency Graph

Jangan mengerjakan task secara acak. Gunakan urutan berikut:

```text
Task 1  Test-data contract helper
   ↓
Task 2  Backend integration fixtures
   ↓
GATE A  Backend integration GREEN
   ↓
Task 3  J06 archive locator
   ↓
GATE B  J01-J07 GREEN
   ↓
Task 4  Functional Playwright fixtures
   ↓
GATE C  Functional E2E GREEN
   ↓
Task 5  k6 fixture alignment
   ↓
Task 6  DTO/API validation alignment
   ↓
GATE D  Unit + integration + E2E + build GREEN
   ↓
Task 7  CI/PR cleanup and merge sequence
```

Jika sebuah gate masih merah, **jangan pindah ke task setelah gate tersebut**. Ambil first failure, reproduksi secara isolated, perbaiki root cause, lalu rerun gate.

---

# Task 1 — Buat Shared Test-Data Contract untuk Backend Integration

**Status:** [ ] NOT STARTED

## Tujuan

Menghilangkan pembuatan identifier test yang tidak terkontrol dan menyediakan helper kecil yang memastikan fixture integration tetap readable tetapi tidak melanggar kapasitas database.

## Files

- [ ] Create: `server/test/integration/helpers/test-data.util.ts`
- [ ] Test: `server/test/integration/helpers/test-data.util.spec.ts` jika helper mempunyai logic non-trivial.

## Interface yang Dihasilkan

Minimal interface:

```ts
export const TEST_DB_LIMITS = {
  email: 31,
  namaPengguna: 31,
  nip: 18,
  jabatan: 28,
  pangkat: 25,
  nohp: 13,
  opdNama: 28,
  peraturanNama: 31,
  peraturanNomor: 28,
  peraturanTentang: 73,
  sopJudul: 42,
  nomorSop: 24,
  namaLembaga: 28,
  pelaksanaNama: 15,
  kegiatan: 55,
  kelengkapan: 34,
  keluaran: 23,
  keterangan: 37,
} as const
```

Helper yang boleh ditambahkan bila dibutuhkan:

```ts
export function compactTestId(prefix: string, maxLength: number): string
export function testEmail(localPart: string): string
export function testNip(prefix: string, sequence?: number): string
```

## Design Rules

- [ ] Jangan otomatis memotong seluruh domain string.
- [ ] Nama domain readable seperti `OPD Eval A` atau `Pel Eval` lebih baik daripada generated string panjang.
- [ ] Helper terutama dipakai untuk identifier unik seperti email/NIP/suffix.
- [ ] `testEmail()` harus selalu menghasilkan string <= 31 karakter.
- [ ] `testNip()` harus selalu menghasilkan string <= 18 karakter dan unik pada scope test yang sama.
- [ ] Jangan gunakan randomness yang membuat panjang tidak terprediksi.
- [ ] Jika menggunakan timestamp, ubah ke base36/compact representation dan tetap enforce max length.

## TDD Steps

- [ ] T1.1 Tulis test untuk memastikan `testEmail()` tidak pernah > 31.
- [ ] T1.2 Jalankan test helper dan pastikan test gagal sebelum implementation jika helper belum ada.
- [ ] T1.3 Implement minimal helper.
- [ ] T1.4 Tulis test `testNip()` <= 18 dan dua sequence berbeda menghasilkan value berbeda.
- [ ] T1.5 Jalankan helper tests sampai PASS.
- [ ] T1.6 Commit terpisah.

## Verification

```bash
cd server
pnpm exec jest test-data.util.spec.ts --runInBand
```

Expected:

```text
PASS test-data.util.spec.ts
0 failed
```

## Commit

```bash
git add server/test/integration/helpers/test-data.util.ts \
        server/test/integration/helpers/test-data.util.spec.ts
git commit -m "test: add database-aligned fixture helpers"
```

## Completion Notes

- Result:
- Commit:
- Problems found:

---

# Task 2 — Perbaiki Seluruh Backend Integration Fixtures

**Status:** [ ] NOT STARTED

## Tujuan

Membuat integration tests menggunakan data yang legal menurut schema database tanpa mengubah schema atau migration.

## Files yang Harus Diaudit

- [ ] `server/test/integration/auth-session.integration-spec.ts`
- [ ] `server/test/integration/rbac-access-control.integration-spec.ts`
- [ ] `server/test/integration/core-workflow.integration-spec.ts`
- [ ] `server/test/integration/evaluasi-grafik.integration-spec.ts`
- [ ] `server/test/integration/evaluasi-edge-cases.integration-spec.ts`
- [ ] `server/test/integration/opd-penyusun-lifecycle.integration-spec.ts`
- [ ] `server/test/integration/sop-versioning.integration-spec.ts`
- [ ] `server/test/integration/tte-pdf-qr-verifikasi.integration-spec.ts`
- [ ] `server/test/integration/whatsapp-reminder.integration-spec.ts`
- [ ] `server/test/integration/whatsapp-reminder-e2e.integration-spec.ts`

## General Fix Rules

- [ ] Semua email test <= 31.
- [ ] Semua `nama` pengguna <= 31.
- [ ] Semua NIP <= 18 dan tetap unik.
- [ ] Semua OPD <= 28.
- [ ] Semua `namaLembaga` <= 28.
- [ ] Semua pelaksana <= 15.
- [ ] Semua SOP title <= 42.
- [ ] Semua nomor SOP <= 24.
- [ ] Semua field langkah mengikuti kapasitas DB.
- [ ] Hapus raw `Math.random()` dari field constrained.
- [ ] Hapus raw decimal timestamp dari field constrained.
- [ ] Jangan mengubah expectation business flow hanya untuk membuat test lolos.
- [ ] Jangan mock Prisma/DB untuk integration gate ini.

## Task 2A — `auth-session.integration-spec.ts`

- [ ] Audit email, nama, NIP, nohp fixture.
- [ ] Ganti value panjang dengan value compact readable.
- [ ] Pastikan nomor HP setelah normalisasi masih <= 13.
- [ ] Jalankan file secara isolated.

Command:

```bash
cd server
INTEGRATION_TEST_PATTERN=auth-session pnpm test:integration:docker
```

Expected: suite PASS tanpa Prisma/MariaDB data-too-long error.

## Task 2B — `rbac-access-control.integration-spec.ts`

Contoh target fixture:

```ts
email: 'pje.rbac@e2e.test'
nama: 'PJ Eval RBAC'
nip: 'RBAC-PJE-001'
```

- [ ] Pendekkan semua fixture bila perlu.
- [ ] Jangan mengubah role matrix/expected 401/403 behavior.
- [ ] Jalankan isolated test.

```bash
INTEGRATION_TEST_PATTERN=rbac-access-control pnpm test:integration:docker
```

## Task 2C — `core-workflow.integration-spec.ts`

Known issues:

- email seperti `pj-evaluator.integration@example.test` terlalu panjang.
- `Pelaksana Integration` terlalu panjang untuk `Pelaksana.nama`.

Gunakan value seperti:

```ts
'pje.int@e2e.test'
'ev.int@e2e.test'
'pjp.int@e2e.test'
'pen.int@e2e.test'
'kep.int@e2e.test'
'Pel Int'
```

- [ ] Perbaiki fixture.
- [ ] Pastikan workflow tetap sama.
- [ ] Run isolated test.

```bash
INTEGRATION_TEST_PATTERN=core-workflow pnpm test:integration:docker
```

## Task 2D — `evaluasi-grafik.integration-spec.ts`

Known issue:

```ts
nip: `NIP-${Math.random()}`
```

- [ ] Ganti dengan `testNip()` atau fixed unique NIP <= 18.
- [ ] Jangan menggunakan wall-clock/random sebagai domain value.
- [ ] Jalankan isolated test.

```bash
INTEGRATION_TEST_PATTERN=evaluasi-grafik pnpm test:integration:docker
```

## Task 2E — `evaluasi-edge-cases.integration-spec.ts`

Known issue: OPD seperti `OPD EVALUASI_REQUEST_EVALUATOR` terlalu panjang dan dipakai juga sebagai `namaLembaga`.

Gunakan mapping pendek:

```text
false case         -> OPD Eval False
request OPD        -> OPD Eval OPD
loop revision      -> OPD Eval Loop
request evaluator  -> OPD Eval Tim
```

- [ ] Pendekkan OPD.
- [ ] Pendekkan generated email/prefix bila diperlukan.
- [ ] Pastikan setiap group tetap memakai OPD terpisah agar invariant active submission tidak saling mengganggu.
- [ ] Jalankan isolated test.

```bash
INTEGRATION_TEST_PATTERN=evaluasi-edge-cases pnpm test:integration:docker
```

## Task 2F — `opd-penyusun-lifecycle.integration-spec.ts`

- [ ] Audit seluruh nama OPD create/update.
- [ ] Audit email/nama/NIP penyusun.
- [ ] Pastikan updated values tetap berbeda tetapi <= DB limit.
- [ ] Jangan menghilangkan scenario duplicate/move/deactivate/delete.

```bash
INTEGRATION_TEST_PATTERN=opd-penyusun-lifecycle pnpm test:integration:docker
```

## Task 2G — `sop-versioning.integration-spec.ts`

Known issue: `Pelaksana Versioning` > 15.

Target:

```text
Pel Versi
```

- [ ] Audit document number generation agar <= relevant DB limit.
- [ ] Audit title/OPD/namaLembaga.
- [ ] Pertahankan seluruh flow DRAFT → evaluasi → TTE → BERLAKU → versi baru/cabut.

```bash
INTEGRATION_TEST_PATTERN=sop-versioning pnpm test:integration:docker
```

## Task 2H — `tte-pdf-qr-verifikasi.integration-spec.ts`

Known issue: beberapa email fixture dan nama pelaksana terlalu panjang.

Target compact identities:

```text
pje.pdf@e2e.test
 ev.pdf@e2e.test
pjp.pdf@e2e.test
pen.pdf@e2e.test
kep.pdf@e2e.test
Pel PDF
```

- [ ] Perbaiki fixture.
- [ ] Jangan mengubah PDF signing/verifikasi semantics.
- [ ] Run dedicated PDF integration command bila tersedia.

```bash
pnpm test:integration:docker:pdf
```

## Task 2I — WhatsApp integration tests

Files:

- `whatsapp-reminder.integration-spec.ts`
- `whatsapp-reminder-e2e.integration-spec.ts`

Known issue:

```ts
`WA-E2E-${suffix}`.slice(0, 32)
```

DB NIP hanya 18.

- [ ] Gunakan `testNip()` <= 18.
- [ ] Audit generated email <= 31.
- [ ] Audit `nama` <= 31.
- [ ] Pertahankan nomor HP yang valid untuk normalization.
- [ ] Jangan melakukan network call real; tetap gunakan stub/provider test behavior yang existing.

```bash
INTEGRATION_TEST_PATTERN=whatsapp-reminder pnpm test:integration:docker
INTEGRATION_TEST_PATTERN=whatsapp-reminder-e2e pnpm test:integration:docker
```

## Task 2J — Full Backend Integration Gate

Setelah semua isolated suite hijau:

```bash
cd server
pnpm test:integration:docker
```

**GATE A Definition of Done:**

- [ ] Migration reset/deploy berhasil.
- [ ] Semua integration suite dieksekusi.
- [ ] 0 failed tests.
- [ ] Tidak ada `Data too long for column`.
- [ ] Tidak ada fixture collision akibat truncation.
- [ ] Tidak ada schema/migration capacity change.

## Commit

```bash
git add server/test/integration
git commit -m "test: align integration fixtures with database contract"
```

## Completion Notes

- First failing suite:
- Root cause:
- Final integration result:
- Commit:

---

# Task 3 — Fix Critical E2E J06 Public Archive Assertion

**Status:** [ ] NOT STARTED

## Tujuan

Membuat test memeriksa keberadaan record SOP pada arsip, bukan seluruh text DOM.

## Files

- [ ] Modify: `client/e2e/support/business-actions.ts`
- [ ] Test through: `client/e2e/journeys/sop-lifecycle.spec.ts`

## Existing Problem

Assertion sekarang secara konsep:

```ts
await expect(page.getByText(title)).toHaveCount(0)
```

Ini salah karena title dapat muncul di:

- search keyword summary;
- responsive desktop/mobile markup;
- UI context selain SOP result row.

UI arsip sudah mempunyai stable entity selector:

```tsx
data-arsip-sop-id={sop.detailSopId}
```

## Required Change

Refactor helper agar assertion hanya menargetkan entity result:

```ts
export async function expectPublicArchiveExcludes(
  page: Page,
  title: string,
): Promise<void> {
  await page.goto('/arsip')
  await waitForAppReady(page)
  await searchPageIfAvailable(page, title)

  const rows = page
    .locator('[data-arsip-sop-id]')
    .filter({ hasText: title })

  await expect(rows).toHaveCount(0)
}
```

`contains` juga harus menggunakan entity row:

```ts
const rows = page
  .locator('[data-arsip-sop-id]')
  .filter({ hasText: title })

await expect(rows.first()).toBeVisible({ timeout: 15_000 })
```

## Test Steps

- [ ] T3.1 Reproduce J06 failure pada code sebelum fix bila environment memungkinkan.
- [ ] T3.2 Ubah locator ke SOP row selector.
- [ ] T3.3 Jalankan J06 isolated.
- [ ] T3.4 Jika J06 PASS, jalankan seluruh J01-J07.
- [ ] T3.5 Jangan mengubah backend pencabutan jika API sudah membuktikan result kosong.

## Verification

Dari `client`:

```bash
pnpm test:e2e:critical
```

Jika runner mendukung journey-specific invocation, jalankan J06 dahulu sebelum full critical suite.

**GATE B Definition of Done:**

- [ ] J01 PASS
- [ ] J02 PASS
- [ ] J03 PASS
- [ ] J04 PASS
- [ ] J05 PASS
- [ ] J06 PASS
- [ ] J07 PASS
- [ ] 0 false-positive archive assertions

## Commit

```bash
git add client/e2e/support/business-actions.ts
git commit -m "test: scope public archive assertions to SOP rows"
```

## Completion Notes

- J06 isolated result:
- Full critical result:
- Commit:

---

# Task 4 — Audit dan Perbaiki Functional Playwright Fixtures

**Status:** [ ] NOT STARTED

## Tujuan

Menghapus fixture functional E2E yang melanggar DB contract tanpa mengurangi coverage business scenario.

## Primary Files

- [ ] `client/e2e/support/test-data.ts`
- [ ] `client/e2e/support/e2e-flow.ts`
- [ ] `client/e2e/master-data.spec.ts`
- [ ] `client/e2e/sop-concurrency.spec.ts`
- [ ] Audit file lain pada `pnpm test:e2e:functional` bila failure berikutnya mengarah ke sana.

## Existing Good Pattern

`e2eRunId()` sudah compact. Pertahankan konsep ini dan gunakan sebagai satu source untuk generated suffix.

## Helper yang Boleh Ditambahkan

Di `client/e2e/support/test-data.ts`:

```ts
export function compactTestValue(
  prefix: string,
  maxLength: number,
): string {
  const safe = prefix.replace(/[^A-Za-z0-9 _./-]/g, '')
  return safe.slice(0, maxLength)
}
```

Catatan: helper ini **tidak boleh** dipakai untuk field unik tanpa memastikan suffix unik tetap berada dalam hasil akhir.

Untuk unique values, susun prefix pendek + compact suffix terlebih dahulu, kemudian assert length.

## Task 4A — `master-data.spec.ts`

Known problematic pattern:

```ts
namaPelaksana: `Pelaksana ${suffix}`
const updatedPelaksana = `Pelaksana ${suffix} Updated`
```

Target:

```ts
const pelaksana = `P-${suffix}`.slice(0, 15)
const updatedPelaksana = `U-${suffix}`.slice(0, 15)
```

Syarat:

- [ ] initial dan updated name berbeda.
- [ ] keduanya <= 15.
- [ ] test tetap membuktikan create/update/list/search behavior.
- [ ] audit OPD names <= 28.
- [ ] audit evaluator/penyusun/kepala email/NIP/nama.

## Task 4B — `sop-concurrency.spec.ts`

Known problematic patterns:

```ts
const namaLembaga = `Biro Organisasi Sumbar - ${Date.now()}`

namaPelaksana: `Pelaksana concurrency ${Date.now()}`
```

Replace conceptually:

```ts
const suffix = e2eRunId('CC')
const namaLembaga = `Biro CC ${suffix}`.slice(0, 28)
const namaPelaksana = `PC-${suffix}`.slice(0, 15)
```

- [ ] Preserve concurrency semantics.
- [ ] Jangan menjadikan nama panjang sebagai bagian dari apa yang diuji jika test sebenarnya menguji concurrent autosave.
- [ ] Pastikan payload langkah tetap di bawah limit.

## Task 4C — `e2e-flow.ts`

Audit helper shared:

- [ ] `sopFixture()` title <= 42.
- [ ] number <= 24.
- [ ] `P-${fixture.suffix}` <= 15.
- [ ] peraturan name/number/about <= DB limits.
- [ ] `namaLembaga` <= 28.
- [ ] langkah activity/completeness/output/note <= respective limits.

Jangan memendekkan secara agresif bila value sekarang sudah valid.

## Task 4D — Run Functional Suite

```bash
cd client
pnpm test:e2e:functional
```

Jika gagal:

1. Ambil first failing spec.
2. Tentukan apakah error adalah fixture capacity, locator, timing/readiness, atau bug aplikasi.
3. Jika fixture: fix data saja.
4. Jika locator: target entity/role/test-id yang stabil.
5. Jika aplikasi: buat task baru di bagian `New Findings` dan jangan menyamarkannya sebagai test fix.

**GATE C Definition of Done:**

- [ ] `pnpm test:e2e:functional` exit 0.
- [ ] No DB capacity errors.
- [ ] No raw long timestamp/random field generators on constrained data.
- [ ] Coverage scenario tidak dikurangi hanya untuk membuat suite hijau.

## Commit

```bash
git add client/e2e

git commit -m "test: make playwright fixtures database-safe"
```

## Completion Notes

- First functional failure:
- Root cause:
- Full functional result:
- Commit:

---

# Task 5 — Align k6 Fixture Generator dengan DB Contract

**Status:** [ ] NOT STARTED

## Tujuan

Memastikan load/concurrency test menggunakan payload legal tanpa mengubah tujuan performance test.

## File

- [ ] `server/scripts/k6-sop-autosave-concurrency.js`

## Required Pattern

Gunakan compact suffix:

```js
function compactSuffix() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`
    .slice(-10)
}
```

Data contoh:

```js
judul: `K6 SOP ${suffix}`
nomorSop: `K6/${suffix}/26`
namaPelaksana: `K6-${suffix}`
namaLembaga: `Biro K6 ${marker}`.slice(0, 28)
```

## Checklist

- [ ] SOP title <= 42.
- [ ] SOP number <= 24.
- [ ] nama lembaga <= 28.
- [ ] pelaksana <= 15.
- [ ] marker concurrency tetap unik cukup untuk test.
- [ ] tidak mengubah VU/concurrency thresholds hanya untuk membuat test lolos.
- [ ] tidak mengubah endpoint/business behavior.

## Verification

Run sesuai workflow release verification / local k6 setup repository.

Catat:

- exit code;
- p95/p99 bila tersedia;
- error rate;
- optimistic/concurrency failures.

## Commit

```bash
git add server/scripts/k6-sop-autosave-concurrency.js
git commit -m "test: align k6 fixtures with database field limits"
```

## Completion Notes

- Result:
- Commit:

---

# Task 6 — Align API DTO Validation dengan Database Contract

**Status:** [ ] NOT STARTED

## Tujuan

Mencegah request yang tidak mungkin disimpan ke database lolos `class-validator` lalu baru gagal di MariaDB.

> Ini adalah perubahan production validation behavior, bukan sekadar test fixture. Kerjakan setelah testing infrastructure stabil.

## Known Mismatches

Contoh:

```text
CreatePelaksanaDto.namaPelaksana @MaxLength(255)
DB Pelaksana.nama VARCHAR(15)
```

```text
CreateOpdDto.nama @MaxLength(255)
DB OPD.nama VARCHAR(28)
```

SOP DTO juga harus diaudit terhadap:

```text
judul       42
nomor SOP   24
namaLembaga 28
```

## Files to Audit

- [ ] `server/src/modules/sop/pelaksana/dto/create-pelaksana.dto.ts`
- [ ] `server/src/modules/sop/pelaksana/dto/update-pelaksana.dto.ts`
- [ ] `server/src/modules/core/opd/dto/create-opd.dto.ts`
- [ ] OPD update DTO terkait
- [ ] `server/src/modules/sop/catalog/dto/create-sop.dto.ts`
- [ ] `server/src/modules/sop/catalog/dto/update-sop-header.dto.ts`
- [ ] peraturan create/update DTO
- [ ] pengguna/evaluator/penyusun/kepala profile DTO yang menyentuh field constrained
- [ ] langkah SOP DTO untuk kegiatan/kelengkapan/keluaran/keterangan

## TDD Requirement

Untuk setiap DTO yang diubah, buat/ubah unit test boundary:

```text
exact max length      -> valid
max length + 1        -> invalid
```

Contoh Pelaksana:

```ts
expect(validateName('123456789012345')).toBeValid()
expect(validateName('1234567890123456')).toBeInvalid()
```

## Rules

- [ ] Jangan memperbesar DB sebagai alternatif.
- [ ] API error harus 400 validation error, bukan DB exception.
- [ ] Message validation harus tetap understandable.
- [ ] Update DTO harus konsisten dengan create DTO.
- [ ] Frontend `maxLength` dapat diselaraskan setelah backend contract final; jangan duplikasi magic number tersebar bila existing form constants bisa dipakai.

## Verification

```bash
cd server
pnpm test:core-unit
pnpm test:cov
```

Lalu regression integration:

```bash
pnpm test:integration:docker
```

Expected:

- boundary validation tests PASS;
- integration tetap PASS;
- malformed over-limit API input menjadi 400 dan tidak mencapai DB write.

## Commit

```bash
git commit -m "fix: align request validation with database constraints"
```

## Completion Notes

- DTO changed:
- Boundary tests:
- Integration regression:
- Commit:

---

# Task 7 — Full Verification and CI Gate

**Status:** [ ] NOT STARTED

Tidak boleh mengklaim pekerjaan selesai tanpa fresh verification.

## Server Verification

```bash
cd server
pnpm typecheck
pnpm lint
pnpm test:cov
pnpm test:integration:docker
pnpm build
```

Record hasil:

- [ ] Typecheck exit 0
- [ ] Lint exit 0 atau documented pre-existing lint scope sesuai CI policy
- [ ] Unit/coverage exit 0
- [ ] Integration exit 0
- [ ] Build exit 0

## Client Verification

```bash
cd client
pnpm typecheck
pnpm lint
pnpm test:coverage
pnpm test:e2e:audit
pnpm test:e2e:critical
pnpm test:e2e:functional
pnpm build
```

Record hasil:

- [ ] Typecheck exit 0
- [ ] Lint exit 0
- [ ] Coverage exit 0
- [ ] E2E audit exit 0
- [ ] J01-J07 exit 0
- [ ] Functional Playwright exit 0
- [ ] Build exit 0

## Container / CI Verification

- [ ] GitHub Actions Server quality + coverage = SUCCESS
- [ ] GitHub Actions Client quality + coverage = SUCCESS
- [ ] Backend integration + migration fidelity = SUCCESS
- [ ] Critical E2E business journeys = SUCCESS
- [ ] Functional system regression = SUCCESS jika gate aktif
- [ ] Container build = SUCCESS / tidak skipped akibat dependency gate

## Definition of Done

- [ ] Tidak ada perubahan ukuran `VARCHAR/CHAR`.
- [ ] Tidak ada migration capacity widening.
- [ ] Database test dibuat dari migration history.
- [ ] Production DB invariant tetap diuji.
- [ ] Semua backend integration fixture legal menurut DB.
- [ ] J06 menggunakan entity-scoped locator.
- [ ] J01-J07 hijau.
- [ ] Functional Playwright hijau.
- [ ] k6 fixture legal menurut DB.
- [ ] DTO validation mengikuti DB contract.
- [ ] Unit/coverage gate hijau.
- [ ] Backend/client build hijau.
- [ ] CI penuh hijau berdasarkan fresh run.

## Final Verification Record

```text
Date:
Branch SHA:
Server typecheck:
Server lint:
Server coverage:
Backend integration:
Client typecheck:
Client lint:
Client coverage:
Critical E2E:
Functional E2E:
Server build:
Client build:
Container build:
CI run URL:
```

---

# Task 8 — PR Cleanup / Merge Strategy

**Status:** [ ] NOT STARTED

Repository saat ini mempunyai beberapa PR testing yang overlap/stacked. Hindari merge acak.

## Recommended Order

1. [ ] Stabilkan `test/p1-ci-quality-gates` / PR #9.
2. [ ] Pastikan seluruh P1 gate hijau berdasarkan fresh GitHub Actions run.
3. [ ] Review diff PR #9: pastikan tidak ada schema capacity widening.
4. [ ] Merge PR #9 ke `main` setelah verification.
5. [ ] Rebase/retarget PR #10 (`P2 full audit and release verification`) ke main baru.
6. [ ] Resolve duplicate changes yang sudah masuk dari PR #9.
7. [ ] Run P2 compatibility/k6/release checks.
8. [ ] Baru merge PR #10 jika masih relevan.
9. [ ] Review PR Dependabot terpisah; jangan campur dependency upgrade dengan test-remediation root cause kecuali dibutuhkan oleh failure.

## Merge Guard

Sebelum merge PR #9:

```bash
git diff main...HEAD -- server/prisma/schema.prisma server/prisma/migrations
```

Expected untuk pekerjaan remediation ini:

```text
Tidak ada perubahan yang memperbesar VARCHAR/CHAR atau migration capacity.
```

---

# New Findings / Bug Triage Log

Gunakan bagian ini jika selama implementasi ditemukan error baru. Jangan langsung mengubah business logic tanpa klasifikasi.

Format:

```markdown
## Finding N — <judul>

- Date:
- Gate:
- Failing test:
- Symptom:
- Evidence:
- Classification: FIXTURE | TEST ASSERTION | TEST INFRA | APP BUG | DB INVARIANT | CI
- Root cause:
- Proposed fix:
- Files:
- Regression test:
- Status: OPEN | FIXED | VERIFIED
- Commit:
```

## Classification Rules

### FIXTURE
Data test tidak legal menurut kontrak DB.

Action: perbaiki fixture/generator, bukan DB.

### TEST ASSERTION
Aplikasi melakukan behavior benar tetapi locator/assertion test salah.

Action: target entity/semantic selector yang tepat.

### TEST INFRA
Environment berbeda dari production atau migration/invariant tidak dijalankan.

Action: samakan environment test dengan production semantics.

### APP BUG
Fixture legal + test benar + DB benar, tetapi application behavior salah.

Action: buat regression test, lalu fix aplikasi dengan TDD.

### DB INVARIANT
Migration/trigger gagal menjalankan business rule yang memang didefinisikan database.

Action: analisis invariant secara khusus. Jangan menghapus trigger hanya untuk membuat test hijau.

### CI
Local/repro test hijau tetapi workflow/config/dependency gate salah.

Action: fix workflow setelah mempunyai evidence local test behavior.

---

# Progress Dashboard

Update dashboard setiap selesai satu gate.

| Area | Status | Last Evidence | Notes |
|---|---|---|---|
| Audit/root-cause analysis | DONE | Artifact + repo inspection | Fixture + J06 locator issues identified |
| DB capacity changes | FORBIDDEN | Global constraint | Do not modify |
| Shared backend test-data helper | TODO | — | Task 1 |
| Backend integration fixtures | TODO | — | Task 2 |
| Backend integration gate | FAILING / TO VERIFY | Latest CI P1 failed | Must become first green gate |
| J06 archive assertion | TODO | Artifact shows public API items empty | Locator fix only |
| J01-J07 critical E2E | FAILING / TO VERIFY | J06 known failure | Task 3 |
| Functional Playwright fixtures | TODO | Known timestamp/name issues | Task 4 |
| Functional E2E | TO VERIFY | Existing CI artifact available | Task 4 |
| k6 fixture alignment | TODO | Compact approach identified | Task 5 |
| DTO/API validation | TODO | DB/DTO mismatch identified | Task 6 |
| Full local verification | TODO | — | Task 7 |
| Full GitHub Actions verification | TODO | — | Task 7 |
| PR #9 merge | BLOCKED | Quality gates not green | Task 8 |
| PR #10 rebase/cleanup | BLOCKED | Wait for PR #9 | Task 8 |

---

# Immediate Next Action

Kerjaan berikutnya harus dimulai dari **Task 1**, lalu langsung **Task 2**.

Jangan mulai dari DTO, k6, dependency update, atau schema. Target pertama adalah:

```text
Backend integration + migration fidelity = GREEN
```

Setelah itu:

```text
Critical J01-J07 = GREEN
```

baru functional E2E dan tahap berikutnya.

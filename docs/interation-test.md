# Rencana Integration Test Core Workflow

Dokumen ini mendefinisikan kontrak pengujian integrasi backend SOPFlow. Integration test memverifikasi kerja bersama controller/route, guard autentikasi dan otorisasi, service, repository, Prisma transaction, MariaDB, validasi DTO, serta perubahan status domain melalui HTTP/application boundary.

> Nama file `interation-test.md` dipertahankan untuk kompatibilitas referensi dokumen yang sudah ada. Sumber kebenaran perilaku bisnis tetap `docs/requirements.md`, `docs/BUSINESS-SPEC.md`, schema/migration database, dan executable test pada `server/test/integration/`.

## Posisi Dalam Test Pyramid

| Level | Fokus | Dependency nyata |
|---|---|---|
| Unit | Satu service/policy/util secara terisolasi | Dependency dimock |
| Integration | Beberapa komponen backend + database | NestJS/HTTP + MariaDB test |
| Functional system | Perilaku fitur aplikasi melalui browser/API | Backend + frontend + MariaDB |
| Business E2E | Journey kritis lintas aktor/modul | Browser + backend + MariaDB |

Integration test bukan pengganti unit test maupun J01–J07 business journey. Integration test terutama membuktikan bahwa aturan bisnis backend tetap benar ketika melewati boundary HTTP, autentikasi, transaksi, repository, dan database nyata.

## Database Fidelity

Integration test wajib menggunakan MariaDB disposable dan **migration history yang sama dengan deployment**, bukan `prisma db push`.

Runner melakukan urutan berikut:

1. menyalakan `sop-test-db`;
2. memasang dependency;
3. menjalankan `prisma generate`;
4. menjalankan `prisma migrate reset --force --skip-seed` pada database test;
5. menjalankan `prisma migrate status`;
6. menjalankan seluruh `*.integration-spec.ts`;
7. membuang container/volume setelah pipeline CI selesai.

Dengan mekanisme tersebut, custom SQL, index, constraint, dan trigger pada migration ikut menjadi bagian dari lingkungan pengujian.

## Safety Guard

- Database integration harus terpisah dari development dan production.
- `DATABASE_NAME` harus mengandung `test`.
- `INTEGRATION_TEST_DOCKER=true` dan `RUN_INTEGRATION=true` wajib tersedia.
- Runner host `pnpm test:integration` sengaja ditolak; gunakan runner Docker.
- Reset schema hanya boleh dilakukan terhadap database disposable.

## Menjalankan Integration Test

Dari folder `server`:

```bash
pnpm test:integration:docker
```

Hanya area PDF/QR:

```bash
pnpm test:integration:docker:pdf
```

Atau dari root repository:

```bash
docker compose -f docker-compose.test.yml --profile test run --rm sop-integration-test
```

Cleanup manual:

```bash
docker compose -f docker-compose.test.yml down -v --remove-orphans
```

## Executable Suites

Seluruh file berikut berada di `server/test/integration/` dan dijalankan oleh konfigurasi `server/test/jest-integration.json`:

| Suite | Fokus |
|---|---|
| `auth-session.integration-spec.ts` | Login, cookie/session, refresh/logout, proteksi endpoint |
| `core-workflow.integration-spec.ts` | Alur inti SOP dari penyusunan sampai state workflow |
| `evaluasi-edge-cases.integration-spec.ts` | Aturan evaluasi, revisi, aggregate gate, invalid transition |
| `evaluasi-grafik.integration-spec.ts` | Agregasi data evaluasi |
| `opd-penyusun-lifecycle.integration-spec.ts` | Lifecycle OPD, penyusun, kepala OPD, perpindahan/slot |
| `rbac-access-control.integration-spec.ts` | Role dan boundary akses OPD |
| `sop-versioning.integration-spec.ts` | Pembuatan versi, replacement, terminal state |
| `tte-pdf-qr-verifikasi.integration-spec.ts` | TTE internal, dokumen, PDF/QR dan verifikasi |
| `whatsapp-reminder.integration-spec.ts` | Rekonsiliasi state reminder dan recipient |
| `whatsapp-reminder-e2e.integration-spec.ts` | Pipeline reminder terhadap boundary provider yang dikontrol test |

## Assertion Minimum

Setiap integration scenario yang memutasi state harus memeriksa sebanyak mungkin invariant yang relevan:

1. HTTP status sesuai kontrak.
2. Response API memiliki data/shape utama yang benar.
3. Database benar-benar berubah atau tetap tidak berubah pada failure case.
4. Relasi yang wajib terbentuk benar-benar ada.
5. Role dan OPD boundary ditegakkan.
6. Transisi status tidak melompati business rule.
7. Mutasi multi-table bersifat atomik.
8. Optimistic locking/version diperiksa pada flow yang memakainya.
9. Terminal state tidak dapat dibuka kembali tanpa membuat versi baru.
10. Error database/invariant dipetakan menjadi response aplikasi yang terkontrol.

## Core Contract Matrix

| ID | Prioritas | Skenario | Outcome utama |
|---|---|---|---|
| IT-01 | Critical | Login kredensial valid | Cookie/session valid terbentuk |
| IT-02 | Critical | Endpoint protected tanpa sesi | Unauthorized |
| IT-03 | Critical | Role salah mengakses aksi terbatas | Forbidden dan tidak ada mutation |
| IT-04 | High | PJ Evaluator mengelola OPD | State OPD konsisten |
| IT-05 | Critical | Slot PJ Penyusun/Kepala OPD konflik | Conflict, invariant organisasi terjaga |
| IT-06 | Critical | Penyusun membuat dan melengkapi SOP | `DetailSOP` dan relasi tersimpan |
| IT-07 | Critical | SOP belum lengkap dibuat siap evaluasi | Ditolak, status tidak berubah |
| IT-08 | Critical | SOP lengkap dibuat siap evaluasi | `MENUNGGU_PENGAJUAN_EVALUASI` |
| IT-09 | Critical | Penyusun biasa membuat pengajuan | Ditolak; hanya PJ Penyusun |
| IT-10 | Critical | PJ Penyusun membuat pengajuan valid | `PengajuanEvaluasi` + `NilaiEvaluasi` terbentuk |
| IT-11 | Critical | Pengajuan berisi SOP beda OPD/status salah | Ditolak atomik |
| IT-12 | Critical | Evaluator memberi `PERLU_PERBAIKAN` tanpa catatan | Ditolak |
| IT-13 | Critical | Evaluator memberi `PERLU_PERBAIKAN` dengan catatan | Tindak lanjut `TERBUKA`, SOP masuk revisi |
| IT-14 | Critical | Penyusun membaca feedback aktif | Feedback sesuai SOP dan OPD dikembalikan |
| IT-15 | Critical | Penyusun/PJ Penyusun menandai tindak lanjut selesai | `statusTindakLanjut=SELESAI` |
| IT-16 | Critical | PJ Penyusun kirim ulang revisi saat tindak lanjut masih `TERBUKA` | **Diizinkan**; resubmit menutup tindak lanjut secara atomik dan SOP kembali ke evaluasi |
| IT-17 | Critical | PJ Penyusun kirim ulang setelah tindak lanjut sudah `SELESAI` | Diizinkan; SOP kembali ke evaluasi |
| IT-18 | Critical | Penyusun biasa mencoba kirim ulang | Ditolak |
| IT-19 | Critical | Evaluator menyelesaikan paket saat masih ada SOP belum `SESUAI` | Ditolak; aggregate gate tetap aktif |
| IT-20 | Critical | Semua SOP `SESUAI` lalu evaluasi diselesaikan | `SELESAI_DIEVALUASI` dan SOP masuk tahap TTE |
| IT-21 | Critical | Final rejection | Pengajuan `DITOLAK`, versi SOP terminal `DITOLAK_EVALUATOR` |
| IT-22 | Critical | Rejected version diedit/diajukan ulang | Ditolak; hanya dapat menjadi sumber versi baru |
| IT-23 | Critical | PJ Evaluator tanda tangan BA pada state valid | `DITANDATANGANI_PJ_EVALUATOR` |
| IT-24 | Critical | PJ Penyusun tanda tangan BA setelah PJ Evaluator | `DITANDATANGANI_PJ_PENYUSUN` |
| IT-25 | Critical | Urutan/OPD TTE BA salah | Ditolak tanpa partial signature |
| IT-26 | Critical | Kepala OPD mengesahkan SOP setelah BA lengkap | SOP `BERLAKU`, pengajuan `SELESAI` |
| IT-27 | Critical | Versi baru disahkan | Versi baru `BERLAKU`, versi sebelumnya `DIGANTIKAN` secara konsisten |
| IT-28 | Critical | Kepala OPD mencabut SOP berlaku | `DICABUT`; arsip aktif tidak lagi menampilkan versi tersebut |
| IT-29 | Critical | Public/TTE verification | Identitas dokumen, hash/signature metadata, dan status konsisten |
| IT-30 | Critical | Concurrent stale version mutation | Conflict/optimistic-locking rule ditegakkan |
| IT-31 | High | Grafik evaluasi | Agregasi dan filter tahun benar |
| IT-32 | High | Reminder state berubah | Reminder recipient/kind stale direkonsiliasi dengan state workflow terbaru |

## Kontrak Revisi: Catatan Penting

Perilaku resubmit yang berlaku saat ini adalah:

```text
PERLU_PERBAIKAN
  -> statusTindakLanjut TERBUKA
  -> dokumen direvisi
  -> PJ Penyusun dapat mengirim ulang
  -> repository menutup tindak lanjut secara atomik bila masih TERBUKA
  -> SOP kembali ke state evaluasi
```

Aksi eksplisit **Tandai tindak lanjut selesai** tetap tersedia agar Penyusun/PJ Penyusun dapat menandai penyelesaian dari UI sebelum resubmit. Namun backend tidak mensyaratkan flag tersebut sudah `SELESAI` sebelum PJ Penyusun melakukan resubmit; resubmit sendiri menjaga konsistensi state secara atomik. Unit, integration, functional system, dan J02 business journey harus mengikuti kontrak yang sama.

## CI Gate

Pull request dianggap lolos layer integration hanya jika:

```text
migration replay/status  ✅
integration suites        ✅
no skipped failing suite  ✅
database disposable       ✅
```

Layer ini kemudian dilanjutkan oleh functional Playwright dan J01–J07 business journeys pada job CI terpisah. Pemisahan job sengaja dipertahankan agar failure migration, backend contract, browser functional regression, dan business journey dapat didiagnosis secara independen.

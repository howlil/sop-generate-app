# End-to-End Business Journey Strategy

## Tujuan

Dokumen ini menetapkan desain pengujian E2E lintas aktor untuk SOPFlow. E2E tidak dibentuk satu-per-satu dari use case. Test basis yang digunakan adalah kombinasi proses bisnis TO-BE, requirement, aturan bisnis, state transition, serta risiko pada hand-off antaraktor/modul.

Use case tetap dipakai sebagai traceability fitur. Validasi field, CRUD, menu, filter, pagination, dan kasus fitur tunggal berada pada functional browser/system tests. API-only behavior berada pada server integration tests.

ID historis `E2E-01` sampai `E2E-70` adalah label traceability fitur, bukan jumlah executable business E2E. Bukti business E2E yang menjadi critical gate adalah tujuh journey `J01`–`J07` di `client/e2e/journeys/`.

## Taxonomy pengujian

- **Business E2E (`J01`–`J07`)**: lintas aktor/modul, aksi bisnis utama lewat browser, outcome dan state transition kritis diverifikasi.
- **Functional browser/system tests**: fitur tunggal, validasi, CRUD UI, auth, RBAC UI, filter, PDF, dan edge behavior yang perlu browser.
- **Smoke/UI regression**: public pages, profile/TTE surface, dan shell/layout yang perlu browser tetapi bukan business journey.
- **Server integration tests**: concurrency, database invariants, server-side RBAC, versioning races, API state-machine edge cases, provider/contract behavior.

## Prinsip audit

1. **Journey = outcome bisnis**, bukan daftar layar yang dapat dibuka.
2. **Aksi yang diklaim diuji harus terjadi melalui UI.** API tidak boleh menggantikan aksi tersebut.
3. **API setup diperbolehkan hanya sebagai precondition** agar journey tidak mengulang fitur yang sudah dibuktikan pada test lain.
4. **API read diperbolehkan sebagai postcondition** untuk memastikan state server/invariant sesuai dengan outcome UI.
5. **Outcome publik yang diklaim sebagai browser behavior harus diverifikasi melalui browser.**
6. **Role switching memakai BrowserContext terpisah** agar cookie/local storage antaraktor tidak tercampur.
7. **State transition diverifikasi eksplisit**, bukan sekadar mencari teks umum pada body.
8. **Negative gate diuji pada titik risiko**, misalnya mixed multi-SOP tidak boleh diselesaikan.
9. **Test harus independen** dan menggunakan data unik; database E2E harus dapat di-reset.
10. **Third-party delivery bukan bagian browser E2E.** Notifikasi eksternal diuji pada integration/contract layer.
11. **Jumlah journey tidak dianggap coverage.** Coverage dinilai dari outcome, transition, business rule, dan risk yang terwakili.
12. **Assertion kosmetik/layout tidak menjadi critical journey** kecuali merupakan business invariant.

## Matriks journey

| ID | Nama | Precondition yang boleh dibuat API | Aksi bisnis UI | Invariant utama |
|---|---|---|---|---|
| J01 | Happy Path | SOP sudah lengkap/siap; profil TTE tersedia | PJ Penyusun mengajukan → Evaluator menilai SESUAI & selesai → PJ Evaluator TTD BA → PJ Penyusun TTD BA → Kepala OPD sahkan | Pengajuan `SELESAI`; SOP `BERLAKU`; dapat ditemukan publik |
| J02 | Revision Loop | Pengajuan aktif dengan satu SOP | Evaluator PERLU_PERBAIKAN → Penyusun membaca catatan & memperbaiki → tandai tindak lanjut → PJ kirim ulang → Evaluator SESUAI | Feedback `TERBUKA → SELESAI`; SOP kembali ke evaluasi dan dapat selesai |
| J03 | Final Rejection | Pengajuan aktif | Evaluator menolak final → PJ Penyusun melihat versi ditolak → membuat versi baru | Pengajuan `DITOLAK`; versi lama `DITOLAK_EVALUATOR`; versi baru `DRAFT` |
| J04 | Mixed Multi-SOP | Pengajuan aktif berisi dua SOP | Evaluator memberi hasil campuran → mencoba selesai → setelah revisi, nilai ulang | Aggregate gate menolak selesai selama ada SOP perlu perbaikan |
| J05 | Version Replacement | SOP v1 sudah `BERLAKU` | Penyusun membuat v2 → Kepala OPD mengesahkan v2 | v2 `BERLAKU`; v1 `DIGANTIKAN` |
| J06 | Revocation | SOP `BERLAKU` | Kepala OPD mencabut → pengunjung mencari arsip | SOP `DICABUT`; tidak muncul pada arsip publik aktif |
| J07 | Public Document Integrity | SOP approved + artefak PDF bertanda tangan tersedia | Pengunjung membuka arsip/preview → verifikasi pengesahan → upload PDF untuk verifikasi | Data internal tidak bocor; TTE valid dikenali; PDF tanpa signature ditolak |

## Kenapa J01 tidak mengisi seluruh editor SOP

Editor SOP memiliki banyak field, dialog referensi, diagram, autosave, validasi prosedur, dan aturan kelengkapan. Mengulangi seluruh input tersebut pada setiap business journey membuat suite lambat, rapuh, dan menduplikasi functional system testing.

Karena itu J01 dimulai pada **business hand-off**: dokumen telah lengkap dan siap diajukan. Functional browser/system tests tetap membuktikan pembuatan draft, header, langkah/prosedur, diagram, autosave, validasi kelengkapan, serta status siap evaluasi.

Ini bukan bypass terhadap aksi yang sedang diuji: aksi J01 yang diklaim—pengajuan, penilaian, penyelesaian evaluasi, penandatanganan, pengesahan, dan outcome publik—tetap dilakukan melalui browser.

## Boundary reuse antar-journey

E2E tidak perlu mengulang seluruh happy path di setiap test. Contoh:

- J04 memakai setup API untuk menyelesaikan tindak lanjut setelah aggregate gate terbukti, karena loop revisi UI sudah dibuktikan J02.
- J05 memakai setup API untuk membawa v2 ke tahap pengesahan setelah aksi create-version, karena evaluasi dan BA sudah dibuktikan J01/J02. J05 fokus pada invariant replacement.
- J06/J07 boleh memulai dari SOP approved karena tujuan test adalah lifecycle akhir dan integritas publik.

Boundary tersebut harus terlihat dari nama helper di `business-preconditions.ts`; jangan menyembunyikan setup sebagai seolah-olah aksi browser.

## Struktur code

- `client/e2e/fixtures/business-test.ts` — session browser terisolasi per role.
- `client/e2e/support/business-actions.ts` — hanya aksi user-visible/browser.
- `client/e2e/support/business-preconditions.ts` — mutation API untuk setup/boundary.
- `client/e2e/support/business-audit.ts` — read-only assertion terhadap state server.
- `client/e2e/journeys/*.spec.ts` — executable J01-J07.
- `client/scripts/audit-e2e-journeys.mjs` — policy check di CI.
- `server/test/integration/*.integration-spec.ts` — API/database/integration behavior yang tidak memerlukan browser.

## Guardrail CI

`pnpm test:e2e:audit` gagal jika:

- salah satu J01-J07 hilang atau duplikat;
- journey tidak mempunyai `test.step()` sebagai audit trail;
- journey spec melakukan mutation API secara langsung.

Guardrail ini tidak menggantikan eksekusi Playwright. Ia menjaga arsitektur suite agar tidak kembali ke pola `setup via API → act via API → assert UI` yang menghasilkan E2E hijau tetapi tidak benar-benar menjalankan aksi pengguna.

## Out of scope dari tujuh business journey

Tetap penting, tetapi diuji pada lapisan lain:

- login gagal / password validation;
- CRUD master data;
- duplicate nomor SOP/peraturan;
- RBAC route/menu dan cross-OPD boundary;
- field validation;
- pencarian/filter/pagination;
- optimistic locking/concurrency;
- invalid PIN individual;
- malformed/non-PDF upload;
- scheduler/reminder WhatsApp dan provider delivery;
- unit/integration behavior internal.

## Exit criteria

Business E2E dianggap lulus jika seluruh J01-J07 lulus tanpa `pageerror`, setiap transition kritis menghasilkan state server yang diharapkan, negative gate tidak dapat dilewati, outcome publik yang diklaim terbukti lewat browser, dan test dapat dijalankan independen pada database test yang bersih/resettable.

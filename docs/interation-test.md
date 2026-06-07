# Rencana Integration Test Core Workflow

Dokumen ini berisi rancangan test case integration test untuk aplikasi SOP Generator & Evaluator. Fokus pengujian adalah memastikan beberapa komponen backend bekerja bersama dengan benar, yaitu route/controller, guard autentikasi dan otorisasi, service, repository, validasi DTO, transaksi database, dan perubahan status data.

Nama file mengikuti permintaan: `interation-test.md`.

## Batasan Pengujian

Integration test pada dokumen ini berbeda dari unit test dan end-to-end test.

| Jenis Pengujian | Fokus | Contoh |
|---|---|---|
| Unit test | Menguji satu unit kode secara terisolasi dengan dependency dimock | `EvaluasiNilaiService` menolak `PERLU_PERBAIKAN` tanpa catatan |
| Integration test | Menguji beberapa komponen backend bekerja bersama dengan database test | `POST /evaluasi` membuat pengajuan, nilai evaluasi, dan mengubah status SOP |
| E2E test | Menguji perjalanan pengguna penuh dari UI/API seperti pengguna nyata lintas role | Draft SOP sampai berlaku dan muncul di arsip publik |

Pengujian pada dokumen ini berada di level integration test. Artinya, test berjalan melalui HTTP API atau application module NestJS dengan database test, tetapi tidak harus membuka browser atau menguji UI.

## Prasyarat Lingkungan

1. Database test terpisah dari database development dan production.
2. Data seed minimal tersedia untuk role berikut:
   - `PJ_EVALUATOR`
   - `EVALUATOR`
   - `PJ_PENYUSUN`
   - `PENYUSUN`
   - `KEPALA_OPD`
3. Minimal satu OPD aktif tersedia.
4. Setiap test harus melakukan cleanup atau berjalan dalam transaksi/database reset agar tidak saling memengaruhi.
5. Test dijalankan menggunakan HTTP request terhadap aplikasi NestJS, misalnya dengan `supertest`.
6. Assertion dilakukan pada response API dan kondisi database setelah request.

## Cara Menjalankan Integration Test

**Integration test wajib dijalankan melalui Docker.** Menjalankan `pnpm test:integration` di host akan ditolak (exit 1). Runner container men-set `INTEGRATION_TEST_DOCKER=true` dan `RUN_INTEGRATION=true`; database test MariaDB (`sop-test-db`) dan Jest berjalan di jaringan compose yang sama.

Konfigurasi env test: `server/.env.test` (override opsional: `server/.env.test.local`).

### Command utama (dari folder `server`)

```powershell
cd C:\Users\howlil\Documents\tugas-akhir\codingan\server
pnpm test:integration:docker
```

Runner akan: menunggu DB sehat → `pnpm install` → `prisma generate` → `prisma db push --force-reset` → menjalankan **semua** `*.integration-spec.ts` (`core-workflow`, `tte-pdf-qr-verifikasi`).

Hanya suite PDF/QR:

```powershell
pnpm test:integration:docker:pdf
```

### Menjalankan manual lewat Compose (root project)

```powershell
cd C:\Users\howlil\Documents\tugas-akhir\codingan
docker compose -f docker-compose.test.yml --profile test run --rm sop-integration-test
```

Service `sop-test-db` ikut di-start oleh `depends_on` pada runner. Untuk hanya menyalakan DB (mis. inspeksi):

```powershell
docker compose -f docker-compose.test.yml up -d sop-test-db
```

Port host `3308` → MariaDB test (terpisah dari DB development).

### Internal (hanya di dalam container)

`pnpm test:integration:run` memanggil Jest; **jangan** dipakai di host — `setup-env.ts` memvalidasi `INTEGRATION_TEST_DOCKER`.

Untuk membersihkan database test beserta volume setelah selesai:

```powershell
docker compose -f docker-compose.test.yml down -v
```

Catatan penting:
- Integration test akan melakukan reset data pada database test.
- Test akan dibatalkan jika `DATABASE_NAME` tidak mengandung kata `test`.
- Test tidak menggunakan browser/UI; request dilakukan ke aplikasi NestJS menggunakan HTTP test client.
- Test memeriksa response API dan state database setelah request.
- Credential di `server/.env.test` adalah credential khusus lingkungan test, bukan credential production.

## Data Uji Utama

| Kode Data | Deskripsi |
|---|---|
| `OPD_A` | OPD aktif tempat PJ Penyusun, Penyusun, dan Kepala OPD berada |
| `OPD_B` | OPD lain untuk skenario akses ditolak |
| `PJ_EVAL` | Pengguna dengan role `PJ_EVALUATOR` |
| `EVAL` | Pengguna dengan role `EVALUATOR` |
| `PJ_PENYUSUN_A` | Pengguna dengan role `PJ_PENYUSUN` pada `OPD_A` |
| `PENYUSUN_A` | Pengguna dengan role `PENYUSUN` pada `OPD_A` |
| `KEPALA_A` | Pengguna dengan role `KEPALA_OPD` pada `OPD_A` |
| `SOP_DRAFT_A` | SOP milik `OPD_A` dengan status awal `DRAFT` |
| `SOP_SIAP_A` | SOP milik `OPD_A` yang sudah lengkap dan berstatus `MENUNGGU_PENGAJUAN_EVALUASI` |
| `SOP_BERLAKU_A` | SOP milik `OPD_A` yang sudah disahkan dan berstatus `BERLAKU` |

## Strategi Assertion

Setiap integration test minimal memeriksa:

1. HTTP status code sesuai.
2. Struktur response sesuai kontrak API.
3. Data utama benar-benar berubah di database.
4. Relasi data terbentuk dengan benar.
5. Role yang tidak berwenang ditolak.
6. Transisi status tidak melompati aturan bisnis.
7. Transaksi database rollback ketika salah satu langkah gagal.

## Tabel Test Case Integration

| ID | Prioritas | Area | Skenario | Aktor | Endpoint Utama | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| IT-01 | Critical | Auth | Login berhasil dan cookie akses terbentuk | Semua role | `POST /auth/login` | Response sukses, cookie token dibuat, data pengguna sesuai |
| IT-02 | Critical | Auth | Akses endpoint terlindungi tanpa login | Tidak login | Contoh: `GET /sop` | Request ditolak dengan status unauthorized |
| IT-03 | Critical | Authorization | Role tidak sesuai mencoba mengakses fitur terbatas | `PENYUSUN` | Contoh: `POST /evaluasi` | Request ditolak, tidak ada data pengajuan dibuat |
| IT-04 | High | Master Data | PJ Evaluator membuat OPD baru | `PJ_EVALUATOR` | `POST /opd` | OPD tersimpan di database dan muncul pada daftar OPD |
| IT-05 | High | Master Data | Non-PJ Evaluator mencoba membuat OPD | `PJ_PENYUSUN` | `POST /opd` | Request ditolak, OPD tidak tersimpan |
| IT-06 | Critical | Master Data | Membuat PJ Penyusun pada OPD yang sudah punya PJ aktif | `PJ_EVALUATOR` | `POST /penyusun` | Request ditolak karena slot PJ Penyusun OPD sudah terisi |
| IT-07 | Critical | Master Data | Membuat Kepala OPD pada OPD yang sudah punya kepala aktif | `PJ_EVALUATOR` | `POST /kepala-opd` | Request ditolak karena OPD sudah punya Kepala OPD aktif |
| IT-08 | High | Penyusunan SOP | Penyusun membuat SOP baru | `PENYUSUN`/`PJ_PENYUSUN` | `POST /sop` | SOP header dan `DetailSOP` versi 1 dibuat dengan status `DRAFT` |
| IT-09 | Critical | Penyusunan SOP | Penyusun mengisi header SOP lengkap | `PENYUSUN` | `PATCH /sop/header/:detailSopId` | Header, dasar hukum, lampiran, dan relasi SOP terkait tersimpan |
| IT-10 | Critical | Penyusunan SOP | Penyusun mengisi prosedur/langkah SOP | `PENYUSUN` | `PATCH /sop/langkah/:detailSopId` | Swimlane pelaksana dan langkah SOP tersimpan sesuai urutan |
| IT-11 | High | Penyusunan SOP | Penyusun mengatur diagram SOP | `PENYUSUN` | `PATCH /sop/diagram/:detailSopId` | Konfigurasi diagram dan path override tersimpan |
| IT-12 | Critical | Validasi SOP | SOP belum lengkap ditandai menunggu pengajuan evaluasi | `PENYUSUN` | `PATCH /sop/status/:detailSopId` | Request ditolak, status SOP tetap belum siap |
| IT-13 | Critical | Validasi SOP | SOP lengkap ditandai menunggu pengajuan evaluasi | `PENYUSUN` | `PATCH /sop/status/:detailSopId` | Status SOP berubah menjadi `MENUNGGU_PENGAJUAN_EVALUASI` |
| IT-14 | Critical | Pengajuan Evaluasi | Penyusun biasa mencoba mengajukan SOP ke evaluasi | `PENYUSUN` | `PATCH /sop/status/:detailSopId` atau `POST /evaluasi` | Request ditolak, hanya PJ Penyusun yang boleh mengajukan |
| IT-15 | Critical | Pengajuan Evaluasi | PJ Penyusun membuat pengajuan evaluasi EVALUASI_REQUEST_OPD | `PJ_PENYUSUN` | `POST /evaluasi` | `PengajuanEvaluasi` dibuat, `NilaiEvaluasi` dibuat, status SOP menjadi `SEDANG_DIEVALUASI` |
| IT-16 | Critical | Pengajuan Evaluasi | Pengajuan evaluasi dibuat untuk SOP yang belum `MENUNGGU_PENGAJUAN_EVALUASI` | `PJ_PENYUSUN` | `POST /evaluasi` | Request ditolak, tidak ada pengajuan atau nilai evaluasi tersimpan |
| IT-17 | High | Pengajuan Evaluasi | PJ Penyusun hanya melihat pengajuan OPD sendiri | `PJ_PENYUSUN` | `GET /evaluasi` | Response hanya berisi pengajuan dari OPD pengguna |
| IT-18 | High | Pengajuan Evaluasi | Evaluator melihat daftar pengajuan lintas OPD | `EVALUATOR` | `GET /evaluasi` | Response berisi daftar pengajuan yang dapat dievaluasi |
| IT-19 | Critical | Evaluasi SOP | Evaluator memberi nilai `PERLU_PERBAIKAN` tanpa catatan | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId` | Request ditolak, nilai evaluasi tidak berubah |
| IT-20 | Critical | Evaluasi SOP | Evaluator memberi nilai `PERLU_PERBAIKAN` dengan catatan | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId` | Nilai tersimpan, `statusTindakLanjut` menjadi `TERBUKA`, SOP menjadi `REVISI_DARI_EVALUATOR` |
| IT-21 | Critical | Umpan Balik | Penyusun melihat umpan balik aktif pada SOP revisi | `PENYUSUN`/`PJ_PENYUSUN` | `GET /evaluasi/umpan-balik/detail/:detailSopId` | Catatan evaluasi aktif dikembalikan |
| IT-22 | Critical | Umpan Balik | Evaluator mengakses endpoint umpan balik penyusun | `EVALUATOR` | `GET /evaluasi/umpan-balik/detail/:detailSopId` | Request ditolak karena endpoint untuk penyusun/kepala OPD |
| IT-23 | Critical | Revisi SOP | Penyusun menandai tindak lanjut revisi selesai | `PENYUSUN`/`PJ_PENYUSUN` | `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId/tindak-lanjut-selesai` | `statusTindakLanjut` berubah menjadi `SELESAI` |
| IT-24 | Critical | Revisi SOP | PJ Penyusun kirim ulang saat tindak lanjut masih terbuka | `PJ_PENYUSUN` | `POST /sop/penyusun-workbench/:detailSopId/kirim-ulang-evaluasi` | Request ditolak, SOP tidak dikirim ulang |
| IT-25 | Critical | Revisi SOP | PJ Penyusun kirim ulang setelah revisi selesai | `PJ_PENYUSUN` | `POST /sop/penyusun-workbench/:detailSopId/kirim-ulang-evaluasi` | SOP kembali masuk alur evaluasi |
| IT-26 | Critical | Penyelesaian Evaluasi | Evaluator menyelesaikan evaluasi ketika masih ada `PERLU_PERBAIKAN` | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/selesai` | Request ditolak, pengajuan tetap belum selesai |
| IT-27 | Critical | Penyelesaian Evaluasi | Evaluator menyelesaikan evaluasi EVALUASI_REQUEST_OPD setelah semua SOP `SESUAI` | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/selesai` | Pengajuan menjadi `SELESAI_DIEVALUASI`, SOP menjadi `MENUNGGU_TTD_PJ_EVALUATOR`, `nilaiOPD` kosong |
| IT-28 | Critical | Penyelesaian Evaluasi | Evaluator menyelesaikan evaluasi EVALUASI_REQUEST_EVALUATOR tanpa nilai OPD | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/selesai` | Request ditolak karena `nilaiOPD` wajib |
| IT-29 | Critical | Penyelesaian Evaluasi | Evaluator menyelesaikan evaluasi EVALUASI_REQUEST_EVALUATOR dengan nilai OPD valid | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/selesai` | Pengajuan menjadi `SELESAI_DIEVALUASI`, `nilaiOPD` tersimpan |
| IT-30 | Critical | TTE Profil | PJ Evaluator membuat PIN TTE pertama kali | `PJ_EVALUATOR` | `POST /tte/profil` | Hash PIN tersimpan pada data pengguna |
| IT-31 | Critical | TTE BA | PJ Evaluator tanda tangan BA pada status salah | `PJ_EVALUATOR` | `POST /tte/tanda-tangani/ba/:pengajuanId` | Request ditolak, tidak ada riwayat tanda tangan |
| IT-32 | Critical | TTE BA | PJ Evaluator tanda tangan BA pada status `SELESAI_DIEVALUASI` | `PJ_EVALUATOR` | `POST /tte/tanda-tangani/ba/:pengajuanId` | Dokumen TTE BA dan riwayat tanda tangan dibuat, pengajuan menjadi `DITANDATANGANI_PJ_EVALUATOR` |
| IT-33 | Critical | TTE BA | PJ Penyusun tanda tangan BA setelah PJ Evaluator | `PJ_PENYUSUN` | `POST /tte/tanda-tangani/ba/:pengajuanId` | Riwayat tanda tangan PJ Penyusun dibuat, pengajuan menjadi `DITANDATANGANI_PJ_PENYUSUN`, SOP menjadi `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI` |
| IT-34 | Critical | TTE BA | PJ Penyusun dari OPD lain tanda tangan BA | `PJ_PENYUSUN` OPD lain | `POST /tte/tanda-tangani/ba/:pengajuanId` | Request ditolak karena OPD tidak sesuai |
| IT-35 | Critical | TTE SOP | Kepala OPD tanda tangan semua SOP dalam pengajuan | `KEPALA_OPD` | `POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua` | Semua SOP menjadi `BERLAKU`, dokumen TTE SOP dibuat, pengajuan menjadi `SELESAI` |
| IT-36 | Critical | TTE SOP | Kepala OPD tanda tangan pengajuan yang belum ditandatangani PJ Penyusun | `KEPALA_OPD` | `POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua` | Request ditolak, tidak ada SOP menjadi `BERLAKU` |
| IT-37 | Critical | TTE SOP | Salah satu SOP dalam pengajuan tidak memenuhi status tanda tangan | `KEPALA_OPD` | `POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua` | Seluruh transaksi dibatalkan, tidak ada SOP yang berubah sebagian |
| IT-38 | High | Verifikasi TTE | Publik membuka data pengesahan TTE dari QR | Publik | `GET /tte/public/pengesahan/:dokumenTteId/:userId` | Data pengesahan dan penandatangan dikembalikan |
| IT-39 | Critical | Arsip Publik | SOP berlaku tampil pada arsip publik | Publik | `GET /sop/public/sop` | SOP berstatus `BERLAKU` muncul pada hasil pencarian |
| IT-40 | Critical | Arsip Publik | SOP belum berlaku tidak tampil pada arsip publik | Publik | `GET /sop/public/sop` | SOP selain `BERLAKU` tidak dikembalikan |
| IT-41 | High | Arsip Publik | Publik melihat dokumen SOP berlaku | Publik | `GET /sop/public/dokumen/:detailSopId` | Detail dokumen SOP berlaku dikembalikan tanpa log audit internal |
| IT-42 | Critical | Versi SOP | Penyusun membuat versi baru dari SOP berlaku | `PENYUSUN`/`PJ_PENYUSUN` | `POST /sop/:detailSopId/buat-versi-baru` | Versi baru dibuat dari SOP `BERLAKU` dengan status `DRAFT` |
| IT-43 | Critical | Versi SOP | Penyusun membuat versi baru saat revisi masih berjalan | `PENYUSUN`/`PJ_PENYUSUN` | `POST /sop/:detailSopId/buat-versi-baru` | Request ditolak agar tidak ada revisi ganda berjalan |
| IT-44 | Critical | Cabut SOP | Kepala OPD mencabut SOP berlaku | `KEPALA_OPD` | `POST /sop/cabut/:detailOrSopId` | Status SOP berubah menjadi `DICABUT` |
| IT-45 | Critical | Cabut SOP | Non-Kepala OPD mencabut SOP berlaku | `PENYUSUN`/`PJ_PENYUSUN` | `POST /sop/cabut/:detailOrSopId` | Request ditolak, SOP tetap `BERLAKU` |
| IT-46 | High | Laporan Evaluasi | PJ Evaluator melihat grafik evaluasi tahunan | `PJ_EVALUATOR` | `GET /evaluasi/laporan/grafik-tahunan` | Statistik nilai OPD tahunan dikembalikan |
| IT-47 | High | Laporan Evaluasi | Rentang tahun laporan tidak valid | `PJ_EVALUATOR` | `GET /evaluasi/laporan/grafik-tahunan` | Request ditolak karena `tahunDari` lebih besar dari `tahunSampai` |
| IT-48 | Critical | Konsistensi OPD | Pengguna OPD A mencoba mengakses dokumen OPD B | `PENYUSUN` OPD A | Contoh: `GET /sop/penyusun-workbench/:detailSopId` | Request ditolak, data OPD B tidak bocor |
| IT-49 | Critical | Konsistensi Data | Mengajukan evaluasi dengan sebagian DetailSOP valid dan sebagian tidak valid | `PJ_PENYUSUN` | `POST /evaluasi` | Transaksi dibatalkan seluruhnya, tidak ada pengajuan parsial |
| IT-50 | Critical | Concurrency | Dua request mengubah status pengajuan/SOP secara bersamaan | Role sesuai skenario | Endpoint status/evaluasi/TTE | Salah satu request berhasil, request konflik ditolak, data akhir tetap konsisten |
| IT-51 | Critical | Pengajuan Evaluasi | Membuat pengajuan saat masih ada pengajuan aktif/blocking pada OPD/SOP yang sama | `PJ_PENYUSUN` | `POST /evaluasi` | Request ditolak, tidak ada pengajuan aktif ganda |
| IT-52 | Critical | Pengajuan Evaluasi | Pengajuan `EVALUASI_REQUEST_OPD` dibuat dengan payload `nilaiOPD` | `PJ_PENYUSUN`/`EVALUATOR` | `POST /evaluasi` atau `PATCH /evaluasi/:id/selesai` | Request ditolak karena evaluasi EVALUASI_REQUEST_OPD tidak memakai nilai OPD |
| IT-53 | Critical | Evaluasi SOP | Evaluator mengisi nilai saat pengajuan bukan `SEDANG_DIEVALUASI` | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId` | Request ditolak, nilai evaluasi tidak berubah |
| IT-54 | Critical | Evaluasi SOP | Evaluator menilai DetailSOP yang bukan anggota pengajuan | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId` | Request ditolak, SOP luar pengajuan tidak dapat dinilai |
| IT-55 | Critical | Revisi SOP | Kirim ulang revisi ketika SOP sudah tidak lengkap setelah diperbaiki | `PJ_PENYUSUN` | `POST /sop/penyusun-workbench/:detailSopId/kirim-ulang-evaluasi` | Request ditolak oleh validasi kelengkapan |
| IT-56 | Critical | SOP Header | Memperbarui nomor SOP menjadi nomor yang sudah dipakai SOP lain | `PENYUSUN` | `PATCH /sop/header/:detailSopId` | Request ditolak, nomor SOP tetap unik |
| IT-57 | Critical | SOP Header | Menambahkan SOP terkait yang mengarah ke dirinya sendiri | `PENYUSUN` | `PATCH /sop/header/:detailSopId` | Request ditolak, relasi self-loop tidak tersimpan |
| IT-58 | Critical | SOP Prosedur | Langkah SOP memakai pelaksana dari OPD lain | `PENYUSUN` | `PATCH /sop/langkah/:detailSopId` | Request ditolak, langkah tidak tersimpan |
| IT-59 | Critical | SOP Prosedur | Payload prosedur memiliki `tempId` duplikat | `PENYUSUN` | `PATCH /sop/langkah/:detailSopId` | Request ditolak karena referensi langkah ambigu |
| IT-60 | Critical | SOP Prosedur | Cabang YA/TIDAK mengarah ke `tempId` yang tidak ada | `PENYUSUN` | `PATCH /sop/langkah/:detailSopId` | Request ditolak, relasi cabang tidak valid |
| IT-61 | Critical | SOP Prosedur | Langkah memakai pelaksana yang tidak ada dalam swimlane payload | `PENYUSUN` | `PATCH /sop/langkah/:detailSopId` | Request ditolak, integritas swimlane tetap terjaga |
| IT-62 | Critical | Status SOP | User mencoba mengubah status SOP langsung ke `BERLAKU` melalui endpoint status | `PENYUSUN`/`KEPALA_OPD` | `PATCH /sop/status/:detailSopId` | Request ditolak, status `BERLAKU` hanya melalui TTE Kepala OPD |
| IT-63 | Critical | TTE Profil | Membuat PIN TTE ulang ketika PIN sudah pernah dibuat | `PJ_EVALUATOR`/`PJ_PENYUSUN`/`KEPALA_OPD` | `POST /tte/profil` | Request ditolak, pengguna harus memakai endpoint ubah PIN |
| IT-64 | Critical | TTE Profil | Mengubah PIN TTE dengan PIN lama salah | Role TTE | `PATCH /tte/profil/pin` | Request ditolak, hash PIN tidak berubah |
| IT-65 | Critical | TTE BA | Role yang sama menandatangani BA dua kali | `PJ_EVALUATOR` atau `PJ_PENYUSUN` | `POST /tte/tanda-tangani/ba/:pengajuanId` | Request kedua ditolak, tidak ada duplikasi `RiwayatTandaTangan` |
| IT-66 | Critical | TTE BA | Pengguna yang belum membuat PIN mencoba tanda tangan BA | `PJ_EVALUATOR`/`PJ_PENYUSUN` | `POST /tte/tanda-tangani/ba/:pengajuanId` | Request ditolak, tidak ada dokumen atau riwayat tanda tangan baru |
| IT-67 | Critical | TTE Integrity | Dokumen TTE memiliki parent tidak valid, yaitu SOP dan Pengajuan sekaligus atau keduanya kosong | Role TTE | Endpoint tanda tangan terkait | Request ditolak, data dokumen TTE tidak dipakai |
| IT-68 | Critical | TTE SOP | Kepala OPD dari OPD lain menandatangani SOP pengajuan | `KEPALA_OPD` OPD lain | `POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua` | Request ditolak, tidak ada SOP menjadi `BERLAKU` |
| IT-69 | Critical | Versi SOP | Versi baru disahkan dan menggantikan versi lama yang masih `BERLAKU` | `KEPALA_OPD` | `POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua` | Versi baru menjadi `BERLAKU`, versi lama berubah menjadi `DIGANTIKAN` |
| IT-70 | Critical | Versi SOP | Menghapus versi draft yang bukan draft atau sudah masuk evaluasi | `PENYUSUN`/`PJ_PENYUSUN` | `DELETE /sop/:detailSopId/versi-draft` | Request ditolak, versi non-draft tidak terhapus |
| IT-71 | Critical | Cabut SOP | Kepala OPD mencabut SOP saat masih ada revisi berjalan | `KEPALA_OPD` | `POST /sop/cabut/:detailOrSopId` | Request ditolak, SOP `BERLAKU` tetap aktif |
| IT-72 | High | Arsip Publik | Dokumen publik tidak mengembalikan log edit, data internal, atau catatan evaluasi internal | Publik | `GET /sop/public/dokumen/:detailSopId` | Response hanya berisi data dokumen publik |
| IT-73 | High | Laporan Evaluasi | Pengajuan dengan `nilaiOPD` di luar skala 1-5 tidak dihitung dalam KPI | `PJ_EVALUATOR` | `GET /evaluasi/laporan/grafik-tahunan` | Statistik mengabaikan nilai OPD invalid |
| IT-74 | Critical | Optimistic Locking | Dua evaluator menyimpan nilai dengan versi data lama dan baru secara bersamaan | `EVALUATOR` | `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId` | Update pertama berhasil, update stale ditolak sebagai konflik |
| IT-75 | Critical | Idempotensi Data | Request refresh/list/detail berulang tidak mengubah status bisnis | Role sesuai endpoint | `GET /evaluasi`, `GET /sop`, `GET /evaluasi/pengajuan/:id` | Response konsisten dan tidak ada mutasi database |

## Verifikasi PDF Unduhan (QR + CA Internal)

Suite: [`server/test/integration/tte-pdf-qr-verifikasi.integration-spec.ts`](../server/test/integration/tte-pdf-qr-verifikasi.integration-spec.ts). Mensimulasikan alur setelah unduh PDF bertanda tangan: URL QR pada PDF (`/validasi/pengesahan/{dokumenTteId}/{userId}`) dan verifikasi PKCS#7 terhadap CA internal server.

Jalankan via `pnpm test:integration:docker` atau `pnpm test:integration:docker:pdf`. `PDF_SIGNING_ENABLED` diaktifkan di `beforeAll` suite; sertifikat uji dari `scripts/generate-pdf-signing-cert.cjs`.

| ID | Prioritas | Area | Skenario | Aktor | Endpoint Utama | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| IT-76 | Critical | Verifikasi PDF unduhan | QR BA PJ Evaluator → API publik pengesahan | Publik | `GET /tte/public/pengesahan/:dokumenTteId/:userId` | Penandatangan PJ Evaluator valid, dokumen BA cocok |
| IT-77 | Critical | Verifikasi PDF unduhan | QR SOP Kepala OPD → API publik pengesahan | Publik | `GET /tte/public/pengesahan/:dokumenTteId/:userId` | Peran `KEPALA_OPD`, dokumen `SOP_BERLAKU` |
| IT-78 | Critical | Verifikasi PDF unduhan | PDF SOP ditandatangani PKCS#7 lalu diverifikasi CA internal | `KEPALA_OPD` | `POST /tte/pdf/sign` → `POST /tte/public/pdf/verify` | `allValid`, `digestMatch`, `chainTrusted` |
| IT-79 | Critical | Verifikasi PDF unduhan | PDF Berita Acara arsip ditandatangani lalu diverifikasi CA internal | `KEPALA_OPD` | `POST /tte/pdf/sign-berita-acara-arsip` → `POST /tte/public/pdf/verify` | `allValid`, penandatangan arsip terdeteksi |
| IT-80 | High | Verifikasi PDF unduhan | PDF tanpa tanda tangan digital | Publik | `POST /tte/public/pdf/verify` | `hasSignatures: false`, `allValid: false` |
| IT-81 | High | Verifikasi PDF unduhan | `userId` tidak cocok dengan riwayat dokumen TTE | Publik | `GET /tte/public/pengesahan/:dokumenTteId/:userId` | Not found (404) |

```powershell
cd server
pnpm test:integration:docker:pdf
```

## Tambahan Constraint Coverage

Test case IT-51 sampai IT-75 ditambahkan untuk menutup constraint bisnis yang tidak selalu terlihat pada happy path core workflow. Constraint ini penting karena sebagian besar risiko sistem muncul bukan saat alur normal berjalan, tetapi saat data lintas status, lintas OPD, atau lintas transaksi berada dalam kondisi edge case.

| Constraint | Test Case |
|---|---|
| Tidak boleh ada pengajuan evaluasi aktif ganda untuk SOP/OPD yang sama | IT-51 |
| Evaluasi `EVALUASI_REQUEST_OPD` tidak menggunakan nilai OPD, sedangkan evaluasi `EVALUASI_REQUEST_EVALUATOR` wajib nilai OPD saat selesai | IT-28, IT-29, IT-52 |
| Evaluator hanya boleh menilai pengajuan aktif berstatus `SEDANG_DIEVALUASI` | IT-53 |
| DetailSOP yang dinilai harus menjadi anggota pengajuan | IT-54 |
| Kirim ulang revisi harus tetap melewati validasi kelengkapan SOP | IT-55 |
| Nomor SOP harus unik | IT-56 |
| Relasi SOP terkait tidak boleh self-loop | IT-57 |
| Pelaksana dan langkah SOP harus berasal dari OPD yang benar dan referensinya valid | IT-58, IT-59, IT-60, IT-61 |
| Status `BERLAKU` hanya boleh dicapai melalui tanda tangan Kepala OPD | IT-62 |
| PIN TTE tidak boleh dibuat ulang lewat endpoint register dan perubahan PIN butuh PIN lama valid | IT-63, IT-64 |
| Tanda tangan BA tidak boleh duplikat untuk role yang sama | IT-65 |
| Tanda tangan elektronik harus ditolak jika kredensial TTE belum dibuat | IT-66 |
| Dokumen TTE wajib memiliki parent yang valid dan tunggal | IT-67 |
| Kepala OPD tidak boleh menandatangani SOP OPD lain | IT-68 |
| Pengesahan versi baru harus mengganti versi lama yang berlaku | IT-69 |
| Versi non-draft atau versi yang sudah masuk proses tidak boleh dihapus sebagai draft | IT-70 |
| SOP tidak boleh dicabut jika masih ada revisi berjalan | IT-71 |
| Arsip publik tidak boleh membocorkan log audit atau catatan internal | IT-72 |
| Nilai OPD di luar skala tidak boleh memengaruhi KPI laporan | IT-73 |
| Update bersamaan harus ditangani dengan conflict/optimistic locking | IT-74 |
| Endpoint read-only tidak boleh menyebabkan mutasi status bisnis | IT-75 |

## Detail Skenario Kritis

### IT-15: PJ Penyusun Membuat Pengajuan Evaluasi EVALUASI_REQUEST_OPD

Tujuan:
Memastikan pengajuan evaluasi benar-benar membentuk data lintas tabel dan mengubah status SOP.

Prakondisi:
- User `PJ_PENYUSUN_A` sudah login.
- `SOP_SIAP_A` lengkap dan berstatus `MENUNGGU_PENGAJUAN_EVALUASI`.

Langkah:
1. Kirim request `POST /evaluasi`.
2. Body berisi jenis pengajuan `EVALUASI_REQUEST_OPD` dan daftar `detailSopId`.
3. Ambil response API.
4. Query database untuk `PengajuanEvaluasi`, `NilaiEvaluasi`, dan `DetailSOP`.

Data/Input:

```json
{
  "jenis": "EVALUASI_REQUEST_OPD",
  "detailSopIds": ["<detailSopId>"]
}
```

Expected result:
- HTTP response sukses.
- Satu row `PengajuanEvaluasi` terbentuk.
- Row `NilaiEvaluasi` terbentuk untuk setiap `detailSopId`.
- Status `DetailSOP` berubah menjadi `SEDANG_DIEVALUASI`.
- `opdId` pengajuan sama dengan OPD milik PJ Penyusun.

### IT-20: Evaluator Memberi Nilai Perlu Perbaikan

Tujuan:
Memastikan catatan evaluasi tersimpan dan SOP masuk alur revisi.

Prakondisi:
- User `EVAL` sudah login.
- Pengajuan berstatus `SEDANG_DIEVALUASI`.
- DetailSOP menjadi anggota pengajuan.

Langkah:
1. Kirim request `PATCH /evaluasi/:pengajuanId/nilai/:detailSopId`.
2. Isi hasil `PERLU_PERBAIKAN` dan catatan.
3. Query database pada `NilaiEvaluasi` dan `DetailSOP`.

Data/Input:

```json
{
  "hasil": "PERLU_PERBAIKAN",
  "catatan": "Langkah SOP perlu diperjelas pada bagian verifikasi dokumen."
}
```

Expected result:
- HTTP response sukses.
- `NilaiEvaluasi.hasil` menjadi `PERLU_PERBAIKAN`.
- `NilaiEvaluasi.catatan` tersimpan.
- `NilaiEvaluasi.statusTindakLanjut` menjadi `TERBUKA`.
- Status `DetailSOP` menjadi `REVISI_DARI_EVALUATOR`.

### IT-25: PJ Penyusun Kirim Ulang Setelah Revisi

Tujuan:
Memastikan SOP hanya dapat dikirim ulang setelah tindak lanjut revisi ditandai selesai.

Prakondisi:
- User `PJ_PENYUSUN_A` sudah login.
- SOP berstatus `REVISI_DARI_EVALUATOR`.
- `NilaiEvaluasi.statusTindakLanjut` sudah `SELESAI`.
- Dokumen SOP sudah lengkap.

Langkah:
1. Kirim request `POST /sop/penyusun-workbench/:detailSopId/kirim-ulang-evaluasi`.
2. Query database pada `DetailSOP` dan `NilaiEvaluasi`.

Expected result:
- HTTP response sukses.
- SOP kembali masuk alur evaluasi.
- Status tidak boleh tetap `REVISI_DARI_EVALUATOR`.
- Tidak ada duplikasi pengajuan yang tidak valid.

### IT-32: PJ Evaluator Menandatangani Berita Acara

Tujuan:
Memastikan tanda tangan BA oleh PJ Evaluator mengubah status pengajuan secara konsisten.

Prakondisi:
- User `PJ_EVAL` sudah login.
- User sudah memiliki PIN TTE.
- Pengajuan berstatus `SELESAI_DIEVALUASI`.
- Semua SOP dalam pengajuan sudah `MENUNGGU_TTD_PJ_EVALUATOR`.

Langkah:
1. Kirim request `POST /tte/tanda-tangani/ba/:pengajuanId`.
2. Query database pada `DokumenTte`, `RiwayatTandaTangan`, dan `PengajuanEvaluasi`.

Data/Input:

```json
{
  "pin": "123456",
  "nomorDokumen": "BA-001",
  "judulDokumen": "Berita Acara Evaluasi SOP"
}
```

Expected result:
- HTTP response sukses.
- Dokumen TTE jenis `BERITA_ACARA_EVALUASI` terbentuk.
- Riwayat tanda tangan PJ Evaluator tersimpan.
- Pengajuan berubah menjadi `DITANDATANGANI_PJ_EVALUATOR`.

### IT-33: PJ Penyusun Menandatangani Berita Acara

Tujuan:
Memastikan BA ditandatangani pihak OPD setelah ditandatangani PJ Evaluator.

Prakondisi:
- User `PJ_PENYUSUN_A` sudah login.
- User sudah memiliki PIN TTE.
- Pengajuan berstatus `DITANDATANGANI_PJ_EVALUATOR`.
- Pengajuan berasal dari OPD user.

Langkah:
1. Kirim request `POST /tte/tanda-tangani/ba/:pengajuanId`.
2. Query database pada `RiwayatTandaTangan`, `PengajuanEvaluasi`, dan `DetailSOP`.

Expected result:
- Riwayat tanda tangan PJ Penyusun tersimpan.
- Pengajuan berubah menjadi `DITANDATANGANI_PJ_PENYUSUN`.
- SOP dalam pengajuan berubah menjadi `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI`.

### IT-35: Kepala OPD Menandatangani Seluruh SOP

Tujuan:
Memastikan pengesahan SOP oleh Kepala OPD berjalan atomik untuk seluruh SOP dalam satu pengajuan.

Prakondisi:
- User `KEPALA_A` sudah login.
- User sudah memiliki PIN TTE.
- Pengajuan berstatus `DITANDATANGANI_PJ_PENYUSUN`.
- Seluruh SOP dalam pengajuan berstatus `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI`.

Langkah:
1. Kirim request `POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua`.
2. Query database pada `DetailSOP`, `DokumenTte`, `RiwayatTandaTangan`, dan `PengajuanEvaluasi`.

Expected result:
- Semua SOP dalam pengajuan berubah menjadi `BERLAKU`.
- Dokumen TTE jenis `SOP_BERLAKU` dibuat untuk setiap SOP.
- Riwayat tanda tangan Kepala OPD tersimpan untuk setiap SOP.
- Pengajuan berubah menjadi `SELESAI`.
- Jika salah satu SOP gagal, semua perubahan dibatalkan.

### IT-39: SOP Berlaku Tampil di Arsip Publik

Tujuan:
Memastikan SOP yang sudah sah dapat diakses publik tanpa login.

Prakondisi:
- Minimal satu SOP sudah berstatus `BERLAKU`.

Langkah:
1. Kirim request `GET /sop/public/sop`.
2. Kirim request `GET /sop/public/dokumen/:detailSopId`.

Expected result:
- SOP berstatus `BERLAKU` muncul pada daftar publik.
- Detail dokumen SOP dapat dibuka publik.
- Data internal seperti log audit tidak dikembalikan.

## Contoh Simulasi Alur Integration Test Utama

Alur berikut dapat dijadikan satu integration scenario besar, tetapi tetap sebaiknya dipecah menjadi beberapa test agar mudah ditelusuri saat gagal.

1. Login sebagai `PENYUSUN`.
2. Buat SOP baru.
3. Isi header SOP.
4. Isi pelaksana dan langkah SOP.
5. Tandai SOP menjadi `MENUNGGU_PENGAJUAN_EVALUASI`.
6. Login sebagai `PJ_PENYUSUN`.
7. Buat pengajuan evaluasi.
8. Login sebagai `EVALUATOR`.
9. Isi nilai `PERLU_PERBAIKAN` dengan catatan.
10. Login sebagai `PENYUSUN`.
11. Baca umpan balik evaluasi.
12. Tandai tindak lanjut selesai.
13. Login sebagai `PJ_PENYUSUN`.
14. Kirim ulang SOP ke evaluator.
15. Login sebagai `EVALUATOR`.
16. Isi nilai `SESUAI`.
17. Selesaikan evaluasi.
18. Login sebagai `PJ_EVALUATOR`.
19. Tanda tangani Berita Acara.
20. Login sebagai `PJ_PENYUSUN`.
21. Tanda tangani Berita Acara.
22. Login sebagai `KEPALA_OPD`.
23. Tanda tangani seluruh SOP dalam pengajuan.
24. Akses arsip publik dan pastikan SOP muncul.

## Risiko yang Ditutup oleh Integration Test

| Risiko | Ditutup Oleh |
|---|---|
| Role tidak sesuai dapat mengakses data | IT-02, IT-03, IT-05, IT-14, IT-22, IT-34, IT-45, IT-48 |
| Akses lintas OPD bocor | IT-17, IT-34, IT-48, IT-68 |
| Status SOP melompat tanpa validasi | IT-12, IT-13, IT-14, IT-16, IT-24, IT-36, IT-53, IT-62 |
| Pengajuan evaluasi terbentuk sebagian atau ganda | IT-15, IT-16, IT-49, IT-51 |
| Jenis evaluasi `EVALUASI_REQUEST_OPD`/`EVALUASI_REQUEST_EVALUATOR` tidak konsisten dengan nilai OPD | IT-28, IT-29, IT-52 |
| DetailSOP luar pengajuan dapat ikut dinilai | IT-54 |
| Catatan revisi tidak tersimpan | IT-19, IT-20, IT-21 |
| Revisi dikirim ulang sebelum selesai atau saat dokumen tidak lengkap | IT-23, IT-24, IT-25, IT-55 |
| Evaluasi selesai padahal masih ada perbaikan | IT-26, IT-27, IT-28, IT-29 |
| Nomor SOP duplikat atau relasi SOP self-loop tersimpan | IT-56, IT-57 |
| Prosedur SOP berisi pelaksana/cabang yang tidak valid | IT-58, IT-59, IT-60, IT-61 |
| Tanda tangan elektronik dilakukan pada status salah atau tanpa kredensial | IT-31, IT-32, IT-33, IT-36, IT-37, IT-66 |
| Tanda tangan BA duplikat untuk role yang sama | IT-65 |
| Dokumen TTE memiliki parent tidak valid | IT-67 |
| Pengesahan SOP sebagian berhasil sebagian gagal | IT-35, IT-37 |
| Versi SOP berlaku lama tidak digantikan saat versi baru disahkan | IT-69 |
| Versi draft yang tidak valid terhapus | IT-70 |
| SOP dicabut ketika masih ada revisi berjalan | IT-71 |
| SOP belum berlaku tampil di publik atau data internal bocor | IT-39, IT-40, IT-41, IT-72 |
| Nilai OPD invalid memengaruhi laporan | IT-46, IT-47, IT-73 |
| Konflik update bersamaan merusak data | IT-50, IT-74 |
| Endpoint baca mengubah status bisnis | IT-75 |

## Kesimpulan

Integration test yang paling penting untuk sistem ini adalah pengujian pada alur pengajuan evaluasi, revisi, penyelesaian evaluasi, tanda tangan elektronik, pengesahan SOP, dan arsip publik. Area tersebut disebut critical karena melibatkan perubahan status lintas tabel, otorisasi lintas role, dan transaksi database yang harus konsisten.

Jika seluruh test case critical lulus, maka backend memiliki bukti kuat bahwa core workflow aplikasi berjalan konsisten dari sisi API dan database. Pengujian ini tetap perlu dilengkapi dengan end-to-end test apabila ingin membuktikan perjalanan pengguna dari antarmuka aplikasi secara penuh.

# Integration Testing Backend

Dokumen ini menjelaskan integration test backend yang tersedia pada codebase saat ini. Daftar ini bersifat operasional; jumlah test case dapat berubah mengikuti implementasi.

## Tujuan

Integration test memverifikasi interaksi service/repository, persistence MariaDB, transaksi, dan invariant database yang berasal dari migration. Test ini berbeda dari unit test karena menggunakan komponen persistence nyata, dan berbeda dari Playwright E2E karena tidak menguji UI browser.

## Lokasi

Suite berada di `server/test/integration/`, termasuk:

- `auth-session.integration-spec.ts` — autentikasi dan lifecycle session.
- `core-workflow.integration-spec.ts` — alur inti pengelolaan SOP.
- `evaluasi-edge-cases.integration-spec.ts` — edge case evaluasi.
- `evaluasi-grafik.integration-spec.ts` — agregasi/data grafik evaluasi.
- `opd-penyusun-lifecycle.integration-spec.ts` — lifecycle OPD dan penyusun.
- `rbac-access-control.integration-spec.ts` — kontrol akses peran dan OPD.
- `sop-versioning.integration-spec.ts` — versioning/revisi SOP.
- `tte-pdf-qr-verifikasi.integration-spec.ts` — PDF, QR, dan verifikasi TTE.
- `database-invariants.integration-spec.ts` — migration history, index, enum, FK/referential action, trigger satu versi `BERLAKU`, XOR parent `DokumenTte`, dan serialisasi pengajuan aktif per OPD.

Helper integration berada pada `server/test/integration/helpers/`. Konfigurasi environment integration dimuat melalui `server/test/integration/setup-env.ts` dan `.env.test`.

## Menjalankan test

Gunakan script integration pada `server/package.json` melalui Docker test environment repository. Database test harus disposable dan tidak boleh menunjuk ke database development/production.

Setup integration wajib migration-backed. `prisma db push` tidak dipakai sebagai pengganti migration chain karena raw SQL migration seperti trigger dan CHECK constraint tidak direplay oleh `db push`.

Prinsip yang harus dipertahankan:

1. database integration terisolasi;
2. schema dibentuk dari migration yang sama dengan deployment production;
3. data fixture khusus test boleh dibuang setelah run;
4. tidak ada request ke provider eksternal nyata;
5. kegagalan integration tidak ditutupi retry atau assertion yang dilemahkan;
6. database invariant penting diverifikasi terhadap MariaDB nyata.

## WhatsApp

Suite Evolution API lama telah dihapus karena bukan lagi arsitektur notifikasi aktif. Implementasi outbound aktif menggunakan Wago melalui `WagoProvider`. WhatsApp nonaktif bila `WAGO_BASE_URL` dan `WAGO_API_KEY` sama-sama kosong; konfigurasi hanya salah satu dari keduanya ditolak saat startup. Recipient allow/opt-out dikelola di Wago dan tidak di-auto-allow oleh SOPFlow.

## Catatan hasil

Angka jumlah suite/test dan coverage dalam laporan penelitian merupakan snapshot pada commit/run tertentu. Untuk status branch terkini gunakan hasil CI pada commit yang sedang diuji.

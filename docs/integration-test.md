# Integration Testing Backend

Dokumen ini menjelaskan integration test backend yang benar-benar tersedia pada codebase saat ini. Daftar ini bersifat operasional; jumlah test case dapat berubah seiring perubahan implementasi.

## Tujuan

Integration test memverifikasi interaksi antar service/repository dengan MariaDB test yang terisolasi. Test ini berbeda dari unit test karena menggunakan komponen persistence dan alur aplikasi yang lebih lengkap, serta berbeda dari Playwright E2E karena tidak menguji UI browser.

## Lokasi

Suite berada di `server/test/integration/`:

- `auth-session.integration-spec.ts` — autentikasi, session/cookie, dan lifecycle login.
- `core-workflow.integration-spec.ts` — alur inti pengelolaan SOP lintas service dan persistence.
- `evaluasi-edge-cases.integration-spec.ts` — edge case proses evaluasi.
- `evaluasi-grafik.integration-spec.ts` — agregasi/data grafik evaluasi.
- `opd-penyusun-lifecycle.integration-spec.ts` — lifecycle OPD dan penyusun.
- `rbac-access-control.integration-spec.ts` — pembatasan akses berdasarkan peran dan konteks OPD.
- `sop-versioning.integration-spec.ts` — versioning/revisi SOP dan invariant terkait.
- `tte-pdf-qr-verifikasi.integration-spec.ts` — penandatanganan PDF, QR, dan verifikasi TTE.

Helper integration berada pada `server/test/integration/helpers/`. Konfigurasi environment integration dimuat melalui `server/test/integration/setup-env.ts` dan `.env.test`.

## Menjalankan test

Gunakan script integration pada `server/package.json`/Docker test environment yang tersedia di repository. Database test harus disposable dan tidak boleh menunjuk ke database development/production.

Prinsip yang harus dipertahankan:

1. database integration terisolasi;
2. migration/schema test harus konsisten dengan deployment target;
3. data fixture dibuat khusus test dan boleh dibuang setelah run;
4. tidak ada request ke provider eksternal nyata;
5. kegagalan integration tidak ditutupi dengan retry atau assertion yang dilemahkan.

## WhatsApp

Suite Evolution API lama telah dihapus karena source module tersebut sudah tidak menjadi arsitektur notifikasi aktif. Implementasi aktif menggunakan modul reminder dengan `WhaApiProvider`. Kontrak konfigurasi WhatsApp diuji pada unit/config test: kedua credential kosong berarti nonaktif; `WHAAPI_TOKEN` dan `WHAAPI_CHANNEL_ID` yang lengkap berarti aktif; hanya salah satu credential dianggap salah konfigurasi dan startup ditolak.

## Catatan hasil

Angka jumlah suite/test dan coverage yang pernah dicatat dalam laporan penelitian adalah snapshot pada commit/run tertentu, bukan jaminan kondisi branch terbaru. Untuk status terkini gunakan output CI pada commit yang sedang diuji.

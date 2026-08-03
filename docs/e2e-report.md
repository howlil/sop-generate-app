# 5.2.1 Pengujian Sistem (*System Testing*)

Pengujian sistem pada SOPFlow dilaksanakan menggunakan Playwright, yaitu *framework* pengujian *end-to-end* (E2E) berbasis Node.js. Playwright digunakan untuk mengotomatisasi interaksi pengguna secara langsung pada browser nyata, seperti membuka halaman, mengisi formulir, menekan tombol, memilih menu, mengunggah berkas, serta memverifikasi respons sistem melalui *assertion*. Dengan pendekatan ini, alur fungsional sistem diuji dalam kondisi yang mendekati cara pengguna memakai aplikasi secara langsung.

Pengujian dilakukan pada sisi client dengan berkas uji yang tersimpan pada direktori `client/e2e`. Setiap berkas `*.spec.ts` mewakili area pengujian tertentu, misalnya `auth.spec.ts` untuk autentikasi, `role-access.spec.ts` untuk otorisasi, `master-data.spec.ts` untuk data master, `sop-authoring.spec.ts` untuk penyusunan SOP, `evaluasi-workflow.spec.ts` untuk alur evaluasi dan revisi, `tte-pengesahan.spec.ts` untuk TTE internal dan pengesahan, `arsip-public.spec.ts` untuk arsip publik, serta `pdf-verification.spec.ts` untuk verifikasi PDF. Sebelum rangkaian pengujian berjalan, berkas `global-setup.ts` memeriksa ketersediaan backend dan melakukan preflight login agar lingkungan pengujian siap digunakan.

Konfigurasi pengujian berada pada `client/playwright.config.ts`. Berdasarkan konfigurasi tersebut, aplikasi client dijalankan pada `http://127.0.0.1:5173`, sedangkan backend API menggunakan `http://127.0.0.1:3000/api/v1`. Browser yang digunakan pada laporan aktual ini adalah Chromium. Playwright juga menghasilkan laporan HTML pada `client/playwright-report/index.html` dan ringkasan hasil terakhir pada `client/test-results/.last-run.json`.

Berdasarkan laporan Playwright yang dibuat pada 5 Juli 2026 pukul 17.53 WIB, pengujian sistem menjalankan 82 test pada proyek Chromium. Seluruh test berstatus lulus, dengan rincian 82 *expected*, 0 *unexpected*, 0 *flaky*, dan 0 *skipped*. File `client/test-results/.last-run.json` juga menunjukkan status `passed` dengan `failedTests` kosong. Selain itu, sistem memiliki 70 skenario rancangan E2E yang dipetakan melalui `client/e2e/support/test-data.ts` dan diverifikasi oleh `scenario-traceability.spec.ts`.

## 5.2.1.1 Fokus Pengujian Sistem

Berdasarkan fungsionalitas sistem sebagai aplikasi pengelolaan SOP berbasis web, pengujian sistem berfokus pada modul-modul utama yang digunakan oleh PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun, dan pengunjung publik. Fokus pengujian sistem dapat dilihat pada Tabel 5.1.

**Tabel 5.1 Fokus Pengujian Sistem**

| No | Modul/Aspek | Pengguna Terlibat | Cakupan Pengujian |
| -- | ----------- | ----------------- | ----------------- |
| 1 | Halaman Publik | Pengunjung | Akses landing page, arsip publik, halaman verifikasi PDF, dan tautan verifikasi pengesahan tanpa login |
| 2 | Autentikasi | Semua role | Login valid, login gagal, validasi kredensial, logout, perubahan kata sandi, dan redirect halaman terlindungi |
| 3 | Otorisasi Akses | Semua role | Menu sesuai role, route yang diizinkan, pembatasan navigasi role lain, pembatasan aksi, dan pembatasan data OPD |
| 4 | Data Master OPD | PJ Evaluator | Tambah OPD, ubah OPD, dan nonaktif OPD |
| 5 | Data Master Evaluator | PJ Evaluator | Tambah evaluator, ubah evaluator, pencarian data, dan hapus evaluator |
| 6 | Data Master Penyusun | PJ Evaluator | Tambah penyusun, pengelolaan penyusun, dan mutasi OPD |
| 7 | Data Master Kepala OPD | PJ Evaluator | Penetapan Kepala OPD pada data organisasi |
| 8 | Referensi Pelaksana SOP | Penyusun | Tambah dan ubah data pelaksana SOP |
| 9 | Referensi Peraturan | Penyusun | Tambah, ubah, pencarian, dan validasi duplikat peraturan |
| 10 | Grafik Evaluasi | PJ Evaluator | Akses grafik evaluasi dan penggunaan filter |
| 11 | Penyusunan SOP | Penyusun, PJ Penyusun | Pembuatan draft, validasi data kosong, nomor duplikat, kelengkapan SOP, diagram, riwayat, status siap evaluasi, dan versi baru |
| 12 | Pengajuan Evaluasi SOP | PJ Penyusun, Penyusun | Dialog pengajuan, pengajuan SOP siap evaluasi, penolakan SOP belum siap, dan pembatasan penyusun biasa |
| 13 | Evaluasi SOP | Evaluator | Workspace evaluasi, daftar pengajuan, penilaian sesuai, dan penolakan penyelesaian sebelum syarat lengkap |
| 14 | Revisi SOP | Evaluator, PJ Penyusun, Penyusun | Catatan revisi, tindak lanjut revisi, kirim ulang, evaluasi ulang, dan pembatasan penyusun biasa |
| 15 | Profil Akun | Semua role | Identitas akun dan form perubahan kata sandi |
| 16 | TTE Internal | Role berwenang TTE | Tampilan section sertifikat/PIN, pembatasan penyusun biasa, profil TTE, dan validasi PIN |
| 17 | Berita Acara | PJ Penyusun, pengguna berwenang | Daftar berita acara dan akses cetak/unduh |
| 18 | TTE Berita Acara | PJ Evaluator, PJ Penyusun | Urutan tanda tangan berita acara sebelum pengesahan |
| 19 | Pengesahan SOP | Kepala OPD | Pemantauan SOP, pengajuan pengesahan, dan pengesahan setelah berita acara lengkap |
| 20 | Pencabutan SOP | Kepala OPD | Pencabutan SOP berlaku dan dampaknya terhadap arsip publik |
| 21 | Versi SOP | PJ Penyusun, Kepala OPD | Pembuatan versi baru dan penggantian versi lama setelah versi baru disahkan |
| 22 | Arsip SOP Publik | Pengunjung | SOP berlaku tampil pada arsip, SOP draft tidak tampil, pratinjau tersedia, dan data internal tidak bocor |
| 23 | Verifikasi Pengesahan | Pengunjung | Verifikasi pengesahan valid dan tidak valid |
| 24 | Verifikasi PDF | Pengunjung | Tombol sebelum file dipilih, validasi non-PDF, PDF bertanda tangan, dan PDF tanpa tanda tangan |
| 25 | Daftar SOP | Penyusun | Pencarian, filter status, dan navigasi halaman daftar SOP |
| 26 | Konsistensi Status | Role terkait workflow | Konsistensi status setelah refresh, logout-login, dan perpindahan peran |
| 27 | Traceability Skenario | Penguji | Validasi bahwa E2E-01 sampai E2E-70 terpetakan tepat sekali |

## 5.2.1.2 Rekapitulasi Hasil Eksekusi Playwright

Rekapitulasi hasil eksekusi digunakan untuk menunjukkan kondisi aktual seluruh berkas pengujian. Data pada Tabel 5.2 diambil dari `client/playwright-report/index.html`.

**Tabel 5.2 Rekapitulasi Eksekusi Pengujian Sistem**

| No | Berkas Uji | Jumlah Test | Lulus | Gagal | Flaky | Skip |
| -- | ---------- | ----------: | ----: | ----: | ----: | ---: |
| 1 | `arsip-public.spec.ts` | 3 | 3 | 0 | 0 | 0 |
| 2 | `auth.spec.ts` | 10 | 10 | 0 | 0 | 0 |
| 3 | `evaluasi-workflow.spec.ts` | 4 | 4 | 0 | 0 | 0 |
| 4 | `list-filter-pagination.spec.ts` | 1 | 1 | 0 | 0 | 0 |
| 5 | `master-data.spec.ts` | 10 | 10 | 0 | 0 | 0 |
| 6 | `pdf-verification.spec.ts` | 4 | 4 | 0 | 0 | 0 |
| 7 | `profile-tte.spec.ts` | 3 | 3 | 0 | 0 | 0 |
| 8 | `public-pages.spec.ts` | 4 | 4 | 0 | 0 | 0 |
| 9 | `role-access.spec.ts` | 18 | 18 | 0 | 0 | 0 |
| 10 | `scenario-traceability.spec.ts` | 10 | 10 | 0 | 0 | 0 |
| 11 | `sop-authoring.spec.ts` | 7 | 7 | 0 | 0 | 0 |
| 12 | `tte-pengesahan.spec.ts` | 4 | 4 | 0 | 0 | 0 |
| 13 | `workflow-observation.spec.ts` | 4 | 4 | 0 | 0 | 0 |
| **Total** | **Seluruh Berkas Uji** | **82** | **82** | **0** | **0** | **0** |

Jumlah 82 pada Tabel 5.2 merupakan jumlah test teknis yang dieksekusi Playwright. Jumlah tersebut berbeda dari 70 skenario rancangan karena satu test dapat mencakup beberapa ID skenario E2E, sedangkan beberapa test lain digunakan untuk validasi tambahan seperti traceability dan akses halaman.

## 5.2.1.3 Pengujian Fungsional Modul Halaman Publik

Pengujian fungsional modul halaman publik memverifikasi bahwa halaman yang memang disediakan untuk pengguna umum dapat dibuka tanpa autentikasi. Modul ini mencakup landing page, arsip publik, halaman verifikasi PDF, serta tautan verifikasi pengesahan yang tidak valid. Daftar pengujian fungsional modul halaman publik dapat dilihat pada Tabel 5.3.

**Tabel 5.3 Pengujian Fungsional Modul Halaman Publik**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka landing page publik | URL `/` | Halaman publik dapat dimuat tanpa login | Sesuai | Lulus |
| 2 | Membuka arsip publik | URL `/arsip` | Halaman arsip tampil dan menyediakan pencarian atau daftar SOP | Sesuai | Lulus |
| 3 | Membuka halaman verifikasi PDF | URL `/validasi/pdf` | Halaman verifikasi PDF dapat dibuka tanpa login | Sesuai | Lulus |
| 4 | Membuka tautan verifikasi pengesahan tidak valid | URL verifikasi yang tidak valid | Sistem menampilkan status aman, tidak valid, atau tidak ditemukan tanpa error aplikasi | Sesuai | Lulus |

Bukti pengujian modul halaman publik terdapat pada `public-pages.spec.ts` dan laporan Playwright `client/playwright-report/index.html`.

## 5.2.1.4 Pengujian Fungsional Modul Autentikasi

Pengujian fungsional modul autentikasi memverifikasi proses login, validasi kredensial, perubahan kata sandi, logout, dan perlindungan halaman internal dari akses tanpa sesi. Pengujian dilakukan menggunakan akun PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, dan Penyusun yang didefinisikan pada `client/e2e/fixtures/users.ts`. Daftar pengujian fungsional modul autentikasi dapat dilihat pada Tabel 5.4.

**Tabel 5.4 Pengujian Fungsional Modul Autentikasi**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Login valid sebagai PJ Evaluator | Email dan password PJ Evaluator | Berhasil login dan diarahkan ke halaman grafik evaluasi | Sesuai | Lulus |
| 2 | Login valid sebagai Evaluator | Email dan password Evaluator | Berhasil login dan diarahkan ke halaman evaluasi | Sesuai | Lulus |
| 3 | Login valid sebagai Kepala OPD | Email dan password Kepala OPD | Berhasil login dan diarahkan ke halaman pantau SOP | Sesuai | Lulus |
| 4 | Login valid sebagai PJ Penyusun | Email dan password PJ Penyusun | Berhasil login dan diarahkan ke halaman manajemen SOP | Sesuai | Lulus |
| 5 | Login valid sebagai Penyusun | Email dan password Penyusun | Berhasil login dan diarahkan ke halaman manajemen SOP | Sesuai | Lulus |
| 6 | Login dengan kredensial tidak valid | Format email atau kredensial tidak valid | Sistem tetap berada pada halaman login dan menampilkan validasi | Sesuai | Lulus |
| 7 | Login dengan password salah | Email valid dan password salah | Sistem menolak login | Sesuai | Lulus |
| 8 | Akses route terlindungi tanpa login | URL halaman internal | Pengguna dialihkan ke halaman login | Sesuai | Lulus |
| 9 | Logout dari sistem | Akun yang sudah login | Sesi berakhir dan route internal kembali meminta login | Sesuai | Lulus |
| 10 | Ubah kata sandi pada akun test terisolasi | Password lama dan password baru | Perubahan valid diterima dan perubahan tidak valid ditolak | Sesuai | Lulus |

Bukti pengujian modul autentikasi terdapat pada `auth.spec.ts`.

## 5.2.1.5 Pengujian Fungsional Modul Otorisasi Akses

Pengujian fungsional modul otorisasi akses memverifikasi bahwa setiap role hanya dapat melihat menu dan membuka route sesuai hak aksesnya. Pengujian ini juga mencakup pembatasan aksi tertentu, seperti pengajuan evaluasi oleh penyusun biasa dan pengiriman ulang revisi oleh penyusun biasa. Daftar pengujian fungsional modul otorisasi akses dapat dilihat pada Tabel 5.5.

**Tabel 5.5 Pengujian Fungsional Modul Otorisasi Akses**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Menu utama sesuai role PJ Evaluator | Akun PJ Evaluator | Menu grafik evaluasi, OPD, penyusun, evaluator, dan evaluasi tampil | Sesuai | Lulus |
| 2 | Route PJ Evaluator dapat dibuka | Route yang diizinkan untuk PJ Evaluator | Route dapat diakses sesuai matriks role | Sesuai | Lulus |
| 3 | Navigasi role lain tidak tersedia untuk PJ Evaluator | Akun PJ Evaluator | Menu role lain tidak tampil | Sesuai | Lulus |
| 4 | Menu utama sesuai role Evaluator | Akun Evaluator | Menu Evaluasi SOP tampil | Sesuai | Lulus |
| 5 | Route Evaluator dapat dibuka | `/evaluator/evaluasi` | Route evaluasi dapat diakses | Sesuai | Lulus |
| 6 | Navigasi role lain tidak tersedia untuk Evaluator | Akun Evaluator | Menu role lain tidak tampil | Sesuai | Lulus |
| 7 | Menu utama sesuai role Kepala OPD | Akun Kepala OPD | Menu Pantau SOP dan Pengajuan SOP tampil | Sesuai | Lulus |
| 8 | Route Kepala OPD dapat dibuka | Route Kepala OPD | Route Kepala OPD dapat diakses | Sesuai | Lulus |
| 9 | Navigasi role lain tidak tersedia untuk Kepala OPD | Akun Kepala OPD | Menu role lain tidak tampil | Sesuai | Lulus |
| 10 | Menu utama sesuai role PJ Penyusun | Akun PJ Penyusun | Menu SOP, pelaksana, peraturan, dan berita acara tampil | Sesuai | Lulus |
| 11 | Route PJ Penyusun dapat dibuka | Route PJ Penyusun | Route sesuai kewenangan dapat diakses | Sesuai | Lulus |
| 12 | Navigasi role lain tidak tersedia untuk PJ Penyusun | Akun PJ Penyusun | Menu role lain tidak tampil | Sesuai | Lulus |
| 13 | Menu utama sesuai role Penyusun | Akun Penyusun | Menu SOP, pelaksana, dan peraturan tampil | Sesuai | Lulus |
| 14 | Route Penyusun dapat dibuka | Route Penyusun | Route sesuai kewenangan dapat diakses | Sesuai | Lulus |
| 15 | Navigasi role lain tidak tersedia untuk Penyusun | Akun Penyusun | Menu role lain tidak tampil | Sesuai | Lulus |
| 16 | Penyusun biasa membuat pengajuan evaluasi | Akun Penyusun biasa | Sistem menolak aksi karena bukan PJ Penyusun | Sesuai | Lulus |
| 17 | Penyusun biasa mengirim ulang SOP revisi | Akun Penyusun biasa | Sistem menolak aksi karena bukan role berwenang | Sesuai | Lulus |
| 18 | Penyusun melihat data OPD lain | Akun Penyusun dan data OPD lain | Data OPD lain tidak tampil | Sesuai | Lulus |

Bukti pengujian modul otorisasi akses terdapat pada `role-access.spec.ts`.

## 5.2.1.6 Pengujian Fungsional Modul Data Master OPD

Pengujian fungsional modul data master OPD memverifikasi proses pengelolaan data organisasi oleh PJ Evaluator. Pengujian ini memastikan dialog tambah OPD dapat dibuka, data OPD dapat dibuat, diubah, dan dinonaktifkan. Daftar pengujian fungsional modul data master OPD dapat dilihat pada Tabel 5.6.

**Tabel 5.6 Pengujian Fungsional Modul Data Master OPD**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka dialog tambah OPD | Akun PJ Evaluator | Dialog tambah OPD dan tombol simpan tampil | Sesuai | Lulus |
| 2 | Mengelola OPD dari tambah, ubah, sampai nonaktif | Data OPD E2E | OPD tersimpan, dapat diubah, dan dapat dinonaktifkan | Sesuai | Lulus |

Bukti pengujian modul data master OPD terdapat pada `master-data.spec.ts`.

## 5.2.1.7 Pengujian Fungsional Modul Data Master Evaluator

Pengujian fungsional modul data master evaluator memverifikasi bahwa PJ Evaluator dapat mengelola akun evaluator. Proses yang diuji meliputi pembukaan dialog tambah evaluator, penyimpanan data evaluator, perubahan data, pencarian, dan penghapusan. Daftar pengujian fungsional modul data master evaluator dapat dilihat pada Tabel 5.7.

**Tabel 5.7 Pengujian Fungsional Modul Data Master Evaluator**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka dialog tambah evaluator | Akun PJ Evaluator | Dialog tambah evaluator tampil | Sesuai | Lulus |
| 2 | Mengelola evaluator | Data evaluator E2E | Evaluator dapat dibuat, diperbarui, ditemukan, dan dihapus | Sesuai | Lulus |

Bukti pengujian modul data master evaluator terdapat pada `master-data.spec.ts`.

## 5.2.1.8 Pengujian Fungsional Modul Data Master Penyusun

Pengujian fungsional modul data master penyusun memverifikasi bahwa PJ Evaluator dapat menambahkan dan mengelola data penyusun. Pengujian ini juga memeriksa proses mutasi OPD agar riwayat OPD aktif tercatat sesuai perubahan. Daftar pengujian fungsional modul data master penyusun dapat dilihat pada Tabel 5.8.

**Tabel 5.8 Pengujian Fungsional Modul Data Master Penyusun**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka dialog tambah penyusun | Akun PJ Evaluator | Dialog tambah penyusun tampil | Sesuai | Lulus |
| 2 | Mengelola penyusun dan mutasi OPD | Data penyusun dan data OPD | Penyusun dapat dikelola dan riwayat OPD aktif tercatat | Sesuai | Lulus |

Bukti pengujian modul data master penyusun terdapat pada `master-data.spec.ts`.

## 5.2.1.9 Pengujian Fungsional Modul Data Master Kepala OPD

Pengujian fungsional modul data master Kepala OPD memverifikasi penetapan Kepala OPD pada struktur organisasi. Modul ini diuji sebagai bagian dari pengelolaan data organisasi karena Kepala OPD berkaitan langsung dengan OPD yang dikelola PJ Evaluator. Daftar pengujian fungsional modul data master Kepala OPD dapat dilihat pada Tabel 5.9.

**Tabel 5.9 Pengujian Fungsional Modul Data Master Kepala OPD**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Menetapkan Kepala OPD | Data OPD dan akun Kepala OPD | Kepala OPD dapat ditetapkan pada OPD terkait | Sesuai | Lulus |

Bukti pengujian modul data master Kepala OPD terdapat pada `master-data.spec.ts`.

## 5.2.1.10 Pengujian Fungsional Modul Referensi Pelaksana SOP

Pengujian fungsional modul referensi pelaksana SOP memverifikasi bahwa penyusun dapat mengelola data pelaksana yang digunakan dalam penyusunan SOP. Daftar pengujian fungsional modul referensi pelaksana SOP dapat dilihat pada Tabel 5.10.

**Tabel 5.10 Pengujian Fungsional Modul Referensi Pelaksana SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka dialog tambah pelaksana SOP | Akun Penyusun | Dialog tambah pelaksana SOP tampil | Sesuai | Lulus |
| 2 | Mengelola pelaksana SOP | Data pelaksana SOP | Pelaksana dapat dibuat dan diperbarui | Sesuai | Lulus |

Bukti pengujian modul referensi pelaksana SOP terdapat pada `master-data.spec.ts`.

## 5.2.1.11 Pengujian Fungsional Modul Referensi Peraturan

Pengujian fungsional modul referensi peraturan memverifikasi pengelolaan data peraturan sebagai dasar hukum SOP. Pengujian mencakup pembukaan dialog tambah peraturan, penyimpanan data, perubahan data, pencarian, dan validasi duplikasi. Daftar pengujian fungsional modul referensi peraturan dapat dilihat pada Tabel 5.11.

**Tabel 5.11 Pengujian Fungsional Modul Referensi Peraturan**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka dialog tambah peraturan | Akun Penyusun | Dialog tambah peraturan tampil | Sesuai | Lulus |
| 2 | Mengelola peraturan termasuk validasi duplikat | Data peraturan E2E | Peraturan tersimpan, dapat diubah, dan duplikat ditolak | Sesuai | Lulus |

Bukti pengujian modul referensi peraturan terdapat pada `master-data.spec.ts`.

## 5.2.1.12 Pengujian Fungsional Modul Grafik Evaluasi

Pengujian fungsional modul grafik evaluasi memverifikasi bahwa PJ Evaluator dapat membuka halaman grafik evaluasi dan menggunakan filter yang tersedia. Modul ini penting untuk memastikan data evaluasi dapat dipantau dalam bentuk ringkasan visual. Daftar pengujian fungsional modul grafik evaluasi dapat dilihat pada Tabel 5.12.

**Tabel 5.12 Pengujian Fungsional Modul Grafik Evaluasi**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka grafik evaluasi dan menggunakan filter | Akun PJ Evaluator | Halaman grafik evaluasi tampil dan menerima filter | Sesuai | Lulus |

Bukti pengujian modul grafik evaluasi terdapat pada `master-data.spec.ts`.

## 5.2.1.13 Pengujian Fungsional Modul Penyusunan SOP

Pengujian fungsional modul penyusunan SOP memverifikasi pembuatan draft SOP sampai SOP siap diajukan untuk evaluasi. Modul ini mencakup validasi data kosong, validasi nomor SOP duplikat, kelengkapan header dan prosedur, diagram, riwayat, status siap evaluasi, serta pembuatan versi baru dari SOP berlaku. Daftar pengujian fungsional modul penyusunan SOP dapat dilihat pada Tabel 5.13.

**Tabel 5.13 Pengujian Fungsional Modul Penyusunan SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuat draft SOP baru | Judul dan nomor SOP E2E | Draft SOP tersimpan dan tampil pada daftar | Sesuai | Lulus |
| 2 | Membuat SOP dengan data kosong | Form judul dan nomor kosong | Sistem menolak penyimpanan dan menampilkan validasi | Sesuai | Lulus |
| 3 | Membuat SOP dengan nomor duplikat | Nomor SOP yang sudah digunakan | Sistem menolak nomor SOP duplikat | Sesuai | Lulus |
| 4 | Melengkapi header, prosedur, diagram, dan riwayat | Data SOP lengkap | Data lengkap tampil dan SOP dapat menjadi siap evaluasi | Sesuai | Lulus |
| 5 | Mengubah SOP tidak lengkap menjadi siap evaluasi | SOP belum lengkap atau keputusan tanpa cabang | Sistem menolak perubahan status | Sesuai | Lulus |
| 6 | Membuat versi baru dari SOP berlaku | SOP berstatus berlaku | Versi baru dibuat dan versi lama tetap dapat dilihat | Sesuai | Lulus |

Bukti pengujian modul penyusunan SOP terdapat pada `sop-authoring.spec.ts`.

## 5.2.1.14 Pengujian Fungsional Modul Pengajuan Evaluasi SOP

Pengujian fungsional modul pengajuan evaluasi SOP memverifikasi proses pengajuan SOP dari PJ Penyusun kepada evaluator. Pengujian juga memastikan SOP yang belum siap tidak dapat diajukan dan penyusun biasa tidak memiliki hak untuk membuat pengajuan evaluasi. Daftar pengujian fungsional modul pengajuan evaluasi SOP dapat dilihat pada Tabel 5.14.

**Tabel 5.14 Pengujian Fungsional Modul Pengajuan Evaluasi SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka dialog pengajuan evaluasi SOP | Akun PJ Penyusun | Dialog pengajuan evaluasi tampil | Sesuai | Lulus |
| 2 | Mengajukan SOP siap evaluasi | SOP berstatus siap evaluasi | Pengajuan terbentuk dan masuk ke alur evaluator | Sesuai | Lulus |
| 3 | Mengajukan SOP yang belum siap | SOP berstatus draft atau belum lengkap | Sistem menolak pengajuan | Sesuai | Lulus |
| 4 | Penyusun biasa membuat pengajuan evaluasi | Akun Penyusun biasa | Sistem menolak aksi karena bukan PJ Penyusun | Sesuai | Lulus |

Bukti pengujian modul pengajuan evaluasi SOP terdapat pada `sop-authoring.spec.ts`, `evaluasi-workflow.spec.ts`, dan `role-access.spec.ts`.

## 5.2.1.15 Pengujian Fungsional Modul Evaluasi SOP

Pengujian fungsional modul evaluasi SOP memverifikasi kemampuan evaluator dalam membuka workspace evaluasi, melihat daftar pengajuan, memberikan penilaian, dan menyelesaikan evaluasi apabila syarat sudah terpenuhi. Daftar pengujian fungsional modul evaluasi SOP dapat dilihat pada Tabel 5.15.

**Tabel 5.15 Pengujian Fungsional Modul Evaluasi SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka workspace evaluasi | Akun Evaluator | Daftar atau status pengajuan tampil | Sesuai | Lulus |
| 2 | Menilai pengajuan valid sampai selesai evaluasi | Pengajuan SOP siap evaluasi | Evaluator dapat menilai sesuai dan menyelesaikan evaluasi | Sesuai | Lulus |
| 3 | Menyelesaikan evaluasi sebelum seluruh syarat sesuai | Pengajuan yang belum memenuhi semua penilaian | Sistem menolak penyelesaian evaluasi | Sesuai | Lulus |

Bukti pengujian modul evaluasi SOP terdapat pada `evaluasi-workflow.spec.ts` dan `workflow-observation.spec.ts`.

## 5.2.1.16 Pengujian Fungsional Modul Revisi SOP

Pengujian fungsional modul revisi SOP memverifikasi alur ketika evaluator memberi catatan perbaikan terhadap SOP. Pengujian memastikan catatan revisi dapat dibaca, ditindaklanjuti, dikirim ulang oleh pihak yang berwenang, lalu dinilai ulang oleh evaluator. Daftar pengujian fungsional modul revisi SOP dapat dilihat pada Tabel 5.16.

**Tabel 5.16 Pengujian Fungsional Modul Revisi SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membaca, menindaklanjuti, mengirim ulang, dan menilai ulang revisi | SOP dengan catatan revisi | Revisi dapat diproses sampai kembali dinilai evaluator | Sesuai | Lulus |
| 2 | Penyusun biasa mengirim ulang SOP revisi | Akun Penyusun biasa | Sistem menolak aksi karena bukan role berwenang | Sesuai | Lulus |

Bukti pengujian modul revisi SOP terdapat pada `evaluasi-workflow.spec.ts` dan `role-access.spec.ts`.

## 5.2.1.17 Pengujian Fungsional Modul Profil Akun

Pengujian fungsional modul profil akun memverifikasi bahwa setiap role dapat membuka halaman profil dan melihat identitas pengguna serta form perubahan kata sandi. Daftar pengujian fungsional modul profil akun dapat dilihat pada Tabel 5.17.

**Tabel 5.17 Pengujian Fungsional Modul Profil Akun**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka profil akun pada semua role | Akun semua role | Identitas akun dan form kata sandi tampil | Sesuai | Lulus |

Bukti pengujian modul profil akun terdapat pada `profile-tte.spec.ts`.

## 5.2.1.18 Pengujian Fungsional Modul TTE Internal

Pengujian fungsional modul TTE internal memverifikasi tampilan dan validasi fitur tanda tangan elektronik internal. Pengujian ini tidak digunakan untuk mengklaim integrasi langsung dengan PSrE/BSrE, melainkan sebatas TTE internal sesuai implementasi dan skenario uji yang tersedia. Daftar pengujian fungsional modul TTE internal dapat dilihat pada Tabel 5.18.

**Tabel 5.18 Pengujian Fungsional Modul TTE Internal**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Role berwenang melihat section sertifikat/PIN | Akun role berwenang TTE | Section sertifikat/PIN tampil | Sesuai | Lulus |
| 2 | Penyusun biasa melihat aksi setup TTE | Akun Penyusun biasa | Aksi setup TTE tidak tampil | Sesuai | Lulus |
| 3 | Mengubah PIN dengan PIN lama salah | PIN lama tidak valid | Sistem menolak perubahan PIN | Sesuai | Lulus |

Bukti pengujian modul TTE internal terdapat pada `profile-tte.spec.ts` dan `tte-pengesahan.spec.ts`.

## 5.2.1.19 Pengujian Fungsional Modul Berita Acara

Pengujian fungsional modul berita acara memverifikasi ketersediaan daftar berita acara dan aksi cetak atau unduh untuk pengguna yang berwenang. Modul ini menjadi bagian penting setelah evaluasi karena berita acara digunakan sebelum proses pengesahan SOP. Daftar pengujian fungsional modul berita acara dapat dilihat pada Tabel 5.19.

**Tabel 5.19 Pengujian Fungsional Modul Berita Acara**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka daftar berita acara | Akun PJ Penyusun | Halaman berita acara untuk tahap tanda tangan OPD dapat dibuka | Sesuai | Lulus |
| 2 | Membuka aksi cetak/unduh SOP dan berita acara | Akun pengguna berwenang | Aksi cetak atau unduh dapat dibuka | Sesuai | Lulus |

Bukti pengujian modul berita acara terdapat pada `workflow-observation.spec.ts` dan `arsip-public.spec.ts`.

## 5.2.1.20 Pengujian Fungsional Modul TTE Berita Acara

Pengujian fungsional modul TTE berita acara memverifikasi bahwa proses tanda tangan berita acara dilakukan secara berurutan sebelum SOP dapat disahkan. Daftar pengujian fungsional modul TTE berita acara dapat dilihat pada Tabel 5.20.

**Tabel 5.20 Pengujian Fungsional Modul TTE Berita Acara**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Menandatangani berita acara secara berurutan | PIN TTE valid dan berita acara evaluasi | Berita acara berhasil ditandatangani sesuai urutan | Sesuai | Lulus |

Bukti pengujian modul TTE berita acara terdapat pada `tte-pengesahan.spec.ts`.

## 5.2.1.21 Pengujian Fungsional Modul Pengesahan SOP

Pengujian fungsional modul pengesahan SOP memverifikasi bahwa Kepala OPD dapat membuka halaman pemantauan SOP dan melakukan pengesahan setelah berita acara ditandatangani lengkap. Daftar pengujian fungsional modul pengesahan SOP dapat dilihat pada Tabel 5.21.

**Tabel 5.21 Pengujian Fungsional Modul Pengesahan SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuka halaman pemantauan SOP dan pengajuan pengesahan | Akun Kepala OPD | Halaman pemantauan dan pengajuan pengesahan dapat dibuka | Sesuai | Lulus |
| 2 | Mengesahkan SOP setelah berita acara lengkap | PIN TTE valid dan SOP siap disahkan | SOP berubah menjadi berlaku | Sesuai | Lulus |

Bukti pengujian modul pengesahan SOP terdapat pada `workflow-observation.spec.ts` dan `tte-pengesahan.spec.ts`.

## 5.2.1.22 Pengujian Fungsional Modul Pencabutan SOP

Pengujian fungsional modul pencabutan SOP memverifikasi bahwa Kepala OPD dapat mencabut SOP yang sudah berlaku. Pengujian juga memastikan SOP yang dicabut tidak lagi tampil sebagai SOP berlaku pada arsip publik. Daftar pengujian fungsional modul pencabutan SOP dapat dilihat pada Tabel 5.22.

**Tabel 5.22 Pengujian Fungsional Modul Pencabutan SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Mencabut SOP berlaku | SOP berstatus berlaku | Status SOP menjadi dicabut dan tidak tampil sebagai SOP berlaku di arsip publik | Sesuai | Lulus |

Bukti pengujian modul pencabutan SOP terdapat pada `tte-pengesahan.spec.ts`.

## 5.2.1.23 Pengujian Fungsional Modul Versi SOP

Pengujian fungsional modul versi SOP memverifikasi kemampuan sistem dalam membuat versi baru dari SOP yang sudah berlaku dan menggantikan versi lama setelah versi baru disahkan. Daftar pengujian fungsional modul versi SOP dapat dilihat pada Tabel 5.23.

**Tabel 5.23 Pengujian Fungsional Modul Versi SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Membuat versi baru dari SOP berlaku | SOP berstatus berlaku | Versi baru dibuat dan versi lama tetap dapat dilihat | Sesuai | Lulus |
| 2 | Mengesahkan versi baru | SOP versi baru yang sudah melalui evaluasi | Versi baru menjadi berlaku dan versi lama berstatus digantikan | Sesuai | Lulus |

Bukti pengujian modul versi SOP terdapat pada `sop-authoring.spec.ts` dan `tte-pengesahan.spec.ts`.

## 5.2.1.24 Pengujian Fungsional Modul Arsip SOP Publik

Pengujian fungsional modul arsip SOP publik memverifikasi bahwa pengunjung hanya dapat melihat SOP yang sudah berlaku. Pengujian juga memastikan SOP draft tidak muncul, pratinjau dokumen tersedia, dan data internal evaluasi tidak ditampilkan pada halaman publik. Daftar pengujian fungsional modul arsip SOP publik dapat dilihat pada Tabel 5.24.

**Tabel 5.24 Pengujian Fungsional Modul Arsip SOP Publik**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Menampilkan SOP berlaku pada arsip publik | Data SOP berlaku dan SOP draft | SOP berlaku tampil, sedangkan SOP draft tidak tampil | Sesuai | Lulus |
| 2 | Membuka pratinjau SOP publik | Data SOP berlaku | Pratinjau dokumen SOP tersedia | Sesuai | Lulus |
| 3 | Memeriksa data internal pada arsip publik | SOP berlaku dengan data evaluasi | Catatan evaluator dan nilai internal tidak tampil | Sesuai | Lulus |

Bukti pengujian modul arsip SOP publik terdapat pada `arsip-public.spec.ts`.

## 5.2.1.25 Pengujian Fungsional Modul Verifikasi Pengesahan

Pengujian fungsional modul verifikasi pengesahan memverifikasi bahwa status pengesahan SOP dapat diperiksa oleh pengguna. Pengujian mencakup data pengesahan valid dan data pengesahan tidak valid agar sistem tetap menampilkan respons yang aman. Daftar pengujian fungsional modul verifikasi pengesahan dapat dilihat pada Tabel 5.25.

**Tabel 5.25 Pengujian Fungsional Modul Verifikasi Pengesahan**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Verifikasi pengesahan valid | Data pengesahan valid | Sistem menampilkan status valid atau terverifikasi | Sesuai | Lulus |
| 2 | Verifikasi pengesahan tidak valid | Data atau tautan pengesahan tidak valid | Sistem menampilkan status tidak valid atau tidak ditemukan tanpa error aplikasi | Sesuai | Lulus |

Bukti pengujian modul verifikasi pengesahan terdapat pada `arsip-public.spec.ts` dan `public-pages.spec.ts`.

## 5.2.1.26 Pengujian Fungsional Modul Verifikasi PDF

Pengujian fungsional modul verifikasi PDF memverifikasi proses validasi berkas PDF pada halaman publik. Pengujian mencakup kondisi tombol sebelum file dipilih, penolakan file non-PDF, PDF bertanda tangan, dan PDF tanpa tanda tangan. Daftar pengujian fungsional modul verifikasi PDF dapat dilihat pada Tabel 5.26.

**Tabel 5.26 Pengujian Fungsional Modul Verifikasi PDF**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Tombol verifikasi sebelum file dipilih | Tidak ada file | Tombol verifikasi tidak aktif | Sesuai | Lulus |
| 2 | Mengunggah file non-PDF | File `not-a-pdf.txt` | Sistem menolak file selain PDF | Sesuai | Lulus |
| 3 | Memverifikasi PDF bertanda tangan | PDF bertanda tangan atau kondisi signing-disabled | Sistem menampilkan hasil valid/terverifikasi atau penjelasan signing-disabled | Sesuai | Lulus |
| 4 | Memverifikasi PDF tanpa tanda tangan | File `unsigned.pdf` | Sistem menampilkan hasil tidak valid atau tanpa tanda tangan | Sesuai | Lulus |

Bukti pengujian modul verifikasi PDF terdapat pada `pdf-verification.spec.ts`.

## 5.2.1.27 Pengujian Fungsional Modul Daftar SOP

Pengujian fungsional modul daftar SOP memverifikasi fitur pencarian, filter status, dan navigasi halaman pada daftar SOP. Pengujian ini memastikan data yang ditampilkan menyesuaikan kata kunci dan status yang dipilih pengguna. Daftar pengujian fungsional modul daftar SOP dapat dilihat pada Tabel 5.27.

**Tabel 5.27 Pengujian Fungsional Modul Daftar SOP**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Mencari, memfilter, dan menavigasi daftar SOP | Kata kunci, status SOP, dan navigasi halaman | Daftar SOP berubah sesuai pencarian, filter, dan halaman yang dipilih | Sesuai | Lulus |

Bukti pengujian modul daftar SOP terdapat pada `list-filter-pagination.spec.ts`.

## 5.2.1.28 Pengujian Fungsional Modul Konsistensi Status

Pengujian fungsional modul konsistensi status memverifikasi bahwa status SOP tetap sama setelah halaman dimuat ulang, pengguna logout-login, dan data dilihat dari role yang berbeda. Daftar pengujian fungsional modul konsistensi status dapat dilihat pada Tabel 5.28.

**Tabel 5.28 Pengujian Fungsional Modul Konsistensi Status**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Memeriksa status setelah refresh, logout-login, dan perpindahan peran | SOP yang sudah melalui workflow | Status SOP tetap konsisten pada role terkait | Sesuai | Lulus |

Bukti pengujian modul konsistensi status terdapat pada `evaluasi-workflow.spec.ts`.

## 5.2.1.29 Pengujian Traceability Skenario E2E

Pengujian traceability memverifikasi bahwa seluruh skenario rancangan E2E-01 sampai E2E-70 telah dipetakan tepat satu kali ke berkas uji yang sesuai. Pengujian ini penting agar cakupan pengujian dapat ditelusuri dari rancangan skenario ke implementasi test Playwright. Daftar pengujian traceability dapat dilihat pada Tabel 5.29.

**Tabel 5.29 Pengujian Traceability Skenario E2E**

| No | Kasus Uji | Data Masukan | Hasil yang Diharapkan | Hasil Aktual | Status |
| -- | --------- | ------------ | --------------------- | ------------ | ------ |
| 1 | Memeriksa seluruh ID E2E-01 sampai E2E-70 | Pemetaan `scenarioCoverage` | Tidak ada skenario hilang, duplikat, atau tidak dikenal | Sesuai | Lulus |
| 2 | Memeriksa pemetaan skenario per berkas uji | Daftar file test dan ID skenario | Setiap berkas memiliki ID skenario sesuai cakupan | Sesuai | Lulus |

Bukti pengujian traceability terdapat pada `scenario-traceability.spec.ts` dan `client/e2e/support/test-data.ts`.

## 5.2.1.30 Ringkasan Cakupan Skenario E2E

Ringkasan cakupan skenario digunakan untuk menunjukkan hubungan antara 70 skenario rancangan dengan berkas uji Playwright. Ringkasan tersebut dapat dilihat pada Tabel 5.30.

**Tabel 5.30 Ringkasan Cakupan Skenario E2E**

| No | Berkas Uji | ID Skenario yang Dicakup | Jumlah Skenario |
| -- | ---------- | ------------------------ | ---------------: |
| 1 | `auth.spec.ts` | E2E-01, E2E-02, E2E-03, E2E-06, E2E-07 | 5 |
| 2 | `role-access.spec.ts` | E2E-04, E2E-05, E2E-34, E2E-44, E2E-70 | 5 |
| 3 | `master-data.spec.ts` | E2E-08 sampai E2E-21 | 14 |
| 4 | `sop-authoring.spec.ts` | E2E-22 sampai E2E-31, E2E-56 | 11 |
| 5 | `evaluasi-workflow.spec.ts` | E2E-32, E2E-33, E2E-35 sampai E2E-46, E2E-69 | 14 |
| 6 | `tte-pengesahan.spec.ts` | E2E-47 sampai E2E-55, E2E-57 | 10 |
| 7 | `arsip-public.spec.ts` | E2E-58 sampai E2E-65 | 8 |
| 8 | `pdf-verification.spec.ts` | E2E-66, E2E-67 | 2 |
| 9 | `list-filter-pagination.spec.ts` | E2E-68 | 1 |
| **Total** | **Seluruh Skenario** | **E2E-01 sampai E2E-70** | **70** |

## 5.2.1.31 Kesimpulan Pengujian Sistem

Berdasarkan hasil pengujian sistem menggunakan Playwright, seluruh test yang dieksekusi pada laporan aktual berstatus lulus. Total pengujian yang berjalan adalah 82 test pada proyek Chromium, dengan 82 test lulus, 0 gagal, 0 flaky, dan 0 skip. Hasil tersebut menunjukkan bahwa fungsi utama sistem telah berjalan sesuai hasil yang diharapkan pada lingkungan pengujian.

Selain itu, validasi traceability menunjukkan bahwa 70 skenario rancangan E2E telah terpetakan ke berkas uji tanpa ID yang hilang, duplikat, atau tidak dikenal. Dengan demikian, pengujian sistem dapat digunakan sebagai bukti bahwa alur utama SOPFlow, mulai dari akses publik, autentikasi, otorisasi, data master, penyusunan SOP, pengajuan evaluasi, evaluasi, revisi, TTE internal, berita acara, pengesahan, pencabutan, versi SOP, arsip publik, verifikasi pengesahan, verifikasi PDF, sampai konsistensi status, telah diuji secara menyeluruh sesuai cakupan skenario yang tersedia.

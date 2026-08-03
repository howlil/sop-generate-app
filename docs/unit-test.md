# 5.1.4 Implementasi Pengujian Unit (Unit Testing)

Pengujian unit dilakukan untuk memastikan bahwa unit-unit logika utama pada SOPFlow berjalan sesuai kebutuhan fungsional. Pengujian ini berfokus pada pemeriksaan fungsi, service, policy, validator, guard, dan utilitas yang membentuk alur utama sistem, mulai dari autentikasi, penyusunan SOP, pengajuan evaluasi, evaluasi dan revisi SOP, tanda tangan elektronik internal, pengesahan SOP, hingga arsip publik.

Pada backend, pengujian unit dilakukan menggunakan Jest pada kode NestJS berbasis TypeScript. File pengujian berada pada folder `server/src` dengan pola nama `*.spec.ts`. Pada frontend, pengujian unit dilakukan menggunakan Vitest pada kode ReactJS, terutama untuk fungsi domain, permission, validasi prosedur, diagram SOP, dan tampilan status workflow. Pengujian unit berbeda dengan integration testing dan end-to-end testing karena pengujian ini tidak menjalankan seluruh sistem melalui browser atau database nyata secara penuh, melainkan menguji unit kode secara terisolasi dengan dependency yang dimock.

## 5.1.4.1 Tujuan dan Cakupan Pengujian Unit

Tujuan pengujian unit adalah memastikan setiap bagian logika sistem dapat menghasilkan keluaran yang benar berdasarkan input tertentu dan menolak kondisi yang tidak sesuai aturan bisnis. Dalam konteks sistem SOP AP, pengujian unit digunakan untuk membuktikan bahwa pembatasan peran, pembatasan OPD, validasi status SOP, validasi pengajuan evaluasi, proses evaluasi dan revisi, serta tanda tangan elektronik internal berjalan sesuai alur yang telah dirancang.

Cakupan pengujian unit meliputi modul autentikasi dan otorisasi, pengelolaan data organisasi, penyusunan SOP, validasi kelengkapan SOP, pengajuan evaluasi, evaluasi SOP, tindak lanjut revisi, tanda tangan elektronik internal, pengesahan SOP oleh Kepala OPD, arsip publik, dan grafik evaluasi. Modul tersebut dipilih karena merupakan bagian utama dari proses pengelolaan SOP AP berbasis web.

Pengujian unit pada backend menguji service dan helper secara langsung, seperti `AuthService`, `SopCatalogService`, `PengajuanEvaluasiService`, `EvaluasiNilaiService`, `TtePenandatangananService`, dan `SopPublicService`. Dependency seperti repository, transaksi Prisma, layanan PDF, storage, dan bcrypt dibuat dalam bentuk mock agar logika bisnis dapat diuji tanpa bergantung pada database atau layanan eksternal. Pada frontend, pengujian unit menguji fungsi pendukung seperti permission SOP, validasi baris prosedur, stepper workflow evaluasi, serta fungsi domain lain yang memengaruhi perilaku antarmuka.

Tabel berikut menunjukkan cakupan modul yang diuji.

| Modul yang Diuji | Contoh File Pengujian | Aktor Terkait | Tujuan Pengujian |
|---|---|---|---|
| Autentikasi dan otorisasi | `auth.service.spec.ts`, `roles.guard.spec.ts` | Semua pengguna | Memastikan login, sesi, dan pembatasan akses sesuai peran |
| Penyusunan SOP | `sop-catalog.service.spec.ts`, `sop-prosedur.service.spec.ts` | Penyusun SOP, PJ Penyusun SOP | Memastikan SOP dapat dibuat, dilengkapi, dan divalidasi |
| Pengajuan evaluasi | `pengajuan-evaluasi.service.spec.ts` | PJ Penyusun SOP | Memastikan pengajuan hanya dapat dibuat oleh aktor berwenang |
| Evaluasi dan revisi SOP | `evaluasi-nilai.service.spec.ts` | Evaluator, Penyusun SOP | Memastikan penilaian, catatan revisi, dan tindak lanjut berjalan benar |
| TTE internal dan pengesahan | `tte-penandatanganan.service.spec.ts` | PJ Evaluator, PJ Penyusun, Kepala OPD | Memastikan tanda tangan internal mengikuti urutan dan kewenangan |
| Arsip publik | `sop-public.service.spec.ts` | Pengunjung Arsip Publik | Memastikan arsip hanya menampilkan SOP yang sudah berlaku |
| Grafik evaluasi | `evaluasi-grafik.service.spec.ts` | PJ Evaluator Organisasi | Memastikan data evaluasi dapat dihitung sesuai rentang tahun |

## 5.1.4.2 Skenario Pengujian Unit

Skenario pengujian unit disusun berdasarkan alur utama pengelolaan SOP AP. Setiap skenario memeriksa kondisi awal, aksi yang dilakukan, validasi sistem, dan hasil yang diharapkan. Selain skenario berhasil, pengujian juga mencakup skenario gagal seperti akses tidak berwenang, status tidak valid, data tidak ditemukan, OPD berbeda, catatan revisi kosong, dan PIN TTE salah.

Pada modul penyusunan SOP, pengujian dimulai dari kondisi SOP masih berstatus draft. Penyusun atau PJ Penyusun mengisi data SOP, seperti header, dasar hukum, pelaksana, langkah prosedur, lampiran, dan relasi SOP terkait. Sistem kemudian memvalidasi kelengkapan dokumen sebelum SOP dapat masuk ke status menunggu pengajuan evaluasi. Jika data SOP belum lengkap, sistem menolak perubahan status.

Pada modul pengajuan evaluasi, kondisi awal yang diuji adalah SOP milik OPD pengguna sudah berstatus menunggu pengajuan evaluasi. PJ Penyusun membuat pengajuan evaluasi dengan memilih DetailSOP yang valid. Sistem memeriksa role pengguna, OPD pengguna, status SOP, duplikasi DetailSOP, dan keberadaan pengajuan aktif. Jika seluruh validasi terpenuhi, sistem membentuk pengajuan evaluasi dan mengubah status SOP menjadi sedang dievaluasi. Jika pengguna bukan PJ Penyusun atau SOP berasal dari OPD berbeda, sistem menolak proses tersebut.

Pada modul evaluasi dan revisi, Evaluator memberikan nilai terhadap SOP dalam pengajuan. Jika hasil evaluasi adalah `PERLU_PERBAIKAN`, sistem mewajibkan catatan revisi agar penyusun mengetahui bagian yang harus diperbaiki. Penyusun atau PJ Penyusun kemudian dapat menandai tindak lanjut revisi selesai. Evaluator hanya dapat menyelesaikan pengajuan jika seluruh SOP sudah bernilai `SESUAI`. Hal ini memastikan bahwa pengajuan tidak dapat berpindah ke tahap tanda tangan sebelum dokumen memenuhi hasil evaluasi.

Pada modul TTE internal, pengujian memeriksa tanda tangan berita acara oleh PJ Evaluator dan PJ Penyusun, serta pengesahan SOP oleh Kepala OPD. Sistem memvalidasi role, status pengajuan, status SOP, OPD pengguna, dan PIN TTE. Tanda tangan elektronik dalam sistem ini merupakan simulasi TTE internal, bukan integrasi langsung dengan BSrE/PSrE. Oleh karena itu, pengujian berfokus pada kebenaran alur internal dan perubahan status dokumen.

Tabel berikut merangkum skenario pengujian unit.

| ID | Modul | Aktor | Kondisi Awal | Aksi Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|---|---|
| UT-01 | Autentikasi | Semua pengguna | Pengguna memiliki akun aktif | Login dengan kredensial valid | Sistem menghasilkan sesi/token pengguna | Lulus |
| UT-02 | Otorisasi | Semua pengguna | Pengguna login dengan role tertentu | Mengakses fitur di luar kewenangan | Sistem menolak akses | Lulus |
| UT-03 | Penyusunan SOP | Penyusun/PJ Penyusun | SOP berstatus draft | Melengkapi header dan prosedur SOP | Data SOP tersimpan | Lulus |
| UT-04 | Validasi SOP | Penyusun/PJ Penyusun | SOP belum lengkap | Mengubah status menjadi siap evaluasi | Sistem menolak karena dokumen belum lengkap | Lulus |
| UT-05 | Pengajuan evaluasi | PJ Penyusun SOP | SOP sudah siap evaluasi | Membuat pengajuan evaluasi | Pengajuan terbentuk dan SOP menjadi sedang dievaluasi | Lulus |
| UT-06 | Pengajuan evaluasi | Penyusun SOP | SOP sudah siap evaluasi | Mencoba membuat pengajuan evaluasi | Sistem menolak karena bukan PJ Penyusun | Lulus |
| UT-07 | Pengajuan evaluasi | PJ Penyusun SOP | SOP berasal dari OPD lain | Membuat pengajuan evaluasi | Sistem menolak karena OPD tidak sesuai | Lulus |
| UT-08 | Evaluasi SOP | Evaluator | Pengajuan sedang dievaluasi | Memberi nilai `PERLU_PERBAIKAN` tanpa catatan | Sistem menolak karena catatan wajib diisi | Lulus |
| UT-09 | Evaluasi SOP | Evaluator | Pengajuan sedang dievaluasi | Memberi nilai `PERLU_PERBAIKAN` dengan catatan | Status tindak lanjut menjadi terbuka | Lulus |
| UT-10 | Revisi SOP | Penyusun/PJ Penyusun | SOP berstatus revisi dari evaluator | Menandai tindak lanjut revisi selesai | Status tindak lanjut menjadi selesai | Lulus |
| UT-11 | Penyelesaian evaluasi | Evaluator | Masih ada SOP belum sesuai | Menyelesaikan evaluasi | Sistem menolak penyelesaian | Lulus |
| UT-12 | Penyelesaian evaluasi | Evaluator | Semua SOP bernilai sesuai | Menyelesaikan evaluasi | Pengajuan menjadi selesai dievaluasi | Lulus |
| UT-13 | TTE BA | PJ Evaluator | Pengajuan selesai dievaluasi | Menandatangani berita acara dengan PIN valid | Riwayat tanda tangan PJ Evaluator terbentuk | Lulus |
| UT-14 | TTE BA | PJ Penyusun SOP | BA sudah ditandatangani PJ Evaluator | Menandatangani berita acara | Pengajuan lanjut ke tahap pengesahan | Lulus |
| UT-15 | TTE internal | PJ Evaluator/PJ Penyusun/Kepala OPD | PIN salah atau belum dibuat | Melakukan tanda tangan | Sistem menolak proses TTE | Lulus |
| UT-16 | Pengesahan SOP | Kepala OPD | Pengajuan siap disahkan | Menandatangani seluruh SOP | SOP berubah menjadi berlaku | Lulus |
| UT-17 | Arsip publik | Pengunjung | SOP berstatus berlaku tersedia | Membuka daftar atau dokumen arsip | SOP berlaku dapat ditampilkan | Lulus |
| UT-18 | Grafik evaluasi | PJ Evaluator Organisasi | Data evaluasi tersedia | Memilih rentang tahun | Sistem menghitung ringkasan evaluasi | Lulus |

## 5.1.4.3 Hasil Pengujian Unit

Berdasarkan eksekusi pengujian unit backend menggunakan perintah `pnpm test:cov`, pengujian unit telah mencakup komponen utama yang mendukung alur pengelolaan SOP AP. Hasil pengujian aktual menunjukkan 66 test suite berhasil dijalankan dengan 709 test case berstatus lulus. Hal ini menunjukkan bahwa pengujian tidak hanya dilakukan pada satu modul, tetapi menyebar pada beberapa bagian penting sistem, seperti autentikasi, SOP, pengajuan evaluasi, evaluasi nilai, TTE internal, dan arsip publik.

Hasil pengujian unit menunjukkan bahwa aturan bisnis utama telah diuji melalui skenario berhasil dan skenario gagal. Pada modul pengajuan evaluasi, sistem berhasil membatasi bahwa pengajuan hanya dapat dibuat oleh PJ Penyusun dan hanya untuk SOP dari OPD yang sesuai. Pada modul evaluasi, sistem berhasil menolak hasil `PERLU_PERBAIKAN` tanpa catatan dan menolak penyelesaian pengajuan ketika masih terdapat SOP yang belum sesuai. Pada modul TTE internal, sistem berhasil menolak tanda tangan jika PIN salah, role tidak sesuai, status pengajuan tidak valid, atau urutan tanda tangan tidak terpenuhi.

Laporan coverage backend menunjukkan bahwa sebagian besar service utama telah tercakup dengan baik. Nilai statements coverage backend adalah 86,75%, branch coverage 80,88%, functions coverage 86,16%, dan lines coverage 87,08%. Angka tersebut menunjukkan bahwa mayoritas instruksi, baris kode, fungsi, dan percabangan logika pada backend telah dieksekusi oleh unit test. Nilai branch coverage sudah melewati batas minimal 80%, sehingga threshold global coverage untuk percabangan telah terpenuhi.

| Metrik Coverage Backend | Total | Covered | Persentase |
|---|---:|---:|---:|
| Statements | - | - | 86,75% |
| Branches | - | - | 80,88% |
| Functions | - | - | 86,16% |
| Lines | - | - | 87,08% |

Ringkasan hasil eksekusi unit test adalah sebagai berikut.

| Komponen Hasil | Nilai Aktual |
|---|---:|
| Test Suites | 66 passed, 66 total |
| Test Cases | 709 passed, 709 total |
| Snapshots | 0 total |
| Waktu Eksekusi | 55,254 detik |
| Status Threshold Branch | Terpenuhi, karena branch coverage 80,88% |

Beberapa service penting memiliki coverage tinggi, seperti area pengajuan evaluasi, evaluasi nilai, verifikasi TTE, prosedur SOP, dan diagram SOP. Modul lain seperti penandatanganan TTE, arsip publik, katalog SOP, dan profil TTE tetap tercakup oleh unit test, tetapi masih memiliki beberapa cabang yang dapat diperluas. Coverage tersebut mendukung kesimpulan bahwa logika inti sistem, terutama pada pengajuan evaluasi, evaluasi SOP, TTE internal, pengesahan, dan arsip publik, telah diuji secara memadai dengan catatan masih terdapat ruang peningkatan pada beberapa modul.

| Area Service | Statements | Lines | Branches | Functions | Keterangan |
|---|---:|---:|---:|---:|---|
| Autentikasi dan otorisasi | 98,76%-100% | 98,73%-100% | 93,02%-100% | 100% | Coverage sangat baik untuk login dan pembatasan role pengguna. |
| Pengajuan evaluasi SOP | 98,96% | 98,92% | 93,61% | 100% | Membuktikan aturan PJ Penyusun, OPD, status SOP, dan pengajuan aktif sudah diuji kuat. |
| Evaluasi dan revisi SOP | 95,23% | 95,12% | 87,93% | 85,71% | Mencakup pemberian nilai, catatan revisi, tindak lanjut, dan penyelesaian evaluasi. |
| TTE internal dan penandatanganan | 89,39% | 89,92% | 77,66% | 100% | Sudah mencakup PIN, role, status, dan batch pengesahan; branch masih dapat diperluas. |
| Profil TTE internal | 66,33% | 69,23% | 57,89% | 77,77% | Perlu tambahan skenario untuk pengaturan dan perubahan PIN TTE. |
| Verifikasi TTE | 100% | 100% | 100% | 100% | Coverage penuh untuk service verifikasi pengesahan TTE. |
| Arsip publik SOP | 79,48% | 76,47% | 66,66% | 81,81% | Sudah menguji daftar dan dokumen publik; cabang pencarian/pagination masih dapat diperluas. |
| Prosedur SOP | 97,93% | 97,82% | 88,88% | 100% | Coverage kuat untuk validasi langkah, pelaksana, dan percabangan prosedur. |
| Diagram SOP | 100% | 100% | 100% | 100% | Coverage penuh untuk service diagram SOP. |
| Katalog dan status SOP | 77,62%-82,14% | 76,84%-82,14% | 74,6%-79,16% | 76,92%-100% | Mencakup penyusunan, status, versi, dan pencabutan; masih perlu penguatan cabang. |
| Validasi kelengkapan SOP | 78,43% | 79,59% | 57,5% | 80% | Perlu tambahan variasi test untuk dokumen SOP belum lengkap. |
| Utilitas pendukung coverage | 100% | 100% | 100% | 100% | Meliputi pagination, origin publik TTE, dan pemetaan error katalog SOP. |

Peningkatan branch coverage dilakukan dengan menambahkan unit test pada utilitas pagination, origin publik TTE, dan pemetaan error katalog SOP. Penambahan ini menutup cabang validasi seperti input pagination kosong atau tidak valid, pembentukan origin publik dari header request, fallback konfigurasi origin, origin tidak valid, serta pemetaan error repository menjadi exception yang sesuai. Bukti hasil eksekusi pengujian disimpan pada `docs/unit-test-coverage-output.txt`.

Branch coverage tetap lebih rendah dibandingkan statements dan lines coverage karena sistem memiliki banyak percabangan bisnis, seperti perbedaan role pengguna, status SOP, status pengajuan, jenis pengajuan evaluasi, kondisi OPD berbeda, PIN TTE salah, dan dokumen belum lengkap. Dalam konteks sistem SOP AP, branch coverage penting karena kesalahan sering terjadi pada kondisi alternatif, bukan hanya pada alur normal.

Meskipun hasil pengujian unit sudah cukup kuat dan branch coverage global telah melewati 80%, masih terdapat bagian yang perlu diperluas. Coverage pada `sop-completeness.validator.ts` masih 57,5% untuk branch coverage, sehingga pengujian terhadap variasi kelengkapan dokumen SOP perlu ditambah. Coverage pada `sop-catalog.service.ts`, `sop-public.service.ts`, dan `tte-profil.service.ts` juga masih dapat ditingkatkan karena modul-modul tersebut berhubungan dengan penyusunan SOP, publikasi arsip, dan pengelolaan PIN TTE internal. Selain itu, pengujian unit belum membuktikan alur penggunaan sistem melalui antarmuka web, sehingga tetap perlu dilengkapi dengan system testing black-box atau end-to-end testing.

Berdasarkan hasil tersebut, pengujian unit dapat disimpulkan telah mendukung validasi logika internal sistem SOP AP. Unit test membuktikan bahwa aturan bisnis utama, seperti pembatasan peran, pembatasan OPD, validasi kelengkapan SOP, pengajuan evaluasi, evaluasi dan revisi, tanda tangan elektronik internal, pengesahan SOP, serta arsip publik telah diuji secara terisolasi. Hasil ini menjadi dasar bahwa komponen internal sistem telah siap untuk divalidasi lebih lanjut melalui integration testing, system testing black-box, dan UAT.

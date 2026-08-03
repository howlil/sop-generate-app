# Rancangan User Acceptance Testing (UAT)

Dokumen ini berisi rancangan User Acceptance Testing (UAT) untuk SOPFlow. Penyusunan dilakukan berdasarkan:

1. Dasar teori UAT yang dilampirkan, yaitu UAT sebagai pengujian penerimaan akhir berbasis skenario penggunaan dan penilaian pengguna akhir.
2. Dasar instrumen ISO/IEC 25010:2023 yang dilampirkan, dengan pembatasan pada karakteristik yang dapat dinilai pengguna setelah mencoba sistem.
3. Contoh penyusunan UAT teman, khususnya struktur prosedur, skenario, mekanisme Likert, butir favorable/unfavorable, rekapitulasi hasil, dan analisis per aspek.
4. Dokumen internal proyek: `requirements.md`, `usecase.md`, `comprehensive_usecase_scenarios.md`, `interation-test.md`, `unit-test.md`, dan `non_functional_requirements.md`.
5. Implementasi `client/` dan `server/`, terutama role, route, controller, guard, endpoint, enum status, serta integration test.

Catatan: file PDF ISO yang dilampirkan terdeteksi tidak lengkap oleh extractor lokal. Karena itu, dokumen ini tidak mengutip PDF secara langsung. Landasan ISO digunakan secara konseptual melalui dasar teori yang dilampirkan, dan instrumen ini tidak dimaksudkan sebagai audit atau sertifikasi ISO/IEC 25010 penuh.

## Posisi UAT

UAT digunakan untuk menilai apakah sistem dapat diterima oleh pengguna berdasarkan pengalaman menjalankan skenario tugas. Fokus UAT bukan pada pembuktian teknis internal seperti unit test atau integration test, melainkan pada persepsi pengguna terhadap kesesuaian fungsi, kemudahan penggunaan, kecepatan respons, konsistensi informasi, dan keamanan akses sesuai peran.

Hasil UAT perlu dibaca bersama hasil pengujian teknis. Integration test pada `docs/interation-test.md` sudah menutup risiko API, transaksi, status, dan RBAC. UAT pada dokumen ini melengkapi pengujian tersebut dari sisi penerimaan pengguna.

## Karakteristik ISO/IEC 25010 yang Digunakan

| Kode | Karakteristik | Definisi operasional dalam UAT | Alasan digunakan |
|---|---|---|---|
| FS | Functional Suitability | Sistem menyediakan fungsi yang sesuai dengan kebutuhan kerja tiap aktor. | Sistem memiliki alur bisnis spesifik: penyusunan SOP, evaluasi, TTE, pengesahan, arsip, dan verifikasi. |
| IC | Interaction Capability | Antarmuka, navigasi, label, status, pesan validasi, dan alur interaksi mudah dipahami. | Sistem digunakan langsung melalui web oleh banyak peran dengan tugas berbeda. |
| PE | Performance Efficiency | Halaman, daftar data, penyimpanan, dan proses utama terasa cukup cepat bagi pengguna. | Pengguna perlu memproses daftar SOP, pengajuan, dokumen, dan arsip tanpa hambatan berarti. |
| RL | Reliability | Sistem menampilkan dan menyimpan data secara konsisten sesuai aksi pengguna. | Alur SOP bergantung pada status dokumen, status pengajuan, catatan revisi, dan riwayat tanda tangan. |
| SC | Security | Sistem membatasi akses dan aksi sesuai hak peran, serta melindungi proses sensitif seperti login, PIN TTE, dokumen, dan verifikasi. | Sistem mengelola dokumen resmi, data OPD, akun pengguna, serta tanda tangan elektronik. |

Karakteristik lain seperti Compatibility, Maintainability, Portability, Flexibility, dan Safety tidak dijadikan indikator utama UAT karena memerlukan pengujian teknis atau evaluasi operasional yang lebih luas.

## Kelompok Responden

| Kelompok | Aktor sistem | Fokus penilaian |
|---|---|---|
| PJ Evaluator | `PJ_EVALUATOR` | Master data OPD, tim evaluator, tim penyusun, kepala OPD, monitoring evaluasi, PIN TTE, dan tanda tangan berita acara tahap PJ Evaluator. |
| Evaluator | `EVALUATOR` | Pemeriksaan pengajuan, penilaian substansi SOP, catatan evaluasi, penyelesaian evaluasi, dan daftar pengajuan. |
| Kepala OPD | `KEPALA_OPD` | Pemantauan SOP OPD, pengesahan SOP, pencabutan SOP, arsip pengajuan, serta PIN TTE. |
| PJ Penyusun | `PJ_PENYUSUN` | Penyusunan draft SOP, pengajuan evaluasi, tindak lanjut revisi, pengajuan ulang, PIN TTE, dan tanda tangan berita acara tahap PJ Penyusun. |
| Penyusun | `PENYUSUN` | Penyusunan draft SOP, pengelolaan pelaksana/peraturan, tindak lanjut revisi, riwayat perubahan, dan arsip dokumen. |
| Pengunjung | Tidak login | Arsip publik SOP, verifikasi pengesahan TTE melalui QR/tautan, dan verifikasi tanda tangan PDF. |

## Prosedur UAT

| No | Tahap | Uraian |
|---:|---|---|
| 1 | Persiapan akun dan data | Menyiapkan akun uji untuk setiap peran, data OPD, data SOP, pengajuan evaluasi, dan dokumen TTE sesuai kebutuhan skenario. |
| 2 | Simulasi tugas | Responden menjalankan skenario tugas sesuai kelompok aktor sebelum mengisi kuesioner. |
| 3 | Pengisian kuesioner | Responden menilai pernyataan UAT menggunakan skala Likert lima poin. |
| 4 | Reverse scoring | Butir unfavorable dibalik skornya agar seluruh skor merepresentasikan penerimaan sistem secara konsisten. |
| 5 | Perhitungan persentase | Total skor aktual dibandingkan dengan skor maksimal dan dikonversi ke persentase penerimaan. |
| 6 | Analisis | Hasil dianalisis per aktor dan per aspek ISO/IEC 25010 yang digunakan. |

## Skenario Tugas UAT per Aktor

| Aktor | Skenario tugas sebelum mengisi kuesioner |
|---|---|
| PJ Evaluator | Login, membuka grafik evaluasi, mengelola OPD, mengelola akun evaluator, mengelola akun penyusun/PJ penyusun, mengelola kepala OPD, membuka daftar pengajuan evaluasi, membuat atau memvalidasi PIN TTE, dan menandatangani berita acara pada pengajuan yang sudah selesai dievaluasi. |
| Evaluator | Login, membuka daftar pengajuan evaluasi, melihat detail SOP dalam pengajuan, memberi nilai `SESUAI` atau `PERLU_PERBAIKAN`, mengisi catatan evaluasi bila diperlukan, dan menyelesaikan evaluasi setelah seluruh SOP memenuhi syarat. |
| Kepala OPD | Login, memantau daftar SOP OPD, membuka detail SOP/pengajuan, membuat atau memvalidasi PIN TTE, mengesahkan seluruh SOP dalam pengajuan yang sudah ditandatangani PJ Penyusun, mencabut SOP berlaku bila diperlukan, serta mengunduh arsip dokumen. |
| PJ Penyusun | Login, membuat/melengkapi SOP, mengelola peraturan dan pelaksana, menandai SOP menunggu pengajuan evaluasi, membuat pengajuan evaluasi, membaca umpan balik, menandai tindak lanjut revisi selesai, mengirim ulang SOP hasil revisi, membuat atau memvalidasi PIN TTE, dan menandatangani berita acara setelah tahap PJ Evaluator. |
| Penyusun | Login, membuat/melengkapi draft SOP, mengisi header, dasar hukum, lampiran, pelaksana, langkah prosedur, diagram SOP, melihat riwayat versi/perubahan, membaca umpan balik evaluasi, memperbaiki SOP, dan mengunduh arsip dokumen yang tersedia. |
| Pengunjung | Membuka halaman arsip publik, menelusuri OPD dan SOP berlaku, membuka pratinjau dokumen SOP, membuka tautan/QR verifikasi pengesahan TTE, dan mengunggah PDF untuk verifikasi tanda tangan digital. |

## Skala Penilaian Likert

| Skala | Keterangan | Skor favorable | Rentang interpretasi |
|---|---|---:|---|
| STS | Sangat Tidak Setuju | 1 | 0.00% - 20.00% |
| TS | Tidak Setuju | 2 | 20.01% - 40.00% |
| N | Netral / Cukup | 3 | 40.01% - 60.00% |
| S | Setuju | 4 | 60.01% - 80.00% |
| SS | Sangat Setuju | 5 | 80.01% - 100.00% |

## Konversi Skor Unfavorable

| Pilihan jawaban | Skor awal | Skor setelah dibalik |
|---|---:|---:|
| Sangat Tidak Setuju (STS) | 1 | 5 |
| Tidak Setuju (TS) | 2 | 4 |
| Netral (N) | 3 | 3 |
| Setuju (S) | 4 | 2 |
| Sangat Setuju (SS) | 5 | 1 |

Rumus perhitungan:

```text
Persentase UAT = (Total Skor Aktual / Total Skor Maksimal) x 100%
```

## Instrumen Kuesioner UAT

### PJ Evaluator

| No | Pernyataan | Aspek | Jenis |
|---:|---|---|---|
| 1 | Sistem memudahkan saya melihat ringkasan dan grafik hasil evaluasi SOP setiap OPD. | FS | Favorable |
| 2 | Fitur pengelolaan OPD mendukung proses tambah, ubah, dan nonaktif data OPD sesuai kebutuhan kerja. | FS | Favorable |
| 3 | Fitur pengelolaan tim evaluator, tim penyusun, dan kepala OPD membantu saya menata pengguna sesuai peran dan OPD. | FS | Favorable |
| 4 | Sistem menampilkan status pengajuan evaluasi dan berita acara dengan jelas sebelum proses tanda tangan dilakukan. | IC | Favorable |
| 5 | Proses pembuatan atau perubahan PIN TTE mudah dipahami dan memberi pesan yang jelas ketika input tidak sesuai. | IC | Favorable |
| 6 | Proses tanda tangan berita acara oleh PJ Evaluator berjalan sesuai urutan status pengajuan. | RL | Favorable |
| 7 | Pembatasan akses membuat fitur manajemen hanya dapat digunakan oleh peran yang berwenang. | SC | Favorable |
| 8 | Halaman daftar data dan grafik evaluasi dapat dimuat dengan waktu yang wajar. | PE | Favorable |
| 9 | Saya merasa sulit menemukan menu untuk mengelola OPD, pengguna, atau evaluasi. | IC | Unfavorable |
| 10 | Sistem sering membuat saya ragu apakah perubahan data master benar-benar tersimpan. | RL | Unfavorable |

### Evaluator

| No | Pernyataan | Aspek | Jenis |
|---:|---|---|---|
| 1 | Sistem memudahkan saya melihat daftar pengajuan evaluasi yang perlu ditangani. | FS | Favorable |
| 2 | Detail SOP yang ditampilkan sudah cukup untuk membantu proses pemeriksaan substansi. | FS | Favorable |
| 3 | Fitur pemberian nilai `SESUAI` atau `PERLU_PERBAIKAN` sesuai dengan proses evaluasi SOP. | FS | Favorable |
| 4 | Sistem membantu saya memberikan catatan perbaikan saat hasil evaluasi memerlukan revisi. | FS | Favorable |
| 5 | Status tindak lanjut revisi dan status pengajuan mudah dipahami selama proses evaluasi. | IC | Favorable |
| 6 | Sistem menjaga agar evaluasi hanya dapat diselesaikan ketika kondisi penilaian sudah memenuhi aturan. | RL | Favorable |
| 7 | Sistem merespons dengan cukup cepat saat membuka detail pengajuan dan menyimpan hasil evaluasi. | PE | Favorable |
| 8 | Hak akses saya sebagai evaluator sudah sesuai, yaitu dapat mengevaluasi tanpa dapat mengelola data master atau mengesahkan SOP. | SC | Favorable |
| 9 | Alur penilaian SOP pada sistem terasa membingungkan dan sulit diikuti. | IC | Unfavorable |
| 10 | Saya merasa catatan evaluasi yang saya isi berpotensi tidak tersimpan atau tidak terlihat oleh penyusun. | RL | Unfavorable |

### Kepala OPD

| No | Pernyataan | Aspek | Jenis |
|---:|---|---|---|
| 1 | Sistem memudahkan saya memantau SOP yang berada dalam lingkup OPD saya. | FS | Favorable |
| 2 | Detail SOP dan pengajuan yang ditampilkan cukup membantu sebelum saya melakukan pengesahan. | FS | Favorable |
| 3 | Proses pengesahan SOP melalui PIN TTE berjalan sesuai alur dan status dokumen. | FS | Favorable |
| 4 | Sistem memudahkan saya mengetahui SOP yang sudah berlaku, digantikan, atau dicabut. | IC | Favorable |
| 5 | Fitur pencabutan SOP berlaku membantu ketika SOP tidak lagi digunakan. | FS | Favorable |
| 6 | Dokumen arsip SOP dan berita acara dapat dibuka atau diunduh dengan mudah. | FS | Favorable |
| 7 | Sistem membatasi akses saya hanya pada SOP dan pengajuan sesuai lingkup OPD. | SC | Favorable |
| 8 | Proses membuka daftar, detail, dan dokumen arsip terasa cukup cepat. | PE | Favorable |
| 9 | Saya merasa sulit memahami kapan SOP sudah dapat disahkan. | IC | Unfavorable |
| 10 | Saya merasa sistem dapat mengesahkan sebagian dokumen meskipun proses pengesahan tidak lengkap. | RL | Unfavorable |

### PJ Penyusun

| No | Pernyataan | Aspek | Jenis |
|---:|---|---|---|
| 1 | Sistem mendukung saya membuat dan melengkapi draft SOP sesuai kebutuhan OPD. | FS | Favorable |
| 2 | Fitur pengelolaan peraturan dan pelaksana membantu penyusunan dokumen SOP. | FS | Favorable |
| 3 | Workbench SOP memudahkan pengisian header, dasar hukum, lampiran, prosedur, dan diagram alur. | IC | Favorable |
| 4 | Sistem membantu memastikan SOP lengkap sebelum diajukan untuk evaluasi. | RL | Favorable |
| 5 | Fitur pengajuan evaluasi SOP sesuai dengan alur kerja PJ Penyusun. | FS | Favorable |
| 6 | Umpan balik evaluator mudah ditemukan dan membantu saya menindaklanjuti revisi. | IC | Favorable |
| 7 | Fitur pengajuan ulang setelah revisi berjalan sesuai status tindak lanjut. | RL | Favorable |
| 8 | Proses tanda tangan berita acara oleh PJ Penyusun berjalan sesuai urutan setelah PJ Evaluator. | FS | Favorable |
| 9 | Saya merasa sulit memahami status SOP dari draft sampai siap disahkan. | IC | Unfavorable |
| 10 | Sistem terasa lambat saat menyimpan perubahan SOP atau membuka workbench penyusunan. | PE | Unfavorable |

### Penyusun

| No | Pernyataan | Aspek | Jenis |
|---:|---|---|---|
| 1 | Sistem memudahkan saya membuat SOP baru dan mengisi informasi umum SOP. | FS | Favorable |
| 2 | Fitur penyusunan langkah prosedur membantu menggambarkan aktivitas, pelaksana, waktu, mutu baku, dan output SOP. | FS | Favorable |
| 3 | Fitur diagram SOP membantu saya memeriksa alur prosedur yang telah disusun. | FS | Favorable |
| 4 | Sistem memberi pesan validasi yang jelas ketika data SOP belum lengkap atau tidak sesuai. | IC | Favorable |
| 5 | Riwayat versi dan perubahan membantu saya menelusuri perkembangan dokumen SOP. | RL | Favorable |
| 6 | Umpan balik evaluasi mudah dipahami sehingga saya dapat memperbaiki SOP sesuai catatan evaluator. | IC | Favorable |
| 7 | Sistem menyimpan perubahan draft SOP secara konsisten setelah saya melakukan pengeditan. | RL | Favorable |
| 8 | Hak akses penyusun sesuai, yaitu dapat menyusun dan menindaklanjuti SOP tanpa dapat mengajukan evaluasi atau menandatangani berita acara. | SC | Favorable |
| 9 | Saya merasa fitur penyusunan SOP terlalu sulit digunakan tanpa bantuan pihak lain. | IC | Unfavorable |
| 10 | Saya sering ragu apakah data prosedur atau diagram SOP yang saya ubah sudah tersimpan. | RL | Unfavorable |

### Pengunjung

| No | Pernyataan | Aspek | Jenis |
|---:|---|---|---|
| 1 | Halaman arsip publik memudahkan saya menemukan SOP yang sudah berlaku. | FS | Favorable |
| 2 | Pratinjau dokumen SOP publik menampilkan informasi yang cukup untuk kebutuhan pemeriksaan. | FS | Favorable |
| 3 | Sistem hanya menampilkan dokumen SOP yang memang sudah berlaku pada arsip publik. | RL | Favorable |
| 4 | Halaman verifikasi pengesahan TTE membantu saya mengetahui keabsahan pengesahan dokumen. | FS | Favorable |
| 5 | Fitur unggah PDF untuk verifikasi tanda tangan digital mudah digunakan. | IC | Favorable |
| 6 | Hasil verifikasi PDF ditampilkan dengan bahasa dan status yang mudah dipahami. | IC | Favorable |
| 7 | Sistem tidak menampilkan data internal seperti catatan evaluasi atau log perubahan pada halaman publik. | SC | Favorable |
| 8 | Halaman arsip dan verifikasi publik dapat dimuat dengan cukup cepat. | PE | Favorable |
| 9 | Saya merasa sulit membedakan verifikasi pengesahan melalui QR dengan verifikasi tanda tangan PDF. | IC | Unfavorable |
| 10 | Saya merasa hasil verifikasi yang ditampilkan sistem tidak cukup meyakinkan. | RL | Unfavorable |

## Traceability Instrumen ke Requirement dan Implementasi

| Aktor | Butir utama | Requirement terkait | Use case terkait | Implementasi utama |
|---|---|---|---|---|
| PJ Evaluator | Grafik, OPD, evaluator, penyusun, kepala OPD, TTE BA | 1, 2, 3, 4, 9, 17, 20 | UC-04, UC-05, UC-06, UC-07, UC-08, UC-09, UC-10 | `GET /evaluasi/laporan/grafik-tahunan`, `opd`, `evaluator`, `penyusun`, `kepala-opd`, `tte` |
| Evaluator | Daftar pengajuan, detail SOP, nilai, catatan, selesai evaluasi | 15, 16 | UC-11, UC-12 | `evaluasi`, `evaluasi/workspace`, `evaluasi/:id/nilai/:detailSopId`, `evaluasi/:id/selesai` |
| Kepala OPD | Pantau SOP, pengesahan, pencabutan, arsip, PIN TTE | 9, 18, 19, 21 | UC-13 | `sop`, `sop/cabut/:id`, `tte/tanda-tangani/pengajuan/:id/sop-semua`, `evaluasi/pengajuan` |
| PJ Penyusun | Draft SOP, pengajuan, revisi, kirim ulang, TTE BA | 5, 6, 9, 10, 11, 12, 13, 14, 17, 21 | UC-09, UC-10, UC-14, UC-15, UC-16, UC-17, UC-18 | `sop`, `sop/header`, `sop/langkah`, `sop/diagram`, `evaluasi`, `evaluasi/umpan-balik`, `tte` |
| Penyusun | Draft SOP, peraturan, pelaksana, riwayat, revisi | 5, 6, 10, 11, 14, 21 | UC-15, UC-16, UC-17, UC-18 | `sop`, `peraturan`, `pelaksana`, `evaluasi/umpan-balik`, `evaluasi/:id/nilai/:detailSopId/tindak-lanjut-selesai` |
| Pengunjung | Arsip publik, verifikasi pengesahan, verifikasi PDF | 22, 23, 24 | UC-19, UC-20, UC-21 | `sop/public`, `tte/public/pengesahan/:dokumenTteId/:userId`, `tte/public/pdf/verify` |

## Template Rekapitulasi Jawaban per Aktor

Gunakan tabel berikut untuk setiap aktor setelah kuesioner diisi.

| No | Pernyataan | Jenis | SS | S | N | TS | STS | Total skor |
|---:|---|---|---:|---:|---:|---:|---:|---:|
| 1 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 2 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 3 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 4 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 5 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 6 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 7 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 8 | Diisi sesuai butir instrumen aktor | Favorable/Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 9 | Diisi sesuai butir instrumen aktor | Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |
| 10 | Diisi sesuai butir instrumen aktor | Unfavorable | 0 | 0 | 0 | 0 | 0 | 0 |

Keterangan:

1. Untuk butir favorable: `SS=5`, `S=4`, `N=3`, `TS=2`, `STS=1`.
2. Untuk butir unfavorable: `SS=1`, `S=2`, `N=3`, `TS=4`, `STS=5`.
3. Total skor maksimal per aktor adalah `jumlah responden x 10 butir x 5`.

## Template Rekapitulasi Persentase per Aktor

| Aktor | Jumlah responden | Jumlah butir | Skor aktual | Skor maksimal | Persentase UAT | Kategori |
|---|---:|---:|---:|---:|---:|---|
| PJ Evaluator | 0 | 10 | 0 | 0 | 0.00% | Belum dihitung |
| Evaluator | 0 | 10 | 0 | 0 | 0.00% | Belum dihitung |
| Kepala OPD | 0 | 10 | 0 | 0 | 0.00% | Belum dihitung |
| PJ Penyusun | 0 | 10 | 0 | 0 | 0.00% | Belum dihitung |
| Penyusun | 0 | 10 | 0 | 0 | 0.00% | Belum dihitung |
| Pengunjung | 0 | 10 | 0 | 0 | 0.00% | Belum dihitung |

## Template Analisis Hasil per Aspek

| Aspek | Butir terkait | Cara membaca hasil |
|---|---|---|
| Functional Suitability | Mayoritas butir fungsi utama pada tiap aktor | Persentase tinggi menunjukkan fungsi sistem sesuai kebutuhan kerja aktor. |
| Interaction Capability | Butir navigasi, kejelasan status, pesan validasi, dan kemudahan memahami alur | Persentase tinggi menunjukkan antarmuka dan alur interaksi mudah digunakan. |
| Performance Efficiency | Butir kecepatan membuka halaman, daftar, detail, penyimpanan, dan verifikasi | Persentase tinggi menunjukkan pengguna tidak merasakan hambatan waktu yang berarti. |
| Reliability | Butir konsistensi data, status, penyimpanan, dan aturan proses | Persentase tinggi menunjukkan pengguna percaya data dan status sistem konsisten. |
| Security | Butir pembatasan akses, lingkup OPD, data publik, login, PIN TTE, dan dokumen | Persentase tinggi menunjukkan pengguna menilai akses dan data terlindungi sesuai peran. |

## Analisis Kesesuaian dengan Client dan Server

| Temuan | Bukti implementasi | Dampak pada UAT |
|---|---|---|
| Role sistem sudah eksplisit dan konsisten. | Enum `PeranPengguna` di `server/prisma/schema.prisma` dan konstanta `ROLES` di `client/src/utils/constants.ts`. | Instrumen dibagi menjadi PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun, dan Pengunjung. |
| Route client dipisahkan berdasarkan role. | Prefix `/pj-evaluator`, `/evaluator`, `/kepala-opd`, `/penyusun`, serta route publik `/arsip` dan `/validasi`. | Skenario tugas mengikuti area navigasi yang tersedia di UI. |
| Server menerapkan RBAC pada endpoint kritis. | `@Roles(...)` pada controller `opd`, `penyusun`, `evaluator`, `kepala-opd`, `sop`, `evaluasi`, dan `tte`. | Butir Security dapat dinilai dari pengalaman pengguna ketika fitur sesuai atau tidak sesuai hak akses. |
| Alur status SOP dan pengajuan sudah dimodelkan. | Enum `StatusSOP` dan `StatusPengajuanEvaluasi`. | Butir Reliability menilai kejelasan dan konsistensi status dari draft sampai berlaku. |
| TTE dan verifikasi publik tersedia. | Controller `tte`, `tte/public`, route client `/validasi/pengesahan/...` dan `/validasi/pdf`. | Instrumen mencakup PIN TTE, tanda tangan BA/SOP, verifikasi QR, dan verifikasi PDF. |
| Arsip publik tersedia tanpa login. | Controller `sop/public` dan route client `/arsip`. | Pengunjung dijadikan kelompok UAT tersendiri. |
| Integration test sudah menutup risiko teknis utama. | `server/test/integration/*` dan `docs/interation-test.md`. | UAT difokuskan pada penerimaan pengguna, bukan pengulangan assertion teknis API. |

## Batasan UAT

1. UAT ini menilai penerimaan pengguna setelah simulasi penggunaan sistem, bukan sertifikasi ISO/IEC 25010.
2. Butir kuesioner disusun berdasarkan persepsi pengguna, sehingga karakteristik yang terlalu teknis tidak dijadikan indikator utama.
3. Hasil akhir baru dapat dihitung setelah tersedia jumlah responden dan jawaban aktual.
4. Jika jumlah responden per aktor sangat sedikit, hasil perlu diposisikan sebagai evaluasi penerimaan awal, bukan generalisasi penuh terhadap seluruh populasi pengguna.

## Kesimpulan Rancangan

Rancangan UAT ini selaras dengan dasar teori UAT, struktur contoh UAT yang dilampirkan, kebutuhan fungsional proyek, use case, route client, endpoint server, dan integration test. Instrumen disusun per aktor agar pernyataan yang dinilai sesuai dengan pengalaman nyata masing-masing pengguna, serta menggunakan aspek ISO/IEC 25010 yang relevan untuk penerimaan pengguna: Functional Suitability, Interaction Capability, Performance Efficiency, Reliability, dan Security.

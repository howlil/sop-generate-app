# Rencana System Testing End-to-End Berbasis Playwright

Dokumen ini berisi rancangan skenario pengujian fungsionalitas sistem menggunakan metode Black-Box dengan pendekatan otomatisasi End-to-End (E2E) berbasis Playwright untuk SOPFlow.

## Posisi Pengujian

Pengujian perangkat lunak merupakan bagian dari verification and validation. Verifikasi memastikan sistem sesuai dengan spesifikasi yang telah ditetapkan, sedangkan validasi memastikan sistem sesuai dengan kebutuhan pengguna. Dalam konteks tersebut, system testing termasuk teknik V&V dinamis karena dilakukan dengan menjalankan sistem menggunakan data uji dan mengamati keluaran yang dihasilkan.

System testing dilakukan setelah komponen sistem terintegrasi, sehingga pengujian tidak hanya memeriksa fungsi secara terpisah, tetapi juga alur kerja lintas modul. Pada sistem ini, alur utama melibatkan autentikasi, hak akses peran, pengelolaan data master, penyusunan SOP, pengajuan evaluasi, penilaian evaluator, revisi, tanda tangan elektronik, pengesahan, arsip publik, dan verifikasi dokumen.

End-to-End Testing digunakan karena sistem memiliki proses bisnis panjang dan melibatkan beberapa aktor. Pengujian unit dan integration test sudah penting untuk membuktikan logika internal dan integrasi backend, tetapi belum cukup untuk memastikan bahwa pengguna dapat menjalankan proses lengkap melalui antarmuka web. Playwright digunakan sebagai alat otomatisasi karena dapat mensimulasikan interaksi pengguna pada browser, seperti membuka halaman, mengisi formulir, memilih data, menekan tombol, menunggu perubahan tampilan, dan memeriksa hasil akhir.

## Batasan Pengujian

Pengujian fungsionalitas sistem dilakukan menggunakan metode Black-Box dengan pendekatan otomatisasi End-to-End (E2E) berbasis Playwright.

| Aspek | Batasan |
|---|---|
| Jenis pengujian | Functional system testing |
| Metode | Black-Box testing |
| Pendekatan | Automated End-to-End testing |
| Alat | Playwright |
| Objek pengamatan | Tampilan, navigasi, pesan validasi, perubahan status, hasil simpan, hasil pencarian, dokumen, dan pembatasan akses |
| Tidak diuji | Struktur kode internal, query database langsung, algoritma service, stress test, penetration test, dan audit keamanan mendalam |

## Prasyarat Lingkungan

1. Aplikasi client dan server berjalan pada lingkungan test yang terpisah dari production.
2. Database test berisi data seed minimal untuk semua peran utama.
3. Setiap skenario Playwright menggunakan browser context terisolasi agar sesi login antaraktor tidak saling memengaruhi.
4. Data uji dapat dibuat melalui seed, fixture API, atau setup test sebelum skenario dijalankan.
5. Assertion utama dilakukan dari sudut pandang pengguna melalui UI, bukan dengan memeriksa implementasi internal.
6. Pengujian minimal dijalankan pada Chromium; pengujian lintas browser dapat diperluas ke Firefox dan WebKit.

## Data Uji Utama

| Kode Data | Deskripsi |
|---|---|
| `PJ_EVAL` | Akun PJ Evaluator Organisasi |
| `EVALUATOR` | Akun evaluator |
| `KEPALA_OPD_A` | Akun Kepala OPD pada OPD A |
| `PJ_PENYUSUN_A` | Akun PJ Penyusun pada OPD A |
| `PENYUSUN_A` | Akun Penyusun pada OPD A |
| `PENYUSUN_B` | Akun Penyusun pada OPD B untuk skenario pembatasan data |
| `OPD_A` | OPD utama yang dipakai untuk alur lengkap |
| `OPD_B` | OPD pembanding untuk skenario akses ditolak |
| `PERATURAN_A` | Peraturan yang dipakai sebagai dasar hukum SOP |
| `PELAKSANA_A` | Pelaksana atau jabatan yang dipakai pada prosedur SOP |
| `SOP_DRAFT_A` | SOP milik OPD A berstatus draft |
| `SOP_TIDAK_LENGKAP_A` | SOP yang belum memenuhi kelengkapan dokumen |
| `SOP_SIAP_A` | SOP berstatus menunggu pengajuan evaluasi |
| `PENGAJUAN_AKTIF_A` | Pengajuan evaluasi yang sedang berjalan |
| `SOP_REVISI_A` | SOP yang diberi hasil perlu perbaikan oleh evaluator |
| `SOP_BERLAKU_A` | SOP yang sudah disahkan dan tampil di arsip publik |
| `PDF_VALID_A` | PDF SOP atau berita acara yang memiliki tanda tangan digital valid |
| `PDF_INVALID` | PDF tanpa tanda tangan atau file yang tidak sesuai |

## Strategi Assertion

Setiap skenario E2E minimal memeriksa:

1. Halaman yang benar berhasil dibuka setelah aksi pengguna.
2. Komponen UI utama tampil sesuai peran dan konteks.
3. Input valid diterima dan input tidak valid ditolak.
4. Pesan sukses, pesan error, atau validasi tampil secara jelas.
5. Perubahan data tetap terlihat setelah refresh atau navigasi ulang.
6. Status SOP dan pengajuan berubah sesuai alur bisnis.
7. Role tidak berwenang tidak dapat menjalankan aksi terbatas.
8. Data OPD lain tidak dapat diakses oleh pengguna di luar kewenangannya.
9. Arsip publik hanya menampilkan SOP yang sudah berlaku.
10. Hasil verifikasi TTE/PDF sesuai kondisi dokumen yang diuji.

## Matriks Skenario E2E

| ID | Prioritas | Area | Skenario | Aktor | Langkah Uji | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| E2E-01 | Critical | Autentikasi | Login berhasil | Semua pengguna login | Buka halaman login, isi email dan kata sandi valid, klik masuk | Pengguna masuk ke dashboard sesuai peran |
| E2E-02 | Critical | Autentikasi | Login gagal karena kredensial salah | Semua pengguna login | Isi email atau kata sandi tidak valid, klik masuk | Sistem menolak login dan menampilkan pesan kesalahan |
| E2E-03 | High | Autentikasi | Logout berhasil | Semua pengguna login | Login, buka menu akun, pilih logout | Sesi berakhir dan pengguna diarahkan ke halaman login |
| E2E-04 | Critical | Otorisasi | Menu tampil sesuai peran | Semua pengguna login | Login sebagai tiap peran dan amati navigasi utama | Menu yang tampil hanya sesuai kewenangan aktor |
| E2E-05 | Critical | Otorisasi | Akses halaman terlarang ditolak | Evaluator, Penyusun, Kepala OPD | Coba buka URL manajemen OPD atau pengguna secara langsung | Sistem menolak akses atau menampilkan halaman tidak berwenang |
| E2E-06 | High | Akun | Ubah kata sandi berhasil | Semua pengguna login | Buka profil, isi kata sandi lama, kata sandi baru, dan konfirmasi valid | Sistem menyimpan kata sandi baru dan menampilkan notifikasi sukses |
| E2E-07 | High | Akun | Ubah kata sandi gagal | Semua pengguna login | Isi kata sandi lama salah atau konfirmasi tidak cocok | Sistem menampilkan validasi dan perubahan tidak disimpan |
| E2E-08 | Critical | Master OPD | Tambah OPD | PJ Evaluator | Buka manajemen OPD, tambah OPD baru, isi nama, simpan | OPD baru tampil pada daftar |
| E2E-09 | High | Master OPD | Ubah OPD | PJ Evaluator | Pilih OPD, ubah nama, simpan | Daftar OPD menampilkan data terbaru |
| E2E-10 | High | Master OPD | Hapus atau nonaktifkan OPD | PJ Evaluator | Pilih OPD yang memenuhi syarat, lakukan hapus atau nonaktif | OPD tidak lagi tampil sebagai data aktif |
| E2E-11 | Critical | Tim Evaluator | Tambah evaluator | PJ Evaluator | Buka manajemen evaluator, tambah akun evaluator valid | Evaluator baru tampil pada daftar |
| E2E-12 | High | Tim Evaluator | Ubah atau nonaktifkan evaluator | PJ Evaluator | Pilih evaluator, ubah data atau status akun | Data dan status evaluator berubah sesuai aksi |
| E2E-13 | Critical | Tim Penyusun | Tambah penyusun/PJ penyusun | PJ Evaluator | Buka manajemen penyusun, tambah akun dengan OPD dan peran valid | Pengguna baru tampil pada daftar penyusun |
| E2E-14 | High | Tim Penyusun | Pindah OPD penyusun | PJ Evaluator | Pilih penyusun, ubah penempatan OPD, simpan | OPD aktif penyusun berubah dan riwayat penempatan dapat dilihat |
| E2E-15 | Critical | Kepala OPD | Tetapkan Kepala OPD | PJ Evaluator | Tambah atau pilih Kepala OPD untuk OPD tertentu | Kepala OPD aktif pada OPD tersebut tersimpan |
| E2E-16 | High | Monitoring | Lihat grafik evaluasi | PJ Evaluator | Buka grafik evaluasi, pilih tahun atau filter OPD | Grafik dan ringkasan evaluasi tampil sesuai filter |
| E2E-17 | Critical | Peraturan | Tambah peraturan | Penyusun, PJ Penyusun | Buka manajemen peraturan, isi nomor, tahun, dan judul peraturan | Peraturan tersimpan dan tampil pada daftar |
| E2E-18 | High | Peraturan | Validasi peraturan duplikat | Penyusun, PJ Penyusun | Tambah peraturan dengan nomor dan tahun yang sudah ada | Sistem menolak data duplikat |
| E2E-19 | High | Peraturan | Ubah dan cari peraturan | Penyusun, PJ Penyusun | Ubah data peraturan, gunakan pencarian | Data terbaru ditemukan sesuai kata kunci |
| E2E-20 | Critical | Pelaksana | Tambah pelaksana SOP | Penyusun, PJ Penyusun | Buka manajemen pelaksana, tambah jabatan/pelaksana valid | Pelaksana tampil pada daftar dan dapat dipakai di SOP |
| E2E-21 | High | Pelaksana | Ubah dan hapus pelaksana | Penyusun, PJ Penyusun | Pilih pelaksana, ubah atau hapus jika belum mengganggu data SOP | Sistem menampilkan hasil sesuai aturan penggunaan data |
| E2E-22 | Critical | Penyusunan SOP | Buat draft SOP baru | Penyusun, PJ Penyusun | Buka manajemen SOP, klik tambah SOP, isi judul dan nomor SOP | SOP baru tersimpan dengan status draft |
| E2E-23 | Critical | Penyusunan SOP | Nomor SOP duplikat ditolak | Penyusun, PJ Penyusun | Buat SOP dengan nomor yang sudah digunakan | Sistem menolak penyimpanan dan menampilkan validasi |
| E2E-24 | Critical | Penyusunan SOP | Lengkapi header SOP | Penyusun, PJ Penyusun | Isi informasi umum, dasar hukum, lampiran, dan SOP terkait | Data tersimpan dan tetap tampil setelah refresh |
| E2E-25 | Critical | Penyusunan SOP | Lengkapi prosedur SOP | Penyusun, PJ Penyusun | Tambah pelaksana, langkah prosedur, waktu, mutu baku, output, dan keterangan | Tabel prosedur tersimpan sesuai input |
| E2E-26 | Critical | Penyusunan SOP | Validasi langkah keputusan | Penyusun, PJ Penyusun | Tambah langkah keputusan tanpa cabang Ya dan Tidak | Sistem menampilkan validasi dan menolak data tidak lengkap |
| E2E-27 | High | Penyusunan SOP | Pratinjau diagram SOP | Penyusun, PJ Penyusun | Buka tab diagram setelah prosedur diisi | Diagram flowchart/BPMN tampil sesuai langkah SOP |
| E2E-28 | High | Penyusunan SOP | Perubahan SOP tersimpan | Penyusun, PJ Penyusun | Ubah header atau prosedur, tunggu simpan otomatis atau klik simpan, refresh halaman | Perubahan tetap tampil setelah halaman dimuat ulang |
| E2E-29 | High | Riwayat SOP | Lihat riwayat perubahan | Penyusun, PJ Penyusun | Buka detail SOP dan panel riwayat | Aktivitas perubahan SOP tampil sesuai aksi sebelumnya |
| E2E-30 | Critical | Status SOP | Tandai SOP siap evaluasi berhasil | Penyusun, PJ Penyusun | Lengkapi SOP, ubah status menjadi menunggu pengajuan evaluasi | Status SOP berubah menjadi menunggu pengajuan evaluasi |
| E2E-31 | Critical | Status SOP | Tandai SOP tidak lengkap ditolak | Penyusun, PJ Penyusun | Coba ubah status SOP tidak lengkap menjadi siap evaluasi | Sistem menolak dan menampilkan kekurangan dokumen |
| E2E-32 | Critical | Pengajuan Evaluasi | Buat pengajuan evaluasi | PJ Penyusun | Pilih SOP yang siap evaluasi, buat pengajuan | Pengajuan terbentuk dan SOP masuk status sedang dievaluasi |
| E2E-33 | Critical | Pengajuan Evaluasi | Pengajuan tanpa SOP valid ditolak | PJ Penyusun | Buat pengajuan tanpa SOP atau dengan SOP tidak siap | Sistem menolak pembuatan pengajuan |
| E2E-34 | Critical | Pengajuan Evaluasi | Penyusun biasa tidak dapat mengajukan evaluasi | Penyusun | Coba membuat pengajuan evaluasi dari UI atau URL | Sistem menolak akses aksi pengajuan |
| E2E-35 | Critical | Evaluasi | Evaluator melihat daftar pengajuan | Evaluator | Login, buka daftar evaluasi | Pengajuan yang perlu ditangani tampil |
| E2E-36 | Critical | Evaluasi | Evaluator membuka detail SOP | Evaluator | Pilih pengajuan, buka salah satu SOP | Detail SOP dan pratinjau dokumen tampil |
| E2E-37 | Critical | Evaluasi | Nilai SOP sesuai | Evaluator | Pilih hasil sesuai, simpan penilaian | Nilai tersimpan dan status penilaian berubah |
| E2E-38 | Critical | Evaluasi | Nilai SOP perlu perbaikan | Evaluator | Pilih perlu perbaikan, isi catatan, simpan | Catatan tersimpan dan SOP masuk status revisi dari evaluator |
| E2E-39 | Critical | Evaluasi | Catatan wajib untuk perlu perbaikan | Evaluator | Pilih perlu perbaikan tanpa mengisi catatan | Sistem menolak penyimpanan |
| E2E-40 | Critical | Evaluasi | Selesai evaluasi ditolak jika belum semua sesuai | Evaluator | Coba selesaikan pengajuan ketika masih ada SOP belum sesuai | Sistem menolak penyelesaian |
| E2E-41 | Critical | Revisi | Penyusun membaca catatan revisi | Penyusun, PJ Penyusun | Buka SOP yang perlu perbaikan | Catatan evaluator tampil dan dapat dijadikan acuan perbaikan |
| E2E-42 | Critical | Revisi | Tindak lanjut revisi selesai | Penyusun, PJ Penyusun | Perbaiki SOP, tandai tindak lanjut selesai | Status tindak lanjut berubah menjadi selesai |
| E2E-43 | Critical | Revisi | Kirim ulang revisi berhasil | PJ Penyusun | Kirim ulang SOP revisi yang sudah ditindaklanjuti | SOP kembali ke alur evaluasi |
| E2E-44 | Critical | Revisi | Kirim ulang revisi oleh Penyusun ditolak | Penyusun | Coba kirim ulang SOP revisi sebagai penyusun biasa | Sistem menolak karena aksi hanya untuk PJ Penyusun |
| E2E-45 | Critical | Evaluasi | Evaluasi ulang revisi | Evaluator | Buka SOP revisi yang dikirim ulang, beri nilai sesuai | Nilai terbaru tersimpan |
| E2E-46 | Critical | Evaluasi | Selesaikan evaluasi berhasil | Evaluator | Pastikan semua SOP bernilai sesuai, isi skor OPD bila diperlukan, selesaikan evaluasi | Pengajuan berubah menjadi selesai dievaluasi dan SOP menunggu TTD PJ Evaluator |
| E2E-47 | Critical | TTE | Atur PIN TTE pertama kali | PJ Evaluator, PJ Penyusun, Kepala OPD | Buka profil TTE, isi PIN valid, simpan | Status PIN TTE aktif |
| E2E-48 | High | TTE | Ubah PIN TTE berhasil | PJ Evaluator, PJ Penyusun, Kepala OPD | Isi PIN lama valid dan PIN baru valid | PIN baru tersimpan |
| E2E-49 | High | TTE | PIN TTE tidak valid ditolak | PJ Evaluator, PJ Penyusun, Kepala OPD | Isi PIN salah atau format tidak valid | Sistem menolak dan menampilkan pesan validasi |
| E2E-50 | Critical | TTE BA | PJ Evaluator menandatangani BA | PJ Evaluator | Buka pengajuan selesai dievaluasi, masukkan PIN, tanda tangani BA | Pengajuan berubah menjadi ditandatangani PJ Evaluator |
| E2E-51 | Critical | TTE BA | PJ Penyusun menandatangani BA | PJ Penyusun | Buka pengajuan yang sudah ditandatangani PJ Evaluator, masukkan PIN | Pengajuan berubah menjadi ditandatangani PJ Penyusun dan SOP menunggu pengesahan |
| E2E-52 | Critical | TTE BA | Urutan tanda tangan BA salah ditolak | PJ Penyusun | Coba tanda tangan BA sebelum PJ Evaluator | Sistem menolak aksi tanda tangan |
| E2E-53 | Critical | Pengesahan | Kepala OPD mengesahkan SOP | Kepala OPD | Buka pengajuan siap pengesahan, masukkan PIN, sahkan seluruh SOP | SOP menjadi berlaku dan pengajuan selesai |
| E2E-54 | Critical | Pengesahan | Pengesahan dengan PIN salah ditolak | Kepala OPD | Masukkan PIN salah saat mengesahkan SOP | Sistem menolak pengesahan |
| E2E-55 | High | Pencabutan | Kepala OPD mencabut SOP berlaku | Kepala OPD | Buka SOP berlaku, pilih cabut, konfirmasi | SOP berubah menjadi dicabut dan tidak tampil sebagai SOP berlaku |
| E2E-56 | High | Versi SOP | Buat versi baru dari SOP berlaku | Penyusun, PJ Penyusun | Buka SOP berlaku, pilih buat versi baru | Versi baru dibuat sebagai draft dan versi lama tetap berlaku |
| E2E-57 | High | Versi SOP | Versi lama digantikan setelah versi baru disahkan | Kepala OPD | Jalankan pengesahan terhadap versi baru | Versi baru menjadi berlaku dan versi lama menjadi digantikan |
| E2E-58 | High | Arsip Internal | Cetak atau unduh SOP | Semua pengguna login | Buka detail atau arsip SOP, pilih cetak/unduh | Dokumen SOP berhasil dibuat atau diunduh |
| E2E-59 | High | Arsip Internal | Cetak atau unduh berita acara | Pengguna berwenang | Buka pengajuan selesai, pilih unduh berita acara | Dokumen berita acara tersedia |
| E2E-60 | Critical | Arsip Publik | Buka arsip publik tanpa login | Pengunjung | Buka `/arsip` tanpa sesi login | Halaman arsip publik tampil |
| E2E-61 | Critical | Arsip Publik | Cari SOP publik | Pengunjung | Cari SOP berdasarkan kata kunci atau pilih OPD | Hanya SOP berstatus berlaku yang tampil |
| E2E-62 | Critical | Arsip Publik | Pratinjau SOP publik | Pengunjung | Pilih SOP dari daftar arsip publik | Pratinjau dokumen tampil tanpa data internal evaluasi |
| E2E-63 | Critical | Arsip Publik | SOP non-berlaku tidak tampil publik | Pengunjung | Cari SOP draft, revisi, digantikan, atau dicabut | SOP tersebut tidak muncul sebagai arsip publik aktif |
| E2E-64 | Critical | Verifikasi TTE | Verifikasi pengesahan TTE valid | Pengunjung | Buka tautan/QR verifikasi pengesahan valid | Sistem menampilkan informasi pengesahan yang valid |
| E2E-65 | Critical | Verifikasi TTE | Verifikasi pengesahan TTE tidak valid | Pengunjung | Buka tautan verifikasi dengan ID tidak valid | Sistem menampilkan status tidak ditemukan atau tidak valid |
| E2E-66 | Critical | Verifikasi PDF | Verifikasi PDF valid | Pengunjung | Buka halaman verifikasi PDF, unggah PDF bertanda tangan valid | Sistem menampilkan hasil verifikasi valid |
| E2E-67 | Critical | Verifikasi PDF | Verifikasi PDF tidak valid | Pengunjung | Unggah PDF tanpa tanda tangan atau file tidak sesuai | Sistem menampilkan hasil tidak valid |
| E2E-68 | High | Daftar Data | Pencarian, filter, dan pagination SOP | Semua pengguna login | Buka daftar SOP, gunakan pencarian, filter status, dan pindah halaman | Daftar berubah sesuai kriteria yang dipilih |
| E2E-69 | Critical | Konsistensi Status | Status konsisten lintas peran | Semua peran terkait | Jalankan alur draft sampai berlaku dan buka data dari akun berbeda | Setiap peran melihat status terbaru sesuai tahap proses |
| E2E-70 | Critical | Pembatasan Data | Data OPD lain tidak dapat diakses | Kepala OPD, Penyusun, PJ Penyusun | Login sebagai OPD A, coba akses data OPD B melalui URL atau pencarian | Sistem tidak menampilkan data OPD B |

## Alur E2E Utama Prioritas

Alur berikut menjadi skenario prioritas karena mewakili proses bisnis sistem dari awal sampai akhir.

| Tahap | Aktor | Aksi | Kondisi Akhir |
|---|---|---|---|
| 1 | PJ Evaluator | Menyiapkan OPD, evaluator, kepala OPD, PJ Penyusun, dan Penyusun | Struktur organisasi dan akun pengguna siap |
| 2 | Penyusun/PJ Penyusun | Menambahkan peraturan dan pelaksana | Referensi penyusunan SOP tersedia |
| 3 | Penyusun/PJ Penyusun | Membuat dan melengkapi SOP | SOP lengkap dan siap diajukan |
| 4 | Penyusun/PJ Penyusun | Menandai SOP menunggu pengajuan evaluasi | SOP masuk daftar siap evaluasi |
| 5 | PJ Penyusun | Membuat pengajuan evaluasi | Pengajuan aktif terbentuk |
| 6 | Evaluator | Menilai SOP | SOP dinilai sesuai atau perlu perbaikan |
| 7 | Penyusun/PJ Penyusun | Memperbaiki SOP yang perlu revisi | Tindak lanjut revisi selesai |
| 8 | PJ Penyusun | Mengirim ulang revisi | SOP kembali ke evaluator |
| 9 | Evaluator | Menilai ulang dan menyelesaikan evaluasi | Pengajuan selesai dievaluasi |
| 10 | PJ Evaluator | Menandatangani berita acara | BA ditandatangani tahap pertama |
| 11 | PJ Penyusun | Menandatangani berita acara | SOP siap disahkan Kepala OPD |
| 12 | Kepala OPD | Mengesahkan SOP | SOP menjadi berlaku |
| 13 | Pengunjung | Membuka arsip publik | SOP berlaku dapat ditemukan |
| 14 | Pengunjung | Memverifikasi TTE dan PDF | Keabsahan dokumen dapat diperiksa |

## Contoh Struktur Implementasi Playwright

Jika skenario di atas diotomatisasi sebagai test suite, struktur yang disarankan:

```text
client/
  e2e/
    auth.spec.ts
    master-data.spec.ts
    sop-authoring.spec.ts
    evaluasi-workflow.spec.ts
    tte-pengesahan.spec.ts
    arsip-public.spec.ts
    fixtures/
      users.ts
      test-data.ts
    pages/
      login-page.ts
      dashboard-page.ts
      sop-page.ts
      evaluasi-page.ts
```

Strategi implementasi test:

1. Gunakan page object untuk halaman yang sering dipakai seperti login, daftar SOP, detail SOP, evaluasi, dan arsip publik.
2. Gunakan fixture akun per role agar skenario mudah dibaca.
3. Gunakan setup data melalui seed atau API helper sebelum test browser dijalankan.
4. Gunakan selector yang stabil seperti role, label, nama tombol, atau `data-testid` jika tersedia.
5. Pisahkan skenario critical workflow dari skenario pendukung agar test utama tetap cepat dan stabil.

## Kriteria Kelulusan

| Kriteria | Ukuran Lulus |
|---|---|
| Autentikasi | Semua role dapat login dengan kredensial valid dan kredensial salah ditolak |
| Otorisasi | Pengguna hanya dapat melihat dan menjalankan fitur sesuai perannya |
| Master data | OPD, evaluator, penyusun, kepala OPD, peraturan, dan pelaksana dapat dikelola sesuai hak akses |
| Penyusunan SOP | SOP dapat dibuat, dilengkapi, divalidasi, dan ditandai siap evaluasi |
| Evaluasi | Evaluator dapat memberi nilai, catatan, meminta revisi, dan menyelesaikan evaluasi sesuai aturan |
| Revisi | Penyusun dapat menindaklanjuti revisi dan PJ Penyusun dapat mengirim ulang |
| TTE | PIN TTE, tanda tangan BA, dan pengesahan SOP berjalan sesuai urutan |
| Arsip | Dokumen internal dapat dicetak/diunduh dan arsip publik hanya menampilkan SOP berlaku |
| Verifikasi | Tautan verifikasi TTE dan unggah PDF menampilkan hasil sesuai validitas dokumen |
| Konsistensi | Status SOP dan pengajuan tetap konsisten setelah refresh, logout-login, dan perpindahan peran |

## Traceability ke Kebutuhan Fungsional

| Requirement | Area Skenario |
|---|---|
| No 1-4 | E2E-08 sampai E2E-16 |
| No 5-6 | E2E-17 sampai E2E-21 |
| No 7-8 | E2E-01 sampai E2E-07 |
| No 9 | E2E-47 sampai E2E-49 |
| No 10-11 | E2E-22 sampai E2E-31 |
| No 12-14 | E2E-32 sampai E2E-34 dan E2E-41 sampai E2E-44 |
| No 15-16 | E2E-35 sampai E2E-40 dan E2E-45 sampai E2E-46 |
| No 17 | E2E-50 sampai E2E-52 |
| No 18-19 | E2E-53 sampai E2E-57 |
| No 20 | E2E-16 |
| No 21 | E2E-58 sampai E2E-59 |
| No 22-24 | E2E-60 sampai E2E-67 |

## Kesimpulan Rancangan

Rancangan E2E testing ini mencakup alur fungsional utama sistem dari sisi pengguna, mulai dari login, pengelolaan data, penyusunan SOP, evaluasi, revisi, TTE, pengesahan, arsip publik, hingga verifikasi dokumen. Dengan pendekatan Black-Box berbasis Playwright, pengujian berfokus pada perilaku sistem dan keluaran yang terlihat oleh pengguna, sehingga sesuai untuk system testing pada aplikasi web yang memiliki workflow lintas aktor dan lintas modul.

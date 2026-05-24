# Kebutuhan Fungsional dan Non-Fungsional Sistem SOP

Dokumen ini memuat daftar kebutuhan fungsional resmi sistem (**No 1–24**) serta kebutuhan non-fungsional yang mendukung implementasi di `server/` dan `client/`. Peran aktor mengikuti enum `PeranPengguna` pada `server/prisma/schema.prisma`.

> **Use case diagram ≠ requirements:** Diagram UML di [`usecase.md`](usecase.md) memuat **21 oval** dengan penamaan berbeda (mis. *Mengevaluasi SOP*). Tabel di bawah ini (**24 baris**) adalah kebutuhan fungsional resmi — jangan menyamakan jumlah atau nama keduanya. Pemetaan silang ada di `usecase.md`, bukan pengganti salah satu daftar.

---

## 1. Kebutuhan Fungsional (Functional Requirements)

| No | Aktor | Nama Fungsional | Deskripsi |
| :---: | :--- | :--- | :--- |
| 1 | PJ Evaluator Organisasi | Pengelolaan Data OPD | Mengelola data Organisasi Perangkat Daerah (OPD) melalui proses penambahan, perubahan, dan penghapusan data OPD. |
| 2 | PJ Evaluator Organisasi | Pengelolaan Tim Evaluator | Mengelola data akun evaluator pada masing-masing OPD, termasuk penambahan, perubahan, dan penonaktifan akun evaluator. |
| 3 | PJ Evaluator Organisasi | Pengelolaan Tim Penyusun SOP | Mengelola data akun penyusun SOP dan PJ Penyusun SOP pada masing-masing OPD, termasuk perpindahan tugas dan pengaturan status akun. |
| 4 | PJ Evaluator Organisasi | Pengelolaan Kepala OPD | Mengatur data Kepala OPD yang aktif pada masing-masing OPD. |
| 5 | Penyusun / PJ Penyusun | Pengelolaan Peraturan OPD | Mengelola data peraturan yang digunakan sebagai dasar hukum dalam penyusunan SOP pada OPD masing-masing. |
| 6 | Penyusun / PJ Penyusun | Pengelolaan Data Pelaksana SOP | Mengelola data pelaksana SOP berupa jabatan atau pihak yang terlibat dalam pelaksanaan SOP. |
| 7 | Seluruh Pengguna | Login | Melakukan proses masuk ke dalam sistem menggunakan akun yang telah terdaftar. |
| 8 | Seluruh Pengguna | Perubahan Kata Sandi | Mengubah kata sandi akun pengguna untuk menjaga keamanan akses sistem. |
| 9 | PJ Evaluator, PJ Penyusun, Kepala OPD | Pengelolaan PIN TTE | Mengatur dan memvalidasi PIN yang digunakan untuk proses tanda tangan elektronik pada sistem. |
| 10 | Penyusun / PJ Penyusun | Penyusunan dan Pengelolaan Draft SOP | Mengelola proses penyusunan draft SOP yang meliputi pengisian informasi umum SOP, kelengkapan dokumen, prosedur kerja, keterkaitan antar-SOP, serta diagram alur SOP sesuai kebutuhan proses bisnis. |
| 11 | Penyusun / PJ Penyusun | Penelusuran Riwayat Perubahan SOP | Melihat riwayat perubahan dan aktivitas pengeditan yang dilakukan pada dokumen SOP. |
| 12 | PJ Penyusun | Pengajuan Evaluasi SOP | Mengajukan dokumen SOP yang telah selesai disusun untuk dilakukan proses evaluasi. |
| 13 | PJ Penyusun | Pengajuan Ulang SOP Revisi | Mengirim kembali dokumen SOP yang telah diperbaiki berdasarkan hasil evaluasi sebelumnya. |
| 14 | Penyusun / PJ Penyusun | Tindak Lanjut Hasil Evaluasi | Melakukan perbaikan terhadap dokumen SOP sesuai dengan catatan dan masukan evaluator. |
| 15 | Evaluator | Penilaian Substansi SOP | Melakukan penilaian terhadap kesesuaian isi dan substansi dokumen SOP. |
| 16 | Evaluator | Pengelolaan Catatan Evaluasi | Memberikan catatan dan masukan perbaikan terhadap dokumen SOP yang dievaluasi. |
| 17 | PJ Evaluator / PJ Penyusun | Tanda Tangan Berita Acara Evaluasi | Melakukan tanda tangan elektronik pada berita acara hasil evaluasi SOP. |
| 18 | Kepala OPD | Pengesahan SOP | Melakukan pengesahan dokumen SOP melalui tanda tangan elektronik sehingga SOP dapat diberlakukan. |
| 19 | Kepala OPD | Pencabutan SOP | Melakukan pencabutan SOP yang sudah berlaku. |
| 20 | PJ Evaluator | Monitoring Grafik Evaluasi | Melihat data statistik dan grafik hasil evaluasi SOP pada masing-masing OPD. |
| 21 | Semua Pengguna | Cetak dan Unduh Arsip Dokumen | Mencetak dan mengunduh dokumen SOP maupun berita acara dalam bentuk arsip digital. |
| 22 | Pengunjung | Akses Arsip Publik SOP | Melihat daftar dan pratinjau dokumen SOP yang telah berlaku tanpa perlu login ke sistem. |
| 23 | Pengunjung | Verifikasi Pengesahan TTE | Memverifikasi keabsahan tanda tangan elektronik pada dokumen SOP. |
| 24 | Pengunjung | Verifikasi Tanda Tangan PDF | Melakukan pengecekan validitas tanda tangan digital pada dokumen PDF. |

### Pemetaan implementasi (ringkas, `server/`)

| No | Endpoint / modul utama |
| :---: | :--- |
| 1–4 | `core/opd`, `evaluator`, `penyusun`, `kepala-opd` — `@Roles(PJ_EVALUATOR)` |
| 5 | `core/peraturan` |
| 6 | `sop/pelaksana` |
| 7–8 | `core/auth` |
| 9, 17, 18 | `tte` |
| 10 | `sop/catalog`, `sop/prosedur`, `sop/diagram` |
| 11 | `LogEditSOP` pada workbench; **baca** juga Evaluator/PJ Evaluator/Kepala OPD (monitoring) via `GET /sop/penyusun-workbench` |
| 12 | `POST /evaluasi` |
| 13 | `POST /sop/penyusun-workbench/:id/kirim-ulang-evaluasi` |
| 14 | revisi dokumen + `PATCH .../tindak-lanjut-selesai` |
| 15–16 | `PATCH /evaluasi/:id/nilai/:detailSopId` dan `PATCH .../selesai` — **hanya** `@Roles(EVALUATOR)` |
| 19 | `POST /sop/cabut/:id` |
| 20 | `GET /evaluasi/laporan/grafik-tahunan` |
| 21 | cetak/unduh di client + `GET evaluasi/pengajuan/...` (`arsip=true`, status `SELESAI`) untuk semua peran login termasuk **Penyusun** (terbatas OPD sendiri); PDF PKCS#7 opsional |
| 22 | `sop/public` |
| 23–24 | `tte/public` |

**Langkah teknis penutupan evaluasi:** Setelah semua SOP dinilai `SESUAI`, evaluator menyelesaikan paket evaluasi (`PATCH /evaluasi/:id/selesai`) agar pengajuan siap TTE Berita Acara. Ini mendukung No 15–16 dan 17.

**Versi baru SOP:** Pembuatan versi baru dari SOP `BERLAKU` dilakukan oleh Penyusun/PJ Penyusun (`POST /sop/:id/buat-versi-baru`), bukan oleh Kepala OPD.

---

## 2. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Aktor | Nama Non-Fungsional | Deskripsi |
| :--- | :--- | :--- |
| **Sistem** | Keamanan — Enkripsi Kredensial | Hash kata sandi dan PIN TTE dengan `bcrypt`; API terlindungi JWT (`passport-jwt`, cookie httpOnly). |
| **Sistem** | Keamanan — TTE Aplikasi (Simulasi) | Metadata tanda tangan disimpan di DB (HMAC-SHA256 + field sertifikat simulasi); hash dokumen kanonik SHA-256. Bukan TTE tersertifikasi BSrE/Komdigi. |
| **Sistem** | Keamanan — PDF PKCS#7 (Opsional) | Jika `PDF_SIGNING_ENABLED=true`, server menyisipkan signature PKCS#7 ke PDF unduhan memakai sertifikat P12 internal. |
| **Sistem** | Keandalan — Optimistic Locking | Field `version` pada `PengajuanEvaluasi` dan `NilaiEvaluasi` mencegah konflik update bersamaan. |
| **Sistem** | Keandalan — Integritas Data | Relasi Prisma memakai `Restrict`/`Cascade` sesuai domain. |
| **Sistem** | Performa & Arsitektur | NestJS, Prisma, MySQL/MariaDB, API `/api/v1`. |
| **Developer / Sistem** | Kualitas & Pengujian | `class-validator` pada API; unit test Jest pada service/policy/util. |
| **Sistem** | Keterpantauan | Logging terstruktur (`nest-winston`). |

---

## Dokumen terkait

* `docs/usecase.md` — diagram UML (21 use case, UC-01–UC-21) + pemetaan ke tabel No 1–24 di atas
* `docs/usecase-scenario/README.md` — indeks skenario detail per No fungsional
* `docs/BUSINESS-SPEC.md` — spesifikasi bisnis dan alur status

# Comprehensive Usecase Scenarios

Dokumen ini merupakan gabungan komprehensif dari semua skenario use case pada SOPFlow.

# Use Case SOPFlow

Dokumen ini mengacu pada **diagram use case UML SOPFlow**: **21 oval (UC-01–UC-21)** dan **6 aktor**. Detail alur per oval ada di [`usecase-scenario/`](usecase-scenario/README.md).

### Lima use case inti (core)

| Urut | UC | Use case |
| :---: | :---: | :--- |
| 1 | UC-15 | Menyusun Draft SOP |
| 2 | UC-14 | Mengajukan Evaluasi SOP |
| 3 | UC-11 | Mengevaluasi SOP |
| 4 | UC-10 | Menandatangani Berita Acara (TTD BA) |
| 5 | UC-13 | Mengesahkan Dokumen SOP |

---

## Penting: use case diagram **bukan** sama dengan requirements

**Use case pada diagram** dan **kebutuhan fungsional** di [`requirements.md`](requirements.md) adalah **dua lapisan dokumentasi yang sengaja berbeda**. Jangan menyamakan jumlah, nama, atau daftar keduanya.

| Aspek | Use case (diagram UML) | Kebutuhan fungsional (`requirements.md`) |
| :--- | :--- | :--- |
| **Jumlah** | **21** oval unik | **24** baris (No 1–24) |
| **Penamaan** | Contoh: *Mengevaluasi SOP*, *Membuat Komentar*, *Mengelola OPD* | Contoh: *Penilaian Substansi SOP*, *Pengelolaan Catatan Evaluasi*, *Pengelolaan Data OPD* |
| **Peran** | Matriks aktor di diagram (termasuk Logout, Melihat List SOP) | Aktor per baris requirements (tanpa Logout/List sebagai No terpisah) |
| **Fungsi** | Model interaksi untuk analisis/sidang | Daftar resmi + jejak ke implementasi `server/` |

### Mengapa jumlah dan isinya beda?

1. **Satu oval, beberapa No** — *Menyusun Draft SOP* + *Inisiasi Dokumen SOP* (2 oval) → satu No **10** di requirements.
2. **Satu No, tidak ada oval** — No **8, 11, 13, 14, 19, 21** ada di requirements dan implementasi, tetapi **tidak** digambar sebagai oval terpisah di diagram.
3. **Oval tanpa No sendiri** — *Logout*, *Melihat List SOP* mendukung sesi/navigasi; tidak punya baris fungsional terpisah (Logout mendukung No 7 Login).
4. **Nama sengaja beda** — oval memakai istilah diagram; requirements memakai **nama fungsional resmi** (biasanya bentuk nomina).

Kolom **No requirements** pada tabel di bawah hanya **petunjuk pemetaan** (traceability), **bukan** identitas 1:1 antara oval dan baris requirements.

---



## Daftar use case diagram (21)



| ID | Core | Use case (diagram) | Aktor pada diagram | No requirements | Relasi / catatan |

| :---: | :---: | :--- | :--- | :---: | :--- |

| UC-01 | | Login | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | 7 | — |
    
| UC-02 | | Logout | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | — | Pendukung sesi setelah Login (No 7) |

| UC-03 | | Melihat List SOP | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | — | Navigasi daftar/monitoring SOP |

| UC-04 | | Melihat Hasil Penilaian OPD | PJ Evaluator | 20 | Monitoring grafik evaluasi |

| UC-05 | | Mengelola OPD | PJ Evaluator | 1 | |

| UC-06 | | Mengelola Tim Evaluator | PJ Evaluator | 2 | |

| UC-07 | | Mengelola Kepala OPD | PJ Evaluator | 4 | |

| UC-08 | | Mengelola Tim Penyusun SOP | PJ Evaluator | 3 | |

| UC-09 | | Membuat Tanda Tangan Elektronik | PJ Evaluator, PJ Penyusun | 9 | Registrasi / ubah PIN TTE |

| UC-10 | **1** | Menandatangani Berita Acara | PJ Evaluator, PJ Penyusun | 17 | Dua tahap: PJ Evaluator lalu PJ Penyusun |

| UC-11 | **1** | Mengevaluasi SOP | Evaluator | 15 | Penilaian substansi SOP |

| UC-12 | | Membuat Komentar | Evaluator | 16 | `<<extend>>` Mengevaluasi SOP (opsional saat `PERLU_PERBAIKAN`) |

| UC-13 | **1** | Mengesahkan Dokumen SOP | Kepala OPD | 18 | Pengesahan massal SOP setelah BA |
* | Menyusun Draft SOP | PJ Penyusun, Penyusun | 10 | Bagian penyusunan draft |

| UC-16 | | Inisiasi Dokumen SOP | PJ Penyusun, Penyusun | 10 | Bagian pembuatan SOP/versi baru |

| UC-14 | **1** | Mengajukan Evaluasi SOP | PJ Penyusun | 12 | |

| UC-15 | **1*
| UC-17 | | Mengelola Pelaksana SOP | PJ Penyusun, Penyusun | 6 | |

| UC-18 | | Mengelola Peraturan SOP | PJ Penyusun, Penyusun | 5 | |

| UC-19 | | Melihat Arsip Publik SOP | Pengunjung | 22 | Tanpa login |

| UC-20 | | Memeriksa Pengesahan TTE | Pengunjung | 23 | Scan QR / tautan verifikasi |

| UC-21 | | Memverifikasi Tanda Tangan Digital | Pengunjung | 24 | Unggah PDF, cek signature PKCS#7 |



---



## Matriks aktor × use case (sesuai diagram)



| Aktor | Use case |

| :--- | :--- |

| **PJ Evaluator** | Login · Logout · Melihat List SOP · Melihat Hasil Penilaian OPD · Mengelola OPD · Mengelola Tim Evaluator · Mengelola Kepala OPD · Mengelola Tim Penyusun SOP · Membuat Tanda Tangan Elektronik · Menandatangani Berita Acara |

| **Evaluator** | Login · Logout · Melihat List SOP · Mengevaluasi SOP · Membuat Komentar *(extend)* |

| **Kepala OPD** | Login · Logout · Melihat List SOP · Mengesahkan Dokumen SOP |

| **PJ Penyusun** | Login · Logout · Melihat List SOP · Membuat Tanda Tangan Elektronik · Menandatangani Berita Acara · Mengajukan Evaluasi SOP · Menyusun Draft SOP · Inisiasi Dokumen SOP · Mengelola Pelaksana SOP · Mengelola Peraturan SOP |

| **Penyusun** | Login · Logout · Melihat List SOP · Menyusun Draft SOP · Inisiasi Dokumen SOP · Mengelola Pelaksana SOP · Mengelola Peraturan SOP |

| **Pengunjung** | Melihat Arsip Publik SOP · Memeriksa Pengesahan TTE · Memverifikasi Tanda Tangan Digital |



### Relasi `<<extend>>` pada diagram



```text

Mengevaluasi SOP ──<<extend>>── Membuat Komentar

```



Evaluator wajib mengevaluasi (UC-11); memberi komentar (UC-12) hanya diperlukan bila hasil `PERLU_PERBAIKAN`.



---



## 1. PJ Evaluator Organisasi



| ID | Use case |

| :---: | :--- |

| UC-01 | Login |

| UC-02 | Logout |

| UC-03 | Melihat List SOP |

| UC-04 | Melihat Hasil Penilaian OPD |

| UC-05 | Mengelola OPD |

| UC-06 | Mengelola Tim Evaluator |

| UC-07 | Mengelola Kepala OPD |

| UC-08 | Mengelola Tim Penyusun SOP |

| UC-09 | Membuat Tanda Tangan Elektronik |

| UC-10 | Menandatangani Berita Acara *(tahap PJ Evaluator)* |



---



## 2. Evaluator



| ID | Use case |

| :---: | :--- |

| UC-01 | Login |

| UC-02 | Logout |

| UC-03 | Melihat List SOP |

| UC-11 | Mengevaluasi SOP |

| UC-12 | Membuat Komentar *(extend, bila perlu)* |



> Evaluator **tidak** mengelola master OPD, membuat TTE, menandatangani Berita Acara, atau mengesahkan SOP.



---



## 3. Kepala OPD



| ID | Use case |

| :---: | :--- |

| UC-01 | Login |

| UC-02 | Logout |

| UC-03 | Melihat List SOP |

| UC-13 | Mengesahkan Dokumen SOP |



> Kepala OPD **tidak** menyusun draft, mengajukan evaluasi, atau menandatangani Berita Acara (sesuai diagram).



---



## 4. PJ Penyusun



| ID | Use case |

| :---: | :--- |

| UC-01 | Login |

| UC-02 | Logout |

| UC-03 | Melihat List SOP |

| UC-09 | Membuat Tanda Tangan Elektronik |

| UC-10 | Menandatangani Berita Acara *(tahap PJ Penyusun)* |

| UC-14 | Mengajukan Evaluasi SOP |

| UC-15 | Menyusun Draft SOP |

| UC-16 | Inisiasi Dokumen SOP |

| UC-17 | Mengelola Pelaksana SOP |

| UC-18 | Mengelola Peraturan SOP |



---



## 5. Penyusun



| ID | Use case |

| :---: | :--- |

| UC-01 | Login |

| UC-02 | Logout |

| UC-03 | Melihat List SOP |

| UC-15 | Menyusun Draft SOP |

| UC-16 | Inisiasi Dokumen SOP |

| UC-17 | Mengelola Pelaksana SOP |

| UC-18 | Mengelola Peraturan SOP |



> Penyusun **tidak** mengajukan evaluasi, membuat TTE, atau menandatangani Berita Acara (sesuai diagram).



---



## 6. Pengunjung (tanpa login)



| ID | Use case |

| :---: | :--- |

| UC-19 | Melihat Arsip Publik SOP |

| UC-20 | Memeriksa Pengesahan TTE |

| UC-21 | Memverifikasi Tanda Tangan Digital |



### Beda UC-20 dan UC-21



| Aspek | UC-20 — Memeriksa Pengesahan TTE | UC-21 — Memverifikasi Tanda Tangan Digital |

| :--- | :--- | :--- |

| **Objek** | Riwayat pengesahan di database aplikasi | Berkas PDF yang diunggah |

| **Cara** | Tautan / scan QR | Unggah PDF |

| **API** | `GET /tte/public/pengesahan/...` | `POST /tte/public/pdf/verify` |



---



## Kebutuhan fungsional di implementasi, di luar oval diagram



Fitur berikut ada di [`requirements.md`](requirements.md) dan `server/`, tetapi **tidak** digambarkan sebagai oval terpisah pada diagram UML:



| No | Nama fungsional | Keterangan |

| :---: | :--- | :--- |

| 8 | Perubahan Kata Sandi | Semua pengguna login |

| 11 | Penelusuran Riwayat Perubahan SOP | Workbench Penyusun / PJ Penyusun (log edit) |

| 13 | Pengajuan Ulang SOP Revisi | PJ Penyusun setelah revisi |

| 14 | Tindak Lanjut Hasil Evaluasi | Penyusun / PJ Penyusun |

| 19 | Pencabutan SOP | Kepala OPD — `POST /sop/cabut/:id` |

| 21 | Cetak dan Unduh Arsip Dokumen | Semua pengguna login |

**Catatan Kepala OPD:** pada diagram hanya UC-13 (*Mengesahkan Dokumen SOP* / No 18). Di requirements & implementasi, Kepala OPD juga No **9** (PIN TTE), **19** (pencabutan), **21** (cetak arsip) — tidak semua digambarkan sebagai oval.

---

## Pemetaan diagram ↔ requirements (referensi, bukan identitas)

| No | Nama fungsional (requirements) | Oval diagram |
| :---: | :--- | :--- |
| 1–4 | Pengelolaan master OPD, tim, kepala | UC-05 – UC-08 |
| 5–6 | Peraturan, pelaksana | UC-18, UC-17 |
| 7 | Login | UC-01 (+ UC-02 Logout) |
| 8 | Perubahan Kata Sandi | *(tanpa oval)* |
| 9 | Pengelolaan PIN TTE | UC-09 |
| 10 | Penyusunan dan Pengelolaan Draft SOP | UC-15 + UC-16 |
| 11 | Penelusuran Riwayat | *(tanpa oval)* |
| 12 | Pengajuan Evaluasi SOP | UC-14 |
| 13–14 | Pengajuan ulang, tindak lanjut | *(tanpa oval)* |
| 15–16 | Penilaian, catatan evaluasi | UC-11 + UC-12 *(extend)* |
| 17 | TTE Berita Acara | UC-10 |
| 18–19 | Pengesahan, pencabutan | UC-13; No 19 *(tanpa oval)* |
| 20 | Monitoring grafik | UC-04 |
| 21 | Cetak dan unduh arsip | *(tanpa oval)* |
| 22–24 | Arsip publik, verifikasi TTE/PDF | UC-19 – UC-21 |

---

## Urutan bisnis utama (evaluasi → pengesahan)

```text
Penyusun/PJ Penyusun: Inisiasi + Menyusun Draft (UC-16, UC-15) → menunggu pengajuan evaluasi
PJ Penyusun: Mengajukan Evaluasi (UC-14 / No 12)
Evaluator: Mengevaluasi + Komentar bila perlu (UC-11, UC-12 / No 15–16)
Penyusun/PJ Penyusun: tindak lanjut & pengajuan ulang (No 14, 13 — tanpa oval terpisah)
PJ Evaluator → PJ Penyusun: Menandatangani BA (UC-10 / No 17)
Kepala OPD: Mengesahkan Dokumen SOP (UC-13 / No 18)
Pengunjung: arsip publik & verifikasi (UC-19–UC-21 / No 22–24)
```




---

# Indeks Skenario Use Case

Folder ini berisi skenario per **oval diagram UML** pada [`../usecase.md`](../usecase.md). Daftar utama tetap mengikuti **21 use case (UC-01 sampai UC-21)**; kolom **No requirements** hanya penanda traceability ke [`../requirements.md`](../requirements.md), bukan identitas satu banding satu.

## Lima use case inti (core)

Alur bisnis utama sistem — dari penyusunan hingga SOP berlaku:

| Urut | UC | Use case | Berkas |
| :---: | :---: | :--- | :--- |
| 1 | UC-15 | Menyusun Draft SOP | [`menyusun-draft-sop.md`](menyusun-draft-sop.md) |
| 2 | UC-14 | Mengajukan Evaluasi SOP | [`mengajukan-evaluasi-sop.md`](mengajukan-evaluasi-sop.md) |
| 3 | UC-11 | Mengevaluasi SOP | [`mengevaluasi-sop.md`](mengevaluasi-sop.md) |
| 4 | UC-10 | Menandatangani Berita Acara (TTD BA) | [`menandatangani-berita-acara.md`](menandatangani-berita-acara.md) |
| 5 | UC-13 | Mengesahkan Dokumen SOP | [`mengesahkan-dokumen-sop.md`](mengesahkan-dokumen-sop.md) |

```text
Menyusun draft → Ajukan evaluasi → Evaluasi SOP → TTD BA → Pengesahan SOP → BERLAKU
```

Use case lain (master data, login, arsip publik, dll.) mendukung atau mengelilingi lima inti ini.

## Daftar skenario

| UC | Core | Use case diagram | Aktor pada diagram | No requirements | Berkas |
| :---: | :---: | :--- | :--- | :---: | :--- |
| UC-01 | | Login | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | 7 | [`login.md`](login.md) |
| UC-02 | | Logout | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | - | [`logout.md`](logout.md) |
| UC-03 | | Melihat List SOP | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | - | [`melihat-list-sop.md`](melihat-list-sop.md) |
| UC-04 | | Melihat Hasil Penilaian OPD | PJ Evaluator | 20 | [`melihat-hasil-penilaian-opd.md`](melihat-hasil-penilaian-opd.md) |
| UC-05 | | Mengelola OPD | PJ Evaluator | 1 | [`mengelola-opd.md`](mengelola-opd.md) |
| UC-06 | | Mengelola Tim Evaluator | PJ Evaluator | 2 | [`mengelola-tim-evaluator.md`](mengelola-tim-evaluator.md) |
| UC-07 | | Mengelola Kepala OPD | PJ Evaluator | 4 | [`mengelola-kepala-opd.md`](mengelola-kepala-opd.md) |
| UC-08 | | Mengelola Tim Penyusun SOP | PJ Evaluator | 3 | [`mengelola-tim-penyusun-sop.md`](mengelola-tim-penyusun-sop.md) |
| UC-09 | | Membuat Tanda Tangan Elektronik | PJ Evaluator, PJ Penyusun | 9 | [`membuat-tanda-tangan-elektronik.md`](membuat-tanda-tangan-elektronik.md) |
| UC-10 | **1** | Menandatangani Berita Acara | PJ Evaluator, PJ Penyusun | 17 | [`menandatangani-berita-acara.md`](menandatangani-berita-acara.md) |
| UC-11 | **1** | Mengevaluasi SOP | Evaluator | 15 | [`mengevaluasi-sop.md`](mengevaluasi-sop.md) |
| UC-12 | | Membuat Komentar | Evaluator | 16 | [`membuat-komentar.md`](membuat-komentar.md) |
| UC-13 | **1** | Mengesahkan Dokumen SOP | Kepala OPD | 18 | [`mengesahkan-dokumen-sop.md`](mengesahkan-dokumen-sop.md) |
| UC-14 | **1** | Mengajukan Evaluasi SOP | PJ Penyusun | 12 | [`mengajukan-evaluasi-sop.md`](mengajukan-evaluasi-sop.md) |
| UC-15 | **1** | Menyusun Draft SOP | PJ Penyusun, Penyusun | 10 | [`menyusun-draft-sop.md`](menyusun-draft-sop.md) |
| UC-16 | | Inisiasi Dokumen SOP | PJ Penyusun, Penyusun | 10 | [`inisiasi-dokumen-sop.md`](inisiasi-dokumen-sop.md) |
| UC-17 | | Mengelola Pelaksana SOP | PJ Penyusun, Penyusun | 6 | [`mengelola-pelaksana-sop.md`](mengelola-pelaksana-sop.md) |
| UC-18 | | Mengelola Peraturan SOP | PJ Penyusun, Penyusun | 5 | [`mengelola-peraturan-sop.md`](mengelola-peraturan-sop.md) |
| UC-19 | | Melihat Arsip Publik SOP | Pengunjung | 22 | [`melihat-arsip-publik-sop.md`](melihat-arsip-publik-sop.md) |
| UC-20 | | Memeriksa Pengesahan TTE | Pengunjung | 23 | [`memeriksa-pengesahan-tte.md`](memeriksa-pengesahan-tte.md) |
| UC-21 | | Memverifikasi Tanda Tangan Digital | Pengunjung | 24 | [`memverifikasi-tanda-tangan-digital.md`](memverifikasi-tanda-tangan-digital.md) |

Kolom **Core**: `1` = termasuk lima use case inti; kosong = pendukung.

## Relasi diagram

| Relasi | Makna |
| :--- | :--- |
| UC-12 `<<extend>>` UC-11 | Komentar dibuat oleh Evaluator saat hasil evaluasi membutuhkan perbaikan. |

## Kebutuhan fungsional tanpa oval diagram

Fitur berikut tetap ada di requirements dan implementasi, tetapi tidak dibuat sebagai skenario terpisah karena tidak digambar sebagai oval pada [`../usecase.md`](../usecase.md).

| No | Nama fungsional |
| :---: | :--- |
| 8 | Perubahan Kata Sandi |
| 11 | Penelusuran Riwayat Perubahan SOP |
| 13 | Pengajuan Ulang SOP Revisi |
| 14 | Tindak Lanjut Hasil Evaluasi |
| 19 | Pencabutan SOP |
| 21 | Cetak dan Unduh Arsip Dokumen |





---

# Skenario UC-16: Inisiasi Dokumen SOP

Dokumen ini merinci use case **Inisiasi Dokumen SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-16 |
| Use case diagram | Inisiasi Dokumen SOP |
| No requirements | 10 |
| Nama fungsional requirements | Penyusunan dan Pengelolaan Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem katalog dan versi SOP |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Aktor memiliki akses pada OPD tempat SOP dibuat.

## Pemicu

Aktor membuat SOP baru atau versi baru dari SOP yang sudah berlaku.

## Alur utama

1. Aktor memilih aksi buat SOP baru.
2. Sistem menampilkan formulir inisiasi dokumen.
3. Aktor mengisi data awal, seperti judul, nomor, OPD, dan metadata yang diperlukan.
4. Sistem memvalidasi data wajib dan keunikan nomor SOP.
5. Sistem membuat entitas SOP dan detail versi awal.
6. Sistem menetapkan status awal sebagai draft.
7. Sistem membuka workbench agar aktor dapat melanjutkan UC-15 Menyusun Draft SOP.

## Alur alternatif

- Jika nomor SOP sudah digunakan, sistem menolak pembuatan.
- Jika aktor membuat versi baru dari SOP berlaku, sistem menyalin data relevan dari versi lama dan membuat draft versi berikutnya.
- Jika data wajib belum lengkap, sistem menolak inisiasi.

## Hasil akhir

Wadah dokumen SOP tersedia sebagai draft untuk disusun lebih lanjut.





---

# Skenario UC-01: Login

Dokumen ini merinci use case **Login** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-01 |
| Use case diagram | Login |
| No requirements | 7 |
| Nama fungsional requirements | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem autentikasi dan manajemen sesi |

## Prasyarat

- Akun pengguna sudah terdaftar dan belum dinonaktifkan.
- Pengguna berada pada halaman masuk sistem.

## Pemicu

Pengguna ingin mengakses fitur internal sesuai peran.

## Alur utama

1. Pengguna mengisi identitas akun dan kata sandi.
2. Sistem memvalidasi format masukan.
3. Sistem mencari akun pengguna yang masih aktif.
4. Sistem memverifikasi kata sandi terhadap hash yang tersimpan.
5. Sistem memuat peran dan ruang lingkup akses pengguna.
6. Sistem menerbitkan sesi autentikasi.
7. Sistem mengarahkan pengguna ke dashboard sesuai peran.

## Alur alternatif

- Jika kredensial salah, sistem menolak login dan menampilkan pesan kegagalan.
- Jika akun sudah dinonaktifkan, sistem menolak akses.
- Jika sesi lama masih ada, sistem dapat memperbarui sesi yang valid.

## Hasil akhir

Pengguna memiliki sesi aktif dan dapat mengakses use case internal yang diizinkan oleh perannya.





---

# Skenario UC-02: Logout

Dokumen ini merinci use case **Logout** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-02 |
| Use case diagram | Logout |
| No requirements | Tidak ada oval requirements tersendiri; pendukung No 7 |
| Nama fungsional requirements | Login |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem autentikasi dan manajemen sesi |

## Prasyarat

- Pengguna sudah login.
- Sesi pengguna masih tercatat pada aplikasi.

## Pemicu

Pengguna memilih aksi keluar dari sistem.

## Alur utama

1. Pengguna menekan menu logout.
2. Sistem menghapus atau membatalkan token sesi pada sisi klien dan/atau server.
3. Sistem membersihkan konteks pengguna aktif.
4. Sistem mengarahkan pengguna ke halaman publik atau halaman login.

## Alur alternatif

- Jika sesi sudah kedaluwarsa, sistem tetap membersihkan konteks lokal dan mengarahkan pengguna keluar dari area internal.

## Hasil akhir

Sesi internal pengguna berakhir dan fitur privat tidak dapat diakses tanpa login ulang.





---

# Skenario UC-19: Melihat Arsip Publik SOP

Dokumen ini merinci use case **Melihat Arsip Publik SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-19 |
| Use case diagram | Melihat Arsip Publik SOP |
| No requirements | 22 |
| Nama fungsional requirements | Akses Arsip Publik SOP |
| Aktor utama | Pengunjung |
| Aktor terlibat | Sistem arsip publik SOP |

## Prasyarat

- SOP sudah berstatus berlaku dan tersedia untuk publik.
- Pengunjung tidak perlu login.

## Pemicu

Pengunjung membuka halaman arsip publik SOP.

## Alur utama

1. Pengunjung membuka halaman arsip publik.
2. Sistem menampilkan daftar SOP berlaku yang dapat diakses publik.
3. Pengunjung mencari atau memfilter daftar SOP.
4. Sistem menampilkan hasil pencarian.
5. Pengunjung membuka detail atau pratinjau dokumen SOP.
6. Sistem menampilkan informasi dokumen sesuai data arsip publik.

## Alur alternatif

- Jika tidak ada SOP yang cocok dengan pencarian, sistem menampilkan hasil kosong.
- Jika SOP tidak berstatus publik atau tidak berlaku, sistem tidak menampilkannya pada arsip publik.

## Hasil akhir

Pengunjung dapat melihat SOP yang sudah berlaku tanpa login.





---

# Skenario UC-04: Melihat Hasil Penilaian OPD

Dokumen ini merinci use case **Melihat Hasil Penilaian OPD** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-04 |
| Use case diagram | Melihat Hasil Penilaian OPD |
| No requirements | 20 |
| Nama fungsional requirements | Monitoring Grafik Evaluasi |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem laporan evaluasi |

## Prasyarat

- PJ Evaluator sudah login.
- Sistem memiliki data pengajuan evaluasi dan hasil penilaian.

## Pemicu

PJ Evaluator membuka dashboard monitoring hasil evaluasi OPD.

## Alur utama

1. PJ Evaluator membuka halaman laporan atau grafik evaluasi.
2. Sistem mengambil data evaluasi berdasarkan periode dan filter yang dipilih.
3. Sistem menghitung atau memuat rekap nilai OPD.
4. Sistem menampilkan grafik, tabel, atau ringkasan status evaluasi.
5. PJ Evaluator meninjau hasil untuk memantau capaian evaluasi SOP tiap OPD.

## Alur alternatif

- Jika belum ada data evaluasi, sistem menampilkan daftar kosong atau pesan belum tersedia.
- Jika filter tidak menghasilkan data, sistem menampilkan hasil kosong tanpa mengubah data.

## Hasil akhir

PJ Evaluator memperoleh informasi monitoring hasil penilaian OPD.





---

# Skenario UC-03: Melihat List SOP

Dokumen ini merinci use case **Melihat List SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-03 |
| Use case diagram | Melihat List SOP |
| No requirements | Tidak ada baris requirements tersendiri |
| Nama fungsional requirements | Navigasi daftar dan monitoring SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem katalog SOP |

## Prasyarat

- Pengguna sudah login.
- Pengguna memiliki hak akses terhadap daftar SOP sesuai perannya.

## Pemicu

Pengguna membuka menu daftar, dashboard, atau workbench SOP.

## Alur utama

1. Pengguna membuka halaman daftar SOP.
2. Sistem membaca peran dan `opdId` dari sesi pengguna.
3. Sistem mengambil daftar SOP yang sesuai ruang lingkup akses.
4. Sistem menampilkan informasi ringkas, seperti judul, nomor, OPD, versi, dan status.
5. Pengguna memilih salah satu SOP untuk melihat detail atau melanjutkan pekerjaan sesuai kewenangan.

## Alur alternatif

- Jika daftar kosong, sistem menampilkan keadaan kosong yang sesuai konteks peran.
- Jika pengguna tidak berwenang melihat SOP tertentu, sistem tidak memasukkan SOP tersebut ke daftar atau menolak akses detail.

## Hasil akhir

Pengguna mendapatkan visibilitas terhadap SOP yang relevan sebagai titik masuk ke use case lanjutan.





---

# Skenario UC-12: Membuat Komentar

Dokumen ini merinci use case **Membuat Komentar** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-12 |
| Use case diagram | Membuat Komentar |
| No requirements | 16 |
| Nama fungsional requirements | Pengelolaan Catatan Evaluasi |
| Aktor utama | Evaluator |
| Aktor terlibat | Sistem evaluasi SOP |
| Relasi diagram | `<<extend>>` dari UC-11 Mengevaluasi SOP |

## Prasyarat

- Evaluator sedang melakukan UC-11.
- SOP yang dinilai membutuhkan perbaikan.

## Pemicu

Evaluator memilih hasil evaluasi yang membutuhkan catatan perbaikan.

## Alur utama

1. Evaluator memilih hasil penilaian perlu perbaikan.
2. Sistem menampilkan kolom komentar atau catatan evaluasi.
3. Evaluator menulis catatan yang menjelaskan bagian yang harus diperbaiki.
4. Sistem memvalidasi bahwa catatan tidak kosong.
5. Sistem menyimpan catatan pada hasil evaluasi.
6. Sistem menandai tindak lanjut agar SOP dapat diperbaiki oleh Penyusun atau PJ Penyusun.

## Alur alternatif

- Jika catatan kosong, sistem menolak penyimpanan.
- Jika evaluator mengubah hasil menjadi sesuai, sistem menutup atau membersihkan catatan sesuai aturan evaluasi.

## Hasil akhir

Catatan evaluasi tersimpan sebagai dasar tindak lanjut perbaikan SOP.





---

# Skenario UC-09: Membuat Tanda Tangan Elektronik

Dokumen ini merinci use case **Membuat Tanda Tangan Elektronik** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-09 |
| Use case diagram | Membuat Tanda Tangan Elektronik |
| No requirements | 9 |
| Nama fungsional requirements | Pengelolaan PIN TTE |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Aktor terlibat | Sistem TTE dan keamanan kredensial |

## Prasyarat

- Aktor sudah login sebagai peran yang berwenang pada diagram.
- Aktor belum memiliki PIN TTE atau ingin memperbarui PIN.

## Pemicu

Aktor membuka fitur pengaturan tanda tangan elektronik.

## Alur utama

1. Aktor membuka halaman profil atau pengaturan TTE.
2. Sistem menampilkan formulir pembuatan atau perubahan PIN TTE.
3. Aktor mengisi PIN dan konfirmasi PIN.
4. Sistem memvalidasi format dan kecocokan konfirmasi.
5. Sistem menyimpan hash PIN TTE, bukan nilai PIN asli.
6. Sistem menandai bahwa aktor sudah memiliki kredensial TTE.

## Alur alternatif

- Jika konfirmasi PIN tidak cocok, sistem menolak penyimpanan.
- Jika aktor mengubah PIN lama, sistem dapat meminta PIN lama untuk verifikasi.

## Hasil akhir

Aktor memiliki kredensial TTE yang dapat digunakan pada penandatanganan sesuai kewenangan.

## Catatan traceability

Requirements No 9 juga mencakup Kepala OPD, tetapi pada diagram di [`../usecase.md`](../usecase.md) oval UC-09 hanya dihubungkan ke PJ Evaluator dan PJ Penyusun.





---

# Skenario UC-20: Memeriksa Pengesahan TTE

Dokumen ini merinci use case **Memeriksa Pengesahan TTE** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-20 |
| Use case diagram | Memeriksa Pengesahan TTE |
| No requirements | 23 |
| Nama fungsional requirements | Verifikasi Pengesahan TTE |
| Aktor utama | Pengunjung |
| Aktor terlibat | Sistem verifikasi pengesahan TTE |

## Prasyarat

- Dokumen memiliki riwayat pengesahan TTE di sistem.
- Pengunjung memiliki tautan, kode, atau QR verifikasi.

## Pemicu

Pengunjung membuka tautan verifikasi atau memindai QR pada dokumen SOP.

## Alur utama

1. Pengunjung membuka halaman verifikasi pengesahan TTE.
2. Sistem menerima kode atau parameter verifikasi.
3. Sistem mencari riwayat pengesahan pada database aplikasi.
4. Sistem memvalidasi bahwa data pengesahan cocok dengan dokumen terkait.
5. Sistem menampilkan status pengesahan, identitas penandatangan sesuai kebijakan, waktu pengesahan, dan status dokumen.

## Alur alternatif

- Jika kode verifikasi tidak ditemukan, sistem menampilkan status tidak valid atau tidak ditemukan.
- Jika dokumen sudah dicabut atau digantikan, sistem menampilkan status terkini agar pengunjung tidak salah menggunakan dokumen lama.

## Hasil akhir

Pengunjung mengetahui apakah pengesahan TTE pada dokumen tercatat valid di sistem.





---

# Skenario UC-21: Memverifikasi PDF Unduhan dan QR Pengesahan

Dokumen ini merinci verifikasi dokumen PDF yang diunduh setelah pengesahan TTE, terkait UC-20 (Memeriksa Pengesahan TTE) dan integration test IT-76–IT-81.

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-21 |
| Nama | Memverifikasi PDF unduhan dan QR pengesahan |
| Aktor utama | Pengunjung / pemeriksa dokumen |
| Aktor terlibat | Sistem verifikasi TTE, CA internal penandatanganan PDF |

## Prasyarat

- Dokumen sudah melalui alur TTE di aplikasi (riwayat penandatangan tercatat).
- Server mengaktifkan `PDF_SIGNING_ENABLED` dengan rantai sertifikat P12 internal.
- PDF unduhan memuat QR menuju `/validasi/pengesahan/{dokumenTteId}/{userId}`.

## Pemicu

Pengunjung memindai QR pada PDF atau mengunggah PDF bertanda tangan ke halaman verifikasi PDF publik.

## Alur utama — QR penandatangan

1. Pengunjung memindai QR pada PDF (Berita Acara atau SOP).
2. Browser membuka halaman validasi pengesahan dengan `dokumenTteId` dan `userId` penandatangan.
3. Sistem memanggil `GET /tte/public/pengesahan/:dokumenTteId/:userId`.
4. Sistem menampilkan identitas penandatangan, peran, waktu pengesahan, dan ringkasan dokumen.

## Alur utama — PDF + CA internal

1. Pengunjung mengunggah PDF yang diunduh setelah penandatanganan server (PKCS#7).
2. Sistem memanggil `POST /tte/public/pdf/verify` dengan berkas PDF (base64).
3. Sistem memverifikasi digest dan rantai sertifikat terhadap CA internal yang dikonfigurasi di server.
4. Sistem menampilkan status valid/tidak valid per tanda tangan beserta subjek penandatangan.

## Alur alternatif

- Jika pasangan `(dokumenTteId, userId)` tidak ada di riwayat TTE, API pengesahan mengembalikan tidak ditemukan (404).
- Jika PDF tidak memuat tanda tangan digital, verifikasi PDF menyatakan `hasSignatures: false` dan `allValid: false`.
- Jika penandatanganan PDF server nonaktif, unduhan tetap berisi QR aplikasi; verifikasi PKCS#7 tidak tersedia.

## Hasil akhir

Pengunjung dapat membuktikan bahwa QR mengarah ke penandatangan yang tercatat di sistem, dan bahwa PDF unduhan memuat tanda tangan digital yang valid menurut CA internal aplikasi (bukan pengganti portal BSrE/Komdigi).

## Pemetaan integration test

| ID | Skenario |
| :--- | :--- |
| IT-76 | QR BA → pengesahan publik PJ Evaluator |
| IT-77 | QR SOP → pengesahan publik Kepala OPD |
| IT-78 | Sign + verify PDF SOP |
| IT-79 | Sign + verify PDF Berita Acara arsip |
| IT-80 | PDF unsigned ditolak |
| IT-81 | userId salah pada pengesahan publik |




---

# Skenario UC-21: Memverifikasi Tanda Tangan Digital

Dokumen ini merinci use case **Memverifikasi Tanda Tangan Digital** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-21 |
| Use case diagram | Memverifikasi Tanda Tangan Digital |
| No requirements | 24 |
| Nama fungsional requirements | Verifikasi Tanda Tangan PDF |
| Aktor utama | Pengunjung |
| Aktor terlibat | Sistem verifikasi PDF |

## Prasyarat

- Pengunjung memiliki berkas PDF yang akan diverifikasi.
- Fitur verifikasi PDF tersedia pada sistem.

## Pemicu

Pengunjung mengunggah PDF untuk mengecek validitas tanda tangan digital.

## Alur utama

1. Pengunjung membuka halaman verifikasi tanda tangan digital.
2. Pengunjung memilih dan mengunggah berkas PDF.
3. Sistem memvalidasi format dan ukuran berkas.
4. Sistem memeriksa tanda tangan digital pada PDF.
5. Sistem menampilkan hasil verifikasi, termasuk status validitas dan informasi tanda tangan yang dapat dibaca.

## Alur alternatif

- Jika berkas bukan PDF, sistem menolak unggahan.
- Jika PDF tidak memiliki tanda tangan digital, sistem menampilkan status tidak ditemukan.
- Jika tanda tangan tidak valid, sistem menampilkan status gagal verifikasi.

## Hasil akhir

Pengunjung memperoleh hasil validasi tanda tangan digital PDF.





---

# Skenario UC-10: Menandatangani Berita Acara

**Use case inti (core)** — urutan 4 dari 5 alur bisnis utama (TTD BA).

Dokumen ini merinci use case **Menandatangani Berita Acara** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-10 |
| Core | Ya (4/5 — TTD BA) |
| Use case diagram | Menandatangani Berita Acara |
| No requirements | 17 |
| Nama fungsional requirements | Tanda Tangan Berita Acara Evaluasi |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Aktor terlibat | Sistem TTE dan pengajuan evaluasi |

## Prasyarat

- Pengajuan evaluasi sudah selesai dinilai oleh evaluator.
- Aktor yang menandatangani sudah memiliki PIN TTE.
- Tahapan tanda tangan mengikuti urutan PJ Evaluator lalu PJ Penyusun.

## Pemicu

Pengajuan evaluasi perlu disahkan secara administratif melalui berita acara.

## Alur utama

1. PJ Evaluator membuka daftar pengajuan yang siap ditandatangani.
2. PJ Evaluator memilih pengajuan dan memasukkan PIN TTE.
3. Sistem memvalidasi PIN dan status pengajuan.
4. Sistem mencatat tanda tangan PJ Evaluator pada berita acara.
5. Sistem mengubah status pengajuan menjadi diverifikasi PJ Evaluator.
6. PJ Penyusun membuka pengajuan yang sudah ditandatangani PJ Evaluator.
7. PJ Penyusun memasukkan PIN TTE.
8. Sistem mencatat tanda tangan PJ Penyusun, mengubah status pengajuan menjadi ditandatangani PJ Penyusun, dan mengubah status SOP menjadi diverifikasi PJ Evaluator Organisasi.

## Alur alternatif

- Jika PIN salah, sistem menolak tanda tangan dan tidak mengubah status.
- Jika urutan tanda tangan tidak sesuai, sistem menolak aksi.
- Jika aktor yang sama mencoba menandatangani dua kali untuk peran yang sama, sistem menolak duplikasi.

## Hasil akhir

Berita acara evaluasi ditandatangani oleh pihak yang berwenang dan pengajuan dapat berlanjut ke pengesahan dokumen SOP.





---

# Skenario UC-14: Mengajukan Evaluasi SOP

**Use case inti (core)** — urutan 2 dari 5 alur bisnis utama.

Dokumen ini merinci use case **Mengajukan Evaluasi SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-14 |
| Core | Ya (2/5 — Ajukan evaluasi) |
| Use case diagram | Mengajukan Evaluasi SOP |************
| No requirements | 12 |
| Nama fungsional requirements | Pengajuan Evaluasi SOP |
| Aktor utama | PJ Penyusun |
| Aktor terlibat | Sistem pengajuan evaluasi |

## Prasyarat

- PJ Penyusun sudah login.
- Terdapat minimal satu SOP pada OPD yang menunggu pengajuan evaluasi.
- Tidak ada pengajuan aktif yang melanggar aturan proses berjalan.

## Pemicu

PJ Penyusun ingin menyerahkan SOP kepada evaluator untuk dinilai.

## Alur utama

1. PJ Penyusun membuka menu pengajuan evaluasi.
2. Sistem menampilkan SOP yang memenuhi syarat untuk diajukan.
3. PJ Penyusun memilih SOP yang akan dimasukkan ke pengajuan.
4. PJ Penyusun mengisi informasi pengajuan yang dibutuhkan.
5. Sistem memvalidasi status SOP, kepemilikan OPD, dan aturan pengajuan aktif.
6. Sistem membuat pengajuan dengan status sedang dievaluasi.
7. Sistem mengubah status SOP yang diajukan menjadi sedang dievaluasi.

## Alur alternatif

- Jika ada SOP yang belum menunggu pengajuan evaluasi, sistem menolak SOP tersebut dari pengajuan.
- Jika OPD masih memiliki pengajuan aktif, sistem menolak pembuatan pengajuan baru.
- Jika daftar SOP kosong, sistem menampilkan bahwa belum ada SOP yang dapat diajukan.

## Hasil akhir

Pengajuan evaluasi tercatat dan SOP terkait masuk ke proses evaluasi.





---

# Skenario UC-07: Mengelola Kepala OPD

Dokumen ini merinci use case **Mengelola Kepala OPD** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-07 |
| Use case diagram | Mengelola Kepala OPD |
| No requirements | 4 |
| Nama fungsional requirements | Pengelolaan Kepala OPD |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem pengelolaan pengguna dan OPD |

## Prasyarat

- PJ Evaluator sudah login.
- OPD tujuan sudah terdaftar.

## Pemicu

PJ Evaluator perlu menetapkan atau memperbarui Kepala OPD aktif.

## Alur utama

1. PJ Evaluator membuka menu Kepala OPD.
2. Sistem menampilkan daftar Kepala OPD dan OPD terkait.
3. PJ Evaluator memilih OPD dan mengisi data Kepala OPD.
4. Sistem memvalidasi identitas akun dan OPD tujuan.
5. Sistem memastikan aturan satu Kepala OPD aktif untuk satu OPD.
6. Sistem menyimpan data Kepala OPD.
7. Sistem menampilkan status Kepala OPD terbaru.

## Alur alternatif

- Jika OPD sudah memiliki Kepala OPD aktif, sistem menolak penambahan sampai data lama dinonaktifkan atau diganti sesuai aturan.
- Jika identitas akun duplikat, sistem menolak penyimpanan.

## Hasil akhir

Kepala OPD aktif tercatat sebagai pihak yang berwenang pada use case pengesahan dokumen SOP.





---

# Skenario UC-05: Mengelola OPD

Dokumen ini merinci use case **Mengelola OPD** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-05 |
| Use case diagram | Mengelola OPD |
| No requirements | 1 |
| Nama fungsional requirements | Pengelolaan Data OPD |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem master data OPD |

## Prasyarat

- PJ Evaluator sudah login.
- Data yang dimasukkan mengikuti ketentuan validasi master OPD.

## Pemicu

PJ Evaluator perlu menambah, mengubah, atau menonaktifkan data OPD.

## Alur utama

1. PJ Evaluator membuka menu pengelolaan OPD.
2. Sistem menampilkan daftar OPD yang sudah terdaftar.
3. PJ Evaluator memilih aksi tambah atau ubah.
4. PJ Evaluator mengisi data OPD.
5. Sistem memvalidasi kelengkapan dan potensi duplikasi.
6. Sistem menyimpan perubahan.
7. Sistem memperbarui daftar OPD.

## Alur alternatif

- Jika data wajib belum lengkap, sistem menolak penyimpanan.
- Jika OPD dinonaktifkan, sistem melakukan soft-delete agar riwayat relasi tetap utuh.

## Hasil akhir

Data master OPD tersimpan secara konsisten dan dapat digunakan oleh use case lain.





---

# Skenario UC-17: Mengelola Pelaksana SOP

Dokumen ini merinci use case **Mengelola Pelaksana SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-17 |
| Use case diagram | Mengelola Pelaksana SOP |
| No requirements | 6 |
| Nama fungsional requirements | Pengelolaan Data Pelaksana SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem master pelaksana SOP |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Aktor berada dalam ruang lingkup OPD yang dikelola.

## Pemicu

Aktor perlu menambah, memperbarui, atau menggunakan data pelaksana pada SOP.

## Alur utama

1. Aktor membuka menu pelaksana SOP atau panel pelaksana pada workbench SOP.
2. Sistem menampilkan daftar pelaksana pada OPD.
3. Aktor menambah atau mengubah data pelaksana.
4. Sistem memvalidasi data pelaksana.
5. Sistem menyimpan data master pelaksana.
6. Jika digunakan pada SOP, aktor menautkan pelaksana ke dokumen atau langkah SOP.
7. Sistem menyimpan relasi pelaksana dengan SOP.

## Alur alternatif

- Jika pelaksana sudah digunakan pada dokumen yang tidak boleh diubah, sistem dapat menolak penghapusan.
- Jika data pelaksana duplikat atau kosong, sistem menolak penyimpanan.

## Hasil akhir

Data pelaksana SOP tersedia dan dapat digunakan dalam penyusunan langkah atau diagram SOP.





---

# Skenario UC-18: Mengelola Peraturan SOP

Dokumen ini merinci use case **Mengelola Peraturan SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-18 |
| Use case diagram | Mengelola Peraturan SOP |
| No requirements | 5 |
| Nama fungsional requirements | Pengelolaan Peraturan OPD |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem master peraturan |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Aktor memiliki akses pada OPD terkait.

## Pemicu

Aktor perlu mencatat dasar hukum atau peraturan yang digunakan pada SOP.

## Alur utama

1. Aktor membuka menu peraturan atau tab dasar hukum pada workbench SOP.
2. Sistem menampilkan daftar peraturan yang tersedia untuk OPD.
3. Aktor menambah data peraturan atau memilih peraturan yang sudah ada.
4. Sistem memvalidasi nomor, tahun, dan data pendukung peraturan.
5. Sistem menyimpan data peraturan atau menautkan peraturan yang sudah tersedia.
6. Jika dalam konteks SOP, sistem menghubungkan peraturan sebagai dasar hukum SOP.

## Alur alternatif

- Jika peraturan dengan nomor dan tahun yang sama sudah ada, sistem menggunakan data yang ada dan menambahkan relasi OPD bila diperlukan.
- Jika data wajib tidak lengkap, sistem menolak penyimpanan.

## Hasil akhir

Dasar hukum SOP tercatat dan dapat digunakan dalam dokumen SOP.





---

# Skenario UC-06: Mengelola Tim Evaluator

Dokumen ini merinci use case **Mengelola Tim Evaluator** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-06 |
| Use case diagram | Mengelola Tim Evaluator |
| No requirements | 2 |
| Nama fungsional requirements | Pengelolaan Tim Evaluator |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem pengelolaan pengguna |

## Prasyarat

- PJ Evaluator sudah login.
- Data OPD atau unit evaluator yang diperlukan sudah tersedia.

## Pemicu

PJ Evaluator perlu menambah, memperbarui, atau menonaktifkan akun evaluator.

## Alur utama

1. PJ Evaluator membuka menu tim evaluator.
2. Sistem menampilkan daftar evaluator aktif dan nonaktif sesuai kebijakan tampilan.
3. PJ Evaluator memilih tambah atau ubah evaluator.
4. PJ Evaluator mengisi data akun, identitas, dan penugasan.
5. Sistem memvalidasi peran evaluator dan keunikan identitas akun.
6. Sistem menyimpan data pengguna.
7. Sistem menampilkan daftar tim evaluator terbaru.

## Alur alternatif

- Jika email atau NIP sudah digunakan, sistem menolak penyimpanan.
- Jika evaluator dinonaktifkan, sistem mempertahankan riwayat evaluasi lama.

## Hasil akhir

Tim evaluator tercatat dan siap digunakan dalam proses evaluasi SOP.





---

# Skenario UC-08: Mengelola Tim Penyusun SOP

Dokumen ini merinci use case **Mengelola Tim Penyusun SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-08 |
| Use case diagram | Mengelola Tim Penyusun SOP |
| No requirements | 3 |
| Nama fungsional requirements | Pengelolaan Tim Penyusun SOP |
| Aktor utama | PJ Evaluator |
| Aktor terlibat | Sistem pengelolaan pengguna dan OPD |

## Prasyarat

- PJ Evaluator sudah login.
- OPD tujuan sudah terdaftar.

## Pemicu

PJ Evaluator perlu mengatur akun PJ Penyusun atau Penyusun pada OPD.

## Alur utama

1. PJ Evaluator membuka menu tim penyusun SOP.
2. Sistem menampilkan daftar akun penyusun per OPD.
3. PJ Evaluator memilih tambah atau ubah akun.
4. PJ Evaluator mengisi identitas, peran, dan OPD penugasan.
5. Sistem memvalidasi keunikan akun dan aturan peran.
6. Jika peran adalah PJ Penyusun, sistem memastikan OPD tidak memiliki PJ Penyusun aktif lain.
7. Sistem menyimpan data akun dan riwayat penugasan.

## Alur alternatif

- Jika terjadi mutasi OPD, sistem memperbarui penugasan aktif dan menyimpan riwayat.
- Jika aturan satu PJ Penyusun aktif dilanggar, sistem menolak perubahan.

## Hasil akhir

Tim penyusun SOP pada OPD tercatat dan dapat mengakses use case penyusunan sesuai peran.





---

# Skenario UC-13: Mengesahkan Dokumen SOP

**Use case inti (core)** — urutan 5 dari 5 alur bisnis utama (Pengesahan SOP).

Dokumen ini merinci use case **Mengesahkan Dokumen SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-13 |
| Core | Ya (5/5 — Pengesahan SOP) |
| Use case diagram | Mengesahkan Dokumen SOP |
| No requirements | 18 |
| Nama fungsional requirements | Pengesahan SOP |
| Aktor utama | Kepala OPD |
| Aktor terlibat | Sistem TTE dan arsip SOP |

## Prasyarat

- Kepala OPD sudah login.
- Pengajuan sudah melewati evaluasi dan berita acara sudah ditandatangani sesuai tahapan.
- Kepala OPD memiliki PIN TTE sesuai kebutuhan pengesahan.

## Pemicu

Kepala OPD memilih aksi pengesahan pada dokumen SOP yang siap diberlakukan.

## Alur utama

1. Kepala OPD membuka daftar dokumen atau pengajuan yang siap disahkan.
2. Sistem menampilkan detail SOP dan status pra-pengesahan.
3. Kepala OPD memilih aksi pengesahan.
4. Kepala OPD memasukkan PIN TTE.
5. Sistem memvalidasi PIN, kewenangan OPD, dan status dokumen.
6. Sistem mencatat riwayat tanda tangan pengesahan.
7. Sistem mengubah status SOP menjadi berlaku dan memperbarui arsip publik.
8. Sistem mengubah status pengajuan menjadi selesai.

## Alur alternatif

- Jika PIN salah, sistem menolak pengesahan.
- Jika status dokumen belum memenuhi prasyarat, sistem menolak aksi.
- Jika terdapat versi SOP lama yang masih berlaku, sistem menandai versi lama sesuai aturan pergantian versi.

## Hasil akhir

Dokumen SOP sah, berstatus berlaku, dan dapat tersedia pada arsip publik sesuai kebijakan sistem.





---

# Skenario UC-11: Mengevaluasi SOP

**Use case inti (core)** — urutan 3 dari 5 alur bisnis utama.

Dokumen ini merinci use case **Mengevaluasi SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-11 |
| Core | Ya (3/5 — Evaluasi SOP) |
| Use case diagram | Mengevaluasi SOP |
| No requirements | 15 |
| Nama fungsional requirements | Penilaian Substansi SOP |
| Aktor utama | Evaluator |
| Aktor terlibat | Sistem evaluasi SOP |

## Prasyarat

- Evaluator sudah login.
- Terdapat pengajuan evaluasi berisi SOP yang sedang dievaluasi.

## Pemicu

Evaluator membuka workbench evaluasi untuk menilai substansi SOP.

## Alur utama

1. Evaluator memilih pengajuan evaluasi.
2. Sistem menampilkan daftar SOP di dalam pengajuan.
3. Evaluator membuka detail SOP dan memeriksa substansi dokumen.
4. Evaluator memberikan hasil penilaian untuk SOP.
5. Sistem menyimpan nilai evaluasi dan audit perubahan.
6. Setelah seluruh SOP memenuhi kriteria, evaluator menyelesaikan evaluasi pengajuan.
7. Sistem mengubah status pengajuan menjadi selesai dievaluasi.

## Alur alternatif

- Jika SOP belum sesuai, evaluator memilih hasil perlu perbaikan dan UC-12 **Membuat Komentar** berjalan sebagai `<<extend>>`.
- Jika terjadi konflik versi penilaian, sistem menolak pembaruan agar perubahan evaluator lain tidak tertimpa.
- Jika belum semua SOP sesuai, sistem menolak penyelesaian pengajuan.

## Hasil akhir

Hasil penilaian substansi tersimpan dan pengajuan dapat dilanjutkan jika seluruh SOP sudah sesuai.





---

# Skenario UC-15: Menyusun Draft SOP

**Use case inti (core)** — urutan 1 dari 5 alur bisnis utama.

Dokumen ini merinci use case **Menyusun Draft SOP** sesuai [`../usecase.md`](../usecase.md).

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-15 |
| Core | Ya (1/5 — Menyusun draft SOP) |
| Use case diagram | Menyusun Draft SOP |
| No requirements | 10 |
| Nama fungsional requirements | Penyusunan dan Pengelolaan Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Aktor terlibat | Sistem penyusunan SOP |

## Prasyarat

- Aktor sudah login sebagai PJ Penyusun atau Penyusun.
- Dokumen SOP sudah diinisiasi atau tersedia sebagai draft.
- Status dokumen masih dapat diedit.

## Pemicu
****
Aktor mengisi atau memperbarui substansi SOP.

## Alur utama

1. Aktor membuka workbench penyusunan SOP.
2. Sistem menampilkan data umum SOP, dasar hukum, pelaksana, langkah, dan diagram.
3. Aktor mengisi atau memperbarui informasi dokumen.
4. Aktor menyusun langkah SOP dan relasi alur keputusan jika ada.
5. Sistem memvalidasi kelengkapan dan konsistensi data.
6. Sistem menyimpan perubahan dan mencatat riwayat edit.
7. Jika dokumen sudah lengkap, aktor menandai draft sebagai menunggu pengajuan evaluasi.
8. Sistem mengubah status SOP menjadi menunggu pengajuan evaluasi.

## Alur alternatif

- Jika status SOP sedang dievaluasi atau sudah berlaku, sistem menolak pengeditan.
- Jika langkah keputusan tidak memiliki cabang ya dan tidak, sistem menolak penyimpanan atau penandaan siap.
- Jika draft belum lengkap, sistem menyimpan sebagai draft tetapi menolak status menunggu pengajuan evaluasi.

## Hasil akhir

Draft SOP tersusun dan dapat diajukan untuk evaluasi setelah memenuhi kelengkapan.




# Use Case Sistem Informasi Pengelolaan SOP

Dokumen ini mengacu pada **diagram use case UML** (*Sistem Informasi Pengelolaan SOP pada Biro Organisasi Sumbar*): **21 oval (UC-01–UC-21)** dan **6 aktor**. Detail alur per oval ada di [`usecase-scenario/`](usecase-scenario/README.md).

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



| ID | Use case (diagram) | Aktor pada diagram | No requirements | Relasi / catatan |

| :---: | :--- | :--- | :---: | :--- |

| UC-01 | Login | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | 7 | — |

| UC-02 | Logout | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | — | Pendukung sesi setelah Login (No 7) |

| UC-03 | Melihat List SOP | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | — | Navigasi daftar/monitoring SOP |

| UC-04 | Melihat Hasil Penilaian OPD | PJ Evaluator | 20 | Monitoring grafik evaluasi |

| UC-05 | Mengelola OPD | PJ Evaluator | 1 | |

| UC-06 | Mengelola Tim Evaluator | PJ Evaluator | 2 | |

| UC-07 | Mengelola Kepala OPD | PJ Evaluator | 4 | |

| UC-08 | Mengelola Tim Penyusun SOP | PJ Evaluator | 3 | |

| UC-09 | Membuat Tanda Tangan Elektronik | PJ Evaluator, PJ Penyusun | 9 | Registrasi / ubah PIN TTE |

| UC-10 | Menandatangani Berita Acara | PJ Evaluator, PJ Penyusun | 17 | Dua tahap: PJ Evaluator lalu PJ Penyusun |

| UC-11 | Mengevaluasi SOP | Evaluator | 15 | Penilaian substansi SOP |

| UC-12 | Membuat Komentar | Evaluator | 16 | `<<extend>>` Mengevaluasi SOP (opsional saat `PERLU_PERBAIKAN`) |

| UC-13 | Mengesahkan Dokumen SOP | Kepala OPD | 18 | Pengesahan massal SOP setelah BA |

| UC-14 | Mengajukan Evaluasi SOP | PJ Penyusun | 12 | |

| UC-15 | Menyusun Draft SOP | PJ Penyusun, Penyusun | 10 | Bagian penyusunan draft |

| UC-16 | Inisiasi Dokumen SOP | PJ Penyusun, Penyusun | 10 | Bagian pembuatan SOP/versi baru |

| UC-17 | Mengelola Pelaksana SOP | PJ Penyusun, Penyusun | 6 | |

| UC-18 | Mengelola Peraturan SOP | PJ Penyusun, Penyusun | 5 | |

| UC-19 | Melihat Arsip Publik SOP | Pengunjung | 22 | Tanpa login |

| UC-20 | Memeriksa Pengesahan TTE | Pengunjung | 23 | Scan QR / tautan verifikasi |

| UC-21 | Memverifikasi Tanda Tangan Digital | Pengunjung | 24 | Unggah PDF, cek signature PKCS#7 |



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
Penyusun/PJ Penyusun: Inisiasi + Menyusun Draft (UC-16, UC-15) → siap dievaluasi
PJ Penyusun: Mengajukan Evaluasi (UC-14 / No 12)
Evaluator: Mengevaluasi + Komentar bila perlu (UC-11, UC-12 / No 15–16)
Penyusun/PJ Penyusun: tindak lanjut & pengajuan ulang (No 14, 13 — tanpa oval terpisah)
PJ Evaluator → PJ Penyusun: Menandatangani BA (UC-10 / No 17)
Kepala OPD: Mengesahkan Dokumen SOP (UC-13 / No 18)
Pengunjung: arsip publik & verifikasi (UC-19–UC-21 / No 22–24)
```



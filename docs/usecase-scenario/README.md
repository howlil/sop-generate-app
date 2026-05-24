# Indeks Skenario Use Case

Folder ini berisi skenario per **oval diagram UML** pada [`../usecase.md`](../usecase.md). Daftar utama tetap mengikuti **21 use case (UC-01 sampai UC-21)**; kolom **No requirements** hanya penanda traceability ke [`../requirements.md`](../requirements.md), bukan identitas satu banding satu.

## Daftar skenario

| UC | Use case diagram | Aktor pada diagram | No requirements | Berkas |
| :---: | :--- | :--- | :---: | :--- |
| UC-01 | Login | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | 7 | [`login.md`](login.md) |
| UC-02 | Logout | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | - | [`logout.md`](logout.md) |
| UC-03 | Melihat List SOP | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun | - | [`melihat-list-sop.md`](melihat-list-sop.md) |
| UC-04 | Melihat Hasil Penilaian OPD | PJ Evaluator | 20 | [`melihat-hasil-penilaian-opd.md`](melihat-hasil-penilaian-opd.md) |
| UC-05 | Mengelola OPD | PJ Evaluator | 1 | [`mengelola-opd.md`](mengelola-opd.md) |
| UC-06 | Mengelola Tim Evaluator | PJ Evaluator | 2 | [`mengelola-tim-evaluator.md`](mengelola-tim-evaluator.md) |
| UC-07 | Mengelola Kepala OPD | PJ Evaluator | 4 | [`mengelola-kepala-opd.md`](mengelola-kepala-opd.md) |
| UC-08 | Mengelola Tim Penyusun SOP | PJ Evaluator | 3 | [`mengelola-tim-penyusun-sop.md`](mengelola-tim-penyusun-sop.md) |
| UC-09 | Membuat Tanda Tangan Elektronik | PJ Evaluator, PJ Penyusun | 9 | [`membuat-tanda-tangan-elektronik.md`](membuat-tanda-tangan-elektronik.md) |
| UC-10 | Menandatangani Berita Acara | PJ Evaluator, PJ Penyusun | 17 | [`menandatangani-berita-acara.md`](menandatangani-berita-acara.md) |
| UC-11 | Mengevaluasi SOP | Evaluator | 15 | [`mengevaluasi-sop.md`](mengevaluasi-sop.md) |
| UC-12 | Membuat Komentar | Evaluator | 16 | [`membuat-komentar.md`](membuat-komentar.md) |
| UC-13 | Mengesahkan Dokumen SOP | Kepala OPD | 18 | [`mengesahkan-dokumen-sop.md`](mengesahkan-dokumen-sop.md) |
| UC-14 | Mengajukan Evaluasi SOP | PJ Penyusun | 12 | [`mengajukan-evaluasi-sop.md`](mengajukan-evaluasi-sop.md) |
| UC-15 | Menyusun Draft SOP | PJ Penyusun, Penyusun | 10 | [`menyusun-draft-sop.md`](menyusun-draft-sop.md) |
| UC-16 | Inisiasi Dokumen SOP | PJ Penyusun, Penyusun | 10 | [`inisiasi-dokumen-sop.md`](inisiasi-dokumen-sop.md) |
| UC-17 | Mengelola Pelaksana SOP | PJ Penyusun, Penyusun | 6 | [`mengelola-pelaksana-sop.md`](mengelola-pelaksana-sop.md) |
| UC-18 | Mengelola Peraturan SOP | PJ Penyusun, Penyusun | 5 | [`mengelola-peraturan-sop.md`](mengelola-peraturan-sop.md) |
| UC-19 | Melihat Arsip Publik SOP | Pengunjung | 22 | [`melihat-arsip-publik-sop.md`](melihat-arsip-publik-sop.md) |
| UC-20 | Memeriksa Pengesahan TTE | Pengunjung | 23 | [`memeriksa-pengesahan-tte.md`](memeriksa-pengesahan-tte.md) |
| UC-21 | Memverifikasi Tanda Tangan Digital | Pengunjung | 24 | [`memverifikasi-tanda-tangan-digital.md`](memverifikasi-tanda-tangan-digital.md) |

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


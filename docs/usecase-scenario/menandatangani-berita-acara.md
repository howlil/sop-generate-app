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


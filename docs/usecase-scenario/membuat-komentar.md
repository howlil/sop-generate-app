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


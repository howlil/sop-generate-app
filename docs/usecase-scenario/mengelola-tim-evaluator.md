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


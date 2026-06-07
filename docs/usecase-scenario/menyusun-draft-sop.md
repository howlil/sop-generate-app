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


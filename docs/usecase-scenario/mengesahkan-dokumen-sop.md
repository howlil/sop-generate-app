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
8. Sistem menandai proses pengajuan selesai.

## Alur alternatif

- Jika PIN salah, sistem menolak pengesahan.
- Jika status dokumen belum memenuhi prasyarat, sistem menolak aksi.
- Jika terdapat versi SOP lama yang masih berlaku, sistem menandai versi lama sesuai aturan pergantian versi.

## Hasil akhir

Dokumen SOP sah, berstatus berlaku, dan dapat tersedia pada arsip publik sesuai kebijakan sistem.


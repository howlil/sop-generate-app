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


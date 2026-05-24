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


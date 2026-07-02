# Sequence Diagram: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menggambarkan proses pengunjung memeriksa kesiapan layanan, memilih dokumen digital, dan menerima hasil pemeriksaan tanda tangan digital. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Memverifikasi Tanda Tangan Digital
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Halaman Validasi Dokumen" as B
control "Pengelola Verifikasi Dokumen" as C
control "Pemeriksa Tanda Tangan Digital" as D
entity "Berkas Dokumen" as BerkasDokumen
entity "Hasil Verifikasi" as HasilVerifikasi

A -> B : Membuka halaman verifikasi dokumen
B -> C : Meminta status layanan verifikasi
C --> B : Mengirim kesiapan layanan verifikasi
B --> A : Menampilkan status layanan verifikasi

A -> B : Memilih dokumen untuk diverifikasi
B --> A : Menampilkan nama dokumen dan pemeriksaan awal ukuran serta jenis berkas
B -> BerkasDokumen : Membaca berkas dokumen yang dipilih
BerkasDokumen --> B : Isi dokumen siap diperiksa
B --> A : Menampilkan proses verifikasi
B -> C : Meminta verifikasi tanda tangan digital
C -> D : Memeriksa keberadaan, keutuhan, penerbit, subjek, dan masa berlaku tanda tangan
D --> C : Hasil pemeriksaan tanda tangan digital
alt Dokumen rusak atau tidak dapat dibaca
  C --> B : Mengirim alasan dokumen tidak dapat diperiksa
  B --> A : Menampilkan dokumen tidak dapat diverifikasi
else Dokumen tidak memiliki tanda tangan digital
  C --> B : Mengirim hasil tidak ada tanda tangan digital
  B --> A : Menampilkan dokumen tidak memiliki tanda tangan digital
else Tanda tangan digital valid
  C -> HasilVerifikasi : Menyusun ringkasan hasil verifikasi valid
  HasilVerifikasi --> C : Ringkasan hasil valid
  C --> B : Mengirim hasil tanda tangan valid
  B --> A : Menampilkan tanda tangan digital valid
else Tanda tangan digital tidak valid
  C -> HasilVerifikasi : Menyusun ringkasan hasil verifikasi tidak valid
  HasilVerifikasi --> C : Ringkasan hasil tidak valid
  C --> B : Mengirim detail tanda tangan yang bermasalah
  B --> A : Menampilkan tanda tangan digital tidak valid beserta alasannya
end

@enduml
```

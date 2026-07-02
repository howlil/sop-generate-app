# Sequence Diagram: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menggambarkan proses pengunjung memeriksa keabsahan pengesahan dokumen melalui penanda pengesahan publik. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Memeriksa Pengesahan TTE
autonumber
autoactivate on

actor "Pengunjung" as A
boundary "Halaman Validasi Pengesahan" as B
control "Pengelola Validasi Pengesahan" as C
control "Pemeriksa Riwayat Tanda Tangan" as D
entity "Dokumen TTE" as DokumenTTE
entity "Riwayat Tanda Tangan" as RiwayatTandaTangan

A -> B : Membuka halaman validasi pengesahan
B --> A : Menampilkan formulir kode atau penanda pengesahan
A -> B : Memasukkan kode pengesahan dari dokumen
B --> A : Menampilkan proses pemeriksaan pengesahan
B -> C : Meminta pemeriksaan pengesahan dokumen
C -> D : Memeriksa format kode dan kelengkapan penanda pengesahan
D --> C : Hasil pemeriksaan awal
alt Kode pengesahan dapat diperiksa
  C -> DokumenTTE : Mencari dokumen berdasarkan kode pengesahan
  DokumenTTE --> C : Data dokumen atau tidak ditemukan
  C -> RiwayatTandaTangan : Mencari riwayat tanda tangan dokumen
  RiwayatTandaTangan --> C : Riwayat tanda tangan atau tidak ditemukan
  alt Pengesahan ditemukan
    C --> B : Mengirim identitas dokumen, penandatangan, waktu pengesahan, dan keadaan dokumen
    B --> A : Menampilkan pengesahan valid dan informasi dokumen
  else Pengesahan tidak ditemukan
    C --> B : Mengirim alasan pengesahan tidak ditemukan
    B --> A : Menampilkan pengesahan tidak dapat diverifikasi
  end
else Kode pengesahan tidak sesuai
  C --> B : Mengirim alasan kode tidak dapat diperiksa
  B --> A : Menampilkan petunjuk memperbaiki kode pengesahan
end

@enduml
```

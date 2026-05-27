# Sequence Diagram: Pengunjung - Memeriksa Pengesahan TTE

Sumber use case: `UC-20` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memeriksa Pengesahan TTE |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 23 |
| Tujuan | Menggambarkan proses pemeriksaan pengesahan tanda tangan elektronik melalui tautan atau kode verifikasi. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Memeriksa Pengesahan TTE
autonumber

actor "Pengunjung" as Aktor
boundary "Halaman Verifikasi Pengesahan" as UI
control "Verifikasi TTE Controller" as VerifCtrl
entity "Dokumen TTE" as DokumenTTE
entity "Riwayat Tanda Tangan" as Riwayat
entity "Detail SOP" as Detail

Aktor -> UI : Membuka tautan atau memindai kode verifikasi
UI -> VerifCtrl : Mengirim kode verifikasi pengesahan
VerifCtrl -> DokumenTTE : Mencari dokumen TTE berdasarkan kode

alt Dokumen TTE ditemukan
  DokumenTTE --> VerifCtrl : Data dokumen TTE
  VerifCtrl -> Riwayat : Mengambil riwayat tanda tangan
  VerifCtrl -> Detail : Mengambil status dokumen SOP
  VerifCtrl --> UI : Mengirim hasil pengesahan dan status dokumen
  UI --> Aktor : Menampilkan informasi pengesahan
else Dokumen TTE tidak ditemukan
  DokumenTTE --> VerifCtrl : Tidak ditemukan
  VerifCtrl --> UI : Mengirim hasil tidak valid
  UI --> Aktor : Menampilkan pengesahan tidak ditemukan
end

@enduml
```


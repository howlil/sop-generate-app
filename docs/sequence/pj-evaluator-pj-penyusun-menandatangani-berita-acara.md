# Sequence Diagram: PJ Evaluator/PJ Penyusun - Menandatangani Berita Acara

Sumber use case: `UC-10` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menandatangani Berita Acara |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 17 |
| Tujuan | Menggambarkan proses tanda tangan elektronik berita acara oleh PJ Evaluator dan PJ Penyusun secara berurutan. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Menandatangani Berita Acara
autonumber

actor "PJ Evaluator" as PJE
actor "PJ Penyusun" as PJP
boundary "Halaman Tanda Tangan BA" as UI
control "TTE Controller" as TTECtrl
control "Validasi TTE" as Validasi
entity "Pengajuan Evaluasi" as Pengajuan
entity "Dokumen TTE Berita Acara" as DokumenTTE
entity "Riwayat Tanda Tangan" as Riwayat
entity "PIN TTE Pengguna" as Pin

PJE -> UI : Membuka daftar pengajuan selesai evaluasi
UI -> TTECtrl : Meminta pengajuan siap ditandatangani PJ Evaluator
TTECtrl -> Pengajuan : Mengambil pengajuan selesai dievaluasi
TTECtrl --> UI : Menampilkan daftar pengajuan

PJE -> UI : Memilih pengajuan dan memasukkan PIN TTE
UI -> TTECtrl : Mengirim permintaan tanda tangan PJ Evaluator
TTECtrl -> Validasi : Memeriksa status pengajuan dan hak akses PJ Evaluator
TTECtrl -> Pin : Mengambil PIN TTE PJ Evaluator
Validasi -> Pin : Memeriksa kecocokan PIN

alt PIN dan status valid
  Validasi --> TTECtrl : Valid
  TTECtrl -> DokumenTTE : Membuat atau memperbarui dokumen BA
  TTECtrl -> Riwayat : Mencatat tanda tangan PJ Evaluator
  TTECtrl -> Pengajuan : Mengubah status menunggu tanda tangan PJ Penyusun
  TTECtrl --> UI : Mengirim hasil tanda tangan berhasil
  UI --> PJE : Menampilkan pemberitahuan berhasil
else PIN atau status tidak valid
  Validasi --> TTECtrl : Tidak valid
  TTECtrl --> UI : Mengirim alasan kegagalan
  UI --> PJE : Menampilkan tanda tangan ditolak
end

PJP -> UI : Membuka daftar pengajuan menunggu tanda tangan PJ Penyusun
UI -> TTECtrl : Meminta pengajuan siap ditandatangani PJ Penyusun
TTECtrl -> Pengajuan : Mengambil pengajuan sesuai OPD PJ Penyusun
TTECtrl --> UI : Menampilkan daftar pengajuan

PJP -> UI : Memilih pengajuan dan memasukkan PIN TTE
UI -> TTECtrl : Mengirim permintaan tanda tangan PJ Penyusun
TTECtrl -> Validasi : Memeriksa status pengajuan, OPD, dan hak akses PJ Penyusun
TTECtrl -> Pin : Mengambil PIN TTE PJ Penyusun
Validasi -> Pin : Memeriksa kecocokan PIN

alt PIN dan status valid
  Validasi --> TTECtrl : Valid
  TTECtrl -> Riwayat : Mencatat tanda tangan PJ Penyusun
  TTECtrl -> Pengajuan : Mengubah status pengajuan siap disahkan
  TTECtrl --> UI : Mengirim hasil tanda tangan berhasil
  UI --> PJP : Menampilkan berita acara berhasil ditandatangani
else PIN atau status tidak valid
  Validasi --> TTECtrl : Tidak valid
  TTECtrl --> UI : Mengirim alasan kegagalan
  UI --> PJP : Menampilkan tanda tangan ditolak
end

@enduml
```


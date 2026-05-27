# Sequence Diagram: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18 |
| Tujuan | Menggambarkan proses Kepala OPD mengesahkan SOP hingga dokumen berstatus berlaku dan tampil pada arsip publik. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Mengesahkan Dokumen SOP
autonumber

actor "Kepala OPD" as Aktor
boundary "Halaman Pengesahan SOP" as UI
control "TTE Controller" as TTECtrl
control "Validasi Pengesahan" as Validasi
entity "Pengajuan Evaluasi" as Pengajuan
entity "Detail SOP" as Detail
entity "Dokumen TTE SOP" as DokumenTTE
entity "Riwayat Tanda Tangan" as Riwayat
entity "PIN TTE Pengguna" as Pin
entity "Arsip Publik SOP" as Arsip

Aktor -> UI : Membuka daftar SOP siap disahkan
UI -> TTECtrl : Meminta pengajuan siap pengesahan
TTECtrl -> Pengajuan : Mengambil pengajuan yang sudah selesai TTE berita acara
TTECtrl -> Detail : Mengambil daftar SOP dalam pengajuan
TTECtrl --> UI : Menampilkan daftar SOP siap disahkan

Aktor -> UI : Meninjau dokumen dan memilih aksi pengesahan
Aktor -> UI : Memasukkan PIN TTE
UI -> TTECtrl : Mengirim permintaan pengesahan SOP
TTECtrl -> Validasi : Memeriksa hak akses, OPD, dan status pengajuan
TTECtrl -> Pin : Mengambil PIN TTE Kepala OPD
Validasi -> Pin : Memeriksa kecocokan PIN

alt Data pengesahan valid
  Validasi --> TTECtrl : Valid
  TTECtrl -> DokumenTTE : Membuat dokumen TTE SOP berlaku
  loop Untuk setiap SOP dalam pengajuan
    TTECtrl -> Riwayat : Mencatat tanda tangan Kepala OPD
    TTECtrl -> Detail : Menetapkan SOP sebagai dokumen berlaku
    TTECtrl -> Arsip : Memperbarui arsip publik SOP
  end
  TTECtrl -> Pengajuan : Menandai pengajuan selesai
  TTECtrl --> UI : Mengirim hasil pengesahan berhasil
  UI --> Aktor : Menampilkan SOP berhasil disahkan
else Data pengesahan tidak valid
  Validasi --> TTECtrl : Tidak valid
  TTECtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pengesahan ditolak
end

@enduml
```


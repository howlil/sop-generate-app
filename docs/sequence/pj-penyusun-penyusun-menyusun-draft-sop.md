# Sequence Diagram: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat menyusun, menyimpan, dan menandai draft SOP sebagai siap dievaluasi. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Menyusun Draft SOP
autonumber

actor "PJ Penyusun / Penyusun" as Aktor
boundary "Halaman Penyusunan SOP" as UI
control "SOP Controller" as SOPCtrl
control "Validasi Draft SOP" as Validasi
control "Log Perubahan SOP" as LogCtrl
entity "Data SOP" as SOP
entity "Detail SOP" as Detail
entity "Langkah SOP" as Langkah
entity "Pelaksana SOP" as Pelaksana
entity "Riwayat Perubahan" as Log

Aktor -> UI : Membuka halaman penyusunan SOP
UI -> SOPCtrl : Meminta data draft SOP
SOPCtrl -> SOP : Mengambil data utama SOP
SOPCtrl -> Detail : Mengambil detail draft SOP
SOPCtrl -> Langkah : Mengambil langkah kerja SOP
SOPCtrl -> Pelaksana : Mengambil pelaksana terkait
SOPCtrl --> UI : Menampilkan draft SOP

Aktor -> UI : Mengisi informasi SOP, dasar hukum, pelaksana, langkah, dan diagram
Aktor -> UI : Menyimpan draft
UI -> SOPCtrl : Mengirim perubahan draft SOP
SOPCtrl -> Validasi : Memeriksa kelengkapan dan konsistensi draft

alt Data draft valid
  Validasi --> SOPCtrl : Valid
  SOPCtrl -> Detail : Menyimpan perubahan detail SOP
  SOPCtrl -> Langkah : Menyimpan susunan langkah SOP
  SOPCtrl -> Pelaksana : Menyimpan relasi pelaksana
  SOPCtrl -> LogCtrl : Mencatat riwayat perubahan
  LogCtrl -> Log : Menyimpan catatan perubahan dokumen
  SOPCtrl --> UI : Mengirim hasil penyimpanan berhasil
  UI --> Aktor : Menampilkan pemberitahuan draft tersimpan
else Data draft belum valid
  Validasi --> SOPCtrl : Tidak valid
  SOPCtrl --> UI : Mengirim daftar data yang perlu diperbaiki
  UI --> Aktor : Menampilkan pesan perbaikan
end

opt Pengguna menandai draft siap dievaluasi
  Aktor -> UI : Memilih aksi tandai siap dievaluasi
  UI -> SOPCtrl : Mengirim permintaan perubahan status
  SOPCtrl -> Validasi : Memeriksa kelengkapan akhir SOP
  alt Dokumen lengkap
    Validasi --> SOPCtrl : Lengkap
    SOPCtrl -> Detail : Mengubah status menjadi siap dievaluasi
    SOPCtrl --> UI : Status berhasil diperbarui
    UI --> Aktor : Menampilkan SOP siap diajukan
  else Dokumen belum lengkap
    Validasi --> SOPCtrl : Belum lengkap
    SOPCtrl --> UI : Mengirim daftar kekurangan dokumen
    UI --> Aktor : Menampilkan daftar kekurangan
  end
end

@enduml
```


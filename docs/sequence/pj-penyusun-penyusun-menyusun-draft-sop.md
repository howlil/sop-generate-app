# Sequence Diagram: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10 |
| Tujuan | Menggambarkan interaksi PJ Penyusun atau Penyusun dengan sistem saat melengkapi draft SOP hingga siap diajukan untuk evaluasi. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Menyusun Draft SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Ruang Penyusunan SOP" as B
control "Pengelola Penyusunan SOP" as C
entity "Draft SOP" as D

A -> B : Membuka draft SOP
B -> C : Meminta isi draft
C -> D : Mengambil data draft SOP
D --> C : Isi draft
C --> B : Mengirim isi draft
B --> A : Menampilkan dokumen untuk disusun

A -> B : Mengubah informasi dan prosedur SOP
B -> C : Meminta penyimpanan perubahan
C -> D : Memeriksa dan menyimpan perubahan

alt Data penyusunan valid
  D --> C : Draft terbaru
  C --> B : Mengirim hasil penyimpanan
  B --> A : Menampilkan draft terbaru
else Data belum valid
  D --> C : Bagian yang perlu diperbaiki
  C --> B : Mengirim informasi validasi
  B --> A : Menampilkan bagian yang perlu diperbaiki
end

opt Draft dinyatakan selesai disusun
  A -> B : Memilih tandai siap diajukan
  B -> C : Meminta pemeriksaan kelengkapan
  C -> D : Memeriksa kelengkapan draft
  alt SOP lengkap
    D --> C : SOP memenuhi kelengkapan
    C -> D : Menandai SOP menunggu pengajuan evaluasi
    D --> C : Status SOP diperbarui
    C --> B : Mengirim status siap diajukan
    B --> A : Menampilkan SOP siap diajukan
  else SOP belum lengkap
    D --> C : Daftar bagian yang belum lengkap
    C --> B : Mengirim informasi kelengkapan
    B --> A : Menampilkan bagian yang perlu dilengkapi
  end
end

@enduml
```

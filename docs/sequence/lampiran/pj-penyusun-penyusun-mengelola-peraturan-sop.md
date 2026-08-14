# Sequence Diagram: PJ Penyusun/Penyusun - Mengelola Peraturan SOP

Sumber use case: `UC-18` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengelola Peraturan SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 5 |
| Tujuan | Menggambarkan interaksi PJ Penyusun atau Penyusun dengan sistem saat mengelola peraturan sebagai dasar hukum SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengelola Peraturan SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Halaman Peraturan SOP" as B
control "Pengelola Peraturan" as C
entity "Data Peraturan" as D

A -> B : Membuka data peraturan
B -> C : Meminta peraturan pada OPD pengguna
C -> D : Mengambil data peraturan
D --> C : Daftar peraturan
C --> B : Mengirim daftar peraturan
B --> A : Menampilkan data peraturan

A -> B : Memilih tambah, ubah, atau hapus peraturan
B -> C : Mengirim perubahan peraturan
C -> D : Memeriksa data dan penggunaan peraturan
D --> C : Hasil pemeriksaan

alt Perubahan dapat dilakukan
  C -> D : Menyimpan perubahan peraturan
  D --> C : Data peraturan terbaru
  C --> B : Mengirim hasil perubahan
  B --> A : Menampilkan daftar terbaru
else Perubahan tidak dapat dilakukan
  C --> B : Mengirim alasan penolakan
  B --> A : Menampilkan informasi penolakan
end

@enduml
```

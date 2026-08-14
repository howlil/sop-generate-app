# Sequence Diagram: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menggambarkan interaksi PJ Evaluator atau PJ Penyusun dengan sistem saat menyiapkan atau memperbarui TTE. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Membuat Tanda Tangan Elektronik
autonumber
autoactivate on

actor "PJ Evaluator / PJ Penyusun" as A
boundary "Pengaturan TTE" as B
control "Pengelola TTE" as C
entity "Profil TTE" as D

A -> B : Membuka pengaturan TTE
B -> C : Meminta status TTE
C -> D : Mengambil profil TTE
D --> C : Status TTE
C --> B : Mengirim status TTE
B --> A : Menampilkan status TTE

alt TTE belum disiapkan
  A -> B : Mengisi data pengaturan dan PIN
  B -> C : Meminta pembuatan TTE
  C -> D : Memvalidasi dan menyimpan profil TTE
  D --> C : Hasil pembuatan TTE
  alt Data TTE valid
    C --> B : Mengirim status TTE aktif
    B --> A : Menampilkan TTE berhasil disiapkan
  else Data TTE tidak valid
    C --> B : Mengirim informasi yang perlu diperbaiki
    B --> A : Menampilkan pesan validasi
  end
else TTE sudah tersedia
  opt Pengguna memperbarui PIN atau pengaturan TTE
    A -> B : Mengirim perubahan TTE
    B -> C : Meminta pembaruan TTE
    C -> D : Memvalidasi dan menyimpan perubahan
    D --> C : Hasil pembaruan
    C --> B : Mengirim hasil pembaruan
    B --> A : Menampilkan status TTE terbaru
  end
end

@enduml
```

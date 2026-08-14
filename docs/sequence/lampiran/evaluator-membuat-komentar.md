# Sequence Diagram: Evaluator - Membuat Komentar

Sumber use case: `UC-12` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Komentar |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 16 |
| Tujuan | Menggambarkan interaksi evaluator dan sistem saat memberikan catatan perbaikan pada SOP yang belum sesuai. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Membuat Komentar
autonumber
autoactivate on

actor "Evaluator" as A
boundary "Form Penilaian SOP" as B
control "Pengelola Evaluasi" as C
entity "Hasil Evaluasi" as D

A -> B : Memilih hasil perlu perbaikan
B --> A : Menampilkan bagian catatan perbaikan
A -> B : Mengirim catatan perbaikan
B -> C : Meminta penyimpanan catatan
C -> D : Memeriksa dan menyimpan catatan

alt Catatan telah diisi
  D --> C : Catatan tersimpan
  C --> B : Mengirim hasil evaluasi terbaru
  B --> A : Menampilkan catatan dan status perlu tindak lanjut
else Catatan belum memenuhi ketentuan
  D --> C : Catatan belum dapat disimpan
  C --> B : Mengirim informasi kekurangan catatan
  B --> A : Meminta evaluator melengkapi catatan
end

@enduml
```

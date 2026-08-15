# Sequence Diagram: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15 |
| Tujuan | Menggambarkan interaksi evaluator dan sistem saat melakukan penilaian substansi SOP. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengevaluasi SOP
autonumber
autoactivate on

actor "Evaluator" as A
boundary "Ruang Evaluasi SOP" as B
control "Pengelola Evaluasi" as C
entity "Pengajuan dan Hasil Evaluasi" as D

A -> B : Membuka pengajuan evaluasi
B -> C : Meminta SOP dalam pengajuan
C -> D : Mengambil data pengajuan
D --> C : SOP dan hasil penilaian
C --> B : Mengirim data evaluasi
B --> A : Menampilkan SOP yang akan dinilai

A -> B : Menentukan hasil penilaian
B -> C : Meminta penyimpanan hasil
C -> D : Menyimpan hasil penilaian
D --> C : Hasil tersimpan
C --> B : Mengirim hasil terbaru
B --> A : Menampilkan hasil penilaian

@enduml
```

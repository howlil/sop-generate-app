# Sequence Diagram: Seluruh Pengguna - Melihat List SOP

Sumber use case: `UC-03` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Melihat List SOP |
| Aktor utama | PJ Evaluator, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | Tidak memiliki nomor tersendiri |
| Tujuan | Menggambarkan interaksi pengguna dan sistem saat melihat daftar SOP sesuai cakupan akses. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Melihat List SOP
autonumber
autoactivate on

actor "Pengguna" as A
boundary "Daftar SOP" as B
control "Pengelola SOP" as C
entity "Dokumen SOP" as D

A -> B : Membuka daftar SOP
B -> C : Meminta SOP sesuai pengguna
C -> D : Mengambil SOP sesuai peran dan OPD
D --> C : Daftar SOP
C --> B : Mengirim daftar SOP
B --> A : Menampilkan SOP yang dapat diakses

opt Pengguna melakukan pencarian atau penyaringan
  A -> B : Menentukan kriteria daftar
  B -> C : Meminta daftar sesuai kriteria
  C -> D : Mengambil SOP yang sesuai
  D --> C : Hasil penyaringan
  C --> B : Mengirim hasil penyaringan
  B --> A : Memperbarui daftar SOP
end

opt Pengguna memilih salah satu SOP
  A -> B : Memilih SOP
  B -> C : Meminta detail SOP
  C -> D : Mengambil dokumen SOP
  D --> C : Informasi SOP
  C --> B : Mengirim detail SOP
  B --> A : Menampilkan informasi SOP
end

@enduml
```

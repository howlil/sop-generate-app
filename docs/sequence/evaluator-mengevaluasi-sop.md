# Sequence Diagram: Evaluator - Mengevaluasi SOP

Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengevaluasi SOP |
| Aktor utama | Evaluator |
| Nomor kebutuhan fungsional | 15 |
| Tujuan | Menggambarkan interaksi evaluator dan sistem saat menilai substansi SOP hingga pengajuan dapat diselesaikan. |

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
entity "Pengajuan Evaluasi" as D
entity "Hasil Penilaian" as E

A -> B : Membuka pengajuan evaluasi
B -> C : Meminta isi pengajuan
C -> D : Mengambil SOP dalam pengajuan
D --> C : Daftar SOP
C --> B : Mengirim isi pengajuan
B --> A : Menampilkan SOP yang akan dinilai

A -> B : Memilih SOP dan menentukan hasil penilaian
B -> C : Meminta penyimpanan hasil
C -> D : Memeriksa keadaan pengajuan
D --> C : Pengajuan dapat dinilai

alt SOP perlu perbaikan
  C --> B : Meminta catatan melalui UC-12 Membuat Komentar
  B --> A : Menampilkan kebutuhan catatan perbaikan
else SOP sesuai
  C -> E : Menyimpan hasil sesuai
  E --> C : Hasil tersimpan
  C --> B : Mengirim hasil penilaian
  B --> A : Menampilkan hasil tersimpan
end

opt Evaluator menyelesaikan pengajuan
  A -> B : Memilih selesaikan evaluasi
  B -> C : Meminta penyelesaian pengajuan
  C -> E : Memeriksa hasil seluruh SOP
  E --> C : Rangkuman hasil penilaian
  alt Seluruh SOP telah sesuai
    C -> D : Menandai pengajuan selesai dievaluasi
    D --> C : Pengajuan diperbarui
    C --> B : Mengirim status penyelesaian
    B --> A : Menampilkan pengajuan siap ke penandatanganan Berita Acara
  else Masih ada SOP belum sesuai
    C --> B : Mengirim informasi evaluasi belum dapat diselesaikan
    B --> A : Menampilkan SOP yang masih perlu ditindaklanjuti
  end
end

@enduml
```

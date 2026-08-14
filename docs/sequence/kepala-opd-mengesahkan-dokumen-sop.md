# Sequence Diagram: Kepala OPD - Mengesahkan Dokumen SOP

Sumber use case: `UC-13` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Mengesahkan Dokumen SOP |
| Aktor utama | Kepala OPD |
| Nomor kebutuhan fungsional | 18 |
| Tujuan | Menggambarkan interaksi Kepala OPD dan sistem saat mengesahkan SOP yang telah menyelesaikan tahapan evaluasi dan penandatanganan Berita Acara. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Sequence Diagram - Mengesahkan Dokumen SOP
autonumber
autoactivate on

actor "Kepala OPD" as A
boundary "Halaman Pengesahan SOP" as B
control "Pengelola Pengesahan" as C
entity "Pengajuan Evaluasi" as D
entity "Dokumen SOP" as E

A -> B : Membuka pengajuan yang siap disahkan
B -> C : Meminta dokumen pra-pengesahan
C -> D : Memeriksa tahap pengajuan
D --> C : Status pengajuan
C -> E : Mengambil SOP yang akan disahkan
E --> C : Daftar SOP
C --> B : Mengirim dokumen pengesahan
B --> A : Menampilkan SOP dan Berita Acara

A -> B : Memilih pengesahan dan memasukkan PIN TTE
B -> C : Meminta pengesahan SOP
C -> D : Memeriksa kewenangan dan kesiapan pengajuan
D --> C : Hasil pemeriksaan
C -> E : Memeriksa kesiapan seluruh SOP
E --> C : Hasil pemeriksaan SOP

alt Pengesahan memenuhi syarat
  C -> E : Mengesahkan SOP dan menetapkan status berlaku
  E --> C : SOP berlaku
  C -> D : Menandai pengajuan selesai
  D --> C : Pengajuan selesai
  C --> B : Mengirim hasil pengesahan
  B --> A : Menampilkan SOP telah disahkan dan tersedia pada arsip publik
else Pengesahan belum memenuhi syarat
  C --> B : Mengirim alasan pengesahan ditolak
  B --> A : Menampilkan informasi yang perlu diselesaikan
end

@enduml
```

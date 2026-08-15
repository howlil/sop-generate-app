# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menggambarkan proses PJ Evaluator atau PJ Penyusun menyiapkan PIN TTE untuk penandatanganan dokumen. |

## PlantUML

```plantuml
@startuml
skinparam defaultFontSize 20
skinparam titleFontSize 24
skinparam dpi 160

title Diagram Aktivitas - Membuat Tanda Tangan Elektronik

|PJ Evaluator / PJ Penyusun|
start
:Membuka pengaturan TTE;

|Sistem|
:Menampilkan status TTE pengguna;

|PJ Evaluator / PJ Penyusun|
:Memilih membuat atau memperbarui PIN TTE;
:Mengisi PIN dan konfirmasi PIN;

|Sistem|
:Memproses pengaturan TTE;

if (Pengaturan TTE berhasil?) then (Ya)
  :Menampilkan TTE siap digunakan;
else (Tidak)
  :Menampilkan informasi yang perlu diperbaiki;
endif

stop

@enduml
```

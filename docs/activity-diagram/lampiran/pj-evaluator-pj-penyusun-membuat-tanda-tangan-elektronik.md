# Diagram Aktivitas: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menggambarkan proses PJ Evaluator atau PJ Penyusun menyiapkan dan memperbarui TTE untuk proses penandatanganan. |

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

if (TTE belum disiapkan?) then (Ya)
  |PJ Evaluator / PJ Penyusun|
  :Menentukan PIN dan melengkapi pengaturan TTE;

  |Sistem|
  :Memvalidasi data TTE;
  if (Data TTE valid?) then (Ya)
    :Mengaktifkan TTE pengguna;
  else (Tidak)
    :Menampilkan informasi yang perlu diperbaiki;
  endif
else (Tidak)
  |PJ Evaluator / PJ Penyusun|
  :Memilih perubahan PIN atau pembaruan TTE;

  |Sistem|
  :Memvalidasi identitas dan data perubahan;
  if (Perubahan valid?) then (Ya)
    :Menyimpan perubahan TTE;
  else (Tidak)
    :Menampilkan alasan perubahan ditolak;
  endif
endif

stop

@enduml
```

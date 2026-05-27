# Sequence Diagram: PJ Evaluator/PJ Penyusun - Membuat Tanda Tangan Elektronik

Sumber use case: `UC-09` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Membuat Tanda Tangan Elektronik |
| Aktor utama | PJ Evaluator, PJ Penyusun |
| Nomor kebutuhan fungsional | 9 |
| Tujuan | Menggambarkan proses pembuatan atau perubahan PIN tanda tangan elektronik. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Membuat Tanda Tangan Elektronik
autonumber

actor "PJ Evaluator / PJ Penyusun" as Aktor
boundary "Halaman Pengaturan TTE" as UI
control "TTE Controller" as TTECtrl
control "Validasi PIN TTE" as Validasi
entity "Data Pengguna" as Pengguna
entity "PIN TTE Pengguna" as Pin

Aktor -> UI : Membuka pengaturan tanda tangan elektronik
UI -> TTECtrl : Meminta status PIN TTE
TTECtrl -> Pengguna : Mengambil data pengguna
TTECtrl -> Pin : Memeriksa apakah PIN sudah dibuat
TTECtrl --> UI : Menampilkan formulir PIN TTE

Aktor -> UI : Mengisi PIN baru dan konfirmasi PIN
UI -> TTECtrl : Mengirim data PIN
TTECtrl -> Validasi : Memeriksa format dan konfirmasi PIN

alt PIN valid
  Validasi --> TTECtrl : Valid
  TTECtrl -> Pin : Menyimpan PIN dalam bentuk aman
  TTECtrl -> Pengguna : Memperbarui waktu pengaturan PIN
  TTECtrl --> UI : Mengirim hasil berhasil
  UI --> Aktor : Menampilkan pemberitahuan PIN TTE berhasil disimpan
else PIN tidak valid
  Validasi --> TTECtrl : Tidak valid
  TTECtrl --> UI : Mengirim alasan kegagalan
  UI --> Aktor : Menampilkan pesan perbaikan PIN
end

@enduml
```


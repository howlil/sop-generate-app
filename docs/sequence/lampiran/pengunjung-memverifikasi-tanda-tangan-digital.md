# Sequence Diagram: Pengunjung - Memverifikasi Tanda Tangan Digital

Sumber use case: `UC-21` pada [`../../usecase.md`](../../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Memverifikasi Tanda Tangan Digital |
| Aktor utama | Pengunjung |
| Nomor kebutuhan fungsional | 24 |
| Tujuan | Menggambarkan proses pengunjung mengunggah PDF dan menerima hasil verifikasi tanda tangan digital. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Memverifikasi Tanda Tangan Digital
autonumber

actor "Pengunjung" as Aktor
boundary "Halaman Verifikasi PDF" as UI
control "Verifikasi PDF Controller" as PdfCtrl
control "Pemeriksa Tanda Tangan Digital" as VerifPdf
entity "Berkas PDF" as PDF
entity "Hasil Verifikasi PDF" as Hasil

Aktor -> UI : Membuka halaman verifikasi PDF
Aktor -> UI : Mengunggah dokumen PDF
UI -> PdfCtrl : Mengirim berkas PDF
PdfCtrl -> PDF : Menerima dan memeriksa format berkas

alt Berkas dapat diperiksa
  PdfCtrl -> VerifPdf : Memeriksa tanda tangan digital PDF
  VerifPdf -> Hasil : Menyimpan ringkasan hasil pemeriksaan
  alt Tanda tangan valid
    VerifPdf --> PdfCtrl : Hasil valid
    PdfCtrl --> UI : Mengirim hasil tanda tangan valid
    UI --> Aktor : Menampilkan hasil valid
  else Tanda tangan tidak valid atau tidak ditemukan
    VerifPdf --> PdfCtrl : Hasil tidak valid
    PdfCtrl --> UI : Mengirim hasil tidak valid
    UI --> Aktor : Menampilkan hasil tidak valid atau tidak ditemukan
  end
else Berkas tidak dapat diperiksa
  PDF --> PdfCtrl : Format atau ukuran tidak sesuai
  PdfCtrl --> UI : Mengirim alasan penolakan berkas
  UI --> Aktor : Menampilkan pesan berkas tidak dapat diperiksa
end

@enduml
```


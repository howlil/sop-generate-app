# Sequence Diagram: PJ Penyusun/Penyusun - Menyusun Draft SOP

Sumber use case: `UC-15` pada [`../usecase.md`](../usecase.md).

## Metadata

| Elemen | Deskripsi |
| :--- | :--- |
| Use case | Menyusun Draft SOP |
| Aktor utama | PJ Penyusun, Penyusun |
| Nomor kebutuhan fungsional | 10, 11, 13, 14 |
| Tujuan | Menggambarkan interaksi lengkap saat pengguna membuka ruang kerja, menyimpan identitas, prosedur, diagram, melihat riwayat perubahan, menindaklanjuti revisi, dan menandai draft siap diajukan evaluasi. |

## PlantUML

```plantuml
@startuml
title Sequence Diagram - Menyusun Draft SOP
autonumber
autoactivate on

actor "PJ Penyusun / Penyusun" as A
boundary "Ruang Kerja Penyusunan SOP" as B
control "Pengelola Penyusunan SOP" as C
control "Pemeriksa Kelengkapan SOP" as D
entity "SOP" as SOP
entity "Detail SOP" as DetailSOP
entity "Dasar Hukum" as DasarHukum
entity "Lampiran" as Lampiran
entity "Pelaksana" as Pelaksana
entity "Langkah SOP" as LangkahSOP
entity "Diagram SOP" as DiagramSOP
entity "Nilai Evaluasi" as NilaiEvaluasi
entity "Riwayat Perubahan" as Riwayat

A -> B : Membuka ruang kerja penyusunan SOP
B -> C : Meminta data awal penyusunan
C -> D : Memeriksa kewenangan penyusun terhadap OPD dan dokumen
D --> C : Hasil pemeriksaan kewenangan
alt Kewenangan sesuai
  C -> SOP : Mengambil identitas SOP
  SOP --> C : Identitas SOP
  C -> DetailSOP : Mengambil detail dokumen
  DetailSOP --> C : Detail dokumen
  C -> DasarHukum : Mengambil dasar hukum
  DasarHukum --> C : Daftar dasar hukum
  C -> Lampiran : Mengambil lampiran
  Lampiran --> C : Daftar lampiran
  C -> Pelaksana : Mengambil pelaksana
  Pelaksana --> C : Daftar pelaksana
  C -> LangkahSOP : Mengambil langkah SOP
  LangkahSOP --> C : Daftar langkah SOP
  C -> DiagramSOP : Mengambil diagram SOP
  DiagramSOP --> C : Diagram SOP
  C -> NilaiEvaluasi : Mengambil penilaian terbaru
  NilaiEvaluasi --> C : Penilaian terbaru
  C -> Riwayat : Mengambil riwayat perubahan
  Riwayat --> C : Riwayat perubahan
  C --> B : Mengirim data ruang kerja penyusunan
  B --> A : Menampilkan formulir, pratinjau SOP, diagram, status, dan riwayat perubahan
else Kewenangan tidak sesuai
  C --> B : Mengirim alasan ruang kerja tidak dapat dibuka
  B --> A : Menampilkan informasi akses ditolak
end

group Memperbarui identitas dan lampiran SOP
  A -> B : Mengubah judul, nomor, unit kerja, dasar hukum, lampiran, atau SOP terkait
  B --> A : Menampilkan perubahan sementara sebelum disimpan
  B -> C : Meminta penyimpanan identitas dan lampiran SOP
  C -> D : Memeriksa kelengkapan, keunikan nomor, hubungan data, dan keadaan dokumen
  D --> C : Hasil pemeriksaan identitas SOP
  alt Data dapat disimpan
    C -> SOP : Menyimpan perubahan identitas SOP
    SOP --> C : Identitas SOP tersimpan
    C -> DasarHukum : Menyimpan relasi dasar hukum
    DasarHukum --> C : Dasar hukum tersimpan
    C -> Lampiran : Menyimpan lampiran
    Lampiran --> C : Lampiran tersimpan
    C -> Riwayat : Mencatat riwayat perubahan identitas
    Riwayat --> C : Riwayat perubahan tercatat
    C --> B : Mengirim hasil penyimpanan
    B --> A : Menampilkan pratinjau dan riwayat perubahan terbaru
  else Data belum sesuai
    C --> B : Mengirim daftar bagian yang perlu diperbaiki
    B --> A : Menandai isian yang perlu diperbaiki
  end
end

group Memperbarui prosedur dan diagram SOP
  A -> B : Mengubah pelaksana, langkah, cabang keputusan, waktu, keluaran, atau bagan alur
  B --> A : Menampilkan rancangan prosedur dan diagram sementara
  B -> C : Meminta penyimpanan prosedur dan diagram SOP
  C -> D : Memeriksa urutan langkah, cabang keputusan, pelaksana, dan kesesuaian diagram
  D --> C : Hasil pemeriksaan prosedur dan diagram
  alt Rancangan dapat disimpan
    C -> LangkahSOP : Menyimpan langkah SOP
    LangkahSOP --> C : Langkah SOP tersimpan
    C -> Pelaksana : Menyimpan relasi pelaksana
    Pelaksana --> C : Relasi pelaksana tersimpan
    C -> DiagramSOP : Menyimpan diagram SOP
    DiagramSOP --> C : Diagram SOP tersimpan
    C -> Riwayat : Mencatat riwayat perubahan prosedur
    Riwayat --> C : Riwayat perubahan tercatat
    C --> B : Mengirim rancangan terbaru
    B --> A : Menampilkan prosedur dan diagram yang sudah diperbarui
  else Rancangan belum sesuai
    C --> B : Mengirim daftar kesalahan prosedur atau diagram
    B --> A : Menampilkan langkah, cabang, atau diagram yang perlu diperbaiki
  end
end

opt Menindaklanjuti revisi evaluator
  A -> B : Membaca catatan perbaikan dan menandai tindak lanjut selesai
  B --> A : Menampilkan konfirmasi tindak lanjut
  B -> C : Meminta penutupan tindak lanjut revisi
  C -> D : Memeriksa apakah perbaikan boleh ditutup
  D --> C : Hasil pemeriksaan tindak lanjut
  alt Tindak lanjut dapat ditutup
    C -> NilaiEvaluasi : Menyimpan penyelesaian tindak lanjut
    NilaiEvaluasi --> C : Tindak lanjut tersimpan
    C -> Riwayat : Mencatat riwayat tindak lanjut
    Riwayat --> C : Riwayat tindak lanjut tercatat
    C --> B : Mengirim hasil tindak lanjut
    B --> A : Menampilkan tindak lanjut selesai
    A -> B : Memilih kirim ulang evaluasi
    B -> C : Meminta pengembalian SOP ke proses evaluasi
    C -> D : Memeriksa kelengkapan akhir dan kewenangan pengiriman ulang
    D --> C : Hasil pemeriksaan pengiriman ulang
    C -> DetailSOP : Mencatat SOP kembali pada proses evaluasi
    DetailSOP --> C : Keadaan dokumen tersimpan
    C --> B : Mengirim hasil pengiriman ulang
    B --> A : Menampilkan SOP kembali dalam proses evaluasi
  else Tindak lanjut belum dapat ditutup
    C --> B : Mengirim alasan tindak lanjut ditolak
    B --> A : Menampilkan bagian revisi yang masih harus dipenuhi
  end
end

opt Menandai draft siap diajukan evaluasi
  A -> B : Memilih aksi siap diajukan
  B --> A : Menampilkan konfirmasi perubahan keadaan dokumen
  B -> C : Meminta penandaan draft siap diajukan
  C -> D : Memeriksa kelengkapan akhir SOP
  D --> C : Hasil pemeriksaan kelengkapan
  alt Draft lengkap
    C -> DetailSOP : Menyimpan keadaan SOP sebagai siap diajukan evaluasi
    DetailSOP --> C : Keadaan dokumen tersimpan
    C -> Riwayat : Mencatat riwayat perubahan keadaan
    Riwayat --> C : Riwayat perubahan tercatat
    C --> B : Mengirim hasil perubahan keadaan
    B --> A : Menampilkan SOP siap diajukan evaluasi
  else Draft belum lengkap
    C --> B : Mengirim daftar kekurangan dokumen
    B --> A : Menampilkan bagian yang harus dilengkapi
  end
end

@enduml
```

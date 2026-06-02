  # Diagram Aktivitas: Evaluator - Mengevaluasi SOP

  Sumber use case: `UC-11` pada [`../usecase.md`](../usecase.md).

  ## Metadata

  | Elemen | Deskripsi |
  | :--- | :--- |
  | Use case | Mengevaluasi SOP |
  | Aktor utama | Evaluator |
  | Nomor kebutuhan fungsional | 15 |
  | Tujuan | Menjelaskan proses evaluator dalam memeriksa SOP, memberi hasil penilaian, dan menentukan tindak lanjut dokumen. |

  ## PlantUML

  ```plantuml
  @startuml
  title Diagram Aktivitas - Mengevaluasi SOP

  |Evaluator|
  start
  :Membuka halaman daftar pengajuan evaluasi;

  |Sistem|
  :Memeriksa hak akses evaluator;
  :Menampilkan pengajuan SOP yang perlu dievaluasi;

  |Evaluator|
  :Memilih pengajuan evaluasi;

  |Sistem|
  :Menampilkan daftar SOP dalam pengajuan tersebut;

  |Evaluator|
  :Memilih SOP yang akan diperiksa;
  :Membaca dan menilai isi SOP;
  :Mengisi hasil penilaian;

  |Sistem|
  :Memeriksa kelengkapan hasil penilaian;
  if (SOP perlu diperbaiki?) then (Ya)
    |Evaluator|
    :Menulis komentar atau catatan perbaikan;
    |Sistem|
    :Memastikan catatan perbaikan sudah diisi;
    :Menyimpan hasil penilaian dan catatan perbaikan;
    :Membuka proses tindak lanjut untuk penyusun;
    :Mengubah status SOP menjadi revisi dari evaluator;
    :Menampilkan pemberitahuan bahwa hasil evaluasi tersimpan;
    stop
  else (Tidak)
    :Menyimpan hasil bahwa SOP sudah sesuai;
    :Mencatat riwayat penilaian;
  endif

  |Evaluator|
  if (Semua SOP dalam pengajuan sudah sesuai?) then (Ya)
    :Memilih aksi selesaikan evaluasi pengajuan;
    |Sistem|
    :Memastikan seluruh SOP telah dinilai sesuai;
    :Mengubah status pengajuan menjadi selesai dievaluasi;
    :Menampilkan pemberitahuan bahwa evaluasi selesai;
  else (Tidak)
    |Sistem|
    :Menampilkan SOP yang masih perlu dinilai atau diperbaiki;
  endif

  stop
  @enduml
  ```

****
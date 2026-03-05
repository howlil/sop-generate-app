# BPMN Alur Aplikasi Biro Organisasi

Dokumen ini berisi dua diagram BPMN (Business Process Model and Notation) untuk aplikasi manajemen SOP:

1. **BPMN Biro Organisasi Mengevaluasi SOP** — alur evaluasi SOP oleh Biro (Kepala Biro Organisasi + Tim Evaluasi).
2. **BPMN OPD Membuat SOP** — alur pembuatan SOP oleh OPD (Kepala OPD + Tim Penyusun).

Diagram menggunakan sintaks **PlantUML** (activity diagram dengan partition untuk swimlane). Sumber: status dan alur di `client/src/lib/types/sop.ts` dan `docs/WORKFLOW-LIFECYCLE.md`.

---

## 1. BPMN — Biro Organisasi Mengevaluasi SOP

**Ringkasan alur:** OPD mengajukan evaluasi atau Biro menginisiasi penugasan → Biro membuat penugasan & menugaskan Tim Evaluasi → Tim Evaluasi melaksanakan evaluasi (temuan, kesimpulan) → Kirim ke Biro → Kepala Biro verifikasi batch → Terverifikasi + Berita Acara. Jika hasil tidak sesuai, SOP kembali ke OPD untuk perbaikan.

```plantuml
  @startuml
  title BPMN - Biro Organisasi Mengevaluasi SOP
  skinparam activityBackgroundColor #E8F4FD
  skinparam activityBorderColor #1976D2
  skinparam partitionBorderColor #0D47A1

  |Kepala OPD|
  start
  :OPD memilih SOP yang akan dievaluasi;
  note right: Status SOP = Siap Dievaluasi\natau Berlaku
  :Ajukan Evaluasi;
  :SOP status = Diajukan Evaluasi;

  |#LightGray|Kepala Biro Organisasi|
  :Biro lihat daftar penugasan\n(Request OPD / Inisiasi Biro);
  :Buat penugasan evaluasi;
  :Pilih OPD, SOP, Tim Evaluasi;
  :Tugaskan tim evaluator;
  :SOP status = Dievaluasi Tim Evaluasi;

  |Tim Evaluasi|
  :Pelaksanaan evaluasi;
  :Isi temuan per bagian SOP;
  :Isi kesimpulan & rekomendasi;
  :Putuskan hasil: Sesuai / Perlu Perbaikan / Revisi Biro;

  if (Hasil per SOP?) then (Sesuai)
    :Kirim hasil ke Biro;
    |Kepala Biro Organisasi|
    :Terima hasil dari Tim Evaluasi;
    if (Semua SOP dalam batch Sesuai?) then (Ya)
      :Verifikasi Batch;
      :Buat Berita Acara;
      :Status penugasan = Terverifikasi;
      :SOP status = Terverifikasi dari Kepala Biro;
      stop
    else (Tidak)
      :Tinjau ulang / minta perbaikan;
      stop
    endif
  else (Perlu Perbaikan / Revisi Biro)
    :Kirim hasil ke Biro;
    |Kepala Biro Organisasi|
    :Status SOP = Revisi dari Tim Evaluasi;
    :OPD / Tim Penyusun perbaiki SOP;
    note right: Alur kembali ke OPD\n(SOP dibuat / direvisi)
    stop
  endif

  @enduml
```

**Keterangan singkat:**

| Elemen | Arti |
|--------|------|
| **Request OPD** | Kepala OPD mengajukan evaluasi dari Daftar SOP → status SOP = Diajukan Evaluasi. |
| **Inisiasi Biro** | Kepala Biro membuat penugasan sendiri (mis. evaluasi rutin), pilih OPD & SOP yang layak evaluasi. |
| **Satu SOP satu case aktif** | Satu SOP hanya boleh dalam satu evaluation case (Draft/Assigned/In Progress) pada satu waktu. |
| **Verifikasi Batch** | Hanya jika semua SOP dalam penugasan dinilai **Sesuai** → Berita Acara & status Terverifikasi. |

---

## 2. BPMN — OPD Membuat SOP

**Ringkasan alur:** Kepala OPD inisiasi proyek SOP dan menugaskan Tim Penyusun → Tim Penyusun menyusun draft → Serahkan ke Kepala OPD → Kepala OPD periksa (gateway: setuju/tidak) → Tidak setuju: Revisi dari Kepala OPD, Tim Penyusun perbaiki dan kirim lagi → Setuju: Siap Dievaluasi → (opsional) Ajukan Evaluasi ke Biro, atau Kepala OPD disahkan → Berlaku.

```plantuml
@startuml
title BPMN - OPD Membuat SOP
skinparam activityBackgroundColor #E8F5E9
skinparam activityBorderColor #2E7D32
skinparam partitionBorderColor #1B5E20

|Kepala OPD|
start
:Inisiasi proyek SOP;
:Isi judul, kategori, dasar hukum, unit;
:Pilih Tim Penyusun (assign);
:Simpan proyek;
:SOP status = Draft;

|Tim Penyusun|
:SOP muncul di "SOP Saya";
:Menyusun isi SOP\n(metadata, prosedur, diagram);
:Simpan draft;
:SOP status = Sedang Disusun;

if (Selesai menyusun?) then (Ya)
  :Serahkan ke Kepala OPD;
  :SOP status = Diperiksa Kepala OPD;
else (Belum)
  :Lanjutkan edit;
  stop
endif

|Kepala OPD|
:Review internal\n(periksa isi & komentar);

if (Keputusan?) then (Setuju)
  :SOP status = Siap Dievaluasi;
  if (Perlu evaluasi Biro?) then (Ya)
    :Ajukan Evaluasi;
    :SOP status = Diajukan Evaluasi;
    note right: Alur lanjut ke\nBiro Evaluasi SOP
    stop
  else (Tidak)
    :Disahkan;
    :SOP status = Berlaku;
    stop
  endif
else (Tidak setuju)
  :SOP status = Revisi dari Kepala OPD;
  :Beri komentar / arahan revisi;
  |Tim Penyusun|
  :Perbaiki sesuai arahan;
  :Serahkan lagi ke Kepala OPD;
  |Kepala OPD|
  :Review internal;
  note right: Kembali ke gateway\n"Keputusan?"
  stop
endif

@enduml
```

**Keterangan singkat:**

| Elemen | Arti |
|--------|------|
| **Initiate Proyek** | Halaman Kepala OPD: Initiate Proyek SOP; proyek baru muncul di Daftar SOP dengan status Draft. |
| **SOP Saya** | Tim Penyusun hanya melihat SOP yang ditugaskan kepadanya. |
| **Serahkan ke Kepala OPD** | Aksi "Kirim ke Review Internal" / Submit; status jadi Diperiksa Kepala OPD. |
| **Siap Dievaluasi** | Kepala OPD setuju; SOP bisa diajukan evaluasi ke Biro atau langsung disahkan (jika tidak wajib evaluasi). |
| **Berlaku** | SOP sudah disahkan; perubahan selanjutnya hanya lewat Revisi/Amendment (versi baru). |

---

## 3. Status SOP (Referensi)

| Status | Arti dalam alur |
|--------|------------------|
| Draft | Inisiasi OPD; belum disusun. |
| Sedang Disusun | Tim Penyusun mengerjakan draft. |
| Diperiksa Kepala OPD | Sudah diserahkan, menunggu review Kepala OPD. |
| Revisi dari Kepala OPD | Kepala OPD tidak setuju; Tim Penyusun perbaiki. |
| Siap Dievaluasi | Kepala OPD setuju; bisa ajukan evaluasi atau disahkan. |
| Diajukan Evaluasi | OPD sudah ajukan evaluasi; menunggu Biro buat penugasan. |
| Dievaluasi Tim Evaluasi | Sedang dievaluasi oleh Tim Evaluasi. |
| Revisi dari Tim Evaluasi | Hasil evaluasi tidak sesuai; OPD/penyusun perbaiki. |
| Terverifikasi dari Kepala Biro | Hasil evaluasi sesuai; bisa disahkan. |
| Berlaku | SOP disahkan (dokumen resmi). |
| Dicabut / Batal | SOP tidak berlaku. |

---

## 4. Cara Merender Diagram

- **PlantUML Online:** [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml/) — paste blok kode antara `@startuml` dan `@enduml`.
- **VS Code:** Ekstensi "PlantUML"; preview dengan Alt+D atau export PNG/SVG.
- **CLI:** `java -jar plantuml.jar docs/BPMN-ALUR-APLIKASI.md` (jika PlantUML mendukung ekstraksi dari markdown).

---

*Sumber alur: `docs/WORKFLOW-LIFECYCLE.md`, `client/src/lib/types/sop.ts`.*

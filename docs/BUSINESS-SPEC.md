# Business Specification - SOP Management System

Dokumen ini adalah sumber kebenaran bisnis untuk sistem manajemen SOP. Isi dokumen diselaraskan dengan implementasi client dan server saat ini:

- Skema utama: `server/prisma/schema.prisma`
- Server: modul `sop`, `evaluation`, `tte`, dan `core`
- Client: route dan DTO pada `client/src`

Setiap perubahan schema, alur status, endpoint, atau aturan akses wajib memperbarui dokumen ini.

## Daftar Isi

1. Domain Map
2. Aktor dan Peran
3. Master Data dan Akses
4. Authoring SOP
5. Evaluasi SOP
6. TTE dan Pengesahan
7. Arsip SOP Publik
8. Workflow Aplikasi
9. Konstanta dan Invariant
10. Acceptance Criteria

---

## 1. Domain Map

```text
Master & Akses
  - Pengguna
  - OPD
  - RiwayatOpdPengguna
  - Peraturan
  - Pelaksana

Authoring SOP
  - SOP
  - DetailSOP
  - Lampiran
  - DasarHukum
  - SopTerkait
  - LangkahSOP
  - DetailSOPPelaksana
  - KonfigurasiDiagramSOP
  - LogEditSOP

Evaluasi SOP
  - PengajuanEvaluasi
  - NilaiEvaluasi
  - LogNilaiEvaluasi

Legalisasi & TTE
  - DokumenTte
  - RiwayatTandaTangan
  - PIN TTE pada Pengguna

Arsip Publik
  - Publikasi SOP dengan DetailSOP.status = BERLAKU
```

---

## 2. Aktor dan Peran

Enum `PeranPengguna`:

| Peran | Kode | Tanggung jawab utama |
|---|---|---|
| PJ Evaluator Organisasi | `PJ_EVALUATOR` | Mengelola OPD/evaluator/penyusun, memantau dan menandatangani BA evaluasi. |
| Evaluator | `EVALUATOR` | Menilai SOP dalam pengajuan evaluasi dan menyelesaikan evaluasi. |
| Kepala OPD | `KEPALA_OPD` | Memantau SOP OPD, menandatangani SOP final, dan mencabut SOP berlaku. |
| PJ Penyusun | `PJ_PENYUSUN` | Mengelola pengajuan evaluasi OPD, menandatangani BA dari sisi OPD, dan mengirim ulang revisi. |
| Penyusun | `PENYUSUN` | Membuat, mengedit, dan menindaklanjuti revisi dokumen SOP. |

### 2.1 Kebutuhan fungsional resmi

Daftar lengkap No 1–24 (nama fungsional dan deskripsi) ada di [`docs/requirements.md`](requirements.md). Ringkasan use case per peran ada di [`docs/usecase.md`](usecase.md). Skenario detail per fitur di [`docs/usecase-scenario/README.md`](usecase-scenario/README.md).

### 2.2 Status SOP

Enum `StatusSOP`:

```text
DRAFT
SEDANG_DISUSUN
SIAP_DIEVALUASI
DIAJUKAN_EVALUASI
SEDANG_DIEVALUASI
REVISI_DARI_EVALUATOR
SIAP_DIVERIFIKASI
DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI
BERLAKU
DIGANTIKAN
DICABUT
```

Makna status:

| Status | Makna bisnis |
|---|---|
| `DRAFT` | Versi awal SOP, dapat diedit penyusun/PJ Penyusun. |
| `SEDANG_DISUSUN` | SOP dalam proses penyusunan dan dapat diedit. |
| `SIAP_DIEVALUASI` | Dokumen lengkap dan siap masuk pengajuan evaluasi. |
| `DIAJUKAN_EVALUASI` | Status transisi manual dari PJ Penyusun sebelum masuk pengajuan aktif. |
| `SEDANG_DIEVALUASI` | SOP sedang berada dalam pengajuan evaluasi aktif. |
| `REVISI_DARI_EVALUATOR` | Evaluator memberi hasil `PERLU_PERBAIKAN`; dokumen dapat diedit penyusun. |
| `SIAP_DIVERIFIKASI` | Semua nilai dalam pengajuan sudah `SESUAI`; menunggu TTE BA. |
| `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI` | BA sudah ditandatangani PJ Penyusun; SOP menunggu pengesahan Kepala OPD. |
| `BERLAKU` | SOP sudah disahkan Kepala OPD dan dapat muncul di arsip publik. |
| `DIGANTIKAN` | Versi yang sebelumnya berlaku otomatis digantikan saat versi baru disahkan. |
| `DICABUT` | Versi berlaku dicabut oleh Kepala OPD. |

Status yang editable di server dan client:

```text
DRAFT
SEDANG_DISUSUN
REVISI_DARI_EVALUATOR
```

Status terminal arsip:

```text
BERLAKU
DIGANTIKAN
DICABUT
```

### 2.2 Status Pengajuan Evaluasi

Enum `StatusPengajuanEvaluasi`:

```text
SEDANG_DIEVALUASI
SELESAI_DIEVALUASI
DIVERIFIKASI_PJ_EVALUATOR
DITANDATANGANI_PJ_PENYUSUN
SELESAI
```

Alur utama:

```text
SEDANG_DIEVALUASI
  -> SELESAI_DIEVALUASI
  -> DIVERIFIKASI_PJ_EVALUATOR
  -> DITANDATANGANI_PJ_PENYUSUN
  -> SELESAI
```

Status pengajuan aktif lintas jobdesk:

```text
SEDANG_DIEVALUASI
SELESAI_DIEVALUASI
DIVERIFIKASI_PJ_EVALUATOR
DITANDATANGANI_PJ_PENYUSUN
```

Satu OPD tidak boleh memiliki lebih dari satu pengajuan aktif dalam status di atas.

### 2.3 Hasil Evaluasi dan Tindak Lanjut

Enum `HasilEvaluasi`:

```text
SESUAI
PERLU_PERBAIKAN
```

Status tindak lanjut evaluasi memakai enum `StatusTindakLanjut` pada `NilaiEvaluasi.statusTindakLanjut`:

```text
TERBUKA
SELESAI
```

Umpan balik evaluasi resmi disimpan pada `NilaiEvaluasi.catatan` dan `NilaiEvaluasi.statusTindakLanjut`, bukan pada tabel komentar terpisah.

---

## 3. Master Data dan Akses

### 3.1 Pengguna, OPD, dan Riwayat OPD

Sumber akses aktif pengguna:

- `Pengguna.peran` menentukan jobdesk aktif.
- `Pengguna.opdId` menentukan OPD aktif pengguna.
- `Pengguna.deletedAt = null` berarti akun aktif.
- `RiwayatOpdPengguna` menyimpan riwayat OPD pengguna dengan composite primary key `(penggunaId, opdId)` dan flag `isAktif`.

`OPD` adalah tabel master atomik:

- `OPD` hanya menyimpan identitas OPD (`opdId`, `nama`, timestamps, `deletedAt`).
- `OPD` tidak menyimpan slot pengguna untuk Kepala OPD atau PJ Penyusun.
- Relasi pengguna aktif ke OPD ditentukan dari `Pengguna.opdId`.

Aturan peran per OPD:

- Satu OPD hanya boleh memiliki satu pengguna aktif dengan `peran = KEPALA_OPD`.
- Satu OPD hanya boleh memiliki satu pengguna aktif dengan `peran = PJ_PENYUSUN`.
- Pengguna dengan `peran = EVALUATOR` dan `PJ_EVALUATOR` adalah jobdesk Biro Organisasi secara bisnis; akses evaluasi mereka lintas OPD.

### 3.2 Manajemen OPD dan Pengguna

PJ Evaluator mengelola:

- Master OPD.
- Kepala OPD.
- Penyusun dan PJ Penyusun.
- Evaluator.

Mutasi pengguna:

- Membuat pengguna wajib menjaga `email` unik dan `nip` unik.
- Pindah OPD memperbarui `Pengguna.opdId` dan menyelaraskan `RiwayatOpdPengguna.isAktif`.
- Soft delete pengguna mengisi `deletedAt`; data historis SOP/evaluasi/tanda tangan tetap dipertahankan.

### 3.3 Peraturan dan Pelaksana

Peraturan:

- Kombinasi `(nomor, tahun)` unik.
- `lastEditedById` mencatat pengguna terakhir yang mengubah peraturan.
- OPD pemakai peraturan disimpan di junction `OPDPeraturan`.
- Dasar hukum SOP disimpan pada `DasarHukum(detailSopId, peraturanId)`.

Pelaksana:

- `Pelaksana` milik satu OPD.
- Swimlane SOP disimpan pada `DetailSOPPelaksana`.
- Langkah prosedur mengacu ke pelaksana eksekutor.

---

## 4. Authoring SOP

### 4.1 Pembuatan SOP

Endpoint utama:

| Method | Path | Peran | Fungsi |
|---|---|---|---|
| `POST` | `/sop` | `PENYUSUN`, `PJ_PENYUSUN` | Buat header SOP dan `DetailSOP` versi 1 status `DRAFT`. |
| `GET` | `/sop` | Semua peran utama | Daftar SOP versi terbaru sesuai akses. |
| `GET` | `/sop/penyusun-workbench/:detailSopId` | Semua peran utama | Ambil detail SOP, langkah, log edit, dan konfigurasi diagram. |

Saat SOP dibuat:

- Server mengambil `opdId` dari akun login.
- Server membuat `SOP` dan `DetailSOP` versi 1.
- `DetailSOP.status = DRAFT`.
- `DetailSOP.nomorSOP` wajib unik global.
- `DetailSOP.dibuatOlehId` mengacu ke pembuat.

### 4.2 Edit SOP

SOP hanya dapat diedit jika `DetailSOP.status` ada dalam:

```text
DRAFT
SEDANG_DISUSUN
REVISI_DARI_EVALUATOR
```

Endpoint edit utama:

| Method | Path | Fungsi |
|---|---|---|
| `PATCH` | `/sop/header/:detailSopId` | Edit judul, nomor SOP, nama lembaga, dasar hukum, SOP terkait, dan lampiran. |
| `PATCH` | `/sop/langkah/:detailSopId` | Replace-all pelaksana dan langkah prosedur yang dikirim. |
| `PATCH` | `/sop/diagram/:detailSopId` | Simpan konfigurasi diagram flowchart/BPMN. |

Aturan langkah:

- Urutan langkah harus stabil sesuai payload.
- Langkah `KEPUTUSAN` wajib memiliki cabang Ya dan Tidak.
- Cabang Ya/Tidak mengacu pada langkah lain di dokumen yang sama.
- Pelaksana pada langkah harus tersedia di swimlane/payload pelaksana.

### 4.3 Log Edit

`LogEditSOP` mencatat aktivitas perubahan SOP:

- Sumber bagian memakai enum `BagianSOP`: `HEADER`, `LANGKAH`, `STATUS`, `UMPAN_BALIK`, `EVALUASI`.
- Identitas log client adalah id komposit, bukan UUID surrogate.
- Server menggabungkan edit berdekatan dalam sesi log sesuai helper `log-edit-session`.

### 4.4 Transisi Manual SOP

Endpoint:

```text
PATCH /sop/status/:detailSopId
```

Transisi manual yang diizinkan:

| Target | Sumber | Peran | Catatan |
|---|---|---|---|
| `SIAP_DIEVALUASI` | `DRAFT`, `SEDANG_DISUSUN`, `REVISI_DARI_EVALUATOR` | `PENYUSUN`, `PJ_PENYUSUN` | Wajib lulus validasi kelengkapan dokumen. |
| `DIAJUKAN_EVALUASI` | `SIAP_DIEVALUASI` | `PJ_PENYUSUN` | Mengajukan SOP siap evaluasi. |
| `DICABUT` | `BERLAKU` | `KEPALA_OPD` | Sebaiknya melalui endpoint cabut khusus. |

Transisi ke `BERLAKU` tidak boleh melalui endpoint status manual. Pengesahan `BERLAKU` wajib melalui TTE Kepala OPD.

### 4.5 Revisi dari SOP Berlaku

Endpoint:

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/sop/:detailSopId/buat-versi-baru` | Membuat versi baru dari SOP `BERLAKU`, status awal `DRAFT`. |
| `DELETE` | `/sop/:detailSopId/versi-draft` | Menghapus versi draft hasil revisi yang belum masuk evaluasi. |
| `POST` | `/sop/cabut/:detailOrSopId` | Kepala OPD mencabut versi `BERLAKU`. |

Aturan:

- Versi baru menyimpan `revisiDariDetailSopId`.
- Versi baru menyalin isi dokumen dari versi `BERLAKU`.
- Tidak boleh membuat revisi baru jika masih ada revisi in-flight untuk SOP yang sama.
- Saat versi baru disahkan menjadi `BERLAKU`, versi `BERLAKU` lain pada SOP yang sama otomatis menjadi `DIGANTIKAN`.
- Pencabutan `BERLAKU` ditolak jika ada revisi in-flight.

---

## 5. Evaluasi SOP

### 5.1 Pengajuan Evaluasi

Endpoint:

| Method | Path | Peran | Fungsi |
|---|---|---|---|
| `GET` | `/evaluasi` | `PJ_EVALUATOR`, `EVALUATOR`, `PJ_PENYUSUN`, `KEPALA_OPD` | Daftar pengajuan. |
| `GET` | `/evaluasi/ringkas` | Sama | Daftar ringkas terpaginasi. |
| `GET` | `/evaluasi/:pengajuanEvaluasiId` | Sama | Detail pengajuan. |
| `POST` | `/evaluasi` | `PJ_PENYUSUN` | Membuka pengajuan evaluasi OPD sendiri. |

Aturan pembuatan pengajuan oleh PJ Penyusun:

- OPD diambil dari akun login.
- `sopDetailIds` wajib tidak kosong dan tidak duplikat.
- Semua detail SOP harus milik OPD pengguna.
- Semua detail SOP wajib berstatus `SIAP_DIEVALUASI`.
- OPD tidak boleh memiliki pengajuan aktif lain.
- Server membuat `PengajuanEvaluasi` status `SEDANG_DIEVALUASI`.
- Server membuat `NilaiEvaluasi` untuk setiap SOP.
- Server mengubah setiap `DetailSOP` dari `SIAP_DIEVALUASI` ke `SEDANG_DIEVALUASI`.
- Semua langkah di atas harus atomik dalam satu transaksi.

Jenis pengajuan:

| Jenis | Makna |
|---|---|
| `TERJADWAL` | Evaluasi formal; saat selesai wajib mengirim skor `nilaiOPD` integer 1-5. |
| `MANDIRI` | Evaluasi per dokumen; tidak memakai skor `nilaiOPD`. |

Workspace evaluator dapat membuat pengajuan `MANDIRI` otomatis jika evaluator membuka OPD yang belum punya pengajuan aktif dan ada SOP `SIAP_DIEVALUASI`.

### 5.2 Penilaian Per SOP

Endpoint:

```text
PATCH /evaluasi/:pengajuanEvaluasiId/nilai/:detailSopId
```

Peran:

```text
EVALUATOR
PJ_EVALUATOR
```

Aturan:

- Pengajuan harus berstatus `SEDANG_DIEVALUASI`.
- Baris `NilaiEvaluasi` harus ada untuk pasangan `(pengajuanEvaluasiId, detailSopId)`.
- Optimistic locking memakai `NilaiEvaluasi.version`.
- Setiap perubahan membuat `LogNilaiEvaluasi`.
- `PERLU_PERBAIKAN` wajib mengirim catatan.

Efek hasil:

| Hasil | Efek ke `NilaiEvaluasi` | Efek ke `DetailSOP` |
|---|---|---|
| `SESUAI` | `hasil = SESUAI`, tindak lanjut dikosongkan | Status dokumen tidak langsung berubah. |
| `PERLU_PERBAIKAN` | `hasil = PERLU_PERBAIKAN`, `statusTindakLanjut = TERBUKA` | Jika status dokumen `DIAJUKAN_EVALUASI` atau `SEDANG_DIEVALUASI`, ubah ke `REVISI_DARI_EVALUATOR`. |

### 5.3 Revisi Campuran dalam Satu Pengajuan

Contoh: ada 5 SOP dalam satu pengajuan, 1 perlu perbaikan.

1. Evaluator memberi SOP-A `PERLU_PERBAIKAN` dan catatan.
2. SOP-A menjadi `REVISI_DARI_EVALUATOR`; `NilaiEvaluasi.statusTindakLanjut = TERBUKA`.
3. Pengajuan tetap `SEDANG_DIEVALUASI`.
4. SOP-B sampai SOP-E tetap dapat dinilai `SESUAI`.
5. Penyusun/PJ Penyusun mengedit SOP-A.
6. Penyusun/PJ Penyusun menandai tindak lanjut selesai.
7. PJ Penyusun mengirim ulang SOP-A ke evaluator.
8. Evaluator menilai ulang SOP-A.
9. Pengajuan baru bisa diselesaikan setelah semua baris bernilai `SESUAI`.

Endpoint tindak lanjut:

```text
PATCH /evaluasi/:pengajuanEvaluasiId/nilai/:detailSopId/tindak-lanjut-selesai
```

Peran:

```text
PENYUSUN
PJ_PENYUSUN
```

Guard:

- Pengajuan harus `SEDANG_DIEVALUASI`.
- SOP harus milik OPD pengguna.
- Detail SOP harus `REVISI_DARI_EVALUATOR`.
- Nilai harus `PERLU_PERBAIKAN`.
- `statusTindakLanjut` harus `TERBUKA`.

Endpoint kirim ulang:

```text
POST /sop/penyusun-workbench/:detailSopId/kirim-ulang-evaluasi
```

Peran:

```text
PJ_PENYUSUN
```

Guard:

- Detail SOP harus `REVISI_DARI_EVALUATOR`.
- Umpan balik aktif harus `statusTindakLanjut = SELESAI`.
- Dokumen harus lengkap.
- Server menjalankan transisi revisi kembali ke jalur evaluasi dalam satu transaksi.

### 5.4 Selesai Evaluasi

Endpoint:

```text
PATCH /evaluasi/:pengajuanEvaluasiId/selesai
```

Peran:

```text
EVALUATOR
PJ_EVALUATOR
```

Guard:

- Pengajuan harus `SEDANG_DIEVALUASI`.
- Pengajuan harus memiliki minimal satu baris `NilaiEvaluasi`.
- Semua baris `NilaiEvaluasi.hasil` wajib `SESUAI`.
- Jika `jenis = TERJADWAL`, `nilaiOPD` wajib integer 1-5.
- Jika `jenis = MANDIRI`, request tidak boleh mengirim `nilaiOPD`.

Efek:

- Semua detail SOP dalam pengajuan dengan status `DIAJUKAN_EVALUASI`, `SEDANG_DIEVALUASI`, atau `REVISI_DARI_EVALUATOR` menjadi `SIAP_DIVERIFIKASI`.
- Pengajuan menjadi `SELESAI_DIEVALUASI`.
- `tanggalDiselesaikan`, `diselesaikanOlehId`, dan `version` diperbarui.

---

## 6. TTE dan Pengesahan

### 6.1 Kredensial TTE

PIN TTE disimpan langsung pada `Pengguna`:

- `ttePinHash`
- `ttePinSetAt`

Endpoint profil TTE:

| Method | Path | Fungsi |
|---|---|---|
| `GET` | `/tte/profil` | Ambil profil/kondisi PIN TTE pengguna. |
| `POST` | `/tte/profil` | Atur PIN TTE pertama kali. |
| `PATCH` | `/tte/profil/pin` | Ubah PIN TTE dengan PIN lama yang valid. |

Endpoint simulasi kompatibilitas:

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/tte/profil/verifikasi-email` | Membuat token simulasi. |
| `GET` | `/tte/profil/verifikasi-email` | Konfirmasi simulasi; tidak menjadi guard bisnis utama. |

Guard tanda tangan:

- Pengguna harus memiliki PIN TTE.
- PIN yang dikirim harus valid.
- Peran harus sesuai aksi tanda tangan.
- Satu dokumen tidak boleh ditandatangani dua kali oleh peran yang sama (`@@unique([dokumenTteId, peran])`).

### 6.2 TTE Berita Acara

Endpoint:

```text
POST /tte/tanda-tangani/ba/:pengajuanId
```

Alur:

| Peran | Status awal pengajuan | Status akhir pengajuan | Efek SOP |
|---|---|---|---|
| `PJ_EVALUATOR` | `SELESAI_DIEVALUASI` | `DIVERIFIKASI_PJ_EVALUATOR` | Tidak mengubah status SOP. |
| `PJ_PENYUSUN` | `DIVERIFIKASI_PJ_EVALUATOR` | `DITANDATANGANI_PJ_PENYUSUN` | Semua SOP dalam pengajuan dari `SIAP_DIVERIFIKASI` menjadi `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI`. |

`DokumenTte` BA memiliki parent `pengajuanEvaluasiId`.

### 6.3 Pengesahan SOP oleh Kepala OPD

Endpoint:

```text
POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua
```

Peran:

```text
KEPALA_OPD
```

Guard:

- Pengajuan harus milik OPD Kepala OPD.
- Pengajuan harus `DITANDATANGANI_PJ_PENYUSUN`.
- Semua SOP dalam pengajuan harus `DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI`.
- Transaksi harus atomik; jika satu SOP gagal, semua dibatalkan.

Efek:

- Setiap SOP dalam pengajuan dibuat/diupdate `DokumenTte` jenis `SOP_BERLAKU`.
- Setiap SOP ditandatangani Kepala OPD.
- Versi `BERLAKU` lain pada header SOP yang sama menjadi `DIGANTIKAN`.
- SOP yang ditandatangani menjadi `BERLAKU`.
- `tanggalEfektif` diisi tanggal pengesahan kalender WIB.
- Pengajuan menjadi `SELESAI`.

### 6.4 Tanda Tangan PDF

Endpoint:

```text
POST /tte/pdf/sign
POST /tte/pdf/sign-berita-acara-arsip   # Kepala OPD — unduhan BA arsip
GET  /tte/public/pdf-signing/status
POST /tte/public/pdf/verify
```

Server dapat menyisipkan tanda tangan digital PKCS#7 ke PDF jika sertifikat P12 dikonfigurasi melalui environment (`PDF_SIGNING_ENABLED=true`). Verifikasi publik PDF (CA internal) tersedia di halaman `/validasi/pdf` — bukan pengganti portal Komdigi.

**Kapan PKCS#7 di-inject:** saat **unduh PDF** di browser, bukan saat tombol "Tanda Tangan TTE" (metadata aplikasi + QR). PJ Evaluator/Penyusun memakai `POST /tte/pdf/sign` (riwayat TTE milik pengguna yang login). **Kepala OPD** memakai `POST /tte/pdf/sign-berita-acara-arsip` setelah kedua PJ menandatangani BA — agar PDF arsip dapat diverifikasi di `/validasi/pdf`. Setelah mengubah env signing, restart server Nest.

---

## 7. Arsip SOP Publik

Pengunjung anonim dapat membuka:

```text
/arsip
```

UI arsip:

- Satu halaman hub dengan daftar OPD, daftar SOP, dan pratinjau dokumen.
- Query URL menggunakan `opdId`, `detailSopId`, dan `q`.
- Pencarian global menampilkan SOP lintas OPD.
- Route lama `/arsip/:opdId` dan `/arsip/:opdId/:detailSopId` diarahkan ke hub `/arsip`.

API publik tanpa autentikasi:

| Method | Path | Data |
|---|---|---|
| `GET` | `/sop/public/opd` | OPD dengan minimal satu SOP `BERLAKU`. |
| `GET` | `/sop/public/sop` | Cari SOP `BERLAKU` lintas OPD. |
| `GET` | `/sop/public/opd/:opdId/sop` | SOP `BERLAKU` per OPD. |
| `GET` | `/sop/public/dokumen/:detailSopId` | Dokumen SOP `BERLAKU`. |

Tidak dipublikasikan:

- SOP selain `BERLAKU`.
- Log audit.
- Catatan evaluasi.
- Riwayat nilai.
- Data internal pengajuan.

---

## 8. Workflow Aplikasi

Bagian ini menjelaskan proses bisnis end-to-end dari sudut pandang pengguna aplikasi. Detail teknis endpoint, nama tabel, dan validasi field ada di bab sebelumnya; bagian ini fokus pada urutan kerja bisnis.

### 8.1 Workflow Setup Master Data

Tujuan: Biro Organisasi menyiapkan OPD dan akun pengguna agar tiap pihak dapat menjalankan tugasnya.

```text
PJ Evaluator
  -> menyiapkan daftar OPD
  -> menunjuk Kepala OPD untuk setiap OPD
  -> menunjuk PJ Penyusun dan Penyusun pada OPD terkait
  -> menyiapkan anggota Evaluator di Biro Organisasi
  -> OPD dan pengguna siap menggunakan aplikasi
```

Aturan bisnis:

- PJ Evaluator mengelola OPD, Kepala OPD, Penyusun/PJ Penyusun, dan Evaluator.
- Satu OPD hanya boleh memiliki satu Kepala OPD aktif.
- Satu OPD hanya boleh memiliki satu PJ Penyusun aktif.
- Jika pengguna pindah OPD, aplikasi menyimpan riwayat penempatannya.
- Jika pengguna dinonaktifkan, dokumen dan riwayat kerja yang pernah dibuat tetap tersimpan.
- Evaluator ditempatkan pada OPD Biro Organisasi dan dapat menangani evaluasi lintas OPD.

Hasil akhir:

- OPD sudah tersedia di sistem.
- Setiap OPD memiliki pejabat/penanggung jawab yang diperlukan.
- Penyusun bisa mulai membuat SOP.
- Evaluator bisa mulai menangani evaluasi SOP.

### 8.1.1 Workflow Referensi Peraturan

Tujuan: OPD menyiapkan daftar peraturan yang menjadi dasar hukum SOP.

```text
Penyusun/PJ Penyusun
  -> membuka menu Manajemen Peraturan
  -> menambahkan atau memperbarui peraturan
  -> aplikasi mengaitkan peraturan dengan OPD pengguna
  -> peraturan tersedia saat penyusun mengisi dasar hukum SOP
```

Aturan bisnis:

- Peraturan dikelola oleh Penyusun dan PJ Penyusun, bukan oleh PJ Evaluator.
- Peraturan yang tampil adalah peraturan yang terkait dengan OPD pengguna.
- Peraturan yang masih dipakai dalam SOP tidak boleh dihapus.

### 8.2 Workflow Penyusunan SOP Baru

Tujuan: OPD menyusun dokumen SOP sampai siap diperiksa evaluator.

```text
Penyusun/PJ Penyusun
  -> membuat SOP baru
  -> mengisi identitas SOP, dasar hukum, lampiran, dan SOP terkait
  -> mengisi pelaksana dan langkah prosedur
  -> menyesuaikan diagram bila diperlukan
  -> menandai dokumen siap dievaluasi
```

Mode kerja:

| Status SOP | Mode aplikasi | Aktor utama |
|---|---|---|
| `DRAFT` | Edit penuh | Penyusun, PJ Penyusun |
| `SEDANG_DISUSUN` | Edit penuh | Penyusun, PJ Penyusun |
| `SIAP_DIEVALUASI` | Isi dokumen tidak diedit lagi | Penyusun, PJ Penyusun |

Sebelum SOP ditandai siap dievaluasi, aplikasi memastikan:

- Header dan nomor SOP valid.
- Dasar hukum dan lampiran yang dibutuhkan sudah diisi.
- Pelaksana dan langkah prosedur sudah tersusun.
- Langkah keputusan memiliki jalur Ya dan Tidak.
- Dokumen dianggap lengkap oleh aturan aplikasi.

Hasil akhir:

- SOP masuk daftar dokumen yang siap diajukan untuk evaluasi.
- Penyusun tidak lagi mengubah isi dokumen kecuali SOP dikembalikan untuk revisi.

### 8.3 Workflow Pembukaan Pengajuan Evaluasi

Tujuan: PJ Penyusun mengirim satu atau lebih SOP yang sudah siap kepada evaluator.

```text
PJ Penyusun
  -> memilih SOP yang siap dievaluasi
  -> memilih jenis evaluasi
  -> membuka pengajuan evaluasi
  -> aplikasi memasukkan SOP terpilih ke antrian evaluasi
  -> evaluator melihat pengajuan tersebut di ruang kerja evaluasi
```

Aturan bisnis:

- Hanya PJ Penyusun yang dapat membuka pengajuan evaluasi untuk OPD sendiri.
- Satu OPD hanya boleh memiliki satu pengajuan yang masih berjalan.
- Pengajuan harus berisi minimal satu SOP.
- Semua SOP yang dipilih harus milik OPD pengguna.
- Semua SOP yang dipilih harus sudah siap dievaluasi.

Jenis pengajuan:

| Jenis | Kapan digunakan | Konsekuensi saat selesai |
|---|---|---|
| `TERJADWAL` | Evaluasi formal/periodik | Evaluator wajib mengisi skor OPD 1-5. |
| `MANDIRI` | Evaluasi per dokumen tanpa skor OPD | Evaluator tidak mengisi skor OPD. |

Catatan sesuai implementasi:

- PJ Penyusun dapat membuka pengajuan manual.
- Evaluator juga dapat memulai evaluasi mandiri dari ruang kerja evaluasi jika ada SOP siap dievaluasi dan OPD belum punya pengajuan aktif.

Hasil akhir:

- Pengajuan masuk antrian evaluator.
- SOP dalam pengajuan tidak dapat diedit selama proses evaluasi, kecuali evaluator meminta revisi.

### 8.4 Workflow Penilaian Evaluator

Tujuan: evaluator menilai setiap SOP dalam pengajuan dan menentukan apakah dokumen sesuai atau perlu revisi.

```text
Evaluator/PJ Evaluator
  -> membuka ruang kerja evaluasi
  -> memilih SOP dalam pengajuan aktif
  -> memberi keputusan Sesuai atau Perlu Perbaikan
  -> menulis catatan jika perlu perbaikan
  -> melanjutkan sampai semua SOP dalam pengajuan selesai dinilai
```

Cabang hasil evaluasi:

| Hasil | Proses bisnis | Status SOP |
|---|---|---|
| `SESUAI` | SOP dinyatakan memenuhi penilaian dokumen. | Tetap menunggu pengajuan selesai. |
| `PERLU_PERBAIKAN` | SOP dikembalikan ke penyusun dengan catatan. | Masuk mode revisi dari evaluator. |

Syarat selesai evaluasi:

- Semua SOP dalam pengajuan harus sudah dinyatakan sesuai.
- Tidak ada SOP yang masih perlu perbaikan.
- Untuk `TERJADWAL`, skor OPD 1-5 wajib diisi.
- Untuk `MANDIRI`, skor OPD tidak digunakan.

Hasil akhir selesai evaluasi:

- Pengajuan berpindah ke tahap menunggu verifikasi BA oleh PJ Evaluator.
- Semua SOP dalam pengajuan siap diverifikasi.
- Pengajuan siap ditandatangani PJ Evaluator.

### 8.5 Workflow Revisi dari Evaluator

Tujuan: menangani kasus satu atau lebih SOP dalam pengajuan perlu diperbaiki tanpa membatalkan seluruh pengajuan.

```text
Evaluator
  -> menandai SOP A perlu perbaikan
  -> menulis catatan revisi

Penyusun/PJ Penyusun
  -> memperbaiki SOP A sesuai catatan
  -> menandai bahwa catatan sudah ditindaklanjuti

PJ Penyusun
  -> mengirim ulang SOP A ke evaluator

Evaluator
  -> menilai ulang SOP A
  -> jika sudah sesuai, SOP A kembali dihitung sebagai selesai
```

Contoh batch 5 SOP, 1 revisi:

```text
SOP A perlu perbaikan, sehingga dikembalikan ke penyusun.
SOP B, C, D, dan E sudah sesuai.

Pengajuan tetap berjalan.
Evaluator belum boleh menyelesaikan pengajuan.
SOP A diperbaiki, ditandai selesai, dikirim ulang, lalu dinilai ulang.
Setelah SOP A juga sesuai, pengajuan bisa selesai.
```

Aturan bisnis:

- Penyusun dan PJ Penyusun boleh menandai tindak lanjut selesai.
- Hanya PJ Penyusun yang boleh mengirim ulang revisi ke evaluator.
- Kirim ulang ditolak jika catatan revisi belum ditandai selesai.
- Catatan evaluator tetap tersimpan sebagai riwayat evaluasi.
- Pengajuan tidak berubah menjadi selesai sampai semua SOP dinyatakan sesuai.

### 8.6 Workflow Verifikasi BA dan Pengesahan SOP

Tujuan: mengesahkan hasil evaluasi dan menerbitkan SOP berlaku.

```text
Evaluator
  -> menyelesaikan evaluasi
  -> pengajuan menunggu verifikasi PJ Evaluator
  -> SOP siap diverifikasi

PJ Evaluator
  -> memeriksa dan menandatangani Berita Acara evaluasi
  -> pengajuan menunggu tanda tangan PJ Penyusun
  -> status SOP belum berubah

PJ Penyusun
  -> menandatangani Berita Acara dari sisi OPD
  -> SOP masuk tahap menunggu pengesahan Kepala OPD

Kepala OPD
  -> mengesahkan semua SOP dalam pengajuan
  -> SOP menjadi berlaku
  -> pengajuan selesai
```

Dokumen yang ditandatangani:

| Tahap | Dokumen | Penandatangan |
|---|---|---|
| Verifikasi BA | Berita Acara Evaluasi | PJ Evaluator |
| Persetujuan BA OPD | Berita Acara Evaluasi yang sama | PJ Penyusun |
| Pengesahan SOP | SOP final | Kepala OPD |

Hasil akhir:

- Pengajuan evaluasi selesai setelah Kepala OPD mengesahkan SOP.
- SOP menjadi arsip resmi internal dan publik.
- Jika ada versi lama yang sebelumnya berlaku, versi lama otomatis menjadi versi yang digantikan.

### 8.7 Workflow Revisi SOP yang Sudah Berlaku

Tujuan: membuat revisi resmi atas SOP yang sudah disahkan tanpa mengubah versi berlaku sampai revisi baru disahkan.

```text
Penyusun/PJ Penyusun
  -> memilih SOP yang sedang berlaku
  -> membuat versi revisi
  -> menyusun perubahan pada versi baru
  -> mengajukan versi baru ke evaluasi
  -> versi baru melewati evaluasi dan pengesahan
  -> versi baru menjadi berlaku
  -> versi lama otomatis menjadi digantikan
```

Aturan bisnis:

- Versi lama tetap berlaku selama versi revisi masih disusun atau dievaluasi.
- Tidak boleh ada lebih dari satu revisi in-flight untuk SOP yang sama.
- Draft revisi boleh dihapus jika belum masuk pipeline evaluasi.
- Saat revisi baru disahkan, hanya satu versi yang boleh berstatus berlaku.

Hasil akhir:

- Versi baru menjadi SOP resmi.
- Versi lama tetap tersimpan sebagai riwayat.

### 8.8 Workflow Pencabutan SOP Berlaku

Tujuan: Kepala OPD mencabut SOP yang sudah berlaku.

```text
Kepala OPD
  -> membuka detail SOP yang berlaku
  -> memilih cabut SOP
  -> aplikasi memastikan tidak ada revisi yang masih berjalan
  -> SOP dicabut
```

Aturan bisnis:

- Hanya Kepala OPD pemilik OPD yang boleh mencabut SOP.
- Hanya SOP yang sedang berlaku yang dapat dicabut.
- Pencabutan ditolak jika masih ada versi revisi aktif.
- SOP yang dicabut tidak muncul di arsip publik.

Hasil akhir:

- SOP tidak berlaku lagi.
- Riwayat dokumen tetap tersimpan.

### 8.9 Workflow Arsip Publik

Tujuan: masyarakat/pengunjung melihat SOP yang sudah disahkan tanpa login.

```text
Pengunjung
  -> membuka /arsip
  -> memilih OPD atau melakukan pencarian global
  -> memilih SOP yang tersedia
  -> aplikasi menampilkan pratinjau dokumen
  -> pengunjung dapat mencetak dokumen
```

Aturan bisnis:

- Hanya SOP yang sudah berlaku yang dipublikasikan.
- SOP yang masih draft, disusun, dievaluasi, direvisi, digantikan, atau dicabut tidak muncul di arsip publik.
- Catatan evaluasi, log edit, log nilai, dan data internal pengajuan tidak dipublikasikan.

Hasil akhir:

- Arsip publik menjadi daftar SOP resmi yang masih berlaku.
- Pengunjung dapat mencari, melihat, dan mencetak SOP tanpa login.

### 8.10 Ringkasan Workflow Utama

```text
Setup master data
  -> Penyusun membuat dan melengkapi SOP
  -> Penyusun/PJ Penyusun menandai SOP siap dievaluasi
  -> PJ Penyusun membuka pengajuan evaluasi
  -> Evaluator menilai semua SOP
      -> jika perlu perbaikan: revisi, tindak lanjut, kirim ulang
      -> jika sesuai: lanjut
  -> Evaluator menyelesaikan evaluasi
  -> PJ Evaluator menandatangani BA
  -> PJ Penyusun menandatangani BA
  -> Kepala OPD mengesahkan SOP
  -> SOP berlaku
  -> SOP muncul di arsip publik
```

---

## 9. Konstanta dan Invariant

### 9.1 Pagination

Default umum:

```text
DEFAULT_PAGE = 1
DEFAULT_LIMIT = 10
MAX_LIMIT = 100
```

### 9.2 Invariant Database

Ringkasan unique constraint dan PK komposit — lihat juga [`server/prisma/DB-INVARIANTS.md`](../server/prisma/DB-INVARIANTS.md) untuk **trigger MySQL aktif** (tidak tercermin di Prisma schema).

#### 9.2.1 Trigger database (MySQL)

| Trigger | Aturan singkat |
|---------|----------------|
| `trg_detailsop_one_berlaku_*` | Maksimal satu `DetailSOP` berstatus `BERLAKU` per `sopId` |
| `trg_langkahsop_cabang_detail_*` | Cabang Ya/Tidak hanya ke langkah dalam `DetailSOP` yang sama |
| `trg_langkahsop_pelaksana_opd_*` | Pelaksana langkah harus dari OPD yang sama dengan SOP |
| `trg_detailsoppelaksana_pelaksana_opd_*` | Pelaksana swimlane harus se-OPD dengan SOP |
| `trg_dokumentte_satu_parent_*` | `DokumenTte`: tepat satu parent (`detailSopId` XOR `pengajuanEvaluasiId`) |
| `trg_sop_terkait_*` | Relasi SOP terkait tidak boleh self-loop; pasangan dua arah diizinkan |
| `trg_pengguna_singleton_pj_evaluator_*` | Hanya satu `PJ_EVALUATOR` aktif (`deletedAt IS NULL`) |

Slot Kepala OPD / PJ Penyusun **tidak** lagi disimpan di kolom `OPD`; invariant peran per OPD ditegakkan di aplikasi via `Pengguna.opdId` + `peran`.

#### 9.2.2 Unique index & PK

Invariant penting:

- `Pengguna.email` unik.
- `Pengguna.nip` unik.
- `Peraturan(nomor, tahun)` unik.
- `DetailSOP.nomorSOP` unik global.
- `DetailSOP(sopId, versi)` unik.
- `NilaiEvaluasi(pengajuanEvaluasiId, detailSopId)` composite primary key.
- `LogNilaiEvaluasi(pengajuanEvaluasiId, detailSopId, penggunaId, createdAt)` composite primary key.
- `RiwayatTandaTangan(userId, dokumenTteId)` composite primary key.
- `RiwayatTandaTangan(dokumenTteId, peran)` unik.
- `DokumenTte.detailSopId` unik.
- `DokumenTte.pengajuanEvaluasiId` unik.
- `DokumenTte` wajib memiliki tepat satu parent: `detailSopId` XOR `pengajuanEvaluasiId`.

Invariant bisnis:

- Satu OPD hanya boleh memiliki satu pengajuan evaluasi aktif lintas jobdesk.
- Satu detail SOP tidak boleh masuk ke lebih dari satu pengajuan aktif.
- Satu header SOP hanya boleh memiliki satu versi `BERLAKU`; versi lama menjadi `DIGANTIKAN` saat versi baru disahkan.
- Pengesahan `BERLAKU` hanya melalui TTE Kepala OPD.
- BA evaluasi harus ditandatangani berurutan: PJ Evaluator lalu PJ Penyusun.

### 9.3 Error Code Matrix

| Kode HTTP | Kondisi bisnis |
|---|---|
| `400` | Input tidak valid atau guard request gagal. |
| `401` | Autentikasi/PIN tidak valid. |
| `403` | Peran atau akses OPD tidak diizinkan. |
| `404` | Resource tidak ditemukan atau disembunyikan oleh aturan akses. |
| `409` | Konflik status, duplikasi, optimistic lock, atau invariant. |
| `422` | Validasi domain tidak terpenuhi pada endpoint tertentu. |
| `500` | Kesalahan sistem tidak terduga. |

---

## 10. Acceptance Criteria

### 10.1 Master Data dan Akses

**AC-USR-01: Buat pengguna berhasil**

```text
Given pengguna PJ Evaluator Organisasi berwenang
And email dan NIP belum digunakan
When pengguna dibuat dengan payload valid
Then response sukses
And Pengguna tersimpan dengan deletedAt = null
And Pengguna.opdId dan Pengguna.peran menjadi sumber akses aktif
```

**AC-USR-02: Email/NIP duplikat ditolak**

```text
Given email atau NIP sudah digunakan
When pengguna baru dibuat dengan email/NIP yang sama
Then request ditolak dengan konflik
And tidak ada pengguna baru tersimpan
```

**AC-USR-03: Riwayat OPD disinkronkan saat pindah OPD**

```text
Given pengguna aktif berada di OPD A
When pengguna dipindah ke OPD B
Then Pengguna.opdId menjadi OPD B
And RiwayatOpdPengguna OPD A menjadi tidak aktif
And RiwayatOpdPengguna OPD B menjadi aktif
```

### 10.2 Authoring SOP

**AC-SOP-01: Buat SOP baru**

```text
Given Penyusun atau PJ Penyusun login
When POST /sop dengan judul dan nomor SOP valid
Then SOP dibuat untuk OPD pengguna
And DetailSOP versi 1 dibuat dengan status DRAFT
And nomorSOP unik global
```

**AC-SOP-02: Edit hanya boleh pada status editable**

```text
Given DetailSOP berstatus DRAFT, SEDANG_DISUSUN, atau REVISI_DARI_EVALUATOR
When penyusun mengubah header atau prosedur
Then perubahan diterima

Given DetailSOP berstatus SIAP_DIEVALUASI atau lebih lanjut
When penyusun mengubah header atau prosedur
Then perubahan ditolak
```

**AC-SOP-03: Keputusan wajib punya cabang**

```text
Given DetailSOP editable
When PATCH /sop/langkah/:detailSopId mengirim langkah KEPUTUSAN tanpa cabang Ya atau Tidak
Then request ditolak
```

**AC-SOP-04: Tandai siap evaluasi**

```text
Given DetailSOP berstatus DRAFT, SEDANG_DISUSUN, atau REVISI_DARI_EVALUATOR
And dokumen lengkap
When PATCH /sop/status/:detailSopId dengan status SIAP_DIEVALUASI
Then status berubah menjadi SIAP_DIEVALUASI
```

**AC-SOP-05: Transisi status tidak valid ditolak**

```text
Given DetailSOP berstatus BERLAKU
When PATCH /sop/status/:detailSopId dengan status DRAFT
Then request ditolak dengan konflik
```

**AC-SOP-06: Buat versi baru dari SOP berlaku**

```text
Given DetailSOP berstatus BERLAKU
And tidak ada revisi in-flight untuk SOP yang sama
When POST /sop/:detailSopId/buat-versi-baru
Then versi baru dibuat dengan status DRAFT
And revisiDariDetailSopId mengarah ke versi BERLAKU sumber
```

**AC-SOP-07: Versi berlaku lama digantikan saat versi baru disahkan**

```text
Given SOP memiliki versi 1 berstatus BERLAKU
And versi 2 sudah siap disahkan Kepala OPD
When Kepala OPD menandatangani versi 2
Then versi 2 menjadi BERLAKU
And versi 1 menjadi DIGANTIKAN
```

**AC-SOP-08: Cabut SOP berlaku ditolak jika ada revisi in-flight**

```text
Given SOP memiliki versi BERLAKU
And ada versi revisi berstatus DRAFT atau status non-terminal lain
When Kepala OPD POST /sop/cabut/:detailOrSopId
Then request ditolak
```

### 10.3 Evaluasi SOP

**AC-EVL-01: Buka pengajuan evaluasi berhasil**

```text
Given PJ Penyusun login pada OPD A
And OPD A tidak memiliki pengajuan aktif
And semua sopDetailIds milik OPD A dan berstatus SIAP_DIEVALUASI
When POST /evaluasi dengan jenis TERJADWAL atau MANDIRI
Then PengajuanEvaluasi dibuat dengan status SEDANG_DIEVALUASI
And NilaiEvaluasi dibuat untuk setiap SOP
And semua SOP berubah menjadi SEDANG_DIEVALUASI
```

**AC-EVL-02: Pengajuan baru ditolak jika OPD punya pengajuan aktif**

```text
Given OPD A memiliki pengajuan status SEDANG_DIEVALUASI
When PJ Penyusun OPD A POST /evaluasi
Then request ditolak dengan konflik
And tidak ada pengajuan atau nilai baru dibuat
```

**AC-EVL-03: Pengajuan ditolak jika SOP tidak eligible**

```text
Given salah satu DetailSOP tidak berstatus SIAP_DIEVALUASI
When PJ Penyusun POST /evaluasi dengan detail tersebut
Then request ditolak
And transaksi dibatalkan seluruhnya
```

**AC-EVL-04: PERLU_PERBAIKAN wajib catatan**

```text
Given PengajuanEvaluasi berstatus SEDANG_DIEVALUASI
When Evaluator PATCH /evaluasi/:pengajuanId/nilai/:detailSopId dengan hasil PERLU_PERBAIKAN tanpa catatan
Then request ditolak
```

**AC-EVL-05: PERLU_PERBAIKAN membuka revisi**

```text
Given DetailSOP dalam pengajuan aktif berstatus SEDANG_DIEVALUASI
When Evaluator memberi hasil PERLU_PERBAIKAN dengan catatan
Then NilaiEvaluasi.hasil = PERLU_PERBAIKAN
And NilaiEvaluasi.statusTindakLanjut = TERBUKA
And DetailSOP.status = REVISI_DARI_EVALUATOR
And LogNilaiEvaluasi tercatat
```

**AC-EVL-06: Tindak lanjut selesai**

```text
Given DetailSOP berstatus REVISI_DARI_EVALUATOR
And NilaiEvaluasi.hasil = PERLU_PERBAIKAN
And statusTindakLanjut = TERBUKA
When Penyusun PATCH /evaluasi/:pengajuanId/nilai/:detailSopId/tindak-lanjut-selesai
Then statusTindakLanjut menjadi SELESAI
And ditindaklanjutiOlehId dan ditindaklanjutiPada terisi
```

**AC-EVL-07: Kirim ulang revisi hanya PJ Penyusun**

```text
Given DetailSOP berstatus REVISI_DARI_EVALUATOR
And statusTindakLanjut = SELESAI
And dokumen lengkap
When PJ Penyusun POST /sop/penyusun-workbench/:detailSopId/kirim-ulang-evaluasi
Then SOP kembali ke jalur evaluasi

When Penyusun biasa melakukan aksi yang sama
Then request ditolak
```

**AC-EVL-08: Selesai evaluasi ditolak jika ada nilai belum SESUAI**

```text
Given PengajuanEvaluasi status SEDANG_DIEVALUASI
And minimal satu NilaiEvaluasi belum SESUAI
When Evaluator PATCH /evaluasi/:pengajuanId/selesai
Then request ditolak
```

**AC-EVL-09: Selesai pengajuan terjadwal wajib skor OPD**

```text
Given PengajuanEvaluasi jenis TERJADWAL
And semua NilaiEvaluasi = SESUAI
When Evaluator PATCH /evaluasi/:pengajuanId/selesai tanpa nilaiOPD
Then request ditolak

When Evaluator mengirim nilaiOPD integer 1 sampai 5
Then pengajuan menjadi SELESAI_DIEVALUASI
And semua SOP menjadi SIAP_DIVERIFIKASI
```

**AC-EVL-10: Selesai pengajuan mandiri tidak memakai skor OPD**

```text
Given PengajuanEvaluasi jenis MANDIRI
And semua NilaiEvaluasi = SESUAI
When Evaluator PATCH /evaluasi/:pengajuanId/selesai dengan nilaiOPD
Then request ditolak

When Evaluator PATCH tanpa nilaiOPD
Then pengajuan menjadi SELESAI_DIEVALUASI
And nilaiOPD tetap null
```

### 10.4 TTE dan Pengesahan

**AC-TTE-01: Atur PIN TTE pertama kali**

```text
Given PJ Evaluator, PJ Penyusun, atau Kepala OPD belum memiliki PIN TTE
When POST /tte/profil dengan PIN valid
Then ttePinHash dan ttePinSetAt tersimpan pada Pengguna
And response mengembalikan profil TTE
```

**AC-TTE-02: Ubah PIN TTE**

```text
Given pengguna sudah memiliki PIN TTE
When PATCH /tte/profil/pin dengan PIN lama valid dan PIN baru valid
Then hash PIN diperbarui

When PIN lama salah
Then request ditolak
```

**AC-TTE-03: PJ Evaluator menandatangani BA**

```text
Given PengajuanEvaluasi status SELESAI_DIEVALUASI
And PJ Evaluator memiliki PIN TTE
When POST /tte/tanda-tangani/ba/:pengajuanId dengan PIN valid
Then DokumenTte BA dibuat atau diperbarui
And RiwayatTandaTangan peran PJ_EVALUATOR dibuat
And pengajuan menjadi DIVERIFIKASI_PJ_EVALUATOR
And status SOP tidak berubah
```

**AC-TTE-04: PJ Penyusun menandatangani BA**

```text
Given PengajuanEvaluasi status DIVERIFIKASI_PJ_EVALUATOR
And semua SOP terkait berstatus SIAP_DIVERIFIKASI
When PJ Penyusun POST /tte/tanda-tangani/ba/:pengajuanId dengan PIN valid
Then RiwayatTandaTangan peran PJ_PENYUSUN dibuat
And pengajuan menjadi DITANDATANGANI_PJ_PENYUSUN
And semua SOP menjadi DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI
```

**AC-TTE-05: Kepala OPD menandatangani semua SOP dalam pengajuan**

```text
Given PengajuanEvaluasi status DITANDATANGANI_PJ_PENYUSUN
And semua SOP berstatus DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI
When Kepala OPD POST /tte/tanda-tangani/pengajuan/:pengajuanId/sop-semua
Then setiap SOP menjadi BERLAKU
And tanggalEfektif terisi
And versi BERLAKU lama pada SOP yang sama menjadi DIGANTIKAN
And pengajuan menjadi SELESAI
```

**AC-TTE-06: Peran yang sama tidak bisa tanda tangan dua kali**

```text
Given RiwayatTandaTangan untuk dokumen dan peran tertentu sudah ada
When peran yang sama mencoba menandatangani dokumen yang sama
Then request ditolak dengan konflik
```

### 10.5 Arsip Publik

**AC-ARSIP-01: Daftar OPD publik hanya OPD dengan SOP berlaku**

```text
Given ada OPD dengan SOP BERLAKU dan OPD tanpa SOP BERLAKU
When pengunjung GET /sop/public/opd
Then hanya OPD dengan minimal satu SOP BERLAKU yang muncul
```

**AC-ARSIP-02: Cari SOP publik hanya mengembalikan BERLAKU**

```text
Given ada SOP DRAFT, DICABUT, DIGANTIKAN, dan BERLAKU
When pengunjung GET /sop/public/sop
Then hanya SOP BERLAKU yang dikembalikan
```

**AC-ARSIP-03: Dokumen non-BERLAKU tidak dipublikasikan**

```text
Given DetailSOP status bukan BERLAKU
When pengunjung GET /sop/public/dokumen/:detailSopId
Then response 404
```

**AC-ARSIP-04: Halaman /arsip memakai hub terpadu**

```text
Given pengunjung membuka /arsip
When memilih OPD atau SOP
Then daftar dan pratinjau diperbarui pada halaman yang sama
And URL dapat menyimpan opdId, detailSopId, atau q sebagai query
```

# Workflow & Lifecycle Aplikasi — Biro Organisasi

Dokumen ini meringkas alur kerja (workflow) dan siklus hidup (lifecycle) aplikasi berdasarkan analisis kode.

---

## 1. Arsitektur Ringkas

- **Client**: React + TanStack Router, state lokal + store in-memory (`penugasan-store`, `evaluation-case`).
- **Role**: Dipilih di landing (`/`), disimpan di `localStorage` (`lib/role.ts`). Empat role: **Kepala OPD**, **Kepala Biro Organisasi**, **Tim Evaluasi**, **Tim Penyusun**.
- **Route per role**: Setiap role punya layout sendiri dengan `beforeLoad` redirect jika role tidak sesuai.

---

## 2. Role & Halaman Utama

| Role | Path | Halaman utama |
|------|------|----------------|
| **Kepala OPD** | `/kepala-opd` | Manajemen Tim Penyusun, Manajemen Peraturan, Daftar SOP (+ Initiate Proyek, Detail SOP) |
| **Kepala Biro Organisasi** | `/kepala-biro-organisasi` | Manajemen OPD, Manajemen Tim Evaluasi, Manajemen Evaluasi SOP (Hasil Evaluasi lewat route terpisah) |
| **Tim Evaluasi** | `/tim-evaluasi` | Penugasan Evaluasi, Pelaksanaan Evaluasi (per id), Laporan |
| **Tim Penyusun** | `/tim-penyusun` | SOP Saya, Detail SOP (penyusun) |

---

## 3. Lifecycle SOP (Draft → Disahkan → Evaluasi)

### 3.1 Sumber inisiasi SOP

- **Kepala OPD** membuat **proyek SOP** lewat **Initiate Proyek** (`/kepala-opd/initiate-proyek`): pilih template/kopi, isi judul, kategori, dasar hukum, unit, **penyusun** (anggota tim), lalu simpan. Proyek ini yang nantinya jadi “SOP” yang dikerjakan Tim Penyusun.

### 3.2 Status SOP (single source of truth)

**Sumber:** `client/src/lib/sop-status.ts`. Semua aktor (Kepala OPD, Tim Penyusun, Biro) memakai daftar status yang sama; tidak ada status lain di luar ini.

Alur status SOP:

1. **Inisiasi OPD** → status **Draft**.
2. **Tim Penyusun** mengedit SOP: **Simpan sebagai draft** → **Sedang Disusun**; **Serahkan ke Kepala OPD** → **Diperiksa Kepala OPD**.
3. **Kepala OPD**: **Tidak setuju** (+ komentar) → **Revisi dari Kepala OPD**; **Setuju** → **Siap Dievaluasi**.
4. Hanya **Siap Dievaluasi** dan **Berlaku** yang boleh diajukan request evaluasi atau dipilih Biro.
5. **Request evaluasi (OPD)** → **Diajukan Evaluasi**. **Inisiasi Biro** → **Dievaluasi Tim Evaluasi**.
6. Hasil evaluasi tidak sesuai → **Revisi dari Tim Evaluasi**; sesuai → **Terverifikasi dari Kepala Biro**.
7. **Terverifikasi dari Kepala Biro** → Disahkan → **Berlaku**. Berlaku dapat **Dicabut** atau **Batal**.

Aturan singkat di kode:

- **Ajukan Evaluasi**: hanya jika status `Siap Dievaluasi` atau `Berlaku`. Setelah ajukan → `Diajukan Evaluasi`.
- **Disahkan**: hanya untuk status `Terverifikasi dari Kepala Biro` → status menjadi `Berlaku`.

Versioning (dari `constraint.md` dan **docs/SOP-VERSIONING.md**): draft = working copy; snapshot versi dibuat pada submit / ubah status penting / publish (Berlaku). **Revisi minor** (v1.0→v1.1) untuk perubahan sebelum disahkan; **revisi major** (v1.x→v2.0) ketika SOP disahkan lalu dievaluasi. Setelah Berlaku, perubahan hanya lewat Revisi/Amendment → versi baru.

### 3.3 Daftar Semua Status dalam Workflow

| Entitas | Status | Keterangan |
|--------|--------|------------|
| **SOP** (single source of truth) | `Draft` | Inisiasi OPD. |
| | `Sedang Disusun` | Tim penyusun simpan sebagai draft. |
| | `Diperiksa Kepala OPD` | Diserahkan ke Kepala OPD. |
| | `Revisi dari Kepala OPD` | Kepala OPD tidak setuju (+ komentar). |
| | `Siap Dievaluasi` | Kepala OPD setuju. Bisa diajukan evaluasi. |
| | `Berlaku` | Sudah disahkan. Bisa diajukan evaluasi ulang. |
| | `Diajukan Evaluasi` | OPD request evaluasi. |
| | `Dievaluasi Tim Evaluasi` | Sedang dievaluasi. |
| | `Revisi dari Tim Evaluasi` | Hasil evaluasi tidak sesuai. |
| | `Terverifikasi dari Kepala Biro` | Hasil evaluasi sesuai; bisa disahkan. |
| | `Dicabut` | SOP dicabut. |
| | `Batal` | SOP batal. |
| **Penugasan Evaluasi** (Biro) | `Belum Ditugaskan` | Baru dibuat, belum assign tim. |
| | `Sudah Ditugaskan` | Tim evaluator sudah ditugaskan. |
| | `Selesai` | Tim evaluasi sudah kirim hasil. |
| | `Terverifikasi` | Biro sudah verifikasi batch + BA. |
| **Evaluation Case** | `Draft` | Case baru. |
| | `Assigned` | Sudah ada tim evaluator. |
| | `In Progress` | Sedang dievaluasi. |
| | `Completed` | Evaluasi selesai. |
| | `Verified` | Sudah diverifikasi Biro. |
| **Hasil per-SOP dalam evaluasi** | `Sesuai` | SOP dinilai sesuai. |
| | `Perlu Perbaikan` | Ada temuan, perlu perbaikan. |
| | `Revisi Biro` | Perlu revisi (Biro lakukan perubahan). |
| **Peraturan** | `Berlaku` | Masih berlaku. |
| | `Dicabut` | Sudah dicabut. |
| **Tim Penyusun (anggota)** | `Aktif` | Masih aktif di OPD. |
| | `Nonaktif` | Nonaktif. |
| **Komentar (review)** | `open` | Belum ditindaklanjuti. |
| | `resolved` | Sudah ditindaklanjuti. |

### 3.4 Alur peran

1. **Kepala OPD**  
   - Initiate Proyek → assign ke **Tim Penyusun**.  
   - Lihat **Daftar SOP** (semua status), **Detail SOP**, **Review Internal**, **Ajukan Evaluasi**, **Disahkan**.

2. **Tim Penyusun**  
   - **SOP Saya**: daftar SOP yang ditugaskan ke dia (status draft / submitted / revision-needed / approved / completed).  
   - **Detail SOP**: edit draft, kirim ke review, lihat komentar.  
   - Status di sini bisa beda naming (draft, submitted, dll) tapi secara konsep mengalir ke “Review Internal” dan seterusnya di sisi Kepala OPD.

3. **Kepala OPD** (lanjutan)  
   - Setelah review internal → bisa **Ajukan Evaluasi** (SOP minta dievaluasi Biro) atau lanjut perbaikan.  
   - Setelah evaluasi dari Biro selesai (Sesuai/Terverifikasi) → Kepala OPD bisa **Disahkan**.

Lifecycle SOP: **Draft → Sedang Disusun / Diperiksa Kepala OPD → Revisi dari Kepala OPD / Siap Dievaluasi → Diajukan Evaluasi / Dievaluasi Tim Evaluasi → Revisi dari Tim Evaluasi / Terverifikasi dari Kepala Biro → Disahkan → Berlaku** (dapat Dicabut/Batal).

---

## 4. Workflow Pembuatan SOP (Detail)

Alur dari proyek kosong sampai SOP resmi (Berlaku):

1. **Inisiasi proyek (Kepala OPD)**  
   - Halaman: **Initiate Proyek SOP** (`/kepala-opd/initiate-proyek`).  
   - Kepala OPD mengisi: judul SOP, kategori, dasar hukum, unit terkait, **tim penyusun** (satu atau beberapa orang).  
   - Bisa salin dari template SOP OPD lain (judul + kategori).  
   - Setelah simpan → proyek muncul di **Daftar SOP** dengan status **Draft** (atau setara); Tim Penyusun yang ditugaskan melihatnya di **SOP Saya**.

2. **Penyusunan draft (Tim Penyusun)**  
   - Halaman: **SOP Saya** → **Detail SOP** (per dokumen).  
   - Tim Penyusun menyusun/ mengedit isi dokumen (working copy = draft).  
   - Status di sisi Tim Penyusun: **draft**.  
   - Bisa ada komentar review (open/resolved) antara penyusun dan Kepala OPD.

3. **Kirim ke review internal (Tim Penyusun)**  
   - Tim Penyusun mengirim draft ke Kepala OPD (aksi “Submit” / “Kirim ke Review Internal”).  
   - Status di Daftar SOP (Kepala OPD): **Review Internal**.  
   - Status di SOP Saya: **submitted**.

4. **Review internal (Kepala OPD)**  
   - Kepala OPD membuka **Daftar SOP** / **Detail SOP**, meninjau isi dan komentar.  
   - Keputusan:  
     - **Sesuai** → status SOP bisa ke **Sesuai** (siap diajukan evaluasi atau disahkan jika tidak wajib evaluasi).  
     - **Revisi Biro** / perlu perbaikan → status ke **Revisi Biro**; Tim Penyusun mendapat **revision-needed**, memperbaiki lalu kirim lagi (kembali ke Review Internal).

5. **Ajukan evaluasi (opsional, Kepala OPD)**  
   - Jika SOP wajib/ingin dievaluasi Biro: dari Daftar SOP, pilih SOP dengan status **Review Internal** atau **Revisi Biro** → **Ajukan Evaluasi**.  
   - Status SOP → **Diajukan Evaluasi**, lalu Biro membuat penugasan evaluasi → status → **Dalam Evaluasi**.

6. **Evaluasi oleh Biro & Tim Evaluasi**  
   - Biro membuat penugasan (pilih OPD, SOP, tim evaluator); satu SOP hanya satu case aktif.  
   - Tim Evaluasi mengerjakan pelaksanaan evaluasi, mengisi temuan dan kesimpulan (Sesuai / Revisi Biro), lalu **Kirim ke Biro**.  
   - Hasil per SOP: **Sesuai** | **Perlu Perbaikan** | **Revisi Biro**.  
   - Jika **Revisi Biro** / **Perlu Perbaikan** → OPD/penyusun perbaiki, bisa ajukan evaluasi lagi atau review internal lagi.

7. **Verifikasi & Disahkan**  
   - Jika semua SOP dalam batch **Sesuai** → Kepala Biro bisa **Verifikasi Batch** → status penugasan **Terverifikasi**, ada Berita Acara.  
   - Di Daftar SOP, SOP yang sudah **Sesuai** atau **Terverifikasi** bisa disahkan oleh **Kepala OPD** (aksi **Disahkan**).  
   - Setelah Disahkan → status SOP = **Disahkan** (dokumen resmi). Versioning: snapshot versi dibuat saat submit/ubah status penting/Disahkan; setelah Disahkan, perubahan hanya lewat Revisi/Amendment (versi baru).

Ringkas: **Initiate Proyek → Draft (Tim Penyusun) → Submit → Review Internal → (Ajukan Evaluasi → Dalam Evaluasi → Hasil Sesuai) → Sesuai/Terverifikasi → Disahkan (Kepala OPD)**.

---

## 5. Review SOP: SOP Baru vs SOP Lama (Revisi)

### 5.1 SOP baru (first time)

- **Definisi**: SOP yang baru pertama kali disusun (hasil Initiate Proyek), belum pernah Disahkan.  
- **Review yang berlaku**:  
  - **Review internal**: Kepala OPD meninjau draft dari Tim Penyusun. Status: Draft → Review Internal → Sesuai / Revisi Biro.  
  - **Evaluasi Biro** (jika diwajibkan/diajukan): setelah Review Internal atau Revisi Biro, OPD bisa **Ajukan Evaluasi**; Biro menugaskan Tim Evaluasi → hasil (Sesuai / Perlu Perbaikan / Revisi Biro) → jika Sesuai/Terverifikasi, Kepala OPD **Disahkan**.  
- **Posisi Tim Penyusun**: fokus menyusun dan merevisi draft; status di “SOP Saya”: draft → submitted → revision-needed (jika ada revisi) → approved/completed.

### 5.2 SOP lama (revisi / amendment)

- **Definisi**: SOP yang pernah **Disahkan** (sudah berlaku). Perubahan tidak boleh mengedit langsung; harus lewat **Revisi/Amendment** yang menciptakan **versi baru** (mis. v1.1 → v2.0).  
- **Constraint** (dari `constraint.md`): Setelah status tertentu (mis. Disahkan), dokumen tidak boleh diubah; perubahan hanya lewat proses Revisi/Amendment.  
- **Review yang berlaku**:  
  - **Review internal** tetap dipakai untuk draft revisi: Tim Penyusun menyusun versi baru → submit → Review Internal → Sesuai / Revisi Biro.  
  - **Evaluasi Biro**: sama seperti SOP baru; revisi bisa diajukan evaluasi, lalu Dalam Evaluasi → hasil → Sesuai/Terverifikasi → Disahkan (versi baru).  
- **Versioning**:  
  - Perubahan kecil (typo, penyesuaian minor): versi minor (v1.0 → v1.1).  
  - Perubahan besar (substansi, prosedur): buat versi major (v2.0); sistem menyalin data saat ini lalu membuat versi baru.

Jadi perbedaannya: **SOP baru** = siklus pertama dari proyek sampai Disahkan; **SOP lama** = sudah Disahkan, setiap perubahan lewat Revisi/Amendment dengan versi baru dan alur review/evaluasi yang sama (review internal + optional evaluasi Biro → Disahkan).

---

## 6. Lifecycle Evaluasi SOP

### 6.1 Sumber evaluasi (siapa yang trigger)

- **Inisiasi Biro**: Kepala Biro merencanakan evaluasi (misal quarterly), pilih OPD + SOP + Tim Evaluator.  
- **Request OPD**: OPD minta evaluasi (di UI Biro, OPD yang punya request tampil badge “Request Biro”; jenis penugasan otomatis “Request OPD”).

Constraint: **satu SOP hanya boleh punya satu evaluation case aktif** (Draft / Assigned / In Progress). Ini dijamin di `lib/evaluation-case.ts` (`getActiveCaseForSop`, `addEvaluationCase` cek konflik).

### 6.2 Entitas kunci

- **EvaluationCase** (`evaluation-case.ts`):  
  - `source_type`: `OPD_REQUEST` | `BIRO_INITIATIVE`  
  - `status`: Draft → Assigned → In Progress → Completed → Verified  
  - `sopIds`, `timEvaluator`, `opd`

- **Penugasan** (`penugasan-store.ts`):  
  - Dipakai Biro untuk list penugasan yang ditampilkan di Manajemen Evaluasi SOP.  
  - Punya `evaluationCaseId`, `jenis` (Inisiasi Biro | Request OPD), `status` (Belum Ditugaskan → Sudah Ditugaskan → Selesai → Terverifikasi).

Saat Biro “Tugaskan” di dialog Buat/Edit Perencanaan & Penugasan:  
- Dibuat **EvaluationCase** (kalau SOP belum dalam case aktif),  
- Dibuat/update **Penugasan** dengan `evaluationCaseId` dan status “Sudah Ditugaskan”.

### 6.3 Alur peran

1. **Kepala Biro Organisasi**  
   - **Manajemen Evaluasi SOP**: satu tabel (gabungan Inisiasi Biro & Request OPD), kolom “Jenis” menandakan asal.  
   - Buat penugasan: pilih OPD (badge “Request Biro” jika OPD request), pilih SOP (yang layak evaluasi), pilih Tim Monev, simpan → buat EvaluationCase + Penugasan.  
   - Edit penugasan: lewat dialog yang sama (popup), ubah OPD/SOP/tim/catatan.  
   - Detail penugasan: lihat SOP, status, tim; jika semua SOP “Sesuai” bisa **Verifikasi Batch** → buat Berita Acara.  
   - **Hasil Evaluasi** (halaman terpisah): lihat hasil evaluasi per batch, BA, verifikasi.

2. **Tim Evaluasi**  
   - **Penugasan**: daftar penugasan (di kode saat ini pakai data lokal; idealnya sinkron dengan `penugasan-store`/EvaluationCase).  
   - **Pelaksanaan Evaluasi** (`/tim-evaluasi/pelaksanaan/$id`): isi temuan per bagian SOP, kesimpulan, rekomendasi, status (Sesuai/Revisi Biro), simpan draft (localStorage), **Kirim ke Biro**.  
   - Setelah kirim → hasil masuk ke sisi Biro (Hasil Evaluasi / Manajemen Evaluasi SOP detail).

3. **Kepala Biro** (lanjutan)  
   - Setelah Tim Evaluasi kirim hasil → status penugasan/evaluasi bergerak ke Selesai.  
   - Jika semua SOP dalam batch “Sesuai” → Verifikasi Batch → status Terverifikasi, ada Nomor BA & Tanggal Verifikasi.

Jadi lifecycle evaluasi: **Biro buat penugasan (atau OPD request) → EvaluationCase Assigned/In Progress → Tim Evaluasi kerjakan & kirim hasil → Selesai → Biro Verifikasi Batch (optional) → Terverifikasi + BA**.

### 6.4 Cara menentukan “SOP mana yang akan dievaluasi” (status & alur)

Agar tidak bingung antara “20 SOP lama + 10 SOP baru, dipilih yang mana?”:

**Ya, harus ada status yang memastikan SOP ini (akan/sedang) dievaluasi.**

| Status SOP | Arti |
|------------|------|
| **Diajukan Evaluasi** | OPD sudah meminta evaluasi untuk SOP ini; menunggu Biro membuat penugasan. SOP **akan** dievaluasi (antrian request). |
| **Dalam Evaluasi** | SOP sudah masuk dalam satu evaluation case aktif; **sedang** dievaluasi oleh Tim Evaluasi. |

Dengan dua status ini, kita bisa bedakan: “SOP ini cuma layak evaluasi” vs “SOP ini memang **ditentukan** akan/sedang dievaluasi”.

---

#### Cara Kepala OPD menentukan SOP yang harus dievaluasi (Request dari OPD)

- Kepala OPD **tidak** “lihat semua list SOP lalu asal pilih”.
- Dari **Daftar SOP**, Kepala OPD memilih **per SOP** yang mau dievaluasi:
  - Hanya SOP dengan status **Review Internal** atau **Revisi Biro** yang bisa diklik **Ajukan Evaluasi**.
  - Setiap SOP yang diklik **Ajukan Evaluasi** lalu dikonfirmasi → status SOP berubah ke **Diajukan Evaluasi**.
- Jadi: **hanya SOP yang secara eksplisit diajukan** yang statusnya **Diajukan Evaluasi**. Itu daftar “SOP yang harus dievaluasi (request OPD)”.

Rekomendasi implementasi:

- Saat OPD konfirmasi **Ajukan Evaluasi**, update status SOP tersebut menjadi **Diajukan Evaluasi** dan simpan (state/API).
- Nanti Biro bisa memakai daftar “SOP dengan status **Diajukan Evaluasi**” sebagai sumber **Request dari OPD** (lihat bawah).

---

#### Cara Biro memilih SOP yang akan dievaluasi (bukan “asal pilih dari semua”)

**A. Request dari OPD**

- Biro tidak “lihat semua 20+10 SOP lalu pilih acak”.
- Sumber data: **SOP yang statusnya Diajukan Evaluasi** (OPD yang sudah ajukan).
- Alur yang disarankan:
  1. Daftar OPD yang punya **minimal satu SOP** dengan status **Diajukan Evaluasi** → tampil sebagai punya “Request Biro” (badge/ filter).
  2. Saat Biro pilih OPD tersebut dan buat penugasan jenis **Request OPD**:
     - Daftar SOP yang ditampilkan = **hanya SOP OPD itu yang statusnya Diajukan Evaluasi** (dan belum Dalam Evaluasi).
  3. Biro memilih dari daftar itu (bisa semua bisa sebagian) → buat penugasan. Setelah penugasan dibuat, SOP yang masuk case → status **Dalam Evaluasi**.

Jadi: **Biro memilih hanya dari SOP yang memang sudah “ditentukan” OPD (status Diajukan Evaluasi), bukan dari seluruh SOP.**

**B. Inisiasi Biro (quarterly / rutin)**

- Sumber: SOP yang **layak evaluasi** (biasanya status **Disahkan** atau **Terverifikasi**) dan **belum** dalam evaluation case aktif.
- Alur:
  1. Biro pilih **OPD** dulu.
  2. Sistem tampilkan **hanya SOP milik OPD tersebut** yang:
     - status = Disahkan atau Terverifikasi (layak evaluasi), dan
     - belum ada dalam evaluation case aktif (bukan Dalam Evaluasi).
  3. Biro memilih mana yang mau dievaluasi (bisa beberapa) → buat penugasan. SOP yang masuk case → status **Dalam Evaluasi**.

Jadi: **Bukan “gabungan 20 lama + 10 baru” tanpa aturan; filter dulu per OPD, lalu per kriteria (layak evaluasi & belum dalam evaluasi).**

---

#### Ringkas

| Pihak | Cara menentukan “SOP ini akan dievaluasi” |
|-------|------------------------------------------|
| **Kepala OPD** | SOP baru: dari Review Internal/Revisi Biro klik **Ajukan Evaluasi** (→ Diajukan Evaluasi). SOP lama: dari Disahkan/Terverifikasi klik **Ajukan Evaluasi** (→ Disahkan · Diajukan Evaluasi). |
| **Biro – Request OPD** | Lihat OPD yang punya SOP **Diajukan Evaluasi**; saat buat penugasan Request OPD, pilih **hanya SOP yang status Diajukan Evaluasi** untuk OPD itu. |
| **Biro – Inisiasi Biro** | Pilih OPD → tampilkan hanya SOP OPD itu yang **layak evaluasi** (Disahkan/Terverifikasi) dan **belum Dalam Evaluasi** → pilih yang mau dievaluasi. |

Status yang “mastiin” SOP ini (akan/sedang) dievaluasi: **Diajukan Evaluasi** (akan, request OPD) dan **Dalam Evaluasi** (sedang). Tanpa dua status ini, memang akan terasa “asal pilih dari list” saja.

**Catatan implementasi saat ini:** Di kode, daftar SOP di Biro (Manajemen Evaluasi SOP) saat ini memakai kriteria “layak evaluasi” (Disahkan/Terverifikasi) per OPD; daftar “Request OPD” belum di-drive dari status **Diajukan Evaluasi** per SOP. Disarankan: (1) saat OPD konfirmasi Ajukan Evaluasi, set status SOP = **Diajukan Evaluasi** dan persist; (2) di Biro, untuk jenis Request OPD, sumber daftar SOP = SOP yang status **Diajukan Evaluasi** per OPD (bukan semua SOP layak evaluasi); (3) untuk SOP lama, perlebar **canAjukanEvaluasi** agar mencakup status Disahkan dan Terverifikasi (OPD bisa "Minta evaluasi ulang").

---

#### SOP baru vs SOP lama: layak dievaluasi

| | SOP baru (belum pernah Disahkan) | SOP lama (sudah Disahkan/Terverifikasi) |
|---|----------------------------------|------------------------------------------|
| **Layak diajukan evaluasi?** | Dari Review Internal/Revisi Biro → **Ajukan Evaluasi** → status **Diajukan Evaluasi**. | **Layak evaluasi** = status **Disahkan** atau **Terverifikasi**. Kalau OPD request evaluasi ulang → **Ajukan Evaluasi** → status **Disahkan · Diajukan Evaluasi**. |
| **Siapa yang tentukan?** | OPD: dari Review Internal/Revisi Biro klik **Ajukan Evaluasi** (→ Diajukan Evaluasi). | **Inisiasi Biro**: Biro pilih OPD → tampilkan SOP yang Disahkan/Terverifikasi (belum Dalam Evaluasi) → pilih yang mau dievaluasi. **Request OPD**: OPD ajukan untuk SOP lama → status **Disahkan · Diajukan Evaluasi**; Biro pilih dari daftar itu. |
| **Status yang dipakai** | Review Internal/Revisi Biro → **Diajukan Evaluasi** (request) → **Dalam Evaluasi**. | **Disahkan**/Terverifikasi = layak. Request → **Disahkan · Diajukan Evaluasi** → **Dalam Evaluasi**. Biro tetap bisa pilih yang masih **Disahkan** (inisiasi); ada fitur **Riwayat evaluasi** per SOP. |

**SOP lama – OPD minta evaluasi (evaluasi ulang / periodik)**

- SOP lama (sudah Disahkan/Terverifikasi) kadang perlu dievaluasi lagi: misalnya setelah revisi, atau OPD minta pengecekan rutin.
- Maka **aksi "Ajukan Evaluasi"** sebaiknya juga tersedia untuk SOP dengan status **Disahkan** atau **Terverifikasi** (bukan hanya Review Internal / Revisi Biro).
- Aturan yang disarankan: **canAjukanEvaluasi** = Review Internal **atau** Revisi Biro **atau** Disahkan **atau** Terverifikasi. SOP baru = ajukan pertama kali; SOP lama = "Minta evaluasi ulang" / "Request evaluasi periodik".
- Setelah diajukan → status SOP (baru atau lama) = **Diajukan Evaluasi** → Biro buat penugasan Request OPD → status **Dalam Evaluasi**.

Jadi untuk SOP lama tidak perlu status tambahan "siap untuk dievaluasi": **Disahkan/Terverifikasi** = layak; kalau OPD mau minta evaluasi, pakai **Ajukan Evaluasi** → status **Disahkan · Diajukan Evaluasi** (SOP lama) atau **Diajukan Evaluasi** (SOP baru).

**Riwayat evaluasi di Biro:** Di dialog Buat/Edit Penugasan, tiap SOP punya ikon **Riwayat**. Klik → dialog menampilkan penugasan yang pernah memuat SOP tersebut (Selesai/Terverifikasi): OPD, jenis, tanggal, hasil SOP. Biro bisa cek riwayat sebelum memilih SOP agar tidak asal comot.

---

## 7. Manajemen OPD & Kepala OPD (Biro)

- **Manajemen OPD**: CRUD OPD; constraint: OPD yang sudah punya relasi (SOP, proyek, evaluasi) tidak boleh dihapus permanen, hanya nonaktif.  
- **Penugasan Kepala OPD**:  
  - Tabel berbasis **orang (Kepala OPD)**; satu orang maksimal satu jabatan aktif.  
  - **Tambah Penugasan**: hanya kepala baru (nama, email, OPD, mulai).  
  - **Pindah jabatan**: aksi per orang, pilih OPD tujuan (hanya OPD yang belum punya kepala).  
  - **Riwayat**: per orang lewat popup (dialog), tampil semua jabatan (OPD, mulai, selesai, status).  
- **Riwayat Kepala OPD** per OPD: dari dropdown OPD di Manajemen OPD → “Riwayat Kepala OPD”.

---

## 8. Manajemen Peraturan (Kepala OPD)

- Satu OPD hanya bisa mengedit peraturannya sendiri; peraturan lain hanya bisa dilihat.  
- Peraturan bersifat global (bisa dipakai di SOP OPD manapun).  
- Versioning peraturan; tidak bisa dihapus kalau sudah terkait SOP.  
- Perubahan UU tidak otomatis mengubah SOP; OPD harus update versi peraturan baru.

---

## 9. Diagram Alur Singkat

```
[Landing /] → Pilih Role → localStorage → Redirect ke dashboard role

Kepala OPD:
  Initiate Proyek → assign Tim Penyusun
  Daftar SOP: Draft → Review Internal → (Ajukan Evaluasi) → Dalam Evaluasi → Sesuai/Terverifikasi → Disahkan

Tim Penyusun:
  SOP Saya → Detail SOP → edit draft → Submit (ke Review Internal)

Kepala Biro:
  Manajemen OPD (CRUD OPD, Penugasan/Riwayat Kepala OPD)
  Manajemen Tim Evaluasi
  Manajemen Evaluasi SOP: Buat/Edit penugasan (pilih OPD, SOP, Tim) → EvaluationCase + Penugasan
  Hasil Evaluasi: lihat hasil, Verifikasi Batch, BA

Tim Evaluasi:
  Penugasan → Pelaksanaan Evaluasi (per id) → isi temuan/kesimpulan → Kirim ke Biro

Evaluasi (data):
  addEvaluationCase (cekV satu SOP satu case aktif)
  Penugasan (penugasan-store) ↔ EvaluationCase (evaluation-case.ts)
  Hasil dari Tim Evaluasi → status Selesai → Biro Verifikasi → Terverifikasi + BA
```

---

## 10. Catatan Implementasi

- **State**: Sebagian besar state di komponen (useState); daftar penugasan & evaluation case di modul global in-memory (`penugasan-store`, `evaluation-case`). Tidak ada backend nyata; data tidak persist antar reload kecuali role (localStorage) dan draft pelaksanaan evaluasi (localStorage).  
- **Sinkronisasi**: Daftar penugasan di **Tim Evaluasi** (PenugasanEvaluasi) saat ini memakai data lokal; untuk konsistensi penuh sebaiknya dibaca dari `penugasan-store` / EvaluationCase.  
- **Route edit penugasan**: Route `/kepala-biro-organisasi/manajemen-evaluasi-sop/edit/$id` masih ada; dari list, Edit membuka dialog (popup) yang sama dengan Buat. Akses langsung lewat URL edit bisa diarahkan ke index + buka dialog edit jika ingin satu pengalaman.

Dokumen ini bisa dipakai sebagai acuan untuk pengetesan alur, penambahan fitur, atau integrasi backend nanti.

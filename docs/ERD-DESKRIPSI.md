# Deskripsi ERD

Legenda delete behavior:
- **Cascade** → child ikut terhapus kalau parent dihapus
- **Restrict** → parent **tidak bisa dihapus** kalau masih ada child yang merujuk
- **SetNull** → FK di child jadi `NULL` kalau parent dihapus (child tetap ada)
- **opsional** → field FK boleh null (relasi tidak wajib)
- **wajib** → field FK tidak boleh null (relasi harus ada)

**Tabel junction** (conjunction/association table):
- Tabel perantara untuk relasi **many-to-many (M:N)** antara 2 entitas
- Primary key composite: kombinasi dari kedua FK
- Biasanya tidak punya field tambahan (murni penghubung), kecuali untuk metadata (misal: `urutan`)
- Dalam schema ini: `DasarHukum`, `SopTerkait`, `DetailSOPPelaksana`

---

## OPD

1. 1 OPD bisa punya banyak **Pengguna** — OPD tidak bisa dihapus kalau masih ada Pengguna (Restrict)
2. 1 OPD bisa punya banyak **SOP** — OPD tidak bisa dihapus kalau masih ada SOP (Restrict)
3. 1 OPD bisa punya banyak **Pelaksana** — OPD tidak bisa dihapus kalau masih ada Pelaksana (Restrict)
4. 1 OPD bisa punya banyak **AnggotaTimPenyusun** — OPD tidak bisa dihapus kalau masih ada anggota tim penyusun (Restrict)
5. 1 OPD bisa punya banyak **PengajuanEvaluasi** — OPD tidak bisa dihapus kalau masih ada pengajuan (Restrict)
6. 1 OPD bisa punya banyak **Peraturan** — OPD tidak bisa dihapus kalau masih ada Peraturan (Restrict)
7. 1 OPD hanya boleh punya 1 pengguna ber-peran `KEPALA_OPD` — **enforce di service layer** via SELECT FOR UPDATE; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-D]
8. 1 OPD hanya boleh punya 1 pengguna ber-peran `KOORDINATOR_TIM_PENYUSUN` — **enforce di service layer** via SELECT FOR UPDATE; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-D]
9. OPD mendukung soft-delete (`deletedAt`) — saat soft-delete, pastikan tidak ada pengajuan evaluasi aktif; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-G]

---

## Pengguna

1. 1 Pengguna boleh terhubung ke 1 OPD (opsional — `BIRO_ORGANISASI` tidak perlu OPD) — Pengguna tidak bisa dihapus kalau OPD-nya dihapus (Restrict)
2. 1 Pengguna bisa masuk banyak **AnggotaTimPenyusun** di OPD berbeda — Pengguna tidak bisa dihapus kalau masih tercatat di tim penyusun (Restrict)
3. 1 Pengguna bisa menjadi **AnggotaTimEvaluasi** (maksimal 1, `userId` unique) — Pengguna tidak bisa dihapus kalau masih tercatat sebagai anggota tim evaluasi (Restrict)
4. 1 Pengguna bisa punya 1 **KredensialTTE** (opsional, 1:1) — Pengguna tidak bisa dihapus kalau masih punya kredensial TTE (Restrict)
5. 1 Pengguna bisa punya banyak **RiwayatTandaTangan** — Pengguna tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
6. 1 Pengguna bisa membuat banyak **DetailSOP** (sebagai pembuat) — Pengguna tidak bisa dihapus kalau masih ada DetailSOP yang dibuat olehnya (Restrict)
7. 1 Pengguna bisa mengedit banyak **DetailSOP** (sebagai editor terakhir) — Pengguna tidak bisa dihapus kalau masih ada DetailSOP yang diedit olehnya (Restrict)
8. 1 Pengguna bisa memverifikasi banyak **PengajuanEvaluasi** (opsional) — Pengguna tidak bisa dihapus kalau masih ada pengajuan yang diverifikasinya (Restrict)
9. 1 Pengguna bisa menandatangani banyak **PengajuanEvaluasi** sebagai koordinator (opsional) — Pengguna tidak bisa dihapus kalau masih ada pengajuan yang ditandatanganinya (Restrict)
10. 1 Pengguna bisa mendapat banyak **NilaiEvaluasi** sebagai penilai terakhir (opsional) — kalau Pengguna dihapus, `dinilaiOlehId` jadi NULL (SetNull)
11. 1 Pengguna bisa membuat banyak **Komentar** — Pengguna tidak bisa dihapus kalau masih ada komentar (Restrict)
12. 1 Pengguna (Tim Penyusun) bisa punya banyak **LogEditSOP** sebagai editor — Pengguna tidak bisa dihapus kalau masih ada log edit SOP (Restrict)
13. Pengguna mendukung soft-delete (`deletedAt`) — saat soft-delete, nonaktifkan semua keanggotaan tim terlebih dahulu; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-G]
14. `nip` bersifat **unique global** — setiap pegawai hanya bisa terdaftar satu kali berdasarkan NIP
15. Constraint 1 KEPALA_OPD dan 1 KOORDINATOR_TIM_PENYUSUN per OPD di-enforce di service layer — lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-D]

---

## Peraturan

1. Milik 1 **OPD** (wajib) — dibuat dan dikelola oleh Tim Penyusun OPD yang bersangkutan; OPD tidak bisa dihapus kalau masih ada Peraturan (Restrict)
2. 1 Peraturan bisa menjadi dasar hukum di banyak **DetailSOP** via tabel `DasarHukum` (M:N) — Peraturan tidak bisa dihapus kalau masih dipakai sebagai dasar hukum (Restrict)
3. **Akses OPD-scoped** — Tim Penyusun hanya bisa melihat dan mengelola Peraturan milik OPD-nya sendiri; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-H]
4. **Scope DasarHukum** — Peraturan hanya boleh dipakai sebagai dasar hukum untuk SOP dari OPD yang sama; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-F]
5. Status: `BERLAKU` / `DICABUT`
6. Unique: `[opdId, nomor, tahun]` — dalam satu OPD, tidak boleh ada dua peraturan dengan nomor dan tahun yang sama (OPD berbeda boleh punya nomor peraturan yang sama)
7. Peraturan berstatus `DICABUT` tidak boleh dijadikan DasarHukum untuk SOP baru — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-F]

---

## SOP

1. Milik 1 **OPD** (wajib) — OPD tidak bisa dihapus kalau masih ada SOP (Restrict)
2. 1 SOP bisa punya banyak **DetailSOP** (versi dokumen) — kalau SOP dihapus, semua DetailSOP-nya ikut terhapus (Cascade)
3. **SOP hanya bisa dihapus kalau:**
   - Semua `DetailSOP` belum ada relasi `TandaTanganTTE` (belum ditandatangani)
   - Semua `DetailSOP` belum ada relasi `NilaiEvaluasi` (belum dievaluasi)
   - Status masih `DRAFT` atau `SEDANG_DISUSUN` (belum diajukan evaluasi)
4. **SOP tidak bisa dihapus kalau:**
   - Sudah ditandatangani (`TandaTanganTTE` ada) — Restrict
   - Sudah dievaluasi (`NilaiEvaluasi` ada) — Restrict
   - Sudah berlaku (`BERLAKU` atau `DICABUT`) — gunakan status `DICABUT`, bukan hard-delete

---

## DetailSOP

1. Milik 1 **SOP** (wajib) — kalau SOP dihapus, DetailSOP ikut terhapus (Cascade)
2. Bisa disalin dari 1 **DetailSOP** lain (self-referential, opsional) — kalau sumber dihapus, `salinDariDetailSopId` jadi NULL (SetNull); DetailSOP hasil salinan tetap ada. Saat salin, service layer **wajib** menghasilkan `nomorSOP` baru — lihat `docs/SCHEMA-CONSTRAINTS.md` [P3-B]
3. Dibuat oleh 1 **Pengguna** (opsional) — Pengguna tidak bisa dihapus kalau masih ada DetailSOP yang dibuatnya (Restrict)
4. Diedit terakhir oleh 1 **Pengguna** (opsional) — Pengguna tidak bisa dihapus kalau masih ada DetailSOP yang dieditnya (Restrict)
5. 1 DetailSOP punya banyak **LampiranTeks** — kalau DetailSOP dihapus, semua lampiran ikut terhapus (Cascade)
6. 1 DetailSOP punya banyak **DasarHukum** (junction ke Peraturan) — kalau DetailSOP dihapus, semua dasar hukumnya ikut terhapus (Cascade)
7. 1 DetailSOP punya banyak **LangkahSOP** — kalau DetailSOP dihapus, semua langkah ikut terhapus (Cascade). **Perhatian:** service layer wajib hapus DiagramEdge + DiagramNodePosition dulu sebelum DetailSOP di-delete — lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
8. 1 DetailSOP punya banyak **DiagramLayout** — kalau DetailSOP dihapus, semua layout ikut terhapus (Cascade); DiagramEdge dan DiagramNodePosition ikut terhapus via DiagramLayout
9. 1 DetailSOP punya banyak **Swimlanes** (daftar pelaksana untuk kolom vertikal) — kalau DetailSOP dihapus, daftar swimlane ikut terhapus (Cascade)
10. 1 DetailSOP bisa terhubung ke banyak **SopTerkait** (M:N self-referential via SopTerkait) — kedua sisi: kalau DetailSOP dihapus, relasi SopTerkait ikut terhapus (Cascade)
11. 1 DetailSOP bisa punya **RiwayatTandaTangan** per peran (KEPALA_OPD saja untuk SOP) — DetailSOP tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
12. 1 DetailSOP bisa punya banyak **NilaiEvaluasi** — DetailSOP tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
13. 1 DetailSOP bisa punya banyak **LogEditSOP** — riwayat kolaborasi Tim Penyusun; kalau DetailSOP dihapus, log-nya ikut terhapus (Cascade)
14. 1 DetailSOP bisa punya banyak **Komentar** — kalau DetailSOP dihapus, semua komentar ikut terhapus (Cascade)
15. Unique: `nomorSOP` (global), `[sopId, versi]`
16. **Hanya boleh ada 1 DetailSOP dengan status BERLAKU per SOP** — enforce via MySQL trigger + service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-B]
17. Status lifecycle:
    ```
    DRAFT → SEDANG_DISUSUN → SIAP_DIEVALUASI → DIAJUKAN_EVALUASI
    → SEDANG_DIEVALUASI → REVISI_DARI_TIM_EVALUASI → (kembali ke SEDANG_DISUSUN)
    → SIAP_DIVERIFIKASI → DIVERIFIKASI_BIRO_ORGANISASI → BERLAKU
    BERLAKU → DIGANTIKAN  (otomatis saat versi baru berlaku)
    BERLAKU → DICABUT     (manual, administratif)
    ```
    `DIGANTIKAN` dan `DICABUT` adalah terminal — tidak bisa diubah; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-D]

---

## LampiranTeks

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, LampiranTeks ikut terhapus (Cascade)
2. Diskriminator `jenis` membedakan 4 kategori: `PERINGATAN` / `KUALIFIKASI_PELAKSANAAN` / `PERALATAN` / `PENCATATAN_PENDATAAN`
3. Menggabungkan 4 tabel yang strukturnya identik menjadi 1 tabel

---

## DasarHukum

1. **Tabel junction** antara **DetailSOP** dan **Peraturan** (M:N)
2. PK composite: `[sopDetailId, peraturanId]` — satu baris untuk satu pasangan SOP-Peraturan
3. DetailSOP dihapus → baris DasarHukum ikut terhapus (Cascade)
4. Peraturan tidak bisa dihapus kalau masih dipakai sebagai dasar hukum (Restrict)
5. Tidak ada field tambahan selain FK — murni tabel penghubung
6. Peraturan berstatus `DICABUT` tidak boleh ditambahkan — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-F]

---

## SopTerkait

1. **Tabel junction** self-referential **DetailSOP** ↔ **DetailSOP** (M:N)
2. PK composite: `[sopDetailId, sopTerkaitDetailId]` — satu baris untuk satu pasangan SOP terkait
3. Salah satu atau kedua sisi dihapus → baris SopTerkait ikut terhapus (Cascade)
4. Tidak ada field tambahan selain FK — murni tabel penghubung
5. **Constraint (service layer):** `sopDetailId ≠ sopTerkaitDetailId` — SOP tidak boleh terkait dengan dirinya sendiri
6. **Constraint (service layer):** tidak boleh ada `(A→B)` jika `(B→A)` sudah ada — lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-E]

---

## LangkahSOP

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua langkah ikut terhapus (Cascade)
2. Self-referential `langkahSelanjutnyaYaId` (opsional) — kalau langkah tujuan dihapus, field jadi NULL (SetNull)
3. Self-referential `langkahSelanjutnyaTidakId` (opsional) — kalau langkah tujuan dihapus, field jadi NULL (SetNull); hanya dipakai oleh langkah bertipe `DECISION`
4. Terhubung ke 1 **Pelaksana** (wajib — semua langkah termasuk START/END harus punya pelaksana) — Pelaksana tidak bisa dihapus kalau masih dipakai di langkah (Restrict). **Pelaksana wajib terdaftar di swimlane `DetailSOPPelaksana`** — lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-C]
5. 1 LangkahSOP bisa punya banyak **DiagramNodePosition** — **onDelete: Restrict** (bukan Cascade). Service layer wajib hapus DiagramNodePosition sebelum hapus LangkahSOP; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
6. 1 LangkahSOP bisa menjadi sumber banyak **DiagramEdge** — **onDelete: Restrict** (bukan Cascade). Service layer wajib hapus DiagramEdge sebelum hapus LangkahSOP; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
7. 1 LangkahSOP bisa menjadi tujuan banyak **DiagramEdge** — **onDelete: Restrict** (bukan Cascade). Service layer wajib hapus DiagramEdge sebelum hapus LangkahSOP; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
8. Unique: `[sopDetailId, urutan]` — tidak boleh ada 2 langkah dengan urutan sama dalam 1 DetailSOP
9. Jenis dan aturan cabang (enforce via CHECK constraint + service layer):
   - `TERMINATOR`: kedua `langkahSelanjutnya*` harus NULL (node akhir)
   - `TASK`: hanya `langkahSelanjutnyaYaId` boleh diisi
   - `DECISION`: keduanya boleh diisi
   Lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-A]
10. Self-referential FK dapat menciptakan siklus — deteksi dan cegah di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P3-A]

---

## DiagramLayout

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua layout ikut terhapus (Cascade)
2. 1 DiagramLayout punya banyak **DiagramNodePosition** (delta posisi manual) — kalau layout dihapus, semua posisi ikut terhapus (Cascade). **Ini adalah primary delete path untuk DiagramNodePosition**
3. 1 DiagramLayout punya banyak **DiagramEdge** (delta routing manual) — kalau layout dihapus, semua edge ikut terhapus (Cascade). **Ini adalah primary delete path untuk DiagramEdge**
4. Unique: `[sopDetailId, jenis, versiLayout]`
5. Jenis: `FLOWCHART` / `BPMN`
6. Hanya menyimpan delta (override manual); posisi/routing yang tidak ada baris = auto-layout di aplikasi
7. **Rendering config** — disimpan sebagai kolom terpisah (tidak ada JSON):
   - `gayaPanah` (enum `GayaPanah`, nullable, default `STRAIGHT`) — style connector antar node: `STRAIGHT` / `ORTHOGONAL`
   - `langkahPerHalaman` (Int, nullable, default 10) — jumlah langkah nominal per halaman cetak A4; null = hitung otomatis
   - `lebarAreaKegiatan` (Int, nullable) — lebar kolom "Kegiatan" dalam diagram (px); null = auto-fit; **berbeda** dari `DetailSOP.lebarKolomKegiatan` yang berlaku untuk format tabel cetak
8. `layoutSeed` (Int, default 0) — seed untuk engine auto-layout; di-increment saat user klik "Perbaiki Diagram" agar engine menghasilkan layout baru

---

## DiagramNodePosition

1. PK composite: `[diagramLayoutId, langkahSopId]`
2. Milik 1 **DiagramLayout** (wajib) — kalau layout dihapus, posisi ikut terhapus (Cascade) — **primary delete path**
3. Merujuk 1 **LangkahSOP** (wajib) — **onDelete: Restrict** (tidak ikut terhapus otomatis saat LangkahSOP dihapus). Service layer wajib hapus DiagramNodePosition sebelum hapus LangkahSOP untuk menghindari multi-path cascade deadlock; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
4. Baris hanya ada kalau user memindahkan node secara manual dari hasil auto-layout
5. Validasi: `langkahSopId` harus berasal dari `DetailSOP` yang sama dengan `DiagramLayout` — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-C]

---

## DiagramEdge

1. Milik 1 **DiagramLayout** (wajib) — kalau layout dihapus, edge ikut terhapus (Cascade) — **primary delete path**
2. Merujuk 1 **LangkahSOP** sumber (`dariLangkah`, wajib) — **onDelete: Restrict**. Service layer wajib hapus DiagramEdge sebelum hapus LangkahSOP; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
3. Merujuk 1 **LangkahSOP** tujuan (`keLangkah`, wajib) — **onDelete: Restrict**. Service layer wajib hapus DiagramEdge sebelum hapus LangkahSOP; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-A]
4. 1 DiagramEdge punya banyak **DiagramEdgePoint** — kalau edge dihapus, semua titik ikut terhapus (Cascade)
5. Unique: `[diagramLayoutId, dariLangkahId, keLangkahId, cabang]`
6. Cabang: `DEFAULT` / `YA` / `TIDAK` — membedakan dua edge dari node `DECISION` ke tujuan berbeda
7. `labelTeks`, `labelX`, `labelY` opsional (untuk label kustom BPMN)
8. Baris hanya ada kalau user mengubah jalur panah secara manual
9. Validasi: `dariLangkahId` dan `keLangkahId` harus dari `DetailSOP` yang sama dengan `DiagramLayout` — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-C]

---

## DiagramEdgePoint

1. PK composite: `[diagramEdgeId, urutan]`
2. Milik 1 **DiagramEdge** (wajib) — kalau edge dihapus, semua titik ikut terhapus (Cascade)
3. Menyimpan titik-titik polyline untuk routing arrow kustom, diurutkan berdasarkan `urutan`

---

## Pelaksana

1. Milik 1 **OPD** (wajib) — OPD tidak bisa dihapus kalau masih ada Pelaksana (Restrict)
2. 1 Pelaksana bisa terhubung ke banyak **LangkahSOP** — Pelaksana tidak bisa dihapus kalau masih dipakai di langkah SOP (Restrict)
3. 1 Pelaksana bisa terdaftar di banyak **DetailSOPPelaksana** (daftar kolom swimlane) — Pelaksana tidak bisa dihapus kalau masih terdaftar di DetailSOP (Restrict)

---

## DetailSOPPelaksana (Swimlane)

1. **Tabel junction** antara **DetailSOP** dan **Pelaksana**
2. PK composite: `[sopDetailId, pelaksanaId]` — satu baris untuk satu pasangan SOP-Pelaksana
3. DetailSOP dihapus → baris ikut terhapus (Cascade)
4. Pelaksana tidak bisa dihapus kalau masih terdaftar di DetailSOP (Restrict)
5. Field `urutan` menentukan urutan kolom swimlane pada diagram
6. **Invariant:** setiap `LangkahSOP.pelaksanaId` harus terdaftar di `DetailSOPPelaksana` untuk `DetailSOP` yang sama — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-C]

---

## AnggotaTimPenyusun

1. Mencatat keanggotaan 1 **Pengguna** di 1 **OPD** sebagai tim penyusun
2. Unique: `[userId, opdId]` — 1 pengguna hanya bisa tercatat 1 kali per OPD
3. Pengguna tidak bisa dihapus kalau masih tercatat di AnggotaTimPenyusun (Restrict)
4. OPD tidak bisa dihapus kalau masih ada anggota AnggotaTimPenyusun (Restrict)
5. Status: `AKTIF` / `NONAKTIF`; `berakhirPada` opsional untuk keperluan historis
6. **Invariant:** `(status = AKTIF) ↔ (berakhirPada IS NULL)` — selalu update keduanya bersamaan; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-F]
7. Gunakan `status = AKTIF` sebagai source of truth (bukan `berakhirPada IS NULL`) saat query anggota aktif

---

## AnggotaTimEvaluasi

1. Mencatat 1 **Pengguna** sebagai anggota tim evaluasi (global, tidak terikat OPD)
2. `userId` unique — 1 pengguna hanya bisa menjadi 1 anggota tim evaluasi
3. Pengguna tidak bisa dihapus kalau masih tercatat di AnggotaTimEvaluasi (Restrict)
4. Status: `AKTIF` / `NONAKTIF`; `berakhirPada` opsional untuk keperluan historis
5. **Invariant:** `(status = AKTIF) ↔ (berakhirPada IS NULL)` — sama dengan AnggotaTimPenyusun; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-F]

---

## PengajuanEvaluasi

1. Milik 1 **OPD** (wajib) — OPD tidak bisa dihapus kalau masih ada pengajuan (Restrict)
2. Diverifikasi oleh 1 **Pengguna** Biro Organisasi (opsional, diisi saat diverifikasi) — Pengguna tidak bisa dihapus kalau masih ada pengajuan yang diverifikasinya (Restrict)
3. **Berita Acara ditandatangani oleh Koordinator Tim Penyusun** (opsional, diisi saat ditandatangani) — Pengguna tidak bisa dihapus kalau masih ada BA yang ditandatanganinya (Restrict)
4. **Diselesaikan oleh 1 evaluator** (opsional, diisi saat kirim ke Biro) — kalau Pengguna dihapus, field jadi NULL (SetNull); syarat: semua `NilaiEvaluasi` sudah terisi `hasil`
5. 1 PengajuanEvaluasi punya banyak **NilaiEvaluasi** — PengajuanEvaluasi tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
6. 1 PengajuanEvaluasi punya banyak **LogNilaiEvaluasi** — audit trail perubahan nilai (Restrict)
7. 1 PengajuanEvaluasi bisa punya **2 RiwayatTandaTangan** (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI untuk Berita Acara) — PengajuanEvaluasi tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
8. Menggunakan **optimistic locking** via field `version` untuk mencegah race condition saat update status; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-E]
9. Jenis: `TERJADWAL` / `MANDIRI`
    - `TERJADWAL`: wajib isi `nilaiOPD` saat SELESAI
    - `MANDIRI`: `nilaiOPD` harus selalu NULL; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-B]
10. Status lifecycle: `MENUNGGU_EVALUASI` → `SEDANG_DIEVALUASI` → `SELESAI_DIEVALUASI` → `DIVERIFIKASI_BIRO` → `DITANDATANGANI_KOORDINATOR` → `SELESAI`
11. **Field temporal** (`tanggalDiselesaikan`, `diverifikasiOlehUserId`, dll.) hanya boleh diisi pada status yang sesuai — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P2-C]
12. Constraint maks 1 pengajuan aktif per OPD per jenis di-enforce via tabel sentinel `KunciPengajuanEvaluasi`; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-C]

---

## NilaiEvaluasi

1. Milik 1 **PengajuanEvaluasi** (wajib) — PengajuanEvaluasi tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
2. Merujuk 1 **DetailSOP** yang dievaluasi (wajib) — DetailSOP tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
3. **Tidak ada penugasan** — semua evaluator bisa melihat semua SOP OPD dan mengisi/mengubah nilainya
4. `dinilaiOlehId` (opsional) — mencatat evaluator **terakhir** yang mengisi atau mengubah nilai; null jika belum dinilai siapapun — kalau Pengguna dihapus, field jadi NULL (SetNull)
5. Unique: `[pengajuanEvaluasiId, sopDetailId]` — 1 SOP hanya punya 1 nilai per pengajuan
6. `version Int` — optimistic locking; setiap UPDATE nilai wajib menyertakan version check; lihat `docs/SCHEMA-CONSTRAINTS.md` [P0-E]
7. `hasil` opsional (nullable, diisi saat evaluasi selesai): `SESUAI` / `TIDAK_SESUAI`
8. `catatan` opsional — diisi di service layer hanya jika `hasil = TIDAK_SESUAI`
9. **Scope constraint:** `DetailSOP` harus berasal dari OPD yang sama dengan `PengajuanEvaluasi` — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-E]

---

## LogNilaiEvaluasi

1. Milik 1 **PengajuanEvaluasi** (wajib) — PengajuanEvaluasi tidak bisa dihapus kalau masih ada log (Restrict)
2. Dicatat saat 1 **Pengguna** evaluator mengubah nilai SOP (wajib) — Pengguna tidak bisa dihapus kalau masih ada log (Restrict)
3. Immutable — tidak ada `updatedAt`, hanya `createdAt`; setiap perubahan = baris baru
4. Menyimpan `hasilSebelum` + `hasilSesudah` dan `catatanSebelum` + `catatanSesudah` untuk full diff
5. Tidak merujuk `NilaiEvaluasi` secara FK — log tetap ada meski nilai dihapus (append-only audit)
6. Digunakan untuk: melihat riwayat siapa mengubah nilai apa dan kapan

---

## KredensialTTE

1. Milik 1 **Pengguna** (1:1, `userId` unique) — Pengguna tidak bisa dihapus kalau masih punya kredensial TTE (Restrict)
2. Menyimpan hash PIN dan status verifikasi email untuk keperluan TTE
3. Peran TTE: `KEPALA_OPD` / `BIRO_ORGANISASI` / `KOORDINATOR_TIM_PENYUSUN`
4. **Constraint:** peran TTE harus kompatibel dengan `Pengguna.peran` — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-D]
5. `TIM_EVALUASI` dan `TIM_PENYUSUN` tidak boleh memiliki KredensialTTE

---

## RiwayatTandaTangan

1. Milik 1 **Pengguna** (wajib) — Pengguna tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
2. XOR constraint: tepat salah satu dari `sopDetailId` atau `pengajuanEvaluasiId` harus diisi — enforce via service layer + CHECK constraint raw SQL; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-A]
3. **Jika `sopDetailId` diisi** (TTE SOP):
   - Hanya **KEPALA_OPD** yang bisa TTE
   - 1 SOP = maksimal 1 TTE per peran (unique: `[sopDetailId, peran]` — aktif karena `sopDetailId IS NOT NULL`)
   - SOP tidak bisa dihapus kalau masih ada TTE (Restrict)
4. **Jika `pengajuanEvaluasiId` diisi** (TTE Berita Acara):
   - **KOORDINATOR_TIM_PENYUSUN** TTE pertama
   - **BIRO_ORGANISASI** TTE kedua (verifikasi)
   - 1 BA = maksimal 2 TTE (unique: `[pengajuanEvaluasiId, peran]` — aktif karena `pengajuanEvaluasiId IS NOT NULL`)
   - BA tidak bisa dihapus kalau masih ada TTE (Restrict)
5. **Constraint:** peran penandatangan harus sesuai dengan `KredensialTTE.peran` dan `Pengguna.peran` — enforce di service layer; lihat `docs/SCHEMA-CONSTRAINTS.md` [P1-D]

---

## LogEditSOP

Audit trail kolaborasi **Tim Penyusun** pada konten SOP. Menjawab pertanyaan: *"siapa mengubah bagian mana dari SOP ini, dan kapan?"*

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua log ikut terhapus (Cascade); log ini adalah riwayat kolaborasi bukan dokumen legal
2. Dilakukan oleh 1 **Pengguna** Tim Penyusun (wajib) — Pengguna tidak bisa dihapus kalau masih ada log edit (Restrict)
3. Immutable — tidak ada `updatedAt`, hanya `createdAt`; setiap aksi tulis = baris baru
4. `bagian` (enum `BagianSOP`) menandai bagian dokumen yang diubah:
   - `METADATA` — field header SOP
   - `LANGKAH_SOP` — CRUD langkah prosedur
   - `LAMPIRAN_TEKS` — CRUD lampiran teks (peringatan, kualifikasi, peralatan, pencatatan)
   - `DASAR_HUKUM` — tambah/hapus Peraturan dari SOP
   - `PELAKSANA` — perubahan daftar swimlane
   - `DIAGRAM` — perubahan layout/edge/node diagram
   - `SOP_TERKAIT` — tambah/hapus relasi SOP terkait
5. `entityId` (opsional) — ID entitas spesifik yang diubah (mis. `LangkahSOP.id`)
6. `keterangan` (opsional) — catatan bebas tentang perubahan
7. **Tidak mencatat komentar** (`Komentar` tabel adalah record-nya sendiri) dan **tidak mencatat perubahan nilai evaluasi** (`LogNilaiEvaluasi` yang cover itu)

---

## Komentar

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua komentar ikut terhapus (Cascade)
2. Dibuat oleh 1 **Pengguna** (wajib) — Pengguna tidak bisa dihapus kalau masih ada komentar (Restrict)
3. `Komentar` tabel **adalah** audit trail-nya sendiri — tidak perlu entri di `LogEditSOP` karena `userId` + `createdAt` + `isi` sudah cukup sebagai record immutable
4. Status: `OPEN` / `RESOLVED`
5. Referensi ke bagian/langkah SOP disimpan sebagai string bebas di komentar (tidak ada FK ke LangkahSOP) — jika LangkahSOP dihapus, referensi string menjadi dangling (tidak ada cleanup otomatis)

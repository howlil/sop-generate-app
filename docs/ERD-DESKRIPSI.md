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
6. 1 OPD hanya boleh punya 1 pengguna ber-peran `KEPALA_OPD` — **constraint di database** via generated column + unique index
7. 1 OPD hanya boleh punya 1 pengguna ber-peran `KOORDINATOR_TIM_PENYUSUN` — **constraint di database** via generated column + unique index
8. OPD mendukung soft-delete (`deletedAt`)

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
10. 1 Pengguna bisa mendapat banyak **NilaiEvaluasi** (tugas evaluasi per SOP) — Pengguna tidak bisa dihapus kalau masih ada tugas evaluasi yang ditugaskan (Restrict)
11. 1 Pengguna bisa membuat banyak **Komentar** — Pengguna tidak bisa dihapus kalau masih ada komentar (Restrict)
12. 1 Pengguna bisa membuat banyak **Peraturan** — *sudah dihapus, tidak ada tracking siapa yang input peraturan*
13. 1 Pengguna bisa punya banyak **LogAudit** sebagai aktor — Pengguna tidak bisa dihapus kalau masih ada log audit (Restrict)
14. Pengguna mendukung soft-delete (`deletedAt`)
15. Constraint 1 KEPALA_OPD dan 1 KOORDINATOR_TIM_PENYUSUN per OPD di-enforce di service layer dengan SELECT FOR UPDATE — lihat `docs/SCHEMA-CONSTRAINTS.md`

---

## Peraturan

1. 1 Peraturan bisa menjadi dasar hukum di banyak **DetailSOP** via tabel `DasarHukum` (M:N) — Peraturan tidak bisa dihapus kalau masih dipakai sebagai dasar hukum (Restrict)
2. Status: `BERLAKU` / `DICABUT`
3. Tidak ada tracking siapa yang input peraturan (data entry tidak perlu audit trail)

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
   - Sudah berlaku (`BERLAKU` atau `DICABUT`) — harusnya pakai soft-delete via status `DICABUT`, bukan hard-delete

---

## DetailSOP

1. Milik 1 **SOP** (wajib) — kalau SOP dihapus, DetailSOP ikut terhapus (Cascade)
2. Bisa disalin dari 1 **DetailSOP** lain (self-referential, opsional) — kalau sumber dihapus, `salinDariDetailSopId` jadi NULL (SetNull); DetailSOP hasil salinan tetap ada
3. Dibuat oleh 1 **Pengguna** (opsional) — Pengguna tidak bisa dihapus kalau masih ada DetailSOP yang dibuatnya (Restrict)
4. Diedit terakhir oleh 1 **Pengguna** (opsional) — Pengguna tidak bisa dihapus kalau masih ada DetailSOP yang dieditnya (Restrict)
5. **Lock mechanism (database trigger):** Status DetailSOP tidak bisa diubah kalau sudah ada `NilaiEvaluasi` yang belum selesai (`hasil = NULL`)
   - Trigger: `trg_lock_sop_saing_dievaluasi`
   - Error: "SOP sedang dievaluasi, tidak bisa diubah statusnya sampai semua evaluator selesai"
6. 1 DetailSOP punya banyak **LampiranTeks** — kalau DetailSOP dihapus, semua lampiran ikut terhapus (Cascade)
7. 1 DetailSOP punya banyak **DasarHukum** (junction ke Peraturan) — kalau DetailSOP dihapus, semua dasar hukumnya ikut terhapus (Cascade)
8. 1 DetailSOP punya banyak **LangkahSOP** — kalau DetailSOP dihapus, semua langkah ikut terhapus (Cascade)
9. 1 DetailSOP punya banyak **DiagramLayout** — kalau DetailSOP dihapus, semua layout ikut terhapus (Cascade)
10. 1 DetailSOP punya banyak **Swimlanes** (daftar pelaksana untuk kolom vertikal) — kalau DetailSOP dihapus, daftar swimlane ikut terhapus (Cascade)
11. 1 DetailSOP bisa terhubung ke banyak **SopTerkait** (M:N self-referential via SopTerkait) — kedua sisi: kalau DetailSOP dihapus, relasi SopTerkait ikut terhapus (Cascade)
12. 1 DetailSOP bisa punya **1 RiwayatTandaTangan** (KEPALA_OPD saja) — DetailSOP tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
13. 1 DetailSOP bisa punya banyak **NilaiEvaluasi** — DetailSOP tidak bisa dihapus kalau masih ada detail evaluasi (Restrict)
14. 1 DetailSOP bisa punya banyak **LogAudit** — DetailSOP **tidak bisa dihapus** kalau masih ada log audit (Restrict); gunakan soft-delete
15. 1 DetailSOP bisa punya banyak **Komentar** — kalau DetailSOP dihapus, semua komentar ikut terhapus (Cascade)
16. Unique: `nomorSOP` (global), `[sopId, versi]`
17. Status lifecycle: `DRAFT` → `SEDANG_DISUSUN` → `SIAP_DIEVALUASI` → `DIAJUKAN_EVALUASI` → `SEDANG_DIEVALUASI` → `REVISI_DARI_TIM_EVALUASI` → `SIAP_DIVERIFIKASI` → `DIVERIFIKASI_BIRO_ORGANISASI` → `BERLAKU` / `DICABUT`
18. **Lock constraint:** SOP yang sudah diajukan evaluasi (`DIAJUKAN_EVALUASI` atau `SEDANG_DIEVALUASI`) tidak bisa diubah statusnya sampai semua evaluator selesai mengisi hasil

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

---

## SopTerkait

1. **Tabel junction** self-referential **DetailSOP** ↔ **DetailSOP** (M:N)
2. PK composite: `[sopDetailId, sopTerkaitDetailId]` — satu baris untuk satu pasangan SOP terkait
3. Salah satu atau kedua sisi dihapus → baris SopTerkait ikut terhapus (Cascade)
4. Tidak ada field tambahan selain FK — murni tabel penghubung
5. Relasi simetris: SOP A terkait dengan SOP B, dan sebaliknya
6. Nama relasi di `DetailSOP`:
   - `relasiSopKeluar` — SOP ini terkait dengan SOP lain (lebih jelas dari `sopTerkait`)
   - `relasiSopMasuk` — SOP lain terkait dengan SOP ini (lebih jelas dari `terkaitOlehSOP`)

---

## LangkahSOP

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua langkah ikut terhapus (Cascade)
2. Self-referential `langkahSelanjutnyaYaId` (opsional) — kalau langkah tujuan dihapus, field jadi NULL (SetNull)
3. Self-referential `langkahSelanjutnyaTidakId` (opsional) — kalau langkah tujuan dihapus, field jadi NULL (SetNull); hanya dipakai oleh langkah bertipe `DECISION`
4. Terhubung ke 1 **Pelaksana** (wajib, NOT NULL — semua langkah termasuk START/END harus punya pelaksana) — Pelaksana tidak bisa dihapus kalau masih dipakai di langkah (Restrict)
5. 1 LangkahSOP bisa punya banyak **DiagramNodePosition** — kalau langkah dihapus, posisi node-nya ikut terhapus (Cascade)
6. 1 LangkahSOP bisa menjadi sumber banyak **DiagramEdge** — kalau langkah dihapus, edge-nya ikut terhapus (Cascade)
7. 1 LangkahSOP bisa menjadi tujuan banyak **DiagramEdge** — kalau langkah dihapus, edge-nya ikut terhapus (Cascade)
8. Unique: `[sopDetailId, urutan]` — tidak boleh ada 2 langkah dengan urutan sama dalam 1 DetailSOP
9. Jenis: `TERMINATOR` / `TASK` / `DECISION`

---

## DiagramLayout

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua layout ikut terhapus (Cascade)
2. 1 DiagramLayout punya banyak **DiagramNodePosition** (delta posisi manual) — kalau layout dihapus, semua posisi ikut terhapus (Cascade)
3. 1 DiagramLayout punya banyak **DiagramEdge** (delta routing manual) — kalau layout dihapus, semua edge ikut terhapus (Cascade)
4. Unique: `[sopDetailId, jenis, versiLayout]`
5. Jenis: `FLOWCHART` / `BPMN`
6. Hanya menyimpan delta (override manual); posisi/routing yang tidak ada baris = auto-layout di aplikasi

---

## DiagramNodePosition

1. PK composite: `[diagramLayoutId, langkahSopId]`
2. Milik 1 **DiagramLayout** (wajib) — kalau layout dihapus, posisi ikut terhapus (Cascade)
3. Merujuk 1 **LangkahSOP** (wajib) — kalau langkah dihapus, posisi ikut terhapus (Cascade)
4. Baris hanya ada kalau user memindahkan node secara manual dari hasil auto-layout

---

## DiagramEdge

1. Milik 1 **DiagramLayout** (wajib) — kalau layout dihapus, edge ikut terhapus (Cascade)
2. Merujuk 1 **LangkahSOP** sumber (`dariLangkah`, wajib) — kalau langkah dihapus, edge ikut terhapus (Cascade)
3. Merujuk 1 **LangkahSOP** tujuan (`keLangkah`, wajib) — kalau langkah dihapus, edge ikut terhapus (Cascade)
4. 1 DiagramEdge punya banyak **DiagramEdgePoint** — kalau edge dihapus, semua titik ikut terhapus (Cascade)
5. Unique: `[diagramLayoutId, dariLangkahId, keLangkahId, cabang]`
6. Cabang: `DEFAULT` / `YA` / `TIDAK` — membedakan dua edge dari node `DECISION` ke tujuan berbeda
7. `labelTeks`, `labelX`, `labelY` opsional (untuk label kustom BPMN)
8. Baris hanya ada kalau user mengubah jalur panah secara manual

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
6. Nama relasi di `DetailSOP`: `swimlanes` (lebih jelas dari `pelaksanaTerkait`)

---

## AnggotaTimPenyusun

1. Mencatat keanggotaan 1 **Pengguna** di 1 **OPD** sebagai tim penyusun
2. Unique: `[userId, opdId]` — 1 pengguna hanya bisa tercatat 1 kali per OPD
3. Pengguna tidak bisa dihapus kalau masih tercatat di AnggotaTimPenyusun (Restrict)
4. OPD tidak bisa dihapus kalau masih ada anggota AnggotaTimPenyusun (Restrict)
5. Status: `AKTIF` / `NONAKTIF`; `berakhirPada` opsional (null = masih aktif)
6. Nama model: `AnggotaTimPenyusun`  — lebih jelas ini adalah **anggota** tim, bukan tim itu sendiri

---

## AnggotaTimEvaluasi

1. Mencatat 1 **Pengguna** sebagai anggota tim evaluasi (global, tidak terikat OPD)
2. `userId` unique — 1 pengguna hanya bisa menjadi 1 anggota tim evaluasi
3. Pengguna tidak bisa dihapus kalau masih tercatat di AnggotaTimEvaluasi (Restrict)
4. Status: `AKTIF` / `NONAKTIF`; `berakhirPada` opsional (null = masih aktif)
5. Nama model: `AnggotaTimEvaluasi — lebih konsisten dengan `AnggotaTimPenyusun`

---

## PengajuanEvaluasi

1. Milik 1 **OPD** (wajib) — OPD tidak bisa dihapus kalau masih ada pengajuan (Restrict)
2. Diverifikasi oleh 1 **Pengguna** Biro Organisasi (opsional, diisi saat diverifikasi) — Pengguna tidak bisa dihapus kalau masih ada pengajuan yang diverifikasinya (Restrict)
3. **Berita Acara ditandatangani oleh Koordinator Tim Penyusun** (opsional, diisi saat ditandatangani) — Pengguna tidak bisa dihapus kalau masih ada BA yang ditandatanganinya (Restrict)
   - **Catatan:** Field `ditandatanganiOlehKoordinatorUserId` adalah denormalisasi untuk quick lookup; detail lengkap TTE ada di `RiwayatTandaTangan`
   - **Lock mechanism:** BA hanya bisa ditandatangani setelah:
     - Status = `DIVERIFIKASI_BIRO`
     - Semua `NilaiEvaluasi` sudah diisi (`hasil` tidak null)
     - `ditandatanganiOlehKoordinatorUserId IS NULL` (belum pernah TTE — derivable, tidak perlu field boolean terpisah)
   - **Penting:** Ini adalah TTE untuk **Berita Acara**, BUKAN SOP. SOP ditandatangani oleh **Kepala OPD** di `RiwayatTandaTangan` dengan `sopDetailId`
4. **Diselesaikan oleh 1 evaluator** (opsional, diisi saat kirim ke Biro) — evaluator yang men-trigger "selesai evaluasi"; kalau Pengguna dihapus, field jadi NULL (SetNull)
   - Syarat: semua `NilaiEvaluasi` dalam pengajuan sudah terisi `hasil`
   - Siapapun dari tim evaluasi aktif bisa trigger aksi ini
5. 1 PengajuanEvaluasi punya banyak **NilaiEvaluasi** — PengajuanEvaluasi tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
6. 1 PengajuanEvaluasi punya banyak **LogNilaiEvaluasi** — audit trail perubahan nilai (Restrict)
7. 1 PengajuanEvaluasi bisa punya **2 RiwayatTandaTangan** (KOORDINATOR_TIM_PENYUSUN + BIRO_ORGANISASI untuk Berita Acara) — PengajuanEvaluasi tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
8. Menggunakan **optimistic locking** via field `version` untuk mencegah race condition saat update status
9. Jenis: `TERJADWAL` / `MANDIRI`
10. Status lifecycle: `MENUNGGU_EVALUASI` → `SEDANG_DIEVALUASI` → `SELESAI_DIEVALUASI` → `DIVERIFIKASI_BIRO` → `DITANDATANGANI_KOORDINATOR` → `SELESAI`
11. Constraint maks 1 pengajuan aktif per OPD per jenis di-enforce di service layer — lihat `docs/SCHEMA-CONSTRAINTS.md`

---

## NilaiEvaluasi

1. Milik 1 **PengajuanEvaluasi** (wajib) — PengajuanEvaluasi tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
2. Merujuk 1 **DetailSOP** yang dievaluasi (wajib) — DetailSOP tidak bisa dihapus kalau masih ada nilai evaluasi (Restrict)
3. **Tidak ada penugasan** — semua evaluator bisa melihat semua SOP OPD dan mengisi/mengubah nilainya
4. `dinilaiOlehId` (opsional) — mencatat evaluator **terakhir** yang mengisi atau mengubah nilai; null jika belum dinilai siapapun — kalau Pengguna dihapus, field jadi NULL (SetNull)
5. Unique: `[pengajuanEvaluasiId, sopDetailId]` — 1 SOP hanya punya 1 nilai per pengajuan
5b. `version Int` — optimistic locking; setiap UPDATE nilai wajib menyertakan version check untuk mencegah lost update saat 2 evaluator ubah nilai bersamaan — lihat `docs/SCHEMA-CONSTRAINTS.md`
6. `hasil` opsional (nullable, diisi saat evaluasi selesai): `SESUAI` / `TIDAK_SESUAI`
7. `catatan` opsional — diisi di service layer hanya jika `hasil = TIDAK_SESUAI`
8. Nama relasi di model lain:
   - `Pengguna.nilaiEvaluasiDiisi` — Nilai evaluasi yang terakhir diisi oleh user ini
   - `DetailSOP.nilaiEvaluasi` — Nilai evaluasi untuk SOP ini
   - `PengajuanEvaluasi.nilaiEvaluasi` — Nilai evaluasi dalam pengajuan ini

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
4. Nama "KredensialTTE" menekankan ini adalah **kredensial/setup awal** sebelum user bisa melakukan TTE

---

## RiwayatTandaTangan

1. Milik 1 **Pengguna** (wajib) — Pengguna tidak bisa dihapus kalau masih ada riwayat tanda tangan (Restrict)
2. XOR constraint: tepat salah satu dari `sopDetailId` atau `pengajuanEvaluasiId` harus diisi — *di-enforce di service layer + CHECK constraint raw SQL*
3. **Jika `sopDetailId` diisi** (TTE SOP):
   - Hanya **KEPALA_OPD** yang bisa TTE
   - 1 SOP = maksimal 1 TTE (unique: `[sopDetailId, peran]`)
   - SOP tidak bisa dihapus kalau masih ada TTE (Restrict)
4. **Jika `pengajuanEvaluasiId` diisi** (TTE Berita Acara):
   - **KOORDINATOR_TIM_PENYUSUN** TTE pertama
   - **BIRO_ORGANISASI** TTE kedua (verifikasi)
   - 1 BA = maksimal 2 TTE (unique: `[pengajuanEvaluasiId, peran]`)
   - BA tidak bisa dihapus kalau masih ada TTE (Restrict)
5. Field yang diperjelas (dari nama ambigu):
   - `nomorDokumen` — Nomor dokumen yang ditandatangani (sebelumnya: `idDokumen`)
   - `jenisDokumen` — Jenis dokumen: "SOP" atau "Berita Acara" (sebelumnya: `labelDokumen`)
   - `judulDokumen` — Judul dokumen (sebelumnya: `idReferensi`)
6. Nama relasi di model lain:
   - `Pengguna.tandaTangan` — Riwayat TTE yang dibuat user ini
   - `DetailSOP.tandaTanganSop` — TTE untuk SOP ini
   - `PengajuanEvaluasi.tandaTanganBa` — TTE untuk BA ini
7. Nama "RiwayatTandaTangan" menekankan ini adalah **log/history** setiap kali TTE dilakukan (bukan profil/setup)

---

## LogAudit

1. Milik 1 **DetailSOP** (wajib) — DetailSOP **tidak bisa dihapus** kalau masih ada log audit (Restrict); log audit bersifat legal dan tidak boleh hilang
2. Dilakukan oleh 1 **Pengguna** aktor (wajib) — Pengguna tidak bisa dihapus kalau masih ada log audit (Restrict)
3. Immutable — tidak ada `updatedAt`, hanya `createdAt`
4. Menyimpan `statusSebelum` (opsional) dan `statusSesudah` untuk tracking perubahan status SOP
5. `AksiAudit` yang dicatat (11 nilai):
   - `BUAT_SOP`, `SIMPAN_DRAFT`, `SELESAI_PENYUSUNAN` — lifecycle penyusunan
   - `AJUKAN_EVALUASI`, `MULAI_EVALUASI` — lifecycle evaluasi
   - `VERIFIKASI_PENGAJUAN_EVALUASI` — aksi Biro
   - `TTD_BA_KOORDINATOR_TIM_PENYUSUN` — TTE Berita Acara
   - `SAHKAN_SOP`, `CABUT_SOP` — lifecycle final
   - `REVISI_DARI_EVALUATOR`, `SALIN_ISI_DARI_SOP` — operasi khusus
6. **Tidak mencatat komentar** (`Komentar` tabel adalah record-nya sendiri) dan **tidak mencatat perubahan nilai evaluasi** (`LogNilaiEvaluasi` yang cover itu)

---

## Komentar

1. Milik 1 **DetailSOP** (wajib) — kalau DetailSOP dihapus, semua komentar ikut terhapus (Cascade)
2. Dibuat oleh 1 **Pengguna** (wajib) — Pengguna tidak bisa dihapus kalau masih ada komentar (Restrict)
3. `Komentar` tabel **adalah** audit trail-nya sendiri — tidak perlu entri di `LogAudit` karena `userId` + `createdAt` + `isi` sudah cukup sebagai record immutable
3. Status: `OPEN` / `RESOLVED`

# Deskripsi ERD (Format Detail, Sinkron Schema Terbaru)

Legenda delete behavior:
- **Cascade**: child ikut terhapus saat parent dihapus.
- **Restrict**: parent tidak bisa dihapus jika masih direferensikan.
- **SetNull**: FK child jadi `NULL` (tidak dipakai pada schema aktif saat ini).
- **opsional**: FK nullable.
- **wajib**: FK non-nullable.

---

## A. Gambaran Besar Domain

Sistem dibagi menjadi 6 area:

1. **Pengguna & OPD**
   - `Pengguna` selalu punya OPD aktif (`opdId` wajib).
   - Riwayat perpindahan OPD tidak dibuat akun baru, tetapi dicatat di `RiwayatOpdPengguna`.

2. **Regulasi & SOP**
   - `Peraturan` master global.
   - OPD memakai peraturan lewat `OPDPeraturan`.
   - `SOP` punya banyak versi di `DetailSOP`.

3. **Pelaksana & Diagram**
   - Pelaksana per OPD.
   - Diagram SOP disimpan terpisah: layout, node position, edge, edge points.

4. **Evaluasi SOP**
   - Header pengajuan: `PengajuanEvaluasi`.
   - Nilai per detail SOP: `NilaiEvaluasi`.
   - Audit perubahan nilai: `LogNilaiEvaluasi`.

5. **TTE**
   - Kredensial internal: `KredensialTTE`.
   - Metadata dokumen yang ditandatangani: `DokumenTte`.
   - Riwayat event tanda tangan + artefak kripto: `RiwayatTandaTangan`.

6. **Kolaborasi**
   - `LogEditSOP` untuk audit edit.
   - `Komentar` untuk diskusi.

---

## B. Relasi Utama Antar Entitas

1. **OPD 1..N Pengguna** (`Restrict` dari Pengguna ke OPD)
2. **Pengguna 1..N RiwayatOpdPengguna**
3. **OPD 1..N RiwayatOpdPengguna**
4. **OPD M..N Peraturan** via `OPDPeraturan`
5. **OPD 1..N SOP**
6. **SOP 1..N DetailSOP**
7. **DetailSOP M..N Peraturan** via `DasarHukum`
8. **DetailSOP M..N DetailSOP** via `SopTerkait` (self relation)
9. **DetailSOP 1..N LangkahSOP**
10. **OPD 1..N Pelaksana**
11. **DetailSOP M..N Pelaksana** via `DetailSOPPelaksana`
12. **DetailSOP 1..N TataLetakDiagram**
13. **TataLetakDiagram 1..N PosisiNodeDiagram**
14. **TataLetakDiagram 1..N SisiDiagram**
15. **SisiDiagram 1..N TitikSisiDiagram**
16. **OPD 1..N PengajuanEvaluasi**
17. **PengajuanEvaluasi 1..N NilaiEvaluasi**
18. **PengajuanEvaluasi 1..N LogNilaiEvaluasi**
19. **DetailSOP 1..N NilaiEvaluasi**
20. **Pengguna 1..N LogNilaiEvaluasi** (sebagai evaluator)
21. **Pengguna 1..1 KredensialTTE**
22. **PengajuanEvaluasi 1..N DokumenTte** (opsional via FK nullable)
23. **DetailSOP 1..N DokumenTte** (opsional via FK nullable)
24. **DokumenTte 1..N RiwayatTandaTangan**
25. **Pengguna 1..N RiwayatTandaTangan**
26. **DetailSOP 1..N LogEditSOP**
27. **Pengguna 1..N LogEditSOP**
28. **DetailSOP 1..N Komentar**
29. **Pengguna 1..N Komentar**

---

## C. Deskripsi Per Model

## Pengguna
- PK: `penggunaId`
- Unik: `email`, `nip`
- FK wajib: `opdId -> OPD.opdId` (`Restrict`)
- Menyimpan role aplikasi pada `peran: PeranPengguna`.
- Tidak menyimpan keanggotaan tim terpisah (model tim lama sudah dihapus).

## OPD
- PK: `opdId`
- Menjadi tenant utama untuk SOP dan evaluasi.
- Biro Organisasi diperlakukan sebagai data OPD biasa (bukan tipe tabel terpisah).

## RiwayatOpdPengguna
- PK: `riwayatOpdPenggunaId`
- FK: `penggunaId`, `opdId`
- Kolom periode: `mulaiPada`, `berakhirPada`
- Unik: `@@unique([penggunaId, mulaiPada])`
- Tujuan: jejak mutasi OPD tanpa menambah akun pengguna.

## Peraturan
- PK: `peraturanId`
- Unik global: `@@unique([nomor, tahun])`

## OPDPeraturan
- Junction M:N OPD-peraturan
- PK komposit: `@@id([opdId, peraturanId])`

## SOP
- PK: `sopId`
- FK wajib: `opdId`

## DetailSOP
- PK: `detailSopId`
- FK wajib: `sopId`
- Versi unik per SOP: `@@unique([sopId, versi])`
- Self relation salinan: `salinDariDetailSopId`
- Menjadi root untuk langkah, diagram, lampiran, komentar, log edit, nilai evaluasi, dokumen TTE.

## LampiranTeks
- PK: `lampiranTeksId`
- FK wajib: `detailSopId` (`Cascade`)

## DasarHukum
- Junction M:N `DetailSOP` - `Peraturan`
- PK komposit: `@@id([detailSopId, peraturanId])`

## SopTerkait
- Self-junction antar `DetailSOP`
- PK komposit: `@@id([detailSopId, detailSopTerkaitId])`

## LangkahSOP
- PK: `langkahSopId`
- FK wajib: `detailSopId`, `pelaksanaId`
- Self branching:
  - `langkahSelanjutnyaYaId`
  - `langkahSelanjutnyaTidakId`
- Unik urutan per detail SOP: `@@unique([detailSopId, urutan])`

## Pelaksana
- PK: `pelaksanaId`
- FK wajib: `opdId`

## DetailSOPPelaksana
- Junction M:N DetailSOP-pelaksana + atribut `urutan`
- PK komposit: `@@id([detailSopId, pelaksanaId])`

## TataLetakDiagram
- PK: `tataLetakDiagramId`
- FK wajib: `detailSopId`
- Unik versi layout per detail SOP + jenis:
  `@@unique([detailSopId, jenis, versiLayout])`

## PosisiNodeDiagram
- PK komposit: `@@id([tataLetakDiagramId, langkahSopId])`
- FK wajib: `tataLetakDiagramId`, `langkahSopId`

## SisiDiagram
- PK: `sisiDiagramId`
- FK wajib: `tataLetakDiagramId`, `dariLangkahId`, `keLangkahId`
- Membedakan cabang edge: `cabang` (`UTAMA/YA/TIDAK`)
- Unik anti-duplikasi edge:
  `@@unique([tataLetakDiagramId, dariLangkahId, keLangkahId, cabang])`

## TitikSisiDiagram
- PK komposit: `@@id([sisiDiagramId, urutan])`
- FK wajib: `sisiDiagramId` (`Cascade`)

## PengajuanEvaluasi
- PK: `pengajuanEvaluasiId`
- FK wajib: `opdId`
- FK opsional actor:
  - `diselesaikanOlehId`
  - `diverifikasiOlehUserId`
  - `ditandatanganiOlehKoordinatorUserId`
- Optimistic lock: `version`

## NilaiEvaluasi
- PK: `nilaiEvaluasiId`
- FK wajib: `pengajuanEvaluasiId`, `detailSopId`
- FK opsional: `dinilaiOlehId`
- Unik: `@@unique([pengajuanEvaluasiId, detailSopId])`
- Optimistic lock: `version`

## LogNilaiEvaluasi
- PK: `logNilaiEvaluasiId`
- FK wajib: `pengajuanEvaluasiId`, `evaluatorId`
- Menyimpan nilai/catatan sebelum-sesudah.

## KredensialTTE
- PK: `kredensialTteId`
- FK wajib+unik: `userId`
- Menyimpan hash PIN + status verifikasi email/token.

## DokumenTte
- PK: `dokumenTteId`
- Metadata dokumen: `nomorDokumen`, `jenisDokumen`, `judulDokumen`, `hashDokumen`
- Metadata verifikasi: `versiDokumen`, `metodeKanonikalisasi`
- FK opsional:
  - `detailSopId`
  - `pengajuanEvaluasiId`
- Unik:
  - `@@unique([detailSopId])`
  - `@@unique([pengajuanEvaluasiId])`

## RiwayatTandaTangan
- PK: `riwayatTandaTanganId`
- FK wajib: `userId`, `dokumenTteId`
- Snapshot role signer: `peran: PeranPengguna`
- Artefak kripto:
  - `signatureValue`, `signatureAlgorithm`, `signatureFormat`, `keyId`
  - `certSerialNumber`, `certIssuer`, `certSubject`, `certFingerprint`
  - `certValidFrom`, `certValidTo`
- Unik role per dokumen: `@@unique([dokumenTteId, peran])`

## LogEditSOP
- PK: `logEditSopId`
- FK wajib: `detailSopId`, `userId`
- Audit perubahan konten SOP.

## Komentar
- PK: `komentarId`
- FK wajib: `detailSopId`, `userId`
- Status komentar: `TERBUKA` / `SELESAI`.

---

## D. Catatan Sinkronisasi dengan Schema Saat Ini

1. Model `AnggotaTimPenyusun` dan `AnggotaTimEvaluasi` **sudah tidak ada**.
2. Enum `PeranTTE` **sudah tidak ada**; role tanda tangan memakai `PeranPengguna`.
3. Evaluasi kolaboratif aktif:
   - `NilaiEvaluasi` ada.
   - `LogNilaiEvaluasi` ada.
4. TTE sudah memuat artefak kripto dasar pada `RiwayatTandaTangan`.

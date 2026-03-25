# Keselarasan basis data (Prisma) dengan use case

Referensi skema: `server/prisma/schema.prisma`.  
Referensi alur bisnis: `docs/WORKFLOW-SOP.md`, `.planning/PROJECT.md`.

## Yang sudah selaras

| Use case | Dukungan skema |
|----------|----------------|
| Empat peran (Biro, Tim Evaluasi, Tim Penyusun, Kepala OPD) | `UserRole` enum + `User.role` |
| Rantai status SOP sampai Berlaku/Dicabut | `StatusSOP` enum + `SOP.status` |
| Penyusunan: metadata, dasar hukum, alat, data dicatat, prosedur bercabang | `SOP`, `LawBasis`, `Equipment`, `RecordData`, `ProsedurRow` + self-FK |
| Pelaksana & hubungan ke langkah | `Pelaksana`, `ProsedurRowPelaksana` |
| SOP terkait SOP | `RelatedSOP` |
| Tim per OPD + koordinator vs anggota | `TimPenyusun`, `RoleInternal` |
| Tim evaluasi & penugasan batch | `TimEvaluasiAnggota`, `VerifikasiBatch.timEvaluasiId` |
| Batch evaluasi per OPD + hasil per SOP | `VerifikasiBatch`, `EvaluasiItem`, `HasilEvaluasi` |
| Verifikasi BA langkah Koordinator (setelah Biro) | `isSignedByKoordinator`, `tanggalTTDBaByKoordinator` |
| TTE profil & jejak tanda tangan | `TTEProfile`, `TTESignature` |
| Audit perubahan status SOP | `AuditLog` |
| Peraturan & OPD | `Peraturan`, `OPD` |
| PIC internal vs teks | `picUserId` + kolom teks opsional |

## Gap (belum atau hanya sebagian di DB)

1. **Verifikasi BA oleh Biro** — Use case & client memakai `isVerified`, `tanggalVerifikasi`, `namaBiro`, `tteSignaturePayload` pada batch. **Tabel `VerifikasiBatch` belum punya kolom eksplisit** untuk langkah Biro (boolean + tanggal + referensi TTE). Tanpa ini, transisi ke `DIVERIFIKASI_BIRO_ORGANISASI` sulit direkonsiliasi hanya dari batch.
2. **Rekomendasi per item evaluasi** — Client `SOPItem` punya `rekomendasi`; **`EvaluasiItem` tidak punya field `rekomendasi`** (hanya `hasil`, `catatan`).
3. **Penilaian OPD / rekap tahunan** — UI menyimpan rating OPD; **tidak ada model** untuk skor/rating per OPD per periode (opsional jika hanya agregat dari evaluasi).
4. **Komentar & riwayat versi SOP** — Fitur komentar/versioning di client **tidak punya tabel** terdedikasi (bisa ditunda sesuai out-of-scope chat).
5. **Nama OPD pada batch** — Client punya `opd: string`; DB memakai **`opdId` → `OPD`** (benar secara normalisasi; API akan join `OPD.name`).

## Rekomendasi migrasi berikutnya (prioritas)

1. Tambah kolom `VerifikasiBatch` untuk verifikasi Biro: mis. `verifiedByBiroAt`, `verifiedByBiroUserId` (opsional), atau boolean + timestamp; tautkan ke `TTESignature` via `referenceId`/`documentId` jika perlu.
2. Tambah `rekomendasi` (Text, opsional) pada `EvaluasiItem` jika masih dipakai di UI.
3. Validasi aturan bisnis di **service layer** (bukan hanya Prisma): urutan status SOP, urutan verifikasi BA Biro → Koordinator → pengesahan Kepala OPD.

---
*Dibuat: quick analysis — sesuaikan setelah keputusan produk.*

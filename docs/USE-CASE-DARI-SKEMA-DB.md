# Use case turunan skema basis data (Prisma)

Dokumen ini mendeskripsikan **use case**, **skenario utama**, dan **edge case** yang **didukung atau tersirat** oleh [`server/prisma/schema.prisma`](../server/prisma/schema.prisma). Aturan transisi status di **lapisan aplikasi** (bukan hanya DB).

---

## 1. Organisasi & akun (`OPD`, `User`)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-OPD-01 | Kelola OPD | Admin/Biro membuat/memperbarui OPD dengan `kode` unik | Duplikasi `kode`; OPD tanpa user |
| UC-USER-01 | Akun per peran | User dibuat dengan `UserRole` dan opsional `opdId` | User Biro/Tim Evaluasi tanpa `opdId`; Kepala OPD/Tim Penyusun seharusnya punya `opdId` (validasi app) |
| UC-USER-02 | Profil pegawai | `nip`, `jabatan`, `pangkat`, `nohp` opsional pada `User` | Data tidak lengkap; perubahan jabatan tidak versi-riwayat di DB |

---

## 2. Peraturan (`Peraturan`)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-PRT-01 | CRUD peraturan | Entri `nomor`, `tahun`, `tentang`, `version`, `fileUrl` | Peraturan dicabut → `status` DICABUT; versi bertambah tanpa branch di schema |
| UC-PRT-02 | Riwayat pembuat | `createdById` → `User` | User dihapus: FK perlu kebijakan (Restrict/SetNull) |

---

## 3. Dokumen SOP (`SOP` + anak)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-SOP-01 | Buat / edit SOP | Satu SOP milik satu `opdId`; status mulai `DRAFT` | `nomorSOP` unik global; bentrok nomor |
| UC-SOP-02 | Alur status | Kolom `status` mengikuti enum `StatusSOP` (draft → … → `BERLAKU` / `DICABUT`) | Lompat status ilegal jika tidak divalidasi di service |
| UC-SOP-03 | Metadata & PIC | `picUserId` ke `User` **atau** teks `picName`/`picNumber`/`picRole` | Keduanya terisi (prioritas bisnis di app); PIC user dihapus |
| UC-SOP-04 | Dasar hukum / alat / data | Banyak baris di `LawBasis`, `Equipment`, `RecordData` | Hapus SOP → cascade ke anak (cek `onDelete` di migration) |
| UC-SOP-05 | Prosedur bercabang | `ProsedurRow` dengan `nextStepYesId` / `nextStepNoId`, tipe `DECISION` | Lingkar tak terbatas di graf langkah; orphan step |
| UC-SOP-06 | Pelaksana langkah | M:N `ProsedurRowPelaksana` ke `Pelaksana` | Satu pelaksana dihapus; banyak pelaksana per langkah |
| UC-SOP-07 | SOP terkait | `RelatedSOP` pasangan `(sopId, relatedSopId)` | Duplikat arah; self-link; perlu aturan simetri di app |
| UC-SOP-08 | Audit | `AuditLog` per `sopId` dengan `action`, `statusSebelum`/`statusSesudah` | Banyak log; aktor dihapus (FK ke `User`) |

---

## 4. Master pelaksana (`Pelaksana`)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-PLK-01 | Kelola pelaksana OPD | Satu pelaksana terikat `opdId` | Pelaksana dipakai di prosedur lalu dihapus |

---

## 5. Keanggotaan tim (`TimPenyusun`, `TimEvaluasiAnggota`)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-TIM-01 | Anggota tim penyusun | `(userId, opdId)` dengan `roleInternal` KOORDINATOR/ANGGOTA, `status` AKTIF/NONAKITF, `endedAt` | Dua koordinator aktif untuk satu OPD (boleh dicegah di app) |
| UC-TIM-02 | Anggota tim evaluasi | User dengan role tim evaluasi terdaftar sebagai anggota | Nonaktifkan anggota; batch masih merujuk `timEvaluasiId` lama |

---

## 6. Evaluasi & batch (`VerifikasiBatch`, `EvaluasiItem`)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-EVL-01 | Batch evaluasi OPD | `VerifikasiBatch` dengan `jenis` INISIASI_BIRO / REQUEST_OPD, `status` AKTIF/SELESAI/TERVERIFIKASI | Batch tanpa `timEvaluasiId`; batch tanpa item |
| UC-EVL-02 | Item evaluasi per SOP | `EvaluasiItem` menghubungkan `batchId` + `sopId` + `hasil` + `catatan` | SOP yang sama masuk dua batch aktif; `hasil` null |
| UC-EVL-03 | Hasil evaluasi | Enum `HasilEvaluasi`: SESUAI, PERLU_PERBAIKAN, REVISI_BIRO | Pemetaan ke `StatusSOP` dilakukan di service |
| UC-BA-01 | BA — koordinator | `isSignedByKoordinator`, `tanggalTTDBaByKoordinator` | Koordinator tanda tangan sebelum Biro (urutan harus di app) |
| UC-BA-02 | Nomor BA | `nomorBA` pada batch | Nomor kosong sampai proses BA |

---

## 7. Tanda tangan elektronik (`TTEProfile`, `TTESignature`)

| ID | Use case | Skenario utama | Edge case |
|----|----------|----------------|-----------|
| UC-TTE-01 | Registrasi TTE | Satu `TTEProfile` per `userId` (unique), `pinHash`, `TTERole`, email verifikasi | User ganti role sistem vs role TTE |
| UC-TTE-02 | Jejak tanda tangan | `TTESignature` menyimpan `documentId`, `referenceId`, `documentHash`, `signedAt` | Verifikasi hash offline; dokumen tidak punya FK ke SOP/BA di schema (hanya string id) |

---

## 8. Ringkaman aktor ↔ tabel (untuk skenario E2E)

| Aktor | Tabel / relasi utama |
|-------|----------------------|
| Biro Organisasi | `OPD`, `User`, `Peraturan`, `VerifikasiBatch`, `SOP` (lewat batch/verifikasi), `AuditLog`, `TTESignature` |
| Tim Evaluasi | `TimEvaluasiAnggota`, `VerifikasiBatch`, `EvaluasiItem`, `SOP.status` |
| Tim Penyusun / Koordinator | `TimPenyusun`, `SOP`, anak SOP, `VerifikasiBatch` (koordinator BA) |
| Kepala OPD | `User`, `SOP` (PIC/berlaku), `TTESignature`, `AuditLog` |

---

## 9. Edge case lintas-modul

1. **Integritas SOP di banyak batch:** `EvaluasiItem` memakai `(batchId, sopId)`; uniqueness `(sopId, batchId aktif)` sebaiknya dijamin di aplikasi atau indeks unik parsial (jika DB mendukung).
2. **Status SOP vs batch:** Perpindahan ke `DIVERIFIKASI_BIRO_ORGANISASI` / `BERLAKU` harus konsisten dengan `VerifikasiBatch` dan `isSignedByKoordinator` — **tidak sepenuhnya dikunci oleh constraint Prisma**.
3. **Penghapusan:** Urutan hapus User/OPD/SOP mempengaruhi FK; cek `onDelete` pada migration.
4. **RelatedSOP:** Graph tidak dibatasi schema (boleh siklus); validasi di domain.

---

*Dokumen ini menjelaskan kemampuan **data**; use case bisnis lengkap tetap mengacu pada kebijakan instansi dan implementasi API.*

# Review Kode Client & Diagram Use Case

Dokumen ini berisi **review kode** folder `client/` dari sudut pandang Software Engineer dan Sistem Analis, serta **diagram use case** aplikasi Biro Organisasi (manajemen SOP).

---

## 1. Review Kode Client (Software Engineer & Sistem Analis)

### 1.1 Arsitektur & Stack

| Aspek | Ringkasan |
|-------|-----------|
| **Framework** | React 19, TypeScript, Vite 7 |
| **Routing** | TanStack Router (file-based), route tree ter-generate |
| **State** | Zustand (app, peraturan, evaluasi, penugasan, sop-status) + persist di localStorage untuk role & sebagian data |
| **UI** | Tailwind CSS 4, Radix UI, Lucide React |
| **Struktur** | Routes → Pages → Components; logic di `lib/` (stores, hooks, types, seed, services) |

**Kelebihan:** Pemisahan route/page/component jelas, konstanta route dan role terpusat, role-based layout konsisten.

### 1.2 Keamanan & Akses

- **Role-based access:** Setiap area (Kepala OPD, Kepala Biro, Tim Evaluasi, Tim Penyusun) dilindungi di `beforeLoad` route layout; jika role tidak sesuai, redirect ke `/` dengan `?denied=...`.
- **Keterbatasan:** Autentikasi berbasis role di client (pilih role di landing); tidak ada token/session/API auth. Untuk produksi perlu backend auth dan validasi role di server.

### 1.3 Data & Integrasi Backend

- **Saat ini:** Tidak ada pemanggilan HTTP API. Data dari **seed** (`lib/seed/*`) dan **Zustand stores** (sebagian persist).
- **Service layer:** `lib/services/sop-preview.ts` mengembalikan data dari seed; siap diganti ke API nanti.
- **Rekomendasi:** Tambah layer API client (fetch/axios) dan ganti sumber data di hooks/stores dari seed ke response API; pertahankan struktur hook agar halaman tidak banyak berubah.

### 1.4 Kualitas Kode

- **Types:** TypeScript dipakai konsisten; tipe SOP, evaluasi, peraturan, dll. didefinisikan di `lib/types/`.
- **Reuse:** Komponen UI (Button, Dialog, DataTable, FormField, dll.) dan layout (RoleLayout, PageHeader) dipakai seragam.
- **Hooks:** Custom hooks (`useDaftarSOPData`, `useDetailSOPMetadata`, `useKomentar`, dll.) memisahkan logic dari UI dan memudahkan penggantian sumber data.
- **Perhatian:** Sebagian halaman cukup besar (banyak state lokal); pertimbangkan pemecahan ke sub-komponen atau reducer jika bertambah kompleks.

### 1.5 Fitur Utama yang Tercakup

- **Tim Penyusun:** Daftar SOP saya, detail & edit SOP (metadata, prosedur, diagram BPMN/flowchart, versi, komentar).
- **Kepala OPD:** Manajemen tim penyusun, pelaksana SOP, peraturan, daftar SOP, inisiasi proyek, detail SOP, override status, ajukan evaluasi, TTD elektronik.
- **Tim Evaluasi:** Penugasan evaluasi, detail penugasan, pelaksanaan evaluasi (draft, berita acara), TTD elektronik.
- **Kepala Biro Organisasi:** Manajemen OPD, tim evaluasi, manajemen evaluasi SOP (buat, daftar, detail), TTD elektronik.
- **Validasi:** Halaman verifikasi TTD berhasil dan validasi pengesahan.

---

## 2. Diagram Use Case

Diagram use case berikut menggambarkan **aktor** (pengguna sistem) dan **use case** (fitur) dalam batas sistem **Aplikasi Biro Organisasi**.

### 2.1 Diagram Utama (Semua Aktor)

```plantuml
@startuml
title Use Case - Aplikasi Biro Organisasi (Manajemen SOP)
left to right direction

actor "Kepala OPD" as KOPD
actor "Kepala Biro Organisasi" as KBO
actor "Tim Evaluasi" as TE
actor "Tim Penyusun" as TP

rectangle "Sistem Biro Organisasi" {
  (Masuk ke dashboard - pilih role) as UC_Login
  (Lihat & kelola Daftar SOP) as UC_DaftarSOP
  (Inisiasi proyek SOP) as UC_InitProyek
  (Lihat detail SOP) as UC_DetailSOP
  (Override status SOP) as UC_OverrideStatus
  (Ajukan evaluasi SOP bulk) as UC_AjukanEval
  (Manajemen tim penyusun) as UC_MgrTimPenyusun
  (Manajemen pelaksana SOP) as UC_MgrPelaksana
  (Manajemen peraturan) as UC_MgrPeraturan
  (Setup & daftar TTD elektronik) as UC_TTE
  (Manajemen OPD) as UC_MgrOPD
  (Manajemen tim evaluasi) as UC_MgrTimEval
  (Manajemen evaluasi SOP) as UC_MgrEvalSOP
  (Buat penugasan evaluasi) as UC_BuatPenugasan
  (Lihat detail penugasan evaluasi) as UC_DetailPenugasan
  (Lihat daftar penugasan) as UC_DaftarPenugasan
  (Pelaksanaan evaluasi - draft, berita acara) as UC_PelaksanaanEval
  (Lihat SOP saya) as UC_SOPSaya
  (Edit SOP - metadata, prosedur, diagram) as UC_EditSOP
  (Kelola versi & riwayat SOP) as UC_VersiSOP
  (Komentar pada SOP) as UC_Komentar
  (Validasi pengesahan - verifikasi TTD) as UC_Validasi
}

KOPD --> UC_Login
KOPD --> UC_DaftarSOP
KOPD --> UC_InitProyek
KOPD --> UC_DetailSOP
KOPD --> UC_OverrideStatus
KOPD --> UC_AjukanEval
KOPD --> UC_MgrTimPenyusun
KOPD --> UC_MgrPelaksana
KOPD --> UC_MgrPeraturan
KOPD --> UC_TTE

KBO --> UC_Login
KBO --> UC_MgrOPD
KBO --> UC_MgrTimEval
KBO --> UC_MgrEvalSOP
KBO --> UC_BuatPenugasan
KBO --> UC_DetailPenugasan
KBO --> UC_TTE

TE --> UC_Login
TE --> UC_DaftarPenugasan
TE --> UC_DetailPenugasan
TE --> UC_PelaksanaanEval
TE --> UC_TTE

TP --> UC_Login
TP --> UC_SOPSaya
TP --> UC_DetailSOP
TP --> UC_EditSOP
TP --> UC_VersiSOP
TP --> UC_Komentar

@enduml
```

### 2.2 Diagram per Aktor (Ringkas)

```plantuml
@startuml
title Use Case per Aktor

left to right direction

actor "Kepala OPD" as KOPD
actor "Kepala Biro Organisasi" as KBO
actor "Tim Evaluasi" as TE
actor "Tim Penyusun" as TP

rectangle "Kepala OPD" {
  (Dashboard) as K1
  (Manajemen tim penyusun) as K2
  (Pelaksana SOP) as K3
  (Manajemen peraturan) as K4
  (Daftar SOP) as K5
  (Inisiasi proyek) as K6
  (Detail SOP & override status) as K7
  (Ajukan evaluasi) as K8
  (TTD elektronik) as K9
}
KOPD --> K1
KOPD --> K2
KOPD --> K3
KOPD --> K4
KOPD --> K5
KOPD --> K6
KOPD --> K7
KOPD --> K8
KOPD --> K9

rectangle "Kepala Biro Organisasi" {
  (Dashboard) as B1
  (Manajemen OPD) as B2
  (Manajemen tim evaluasi) as B3
  (Manajemen evaluasi SOP) as B4
  (Buat / detail penugasan evaluasi) as B5
  (TTD elektronik) as B6
}
KBO --> B1
KBO --> B2
KBO --> B3
KBO --> B4
KBO --> B5
KBO --> B6

rectangle "Tim Evaluasi" {
  (Dashboard) as E1
  (Daftar penugasan) as E2
  (Detail penugasan) as E3
  (Pelaksanaan evaluasi) as E4
  (TTD elektronik) as E5
}
TE --> E1
TE --> E2
TE --> E3
TE --> E4
TE --> E5

rectangle "Tim Penyusun" {
  (Dashboard) as P1
  (SOP saya) as P2
  (Detail & edit SOP) as P3
  (Versi & riwayat) as P4
  (Komentar) as P5
}
TP --> P1
TP --> P2
TP --> P3
TP --> P4
TP --> P5
@enduml
```

### 2.3 Relasi Include/Extend (Contoh)

```plantuml
@startuml
title Relasi Use Case (contoh)

left to right direction

actor "Tim Penyusun" as TP

(Edit SOP) as EditSOP
(Edit metadata) as EditMeta
(Edit prosedur) as EditProsedur
(Edit diagram BPMN/Flowchart) as EditDiagram
(Simpan perubahan) as Simpan

TP --> EditSOP
EditSOP ..> EditMeta : <<include>>
EditSOP ..> EditProsedur : <<include>>
EditSOP ..> EditDiagram : <<include>>
EditSOP ..> Simpan : <<include>>
@enduml
```

---

## 3. Tabel Mapping Route → Use Case

| Route (path) | Aktor | Use Case |
|--------------|--------|----------|
| `/` | Semua | Masuk ke dashboard (pilih role) |
| `/tim-penyusun/sop-saya` | Tim Penyusun | Lihat SOP saya |
| `/tim-penyusun/detail-sop/$id` | Tim Penyusun | Detail & edit SOP, versi, komentar |
| `/kepala-opd/daftar-sop` | Kepala OPD | Lihat & kelola daftar SOP, ajukan evaluasi |
| `/kepala-opd/initiate-proyek/$id` | Kepala OPD | Inisiasi proyek SOP |
| `/kepala-opd/detail-sop/$id` | Kepala OPD | Lihat detail SOP, override status |
| `/kepala-opd/manajemen-tim-penyusun` | Kepala OPD | Manajemen tim penyusun |
| `/kepala-opd/pelaksana-sop` | Kepala OPD | Manajemen pelaksana SOP |
| `/kepala-opd/manajemen-peraturan` | Kepala OPD | Manajemen peraturan |
| `/kepala-opd/ttd-elektronik` | Kepala OPD | Setup & daftar TTD elektronik |
| `/kepala-biro-organisasi/manajemen-opd` | Kepala Biro Organisasi | Manajemen OPD |
| `/kepala-biro-organisasi/manajemen-tim-evaluasi` | Kepala Biro Organisasi | Manajemen tim evaluasi |
| `/kepala-biro-organisasi/manajemen-evaluasi-sop` | Kepala Biro Organisasi | Manajemen evaluasi SOP |
| `/kepala-biro-organisasi/manajemen-evaluasi-sop/buat` | Kepala Biro Organisasi | Buat penugasan evaluasi |
| `/kepala-biro-organisasi/manajemen-evaluasi-sop/detail/$id` | Kepala Biro Organisasi | Detail penugasan evaluasi |
| `/kepala-biro-organisasi/ttd-elektronik` | Kepala Biro Organisasi | TTD elektronik |
| `/tim-evaluasi/penugasan` | Tim Evaluasi | Daftar penugasan |
| `/tim-evaluasi/penugasan/detail/$id` | Tim Evaluasi | Detail penugasan |
| `/tim-evaluasi/pelaksanaan/$id` | Tim Evaluasi | Pelaksanaan evaluasi |
| `/tim-evaluasi/ttd-elektronik` | Tim Evaluasi | TTD elektronik |
| `/validasi/ttd/berhasil` | Sistem/Publik | Verifikasi TTD berhasil |
| `/validasi/pengesahan/$id` | Sistem/Publik | Validasi pengesahan |

---

*Dokumen ini dihasilkan dari review kode di folder `client/` dan mapping fitur ke use case. Diagram PlantUML dapat di-render di [PlantUML Online](https://www.plantuml.com/plantuml/uml/), VS Code (ekstensi PlantUML), atau viewer yang mendukung PlantUML.*

# Code Review: Koherensi & Kode Tidak Terpakai

> Review koheren terhadap penggunaan fungsi/file dan identifikasi dead code (single source of truth akses, duplikasi, ekspor tidak terpakai).

---

## 1. Ringkasan temuan

| Kategori | Temuan |
|----------|--------|
| **Fungsi/ekspor tidak terpakai** | Beberapa fungsi/ekspor tidak pernah diimpor di codebase |
| **File komponen tidak terpakai** | 1 komponen UI tidak diimpor |
| **Store: ekspor standalone tidak dipakai** | evaluasi-store & peraturan-store hanya diakses lewat hook; ekspor fungsi standalone mati |
| **Duplikasi konsep** | Role display: app-store vs role-display + useAppRole (sengaja; useAppRole pakai role-display) |
| **Utils** | `formatTime` tidak dipakai; `delay` dipakai |

---

## 2. Fungsi / ekspor yang tidak terpakai

### 2.1 `client/src/utils/format-date.ts`
- **`formatTime(value)`** — tidak ada import di codebase. Hanya `formatDateId`, `formatDateIdLong`, `formatDatetime` yang dipakai.
- **Rekomendasi:** Hapus `formatTime` atau gunakan di satu tempat (mis. tampilan jam); kalau tidak dibutuhkan, hapus saja.

### 2.2 `client/src/lib/data/sop-detail.ts`
- **`getDetailSopCurrentUser()`** — tidak diimpor di mana pun.
- **`getDetailSopKomentarInitial()`** — tidak diimpor di mana pun.
- **Rekomendasi:** Hapus keduanya atau pindahkan ke modul yang memakai (mis. komentar/current user); saat ini DetailSOPPenyusun pakai `getInitialSopDetailKomentar()`.

### 2.3 `client/src/lib/data/penugasan-detail.ts`
- **`getAllPenugasanDetailIds()`** — tidak diimpor di mana pun. Hanya `getPenugasanDetailById` yang dipakai.
- **Rekomendasi:** Hapus atau gunakan (mis. untuk validasi/daftar ID).

### 2.4 `client/src/lib/stores/tim-penyusun-store.ts`
- **`getTimPenyusunByOpdId(opdId)`** — tidak diimpor. Yang dipakai dari store: `getTimPenyusunList`, `setTimPenyusunList`, `subscribeTimPenyusun`, `addTimPenyusun`, `updateTimPenyusun`, `removeTimPenyusun` (lewat `lib/data/tim-penyusun.ts` dan halaman).
- **Rekomendasi:** Hapus atau pakai di fitur filter/by-OPD.

### 2.5 `client/src/lib/stores/sop-status-store.ts`
- **`subscribeSopStatus(cb)`** — tidak diimpor. UI pakai `mergeSopStatus`, `getSopStatusOverride`, `setSopStatusOverride` + hook `useSopStatus`.
- **Rekomendasi:** Hapus jika tidak ada rencana subscribe global; atau gunakan jika ada kebutuhan reaktif di luar React.

### 2.6 `client/src/lib/stores/evaluasi-store.ts`  
Semua **ekspor fungsi standalone** berikut tidak diimpor di mana pun. Satu-satunya yang dipakai: **`useEvaluationCaseStore`** (di `useEvaluasi.ts`).
- **`getEvaluationCases()`**
- **`getCaseById(id)`**
- **`isSopInActiveCase(sopId)`**
- **`updateCaseStatus(id, status)`**
- **`getActiveCaseForSop(sopId)`** — dipakai via state di store, tidak via fungsi ekspor ini.
- **`getRiwayatEvaluasiForSop(sopId)`** — sama, hanya lewat state di hook.

**Rekomendasi:** Hapus kelima ekspor fungsi di atas, atau pindahkan kebutuhan ke dalam hook `useEvaluasi` (mis. expose `updateCaseStatus` lewat hook jika nanti dibutuhkan).

### 2.7 `client/src/lib/stores/peraturan-store.ts`  
Semua **ekspor fungsi standalone** berikut tidak diimpor dari luar. Yang dipakai: **`usePeraturanStore`** (di `usePeraturan.ts`).
- **`getPeraturanList()`** — hanya dipakai internal oleh `getPeraturanDicabut()`.
- **`setPeraturanList(next)`**
- **`initPeraturanList(seed)`** — halaman pakai `initPeraturanList` dari **hook** usePeraturan, bukan dari store.
- **`subscribePeraturan(cb)`**

**Rekomendasi:** Bisa tetap ekspor untuk keperluan non-React (testing/script) atau hapus dan hanya akses lewat hook/store internal.

### 2.8 `client/src/lib/constants/ui.ts`
- **`DIAGRAM_TAB`** dan **`DiagramTab`** — tidak diimpor. Komponen SOP pakai prop `hideDiagramTabs`, tidak pakai konstanta ini.
- **Rekomendasi:** Hapus atau gunakan di SOPPreviewTemplate untuk konsistensi label tab diagram.

---

## 3. File / komponen yang tidak terpakai

### 3.1 `client/src/components/ui/table-footer-summary.tsx`
- **`TableFooterSummary`** dan **`TableFooterSummaryProps`** — tidak diimpor di file mana pun.
- **Rekomendasi:** Hapus file atau gunakan di tabel yang butuh ringkasan footer (mis. pagination/summary).

---

## 4. Koherensi akses (single point of access)

| Area | Sudah koheren? | Catatan |
|------|----------------|--------|
| **Status SOP** | Ya | Satu tipe/daftar (`lib/types/sop.ts`), satu tampilan (StatusBadge + config), satu state override (sop-status-store + useSopStatus). |
| **Evaluasi (case)** | Ya | UI hanya pakai `useEvaluasi()`; tidak import langsung dari evaluasi-store. Ekspor fungsi store yang tidak dipakai bisa dibersihkan. |
| **Peraturan** | Ya | UI hanya pakai `usePeraturan()`; tidak import langsung dari peraturan-store. Ekspor fungsi store yang tidak dipakai bisa dibersihkan. |
| **Role / user display** | Ya | Route & TTE pakai `app-store` (getRoleNip, getRoleDisplayName, dll.); komponen pakai `useAppRole()` yang di dalamnya memakai `role-display.ts`. Tidak duplikasi logika, hanya lapisan. |
| **Tim penyusun** | Ya | Data layer `lib/data/tim-penyusun.ts` + store; halaman pakai data layer dan hook state (useManajemenTimPenyusunState). |

---

## 5. Rekomendasi aksi (prioritas)

**✅ Sudah dilakukan (penghapusan dead code):**

- `formatTime` (format-date.ts) — dihapus
- `getDetailSopCurrentUser`, `getDetailSopKomentarInitial` + impor seed terkait (sop-detail.ts) — dihapus
- `getAllPenugasanDetailIds` (penugasan-detail.ts) — dihapus
- `getTimPenyusunByOpdId` (tim-penyusun-store.ts) — dihapus
- `subscribeSopStatus` (sop-status-store.ts) — dihapus
- Ekspor standalone evaluasi-store: `getEvaluationCases`, `getCaseById`, `getActiveCaseForSop`, `isSopInActiveCase`, `getRiwayatEvaluasiForSop`, `updateCaseStatus`, `addEvaluationCase` — dihapus
- Semua ekspor fungsi standalone peraturan-store — dihapus (UI tetap lewat `usePeraturanStore` + hook usePeraturan)
- `DIAGRAM_TAB` dan `DiagramTab` (ui.ts) — dihapus
- File `components/ui/table-footer-summary.tsx` — dihapus

1. ~~**Rendah (quick win):** Hapus ekspor/fungsi yang jelas tidak dipakai~~ — **selesai** (lihat daftar di atas).

2. ~~**Rendah:** Hapus atau pakai komponen **`TableFooterSummary`**~~ — **file dihapus**.

3. **Opsional:** Dokumentasi singkat di setiap store: "Akses dari UI hanya lewat hook X" agar konsisten single point of access.

---

## 6. Review kedua (setelah pembersihan pertama)

Pemeriksaan ulang untuk sisa dead code:

| Item | Status | Tindakan |
|------|--------|----------|
| **lib/services/sop-preview.ts** | Tidak ada yang mengimpor (`getSopDetailForPreview`, `SopPreviewData`) | ✅ File dihapus |
| **SEED_OPD_REQUEST_BIRO** (penugasan-evaluasi-seed) | Tidak diimpor di mana pun | ✅ Dihapus |
| **SEED_SOP_CONTENT_PREVIEW** (penugasan-detail-seed) | Tidak diimpor; hanya `SEED_PENUGASAN_DETAIL_BY_ID` yang dipakai | ✅ Dihapus |
| **STATUS_HASIL_EVALUASI_ALL** (lib/types/sop.ts) | Tidak diimpor; tipe `StatusHasilEvaluasi` tetap dipakai | ✅ Dihapus |
| **TTE_ELIGIBLE_ROLES** (lib/constants/roles.ts) | Tidak diimpor | ✅ Dihapus |
| **lib/domain/berita-acara.ts** | `buildBeritaAcaraModel` dan `InstitutionMetadata` tidak pernah dipanggil/diimpor | ✅ File dihapus |
| **components/sop/BeritaAcaraPdf.tsx** | Komponen tidak pernah diimpor di mana pun | ✅ File dihapus |

**Pembersihan lanjutan (review ketiga):**
| **SEED_DETAIL_SOP_CURRENT_USER**, **SEED_DETAIL_SOP_KOMENTAR_INITIAL** (sop-detail-seed.ts) | Tidak diimpor setelah getDetailSopCurrentUser/getDetailSopKomentarInitial dihapus | ✅ Dihapus |
| **export type { RoleKey as Role }** (app-store.ts) | Tidak ada yang mengimpor `Role` dari app-store | ✅ Dihapus |

**Catatan:** Komponen **BeritaAcaraPdf.tsx** tidak pernah diimpor. File **components/sop/BeritaAcaraPdf.tsx** juga dihapus (dead code). Jika fitur "Berita Acara" PDF dibutuhkan nanti, komponen dan helper bisa ditambah kembali.

---

## 7. File yang diperiksa (referensi)

- **Stores:** app-store, evaluasi-store, peraturan-store, sop-status-store, tim-penyusun-store  
- **Data:** sop-detail, penugasan-detail, tim-evaluasi, tim-penyusun, role-display, user-dashboard, peraturan, opd, pelaksana, penugasan, penugasan-evaluasi, initiate-proyek  
- **Utils:** format-date, delay, version-diff, cn, sidebar-active, generate-id  
- **Hooks:** useEvaluasi, usePeraturan, useAppRole, useUI, useFilteredList, useEvaluasiDraft, usePenugasan, useSopStatus, useManajemenTimPenyusunState, useDaftarSOPData, usePagination  
- **Domain:** sop-status, sop-evaluasi, evaluasi  
- **Constants:** routes, status-domains, status-badge-config, ui, evaluasi, roles  
- **Komponen UI:** status-badge, table-footer-summary, PageHeaderContext, dll.

Dengan tindakan di atas, codebase lebih koheren dan bebas dari dead code yang jelas.

# Pemisahan Layer Frontend (UI / Business / Data)

Struktur client mengikuti pemisahan **logic UI**, **logic bisnis (domain)**, dan **logic data** agar maintainable dan siap diganti sumber data (API).

---

## 1. Data layer (`lib/data/`, `lib/stores/`, `lib/seed/`)

**Tanggung jawab:** Sumber data, state global, persistensi. Tidak ada aturan bisnis di sini.

| Lokasi | Isi |
|--------|-----|
| `lib/data/` | Abstraksi baca/tulis data. Hooks seperti `usePenugasanList()` yang init dari seed + subscribe store. Nanti bisa diganti dengan panggilan API. |
| `lib/stores/` | Zustand store (penugasan, peraturan, sop-status, evaluasi, app). Dipanggil dari `lib/data` atau dari hooks. |
| `lib/seed/` | Data mock/dummy. Diinisialisasi lewat data layer atau store; hindari import seed langsung di page. |

**Contoh:** `ManajemenEvaluasiSOP` memakai `usePenugasanList()` dari `@/lib/data/penugasan`; tidak lagi import store atau seed langsung.

---

## 2. Business / domain layer (`lib/domain/`)

**Tanggung jawab:** Aturan bisnis, validasi, mapping status. Tidak ada UI dan tidak ada akses langsung ke store/seed (kecuali type/const yang dipakai untuk aturan).

| File | Isi |
|------|-----|
| `sop-status.ts` | `canEditSop`, `isSopEligibleForSigning`, `canVerifyPenugasan`, `generateBANumber` |
| `sop-evaluasi.ts` | `canAjukanEvaluasiSOP`, `canSelectSOPForEvaluasi`, `STATUS_BUKAN_LIST_EVALUASI`, `isSopInEvaluasiList` |
| `evaluasi.ts` | `getStatusSopAfterEvaluasi`, `isFormEvaluasiSopComplete` |
| `berita-acara.ts` | `buildBeritaAcaraModel` |

**Contoh:** `DetailEvaluasiOPD` memakai `isFormEvaluasiSopComplete()`, `getStatusSopAfterEvaluasi()`, `STATUS_BUKAN_LIST_EVALUASI` dari domain. `SOPSaya` memakai `canEditSop()` dari domain.

---

## 3. UI / presentation layer (`components/`, `pages/`, `hooks/`)

**Tanggung jawab:** Tampilan, event handler, state UI (filter, tab, dialog). Memanggil data layer (hooks/data) dan domain (validasi, aturan), lalu render.

| Lokasi | Isi |
|--------|-----|
| `components/` | Komponen reusable; terima props + callback, tidak import store/seed. |
| `pages/` | Komposisi layout + panggil hooks (data/UI) + domain; handler tipis (delegasi ke domain/data). |
| `hooks/` | `useFilteredList`, `useCollapsiblePanels`, `useEvaluasiDraft`, `useEvaluasiLastBy`, dll. Yang murni UI tetap di sini; yang data bisa di `lib/data`. |

**Konstanta UI** (options dropdown, label) tetap di `lib/constants/` (e.g. `EVALUASI_DISPLAY_STATUS_OPTIONS`, `STATUS_HASIL_EVALUASI`).

---

## Alur impor yang diinginkan

- **Page** → import dari `@/lib/data`, `@/lib/domain`, `@/lib/constants`, `@/components`, `@/hooks`.
- **Domain** → import hanya `@/lib/types`, `@/lib/constants` (untuk konstanta aturan).
- **Data** → import dari `@/lib/stores`, `@/lib/seed`; tidak import domain.
- **Components** → import dari `@/components/ui`, `@/lib/constants` (jika perlu); tidak import store/seed/domain.

Dengan ini, penggantian sumber data (seed → API) hanya menyentuh `lib/data` dan store; aturan bisnis di domain tetap dipakai; UI hanya menampilkan dan memanggil layer di bawahnya.

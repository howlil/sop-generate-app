# Audit Clean Code — Codebase Frontend (Analisis Lengkap)

Tanggal: 2026-03-05  
**Acuan:** Arsitektur layer, aturan impor, dan kriteria audit mengikuti **`docs/clean_code.md`**. Dokumen ini adalah hasil audit lengkap (bagian A–J) dan roadmap perbaikan.  
Scope: `client/src` (React 19, Vite, TypeScript, TanStack Router/Start, Zustand, Tailwind v4, Radix, Vitest).

**Arsitektur (ringkasan):** Data layer (`lib/data`, `lib/stores`, `lib/seed`) — sumber data, tidak boleh import domain. Domain (`lib/domain`) — aturan bisnis, hanya import types/constants. UI (`pages`, `components`, `hooks`) — render + orchestrate, tidak import seed/store langsung; akses lewat lib/data atau hook.

---

## 1. Ringkasan Umum Codebase

**Penilaian umum:** Codebase mengikuti pemisahan layer dengan disiplin. Pages tidak mengimpor seed atau store langsung; routes hanya memakai app-store untuk guard; domain hanya mengimpor types dan constants; data layer hanya mengimpor stores dan seed. Hook useAppRole mengakses data role lewat `lib/data/role-display`, bukan seed langsung.

**Kesan utama:** Arsitektur benar-benar diterapkan. Beberapa file page/komponen masih besar (terutama diagram SOP dan beberapa halaman manajemen). Pola form state dan dialog state berulang tanpa standar tunggal. Filter/search sudah diseragamkan di ManajemenPeraturan dan ManajemenOPD dengan useFilteredList.

**Arsitektur:** Sehat. Separation of layers konsisten; tidak ada pelanggaran kritis.

---

## 2. Critical Issues

Tidak ada temuan **Critical**. Tidak terdeteksi:
- Page/component mengimpor seed atau store langsung
- Data layer mengimpor domain
- Bocornya domain logic ke store atau ke data layer

---

## 3. Major Issues

| Lokasi | Kategori | Severity | Masalah | Dampak | Perbaikan |
|--------|----------|----------|---------|--------|------------|
| **Pages >300 baris** | Maintainability | Major | ManajemenOPD (421), DetailEvaluasiOPD (403), DetailSOPProsedurEditor (390), DaftarSOP (324), ManajemenPeraturan (323), DetailPenugasanEvaluasi (323). Logic + UI campur dalam satu file. | Sulit dilacak, refactor dan testing mahal. | Pecah ke subkomponen/hook (DetailEvaluasiOPD, KepalaOPDTab, ManajemenTimPenyusun, TTDElektronikPage sudah diperkecil). Sisa: ManajemenOPD, DetailEvaluasiOPD, DetailSOPProsedurEditor, DaftarSOP, DetailPenugasanEvaluasi. Target per file <250 baris. |
| **Form state & dialog state** | Clean Code | Major | Form state (nama, nip, email, jenis, nomor, dll.) dan dialog open state tersebar sebagai banyak `useState` tanpa pola seragam di banyak page. | Duplikasi, inkonsistensi. | Standarkan pola (satu objek form + setter, atau useForm); dialog state bisa objek `{ create, edit, detail }`. Refactor bertahap. |
| **Komponen diagram sangat besar** | Maintainability | Major | SOPDiagramBpmn (764 baris), SOPDiagramFlowchart (647), FlowchartArrowConnector (620), BpmnArrowConnector (377). | Sulit di-test dan diubah. | Logic diagram memang kompleks; pertimbangkan pecah per fase (layout vs render vs interaction) atau ekstrak helper murni ke file terpisah. |

**Filter/search:** Sudah diseragamkan — ManajemenPeraturan dan ManajemenOPD (kedua tab) memakai useFilteredList dengan controlledSearch.

---

## 4. Minor Issues

| Lokasi | Kategori | Severity | Masalah | Perbaikan |
|--------|----------|----------|---------|-----------|
| **lib/types/sop.ts** | Layer / Consistency | Minor | Re-export dari `@/lib/domain/sop-evaluasi` (deprecated). Types mengimpor domain untuk backward compat. | Konsumen baru impor langsung dari `@/lib/domain/sop-evaluasi`; hapus re-export bila tidak ada pemakai. |
| **useDaftarSOPFilters** | Maintainability | Minor | Hook single-use; type dipakai useDaftarSOPData. | Boleh tetap; atau inline state di DaftarSOP dan pindah type ke useDaftarSOPData. |
| **mergeSopStatus di sop-status-store** | Architecture | Minor | Fungsi merge (override status) ada di file store. | Bisa dipindah ke lib/domain jika dianggap aturan bisnis; saat ini tipis dan bisa tetap di store. |
| **Komentar / magic string** | Clean Code | Minor | Sebagian string pesan/toast dan label literal di page. | Kumpulkan di constants atau i18n bila perlu; tidak blocking. |
| **lib/services/sop-preview** | — | Minor | Service memakai lib/data; tidak mengimpor domain/seed. | Sudah sesuai; ke depan service hanya orchestrate data layer. |

---

## 5. Layer Violations

### 5.1 Sudah diperbaiki

- **hooks/useAppRole.ts** — Sebelumnya mengimpor ROLE_NIPS, ROLE_DISPLAY_NAMES, ROLE_USER_NAMES dari `@/lib/seed/user-seed`. Sekarang akses lewat `lib/data/role-display.ts` saja.

### 5.2 Tidak ada pelanggaran lain

- **Pages:** Hanya import hooks, lib/data, lib/domain, lib/constants, components.
- **Components:** Tidak ada import store/seed/domain (hanya constants/UI).
- **Data layer:** Hanya import lib/stores dan lib/seed; tidak import domain.
- **Domain:** Hanya import lib/types dan lib/constants.
- **Routes:** Hanya app-store untuk guard/sidebar — wajar.
- **Stores:** app-store mengimpor user-seed — diterima (store = data layer).
- **Hooks:** usePenugasan, usePeraturan, useEvaluasi, useSopStatus mengimpor store — diterima (abstraksi data). usePenugasanEvaluasi mengimpor domain (canVerifyPenugasan, generateBANumber) — diterima (orchestration boleh panggil domain).

---

## 6. Analisis per Area (A–J)

### A. Arsitektur dan struktur folder

| Aspek | Status | Keterangan |
|-------|--------|-------------|
| Struktur folder | ✅ | pages/, components/, hooks/, lib/data, lib/domain, lib/stores, lib/seed, lib/types, lib/constants, lib/services — sesuai tanggung jawab layer. |
| Penempatan file | ✅ | Tidak ada file salah layer. |
| Page gemuk | ⚠️ | 6+ page masih >300 baris (lihat Major Issues). |
| Domain logic bocor | ✅ | Aturan bisnis di lib/domain; page/hook memanggil domain, tidak menyalin logic. |
| Data access | ✅ | Terpusat di lib/data + hooks; page tidak akses store/seed langsung. |
| Abstraksi sia-sia | ✅ | Tidak terdeteksi abstraksi yang hanya menambah indirection tanpa manfaat. |

---

### B. TanStack Router / TanStack Start

| Aspek | Status | Keterangan |
|-------|--------|-------------|
| Definisi route | ✅ | File-based routing; 33 file route; nama konsisten (role.layout.page, params $id, $opdId, $sopId). |
| Nested route | ✅ | Layout per role (tim-penyusun, tim-evaluasi, kepala-opd, biro-organisasi); child route jelas. |
| Route logic | ✅ | Tipis: createFileRoute + component + beforeLoad (guard redirect). Tidak ada loader/data fetching di route. |
| Pencampuran tanggung jawab | ✅ | Route hanya guard + render page; tidak ada business/data logic di file route. |
| Params / search params | ✅ | useParams, search params (token TTE) dipakai di page, bukan di route file. |
| Auth guard | ✅ | beforeLoad + isTimPenyusun/isKepalaOPD/isTimEvaluasi/isBiroOrganisasi; redirect ke index bila tidak sesuai. |

---

### C. State management (Zustand)

| Aspek | Status | Keterangan |
|-------|--------|-------------|
| Store di tempat tepat | ✅ | app-store (role, toast), penugasan-store, peraturan-store, evaluasi-store, sop-status-store, tim-penyusun-store — state global/serialized. |
| State lokal vs global | ✅ | State UI (dialog, form, tab, filter) di page/hook; state data (list penugasan, peraturan, evaluasi) di store. |
| Business logic di store | ✅ | Store hanya state + setter; tidak ada aturan bisnis di store. mergeSopStatus di sop-status-store adalah helper merge (bisa pindah domain bila dianggap aturan). |
| Ukuran store | ✅ | Store tidak gemuk; satu concern per store. |
| Duplikasi state | ⚠️ | Derived state (filteredList) dihitung di page/hook dari list + searchQuery; tidak diduplikasi ke store — wajar. |
| Selector / subscription | ✅ | Hooks pakai selector (useAppStore(s => s.role)); useTimPenyusunList subscribe ke store. |
| Coupling | ✅ | Page tidak import store langsung; lewat hook. |

---

### D. Business logic / domain

| Aspek | Status | Keterangan |
|-------|--------|-------------|
| Aturan di lib/domain | ✅ | evaluasi.ts (getStatusSopAfterEvaluasi, isFormEvaluasiSopComplete), sop-status.ts (canEditSop, isSopEligibleForSigning, canVerifyPenugasan, generateBANumber), sop-evaluasi.ts (status, canAjukanEvaluasiSOP, canSelectSOPForEvaluasi), berita-acara.ts (buildBeritaAcaraModel). |
| Domain pure & testable | ✅ | Fungsi domain hanya import types/constants; tidak side effect; mudah di-unit test. |
| Logic tersembunyi | ⚠️ | Validasi "wajib isi" dan pesan error ada di handler di page; belum dipusatkan di domain. Bukan pelanggaran berat. |
| Validasi tercecer | ⚠️ | Sebagian di page (if (!x) showToast(...)); sebagian di domain (isFormEvaluasiSopComplete). Konsistenkan ke domain untuk aturan bisnis. |
| Mapping status | ✅ | STATUS_HASIL_EVALUASI, EDITABLE_STATUSES, SIGNABLE_STATUSES di domain; konsisten. |
| Edge case | ✅ | Tidak terdeteksi logic ambigu atau edge case yang diabaikan. |

---

### E. Data layer

| Aspek | Status | Keterangan |
|-------|--------|-------------|
| Abstraksi | ✅ | lib/data: getInitial*, useXList, add/update/remove; page memanggil lib/data atau hook yang wrap store. |
| Logic di data layer | ✅ | Data layer hanya init, read, write; tidak ada aturan bisnis. |
| Akses seed | ✅ | Hanya lib/data dan lib/stores (dan lib/seed untuk seed-to-seed); page/hook tidak import seed. |
| Swap seed → API | ✅ | Kontrak lib/data bisa diganti implementasi (panggil API instead of store/seed); page tidak perlu berubah. |

---

### F. Components dan clean code

| Aspek | Status | Keterangan |
|-------|--------|-------------|
| Komponen besar | ⚠️ | Diagram: SOPDiagramBpmn 764, SOPDiagramFlowchart 647, FlowchartArrowConnector 620, BpmnArrowConnector 377. BeritaAcaraPdf 279. Lainnya wajar. |
| Props banyak | ⚠️ | KepalaOPDTab, DetailEvaluasiOPDFormPanel punya banyak props; sudah dipecah dari parent. |
| Callback chain | ✅ | Tidak ada callback chain panjang yang membingungkan. |
| Reusable | ✅ | FormDialog, ConfirmDialog, SearchToolbar, Table, StatusBadge, dll. dipakai lintas page. |
| Conditional rendering | ✅ | Tidak ada conditional hell; pola if/ternary wajar. |
| Naming | ✅ | Konsisten: PascalCase komponen, useX hook, handleX handler. |
| Dead code / magic number | ⚠️ | Tidak ada dead code masif; magic number/string ada (literal toast, label) — minor. |
| Comments | ✅ | Tidak dipakai untuk menutupi kode buruk; dipakai untuk konteks/domain. |

---

### G. Custom hooks

| Hook | Dipakai di | Fokus | Catatan |
|------|------------|--------|---------|
| useAppRole | HeaderProfile, DetailEvaluasiOPD, routes (TTD) | UI + akses role | Data role lewat lib/data/role-display. ✅ |
| useFilteredList | SOPSaya, DaftarSOP, PenugasanEvaluasi, ManajemenTimEvaluasi, ManajemenPeraturan, ManajemenOPD, dll. | UI (filter list) | Reusable, tidak business logic. ✅ |
| usePenugasan, usePeraturan, useEvaluasi, useSopStatus | Banyak page | Data (wrap store) | Abstraksi data; tidak business logic di hook. ✅ |
| usePenugasanEvaluasi | DetailPenugasanEvaluasi | Orchestration | Memanggil domain (canVerifyPenugasan, generateBANumber); wajar. ✅ |
| useManajemenOPDState, useManajemenPeraturanState, useManajemenTimPenyusunState | ManajemenOPD, ManajemenPeraturan, ManajemenTimPenyusun | UI state (dialog/form) | Hanya mengelompokkan useState; tidak business logic. ✅ |
| useDaftarSOPFilters, useDaftarSOPData | DaftarSOP | Filter + data | Single-use; boleh tetap. ✅ |
| useEvaluasiDraft, useEvaluasi | DetailEvaluasiOPD, EvaluasiSOPPage, PelaksanaanEvaluasi, DaftarSOP | Data evaluasi | ✅ |
| useTTESignature | DetailSOP, DetailPenugasanEvaluasi | TTE | ✅ |
| useUI (useToast, useCollapsiblePanels) | Banyak | UI | ✅ |
| useKomentar | DetailSOPPenyusun | Data komentar | ✅ |

Tidak ada hook yang memuat business logic yang seharusnya di domain; tidak ada hook yang hanya membungkus satu baris tanpa nilai tambah.

---

### H. Over-engineering

| Area | Verdict | Keterangan |
|------|---------|------------|
| Dialog Kepala OPD (4 file + hook) | ✅ Bukan | KepalaOPDTab semula >400 baris; pecahan wajar. |
| useManajemen*State hooks | ✅ Bukan | Mengurangi noise di page; pragmatis. |
| useFilteredList controlledSearch | ✅ Bukan | Satu search untuk banyak list; nilai tambah jelas. |
| Diagram (banyak file) | ✅ Bukan | Kompleksitas domain diagram; bukan over-engineering. |

Tidak terdeteksi abstraction terlalu dini, wrapper berlapis, atau pattern enterprise tanpa kebutuhan.

---

### I. Logic risks / possible bugs

| Lokasi | Risiko | Severity | Keterangan |
|--------|--------|----------|------------|
| DetailEvaluasiOPD — lastEvaluatedBy | Stale state / sync | Low | State localStorage + seed; pastikan setiap submit memanggil setLastEvaluatedBy. |
| Validasi form di page | Validasi tercecer | Low | Aturan "wajib isi" di handler; pindah ke domain/helper bila bertambah. |
| app-store — roleStorage | Format lama | Low | Sudah ada handling role string; pertahankan saat ubah format. |
| ManajemenOPD filter | — | — | Sudah useFilteredList; risiko duplikasi filter hilang. |
| Branching / status mapping | — | — | Tidak terdeteksi salah branching atau mapping tidak konsisten. |
| Race condition | — | — | Tidak terdeteksi. |

---

### J. Standar industri

| Pertanyaan | Jawaban |
|------------|---------|
| Mudah dipahami developer baru? | Cukup. Struktur layer jelas; naming konsisten. File besar (diagram, beberapa page) butuh waktu. |
| Mudah di-debug? | Ya. Source map; state terpusat di store atau hook; tidak ada magic tersembunyi. |
| Mudah di-test? | Domain dan data layer mudah di-unit test; UI bisa integration test. Tidak ada test otomatis di repo (Vitest ada di stack). |
| Mudah di-refactor? | Ya. Layer jelas; pecah page/komponen sudah dilakukan bertahap. |
| Swap seed → API? | Ya. lib/data sebagai abstraction; ganti implementasi tanpa ubah page. |
| Separation of concerns | Sehat. Bukan kosmetik; aturan impor ditaati. |
| Pragmatis vs akademik | Pragmatis. Tidak ada pattern berlebihan. |
| Layak production? | Ya. Dengan catatan: lanjutkan refactor file besar; standarkan form/dialog state. |

---

## 7. Refactor Roadmap

### Prioritas tinggi
1. **Pertahankan layer** — Sudah: useAppRole lewat lib/data/role-display. Jangan tambah import seed/store di page/hook.
2. **Ukuran file** — Sudah: ManajemenTimPenyusun, TTDElektronikPage, KepalaOPDTab, DetailEvaluasiOPD (panel/dialog). **Sisa:** ManajemenOPD (421), DetailEvaluasiOPD (403), DetailSOPProsedurEditor (390), DaftarSOP (324), ManajemenPeraturan (323), DetailPenugasanEvaluasi (323). Target <250 baris per file.
3. **Filter list** — Selesai: ManajemenPeraturan dan ManajemenOPD memakai useFilteredList.

### Prioritas menengah
4. **Form state** — Standarkan pola form (objek state + setter atau useForm) di halaman baru.
5. **Dialog state** — Objek state dialog (mis. `{ create, edit, detail }`) di halaman dengan banyak dialog.
6. **Validasi** — Pindahkan aturan validasi bisnis ke lib/domain atau helper yang bisa di-test.

### Prioritas rendah
7. useDaftarSOPFilters — Opsional inline atau pertahankan.
8. mergeSopStatus — Opsional pindah ke domain.
9. String UI/error — Constants atau i18n bila tim berkembang.
10. lib/types/sop.ts — Hapus re-export deprecated dari domain bila tidak ada pemakai.

---

## 8. Kesimpulan Akhir

| Pertanyaan | Jawaban |
|------------|---------|
| Apakah codebase ini clean? | Cukup clean. Layer jelas, impor sesuai aturan. Perhatian: ukuran file dan keseragaman pola form/dialog. |
| Apakah over-engineered? | Tidak. Pecahan komponen dan hook sebanding dengan kompleksitas. |
| Apakah layering-nya sehat? | Ya. Satu pelanggaran (useAppRole → seed) sudah diperbaiki. |
| Apakah siap scale? | Ya. Data layer abstrak; domain terpisah; UI memanggil data dan domain. |
| Layak tim production? | Ya. Pertahankan aturan impor; lanjutkan refactor file besar; standarkan form/dialog. |

**Lima langkah paling penting:**
1. Jangan izinkan import seed/store langsung dari page atau hook UI.
2. Kurangi ukuran file page/komponen >300 baris (terutama ManajemenOPD, DetailEvaluasiOPD, DetailSOPProsedurEditor).
3. Filter/search sudah seragam; pertahankan useFilteredList untuk list + search.
4. Standarkan pola form state dan dialog state.
5. Pindahkan validasi bisnis ke domain atau helper yang bisa di-test.

---

## Format temuan (referensi)

Setiap temuan mengikuti: **Lokasi | Kategori | Severity | Masalah | Dampak | Perbaikan.**  
Kategori: Layer Violation | Over-engineering | Logic Flaw | Clean Code Issue | Architecture Issue | State Management Issue | Routing Issue | Maintainability Issue | Scalability Issue.  
Severity: Critical | Major | Minor.

Audit ini mengacu pada `docs/clean_code.md` dan gaya review yang kritis, pragmatis, dan actionable.

---

## Dokumen terkait

| Dokumen | Fungsi |
|---------|--------|
| **clean_code.md** | Spesifikasi audit: arsitektur layer, aturan impor, format temuan, kriteria (A–J). |
| **constraint.md** | Batasan teknis / kebijakan proyek. |
| **design-style-guide.md** | Panduan desain dan style UI. |

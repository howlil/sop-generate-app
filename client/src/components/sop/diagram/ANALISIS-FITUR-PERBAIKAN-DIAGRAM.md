# Analisis Fitur "Perbaiki diagram"

## Ringkasan

Fitur **Perbaiki diagram** memicu **susun ulang layout path/panah** dengan mengubah urutan koneksi yang di-route. Saat ini hanya **Flowchart** yang terpengaruh; **BPMN** tidak menerima trigger ini.

---

## 1. Alur trigger

| Langkah | Lokasi | Perilaku |
|--------|--------|----------|
| Klik tombol | `DetailSOPPenyusun.tsx` (~baris 192) | `onClick={() => setDiagramVersion((v) => v + 1)}` |
| State | `useDetailSOPProsedur()` | `diagramVersion` naik 1 setiap klik |
| Props ke template | `DetailSOPPenyusun.tsx` (~157) | `pathLayoutSeed={diagramVersion}` ke `SOPPreviewTemplate` |
| Template → diagram | `SOPPreviewTemplate.tsx` | Hanya **Flowchart** yang dapat `pathLayoutSeed`; **BPMN** tidak dapat prop ini |

---

## 2. Perilaku di Flowchart

**File:** `SOPDiagramFlowchart.tsx`

- **`pathLayoutSeed`** dipakai di:
  1. **Urutan koneksi** (`allConnections` useMemo, ~baris 93–164)
     - Daftar koneksi di-sort dengan prioritas: Ya → Tidak → linier; untuk "Tidak" loop-back didahulukan.
     - Untuk koneksi yang masih seri, urutan dipecah dengan **hash** yang bergantung pada `pathLayoutSeed` dan `id` koneksi:
       - `hashId(pathLayoutSeed, a.id) - hashId(pathLayoutSeed, b.id)`
     - Jadi setiap kali `pathLayoutSeed` berubah, **urutan koneksi** berubah (untuk koneksi yang tie).
  2. **Reset konteks routing** (useLayoutEffect ~baris 208–210)
     - `routedSegmentsRef.current = new Map()` setiap `pathLayoutSeed` berubah.
     - Semua panah dihitung ulang dari awal tanpa “jejak” path sebelumnya.

**Dampak:** Klik "Perbaiki diagram" → urutan route berubah → anchor/sisi yang dipakai bisa beda → **layout path Flowchart berubah** (misalnya path yang tumpang tindih bisa pindah ke konfigurasi lain).

---

## 3. Perilaku di BPMN

**File:** `SOPDiagramBpmn.tsx`, `BpmnArrowConnector.tsx`

- **SOPDiagramBpmn** tidak menerima `pathLayoutSeed` (atau prop “perbaiki” apapun) dari `SOPPreviewTemplate`.
- **BpmnArrowConnector** punya prop **`rerouteVersion`** dan memakainya di dependency `useLayoutEffect` (routing path). Tapi **SOPDiagramBpmn tidak mengoper `rerouteVersion`** ke connector (selalu pakai default / tidak di-set dari parent).

Jadi saat ini:

- **Perbaiki diagram tidak mengubah apa pun di BPMN.**
- Urutan koneksi BPMN tetap dari `bpmnConnections` (useMemo yang tidak bergantung pada seed).
- Tidak ada mekanisme “coba lagi dengan versi lain” untuk path BPMN dari UI.

---

## 4. Rekomendasi

1. **Seragamkan perilaku Flowchart dan BPMN**
   - Oper **`pathLayoutSeed`** (atau nama lain, misalnya `diagramFixVersion`) dari `SOPPreviewTemplate` ke **SOPDiagramBpmn**.
   - Di **SOPDiagramBpmn**, teruskan ke **BpmnArrowConnector** sebagai **`rerouteVersion={pathLayoutSeed}`** (atau nilai turunannya).
   - Efek: setiap klik "Perbaiki diagram" akan memicu ulang `useLayoutEffect` di setiap connector BPMN → path dihitung ulang; berguna jika ada dependency urutan render / konteks shared (misalnya `routedSegmentsRef` atau state lain yang di-reset di parent).

2. **Opsi lanjutan untuk BPMN**
   - Jika ingin BPMN juga “mencoba urutan koneksi lain” seperti Flowchart:
     - Bangun daftar koneksi BPMN (misalnya `bpmnConnections`) dengan urutan yang bergantung pada **seed** (hash berdasarkan `pathLayoutSeed` + id koneksi), sehingga setiap klik "Perbaiki diagram" mengacak urutan yang tie.
     - Tetap pertahankan aturan prioritas (misalnya Ya/Tidak, loop-back) mirip Flowchart, baru gunakan hash untuk tie-breaking.

3. **UX**
   - Tombol saat ini **disabled** ketika **Ubah langkah** aktif (`disabled={isEditingSteps}`), sehingga user tidak bisa mengubah langkah dan perbaiki diagram bersamaan; ini masuk akal.
   - Tooltip: `title="Paksa susun ulang layout diagram"` sudah menjelaskan maksud tombol; bisa ditambah “(Flowchart & BPMN)” setelah BPMN ikut bereaksi.

---

## 5. Ringkas

| Aspek | Flowchart | BPMN |
|--------|-----------|------|
| Terpengaruh "Perbaiki diagram"? | Ya | Tidak (saat ini) |
| Mekanisme | Ubah `pathLayoutSeed` → urutan koneksi (hash) + reset `routedSegmentsRef` | Tidak ada prop / trigger |
| Perbaikan yang disarankan | - | Terima `pathLayoutSeed` (atau `diagramFixVersion`) dan oper ke connector sebagai `rerouteVersion`; opsi: urutan koneksi BPMN juga bergantung pada seed. |

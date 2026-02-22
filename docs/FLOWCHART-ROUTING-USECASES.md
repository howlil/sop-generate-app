# Analisis Use Case: Flowchart Arrow Routing

Dokumen ini menganalisis use case yang **sudah teridentifikasi** vs yang **belum / berpotensi bermasalah** pada algoritma path-finding dan scan phase untuk panah flowchart SOP.

---

## 1. Use case yang sudah ter-cover

| Use case | Cara handle |
|----------|-------------|
| **Linear A→B, B→C (satu kolom)** | Case 1: bottom→top / top→bottom. |
| **Linear A→B, B di kanan/kiri A** | Case 2: bottom↔left/right, right/left↔top; usedSides untuk alternatif. |
| **Decision Ya (ke bawah, sama kolom)** | bottom→top; di-route setelah Tidak. |
| **Decision Tidak (loop-back, tujuan di atas)** | right→right / left→left; reserved left/right pada target; di-route paling dulu. |
| **Decision Tidak (tujuan di bawah, beda kolom)** | right→top / left→top, bottom→left/right; reserved sides mencegah linear merebut left/right target. |
| **Start terminator → task berikutnya** | Case 0: tail right/left/bottom, head top. |
| **Non-decision loop-back (tujuan di atas)** | right→right, left→left, top↔bottom. |
| **Hindar overlap dengan panah lain** | occupiedSegments + penalty (overlap/cross/near); routedSegmentsRef dipakai berurutan. |
| **Path tidak tembus shape** | obstacles + grid hanya di luar obstacle. |
| **Path dalam bounds A4** | globalBounds + globalBoundsMargin; loop-back dapat margin lebih besar. |
| **Fallback jika semua kandidat gagal** | Coba dulu orthogonal dengan `obstacles: []`; jika dapat path dipakai, else garis lurus bottom→top. |

---

## 2. Use case yang ter-cover sebagian / edge case

### 2.1 Dua (atau lebih) decision “Tidak” ke shape target yang sama ✅

- **Saat ini:** `reservedSides` adalah `Map<string, Set<string>>`: key `${to}-left` / `${to}-right`, value **Set** dari semua connectionId Tidak yang menuju target itu. Setiap koneksi Tidak (termasuk OPC `__in`) dianggap “owner” jika id-nya atau base id (tanpa `__in`) ada di Set → tidak dideprioritaskan.
- **Urutan:** Di dalam Tidak, **loop-back** (toSeq < fromSeq) di-route lebih dulu (sort sekunder).

### 2.2 Decision “Ya” dan linear sama-sama ingin top target

- **Saat ini:** Hanya **Tidak** yang reserve sisi (left/right). **Ya** tidak reserve top.
- **Dampak:** Linear A→B bisa memakai (bottom, top) dan “mengambil” top B sebelum Ya di-route (tapi Ya di-route sebelum linear, jadi Ya dapat bottom→top dulu; linear dapat sisa). Urutan routing (Tidak, Ya, linear) sudah membantu; konflik Ya vs linear untuk **top** jarang karena Ya prefer bottom→top dan linear untuk A di atas B juga bottom→top — beda source.
- **Risiko:** Jika suatu saat ada dua koneksi masuk ke top B (mis. Ya + satu linear dari kiri), keduanya bisa bertabrakan visual; usedSides akan menandai top B “sibuk” setelah yang pertama, tapi usedSides di connector pakai ref dan di-update async (onPathUpdated), jadi urutan effect bisa membuat usedSides belum ter-update.

### 2.3 usedSides: update asinkron vs urutan effect

- **Saat ini:** `onPathUpdated` memanggil `setUsedSides`; semua connector memakai `usedSidesRef.current = usedSides` dan effect baca ref. Tapi **usedSides** dari state mungkin belum ter-update saat effect connector berikutnya jalan (React batch).
- **Dampak:** Koordinasi “sisi sudah dipakai” lebih mengandalkan **urutan routing** (Tidak, Ya, linear) dan **reservedSides** (tanpa perlu usedSides). Untuk penyesuaian halus (mis. “kalau left sibuk pakai right”) usedSides membantu setelah re-render; pada render pertama bisa ada race.
- **Kesimpulan:** Reserved sides + routing order menutupi banyak kasus; usedSides lebih untuk fine-tuning setelah path ada.

### 2.4 Koneksi cross-page (OPC: Off-Page Connector)

- **Saat ini:** Koneksi dipotong jadi dua: `conn__out` (from step → opc-out shape) dan `conn__in` (opc-in shape → to step). Reserved sides dihitung dari **allConnections** (sebelum split); key pakai `c.to` (shape target).
- **Out:** Target = `opc-out-step-X-to-step-Y`, bukan `sop-step-*` → tidak ada reserve untuk opc-out (dan memang OPC hanya “pelarian” ke halaman lain).
- **In:** Target = `sop-step-Y` → reserve left/right untuk koneksi Tidak yang **ke step Y**. Tapi koneksi `__in` punya sourceType `flowchart-opc`, bukan decision; jadi **tidak** ikut reserve. Hanya koneksi in-page yang ke `sop-step-Y` dengan label Tidak yang reserve. Itu konsisten.
- **Risiko:** Jika decision Tidak **cross-page** (dari page 1 ke step di page 2), setelah split: conn__out (step → opc-out), conn__in (opc-in → step). Reserved untuk step Y tetap dari allConnections (conn asli ke sop-step-Y); id koneksi asli berubah jadi conn__in. Di scan kita iterate allConnections **sebelum** split; conn yang cross-page masih punya to = sop-step-Y, jadi reserve tetap ke sop-step-Y dengan conn.id asli. Setelah split, conn__in.id !== conn.id asli → reservedSides.get(`sop-step-Y-left`) = conn.id asli, sedangkan connector yang jalan adalah conn__in. Jadi conn__in akan menganggap left/right reserved untuk “orang lain” dan dideprioritaskan. Itu yang diinginkan (OPC-in tidak merebut left/right step Y). **Kesimpulan:** OPC use case sudah konsisten dengan scan.

### 2.5 Custom label selain “Ya”/“Tidak” ✅

- **Saat ini:** `isYaLabel` / `isTidakLabel` memakai normalisasi: Ya = `ya|yes|y`, Tidak = `tidak|no|n` (trim, case-insensitive). Sort dan reserved sides memakai helper yang sama. Label custom seperti "Yes", "No", "Y", "N" tetap dikenali.

---

## 3. Use case yang belum teridentifikasi / berpotensi gagal

### 3.1 Banyak panah masuk ke satu shape (fan-in tinggi) ✅

- **Saat ini:** **Offset distribusi anchor**: untuk setiap pasangan (sSide, eSide), `distance` di hitung dari jumlah koneksi yang sudah memakai sisi itu: `(count + 1) / (count + 2)`. Panah pertama pakai 0.5 (tengah), berikutnya 0.67, 0.75, … sehingga anchor merata di sepanjang sisi (fan-in).

### 3.2 Banyak panah keluar dari satu shape (fan-out)

- **Skenario:** Satu decision Ya + Tidak sudah dua; kalau ada “multi-branch” (lebih dari 2 cabang) tidak dimodel di data saat ini. Untuk 2 cabang, usedSides + reserved + urutan sudah bantu.
- **Gap:** Jika nanti ada 3+ cabang dari satu shape, perlu strategi sisi dan prioritas tambahan.

### 3.3 Grid terlalu jarang / path tidak ketemu ✅

- **Saat ini:** Jika semua kandidat side-pair gagal (path kosong), connector memanggil **fallback orthogonal**: `routeOrthogonal` sekali lagi dengan `obstacles: []` (hanya source dan target sebagai obstacle). Jika dapat path, dipakai; jika tetap kosong, baru pakai garis lurus bottom→top. Dengan begitu path fallback tidak tembus shape lain.

### 3.4 Shape sangat kecil atau sangat besar

- **Sangat kecil:** colThreshold = max(from.width, to.width)*0.5 bisa besar relatif terhadap jarak → sameCol true; perilaku ok. Tapi jika shape 1px, margin 10 bisa menutup semua.
- **Sangat besar:** Bounds dan grid besar; A* bisa lambat atau banyak waypoint. Belum ada batas panjang path atau waktu.

### 3.5 Decision dengan Ya dan Tidak ke **step yang sama** (dead branch)

- **Skenario:** Konfigurasi salah: Ya dan Tidak sama-sama ke step X.
- **Saat ini:** Dua koneksi ke satu target; reserve left/right untuk Tidak. Keduanya di-route; bisa sama-sama masuk dari sisi yang berbeda. Tidak ada validasi “satu target hanya dari satu cabang”.

### 3.6 Urutan routing per halaman vs global ✅

- **Saat ini:** Sort: (1) tipe Tidak > Ya > linear; (2) **di dalam Tidak**, loop-back (toSeq < fromSeq) lebih dulu. Jadi Tidak loop-back di-route sebelum Tidak ke bawah, dan left/right target lebih mungkin dipakai loop-back.

### 3.7 Layout dinamis / resize setelah mount

- **Saat ini:** useLayoutEffect jalan saat DOM ada; ResizeObserver di flowchart memicu measurePelaksanaBounds dan setBoundsVersion. Effect connector punya dependency array; saat bounds/posisi berubah effect jalan lagi.
- **Risiko:** routedSegmentsRef di-reset per render (`routedSegmentsRef.current = new Map()`); urutan effect bisa berbeda setelah resize (mis. karena conditional render), sehingga urutan “siapa route dulu” bisa berubah dan hasil path bisa beda.

### 3.8 BPMN memakai connector yang sama

- **Saat ini:** SOPDiagramBpmn juga pakai FlowchartArrowConnector dan routedSegmentsRef; tidak pass reservedSidesRef (optional). BPMN mungkin punya struktur lain (lane, different shapes); reserve untuk “Tidak” mungkin tidak dipakai.
- **Gap:** Kalau BPMN punya konsep serupa (decision + loop-back), reserved sides saat ini hanya diisi dari flowchart allConnections; BPMN tidak mengisi. Perlu konfirmasi apakah BPMN butuh reserved sides atau prioritas serupa.

---

## 4. Ringkasan rekomendasi

| Prioritas | Use case / risiko | Status |
|-----------|-------------------|--------|
| ~~Tinggi~~ | Fallback path tembus shape | ✅ Fallback orthogonal dengan `obstacles: []`. |
| ~~Tinggi~~ | Fan-in tinggi (banyak panah ke satu shape) | ✅ Offset anchor `(count+1)/(count+2)` per sisi. |
| ~~Sedang~~ | Dua Tidak ke satu target | ✅ Reserved sides `Map<string, Set<string>>`; loop-back sort. |
| ~~Sedang~~ | Custom label Ya/Tidak | ✅ Normalisasi ya/yes/y, tidak/no/n. |
| Sedang | Resize / re-render ubah urutan effect | Belum diubah; urutan list stabil. |
| Rendah | Grid kosong / no path | Tertolong fallback orthogonal. |
| Rendah | BPMN | Belum (flowchart only). |

---

## 5. Referensi kode

- Scan & reserved: `SOPDiagramFlowchart.tsx` (allConnections sort, reservedSidesRef).
- Side pairs & deprioritize: `FlowchartArrowConnector.tsx` (selectSidePairs, reservedSidesRef).
- Routing order: `list.sort(orderB - orderA)` → Tidak(2), Ya(1), linear(0).
- Cross-page: `flowchartPagination.ts` (splitCrossPageConnections); OPC id opc-in/opc-out.
- Orthogonal router: `orthogonalRouter.ts` (A*, penalties, grid, simplify, nudge).

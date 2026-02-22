# Peta Logika: SOP Diagram Engine (Flowchart + BPMN)

Dokumen ini mendefinisikan **mental model** dan **kontrak** agar build Flowchart + BPMN setara dengan implementasi Vue (SopFlowchartTemplate, SopBpmnTemplate, ArrowConnector). Gunakan sebagai referensi untuk agent AI atau developer.

**Analisis use case routing (tercover vs belum):** lihat **docs/FLOWCHART-ROUTING-USECASES.md**.

---

## 1. Mental Model Besar

Sistem punya **3 layer**:

1. **Template builder**: `SOPDiagramFlowchart` / `SOPDiagramBpmn` — menyusun shape, lane/page, dan koneksi.
2. **Arrow engine**: `FlowchartArrowConnector` (atau shared `ArrowConnector`) — menghitung rute panah ortogonal, collision avoidance, dan edit manual.
3. **State sinkronisasi**: parent menyimpan `arrowConfig` dan `labelConfig`, lalu mengirim balik ke child untuk render ulang yang stabil.

---

## 2. Logic Inti Arrow (Arrow Engine)

Arrow connector adalah "otak routing" panah.

### 2.1 Input kontrak

- Panah menerima: `connection`, `idcontainer`, `obstacles`, `usedSides`, `manualConfig`, `manualLabelPosition`, `editMode`.

### 2.2 Prioritas manual config

- Jika `manualConfig.startPoint` / `manualConfig.endPoint` valid (angka, bukan NaN), panah **tidak hitung ulang algoritma**.
- Path dibangun langsung dari titik manual + `bendPoints`.
- Ini kunci agar edit user tidak tertimpa auto-routing.

### 2.3 Auto-routing (jika tidak ada manual config)

- Ambil posisi box source/target dari DOM relatif terhadap container (`getBoundingClientRect`).
- Buat **titik anchor 4 sisi** shape (`top` / `bottom` / `left` / `right` center) untuk source dan target.

### 2.3.1 Scan phase (sebelum routing per panah)

- **Scan semua koneksi** dulu: untuk setiap koneksi dari decision dengan label "Tidak", sisi **left** dan **right** dari shape **target** ditandai "reserved" untuk koneksi itu.
- Tujuannya: koneksi linear (mis. A di kiri B → bottom A ke left B) jangan mengambil left B dulu, karena di bawah mungkin ada decision yang butuh left B (loop-back). Kalau linear di-route dulu dan pakai left B, decision terpaksa pakai top B → path crossing.
- **Urutan routing**: koneksi di-route dalam urutan **Tidak** (decision) dulu, lalu **Ya**, lalu **linear**. Jadi decision dapat prioritas pilih sisi (left/right), baru koneksi linear memakai sisi yang tersisa (mis. top).
- **Reserved sides** diteruskan ke connector: saat memilih pasangan sisi (startSide, endSide), pasangan yang memakai sisi target yang "reserved" untuk koneksi lain dideprioritaskan (dipindah ke akhir daftar kandidat).

### 2.4 Generate kandidat path ortogonal

- **0 bend**: lurus (vertikal atau horizontal) bila source dan target sejajar.
- **1 bend**: L-shape (V-H atau H-V).
- **2 bend**: U-shape (V-H-V atau H-V-H) bila keluar dan masuk dari sisi yang sama.

### 2.5 Collision check

- Untuk setiap segmen path, sampling per ~10px, lalu cek apakah titik masuk obstacle rectangle (dengan padding ~15px).

### 2.6 Scoring kandidat

- Base score = panjang path.
- Penalti: belokan banyak, arah keluar/masuk tidak natural, sisi target edge kolom tidak logis, sisi yang sudah padat (`usedSides`).
- Bonus: sisi kosong, pola masuk-keluar konsisten dengan koneksi lain.

### 2.7 Pilih best path

- Dedupe kandidat by points, urutkan skor terkecil, ambil **pertama yang non-collision**.
- Jika semua collision, fallback ke kandidat skor terbaik.

### 2.8 Offset distribusi koneksi

- Untuk tipe shape tertentu (terminator, process, task), jika banyak panah di sisi yang sama, geser sedikit start/end agar tidak menumpuk.

### 2.9 Emit hasil algoritma

- Emit `path-updated` berisi: `connectionId`, `sSide`, `eSide`, `startPoint`, `endPoint`, `bendPoints`.
- Parent memakai ini untuk update `usedSides` dan persist ke `arrowConfig`.

### 2.10 Label placement

- Label diletakkan pada jarak tetap dari segmen pertama (`getFixedDistancePoint`), dengan offset agar tidak nempel garis.

### 2.11 Edit mode (paritas penuh)

- Drag control point: start / bend / end.
- Double click path untuk tambah bend point.
- Tombol kecil merah untuk hapus bend point.
- Drag posisi label.
- Double click label untuk edit teks.

### 2.12 Watchers / re-render

- `manualConfig` berubah → recalc sesuai mode manual vs algoritma.
- `editMode` + `manualConfig` → hydrate local points untuk drag.
- `connection` / `redrawKey` → recalc **hanya jika tidak ada manual config**.

---

## 3. Logic Building Flowchart (SopFlowchartTemplate)

- **Graph koneksi**: decision → dua edge (yes/no); non-decision → edge sekuensial ke seq+1. Label dari `labelConfig.custom_labels`.
- **Cross-page split**: jika source dan target beda halaman, pecah jadi 2 koneksi: source → `opc-out-*`, `opc-in-*` → target.
- **OPC pairs**: tiap cross-page edge → pasangan OPC out/in dengan huruf A, B, C, ...
- **Pagination**: halaman 1 pakai `firstPageSteps`, halaman berikutnya `nextPageSteps`.
- **OPC top/bottom**: OPC ditempatkan top/bottom halaman berdasarkan direction (up/down) dan tipe (incoming/outgoing).
- **Posisi X OPC**: dari center kolom implementer; jika >1 OPC di kolom sama, sebar horizontal dengan gap.
- **Obstacle map per page**: obstacles = semua shape step halaman + semua OPC halaman itu.
- **Used side map**: setelah setiap panah emit `path-updated`, parent hitung sisi masuk/keluar yang sudah dipakai; kirim balik ke ArrowConnector untuk scoring.
- **Render stack**: layer 1 = table + shape; layer 2 = OPC top/bottom; layer 3 = SVG panah overlay absolut.
- **Sinkronisasi manual config**: `arrowConfig` dari luar = source of truth; saat `steps`/`layoutConfig` berubah, jika manual config ada, jangan reset total.

---

## 4. Logic Building BPMN (SopBpmnTemplate)

- **Preprocess steps**: tambah terminator "Mulai" di awal dan "Selesai" di akhir; step asli bertipe terminator bisa diubah jadi task agar layout konsisten.
- **Koneksi BPMN**: decision → 2 koneksi (yes/no) dengan label custom; non-decision → koneksi sekuensial.
- **Ukuran shape**: task adaptif berdasarkan wrapping teks (`getStepDimensions`).
- **Layout kolom**: `columnIndex` per step dari predecessor; jika predecessor beda lane boleh tetap kolom sama; jika lane sama cenderung geser kanan.
- **Layout lane**: tinggi lane dinamis (shape tertinggi + padding); posisi Y global lane kumulatif.
- **Decision text overlay**: teks decision di layer SVG terpisah; posisi bisa digeser manual dan disimpan di `labelConfig.positions`.
- **Arrow overlay**: semua koneksi BPMN → ArrowConnector; obstacles = seluruh shape BPMN.
- **Used side map**: sama seperti flowchart.

---

## 5. Konvensi ID (wajib)

- **Shape IDs**: `sop-step-{seq}` (flowchart), `bpmn-step-{seq}` (BPMN).
- **Connection IDs**:
  - Sekuensial: `conn-{fromSeq}-to-{toSeq}`.
  - Decision: `conn-{fromSeq}-yes-{toSeq}`, `conn-{fromSeq}-no-{toSeq}`.
- **OPC IDs**: `opc-out-step-{from}-to-step-{to}`, `opc-in-step-{from}-to-step-{to}`.

---

## 6. Kontrak Data

### 6.1 `steps[]`

- Wajib: `seq_number`, `name`, `type`, `id_implementer`.
- Optional: `id_next_step_if_yes`, `id_next_step_if_no` (untuk decision).
- Untuk flowchart bisa ada metadata tabel: `fittings`, `time`, `time_unit`, `output`, `description` (dari row).

### 6.2 `arrowConfig`

- Key: `connectionId` (string).
- Value minimal: `sSide`, `eSide`, `startPoint`, `endPoint`, `bendPoints`.
- Dipakai untuk: render path dari config yang sudah disimpan; prioritas atas auto-routing.

### 6.3 `labelConfig`

- `custom_labels`: map `step-{seq}-yes` / `step-{seq}-no` → string (label cabang decision).
- `positions`: map `connectionId` (arrow label) atau `step-{seq}` (decision text BPMN) → `{ x, y }`.

---

## 7. Prompt siap untuk Agent AI

```text
Rebuild SOP diagram engine with behavior parity to existing Vue implementation.
Focus on these invariants:

1) Keep ID conventions exactly:
   - Shape IDs: sop-step-{seq} / bpmn-step-{seq}
   - Connection IDs: conn-{fromSeq}-to-{toSeq}, conn-{fromSeq}-yes-{toSeq}, conn-{fromSeq}-no-{toSeq}
   - OPC IDs: opc-out-step-{from}-to-step-{to}, opc-in-step-{from}-to-step-{to}

2) Arrow routing engine must:
   - Prefer manualConfig if valid; skip auto recalc.
   - Generate orthogonal candidates (0/1/2 bends).
   - Perform collision sampling against obstacles.
   - Score candidates with penalties/bonuses based on direction and usedSides.
   - Pick first non-colliding by score; fallback to best score.
   - Emit path-updated with sSide, eSide, start, end, bend points.
   - Support edit mode: drag points, add bend by dblclick, delete bend, drag label, edit label text.

3) Flowchart builder must:
   - Split steps by page (firstPageSteps / nextPageSteps).
   - Split cross-page edges via OPC out/in connectors.
   - Place OPCs on top/bottom by flow direction.
   - Build per-page obstacles (steps + OPCs).
   - Render table per page and arrows as absolute SVG overlay.

4) BPMN builder must:
   - Add synthetic start/end terminator.
   - Build connections (decision yes/no + sequential).
   - Compute global lane+column layout from predecessors.
   - Size tasks dynamically by wrapped text.
   - Render decision texts in separate overlay; draggable and persisted.
   - Render ArrowConnector with processed step obstacles.

5) Preserve state sync contract:
   - Parent stores arrowConfig + labelConfig.
   - Child emits manual-edit / label-edit / path-updated.
   - Recalculate conservatively when manual config exists.
```

---

## 8. Status Implementasi React (client)

- **SOP_DIAGRAM_LOGIC.md**: Dokumen ini; referensi untuk paritas dengan Vue.
- **sopDiagramTypes.ts**: Kontrak `ArrowConfig`, `LabelConfig`, `ArrowConnectionConfig`, `ProsedurRow`/`SOPStep` (termasuk decision).
- **FlowchartArrowConnector.tsx**: Mesin panah dengan prioritas manualConfig, kandidat ortogonal (0/1/2 belok), collision check, scoring, usedSides, emit `path-updated`. Belum: edit mode (drag point, tambah/hapus bend, drag/edit label).
- **SOPDiagramFlowchart.tsx**: Koneksi decision (Ya/Tidak) + sekuensial, obstacles per halaman, usedSides state, optional arrowConfig/labelConfig, onPathUpdated, custom_labels untuk decision.
- **SOPDiagramBpmn.tsx**: Layout lane + shape; panah masih garis lurus. Bisa ditingkatkan pakai ArrowConnector + obstacles BPMN nanti.

---

*Referensi Vue: `fe/src/components/sop/shape/ArrowConnector.vue`, `SopFlowchartTemplate.vue`, `SopBpmnTemplate.vue`.*

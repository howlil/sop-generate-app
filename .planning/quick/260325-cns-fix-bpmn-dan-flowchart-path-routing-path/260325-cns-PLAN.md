---
phase: quick
plan: 260325-cns
type: execute
wave: 1
depends_on: []
files_modified:
  - client/src/components/sop/diagram/logic/bpmnRouter.ts
  - client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx
  - client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "BPMN paths keluar dari sisi shape (bukan menembus interior diamond/task/event)"
    - "Flowchart paths tidak overlap dengan path lain di kolom pelaksana"
    - "BPMN cross-lane connections tergambar (tidak hilang karena semua side-pair ditolak)"
    - "Tidak ada re-render cascade: diagram tidak berkedip saat semua panah selesai diroute"
    - "Path tidak mengenai sisi dalam shape (ekstrusi cukup besar untuk diamond BPMN)"
  artifacts:
    - path: "client/src/components/sop/diagram/logic/bpmnRouter.ts"
      provides: "selectBpmnSidePairs + routeBpmn dengan obstacle clearance yang lebih robust"
    - path: "client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx"
      provides: "BpmnArrowConnector dengan cleanup ref yang benar + fallback path yang tidak menembus shape"
    - path: "client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx"
      provides: "FlowchartArrowConnector dengan routing yang stabil (tanpa cascade re-render)"
  key_links:
    - from: "BpmnArrowConnector.tsx"
      to: "bpmnRouter.ts:selectBpmnSidePairs"
      via: "side pairs yang cukup agar selalu ada path valid"
    - from: "BpmnArrowConnector.tsx"
      to: "routedSegmentsRef"
      via: "cleanup return () yang benar agar ref tidak leak"
    - from: "FlowchartArrowConnector.tsx"
      to: "usedSides state di parent"
      via: "onPathUpdated tidak trigger re-render jika path tidak berubah"
---

<objective>
Fix path routing issues di BPMN dan Flowchart diagrams:
- Paths memotong interior shape (khususnya BPMN diamond/gateway)
- Paths tumpang tindih karena shared routedSegmentsRef tidak bersih
- BPMN connections hilang karena semua side-pair difilter oleh selectBpmnSidePairs
- Rendering lambat karena cascade re-render dari usedSides state update

Purpose: Diagram SOP (BPMN dan Flowchart) harus bisa dibaca dengan jelas — panah tidak boleh menembus shape dan tidak boleh tumpang tindih.

Output: Tiga file diperbaiki dengan routing yang deterministik, obstacle-aware, dan tidak menyebabkan re-render cascade.
</objective>

<execution_context>
@~/.claude/ez-agents/workflows/execute-plan.md
</execution_context>

<context>
<!-- Key interfaces yang dipakai executor -->

Dari client/src/components/sop/diagram/logic/bpmnRouter.ts:
```typescript
export function selectBpmnSidePairs(
  conn: BpmnConnectionMeta,
  _fromRect: Rect,
  _toRect: Rect,
  usedSides: UsedSides,
): Array<[Side, Side]>

export function routeBpmn(opts: BpmnRouteOptions): Point[]

// BpmnRouteOptions:
interface BpmnRouteOptions {
  fromShape: Rect; toShape: Rect
  fromSide: Side; toSide: Side
  fromDistance: number; toDistance: number
  fromIsDiamond?: boolean; toIsDiamond?: boolean
  layout: BpmnLaneLayout
  fromLane: number; toLane: number
  fromCol: number; toCol: number
  obstacles: Rect[]
  occupiedSegments: OccupiedSegment[]
  globalBounds?: Rect
}
```

Dari client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx:
```typescript
// Bug: cleanup ada di dalam loop for-side-pairs, bukan sebagai return value dari useLayoutEffect
// Line 383-385:
return () => {
  routedSegmentsRefRef.current?.current.delete(connection.id)
}
// Ini seharusnya di luar loop, setelah setPathData — sudah benar posisinya tapi
// ref (routedSegmentsRefRef.current) mungkin sudah berubah sebelum cleanup dipanggil.
// Fix: capture ref value di awal effect, gunakan captured value di cleanup.
```

Dari client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx:
```typescript
// usedSides di-read via usedSidesRef (ref) — sudah benar, tidak jadi dependency
// Tapi onPathUpdated adalah dependency — setiap kali parent re-render (akibat usedSides state),
// identity onPathUpdated bisa berubah jika tidak di-memo, menyebabkan effect loop.
// Namun di flowchart parent sudah pakai useCallback. Issue utama:
// lastAutoSigRef cek signature sebelum call onPathUpdated — ini mencegah loop, sudah benar.
// Performance issue utama: setiap connector routing memanggil setUsedSides (useState),
// yang menyebabkan semua koneksi di-render ulang, sehingga semua effect re-run.
```

Isu utama per komponen:

**BpmnArrowConnector (bug kritis):**
1. `selectBpmnSidePairs` memfilter `e === 'top' || e === 'bottom'` untuk decision target — ini terlalu agresif.
   BPMN gateway perlu menerima koneksi dari atas/bawah (misalnya dari lane di atas/bawah).
   Fix: hanya block top/bottom entry untuk koneksi SESAMA lane, bukan cross-lane.
2. Cleanup `routedSegmentsRef.delete` menggunakan `routedSegmentsRefRef.current` yang adalah ref-of-ref.
   Karena ref disimpan di `routedSegmentsRefRef`, saat cleanup dipanggil, `routedSegmentsRefRef.current`
   masih valid. Namun jika `routedSegmentsRef` prop berubah sebelum cleanup, `.current` di dalam bisa stale.
   Fix: capture `const capturedRef = routedSegmentsRefRef.current` di awal effect; gunakan di cleanup.
3. Fallback `bpmnPathHitsObstacle` check dengan threshold `SEGMENT_BOUNDARY_INSET = 10` terlalu kecil
   untuk diamond (60x60px). Diamond memiliki boundary yang lebar; segmen yang "menempel" di tepi vertex
   sering dianggap hit. Fix: untuk diamond, gunakan inset 0 (koneksi di vertex — tidak ada interior).

**FlowchartArrowConnector (performance):**
1. `usedSides` sebagai dependency menyebabkan semua connector re-route setiap kali ada satu connector baru.
   Ini sudah di-mitigasi dengan `lastAutoSigRef` tapi effect masih dijalankan.
   Fix minor: gunakan `corridorGraph` lebih aggressively — jika graph tersedia dan path tidak berubah,
   skip re-routing. `lastAutoSigRef` sudah ada; perlu pastikan effect tidak dimulai ulang jika
   hasilnya sama. Tambahkan `corridorGraph` ke dependency (saat ini tidak ada) agar re-route saat
   grid berubah, tapi tidak saat hanya `usedSides` berubah.

Catatan penting: `FlowchartArrowConnector` menggunakan `corridorGraph` prop yang saat ini BUKAN dependency
di `useLayoutEffect`. Ini berarti jika graph berubah (setelah `graphReady`), path tidak di-update.
Sebaliknya, `usedSides` IS a dependency — ini yang menyebabkan cascade.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix selectBpmnSidePairs — jangan filter top/bottom entry untuk cross-lane decision target</name>
  <files>client/src/components/sop/diagram/logic/bpmnRouter.ts</files>
  <action>
Di `selectBpmnSidePairs` (sekitar baris 204-228), ada filter yang memblok semua pair dengan
`e === 'top' || e === 'bottom'` jika target adalah decision. Ini salah untuk cross-lane:
gateway di lane lain perlu menerima koneksi dari atas/bawah.

**Perubahan yang harus dilakukan:**

1. Ubah filter `isDecDst` dari "blok semua top/bottom entry ke decision" menjadi
   "blok top/bottom entry ke decision HANYA jika same-lane":
   ```typescript
   // SEBELUM (baris ~218-221):
   const isDecDst = conn.targetType === 'flowchart-decision'
   if (isDecDst && (e === 'top' || e === 'bottom')) {
     return false
   }

   // SESUDAH:
   const isDecDst = conn.targetType === 'flowchart-decision'
   const isDecSrcFilter = isDecSrc
   // Untuk cross-lane: izinkan top/bottom masuk ke decision (gateway di lane berbeda butuh ini)
   // Untuk same-lane: tetap blok top/bottom ke decision agar tidak ada entry di puncak/bawah diamond
   if (isDecDst && sameLane && !isDecSrcFilter && (e === 'top' || e === 'bottom')) {
     return false
   }
   ```

2. Di bagian fallback pairs (baris ~195-202), tambahkan `['bottom', 'left'], ['top', 'left'],
   ['bottom', 'right'], ['top', 'right']` agar cross-lane selalu punya kandidat.
   Pastikan fallback lengkap:
   ```typescript
   pairs.push(
     ['right', 'left'], ['left', 'right'],
     ['bottom', 'top'], ['top', 'bottom'],
     ['right', 'top'], ['right', 'bottom'],
     ['left', 'top'], ['left', 'bottom'],
     ['bottom', 'left'], ['bottom', 'right'],
     ['top', 'left'], ['top', 'right'],
   )
   // (sudah ada, pastikan tidak dihapus oleh filter di bawahnya)
   ```

3. Di `pathHitsObstacle` (baris ~323), `SEGMENT_BOUNDARY_INSET = 10` terlalu ketat untuk diamond.
   Tambahkan special case: jika `fromShape` atau `toShape` adalah diamond (width === height,
   biasanya 60x60 atau 120x80 dst), gunakan inset yang lebih kecil (2px) karena koneksi
   di vertex diamond seharusnya tidak dianggap "menembus interior":
   ```typescript
   // Di awal pathHitsObstacle, sebelum membuat fromInset/toInset:
   const isDiamond = (r: Rect) => Math.abs(r.width - r.height) < 20
   const fromInsetSize = isDiamond(fromShape) ? 2 : SEGMENT_BOUNDARY_INSET
   const toInsetSize = isDiamond(toShape) ? 2 : SEGMENT_BOUNDARY_INSET
   // Gunakan fromInsetSize/toInsetSize di tempat SEGMENT_BOUNDARY_INSET dipakai untuk fromInset/toInset
   ```

Jangan ubah logika routing `routeBpmn` — hanya `selectBpmnSidePairs` dan `pathHitsObstacle` yang diubah.
  </action>
  <verify>
    <automated>cd "C:\Users\howlil\Documents\tugas-akhir\codingan\client" && npx tsc --noEmit 2>&1 | head -40</automated>
  </verify>
  <done>
    - `npx tsc --noEmit` tidak mengeluarkan error TypeScript untuk bpmnRouter.ts
    - Filter di `selectBpmnSidePairs` hanya memblok top/bottom entry ke decision untuk same-lane
    - `pathHitsObstacle` menggunakan inset 2px untuk diamond shapes
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix BpmnArrowConnector — captured ref cleanup + corridor graph dependency di FlowchartArrowConnector</name>
  <files>
    client/src/components/sop/diagram/shapes/BpmnArrowConnector.tsx,
    client/src/components/sop/diagram/shapes/FlowchartArrowConnector.tsx
  </files>
  <action>
**BpmnArrowConnector.tsx — fix cleanup ref leak:**

Di `useLayoutEffect` (baris ~191), sebelum logika routing, capture ref value:
```typescript
useLayoutEffect(() => {
  // Capture ref values at effect start so cleanup always uses the right instance
  const capturedRoutedSegs = routedSegmentsRefRef.current

  const container = document.getElementById(idcontainer)
  if (!container) { setPathData(''); setLabelPos(null); return }
  // ... rest of effect unchanged ...

  // Di bagian akhir effect (baris ~383), cleanup sudah pakai return () => {...}
  // Pastikan return cleanup menggunakan capturedRoutedSegs bukan routedSegmentsRefRef.current:
  return () => {
    capturedRoutedSegs?.current.delete(connection.id)
  }
}, [...dependencies...])
```

Saat ini cleanup ada di baris 383-385 di dalam body effect (bukan di return) — ini sudah benar
posisinya (it IS the return value), tapi menggunakan `routedSegmentsRefRef.current?.current`
yang bisa stale. Ganti dengan captured value.

**FlowchartArrowConnector.tsx — fix cascade re-render dari corridorGraph dependency:**

Sebelum mengubah dependency array, pastikan `corridorGraph` sudah di-destructure dari props
di function signature komponen. Prop ini sudah ada di interface (baris ~65:
`corridorGraph?: CorridorGraph | null`) tetapi jika belum di-destructure, tambahkan:
```typescript
// Di function signature FlowchartArrowConnector (baris ~80-100), pastikan destructuring mencakup:
const FlowchartArrowConnector = ({
  // ... props lain ...
  corridorGraph,   // <-- tambahkan ini jika belum ada di destructuring
  // ... props lain ...
}: FlowchartArrowConnectorProps) => {
```

Saat ini `useLayoutEffect` di `FlowchartArrowConnector` (baris ~391-667) memiliki dependency array:
```typescript
}, [
  idcontainer, connection.id, connection.from, connection.to,
  connection.label, connection.sourceType, connection.targetType,
  manualConfig, manualLabelPosition, obstacles, onPathUpdated, constraintRect,
  usedSides, routedSegmentsRef, reservedSidesRef,
])
```

`usedSides` di sini menyebabkan cascade: setiap connector update usedSides → parent re-render →
semua FlowchartArrowConnector dapat usedSides baru → semua effect re-run → semua re-route.

Fix:
1. Hapus `usedSides` dari dependency array (sudah dibaca via `usedSidesRef.current` — safe).
2. Tambahkan `corridorGraph` ke dependency (saat ini tidak ada — sehingga path tidak terupdate
   saat graph selesai dibangun setelah `graphReady`):

```typescript
}, [
  idcontainer, connection.id, connection.from, connection.to,
  connection.label, connection.sourceType, connection.targetType,
  manualConfig, manualLabelPosition, obstacles, onPathUpdated, constraintRect,
  // usedSides DIHAPUS — dibaca via ref, tidak perlu trigger re-render
  routedSegmentsRef, reservedSidesRef,
  corridorGraph,  // DITAMBAHKAN — perlu re-route saat graph tersedia
])
```

Catatan: `routedSegmentsRef` adalah ref object yang identity-nya stabil — aman di dependency.
`reservedSidesRef` juga sama. Removing `usedSides` dari dependency menghilangkan cascade utama.
`usedSides` di-read fresh via `usedSidesRef.current` di dalam effect, jadi routing tetap dapat
data terbaru.

**Tidak ada perubahan logika routing** — hanya dependency array dan cleanup capture.
  </action>
  <verify>
    <automated>cd "C:\Users\howlil\Documents\tugas-akhir\codingan\client" && npx tsc --noEmit 2>&1 | head -40</automated>
  </verify>
  <done>
    - `npx tsc --noEmit` bersih untuk kedua file
    - BpmnArrowConnector cleanup menggunakan captured ref (tidak stale)
    - FlowchartArrowConnector tidak memiliki `usedSides` di dependency array
    - FlowchartArrowConnector memiliki `corridorGraph` di dependency array
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Task 3: Verifikasi visual — path tidak menembus shape, tidak tumpang tindih</name>
  <what-built>
    - selectBpmnSidePairs tidak lagi memblok cross-lane entry ke gateway
    - pathHitsObstacle menggunakan inset kecil untuk diamond agar vertex connection valid
    - BpmnArrowConnector cleanup ref tidak stale
    - FlowchartArrowConnector tidak re-render cascade saat routing selesai
  </what-built>
  <how-to-verify>
    1. Jalankan dev server: `cd client && npm run dev`
    2. Buka halaman SOP yang memiliki diagram BPMN dengan beberapa swim lane
    3. Verifikasi:
       - Semua panah BPMN tergambar (tidak ada yang hilang/blank)
       - Tidak ada panah yang menembus kotak shape (task/gateway/event)
       - Panah cross-lane (dari satu lane ke lane lain) tergambar dengan benar
    4. Buka halaman SOP yang memiliki diagram Flowchart dengan beberapa pelaksana
    5. Verifikasi:
       - Tidak ada kedipan/lag saat halaman pertama kali dimuat (rendering stabil)
       - Panah decision (Ya/Tidak) tidak overlap berlebihan
       - Klik "Perbaiki diagram" — path berubah tanpa lag
    6. Jika ada regresi (path hilang atau berantakan lebih dari sebelumnya), laporkan
       persis connection mana yang bermasalah (dari shape apa ke shape apa)
  </how-to-verify>
  <resume-signal>Ketik "approved" jika diagram terlihat baik, atau deskripsikan masalah yang masih ada</resume-signal>
</task>

</tasks>

<verification>
TypeScript compile check bersih:
```bash
cd client && npx tsc --noEmit
```

Tidak ada error untuk ketiga file yang dimodifikasi.
</verification>

<success_criteria>
1. `npx tsc --noEmit` bersih (no errors)
2. BPMN: semua connection tergambar termasuk cross-lane ke/dari gateway
3. BPMN: tidak ada path yang menembus interior shape (diamond vertex connection valid)
4. Flowchart: tidak ada cascade re-render visible (diagram tidak berkedip saat load)
5. Flowchart: path di-update saat corridorGraph tersedia (tidak render blank lalu baru muncul)
</success_criteria>

<output>
Setelah selesai, buat `.planning/quick/260325-cns-fix-bpmn-dan-flowchart-path-routing-path/260325-cns-SUMMARY.md`
dengan daftar perubahan yang dibuat per file.
</output>

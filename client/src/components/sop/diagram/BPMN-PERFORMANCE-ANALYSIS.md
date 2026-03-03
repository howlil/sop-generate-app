# Analisis: Path BPMN Lambat Saat "Perbaiki diagram"

## Penyebab

1. **Remount semua connector**  
   Key connector memakai `key={\`${conn.id}-v${pathLayoutSeed}\`}`. Setiap klik "Perbaiki diagram", `pathLayoutSeed` naik → key berubah → React **unmount lalu mount ulang semua** `BpmnArrowConnector`. Semua `useLayoutEffect` jalan lagi dari nol (sinkron, satu frame).

2. **DOM read berulang per connector**  
   Setiap connector memanggil `getElementPosition(from)`, `getElementPosition(to)`, dan `getElementPosition(id)` untuk **setiap obstacle**. Jika ada 20 shape dan 17 koneksi: **17 × (2 + 20) = 374** `getBoundingClientRect()` dalam satu frame.

3. **Banyak percobaan routing per connector**  
   Untuk setiap connector dipanggil sampai **MAX_SIDE_PAIRS (12)** pasangan sisi. Setiap percobaan: `routeBpmn()` (dengan beberapa `pathHitsObstacle` di dalam) lalu `bpmnPathHitsObstacle()` dan `scorePath()`. Total **17 × 12 = 204** kali routing + hit-test dalam satu frame.

4. **Semua jalan sinkron**  
   Semua dijalankan di `useLayoutEffect` tanpa `requestAnimationFrame` / chunking, sehingga satu frame bisa sangat berat dan terasa “hang”.

## Perbaikan yang diterapkan

- **Hapus `pathLayoutSeed` dari key**  
  Key kembali ke `conn.id` saja. Effect tetap jalan karena `rerouteVersion` dan `connectionIndex` berubah; tidak perlu remount semua connector.

- **Precompute obstacle rects di parent**  
  Di `SOPDiagramBpmn`, satu `useLayoutEffect` membaca posisi semua obstacle sekali (satu kali baca DOM untuk container + N obstacle). Hasil disimpan di ref dan diteruskan ke connector. Setiap connector memakai rect yang sudah dihitung, sehingga DOM read per connector hanya **2** (from/to), bukan 2 + N.

- **(Opsional)** Bisa tambah batas percobaan side pair (mis. 6 instead of 12) jika diagram sangat besar.

# Concurrency Testing Fitur Autosave SOP

Dokumen ini menjelaskan rancangan pengujian ketika beberapa anggota OPD mengedit SOP yang sama secara realtime/paralel.

## Tujuan

Memastikan autosave SOP tetap andal ketika lebih dari satu pengguna menyimpan perubahan pada waktu yang berdekatan.

Aspek yang diuji:

- Konsistensi data: perubahan tidak menghasilkan data parsial atau rusak.
- Atomicity: satu request autosave harus tersimpan utuh atau gagal utuh.
- Lost update: perubahan pengguna A tidak hilang karena pengguna B menyimpan field lain.
- Konflik edit: perilaku sistem jelas saat dua pengguna mengubah bagian yang sama.
- Respons sistem: endpoint autosave tetap cepat dan error rate rendah saat banyak pengguna paralel.

## Rekomendasi Tools

| Tool | Cocok untuk | Catatan |
| :--- | :--- | :--- |
| Playwright API testing | Validasi correctness, assertion data akhir, login cookie, dan regression test di CI | Paling cocok untuk proyek ini karena sudah dipakai di `client/e2e` dan bisa menjalankan request paralel dengan `Promise.all`. |
| k6 | Load/concurrency volume, threshold response time, error rate, dan simulasi banyak virtual users | Cocok untuk mengukur reliability/performance autosave setelah correctness test lulus. |
| Artillery | Alternatif k6, terutama bila fitur realtime memakai WebSocket/Socket.IO | Saat ini autosave SOP memakai HTTP PATCH, jadi k6 lebih sederhana. |
| JMeter | Load test berbasis GUI/CLI dan laporan HTML | Cocok untuk tim QA non-developer, tetapi lebih berat dibanding k6/Playwright untuk repo TypeScript ini. |

Rekomendasi praktis:

1. Gunakan Playwright untuk test case wajib yang menentukan benar/salah secara fungsional.
2. Gunakan k6 untuk mengukur ketahanan saat 20, 50, atau 100 pengguna melakukan autosave bersamaan.
3. Tambahkan WebSocket-specific tool hanya jika realtime nanti memakai channel socket, bukan polling/PATCH HTTP.

## Test Case

### CONC-01: Autosave Header Paralel Pada Field Berbeda

Tujuan: memastikan dua autosave header yang mengubah field berbeda tidak saling menghapus.

Langkah:

1. Login sebagai `PENYUSUN`.
2. Login sebagai `PJ_PENYUSUN` dari OPD yang sama.
3. Buat SOP draft baru.
4. Kirim dua request paralel:
   - User A PATCH `namaLembaga`.
   - User B PATCH `lampiran.peringatan`.
5. Ambil ulang workbench SOP.

Ekspektasi:

- Kedua request HTTP 200.
- `namaLembaga` berisi nilai dari user A.
- `lampiran.peringatan` berisi nilai dari user B.
- Log edit bagian `HEADER` terbentuk.

Status implementasi: otomatis di `client/e2e/sop-concurrency.spec.ts`.

### CONC-02: Autosave Prosedur Paralel Tetap Atomik

Tujuan: memastikan dua request replace-all prosedur yang terjadi bersamaan tidak membuat langkah campur sebagian.

Langkah:

1. Login sebagai `PENYUSUN` dan `PJ_PENYUSUN`.
2. Buat SOP draft baru.
3. Buat satu pelaksana.
4. Kirim dua request paralel ke PATCH `/sop/langkah/:detailSopId` dengan dua payload prosedur berbeda.
5. Ambil ulang workbench SOP.

Ekspektasi:

- Kedua request HTTP 200.
- Data akhir berisi satu payload utuh, bukan campuran payload A dan B.
- Jumlah langkah sesuai payload final.
- Log edit bagian `LANGKAH` terbentuk.

Catatan risiko:

Endpoint prosedur saat ini memakai pola replace-all per section. Jika dua pengguna menambah langkah berbeda dari snapshot lama yang sama, perubahan yang tersimpan terakhir bisa menimpa perubahan sebelumnya. Itu bukan data parsial, tetapi tetap termasuk potensi lost update secara kolaboratif. Untuk mencegahnya, API perlu version field, ETag/If-Match, revision number, atau operasi patch granular per langkah.

Status implementasi: otomatis di `client/e2e/sop-concurrency.spec.ts`.

### CONC-03: Konflik Edit Field Yang Sama

Tujuan: menentukan aturan bisnis saat dua user mengubah field yang sama.

Langkah:

1. User A dan user B membuka SOP yang sama.
2. Keduanya mengubah `judul` atau `namaLembaga`.
3. Request dikirim hampir bersamaan.
4. Ambil ulang workbench.

Ekspektasi ideal:

- Jika sistem memakai optimistic locking: salah satu request berhasil, request lain mendapat `409 Conflict`.
- Jika sistem memakai last-write-wins: data akhir sama dengan request terakhir dan UI wajib memberi sinyal bahwa perubahan user lain masuk.

Status: belum dijadikan test otomatis karena kebijakan konflik produk perlu dipilih dulu.

### CONC-04: Load Autosave 20-100 Pengguna

Tujuan: mengukur reliability saat banyak virtual user melakukan autosave header dan prosedur.

Langkah:

1. Jalankan backend dengan database test/dev.
2. Jalankan k6 script `server/scripts/k6-sop-autosave-concurrency.js`.
3. Naikkan `VUS` bertahap: 20, 50, 100.
4. Catat p95, p99, error rate, dan jumlah 400/409/422/500.

Ekspektasi awal untuk skenario contention tinggi, yaitu banyak pengguna menulis SOP yang sama:

- Error rate < 1%.
- p95 autosave < 2000 ms pada lingkungan lokal/test yang stabil.
- p99 autosave < 3000 ms.
- Tidak ada response 400/409/422/500 untuk payload valid.

Command:

```powershell
k6 run server/scripts/k6-sop-autosave-concurrency.js
```

Contoh dengan parameter:

```powershell
$env:API_BASE_URL = "http://127.0.0.1:3000/api/v1"
$env:VUS = "50"
$env:DURATION = "2m"
k6 run server/scripts/k6-sop-autosave-concurrency.js
```

## Cara Menjalankan Test Otomatis

Playwright correctness test:

```powershell
cd client
pnpm test:e2e sop-concurrency.spec.ts --project=chromium
```

k6 load/concurrency test:

```powershell
k6 run server/scripts/k6-sop-autosave-concurrency.js
```

Pastikan backend berjalan dan database sudah di-seed. Kredensial default mengikuti seed:

- `penyusun.dinkes@gmail.com`
- `pjpenyusun.dinkes@gmail.com`
- password: `@Password123:)`

## Kesimpulan Pengujian Yang Cocok

Untuk case edit SOP realtime, istilah utama tetap `concurrency testing`. Stress/load testing dipakai sebagai pengujian tambahan untuk mengetahui apakah concurrency tetap stabil pada jumlah user besar.

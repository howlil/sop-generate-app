# Implementasi Pengujian Unit

Pengujian unit SOPFlow memverifikasi logika utama backend NestJS dan frontend React secara terisolasi. Backend menggunakan Jest pada file `*.spec.ts`, sedangkan frontend menggunakan Vitest untuk fungsi domain, permission, validasi, komponen, dan utilitas yang relevan.

## Cakupan

Cakupan unit test mencakup antara lain:

- autentikasi dan otorisasi;
- pengelolaan SOP dan validasi kelengkapan;
- versioning/revisi SOP;
- pengajuan dan evaluasi SOP;
- tindak lanjut hasil evaluasi;
- TTE internal dan signing PDF;
- arsip publik;
- notifikasi/reminder;
- permission dan helper frontend;
- diagram/prosedur SOP.

Dependency eksternal seperti database, filesystem, provider notifikasi, dan service lain dimock pada unit test ketika tujuan test adalah memeriksa logika unit secara terisolasi.

## Kontrak penting yang diuji

Beberapa aturan yang harus tetap mempunyai coverage unit antara lain:

1. actor tidak dapat melakukan aksi di luar role/OPD-nya;
2. status workflow yang tidak valid ditolak;
3. evaluasi `PERLU_PERBAIKAN` membutuhkan catatan yang sesuai;
4. pengajuan tidak dapat diselesaikan sebelum seluruh persyaratan evaluasi terpenuhi;
5. TTE memvalidasi role, state workflow, credential dan PIN;
6. ciphertext passphrase P12 hanya menerima format versioned `v2`;
7. konfigurasi WhatsApp hanya aktif bila `WHAAPI_TOKEN` dan `WHAAPI_CHANNEL_ID` tersedia bersama-sama;
8. partial WhatsApp credential dianggap salah konfigurasi.

## Menjalankan test

Backend:

```bash
cd server
pnpm test
```

Coverage backend:

```bash
cd server
pnpm test:cov
```

Frontend:

```bash
cd client
pnpm test
```

Gunakan script pada `package.json` sebagai sumber perintah terkini bila nama script berubah.

## Historical research snapshot

Angka berikut adalah snapshot hasil pengujian yang pernah digunakan pada dokumentasi penelitian, bukan status otomatis branch terbaru:

- backend: 66 test suite;
- backend: 709 test case;
- statements coverage: 89,64%;
- lines coverage: 89,97%;
- functions coverage: 88,10%;
- branches coverage: 81,99%.

Setelah refactor, penambahan test, atau penghapusan legacy code, jumlah suite/test dan persentase coverage dapat berubah. Karena itu angka di atas tidak boleh digunakan untuk menyatakan kondisi commit terbaru tanpa menjalankan test kembali.

Raw console dump `docs/unit-test-coverage-output.txt` telah dihapus dari repository. Output coverage adalah generated artifact dan seharusnya diperoleh dari eksekusi test/CI, bukan dipelihara sebagai dokumentasi source-controlled.

## Status terkini

Untuk status terkini gunakan:

1. output `pnpm test` / `pnpm test:cov` pada commit yang diuji; dan
2. job `Server quality` / `Client quality` pada GitHub Actions.

Dokumen ini menjelaskan pendekatan dan historical snapshot; CI commit adalah source of truth untuk hasil test aktual.

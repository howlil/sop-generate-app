# Release Verification Testing

Dokumen ini mendefinisikan lapisan verifikasi P2 yang dijalankan menjelang release. Lapisan ini sengaja dipisahkan dari CI pull request agar pemeriksaan yang mahal tidak memperlambat setiap perubahan kecil.

## Tujuan

Release verification melengkapi blocking CI pada `.github/workflows/ci.yml`. Blocking CI tetap menjadi gate merge utama, sedangkan workflow `.github/workflows/release-verification.yml` digunakan untuk audit yang lebih luas sebelum release atau saat investigasi regression besar.

## 1. Full Critical Business Journey Audit

Command:

```bash
pnpm --dir client test:e2e:critical:audit
```

Perbedaan dengan `test:e2e:critical`:

- kedua mode memakai retry `0`;
- kedua mode mereset database test melalui migration history dan seed ulang untuk setiap J01-J07;
- mode normal berhenti pada journey pertama yang gagal agar feedback PR cepat;
- mode `critical:audit` tetap menjalankan J01 sampai J07 dan mengembalikan exit code gagal setelah seluruh journey selesai;
- laporan HTML disimpan terpisah per journey sehingga failure sebelumnya tidak tertimpa run berikutnya.

Tujuannya adalah mendapatkan daftar defect lengkap tanpa mengorbankan isolation antar-journey.

## 2. Cross-Browser Compatibility Smoke

Command:

```bash
pnpm --dir client test:e2e:compat
```

Browser/device yang diperiksa:

- Firefox desktop;
- WebKit desktop;
- Chromium dengan profil Pixel 7.

Compatibility suite tidak mengulang seluruh functional regression. Suite berfokus pada permukaan yang paling sensitif terhadap browser dan viewport:

- halaman publik;
- route dan navigasi berdasarkan role;
- profil/TTE visibility;
- layout shell;
- halaman utama workflow lintas role.

Setiap browser mendapat database migration-backed yang di-reset dan di-seed ulang. Retry dinonaktifkan agar compatibility defect tidak diklasifikasikan sebagai sukses hanya karena retry.

## 3. Autosave Load/Concurrency Verification

Workflow release menjalankan `server/scripts/k6-sop-autosave-concurrency.js` menggunakan k6 yang dipin pada versi workflow.

Threshold yang sudah menjadi kontrak script:

- `http_req_failed < 1%`;
- p95 `< 2000 ms`;
- p99 `< 3000 ms`;
- `autosave_success_rate > 99%`;
- tidak ada response 400/409/422/500 untuk payload load-test valid.

Fixture k6 harus mengikuti batas field schema production. Test tidak boleh dibuat lulus dengan memperlebar kolom hanya untuk kebutuhan fixture.

Parameter `VUS` dan `DURATION` diberikan melalui input manual workflow agar load dapat dinaikkan secara bertahap tanpa mengubah source code.

## Menjalankan di GitHub Actions

Pilih workflow **Release verification** lalu jalankan melalui `workflow_dispatch` dengan parameter jumlah virtual user dan durasi k6.

Tiga job sengaja terpisah:

1. `Full J01-J07 audit (zero retry)`;
2. `Cross-browser compatibility smoke`;
3. `Autosave k6 thresholds`.

Failure Playwright menyimpan artifact report selama 14 hari. Backend log dicetak ketika job gagal.

## Exit Criteria Release

Sebelum release yang dianggap terverifikasi:

- blocking CI PR sudah green;
- J01-J07 full audit green tanpa retry;
- Firefox, WebKit, dan mobile Chromium compatibility smoke green;
- k6 memenuhi seluruh threshold;
- tidak ada failure yang diabaikan dengan retry atau `continue-on-error`.

Cross-browser dan k6 tidak dijadikan blocking pada setiap PR karena biaya eksekusinya lebih besar dan nilai tambahnya terutama pada tahap release verification.

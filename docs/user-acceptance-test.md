# User Acceptance Testing (UAT)

Dokumen ini merangkum pendekatan dan hasil UAT yang digunakan pada penelitian SOPFlow. Hasil angka pada dokumen ini adalah **historical research snapshot**, bukan status otomatis codebase terbaru.

## Tujuan

UAT dilakukan untuk menilai penerimaan sistem oleh pengguna berdasarkan fungsi yang relevan dengan peran masing-masing pada proses pengelolaan SOP.

Aktor yang direpresentasikan meliputi:

- PJ Evaluator Organisasi;
- Evaluator;
- PJ Penyusun SOP;
- Penyusun SOP;
- Kepala OPD;
- pengguna/pengunjung sesuai skenario yang diuji.

## Aspek penilaian

Instrumen UAT menggunakan karakteristik kualitas yang relevan dari ISO/IEC 25010 dan menyesuaikannya dengan konteks penggunaan aplikasi berbasis web. Penilaian difokuskan pada fungsi yang benar-benar digunakan responden, bukan seluruh fitur teknis internal.

Functional suitability menilai apakah fungsi utama sistem mendukung kebutuhan pengguna, antara lain:

- penyusunan dan pengelolaan dokumen SOP;
- pengajuan evaluasi;
- verifikasi dan evaluasi;
- pencatatan catatan perbaikan dan tindak lanjut;
- revisi;
- berita acara dan TTE internal;
- pengesahan Kepala OPD;
- arsip dokumen final.

## Historical research snapshot

Hasil agregat yang digunakan pada dokumentasi penelitian:

- responden mewakili 6 peran;
- skor UAT agregat: **96,33%**;
- Functional Suitability: **108/110 (98,18%)**.

Nilai tersebut harus dibaca sebagai hasil pengambilan data UAT pada periode penelitian. Refactor source code setelah UAT tidak mengubah jawaban responden yang sudah dikumpulkan, tetapi juga tidak berarti nilai tersebut otomatis membuktikan setiap commit terbaru.

## Hubungan dengan test teknis

UAT bukan pengganti unit test, integration test, atau system/E2E test.

- Unit test: `docs/unit-test.md`.
- Integration test: `docs/integration-test.md`.
- Business journey E2E: `docs/e2e-business-journeys.md`.

Status teknis commit terkini harus dilihat dari GitHub Actions dan hasil test pada commit tersebut.

## Batas interpretasi

UAT membuktikan penerimaan pengguna pada skenario dan versi sistem yang diuji. Karena penelitian menggunakan purposive sampling dan jumlah responden terbatas pada peran terkait, hasil tidak dimaksudkan sebagai generalisasi statistik untuk seluruh pegawai pemerintah daerah.

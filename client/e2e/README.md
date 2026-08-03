# Playwright End-to-End Test Suite

Suite ini mengotomatisasi skenario Black-Box E2E untuk aplikasi web SOPFlow.

## Menjalankan

Jalankan backend di port 3000 terlebih dahulu, lalu dari folder `client`:

```powershell
pnpm test:e2e:install
pnpm test:e2e
```

Subset critical workflow:

```powershell
pnpm test:e2e:critical
```

Suite penuh Chromium dan lintas browser:

```powershell
pnpm test:e2e:all
pnpm test:e2e:all-browsers
```

Mode interaktif:

```powershell
pnpm test:e2e:ui
```

## Environment Variable

| Variable | Default |
|---|---|
| `E2E_BASE_URL` | `http://127.0.0.1:5173` |
| `E2E_API_BASE_URL` | `http://127.0.0.1:3000/api/v1` |
| `E2E_API_HEALTH_URL` | `http://127.0.0.1:3000/api/health` |
| `E2E_SEED_PASSWORD` | `@Password123:)` |
| `E2E_SKIP_WEB_SERVER` | `false` |
| `E2E_ALL_BROWSERS` | `false` |
| `E2E_SEED` | `false` |
| `E2E_TTE_PIN` | `123456` |
| `E2E_TEST_RUN_ID` | generated per run |

Jika ingin global setup menjalankan seed E2E sebelum test:

```powershell
$env:E2E_SEED="true"
pnpm test:e2e:all
```

Credential role dapat dioverride melalui:

```text
E2E_PJ_EVALUATOR_EMAIL
E2E_PJ_EVALUATOR_PASSWORD
E2E_EVALUATOR_EMAIL
E2E_EVALUATOR_PASSWORD
E2E_KEPALA_OPD_EMAIL
E2E_KEPALA_OPD_PASSWORD
E2E_PJ_PENYUSUN_EMAIL
E2E_PJ_PENYUSUN_PASSWORD
E2E_PENYUSUN_EMAIL
E2E_PENYUSUN_PASSWORD
```

## Cakupan Script

- `auth.spec.ts`: login, validasi login, logout, dan redirect route terlindungi.
- `role-access.spec.ts`: menu dan akses route sesuai role.
- `master-data.spec.ts`: dialog master data OPD, evaluator, penyusun, pelaksana, dan peraturan.
- `public-pages.spec.ts`: arsip publik, validasi PDF, dan validasi pengesahan.
- `sop-authoring.spec.ts`: pembuatan draft SOP, validasi dialog, dan dialog pengajuan evaluasi.
- `sop-version-history.spec.ts`: pembuatan versi dari riwayat, versi dicabut, revisi aktif, RBAC, dan request serentak.
- `profile-tte.spec.ts`: profil akun, kata sandi, dan visibilitas TTE sesuai role.
- `evaluasi-workflow.spec.ts`: pengajuan evaluasi, penilaian, revisi, kirim ulang, selesai evaluasi, dan konsistensi lintas peran.
- `tte-pengesahan.spec.ts`: setup TTE, urutan tanda tangan BA, pengesahan SOP, pencabutan, dan penggantian versi.
- `arsip-public.spec.ts`: arsip internal, arsip publik, preview SOP berlaku, dan validasi pengesahan.
- `pdf-verification.spec.ts`: validasi upload PDF, PDF valid bila signing aktif, dan PDF tidak valid.
- `list-filter-pagination.spec.ts`: pencarian, filter status, dan navigasi daftar SOP.
- `scenario-traceability.spec.ts`: validasi 70 skenario rancangan terpetakan tepat sekali ke file test.

Skenario yang mengubah status permanen seperti menyelesaikan evaluasi, tanda tangan BA, pengesahan, pencabutan, dan versi baru wajib dijalankan pada database test yang dapat di-reset. Assertion utama tetap dilakukan dari UI; API helper hanya dipakai untuk setup kondisi dan validasi penolakan aksi role.

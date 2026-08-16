# Playwright Browser Test Suite

Playwright SOPFlow dibagi menjadi tiga lapisan browser agar istilah dan coverage tidak menyesatkan:

1. **End-to-End Business Journeys** — tujuh alur bisnis lintas aktor/modul (`J01`–`J07`) yang menguji state transition dan outcome utama melalui browser.
2. **Functional browser/system tests** — menguji fitur atau aturan secara terisolasi seperti autentikasi, RBAC UI, master data, authoring, evaluasi, TTE, arsip, PDF, filter, dan version history.
3. **Smoke/UI regression tests** — memastikan public pages, profil/TTE surface, dan shell/layout utama tetap dapat digunakan.

API-only behavior seperti concurrency, database invariants, server-side RBAC, state-machine edge cases, dan versioning race conditions bukan browser E2E. Coverage tersebut berada di `server/test/integration/`.

## End-to-End Business Journeys

| ID | Journey | Outcome/invariant utama |
|---|---|---|
| `J01` | Happy Path | SOP siap → diajukan → SESUAI → BA → TTE → pengesahan → `BERLAKU` → arsip publik |
| `J02` | Revision Loop | `PERLU_PERBAIKAN` → catatan → revisi → tindak lanjut selesai → kirim ulang → SESUAI |
| `J03` | Final Rejection | Pengajuan `DITOLAK`; versi lama terkunci; penyusun wajib membuat versi baru |
| `J04` | Mixed Multi-SOP | Pengajuan tidak boleh selesai selama salah satu SOP masih perlu perbaikan |
| `J05` | Version Replacement | Versi baru `BERLAKU`; versi lama atomik menjadi `DIGANTIKAN` |
| `J06` | Revocation | SOP `DICABUT` dan tidak lagi muncul pada arsip publik aktif |
| `J07` | Public Document Integrity | Arsip publik, verifikasi pengesahan TTE, dan verifikasi signature PDF konsisten |

Implementasi business journey berada di `e2e/journeys/`.

### Boundary business journey

Business journey tidak mengulang semua input CRUD/form. Data yang bukan objek pengujian journey boleh dibentuk melalui API sebagai precondition. Contoh: J01 dimulai dari SOP yang sudah lengkap dan siap diajukan karena editor SOP diuji pada functional browser tests.

Aturannya:

- aksi bisnis yang sedang diklaim journey dilakukan melalui UI/browser;
- mutation API hanya boleh digunakan pada `support/business-preconditions.ts` untuk membentuk state awal atau melewati flow yang sudah dibuktikan journey lain;
- postcondition boleh dibaca melalui API pada `support/business-audit.ts` untuk memverifikasi invariant server;
- outcome publik yang diklaim sebagai browser behavior diverifikasi dari browser;
- setiap role memakai `BrowserContext` terpisah melalui `fixtures/business-test.ts`;
- setiap journey menggunakan data unik dan dapat dijalankan sendiri pada database test yang resettable;
- assertion kosmetik/layout tidak dimasukkan ke critical business journey kecuali memang merupakan business invariant.

`pnpm test:e2e:audit` menjaga kontrak arsitektur J01–J07 dan dijalankan CI.

## Menjalankan

Backend test harus tersedia di port 3000. Dari folder `client`:

```powershell
pnpm test:e2e:install
pnpm test:e2e:critical
```

`test:e2e:critical` menjalankan J01–J07 pada Chromium dengan database disposable yang di-reset per journey melalui critical runner.

Functional browser regression:

```powershell
pnpm test:e2e:functional
```

Smoke/UI regression:

```powershell
pnpm test:e2e:smoke
```

Seluruh intended browser suite Chromium:

```powershell
pnpm test:e2e:all
```

Seluruh browser yang dikonfigurasi:

```powershell
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
| `E2E_BROWSER_API_BASE_URL` | API URL dengan host `localhost` |
| `E2E_API_HEALTH_URL` | `http://127.0.0.1:3000/api/health` |
| `E2E_SEED_PASSWORD` | `@Password123:)` |
| `E2E_SKIP_WEB_SERVER` | `false` |
| `E2E_ALL_BROWSERS` | `false` |
| `E2E_SEED` | `false` |
| `E2E_TTE_PIN` | mengikuti fixture E2E |
| `E2E_TEST_RUN_ID` | generated per run |

Credential role dapat dioverride melalui environment variable `E2E_<ROLE>_EMAIL` dan `E2E_<ROLE>_PASSWORD` yang sudah dipakai fixtures.

## Struktur

```text
e2e/
  journeys/
    evaluation-lifecycle.spec.ts   # J01-J04
    sop-lifecycle.spec.ts          # J05-J06
    public-integrity.spec.ts       # J07
  fixtures/
    business-test.ts               # isolated browser context per role
    users.ts
  support/
    business-actions.ts            # browser-visible business actions
    business-audit.ts              # read-only server invariant assertions
    business-preconditions.ts      # mutation API only for setup/boundaries
    ...
  *.spec.ts                        # functional browser + smoke/UI regression
```

Dokumen desain business journey ada di `docs/e2e-business-journeys.md`. API integration tests berada di `server/test/integration/`.

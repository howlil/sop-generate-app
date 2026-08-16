# E2E Taxonomy Cleanup Design

## Goal

Rapikan suite Playwright agar istilah `E2E` hanya dipakai untuk business journey lintas aktor/modul, sementara browser functional/smoke test dan server integration test memiliki boundary yang jelas tanpa mengurangi coverage penting.

## Current problem

Repository sudah memiliki tujuh audited business journeys (`J01`–`J07`), tetapi masih ada legacy Playwright specs yang mencampur UI smoke test, functional browser test, static traceability metadata, dan API-only integration behavior. Akibatnya `test:e2e:all` tidak merepresentasikan satu lapisan pengujian yang jelas dan beberapa test dapat hijau tanpa benar-benar menjalankan aksi pengguna yang diklaim.

## Design

1. `client/e2e/journeys/` tetap menjadi satu-satunya true business E2E suite. J01–J07 tetap menjadi critical CI gate.
2. Browser-level feature checks tetap berada di Playwright sebagai functional/system regression. Nama script dan dokumentasi harus menyebutnya functional browser/system tests, bukan business E2E.
3. Smoke/UI-regression specs yang masih berguna dijalankan lewat script terpisah.
4. Legacy specs yang hanya membuka halaman atau memetakan ID tanpa membuktikan behavior dihapus dari Playwright.
5. API-only concurrency/RBAC/state-machine behavior tidak dianggap E2E. Coverage backend tetap menjadi tanggung jawab server integration suite.
6. Critical journey tidak boleh gagal karena assertion kosmetik/workbench layout yang bukan business invariant.
7. Outcome publik yang diklaim sebagai browser journey harus diverifikasi lewat browser; API read boleh menjadi secondary audit, bukan pengganti aksi/outcome UI.
8. CI harus menjalankan business journeys dan functional browser regression supaya kedua layer tetap sehat.

## Concrete changes

- Hapus `client/e2e/scenario-traceability.spec.ts` dari Playwright; traceability mapping tidak lagi dianggap executable E2E evidence.
- Hapus `client/e2e/workflow-observation.spec.ts`; coverage-nya redundant dengan role-access, functional tests, dan J01–J07.
- Hapus `client/e2e/sop-concurrency.spec.ts` dari Playwright karena seluruh behavior-nya API-only dan termasuk integration concern.
- Pertahankan `layout-shell.spec.ts`, `profile-tte.spec.ts`, dan `public-pages.spec.ts` sebagai smoke/UI regression melalui script eksplisit.
- Benahi J05 agar hanya menguji create-version dan replacement invariant; assertion struktur editor/workbench dipindahkan keluar dari critical journey.
- Benahi J06 agar ketiadaan SOP dicabut pada arsip publik diverifikasi melalui UI helper `expectPublicArchiveExcludes`.
- Ubah `package.json` scripts menjadi boundary eksplisit: `test:e2e:critical`, `test:e2e:functional`, `test:e2e:smoke`, dan `test:e2e:all` sebagai komposisi layer yang memang dimaksud.
- Tambahkan functional browser regression job/step di CI setelah critical journey environment siap.
- Perbarui `client/e2e/README.md` dan `docs/e2e-business-journeys.md` agar taxonomy konsisten.

## Success criteria

- J01–J07 tetap menjadi satu-satunya true business E2E suite.
- Tidak ada Playwright spec API-only atau meta-traceability yang ikut `test:e2e:all`.
- Smoke tests dapat dijalankan eksplisit.
- Functional browser regression masuk CI.
- J05 tidak membawa assertion kosmetik/editor yang tidak terkait replacement invariant.
- J06 membuktikan outcome arsip publik melalui browser.
- Dokumentasi tidak lagi menyebut mapping `E2E-01..70` sebagai bukti jumlah executable E2E tests.

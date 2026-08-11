# Code Pattern Cleanup Implementation Plan

**Goal:** Merapikan boundary backend/frontend yang sudah diaudit tanpa mengubah fitur bisnis, route publik, schema database, enum/status workflow, atau kontrak HTTP aplikasi.

**Architecture target:** Backend tetap `Controller -> Service -> Repository -> Prisma`. Frontend tetap `API client -> TanStack Query hooks -> UI`.

> Verification note: workspace lokal tidak memiliki akses jaringan Git, sehingga siklus RED/GREEN dan regression gate dijalankan pada clean checkout GitHub Actions. Run CI implementasi sebelum sinkronisasi plan: `31464848471` — seluruh job sukses.

## Status

- [x] P1 — Hilangkan side effect/write dari repository `find*`.
- [x] P1 — Hentikan `Prisma.TransactionClient` bocor ke service.
- [x] P2 — Gunakan concrete API response type untuk pengajuan evaluasi.
- [x] P2 — Keluarkan generated Prisma client dari Git tracking.
- [x] P2 — Rapikan bootstrap backend dan Prisma error mapping.
- [x] P3 — Bersihkan frontend API serializer dan hook query/mutation pattern.
- [x] Regression gate — typecheck, lint, unit, build, DB invariant, critical E2E J01–J07, dan container build.
- [ ] Merge PR #18 ke `main` — menunggu instruksi eksplisit pengguna.

## Iteration 1 — P1 Read Repository Harus Murni

### Acceptance criteria

- [x] `PengajuanEvaluasiRepository.findManyFiltered()` hanya melakukan read.
- [x] `PengajuanEvaluasiRepository.findByIdFull()` hanya melakukan read.
- [x] Repair/finalization tidak lagi berjalan diam-diam dari GET/read path.
- [x] Regression test membuktikan read tidak membuka transaction repair.
- [x] Finalisasi normal tetap dilakukan pada write-side TTE.

### TDD evidence

- [x] RED: CI `31461224330` — 77 suite lama lulus dan 2 regression test baru gagal karena read masih memanggil `$transaction`.
- [x] GREEN: repair-on-read dan helper mutasinya dihapus; suite backend dan invariant database kembali hijau.

## Iteration 2 — P1 Transaction Boundary

### Acceptance criteria

- [x] `PengajuanEvaluasiService` tidak mengimpor/menerima `Prisma.TransactionClient`.
- [x] Service tidak memanggil callback `runTransaction()`.
- [x] Repository memiliki operasi atomik `createPengajuanDenganLock()`.
- [x] Repository memiliki operasi idempoten `ensurePengajuanRequestOpdDenganLock()`.
- [x] Row lock `SELECT ... FOR UPDATE` per OPD tetap dipertahankan.
- [x] Result transaction memakai discriminated result (`ACTIVE_EXISTS`, `DETAIL_NOT_FOUND`, `DETAIL_BAD_STATUS`, `STATUS_DRIFT`).
- [x] `STATUS_DRIFT` melempar sentinel internal di dalam transaction sehingga write parsial di-rollback.
- [x] Service tetap memetakan result ke Nest exception/pesan domain yang sama.
- [x] Integration invariant satu pengajuan aktif per OPD tetap lulus.

### TDD evidence

- [x] RED: CI `31461629975` — typecheck/lint hijau, unit gagal tepat pada boundary test service.
- [x] GREEN: CI `31462825156` — server typecheck, lint, unit, build, dan database concurrency invariant lulus.

## Iteration 3 — P2 Concrete Evaluation Responses

### Acceptance criteria

- [x] `PengajuanEvaluasiApiPayload` bukan lagi `Record<string, unknown>`.
- [x] Dibuat `PengajuanEvaluasiResponseDto` konkret sesuai JSON existing.
- [x] Dibuat `PengajuanEvaluasiRingkasResponseDto` konkret.
- [x] Controller menggunakan `ApiSuccessResponse<...>` dengan payload konkret.
- [x] Service pagination menggunakan `PaginatedData<PengajuanEvaluasiRingkasResponseDto>`.
- [x] Tidak ada rename field atau perubahan JSON runtime.

### TDD evidence

- [x] RED: CI `31462995472` — typecheck/lint hijau, unit gagal tepat pada response boundary test.
- [x] GREEN: server quality, database invariant, dan client quality kembali hijau setelah DTO konkret diterapkan.

## Iteration 4 — P2 Stop Tracking Generated Prisma

### Acceptance criteria

- [x] `server/src/generated/prisma/` tidak lagi tracked Git.
- [x] `.gitignore` tetap mengabaikan generated client.
- [x] `schema.prisma` tetap generate ke `../src/generated/prisma`.
- [x] Clean checkout CI menjalankan `Generate Prisma client` sebelum typecheck/build.
- [x] Server typecheck/build lulus tanpa generated client tersimpan di repository.

### Implementation evidence

- [x] Tree commit `c4d9c1786f2cc368435bf6c94b161022206c67e0` menghapus generated directory dari Git.
- [x] Fetch branch pada `server/src/generated` mengembalikan tidak ada path tracked.
- [x] CI clean checkout berhasil menjalankan Prisma generate + server typecheck/build.

## Iteration 5 — P2 Bootstrap dan Error Mapping

### Acceptance criteria

- [x] CORS policy dipindah ke `common/http/cors-options.ts`.
- [x] CSRF/rate-limit HTTP wiring dipindah ke `common/security/security-http.middleware.ts`.
- [x] Process fatal handler dipindah ke `common/bootstrap/process-error-handlers.ts`.
- [x] `uncaughtException` dan `unhandledRejection` log lalu terminate non-zero.
- [x] `main.ts` kembali fokus pada bootstrap/orchestration.
- [x] Dibuat helper `hasPrismaErrorCode()` dan `isPrismaUniqueConstraintError()`.
- [x] `PeraturanService`, `PelaksanaService`, dan `SopCatalogService` tidak lagi bergantung pada runtime class Prisma hanya untuk P2002.
- [x] Pesan Conflict domain tetap sama.
- [x] Unit test mencakup CORS normalization, identifier security, fatal handler, dan Prisma error helper.

## Iteration 6 — P3 Frontend Data Access Cleanup

### Acceptance criteria

- [x] `buildQueryString<T extends object>()` generic.
- [x] Serializer mendukung scalar dan repeated array query parameters.
- [x] Serializer mengabaikan `undefined`, `null`, dan empty array.
- [x] Wrapper satu-baris `unwrap*` pada `sop-client.ts` dihapus.
- [x] Wrapper/custom query builder redundan pada `evaluasi-client.ts` dihapus.
- [x] `statusIn` tetap dikirim sebagai repeated query params.
- [x] `useEvaluasi()` menjadi query-only.
- [x] `useCreatePengajuanEvaluasi()` menjadi mutation hook terpisah dengan toast/invalidation yang sama.
- [x] Dialog buka pengajuan memakai mutation hook baru tanpa perubahan UX.
- [x] `usePelaksana()` menjadi query-only.
- [x] CRUD Pelaksana dipisah menjadi `useCreatePelaksana`, `useUpdatePelaksana`, dan `useDeletePelaksana`.
- [x] Halaman master Pelaksana diperbarui memakai hook terpisah.
- [x] Consumer detail SOP yang hanya membaca Pelaksana tetap kompatibel.
- [x] Client typecheck, lint, unit, dan build lulus.

## Final Regression Gate

CI implementation run `31464848471` pada head `423ccb8ac70cf1a3fdd31ee083727fae8fd453d8`:

- [x] Database migration invariants — PASS.
- [x] Client typecheck — PASS.
- [x] Client E2E journey audit — PASS.
- [x] Client lint — PASS.
- [x] Client unit tests — PASS.
- [x] Client build — PASS.
- [x] Prisma generate dari clean checkout — PASS.
- [x] Server typecheck — PASS.
- [x] Server lint — PASS.
- [x] Server unit tests — PASS.
- [x] Server build — PASS.
- [x] Critical E2E business journeys J01–J07 — PASS.
- [x] Docker Compose validation — PASS.
- [x] Backend container image build — PASS.
- [x] Frontend container image build — PASS.

## Remaining Action

Implementasi refactor selesai di branch `refactor-code-pattern-cleanup` dan PR #18 tetap draft/unmerged. Satu-satunya aksi yang sengaja belum dilakukan adalah merge ke `main`, karena perubahan branch utama memerlukan instruksi eksplisit pengguna.

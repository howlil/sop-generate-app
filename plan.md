# Code Pattern Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merapikan boundary backend/frontend yang sudah diaudit tanpa mengubah fitur bisnis atau kontrak HTTP aplikasi.

**Architecture:** Backend mempertahankan `Controller -> Service -> Repository -> Prisma`; read repository harus murni, transaksi persistence tidak membocorkan Prisma client ke service, dan controller menggunakan response type konkret. Frontend mempertahankan API/TanStack Query yang sama sambil mengurangi wrapper/cast dan memisahkan query dari mutation pada hook yang bercampur.

**Tech Stack:** NestJS 11, TypeScript 5.7, Prisma 7, MySQL/MariaDB, React 19, TanStack Query 5, Vitest, Jest, Playwright, Docker Compose.

## Global Constraints

- Tidak mengubah route publik, enum/status workflow, struktur database, atau perilaku bisnis yang terlihat user.
- Tidak menambah dependency baru kecuali tidak ada alternatif yang setara di dependency sekarang.
- Semua perubahan backend mengikuti `Controller -> Service -> Repository -> Prisma`.
- Semua repository `find*`/`list*`/`count*` harus bebas side effect database.
- Service tidak boleh menerima atau memanggil `Prisma.TransactionClient`.
- Perubahan perilaku harus melalui red-green-refactor dan regression test.
- CI final wajib lulus server quality, database migration invariants, client quality, critical E2E J01-J07, serta container build.

---

### Task 1: P1 — Jadikan read PengajuanEvaluasi benar-benar read-only

**Files:**
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.spec.ts`
- Verify: `server/src/modules/tte/shared/repository/tte.repository.ts`

**Interfaces:**
- Consumes: `TteRepository.finalizeSopPengesahanWithArtifacts()` sebagai write-side finalization resmi.
- Produces: `findManyFiltered()` dan `findByIdFull()` yang tidak melakukan update/transaction repair.

- [ ] **Step 1: Tambahkan regression test bahwa read tidak menjalankan repair/mutation**

```ts
it('findByIdFull hanya membaca pengajuan tanpa mutation repair', async () => {
  prisma.pengajuanEvaluasi.findUnique.mockResolvedValue(mockPengajuan);

  await repository.findByIdFull('pengajuan-1');

  expect(prisma.$transaction).not.toHaveBeenCalled();
  expect(prisma.detailSOP.update).not.toHaveBeenCalled();
  expect(prisma.pengajuanEvaluasi.update).not.toHaveBeenCalled();
});
```

Tambahkan test ekuivalen untuk `findManyFiltered()`.

- [ ] **Step 2: Jalankan test dan pastikan RED pada implementasi lama**

Run:

```bash
cd server
pnpm jest pengajuan-evaluasi.repository.spec.ts --runInBand
```

Expected: test read-only gagal karena implementasi lama memanggil repair/mutation path.

- [ ] **Step 3: Hapus repair-on-read**

Ubah:

```ts
async findManyFiltered(whereInput: Prisma.PengajuanEvaluasiWhereInput) {
  return this.prisma.pengajuanEvaluasi.findMany({
    where: whereInput,
    include: pengajuanEvaluasiDetailInclude,
    orderBy: [{ createdAt: 'desc' }],
  });
}

async findByIdFull(pengajuanEvaluasiId: string) {
  return this.prisma.pengajuanEvaluasi.findUnique({
    where: { pengajuanEvaluasiId },
    include: pengajuanEvaluasiDetailInclude,
  });
}
```

Hapus `repairPengesahanKepalaOpdStatusJikaDokumenSudahSigned`, `repairPengesahanKepalaOpdStatusUntukRows`, dan private helper yang hanya digunakan repair tersebut bila tidak memiliki caller lain.

- [ ] **Step 4: Jalankan test repository + TTE signing regression**

```bash
cd server
pnpm jest pengajuan-evaluasi.repository.spec.ts tte-penandatanganan.service.spec.ts tte.repository.spec.ts --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.ts server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.spec.ts
git commit -m "refactor: make evaluation reads side-effect free"
```

---

### Task 2: P1 — Hilangkan Prisma TransactionClient dari service pengajuan evaluasi

**Files:**
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.spec.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.service.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.service.spec.ts`
- Verify: `server/test/integration/database-invariants.integration-spec.ts`

**Interfaces:**
- Produces repository operations:
  - `createPengajuanDenganLock(params): Promise<CreatePengajuanTransactionResult>`
  - `ensurePengajuanRequestOpdDenganLock(params): Promise<EnsurePengajuanTransactionResult>`
- Service tetap menentukan role/access/status constants dan memetakan repository result ke Nest exceptions.

- [ ] **Step 1: Tambahkan service test yang membuktikan service hanya memanggil repository domain operation**

```ts
it('membuka pengajuan melalui operasi repository atomik tanpa transaction client', async () => {
  repository.createPengajuanDenganLock.mockResolvedValue({
    ok: true,
    pengajuanEvaluasiId: 'pengajuan-1',
  });

  await service.create(mockPjPenyusun, dto);

  expect(repository.createPengajuanDenganLock).toHaveBeenCalledWith(
    expect.objectContaining({ opdId: 'opd-1', sopDetailIds: dto.sopDetailIds, jenis: dto.jenis }),
  );
});
```

Tambahkan mapping test untuk `ACTIVE_EXISTS`, `DETAIL_NOT_FOUND`, `DETAIL_BAD_STATUS`, dan `STATUS_DRIFT`.

- [ ] **Step 2: Jalankan service test dan pastikan RED**

```bash
cd server
pnpm jest pengajuan-evaluasi.service.spec.ts --runInBand
```

Expected: FAIL karena method repository baru belum ada dan service masih memakai `runTransaction(tx)`.

- [ ] **Step 3: Implement discriminated transaction result di repository**

Gunakan bentuk result berikut:

```ts
export type CreatePengajuanTransactionResult =
  | { ok: true; pengajuanEvaluasiId: string }
  | { ok: false; error: 'ACTIVE_EXISTS' }
  | { ok: false; error: 'DETAIL_NOT_FOUND'; detailSopId: string }
  | { ok: false; error: 'DETAIL_BAD_STATUS'; detailSopId: string; status: StatusSOP }
  | { ok: false; error: 'STATUS_DRIFT' };
```

`createPengajuanDenganLock()` harus:
1. membuka `$transaction`;
2. `SELECT opdId FROM OPD ... FOR UPDATE`;
3. cek active submission;
4. load detail dalam OPD;
5. create PengajuanEvaluasi + NilaiEvaluasi;
6. promote `DetailSOP` dengan guarded `updateMany`;
7. return typed result, bukan Nest exception.

`ensurePengajuanRequestOpdDenganLock()` memakai transaction helper internal yang sama tetapi `ACTIVE_EXISTS` menjadi `{ ok: true, created: false }` agar idempotent.

- [ ] **Step 4: Refactor service agar tidak import `Prisma` dan tidak menerima tx**

Service memanggil repository operation dan memetakan result:

```ts
const result = await this.pengajuanEvaluasiRepository.createPengajuanDenganLock({
  opdId: opdIdPengguna,
  jenis: dto.jenis,
  sopDetailIds,
  activeStatuses: STATUS_PENGAJUAN_AKTIF_LINTAS_JOBDESK,
  eligibleDetailStatuses: STATUS_DETAIL_SIAP_PENGAJUAN_EVALUASI,
});

if (!result.ok) {
  this.throwCreateTransactionError(result, 'Anda');
}
```

Hapus `assertDetailSopSiapDalamOpd(tx, ...)` dan seluruh `Prisma.TransactionClient` dari service.

- [ ] **Step 5: Jalankan unit + concurrency integration**

```bash
cd server
pnpm jest pengajuan-evaluasi.service.spec.ts pengajuan-evaluasi.repository.spec.ts --runInBand
pnpm test:integration:docker
```

Expected: unit PASS dan invariant concurrency tetap menghasilkan tepat satu active submission per OPD.

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/evaluation/pengajuan
server/test/integration/database-invariants.integration-spec.ts
git commit -m "refactor: encapsulate evaluation transactions in repository"
```

---

### Task 3: P2 — Gunakan response type konkret pada endpoint evaluasi

**Files:**
- Create: `server/src/modules/evaluation/pengajuan/dto/pengajuan-evaluasi-response.dto.ts`
- Create: `server/src/modules/evaluation/pengajuan/dto/pengajuan-evaluasi-ringkas-response.dto.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.mapper.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.repository.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.service.ts`
- Modify: `server/src/modules/evaluation/pengajuan/pengajuan-evaluasi.controller.ts`
- Modify: relevant specs if compile expectations change.

**Interfaces:**
- Produces `PengajuanEvaluasiResponseDto` yang mencakup id, optional OPD fields, jenis/status, SOP list, nilai, timeline, metadata signing/evaluation, version/timestamps.
- Produces `PengajuanEvaluasiRingkasResponseDto` untuk row pagination ringan.

- [ ] **Step 1: Tambahkan compile-time/controller test yang menggunakan DTO konkret**

Controller test harus mengetik response sebagai:

```ts
const response: ApiSuccessResponse<PengajuanEvaluasiResponseDto[]> =
  await controller.findAll(request, query);
expect(response.data[0]?.id).toBeDefined();
```

- [ ] **Step 2: Ubah mapper dari `Record<string, unknown>` menjadi DTO konkret**

```ts
export type PengajuanEvaluasiApiPayload = PengajuanEvaluasiResponseDto;
```

Mapper tetap menghasilkan JSON yang sama; tidak ada rename property.

- [ ] **Step 3: Ketik payload ringkas secara eksplisit**

Repository `findRingkasPage()` dan service `findAllRingkas()` menggunakan `PengajuanEvaluasiRingkasResponseDto` dan `PaginatedData<PengajuanEvaluasiRingkasResponseDto>`.

- [ ] **Step 4: Ubah signature controller**

Gunakan:

```ts
Promise<ApiSuccessResponse<PengajuanEvaluasiResponseDto[]>>
Promise<ApiSuccessResponse<PaginatedData<PengajuanEvaluasiRingkasResponseDto>>>
Promise<ApiSuccessResponse<PengajuanEvaluasiResponseDto>>
```

- [ ] **Step 5: Verify**

```bash
cd server
pnpm typecheck
pnpm jest pengajuan-evaluasi.controller.spec.ts pengajuan-evaluasi.service.spec.ts --runInBand
```

Expected: PASS tanpa perubahan runtime response.

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/evaluation/pengajuan
git commit -m "refactor: type evaluation API responses"
```

---

### Task 4: P2 — Keluarkan generated Prisma dari Git tracking

**Files:**
- Delete from Git: `server/src/generated/prisma/**`
- Verify: `.gitignore`
- Verify: `server/prisma/schema.prisma`
- Verify: `.github/workflows/ci.yml`
- Verify: Dockerfiles/build scripts.

**Interfaces:**
- Prisma generated output tetap `../src/generated/prisma`.
- `prisma generate` tetap dijalankan sebelum build/typecheck/test yang membutuhkan generated client.

- [ ] **Step 1: Verifikasi ignore rule dan generate path**

```bash
git check-ignore server/src/generated/prisma/index.js
cd server && pnpm prisma generate
```

Expected: path ignored dan generation berhasil.

- [ ] **Step 2: Hapus generated directory dari Git index, bukan dari source generation contract**

```bash
git rm -r --cached server/src/generated/prisma
git status --short
```

Expected: seluruh tracked generated files staged sebagai deleted; working generation dapat dibuat ulang.

- [ ] **Step 3: Verify clean regeneration + build**

```bash
cd server
pnpm prisma generate
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: stop tracking generated prisma client"
```

---

### Task 5: P2 — Rapikan bootstrap dan Prisma error mapping

**Files:**
- Create: `server/src/common/http/cors-options.ts`
- Create: `server/src/common/security/security-http.middleware.ts`
- Create: `server/src/common/bootstrap/process-error-handlers.ts`
- Create: `server/src/common/prisma/prisma-error.util.ts`
- Create: corresponding `*.spec.ts` for branching logic.
- Modify: `server/src/main.ts`
- Modify: `server/src/modules/core/peraturan/peraturan.service.ts`
- Modify: other services found by search that directly check `PrismaClientKnownRequestError` solely for P2002.

**Interfaces:**
- `buildCorsOptions(configService: ConfigService): CorsOptions`
- `installSecurityHttpMiddleware(app, services): void`
- `installFatalProcessErrorHandlers(logger): void`
- `isPrismaUniqueConstraintError(error: unknown): boolean`

- [ ] **Step 1: Test Prisma error helper**

```ts
it('mengenali P2002 sebagai unique constraint error', () => {
  expect(isPrismaUniqueConstraintError({ code: 'P2002', name: 'PrismaClientKnownRequestError' })).toBe(true);
});

it('menolak error non-P2002', () => {
  expect(isPrismaUniqueConstraintError({ code: 'P2025' })).toBe(false);
});
```

Implement helper menggunakan safe structural check atau Prisma type guard internal common; service tidak lagi import Prisma hanya untuk P2002.

- [ ] **Step 2: Test CORS normalization dan production allow-list**

Kasus wajib: development allow all, production menerima origin di `ALLOWED_ORIGINS`/`PUBLIC_APP_ORIGIN`, production menolak origin lain, request tanpa Origin tetap diizinkan.

- [ ] **Step 3: Extract security HTTP middleware dari `main.ts`**

Pindahkan network identifier, cookie identifier, login email resolution, dan wiring `resolveSecurityRateLimitPolicy` ke satu file focused. Pertahankan policy/rate limiter service yang ada.

- [ ] **Step 4: Extract fatal process handler**

Handler melakukan:

```ts
logger.error('Uncaught Exception:', error);
process.exitCode = 1;
```

Lalu proses dihentikan secara deterministik setelah logging. Test handler melalui injected exit callback agar unit test tidak membunuh Jest process.

- [ ] **Step 5: Simplify `main.ts`**

`main.ts` hanya membuat app, body parser/cookie, memasang helper security/CORS, Swagger, shutdown hooks, port check, dan listen.

- [ ] **Step 6: Replace service-level P2002 checks**

Contoh:

```ts
if (isPrismaUniqueConstraintError(error)) {
  throw new ConflictException('Nomor dan tahun peraturan sudah terdaftar');
}
```

- [ ] **Step 7: Verify**

```bash
cd server
pnpm lint
pnpm typecheck
pnpm test:core-unit
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add server/src/main.ts server/src/common server/src/modules/core/peraturan

git commit -m "refactor: simplify backend bootstrap boundaries"
```

---

### Task 6: P3 — Bersihkan frontend API serializer dan hook responsibilities

**Files:**
- Modify: `client/src/lib/api/api-client.ts`
- Modify/create tests under `client/src/__tests__/` for query serialization.
- Modify: `client/src/api/sop-client.ts`
- Modify: `client/src/api/evaluasi-client.ts`
- Modify: `client/src/api/evaluasi-queries.ts`
- Modify: `client/src/api/sop-mutations.ts`
- Modify callers only where required by hook split.

**Interfaces:**
- `buildQueryString<T extends object>(params?: T): string` mendukung scalar dan array.
- `useCreatePengajuanEvaluasi()` menjadi mutation hook terpisah.
- `usePelaksana()` menjadi read hook; mutation hooks: `useCreatePelaksana`, `useUpdatePelaksana`, `useDeletePelaksana`.

- [ ] **Step 1: Tambahkan serializer tests**

```ts
expect(buildQueryString({ page: 1, search: 'abc' })).toBe('?page=1&search=abc');
expect(buildQueryString({ statusIn: ['A', 'B'] })).toBe('?statusIn=A&statusIn=B');
expect(buildQueryString({ search: undefined, statusIn: [] })).toBe('');
```

- [ ] **Step 2: Implement generic serializer**

Serializer skip `undefined`, `null`, empty array; append setiap array item; scalar dikonversi dengan `String(value)`.

- [ ] **Step 3: Hapus unwrap wrapper satu-baris**

Di `sop-client.ts` dan `evaluasi-client.ts`, gunakan langsung:

```ts
unwrapApiData(apiClient.get<ApiSuccessResponse<T>>(path))
```

Hapus `unwrapPelaksanaMaster`, `unwrapSopListEnvelope`, `unwrapSopCreateEnvelope`, `unwrapPenyusunWorkbench`, dan `unwrapEvaluasiEnvelope` jika tidak memberi logic tambahan.

- [ ] **Step 4: Hilangkan custom query builder evaluasi yang sudah dicakup serializer generic**

`findAll`, `findRingkas`, `workspace*`, dan grafik menggunakan satu `buildQueryString` kecuali endpoint memiliki contract khusus yang tidak dapat direpresentasikan serializer.

- [ ] **Step 5: Pisahkan mutation dari list hook**

`useEvaluasi()` hanya query list. Tambahkan:

```ts
export function useCreatePengajuanEvaluasi() {
  return useMutationWithToast({
    mutationFn: evaluasiApi.create,
    invalidateKeys: SOP_EVALUASI_WORKFLOW_QUERY_KEYS,
    successMessage: 'Pengajuan evaluasi berhasil dibuat',
    errorMessagePrefix: 'Gagal membuat pengajuan evaluasi',
  });
}
```

Pisahkan pelaksana mutation dengan pola serupa. Update caller sehingga UX/toast tetap sama.

- [ ] **Step 6: Verify frontend**

```bash
cd client
pnpm lint
pnpm typecheck
pnpm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add client/src
git commit -m "refactor: simplify frontend data access hooks"
```

---

### Task 7: Regression gate, documentation sync, dan PR

**Files:**
- Modify: `plan.md` checkbox status.
- Modify if necessary: `docs/arsitektur-sistem.md` only if implementation wording is stale.
- Modify if necessary: `.cursor/rules/clean-nestjs-typescript-cursor-rules.mdc` only when a rule contradicts the final pattern.

**Interfaces:**
- Tidak ada perubahan API atau schema.
- Branch harus siap review dan merge tanpa known regression.

- [ ] **Step 1: Server full verification**

```bash
cd server
pnpm lint
pnpm typecheck
pnpm test -- --runInBand
pnpm test:integration:docker
pnpm build
```

- [ ] **Step 2: Client full verification**

```bash
cd client
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e:critical
```

- [ ] **Step 3: Scan boundary anti-pattern**

```bash
git grep -n "Prisma.TransactionClient" -- server/src/modules/evaluation/pengajuan

git grep -n "Record<string, unknown>" -- server/src/modules/evaluation/pengajuan
```

Expected: tidak ada `Prisma.TransactionClient` di service dan tidak ada generic response payload di controller/mapper untuk kontrak yang sudah diketahui.

- [ ] **Step 4: Mark plan completed dan commit docs**

Update semua checkbox yang benar-benar telah diverifikasi menjadi `[x]`.

- [ ] **Step 5: Open PR dan tunggu CI**

PR title:

```text
refactor: tighten backend and frontend code patterns
```

PR body harus menjelaskan P1/P2/P3, bahwa tidak ada route/schema change, dan mencantumkan test yang dijalankan.

- [ ] **Step 6: Merge hanya setelah seluruh CI wajib hijau**

Required: server quality, database migration invariants, client quality, critical E2E J01-J07, backend/frontend container builds.

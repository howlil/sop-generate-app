# Code Pattern Refactor Design

## Tujuan

Merapikan penyimpangan pola kode yang sudah diaudit tanpa mengubah fitur bisnis, kontrak HTTP yang digunakan client, model domain, atau alur SOP/evaluasi/TTE. Target arsitektur tetap pragmatis: `Controller -> Service -> Repository -> Prisma` pada backend dan `API client -> TanStack Query hooks -> UI` pada frontend.

## Prinsip

1. Read path harus bebas side effect: method repository `find*`, `list*`, dan `count*` tidak boleh mengubah database.
2. Prisma tidak boleh bocor ke service. Service boleh mengorkestrasi transaksi melalui operasi repository yang berbahasa domain, tetapi tidak menerima atau memanggil `Prisma.TransactionClient`.
3. Controller memakai response type konkret. `Record<string, unknown>` tidak dipakai untuk endpoint evaluasi yang kontraknya sudah diketahui.
4. Generated Prisma client bukan source code dan tidak disimpan di Git. Build/CI tetap menjalankan `prisma generate`.
5. Bootstrap hanya mengorkestrasi startup. Konfigurasi CORS, security middleware, dan process-level error handler diekstrak secukupnya tanpa membuat abstraksi berlebihan.
6. Mapping error Prisma menggunakan helper tipis agar service tidak bergantung langsung pada kelas/error code Prisma.
7. Frontend mempertahankan API dan query keys yang sama, tetapi menghapus wrapper `unwrap` redundan, mengurangi cast `Record<string, unknown>`, dan memisahkan query/mutation hook yang saat ini menggabungkan terlalu banyak tanggung jawab.
8. Tidak ada rewrite, perubahan route, perubahan enum/status, atau perubahan schema database kecuali benar-benar diperlukan untuk menjaga perilaku yang ada.

## Desain Backend

### Read-only PengajuanEvaluasiRepository

`findManyFiltered()` dan `findByIdFull()` hanya membaca. Legacy repair `repairPengesahanKepalaOpdStatusJikaDokumenSudahSigned()` tidak lagi dijalankan dari GET karena finalisasi normal sudah dilakukan secara atomik oleh `TteRepository.finalizeSopPengesahanWithArtifacts()`, yang memperbarui `DetailSOP`, status PDF, dan `PengajuanEvaluasi` pada write transaction TTE.

Bila mekanisme repair lama tidak memiliki caller write-side lain, mekanisme tersebut dihapus bersama test yang hanya membuktikan repair-on-read. Regression test harus membuktikan bahwa read tidak memanggil mutation Prisma.

### Transaction boundary Pengajuan Evaluasi

Service tetap menentukan aturan bisnis: siapa yang boleh membuat pengajuan, status yang dianggap aktif, status detail yang eligible, dan bagaimana repository result diterjemahkan menjadi exception HTTP. Repository menyediakan operasi atomik typed untuk:

- membuat pengajuan setelah mengunci row OPD;
- memastikan evaluator dapat membuat `EVALUASI_REQUEST_OPD` secara idempotent;
- mengembalikan discriminated result untuk `ACTIVE_EXISTS`, `DETAIL_NOT_FOUND`, `DETAIL_BAD_STATUS`, dan `STATUS_DRIFT`.

Dengan demikian, tidak ada `Prisma.TransactionClient` pada service tetapi lock dan atomicity tetap berada di persistence boundary.

### Concrete response types

`PengajuanEvaluasiApiPayload` diubah dari `Record<string, unknown>` menjadi interface/type eksplisit yang sesuai mapper. Untuk daftar ringkas dibuat type eksplisit yang sesuai bentuk `findRingkasPage`. Controller menggunakan `ApiSuccessResponse<PengajuanEvaluasiApiPayload>`, array, atau `PaginatedData<PengajuanEvaluasiRingkasPayload>`.

### Bootstrap dan error mapping

`main.ts` tetap bertanggung jawab membuat Nest app, memasang middleware, Swagger, shutdown hooks, dan listen. Implementasi detail berikut dipindah:

- CORS builder ke `common/http/cors-options.ts`;
- security middleware wiring/identifier ke `common/security/security-http.middleware.ts`;
- process error handlers ke `common/bootstrap/process-error-handlers.ts`.

`uncaughtException` harus log lalu mengakhiri proses dengan exit code non-zero; `unhandledRejection` dilog dan proses juga dihentikan agar container supervisor dapat restart proses dalam keadaan bersih.

Prisma unique constraint detection dipusatkan pada helper `isPrismaUniqueConstraintError(error)` di common Prisma helper. Service tetap memilih pesan domain yang tepat.

## Desain Frontend

`buildQueryString` dibuat generic terhadap object dan mendukung array query value. API client evaluasi dan SOP menggunakan langsung `unwrapApiData()` sehingga wrapper satu-baris dihapus. Hook gabungan dipecah hanya pada area yang nyata:

- `useEvaluasi()` tetap boleh menjadi list hook, tetapi create mutation dipindah ke `useCreatePengajuanEvaluasi()`;
- `usePelaksana()` menjadi read hook; create/update/delete menjadi mutation hooks terpisah.

Public API hook yang sudah digunakan banyak komponen dipertahankan sementara melalui nama yang sama hanya bila diperlukan untuk kompatibilitas. Tidak ada perubahan route atau bentuk response.

## Testing

- Unit repository: read method tidak memanggil mutation/transaction repair.
- Unit service: transactional repository result dipetakan ke exception yang sama dengan perilaku sekarang.
- Integration invariant: concurrency satu active pengajuan per OPD tetap lulus.
- Controller/typecheck: concrete response type tidak mengubah JSON runtime.
- Bootstrap helper unit test untuk CORS/security/error utility bila logic bercabang.
- Frontend Vitest/typecheck untuk query serializer dan hook usage yang terdampak.
- Gate akhir: server lint/typecheck/unit/integration, client lint/typecheck/test, critical E2E, container build melalui CI.

## Non-goals

- Tidak menerapkan Clean Architecture/DDD penuh.
- Tidak mengganti Prisma, NestJS, TanStack Query, Zustand, atau routing.
- Tidak mengubah schema domain, status workflow, atau endpoint publik.
- Tidak mengoptimalkan cache invalidation luas kecuali diperlukan akibat pemisahan hook.

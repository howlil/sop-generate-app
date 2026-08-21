# Repository Agent Instructions

Instruksi ini berlaku untuk seluruh repository `sop-generate-app` kecuali ada `AGENTS.md` yang lebih spesifik di subdirektori.

## Project Boundary

SOPFlow adalah aplikasi React/Vite + NestJS + Prisma/MariaDB dengan Docker Compose. Sistem juga memiliki persistent PDF state, TTE credential/signing flow, RBAC, authentication, dan integrasi Wago opsional untuk outbound WhatsApp serta signed delivery webhook.

Pertahankan boundary dan behavior production yang sudah ada kecuali requirement konkret menuntut perubahan.

## Engineering Priorities

Urutan ketika trade-off konflik:

1. Correctness
2. Security
3. Data integrity
4. Reliability
5. Maintainability
6. Observability
7. Simplicity
8. Performance
9. Extensibility
10. Delivery speed

Delivery speed harus ditingkatkan dengan feedback loop dan batch size yang lebih baik, bukan dengan melemahkan guardrail di atas.

## Delivery Operating Model

Optimalkan **fast verified delivery**, bukan raw coding activity.

Default loop untuk behavior change:

```text
goal
  -> acceptance criteria
  -> RED
  -> GREEN
  -> REFACTOR
  -> focused verification
  -> PR / CI
  -> review + fix on the same branch
  -> merge
  -> observe
```

Rules:

- **TDD adalah default untuk executable behavior change.** Feature dan bugfix mengikuti RED -> GREEN -> REFACTOR.
- Untuk bug reproducible, tulis regression test terlebih dahulu dan pastikan RED gagal karena behavior yang memang salah.
- Implementasikan **smallest coherent vertical slice** yang menghasilkan behavior berguna.
- Keep batches small, reviewable, reversible, dan mudah diuji.
- Gunakan focused tests untuk inner loop tercepat, kemudian widen verification sesuai risk sebelum merge.
- Batasi WIP. Satu agent sebaiknya menyelesaikan satu task koheren end-to-end sebelum mengambil unrelated work jika tidak ada blocker.
- Jangan over-plan low-risk changes. Planning harus sebanding dengan risk dan complexity.
- Terapkan YAGNI. Hindari speculative abstraction, framework/dependency baru, atau infrastructure tanpa demonstrated need.
- Feedback seperti CI failure, review comment, typo, formatting, atau RED/GREEN tambahan bukan task identity baru.

## Risk-Based Verification

### Low risk

Contoh: copy/UI kecil, docs, styling, refactor internal tanpa contract/state change.

- focused unit/component tests;
- lint/type/build yang relevan;
- broaden hanya bila dependency graph atau behavior berubah lebih luas.

### Medium risk

Contoh: API behavior, business workflow, Prisma query, role-specific UI, reminder behavior, PDF generation.

- RED/GREEN regression/behavior tests;
- relevant unit + integration tests;
- frontend/backend build/type checks;
- critical E2E journey bila user flow terdampak.

### High risk

Contoh: authentication, authorization/RBAC, database migration, transaction/invariant, TTE credential encryption/signing, persistent PDF state, webhook signature/idempotency, destructive operation, secret handling.

- targeted regression tests;
- integration tests dengan durable-state behavior nyata bila practical;
- relevant critical E2E;
- migration/rollback compatibility checks bila applicable;
- security/negative-path verification;
- full mandatory CI gates sebelum merge;
- jangan bypass explicit review/approval gate bila perubahan berpotensi irreversible, destructive, atau security-critical.

## Backend and Data Rules

- Validate untrusted input pada boundary sebelum business logic.
- Authorization harus enforced server-side; UI hiding bukan security boundary.
- Public/API errors tidak boleh membocorkan stack trace, credentials, secrets, raw P12 content, JWT, webhook secret, atau sensitive request body.
- Business invariants multi-write harus berada dalam transaction boundary yang benar.
- Prisma migration yang sudah dirilis tidak boleh diedit untuk mengubah history; gunakan migration baru.
- Schema/state change harus mempertimbangkan existing data dan rollback/recovery path.
- Retryable side effect harus idempotent bila duplicate execution berbahaya.
- Wago webhook verification dan durable deduplication tidak boleh dilemahkan demi kemudahan testing/development.
- TTE/P12/private signing material adalah secret-bearing state. Jangan log atau commit credential material.
- Persistent PDF state dan database state jangan dihancurkan sebagai side effect normal deployment/test cleanup.

## Testing Discipline

TDD loop:

```text
RED -> GREEN -> REFACTOR
```

Untuk behavior change:

1. Resolve intended behavior dan acceptance criteria.
2. Characterize existing behavior bila contract belum cukup jelas.
3. Tambahkan failing test/regression yang paling kecil dan relevan.
4. Konfirmasi failure reason benar.
5. Implement minimal coherent change sampai GREEN.
6. Run focused tests segera.
7. Refactor tanpa mengubah behavior dan tetap GREEN.
8. Widen verification sesuai risk sebelum merge.

Rules tambahan:

- Jangan delete/weaken/skip valid regression hanya agar CI hijau.
- Test observable behavior dan invariants, bukan implementation detail tanpa alasan.
- Prefer deterministic tests dengan failure signal yang jelas.
- Gunakan integration test untuk DB/RBAC/webhook/state boundary ketika unit mock dapat menyembunyikan bug penting.
- Critical E2E harus melindungi user journey utama, bukan menjadi tempat semua edge case.
- Flaky test dan slow CI adalah delivery-system defects yang harus dikurangi.

## Git Workflow

Normal lifecycle:

```text
main
  -> one task branch
  -> RED/GREEN/refactor/review/CI fixes on same branch
  -> one PR
  -> verify current head
  -> squash merge
  -> cleanup branch
```

Rules:

- Satu coherent task menggunakan maksimal satu working branch dan satu PR.
- Sebelum membuat branch/PR, cek apakah task yang sama sudah aktif; lanjutkan yang ada.
- Jangan buat `v2`, `final`, `retry`, `iteration-*`, atau `review-fixes-*` branch untuk task yang masih sama.
- Working commits harus menjadi useful engineering checkpoints, bukan log setiap edit/command.
- RED/GREEN commit boleh bila membantu diagnosis/review, tetapi opsional.
- Commit count, branch count, LOC, dan PR count bukan productivity KPI.
- Small review correction sebaiknya fold/amend ke checkpoint bermakna bila aman.
- Default merge adalah **squash merge** untuk menghasilkan satu logical commit di `main`.
- Jika verified PR head berubah, relevant gates harus diverifikasi ulang.
- Setelah merge, delete task branch bila tooling memungkinkan.

## Delivery Metrics

Gunakan metrics untuk memperbaiki engineering system, bukan scoring individual.

Prioritas:

- cycle time
- PR lead time
- CI feedback time
- change failure rate
- escaped defect rate
- rework rate
- flaky-test rate
- WIP age
- deployment frequency bila signal deployment reliable tersedia

Interpretation:

- Optimalkan trend, bukan vanity numbers.
- Delivery cepat dengan rework/escaped defect tinggi adalah false speed.
- Bila cycle time naik, cari bottleneck: unclear scope, oversized batch, slow CI, flaky test, review latency, architecture coupling, manual deployment, atau environment instability.

## Agent Execution

Untuk setiap task:

1. Baca requirement/user request dan relevant code/tests/docs.
2. Cek `.agent/` untuk plan/spec yang benar-benar relevan; jangan mengikuti artifact lama secara buta bila code sudah maju.
3. Cek active branch/PR untuk task yang sama.
4. Tentukan acceptance criteria, risk class, dan smallest test seam.
5. Jalankan TDD bila ada behavior change.
6. Implement smallest coherent slice.
7. Run focused verification.
8. Widen verification sesuai risk.
9. Keep CI/review fixes pada branch/PR yang sama.
10. Record concise plan/checkpoint hanya bila artifact tersebut membantu sequencing, continuity, risk control, atau auditability.
11. Merge setelah required gates terpenuhi dan task memang sudah diotorisasi user; jangan meminta redundant confirmation untuk normal low/medium-risk completion.

## Planning and `.agent/`

- Root `AGENTS.md` adalah repository-wide execution policy.
- `.agent/README.md` menjelaskan workspace boundary dan artifact policy.
- `.agent/specs/` digunakan untuk material design/trade-off decisions.
- `.agent/plans/` digunakan ketika sequencing/dependency/risk cukup kompleks untuk memerlukan implementation plan.
- `.agent/skills/` berisi reusable project-specific agent procedures.
- Root `plan.md` tetap menjadi roadmap/engineering plan yang sudah ada.

Jangan menghasilkan agent artifacts sebagai ceremony. Low-risk task dengan acceptance criteria dan verification yang jelas boleh langsung dieksekusi dengan branch + TDD/verification yang sesuai.

## Anti-Over-Engineering

Jangan menambah secara default:

- microservices
- message broker/queue baru tanpa workload nyata
- Redis/cache layer tanpa measured need
- generic repository/service/factory/adapter abstraction untuk setiap module
- CQRS/event sourcing
- Kubernetes/service mesh
- state-management/frontend dependency baru tanpa complexity yang membutuhkannya
- generic internal framework yang lebih kompleks daripada problem-nya

Prefer explicit, testable modules dan existing stack sampai requirement nyata menunjukkan batasnya.

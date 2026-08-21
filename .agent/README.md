# SOPFlow Agent Workspace

`.agent/` adalah workspace internal untuk design, planning, dan reusable agent procedures. Root `AGENTS.md` adalah execution policy utama repository.

## Operating Model

Gunakan **fast verified delivery**:

```text
goal
  -> acceptance criteria
  -> RED
  -> GREEN
  -> REFACTOR
  -> focused verification
  -> PR / CI
  -> review + fixes on same branch
  -> merge
  -> observe
```

Prinsip:

- TDD default untuk executable behavior change.
- Smallest coherent vertical slice.
- Small batch, low WIP, short feedback loop.
- Satu task -> satu branch -> satu PR.
- Focused verification dulu, lalu widen sesuai risk.
- YAGNI; jangan menambah abstraction/infrastructure hipotetis.
- Commit/branch/LOC/PR count bukan productivity KPI.
- Gunakan cycle time, PR lead time, CI feedback, rework, escaped defects, change failure rate, flaky tests, dan WIP age untuk menemukan bottleneck.

## Structure

```text
.agent/
  README.md
  specs/
  plans/
  skills/
```

Jangan menambah direktori/artifact type baru tanpa recurring need yang jelas.

## Specs

Gunakan `.agent/specs/` bila design decision perlu disepakati sebelum implementation, terutama untuk:

- database schema/migration dan durable invariants
- auth/RBAC/security boundary
- concurrency/idempotency
- TTE/P12/secret handling
- webhook contract/signature/deduplication
- public API contract
- architecture changes

Spec harus decision-oriented: problem, constraints, invariants, chosen design, meaningful alternatives, risks, acceptance criteria.

## Plans

Gunakan `.agent/plans/` untuk multi-step implementation ketika sequencing, dependency, rollout/migration, atau verification mudah hilang bila hanya disimpan di kepala/chat.

Plan yang baik memecah pekerjaan menjadi small vertical slices dan menyertakan test/verification per slice. Jangan membuat plan besar yang mendorong long-lived branch atau big-bang merge.

## Skills

`.agent/skills/` menyimpan reusable project-specific procedures. Skill harus reusable, sempit, dan tidak menduplikasi policy umum dari `AGENTS.md`.

## Artifact Economy

Buat artifact hanya bila meningkatkan salah satu dari:

- execution clarity
- reviewability
- continuity antar sesi/agent
- risk control
- auditability

Low-risk task dengan acceptance criteria dan verification yang jelas tidak membutuhkan spec/plan baru.

Jangan membuat checkpoint spam untuk setiap command, test run, typo, atau CI retry.

## Source of Truth

1. Runtime code + current tests menentukan behavior aktual.
2. Root `AGENTS.md` menentukan engineering/agent execution policy.
3. Root `plan.md` adalah roadmap/engineering plan yang sudah ada.
4. `.agent/specs/` menyimpan approved design decisions.
5. `.agent/plans/` membantu implementation sequencing.
6. `.agent/skills/` menyimpan reusable procedures.
7. `docs/` menjelaskan architecture/product/operational behavior untuk pembaca manusia.

Jika artifact lama bertentangan dengan code/test terbaru karena implementation sudah maju atau keputusan berubah, validasi kondisi terkini dan update artifact sebelum menggunakannya sebagai dasar pekerjaan baru.

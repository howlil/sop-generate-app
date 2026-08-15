# Login Institutional Service Portal Checkpoint

Implemented on branch `refactor/login-institutional-service-portal`.

Changed:
- `LoginPage.tsx`: centered institutional shell with max-width container and 7:5 desktop grid.
- `LoginHero.tsx`: replaces the large dark photo billboard with a calm service identity panel, compact workflow, and controlled institutional image accent.
- `LoginForm.tsx`: uses `Masuk ke SOPFlow`, short account copy, internal account chip, and unchanged auth submission behavior.
- `public-auth-design-contract.test.ts`: locks institutional shell, service panel, low-copy form, and preserved auth behavior.

Guardrails:
- Frontend/UI-only.
- No backend/API/DTO/Prisma changes.
- No auth payload, route, permission, workflow, archive, or PDF validation logic changes.

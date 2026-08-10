import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const clientDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = resolve(clientDir, '..', 'server')
const journeyIds = ['J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'J07']
const auditAll = process.argv.includes('--audit-all') || process.env.E2E_CRITICAL_AUDIT_ALL === 'true'

function run(command, args, cwd, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  if (result.error) throw result.error
  return result.status ?? 1
}

function mustRun(command, args, cwd, extraEnv = {}) {
  const status = run(command, args, cwd, extraEnv)
  if (status !== 0) process.exit(status)
}

function assertDisposableDatabase() {
  const identity = `${process.env.DATABASE_NAME ?? ''} ${process.env.DATABASE_URL ?? ''}`
  if (!/(^|[^a-z])(test|ci_e2e)([^a-z]|$)/i.test(identity)) {
    console.error(
      'Critical E2E menolak reset database karena DATABASE_NAME/DATABASE_URL tidak terlihat sebagai database test.',
    )
    console.error('Gunakan database disposable yang namanya mengandung "test" atau "ci_e2e".')
    process.exit(1)
  }
}

assertDisposableDatabase()
mustRun(process.execPath, ['scripts/audit-e2e-journeys.mjs'], clientDir)

const failures = []

for (const journeyId of journeyIds) {
  console.log(`\n=== ${journeyId}: reset database melalui migration history ===`)
  mustRun('pnpm', ['prisma', 'migrate', 'reset', '--force', '--skip-seed'], serverDir)
  mustRun('pnpm', ['db:seed:e2e'], serverDir)

  console.log(`=== ${journeyId}: execute isolated journey ===`)
  const status = run(
    process.execPath,
    ['scripts/run-e2e.mjs', 'journeys', '--grep', `^${journeyId}\\b`, '--project=chromium'],
    clientDir,
    {
      E2E_CRITICAL: 'true',
      E2E_CRITICAL_AUDIT_ALL: auditAll ? 'true' : 'false',
      E2E_SEED: 'false',
      E2E_TEST_RUN_ID: `${journeyId}-${Date.now()}`,
    },
  )

  if (status === 0) continue
  failures.push(journeyId)
  if (!auditAll) process.exit(status)
}

if (failures.length > 0) {
  console.error(`\nCritical audit gagal pada: ${failures.join(', ')}`)
  process.exit(1)
}

console.log(`\nCritical audit lulus: ${journeyIds.join(', ')}`)

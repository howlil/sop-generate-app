import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const clientDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const serverDir = resolve(clientDir, '..', 'server')
const projects = ['firefox', 'webkit', 'mobile-chrome']
const specs = [
  'public-pages.spec.ts',
  'role-access.spec.ts',
  'profile-tte.spec.ts',
  'layout-shell.spec.ts',
  'workflow-observation.spec.ts',
]

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
  if (!/(^|[^a-z])test([^a-z]|$)/i.test(identity)) {
    console.error(
      'Compatibility audit menolak reset database karena DATABASE_NAME/DATABASE_URL tidak terlihat sebagai database test.',
    )
    process.exit(1)
  }
}

assertDisposableDatabase()
const failures = []

for (const project of projects) {
  console.log(`\n=== ${project}: reset database melalui migration history ===`)
  mustRun('pnpm', ['prisma', 'migrate', 'reset', '--force', '--skip-seed'], serverDir)
  mustRun('pnpm', ['db:seed:e2e'], serverDir)

  console.log(`=== ${project}: execute compatibility smoke ===`)
  const status = run(
    process.execPath,
    [
      'scripts/run-e2e.mjs',
      ...specs,
      `--project=${project}`,
    ],
    clientDir,
    {
      E2E_ALL_BROWSERS: 'true',
      E2E_COMPAT: 'true',
      E2E_CRITICAL: 'false',
      E2E_SEED: 'false',
      E2E_TEST_RUN_ID: `compat-${project}-${Date.now()}`,
    },
  )

  if (status !== 0) failures.push(project)
}

if (failures.length > 0) {
  console.error(`\nCompatibility audit gagal pada: ${failures.join(', ')}`)
  process.exit(1)
}

console.log(`\nCompatibility audit lulus: ${projects.join(', ')}`)

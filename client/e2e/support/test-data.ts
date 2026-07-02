export const e2ePin = process.env.E2E_TTE_PIN ?? '123456'

export function e2eRunId(prefix = 'E2E'): string {
  const configured = process.env.E2E_TEST_RUN_ID
  const raw = configured ?? `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`
  const safePrefix = prefix.replace(/[^A-Za-z0-9-]/g, '').slice(0, 10)
  const safeRaw = raw.replace(/[^A-Za-z0-9-]/g, '')
  return `${safePrefix}-${safeRaw.slice(-13)}`.slice(0, 24)
}

export function uniqueEmail(prefix: string): string {
  return `${prefix.toLowerCase()}.${e2eRunId('user').toLowerCase()}@example.test`
}

export const validPdfBase64 =
  'JVBERi0xLjEKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMjAwXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE5NgolJUVPRgo='

export const invalidPdfBase64 = Buffer.from('not a signed pdf', 'utf8').toString('base64')

export function sopFixture(prefix = 'SOP') {
  const suffix = e2eRunId(prefix)
  return {
    suffix,
    title: `E2E SOP ${suffix}`,
    number: `E2E/${suffix}/2026`,
    updatedTitle: `E2E SOP Revisi ${suffix}`,
    baNumber: `BA-E2E-${suffix}`,
  }
}

export const scenarioIds = Array.from({ length: 70 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0')
  return `E2E-${number}`
})

export const scenarioCoverage: Record<string, string[]> = {
  'auth.spec.ts': ['E2E-01', 'E2E-02', 'E2E-03', 'E2E-06', 'E2E-07'],
  'role-access.spec.ts': ['E2E-04', 'E2E-05', 'E2E-34', 'E2E-44', 'E2E-70'],
  'master-data.spec.ts': [
    'E2E-08',
    'E2E-09',
    'E2E-10',
    'E2E-11',
    'E2E-12',
    'E2E-13',
    'E2E-14',
    'E2E-15',
    'E2E-16',
    'E2E-17',
    'E2E-18',
    'E2E-19',
    'E2E-20',
    'E2E-21',
  ],
  'sop-authoring.spec.ts': [
    'E2E-22',
    'E2E-23',
    'E2E-24',
    'E2E-25',
    'E2E-26',
    'E2E-27',
    'E2E-28',
    'E2E-29',
    'E2E-30',
    'E2E-31',
    'E2E-56',
  ],
  'evaluasi-workflow.spec.ts': [
    'E2E-32',
    'E2E-33',
    'E2E-35',
    'E2E-36',
    'E2E-37',
    'E2E-38',
    'E2E-39',
    'E2E-40',
    'E2E-41',
    'E2E-42',
    'E2E-43',
    'E2E-45',
    'E2E-46',
    'E2E-69',
  ],
  'tte-pengesahan.spec.ts': [
    'E2E-47',
    'E2E-48',
    'E2E-49',
    'E2E-50',
    'E2E-51',
    'E2E-52',
    'E2E-53',
    'E2E-54',
    'E2E-55',
    'E2E-57',
  ],
  'arsip-public.spec.ts': ['E2E-58', 'E2E-59', 'E2E-60', 'E2E-61', 'E2E-62', 'E2E-63', 'E2E-64', 'E2E-65'],
  'pdf-verification.spec.ts': ['E2E-66', 'E2E-67'],
  'list-filter-pagination.spec.ts': ['E2E-68'],
}

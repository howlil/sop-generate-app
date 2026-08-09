import type { APIRequestContext } from '@playwright/test'

import { users } from '../fixtures/users'
import { apiGet, apiPatch, apiPost, createAuthenticatedApiContext } from './api'
import {
  createApprovedSopFixture,
  createReadySopFixture,
  ensureTteReady,
  finishEvaluation,
  nilaiSopSesuai,
  signBeritaAcara,
  type ApprovedSopFixture,
  type ReadySopFixture,
} from './e2e-flow'
import { e2ePin, validPdfBase64 } from './test-data'

interface CreatedPengajuan {
  id: string
}

export interface ActiveEvaluationFixture {
  pengajuanId: string
  sops: ReadySopFixture[]
}

/**
 * Mutation API di file ini hanya untuk membentuk PRECONDITION journey.
 * Aksi yang menjadi objek pengujian harus dilakukan melalui browser di business-actions.ts.
 */
export async function seedReadySops(prefix: string, count = 1): Promise<ReadySopFixture[]> {
  const pjPenyusun = await createAuthenticatedApiContext(users.pjPenyusun)
  try {
    const sops: ReadySopFixture[] = []
    for (let index = 0; index < count; index += 1) {
      sops.push(await createReadySopFixture(pjPenyusun, `${prefix}-${index + 1}`))
    }
    return sops
  } finally {
    await pjPenyusun.dispose()
  }
}

export async function seedActiveEvaluation(
  prefix: string,
  count = 1,
): Promise<ActiveEvaluationFixture> {
  const pjPenyusun = await createAuthenticatedApiContext(users.pjPenyusun)
  try {
    const sops: ReadySopFixture[] = []
    for (let index = 0; index < count; index += 1) {
      sops.push(await createReadySopFixture(pjPenyusun, `${prefix}-${index + 1}`))
    }
    const pengajuan = await apiPost<CreatedPengajuan>(pjPenyusun, '/evaluasi', {
      jenis: 'EVALUASI_REQUEST_OPD',
      sopDetailIds: sops.map((sop) => sop.detailSopId),
    })
    return { pengajuanId: pengajuan.id, sops }
  } finally {
    await pjPenyusun.dispose()
  }
}

export async function ensureJourneyTteProfiles(): Promise<void> {
  const contexts = await Promise.all([
    createAuthenticatedApiContext(users.pjEvaluator),
    createAuthenticatedApiContext(users.pjPenyusun),
    createAuthenticatedApiContext(users.kepalaOpd),
  ])
  try {
    await Promise.all(contexts.map((context) => ensureTteReady(context)))
  } finally {
    await Promise.all(contexts.map((context) => context.dispose()))
  }
}

/**
 * Digunakan J04 setelah invariant mixed-result sudah dibuktikan dari UI.
 * Loop revisi UI penuh diuji terpisah di J02 sehingga J04 tetap fokus pada agregasi multi-SOP.
 */
export async function advanceRevisionForAggregationPrecondition(
  pengajuanId: string,
  detailSopId: string,
): Promise<void> {
  const pjPenyusun = await createAuthenticatedApiContext(users.pjPenyusun)
  try {
    await apiPatch(
      pjPenyusun,
      `/evaluasi/${pengajuanId}/nilai/${detailSopId}/tindak-lanjut-selesai`,
    )
    await apiPost(pjPenyusun, `/sop/penyusun-workbench/${detailSopId}/kirim-ulang-evaluasi`)
  } finally {
    await pjPenyusun.dispose()
  }
}

/**
 * Menyiapkan versi DRAFT yang baru dibuat dari UI sampai tepat sebelum aksi Kepala OPD.
 * J05 menguji create-version dan replacement invariant; evaluasi ulang tidak diduplikasi dari J01/J02.
 */
export async function advanceVersionToHeadSignaturePrecondition(params: {
  detailSopId: string
  title: string
  baNumber: string
}): Promise<string> {
  const pjPenyusun = await createAuthenticatedApiContext(users.pjPenyusun)
  const evaluator = await createAuthenticatedApiContext(users.evaluator)
  const pjEvaluator = await createAuthenticatedApiContext(users.pjEvaluator)
  try {
    await apiPatch(pjPenyusun, `/sop/status/${params.detailSopId}`, {
      status: 'MENUNGGU_PENGAJUAN_EVALUASI',
    })
    const pengajuan = await apiPost<CreatedPengajuan>(pjPenyusun, '/evaluasi', {
      jenis: 'EVALUASI_REQUEST_OPD',
      sopDetailIds: [params.detailSopId],
    })
    await nilaiSopSesuai(evaluator, pengajuan.id, params.detailSopId)
    await finishEvaluation(evaluator, pengajuan.id, params.baNumber)
    await ensureTteReady(pjEvaluator)
    await ensureTteReady(pjPenyusun)
    await signBeritaAcara(
      pjEvaluator,
      pengajuan.id,
      params.baNumber,
      `Berita Acara ${params.title}`,
    )
    await signBeritaAcara(
      pjPenyusun,
      pengajuan.id,
      params.baNumber,
      `Berita Acara ${params.title}`,
    )
    return pengajuan.id
  } finally {
    await Promise.all([pjPenyusun.dispose(), evaluator.dispose(), pjEvaluator.dispose()])
  }
}

export async function seedApprovedSop(prefix: string): Promise<ApprovedSopFixture> {
  return createApprovedSopFixture(prefix)
}

export async function createSignedPdfArtifact(
  approved: ApprovedSopFixture,
): Promise<{ enabled: boolean; pdf: Buffer }> {
  if (!approved.pengesahan) {
    throw new Error('SOP approved tidak memiliki payload pengesahan TTE')
  }

  const kepalaOpd = await createAuthenticatedApiContext(users.kepalaOpd)
  try {
    const status = await apiGet<{ enabled: boolean }>(
      kepalaOpd,
      '/tte/public/pdf-signing/status',
    )
    const signed = await apiPost<{ signedPdfBase64: string }>(kepalaOpd, '/tte/pdf/sign', {
      pin: e2ePin,
      dokumenTteId: approved.pengesahan.dokumenTteId,
      userId: approved.pengesahan.userId,
      jenisDokumen: 'SOP_BERLAKU',
      pdfBase64: validPdfBase64,
    })

    return {
      enabled: status.enabled,
      pdf: Buffer.from(signed.signedPdfBase64, 'base64'),
    }
  } finally {
    await kepalaOpd.dispose()
  }
}

/** Helper sempit untuk setup yang membutuhkan context API eksternal. */
export async function withPjPenyusunApi<T>(
  action: (context: APIRequestContext) => Promise<T>,
): Promise<T> {
  const context = await createAuthenticatedApiContext(users.pjPenyusun)
  try {
    return await action(context)
  } finally {
    await context.dispose()
  }
}

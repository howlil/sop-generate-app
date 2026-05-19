import type { PaginationMetaDto } from '@/types/dto/evaluasi.dto'

type LegacyPaginatedMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

type PaginatedEnvelope = {
  pagination?: PaginationMetaDto
  meta?: LegacyPaginatedMeta
}

/** Normalisasi respons terpaginasi (mendukung `pagination` baru dan `meta` lama). */
export function readPaginationMeta(
  data: PaginatedEnvelope | undefined,
): PaginationMetaDto | undefined {
  if (data === undefined) {
    return undefined
  }
  if (data.pagination !== undefined) {
    return data.pagination
  }
  if (data.meta !== undefined) {
    return {
      page: data.meta.page,
      limit: data.meta.limit,
      totalItems: data.meta.total,
      totalPages: data.meta.totalPages,
    }
  }
  return undefined
}

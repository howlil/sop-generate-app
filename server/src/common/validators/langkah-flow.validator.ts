import { BadRequestException } from '@nestjs/common';
import { JenisLangkahProsedur } from '../../generated/prisma';

type LangkahNode = {
  langkahSelanjutnyaYaId: string | null;
  langkahSelanjutnyaTidakId: string | null;
};

type GetLangkahFn = (id: string) => Promise<LangkahNode | null>;

export function assertLangkahBranching(
  jenis: JenisLangkahProsedur,
  langkahSelanjutnyaYaId: string | null,
  langkahSelanjutnyaTidakId: string | null,
) {
  if (jenis === JenisLangkahProsedur.AWAL_AKHIR) {
    if (langkahSelanjutnyaYaId || langkahSelanjutnyaTidakId) {
      throw new BadRequestException(
        'Langkah AWAL_AKHIR tidak boleh memiliki langkah selanjutnya',
      );
    }
  }

  if (jenis === JenisLangkahProsedur.KEGIATAN) {
    if (langkahSelanjutnyaTidakId) {
      throw new BadRequestException(
        'Langkah KEGIATAN hanya boleh memiliki satu langkah selanjutnya (Ya)',
      );
    }
  }
}

export async function detectCircularReference(
  langkahId: string,
  nextYaId: string | null,
  nextTidakId: string | null,
  getLangkahFn: GetLangkahFn,
): Promise<boolean> {
  if (nextYaId && (await hasCycleDFS(langkahId, nextYaId, getLangkahFn))) {
    return true;
  }

  if (
    nextTidakId &&
    (await hasCycleDFS(langkahId, nextTidakId, getLangkahFn))
  ) {
    return true;
  }

  return false;
}

async function hasCycleDFS(
  startId: string,
  currentId: string,
  getLangkahFn: GetLangkahFn,
  visited = new Set<string>(),
): Promise<boolean> {
  if (currentId === startId) {
    return true;
  }

  if (visited.has(currentId)) {
    return false;
  }

  visited.add(currentId);

  const langkah = await getLangkahFn(currentId);
  if (!langkah) {
    return false;
  }

  if (
    langkah.langkahSelanjutnyaYaId &&
    (await hasCycleDFS(
      startId,
      langkah.langkahSelanjutnyaYaId,
      getLangkahFn,
      visited,
    ))
  ) {
    return true;
  }

  if (
    langkah.langkahSelanjutnyaTidakId &&
    (await hasCycleDFS(
      startId,
      langkah.langkahSelanjutnyaTidakId,
      getLangkahFn,
      visited,
    ))
  ) {
    return true;
  }

  return false;
}

import { BadRequestException } from '@nestjs/common';
import { StatusTindakLanjut } from '../../../generated/prisma';
import type { NilaiRevisiAktifRow } from './evaluasi-nilai.repository';

/** Validasi guard kirim ulang: wajib status tindak lanjut SELESAI bila hasil perlu perbaikan. */
export function assertBolehKirimUlangSetelahRevisi(nilai: NilaiRevisiAktifRow | null): void {
  if (nilai === null) {
    return;
  }
  if (nilai.statusTindakLanjut !== StatusTindakLanjut.SELESAI) {
    throw new BadRequestException(
      'Tandai umpan balik evaluasi sebagai selesai sebelum mengirim ulang ke evaluator',
    );
  }
}

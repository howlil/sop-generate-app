/**
 * Seed data untuk Manajemen Tim Penyusun (Biro Organisasi).
 * Dummy: satu tim penyusun per OPD (52 data).
 */

import type { TimPenyusun, TimPenyusunOption } from '@/lib/types/tim'
import { SEED_OPD_LIST } from '@/lib/seed/opd-seed'

export const SEED_TIM_PENYUSUN_LIST: TimPenyusun[] = SEED_OPD_LIST.map((opd, index) => {
  const n = index + 1
  const seq = n.toString().padStart(3, '0')
  return {
    id: `tp${n}`,
    opdId: opd.id,
    nama: `Tim Penyusun ${opd.name}`,
    nip: `1980${seq}2019010001`,
    jabatan: 'Anggota Tim Penyusun',
    email: `tim.penyusun.${seq}@${opd.email.split('@')[1] ?? 'pemda.go.id'}`,
    noHP: `0813-2000-${seq}`,
    status: 'Aktif',
    jumlahSOPDisusun: Math.max(1, Math.round((opd.totalSOP || 10) / 10)),
    tanggalBergabung: '2024-01-01',
  }
})

/** Opsi tim penyusun untuk dropdown (mis. Inisiasi Proyek). Diambil dari SEED_TIM_PENYUSUN_LIST. */

export const SEED_TIM_PENYUSUN_OPTIONS: TimPenyusunOption[] = SEED_TIM_PENYUSUN_LIST.slice(0, 4).map(
  (t) => ({
    id: t.id,
    nama: t.nama,
    jabatan: t.jabatan,
  })
)

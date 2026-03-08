/**
 * Seed data untuk Daftar SOP dan SOP Saya (Tim Penyusun).
 * Data mentah dari data/sop-daftar.json (bentuk = response API). Relasi: opdId → opd.json, peraturanId → peraturanDaftar.
 * Siap diganti dengan API later.
 */

import type { SOPDaftarItem, SOPSayaItem } from '@/lib/types/sop'
import sopDaftarData from './data/sop-daftar.json'

export type { SOPDaftarItem, SOPSayaItem }

interface SopDaftarResponse {
  opdDisdikId: string
  sopDaftar: SOPDaftarItem[]
  peraturanDaftar: { id: string; nama: string }[]
  sopSaya: SOPSayaItem[]
  dummyCount: number
  dummyConfig: {
    opdIds: string[]
    statusPool: SOPDaftarItem['status'][]
    timPenyusunPool: string[]
    peraturanIds: string[]
    authorPool?: string[]
    peraturanNama: Record<string, string>
  }
}

const data = sopDaftarData as SopDaftarResponse
// data.opdDisdikId tersedia di JSON bila nanti dibutuhkan untuk filter Kepala OPD.

const cfg = data.dummyConfig
const authorPool = cfg.authorPool ?? ['Budi Santoso', 'Ahmad Pratama', 'Dra. Siti Aminah']
const dummySopDaftar: SOPDaftarItem[] = Array.from({ length: data.dummyCount }, (_, index) => {
  const n = index + data.sopDaftar.length + 1
  const id = String(n)
  const pad = n.toString().padStart(3, '0')
  const status = cfg.statusPool[index % cfg.statusPool.length]
  const kategori = index % 2 === 0 ? 'Pelayanan' : 'Administrasi'
  const timPenyusun = cfg.timPenyusunPool[index % cfg.timPenyusunPool.length]
  const peraturanId = cfg.peraturanIds[index % cfg.peraturanIds.length]
  const opdId = cfg.opdIds[index % cfg.opdIds.length]
  const day = ((index % 28) + 1).toString().padStart(2, '0')
  return {
    id,
    opdId,
    nomorSOP: `SOP/DUMMY/PLY/2026/${pad}`,
    judul: `SOP Dummy ${pad} — Proses Layanan Internal`,
    deskripsi: 'SOP dummy untuk pengujian skala daftar SOP (UI dan performa).',
    waktuPenugasan: `2026-01-${day}`,
    terakhirDiperbarui: `2026-02-${day}`,
    timPenyusun,
    unitTerkait: 'Unit Kerja Dummy',
    peraturan: cfg.peraturanNama[peraturanId],
    peraturanId,
    status,
    versi: `1.${index % 5}`,
    kategori,
    author: authorPool[index % authorPool.length],
  }
})

/** Daftar SOP lengkap (base dari API + dummy untuk skala). Relasi: opdId ke opd.json. */
export const SEED_SOP_DAFTAR: SOPDaftarItem[] = [...data.sopDaftar, ...dummySopDaftar]

/** Daftar peraturan untuk filter. Relasi: id dipakai di sopDaftar.peraturanId. */
export const SEED_PERATURAN_DAFTAR: { id: string; nama: string }[] = data.peraturanDaftar

/** SOP Saya (proyek tim penyusun). */
export const SEED_SOP_SAYA: SOPSayaItem[] = data.sopSaya

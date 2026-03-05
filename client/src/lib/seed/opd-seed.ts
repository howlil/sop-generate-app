/**
 * Seed data OPD dan Kepala OPD.
 */
import type { OPD, KepalaOPD } from '@/lib/types/opd'

export const SEED_OPD_LIST: OPD[] = [
  { id: '1', name: 'Dinas Pendidikan', email: 'disdik@pemda.go.id', phone: '0812-3456-7890', totalSOP: 245, sopBerlaku: 220, sopDraft: 12, createdAt: '2024-01-15' },
  { id: '2', name: 'Dinas Kesehatan', email: 'dinkes@pemda.go.id', phone: '0812-9876-5432', totalSOP: 189, sopBerlaku: 170, sopDraft: 8, createdAt: '2024-01-15' },
  { id: '3', name: 'Dinas Perhubungan', email: 'dishub@pemda.go.id', phone: '0812-5555-6666', totalSOP: 156, sopBerlaku: 128, sopDraft: 15, createdAt: '2024-01-20' },
  { id: '4', name: 'Dinas Pekerjaan Umum', email: 'dispu@pemda.go.id', phone: '0813-7777-8888', totalSOP: 178, sopBerlaku: 158, sopDraft: 10, createdAt: '2024-01-18' },
  { id: '5', name: 'BAPPEDA', email: 'bappeda@pemda.go.id', phone: '0814-2222-3333', totalSOP: 98, sopBerlaku: 88, sopDraft: 5, createdAt: '2024-01-12' },
  { id: '6', name: 'Dinas Sosial', email: 'dinsos@pemda.go.id', phone: '0815-4444-5555', totalSOP: 134, sopBerlaku: 115, sopDraft: 9, createdAt: '2024-02-01' },
]

export const SEED_KEPALA_LIST: KepalaOPD[] = [
  { id: 'k1', opdId: '1', name: 'Dr. Ahmad Pratama', nip: '196801151992031001', email: 'ahmad.pratama@pemda.go.id', phone: '0812-3456-7890', isActive: true, totalSOP: 245 },
  { id: 'k2', opdId: '2', name: 'Dr. Siti Nurhaliza', nip: '197503152000032001', email: 'siti.nurhaliza@pemda.go.id', phone: '0812-9876-5432', isActive: true, totalSOP: 189 },
  { id: 'k3', opdId: '3', name: 'Ir. Budi Santoso', nip: '198201102005011002', email: 'budi.santoso@pemda.go.id', phone: '0812-5555-6666', isActive: true, totalSOP: 156 },
  { id: 'k4', opdId: '4', name: 'Ir. Andi Wijaya, MT', nip: '198505252010012003', email: 'andi.wijaya@pemda.go.id', phone: '0813-7777-8888', isActive: true, totalSOP: 178 },
  { id: 'k5', opdId: '5', name: 'Drs. Hendra Kusuma, M.Si', nip: '197012081998031002', email: 'hendra.kusuma@pemda.go.id', phone: '0814-2222-3333', isActive: true, totalSOP: 98 },
  { id: 'k6', opdId: '6', name: 'Dra. Sri Wahyuni', nip: '198305152003122001', email: 'sri.wahyuni@pemda.go.id', phone: '0815-4444-5555', isActive: true, totalSOP: 134 },
]

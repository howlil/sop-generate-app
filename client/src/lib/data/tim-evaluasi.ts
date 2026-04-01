/**
 * Legacy Tim Evaluasi data - deprecated
 * Tim Evaluasi data is now handled by backend API
 * This file is for backward compatibility only
 */

export interface TimEvaluasi {
  id: string
  userId: string
  nama: string
  nip: string
  status: 'AKTIF' | 'NONAKTIF'
  createdAt: string
  updatedAt: string
}

/** Mock Tim Evaluasi data for development */
const MOCK_DATA: TimEvaluasi[] = []

/**
 * Get initial Tim Evaluasi list
 * @deprecated Use useTimEvaluasi hook instead
 */
export function getInitialTimEvaluasiList(): TimEvaluasi[] {
  return MOCK_DATA
}

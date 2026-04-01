/**
 * Status Badge configuration
 */

export interface StatusBadgeConfig {
  label: string
  color: string
  bgColor: string
}

const STATUS_CONFIG: Record<string, StatusBadgeConfig> = {
  // SOP Status
  'Draft': { label: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  'Sedang Disusun': { label: 'Sedang Disusun', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'Siap Dievaluasi': { label: 'Siap Dievaluasi', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'Sedang Dievaluasi': { label: 'Sedang Dievaluasi', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'Siap Diverifikasi': { label: 'Siap Diverifikasi', color: 'text-green-700', bgColor: 'bg-green-100' },
  'Berlaku': { label: 'Berlaku', color: 'text-green-700', bgColor: 'bg-green-100' },
  'Dicabut': { label: 'Dicabut', color: 'text-red-700', bgColor: 'bg-red-100' },
  'Revisi dari Tim Evaluasi': { label: 'Revisi', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  
  // Tim Status
  'AKTIF': { label: 'Aktif', color: 'text-green-700', bgColor: 'bg-green-100' },
  'NONAKTIF': { label: 'Nonaktif', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  
  // Default
  'default': { label: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' },
}

/**
 * Get status badge configuration
 */
export function getStatusBadgeConfig(status: string): StatusBadgeConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG['default']
}

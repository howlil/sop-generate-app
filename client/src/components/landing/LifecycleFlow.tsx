/**
 * SOP Lifecycle Flow - Visualisasi alur lifecycle SOP
 * 
 * Design: Horizontal flow dengan badges, compact spacing
 * Responsive: Horizontal desktop, vertical mobile
 */
import { CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const lifecycleSteps = [
  {
    status: 'DRAFT',
    label: 'Draft',
    description: 'Pembuatan SOP baru',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    status: 'SEDANG_DISUSUN',
    label: 'Sedang Disusun',
    description: 'Pengisian metadata & prosedur',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    status: 'SIAP_DIEVALUASI',
    label: 'Siap Dievaluasi',
    description: 'Menunggu pengajuan',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    status: 'DIAJUKAN_EVALUASI',
    label: 'Diajukan Evaluasi',
    description: 'Menunggu evaluasi',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    status: 'SEDANG_DIEVALUASI',
    label: 'Sedang Dievaluasi',
    description: 'Proses evaluasi Tim',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    status: 'REVISI_DARI_TIM_EVALUASI',
    label: 'Revisi',
    description: 'Perlu perbaikan',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    status: 'SIAP_DIVERIFIKASI',
    label: 'Siap Diverifikasi',
    description: 'Menunggu verifikasi',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    status: 'DIVERIFIKASI_BIRO_ORGANISASI',
    label: 'Diverifikasi Biro',
    description: 'BA diverifikasi',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    status: 'BERLAKU',
    label: 'Berlaku',
    description: 'SOP resmi berlaku',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
]

export function LifecycleFlow() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Desktop: Horizontal Flow */}
      <div className="hidden lg:flex items-center gap-2 overflow-x-auto">
        {lifecycleSteps.map((step, index) => (
          <div key={step.status} className="flex items-center gap-2 shrink-0">
            {/* Step Badge */}
            <div className="flex flex-col items-center">
              <Badge className={`h-6 px-2 text-xs border-0 ${step.color}`}>
                {step.icon && <step.icon className="w-3 h-3 mr-1" />}
                {step.label}
              </Badge>
              <span className="text-[10px] text-gray-500 mt-1 text-center max-w-[100px]">
                {step.description}
              </span>
            </div>

            {/* Arrow (except last) */}
            {index < lifecycleSteps.length - 1 && (
              <div className="w-6 h-px bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: Vertical List */}
      <div className="lg:hidden space-y-2">
        {lifecycleSteps.map((step) => (
          <div key={step.status} className="flex items-center gap-3">
            <Badge className={`h-6 px-2 text-xs border-0 ${step.color}`}>
              {step.icon && <step.icon className="w-3 h-3 mr-1" />}
              {step.label}
            </Badge>
            <span className="text-xs text-gray-500">
              {step.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

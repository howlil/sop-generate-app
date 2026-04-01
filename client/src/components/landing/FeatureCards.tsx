/**
 * Feature Cards - 4 kolom fitur utama sistem
 * 
 * Design: Compact cards (p-4), icon + text, hover:shadow-md
 * Grid: 4 columns desktop, 2 tablet, 1 mobile
 */
import { FileText, CheckCircle, PenLine, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Penyusunan Digital',
    description: 'Kelola SOP dari draft hingga pengesahan dalam satu platform terintegrasi',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: CheckCircle,
    title: 'Evaluasi Terstruktur',
    description: 'Proses evaluasi berjenjang dengan audit trail lengkap',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: PenLine,
    title: 'TTE Terintegrasi',
    description: 'Penandatanganan elektronik dengan PIN untuk Berita Acara dan SOP',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: BarChart3,
    title: 'Monitoring Real-time',
    description: 'Pantau progres penyusunan SOP antar OPD secara real-time',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
]

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
        >
          {/* Icon */}
          <div className={`w-10 h-10 ${feature.bgColor} rounded-md flex items-center justify-center mb-3`}>
            <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-gray-900 mb-1">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  )
}

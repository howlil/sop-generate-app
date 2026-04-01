/**
 * Services Section - Layanan Kami
 * 
 * Design: Grid 4 kolom dengan icon dan description
 */
import { FileText, CheckCircle, Signature, BarChart3, Users, Settings } from 'lucide-react'

const services = [
  {
    icon: FileText,
    title: 'Manajemen SOP',
    description: 'Pengelolaan siklus hidup dokumen SOP dari pembuatan, penyusunan, hingga pengesahan menjadi SOP berlaku.',
    color: 'blue',
  },
  {
    icon: CheckCircle,
    title: 'Evaluasi & Verifikasi',
    description: 'Penilaian kualitas dokumen SOP oleh tim evaluasi dan verifikasi oleh Biro Organisasi.',
    color: 'green',
  },
  {
    icon: Signature,
    title: 'Tanda Tangan Elektronik',
    description: 'Layanan TTE dengan PIN untuk Berita Acara evaluasi dan pengesahan SOP oleh Kepala OPD.',
    color: 'purple',
  },
  {
    icon: BarChart3,
    title: 'Monitoring & Reporting',
    description: 'Dashboard monitoring progres SOP dan grafik evaluasi tahunan per OPD secara real-time.',
    color: 'orange',
  },
  {
    icon: Users,
    title: 'Manajemen Tim',
    description: 'Pengelolaan data Tim Penyusun dan Tim Evaluasi SOP untuk setiap OPD.',
    color: 'blue',
  },
  {
    icon: Settings,
    title: 'Manajemen Data Master',
    description: 'Pengelolaan data OPD, Peraturan, dan konfigurasi sistem secara terpusat.',
    color: 'gray',
  },
]

function getColorClasses(color: string) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    gray: 'bg-gray-50 text-gray-600',
  }
  return colors[color] || colors.blue
}

export function ServicesSection() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Layanan Kami
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Solusi lengkap untuk pengelolaan SOP di lingkungan Organisasi Perangkat Daerah
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const colorClass = getColorClasses(service.color)
            
            return (
              <div
                key={service.title}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all cursor-default"
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${colorClass} rounded-md flex items-center justify-center mb-4`}>
                  <service.icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

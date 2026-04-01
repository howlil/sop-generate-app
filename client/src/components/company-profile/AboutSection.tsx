/**
 * About Section - Tentang Biro Organisasi
 * 
 * Design: 2-column layout dengan description dan stats cards
 */
import { CheckCircle, Users, FileText, Award } from 'lucide-react'

const keyPoints = [
  'Mengelola SOP antar Organisasi Perangkat Daerah (OPD)',
  'Melakukan evaluasi dan verifikasi dokumen SOP',
  'Menyediakan platform digitalisasi SOP terintegrasi',
  'Memastikan standar pelayanan publik yang konsisten',
]

const stats = [
  {
    icon: Users,
    value: '50+',
    label: 'OPD Terdaftar',
  },
  {
    icon: FileText,
    value: '500+',
    label: 'SOP Aktif',
  },
  {
    icon: Award,
    value: '100%',
    label: 'Digitalisasi',
  },
]

export function AboutSection() {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tentang Biro Organisasi
            </h2>
            
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              Biro Organisasi merupakan unit kerja yang bertanggung jawab dalam mengelola 
              dan mengkoordinasikan penyusunan Standard Operating Procedure (SOP) di 
              lingkungan Organisasi Perangkat Daerah (OPD). Kami berkomitmen untuk 
              meningkatkan kualitas pelayanan publik melalui standarisasi proses kerja 
              yang terstruktur dan terukur.
            </p>

            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              Dengan platform digitalisasi SOP, kami memfasilitasi seluruh tahapan 
              pengelolaan SOP mulai dari penyusunan, evaluasi, verifikasi, hingga 
              pengesahan dokumen SOP menjadi berlaku resmi.
            </p>

            {/* Key Points */}
            <ul className="space-y-2">
              {keyPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Stats */}
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Sistem Informasi SOP
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Platform digital terintegrasi untuk mengelola siklus hidup SOP 
                dengan fitur evaluasi, verifikasi, dan tanda tangan elektronik.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

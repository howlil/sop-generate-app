/**
 * Vision & Mission Section - Visi dan Misi Biro Organisasi
 * 
 * Design: Cards dengan icons, clean layout
 */
import { Eye, Target, Users, FileCheck, Shield, TrendingUp } from 'lucide-react'

const missions = [
  {
    icon: Target,
    title: 'Misi 1',
    description: 'Menyusun dan mengembangkan SOP yang standar dan terukur untuk seluruh OPD',
  },
  {
    icon: Users,
    title: 'Misi 2',
    description: 'Melakukan evaluasi dan verifikasi berkala terhadap kualitas dokumen SOP',
  },
  {
    icon: FileCheck,
    title: 'Misi 3',
    description: 'Meningkatkan kapasitas SDM dalam penyusunan dan implementasi SOP',
  },
  {
    icon: Shield,
    title: 'Misi 4',
    description: 'Menjamin konsistensi pelayanan publik melalui standarisasi proses kerja',
  },
  {
    icon: TrendingUp,
    title: 'Misi 5',
    description: 'Mendorong transformasi digital dalam pengelolaan SOP di lingkungan pemerintah',
  },
]

export function VisionMission() {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Visi & Misi
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Komitmen kami dalam meningkatkan kualitas pelayanan publik melalui standarisasi SOP
          </p>
        </div>

        {/* Vision Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-md flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-base font-semibold text-white mb-3">Visi</h3>
          <p className="text-sm text-blue-50 max-w-3xl mx-auto leading-relaxed">
            Menjadi pusat keunggulan dalam pengelolaan Standard Operating Procedure yang 
            mendukung terwujudnya pelayanan publik yang profesional, transparan, dan akuntabel
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <div
              key={mission.title}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mb-3">
                <mission.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 mb-2">
                {mission.title}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {mission.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

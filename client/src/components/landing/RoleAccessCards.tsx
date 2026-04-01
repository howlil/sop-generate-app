/**
 * Role-Based Access Cards - Akses berdasarkan peran pengguna
 * 
 * Design: 2-column grid, compact cards dengan badge peran, CTA buttons
 * Grid: 2 columns desktop, 1 column mobile
 */
import { Users, ClipboardList, Building2, Signature } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from '@tanstack/react-router'

const roles = [
  {
    icon: Users,
    title: 'Tim Penyusun SOP',
    badge: 'OPD',
    badgeColor: 'bg-blue-100 text-blue-700',
    features: [
      'Buat dan kelola SOP',
      'Ajukan evaluasi',
      'TTD Berita Acara (Koordinator)',
    ],
    ctaLabel: 'Masuk sebagai Tim Penyusun',
    ctaLink: '/auth/login?role=tim-penyusun',
  },
  {
    icon: ClipboardList,
    title: 'Tim Evaluasi',
    badge: 'Biro Organisasi',
    badgeColor: 'bg-purple-100 text-purple-700',
    features: [
      'Evaluasi SOP',
      'Isi hasil evaluasi',
      'Kirim ke Biro',
    ],
    ctaLabel: 'Masuk sebagai Tim Evaluasi',
    ctaLink: '/auth/login?role=tim-evaluasi',
  },
  {
    icon: Building2,
    title: 'Kepala OPD',
    badge: 'Pimpinan OPD',
    badgeColor: 'bg-green-100 text-green-700',
    features: [
      'Pantau SOP OPD',
      'Sahkan SOP',
      'TTD Elektronik',
    ],
    ctaLabel: 'Masuk sebagai Kepala OPD',
    ctaLink: '/auth/login?role=kepala-opd',
  },
  {
    icon: Signature,
    title: 'Biro Organisasi',
    badge: 'Administrator',
    badgeColor: 'bg-orange-100 text-orange-700',
    features: [
      'Kelola OPD & Tim',
      'Buat pengajuan evaluasi',
      'Verifikasi BA',
    ],
    ctaLabel: 'Masuk sebagai Biro',
    ctaLink: '/auth/login?role=biro-organisasi',
  },
]

export function RoleAccessCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <div
          key={role.title}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
        >
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center">
                <role.icon className="w-4 h-4 text-gray-600" />
              </div>
              <Badge className={`h-4 px-1.5 text-xs border-0 ${role.badgeColor}`}>
                {role.badge}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-gray-900 mb-3">
            {role.title}
          </h3>

          {/* Features List */}
          <ul className="space-y-1.5 mb-4">
            {role.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                <span className="text-xs text-gray-600">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 border-gray-200 hover:bg-gray-50 text-xs"
            onClick={() => navigate({ to: role.ctaLink as any })}
          >
            {role.ctaLabel}
          </Button>
        </div>
      ))}
    </div>
  )
}

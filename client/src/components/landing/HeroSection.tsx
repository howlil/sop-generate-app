/**
 * Hero Section - Header dengan branding dan value proposition
 * 
 * Design: Fixed header (h-14), compact spacing, formal government style
 */
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/utils/constants'
import { useNavigate } from '@tanstack/react-router'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <header className="h-14 bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-9 h-9 flex items-center justify-center bg-blue-50 rounded-md">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          
          {/* Title & Subtitle */}
          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Sistem Informasi SOP Biro Organisasi
            </h1>
            <p className="text-xs text-gray-500">
              Platform Digitalisasi Standard Operating Procedure
            </p>
          </div>
        </div>

        {/* Login Button */}
        <Button
          variant="default"
          size="sm"
          className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-xs"
          onClick={() => navigate({ to: '/auth/login' })}
        >
          Masuk
        </Button>
      </div>
    </header>
  )
}

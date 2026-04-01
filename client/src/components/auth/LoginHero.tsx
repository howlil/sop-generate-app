/**
 * Login Hero - Left panel mengikuti design style guide
 * 
 * Design: Clean, compact, professional - sesuai design.md
 * Tanpa gradient orbs berlebihan atau floating particles
 */
import { FileText, Shield, Check } from 'lucide-react'

export function LoginHero() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-6 bg-white border-r border-gray-200">
      
      {/* Top Section - Logo & Title */}
      <div className="space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-md flex items-center justify-center border border-blue-200">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">Biro Organisasi</p>
            <p className="text-xs text-gray-500">Pemerintah Daerah</p>
          </div>
        </div>

        {/* Main Title */}
        <div className="pt-8">
          <h1 className="text-sm font-semibold text-gray-900 mb-2">
            Sistem Informasi SOP
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
            Platform digital untuk mengelola Standard Operating Procedure 
            dengan proses terstruktur, transparan, dan teraudit.
          </p>
        </div>
      </div>

      {/* Bottom Section - Features */}
      <div className="space-y-3">
        {/* Feature List */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-600">Kelola SOP dari draft hingga pengesahan</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-600">Evaluasi dan verifikasi berjenjang</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-600">Tanda tangan elektronik terintegrasi</span>
          </div>
          <div className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-600">Monitoring progres real-time</span>
          </div>
        </div>

        {/* System Status */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Sistem Terverifikasi</span>
          </div>
        </div>
      </div>
    </div>
  )
}

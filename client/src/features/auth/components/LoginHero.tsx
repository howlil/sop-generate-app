/**
 * Login Hero - Government Standard Design
 *
 * Design: Formal, authoritative, professional
 * - Government branding with official colors
 * - Clear value proposition
 * - Trust indicators
 */
import { Shield, FileText, CheckCircle, Users, TrendingUp } from 'lucide-react'

export function LoginHero() {
  return (
    <div className="flex flex-col justify-center h-full text-white">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sistem Informasi SOP</p>
            <p className="text-xs text-blue-200">Biro Organisasi - Pemerintah Daerah</p>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-2">
          Standard Operating Procedure Digital
        </h1>
        <p className="text-sm text-blue-100 leading-relaxed max-w-md">
          Platform resmi untuk pengelolaan SOP secara digital dengan proses terstruktur, transparan, dan teraudit sesuai standar pemerintahan.
        </p>
      </div>

      {/* Features Section */}
      <div className="space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white">Pengelolaan Terstruktur</p>
              <p className="text-xs text-blue-200 mt-0.5">Draft hingga pengesahan</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white">Verifikasi Berjenjang</p>
              <p className="text-xs text-blue-200 mt-0.5">Evaluasi multi-level</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <Users className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white">Kolaborasi Tim</p>
              <p className="text-xs text-blue-200 mt-0.5">Multi-role access</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <TrendingUp className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-white">Monitoring Real-time</p>
              <p className="text-xs text-blue-200 mt-0.5">Dashboard interaktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center gap-4 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Terverifikasi</span>
          </div>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Aman & Terenkripsi</span>
          </div>
        </div>
      </div>
    </div>
  )
}

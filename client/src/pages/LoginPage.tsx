/**
 * Login Page - Government Standard Design
 *
 * Design Principles:
 * - Formal, authoritative government aesthetic
 * - Clean split-screen layout
 * - Official branding with Garuda/state colors
 * - Professional typography and spacing
 * - Accessible and keyboard navigable
 */
import { LoginHero } from '@/features/auth'
import { LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar - Government Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">SOP</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">Sistem Informasi Standard Operating Procedure</p>
              <p className="text-xs text-slate-500">Biro Organisasi - Pemerintah Daerah</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex">
        {/* Left Panel - Hero & Information */}
        <div className="hidden lg:flex lg:w-3/5 xl:w-2/3 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 relative overflow-hidden">
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)' }} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-between p-8 xl:p-12 w-full">
            <LoginHero />
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-2/5 xl:w-1/3 flex items-center justify-center bg-white border-l border-slate-200">
          <div className="w-full max-w-md p-6 xl:p-8">
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Footer - Government Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Sistem Beroperasi Normal</span>
          </div>
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} Biro Organisasi</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">v1.2.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

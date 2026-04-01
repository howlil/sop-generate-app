/**
 * Login Form - Right panel mengikuti design style guide
 * 
 * Design: Compact, clean form sesuai design.md
 * - h-9 inputs
 * - h-8 buttons
 * - text-xs typography
 * - border-gray-200 borders
 * - Minimal, purposeful interactions
 */
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

export function LoginForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Email dan password wajib diisi')
      setIsLoading(false)
      return
    }

    // TODO: Implement actual login
    setTimeout(() => {
      setIsLoading(false)
      navigate({ to: '/dashboard' })
    }, 1500)
  }

  return (
    <div className="flex flex-col justify-center p-6 bg-white">
      <div className="w-full max-w-sm mx-auto space-y-5">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-sm font-semibold text-gray-900">
            Masuk ke Akun
          </h1>
          <p className="text-xs text-gray-500">
            Gunakan kredensial yang telah terdaftar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@instansi.go.id"
                className="w-full h-9 pl-9 pr-3 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-medium text-gray-700">
                Password
              </label>
              <a href="#lupa-password" className="text-xs text-blue-600 hover:underline">
                Lupa Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 pl-9 pr-9 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full h-8 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Masuk ke Sistem
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>

        </form>

        {/* Help Text */}
        <div className="space-y-3 pt-2">
          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700 leading-relaxed">
              Belum punya akun? Hubungi admin Biro Organisasi untuk pembuatan akun baru.
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-gray-400 text-xs">atau</span>
            </div>
          </div>

          {/* Back to Home */}
          <a
            href="/"
            className="flex items-center justify-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>←</span>
            <span>Kembali ke Beranda</span>
          </a>

          {/* System Status */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-1 h-1 bg-green-500 rounded-full" />
            <span>Sistem Online</span>
            <span className="mx-0.5">•</span>
            <span>v1.2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

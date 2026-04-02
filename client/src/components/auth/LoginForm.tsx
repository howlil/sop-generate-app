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
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/stores/uiStore'

interface LocationState {
  redirect?: string
}

export function LoginForm() {
  const navigate = useNavigate()
  const { redirect = '/' } = useSearch({ strict: false }) as LocationState
  const { login, isLoggingIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateForm = () => {
    setEmailError('')
    setPasswordError('')

    if (!email) {
      setEmailError('Email wajib diisi')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Format email tidak valid')
      return false
    }

    if (!password) {
      setPasswordError('Password wajib diisi')
      return false
    }

    if (password.length < 6) {
      setPasswordError('Password minimal 6 karakter')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await login({ email, password })
      // Redirect setelah login berhasil
      // useAuth hook sudah handle toast success
      navigate({ to: redirect || '/dashboard' })
    } catch (error) {
      // Error sudah di-handle di useAuth hook dengan toast
      // Tambahkan error spesifik per field jika ada
      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        if (message.includes('email')) {
          setEmailError(error.message)
        } else if (message.includes('password') || message.includes('kata sandi')) {
          setPasswordError(error.message)
        }
      }
    }
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
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@instansi.go.id"
                className="w-full h-11 pl-9 pr-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={isLoggingIn}
                autoComplete="email"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
            </div>
            {emailError && (
              <p id="email-error" className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-600 rounded-full" aria-hidden />
                {emailError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <a href="#lupa-password" className="text-sm text-blue-600 hover:underline">
                Lupa Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-9 pr-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
                disabled={isLoggingIn}
                autoComplete="current-password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                disabled={isLoggingIn}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordError && (
              <p id="password-error" className="text-sm text-red-600 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-red-600 rounded-full" aria-hidden />
                {passwordError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="default"
            className="w-full h-11 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Masuk ke Sistem
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

        </form>

        {/* Help Text */}
        <div className="space-y-3 pt-2">
          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700 leading-relaxed">
              Belum punya akun? Hubungi admin Biro Organisasi untuk pembuatan akun baru.
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-gray-400 text-sm">atau</span>
            </div>
          </div>

          {/* Back to Home */}
          <a
            href="/"
            className="flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span>←</span>
            <span>Kembali ke Beranda</span>
          </a>

          {/* System Status */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            <span>Sistem Online</span>
            <span className="mx-0.5">•</span>
            <span>v1.2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

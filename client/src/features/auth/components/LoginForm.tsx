/**
 * Login Form - Modern Clean Design
 *
 * Design: Clean, minimalist, futuristic
 * - Simple, focused layout
 * - Clear visual hierarchy
 * - Professional aesthetic
 */
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '@/features/auth'

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
      await login({ email, kataSandi: password })
      navigate({ to: redirect || '/' })
    } catch (error) {
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
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          Selamat Datang
        </h1>
        <p className="text-sm text-slate-500">
          Masuk ke Sistem Informasi SOP
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@instansi.go.id"
              className="w-full h-11 pl-10 pr-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
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
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full h-11 pl-10 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
              disabled={isLoggingIn}
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              disabled={isLoggingIn}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
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
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-lg"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Memproses...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Masuk
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {/* Help Section */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Belum memiliki akun?</span>{' '}
            <span className="text-blue-700">Hubungi admin Biro Organisasi</span>
          </p>
        </div>
      </div>
    </div>
  )
}

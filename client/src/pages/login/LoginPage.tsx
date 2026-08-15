import { useAuth } from '@/api/auth'
import { LoginForm } from '@/pages/login/components/LoginForm'
import { LoginHero } from '@/pages/login/components/LoginHero'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

export function LoginPage() {
  const { login, isLoggingIn } = useAuth()

  return (
    <div className="min-h-screen bg-[#f7f9fc] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <div className="hidden min-h-screen lg:block">
        <LoginHero />
      </div>

      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-control border border-border bg-surface">
              <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-9 w-9" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Biro Organisasi · Pemerintah Provinsi Sumatera Barat</p>
            </div>
          </div>

          <div className="border border-border bg-surface p-6 shadow-sm sm:p-8">
            <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
          </div>
        </div>
      </div>
    </div>
  )
}

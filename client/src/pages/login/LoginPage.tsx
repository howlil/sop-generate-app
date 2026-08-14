import { useAuth } from '@/api/auth'
import { LoginForm } from '@/pages/login/components/LoginForm'
import { LoginHero } from '@/pages/login/components/LoginHero'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

export function LoginPage() {
  const { login, isLoggingIn } = useAuth()

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[3fr_2fr]">
      <div className="hidden min-h-screen lg:block">
        <LoginHero />
      </div>

      <div className="flex min-h-screen items-center justify-center bg-surface px-5 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-10 w-10" />
            <div>
              <p className="text-sm font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Biro Organisasi · Pemerintah Provinsi Sumatera Barat</p>
            </div>
          </div>
          <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
        </div>
      </div>
    </div>
  )
}

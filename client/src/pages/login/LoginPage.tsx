import { useAuth } from '@/api/auth'
import { LoginForm } from '@/pages/login/components/LoginForm'
import { LoginHero } from '@/pages/login/components/LoginHero'
import logoSvg from '@/assets/logo.svg'
import { APP_DISPLAY_NAME } from '@/config/env'

export function LoginPage() {
  const { login, isLoggingIn } = useAuth()

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-10">
        <header className="mb-8 flex items-center justify-between gap-4 lg:mb-10">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-control border border-border bg-surface">
              <img src={logoSvg} alt={APP_DISPLAY_NAME} className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{APP_DISPLAY_NAME}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                Biro Organisasi · Pemerintah Provinsi Sumatera Barat
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(360px,5fr)] lg:items-stretch lg:gap-8">
          <LoginHero />

          <section className="flex items-center">
            <div className="w-full border border-border bg-surface p-6 shadow-sm sm:p-8 lg:p-9">
              <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

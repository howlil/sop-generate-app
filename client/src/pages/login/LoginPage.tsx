import { useAuth } from '@/api/auth'
import { LoginForm } from '@/pages/login/components/LoginForm'
import { LoginHero } from '@/pages/login/components/LoginHero'

export function LoginPage() {
  const { login, isLoggingIn } = useAuth()

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-foreground sm:px-6 lg:grid lg:place-items-center lg:py-10">
      <main className="mx-auto grid w-full max-w-[1120px] overflow-hidden rounded-[22px] border border-border bg-surface shadow-raised lg:min-h-[620px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <LoginHero />

        <section className="flex items-center bg-surface px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <LoginForm isSubmitting={isLoggingIn} onSubmitLogin={login} />
        </section>
      </main>
    </div>
  )
}

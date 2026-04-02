/**
 * Login Page - Enhanced design dengan split-screen layout
 * 
 * Layout:
 * - Left (60%): Hero content dengan animated gradient
 * - Right (40%): Login form dengan modern card design
 */
import { LoginHero } from '@/features/auth'
import { LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Hero Content */}
      <div className="hidden lg:block lg:w-3/5 xl:w-1/2">
        <LoginHero />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-2/5 xl:w-1/2 flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  )
}

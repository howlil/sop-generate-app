import { Link } from '@tanstack/react-router'
import { ROUTES } from '@/utils/constants'

export function AppLogo() {
  return (
    <Link
      to={ROUTES.HOME}
      search={{ denied: undefined, redirect: undefined }}
      className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all flex-shrink-0"
      aria-label="Biro Organisasi - Beranda"
    >
      BO
    </Link>
  )
}

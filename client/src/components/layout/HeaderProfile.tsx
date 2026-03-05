import { useNavigate } from '@tanstack/react-router'
import { CircleUserRound, LogOut } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { usePageHeaderContext } from '@/components/layout/PageHeaderContext'
import { getRole, getRoleLabel, getRoleNip, getRoleDisplayName, clearRole, type Role } from '@/lib/stores'

interface HeaderProfileProps {
  /** Judul header fallback (jika tidak ada page header dari konteks) */
  title?: string
  /** Subtitle di kanan (contoh: "OPD") */
  subtitle?: string
}

export function HeaderProfile({ title: _title, subtitle: _subtitle }: HeaderProfileProps) {
  const navigate = useNavigate()
  const role = getRole()
  const pageHeader = usePageHeaderContext()
  const headerContent = pageHeader?.headerContent

  const handleLogout = () => {
    clearRole()
    navigate({ to: ROUTES.HOME, search: { denied: '' } })
  }

  const roleLabel = role ? getRoleLabel(role as Role) : '-'
  const displayName = role ? getRoleDisplayName(role as Role) : 'Pengguna'
  const nip = role ? getRoleNip(role as Role) : null

  return (
    <header className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0 gap-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {headerContent ? (
          <>
            {headerContent.leading && <div className="flex-shrink-0">{headerContent.leading}</div>}
            {headerContent.breadcrumb.length > 0 && (
              <Breadcrumb items={headerContent.breadcrumb} className="min-w-0" />
            )}
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {headerContent?.actions}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-0 bg-gray-100 hover:bg-gray-200 text-blue-600 transition-colors"
              aria-label="Profil"
            >
              <CircleUserRound className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
                {nip && nip !== '-' && (
                  <p className="text-xs text-gray-500">NIP. {nip}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

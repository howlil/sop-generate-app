import { useMemo } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, CircleUserRound, LogOut } from 'lucide-react'
import { ROUTES } from '@/utils/constants/routes'
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
import { useAppRole } from '@/hooks/useAppRole'

interface HeaderProfileProps {
  /** Judul header fallback (jika tidak ada page header dari konteks) */
  title?: string
  /** Subtitle di kanan (contoh: "OPD") */
  subtitle?: string
}

export function HeaderProfile({ title: _title, subtitle: _subtitle }: HeaderProfileProps) {
  const navigate = useNavigate()
  const { role, getRoleLabel, getRoleNip, getRoleDisplayName, clearRole } = useAppRole()
  const pageHeader = usePageHeaderContext()
  const headerContent = pageHeader?.headerContent

  const notifications = usePipelineNotificationStore((s) => s.items)
  const markRead = usePipelineNotificationStore((s) => s.markRead)
  const markAllRead = usePipelineNotificationStore((s) => s.markAllRead)

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) => !n.targetRole || (role !== null && n.targetRole === role)),
    [notifications, role]
  )
  const unreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.read).length,
    [visibleNotifications]
  )

  const handleLogout = () => {
    clearRole()
    navigate({ to: ROUTES.HOME, search: { denied: undefined, redirect: undefined } })
  }

  const roleLabel = role ? getRoleLabel(role) : '-'
  const displayName = role ? getRoleDisplayName(role) : 'Pengguna'
  const nip = role ? getRoleNip(role) : null

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
        {role && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                aria-label="Notifikasi alur kerja"
              >
                <Bell className="w-4 h-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-semibold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[min(70vh,420px)] overflow-y-auto">
              <DropdownMenuLabel className="flex items-center justify-between gap-2">
                <span>Notifikasi</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="text-xs font-normal text-blue-600 hover:underline"
                    onClick={() => markAllRead()}
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleNotifications.length === 0 ? (
                <p className="px-2 py-4 text-xs text-gray-500 text-center">Belum ada notifikasi.</p>
              ) : (
                visibleNotifications.slice(0, 20).map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-0.5 cursor-default focus:bg-gray-50"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex w-full justify-between gap-2">
                      <span className={`text-xs font-medium ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <button
                          type="button"
                          className="text-[10px] text-blue-600 shrink-0 hover:underline"
                          onClick={() => markRead(n.id)}
                        >
                          dibaca
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 leading-snug">{n.body}</span>
                    {n.actionTo && (
                      <Link
                        to={n.actionTo}
                        search={n.actionSearch}
                        className="text-[11px] font-medium text-blue-600 hover:underline pt-0.5"
                        onClick={() => markRead(n.id)}
                      >
                        Buka halaman terkait →
                      </Link>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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

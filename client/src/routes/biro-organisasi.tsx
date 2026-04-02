import { createFileRoute } from '@tanstack/react-router'
import { ROLES } from '@/utils/constants'
import { RoleLayout } from '@/components/layout/RoleLayout'
import { requireRoleBeforeLoad } from '@/utils/role'
import { RouteLoadingSkeleton } from '@/components/layout/RouteLoadingSkeleton'
import { sidebarConfig, sidebarActiveConfig } from '@/config/sidebar.config'

export const Route = createFileRoute('/biro-organisasi')({
  beforeLoad: requireRoleBeforeLoad(ROLES.BIRO_ORGANISASI),
  pendingComponent: RouteLoadingSkeleton,
  component: BiroOrganisasiLayout,
})

function BiroOrganisasiLayout() {
  return (
    <RoleLayout
      sidebarItems={sidebarConfig[ROLES.BIRO_ORGANISASI]}
      isActive={sidebarActiveConfig[ROLES.BIRO_ORGANISASI]}
      subtitle="Biro Organisasi"
    />
  )
}

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { SetPageHeader } from '@/components/layout/PageHeaderProvider'
import type { TTERole } from "@/types/dto/tte.dto";
import {
  useRegisterTTE,
  useTTEProfil,
} from '@/api/tte'
import { formatDateIdLong } from '@/utils/format-date'
import { TTEBuatDialog } from './components/TTEBuatDialog'
import { useAppRole } from '@/hooks/useAppRole'

const ROLE_LABEL: Record<TTERole, string> = {
  'kepala-opd': 'Kepala OPD',
  'pj-evaluator': 'PJ Evaluator',
  'pj-penyusun': 'PJ Penyusun',
}

export interface TTDElektronikPageProps {
  role: TTERole
}

export function TTDElektronikPage({
  role,
}: TTDElektronikPageProps) {
  const { user, getRoleNip, getRoleDisplayName } = useAppRole()
  const { data: profile, isLoading } = useTTEProfil()
  const registerTTE = useRegisterTTE()
  const [dialogOpen, setDialogOpen] = useState(false)

  const statusLabel = !profile ? 'Belum dibuat' : 'Aktif'
  const statusVariant = !profile ? 'secondary' : 'default'

  return (
    <div className="space-y-4">
      <SetPageHeader
        breadcrumb={[{ label: ROLE_LABEL[role] }, { label: 'TTD Elektronik' }]}
        title="TTD Elektronik (simulasi BSRE)"
        description="Kelola PIN penandatanganan untuk mengesahkan SOP atau Berita Acara. Identitas dari akun login; tanpa integrasi BSSN."
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Riwayat Tanda Tangan</h2>
          <Button size="sm" className="h-8 text-xs" onClick={() => setDialogOpen(true)}>
            Buat TTD
          </Button>
        </div>
        <Table.Root>
          <Table.Table className="text-left">
            <thead>
              <Table.HeadRow>
                <Table.Th className="px-4 py-2">Jabatan</Table.Th>
                <Table.Th className="px-4 py-2">Status</Table.Th>
                <Table.Th className="px-4 py-2">Tanggal dibuat</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              <Table.BodyRow>
                <Table.Td className="px-4 py-3 font-medium text-gray-900">
                  {ROLE_LABEL[role]}
                </Table.Td>
                <Table.Td className="px-4 py-3">
                  <Badge variant={statusVariant} className="text-xs">
                    {statusLabel}
                  </Badge>
                </Table.Td>
                <Table.Td className="px-4 py-3 text-gray-600">
                  {isLoading ? 'Memuat...' : (profile?.createdAt
                    ? formatDateIdLong(profile.createdAt)
                    : '—')}
                </Table.Td>
              </Table.BodyRow>
            </tbody>
          </Table.Table>
        </Table.Root>
      </div>

      <TTEBuatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        namaRingkas={profile?.user?.nama ?? getRoleDisplayName() ?? user?.nama ?? ''}
        nipRingkas={profile?.user?.nip ?? getRoleNip() ?? user?.nip ?? ''}
        profile={profile ?? undefined}
        onRegisterTTE={(payload) => registerTTE.mutateAsync(payload)}
      />
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Table } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/PageHeader'
import type { TTERole } from '@/lib/types/tte'
import { getTTEProfile } from '@/lib/tte'
import { formatDateIdLong } from '@/utils/format-date'
import { TTEBuatDialog } from './TTEBuatDialog'

const ROLE_LABEL: Record<TTERole, string> = {
  'kepala-opd': 'Kepala OPD',
  'biro-organisasi': 'Biro Organisasi',
}

export interface TTDElektronikPageProps {
  role: TTERole
  defaultNip: string
  defaultNama: string
}

export function TTDElektronikPage({
  role,
  defaultNip,
  defaultNama,
}: TTDElektronikPageProps) {
  const profile = useMemo(() => getTTEProfile(role), [role])
  const [dialogOpen, setDialogOpen] = useState(false)

  const statusLabel = !profile
    ? 'Belum dibuat'
    : profile.emailVerified
      ? 'Aktif'
      : 'Menunggu verifikasi email'
  const statusVariant = !profile
    ? 'secondary'
    : profile.emailVerified
      ? 'default'
      : 'outline'

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumb={[{ label: ROLE_LABEL[role] }, { label: 'TTD Elektronik' }]}
        title="Buat TTD Elektronik (TTE BSRE)"
        description="Kelola tanda tangan elektronik untuk mengesahkan SOP atau memverifikasi evaluasi."
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
                  {profile?.createdAt
                    ? formatDateIdLong(profile.createdAt)
                    : '—'}
                </Table.Td>
              </Table.BodyRow>
            </tbody>
          </Table.Table>
        </Table.Root>
      </div>

      <TTEBuatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={role}
        defaultNip={defaultNip}
        defaultNama={defaultNama}
      />
    </div>
  )
}

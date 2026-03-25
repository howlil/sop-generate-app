/**
 * Dashboard Kepala OPD: ringkasan SOP yang menunggu pengesahan & akses cepat.
 */
import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, FileCheck, ArrowRight, FileText } from 'lucide-react'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import { getKepalaOPDOpdId } from '@/lib/data/role-display'
import { useOpdList } from '@/lib/data/opd'
import { useSopStatus } from '@/hooks/useSopStatus'
import { useSopStatusStore } from '@/lib/stores/sop-status-store'
import { useVerifikasiBatchList } from '@/hooks/useVerifikasiBatch'
import { canKepalaOpdSignSop } from '@/lib/domain/sop-status'
import type { StatusSOP } from '@/lib/types/sop'

export function KepalaOpdDashboard() {
  const { mergeSopStatus, getSopStatusOverride } = useSopStatus()
  const overrides = useSopStatusStore((s) => s.overrides)
  const [base] = useState(() => getInitialSopDaftarList())
  const merged = useMemo(() => mergeSopStatus(base), [mergeSopStatus, overrides, base])
  const opdId = getKepalaOPDOpdId()
  const opds = useOpdList()
  const opdName = opds.find((o) => o.id === opdId)?.name ?? ''
  const { list: batchList } = useVerifikasiBatchList()

  const rows = useMemo(() => merged.filter((s) => s.opdId === opdId), [merged, opdId])

  const waitingSign = useMemo(() => {
    return rows.filter((s) => {
      const st = (getSopStatusOverride(s.id) ?? s.status) as StatusSOP
      return canKepalaOpdSignSop(st, batchList, opdName, s.id, s.nomorSOP)
    })
  }, [rows, batchList, opdName, getSopStatusOverride])

  const baReady = useMemo(
    () =>
      batchList.filter(
        (b) =>
          b.opd === opdName && b.isVerified === true && b.isSignedByKoordinator === true
      ).length,
    [batchList, opdName]
  )

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Dashboard' }]}
      title="Dashboard OPD"
      description="Ringkasan dokumen yang memerlukan perhatian Anda. Pengesahan SOP dilakukan dengan TTE setelah verifikasi BA selesai."
      toolbar={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Link to={ROUTES.KEPALA_OPD.PANTAU_SOP}>
              <FileText className="w-3.5 h-3.5" />
              Pantau SOP
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <Link to={ROUTES.KEPALA_OPD.BERITA_ACARA}>
              <FileCheck className="w-3.5 h-3.5" />
              Berita Acara & pengesahan
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 mb-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Menunggu pengesahan</span>
          </div>
          <p className="text-3xl font-semibold text-amber-950 tabular-nums">{waitingSign.length}</p>
          <p className="text-xs text-amber-900/80 mt-1">SOP siap ditandatangani (status & BA memenuhi syarat)</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <FileCheck className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">BA siap pengesahan</span>
          </div>
          <p className="text-3xl font-semibold text-gray-900 tabular-nums">{baReady}</p>
          <p className="text-xs text-gray-500 mt-1">Berita Acara dengan verifikasi Biro + Koordinator selesai</p>
        </div>
      </div>
    </ListPageLayout>
  )
}

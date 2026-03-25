/**
 * Ringkasan pipeline SOP untuk OPD Tim Penyusun (agregat status).
 */
import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, ArrowRight, FileText } from 'lucide-react'
import { ListPageLayout } from '@/components/layout/ListPageLayout'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { getInitialSopDaftarList } from '@/lib/data/sop-daftar'
import { getTimPenyusunOpdId } from '@/lib/data/role-display'
import { useSopStatus } from '@/hooks/useSopStatus'
import { useSopStatusStore } from '@/lib/stores/sop-status-store'
import { STATUS_SOP_ALL } from '@/lib/types/sop'

export function TimPenyusunDashboard() {
  const { mergeSopStatus } = useSopStatus()
  const overrides = useSopStatusStore((s) => s.overrides)
  const [base] = useState(() => getInitialSopDaftarList())
  const merged = useMemo(() => mergeSopStatus(base), [mergeSopStatus, overrides, base])
  const opdId = getTimPenyusunOpdId()
  const rows = useMemo(() => merged.filter((s) => s.opdId === opdId), [merged, opdId])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const st of STATUS_SOP_ALL) c[st] = 0
    for (const r of rows) {
      c[r.status] = (c[r.status] ?? 0) + 1
    }
    return c
  }, [rows])

  const pipeline = useMemo(
    () => [
      {
        label: 'Penyusunan & revisi',
        count:
          (counts['Draft'] ?? 0) +
          (counts['Sedang Disusun'] ?? 0) +
          (counts['Revisi dari Tim Evaluasi'] ?? 0),
      },
      {
        label: 'Antrian evaluasi',
        count:
          (counts['Siap Dievaluasi'] ?? 0) +
          (counts['Diajukan Evaluasi'] ?? 0) +
          (counts['Sedang Dievaluasi'] ?? 0),
      },
      {
        label: 'Verifikasi & pengesahan',
        count:
          (counts['Siap Diverifikasi'] ?? 0) +
          (counts['Diverifikasi Biro Organisasi'] ?? 0) +
          (counts['Berlaku'] ?? 0),
      },
    ],
    [counts]
  )

  return (
    <ListPageLayout
      breadcrumb={[{ label: 'Dashboard' }]}
      title="Dashboard Tim Penyusun"
      description="Ringkasan jumlah SOP OPD Anda per tahap alur kerja. Detail per dokumen ada di Manajemen SOP."
      toolbar={
        <Button asChild size="sm" className="h-8 text-xs gap-1.5">
          <Link to={ROUTES.TIM_PENYUSUN.MANAJEMEN_SOP}>
            <FileText className="w-3.5 h-3.5" />
            Buka Manajemen SOP
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {pipeline.map((p) => (
          <div
            key={p.label}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">{p.label}</span>
            </div>
            <p className="text-3xl font-semibold text-gray-900 tabular-nums">{p.count}</p>
            <p className="text-xs text-gray-500 mt-1">SOP</p>
          </div>
        ))}
      </div>
    </ListPageLayout>
  )
}
